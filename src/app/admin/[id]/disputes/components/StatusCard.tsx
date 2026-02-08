"use client";
// ENDPOINTS: GET /api/admin/disputes/stats (for card values)

import React from "react";
import { Paragraph1 } from "@/common/ui/Text";

interface StatusCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: "warning" | "info" | "success";
}

export default function StatusCard({
  label,
  value,
  icon,
  color,
}: StatusCardProps) {
  const getTextColor = () => {
    switch (color) {
      case "warning":
        return "text-yellow-700";
      case "info":
        return "text-blue-700";
      case "success":
        return "text-green-700";
      default:
        return "text-gray-700";
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div>
          <Paragraph1 className="text-gray-600 mb-2">{label}</Paragraph1>
          <div className="text-4xl font-bold">{value}</div>
        </div>
        <div>{icon}</div>
      </div>
    </div>
  );
}
