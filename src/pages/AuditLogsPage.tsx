import { DataTable } from "../components/DataTable";
import type { AppData, AuditAction } from "../domain/types";

interface AuditLogsPageProps {
  data: AppData;
}

const actionLabels: Record<AuditAction, string> = {
  inventory_adjustment: "库存调整",
  material_deactivated: "材料停用",
  material_reactivated: "材料恢复"
};

export function AuditLogsPage({ data }: AuditLogsPageProps) {
  const rows = [...(data.auditLogs ?? [])].reverse();

  return (
    <section className="panel">
      <h2>操作记录</h2>
      <DataTable
        rows={rows}
        emptyText="当天还没有敏感操作记录。"
        exportFileName="操作记录"
        dateFilter={{ label: "操作日期", getDate: (row) => row.createdAt }}
        columns={[
          { header: "时间", render: (row) => formatDateTime(row.createdAt), exportValue: (row) => formatDateTime(row.createdAt) },
          { header: "操作", render: (row) => actionLabels[row.action], exportValue: (row) => actionLabels[row.action] },
          { header: "员工", render: (row) => row.employeeName, exportValue: (row) => row.employeeName },
          { header: "原因", render: (row) => row.reason, exportValue: (row) => row.reason },
          { header: "详情", render: (row) => row.details, exportValue: (row) => row.details }
        ]}
      />
    </section>
  );
}

function formatDateTime(value: string) {
  return value ? new Date(value).toLocaleString("zh-CN") : "-";
}
