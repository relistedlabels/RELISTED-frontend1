"use client";

import React, { useMemo, useState } from "react";
import { Loader2, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Paragraph1 } from "@/common/ui/Text";
import {
  useWithdrawalRequests,
  useUpdateAdminWithdrawalStatus,
  useMarkWithdrawalAsPaid,
} from "@/lib/queries/admin/useWallets";
import { usePublicUserById } from "@/lib/queries/user/usePublicUserById";
import ConfirmPaidModal from "./ConfirmPaidModal";
import ApproveWithdrawalModal from "./ApproveWithdrawalModal";
import RejectWithdrawalModal from "./RejectWithdrawalModal";
import WithdrawalActionsPickerModal from "./WithdrawalActionsPickerModal";
import {
  normalizeAdminWithdrawalStatus,
  withdrawalAdminStatusLabel,
  withdrawalShowsApprove,
  withdrawalShowsMarkPaid,
} from "../utils/withdrawalAdminStatus";

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
    status: string;
    requestedDate: string;
    paidDate?: string;
  };
}) {
  const { data: userDetails } = usePublicUserById(withdrawal.userId);
  const markPaidMutation = useMarkWithdrawalAsPaid();
  const statusMutation = useUpdateAdminWithdrawalStatus();
  const [isActionsPickerOpen, setIsActionsPickerOpen] = useState(false);
  const [isConfirmPaidOpen, setIsConfirmPaidOpen] = useState(false);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);

  const actionsBusy =
    statusMutation.isPending || markPaidMutation.isPending;

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadgeColor = (status: string): string => {
    const n = normalizeAdminWithdrawalStatus(status);
    if (n === "paid" || n === "completed") {
      return "bg-green-100 text-green-700";
    }
    if (n === "failed" || n === "rejected" || n === "cancelled") {
      return "bg-red-100 text-red-700";
    }
    if (withdrawalShowsMarkPaid(status) && !withdrawalShowsApprove(status)) {
      return "bg-blue-100 text-blue-800";
    }
    if (withdrawalShowsApprove(status)) {
      return "bg-yellow-100 text-yellow-800";
    }
    return "bg-gray-100 text-gray-700";
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

  const handleApprove = async (note?: string) => {
    try {
      await statusMutation.mutateAsync({
        withdrawalId: withdrawal.id,
        status: "APPROVED",
        note,
      });
      toast.success("Withdrawal approved.");
      setIsApproveOpen(false);
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to approve withdrawal.",
      );
    }
  };

  const handleReject = async (note?: string) => {
    try {
      await statusMutation.mutateAsync({
        withdrawalId: withdrawal.id,
        status: "REJECTED",
        note,
      });
      toast.success("Withdrawal rejected.");
      setIsRejectOpen(false);
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to reject withdrawal.",
      );
    }
  };

  const handleMarkAsPaid = async (trackingId: string) => {
    try {
      await markPaidMutation.mutateAsync({
        withdrawalId: withdrawal.id,
        trackingId,
      });
      toast.success("Withdrawal marked as paid.");
      setIsConfirmPaidOpen(false);
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to mark withdrawal as paid.",
      );
    }
  };

  const showApprove = withdrawalShowsApprove(withdrawal.status);
  const showMarkPaid = withdrawalShowsMarkPaid(withdrawal.status);
  const statusLabel = withdrawalAdminStatusLabel(withdrawal.status);

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
            {statusLabel}
          </span>
        </td>
        <td className="px-6 py-4">
          <Paragraph1 className="text-gray-600">
            {getLastUpdatedDate(withdrawal.requestedDate)}
          </Paragraph1>
        </td>
        <td className="px-6 py-4">
          {showApprove || showMarkPaid ? (
            <button
              type="button"
              onClick={() => setIsActionsPickerOpen(true)}
              disabled={actionsBusy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 bg-white text-gray-800 rounded-lg text-xs font-medium hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {actionsBusy ? (
                <Loader2 size={14} className="animate-spin shrink-0" />
              ) : (
                <MoreHorizontal size={14} className="shrink-0 text-gray-500" />
              )}
              Actions
            </button>
          ) : (
            <Paragraph1 className="text-gray-500">—</Paragraph1>
          )}
        </td>
      </tr>
      <WithdrawalActionsPickerModal
        isOpen={isActionsPickerOpen}
        onClose={() => setIsActionsPickerOpen(false)}
        withdrawal={withdrawal}
        showApprove={showApprove}
        showMarkPaid={showMarkPaid}
        onChooseApprove={() => setIsApproveOpen(true)}
        onChooseReject={() => setIsRejectOpen(true)}
        onChooseMarkPaid={() => setIsConfirmPaidOpen(true)}
      />
      <ApproveWithdrawalModal
        isOpen={isApproveOpen}
        onClose={() => setIsApproveOpen(false)}
        onConfirm={handleApprove}
        withdrawal={withdrawal}
        isLoading={statusMutation.isPending}
      />
      <RejectWithdrawalModal
        isOpen={isRejectOpen}
        onClose={() => setIsRejectOpen(false)}
        onConfirm={handleReject}
        withdrawal={withdrawal}
        isLoading={statusMutation.isPending}
      />
      <ConfirmPaidModal
        isOpen={isConfirmPaidOpen}
        onClose={() => setIsConfirmPaidOpen(false)}
        onConfirm={handleMarkAsPaid}
        withdrawal={withdrawal}
        isLoading={markPaidMutation.isPending}
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
