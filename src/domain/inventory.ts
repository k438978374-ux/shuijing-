import {
  calculateAverageUnitCost,
  calculateFinishedUnitCost,
  calculateSaleProfit,
  roundMoney
} from "./calculations";
import { formatMaterialName as formatCatalogMaterialName } from "./materialCatalog";
import type {
  AuditAction,
  AppData,
  FinishedGoodBatch,
  InventoryAdjustmentRecord,
  MaterialBatch,
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
> & {
  allowNegativeStock?: boolean;
};

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

type ProtectedInput = {
  employeeName: string;
  reason: string;
  password: string;
};

type InventoryAdjustmentInput = ProtectedInput & {
  batchId: string;
  newQuantity: number;
};

type MaterialStatusInput = ProtectedInput & {
  materialId: string;
  isActive: boolean;
};

const PROTECTED_PASSWORD = "750829";

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

  const purchaseId = createId("purchase");
  const purchase = { id: purchaseId, ...input };
  const batch: MaterialBatch = {
    id: createId("batch"),
    purchaseId,
    materialId: input.materialId,
    specification: input.specification,
    originalQuantity: input.quantity,
    currentQuantity: input.quantity,
    totalCost: roundMoney(input.totalCost),
    remainingTotalCost: roundMoney(input.totalCost),
    unitCost: input.totalCost / input.quantity,
    purchaseDate: input.purchaseDate,
    notes: input.notes
  };

  const existingStock = data.materialStocks.find(
    (stock) => stock.materialId === input.materialId && stock.specification === input.specification
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
    materialBatches: [...(data.materialBatches ?? []), batch],
    purchases: [...data.purchases, purchase]
  };
}

export function calculateRecipeMaterialCost(data: AppData, materialLines: MaterialLine[]): number {
  return roundMoney(
    materialLines.reduce((sum, line) => sum + calculateLineCost(data, line, line.quantity), 0)
  );
}

export function getProductionShortages(
  data: AppData,
  input: Pick<ProductionInput, "materialLines" | "quantityMade">
): string[] {
  return input.materialLines
    .map((line) => {
      const requiredQuantity = line.quantity * input.quantityMade;
      const stock = findMaterialStockOrUndefined(data, line);
      const currentQuantity = stock?.currentQuantity ?? 0;

      if (currentQuantity >= requiredQuantity) {
        return "";
      }

      const material = data.materials.find((item) => item.id === line.materialId);
      const specification = line.specification ? ` ${line.specification}` : "";
      return `${formatMaterialName(data, material)}${specification} 库存不够，当前 ${currentQuantity}，需要 ${requiredQuantity}`;
    })
    .filter(Boolean);
}

export function applyProduction(data: AppData, input: ProductionInput): AppData {
  if (input.quantityMade <= 0) {
    throw new Error("制作数量必须大于 0");
  }

  const { allowNegativeStock: _allowNegativeStock, ...productionInput } = input;
  const shortages = getProductionShortages(data, input);
  if (shortages.length > 0 && !input.allowNegativeStock) {
    throw new Error(shortages.join("；"));
  }

  const materialCostPerUnit = calculateRecipeMaterialCost(data, input.materialLines);
  const finishedUnitCost = calculateFinishedUnitCost(
    materialCostPerUnit,
    input.packagingCostPerUnit,
    input.laborCostPerUnit
  );

  const productionRecord: ProductionRecord = {
    id: createId("production"),
    ...productionInput,
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

  const materialBatches = deductBatches(data, input.materialLines, input.quantityMade);
  const materialStocks = applyProductionStockDeltas(data, input.materialLines, input.quantityMade);

  return {
    ...data,
    materialBatches,
    materialStocks,
    productions: [...data.productions, productionRecord],
    finishedGoods: [...data.finishedGoods, finishedBatch]
  };
}

export function applyInventoryAdjustment(data: AppData, input: InventoryAdjustmentInput): AppData {
  assertProtectedInput(input);

  if (input.newQuantity < 0) {
    throw new Error("库存数量不能小于 0");
  }

  const batch = (data.materialBatches ?? []).find((item) => item.id === input.batchId);
  if (!batch) {
    throw new Error("找不到对应批次");
  }

  const previousQuantity = batch.currentQuantity;
  const newTotalCost = roundMoney(input.newQuantity * batch.unitCost);
  const adjustment: InventoryAdjustmentRecord = {
    id: createId("adjustment"),
    batchId: batch.id,
    materialId: batch.materialId,
    specification: batch.specification,
    previousQuantity,
    newQuantity: input.newQuantity,
    quantityChange: input.newQuantity - previousQuantity,
    previousTotalCost: batch.remainingTotalCost,
    newTotalCost,
    employeeName: input.employeeName.trim(),
    reason: input.reason.trim(),
    adjustedAt: new Date().toISOString()
  };

  const materialBatches = (data.materialBatches ?? []).map((item) =>
    item.id === batch.id ? { ...item, currentQuantity: input.newQuantity, remainingTotalCost: newTotalCost } : item
  );

  return {
    ...data,
    materialBatches,
    materialStocks: recalculateStocksFromBatches(data.materialStocks, materialBatches),
    inventoryAdjustments: [...(data.inventoryAdjustments ?? []), adjustment],
    auditLogs: [
      ...(data.auditLogs ?? []),
      createAuditLog("inventory_adjustment", batch.id, input, `库存从 ${previousQuantity} 调整为 ${input.newQuantity}`)
    ]
  };
}

export function applyMaterialStatusChange(data: AppData, input: MaterialStatusInput): AppData {
  assertProtectedInput(input);

  const material = data.materials.find((item) => item.id === input.materialId);
  if (!material) {
    throw new Error("找不到对应材料");
  }

  const action: AuditAction = input.isActive ? "material_reactivated" : "material_deactivated";

  return {
    ...data,
    materials: data.materials.map((item) =>
      item.id === input.materialId ? { ...item, isActive: input.isActive } : item
    ),
    auditLogs: [
      ...(data.auditLogs ?? []),
      createAuditLog(action, input.materialId, input, `${material.name} ${input.isActive ? "恢复" : "停用"}`)
    ]
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

  const profit = calculateSaleProfit(input.quantitySold, input.salePricePerUnit, batch.unitCost);
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

function findMaterialStockOrUndefined(data: AppData, line: MaterialLine): MaterialStock | undefined {
  return data.materialStocks.find(
    (item) => item.materialId === line.materialId && item.specification === line.specification
  );
}

function assertProtectedInput(input: ProtectedInput) {
  if (input.password !== PROTECTED_PASSWORD) {
    throw new Error("密码不正确");
  }
  if (!input.employeeName.trim()) {
    throw new Error("请选择或填写员工");
  }
  if (!input.reason.trim()) {
    throw new Error("请填写原因");
  }
}

function createAuditLog(action: AuditAction, targetId: string, input: ProtectedInput, details: string) {
  return {
    id: createId("audit"),
    action,
    targetId,
    employeeName: input.employeeName.trim(),
    reason: input.reason.trim(),
    createdAt: new Date().toISOString(),
    details
  };
}

function calculateLineCost(data: AppData, line: MaterialLine, requiredQuantity: number) {
  const batches = getAvailableBatches(data, line);

  if (batches.length === 0) {
    const stock = findMaterialStockOrUndefined(data, line);
    return (stock?.averageUnitCost ?? 0) * requiredQuantity;
  }

  let remaining = requiredQuantity;
  let cost = 0;

  for (const batch of batches) {
    const usedQuantity = Math.min(batch.currentQuantity, remaining);
    cost += usedQuantity * batch.unitCost;
    remaining -= usedQuantity;
    if (remaining <= 0) {
      break;
    }
  }

  const stock = findMaterialStockOrUndefined(data, line);
  return cost + remaining * (stock?.averageUnitCost ?? 0);
}

function deductBatches(data: AppData, materialLines: MaterialLine[], quantityMade: number): MaterialBatch[] {
  const nextBatches = [...(data.materialBatches ?? [])];

  for (const line of materialLines) {
    let remaining = line.quantity * quantityMade;
    const indexes = getAvailableBatchIndexes(nextBatches, line);

    for (const index of indexes) {
      const batch = nextBatches[index];
      const usedQuantity = Math.min(batch.currentQuantity, remaining);
      const currentQuantity = batch.currentQuantity - usedQuantity;

      nextBatches[index] = {
        ...batch,
        currentQuantity,
        remainingTotalCost: roundMoney(currentQuantity * batch.unitCost)
      };

      remaining -= usedQuantity;
      if (remaining <= 0) {
        break;
      }
    }
  }

  return nextBatches;
}

function applyProductionStockDeltas(
  data: AppData,
  materialLines: MaterialLine[],
  quantityMade: number
): MaterialStock[] {
  let materialStocks = [...data.materialStocks];

  for (const line of materialLines) {
    const requiredQuantity = line.quantity * quantityMade;
    const existingStock = materialStocks.find(
      (stock) => stock.materialId === line.materialId && stock.specification === line.specification
    );

    if (existingStock) {
      materialStocks = materialStocks.map((stock) => {
        if (stock.id !== existingStock.id) {
          return stock;
        }

        const currentQuantity = stock.currentQuantity - requiredQuantity;
        return {
          ...stock,
          currentQuantity,
          remainingTotalCost: roundMoney(currentQuantity * stock.averageUnitCost)
        };
      });
    } else {
      materialStocks = [
        ...materialStocks,
        {
          id: createId("stock"),
          materialId: line.materialId,
          specification: line.specification ?? "",
          currentQuantity: -requiredQuantity,
          remainingTotalCost: 0,
          averageUnitCost: 0
        }
      ];
    }
  }

  return materialStocks;
}

function getAvailableBatches(data: AppData, line: MaterialLine): MaterialBatch[] {
  return (data.materialBatches ?? [])
    .filter(
      (batch) =>
        batch.currentQuantity > 0 &&
        batch.materialId === line.materialId &&
        batch.specification === line.specification &&
        (!line.batchId || batch.id === line.batchId)
    )
    .sort((a, b) => a.purchaseDate.localeCompare(b.purchaseDate));
}

function getAvailableBatchIndexes(batches: MaterialBatch[], line: MaterialLine): number[] {
  return batches
    .map((batch, index) => ({ batch, index }))
    .filter(
      ({ batch }) =>
        batch.currentQuantity > 0 &&
        batch.materialId === line.materialId &&
        batch.specification === line.specification &&
        (!line.batchId || batch.id === line.batchId)
    )
    .sort((a, b) => a.batch.purchaseDate.localeCompare(b.batch.purchaseDate))
    .map((item) => item.index);
}

function recalculateStocksFromBatches(
  existingStocks: MaterialStock[],
  materialBatches: MaterialBatch[]
): MaterialStock[] {
  return existingStocks.map((stock) => {
    const batches = materialBatches.filter(
      (batch) => batch.materialId === stock.materialId && batch.specification === stock.specification
    );

    if (batches.length === 0) {
      return stock;
    }

    const currentQuantity = batches.reduce((sum, batch) => sum + batch.currentQuantity, 0);
    const remainingTotalCost = roundMoney(
      batches.reduce((sum, batch) => sum + batch.remainingTotalCost, 0)
    );

    return {
      ...stock,
      currentQuantity,
      remainingTotalCost,
      averageUnitCost: currentQuantity > 0 ? remainingTotalCost / currentQuantity : stock.averageUnitCost
    };
  });
}

function formatMaterialName(data: AppData, material: AppData["materials"][number] | undefined): string {
  return formatCatalogMaterialName(material, data);
}
