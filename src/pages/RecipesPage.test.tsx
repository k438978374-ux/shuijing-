import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RecipesPage } from "./RecipesPage";
import type { AppData } from "../domain/types";

describe("RecipesPage", () => {
  it("lets recipe material lines choose a material size", async () => {
    const user = userEvent.setup();
    const setData = vi.fn();

    render(<RecipesPage data={dataWithSizedMaterial()} setData={setData} />);

    await user.type(screen.getByLabelText("款式名称"), "粉晶款");
    await user.click(screen.getByRole("button", { name: "添加材料" }));

    expect(screen.getByLabelText("规格")).toHaveDisplayValue("6mm");
    await user.selectOptions(screen.getByLabelText("规格"), "8mm");
    await user.click(screen.getByRole("button", { name: "保存配方" }));

    const updater = setData.mock.calls[0][0] as (data: AppData) => AppData;
    const next = updater(dataWithSizedMaterial());

    expect(next.recipes[0].materialLines[0]).toMatchObject({
      materialId: "m1",
      specification: "8mm",
      quantity: 1
    });
  });
});

function dataWithSizedMaterial(): AppData {
  return {
    materials: [
      {
        id: "m1",
        name: "粉晶",
        category: "crystal",
        specification: "6mm, 8mm, 10mm",
        currentQuantity: 100,
        remainingTotalCost: 50,
        averageUnitCost: 0.5,
        lowStockThreshold: 10,
        imageDataUrl: "",
        notes: ""
      }
    ],
    purchases: [],
    recipes: [],
    productions: [],
    finishedGoods: [],
    sales: []
  };
}
