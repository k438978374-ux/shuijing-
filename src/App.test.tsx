import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { App } from "./App";
import { createEmptyData } from "./storage/store";

describe("App navigation", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("expands material sections and lets directory search jump to a section", async () => {
    const user = userEvent.setup();
    localStorage.setItem("crystal-inventory-access", "granted");

    render(<App />);

    expect(screen.getByRole("button", { name: "大类" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "材料" }));
    await user.click(screen.getByRole("button", { name: "材料" }));
    expect(screen.queryByRole("button", { name: "大类" })).not.toBeInTheDocument();

    await user.type(screen.getByLabelText("搜索目录标题"), "颜色");
    await user.click(screen.getByRole("button", { name: "材料 / 颜色" }));

    expect(screen.getByText("颜色目录")).toBeInTheDocument();
    expect(screen.queryByText("材料大类")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "大类" })).toBeInTheDocument();
  });

  it("clears legacy local goods even when an older cleanup marker exists", async () => {
    localStorage.setItem("crystal-inventory-access", "granted");
    localStorage.setItem("crystal-inventory-system:cleared-test-goods-2026-06-12-v2", "done");
    localStorage.setItem(
      "crystal-inventory-system:v1",
      JSON.stringify({
        ...createEmptyData(),
        materials: [
          {
            id: "old-material",
            name: "测试旧货品",
            lowStockThreshold: 10,
            imageDataUrl: "",
            notes: "",
            isActive: false
          }
        ],
        materialStocks: [
          {
            id: "old-stock",
            materialId: "old-material",
            specification: "8mm",
            currentQuantity: 9,
            remainingTotalCost: 18,
            averageUnitCost: 2
          }
        ],
        purchases: [
          {
            id: "old-purchase",
            materialId: "old-material",
            specification: "8mm",
            quantity: 9,
            totalCost: 18,
            purchaseDate: "2026-06-11",
            notes: ""
          }
        ]
      })
    );

    render(<App />);

    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem("crystal-inventory-system:v1") ?? "{}");
      expect(saved.materials).toEqual([]);
      expect(saved.materialStocks).toEqual([]);
      expect(saved.purchases).toEqual([]);
    });
  });
});
