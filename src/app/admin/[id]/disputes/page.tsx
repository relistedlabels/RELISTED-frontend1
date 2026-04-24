"use client";

// ENDPOINTS: GET /api/admin/disputes/stats, GET /api/admin/disputes, GET /api/admin/disputes/:disputeId

import { AlertCircle, CheckCircle, Clock, Search } from "lucide-react";
import { useState } from "react";
import { StatCardSkeleton, TableSkeleton } from "@/common/ui/SkeletonLoaders";
import { Paragraph1, Paragraph2 } from "@/common/ui/Text";
import type { DisputesListStatus } from "@/lib/api/admin/disputes";
import { useDisputeStats, useDisputes } from "@/lib/queries/admin/useDisputes";
import PendingTable from "./components/PendingTable";
import ResolvedTable from "./components/ResolvedTable";
import StatusCard from "./components/StatusCard";
import UnderReviewTable from "./components/UnderReviewTable";

type TabType = "pending" | "under-review" | "resolved";

interface StatusData {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: "warning" | "info" | "success";
}

function readStatNumber(stats: unknown, keys: string[]): number | undefined {
  if (!stats || typeof stats !== "object") return undefined;
  const obj = stats as Record<string, unknown>;
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
      const asNumber = Number(value);
      if (Number.isFinite(asNumber)) return asNumber;
    }
  }
  return undefined;
}

export default function DisputesPage() {
  const [activeTab, setActiveTab] = useState<TabType>("pending");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch stats and disputes data
  const {
    data: statsData,
    isLoading: statsLoading,
    error: statsError,
  } = useDisputeStats();
  const {
    data: disputesData,
    isLoading: disputesLoading,
    error: disputesError,
  } = useDisputes({
    status:
      activeTab === "pending"
        ? ("pending" satisfies DisputesListStatus)
        : activeTab === "under-review"
          ? ("under-review" satisfies DisputesListStatus)
          : ("resolved" satisfies DisputesListStatus),
    search: searchQuery,
    page: 1,
    limit: 20,
  });
  const { data: pendingCountData } = useDisputes({
    status: "pending",
    page: 1,
    limit: 1,
  });
  const { data: underReviewCountData } = useDisputes({
    status: "under-review",
    page: 1,
    limit: 1,
  });

  // Log errors to console only
  if (statsError) console.error("Disputes stats error:", statsError);
  if (disputesError) console.error("Disputes error:", disputesError);

  const statsPayloadRaw =
    (statsData as any)?.data ?? (statsData as unknown as any) ?? undefined;
  const statsPayload = (statsPayloadRaw as any)?.stats ?? statsPayloadRaw;
  const pendingCount =
    readStatNumber(statsPayload, ["pendingCount", "pending", "pending_count"]) ??
    0;
  const underReviewCount =
    readStatNumber(statsPayload, [
      "underReviewCount",
      "inReviewCount",
      "under_review_count",
      "in_review_count",
      "underReview",
      "inReview",
    ]) ?? 0;
  const resolvedThisMonth =
    readStatNumber(statsPayload, [
      "resolvedThisMonth",
      "resolved_this_month",
      "resolvedThisMonthCount",
      "resolvedThisMonthTotal",
      "resolvedCountThisMonth",
    ]) ?? 0;
  const pendingTotalFromList =
    pendingCountData?.data?.pagination?.total ??
    pendingCountData?.data?.disputes?.length ??
    0;
  const underReviewTotalFromList =
    underReviewCountData?.data?.pagination?.total ??
    underReviewCountData?.data?.disputes?.length ??
    0;
  const pendingCountDisplay = Math.max(
    pendingCount,
    pendingTotalFromList,
  );
  const underReviewCountDisplay = Math.max(
    underReviewCount,
    underReviewTotalFromList,
  );

  const statuses: StatusData[] = [
    {
      label: "Pending Review",
      value: pendingCountDisplay,
      color: "warning",
      icon: (
        <div className="bg-yellow-100 p-3 rounded-lg text-yellow-600">
          <AlertCircle size={24} />
        </div>
      ),
    },
    {
      label: "Under Review",
      value: underReviewCountDisplay,
      color: "info",
      icon: (
        <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
          <Clock size={24} />
        </div>
      ),
    },
    {
      label: "Resolved This Month",
      value: resolvedThisMonth,
      color: "success",
      icon: (
        <div className="bg-green-100 p-3 rounded-lg text-green-600">
          <CheckCircle size={24} />
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <div className="mb-8">
        <Paragraph2 className="mb-2 text-gray-900">Disputes</Paragraph2>
        <Paragraph1 className="text-gray-600">
          Manage and resolve disputes between dressers and curators.
        </Paragraph1>
      </div>

      {/* Status Cards */}
      <div className="gap-4 grid grid-cols-1 md:grid-cols-3 mb-8">
        {statsLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          statuses.map((status) => (
            <StatusCard key={status.label} {...status} />
          ))
        )}
      </div>

      {/* Search Section */}
      <div className="bg-white mb-6 py-4 rounded-lg">
        <div className="relative">
          <Search className="top-3 left-3 absolute text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search disputes, orders or users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="py-2 pr-4 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black w-full"
          />
        </div>
      </div>

      {/* Tabs and Table Section */}
      <div className="bg-white rounded-lg overflow-hidden">
        <div className="flex border-gray-200 border-b">
          <TabButton
            active={activeTab === "pending"}
            onClick={() => setActiveTab("pending")}
            label={`Pending (${pendingCountDisplay})`}
          />
          <TabButton
            active={activeTab === "under-review"}
            onClick={() => setActiveTab("under-review")}
            label={`Under Review (${underReviewCountDisplay})`}
          />
          <TabButton
            active={activeTab === "resolved"}
            onClick={() => setActiveTab("resolved")}
            label={`Resolved (${resolvedThisMonth})`}
          />
        </div>

        {/* Table Content */}
        <div className="py-6">
          {disputesLoading || disputesError ? (
            <TableSkeleton />
          ) : (
            <>
              {activeTab === "pending" && (
                <PendingTable
                  searchQuery={searchQuery}
                  disputes={disputesData?.data.disputes}
                />
              )}
              {activeTab === "under-review" && (
                <UnderReviewTable
                  searchQuery={searchQuery}
                  disputes={disputesData?.data.disputes}
                />
              )}
              {activeTab === "resolved" && (
                <ResolvedTable
                  searchQuery={searchQuery}
                  disputes={disputesData?.data.disputes}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
}

function TabButton({ active, onClick, label }: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-6 py-4 font-medium transition-colors ${
        active
          ? "text-gray-900 border-b-2 border-gray-900"
          : "text-gray-600 hover:text-gray-900"
      }`}
    >
      <Paragraph1>{label}</Paragraph1>
    </button>
  );
}
