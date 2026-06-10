import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MaterialsPage } from "./MaterialsPage";
import type { AppData } from "../domain/types";

describe("MaterialsPage", () => {
  it("lets the user select multiple bead sizes from 2 to 16", async () => {
    const user = userEvent.setup();
    const setData = vi.fn();

    render(<MaterialsPage data={emptyData()} setData={setData} />);

    expect(screen.getByRole("button", { name: "2" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "16" })).toBeInTheDocument();

    await user.type(screen.getByLabelText("名称"), "粉晶");
    await user.click(screen.getByRole("button", { name: "6" }));
    await user.click(screen.getByRole("button", { name: "8" }));
    await user.click(screen.getByRole("button", { name: "10" }));
    await user.click(screen.getByRole("button", { name: "保存材料" }));

    const updater = setData.mock.calls[0][0] as (data: AppData) => AppData;
    const next = updater(emptyData());

    expect(next.materials[0].specification).toBe("6mm, 8mm, 10mm");
  });
});

function emptyData(): AppData {
  return {
    materials: [],
    purchases: [],
    recipes: [],
    productions: [],
    finishedGoods: [],
    sales: []
  };
}
