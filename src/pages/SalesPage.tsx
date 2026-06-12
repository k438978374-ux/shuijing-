import { useState, type FormEvent } from "react";
import { DataTable } from "../components/DataTable";
import { FormField } from "../components/FormField";
import { ImageInput } from "../components/ImageInput";
import { Modal } from "../components/Modal";
import { calculateSaleProfit } from "../domain/calculations";
import { applySale } from "../domain/inventory";
import type { AppData } from "../domain/types";
import { todayDateString } from "../utils/dateFilter";

interface SalesPageProps {
  data: AppData;
  setData: (updater: (data: AppData) => AppData) => void;
}

export function SalesPage({ data, setData }: SalesPageProps) {
  const availableGoods = data.finishedGoods.filter((item) => item.quantityRemaining > 0);
  const [isOpen, setIsOpen] = useState(false);
  const [finishedGoodBatchId, setFinishedGoodBatchId] = useState(availableGoods[0]?.id ?? "");
  const [quantitySold, setQuantitySold] = useState(1);
  const [salePricePerUnit, setSalePricePerUnit] = useState(68);
  const [saleDate, setSaleDate] = useState(todayDateString());
  const [channelNote, setChannelNote] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const batch = data.finishedGoods.find((item) => item.id === finishedGoodBatchId);
  const preview = batch ? calculateSaleProfit(quantitySold, salePricePerUnit, batch.unitCost) : null;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      setData((current) =>
        applySale(current, {
          finishedGoodBatchId,
          saleDate,
          quantitySold,
          salePricePerUnit,
          channelNote,
          imageDataUrl,
          notes
        })
      );
      setQuantitySold(1);
      setSaleDate(todayDateString());
      setImageDataUrl("");
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
          <h2>销售记录</h2>
          <p className="muted">默认查看当天销售，也可以切到全部后导出。</p>
        </div>
        <button className="primary-button" type="button" onClick={() => setIsOpen(true)}>
          + 销售出库
        </button>
      </div>

      <DataTable
        rows={data.sales}
        emptyText="当天还没有销售记录。"
        exportFileName="销售记录"
        dateFilter={{ label: "销售日期", getDate: (row) => row.saleDate }}
        columns={[
          { header: "日期", render: (row) => row.saleDate, exportValue: (row) => row.saleDate },
          { header: "款式", render: (row) => row.styleName, exportValue: (row) => row.styleName },
          { header: "数量", render: (row) => row.quantitySold, exportValue: (row) => row.quantitySold },
          { header: "收入", render: (row) => `¥${row.totalRevenue.toFixed(2)}`, exportValue: (row) => row.totalRevenue.toFixed(2) },
          { header: "成本", render: (row) => `¥${row.totalCost.toFixed(2)}`, exportValue: (row) => row.totalCost.toFixed(2) },
          { header: "利润", render: (row) => `¥${row.profit.toFixed(2)}`, exportValue: (row) => row.profit.toFixed(2) },
          { header: "利润率", render: (row) => `${(row.profitMargin * 100).toFixed(1)}%`, exportValue: (row) => `${(row.profitMargin * 100).toFixed(1)}%` },
          { header: "渠道", render: (row) => row.channelNote || "-", exportValue: (row) => row.channelNote }
        ]}
      />

      <Modal title="销售出库" description="销售后会自动扣减对应成品批次库存。" isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <form className="form-grid" onSubmit={handleSubmit}>
          <FormField label="成品批次">
            <select value={finishedGoodBatchId} onChange={(event) => setFinishedGoodBatchId(event.target.value)}>
              <option value="">请选择</option>
              {availableGoods.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.styleName}，剩余 {item.quantityRemaining}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="销售数量">
            <input min="1" type="number" value={quantitySold} onChange={(event) => setQuantitySold(Number(event.target.value))} />
          </FormField>
          <FormField label="单条售价">
            <input min="0.01" step="0.01" type="number" value={salePricePerUnit} onChange={(event) => setSalePricePerUnit(Number(event.target.value))} />
          </FormField>
          <FormField label="销售日期">
            <input type="date" value={saleDate} onChange={(event) => setSaleDate(event.target.value)} />
          </FormField>
          <FormField label="渠道/客户">
            <input value={channelNote} onChange={(event) => setChannelNote(event.target.value)} placeholder="如小红书、朋友、线下" />
          </FormField>
          {preview ? <div className="cost-preview">收入 ¥{preview.totalRevenue.toFixed(2)}，利润 ¥{preview.profit.toFixed(2)}</div> : null}
          <FormField label="销售图片">
            <ImageInput value={imageDataUrl} onChange={setImageDataUrl} />
          </FormField>
          <FormField label="备注">
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} />
          </FormField>
          {error ? <p className="error-text">{error}</p> : null}
          <button className="primary-button" type="submit" disabled={!finishedGoodBatchId}>
            保存销售
          </button>
        </form>
      </Modal>
    </section>
  );
}
