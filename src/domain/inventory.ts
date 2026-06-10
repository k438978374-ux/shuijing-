import {
  calculateAverageUnitCost,
  calculateFinishedUnitCost,
  calculateSaleProfit,
  roundMoney
} from "./calculations";
import type {
  AppData,
  FinishedGoodBatch,
  MaterialLine,
  MaterialStock,
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
  if (!input.specification || input.quantity <= 0 || input.totalCost <= 0) {
    throw new Error("进货数量和总成本必须大于 0");
  }

  if (!data.materials.some((material) => material.id === input.materialId)) {
    throw new Error("找不到对应材料");
  }

  const existingStock = data.materialStocks.find(
    (stock) =>
      stock.materialId === input.materialId && stock.specification === input.specification
  );
  const materialStocks = existingStock
    ? data.materialStocks.map((stock) => {
        if (stock.id !== existingStock.id) {
          return stock;
        }
        const currentQuantity = stock.currentQuantity + input.quantity;
        const remainingTotalCost = roundMoney(stock.remainingTotalCost + input.totalCost);
        return {
          ...stock,
          currentQuantity,
          remainingTotalCost,
          averageUnitCost: calculateAverageUnitCost(
            stock.currentQuantity,
            stock.remainingTotalCost,
            input.quantity,
            input.totalCost
          )
        };
      })
    : [
        ...data.materialStocks,
        {
          id: createId("stock"),
          materialId: input.materialId,
          specification: input.specification,
          currentQuantity: input.quantity,
          remainingTotalCost: roundMoney(input.totalCost),
          averageUnitCost: input.totalCost / input.quantity
        }
      ];

  return {
    ...data,
    materialStocks,
    purchases: [...data.purchases, { id: createId("purchase"), ...input }]
  };
}

export function calculateRecipeMaterialCost(
  data: AppData,
  materialLines: MaterialLine[]
): number {
  return roundMoney(
    materialLines.reduce((sum, line) => {
      const stock = findMaterialStock(data, line);
      return sum + stock.averageUnitCost * line.quantity;
    }, 0)
  );
}

export function applyProduction(data: AppData, input: ProductionInput): AppData {
  if (input.quantityMade <= 0) {
    throw new Error("制作数量必须大于 0");
  }

  for (const line of input.materialLines) {
    const material = data.materials.find((item) => item.id === line.materialId);
    const stock = findMaterialStock(data, line);
    const requiredQuantity = line.quantity * input.quantityMade;
    if (stock.currentQuantity < requiredQuantity) {
      throw new Error(`材料库存不足：${material?.name ?? "未知材料"}`);
    }
  }

  const materialCostPerUnit = calculateRecipeMaterialCost(data, input.materialLines);
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

  const materialStocks = data.materialStocks.map((stock) => {
    const line = input.materialLines.find(
      (item) =>
        item.materialId === stock.materialId && item.specification === stock.specification
    );
    if (!line) {
      return stock;
    }
    const usedQuantity = line.quantity * input.quantityMade;
    const usedCost = roundMoney(stock.averageUnitCost * usedQuantity);
    const currentQuantity = stock.currentQuantity - usedQuantity;
    const remainingTotalCost = roundMoney(Math.max(0, stock.remainingTotalCost - usedCost));
    return {
      ...stock,
      currentQuantity,
      remainingTotalCost,
      averageUnitCost: currentQuantity > 0 ? remainingTotalCost / currentQuantity : 0
    };
  });

  return {
    ...data,
    materialStocks,
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

function findMaterialStock(data: AppData, line: MaterialLine): MaterialStock {
  const stock = data.materialStocks.find(
    (item) =>
      item.materialId === line.materialId && item.specification === line.specification
  );
  if (!stock) {
    const material = data.materials.find((item) => item.id === line.materialId);
    throw new Error(`材料库存不足：${material?.name ?? "未知材料"}`);
  }
  return stock;
}
