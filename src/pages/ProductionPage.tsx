import { useEffect, useState, type FormEvent } from "react";
import { FormField } from "../components/FormField";
import { ImageInput } from "../components/ImageInput";
import { calculateFinishedUnitCost } from "../domain/calculations";
import { applyProduction, calculateRecipeMaterialCost } from "../domain/inventory";
import type { AppData, MaterialLine } from "../domain/types";

interface ProductionPageProps {
  data: AppData;
  setData: (updater: (data: AppData) => AppData) => void;
}

export function ProductionPage({ data, setData }: ProductionPageProps) {
  const [mode, setMode] = useState<"recipe" | "custom">("recipe");
  const [recipeId, setRecipeId] = useState(data.recipes[0]?.id ?? "");
  const [customName, setCustomName] = useState("");
  const [materialLines, setMaterialLines] = useState<MaterialLine[]>([]);
  const [quantityMade, setQuantityMade] = useState(1);
  const [packagingCostPerUnit, setPackagingCostPerUnit] = useState(3);
  const [laborCostPerUnit, setLaborCostPerUnit] = useState(8);
  const [productionDate, setProductionDate] = useState(today());
  const [imageDataUrl, setImageDataUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const recipe = data.recipes.find((item) => item.id === recipeId);
  const activeLines = mode === "recipe" && recipe ? recipe.materialLines : materialLines;
  const materialCost = calculateRecipeMaterialCost(data.materials, activeLines);
  const unitCost = calculateFinishedUnitCost(materialCost, packagingCostPerUnit, laborCostPerUnit);

  useEffect(() => {
    if (recipe && mode === "recipe") {
      setPackagingCostPerUnit(recipe.packagingCostPerUnit);
      setLaborCostPerUnit(recipe.laborCostPerUnit);
    }
  }, [mode, recipe]);

  function addLine() {
    const firstMaterial = data.materials[0];
    if (!firstMaterial) {
      setError("请先新增材料");
      return;
    }
    setMaterialLines((current) => [...current, { materialId: firstMaterial.id, quantity: 1 }]);
  }

  function updateLine(index: number, line: MaterialLine) {
    setMaterialLines((current) => current.map((item, itemIndex) => (itemIndex === index ? line : item)));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const styleName = mode === "recipe" ? recipe?.name ?? "" : customName.trim();
    if (!styleName) {
      setError("请填写或选择款式");
      return;
    }
    try {
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
          notes
        })
      );
      setQuantityMade(1);
      setCustomName("");
      setMaterialLines([]);
      setImageDataUrl("");
      setNotes("");
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    }
  }

  return (
    <section className="panel">
      <h2>制作成品</h2>
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
                  {item.name}
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
                    <select value={line.materialId} onChange={(event) => updateLine(index, { ...line, materialId: event.target.value })}>
                      {data.materials.map((material) => (
                        <option key={material.id} value={material.id}>
                          {material.name}
                        </option>
                      ))}
                    </select>
                    <input min="1" type="number" value={line.quantity} onChange={(event) => updateLine(index, { ...line, quantity: Number(event.target.value) })} />
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
    </section>
  );
}

function today() {
  return new Date().toISOString().slice(0, 10);
}
