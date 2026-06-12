import { DataTable } from "../components/DataTable";
import { summarizeByMonth, summarizeByStyle } from "../domain/calculations";
import type { AppData, SummaryRow } from "../domain/types";

interface ReportsPageProps {
  data: AppData;
}

export function ReportsPage({ data }: ReportsPageProps) {
  return (
    <div className="page-stack">
      <section className="panel">
        <h2>每笔销售利润</h2>
        <DataTable
          rows={data.sales}
          emptyText="当天还没有销售记录。"
          exportFileName="每笔销售利润"
          dateFilter={{ label: "销售日期", getDate: (row) => row.saleDate }}
          columns={[
            { header: "日期", render: (row) => row.saleDate, exportValue: (row) => row.saleDate },
            { header: "款式", render: (row) => row.styleName, exportValue: (row) => row.styleName },
            { header: "收入", render: (row) => `¥${row.totalRevenue.toFixed(2)}`, exportValue: (row) => row.totalRevenue.toFixed(2) },
            { header: "成本", render: (row) => `¥${row.totalCost.toFixed(2)}`, exportValue: (row) => row.totalCost.toFixed(2) },
            { header: "利润", render: (row) => `¥${row.profit.toFixed(2)}`, exportValue: (row) => row.profit.toFixed(2) },
            { header: "利润率", render: (row) => `${(row.profitMargin * 100).toFixed(1)}%`, exportValue: (row) => `${(row.profitMargin * 100).toFixed(1)}%` }
          ]}
        />
      </section>
      <SummaryTable title="按款式汇总" fileName="按款式汇总" rows={summarizeByStyle(data.sales)} />
      <SummaryTable title="按月份汇总" fileName="按月份汇总" rows={summarizeByMonth(data.sales)} />
    </div>
  );
}

function SummaryTable({ title, fileName, rows }: { title: string; fileName: string; rows: SummaryRow[] }) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      <DataTable
        rows={rows}
        emptyText="暂无可汇总数据。"
        exportFileName={fileName}
        columns={[
          { header: "分组", render: (row) => row.key, exportValue: (row) => row.key },
          { header: "销量", render: (row) => row.quantitySold, exportValue: (row) => row.quantitySold },
          { header: "收入", render: (row) => `¥${row.totalRevenue.toFixed(2)}`, exportValue: (row) => row.totalRevenue.toFixed(2) },
          { header: "成本", render: (row) => `¥${row.totalCost.toFixed(2)}`, exportValue: (row) => row.totalCost.toFixed(2) },
          { header: "利润", render: (row) => `¥${row.totalProfit.toFixed(2)}`, exportValue: (row) => row.totalProfit.toFixed(2) },
          { header: "利润率", render: (row) => `${(row.averageProfitMargin * 100).toFixed(1)}%`, exportValue: (row) => `${(row.averageProfitMargin * 100).toFixed(1)}%` }
        ]}
      />
    </section>
  );
}
