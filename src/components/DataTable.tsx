import type { ReactNode } from "react";

interface DataTableProps<T> {
  rows: T[];
  emptyText: string;
  columns: {
    header: string;
    render: (row: T) => ReactNode;
  }[];
}

export function DataTable<T>({ rows, emptyText, columns }: DataTableProps<T>) {
  if (rows.length === 0) {
    return <p className="muted">{emptyText}</p>;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.header}>{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column) => (
                <td key={column.header}>{column.render(row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
