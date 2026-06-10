import { describe, expect, it } from "vitest";
import {
  applyProduction,
  applyPurchase,
  applySale,
  calculateRecipeMaterialCost
} from "./inventory";
import type { AppData, Material } from "./types";

describe("inventory operations", () => {
  it("applies purchase and updates material stock with weighted average cost", () => {
    const data = makeData([makeMaterial("m1", "粉晶", 100, 50)]);
    const next = applyPurchase(data, {
      materialId: "m1",
      quantity: 100,
      totalCost: 70,
      purchaseDate: "2026-06-10",
      notes: ""
    });

    expect(next.materials[0].currentQuantity).toBe(200);
    expect(next.materials[0].remainingTotalCost).toBe(120);
    expect(next.materials[0].averageUnitCost).toBeCloseTo(0.6);
    expect(next.purchases).toHaveLength(1);
  });

  it("calculates recipe material cost from average costs", () => {
    const data = makeData([
      makeMaterial("m1", "粉晶", 100, 50),
      makeMaterial("m2", "隔片", 50, 25)
    ]);

    expect(
      calculateRecipeMaterialCost(data.materials, [
        { materialId: "m1", quantity: 12 },
        { materialId: "m2", quantity: 4 }
      ])
    ).toBeCloseTo(8);
  });

  it("applies production and creates a finished goods batch", () => {
    const data = makeData([
      makeMaterial("m1", "粉晶", 100, 50),
      makeMaterial("m2", "隔片", 50, 25)
    ]);

    const next = applyProduction(data, {
      recipeId: "",
      customName: "粉晶定制",
      styleName: "粉晶定制",
      productionDate: "2026-06-10",
      materialLines: [
        { materialId: "m1", quantity: 12 },
        { materialId: "m2", quantity: 4 }
      ],
      quantityMade: 2,
      packagingCostPerUnit: 3,
      laborCostPerUnit: 8,
      imageDataUrl: "",
      notes: ""
    });

    expect(next.materials.find((item) => item.id === "m1")?.currentQuantity).toBe(76);
    expect(next.materials.find((item) => item.id === "m2")?.currentQuantity).toBe(42);
    expect(next.finishedGoods[0].quantityMade).toBe(2);
    expect(next.finishedGoods[0].quantityRemaining).toBe(2);
    expect(next.finishedGoods[0].unitCost).toBe(19);
  });

  it("rejects production when material stock is insufficient", () => {
    const data = makeData([makeMaterial("m1", "粉晶", 5, 2.5)]);

    expect(() =>
      applyProduction(data, {
        recipeId: "",
        customName: "粉晶定制",
        styleName: "粉晶定制",
        productionDate: "2026-06-10",
        materialLines: [{ materialId: "m1", quantity: 12 }],
        quantityMade: 1,
        packagingCostPerUnit: 3,
        laborCostPerUnit: 8,
        imageDataUrl: "",
        notes: ""
      })
    ).toThrow("材料库存不足：粉晶");
  });

  it("applies sale and calculates profit", () => {
    const data: AppData = {
      ...makeData([]),
      finishedGoods: [
        {
          id: "batch-1",
          productionRecordId: "p1",
          recipeId: "",
          styleName: "粉晶定制",
          quantityMade: 2,
          quantityRemaining: 2,
          unitCost: 19,
          productionDate: "2026-06-10",
          imageDataUrl: "",
          notes: ""
        }
      ]
    };

    const next = applySale(data, {
      finishedGoodBatchId: "batch-1",
      saleDate: "2026-06-11",
      quantitySold: 1,
      salePricePerUnit: 68,
      channelNote: "小红书",
      imageDataUrl: "",
      notes: ""
    });

    expect(next.finishedGoods[0].quantityRemaining).toBe(1);
    expect(next.sales[0].totalRevenue).toBe(68);
    expect(next.sales[0].totalCost).toBe(19);
    expect(next.sales[0].profit).toBe(49);
  });
});

function makeMaterial(
  id: string,
  name: string,
  currentQuantity: number,
  remainingTotalCost: number
): Material {
  return {
    id,
    name,
    category: "crystal",
    specification: "8mm",
    currentQuantity,
    remainingTotalCost,
    averageUnitCost: remainingTotalCost / currentQuantity,
    lowStockThreshold: 10,
    imageDataUrl: "",
    notes: ""
  };
}

function makeData(materials: Material[]): AppData {
  return {
    materials,
    purchases: [],
    recipes: [],
    productions: [],
    finishedGoods: [],
    sales: []
  };
}
