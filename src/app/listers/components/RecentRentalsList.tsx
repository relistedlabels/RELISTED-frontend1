"use client";
// ENDPOINTS: GET /api/listers/rentals/recent (recent rental transactions with status)

import React from "react";
// Assuming Paragraph components are available
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import Link from "next/link";

// --- Item Data Structure ---
interface RentalTransaction {
  id: number;
  name: string;
  size: string;
  color: string;
  returnDue: string;
  amount: string;
  status: "Delivered" | "Return Due";
  imageUrl: string; // Placeholder for the actual image path
}

// Data matching the provided image
const recentRentalsData: RentalTransaction[] = [
  {
    id: 1,
    name: "FENDI ARCO BOOTS",
    size: "S",
    color: "Black",
    returnDue: "Oct 19, 2025",
    amount: "₦550,000",
    status: "Delivered",
    imageUrl: "/products/p2.jpg", // Placeholder path
  },
  {
    id: 2,
    name: "FENDI ARCO BOOTS",
    size: "S",
    color: "Black",
    returnDue: "Oct 19, 2025",
    amount: "₦550,000",
    status: "Return Due",
    imageUrl: "/products/p2.jpg", // Placeholder path
  },
  {
    id: 3,
    name: "FENDI ARCO BOOTS",
    size: "S",
    color: "Black",
    returnDue: "Oct 19, 2025",
    amount: "₦550,000",
    status: "Return Due",
    imageUrl: "/products/p2.jpg", // Placeholder path
  },
];

// --- Status Badge Component ---
const StatusBadge: React.FC<{ status: "Delivered" | "Return Due" }> = ({
  status,
}) => {
  let classes = "";
  if (status === "Delivered") {
    classes = "bg-blue-100 text-blue-800";
  } else if (status === "Return Due") {
    classes = "bg-yellow-100 text-yellow-800";
  }

  return (
    <span className={`px-4 py-1 text-sm font-medium rounded-lg ${classes}`}>
      {status}
    </span>
  );
};

// --- Individual Rental Row Component ---
const RentalRow: React.FC<RentalTransaction> = ({
  name,
  size,
  color,
  returnDue,
  amount,
  status,
  imageUrl,
}) => {
  const handleViewOrder = () => {
    alert(`Viewing order for: ${name}`);
    // In a real application, this would navigate to the order detail page
  };

  return (
    <div className="flex bg-white items-center border border-gray-300 justify-between py-4 mb-4 rounded-lg p-4 ">
      {/* Item Details (Image, Name, Size/Color) */}
      <div className="flex items-center space-x-4 w-1/4 min-w-[200px] shrink-0">
        <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden shrink-0">
          {/* Image placeholder */}
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <Paragraph1 className="font-semibold text-gray-800 truncate">
            {name}
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
          {returnDue}
        </Paragraph1>
      </div>

      {/* Amount */}
      <div className="w-1/6 text-left hidden md:block">
        <Paragraph1 className="text-sm text-gray-500">Amount</Paragraph1>
        <Paragraph1 className="font-semibold text-black">{amount}</Paragraph1>
      </div>

      {/* Status Badge */}
      <div className="w-1/6 text-center hidden sm:block">
        <StatusBadge status={status} />
      </div>

      {/* View Order Button */}
      <div className="w-1/6 text-right flex justify-end">
        <Link
          href="/listers/orders/id"
          type="button"
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
  return (
    <div className=" w-full ">
      {/* Header */}
      <Paragraph3 className="text-xl mb-4 font-semibold  text-black">
        Recent Rentals
      </Paragraph3>

      {/* List of Rental Rows */}
      <div className="divide-y divide-gray-100">
        {recentRentalsData.map((item) => (
          <RentalRow key={item.id} {...item} />
        ))}
      </div>
    </div>
  );
};

export default RecentRentalsList;
