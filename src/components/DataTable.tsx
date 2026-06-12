import { useState, type ReactNode } from "react";
import { exportCsv, type CsvColumn } from "../utils/csvExport";
import { isSameDate, todayDateString } from "../utils/dateFilter";

interface DataTableProps<T> {
  rows: T[];
  emptyText: string;
  exportFileName?: string;
  dateFilter?: {
    label?: string;
    getDate: (row: T) => string;
    defaultToday?: boolean;
  };
  columns: {
    header: string;
    render: (row: T) => ReactNode;
    exportValue?: (row: T) => string | number | boolean | null | undefined;
  }[];
}

function getColumnClass(header: string) {
  if (header === "状态") {
    return "table-cell-status";
  }

  if (header === "操作") {
    return "table-cell-action";
  }

  return undefined;
}

export function DataTable<T>({ rows, emptyText, exportFileName, dateFilter, columns }: DataTableProps<T>) {
  const defaultDate = dateFilter?.defaultToday === false ? "" : todayDateString();
  const [selectedDate, setSelectedDate] = useState(defaultDate);
  const filteredRows = dateFilter ? rows.filter((row) => isSameDate(dateFilter.getDate(row), selectedDate)) : rows;
  const exportColumns: CsvColumn<T>[] = columns
    .filter((column) => column.header !== "操作")
    .map((column) => ({
      header: column.header,
      value: column.exportValue ?? (() => "")
    }));

  function handleExport() {
    exportCsv(filteredRows, exportColumns, exportFileName ?? "库存数据");
  }

  return (
    <div className="table-card">
      <div className="table-toolbar">
        <div className="table-filter">
          {dateFilter ? (
            <>
              <span>{dateFilter.label ?? "日期"}</span>
              <input
                aria-label={dateFilter.label ?? "日期"}
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.currentTarget.value)}
              />
              <button className="text-button subtle-text-button" type="button" onClick={() => setSelectedDate("")}>
                全部
              </button>
            </>
          ) : (
            <span className="muted">共 {rows.length} 条</span>
          )}
        </div>
        <button className="secondary-button table-export-button" type="button" onClick={handleExport}>
          导出 Excel
        </button>
      </div>
      {filteredRows.length === 0 ? (
        <div className="empty-table-card">
          <p className="muted">{emptyText}</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {columns.map((column) => {
                  const columnClass = getColumnClass(column.header);

                  return (
                    <th className={columnClass} key={column.header}>
                      {column.header}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((column) => {
                    const columnClass = getColumnClass(column.header);

                    return (
                      <td className={columnClass} key={column.header}>
                        {column.render(row)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="table-footer">
        <span>显示 {filteredRows.length} 条 / 共 {rows.length} 条</span>
        <span>本地库存数据</span>
      </div>
    </div>
  );
}
