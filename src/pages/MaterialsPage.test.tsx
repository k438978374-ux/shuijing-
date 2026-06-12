import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MaterialsPage } from "./MaterialsPage";
import type { AppData } from "../domain/types";

describe("MaterialsPage", () => {
  it("creates group, subtype, and material in a three-level hierarchy", async () => {
    const user = userEvent.setup();
    const setData = vi.fn();
    const view = render(<MaterialsPage data={emptyData()} setData={setData} activeSection="groups" />);

    await user.click(screen.getByRole("button", { name: "+ 新增大类" }));
    await user.type(screen.getByLabelText("大类代号"), "HLB");
    await user.type(screen.getByLabelText("大类名称"), "海蓝宝");
    await user.click(screen.getByRole("button", { name: "保存大类" }));

    let updater = setData.mock.calls[0][0] as (data: AppData) => AppData;
    const withGroup = updater(emptyData());
    const createdGroup = (withGroup as AppData & { materialGroups: Array<{ id: string; code: string; name: string }> })
      .materialGroups[0];

    view.rerender(<MaterialsPage data={withGroup} setData={setData} activeSection="colors" />);

    await user.click(screen.getByRole("button", { name: "+ 新增颜色" }));
    await user.type(screen.getByLabelText("颜色代号"), "BLUE");
    await user.type(screen.getByLabelText("颜色名称"), "天空蓝");
    await user.click(screen.getByRole("button", { name: "保存颜色" }));

    updater = setData.mock.calls[1][0] as (data: AppData) => AppData;
    const withColor = updater(withGroup);
    const createdColor = (withColor as AppData & { materialColors: Array<{ id: string; code: string; name: string }> })
      .materialColors[0];

    view.rerender(<MaterialsPage data={withColor} setData={setData} activeSection="subtypes" />);

    await user.click(screen.getByRole("button", { name: "+ 新增小类" }));
    await user.selectOptions(screen.getByLabelText("所属大类"), createdGroup.id);
    await user.type(screen.getByLabelText("小类代号"), "TT");
    await user.type(screen.getByLabelText("小类名称"), "透体款");
    await user.click(screen.getByRole("button", { name: "保存小类" }));

    updater = setData.mock.calls[2][0] as (data: AppData) => AppData;
    const withSubtype = updater(withColor);
    const createdSubtype = (withSubtype as AppData & {
      materialSubtypes: Array<{ id: string; groupId: string; code: string; name: string }>;
    }).materialSubtypes[0];

    view.rerender(<MaterialsPage data={withSubtype} setData={setData} activeSection="items" />);

    await user.click(screen.getByRole("button", { name: "+ 新增货品" }));
    await user.selectOptions(screen.getByLabelText("选择大类"), createdGroup.id);
    await user.selectOptions(screen.getByLabelText("选择小类"), createdSubtype.id);
    await user.selectOptions(screen.getByLabelText("选择颜色"), createdColor.id);
    await user.type(screen.getByLabelText("货品名称"), "海蓝宝圆珠");
    await user.click(screen.getByRole("button", { name: "保存货品" }));

    updater = setData.mock.calls[3][0] as (data: AppData) => AppData;
    const next = updater(withSubtype);

    expect((next as AppData & { materials: Array<{ groupId: string; subtypeId: string; colorId: string; name: string }> }).materials[0])
      .toMatchObject({
        groupId: createdGroup.id,
        subtypeId: createdSubtype.id,
        colorId: createdColor.id,
        name: "海蓝宝圆珠"
      });
  });

  it("shows each material section as its own page", () => {
    const view = render(<MaterialsPage data={dataWithImage()} setData={vi.fn()} activeSection="groups" />);

    expect(screen.getByText("材料大类")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "+ 新增大类" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "+ 新增货品" })).not.toBeInTheDocument();
    expect(screen.queryByText("货品名称")).not.toBeInTheDocument();

    view.rerender(<MaterialsPage data={dataWithImage()} setData={vi.fn()} activeSection="items" />);

    expect(screen.getByText("货品目录")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "+ 新增货品" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "+ 新增大类" })).not.toBeInTheDocument();
    expect(screen.queryByText("代号")).not.toBeInTheDocument();

    view.rerender(<MaterialsPage data={dataWithImage()} setData={vi.fn()} activeSection="colors" />);

    expect(screen.getByText("颜色目录")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "+ 新增颜色" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "+ 新增货品" })).not.toBeInTheDocument();
  });

  it("updates a material image from the table image action", async () => {
    const user = userEvent.setup();
    const setData = vi.fn();

    render(<MaterialsPage data={dataWithImage()} setData={setData} activeSection="items" />);

    await user.click(screen.getByRole("button", { name: "修改海蓝宝圆珠图片" }));
    await user.click(screen.getByRole("button", { name: "清空图片" }));
    await user.click(screen.getByRole("button", { name: "保存图片" }));

    const updater = setData.mock.calls[0][0] as (data: AppData) => AppData;
    const next = updater(dataWithImage());

    expect(next.materials[0].imageDataUrl).toBe("");
  });

  it("opens material details from the material name and saves edits only after edit mode", async () => {
    const user = userEvent.setup();
    const setData = vi.fn();

    render(<MaterialsPage data={dataWithImage()} setData={setData} activeSection="items" />);

    await user.click(screen.getByRole("button", { name: "海蓝宝圆珠" }));

    expect(screen.getByLabelText("货品名称")).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "修改" }));
    expect(screen.getByLabelText("货品名称")).toBeDisabled();

    await user.selectOptions(screen.getByLabelText("选择颜色"), "c2");
    await user.click(screen.getByRole("button", { name: "保存" }));

    const updater = setData.mock.calls[0][0] as (data: AppData) => AppData;
    const next = updater(dataWithImage());

    expect(next.materials[0]).toMatchObject({
      name: "海蓝宝圆珠",
      colorId: "c2"
    });
  });

  it("saves material detail edits even when optional catalog fields are empty", async () => {
    const user = userEvent.setup();
    const setData = vi.fn();

    render(<MaterialsPage data={dataWithImage()} setData={setData} activeSection="items" />);

    await user.click(screen.getByRole("button", { name: "海蓝宝圆珠" }));
    await user.click(screen.getByRole("button", { name: "修改" }));
    await user.selectOptions(screen.getByLabelText("选择颜色"), "");
    await user.click(screen.getByRole("button", { name: "保存" }));

    const updater = setData.mock.calls[0][0] as (data: AppData) => AppData;
    const next = updater(dataWithImage());

    expect(next.materials[0]).toMatchObject({
      name: "海蓝宝圆珠",
      colorId: ""
    });
  });

  it("hides inactive materials by default and shows them from the inactive view", async () => {
    const user = userEvent.setup();

    render(<MaterialsPage data={dataWithInactiveMaterial()} setData={vi.fn()} activeSection="items" />);

    expect(screen.getByText("海蓝宝圆珠")).toBeInTheDocument();
    expect(screen.queryByText("测试货品1")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "查看停用 (1)" }));

    expect(screen.queryByText("海蓝宝圆珠")).not.toBeInTheDocument();
    expect(screen.getByText("测试货品1")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "恢复" })).toBeInTheDocument();
  });
});

function emptyData(): AppData {
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
  } as AppData;
}

function baseHierarchy() {
  return {
    group: { id: "g1", code: "HLB", name: "海蓝宝" },
    subtype: { id: "s1", groupId: "g1", code: "TT", name: "透体款" },
    color: { id: "c1", code: "BLUE", name: "天空蓝" },
    secondColor: { id: "c2", code: "PURPLE", name: "紫色" }
  };
}

function dataWithImage(): AppData {
  const { group, subtype, color, secondColor } = baseHierarchy();
  return {
    ...emptyData(),
    materialGroups: [group],
    materialSubtypes: [subtype],
    materialColors: [color, secondColor],
    materials: [
      {
        id: "m1",
        name: "海蓝宝圆珠",
        groupId: group.id,
        subtypeId: subtype.id,
        colorId: color.id,
        lowStockThreshold: 10,
        imageDataUrl: "data:image/png;base64,old",
        notes: "",
        isActive: true
      }
    ]
  } as AppData;
}

function dataWithInactiveMaterial(): AppData {
  const { group, subtype, color } = baseHierarchy();
  return {
    ...emptyData(),
    materialGroups: [group],
    materialSubtypes: [subtype],
    materialColors: [color],
    materials: [
      {
        id: "m1",
        name: "海蓝宝圆珠",
        groupId: group.id,
        subtypeId: subtype.id,
        colorId: color.id,
        lowStockThreshold: 10,
        imageDataUrl: "",
        notes: "",
        isActive: true
      },
      {
        id: "m2",
        name: "测试货品1",
        groupId: group.id,
        subtypeId: subtype.id,
        colorId: color.id,
        lowStockThreshold: 10,
        imageDataUrl: "",
        notes: "",
        isActive: false
      }
    ]
  } as AppData;
}
