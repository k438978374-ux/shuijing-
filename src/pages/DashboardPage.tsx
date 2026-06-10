import { MetricCard } from "../components/MetricCard";
import type { AppData } from "../domain/types";

interface DashboardPageProps {
  data: AppData;
}

export function DashboardPage({ data }: DashboardPageProps) {
  const materialValue = data.materials.reduce((sum, item) => sum + item.remainingTotalCost, 0);
  const finishedValue = data.finishedGoods.reduce(
    (sum, item) => sum + item.quantityRemaining * item.unitCost,
    0
  );
  const revenue = data.sales.reduce((sum, item) => sum + item.totalRevenue, 0);
  const profit = data.sales.reduce((sum, item) => sum + item.profit, 0);
  const lowStock = data.materials.filter((item) => item.currentQuantity <= item.lowStockThreshold);

  return (
    <div className="page-stack">
      <div className="page-header">
        <h2>总览</h2>
        <p>查看库存价值、销售收入、利润和低库存材料。</p>
      </div>
      <div className="metric-grid">
        <MetricCard label="材料库存价值" value={`¥${materialValue.toFixed(2)}`} />
        <MetricCard label="成品库存价值" value={`¥${finishedValue.toFixed(2)}`} />
        <MetricCard label="累计销售收入" value={`¥${revenue.toFixed(2)}`} />
        <MetricCard label="累计利润" value={`¥${profit.toFixed(2)}`} />
      </div>
      <section className="panel">
        <h3>低库存材料</h3>
        {lowStock.length === 0 ? (
          <p className="muted">暂无低库存材料。</p>
        ) : (
          <ul className="plain-list">
            {lowStock.map((item) => (
              <li key={item.id}>
                {item.name}：剩余 {item.currentQuantity}，提醒线 {item.lowStockThreshold}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
