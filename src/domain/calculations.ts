import type { SaleRecord, SummaryRow } from "./types";

export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateAverageUnitCost(
  oldQuantity: number,
  oldRemainingTotalCost: number,
  purchaseQuantity: number,
  purchaseTotalCost: number
): number {
  const totalQuantity = oldQuantity + purchaseQuantity;
  if (totalQuantity <= 0) {
    return 0;
  }
  return (oldRemainingTotalCost + purchaseTotalCost) / totalQuantity;
}

export function calculateFinishedUnitCost(
  materialCostPerUnit: number,
  packagingCostPerUnit: number,
  laborCostPerUnit: number
): number {
  return roundMoney(materialCostPerUnit + packagingCostPerUnit + laborCostPerUnit);
}

export function calculateSaleProfit(
  quantitySold: number,
  salePricePerUnit: number,
  unitCost: number
) {
  const totalRevenue = roundMoney(quantitySold * salePricePerUnit);
  const totalCost = roundMoney(quantitySold * unitCost);
  const profit = roundMoney(totalRevenue - totalCost);
  return {
    totalRevenue,
    totalCost,
    profit,
    profitMargin: totalRevenue > 0 ? profit / totalRevenue : 0
  };
}

export function summarizeByStyle(sales: SaleRecord[]): SummaryRow[] {
  return summarizeSales(sales, (sale) => sale.styleName);
}

export function summarizeByMonth(sales: SaleRecord[]): SummaryRow[] {
  return summarizeSales(sales, (sale) => sale.saleDate.slice(0, 7));
}

function summarizeSales(
  sales: SaleRecord[],
  keySelector: (sale: SaleRecord) => string
): SummaryRow[] {
  const rows = new Map<string, SummaryRow>();

  for (const sale of sales) {
    const key = keySelector(sale);
    const existing =
      rows.get(key) ??
      {
        key,
        quantitySold: 0,
        totalRevenue: 0,
        totalCost: 0,
        totalProfit: 0,
        averageProfitMargin: 0
      };

    existing.quantitySold += sale.quantitySold;
    existing.totalRevenue = roundMoney(existing.totalRevenue + sale.totalRevenue);
    existing.totalCost = roundMoney(existing.totalCost + sale.totalCost);
    existing.totalProfit = roundMoney(existing.totalProfit + sale.profit);
    existing.averageProfitMargin =
      existing.totalRevenue > 0 ? existing.totalProfit / existing.totalRevenue : 0;
    rows.set(key, existing);
  }

  return Array.from(rows.values());
}
