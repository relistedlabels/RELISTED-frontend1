"use client";
// ENDPOINTS: GET /api/admin/wallets/stats, GET /api/admin/wallets, GET /api/admin/wallets/escrow, GET /api/admin/wallets/transactions, POST /api/admin/wallets/export, GET /api/admin/wallets/withdrawal-requests, PUT /api/admin/wallets/withdrawals/:withdrawalId/status (APPROVED | REJECTED), PUT /api/admin/wallets/withdrawal-requests/:id/paid, GET /api/admin/wallets/payouts

import { useState } from "react";
import { Search, Download, FileText, Receipt } from "lucide-react";
import { Paragraph1, Paragraph2 } from "@/common/ui/Text";
import { MetricCardsSkeleton } from "@/common/ui/SkeletonLoaders";
import {
  useWalletStats,
  useWallets,
  useEscrows,
  useWalletTransactions,
} from "@/lib/queries/admin/useWallets";
import WalletTable from "./components/WalletTable";
import EscrowTable from "./components/EscrowTable";
import TransactionsTable from "./components/TransactionsTable";
import WithdrawalRequestTable from "./components/WithdrawalRequestTable";
import PayoutsTable from "./components/PayoutsTable";
import MetricsCard from "./components/MetricsCard";

type TabType = "wallet" | "escrow" | "transactions" | "withdrawals" | "payouts";

interface MetricData {
  label: string;
  value: string;
  currency: string;
  icon: React.ReactNode;
  detail?: string;
}

const walletIcon = (
  <div className="bg-black p-2 rounded text-white">
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
    >
      <rect x="2" y="4" width="16" height="12" rx="1" />
      <line x1="2" y1="8" x2="18" y2="8" />
    </svg>
  </div>
);

const escrowIcon = (
  <div className="bg-black p-2 rounded text-white">
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
    >
      <rect x="3" y="5" width="14" height="11" rx="1" />
      <path d="M7 5V3a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
  </div>
);

const listerPayoutIcon = (
  <div className="bg-black p-2 rounded text-white">
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
    >
      <polyline points="6 14 10 10 14 14" />
      <path d="M10 4v6" />
    </svg>
  </div>
);

const taxIcon = (
  <div className="bg-black p-2 rounded text-white">
    <Receipt width={20} height={20} strokeWidth={1.75} />
  </div>
);

const earningsIcon = (
  <div className="bg-black p-2 rounded text-white">
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
    >
      <polyline points="23 6 13 16"></polyline>
      <polyline points="13 6 23 16"></polyline>
    </svg>
  </div>
);

export default function WalletsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("wallet");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch data from APIs - only when tab is active (lazy loading)
  const statsQuery = useWalletStats();
  const walletsQuery = useWallets({
    search: searchQuery,
    enabled: activeTab === "wallet",
  });
  const escrowsQuery = useEscrows({
    search: searchQuery,
    enabled: activeTab === "escrow",
  });
  const transactionsQuery = useWalletTransactions({
    search: searchQuery,
    enabled: activeTab === "transactions",
  });

  // Log errors
  if (statsQuery.isError) {
    console.error("Wallet stats error:", statsQuery.error);
  }
  if (walletsQuery.isError) {
    console.error("Failed to fetch wallets:", walletsQuery.error);
  }
  if (escrowsQuery.isError) {
    console.error("Failed to fetch escrows:", escrowsQuery.error);
  }
  if (transactionsQuery.isError) {
    console.error("Failed to fetch transactions:", transactionsQuery.error);
  }

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Build metrics from real data
  const stats = statsQuery.data?.data;
  const releasedToListers =
    stats?.totalReleasedToListers ?? stats?.totalReleasedToCurators ?? 0;

  const metrics: MetricData[] = stats
    ? [
        {
          label: "Total Wallet Balance",
          value: formatCurrency(stats.totalWalletBalance || 0),
          currency: "₦",
          icon: walletIcon,
        },
        {
          label: "Order escrow (locked)",
          value: formatCurrency(stats.totalEscrowBalance || 0),
          currency: "₦",
          icon: escrowIcon,
          detail: "Lister payouts held until order release",
        },
        {
          label: "Wallet collateral (locked)",
          value: formatCurrency(stats.totalCollateralLocked ?? 0),
          currency: "₦",
          icon: walletIcon,
          detail:
            "Renter security deposits held on wallets until return is confirmed.",
        },
        {
          label: "Released to Listers",
          value: formatCurrency(releasedToListers),
          currency: "₦",
          icon: listerPayoutIcon,
        },
        {
          label: "Platform Earnings (Service Fees)",
          value: formatCurrency(
            stats.platformServiceFees ?? stats.platformEarnings ?? 0,
          ),
          currency: "₦",
          icon: earningsIcon,
        },
        {
          label: "Total VAT (Orders)",
          value: formatCurrency(stats.totalVatCollected ?? 0),
          currency: "₦",
          icon: taxIcon,
        },
      ]
    : [];

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <div className="mb-8">
        <Paragraph2 className="mb-2 text-gray-900">
          Payments & balances
        </Paragraph2>
        <Paragraph1 className="text-gray-600">
          Balances, held funds, withdrawals, lister payouts, and platform
          revenue.
        </Paragraph1>
      </div>

      {/* Metrics Section */}
      <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 mb-8">
        {statsQuery.isPending ? (
          <MetricCardsSkeleton count={6} />
        ) : (
          metrics.map((metric, index) => (
            <MetricsCard key={index} {...metric} />
          ))
        )}
      </div>

      {/* Filters and Export Section */}
      <div className="flex md:flex-row flex-col justify-between items-center gap-4 bg-white mb-6 py-4 rounded-lg">
        <div className="flex-1 w-full md:w-auto">
          <div className="relative">
            <Search className="top-3 left-3 absolute text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by user name or order ID"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="py-2 pr-4 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black w-full"
            />
          </div>
        </div>
        <div className="hidden flex- gap-2 w-full md:w-auto">
          <button className="flex items-center gap-2 hover:bg-gray-50 px-4 py-2 border border-gray-300 rounded-lg font-medium">
            <Download size={18} />
            Export CSV
          </button>
          <button className="flex items-center gap-2 hover:bg-gray-50 px-4 py-2 border border-gray-300 rounded-lg font-medium">
            <FileText size={18} />
            Export PDF
          </button>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="bg-white rounded-lg overflow-hidden">
        <div className="flex border-gray-200 border-b">
          <TabButton
            active={activeTab === "wallet"}
            onClick={() => setActiveTab("wallet")}
            label="Wallet"
          />
          <TabButton
            active={activeTab === "escrow"}
            onClick={() => setActiveTab("escrow")}
            label="Escrow"
          />
          <TabButton
            active={activeTab === "transactions"}
            onClick={() => setActiveTab("transactions")}
            label="Transactions"
          />
          <TabButton
            active={activeTab === "withdrawals"}
            onClick={() => setActiveTab("withdrawals")}
            label="Withdrawal Requests"
          />
          <TabButton
            active={activeTab === "payouts"}
            onClick={() => setActiveTab("payouts")}
            label="Payouts"
          />
        </div>

        {/* Table Content */}
        <div className="py-6">
          {activeTab === "wallet" && <WalletTable searchQuery={searchQuery} />}
          {activeTab === "escrow" && <EscrowTable searchQuery={searchQuery} />}
          {activeTab === "transactions" && (
            <TransactionsTable searchQuery={searchQuery} />
          )}
          {activeTab === "withdrawals" && (
            <WithdrawalRequestTable searchQuery={searchQuery} />
          )}
          {activeTab === "payouts" && (
            <PayoutsTable searchQuery={searchQuery} />
          )}
        </div>
      </div>
    </div>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
}

function TabButton({ active, onClick, label }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-4 font-medium transition-colors ${
        active
          ? "text-gray-900 border-b-2 border-gray-900"
          : "text-gray-600 hover:text-gray-900"
      }`}
    >
      <Paragraph1>{label}</Paragraph1>
    </button>
  );
}
