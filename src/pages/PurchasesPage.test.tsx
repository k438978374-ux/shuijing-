import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PurchasesPage } from "./PurchasesPage";
import type { AppData } from "../domain/types";

describe("PurchasesPage", () => {
  it("chooses one size when recording a purchase and shows material subtype", async () => {
    const user = userEvent.setup();
    const setData = vi.fn();

    render(<PurchasesPage data={dataWithMaterial()} setData={setData} />);

    await user.click(screen.getByRole("button", { name: "+ 入库" }));
    expect(screen.getByLabelText("材料")).toHaveDisplayValue("海蓝宝 / 天空蓝透体款");
    expect(screen.getByLabelText("规格")).toHaveDisplayValue("8mm");
    await user.selectOptions(screen.getByLabelText("规格"), "10mm");
    await user.click(screen.getByRole("button", { name: "保存入库" }));

    const updater = setData.mock.calls[0][0] as (data: AppData) => AppData;
    const next = updater(dataWithMaterial());

    expect(next.purchases[0]).toMatchObject({
      materialId: "m1",
      specification: "10mm",
      quantity: 1,
      totalCost: 1
    });
    expect(next.materialStocks[0]).toMatchObject({
      materialId: "m1",
      specification: "10mm",
      currentQuantity: 1,
      remainingTotalCost: 1,
      averageUnitCost: 1
    });
  });
});

function dataWithMaterial(): AppData {
  return {
    materials: [
      {
        id: "m1",
        name: "海蓝宝",
        subtype: "天空蓝透体款",
        category: "crystal",
        lowStockThreshold: 10,
        imageDataUrl: "",
        notes: "",
        isActive: true
      }
    ],
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
