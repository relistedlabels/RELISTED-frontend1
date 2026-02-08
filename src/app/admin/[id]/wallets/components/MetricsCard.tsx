"use client";
// ENDPOINTS: GET /api/admin/wallets/stats (for card metrics)

import React from "react";
import { TrendingUp } from "lucide-react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";

interface MetricsCardProps {
  label: string;
  value: string;
  currency: string;
  percentage: number;
  icon: React.ReactNode;
}

export default function MetricsCard({
  label,
  value,
  currency,
  percentage,
  icon,
}: MetricsCardProps) {
  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div>
          <Paragraph1 className="text-gray-600">{label}</Paragraph1>
          <div className="flex items-baseline mt-2">
            <Paragraph3 className="text-gray-900 text-lg">
              {currency}
            </Paragraph3>
            <Paragraph3 className="text-gray-900 text-lg ml-1">
              {value}
            </Paragraph3>
          </div>
        </div>
        <div>{icon}</div>
      </div>
      <div className="flex items-center gap-1">
        <TrendingUp className="text-green-600" size={16} />
        <Paragraph1 className="text-green-600">{percentage}%</Paragraph1>
      </div>
    </div>
  );
}
