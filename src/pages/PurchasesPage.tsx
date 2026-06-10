import { useState } from "react";
import { DataTable } from "../components/DataTable";
import { FormField } from "../components/FormField";
import { applyPurchase } from "../domain/inventory";
import type { AppData } from "../domain/types";

interface PurchasesPageProps {
  data: AppData;
  setData: (updater: (data: AppData) => AppData) => void;
}

export function PurchasesPage({ data, setData }: PurchasesPageProps) {
  const [materialId, setMaterialId] = useState(data.materials[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [totalCost, setTotalCost] = useState(1);
  const [purchaseDate, setPurchaseDate] = useState(today());
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    try {
      setData((current) =>
        applyPurchase(current, {
          materialId,
          quantity,
          totalCost,
          purchaseDate,
          notes
        })
      );
      setQuantity(1);
      setTotalCost(1);
      setNotes("");
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    }
  }

  return (
    <div className="page-grid">
      <section className="panel">
        <h2>记录进货</h2>
        <form className="form-grid" onSubmit={handleSubmit}>
          <FormField label="材料">
            <select value={materialId} onChange={(event) => setMaterialId(event.target.value)}>
              <option value="">请选择</option>
              {data.materials.map((material) => (
                <option key={material.id} value={material.id}>
                  {material.name} {material.specification}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="数量">
            <input min="1" type="number" value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} />
          </FormField>
          <FormField label="总成本">
            <input min="0.01" step="0.01" type="number" value={totalCost} onChange={(event) => setTotalCost(Number(event.target.value))} />
          </FormField>
          <FormField label="日期">
            <input type="date" value={purchaseDate} onChange={(event) => setPurchaseDate(event.target.value)} />
          </FormField>
          <FormField label="备注">
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} />
          </FormField>
          {error ? <p className="error-text">{error}</p> : null}
          <button className="primary-button" type="submit" disabled={!materialId}>
            保存进货
          </button>
        </form>
      </section>
      <section className="panel wide-panel">
        <h2>进货记录</h2>
        <DataTable
          rows={data.purchases}
          emptyText="还没有进货记录。"
          columns={[
            { header: "日期", render: (row) => row.purchaseDate },
            { header: "材料", render: (row) => data.materials.find((item) => item.id === row.materialId)?.name ?? "已删除材料" },
            { header: "数量", render: (row) => row.quantity },
            { header: "总成本", render: (row) => `¥${row.totalCost.toFixed(2)}` },
            { header: "备注", render: (row) => row.notes || "-" }
          ]}
        />
      </section>
    </div>
  );
}

function today() {
  return new Date().toISOString().slice(0, 10);
}
