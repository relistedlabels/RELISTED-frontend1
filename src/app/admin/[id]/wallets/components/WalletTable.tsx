"use client";
// ENDPOINTS: GET /api/admin/wallets?search=&page=1&limit=20, GET /api/public/users/:userId

import React, { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import { useWallets } from "@/lib/queries/admin/useWallets";
import { usePublicUserById } from "@/lib/queries/user/usePublicUserById";

interface WalletTableProps {
  searchQuery: string;
}

// Component to display a single wallet row with user details
function WalletRow({
  wallet,
  adminSegment,
}: {
  wallet: {
    id: string;
    userId: string;
    mainBalance: number;
    availableBalance: number;
    collateralBalance: number;
    createdAt: string;
    user: {
      name: string;
      email: string;
    };
  };
  adminSegment: string;
}) {
  const { data: userDetails, isLoading } = usePublicUserById(wallet.userId);
  const userHref =
    adminSegment && wallet.userId
      ? `/admin/${adminSegment}/users/${wallet.userId}`
      : "#";

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const truncateWalletId = (id: string): string => {
    return id.substring(0, 5);
  };

  const getLastUpdatedDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getRoleBadgeColor = (role: string | undefined): string => {
    switch (role?.toLowerCase()) {
      case "lister":
        return "bg-blue-100 text-blue-700";
      case "dresser":
        return "bg-purple-100 text-purple-700";
      case "admin":
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

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <Paragraph1 className="text-gray-900 font-medium">
          {truncateWalletId(wallet.id)}
        </Paragraph1>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          {userDetails?.avatar ? (
            <img
              src={userDetails.avatar}
              alt={wallet.user.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center text-xs font-semibold">
              {getInitials(wallet.user.name)}
            </div>
          )}
          <div>
            <Paragraph1 className="font-medium text-gray-900">
              {wallet.user.name}
            </Paragraph1>
            <span className="text-xs text-gray-500">{wallet.user.email}</span>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <Paragraph1 className="text-gray-900 font-semibold">
          {formatCurrency(wallet.mainBalance)}
        </Paragraph1>
      </td>
      <td className="px-6 py-4">
        <Paragraph1 className="text-green-600 font-medium">
          {formatCurrency(wallet.availableBalance)}
        </Paragraph1>
      </td>
      <td className="px-6 py-4">
        <Paragraph1 className="text-orange-600 font-medium">
          {formatCurrency(wallet.collateralBalance)}
        </Paragraph1>
      </td>
      <td className="px-6 py-4">
        {isLoading ? (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            Loading...
          </span>
        ) : (
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getRoleBadgeColor(userDetails?.role)}`}
          >
            {userDetails?.role || "N/A"}
          </span>
        )}
      </td>
      <td className="px-6 py-4">
        <Paragraph1 className="text-gray-600">
          {getLastUpdatedDate(wallet.createdAt)}
        </Paragraph1>
      </td>
      <td className="px-6 py-4">
        <Link
          href={userHref}
          className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 font-medium"
          aria-label={`View user ${wallet.user.name}`}
        >
          <Paragraph1>View</Paragraph1> <ChevronRight size={16} />
        </Link>
      </td>
    </tr>
  );
}

export default function WalletTable({ searchQuery }: WalletTableProps) {
  const params = useParams<{ id: string }>();
  const adminSegment = params?.id ?? "";
  const walletsQuery = useWallets({ search: searchQuery });

  const filteredData = useMemo(() => {
    if (!walletsQuery.data?.data?.wallets) return [];
    const q = searchQuery.toLowerCase();
    return walletsQuery.data.data.wallets.filter((item: any) => {
      const name = item.user?.name?.toLowerCase() ?? "";
      const email = item.user?.email?.toLowerCase() ?? "";
      return name.includes(q) || email.includes(q);
    });
  }, [walletsQuery.data, searchQuery]);

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
                ROLE
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
          {walletsQuery.isPending ? (
            <tr>
              <td colSpan={8} className="px-6 py-8 text-center">
                <p className="text-gray-500">Loading wallets...</p>
              </td>
            </tr>
          ) : filteredData.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-6 py-8 text-center">
                <p className="text-gray-500">No wallets found</p>
              </td>
            </tr>
          ) : (
            filteredData.map((wallet: any) => (
              <WalletRow
                key={wallet.id}
                wallet={wallet}
                adminSegment={adminSegment}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
