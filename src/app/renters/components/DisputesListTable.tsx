// ENDPOINTS: GET /api/renters/disputes

"use client";

import React, { useState } from "react";
import { Paragraph1 } from "@/common/ui/Text";
import { Clock, FileText, CheckCircle } from "lucide-react";
import { useDisputes } from "@/lib/queries/renters/useDisputes";
import DisputeSearchBar from "./DisputeSearchBar";
import DisputeDetails from "./DisputeDetails";

// Helper to determine badge styling AND icon
const getStatusBadge = (status: string) => {
  let colorClass = "";
  let IconComponent: React.ElementType | null = null;
  let displayStatus = "";

  switch (status?.toLowerCase()) {
    case "in_review":
      colorClass = "bg-blue-100 text-blue-800";
      IconComponent = FileText;
      displayStatus = "In Review";
      break;
    case "pending":
      colorClass = "bg-yellow-100 text-yellow-800";
      IconComponent = Clock;
      displayStatus = "Pending Review";
      break;
    case "resolved":
      colorClass = "bg-green-100 text-green-800";
      IconComponent = CheckCircle;
      displayStatus = "Resolved";
      break;
    default:
      colorClass = "bg-gray-100 text-gray-800";
      displayStatus = status;
  }

  return (
    <span
      className={`inline-flex items-center px-3 py-2 rounded-full text-xs font-medium ${colorClass} whitespace-nowrap`}
    >
      {IconComponent && <IconComponent className="w-4 h-4 mr-1" />}
      {displayStatus}
    </span>
  );
};

interface DisputeTableProps {
  disputes?: Array<any>;
}

const DisputeTable: React.FC<DisputeTableProps> = ({
  disputes: propDisputes,
}) => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "in_review" | "resolved"
  >("all");

  const { data, isLoading, error } = useDisputes(
    statusFilter,
    page,
    20,
    "newest",
  );

  const disputes = propDisputes || data?.disputes || [];

  if (isLoading) {
    return (
      <div className="font-sans mb-8 bg-white rounded-lg border border-gray-200 animate-pulse">
        <div className="space-y-4 p-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="font-sans mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
        <Paragraph1 className="text-red-600">
          Failed to load disputes. Please try again.
        </Paragraph1>
      </div>
    );
  }

  if (!disputes || disputes.length === 0) {
    return (
      <div className="font-sans mb-8 bg-white rounded-lg border border-gray-200 p-8 text-center">
        <Paragraph1 className="text-gray-500">No disputes found.</Paragraph1>
      </div>
    );
  }

  return (
    <div className="font-sans mb-8 bg-white rounded-lg border border-gray-200  sm:overflow-x-auto">
      <div className="sm:min-w-full">
        <div className="hidden sm:grid grid-cols-12 gap-4 text-xs font-semibold text-gray-700 uppercase px-6 py-4 border-b border-gray-200 bg-gray-200">
          <span className="col-span-2">Dispute ID</span>
          <span className="col-span-3">Item Name</span>
          <span className="col-span-2">Lister</span>
          <span className="col-span-2">Status</span>
          <span className="col-span-2">Date Submitted</span>
          <span className="col-span-1 text-right">Action</span>
        </div>

        {disputes.map((dispute, index) => (
          <div
            key={dispute.id || dispute.disputeId}
            className={`flex  flex-col sm:grid sm:grid-cols-12 gap-2 sm:gap-4 px-4 py-4 sm:px-6 sm:py-4 bg-white hover:bg-gray-50 transition duration-150 ${
              index < disputes.length - 1 ? "border-b border-gray-100" : ""
            }`}
          >
            <div className="flex justify-between items-center sm:block sm:col-span-2">
              <span className="sm:hidden text-xs font-semibold text-gray-500 uppercase">
                ID:
              </span>
              <Paragraph1 className="text-sm text-gray-700 font-medium sm:font-normal">
                {dispute.disputeId || dispute.id}
              </Paragraph1>
            </div>

            <div className="flex justify-between items-center sm:block sm:col-span-3">
              <span className="sm:hidden text-xs font-semibold text-gray-500 uppercase">
                Item:
              </span>
              <Paragraph1 className="text-sm font-medium text-gray-900">
                {dispute.itemName || "N/A"}
              </Paragraph1>
            </div>

            <div className="flex justify-between items-center sm:block sm:col-span-2">
              <span className="sm:hidden text-xs font-semibold text-gray-500 uppercase">
                Lister:
              </span>
              <Paragraph1 className="text-sm text-gray-700">
                {dispute.listerName || "N/A"}
              </Paragraph1>
            </div>

            <div className="flex justify-between items-center sm:block sm:col-span-2">
              <span className="sm:hidden text-xs font-semibold text-gray-500 uppercase">
                Status:
              </span>
              <div className="mt-1 sm:mt-0">
                {getStatusBadge(dispute.status)}
              </div>
            </div>

            <div className="flex justify-between items-center sm:block sm:col-span-2">
              <span className="sm:hidden text-xs font-semibold text-gray-500 uppercase">
                Date:
              </span>
              <Paragraph1 className="text-sm text-gray-700">
                {new Date(
                  dispute.raisedDate || dispute.dateSubmitted,
                ).toLocaleDateString()}
              </Paragraph1>
            </div>

            <div className="flex justify-end sm:col-span-1 sm:items-center pt-2 sm:pt-0 border-t border-gray-100 sm:border-t-0">
              <DisputeDetails />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ExampleDisputesList: React.FC = () => {
  return (
    <div className="mt-8 bg-gray-50">
      <DisputeSearchBar />
      <DisputeTable />
    </div>
  );
};

export default ExampleDisputesList;
