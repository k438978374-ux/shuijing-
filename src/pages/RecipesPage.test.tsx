import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RecipesPage } from "./RecipesPage";
import type { AppData } from "../domain/types";

describe("RecipesPage", () => {
  it("lets recipe material lines choose an active stocked material size", async () => {
    const user = userEvent.setup();
    const setData = vi.fn();

    render(<RecipesPage data={dataWithSizedMaterial()} setData={setData} />);

    await user.click(screen.getByRole("button", { name: "+ 新配方" }));
    await user.type(screen.getByLabelText("款式名称"), "粉晶款");
    await user.type(screen.getByLabelText("手尾尺寸/cm"), "15.5");
    await user.click(screen.getByRole("button", { name: "添加材料" }));

    expect(screen.getByLabelText("材料")).toHaveDisplayValue("粉晶 / 透体款");
    expect(screen.getByLabelText("规格")).toHaveDisplayValue("6mm");
    await user.selectOptions(screen.getByLabelText("规格"), "8mm");
    await user.click(screen.getByRole("button", { name: "保存配方" }));

    const updater = setData.mock.calls[0][0] as (data: AppData) => AppData;
    const next = updater(dataWithSizedMaterial());

    expect(next.recipes[0].materialLines[0]).toMatchObject({
      materialId: "m1",
      specification: "8mm",
      quantity: 1
    });
    expect(next.recipes[0].wristSizeCm).toBe("15.5");
  });

  it("shows recipe wrist size in the recipe table", () => {
    render(
      <RecipesPage
        data={{
          ...dataWithSizedMaterial(),
          recipes: [
            {
              id: "r1",
              name: "粉晶款",
              wristSizeCm: "15.5",
              materialLines: [{ materialId: "m1", specification: "8mm", quantity: 1 }],
              packagingCostPerUnit: 3,
              laborCostPerUnit: 8,
              suggestedSalePrice: 68,
              imageDataUrl: "",
              notes: ""
            }
          ]
        }}
        setData={vi.fn()}
      />
    );

    expect(screen.getByText("15.5cm")).toBeInTheDocument();
  });

  it("shows active unstocked materials in recipe options but hides inactive materials", async () => {
    const user = userEvent.setup();

    render(<RecipesPage data={dataWithInactiveAndUnstockedMaterials()} setData={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "+ 新配方" }));
    await user.click(screen.getByRole("button", { name: "添加材料" }));

    expect(screen.getByLabelText("材料")).toHaveDisplayValue("海蓝宝 / 天空蓝透体款");
    expect(screen.getByText("白水晶 / 白幽灵")).toBeInTheDocument();
    expect(screen.queryByText("海蓝宝 / 天空蓝特价款")).not.toBeInTheDocument();
  });
});

function dataWithSizedMaterial(): AppData {
  return {
    materials: [
      {
        id: "m1",
        name: "粉晶",
        subtype: "透体款",
        category: "crystal",
        lowStockThreshold: 10,
        imageDataUrl: "",
        notes: "",
        isActive: true
      }
    ],
    materialStocks: [
      {
        id: "stock-6",
        materialId: "m1",
        specification: "6mm",
        currentQuantity: 50,
        remainingTotalCost: 25,
        averageUnitCost: 0.5
      },
      {
        id: "stock-8",
        materialId: "m1",
        specification: "8mm",
        currentQuantity: 50,
        remainingTotalCost: 25,
        averageUnitCost: 0.5
      }
    ],
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

function dataWithInactiveAndUnstockedMaterials(): AppData {
  return {
    ...dataWithSizedMaterial(),
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
      },
      {
        id: "m2",
        name: "海蓝宝",
        subtype: "天空蓝特价款",
        category: "crystal",
        lowStockThreshold: 10,
        imageDataUrl: "",
        notes: "",
        isActive: false
      },
      {
        id: "m3",
        name: "白水晶",
        subtype: "白幽灵",
        category: "crystal",
        lowStockThreshold: 10,
        imageDataUrl: "",
        notes: "",
        isActive: true
      }
    ],
    materialStocks: [
      {
        id: "stock-m1",
        materialId: "m1",
        specification: "8mm",
        currentQuantity: 20,
        remainingTotalCost: 30,
        averageUnitCost: 1.5
      }
    ]
  };
}
