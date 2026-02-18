// ENDPOINTS: GET /api/admin/settings/audit-logs, POST /api/admin/settings/audit-logs/export
"use client";

import { Paragraph1, Paragraph2, Paragraph3 } from "@/common/ui/Text";
import { TableSkeleton } from "@/common/ui/SkeletonLoaders";
import { Download } from "lucide-react";
import { useAuditLogs } from "@/lib/queries/admin/useSettings";

export default function AuditLogsTab() {
  // API Query
  const { data: logsData, isLoading, error } = useAuditLogs(1, 20);

  // Log errors to console only
  if (error) {
    console.error("Failed to load audit logs:", error);
  }

  const logs = logsData?.data?.logs || [];
  const showSkeleton = isLoading || !!error;

  const handleExportCSV = () => {
    // Call export mutation here
    console.log("Exporting audit logs to CSV...");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <Paragraph3 className="text-gray-900 font-bold">Audit Logs</Paragraph3>
        <button
          onClick={handleExportCSV}
          disabled={showSkeleton}
          className="px-4 py-2 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2 disabled:opacity-50"
        >
          <Download size={16} />
          <Paragraph1 className="text-gray-900">Export CSV</Paragraph1>
        </button>
      </div>

      {showSkeleton ? (
        <TableSkeleton rows={5} columns={4} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="text-left py-4 px-4">
                  <Paragraph1 className="text-gray-900 font-bold">
                    ACTION
                  </Paragraph1>
                </th>
                <th className="text-left py-4 px-4">
                  <Paragraph1 className="text-gray-900 font-bold">
                    PERFORMED BY
                  </Paragraph1>
                </th>
                <th className="text-left py-4 px-4">
                  <Paragraph1 className="text-gray-900 font-bold">
                    TARGET
                  </Paragraph1>
                </th>
                <th className="text-left py-4 px-4">
                  <Paragraph1 className="text-gray-900 font-bold">
                    DATE & TIME
                  </Paragraph1>
                </th>
              </tr>
            </thead>
            <tbody>
              {logs.length > 0 ? (
                logs.map((log, index) => (
                  <tr
                    key={log.id || index}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <Paragraph1 className="text-gray-900">
                        {log.action}
                      </Paragraph1>
                    </td>
                    <td className="py-4 px-4">
                      <Paragraph1 className="text-gray-900">
                        {typeof log.performedBy === "string"
                          ? log.performedBy
                          : log.performedBy?.name}
                      </Paragraph1>
                    </td>
                    <td className="py-4 px-4">
                      <Paragraph1 className="text-gray-600">
                        {typeof log.target === "string"
                          ? log.target
                          : log.target?.name}
                      </Paragraph1>
                    </td>
                    <td className="py-4 px-4">
                      <Paragraph1 className="text-gray-600">
                        {new Date(log.timestamp).toLocaleString()}
                      </Paragraph1>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 px-4 text-center">
                    <Paragraph1 className="text-gray-500">
                      No audit logs found
                    </Paragraph1>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
