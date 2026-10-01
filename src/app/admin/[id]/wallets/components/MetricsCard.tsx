"use client";

// ENDPOINTS: GET /api/admin/wallets/stats (card values + month comparison trends)

import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type React from "react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";

interface MetricsCardProps {
  label: string;
  value: string;
  currency: string;
  icon: React.ReactNode;
  detail?: string;
  /** Optional tint classes for the card + icon tile. */
  cardBg?: string;
  iconBg?: string;
  iconText?: string;
  /** Percent change vs previous month; renders a trend badge when provided. */
  trendPercent?: number | null;
  trendSuffix?: string;
}

export default function MetricsCard({
  label,
  value,
  currency,
  icon,
  detail,
  cardBg = "bg-white border-gray-200",
  iconBg = "bg-black",
  iconText = "text-white",
  trendPercent = null,
  trendSuffix = "vs last month",
}: MetricsCardProps) {
  const rounded = Math.round(trendPercent ?? 0);
  const hasTrend =
    trendPercent !== null && Number.isFinite(rounded) && rounded !== 0;
  const isUp = rounded > 0;

  return (
    <div
      className={`rounded-xl border p-5 transition-colors hover:border-gray-300 ${cardBg}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Paragraph1 className="text-sm leading-snug text-gray-600">
            {label}
          </Paragraph1>
          <div className="mt-2 flex items-baseline gap-1">
            <Paragraph3 className="text-lg font-semibold text-gray-900">
              {currency}
            </Paragraph3>
            <Paragraph3 className="text-lg font-semibold text-gray-900">
              {value}
            </Paragraph3>
          </div>
          {hasTrend ? (
            <span
              className={`mt-2.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                isUp ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
            >
              {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {isUp ? "+" : ""}
              {rounded}%{" "}
              <span className="font-normal text-gray-600">{trendSuffix}</span>
            </span>
          ) : null}
          {!hasTrend && detail ? (
            <Paragraph1 className="mt-2 text-xs leading-snug text-gray-500">
              {detail}
            </Paragraph1>
          ) : null}
        </div>
        <div className={`shrink-0 rounded-lg p-2 ${iconBg} ${iconText}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
