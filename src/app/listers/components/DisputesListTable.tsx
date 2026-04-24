"use client";
// ENDPOINTS: GET /api/listers/disputes (with pagination & filtering)

import React, { useMemo, useState } from "react";
import { Paragraph1 } from "@/common/ui/Text";
import { XCircle, Clock, FileText, CheckCircle } from "lucide-react";
import type { Dispute as ApiDispute } from "@/lib/api/listers";
import { useDisputes } from "@/lib/queries/listers/useDisputes";
import DisputeSearchBar from "./DisputeSearchBar";
import DisputeDetails from "./DisputeDetails";

interface Dispute {
  disputeId: string;
  itemName: string;
  curator: string;
  status: "In Review" | "Pending Review" | "Resolved" | "Rejected" | "Withdrawn";
  dateSubmitted: string;
}

interface DisputeTableProps {
  disputes: Dispute[];
}

const mapApiStatusToLabel = (status: ApiDispute["status"] | string) => {
  const key = String(status ?? "")
    .trim()
    .replaceAll("-", "_")
    .toUpperCase();

  switch (key) {
    case "PENDING_REVIEW":
    case "PENDING":
      return "Pending Review" as const;
    case "IN_REVIEW":
    case "UNDER_REVIEW":
      return "In Review" as const;
    case "RESOLVED":
    case "RESELOVED":
      return "Resolved" as const;
    case "REJECTED":
      return "Rejected" as const;
    case "WITHDRAW":
    case "WITHDRAWN":
      return "Withdrawn" as const;
    default:
      return "Pending Review" as const;
  }
};

const formatDate = (date: string): string => {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Helper to determine badge styling AND icon
const getStatusBadge = (status: Dispute["status"]) => {
  let colorClass = "";
  let IconComponent: React.ElementType | null = null;

  switch (status) {
    case "In Review":
      colorClass = "bg-blue-100 text-blue-800";
      IconComponent = FileText;
      break;
    case "Pending Review":
      colorClass = "bg-yellow-100 text-yellow-800";
      IconComponent = Clock;
      break;
    case "Resolved":
      colorClass = "bg-green-100 text-green-800";
      IconComponent = CheckCircle;
      break;
    case "Rejected":
      colorClass = "bg-red-100 text-red-800";
      IconComponent = XCircle;
      break;
    case "Withdrawn":
      colorClass = "bg-gray-100 text-gray-800";
      IconComponent = XCircle;
      break;
    default:
      colorClass = "bg-gray-100 text-gray-800";
      IconComponent = null;
  }

  return (
    <span
      className={`inline-flex items-center px-3 py-2 rounded-full text-xs font-medium ${colorClass} whitespace-nowrap`}
    >
      {/* Render Icon if available */}
      {IconComponent && <IconComponent className="mr-1 w-4 h-4" />}
      {/* Removed surrounding Paragraph1 here, as the badge text is short and should inherit text size */}
      {status}
    </span>
  );
};

const DisputeTable: React.FC<DisputeTableProps> = ({ disputes }) => {
  return (
    // On small screens, prevent initial overflow-x-auto unless needed.
    // We will let the desktop layout handle horizontal scrolling if necessary.
    <div className="bg-white mb-8 border border-gray-200 rounded-lg sm:overflow-x-auto font-sans">
      {/* This main div now only controls the table content */}
      <div className="sm:min-w-full">
        {/* Header Row: Hidden on mobile (default) but visible on small screens (sm:grid) and up. */}
        <div className="hidden gap-4 sm:grid grid-cols-12 bg-gray-200 px-6 py-4 border-gray-200 border-b font-semibold text-gray-700 text-xs uppercase">
          <span className="col-span-2">Dispute ID</span>
          <span className="col-span-3">Item Name</span>
          <span className="col-span-2">Lister</span>
          <span className="col-span-2">Status</span>
          <span className="col-span-2">Date Submitted</span>
          <span className="col-span-1 text-right">Action</span>
        </div>

        {/* Data Rows */}
        {disputes.map((dispute, index) => (
          <div
            key={dispute.disputeId}
            // Mobile (default): flex column layout, bordered, slight padding adjustment
            // Desktop (sm:grid): switch back to 12-column grid layout
            className={`flex  flex-col sm:grid sm:grid-cols-12 gap-2 sm:gap-4 px-4 py-4 sm:px-6 sm:py-4 bg-white hover:bg-gray-50 transition duration-150 ${
              index < disputes.length - 1 ? "border-b border-gray-100" : ""
            }`}
          >
            {/* Dispute ID - Full width on mobile, col-span-2 on desktop */}
            <div className="sm:block flex justify-between items-center sm:col-span-2">
              <span className="sm:hidden font-semibold text-gray-500 text-xs uppercase">
                ID:
              </span>
              <Paragraph1 className="sm:font-normal font-medium text-gray-700 text-sm">
                {dispute.disputeId}
              </Paragraph1>
            </div>

            {/* Item Name - Full width on mobile, col-span-3 on desktop */}
            <div className="sm:block flex justify-between items-center sm:col-span-3">
              <span className="sm:hidden font-semibold text-gray-500 text-xs uppercase">
                Item:
              </span>
              <Paragraph1 className="font-medium text-gray-900 text-sm">
                {dispute.itemName}
              </Paragraph1>
            </div>

            {/* Lister - Full width on mobile, col-span-2 on desktop */}
            <div className="sm:block flex justify-between items-center sm:col-span-2">
              <span className="sm:hidden font-semibold text-gray-500 text-xs uppercase">
                Lister:
              </span>
              <Paragraph1 className="text-gray-700 text-sm">
                {dispute.curator}
              </Paragraph1>
            </div>

            {/* Status - Full width on mobile, col-span-2 on desktop */}
            <div className="sm:block flex justify-between items-center sm:col-span-2">
              <span className="sm:hidden font-semibold text-gray-500 text-xs uppercase">
                Status:
              </span>
              <div className="mt-1 sm:mt-0">
                {getStatusBadge(dispute.status)}
              </div>
            </div>

            {/* Date Submitted - Full width on mobile, col-span-2 on desktop */}
            <div className="sm:block flex justify-between items-center sm:col-span-2">
              <span className="sm:hidden font-semibold text-gray-500 text-xs uppercase">
                Date:
              </span>
              <Paragraph1 className="text-gray-700 text-sm">
                {dispute.dateSubmitted}
              </Paragraph1>
            </div>

            {/* Action - Full width on mobile, col-span-1 on desktop, placed at the end of the mobile stack */}
            <div className="flex justify-end sm:items-center sm:col-span-1 pt-2 sm:pt-0 border-gray-100 border-t sm:border-t-0">
              <DisputeDetails disputeId={dispute.disputeId} />{" "}
            </div>
          </div>
        ))}
      </div>

      {/* Removed the 'Scroll horizontally' note as we changed the layout for small screens */}
    </div>
  );
};

const ExampleDisputesList: React.FC = () => {
  const [statusLabel, setStatusLabel] = useState<string>("All Statuses");
  const [searchValue, setSearchValue] = useState<string>("");

  const statusParam = useMemo(() => {
    if (statusLabel === "All Statuses") return "all";
    if (statusLabel === "Pending Review") return "pending_review";
    if (statusLabel === "In Review") return "in_review";
    if (statusLabel === "Resolved") return "resolved";
    if (statusLabel === "Rejected") return "rejected";
    if (statusLabel === "Withdrawn") return "withdraw";
    return "all";
  }, [statusLabel]);

  const {
    data: disputesResponse,
    isLoading,
    isError,
  } = useDisputes(1, 10, statusParam, searchValue || undefined);

  const mappedDisputes: Dispute[] = disputesResponse?.data.disputes
    ? disputesResponse.data.disputes.map((dispute) => ({
        disputeId: dispute.disputeId,
        itemName: dispute.itemName,
        curator: dispute.curator,
        status: mapApiStatusToLabel(dispute.status),
        dateSubmitted: formatDate(dispute.dateSubmitted),
      }))
    : [];

  const showSkeleton = isLoading || isError;

  return (
    <div className="bg-gray-50 mt-8">
      <DisputeSearchBar
        onStatusChange={setStatusLabel}
        onSearchChange={setSearchValue}
      />

      {showSkeleton ? (
        <div className="bg-white mb-8 border border-gray-200 rounded-lg font-sans">
          <div className="sm:min-w-full">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                // eslint-disable-next-line react/no-array-index-key
                key={`dispute-skeleton-${index}`}
                className="flex flex-col gap-2 sm:gap-4 sm:grid sm:grid-cols-12 px-4 sm:px-6 py-4 sm:py-4 border-gray-100 border-b animate-pulse"
              >
                <div className="sm:col-span-2 bg-gray-200 rounded w-24 h-4" />
                <div className="sm:col-span-3 bg-gray-200 rounded w-40 h-4" />
                <div className="sm:col-span-2 bg-gray-200 rounded w-32 h-4" />
                <div className="sm:col-span-2 bg-gray-200 rounded w-28 h-4" />
                <div className="sm:col-span-2 bg-gray-200 rounded w-24 h-4" />
                <div className="sm:col-span-1 bg-gray-200 rounded w-8 h-4" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <DisputeTable disputes={mappedDisputes} />
      )}
    </div>
  );
};

export default ExampleDisputesList;
