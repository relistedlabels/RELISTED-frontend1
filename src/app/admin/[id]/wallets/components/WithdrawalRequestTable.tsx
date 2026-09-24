"use client";

import React, { useState } from "react";
import { Loader2, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Paragraph1 } from "@/common/ui/Text";
import {
  ResponsiveDataTable,
  type ResponsiveColumnDef,
} from "@/common/ui/ResponsiveDataTable";
import {
  useWithdrawalRequests,
  useUpdateAdminWithdrawalStatus,
  useMarkWithdrawalAsPaid,
} from "@/lib/queries/admin/useWallets";
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
import AdminTablePagination, {
  EMPTY_WALLET_PAGINATION,
  useWalletTablePage,
} from "./AdminTablePagination";

interface WithdrawalRequestTableProps {
  searchQuery: string;
}

type WithdrawalRow = {
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

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);

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

const getInitials = (name: string): string =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

const getLastUpdatedDate = (dateString: string): string =>
  new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

function WithdrawalRowActions({ withdrawal }: { withdrawal: WithdrawalRow }) {
  const markPaidMutation = useMarkWithdrawalAsPaid();
  const statusMutation = useUpdateAdminWithdrawalStatus();
  const [isActionsPickerOpen, setIsActionsPickerOpen] = useState(false);
  const [isConfirmPaidOpen, setIsConfirmPaidOpen] = useState(false);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);

  const actionsBusy =
    statusMutation.isPending || markPaidMutation.isPending;

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

  if (!showApprove && !showMarkPaid) {
    return <Paragraph1 className="text-gray-500">—</Paragraph1>;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsActionsPickerOpen(true)}
        disabled={actionsBusy}
        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-800 shadow-sm hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {actionsBusy ? (
          <Loader2 size={14} className="shrink-0 animate-spin" />
        ) : (
          <MoreHorizontal size={14} className="shrink-0 text-gray-500" />
        )}
        Actions
      </button>
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

const columns: ResponsiveColumnDef<WithdrawalRow>[] = [
  {
    id: "user",
    header: "User",
    mobile: "primary",
    render: (withdrawal) => (
      <div className="flex items-center gap-3">
        {withdrawal.user.avatar ? (
          <img
            src={withdrawal.user.avatar}
            alt={withdrawal.user.name}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 text-xs font-semibold text-gray-700">
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
    ),
  },
  {
    id: "bankAccount",
    header: "Bank Account",
    mobile: "detail",
    render: (withdrawal) => (
      <div>
        <Paragraph1 className="font-medium text-gray-900">
          {withdrawal.bankAccount.accountNumber}
        </Paragraph1>
        <span className="text-xs text-gray-500">
          {withdrawal.bankAccount.bankName}
        </span>
      </div>
    ),
  },
  {
    id: "amount",
    header: "Amount",
    mobile: "detail",
    render: (withdrawal) => (
      <Paragraph1 className="font-semibold text-gray-900">
        {formatCurrency(withdrawal.amount)}
      </Paragraph1>
    ),
  },
  {
    id: "status",
    header: "Status",
    mobile: "badge",
    render: (withdrawal) => (
      <span
        className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusBadgeColor(withdrawal.status)}`}
      >
        {withdrawalAdminStatusLabel(withdrawal.status)}
      </span>
    ),
  },
  {
    id: "requestedDate",
    header: "Requested Date",
    mobile: "detail",
    render: (withdrawal) => (
      <Paragraph1 className="text-gray-600">
        {getLastUpdatedDate(withdrawal.requestedDate)}
      </Paragraph1>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    mobile: "action",
    render: (withdrawal) => <WithdrawalRowActions withdrawal={withdrawal} />,
  },
];

export default function WithdrawalRequestTable({
  searchQuery,
}: WithdrawalRequestTableProps) {
  const { page, setPage, limit } = useWalletTablePage(searchQuery);
  const withdrawalQuery = useWithdrawalRequests({
    search: searchQuery,
    page,
    limit,
  });
  const withdrawals = withdrawalQuery.data?.data?.withdrawals ?? [];
  const pagination =
    withdrawalQuery.data?.data?.pagination ?? EMPTY_WALLET_PAGINATION;

  return (
    <div>
      <ResponsiveDataTable
        rows={withdrawals as unknown as WithdrawalRow[]}
        columns={columns}
        getRowKey={(withdrawal) => withdrawal.id}
        loading={withdrawalQuery.isPending}
        loadingState={
          <div className="px-4 py-8 text-center md:px-6">
            <p className="text-gray-500">Loading withdrawal requests...</p>
          </div>
        }
        emptyState={
          <div className="px-4 py-8 text-center md:px-6">
            <p className="text-gray-500">No withdrawal requests found</p>
          </div>
        }
      />
      <AdminTablePagination
        pagination={pagination}
        onPageChange={setPage}
        isLoading={withdrawalQuery.isFetching}
      />
    </div>
  );
}
