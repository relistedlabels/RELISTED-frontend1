// ENDPOINTS: GET /api/renters/disputes/stats

"use client";

import React from "react";
import { Paragraph1, Paragraph2 } from "@/common/ui/Text"; // Assuming your custom text component
import { FaPlus } from "react-icons/fa";
import RaiseDispute from "./RaiseDispute";
import { useDisputeStats } from "@/lib/queries/renters/useDisputes";

interface DisputeSummaryCardProps {
  /** The status label (e.g., "Pending") */
  label: string;
  /** The number corresponding to the status (e.g., 1) */
  count: number;
  /** The color used for the count (Tailwind class) */
  colorClass: string;
}

// Sub-component for the four summary cards
const DisputeSummaryCard: React.FC<DisputeSummaryCardProps> = ({
  label,
  count,
  colorClass,
}) => (
  <div className="p-5 bg-white rounded-lg border border-gray-200  flex flex-col justify-between h-24">
    <Paragraph1 className="text-sm text-gray-700">{label}</Paragraph1>
    <Paragraph2 className={`text-3xl font-bold mt-2 ${colorClass}`}>
      {count}
    </Paragraph2>
  </div>
);

interface DisputesDashboardProps {
  totalDisputes?: number;
  pendingDisputes?: number;
  inReviewDisputes?: number;
  resolvedDisputes?: number;
}

const DisputesDashboard: React.FC<DisputesDashboardProps> = ({
  totalDisputes: propTotal,
  pendingDisputes: propPending,
  inReviewDisputes: propInReview,
  resolvedDisputes: propResolved,
}) => {
  const { data, isLoading, error } = useDisputeStats();

  const totalDisputes = propTotal ?? data?.totalDisputes ?? 0;
  const pendingDisputes = propPending ?? data?.pendingDisputes ?? 0;
  const inReviewDisputes = propInReview ?? data?.inReviewDisputes ?? 0;
  const resolvedDisputes = propResolved ?? data?.resolvedDisputes ?? 0;

  if (isLoading) {
    return (
      <div className="font-sans animate-pulse">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="font-sans bg-red-50 border border-red-200 rounded-lg p-4">
        <Paragraph1 className="text-red-600">
          Failed to load dispute statistics. Please try again.
        </Paragraph1>
      </div>
    );
  }
  return (
    <div className="font-sans  ">
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
          colorClass="text-gray-900" // Black/Dark color for total
        />

        <DisputeSummaryCard
          label="Pending"
          count={pendingDisputes}
          colorClass="text-yellow-600" // Yellow/Orange color
        />

        <DisputeSummaryCard
          label="In Review"
          count={inReviewDisputes}
          colorClass="text-yellow-600" // Yellow/Orange color
        />

        <DisputeSummaryCard
          label="Resolved"
          count={resolvedDisputes}
          colorClass="text-green-600" // Green color
        />
      </div>
    </div>
  );
};

// --- Example Usage matching the provided image content ---

const ExampleDisputesDashboard: React.FC = () => {
  return <DisputesDashboard />;
};

export default ExampleDisputesDashboard;
