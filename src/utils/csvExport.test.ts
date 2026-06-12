import { describe, expect, it } from "vitest";
import { buildCsv } from "./csvExport";

describe("buildCsv", () => {
  it("escapes commas, quotes and new lines for Excel-compatible csv", () => {
    const csv = buildCsv(
      [{ name: "白水晶,8mm", note: '他说"好看"\n已入库', count: 12 }],
      [
        { header: "名称", value: (row) => row.name },
        { header: "备注", value: (row) => row.note },
        { header: "数量", value: (row) => row.count }
      ]
    );

    expect(csv).toBe('名称,备注,数量\r\n"白水晶,8mm","他说""好看""\n已入库",12');
  });
});
