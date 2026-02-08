// ENDPOINTS: GET /api/admin/settings/audit-logs, POST /api/admin/settings/audit-logs/export
"use client";

import { Paragraph1, Paragraph2, Paragraph3 } from "@/common/ui/Text";
import { Download } from "lucide-react";

export default function AuditLogsTab() {
  const logs = [
    {
      action: "Updated platform commission to 15%",
      performedBy: "Jane Graham",
      target: "Platform Settings",
      dateTime: "Nov 14, 2025 10:30 AM",
    },
    {
      action: "Suspended user account",
      performedBy: "Jane Graham",
      target: "User #12345",
      dateTime: "Nov 14, 2025 09:15 AM",
    },
    {
      action: "Resolved dispute",
      performedBy: "Michael Chen",
      target: "Dispute #DIS-789",
      dateTime: "Nov 14, 2025 08:45 AM",
    },
    {
      action: "Created new admin role",
      performedBy: "Jane Graham",
      target: "Role: Operations",
      dateTime: "Nov 13, 2025 04:20 PM",
    },
    {
      action: "Approved listing",
      performedBy: "Sarah Johnson",
      target: "Listing #LST-456",
      dateTime: "Nov 13, 2025 02:10 PM",
    },
  ];

  const handleExportCSV = () => {
    console.log("Exporting audit logs to CSV...");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <Paragraph3 className="text-gray-900 font-bold">Audit Logs</Paragraph3>
        <button
          onClick={handleExportCSV}
          className="px-4 py-2 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2"
        >
          <Download size={16} />
          <Paragraph1 className="text-gray-900">Export CSV</Paragraph1>
        </button>
      </div>

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
            {logs.map((log, index) => (
              <tr
                key={index}
                className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <td className="py-4 px-4">
                  <Paragraph1 className="text-gray-900">
                    {log.action}
                  </Paragraph1>
                </td>
                <td className="py-4 px-4">
                  <Paragraph1 className="text-gray-900">
                    {log.performedBy}
                  </Paragraph1>
                </td>
                <td className="py-4 px-4">
                  <Paragraph1 className="text-gray-600">
                    {log.target}
                  </Paragraph1>
                </td>
                <td className="py-4 px-4">
                  <Paragraph1 className="text-gray-600">
                    {log.dateTime}
                  </Paragraph1>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
