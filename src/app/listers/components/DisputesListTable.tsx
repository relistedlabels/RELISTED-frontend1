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
  status: "In Review" | "Pending Review" | "Resolved" | "Rejected";
  dateSubmitted: string;
}

interface DisputeTableProps {
  disputes: Dispute[];
}

const mapApiStatusToLabel = (
  status: ApiDispute["status"],
): Dispute["status"] => {
  switch (status) {
    case "pending_review":
      return "Pending Review";
    case "in_review":
      return "In Review";
    case "resolved":
      return "Resolved";
    case "rejected":
      return "Rejected";
    default:
      return "Pending Review";
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
    default:
      colorClass = "bg-gray-100 text-gray-800";
      IconComponent = null;
  }

  return (
    <span
      className={`inline-flex items-center px-3 py-2 rounded-full text-xs font-medium ${colorClass} whitespace-nowrap`}
    >
      {/* Render Icon if available */}
      {IconComponent && <IconComponent className="w-4 h-4 mr-1" />}
      {/* Removed surrounding Paragraph1 here, as the badge text is short and should inherit text size */}
      {status}
    </span>
  );
};

const DisputeTable: React.FC<DisputeTableProps> = ({ disputes }) => {
  return (
    // On small screens, prevent initial overflow-x-auto unless needed.
    // We will let the desktop layout handle horizontal scrolling if necessary.
    <div className="font-sans mb-8 bg-white rounded-lg border border-gray-200  sm:overflow-x-auto">
      {/* This main div now only controls the table content */}
      <div className="sm:min-w-full">
        {/* Header Row: Hidden on mobile (default) but visible on small screens (sm:grid) and up. */}
        <div className="hidden sm:grid grid-cols-12 gap-4 text-xs font-semibold text-gray-700 uppercase px-6 py-4 border-b border-gray-200 bg-gray-200">
          <span className="col-span-2">Dispute ID</span>
          <span className="col-span-3">Item Name</span>
          <span className="col-span-2">Curator</span>
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
            <div className="flex justify-between items-center sm:block sm:col-span-2">
              <span className="sm:hidden text-xs font-semibold text-gray-500 uppercase">
                ID:
              </span>
              <Paragraph1 className="text-sm text-gray-700 font-medium sm:font-normal">
                {dispute.disputeId}
              </Paragraph1>
            </div>

            {/* Item Name - Full width on mobile, col-span-3 on desktop */}
            <div className="flex justify-between items-center sm:block sm:col-span-3">
              <span className="sm:hidden text-xs font-semibold text-gray-500 uppercase">
                Item:
              </span>
              <Paragraph1 className="text-sm font-medium text-gray-900">
                {dispute.itemName}
              </Paragraph1>
            </div>

            {/* Curator - Full width on mobile, col-span-2 on desktop */}
            <div className="flex justify-between items-center sm:block sm:col-span-2">
              <span className="sm:hidden text-xs font-semibold text-gray-500 uppercase">
                Curator:
              </span>
              <Paragraph1 className="text-sm text-gray-700">
                {dispute.curator}
              </Paragraph1>
            </div>

            {/* Status - Full width on mobile, col-span-2 on desktop */}
            <div className="flex justify-between items-center sm:block sm:col-span-2">
              <span className="sm:hidden text-xs font-semibold text-gray-500 uppercase">
                Status:
              </span>
              <div className="mt-1 sm:mt-0">
                {getStatusBadge(dispute.status)}
              </div>
            </div>

            {/* Date Submitted - Full width on mobile, col-span-2 on desktop */}
            <div className="flex justify-between items-center sm:block sm:col-span-2">
              <span className="sm:hidden text-xs font-semibold text-gray-500 uppercase">
                Date:
              </span>
              <Paragraph1 className="text-sm text-gray-700">
                {dispute.dateSubmitted}
              </Paragraph1>
            </div>

            {/* Action - Full width on mobile, col-span-1 on desktop, placed at the end of the mobile stack */}
            <div className="flex justify-end sm:col-span-1 sm:items-center pt-2 sm:pt-0 border-t border-gray-100 sm:border-t-0">
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
    return "all";
  }, [statusLabel]);

  const {
    data: disputesResponse,
    isLoading,
    isError,
  } = useDisputes(1, 10, statusParam, searchValue || undefined);

  const mappedDisputes: Dispute[] = Array.isArray(disputesResponse?.data)
    ? disputesResponse.data.map((dispute) => ({
        disputeId: dispute.disputeId,
        itemName: dispute.itemName,
        curator: dispute.curatorName,
        status: mapApiStatusToLabel(dispute.status),
        dateSubmitted: formatDate(dispute.dateSubmitted),
      }))
    : [];

  const showSkeleton = isLoading || isError;

  return (
    <div className="mt-8 bg-gray-50">
      <DisputeSearchBar
        onStatusChange={setStatusLabel}
        onSearchChange={setSearchValue}
      />

      {showSkeleton ? (
        <div className="font-sans mb-8 bg-white rounded-lg border border-gray-200">
          <div className="sm:min-w-full">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                // eslint-disable-next-line react/no-array-index-key
                key={`dispute-skeleton-${index}`}
                className="flex flex-col sm:grid sm:grid-cols-12 gap-2 sm:gap-4 px-4 py-4 sm:px-6 sm:py-4 border-b border-gray-100 animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded w-24 sm:col-span-2" />
                <div className="h-4 bg-gray-200 rounded w-40 sm:col-span-3" />
                <div className="h-4 bg-gray-200 rounded w-32 sm:col-span-2" />
                <div className="h-4 bg-gray-200 rounded w-28 sm:col-span-2" />
                <div className="h-4 bg-gray-200 rounded w-24 sm:col-span-2" />
                <div className="h-4 bg-gray-200 rounded w-8 sm:col-span-1" />
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
