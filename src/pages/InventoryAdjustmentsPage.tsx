import { useMemo, useState, type FormEvent } from "react";
import { DataTable } from "../components/DataTable";
import { FormField } from "../components/FormField";
import { Modal } from "../components/Modal";
import { applyInventoryAdjustment, createId } from "../domain/inventory";
import type { AppData } from "../domain/types";

interface InventoryAdjustmentsPageProps {
  data: AppData;
  setData: (updater: (data: AppData) => AppData) => void;
}

export function InventoryAdjustmentsPage({ data, setData }: InventoryAdjustmentsPageProps) {
  const availableBatches = (data.materialBatches ?? []).filter((batch) => batch.currentQuantity >= 0);
  const [isOpen, setIsOpen] = useState(false);
  const [batchId, setBatchId] = useState(availableBatches[0]?.id ?? "");
  const selectedBatch = availableBatches.find((batch) => batch.id === batchId);
  const [newQuantity, setNewQuantity] = useState(selectedBatch?.currentQuantity ?? 0);
  const [employeeName, setEmployeeName] = useState((data.employees ?? [])[0]?.name ?? "");
  const [reason, setReason] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const employeeNames = useMemo(
    () => Array.from(new Set((data.employees ?? []).filter((item) => item.isActive).map((item) => item.name))),
    [data.employees]
  );

  function handleBatchChange(value: string) {
    setBatchId(value);
    const batch = availableBatches.find((item) => item.id === value);
    setNewQuantity(batch?.currentQuantity ?? 0);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      setData((current) => {
        const next = applyInventoryAdjustment(current, {
          batchId,
          newQuantity,
          employeeName,
          reason,
          password
        });
        const exists = next.employees.some((item) => item.name === employeeName.trim());
        return exists || !employeeName.trim()
          ? next
          : {
              ...next,
              employees: [...next.employees, { id: createId("employee"), name: employeeName.trim(), isActive: true }]
            };
      });
      setReason("");
      setPassword("");
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
          <h2>调整记录</h2>
          <p className="muted">修改库存需要员工、原因和密码，后台会留存操作记录。</p>
        </div>
        <button className="primary-button" type="button" onClick={() => setIsOpen(true)}>
          + 修改库存
        </button>
      </div>

      <DataTable
        rows={data.inventoryAdjustments ?? []}
        emptyText="当天还没有库存调整记录。"
        exportFileName="库存调整记录"
        dateFilter={{ label: "调整日期", getDate: (row) => row.adjustedAt }}
        columns={[
          { header: "时间", render: (row) => formatDateTime(row.adjustedAt), exportValue: (row) => formatDateTime(row.adjustedAt) },
          { header: "批次", render: (row) => formatBatch(data, row.batchId), exportValue: (row) => formatBatch(data, row.batchId) },
          { header: "原数量", render: (row) => row.previousQuantity, exportValue: (row) => row.previousQuantity },
          { header: "新数量", render: (row) => row.newQuantity, exportValue: (row) => row.newQuantity },
          { header: "变化", render: (row) => row.quantityChange, exportValue: (row) => row.quantityChange },
          { header: "员工", render: (row) => row.employeeName, exportValue: (row) => row.employeeName },
          { header: "原因", render: (row) => row.reason, exportValue: (row) => row.reason }
        ]}
      />

      <Modal title="修改库存" description="用于盘点、破损、丢失等人工修正。" isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <form className="form-grid" onSubmit={handleSubmit}>
          <FormField label="批次">
            <select value={batchId} onChange={(event) => handleBatchChange(event.target.value)}>
              <option value="">请选择</option>
              {availableBatches.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {formatBatch(data, batch.id)}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="调整后数量">
            <input min="0" type="number" value={newQuantity} onChange={(event) => setNewQuantity(Number(event.target.value))} />
          </FormField>
          <FormField label="操作员工">
            <input list="employee-list" value={employeeName} onChange={(event) => setEmployeeName(event.target.value)} />
          </FormField>
          <datalist id="employee-list">
            {employeeNames.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
          <FormField label="调整原因">
            <textarea value={reason} onChange={(event) => setReason(event.target.value)} />
          </FormField>
          <FormField label="操作密码">
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </FormField>
          {error ? <p className="error-text">{error}</p> : null}
          <button className="primary-button" type="submit" disabled={!batchId}>
            保存调整
          </button>
        </form>
      </Modal>
    </section>
  );
}

function formatBatch(data: AppData, batchId: string) {
  const batch = (data.materialBatches ?? []).find((item) => item.id === batchId);
  if (!batch) {
    return "未知批次";
  }
  const material = data.materials.find((item) => item.id === batch.materialId);
  return `${material?.name ?? "未知材料"} ${batch.specification}｜${batch.purchaseDate}｜剩 ${batch.currentQuantity}｜¥${batch.unitCost.toFixed(2)}/颗`;
}

function formatDateTime(value: string) {
  return value ? new Date(value).toLocaleString("zh-CN") : "-";
}
