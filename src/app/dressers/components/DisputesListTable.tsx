import React from "react";
import { Paragraph1 } from "@/common/ui/Text";
// Import necessary icons from Lucide
import {
  ChevronRight, // Action
  XCircle, // Rejected (x icon)
  Clock, // Pending Review (clock icon)
  FileText, // In Review (docs icon - commonly used in Lucide for documents)
  CheckCircle, // Resolved (circle checked icon)
} from "lucide-react";

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
              <DisputeDetails />{" "}
            </div>
          </div>
        ))}
      </div>

      {/* Removed the 'Scroll horizontally' note as we changed the layout for small screens */}
    </div>
  );
};

// --- Example Usage (remains the same) ---

import DisputeSearchBar from "./DisputeSearchBar";
import DisputeDetails from "./DisputeDetails";

const ExampleDisputesList: React.FC = () => {
  const sampleDisputes: Dispute[] = [
    {
      disputeId: "DQ-0234",
      itemName: "Vintage Chanel Blazer",
      curator: "Sarah Mitchell",
      status: "In Review",
      dateSubmitted: "28 Oct 2025",
    },
    {
      disputeId: "DQ-0189",
      itemName: "Dior Saddle Bag",
      curator: "Emma Johnson",
      status: "Pending Review",
      dateSubmitted: "01 Nov 2025",
    },
    {
      disputeId: "DQ-0156",
      itemName: "Hermès Silk Scarf",
      curator: "Olivia Brown",
      status: "Resolved",
      dateSubmitted: "15 Oct 2025",
    },
    {
      disputeId: "DQ-0098",
      itemName: "Gucci Loafers",
      curator: "Sophia Davis",
      status: "Rejected",
      dateSubmitted: "05 Oct 2025",
    },
  ];

  return (
    <div className="mt-8 bg-gray-50">
      <DisputeSearchBar />
      <DisputeTable disputes={sampleDisputes} />
    </div>
  );
};

export default ExampleDisputesList;
