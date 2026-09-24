// ENDPOINTS: GET /api/admin/settings/audit-logs, POST /api/admin/settings/audit-logs/export
"use client";

import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import {
  ResponsiveDataTable,
  type ResponsiveColumnDef,
} from "@/common/ui/ResponsiveDataTable";
import { TableSkeleton } from "@/common/ui/SkeletonLoaders";
import { Download } from "lucide-react";
import { useAuditLogs } from "@/lib/queries/admin/useSettings";

type AuditLogRow = {
  id?: string;
  action: string;
  performedBy: string | { name?: string };
  target: string | { name?: string };
  timestamp: string;
};

const columns: ResponsiveColumnDef<AuditLogRow>[] = [
  {
    id: "action",
    header: "Action",
    mobile: "primary",
    render: (log) => (
      <Paragraph1 className="text-gray-900">{log.action}</Paragraph1>
    ),
  },
  {
    id: "performedBy",
    header: "Performed By",
    mobile: "detail",
    render: (log) => (
      <Paragraph1 className="text-gray-900">
        {typeof log.performedBy === "string"
          ? log.performedBy
          : log.performedBy?.name}
      </Paragraph1>
    ),
  },
  {
    id: "target",
    header: "Target",
    mobile: "detail",
    render: (log) => (
      <Paragraph1 className="text-gray-600">
        {typeof log.target === "string" ? log.target : log.target?.name}
      </Paragraph1>
    ),
  },
  {
    id: "timestamp",
    header: "Date & Time",
    mobile: "detail",
    render: (log) => (
      <Paragraph1 className="text-gray-600">
        {new Date(log.timestamp).toLocaleString()}
      </Paragraph1>
    ),
  },
];

export default function AuditLogsTab() {
  const { data: logsData, isLoading, error } = useAuditLogs(1, 20);

  if (error) {
    console.error("Failed to load audit logs:", error);
  }

  const logs = (logsData?.data?.logs || []) as AuditLogRow[];
  const showSkeleton = isLoading || !!error;

  const handleExportCSV = () => {
    console.log("Exporting audit logs to CSV...");
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <Paragraph3 className="font-bold text-gray-900">Audit Logs</Paragraph3>
        <button
          type="button"
          onClick={handleExportCSV}
          disabled={showSkeleton}
          className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-900 hover:bg-gray-50 disabled:opacity-50"
        >
          <Download size={16} />
          <Paragraph1 className="text-gray-900">Export CSV</Paragraph1>
        </button>
      </div>

      {showSkeleton ? (
        <TableSkeleton rows={5} columns={4} />
      ) : (
        <ResponsiveDataTable
          rows={logs}
          columns={columns}
          getRowKey={(log) => log.id || log.timestamp}
          emptyState={
            <Paragraph1 className="py-8 text-center text-gray-500">
              No audit logs found
            </Paragraph1>
          }
        />
      )}
    </div>
  );
}
