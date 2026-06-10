import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { AccessGate } from "./AccessGate";

describe("AccessGate", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("unlocks the app after entering the correct password", async () => {
    const user = userEvent.setup();

    render(
      <AccessGate password="750829">
        <div>库存主页</div>
      </AccessGate>
    );

    expect(screen.getByPlaceholderText("请输入密码")).toBeInTheDocument();

    await user.type(screen.getByLabelText("访问密码"), "750829");
    await user.click(screen.getByRole("button", { name: "进入系统" }));

    expect(screen.getByText("库存主页")).toBeInTheDocument();
    expect(localStorage.getItem("crystal-inventory-access")).toBe("granted");
  });
});
