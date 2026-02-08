"use client";
// ENDPOINTS: GET /api/listers/stats (Total Earnings, Total Orders, Active Rentals, Pending Payouts)

import React from "react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { Database, ShoppingCart, Archive, Loader } from "lucide-react";
import { ToolInfo } from "@/common/ui/ToolInfo";
import { useProfileStore } from "@/store/profileStore";

interface StatCardData {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ElementType;
  isDark?: boolean;
  info: string;
}

const statData: StatCardData[] = [
  {
    title: "Total Earnings",
    value: "₦1,550,000",
    change: "+3.16%",
    isPositive: true,
    icon: Database,
    isDark: true,
    info: "Total revenue generated from all completed rentals and sales.",
  },
  {
    title: "Total Orders",
    value: "150",
    change: "+2.24%",
    isPositive: true,
    icon: ShoppingCart,
    info: "All confirmed orders placed within the selected time range.",
  },
  {
    title: "Active Rentals",
    value: "08",
    change: "-1.18%",
    isPositive: false,
    icon: Archive,
    info: "Items currently rented out and not yet returned.",
  },
  {
    title: "Pending Payouts",
    value: "₦350,000",
    change: "+2.24%",
    isPositive: true,
    icon: Loader,
    info: "Earnings approved but not yet transferred to your wallet.",
  },
];

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
  const profile = useProfileStore((s) => s.profile);

  const name = profile?.data?.user?.name?.trim() || "New user";
  const role = profile?.data?.user?.role;
  const avatar = profile?.data?.avatarUrl || null;

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
        {statData.map((data, index) => (
          <StatCard key={index} {...data} />
        ))}
      </div>
    </div>
  );
};

export default DashboardStatsRow;
