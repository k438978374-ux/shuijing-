import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PurchasesPage } from "./PurchasesPage";
import type { AppData } from "../domain/types";

describe("PurchasesPage", () => {
  it("records a manually typed purchase size", async () => {
    const user = userEvent.setup();
    const setData = vi.fn();

    render(<PurchasesPage data={dataWithMaterial()} setData={setData} />);

    await user.click(screen.getByRole("button", { name: "+ 入库" }));
    expect(screen.getByLabelText("货品")).toHaveDisplayValue("海蓝宝 / 透体款 / 天空蓝 / 海蓝宝圆珠");
    expect(screen.getByLabelText("尺寸/mm")).toHaveValue("8");
    await user.clear(screen.getByLabelText("尺寸/mm"));
    await user.type(screen.getByLabelText("尺寸/mm"), "10.7");
    await user.click(screen.getByRole("button", { name: "保存入库" }));

    const updater = setData.mock.calls[0][0] as (data: AppData) => AppData;
    const next = updater(dataWithMaterial());

    expect(next.purchases[0]).toMatchObject({
      materialId: "m1",
      specification: "10.7mm",
      quantity: 1,
      totalCost: 1
    });
    expect(next.materialStocks[0]).toMatchObject({
      materialId: "m1",
      specification: "10.7mm",
      currentQuantity: 1,
      remainingTotalCost: 1,
      averageUnitCost: 1
    });
  });

  it("separates purchase batch material catalog columns", () => {
    render(<PurchasesPage data={dataWithBatch()} setData={vi.fn()} />);

    expect(screen.getByText("大类")).toBeInTheDocument();
    expect(screen.getByText("小类")).toBeInTheDocument();
    expect(screen.getByText("颜色")).toBeInTheDocument();
    expect(screen.getByText("货品名称")).toBeInTheDocument();
    expect(screen.getByText("海蓝宝")).toBeInTheDocument();
    expect(screen.getByText("透体款")).toBeInTheDocument();
    expect(screen.getByText("天空蓝")).toBeInTheDocument();
    expect(screen.getByText("海蓝宝圆珠")).toBeInTheDocument();
    expect(screen.getByText("10.7")).toBeInTheDocument();
  });
});

function dataWithMaterial(): AppData {
  return {
    materials: [
      {
        id: "m1",
        name: "海蓝宝圆珠",
        groupId: "g1",
        subtypeId: "s1",
        colorId: "c1",
        lowStockThreshold: 10,
        imageDataUrl: "",
        notes: "",
        isActive: true
      }
    ],
    materialGroups: [{ id: "g1", code: "HLB", name: "海蓝宝", isActive: true }],
    materialSubtypes: [{ id: "s1", groupId: "g1", code: "TT", name: "透体款", isActive: true }],
    materialColors: [{ id: "c1", code: "BLUE", name: "天空蓝", isActive: true }],
    materialStocks: [],
    materialBatches: [],
    inventoryAdjustments: [],
    auditLogs: [],
    employees: [],
    purchases: [],
    recipes: [],
    productions: [],
    finishedGoods: [],
    sales: []
  };
}

function dataWithBatch(): AppData {
  return {
    ...dataWithMaterial(),
    materialStocks: [
      {
        id: "stock-m1",
        materialId: "m1",
        specification: "10.7mm",
        currentQuantity: 5,
        remainingTotalCost: 20,
        averageUnitCost: 4
      }
    ],
    materialBatches: [
      {
        id: "batch-m1",
        purchaseId: "purchase-m1",
        materialId: "m1",
        specification: "10.7mm",
        originalQuantity: 5,
        currentQuantity: 5,
        totalCost: 20,
        remainingTotalCost: 20,
        unitCost: 4,
        purchaseDate: "2026-06-12",
        notes: ""
      }
    ]
  };
}
