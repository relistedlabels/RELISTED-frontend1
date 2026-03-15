"use client";

import React, { useMemo } from "react";
import { Paragraph1 } from "@/common/ui/Text";
import { usePayouts } from "@/lib/queries/admin/useWallets";
import { usePublicUserById } from "@/lib/queries/user/usePublicUserById";

interface PayoutsTableProps {
  searchQuery: string;
}

// Component to display a single payout row
function PayoutRow({
  payout,
}: {
  payout: {
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
    status: "completed" | "paid";
    completedDate: string;
  };
}) {
  const { data: userDetails } = usePublicUserById(payout.userId);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const getCompleteDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          {userDetails?.avatar ? (
            <img
              src={userDetails.avatar}
              alt={payout.user.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center text-xs font-semibold">
              {getInitials(payout.user.name)}
            </div>
          )}
          <div>
            <Paragraph1 className="font-medium text-gray-900">
              {payout.user.name}
            </Paragraph1>
            <span className="text-xs text-gray-500">{payout.user.email}</span>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <Paragraph1 className="text-gray-900 font-medium">
          {payout.bankAccount.accountNumber}
        </Paragraph1>
        <span className="text-xs text-gray-500">
          {payout.bankAccount.bankName}
        </span>
      </td>
      <td className="px-6 py-4">
        <Paragraph1 className="text-gray-900 font-semibold">
          {formatCurrency(payout.amount)}
        </Paragraph1>
      </td>
      <td className="px-6 py-4">
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
          Completed
        </span>
      </td>
      <td className="px-6 py-4">
        <Paragraph1 className="text-gray-600">
          {getCompleteDate(payout.completedDate)}
        </Paragraph1>
      </td>
    </tr>
  );
}

export default function PayoutsTable({ searchQuery }: PayoutsTableProps) {
  const payoutsQuery = usePayouts({ search: searchQuery });

  const filteredData = useMemo(() => {
    if (!payoutsQuery.data?.data?.payouts) return [];
    return payoutsQuery.data.data.payouts.filter(
      (item: any) =>
        item.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.user.email.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [payoutsQuery.data, searchQuery]);

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
                COMPLETED DATE
              </Paragraph1>
            </th>
          </tr>
        </thead>
        <tbody>
          {payoutsQuery.isPending ? (
            <tr>
              <td colSpan={5} className="px-6 py-8 text-center">
                <p className="text-gray-500">Loading payouts...</p>
              </td>
            </tr>
          ) : filteredData.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-8 text-center">
                <p className="text-gray-500">No payouts found</p>
              </td>
            </tr>
          ) : (
            filteredData.map((payout: any) => (
              <PayoutRow key={payout.id} payout={payout} />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
