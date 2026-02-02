import React from "react";
import { Paragraph1 } from "@/common/ui/Text"; // Using your custom text component

/**
 * Renders the detailed care instructions for a product, typically used within an accordion.
 */
const ProductCareDetails: React.FC = () => {
  return (
    <div className="font-sans p-4 -mt-2 sm:p-0">
      {/* Professional Cleaning Section */}
      <div className="mb-6">
        <Paragraph1 className="text-sm font-semibold text-gray-900 tracking-wider mb-2">
          PROFESSIONAL CLEANING INCLUDED:
        </Paragraph1>
        <Paragraph1 className="text-sm text-gray-700 leading-relaxed">
          We handle all cleaning before and after your rental.
        </Paragraph1>
      </div>

      {/* While Wearing Section */}
      <div>
        <Paragraph1 className="text-sm font-semibold text-gray-900 tracking-wider mb-2">
          WHILE WEARING:
        </Paragraph1>
        <ul className="space-y-2 text-sm text-gray-700 list-none pl-0">
          {/* Using custom styling for bullet points to match potential design */}
          <li className="flex items-start">
            <span className="text-xl leading-none mr-2 mt-[-3px]">•</span>
            Avoid contact with makeup and oils
          </li>
          <li className="flex items-start">
            <span className="text-xl leading-none mr-2 mt-[-3px]">•</span>
            Handle delicate beadwork with care
          </li>
          <li className="flex items-start">
            <span className="text-xl leading-none mr-2 mt-[-3px]">•</span>
            Avoid sitting on rough surfaces
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ProductCareDetails;
