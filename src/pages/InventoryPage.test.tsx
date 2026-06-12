import { render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { InventoryPage } from "./InventoryPage";
import type { AppData } from "../domain/types";

describe("InventoryPage", () => {
  it("filters stock rows by date and catalog fields", async () => {
    const user = userEvent.setup();
    render(<InventoryPage data={dataWithInventory()} />);

    expect(tableBody()).toHaveTextContent("海蓝宝圆珠");
    expect(tableBody()).not.toHaveTextContent("白水晶圆珠");

    await user.clear(screen.getByLabelText("入库日期"));
    await user.type(screen.getByLabelText("入库日期"), "2026-06-11");

    expect(tableBody()).not.toHaveTextContent("海蓝宝圆珠");
    expect(tableBody()).toHaveTextContent("白水晶圆珠");

    await user.clear(screen.getByLabelText("入库日期"));
    await user.selectOptions(screen.getByLabelText("筛选大类"), "g1");

    expect(tableBody()).toHaveTextContent("海蓝宝圆珠");
    expect(tableBody()).not.toHaveTextContent("白水晶圆珠");

    await user.selectOptions(screen.getByLabelText("筛选大类"), "");
    await user.selectOptions(screen.getByLabelText("筛选颜色"), "c2");

    expect(tableBody()).not.toHaveTextContent("海蓝宝圆珠");
    expect(tableBody()).toHaveTextContent("白水晶圆珠");
  });

  it("sorts inventory rows by current quantity", async () => {
    const user = userEvent.setup();
    render(<InventoryPage data={dataWithInventory()} />);

    await user.clear(screen.getByLabelText("入库日期"));
    await user.selectOptions(screen.getByLabelText("排序"), "currentQuantity-desc");

    const rows = screen.getAllByRole("row").slice(1);
    expect(within(rows[0]).getByText("白水晶圆珠")).toBeInTheDocument();
    expect(within(rows[1]).getByText("海蓝宝圆珠")).toBeInTheDocument();
  });

  it("exports filtered inventory rows", async () => {
    const user = userEvent.setup();
    const originalCreateObjectUrl = URL.createObjectURL;
    const originalRevokeObjectUrl = URL.revokeObjectURL;
    const originalClick = HTMLAnchorElement.prototype.click;
    URL.createObjectURL = vi.fn(() => "blob:inventory");
    URL.revokeObjectURL = vi.fn();
    HTMLAnchorElement.prototype.click = vi.fn();

    render(<InventoryPage data={dataWithInventory()} />);

    await user.selectOptions(screen.getByLabelText("筛选颜色"), "c1");
    await user.click(screen.getByRole("button", { name: "导出 Excel" }));

    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);

    URL.createObjectURL = originalCreateObjectUrl;
    URL.revokeObjectURL = originalRevokeObjectUrl;
    HTMLAnchorElement.prototype.click = originalClick;
  });
});

function dataWithInventory(): AppData {
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
      },
      {
        id: "m2",
        name: "白水晶圆珠",
        groupId: "g2",
        subtypeId: "s2",
        colorId: "c2",
        lowStockThreshold: 10,
        imageDataUrl: "",
        notes: "",
        isActive: true
      }
    ],
    materialGroups: [
      { id: "g1", code: "HLB", name: "海蓝宝", isActive: true },
      { id: "g2", code: "BSJ", name: "白水晶", isActive: true }
    ],
    materialSubtypes: [
      { id: "s1", groupId: "g1", code: "TT", name: "透体款", isActive: true },
      { id: "s2", groupId: "g2", code: "BYL", name: "白幽灵", isActive: true }
    ],
    materialColors: [
      { id: "c1", code: "BLUE", name: "天空蓝", isActive: true },
      { id: "c2", code: "CLEAR", name: "透明", isActive: true }
    ],
    materialStocks: [
      {
        id: "stock-m1",
        materialId: "m1",
        specification: "10.7mm",
        currentQuantity: 5,
        remainingTotalCost: 20,
        averageUnitCost: 4
      },
      {
        id: "stock-m2",
        materialId: "m2",
        specification: "8mm",
        currentQuantity: 12,
        remainingTotalCost: 30,
        averageUnitCost: 2.5
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
      },
      {
        id: "batch-m2",
        purchaseId: "purchase-m2",
        materialId: "m2",
        specification: "8mm",
        originalQuantity: 12,
        currentQuantity: 12,
        totalCost: 30,
        remainingTotalCost: 30,
        unitCost: 2.5,
        purchaseDate: "2026-06-11",
        notes: ""
      }
    ],
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

function tableBody() {
  return screen.getAllByRole("rowgroup")[1];
}
