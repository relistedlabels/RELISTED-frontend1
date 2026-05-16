"use client";
// ENDPOINTS: GET /api/admin/wallets/stats (for card metrics)

import React from "react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";

interface MetricsCardProps {
  label: string;
  value: string;
  currency: string;
  icon: React.ReactNode;
  detail?: string;
}

export default function MetricsCard({
  label,
  value,
  currency,
  icon,
  detail,
}: MetricsCardProps) {
  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Paragraph1 className="text-gray-600 text-sm leading-snug">{label}</Paragraph1>
          <div className="flex items-baseline mt-2">
            <Paragraph3 className="text-gray-900 text-lg">{currency}</Paragraph3>
            <Paragraph3 className="text-gray-900 text-lg ml-1">{value}</Paragraph3>
          </div>
          {detail ? (
            <Paragraph1 className="text-gray-500 text-xs mt-2 leading-snug">
              {detail}
            </Paragraph1>
          ) : null}
        </div>
        <div className="shrink-0">{icon}</div>
      </div>
    </div>
  );
}
