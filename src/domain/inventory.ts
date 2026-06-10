import {
  calculateAverageUnitCost,
  calculateFinishedUnitCost,
  calculateSaleProfit,
  roundMoney
} from "./calculations";
import type {
  AppData,
  FinishedGoodBatch,
  Material,
  MaterialLine,
  ProductionRecord,
  PurchaseRecord,
  SaleRecord
} from "./types";

type PurchaseInput = Omit<PurchaseRecord, "id">;

type ProductionInput = Omit<
  ProductionRecord,
  "id" | "materialCostPerUnit" | "finishedUnitCost"
>;

type SaleInput = Pick<
  SaleRecord,
  | "finishedGoodBatchId"
  | "saleDate"
  | "quantitySold"
  | "salePricePerUnit"
  | "channelNote"
  | "imageDataUrl"
  | "notes"
>;

export function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function applyPurchase(data: AppData, input: PurchaseInput): AppData {
  if (input.quantity <= 0 || input.totalCost <= 0) {
    throw new Error("进货数量和总成本必须大于 0");
  }

  const materials = data.materials.map((material) => {
    if (material.id !== input.materialId) {
      return material;
    }
    const currentQuantity = material.currentQuantity + input.quantity;
    const remainingTotalCost = roundMoney(material.remainingTotalCost + input.totalCost);
    return {
      ...material,
      currentQuantity,
      remainingTotalCost,
      averageUnitCost: calculateAverageUnitCost(
        material.currentQuantity,
        material.remainingTotalCost,
        input.quantity,
        input.totalCost
      )
    };
  });

  if (!materials.some((material) => material.id === input.materialId)) {
    throw new Error("找不到对应材料");
  }

  return {
    ...data,
    materials,
    purchases: [...data.purchases, { id: createId("purchase"), ...input }]
  };
}

export function calculateRecipeMaterialCost(
  materials: Material[],
  materialLines: MaterialLine[]
): number {
  return roundMoney(
    materialLines.reduce((sum, line) => {
      const material = findMaterial(materials, line.materialId);
      return sum + material.averageUnitCost * line.quantity;
    }, 0)
  );
}

export function applyProduction(data: AppData, input: ProductionInput): AppData {
  if (input.quantityMade <= 0) {
    throw new Error("制作数量必须大于 0");
  }

  for (const line of input.materialLines) {
    const material = findMaterial(data.materials, line.materialId);
    const requiredQuantity = line.quantity * input.quantityMade;
    if (material.currentQuantity < requiredQuantity) {
      throw new Error(`材料库存不足：${material.name}`);
    }
  }

  const materialCostPerUnit = calculateRecipeMaterialCost(
    data.materials,
    input.materialLines
  );
  const finishedUnitCost = calculateFinishedUnitCost(
    materialCostPerUnit,
    input.packagingCostPerUnit,
    input.laborCostPerUnit
  );
  const productionRecord: ProductionRecord = {
    id: createId("production"),
    ...input,
    materialCostPerUnit,
    finishedUnitCost
  };
  const finishedBatch: FinishedGoodBatch = {
    id: createId("batch"),
    productionRecordId: productionRecord.id,
    recipeId: input.recipeId,
    styleName: input.styleName || input.customName,
    quantityMade: input.quantityMade,
    quantityRemaining: input.quantityMade,
    unitCost: finishedUnitCost,
    productionDate: input.productionDate,
    imageDataUrl: input.imageDataUrl,
    notes: input.notes
  };

  const materials = data.materials.map((material) => {
    const line = input.materialLines.find((item) => item.materialId === material.id);
    if (!line) {
      return material;
    }
    const usedQuantity = line.quantity * input.quantityMade;
    const usedCost = roundMoney(material.averageUnitCost * usedQuantity);
    const currentQuantity = material.currentQuantity - usedQuantity;
    const remainingTotalCost = roundMoney(Math.max(0, material.remainingTotalCost - usedCost));
    return {
      ...material,
      currentQuantity,
      remainingTotalCost,
      averageUnitCost: currentQuantity > 0 ? remainingTotalCost / currentQuantity : 0
    };
  });

  return {
    ...data,
    materials,
    productions: [...data.productions, productionRecord],
    finishedGoods: [...data.finishedGoods, finishedBatch]
  };
}

export function applySale(data: AppData, input: SaleInput): AppData {
  if (input.quantitySold <= 0 || input.salePricePerUnit <= 0) {
    throw new Error("销售数量和售价必须大于 0");
  }

  const batch = data.finishedGoods.find((item) => item.id === input.finishedGoodBatchId);
  if (!batch) {
    throw new Error("找不到对应成品批次");
  }
  if (batch.quantityRemaining < input.quantitySold) {
    throw new Error(`成品库存不足：${batch.styleName}`);
  }

  const profit = calculateSaleProfit(
    input.quantitySold,
    input.salePricePerUnit,
    batch.unitCost
  );
  const sale: SaleRecord = {
    id: createId("sale"),
    saleDate: input.saleDate,
    finishedGoodBatchId: input.finishedGoodBatchId,
    styleName: batch.styleName,
    quantitySold: input.quantitySold,
    salePricePerUnit: input.salePricePerUnit,
    unitCost: batch.unitCost,
    channelNote: input.channelNote,
    imageDataUrl: input.imageDataUrl,
    notes: input.notes,
    ...profit
  };

  return {
    ...data,
    finishedGoods: data.finishedGoods.map((item) =>
      item.id === input.finishedGoodBatchId
        ? { ...item, quantityRemaining: item.quantityRemaining - input.quantitySold }
        : item
    ),
    sales: [...data.sales, sale]
  };
}

function findMaterial(materials: Material[], materialId: string): Material {
  const material = materials.find((item) => item.id === materialId);
  if (!material) {
    throw new Error("找不到对应材料");
  }
  return material;
}
