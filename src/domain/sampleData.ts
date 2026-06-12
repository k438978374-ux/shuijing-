import type { AppData } from "./types";

export function createSampleData(): AppData {
  return {
    materialGroups: [
      { id: "group-rose-quartz", code: "FSJ", name: "粉水晶", isActive: true },
      { id: "group-spacer", code: "GP", name: "隔片", isActive: true }
    ],
    materialSubtypes: [
      { id: "subtype-rose-quartz", groupId: "group-rose-quartz", code: "TT", name: "透体款", isActive: true },
      { id: "subtype-spacer", groupId: "group-spacer", code: "JSP", name: "金色款", isActive: true }
    ],
    materialColors: [
      { id: "color-pink", code: "PINK", name: "粉色", isActive: true },
      { id: "color-gold", code: "GOLD", name: "金色", isActive: true }
    ],
    materials: [
      {
        id: "material-rose-quartz",
        name: "粉水晶圆珠",
        groupId: "group-rose-quartz",
        subtypeId: "subtype-rose-quartz",
        colorId: "color-pink",
        category: "crystal",
        lowStockThreshold: 20,
        imageDataUrl: "",
        notes: "示例材料",
        isActive: true
      },
      {
        id: "material-spacer",
        name: "金色隔片",
        groupId: "group-spacer",
        subtypeId: "subtype-spacer",
        colorId: "color-gold",
        category: "spacer",
        lowStockThreshold: 20,
        imageDataUrl: "",
        notes: "示例隔片",
        isActive: true
      }
    ],
    materialStocks: [
      {
        id: "stock-rose-quartz-8mm",
        materialId: "material-rose-quartz",
        specification: "8mm",
        currentQuantity: 100,
        remainingTotalCost: 50,
        averageUnitCost: 0.5
      },
      {
        id: "stock-spacer-4mm",
        materialId: "material-spacer",
        specification: "4mm",
        currentQuantity: 60,
        remainingTotalCost: 18,
        averageUnitCost: 0.3
      }
    ],
    materialBatches: [
      {
        id: "batch-rose-quartz-8mm",
        purchaseId: "sample-purchase-rose-quartz",
        materialId: "material-rose-quartz",
        specification: "8mm",
        originalQuantity: 100,
        currentQuantity: 100,
        totalCost: 50,
        remainingTotalCost: 50,
        unitCost: 0.5,
        purchaseDate: "2026-06-10",
        notes: "示例批次"
      },
      {
        id: "batch-spacer-4mm",
        purchaseId: "sample-purchase-spacer",
        materialId: "material-spacer",
        specification: "4mm",
        originalQuantity: 60,
        currentQuantity: 60,
        totalCost: 18,
        remainingTotalCost: 18,
        unitCost: 0.3,
        purchaseDate: "2026-06-10",
        notes: "示例批次"
      }
    ],
    inventoryAdjustments: [],
    auditLogs: [],
    employees: [{ id: "employee-owner", name: "老板", isActive: true }],
    purchases: [],
    recipes: [
      {
        id: "recipe-rose-bracelet",
        name: "粉水晶温柔款",
        wristSizeCm: "15",
        materialLines: [
          { materialId: "material-rose-quartz", specification: "8mm", quantity: 18 },
          { materialId: "material-spacer", specification: "4mm", quantity: 4 }
        ],
        packagingCostPerUnit: 3,
        laborCostPerUnit: 8,
        suggestedSalePrice: 68,
        imageDataUrl: "",
        notes: "示例款式"
      }
    ],
    productions: [],
    finishedGoods: [],
    sales: []
  };
}
