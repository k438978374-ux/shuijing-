import { useState } from "react";
import { DataTable } from "../components/DataTable";
import { FormField } from "../components/FormField";
import { ImageInput } from "../components/ImageInput";
import { createId } from "../domain/inventory";
import type { AppData, Material, MaterialCategory } from "../domain/types";

interface MaterialsPageProps {
  data: AppData;
  setData: (updater: (data: AppData) => AppData) => void;
}

const categoryLabels: Record<MaterialCategory, string> = {
  crystal: "水晶珠",
  spacer: "隔片",
  charm: "吊坠",
  string: "线材",
  packaging: "包装",
  other: "其他"
};

export function MaterialsPage({ data, setData }: MaterialsPageProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<MaterialCategory>("crystal");
  const [lowStockThreshold, setLowStockThreshold] = useState(10);
  const [imageDataUrl, setImageDataUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      setError("请填写材料名称");
      return;
    }
    const material: Material = {
      id: createId("material"),
      name: name.trim(),
      category,
      lowStockThreshold,
      imageDataUrl,
      notes: notes.trim()
    };
    setData((current) => ({ ...current, materials: [...current.materials, material] }));
    setName("");
    setLowStockThreshold(10);
    setImageDataUrl("");
    setNotes("");
    setError("");
  }

  return (
    <div className="page-grid">
      <section className="panel">
        <h2>新增材料</h2>
        <form className="form-grid" onSubmit={handleSubmit}>
          <FormField label="名称">
            <input value={name} onChange={(event) => setName(event.target.value)} />
          </FormField>
          <FormField label="分类">
            <select value={category} onChange={(event) => setCategory(event.target.value as MaterialCategory)}>
              {Object.entries(categoryLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="低库存提醒">
            <input
              min="0"
              type="number"
              value={lowStockThreshold}
              onChange={(event) => setLowStockThreshold(Number(event.target.value))}
            />
          </FormField>
          <FormField label="图片">
            <ImageInput value={imageDataUrl} onChange={setImageDataUrl} />
          </FormField>
          <FormField label="备注">
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} />
          </FormField>
          {error ? <p className="error-text">{error}</p> : null}
          <button className="primary-button" type="submit">
            保存材料
          </button>
        </form>
      </section>
      <section className="panel wide-panel">
        <h2>材料库存</h2>
        <DataTable
          rows={data.materials}
          emptyText="还没有材料。先把水晶珠、隔片或包装录进来。"
          columns={[
            { header: "图片", render: (row) => <Thumb src={row.imageDataUrl} /> },
            { header: "名称", render: (row) => row.name },
            { header: "分类", render: (row) => categoryLabels[row.category] },
            { header: "规格数", render: (row) => getStocks(data, row.id).length },
            { header: "总库存", render: (row) => getStocks(data, row.id).reduce((sum, stock) => sum + stock.currentQuantity, 0) },
            { header: "库存成本", render: (row) => `¥${getStocks(data, row.id).reduce((sum, stock) => sum + stock.remainingTotalCost, 0).toFixed(2)}` },
            {
              header: "状态",
              render: (row) => {
                const quantity = getStocks(data, row.id).reduce((sum, stock) => sum + stock.currentQuantity, 0);
                return quantity <= row.lowStockThreshold ? <span className="status danger">低库存</span> : <span className="status">正常</span>;
              }
            }
          ]}
        />
      </section>
    </div>
  );
}

function Thumb({ src }: { src: string }) {
  return src ? <img className="table-thumb" src={src} alt="" /> : <span className="muted">无</span>;
}

function getStocks(data: AppData, materialId: string) {
  return data.materialStocks.filter((stock) => stock.materialId === materialId);
}
