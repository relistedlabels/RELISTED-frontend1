"use client";
// ENDPOINTS: GET /api/admin/wallets?search=&page=1&limit=20, GET /api/admin/wallets/:walletId

import React, { useMemo } from "react";
import { ChevronRight } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";

interface WalletData {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  totalBalance: string;
  availableBalance: string;
  lockedAmount: string;
  lastUpdated: string;
  status: "active" | "inactive";
}

interface WalletTableProps {
  searchQuery: string;
}

const mockWalletData: WalletData[] = [
  {
    id: "WAL-001",
    userId: "USER-001",
    userName: "Chioma Eze",
    userAvatar: "https://i.pravatar.cc/40?img=1",
    totalBalance: "₦2,500,000",
    availableBalance: "₦1,800,000",
    lockedAmount: "₦700,000",
    lastUpdated: "Oct 10, 2025",
    status: "active",
  },
  {
    id: "WAL-002",
    userId: "USER-002",
    userName: "Ada Okafor",
    userAvatar: "https://i.pravatar.cc/40?img=2",
    totalBalance: "₦1,200,000",
    availableBalance: "₦1,000,000",
    lockedAmount: "₦200,000",
    lastUpdated: "Oct 8, 2025",
    status: "active",
  },
  {
    id: "WAL-003",
    userId: "USER-003",
    userName: "Ngozi Bello",
    userAvatar: "https://i.pravatar.cc/40?img=3",
    totalBalance: "₦800,000",
    availableBalance: "₦500,000",
    lockedAmount: "₦300,000",
    lastUpdated: "Oct 5, 2025",
    status: "inactive",
  },
  {
    id: "WAL-004",
    userId: "USER-004",
    userName: "Amara Obi",
    userAvatar: "https://i.pravatar.cc/40?img=4",
    totalBalance: "₦3,100,000",
    availableBalance: "₦2,500,000",
    lockedAmount: "₦600,000",
    lastUpdated: "Oct 3, 2025",
    status: "active",
  },
];

export default function WalletTable({ searchQuery }: WalletTableProps) {
  const filteredData = useMemo(() => {
    return mockWalletData.filter(
      (item) =>
        item.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-6 py-4 text-left">
              <Paragraph1 className="text-gray-900 font-semibold">
                WALLET ID
              </Paragraph1>
            </th>
            <th className="px-6 py-4 text-left">
              <Paragraph1 className="text-gray-900 font-semibold">
                USER
              </Paragraph1>
            </th>
            <th className="px-6 py-4 text-left">
              <Paragraph1 className="text-gray-900 font-semibold">
                TOTAL BALANCE
              </Paragraph1>
            </th>
            <th className="px-6 py-4 text-left">
              <Paragraph1 className="text-gray-900 font-semibold">
                AVAILABLE
              </Paragraph1>
            </th>
            <th className="px-6 py-4 text-left">
              <Paragraph1 className="text-gray-900 font-semibold">
                LOCKED
              </Paragraph1>
            </th>
            <th className="px-6 py-4 text-left">
              <Paragraph1 className="text-gray-900 font-semibold">
                STATUS
              </Paragraph1>
            </th>
            <th className="px-6 py-4 text-left">
              <Paragraph1 className="text-gray-900 font-semibold">
                LAST UPDATED
              </Paragraph1>
            </th>
            <th className="px-6 py-4 text-left">
              <Paragraph1 className="text-gray-900 font-semibold">
                ACTIONS
              </Paragraph1>
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredData.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-6 py-8 text-center">
                <p className="text-gray-500">No wallets found</p>
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
                  <Paragraph1 className="text-gray-900 font-semibold">
                    {item.totalBalance}
                  </Paragraph1>
                </td>
                <td className="px-6 py-4">
                  <Paragraph1 className="text-green-600 font-medium">
                    {item.availableBalance}
                  </Paragraph1>
                </td>
                <td className="px-6 py-4">
                  <Paragraph1 className="text-orange-600 font-medium">
                    {item.lockedAmount}
                  </Paragraph1>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {item.status === "active" ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <Paragraph1 className="text-gray-600">
                    {item.lastUpdated}
                  </Paragraph1>
                </td>
                <td className="px-6 py-4">
                  <button className="flex items-center gap-1 text-gray-600 hover:text-gray-900 font-medium">
                    <Paragraph1>View</Paragraph1> <ChevronRight size={16} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
