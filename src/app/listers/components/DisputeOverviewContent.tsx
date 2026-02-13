// ENDPOINTS: GET /api/listers/disputes/:disputeId/overview, GET /api/listers/disputes/:disputeId/messages
import React from "react";
import { Paragraph1 } from "@/common/ui/Text"; // Assuming your custom text component

interface DisputeOverviewContentProps {
  // Item Information
  itemName: string;
  curator: string;
  orderID: string;

  // Dispute Details
  category: string;
  dateSubmitted: string;
  preferredResolution: string;
  description: string;
}

// Sub-component for a simple Key-Value row
interface DetailRowProps {
  label: string;
  value: string;
  valueClass?: string;
}

const DetailRow: React.FC<DetailRowProps> = ({
  label,
  value,
  valueClass = "text-gray-900",
}) => (
  <div className="flex justify-between items-start mb-2">
    <Paragraph1 className="text-sm text-gray-700">{label}:</Paragraph1>
    <Paragraph1 className={`text-sm font-semibold text-right ${valueClass}`}>
      {value}
    </Paragraph1>
  </div>
);

const DisputeOverviewContent: React.FC<DisputeOverviewContentProps> = ({
  itemName,
  curator,
  orderID,
  category,
  dateSubmitted,
  preferredResolution,
  description,
}) => {
  return (
    <div className="font-sans space-y-6">
      {/* 1. ITEM INFORMATION Card */}
      <div className="p-4 bg-white border border-gray-200 rounded-xl ">
        <Paragraph1 className="text-sm font-bold text-gray-900 uppercase mb-4 pb-2 border-b border-gray-100">
          ITEM INFORMATION
        </Paragraph1>

        <DetailRow label="Item Name" value={itemName} />
        <DetailRow label="Curator" value={curator} />
        <DetailRow
          label="Order ID"
          value={orderID}
          valueClass="text-blue- underline cursor-pointer"
        />
      </div>

      {/* 2. DISPUTE DETAILS Card */}
      <div className="p-4 bg-white border border-gray-200 rounded-xl ">
        <Paragraph1 className="text-sm font-bold text-gray-900 uppercase mb-4 pb-2 border-b border-gray-100">
          DISPUTE DETAILS
        </Paragraph1>

        {/* Key-Value Details */}
        <div className="space-y-3 mb-4">
          <DetailRow label="Category" value={category} valueClass="font-bold" />
          <DetailRow label="Date Submitted" value={dateSubmitted} />
          <DetailRow
            label="Preferred Resolution"
            value={preferredResolution}
            valueClass=" font-bold"
          />
        </div>

        {/* Description Section */}
        <div className="mt-4">
          <Paragraph1 className="text-sm font-semibold text-gray-900 mb-2">
            Description:
          </Paragraph1>
          <Paragraph1 className="text-sm text-gray-700 leading-snug p-3 bg-gray-50 border border-gray-100 rounded-lg italic">
            {description}
          </Paragraph1>
        </div>
      </div>
    </div>
  );
};

// --- Example Usage matching the provided image content ---

const ExampleDisputeOverview: React.FC = () => {
  return (
    <>
      <DisputeOverviewContent
        // Item Info
        itemName="Vintage Chanel Blazer"
        curator="Sarah Mitchell"
        orderID="RL-9832"
        // Dispute Details
        category="Damaged Item"
        dateSubmitted="28 Oct 2025"
        preferredResolution="Full Refund"
        description="The blazer arrived with a visible tear on the right sleeve. This damage was not mentioned in the item description and significantly affects the wearability."
      />
    </>
  );
};
export { DisputeOverviewContent };
export default ExampleDisputeOverview;
