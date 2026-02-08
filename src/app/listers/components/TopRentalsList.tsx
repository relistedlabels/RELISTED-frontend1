"use client";
// ENDPOINTS: GET /api/listers/inventory/top-items (top performing rental items with availability)

import React from "react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { ToolInfo } from "@/common/ui/ToolInfo";

interface RentalItem {
  name: string;
  rentalsCount: number;
  price: string;
  isAvailable: boolean;
  imageUrl: string;
}

const topRentalsData: RentalItem[] = [
  {
    name: "FENDI ARCO BOOTS",
    rentalsCount: 20,
    price: "₦550,000",
    isAvailable: true,
    imageUrl: "/products/p1.jpg",
  },
  {
    name: "FENDI ARCO BOOTS",
    rentalsCount: 20,
    price: "₦550,000",
    isAvailable: false,
    imageUrl: "/products/p1.jpg",
  },
  {
    name: "FENDI ARCO BOOTS",
    rentalsCount: 20,
    price: "₦550,000",
    isAvailable: true,
    imageUrl: "/products/p1.jpg",
  },
];

const RentalListItem: React.FC<RentalItem> = ({
  name,
  rentalsCount,
  price,
  isAvailable,
  imageUrl,
}) => {
  const statusText = isAvailable ? "Available" : "Unavailable";
  const statusColor = isAvailable ? "text-green-600" : "text-orange-500";
  const dotClass = isAvailable ? "bg-green-600" : "bg-orange-500";

  return (
    <div className="flex items-center space-x-3 p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition duration-150">
      <div className="w-16 h-16 bg-gray-200 rounded-lg shrink-0 overflow-hidden">
        <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
      </div>

      <div className="flex-1 min-w-0">
        <Paragraph1 className="font-semibold text-gray-800 truncate">
          {name}
        </Paragraph1>
        <Paragraph1 className="text-sm text-gray-500">
          {rentalsCount} Rentals
        </Paragraph1>
      </div>

      <div className="text-right shrink-0">
        <div className="flex items-center justify-end space-x-1 mb-1">
          <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
          <Paragraph1 className={`text-xs font-medium ${statusColor}`}>
            {statusText}
          </Paragraph1>
        </div>
        <Paragraph1 className="text-base font-semibold text-black">
          {price}
        </Paragraph1>
      </div>
    </div>
  );
};

const TopRentalsList: React.FC = () => {
  return (
    <div className="bg-white sm:col-span-2 p-6 rounded-xl border border-gray-300 w-full">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-1">
          <Paragraph3 className="text-xl font-semibold text-black">
            Top Rentals
          </Paragraph3>
          <ToolInfo content="Shows the most rented items, their availability status, and current pricing." />
        </div>

        <button
          type="button"
          className="px-3 py-1 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition duration-150"
        >
          See Inventory
        </button>
      </div>

      <div className="space-y-4">
        {topRentalsData.map((item, index) => (
          <RentalListItem key={index} {...item} />
        ))}
      </div>
    </div>
  );
};

export default TopRentalsList;
