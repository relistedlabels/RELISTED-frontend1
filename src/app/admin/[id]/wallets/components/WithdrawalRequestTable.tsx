"use client";

import React, { useMemo, useState } from "react";
import { ChevronRight, Loader2 } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import {
  useWithdrawalRequests,
  useMarkWithdrawalAsPaid,
} from "@/lib/queries/admin/useWallets";
import { usePublicUserById } from "@/lib/queries/user/usePublicUserById";
import ConfirmPaidModal from "./ConfirmPaidModal";

interface WithdrawalRequestTableProps {
  searchQuery: string;
}

// Component to display a single withdrawal request row
function WithdrawalRequestRow({
  withdrawal,
}: {
  withdrawal: {
    id: string;
    userId: string;
    user: {
      id: string;
      name: string;
      email: string;
      avatar: string;
    };
    bankAccount: {
      accountNumber: string;
      bankName: string;
      accountName: string;
    };
    amount: number;
    status: "pending" | "paid" | "failed";
    requestedDate: string;
    paidDate?: string;
  };
}) {
  const { data: userDetails, isLoading } = usePublicUserById(withdrawal.userId);
  const mutation = useMarkWithdrawalAsPaid();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadgeColor = (status: string): string => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "failed":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const getLastUpdatedDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleMarkAsPaid = async (trackingId: string) => {
    try {
      await mutation.mutateAsync({ withdrawalId: withdrawal.id, trackingId });
      setIsConfirmModalOpen(false);
    } catch (error) {
      console.error("Error marking withdrawal as paid:", error);
    }
  };

  return (
    <>
      <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            {userDetails?.avatar ? (
              <img
                src={userDetails.avatar}
                alt={withdrawal.user.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center text-xs font-semibold">
                {getInitials(withdrawal.user.name)}
              </div>
            )}
            <div>
              <Paragraph1 className="font-medium text-gray-900">
                {withdrawal.user.name}
              </Paragraph1>
              <span className="text-xs text-gray-500">
                {withdrawal.user.email}
              </span>
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
          <Paragraph1 className="text-gray-900 font-medium">
            {withdrawal.bankAccount.accountNumber}
          </Paragraph1>
          <span className="text-xs text-gray-500">
            {withdrawal.bankAccount.bankName}
          </span>
        </td>
        <td className="px-6 py-4">
          <Paragraph1 className="text-gray-900 font-semibold">
            {formatCurrency(withdrawal.amount)}
          </Paragraph1>
        </td>
        <td className="px-6 py-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadgeColor(withdrawal.status)}`}
          >
            {withdrawal.status}
          </span>
        </td>
        <td className="px-6 py-4">
          <Paragraph1 className="text-gray-600">
            {getLastUpdatedDate(withdrawal.requestedDate)}
          </Paragraph1>
        </td>
        <td className="px-6 py-4">
          {withdrawal.status === "pending" ? (
            <button
              onClick={() => setIsConfirmModalOpen(true)}
              disabled={mutation.isPending}
              className="px-3 py-1 bg-black text-white rounded text-xs font-medium hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Processing...
                </>
              ) : (
                "Mark as Paid"
              )}
            </button>
          ) : (
            <Paragraph1 className="text-gray-500">No action</Paragraph1>
          )}
        </td>
      </tr>
      <ConfirmPaidModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleMarkAsPaid}
        withdrawal={withdrawal}
        isLoading={mutation.isPending}
      />
    </>
  );
}

export default function WithdrawalRequestTable({
  searchQuery,
}: WithdrawalRequestTableProps) {
  const withdrawalQuery = useWithdrawalRequests({ search: searchQuery });

  const filteredData = useMemo(() => {
    if (!withdrawalQuery.data?.data?.withdrawals) return [];
    return withdrawalQuery.data.data.withdrawals.filter(
      (item: any) =>
        item.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.user.email.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [withdrawalQuery.data, searchQuery]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-6 py-4 text-left">
              <Paragraph1 className="text-gray-900 font-semibold">
                USER
              </Paragraph1>
            </th>
            <th className="px-6 py-4 text-left">
              <Paragraph1 className="text-gray-900 font-semibold">
                BANK ACCOUNT
              </Paragraph1>
            </th>
            <th className="px-6 py-4 text-left">
              <Paragraph1 className="text-gray-900 font-semibold">
                AMOUNT
              </Paragraph1>
            </th>
            <th className="px-6 py-4 text-left">
              <Paragraph1 className="text-gray-900 font-semibold">
                STATUS
              </Paragraph1>
            </th>
            <th className="px-6 py-4 text-left">
              <Paragraph1 className="text-gray-900 font-semibold">
                REQUESTED DATE
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
          {withdrawalQuery.isPending ? (
            <tr>
              <td colSpan={6} className="px-6 py-8 text-center">
                <p className="text-gray-500">Loading withdrawal requests...</p>
              </td>
            </tr>
          ) : filteredData.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-8 text-center">
                <p className="text-gray-500">No withdrawal requests found</p>
              </td>
            </tr>
          ) : (
            filteredData.map((withdrawal: any) => (
              <WithdrawalRequestRow
                key={withdrawal.id}
                withdrawal={withdrawal}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
