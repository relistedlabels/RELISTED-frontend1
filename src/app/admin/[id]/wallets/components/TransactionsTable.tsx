"use client";
// ENDPOINTS: GET /api/admin/wallets/transactions?search=&page=1&limit=20&type=&status=

import React, { useMemo } from "react";
import { ArrowUpRight, ArrowDownLeft, Send } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";

interface TransactionData {
  id: string;
  transactionId: string;
  userName: string;
  userAvatar: string;
  type: "deposit" | "withdrawal" | "transfer";
  amount: string;
  balance: string;
  description: string;
  date: string;
  time: string;
  status: "completed" | "pending" | "failed";
}

interface TransactionsTableProps {
  searchQuery: string;
}

const mockTransactionData: TransactionData[] = [
  {
    id: "TXN-001",
    transactionId: "TXN20251010001",
    userName: "Chioma Eze",
    userAvatar: "https://i.pravatar.cc/40?img=1",
    type: "deposit",
    amount: "₦500,000",
    balance: "₦2,500,000",
    description: "Wallet Top-up Deposit",
    date: "Oct 10, 2025",
    time: "02:45 PM",
    status: "completed",
  },
  {
    id: "TXN-002",
    transactionId: "TXN20251008002",
    userName: "Ada Okafor",
    userAvatar: "https://i.pravatar.cc/40?img=2",
    type: "withdrawal",
    amount: "₦250,000",
    balance: "₦1,200,000",
    description: "Withdrawal to Bank",
    date: "Oct 8, 2025",
    time: "10:30 AM",
    status: "completed",
  },
  {
    id: "TXN-003",
    transactionId: "TXN20251005003",
    userName: "Ngozi Bello",
    userAvatar: "https://i.pravatar.cc/40?img=3",
    type: "transfer",
    amount: "₦150,000",
    balance: "₦800,000",
    description: "Transfer to User",
    date: "Oct 5, 2025",
    time: "04:15 PM",
    status: "pending",
  },
  {
    id: "TXN-004",
    transactionId: "TXN20251003004",
    userName: "Amara Obi",
    userAvatar: "https://i.pravatar.cc/40?img=4",
    type: "deposit",
    amount: "₦800,000",
    balance: "₦3,100,000",
    description: "Rental Payment Received",
    date: "Oct 3, 2025",
    time: "11:20 AM",
    status: "completed",
  },
  {
    id: "TXN-005",
    transactionId: "TXN20251001005",
    userName: "Chukwu Emma",
    userAvatar: "https://i.pravatar.cc/40?img=5",
    type: "withdrawal",
    amount: "₦100,000",
    balance: "₦900,000",
    description: "Failed Withdrawal",
    date: "Oct 1, 2025",
    time: "03:00 PM",
    status: "failed",
  },
];

export default function TransactionsTable({
  searchQuery,
}: TransactionsTableProps) {
  const filteredData = useMemo(() => {
    return mockTransactionData.filter(
      (item) =>
        item.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.transactionId.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery]);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <ArrowDownLeft size={16} className="text-green-600" />;
      case "withdrawal":
        return <ArrowUpRight size={16} className="text-red-600" />;
      case "transfer":
        return <Send size={16} className="text-blue-600" />;
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
                TRANSACTION ID
              </Paragraph1>
            </th>
            <th className="px-6 py-4 text-left">
              <Paragraph1 className="text-gray-900 font-semibold">
                USER
              </Paragraph1>
            </th>
            <th className="px-6 py-4 text-left">
              <Paragraph1 className="text-gray-900 font-semibold">
                TYPE
              </Paragraph1>
            </th>
            <th className="px-6 py-4 text-left">
              <Paragraph1 className="text-gray-900 font-semibold">
                AMOUNT
              </Paragraph1>
            </th>
            <th className="px-6 py-4 text-left">
              <Paragraph1 className="text-gray-900 font-semibold">
                BALANCE
              </Paragraph1>
            </th>
            <th className="px-6 py-4 text-left">
              <Paragraph1 className="text-gray-900 font-semibold">
                DESCRIPTION
              </Paragraph1>
            </th>
            <th className="px-6 py-4 text-left">
              <Paragraph1 className="text-gray-900 font-semibold">
                DATE & TIME
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
              <td colSpan={8} className="px-6 py-8 text-center">
                <p className="text-gray-500">No transactions found</p>
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
                    {item.transactionId}
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
                  <div className="flex items-center gap-2">
                    {getTransactionIcon(item.type)}
                    <Paragraph1 className="font-medium text-gray-900 capitalize">
                      {item.type}
                    </Paragraph1>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Paragraph1 className="font-semibold text-gray-900">
                    {item.amount}
                  </Paragraph1>
                </td>
                <td className="px-6 py-4">
                  <Paragraph1 className="text-gray-600">
                    {item.balance}
                  </Paragraph1>
                </td>
                <td className="px-6 py-4">
                  <Paragraph1 className="text-gray-600">
                    {item.description}
                  </Paragraph1>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <Paragraph1 className="text-gray-600">
                      {item.date}
                    </Paragraph1>
                    <Paragraph1 className="text-gray-500 text-xs">
                      {item.time}
                    </Paragraph1>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : item.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {item.status === "completed"
                      ? "Completed"
                      : item.status === "pending"
                        ? "Pending"
                        : "Failed"}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
