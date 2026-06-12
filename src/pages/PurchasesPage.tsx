import { useMemo, useState, type FormEvent } from "react";
import { DataTable } from "../components/DataTable";
import { FormField } from "../components/FormField";
import { Modal } from "../components/Modal";
import { formatMaterialName } from "../domain/materialCatalog";
import { applyPurchase } from "../domain/inventory";
import type { AppData } from "../domain/types";
import { todayDateString } from "../utils/dateFilter";

interface PurchasesPageProps {
  data: AppData;
  setData: (updater: (data: AppData) => AppData) => void;
}

export function PurchasesPage({ data, setData }: PurchasesPageProps) {
  const activeMaterials = useMemo(() => data.materials.filter((material) => material.isActive ?? true), [data.materials]);
  const [isOpen, setIsOpen] = useState(false);
  const [materialId, setMaterialId] = useState(activeMaterials[0]?.id ?? "");
  const [specification, setSpecification] = useState("8mm");
  const [quantity, setQuantity] = useState(1);
  const [totalCost, setTotalCost] = useState(1);
  const [purchaseDate, setPurchaseDate] = useState(todayDateString());
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      setData((current) =>
        applyPurchase(current, {
          materialId,
          specification,
          quantity,
          totalCost,
          purchaseDate,
          notes
        })
      );
      setQuantity(1);
      setTotalCost(1);
      setPurchaseDate(todayDateString());
      setNotes("");
      setError("");
      setIsOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    }
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>进货批次</h2>
          <p className="muted">规格只在这里和库存批次里记录，每次入库都会形成单独批次。</p>
        </div>
        <button className="primary-button" type="button" onClick={() => setIsOpen(true)}>
          + 入库
        </button>
      </div>

      <DataTable
        rows={data.materialBatches ?? []}
        emptyText="当天没有入库批次。点右上角 + 入库 记录进货。"
        exportFileName="进货批次"
        dateFilter={{ label: "入库日期", getDate: (row) => row.purchaseDate }}
        columns={[
          { header: "日期", render: (row) => row.purchaseDate, exportValue: (row) => row.purchaseDate },
          {
            header: "货品",
            render: (row) => formatMaterialName(data.materials.find((item) => item.id === row.materialId), data),
            exportValue: (row) => formatMaterialName(data.materials.find((item) => item.id === row.materialId), data)
          },
          { header: "规格", render: (row) => row.specification, exportValue: (row) => row.specification },
          { header: "原数量", render: (row) => row.originalQuantity, exportValue: (row) => row.originalQuantity },
          { header: "剩余", render: (row) => row.currentQuantity, exportValue: (row) => row.currentQuantity },
          { header: "单颗成本", render: (row) => `¥${row.unitCost.toFixed(2)}`, exportValue: (row) => row.unitCost.toFixed(2) },
          { header: "剩余成本", render: (row) => `¥${row.remainingTotalCost.toFixed(2)}`, exportValue: (row) => row.remainingTotalCost.toFixed(2) },
          { header: "备注", render: (row) => row.notes || "-", exportValue: (row) => row.notes }
        ]}
      />

      <Modal title="记录入库" description="先选货品，再录规格、数量和成本。" isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <form className="form-grid" onSubmit={handleSubmit}>
          <FormField label="材料">
            <select value={materialId} onChange={(event) => setMaterialId(event.target.value)}>
              <option value="">请选择</option>
              {activeMaterials.map((material) => (
                <option key={material.id} value={material.id}>
                  {formatMaterialName(material, data)}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="规格">
            <select value={specification} onChange={(event) => setSpecification(event.target.value)}>
              {beadSizes.map((size) => (
                <option key={size} value={`${size}mm`}>
                  {size}mm
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
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="可记录品质、来源、颜色等批次差异" />
          </FormField>
          {error ? <p className="error-text">{error}</p> : null}
          <button className="primary-button" type="submit" disabled={!materialId}>
            保存入库
          </button>
        </form>
      </Modal>
    </section>
  );
}

const beadSizes = Array.from({ length: 15 }, (_, index) => index + 2);
