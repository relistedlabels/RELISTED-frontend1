"use client";
import { useEffect } from "react";
import {
  HiOutlineBuildingStorefront,
  HiOutlineChartBar,
  HiOutlineClock,
  HiOutlineCurrencyDollar,
  HiOutlineScale,
  HiOutlineShoppingBag,
  HiOutlineUsers,
} from "react-icons/hi2";
import { StatCardSkeleton } from "@/common/ui/SkeletonLoaders";
import { useAnalyticsStats } from "@/lib/queries/admin/useAnalytics";
import StatCard from "./StatCard";

interface AnalyticsStatsProps {
  timeframe: "all_time" | "year" | "month";
  year?: number;
  month?: number;
}

const SKELETON_KEYS = ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8"];

const AnalyticsStats = ({ timeframe, year, month }: AnalyticsStatsProps) => {
  const { data, isLoading, error } = useAnalyticsStats({
    timeframe,
    year,
    month,
  });

  useEffect(() => {
    if (error) {
      console.error("Failed to load analytics stats:", error);
    }
  }, [error]);

  if (isLoading) {
    return (
      <div className="gap-4 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 mt-6">
        {SKELETON_KEYS.map((key) => (
          <StatCardSkeleton key={key} />
        ))}
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
        Analytics metrics could not be loaded. Refresh the page or check the
        admin analytics API.
      </div>
    );
  }

  const stats = data.data;

  const formatRevenue = (amount: number | undefined | null) => {
    if (typeof amount !== "number" || Number.isNaN(amount)) return "₦0";
    if (amount >= 1000000) {
      return `₦${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `₦${(amount / 1000).toFixed(1)}K`;
    }
    return `₦${amount.toLocaleString()}`;
  };

  const formatNumber = (num: number | undefined | null) => {
    if (typeof num !== "number" || Number.isNaN(num)) return "0";
    return num.toLocaleString();
  };

  const comparisonDetail = (
    current: number,
    previous: number | undefined,
    format: (value: number) => string,
  ) => {
    if (previous === undefined) return undefined;
    const difference = current - previous;
    const formattedDifference =
      difference < 0
        ? `-${format(Math.abs(difference))}`
        : difference > 0
          ? `+${format(difference)}`
          : format(0);
    const change =
      previous > 0
        ? ` (${difference > 0 ? "+" : ""}${Math.round((difference / previous) * 100)}%)`
        : current > 0
          ? " (up from 0)"
          : "";
    return `${formattedDifference} vs previous period${change}`;
  };

  const formatAvgDeliveryMinutes = (
    days: number | string | undefined | null,
    minutesFromApi?: number | string | null,
  ) => {
    const minutes = Number(minutesFromApi);
    if (Number.isFinite(minutes) && minutes > 0) {
      return `${Math.round(minutes).toLocaleString()} min`;
    }
    const d = Number(days);
    if (!Number.isFinite(d) || d <= 0) return "0 min";
    return `${Math.round(d * 24 * 60).toLocaleString()} min`;
  };

  return (
    <div className="gap-4 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 mt-6">
      <StatCard
        icon={<HiOutlineShoppingBag className="w-5 h-5" />}
        value={formatNumber(stats.totalOrders)}
        label="Non-cancelled orders"
        detail={comparisonDetail(
          stats.totalOrders,
          stats.previousPeriod?.orders,
          formatNumber,
        )}
      />

      <StatCard
        icon={<HiOutlineCurrencyDollar className="w-5 h-5" />}
        value={formatRevenue(stats.totalRevenue)}
        label="Gross order value"
        detail={comparisonDetail(
          stats.totalRevenue,
          stats.previousPeriod?.revenue,
          formatRevenue,
        )}
      />

      <StatCard
        icon={<HiOutlineCurrencyDollar className="w-5 h-5" />}
        value={formatRevenue(
          stats.totalOrders > 0 ? stats.totalRevenue / stats.totalOrders : 0,
        )}
        label="Average order value"
        detail="Gross order value per non-cancelled order"
      />

      <StatCard
        icon={<HiOutlineBuildingStorefront className="w-5 h-5" />}
        value={formatNumber(stats.activeListings)}
        label="Live listings"
        detail="Current supply snapshot"
      />

      <StatCard
        icon={<HiOutlineScale className="w-5 h-5" />}
        value={(stats.activeDisputes ?? 0).toString()}
        label="Open disputes"
        detail="Current operations snapshot"
      />

      <StatCard
        icon={<HiOutlineUsers className="w-5 h-5" />}
        value={formatNumber(stats.activeUsers)}
        label="Active users"
        detail="Engaged in selected period"
      />

      <StatCard
        icon={<HiOutlineChartBar className="w-5 h-5" />}
        value={`${(stats.disputeRate * 100).toFixed(1)}%`}
        label="Disputed order share"
        detail={`${formatNumber(stats.ordersWithDisputes)} of ${formatNumber(stats.totalOrders)} selected-period orders have a dispute`}
      />

      <StatCard
        icon={<HiOutlineClock className="w-5 h-5" />}
        value={formatAvgDeliveryMinutes(
          stats.avgDeliveryTime,
          stats.avgDeliveryTimeMinutes,
        )}
        label="Avg delivery time"
        detail={`Dispatch to delivered · ${formatNumber(stats.deliveryTimeSampleSize)} delivered orders`}
      />
    </div>
  );
};

export default AnalyticsStats;
