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

const beadSizes = Array.from({ length: 15 }, (_, index) => index + 2);

export function MaterialsPage({ data, setData }: MaterialsPageProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<MaterialCategory>("crystal");
  const [selectedSizes, setSelectedSizes] = useState<number[]>([]);
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
      specification: formatSizes(selectedSizes),
      currentQuantity: 0,
      remainingTotalCost: 0,
      averageUnitCost: 0,
      lowStockThreshold,
      imageDataUrl,
      notes: notes.trim()
    };
    setData((current) => ({ ...current, materials: [...current.materials, material] }));
    setName("");
    setSelectedSizes([]);
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
          <div className="form-field">
            <span>规格</span>
            <div className="size-grid" aria-label="规格">
              {beadSizes.map((size) => {
                const selected = selectedSizes.includes(size);
                return (
                  <button
                    key={size}
                    className={selected ? "size-chip selected" : "size-chip"}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleSize(size, setSelectedSizes)}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>
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
            { header: "规格", render: (row) => row.specification || "-" },
            { header: "库存", render: (row) => row.currentQuantity },
            { header: "单颗成本", render: (row) => `¥${row.averageUnitCost.toFixed(2)}` },
            { header: "剩余成本", render: (row) => `¥${row.remainingTotalCost.toFixed(2)}` },
            {
              header: "状态",
              render: (row) =>
                row.currentQuantity <= row.lowStockThreshold ? <span className="status danger">低库存</span> : <span className="status">正常</span>
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

function toggleSize(size: number, setSelectedSizes: React.Dispatch<React.SetStateAction<number[]>>) {
  setSelectedSizes((current) =>
    current.includes(size)
      ? current.filter((item) => item !== size)
      : [...current, size].sort((a, b) => a - b)
  );
}

function formatSizes(sizes: number[]) {
  return sizes.map((size) => `${size}mm`).join(", ");
}
