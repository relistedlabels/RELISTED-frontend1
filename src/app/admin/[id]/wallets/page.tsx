"use client";

// ENDPOINTS: GET /api/admin/wallets/stats, GET /api/admin/wallets, GET /api/admin/wallets/escrow, GET /api/admin/wallets/transactions, GET /api/admin/wallets/transactions/export (CSV), GET /api/admin/wallets/withdrawal-requests, PUT /api/admin/wallets/withdrawals/:withdrawalId/status (APPROVED | REJECTED), PUT /api/admin/wallets/withdrawal-requests/:id/paid, GET /api/admin/wallets/payouts

import {
  CalendarDays,
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
import {
  AdminComboBox,
  type AdminComboBoxOption,
} from "@/app/admin/components/AdminComboBox";
import AdminPageHeader from "@/app/admin/components/AdminPageHeader";
import { MetricCardsSkeleton } from "@/common/ui/SkeletonLoaders";
import { poppinsRegularClassName } from "@/common/ui/Text";
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
  trendLabel?: string;
  breakdown?: Array<{ label: string; value: string }>;
}

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

const periodTrend = (
  current: number,
  previous: number,
): { trendPercent: number | null; trendLabel?: string } => {
  if (previous > 0) {
    return { trendPercent: ((current - previous) / previous) * 100 };
  }
  return {
    trendPercent: null,
    trendLabel: current > 0 ? "New this period" : "No change",
  };
};

type FinancePeriod =
  | "this-week"
  | "last-week"
  | "this-month"
  | "last-month"
  | "this-quarter"
  | "last-quarter"
  | "this-year"
  | "last-year"
  | "custom";

const FINANCE_PERIOD_OPTIONS: AdminComboBoxOption[] = [
  { value: "this-week", label: "This week" },
  { value: "last-week", label: "Last week" },
  { value: "this-month", label: "This month" },
  { value: "last-month", label: "Last month" },
  { value: "this-quarter", label: "This quarter" },
  { value: "last-quarter", label: "Last quarter" },
  { value: "this-year", label: "This year" },
  { value: "last-year", label: "Last year" },
  { value: "custom", label: "Custom dates" },
];

const dateAtUtcStart = (value: string): Date =>
  new Date(`${value}T00:00:00.000Z`);

const dateInputValue = (date: Date): string => date.toISOString().slice(0, 10);

function getFinanceRange(
  period: FinancePeriod,
  customFrom: string,
  customTo: string,
): { from: string; to: string } {
  if (period === "custom") {
    const from = dateAtUtcStart(customFrom);
    const to = dateAtUtcStart(customTo);
    to.setUTCDate(to.getUTCDate() + 1);
    return { from: from.toISOString(), to: to.toISOString() };
  }

  const unit = period.endsWith("week")
    ? "week"
    : period.endsWith("month")
      ? "month"
      : period.endsWith("quarter")
        ? "quarter"
        : "year";
  const from = dateAtUtcStart(dateInputValue(new Date()));
  if (unit === "week") {
    const daysSinceMonday = (from.getUTCDay() + 6) % 7;
    from.setUTCDate(from.getUTCDate() - daysSinceMonday);
  } else if (unit === "month") {
    from.setUTCDate(1);
  } else if (unit === "quarter") {
    from.setUTCMonth(Math.floor(from.getUTCMonth() / 3) * 3, 1);
  } else {
    from.setUTCMonth(0, 1);
  }

  if (period.startsWith("last-")) {
    if (unit === "week") from.setUTCDate(from.getUTCDate() - 7);
    else if (unit === "month") from.setUTCMonth(from.getUTCMonth() - 1);
    else if (unit === "quarter") from.setUTCMonth(from.getUTCMonth() - 3);
    else from.setUTCFullYear(from.getUTCFullYear() - 1);
  }

  const to = new Date(from);
  if (unit === "week") to.setUTCDate(to.getUTCDate() + 7);
  else if (unit === "month") to.setUTCMonth(to.getUTCMonth() + 1);
  else if (unit === "quarter") to.setUTCMonth(to.getUTCMonth() + 3);
  else to.setUTCFullYear(to.getUTCFullYear() + 1);
  return { from: from.toISOString(), to: to.toISOString() };
}

function formatFinanceRange(from: string, to: string): string {
  const start = dateAtUtcStart(from.slice(0, 10));
  const end = dateAtUtcStart(to.slice(0, 10));
  end.setUTCDate(end.getUTCDate() - 1);
  const format = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
  return `${format.format(start)} – ${format.format(end)}`;
}

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
  const [financePeriod, setFinancePeriod] =
    useState<FinancePeriod>("this-month");
  const [customFrom, setCustomFrom] = useState(() =>
    dateInputValue(new Date()),
  );
  const [customTo, setCustomTo] = useState(() => dateInputValue(new Date()));

  const selectedTab = activeTab;
  const financeRange = getFinanceRange(financePeriod, customFrom, customTo);
  const financeRangeLabel = formatFinanceRange(
    financeRange.from,
    financeRange.to,
  );

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
  const statsQuery = useWalletStats(financeRange.from, financeRange.to);
  const withdrawalRequestsQuery = useWithdrawalRequests({
    status: "pending",
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
  const currentPeriod = stats?.period;
  const previousPeriod = stats?.previousPeriod;
  const withdrawalRequestCount =
    withdrawalRequestsQuery.data?.data?.pagination.total;

  const periodMetrics: MetricData[] = stats
    ? [
        {
          label: "Total revenue",
          value: formatCurrency(currentPeriod?.grossOrderValue ?? 0),
          currency: "₦",
          icon: <TrendingUp className="h-5 w-5" />,
          detail: "Order payments, including renter deposits.",
          cardBg: "bg-emerald-50 border-emerald-100",
          iconBg: "bg-emerald-100",
          iconText: "text-emerald-700",
          ...periodTrend(
            currentPeriod?.grossOrderValue ?? 0,
            previousPeriod?.grossOrderValue ?? 0,
          ),
        },
        {
          label: "Platform earnings",
          value: formatCurrency(currentPeriod?.platformEarnings ?? 0),
          currency: "₦",
          icon: <Receipt className="h-5 w-5" />,
          breakdown: [
            {
              label: "Service fees",
              value: `₦${formatCurrency(currentPeriod?.serviceFees ?? 0)}`,
            },
            {
              label: "Lister commission",
              value: `₦${formatCurrency(currentPeriod?.listerPlatformFees ?? 0)}`,
            },
          ],
          cardBg: "bg-emerald-50 border-emerald-100",
          iconBg: "bg-emerald-100",
          iconText: "text-emerald-700",
          ...periodTrend(
            currentPeriod?.platformEarnings ?? 0,
            previousPeriod?.platformEarnings ?? 0,
          ),
        },
        {
          label: "Completed orders",
          value: formatCurrency(currentPeriod?.completedOrders ?? 0),
          currency: "",
          icon: <ShoppingBag className="h-5 w-5" />,
          detail: "Orders completed during this date range.",
          cardBg: "bg-blue-50 border-blue-100",
          iconBg: "bg-blue-100",
          iconText: "text-blue-600",
          ...periodTrend(
            currentPeriod?.completedOrders ?? 0,
            previousPeriod?.completedOrders ?? 0,
          ),
        },
        {
          label: "Payouts paid",
          value: formatCurrency(
            (currentPeriod?.paidPayouts.listers ?? 0) +
              (currentPeriod?.paidPayouts.renters ?? 0),
          ),
          currency: "₦",
          icon: <Landmark className="h-5 w-5" />,
          breakdown: [
            {
              label: "Listers",
              value: `₦${formatCurrency(currentPeriod?.paidPayouts.listers ?? 0)}`,
            },
            {
              label: "Renters",
              value: `₦${formatCurrency(currentPeriod?.paidPayouts.renters ?? 0)}`,
            },
          ],
          cardBg: "bg-blue-50 border-blue-100",
          iconBg: "bg-blue-100",
          iconText: "text-blue-600",
          ...periodTrend(
            (currentPeriod?.paidPayouts.listers ?? 0) +
              (currentPeriod?.paidPayouts.renters ?? 0),
            (previousPeriod?.paidPayouts.listers ?? 0) +
              (previousPeriod?.paidPayouts.renters ?? 0),
          ),
        },
        {
          label: "VAT on orders",
          value: formatCurrency(currentPeriod?.vat ?? 0),
          currency: "₦",
          icon: <Receipt className="h-5 w-5" />,
          detail: "VAT on orders within this date range.",
          cardBg: "bg-amber-50 border-amber-100",
          iconBg: "bg-amber-100",
          iconText: "text-amber-700",
          ...periodTrend(currentPeriod?.vat ?? 0, previousPeriod?.vat ?? 0),
        },
      ]
    : [];

  const currentMetrics: MetricData[] = stats
    ? [
        {
          label: "Payouts awaiting payment",
          value: formatCurrency(
            (currentPeriod?.pendingPayouts.listers ?? 0) +
              (currentPeriod?.pendingPayouts.renters ?? 0),
          ),
          currency: "₦",
          icon: <Landmark className="h-5 w-5" />,
          breakdown: [
            {
              label: "Listers",
              value: `₦${formatCurrency(currentPeriod?.pendingPayouts.listers ?? 0)}`,
            },
            {
              label: "Renters",
              value: `₦${formatCurrency(currentPeriod?.pendingPayouts.renters ?? 0)}`,
            },
          ],
          cardBg: "bg-violet-50 border-violet-100",
          iconBg: "bg-violet-100",
          iconText: "text-violet-600",
        },
        {
          label: "Wallet balances",
          value: formatCurrency(stats.totalWalletBalance || 0),
          currency: "₦",
          icon: <Wallet className="h-5 w-5" />,
          detail: "Combined funds held across all wallets.",
          cardBg: "bg-slate-50 border-slate-200",
          iconBg: "bg-slate-200",
          iconText: "text-slate-700",
        },
        {
          label: "Funds held for orders",
          value: formatCurrency(stats.totalEscrowBalance || 0),
          currency: "₦",
          icon: <Lock className="h-5 w-5" />,
          detail: "Rental, resale and cleaning funds awaiting release.",
          cardBg: "bg-amber-50 border-amber-100",
          iconBg: "bg-amber-100",
          iconText: "text-amber-700",
        },
      ]
    : [];

  const isTableTab = selectedTab !== "overview";

  return (
    <div className={`min-h-screen ${poppinsRegularClassName}`}>
      {/* Header Section */}
      <AdminPageHeader
        title="Finance"
        description="Track order payments, platform earnings, and payouts."
      />

      {selectedTab === "overview" ? (
        <>
          <section className="mb-8">
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-gray-900">
                  Activity for selected dates
                </h2>
              </div>
              <div
                className={`grid w-full items-end gap-3 rounded-2xl border border-gray-200 bg-white p-3 lg:w-auto lg:gap-4 ${
                  financePeriod === "custom"
                    ? "sm:grid-cols-2 lg:grid-cols-[220px_220px_220px]"
                    : "sm:grid-cols-[240px_300px]"
                }`}
              >
                <div>
                  <span className="mb-1.5 block text-xs font-semibold text-gray-600">
                    Period
                  </span>
                  <AdminComboBox
                    value={financePeriod}
                    options={FINANCE_PERIOD_OPTIONS}
                    ariaLabel="Date range"
                    onChange={(value) =>
                      setFinancePeriod(value as FinancePeriod)
                    }
                    className="max-w-none"
                  />
                </div>
                {financePeriod === "custom" ? (
                  <>
                    <label className="text-xs font-semibold text-gray-600">
                      Start date
                      <input
                        type="date"
                        value={customFrom}
                        max={customTo}
                        onChange={(event) => setCustomFrom(event.target.value)}
                        className="mt-1.5 block h-11 w-full appearance-none rounded-xl border border-gray-300 bg-white px-3 py-0 text-sm leading-[2.75rem] font-medium text-gray-900 shadow-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                      />
                    </label>
                    <label className="text-xs font-semibold text-gray-600">
                      End date
                      <input
                        type="date"
                        value={customTo}
                        min={customFrom}
                        onChange={(event) => setCustomTo(event.target.value)}
                        className="mt-1.5 block h-11 w-full appearance-none rounded-xl border border-gray-300 bg-white px-3 py-0 text-sm leading-[2.75rem] font-medium text-gray-900 shadow-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                      />
                    </label>
                  </>
                ) : (
                  <div>
                    <span className="mb-1.5 block text-xs font-semibold text-gray-600">
                      Dates covered
                    </span>
                    <div
                      aria-live="polite"
                      className="flex h-11 min-w-0 items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm font-medium text-gray-700"
                    >
                      <CalendarDays
                        aria-hidden
                        className="h-4 w-4 shrink-0 text-gray-500"
                      />
                      <span>{financeRangeLabel}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {statsQuery.isPending ? (
              <MetricCardsSkeleton count={5} />
            ) : statsQuery.isError ? (
              <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                Finance summary could not be loaded.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                {periodMetrics.map((metric) => (
                  <MetricsCard key={metric.label} {...metric} />
                ))}
              </div>
            )}
          </section>
          <section className="mb-6 border-t border-gray-200 pt-7">
            <div className="mb-4">
              <h2 className="text-lg font-semibold tracking-tight text-gray-900">
                Current balances
              </h2>
            </div>
            {statsQuery.isPending ? (
              <MetricCardsSkeleton count={3} />
            ) : statsQuery.isError ? null : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {currentMetrics.map((metric) => (
                  <MetricsCard key={metric.label} {...metric} />
                ))}
              </div>
            )}
          </section>
        </>
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
