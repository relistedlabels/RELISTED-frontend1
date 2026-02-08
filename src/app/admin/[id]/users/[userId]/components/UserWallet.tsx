// ENDPOINTS: GET /api/admin/users/:userId/wallet, GET /api/admin/users/:userId/transactions
"use client";

import React from "react";
import { Download } from "lucide-react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";

interface Transaction {
  id: string;
  date: string;
  description: string;
  type: "Debit" | "Credit";
  amount: string;
  status: "Successful" | "Failed";
}

interface User {
  walletBalance: string;
}

interface UserWalletProps {
  user: User;
}

const TRANSACTIONS: Transaction[] = [
  {
    id: "1",
    date: "Nov 5, 2024",
    description: "Rental Payment - Gucci Blazer",
    type: "Debit",
    amount: "+₦25,000",
    status: "Successful",
  },
  {
    id: "2",
    date: "Nov 3, 2024",
    description: "Wallet Top-up",
    type: "Credit",
    amount: "+₦50,000",
    status: "Successful",
  },
  {
    id: "3",
    date: "Nov 1, 2024",
    description: "Security Deposit Refund - Hermes Scarf",
    type: "Credit",
    amount: "+₦45,000",
    status: "Successful",
  },
  {
    id: "4",
    date: "Oct 28, 2024",
    description: "Rental Payment - Prada Handbag",
    type: "Debit",
    amount: "+₦35,000",
    status: "Successful",
  },
  {
    id: "5",
    date: "Oct 25, 2024",
    description: "Late Return Fee",
    type: "Debit",
    amount: "-₦6,000",
    status: "Failed",
  },
];

const getTypeColor = (type: "Debit" | "Credit") => {
  return type === "Debit" ? "text-red-600" : "text-green-600";
};

const getStatusColor = (status: "Successful" | "Failed") => {
  return status === "Successful"
    ? "bg-green-50 text-green-700"
    : "bg-red-50 text-red-700";
};

export default function UserWallet({ user }: UserWalletProps) {
  return (
    <div className="space-y-6">
      {/* Wallet Balance Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Wallet Balance
            </Paragraph1>
            <Paragraph3 className="text-3xl font-bold text-gray-900">
              {user.walletBalance}
            </Paragraph3>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-sm text-gray-700">
            <Download size={18} />
            Export Statement
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-white">
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Date
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Description
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Type
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Amount
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {TRANSACTIONS.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition"
                >
                  <td className="py-4 px-6">
                    <Paragraph1 className="text-sm text-gray-700">
                      {transaction.date}
                    </Paragraph1>
                  </td>
                  <td className="py-4 px-6">
                    <Paragraph1 className="text-sm text-gray-700">
                      {transaction.description}
                    </Paragraph1>
                  </td>
                  <td className="py-4 px-6">
                    <Paragraph1
                      className={`text-sm font-semibold ${getTypeColor(
                        transaction.type,
                      )}`}
                    >
                      {transaction.type}
                    </Paragraph1>
                  </td>
                  <td className="py-4 px-6">
                    <Paragraph1 className="text-sm font-semibold text-gray-900">
                      {transaction.amount}
                    </Paragraph1>
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        transaction.status,
                      )}`}
                    >
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
