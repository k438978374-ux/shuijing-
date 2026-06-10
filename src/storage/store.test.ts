import { beforeEach, describe, expect, it } from "vitest";
import { createEmptyData, loadData, saveData } from "./store";

describe("store", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("creates empty app data", () => {
    expect(createEmptyData()).toEqual({
      materials: [],
      purchases: [],
      recipes: [],
      productions: [],
      finishedGoods: [],
      sales: []
    });
  });

  it("loads empty data when localStorage is empty", () => {
    expect(loadData()).toEqual(createEmptyData());
  });

  it("saves and loads app data", () => {
    const data = createEmptyData();
    data.materials.push({
      id: "m1",
      name: "粉晶",
      category: "crystal",
      specification: "8mm",
      currentQuantity: 100,
      remainingTotalCost: 50,
      averageUnitCost: 0.5,
      lowStockThreshold: 10,
      imageDataUrl: "",
      notes: ""
    });

    saveData(data);

    expect(loadData().materials[0].name).toBe("粉晶");
  });
});
