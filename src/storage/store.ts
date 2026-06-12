import type { AppData, Material, MaterialBatch, MaterialColor, MaterialGroup, MaterialSubtype } from "../domain/types";

const STORAGE_KEY = "crystal-inventory-system:v1";

export function createEmptyData(): AppData {
  return {
    materials: [],
    materialGroups: [],
    materialSubtypes: [],
    materialColors: [],
    materialStocks: [],
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

export function loadData(): AppData {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return createEmptyData();
  }

  try {
    return normalizeData({ ...createEmptyData(), ...JSON.parse(raw) });
  } catch {
    return createEmptyData();
  }
}

export function saveData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function normalizeData(data: AppData): AppData {
  const normalizedCatalog = normalizeCatalog(
    data.materials,
    data.materialGroups ?? [],
    data.materialSubtypes ?? [],
    data.materialColors ?? []
  );
  const materialBatches =
    data.materialBatches.length > 0 ? data.materialBatches : createHistoricalBatches(data);

  return {
    ...data,
    materials: normalizedCatalog.materials,
    materialGroups: normalizedCatalog.materialGroups,
    materialSubtypes: normalizedCatalog.materialSubtypes,
    materialColors: normalizedCatalog.materialColors,
    materialBatches,
    inventoryAdjustments: data.inventoryAdjustments ?? [],
    auditLogs: data.auditLogs ?? [],
    employees: data.employees ?? []
  };
}

function normalizeCatalog(
  materials: Material[],
  groups: MaterialGroup[],
  subtypes: MaterialSubtype[],
  colors: MaterialColor[]
): {
  materials: Material[];
  materialGroups: MaterialGroup[];
  materialSubtypes: MaterialSubtype[];
  materialColors: MaterialColor[];
} {
  const nextGroups = [...groups];
  const nextSubtypes = [...subtypes];
  const nextColors = [...colors];

  const normalizedMaterials = materials.map((material, index) => {
    const existingGroup = nextGroups.find((item) => item.id === material.groupId);
    const groupName = material.name.trim() || `未命名大类${index + 1}`;
    const group =
      existingGroup ??
      nextGroups.find((item) => item.name === groupName) ??
      createLegacyGroup(nextGroups.length + 1, groupName);

    if (!nextGroups.some((item) => item.id === group.id)) {
      nextGroups.push(group);
    }

    const legacySubtypeName = material.subtype?.trim() || "默认小类";
    const existingSubtype = nextSubtypes.find((item) => item.id === material.subtypeId);
    const subtype =
      existingSubtype ??
      nextSubtypes.find((item) => item.groupId === group.id && item.name === legacySubtypeName) ??
      createLegacySubtype(nextSubtypes.length + 1, group.id, legacySubtypeName);

    if (!nextSubtypes.some((item) => item.id === subtype.id)) {
      nextSubtypes.push(subtype);
    }

    return {
      ...material,
      groupId: group.id,
      subtypeId: subtype.id,
      isActive: material.isActive ?? true,
      subtype: material.subtype ?? ""
    };
  });

  return {
    materials: normalizedMaterials,
    materialGroups: nextGroups,
    materialSubtypes: nextSubtypes,
    materialColors: nextColors
  };
}

function createLegacyGroup(index: number, name: string): MaterialGroup {
  return {
    id: `legacy-group-${index}`,
    code: `G${String(index).padStart(2, "0")}`,
    name,
    isActive: true
  };
}

function createLegacySubtype(index: number, groupId: string, name: string): MaterialSubtype {
  return {
    id: `legacy-subtype-${index}`,
    groupId,
    code: `S${String(index).padStart(2, "0")}`,
    name,
    isActive: true
  };
}

function createHistoricalBatches(data: AppData): MaterialBatch[] {
  return data.materialStocks
    .filter((stock) => stock.currentQuantity > 0)
    .map((stock) => ({
      id: `historical-${stock.id}`,
      purchaseId: "historical",
      materialId: stock.materialId,
      specification: stock.specification,
      originalQuantity: stock.currentQuantity,
      currentQuantity: stock.currentQuantity,
      totalCost: stock.remainingTotalCost,
      remainingTotalCost: stock.remainingTotalCost,
      unitCost: stock.currentQuantity > 0 ? stock.remainingTotalCost / stock.currentQuantity : 0,
      purchaseDate: "2026-06-11",
      notes: "系统从旧库存自动生成的历史批次"
    }));
}
