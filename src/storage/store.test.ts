import { beforeEach, describe, expect, it } from "vitest";
import { createEmptyData, loadData, saveData } from "./store";

describe("store", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("creates empty app data", () => {
    expect(createEmptyData()).toEqual({
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
    });
  });

  it("loads empty data when localStorage is empty", () => {
    expect(loadData()).toEqual(createEmptyData());
  });

  it("migrates legacy material records into group, subtype, and material data", () => {
    localStorage.setItem(
      "crystal-inventory-system:v1",
      JSON.stringify({
        materials: [
          {
            id: "m1",
            name: "海蓝宝",
            subtype: "透体款",
            category: "crystal",
            lowStockThreshold: 10,
            imageDataUrl: "",
            notes: "",
            isActive: true
          }
        ]
      })
    );

    const loaded = loadData() as ReturnType<typeof loadData> & {
      materialGroups: Array<{ id: string; name: string }>;
      materialSubtypes: Array<{ id: string; groupId: string; name: string }>;
    };

    expect(loaded.materialGroups).toHaveLength(1);
    expect(loaded.materialGroups[0].name).toBe("海蓝宝");
    expect(loaded.materialSubtypes).toHaveLength(1);
    expect(loaded.materialSubtypes[0].name).toBe("透体款");
    expect(loaded.materials[0]).toMatchObject({
      groupId: loaded.materialGroups[0].id,
      subtypeId: loaded.materialSubtypes[0].id
    });
  });

  it("saves and loads app data", () => {
    const data = createEmptyData() as ReturnType<typeof createEmptyData> & {
      materialGroups: Array<{ id: string; code: string; name: string }>;
      materialSubtypes: Array<{ id: string; groupId: string; code: string; name: string }>;
      materialColors: Array<{ id: string; code: string; name: string }>;
    };
    data.materialGroups.push({ id: "g1", code: "FSJ", name: "粉水晶" });
    data.materialSubtypes.push({ id: "s1", groupId: "g1", code: "2A", name: "2A" });
    data.materialColors.push({ id: "c1", code: "PINK", name: "粉色" });
    data.materials.push({
      id: "m1",
      name: "粉水晶圆珠",
      groupId: "g1",
      subtypeId: "s1",
      colorId: "c1",
      lowStockThreshold: 10,
      imageDataUrl: "",
      notes: "",
      isActive: true
    });

    saveData(data);

    expect(loadData().materials[0].name).toBe("粉水晶圆珠");
  });
});
