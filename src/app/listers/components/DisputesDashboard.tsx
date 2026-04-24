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
  <div className="flex flex-col justify-between bg-white p-5 border border-gray-200 rounded-lg h-24">
    <Paragraph1 className="text-gray-700 text-sm">{label}</Paragraph1>
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

  const stats = disputeStatsData?.data.disputeStats;
  const totalDisputes = stats?.totalDisputes ?? 0;
  const pendingDisputes = stats?.pendingDisputes ?? 0;
  const inReviewDisputes = stats?.inReviewDisputes ?? 0;
  const resolvedDisputes = stats?.resolvedDisputes ?? 0;

  if (isLoading || isError) {
    return (
      <div className="space-y-6 font-sans">
        <div className="animate-pulse">
          <div className="bg-gray-200 mb-2 rounded w-1/2 h-4" />
          <div className="bg-gray-100 rounded w-3/4 h-3" />
        </div>
        <div className="gap-4 grid grid-cols-2 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white p-5 border border-gray-200 rounded-lg animate-pulse"
            >
              <div className="bg-gray-200 mb-2 rounded h-4" />
              <div className="bg-gray-100 rounded h-6" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans">
      {/* Header and Action Button */}
      <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
        <div>
          <Paragraph1 className="mt-1 text-gray-600 text-sm">
            Track and manage disputes you've raised.
          </Paragraph1>
        </div>

        {/* Raise New Dispute Button */}
        <RaiseDispute />
      </div>

      {/* Summary Cards Grid */}
      <div className="gap-4 grid grid-cols-2 md:grid-cols-4">
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
