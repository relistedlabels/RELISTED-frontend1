"use client";

// ENDPOINTS: GET /api/admin/wallets/stats (card values + month comparison trends)

import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type React from "react";
import { Paragraph1, ParagraphAny } from "@/common/ui/Text";

interface MetricsCardProps {
  label: string;
  value: string;
  currency: string;
  icon: React.ReactNode;
  detail?: string;
  cardBg?: string;
  iconBg?: string;
  iconText?: string;
  /** Percent change vs previous month; renders a trend badge when provided. */
  trendPercent?: number | null;
  trendLabel?: string;
  breakdown?: Array<{ label: string; value: string }>;
}

export default function MetricsCard({
  label,
  value,
  currency,
  icon,
  detail,
  cardBg = "bg-white border-gray-200",
  iconBg = "bg-gray-100",
  iconText = "text-gray-700",
  trendPercent = null,
  trendLabel,
  breakdown,
}: MetricsCardProps) {
  const rounded = Math.round(trendPercent ?? 0);
  const hasTrend = trendPercent !== null && Number.isFinite(rounded);
  const isUp = rounded > 0;
  const trendColor =
    trendPercent === null
      ? "bg-gray-100 text-gray-600"
      : isUp
        ? "bg-green-100 text-green-700"
        : rounded < 0
          ? "bg-red-100 text-red-700"
          : "bg-gray-100 text-gray-600";

  return (
    <div
      className={`h-full min-h-40 rounded-2xl border p-5 transition-colors hover:border-gray-300 ${cardBg}`}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <Paragraph1 className="text-sm leading-snug text-gray-600">
              {label}
            </Paragraph1>
            <div className="mt-2 flex items-baseline gap-1">
              <ParagraphAny className="text-lg font-semibold text-gray-900">
                {currency}
              </ParagraphAny>
              <ParagraphAny className="text-lg font-semibold text-gray-900">
                {value}
              </ParagraphAny>
            </div>
            {hasTrend || trendLabel ? (
              <span
                className={`mt-5 mb-2.5 inline-flex max-w-full items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1.5 text-[10px] font-medium leading-none ${trendColor}`}
              >
                {trendPercent !== null ? (
                  isUp ? (
                    <ArrowUpRight size={11} />
                  ) : rounded < 0 ? (
                    <ArrowDownRight size={11} />
                  ) : null
                ) : null}
                {trendLabel ? (
                  <span>{trendLabel}</span>
                ) : (
                  <>
                    <span className="font-semibold">
                      {isUp ? "+" : ""}
                      {rounded}%
                    </span>
                    <span className="text-gray-600">vs previous period</span>
                  </>
                )}
              </span>
            ) : null}
          </div>
          <div className={`shrink-0 rounded-xl p-2.5 ${iconBg} ${iconText}`}>
            {icon}
          </div>
        </div>
        <div className="mt-auto flex min-h-[52px] flex-1 flex-col justify-end pt-6">
          {breakdown ? (
            <div className="border-t border-gray-900/10 pt-3">
              <div className="grid grid-cols-2 gap-3">
                {breakdown.map((item) => (
                  <div key={item.label} className="min-w-0">
                    <span className="block truncate text-[11px] font-medium text-gray-500">
                      {item.label}
                    </span>
                    <span className="mt-0.5 block truncate text-sm font-semibold text-gray-800">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="border-t border-gray-900/10 pt-3">
              <Paragraph1 className="text-xs leading-snug text-gray-500">
                {detail}
              </Paragraph1>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
