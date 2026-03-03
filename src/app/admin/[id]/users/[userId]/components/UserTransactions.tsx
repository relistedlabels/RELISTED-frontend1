// ENDPOINTS: GET /api/admin/users/:userId/transactions
"use client";

import React from "react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { Transaction } from "@/lib/api/admin/users";

interface UserTransactionsProps {
  transactions: Transaction[];
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Completed":
      return "bg-green-50 text-green-700";
    case "Pending":
      return "bg-yellow-50 text-yellow-700";
    case "Failed":
      return "bg-red-50 text-red-700";
    case "Cancelled":
      return "bg-gray-50 text-gray-700";
    default:
      return "bg-gray-50 text-gray-700";
  }
};

const getTypeColor = (type: "Debit" | "Credit") => {
  return type === "Credit"
    ? "text-green-600 font-semibold"
    : "text-red-600 font-semibold";
};

export default function UserTransactions({
  transactions,
}: UserTransactionsProps) {
  return (
    <div>
      <Paragraph3 className="text-base font-bold mb-6 text-gray-900">
        Transaction History
      </Paragraph3>

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
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions && transactions.length > 0 ? (
                transactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition"
                  >
                    <td className="py-4 px-6">
                      <Paragraph1 className="text-sm text-gray-700">
                        {new Date(transaction.date).toLocaleDateString()}
                      </Paragraph1>
                    </td>
                    <td className="py-4 px-6">
                      <Paragraph1 className="text-sm font-medium text-gray-900">
                        {transaction.description}
                      </Paragraph1>
                    </td>
                    <td className="py-4 px-6">
                      <Paragraph1 className={getTypeColor(transaction.type)}>
                        {transaction.type}
                      </Paragraph1>
                    </td>
                    <td className="py-4 px-6">
                      <Paragraph1 className="text-sm font-semibold text-gray-900">
                        ₦{transaction.amount.toLocaleString()}
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
                    <td className="py-4 px-6">
                      <button className="text-sm font-medium text-gray-900 hover:text-gray-600 transition">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 px-6 text-center">
                    <Paragraph1 className="text-gray-500">
                      No transactions found
                    </Paragraph1>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
