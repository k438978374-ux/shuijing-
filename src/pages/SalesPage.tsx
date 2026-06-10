import { useState, type FormEvent } from "react";
import { DataTable } from "../components/DataTable";
import { FormField } from "../components/FormField";
import { ImageInput } from "../components/ImageInput";
import { calculateSaleProfit } from "../domain/calculations";
import { applySale } from "../domain/inventory";
import type { AppData } from "../domain/types";

interface SalesPageProps {
  data: AppData;
  setData: (updater: (data: AppData) => AppData) => void;
}

export function SalesPage({ data, setData }: SalesPageProps) {
  const availableGoods = data.finishedGoods.filter((item) => item.quantityRemaining > 0);
  const [finishedGoodBatchId, setFinishedGoodBatchId] = useState(availableGoods[0]?.id ?? "");
  const [quantitySold, setQuantitySold] = useState(1);
  const [salePricePerUnit, setSalePricePerUnit] = useState(68);
  const [saleDate, setSaleDate] = useState(today());
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
      setImageDataUrl("");
      setNotes("");
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    }
  }

  return (
    <div className="page-grid">
      <section className="panel">
        <h2>记录销售</h2>
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
            <input value={channelNote} onChange={(event) => setChannelNote(event.target.value)} placeholder="如 小红书、朋友、线下" />
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
      </section>
      <section className="panel wide-panel">
        <h2>销售记录</h2>
        <DataTable
          rows={data.sales}
          emptyText="还没有销售记录。"
          columns={[
            { header: "日期", render: (row) => row.saleDate },
            { header: "款式", render: (row) => row.styleName },
            { header: "数量", render: (row) => row.quantitySold },
            { header: "收入", render: (row) => `¥${row.totalRevenue.toFixed(2)}` },
            { header: "成本", render: (row) => `¥${row.totalCost.toFixed(2)}` },
            { header: "利润", render: (row) => `¥${row.profit.toFixed(2)}` },
            { header: "利润率", render: (row) => `${(row.profitMargin * 100).toFixed(1)}%` }
          ]}
        />
      </section>
    </div>
  );
}

function today() {
  return new Date().toISOString().slice(0, 10);
}
