import type { AppData } from "../domain/types";

const STORAGE_KEY = "crystal-inventory-system:v1";

export function createEmptyData(): AppData {
  return {
    materials: [],
    materialStocks: [],
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
    return { ...createEmptyData(), ...JSON.parse(raw) };
  } catch {
    return createEmptyData();
  }
}

export function saveData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
