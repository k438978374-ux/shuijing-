import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MaterialsPage } from "./MaterialsPage";
import type { AppData } from "../domain/types";

describe("MaterialsPage", () => {
  it("saves a material without choosing a size", async () => {
    const user = userEvent.setup();
    const setData = vi.fn();

    render(<MaterialsPage data={emptyData()} setData={setData} />);

    expect(screen.queryByRole("button", { name: "2" })).not.toBeInTheDocument();
    expect(screen.queryByText("规格")).not.toBeInTheDocument();

    await user.type(screen.getByLabelText("名称"), "粉晶");
    await user.click(screen.getByRole("button", { name: "保存材料" }));

    const updater = setData.mock.calls[0][0] as (data: AppData) => AppData;
    const next = updater(emptyData());

    expect(next.materials[0].name).toBe("粉晶");
    expect("specification" in next.materials[0]).toBe(false);
  });
});

function emptyData(): AppData {
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
