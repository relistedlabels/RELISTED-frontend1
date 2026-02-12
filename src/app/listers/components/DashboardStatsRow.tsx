"use client";
// ENDPOINTS: GET /api/listers/stats (Total Earnings, Total Orders, Active Rentals, Pending Payouts)

import React from "react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { Database, ShoppingCart, Archive, Loader } from "lucide-react";
import { ToolInfo } from "@/common/ui/ToolInfo";
import { useProfile } from "@/lib/queries/user/useProfile";
import { useDashboardStats } from "@/lib/queries/listers/useDashboardStats";

interface StatCardData {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ElementType;
  isDark?: boolean;
  info: string;
}

const getStatCardConfig = (
  title: string,
  value: number | string,
  change: number,
): StatCardData => {
  const changePercent = `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`;
  const isPositive = change >= 0;

  switch (title) {
    case "Total Earnings":
      return {
        title,
        value: typeof value === "number" ? `₦${value.toLocaleString()}` : value,
        change: changePercent,
        isPositive,
        icon: Database,
        isDark: true,
        info: "Total revenue generated from all completed rentals and sales.",
      };
    case "Total Orders":
      return {
        title,
        value: typeof value === "number" ? value.toString() : value,
        change: changePercent,
        isPositive,
        icon: ShoppingCart,
        info: "All confirmed orders placed within the selected time range.",
      };
    case "Active Rentals":
      return {
        title,
        value:
          typeof value === "number" ? value.toString().padStart(2, "0") : value,
        change: changePercent,
        isPositive,
        icon: Archive,
        info: "Items currently rented out and not yet returned.",
      };
    case "Pending Payouts":
      return {
        title,
        value: typeof value === "number" ? `₦${value.toLocaleString()}` : value,
        change: changePercent,
        isPositive,
        icon: Loader,
        info: "Earnings approved but not yet transferred to your wallet.",
      };
    default:
      return {
        title,
        value: value.toString(),
        change: changePercent,
        isPositive,
        icon: Database,
        info: "",
      };
  }
};

const StatCard: React.FC<StatCardData> = ({
  title,
  value,
  change,
  isPositive,
  icon: Icon,
  isDark = false,
  info,
}) => {
  const bgColor = isDark ? "bg-black" : "bg-white";
  const textColor = isDark ? "text-white" : "text-black";
  const titleColor = isDark ? "text-gray-300" : "text-gray-500";
  const iconColor = "text-gray-400";
  const changeColor = isPositive ? "text-green-500" : "text-red-500";

  return (
    <div
      className={`p-6 rounded-xl shadow-lg border border-gray-100 flex-1 min-w-[200px] ${bgColor}`}
    >
      <div className="flex justify-between items-start mb-1">
        <div className="flex items-center gap-1">
          <Paragraph1 className={`text-sm font-medium ${titleColor}`}>
            {title}
          </Paragraph1>
          <ToolInfo content={info} />
        </div>

        <Icon
          className={`w-5 h-5 ${iconColor} ${
            title === "Pending Payouts" ? "animate-spin" : ""
          }`}
        />
      </div>

      <Paragraph3 className={`text-3xl font-bold ${textColor} mt-1 mb-2`}>
        {value}
      </Paragraph3>

      <div className="flex items-center text-sm">
        <span className={`font-semibold text-xs ${changeColor}`}>{change}</span>
        <span
          className={`ml-1 text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}
        >
          From last month
        </span>
      </div>
    </div>
  );
};

const DashboardStatsRow: React.FC = () => {
  const { data: profile } = useProfile();
  const { data: statsData, isLoading, isError } = useDashboardStats("month");

  const name = profile?.user?.name?.trim() || "New user";

  // Error falls back to loading state for better UX

  const statConfigs = statsData?.data
    ? [
        getStatCardConfig(
          "Total Earnings",
          statsData.data.totalEarnings,
          statsData.data.earningsChange,
        ),
        getStatCardConfig(
          "Total Orders",
          statsData.data.totalOrders,
          statsData.data.ordersChange,
        ),
        getStatCardConfig(
          "Active Rentals",
          statsData.data.activeRentals,
          statsData.data.rentalsChange,
        ),
        getStatCardConfig(
          "Pending Payouts",
          statsData.data.pendingPayouts,
          statsData.data.payoutsChange,
        ),
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <Paragraph3 className="text-2xl font-semibold text-black">
          Welcome back, {name}
        </Paragraph3>
        <Paragraph1 className="text-sm text-gray-500">
          Here's Your Current Sales Overview
        </Paragraph1>
      </div>

      <div className="flex flex-wrap gap-4">
        {isLoading || isError
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="p-6 rounded-xl shadow-lg border border-gray-100 flex-1 min-w-[200px] bg-white animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-8 bg-gray-200 rounded mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            ))
          : statConfigs.map((data, index) => (
              <StatCard key={index} {...data} />
            ))}
      </div>
    </div>
  );
};

export default DashboardStatsRow;
