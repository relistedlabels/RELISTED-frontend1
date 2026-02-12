"use client";
// ENDPOINTS: GET /api/listers/rentals/recent (recent rental transactions with status)

import React, { useState } from "react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import Link from "next/link";
import { useRecentRentals } from "@/lib/queries/listers/useRecentRentals";

// --- Status Badge Component ---
const StatusBadge: React.FC<{
  status: "Delivered" | "Return Due" | "Completed";
}> = ({ status }) => {
  let classes = "";
  switch (status) {
    case "Delivered":
      classes = "bg-blue-100 text-blue-800";
      break;
    case "Return Due":
      classes = "bg-yellow-100 text-yellow-800";
      break;
    case "Completed":
      classes = "bg-green-100 text-green-800";
      break;
    default:
      classes = "bg-gray-100 text-gray-800";
  }

  return (
    <span className={`px-4 py-1 text-sm font-medium rounded-lg ${classes}`}>
      {status}
    </span>
  );
};

// --- Individual Rental Row Component ---
const RentalRow: React.FC<{
  id: string;
  itemName: string;
  size: string;
  color: string;
  returnDueDate: string;
  rentalAmount: number;
  status: "Delivered" | "Return Due" | "Completed";
  renterName: string;
  renterImage: string;
}> = ({
  id,
  itemName,
  size,
  color,
  returnDueDate,
  rentalAmount,
  status,
  renterName,
  renterImage,
}) => {
  return (
    <div className="flex bg-white items-center border border-gray-300 justify-between py-4 mb-4 rounded-lg p-4">
      {/* Item Details (Image, Name, Size/Color) */}
      <div className="flex items-center space-x-4 w-1/4 min-w-[200px] shrink-0">
        <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden shrink-0">
          <img
            src={renterImage}
            alt={itemName}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <Paragraph1 className="font-semibold text-gray-800 truncate">
            {itemName}
          </Paragraph1>
          <Paragraph1 className="text-sm text-gray-500">
            Size: {size} | Color: {color}
          </Paragraph1>
        </div>
      </div>

      {/* Return Due */}
      <div className="w-1/6 text-left hidden sm:block">
        <Paragraph1 className="text-sm text-gray-500">Return Due</Paragraph1>
        <Paragraph1 className="font-semibold text-gray-800">
          {new Date(returnDueDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </Paragraph1>
      </div>

      {/* Amount */}
      <div className="w-1/6 text-left hidden md:block">
        <Paragraph1 className="text-sm text-gray-500">Amount</Paragraph1>
        <Paragraph1 className="font-semibold text-black">
          ₦{rentalAmount.toLocaleString()}
        </Paragraph1>
      </div>

      {/* Status Badge */}
      <div className="w-1/6 text-center hidden sm:block">
        <StatusBadge status={status} />
      </div>

      {/* View Order Button */}
      <div className="w-1/6 text-right flex justify-end">
        <Link
          href={`/listers/orders/${id}`}
          className="text-sm font-semibold text-gray-600 hover:text-black transition duration-150 underline"
        >
          View Order
        </Link>
      </div>
    </div>
  );
};

// --- Main Component ---
const RecentRentalsList: React.FC = () => {
  const [page] = useState(1);
  const {
    data: rentalsData,
    isLoading,
    isError,
  } = useRecentRentals(page, 10, "all");

  return (
    <div className="w-full">
      {/* Header */}
      <Paragraph3 className="text-xl mb-4 font-semibold text-black">
        Recent Rentals
      </Paragraph3>

      {/* List of Rental Rows */}
      <div className="divide-y divide-gray-100">
        {isLoading || isError ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center py-4 mb-4 animate-pulse">
              <div className="w-12 h-12 bg-gray-200 rounded-lg mr-4" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))
        ) : rentalsData?.data && rentalsData.data.length > 0 ? (
          rentalsData.data.map((item) => <RentalRow key={item.id} {...item} />)
        ) : (
          <div className="text-center py-8">
            <Paragraph1 className="text-gray-500">No recent rentals</Paragraph1>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentRentalsList;
