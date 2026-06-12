import { DataTable } from "../components/DataTable";
import type { AppData } from "../domain/types";

interface FinishedGoodsPageProps {
  data: AppData;
}

export function FinishedGoodsPage({ data }: FinishedGoodsPageProps) {
  return (
    <section className="panel">
      <h2>成品库存</h2>
      <DataTable
        rows={data.finishedGoods}
        emptyText="当天没有制作成品。点“全部”可以查看历史成品库存。"
        exportFileName="成品库存"
        dateFilter={{ label: "制作日期", getDate: (row) => row.productionDate }}
        columns={[
          { header: "图片", render: (row) => (row.imageDataUrl ? <img className="table-thumb" src={row.imageDataUrl} alt="" /> : <span className="muted">无</span>), exportValue: () => "" },
          { header: "款式", render: (row) => row.styleName, exportValue: (row) => row.styleName },
          { header: "制作日期", render: (row) => row.productionDate, exportValue: (row) => row.productionDate },
          { header: "制作数量", render: (row) => row.quantityMade, exportValue: (row) => row.quantityMade },
          { header: "剩余数量", render: (row) => row.quantityRemaining, exportValue: (row) => row.quantityRemaining },
          { header: "单条成本", render: (row) => `¥${row.unitCost.toFixed(2)}`, exportValue: (row) => row.unitCost.toFixed(2) },
          { header: "备注", render: (row) => row.notes || "-", exportValue: (row) => row.notes }
        ]}
      />
    </section>
  );
}
