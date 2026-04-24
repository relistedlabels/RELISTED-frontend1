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
    <Paragraph1 className="text-gray-700 text-sm">{label}:</Paragraph1>
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
    <div className="space-y-6 font-sans">
      {/* 1. ITEM INFORMATION Card */}
      <div className="bg-white p-4 border border-gray-200 rounded-xl">
        <Paragraph1 className="mb-4 pb-2 border-gray-100 border-b font-bold text-gray-900 text-sm uppercase">
          ITEM INFORMATION
        </Paragraph1>

        <DetailRow label="Item Name" value={itemName} />
        <DetailRow label="Lister" value={curator} />
        <DetailRow
          label="Order ID"
          value={orderID}
          valueClass="text-blue- underline cursor-pointer"
        />
      </div>

      {/* 2. DISPUTE DETAILS Card */}
      <div className="bg-white p-4 border border-gray-200 rounded-xl">
        <Paragraph1 className="mb-4 pb-2 border-gray-100 border-b font-bold text-gray-900 text-sm uppercase">
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
          <Paragraph1 className="mb-2 font-semibold text-gray-900 text-sm">
            Description:
          </Paragraph1>
          <Paragraph1 className="bg-gray-50 p-3 border border-gray-100 rounded-lg text-gray-700 text-sm italic leading-snug">
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
