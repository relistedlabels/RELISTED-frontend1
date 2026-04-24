// ENDPOINTS: GET /api/renters/disputes

"use client";

import React, { useMemo, useState } from "react";
import { Paragraph1 } from "@/common/ui/Text";
import { CheckCircle, Clock, FileText, XCircle } from "lucide-react";
import { useDisputes } from "@/lib/queries/renters/useDisputes";
import { useOrders } from "@/lib/queries/renters/useOrders";
import DisputeSearchBar from "./DisputeSearchBar";
import DisputeDetails from "./DisputeDetails";

// Helper to determine badge styling AND icon
const getStatusBadge = (status: string) => {
  let colorClass = "";
  let IconComponent: React.ElementType | null = null;
  let displayStatus = "";

  const key = String(status ?? "").trim().replaceAll("-", "_").toLowerCase();

  switch (key) {
    case "in_review":
      colorClass = "bg-blue-100 text-blue-800";
      IconComponent = FileText;
      displayStatus = "In Review";
      break;
    case "pending":
    case "pending_review":
      colorClass = "bg-yellow-100 text-yellow-800";
      IconComponent = Clock;
      displayStatus = "Pending Review";
      break;
    case "resolved":
    case "reseloved":
      colorClass = "bg-green-100 text-green-800";
      IconComponent = CheckCircle;
      displayStatus = "Resolved";
      break;
    case "rejected":
      colorClass = "bg-red-100 text-red-800";
      IconComponent = XCircle;
      displayStatus = "Rejected";
      break;
    case "withdraw":
    case "withdrawn":
      colorClass = "bg-gray-100 text-gray-800";
      IconComponent = XCircle;
      displayStatus = "Withdrawn";
      break;
    default:
      colorClass = "bg-gray-100 text-gray-800";
      displayStatus = status;
  }

  return (
    <span
      className={`inline-flex items-center px-3 py-2 rounded-full text-xs font-medium ${colorClass} whitespace-nowrap`}
    >
      {IconComponent && <IconComponent className="mr-1 w-4 h-4" />}
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

  const { data: ordersData } = useOrders(undefined, 1, 100, "newest");
  const ordersByOrderId = useMemo(() => {
    const orders = (ordersData as any)?.orders ?? [];
    const map = new Map<string, any>();
    for (const o of orders) {
      if (o?.orderId) map.set(String(o.orderId), o);
    }
    return map;
  }, [ordersData]);

  const disputes = propDisputes || data?.disputes || [];

  if (isLoading) {
    return (
      <div className="bg-white mb-8 border border-gray-200 rounded-lg font-sans animate-pulse">
        <div className="space-y-4 p-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded h-12"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 mb-8 p-4 border border-red-200 rounded-lg font-sans">
        <Paragraph1 className="text-red-600">
          Failed to load disputes. Please try again.
        </Paragraph1>
      </div>
    );
  }

  if (!disputes || disputes.length === 0) {
    return (
      <div className="bg-white mb-8 p-8 border border-gray-200 rounded-lg font-sans text-center">
        <Paragraph1 className="text-gray-500">No disputes found.</Paragraph1>
      </div>
    );
  }

  return (
    <div className="bg-white mb-8 border border-gray-200 rounded-lg sm:overflow-x-auto font-sans">
      <div className="sm:min-w-full">
        <div className="hidden gap-4 sm:grid grid-cols-12 bg-gray-200 px-6 py-4 border-gray-200 border-b font-semibold text-gray-700 text-xs uppercase">
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
            <div className="sm:block flex justify-between items-center sm:col-span-2">
              <span className="sm:hidden font-semibold text-gray-500 text-xs uppercase">
                ID:
              </span>
              <Paragraph1 className="sm:font-normal font-medium text-gray-700 text-sm">
                {dispute.disputeId || dispute.id}
              </Paragraph1>
            </div>

            <div className="sm:block flex justify-between items-center sm:col-span-3">
              <span className="sm:hidden font-semibold text-gray-500 text-xs uppercase">
                Item:
              </span>
              <Paragraph1 className="font-medium text-gray-900 text-sm">
                {dispute.itemName || "N/A"}
              </Paragraph1>
            </div>

            <div className="sm:block flex justify-between items-center sm:col-span-2">
              <span className="sm:hidden font-semibold text-gray-500 text-xs uppercase">
                Lister:
              </span>
              <Paragraph1 className="text-gray-700 text-sm">
                {(() => {
                  const direct =
                    dispute.listerName ||
                    dispute.curatorName ||
                    dispute.curator ||
                    "";
                  if (direct && direct !== "Unknown") return direct;
                  const order = ordersByOrderId.get(String(dispute.orderId || ""));
                  return order?.listerName || "Unknown";
                })()}
              </Paragraph1>
            </div>

            <div className="sm:block flex justify-between items-center sm:col-span-2">
              <span className="sm:hidden font-semibold text-gray-500 text-xs uppercase">
                Status:
              </span>
              <div className="mt-1 sm:mt-0">
                {getStatusBadge(dispute.status)}
              </div>
            </div>

            <div className="sm:block flex justify-between items-center sm:col-span-2">
              <span className="sm:hidden font-semibold text-gray-500 text-xs uppercase">
                Date:
              </span>
              <Paragraph1 className="text-gray-700 text-sm">
                {new Date(
                  dispute.raisedDate || dispute.dateSubmitted,
                ).toLocaleDateString()}
              </Paragraph1>
            </div>

            <div className="flex justify-end sm:items-center sm:col-span-1 pt-2 sm:pt-0 border-gray-100 border-t sm:border-t-0">
              <DisputeDetails disputeId={dispute.disputeId} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ExampleDisputesList: React.FC = () => {
  return (
    <div className="bg-gray-50 mt-8">
      <DisputeSearchBar />
      <DisputeTable />
    </div>
  );
};

export default ExampleDisputesList;
