// ENDPOINTS: GET /api/admin/users/:userId/wallet, GET /api/admin/users/:userId/transactions
"use client";

import React from "react";
import { Download } from "lucide-react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import {
  UserWallet as UserWalletType,
  Transaction,
} from "@/lib/api/admin/users";
import { TableSkeleton } from "@/common/ui/SkeletonLoaders";

interface UserWalletProps {
  wallet?: UserWalletType;
  transactions?: Transaction[];
  transactionsLoading?: boolean;
  transactionsError?: Error | null;
}

const getTypeColor = (type: string) => {
  switch (type) {
    case "MAIN":
      return "text-blue-600 font-semibold";
    case "AVAILABLE":
      return "text-green-600 font-semibold";
    case "COLLATERAL":
      return "text-orange-600 font-semibold";
    default:
      return "text-gray-600 font-semibold";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "SUCCESS":
      return "bg-green-50 text-green-700";
    case "PENDING":
      return "bg-yellow-50 text-yellow-700";
    case "FAILED":
      return "bg-red-50 text-red-700";
    default:
      return "bg-gray-50 text-gray-700";
  }
};

export default function UserWallet({
  wallet,
  transactions,
  transactionsLoading,
  transactionsError,
}: UserWalletProps) {
  if (!wallet) {
    return (
      <div className="text-center py-12">
        <Paragraph1 className="text-gray-500">
          No wallet data available
        </Paragraph1>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Wallet Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Main Balance */}
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <Paragraph1 className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">
            Main Balance
          </Paragraph1>
          <Paragraph3 className="text-2xl font-bold text-blue-900">
            ₦{wallet.mainBalance.toLocaleString()}
          </Paragraph3>
          <Paragraph1 className="text-xs text-blue-600 mt-2">
            Available for withdrawal
          </Paragraph1>
        </div>

        {/* Available Balance */}
        <div className="bg-green-50 rounded-lg p-6 border border-green-200">
          <Paragraph1 className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-2">
            Available Balance
          </Paragraph1>
          <Paragraph3 className="text-2xl font-bold text-green-900">
            ₦{wallet.availableBalance.toLocaleString()}
          </Paragraph3>
          <Paragraph1 className="text-xs text-green-600 mt-2">
            Pending transactions
          </Paragraph1>
        </div>

        {/* Collateral Balance */}
        <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
          <Paragraph1 className="text-xs font-semibold text-orange-600 uppercase tracking-wide mb-2">
            Collateral Balance
          </Paragraph1>
          <Paragraph3 className="text-2xl font-bold text-orange-900">
            ₦{wallet.collateralBalance.toLocaleString()}
          </Paragraph3>
          <Paragraph1 className="text-xs text-orange-600 mt-2">
            Collateral held
          </Paragraph1>
        </div>
      </div>

      {/* Last Updated */}
      <div className="flex items-center justify-between">
        <Paragraph1 className="text-xs text-gray-500">
          Last updated:{" "}
          {new Date(wallet.updatedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Paragraph1>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-sm text-gray-700">
          <Download size={18} />
          Export Statement
        </button>
      </div>

      {/* Transaction History */}
      <div>
        <Paragraph3 className="text-base font-bold mb-6 text-gray-900">
          Transaction History
        </Paragraph3>

        {transactionsLoading ? (
          <TableSkeleton />
        ) : transactionsError ? (
          <Paragraph1 className="text-red-600">
            Error loading transactions
          </Paragraph1>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-white">
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Date
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Note
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
                  {transactions && transactions.length > 0 ? (
                    transactions.map((transaction) => (
                      <tr
                        key={transaction.id}
                        className="border-b border-gray-200 hover:bg-gray-50 transition"
                      >
                        <td className="py-4 px-6">
                          <Paragraph1 className="text-sm text-gray-700">
                            {new Date(transaction.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "2-digit",
                              },
                            )}
                          </Paragraph1>
                          <Paragraph1 className="text-xs text-gray-500">
                            {new Date(transaction.createdAt).toLocaleTimeString(
                              "en-US",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </Paragraph1>
                        </td>
                        <td className="py-4 px-6">
                          <Paragraph1 className="text-sm text-gray-700">
                            {transaction.note}
                          </Paragraph1>
                        </td>
                        <td className="py-4 px-6">
                          <Paragraph1
                            className={getTypeColor(transaction.type)}
                          >
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
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 px-6 text-center">
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
        )}
      </div>
    </div>
  );
}
