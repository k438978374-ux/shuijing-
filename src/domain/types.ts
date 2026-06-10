export type MaterialCategory =
  | "crystal"
  | "spacer"
  | "charm"
  | "string"
  | "packaging"
  | "other";

export interface Material {
  id: string;
  name: string;
  category: MaterialCategory;
  specification: string;
  currentQuantity: number;
  remainingTotalCost: number;
  averageUnitCost: number;
  lowStockThreshold: number;
  imageDataUrl: string;
  notes: string;
}

export interface PurchaseRecord {
  id: string;
  materialId: string;
  quantity: number;
  totalCost: number;
  purchaseDate: string;
  notes: string;
}

export interface MaterialLine {
  materialId: string;
  specification?: string;
  quantity: number;
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
