"use client";
import { useEffect } from "react";
import {
  HiOutlineUsers,
  HiOutlineScale,
  HiOutlineClock,
  HiOutlineBuildingStorefront,
  HiOutlineCurrencyDollar,
  HiOutlineShoppingBag,
} from "react-icons/hi2";
import { useAnalyticsStats } from "@/lib/queries/admin/useAnalytics";
import { StatCardSkeleton } from "@/common/ui/SkeletonLoaders";
import StatCard from "./StatCard";

interface AnalyticsStatsProps {
  timeframe: "all_time" | "year" | "month";
  year?: number;
  month?: number;
}

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
        {[...Array(6)].map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="gap-4 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 mt-6">
        {[...Array(6)].map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const stats = data.data;

  const formatRevenue = (amount: number | undefined | null) => {
    if (typeof amount !== "number" || isNaN(amount)) return "₦0";
    if (amount >= 1000000) {
      return `₦${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `₦${(amount / 1000).toFixed(1)}K`;
    }
    return `₦${amount.toLocaleString()}`;
  };

  const formatNumber = (num: number | undefined | null) => {
    if (typeof num !== "number" || isNaN(num)) return "0";
    return num.toLocaleString();
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
        label="Successful orders"
        detail="Since official launch"
      />

      <StatCard
        icon={<HiOutlineCurrencyDollar className="w-5 h-5" />}
        value={formatRevenue(stats.totalRevenue)}
        label="Total revenue"
      />

      <StatCard
        icon={<HiOutlineBuildingStorefront className="w-5 h-5" />}
        value={formatNumber(stats.activeListings)}
        label="Active listings"
      />

      <StatCard
        icon={<HiOutlineScale className="w-5 h-5" />}
        value={(stats.activeDisputes ?? 0).toString()}
        label="Active disputes"
      />

      <StatCard
        icon={<HiOutlineUsers className="w-5 h-5" />}
        value={formatNumber(stats.activeUsers)}
        label="Active users"
        detail="Order, availability request, or app visit in this period"
      />

      <StatCard
        icon={<HiOutlineClock className="w-5 h-5" />}
        value={formatAvgDeliveryMinutes(
          stats.avgDeliveryTime,
          stats.avgDeliveryTimeMinutes,
        )}
        label="Avg delivery time"
        detail="Dispatch to delivered"
      />
    </div>
  );
};

export default AnalyticsStats;
