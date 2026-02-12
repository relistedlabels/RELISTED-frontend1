"use client";
// ENDPOINTS: GET /api/listers/disputes/stats (KPI data)
import React from "react";
import { Paragraph1, Paragraph2 } from "@/common/ui/Text";
import RaiseDispute from "./RaiseDispute";
import { useDisputeStats } from "@/lib/queries/listers/useDisputeStats";

interface DisputeSummaryCardProps {
  label: string;
  count: number;
  colorClass: string;
}

const DisputeSummaryCard: React.FC<DisputeSummaryCardProps> = ({
  label,
  count,
  colorClass,
}) => (
  <div className="p-5 bg-white rounded-lg border border-gray-200 flex flex-col justify-between h-24">
    <Paragraph1 className="text-sm text-gray-700">{label}</Paragraph1>
    <Paragraph2 className={`text-3xl font-bold mt-2 ${colorClass}`}>
      {count}
    </Paragraph2>
  </div>
);

const DisputesDashboard: React.FC = () => {
  const {
    data: disputeStatsData,
    isLoading,
    isError,
  } = useDisputeStats("month");

  const stats = disputeStatsData?.data;
  const totalDisputes = stats?.totalDisputes ?? 0;
  const pendingDisputes = stats?.pending ?? 0;
  const inReviewDisputes = stats?.inReview ?? 0;
  const resolvedDisputes = stats?.resolved ?? 0;

  if (isLoading || isError) {
    return (
      <div className="font-sans space-y-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
          <div className="h-3 bg-gray-100 rounded w-3/4" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="p-5 bg-white rounded-lg border border-gray-200 animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded mb-2" />
              <div className="h-6 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans">
      {/* Header and Action Button */}
      <div className="flex flex-wrap gap-4 justify-between items-start mb-6">
        <div>
          <Paragraph1 className="text-sm text-gray-600 mt-1">
            Track and manage disputes you've raised.
          </Paragraph1>
        </div>

        {/* Raise New Dispute Button */}
        <RaiseDispute />
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <DisputeSummaryCard
          label="Total Disputes"
          count={totalDisputes}
          colorClass="text-gray-900"
        />

        <DisputeSummaryCard
          label="Pending"
          count={pendingDisputes}
          colorClass="text-yellow-600"
        />

        <DisputeSummaryCard
          label="In Review"
          count={inReviewDisputes}
          colorClass="text-yellow-600"
        />

        <DisputeSummaryCard
          label="Resolved"
          count={resolvedDisputes}
          colorClass="text-green-600"
        />
      </div>
    </div>
  );
};

export default DisputesDashboard;
