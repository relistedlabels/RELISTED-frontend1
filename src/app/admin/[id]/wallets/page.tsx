"use client";

// ENDPOINTS: GET /api/admin/wallets/stats, GET /api/admin/wallets, GET /api/admin/wallets/escrow, GET /api/admin/wallets/transactions, GET /api/admin/wallets/transactions/export (CSV), GET /api/admin/wallets/withdrawal-requests, PUT /api/admin/wallets/withdrawals/:withdrawalId/status (APPROVED | REJECTED), PUT /api/admin/wallets/withdrawal-requests/:id/paid, GET /api/admin/wallets/payouts

import {
  Download,
  FileSpreadsheet,
  Landmark,
  Loader2,
  Lock,
  Receipt,
  Search,
  Shield,
  ShoppingBag,
  TrendingUp,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import { MetricCardsSkeleton } from "@/common/ui/SkeletonLoaders";
import { Paragraph1, Paragraph2 } from "@/common/ui/Text";
import { walletsApi } from "@/lib/api/admin/";
import {
  useEscrows,
  useWalletStats,
  useWallets,
  useWalletTransactions,
} from "@/lib/queries/admin/useWallets";
import { useAdminIdStore } from "@/store/useAdminIdStore";
import { AdminTabBar, AdminTabButton } from "../../components/AdminSectionTabs";
import EscrowTable from "./components/EscrowTable";
import MetricsCard from "./components/MetricsCard";
import RecentTransactionsPanel from "./components/RecentTransactionsPanel";
import TransactionsTable from "./components/TransactionsTable";
import WalletTable from "./components/WalletTable";
import WithdrawalRequestTable from "./components/WithdrawalRequestTable";
import WithdrawalSummaryPanel from "./components/WithdrawalSummaryPanel";

type TabType =
  | "overview"
  | "withdrawal-requests"
  | "wallet"
  | "escrow"
  | "transactions";

const TAB_IDS: TabType[] = [
  "overview",
  "withdrawal-requests",
  "wallet",
  "escrow",
  "transactions",
];

const asTab = (value: string | null): TabType | null =>
  TAB_IDS.includes(value as TabType) ? (value as TabType) : null;

interface MetricData {
  label: string;
  value: string;
  currency: string;
  icon: React.ReactNode;
  detail?: string;
  cardBg?: string;
  iconBg?: string;
  iconText?: string;
  trendPercent?: number | null;
}

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

const monthOverMonthPercent = (
  current: number,
  previous: number,
): number | null => {
  if (previous > 0) {
    return ((current - previous) / previous) * 100;
  }
  return null;
};

function WalletsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const storeAdminId = useAdminIdStore((state) => state.adminId);
  const paramAdminId = Array.isArray(params.id) ? params.id[0] : params.id;
  const adminId = paramAdminId ?? storeAdminId ?? "";

  const [activeTab, setActiveTab] = useState<TabType>(
    asTab(searchParams.get("tab")) ?? "overview",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  // Keep tab in sync when navigated with ?tab= from other pages (e.g. Overview).
  useEffect(() => {
    const fromUrl = asTab(searchParams.get("tab"));
    if (fromUrl && fromUrl !== activeTab) {
      setActiveTab(fromUrl);
    }
  }, [searchParams, activeTab]);

  const changeTab = (tab: string) => {
    const next = asTab(tab) ?? "overview";
    setActiveTab(next);
    router.replace(`/admin/${adminId}/wallets?tab=${next}`, { scroll: false });
  };

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

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await walletsApi.exportTransactions();
      toast.success("Transactions report downloaded.");
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Export failed. Try again.",
      );
    } finally {
      setIsExporting(false);
    }
  };

  // Build metrics from real data
  const stats = statsQuery.data?.data;
  const currentMonth = stats?.monthComparison?.currentMonth;
  const previousMonth = stats?.monthComparison?.previousMonth;

  const sinceLaunch = stats?.orderAnalyticsCutoff
    ? `Since ${new Date(stats.orderAnalyticsCutoff).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`
    : "Since official launch";
  const excludesTest = stats?.excludesTestAccounts
    ? "Excludes staging curator and test inboxes"
    : undefined;

  const metrics: MetricData[] = stats
    ? [
        {
          label: "Revenue (this month)",
          value: formatCurrency(currentMonth?.revenue ?? 0),
          currency: "₦",
          icon: <TrendingUp className="h-5 w-5" />,
          cardBg: "bg-emerald-50 border-emerald-100",
          iconBg: "bg-emerald-100",
          iconText: "text-emerald-700",
          trendPercent: monthOverMonthPercent(
            currentMonth?.revenue ?? 0,
            previousMonth?.revenue ?? 0,
          ),
        },
        {
          label: "Completed orders (this month)",
          value: formatCurrency(currentMonth?.completedOrders ?? 0),
          currency: "",
          icon: <ShoppingBag className="h-5 w-5" />,
          cardBg: "bg-blue-50 border-blue-100",
          iconBg: "bg-blue-100",
          iconText: "text-blue-600",
          trendPercent: monthOverMonthPercent(
            currentMonth?.completedOrders ?? 0,
            previousMonth?.completedOrders ?? 0,
          ),
        },
        {
          label: "Payouts to listers (this month)",
          value: formatCurrency(currentMonth?.payoutsToListers ?? 0),
          currency: "₦",
          icon: <Landmark className="h-5 w-5" />,
          cardBg: "bg-violet-50 border-violet-100",
          iconBg: "bg-violet-100",
          iconText: "text-violet-600",
          trendPercent: monthOverMonthPercent(
            currentMonth?.payoutsToListers ?? 0,
            previousMonth?.payoutsToListers ?? 0,
          ),
        },
        {
          label: "Platform service fees (this month)",
          value: formatCurrency(currentMonth?.serviceFees ?? 0),
          currency: "₦",
          icon: <Receipt className="h-5 w-5" />,
          cardBg: "bg-amber-50 border-amber-100",
          iconBg: "bg-amber-100",
          iconText: "text-amber-600",
          trendPercent: monthOverMonthPercent(
            currentMonth?.serviceFees ?? 0,
            previousMonth?.serviceFees ?? 0,
          ),
        },
        {
          label: "Total wallet balance",
          value: formatCurrency(stats.totalWalletBalance || 0),
          currency: "₦",
          icon: <Wallet className="h-5 w-5" />,
          detail: excludesTest,
        },
        {
          label: "Order escrow (locked)",
          value: formatCurrency(stats.totalEscrowBalance || 0),
          currency: "₦",
          icon: <Lock className="h-5 w-5" />,
          detail: `${sinceLaunch}. Lister payouts held until order release.`,
        },
        {
          label: "Wallet collateral (locked)",
          value: formatCurrency(stats.totalCollateralLocked ?? 0),
          currency: "₦",
          icon: <Shield className="h-5 w-5" />,
          detail:
            excludesTest ??
            "Renter security deposits held on wallets until return is confirmed.",
        },
        {
          label: "VAT collected (this month)",
          value: formatCurrency(currentMonth?.vat ?? 0),
          currency: "₦",
          icon: <Receipt className="h-5 w-5" />,
          trendPercent: monthOverMonthPercent(
            currentMonth?.vat ?? 0,
            previousMonth?.vat ?? 0,
          ),
        },
      ]
    : [];

  const isTableTab = activeTab !== "overview";

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Paragraph2 className="mb-2 text-gray-900">Finance</Paragraph2>
          <Paragraph1 className="text-gray-600">
            Track payments, payouts and revenue.
          </Paragraph1>
        </div>
        <button
          type="button"
          onClick={handleExport}
          disabled={isExporting}
          className="flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 font-medium text-white transition hover:bg-gray-900 disabled:opacity-60"
        >
          {isExporting ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Download size={18} />
          )}
          Export
        </button>
      </div>

      {/* Metrics Section */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsQuery.isPending ? (
          <MetricCardsSkeleton count={8} />
        ) : (
          metrics.map((metric) => (
            <MetricsCard key={metric.label} {...metric} />
          ))
        )}
      </div>

      {/* Overview tab content */}
      {activeTab === "overview" ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <RecentTransactionsPanel adminId={adminId} />
            <WithdrawalSummaryPanel adminId={adminId} />
          </div>

          {/* Reports */}
          <section className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-900">
              Reports
            </h3>
            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting}
              className="flex w-full items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 text-left transition hover:border-gray-200 hover:bg-gray-100 disabled:opacity-60 sm:max-w-sm"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <FileSpreadsheet className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-semibold text-gray-900">
                  Transactions report
                </span>
                <span className="block text-[12px] text-gray-500">
                  Download the full ledger as CSV
                </span>
              </span>
              <Download className="h-4 w-4 shrink-0 text-gray-400" />
            </button>
          </section>
        </div>
      ) : null}

      {/* Filters Section (table tabs only) */}
      {isTableTab ? (
        <div className="mb-6 flex flex-col items-center justify-between gap-4 rounded-lg bg-white py-4 md:flex-row">
          <div className="w-full flex-1 md:w-auto">
            <div className="relative">
              <Search
                className="absolute left-3 top-3 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search by user name or reference"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>
        </div>
      ) : null}

      {/* Tabs Section */}
      <div className="overflow-hidden rounded-lg bg-white">
        <AdminTabBar>
          <AdminTabButton
            active={activeTab === "overview"}
            onClick={() => changeTab("overview")}
            label="Overview"
          />
          <AdminTabButton
            active={activeTab === "withdrawal-requests"}
            onClick={() => changeTab("withdrawal-requests")}
            label="Withdrawal Requests"
          />
          <AdminTabButton
            active={activeTab === "wallet"}
            onClick={() => changeTab("wallet")}
            label="Wallets"
          />
          <AdminTabButton
            active={activeTab === "escrow"}
            onClick={() => changeTab("escrow")}
            label="Escrow"
          />
          <AdminTabButton
            active={activeTab === "transactions"}
            onClick={() => changeTab("transactions")}
            label="Transactions"
          />
        </AdminTabBar>

        {/* Table Content */}
        <div className="py-6">
          {activeTab === "wallet" && <WalletTable searchQuery={searchQuery} />}
          {activeTab === "escrow" && <EscrowTable searchQuery={searchQuery} />}
          {activeTab === "transactions" && (
            <TransactionsTable searchQuery={searchQuery} />
          )}
          {activeTab === "withdrawal-requests" && (
            <WithdrawalRequestTable searchQuery={searchQuery} />
          )}
          {activeTab === "overview" && (
            <p className="px-4 text-[13px] text-gray-500">
              Switch to a tab above for detailed records, or{" "}
              <Link
                href={`/admin/${adminId}/insights`}
                className="font-medium text-blue-600 hover:underline"
              >
                open Insights
              </Link>{" "}
              for revenue trends.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function WalletsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen">
          <MetricCardsSkeleton count={8} />
        </div>
      }
    >
      <WalletsPageInner />
    </Suspense>
  );
}
