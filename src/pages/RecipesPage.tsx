import { useMemo, useState, type FormEvent } from "react";
import { DataTable } from "../components/DataTable";
import { FormField } from "../components/FormField";
import { ImageInput } from "../components/ImageInput";
import { Modal } from "../components/Modal";
import { calculateFinishedUnitCost } from "../domain/calculations";
import { formatMaterialName } from "../domain/materialCatalog";
import { calculateRecipeMaterialCost, createId } from "../domain/inventory";
import type { AppData, MaterialLine, Recipe } from "../domain/types";

interface RecipesPageProps {
  data: AppData;
  setData: (updater: (data: AppData) => AppData) => void;
}

export function RecipesPage({ data, setData }: RecipesPageProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [wristSizeCm, setWristSizeCm] = useState("");
  const [materialLines, setMaterialLines] = useState<MaterialLine[]>([]);
  const [packagingCostPerUnit, setPackagingCostPerUnit] = useState(3);
  const [laborCostPerUnit, setLaborCostPerUnit] = useState(8);
  const [suggestedSalePrice, setSuggestedSalePrice] = useState(68);
  const [imageDataUrl, setImageDataUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const selectableMaterials = useMemo(
    () => data.materials.filter((material) => material.isActive ?? true),
    [data.materials]
  );
  const costPreview = getCostPreview(data, materialLines, packagingCostPerUnit, laborCostPerUnit, suggestedSalePrice);

  function addLine() {
    const firstMaterial = selectableMaterials[0];
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
    setError("");
  }

  function updateLine(index: number, line: MaterialLine) {
    setMaterialLines((current) => current.map((item, itemIndex) => (itemIndex === index ? line : item)));
  }

  function removeLine(index: number) {
    setMaterialLines((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      setError("请填写款式名称");
      return;
    }
    if (materialLines.length === 0) {
      setError("请至少添加一种材料");
      return;
    }
    const recipe: Recipe = {
      id: createId("recipe"),
      name: name.trim(),
      wristSizeCm: wristSizeCm.trim(),
      materialLines,
      packagingCostPerUnit,
      laborCostPerUnit,
      suggestedSalePrice,
      imageDataUrl,
      notes: notes.trim()
    };
    setData((current) => ({ ...current, recipes: [...current.recipes, recipe] }));
    setName("");
    setWristSizeCm("");
    setMaterialLines([]);
    setPackagingCostPerUnit(3);
    setLaborCostPerUnit(8);
    setSuggestedSalePrice(68);
    setImageDataUrl("");
    setNotes("");
    setError("");
    setIsOpen(false);
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>款式列表</h2>
          <p className="muted">配方可以提前设计，没有库存的货品也可以先加入；制作时再提醒库存不足。</p>
        </div>
        <button className="primary-button" type="button" onClick={() => setIsOpen(true)}>
          + 新配方
        </button>
      </div>

      <DataTable
        rows={data.recipes}
        emptyText="还没有配方。"
        exportFileName="配方列表"
        columns={[
          { header: "图片", render: (row) => (row.imageDataUrl ? <img className="table-thumb" src={row.imageDataUrl} alt="" /> : <span className="muted">无</span>), exportValue: () => "" },
          { header: "名称", render: (row) => <strong>{row.name}</strong>, exportValue: (row) => row.name },
          { header: "手尾尺寸/cm", render: (row) => formatSize(row.wristSizeCm, "cm"), exportValue: (row) => row.wristSizeCm ?? "" },
          { header: "材料", render: (row) => row.materialLines.map((line) => formatMaterialLine(data, line)).join("；"), exportValue: (row) => row.materialLines.map((line) => formatMaterialLine(data, line)).join("；") },
          { header: "预计成本", render: (row) => formatRecipeCost(data, row), exportValue: (row) => formatRecipeCost(data, row) },
          { header: "建议售价", render: (row) => `¥${row.suggestedSalePrice.toFixed(2)}`, exportValue: (row) => row.suggestedSalePrice.toFixed(2) },
          { header: "备注", render: (row) => row.notes || "-", exportValue: (row) => row.notes }
        ]}
      />

      <Modal title="新增配方" description="把一条手串会用到的珠子、隔片和成本录成模板。" isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <form className="form-grid" onSubmit={handleSubmit}>
          <FormField label="款式名称">
            <input value={name} onChange={(event) => setName(event.target.value)} />
          </FormField>
          <FormField label="手尾尺寸/cm">
            <input inputMode="decimal" value={wristSizeCm} onChange={(event) => setWristSizeCm(event.target.value)} />
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
                    {selectableMaterials.map((material) => (
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
                  <button className="text-button" type="button" onClick={() => removeLine(index)}>
                    删除
                  </button>
                </div>
              ))}
              <button className="secondary-button" type="button" onClick={addLine}>
                添加材料
              </button>
            </div>
          </div>
          <FormField label="包装成本/条">
            <input min="0" step="0.01" type="number" value={packagingCostPerUnit} onChange={(event) => setPackagingCostPerUnit(Number(event.target.value))} />
          </FormField>
          <FormField label="手工成本/条">
            <input min="0" step="0.01" type="number" value={laborCostPerUnit} onChange={(event) => setLaborCostPerUnit(Number(event.target.value))} />
          </FormField>
          <FormField label="建议售价">
            <input min="0" step="0.01" type="number" value={suggestedSalePrice} onChange={(event) => setSuggestedSalePrice(Number(event.target.value))} />
          </FormField>
          <div className={costPreview.ok ? "cost-preview" : "cost-preview warning-preview"}>
            {costPreview.ok
              ? `预计成本 ¥${costPreview.totalCost.toFixed(2)}，预计利润 ¥${costPreview.estimatedProfit.toFixed(2)}`
              : costPreview.message}
          </div>
          <FormField label="款式图片">
            <ImageInput value={imageDataUrl} onChange={setImageDataUrl} />
          </FormField>
          <FormField label="备注">
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} />
          </FormField>
          {error ? <p className="error-text">{error}</p> : null}
          <button className="primary-button" type="submit">
            保存配方
          </button>
        </form>
      </Modal>
    </section>
  );
}

function getMaterialSpecifications(data: AppData, materialId: string): string[] {
  return Array.from(
    new Set(
      data.materialStocks
        .filter((stock) => stock.materialId === materialId)
        .map((stock) => stock.specification)
    )
  );
}

function formatMaterialLine(data: AppData, line: MaterialLine): string {
  const material = data.materials.find((item) => item.id === line.materialId);
  const specification = line.specification ? ` ${line.specification}` : "";
  return `${formatMaterialName(material, data)}${specification} x${line.quantity}`;
}

function getCostPreview(
  data: AppData,
  materialLines: MaterialLine[],
  packagingCostPerUnit: number,
  laborCostPerUnit: number,
  suggestedSalePrice: number
):
  | { ok: true; totalCost: number; estimatedProfit: number }
  | { ok: false; message: string } {
  try {
    const materialCost = calculateRecipeMaterialCost(data, materialLines);
    const totalCost = calculateFinishedUnitCost(materialCost, packagingCostPerUnit, laborCostPerUnit);
    return { ok: true, totalCost, estimatedProfit: suggestedSalePrice - totalCost };
  } catch {
    return { ok: false, message: "暂时无法计算成本，但可以先保存配方" };
  }
}

function formatRecipeCost(data: AppData, recipe: Recipe) {
  const preview = getCostPreview(
    data,
    recipe.materialLines,
    recipe.packagingCostPerUnit,
    recipe.laborCostPerUnit,
    recipe.suggestedSalePrice
  );
  return preview.ok ? `¥${preview.totalCost.toFixed(2)}` : "待入库";
}

function formatSize(value: string | undefined, unit: string) {
  return value?.trim() ? `${value.trim()}${unit}` : "-";
}
