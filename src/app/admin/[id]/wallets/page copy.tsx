"use client";
// ENDPOINTS: GET /api/admin/wallets/stats, GET /api/admin/wallets, GET /api/admin/wallets/escrow, GET /api/admin/wallets/transactions, POST /api/admin/wallets/export

import { useState } from "react";
import { Search, Download, FileText } from "lucide-react";
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
import MetricsCard from "./components/MetricsCard";

type TabType = "wallet" | "escrow" | "transactions";

interface MetricData {
  label: string;
  value: string;
  currency: string;
  percentage: number;
  icon: React.ReactNode;
}

const walletIcon = (
  <div className="bg-black text-white p-2 rounded">
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
  <div className="bg-black text-white p-2 rounded">
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

const curatorIcon = (
  <div className="bg-black text-white p-2 rounded">
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
    >
      <polyline points="23 6 13 16 8 11"></polyline>
    </svg>
  </div>
);

const earningsIcon = (
  <div className="bg-black text-white p-2 rounded">
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

  // Fetch data from APIs
  const statsQuery = useWalletStats();
  const walletsQuery = useWallets({ search: searchQuery });
  const escrowsQuery = useEscrows({ search: searchQuery });
  const transactionsQuery = useWalletTransactions({ search: searchQuery });

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
  const metrics: MetricData[] = statsQuery.data?.data
    ? [
        {
          label: "Total Wallet Balance",
          value: formatCurrency(statsQuery.data.data.totalWalletBalance.amount),
          currency: statsQuery.data.data.totalWalletBalance.currency,
          percentage: statsQuery.data.data.totalWalletBalance.percentage,
          icon: walletIcon,
        },
        {
          label: "Total Escrow (Locked)",
          value: formatCurrency(statsQuery.data.data.totalEscrowLocked.amount),
          currency: statsQuery.data.data.totalEscrowLocked.currency,
          percentage: statsQuery.data.data.totalEscrowLocked.percentage,
          icon: escrowIcon,
        },
        {
          label: "Released to Curators",
          value: formatCurrency(statsQuery.data.data.releasedToCurators.amount),
          currency: statsQuery.data.data.releasedToCurators.currency,
          percentage: statsQuery.data.data.releasedToCurators.percentage,
          icon: curatorIcon,
        },
        {
          label: "Platform Earnings",
          value: formatCurrency(statsQuery.data.data.platformEarnings.amount),
          currency: statsQuery.data.data.platformEarnings.currency,
          percentage: statsQuery.data.data.platformEarnings.percentage,
          icon: earningsIcon,
        },
      ]
    : [];

  return (
    <div className="min-h-screen ">
      {/* Header Section */}
      <div className="mb-8">
        <Paragraph2 className="text-gray-900 mb-2">
          Wallet & Escrow Management
        </Paragraph2>
        <Paragraph1 className="text-gray-600">
          Monitor transactions, manage locked funds, and track platform
          earnings.
        </Paragraph1>
      </div>

      {/* Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsQuery.isPending ? (
          <MetricCardsSkeleton count={4} />
        ) : (
          metrics.map((metric, index) => (
            <MetricsCard key={index} {...metric} />
          ))
        )}
      </div>

      {/* Filters and Export Section */}
      <div className="bg-white rounded-lg py-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex-1 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by user name or order ID"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">
            <Download size={18} />
            Export CSV
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">
            <FileText size={18} />
            Export PDF
          </button>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="bg-white rounded-lg overflow-hidden">
        <div className="flex border-b border-gray-200">
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
        </div>

        {/* Table Content */}
        <div className="py-6">
          {activeTab === "wallet" && <WalletTable searchQuery={searchQuery} />}
          {activeTab === "escrow" && <EscrowTable searchQuery={searchQuery} />}
          {activeTab === "transactions" && (
            <TransactionsTable searchQuery={searchQuery} />
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
