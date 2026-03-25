import React from "react";
import { Paragraph1 } from "@/common/ui/Text"; // Using your custom text component
import { HiOutlineInformationCircle } from "react-icons/hi2";

/**
 * Renders the detailed delivery and return policy information for a product rental.
 */
const DeliveryAndReturnDetails: React.FC = () => {
  return (
    <div className="font-sans p-4 -mt-2 sm:p-0">
      {/* Delivery Section */}
      <div className="mb-6">
        <Paragraph1 className="text-sm font-semibold text-gray-900 tracking-wider mb-2">
          DELIVERY:
        </Paragraph1>
        <ul className="space-y-1 text-sm text-gray-700 list-disc list-inside">
          <li>Managed by Topship logistics partner</li>
          <li>Delivery timelines depend on location and logistics schedules</li>
          <li>Nationwide coverage available</li>
        </ul>
      </div>

      {/* Returns Section */}
      <div className="mb-6">
        <Paragraph1 className="text-sm font-semibold text-gray-900 tracking-wider mb-2">
          RETURNS:
        </Paragraph1>
        <ul className="space-y-1 text-sm text-gray-700 list-disc list-inside">
          <li>Return through Topship by the rental end date</li>
          <li>Vendor verifies item condition upon return</li>
          <li>Collateral released if no damage is identified</li>
          <li>Late returns: 10% of collateral deducted per day</li>
        </ul>
      </div>

      {/* Highlighted Note about Cleaning */}
      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-start space-x-2">
        <HiOutlineInformationCircle className="w-5 h-5 text-gray-600 mt-0.5 shrink-0" />
        <Paragraph1 className="text-xs text-gray-700 leading-snug font-medium">
          Professional dry cleaning is included in the rental cost and arranged
          by the vendor after return.
        </Paragraph1>
      </div>
    </div>
  );
};

export default DeliveryAndReturnDetails;
