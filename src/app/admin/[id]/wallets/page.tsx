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
  ShoppingBag,
  TrendingUp,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import AdminPageHeader from "@/app/admin/components/AdminPageHeader";
import { MetricCardsSkeleton } from "@/common/ui/SkeletonLoaders";
import { Paragraph1, Paragraph2 } from "@/common/ui/Text";
import { walletsApi } from "@/lib/api/admin/";
import {
  useEscrows,
  useWalletStats,
  useWallets,
  useWithdrawalRequests,
} from "@/lib/queries/admin/useWallets";
import { useAdminIdStore } from "@/store/useAdminIdStore";
import { AdminTabBar, AdminTabButton } from "../../components/AdminSectionTabs";
import EscrowTable from "./components/EscrowTable";
import MetricsCard from "./components/MetricsCard";
import RecentTransactionsPanel from "./components/RecentTransactionsPanel";
import RecentWithdrawalRequestsPanel from "./components/RecentWithdrawalRequestsPanel";
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

  const selectedTab = activeTab;

  useEffect(() => {
    const urlTab = asTab(searchParams.get("tab"));
    if (urlTab) setActiveTab(urlTab);
  }, [searchParams]);

  const changeTab = (tab: string) => {
    const next = asTab(tab) ?? "overview";
    setActiveTab(next);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", next);
    window.history.pushState(null, "", url.toString());
  };

  // Fetch data from APIs - only when tab is active (lazy loading)
  const statsQuery = useWalletStats();
  const withdrawalRequestsQuery = useWithdrawalRequests({
    page: 1,
    limit: 1,
  });
  const walletsQuery = useWallets({
    search: searchQuery,
    enabled: selectedTab === "wallet",
  });
  const escrowsQuery = useEscrows({
    search: searchQuery,
    enabled: selectedTab === "escrow",
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
  const withdrawalRequestCount =
    withdrawalRequestsQuery.data?.data?.pagination.total;

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
          label: "Wallet balances",
          value: formatCurrency(stats.totalWalletBalance || 0),
          currency: "₦",
          icon: <Wallet className="h-5 w-5" />,
          detail: "Includes renter collateral.",
        },
        {
          label: "Order escrow (locked)",
          value: formatCurrency(stats.totalEscrowBalance || 0),
          currency: "₦",
          icon: <Lock className="h-5 w-5" />,
          detail: "Rental, resale and cleaning funds awaiting release.",
        },
        {
          label: "Total paid to listers",
          value: formatCurrency(stats.totalReleasedToListers || 0),
          currency: "₦",
          icon: <Landmark className="h-5 w-5" />,
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

  const isTableTab = selectedTab !== "overview";

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <AdminPageHeader
        title="Finance"
        description="Manage payments and payouts."
      />

      {selectedTab === "overview" ? (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statsQuery.isPending ? (
            <MetricCardsSkeleton count={8} />
          ) : statsQuery.isError ? (
            <p className="col-span-full rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Finance summary could not be loaded.
            </p>
          ) : (
            metrics.map((metric) => (
              <MetricsCard key={metric.label} {...metric} />
            ))
          )}
        </div>
      ) : null}

      {/* Tabs Section */}
      <div className="overflow-hidden rounded-lg bg-white">
        <AdminTabBar>
          <AdminTabButton
            active={selectedTab === "overview"}
            onClick={() => changeTab("overview")}
            label="Overview"
          />
          <AdminTabButton
            active={selectedTab === "withdrawal-requests"}
            onClick={() => changeTab("withdrawal-requests")}
            label={
              withdrawalRequestCount === undefined
                ? "Withdrawal Requests"
                : `Withdrawal Requests (${withdrawalRequestCount})`
            }
          />
          <AdminTabButton
            active={selectedTab === "wallet"}
            onClick={() => changeTab("wallet")}
            label="Wallets"
          />
          <AdminTabButton
            active={selectedTab === "escrow"}
            onClick={() => changeTab("escrow")}
            label="Escrow"
          />
          <AdminTabButton
            active={selectedTab === "transactions"}
            onClick={() => changeTab("transactions")}
            label="Transactions"
          />
        </AdminTabBar>

        {/* Table Content */}
        {isTableTab ? (
          <div className="flex flex-col gap-3 border-b border-gray-200 p-4 sm:flex-row sm:items-end sm:p-5">
            <div className="min-w-0 flex-1">
              <label
                htmlFor="finance-record-search"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600"
              >
                Search records
              </label>
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                  aria-hidden
                />
                <input
                  id="finance-record-search"
                  type="text"
                  placeholder="Search by user name or reference"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-11 w-full rounded-xl border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
            </div>
            {selectedTab === "transactions" ? (
              <button
                type="button"
                onClick={handleExport}
                disabled={isExporting}
                className="inline-flex h-11 items-center justify-center gap-2 self-start rounded-lg border border-gray-300 bg-white px-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-50 disabled:opacity-60"
              >
                {isExporting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Download size={16} />
                )}
                Export CSV
              </button>
            ) : null}
          </div>
        ) : null}

        <div className="p-4 sm:p-5">
          <div
            className={`grid grid-cols-1 items-start gap-5 ${
              selectedTab === "overview"
                ? "xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]"
                : ""
            }`}
          >
            <div className="min-w-0">
              {selectedTab === "wallet" && (
                <WalletTable searchQuery={searchQuery} />
              )}
              {selectedTab === "escrow" && (
                <EscrowTable searchQuery={searchQuery} />
              )}
              {selectedTab === "transactions" && (
                <TransactionsTable searchQuery={searchQuery} />
              )}
              {selectedTab === "withdrawal-requests" && (
                <WithdrawalRequestTable searchQuery={searchQuery} />
              )}
              {selectedTab === "overview" && (
                <div className="space-y-4">
                  <RecentWithdrawalRequestsPanel adminId={adminId} />
                  <section className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4 text-gray-500" />
                      <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900">
                        Finance report
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={handleExport}
                      disabled={isExporting}
                      className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 text-left transition hover:bg-gray-100 disabled:opacity-60 sm:max-w-sm"
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
                  <p className="text-sm text-gray-500">
                    For revenue trends, visit{" "}
                    <Link
                      href={`/admin/${adminId}/insights`}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      Insights
                    </Link>
                    .
                  </p>
                </div>
              )}
            </div>
            {selectedTab === "overview" ? (
              <div className="space-y-4">
                <RecentTransactionsPanel adminId={adminId} />
                <WithdrawalSummaryPanel adminId={adminId} />
              </div>
            ) : null}
          </div>
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
