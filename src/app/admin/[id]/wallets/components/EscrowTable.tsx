"use client";
// ENDPOINTS: GET /api/admin/wallets/escrow?search=&page=1&limit=20, PUT /api/admin/wallets/escrow/:escrowId/release

import React, { useMemo } from "react";
import { Lock, Unlock, AlertCircle } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";

interface EscrowData {
  id: string;
  orderId: string;
  userName: string;
  curatorName: string;
  userAvatar: string;
  lockedAmount: string;
  reason: string;
  lockedDate: string;
  releaseDate: string;
  status: "locked" | "pending" | "released";
}

interface EscrowTableProps {
  searchQuery: string;
}

const mockEscrowData: EscrowData[] = [
  {
    id: "ESC-001",
    orderId: "#RLS-23984",
    userName: "Chioma Eze",
    curatorName: "Grace Adebayo",
    userAvatar: "https://i.pravatar.cc/40?img=1",
    lockedAmount: "₦550,000",
    reason: "Rental Dispute",
    lockedDate: "Oct 10, 2025",
    releaseDate: "Oct 20, 2025",
    status: "locked",
  },
  {
    id: "ESC-002",
    orderId: "#RLS-23985",
    userName: "Ada Okafor",
    curatorName: "Funmi Adeleke",
    userAvatar: "https://i.pravatar.cc/40?img=2",
    lockedAmount: "₦380,000",
    reason: "Payment Hold",
    lockedDate: "Oct 8, 2025",
    releaseDate: "Oct 18, 2025",
    status: "pending",
  },
  {
    id: "ESC-003",
    orderId: "#RLS-23986",
    userName: "Ngozi Bello",
    curatorName: "Grace Adebayo",
    userAvatar: "https://i.pravatar.cc/40?img=3",
    lockedAmount: "₦420,000",
    reason: "Warranty Period",
    lockedDate: "Oct 5, 2025",
    releaseDate: "Oct 12, 2025",
    status: "locked",
  },
  {
    id: "ESC-004",
    orderId: "#RLS-23987",
    userName: "Amara Obi",
    curatorName: "Kemi Okoye",
    userAvatar: "https://i.pravatar.cc/40?img=4",
    lockedAmount: "₦650,000",
    reason: "Quality Verification",
    lockedDate: "Oct 1, 2025",
    releaseDate: "Oct 8, 2025",
    status: "released",
  },
];

export default function EscrowTable({ searchQuery }: EscrowTableProps) {
  const filteredData = useMemo(() => {
    return mockEscrowData.filter(
      (item) =>
        item.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.orderId.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "locked":
        return <Lock size={16} className="text-orange-600" />;
      case "pending":
        return <AlertCircle size={16} className="text-yellow-600" />;
      case "released":
        return <Unlock size={16} className="text-green-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-6 py-4 text-left">
              <Paragraph1 className="text-gray-900 font-semibold">
                ESCROW ID
              </Paragraph1>
            </th>
            <th className="px-6 py-4 text-left">
              <Paragraph1 className="text-gray-900 font-semibold">
                ORDER ID
              </Paragraph1>
            </th>
            <th className="px-6 py-4 text-left">
              <Paragraph1 className="text-gray-900 font-semibold">
                DRESSER
              </Paragraph1>
            </th>
            <th className="px-6 py-4 text-left">
              <Paragraph1 className="text-gray-900 font-semibold">
                CURATOR
              </Paragraph1>
            </th>
            <th className="px-6 py-4 text-left">
              <Paragraph1 className="text-gray-900 font-semibold">
                LOCKED AMOUNT
              </Paragraph1>
            </th>
            <th className="px-6 py-4 text-left">
              <Paragraph1 className="text-gray-900 font-semibold">
                REASON
              </Paragraph1>
            </th>
            <th className="px-6 py-4 text-left">
              <Paragraph1 className="text-gray-900 font-semibold">
                LOCKED DATE
              </Paragraph1>
            </th>
            <th className="px-6 py-4 text-left">
              <Paragraph1 className="text-gray-900 font-semibold">
                RELEASE DATE
              </Paragraph1>
            </th>
            <th className="px-6 py-4 text-left">
              <Paragraph1 className="text-gray-900 font-semibold">
                STATUS
              </Paragraph1>
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredData.length === 0 ? (
            <tr>
              <td colSpan={9} className="px-6 py-8 text-center">
                <p className="text-gray-500">No escrow records found</p>
              </td>
            </tr>
          ) : (
            filteredData.map((item) => (
              <tr
                key={item.id}
                className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4">
                  <Paragraph1 className="text-gray-900 font-medium">
                    {item.id}
                  </Paragraph1>
                </td>
                <td className="px-6 py-4">
                  <Paragraph1 className="font-medium text-blue-600">
                    {item.orderId}
                  </Paragraph1>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.userAvatar}
                      alt={item.userName}
                      className="w-8 h-8 rounded-full"
                    />
                    <Paragraph1 className="font-medium text-gray-900">
                      {item.userName}
                    </Paragraph1>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Paragraph1 className="text-gray-900 font-medium">
                    {item.curatorName}
                  </Paragraph1>
                </td>
                <td className="px-6 py-4">
                  <Paragraph1 className="font-semibold text-orange-600">
                    {item.lockedAmount}
                  </Paragraph1>
                </td>
                <td className="px-6 py-4">
                  <Paragraph1 className="text-gray-600">
                    {item.reason}
                  </Paragraph1>
                </td>
                <td className="px-6 py-4">
                  <Paragraph1 className="text-gray-600">
                    {item.lockedDate}
                  </Paragraph1>
                </td>
                <td className="px-6 py-4">
                  <Paragraph1 className="text-gray-600">
                    {item.releaseDate}
                  </Paragraph1>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(item.status)}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.status === "locked"
                          ? "bg-orange-100 text-orange-700"
                          : item.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                      }`}
                    >
                      {item.status === "locked"
                        ? "Locked"
                        : item.status === "pending"
                          ? "Pending"
                          : "Released"}
                    </span>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
