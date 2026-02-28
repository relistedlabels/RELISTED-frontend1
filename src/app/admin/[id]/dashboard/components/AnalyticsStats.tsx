"use client";
import { useEffect, useState } from "react";
import {
  HiOutlineUsers,
  HiOutlineScale,
  HiOutlineClock,
  HiOutlineBuildingStorefront,
  HiOutlineCurrencyDollar,
  HiOutlineChartBar,
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
      <div className="grid grid-cols-1 sm:grid-cols-3 mt-6 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 mt-6 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const stats = data.data;
  const mockLine = [
    { value: 10 },
    { value: 18 },
    { value: 14 },
    { value: 22 },
    { value: 20 },
    { value: 28 },
  ];

  const formatRevenue = (amount: number) => {
    if (amount >= 1000000) {
      return `₦${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `₦${(amount / 1000).toFixed(1)}K`;
    }
    return `₦${amount}`;
  };

  const formatNumber = (num: number | undefined | null) => {
    if (typeof num !== "number" || isNaN(num)) return "-";
    return num.toLocaleString();
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 mt-6 lg:grid-cols-3 gap-4">
      <StatCard
        icon={<HiOutlineChartBar className="w-5 h-5" />}
        value={formatNumber(stats.totalRentals)}
        label="Total Rentals"
        change="+12.5%"
        data={mockLine}
      />

      <StatCard
        icon={<HiOutlineCurrencyDollar className="w-5 h-5" />}
        value={formatRevenue(stats.totalRevenue)}
        label="Total Revenue"
        change="+18.2%"
        data={mockLine}
      />

      <StatCard
        icon={<HiOutlineBuildingStorefront className="w-5 h-5" />}
        value={formatNumber(stats.activeListings)}
        label="Active Listings"
        change="+5.3%"
        data={mockLine}
      />

      <StatCard
        icon={<HiOutlineScale className="w-5 h-5" />}
        value={stats.activeDisputes.toString()}
        label="Active Disputes"
        change="-8.1%"
        positive={false}
        data={mockLine}
      />

      <StatCard
        icon={<HiOutlineUsers className="w-5 h-5" />}
        value={formatNumber(stats.activeUsers)}
        label="Active Users"
        change="+22.4%"
        data={mockLine}
      />

      <StatCard
        icon={<HiOutlineClock className="w-5 h-5" />}
        value={`${stats.avgDeliveryTime.toFixed(1)} days`}
        label="Avg Delivery Time"
        change="-0.5 days"
        positive={false}
        data={mockLine}
      />
    </div>
  );
};

export default AnalyticsStats;
