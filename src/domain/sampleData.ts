import type { AppData } from "./types";

export function createSampleData(): AppData {
  return {
    materials: [
      {
        id: "material-rose-quartz",
        name: "粉晶",
        category: "crystal",
        specification: "8mm",
        currentQuantity: 100,
        remainingTotalCost: 50,
        averageUnitCost: 0.5,
        lowStockThreshold: 20,
        imageDataUrl: "",
        notes: "示例材料"
      },
      {
        id: "material-spacer",
        name: "金色隔片",
        category: "spacer",
        specification: "4mm",
        currentQuantity: 60,
        remainingTotalCost: 18,
        averageUnitCost: 0.3,
        lowStockThreshold: 20,
        imageDataUrl: "",
        notes: "示例隔片"
      }
    ],
    purchases: [],
    recipes: [
      {
        id: "recipe-rose-bracelet",
        name: "粉晶温柔款",
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
