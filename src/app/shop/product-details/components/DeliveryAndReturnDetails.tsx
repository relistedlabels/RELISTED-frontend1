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
          <li>Free delivery within Lagos (1-2 days)</li>
          <li>Express delivery available (same day)</li>
          <li>Nationwide shipping (2-3 days)</li>
        </ul>
      </div>

      {/* Returns Section */}
      <div className="mb-6">
        <Paragraph1 className="text-sm font-semibold text-gray-900 tracking-wider mb-2">
          RETURNS:
        </Paragraph1>
        <ul className="space-y-1 text-sm text-gray-700 list-disc list-inside">
          <li>Free return pickup included</li>
          <li>Return within 24 hours of rental end</li>
          <li>Professional cleaning handled by us</li>
        </ul>
      </div>

      {/* Highlighted Note for Same-Day Delivery */}
      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-start space-x-2">
        <HiOutlineInformationCircle className="w-5 h-5 text-gray-600 mt-0.5 shrink-0" />
        <Paragraph1 className="text-xs text-gray-700 leading-snug font-medium">
          Need it faster? **Same-day delivery available for orders placed before
          2pm**
        </Paragraph1>
      </div>
    </div>
  );
};

export default DeliveryAndReturnDetails;
