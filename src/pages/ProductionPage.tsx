import { useEffect, useMemo, useState, type FormEvent } from "react";
import { FormField } from "../components/FormField";
import { ImageInput } from "../components/ImageInput";
import { Modal } from "../components/Modal";
import { calculateFinishedUnitCost } from "../domain/calculations";
import { formatMaterialName } from "../domain/materialCatalog";
import { applyProduction, calculateRecipeMaterialCost, getProductionShortages } from "../domain/inventory";
import type { AppData, MaterialLine } from "../domain/types";
import { todayDateString } from "../utils/dateFilter";

interface ProductionPageProps {
  data: AppData;
  setData: (updater: (data: AppData) => AppData) => void;
}

export function ProductionPage({ data, setData }: ProductionPageProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"recipe" | "custom">("recipe");
  const [recipeId, setRecipeId] = useState(data.recipes[0]?.id ?? "");
  const [customName, setCustomName] = useState("");
  const [materialLines, setMaterialLines] = useState<MaterialLine[]>([]);
  const [quantityMade, setQuantityMade] = useState(1);
  const [packagingCostPerUnit, setPackagingCostPerUnit] = useState(3);
  const [laborCostPerUnit, setLaborCostPerUnit] = useState(8);
  const [productionDate, setProductionDate] = useState(todayDateString());
  const [imageDataUrl, setImageDataUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [shortageWarning, setShortageWarning] = useState<string[]>([]);

  const recipe = data.recipes.find((item) => item.id === recipeId);
  const activeMaterials = useMemo(() => data.materials.filter((material) => material.isActive ?? true), [data.materials]);
  const activeLines = mode === "recipe" && recipe ? recipe.materialLines : materialLines;
  const materialCost = calculateRecipeMaterialCost(data, activeLines);
  const unitCost = calculateFinishedUnitCost(materialCost, packagingCostPerUnit, laborCostPerUnit);

  useEffect(() => {
    if (recipe && mode === "recipe") {
      setPackagingCostPerUnit(recipe.packagingCostPerUnit);
      setLaborCostPerUnit(recipe.laborCostPerUnit);
    }
  }, [mode, recipe]);

  function addLine() {
    const firstMaterial = activeMaterials[0];
    if (!firstMaterial) {
      setError("请先新增一个在用货品");
      return;
    }
    setMaterialLines((current) => [
      ...current,
      {
        materialId: firstMaterial.id,
        specification: getMaterialSpecifications(data, firstMaterial.id)[0] ?? "待入库",
        quantity: 1
      }
    ]);
  }

  function updateLine(index: number, line: MaterialLine) {
    setMaterialLines((current) => current.map((item, itemIndex) => (itemIndex === index ? line : item)));
  }

  function submitProduction(allowNegativeStock: boolean) {
    const styleName = mode === "recipe" ? recipe?.name ?? "" : customName.trim();
    setData((current) =>
      applyProduction(current, {
        recipeId: mode === "recipe" ? recipeId : "",
        customName: mode === "custom" ? customName.trim() : "",
        styleName,
        productionDate,
        materialLines: activeLines,
        quantityMade,
        packagingCostPerUnit,
        laborCostPerUnit,
        imageDataUrl: imageDataUrl || recipe?.imageDataUrl || "",
        notes,
        allowNegativeStock
      })
    );
    setQuantityMade(1);
    setCustomName("");
    setMaterialLines([]);
    setProductionDate(todayDateString());
    setImageDataUrl("");
    setNotes("");
    setError("");
    setShortageWarning([]);
    setIsOpen(false);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const styleName = mode === "recipe" ? recipe?.name ?? "" : customName.trim();
    if (!styleName) {
      setError("请填写或选择款式");
      return;
    }
    const shortages = getProductionShortages(data, { materialLines: activeLines, quantityMade });
    if (shortages.length > 0) {
      setShortageWarning(shortages);
      setError("");
      return;
    }
    try {
      submitProduction(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    }
  }

  function handleContinueWithNegativeStock() {
    try {
      submitProduction(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    }
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>制作成品</h2>
          <p className="muted">库存不足时会先提醒，确认后可继续制作并显示负库存。</p>
        </div>
        <button className="primary-button" type="button" onClick={() => setIsOpen(true)}>
          + 制作成品
        </button>
      </div>

      <p className="muted">制作记录会在“成品”和“报表”里继续跟踪，这里先保持操作入口简洁。</p>

      <Modal title="制作成品" description="可以按配方制作，也可以临时定制。" isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <form className="form-grid two-col" onSubmit={handleSubmit}>
          <div className="segmented">
            <button type="button" className={mode === "recipe" ? "active" : ""} onClick={() => setMode("recipe")}>
              按配方
            </button>
            <button type="button" className={mode === "custom" ? "active" : ""} onClick={() => setMode("custom")}>
              临时定制
            </button>
          </div>
          {mode === "recipe" ? (
            <FormField label="选择配方">
              <select value={recipeId} onChange={(event) => setRecipeId(event.target.value)}>
                <option value="">请选择</option>
                {data.recipes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {formatRecipeOption(item.name, item.wristSizeCm)}
                  </option>
                ))}
              </select>
            </FormField>
          ) : (
            <>
              <FormField label="定制名称">
                <input value={customName} onChange={(event) => setCustomName(event.target.value)} />
              </FormField>
              <div className="form-field">
                <span>材料明细</span>
                <div className="line-list">
                  {materialLines.map((line, index) => (
                    <div className="line-row" key={`${line.materialId}-${index}`}>
                      <select
                        aria-label="材料"
                        value={line.materialId}
                        onChange={(event) => {
                          updateLine(index, {
                            ...line,
                            materialId: event.target.value,
                            specification: getMaterialSpecifications(data, event.target.value)[0] ?? "待入库"
                          });
                        }}
                      >
                        {activeMaterials.map((material) => (
                          <option key={material.id} value={material.id}>
                            {formatMaterialName(material, data)}
                          </option>
                        ))}
                      </select>
                      <label className="compact-field">
                        <span>规格</span>
                        <select value={line.specification ?? ""} onChange={(event) => updateLine(index, { ...line, specification: event.target.value })}>
                          {getMaterialSpecifications(data, line.materialId).map((specification) => (
                            <option key={specification} value={specification}>
                              {specification}
                            </option>
                          ))}
                          {getMaterialSpecifications(data, line.materialId).length === 0 ? <option value="待入库">待入库</option> : null}
                        </select>
                      </label>
                      <input aria-label="数量" min="1" type="number" value={line.quantity} onChange={(event) => updateLine(index, { ...line, quantity: Number(event.target.value) })} />
                    </div>
                  ))}
                  <button className="secondary-button" type="button" onClick={addLine}>
                    添加材料
                  </button>
                </div>
              </div>
            </>
          )}
          <FormField label="制作数量">
            <input min="1" type="number" value={quantityMade} onChange={(event) => setQuantityMade(Number(event.target.value))} />
          </FormField>
          <FormField label="制作日期">
            <input type="date" value={productionDate} onChange={(event) => setProductionDate(event.target.value)} />
          </FormField>
          <FormField label="包装成本/条">
            <input min="0" step="0.01" type="number" value={packagingCostPerUnit} onChange={(event) => setPackagingCostPerUnit(Number(event.target.value))} />
          </FormField>
          <FormField label="手工成本/条">
            <input min="0" step="0.01" type="number" value={laborCostPerUnit} onChange={(event) => setLaborCostPerUnit(Number(event.target.value))} />
          </FormField>
          <div className="cost-preview">单条成本 ¥{unitCost.toFixed(2)}，本次总成本 ¥{(unitCost * quantityMade).toFixed(2)}</div>
          {shortageWarning.length > 0 ? (
            <div className="cost-preview warning-preview">
              {shortageWarning.map((item) => (
                <p key={item}>{item}</p>
              ))}
              <button className="secondary-button" type="button" onClick={handleContinueWithNegativeStock}>
                继续制作并记为负库存
              </button>
            </div>
          ) : null}
          <FormField label="成品图片">
            <ImageInput value={imageDataUrl} onChange={setImageDataUrl} />
          </FormField>
          <FormField label="备注">
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} />
          </FormField>
          {error ? <p className="error-text">{error}</p> : null}
          <button className="primary-button" type="submit">
            保存制作记录
          </button>
        </form>
      </Modal>
    </section>
  );
}

function getMaterialSpecifications(data: AppData, materialId: string): string[] {
  return Array.from(
    new Set(data.materialStocks.filter((stock) => stock.materialId === materialId).map((stock) => stock.specification))
  );
}

function formatRecipeOption(name: string, wristSizeCm?: string) {
  return wristSizeCm?.trim() ? `${name} / ${wristSizeCm.trim()}cm` : name;
}
