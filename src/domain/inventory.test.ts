import { describe, expect, it } from "vitest";
import {
  applyInventoryAdjustment,
  applyMaterialStatusChange,
  applyProduction,
  applyPurchase,
  applySale,
  calculateRecipeMaterialCost
} from "./inventory";
import type { AppData, Material } from "./types";

describe("inventory operations", () => {
  it("applies purchase as a separate material batch instead of merging costs", () => {
    const data = makeData([makeMaterial("m1", "粉晶")], [
      makeStock("m1", "8mm", 100, 50)
    ]);
    const next = applyPurchase(data, {
      materialId: "m1",
      specification: "8mm",
      quantity: 100,
      totalCost: 70,
      purchaseDate: "2026-06-10",
      notes: ""
    });

    expect(next.materialStocks[0].currentQuantity).toBe(200);
    expect(next.materialStocks[0].remainingTotalCost).toBe(120);
    expect(next.materialBatches).toHaveLength(1);
    expect(next.materialBatches[0]).toMatchObject({
      materialId: "m1",
      specification: "8mm",
      originalQuantity: 100,
      currentQuantity: 100,
      totalCost: 70,
      unitCost: 0.7
    });
  });

  it("calculates recipe material cost from FIFO batches", () => {
    const data: AppData = {
      ...makeData([makeMaterial("m1", "粉晶")], [makeStock("m1", "8mm", 150, 120)]),
      materialBatches: [
        makeBatch("b1", "m1", "8mm", 100, 50, "2026-06-01"),
        makeBatch("b2", "m1", "8mm", 50, 70, "2026-06-10")
      ]
    };

    expect(
      calculateRecipeMaterialCost(data, [
        { materialId: "m1", specification: "8mm", quantity: 120 }
      ])
    ).toBe(78);
  });

  it("applies production using FIFO batches and creates a finished goods batch", () => {
    const data: AppData = {
      ...makeData([makeMaterial("m1", "粉晶")], [makeStock("m1", "8mm", 150, 120)]),
      materialBatches: [
        makeBatch("b1", "m1", "8mm", 100, 50, "2026-06-01"),
        makeBatch("b2", "m1", "8mm", 50, 70, "2026-06-10")
      ]
    };

    const next = applyProduction(data, {
      recipeId: "",
      customName: "粉晶定制",
      styleName: "粉晶定制",
      productionDate: "2026-06-11",
      materialLines: [{ materialId: "m1", specification: "8mm", quantity: 120 }],
      quantityMade: 1,
      packagingCostPerUnit: 3,
      laborCostPerUnit: 8,
      imageDataUrl: "",
      notes: ""
    });

    expect(next.materialBatches.find((item) => item.id === "b1")?.currentQuantity).toBe(0);
    expect(next.materialBatches.find((item) => item.id === "b2")?.currentQuantity).toBe(30);
    expect(next.materialStocks[0].currentQuantity).toBe(30);
    expect(next.finishedGoods[0].unitCost).toBe(89);
  });

  it("warns on insufficient production stock and can continue with negative stock", () => {
    const data = makeData([makeMaterial("m1", "粉晶")], [
      makeStock("m1", "8mm", 5, 2.5)
    ]);

    expect(() =>
      applyProduction(data, {
        recipeId: "",
        customName: "粉晶定制",
        styleName: "粉晶定制",
        productionDate: "2026-06-10",
        materialLines: [{ materialId: "m1", specification: "8mm", quantity: 12 }],
        quantityMade: 1,
        packagingCostPerUnit: 3,
        laborCostPerUnit: 8,
        imageDataUrl: "",
        notes: ""
      })
    ).toThrow("粉晶 8mm 库存不够");

    const next = applyProduction(data, {
      recipeId: "",
      customName: "粉晶定制",
      styleName: "粉晶定制",
      productionDate: "2026-06-10",
      materialLines: [{ materialId: "m1", specification: "8mm", quantity: 12 }],
      quantityMade: 1,
      packagingCostPerUnit: 3,
      laborCostPerUnit: 8,
      imageDataUrl: "",
      notes: "",
      allowNegativeStock: true
    });

    expect(next.materialStocks[0].currentQuantity).toBe(-7);
    expect(next.finishedGoods[0].styleName).toBe("粉晶定制");
  });

  it("records inventory adjustments with employee and password verification", () => {
    const data: AppData = {
      ...makeData([makeMaterial("m1", "粉晶")], [makeStock("m1", "8mm", 100, 50)]),
      materialBatches: [makeBatch("b1", "m1", "8mm", 100, 50, "2026-06-01")]
    };

    const next = applyInventoryAdjustment(data, {
      batchId: "b1",
      newQuantity: 90,
      employeeName: "小王",
      reason: "盘点少10颗",
      password: "750829"
    });

    expect(next.materialBatches[0].currentQuantity).toBe(90);
    expect(next.materialStocks[0].currentQuantity).toBe(90);
    expect(next.inventoryAdjustments[0]).toMatchObject({
      batchId: "b1",
      previousQuantity: 100,
      newQuantity: 90,
      quantityChange: -10,
      employeeName: "小王",
      reason: "盘点少10颗"
    });
    expect(next.auditLogs[0]).toMatchObject({
      action: "inventory_adjustment",
      employeeName: "小王"
    });
  });

  it("rejects protected operations with the wrong password", () => {
    const data: AppData = {
      ...makeData([makeMaterial("m1", "粉晶")], [makeStock("m1", "8mm", 100, 50)]),
      materialBatches: [makeBatch("b1", "m1", "8mm", 100, 50, "2026-06-01")]
    };

    expect(() =>
      applyInventoryAdjustment(data, {
        batchId: "b1",
        newQuantity: 90,
        employeeName: "小王",
        reason: "盘点",
        password: "wrong"
      })
    ).toThrow("密码不正确");
  });

  it("soft deletes materials and keeps an audit log", () => {
    const data = makeData([makeMaterial("m1", "粉晶")], []);

    const next = applyMaterialStatusChange(data, {
      materialId: "m1",
      isActive: false,
      employeeName: "小王",
      reason: "不再进货",
      password: "750829"
    });

    expect(next.materials[0].isActive).toBe(false);
    expect(next.auditLogs[0]).toMatchObject({
      action: "material_deactivated",
      employeeName: "小王"
    });
  });

  it("applies sale and calculates profit", () => {
    const data: AppData = {
      ...makeData([], []),
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

function makeMaterial(id: string, name: string): Material {
  return {
    id,
    name,
    category: "crystal",
    lowStockThreshold: 10,
    imageDataUrl: "",
    notes: "",
    isActive: true
  };
}

function makeStock(
  materialId: string,
  specification: string,
  currentQuantity: number,
  remainingTotalCost: number
) {
  return {
    id: `stock-${materialId}-${specification}`,
    materialId,
    specification,
    currentQuantity,
    remainingTotalCost,
    averageUnitCost: remainingTotalCost / currentQuantity
  };
}

function makeData(materials: Material[], materialStocks: ReturnType<typeof makeStock>[]): AppData {
  return {
    materials,
    materialStocks,
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

function makeBatch(
  id: string,
  materialId: string,
  specification: string,
  currentQuantity: number,
  totalCost: number,
  purchaseDate: string
) {
  return {
    id,
    purchaseId: `purchase-${id}`,
    materialId,
    specification,
    originalQuantity: currentQuantity,
    currentQuantity,
    totalCost,
    remainingTotalCost: totalCost,
    unitCost: totalCost / currentQuantity,
    purchaseDate,
    notes: ""
  };
}
