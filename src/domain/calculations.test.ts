import { describe, expect, it } from "vitest";
import {
  calculateAverageUnitCost,
  calculateFinishedUnitCost,
  calculateSaleProfit,
  summarizeByMonth,
  summarizeByStyle
} from "./calculations";
import type { SaleRecord } from "./types";

describe("calculations", () => {
  it("updates weighted average unit cost after a purchase", () => {
    expect(calculateAverageUnitCost(100, 50, 100, 70)).toBeCloseTo(0.6);
  });

  it("calculates finished unit cost with material, packaging, and labor", () => {
    expect(calculateFinishedUnitCost(18.5, 3, 8)).toBeCloseTo(29.5);
  });

  it("calculates sale profit and margin", () => {
    expect(calculateSaleProfit(2, 68, 29.5)).toEqual({
      totalRevenue: 136,
      totalCost: 59,
      profit: 77,
      profitMargin: 77 / 136
    });
  });

  it("summarizes sales by style", () => {
    const sales: SaleRecord[] = [
      makeSale("s1", "粉晶款", "2026-06-01", 1, 68, 30),
      makeSale("s2", "粉晶款", "2026-06-02", 2, 70, 31),
      makeSale("s3", "草莓晶款", "2026-06-03", 1, 88, 40)
    ];

    expect(summarizeByStyle(sales)).toEqual([
      {
        key: "粉晶款",
        quantitySold: 3,
        totalRevenue: 208,
        totalCost: 92,
        totalProfit: 116,
        averageProfitMargin: 116 / 208
      },
      {
        key: "草莓晶款",
        quantitySold: 1,
        totalRevenue: 88,
        totalCost: 40,
        totalProfit: 48,
        averageProfitMargin: 48 / 88
      }
    ]);
  });

  it("summarizes sales by month", () => {
    const sales: SaleRecord[] = [
      makeSale("s1", "粉晶款", "2026-06-01", 1, 68, 30),
      makeSale("s2", "粉晶款", "2026-06-20", 1, 70, 31),
      makeSale("s3", "粉晶款", "2026-07-01", 1, 88, 40)
    ];

    expect(summarizeByMonth(sales)).toEqual([
      {
        key: "2026-06",
        quantitySold: 2,
        totalRevenue: 138,
        totalCost: 61,
        totalProfit: 77,
        averageProfitMargin: 77 / 138
      },
      {
        key: "2026-07",
        quantitySold: 1,
        totalRevenue: 88,
        totalCost: 40,
        totalProfit: 48,
        averageProfitMargin: 48 / 88
      }
    ]);
  });
});

function makeSale(
  id: string,
  styleName: string,
  saleDate: string,
  quantitySold: number,
  salePricePerUnit: number,
  unitCost: number
): SaleRecord {
  const totalRevenue = quantitySold * salePricePerUnit;
  const totalCost = quantitySold * unitCost;
  const profit = totalRevenue - totalCost;
  return {
    id,
    saleDate,
    finishedGoodBatchId: "batch-1",
    styleName,
    quantitySold,
    salePricePerUnit,
    totalRevenue,
    unitCost,
    totalCost,
    profit,
    profitMargin: profit / totalRevenue,
    channelNote: "",
    imageDataUrl: "",
    notes: ""
  };
}
