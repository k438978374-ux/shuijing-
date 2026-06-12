export type MaterialCategory =
  | "crystal"
  | "spacer"
  | "charm"
  | "string"
  | "packaging"
  | "other";

export interface MaterialGroup {
  id: string;
  code: string;
  name: string;
  isActive?: boolean;
}

export interface MaterialSubtype {
  id: string;
  groupId: string;
  code: string;
  name: string;
  isActive?: boolean;
}

export interface MaterialColor {
  id: string;
  code: string;
  name: string;
  isActive?: boolean;
}

export interface Material {
  id: string;
  name: string;
  groupId?: string;
  subtypeId?: string;
  colorId?: string;
  subtype?: string;
  category?: MaterialCategory;
  lowStockThreshold: number;
  imageDataUrl: string;
  notes: string;
  isActive?: boolean;
}

export interface MaterialStock {
  id: string;
  materialId: string;
  specification: string;
  currentQuantity: number;
  remainingTotalCost: number;
  averageUnitCost: number;
}

export interface PurchaseRecord {
  id: string;
  materialId: string;
  specification: string;
  quantity: number;
  totalCost: number;
  purchaseDate: string;
  notes: string;
}

export interface MaterialLine {
  materialId: string;
  specification?: string;
  batchId?: string;
  quantity: number;
}

export interface MaterialBatch {
  id: string;
  purchaseId: string;
  materialId: string;
  specification: string;
  originalQuantity: number;
  currentQuantity: number;
  totalCost: number;
  remainingTotalCost: number;
  unitCost: number;
  purchaseDate: string;
  notes: string;
}

export interface Employee {
  id: string;
  name: string;
  isActive: boolean;
}

export interface InventoryAdjustmentRecord {
  id: string;
  batchId: string;
  materialId: string;
  specification: string;
  previousQuantity: number;
  newQuantity: number;
  quantityChange: number;
  previousTotalCost: number;
  newTotalCost: number;
  employeeName: string;
  reason: string;
  adjustedAt: string;
}

export type AuditAction =
  | "inventory_adjustment"
  | "material_deactivated"
  | "material_reactivated";

export interface AuditLog {
  id: string;
  action: AuditAction;
  targetId: string;
  employeeName: string;
  reason: string;
  createdAt: string;
  details: string;
}

export interface Recipe {
  id: string;
  name: string;
  materialLines: MaterialLine[];
  packagingCostPerUnit: number;
  laborCostPerUnit: number;
  suggestedSalePrice: number;
  imageDataUrl: string;
  notes: string;
}

export interface ProductionRecord {
  id: string;
  productionDate: string;
  recipeId: string;
  customName: string;
  styleName: string;
  materialLines: MaterialLine[];
  quantityMade: number;
  packagingCostPerUnit: number;
  laborCostPerUnit: number;
  materialCostPerUnit: number;
  finishedUnitCost: number;
  imageDataUrl: string;
  notes: string;
}

export interface FinishedGoodBatch {
  id: string;
  productionRecordId: string;
  recipeId: string;
  styleName: string;
  quantityMade: number;
  quantityRemaining: number;
  unitCost: number;
  productionDate: string;
  imageDataUrl: string;
  notes: string;
}

export interface SaleRecord {
  id: string;
  saleDate: string;
  finishedGoodBatchId: string;
  styleName: string;
  quantitySold: number;
  salePricePerUnit: number;
  totalRevenue: number;
  unitCost: number;
  totalCost: number;
  profit: number;
  profitMargin: number;
  channelNote: string;
  imageDataUrl: string;
  notes: string;
}

export interface AppData {
  materials: Material[];
  materialGroups?: MaterialGroup[];
  materialSubtypes?: MaterialSubtype[];
  materialColors?: MaterialColor[];
  materialStocks: MaterialStock[];
  materialBatches: MaterialBatch[];
  inventoryAdjustments: InventoryAdjustmentRecord[];
  auditLogs: AuditLog[];
  employees: Employee[];
  purchases: PurchaseRecord[];
  recipes: Recipe[];
  productions: ProductionRecord[];
  finishedGoods: FinishedGoodBatch[];
  sales: SaleRecord[];
}

export interface SummaryRow {
  key: string;
  quantitySold: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  averageProfitMargin: number;
}
