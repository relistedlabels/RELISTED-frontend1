"use client";

import React from "react";
import { Paragraph1 } from "@/common/ui/Text";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export interface InventoryItem {
  id: string;
  name: string;
  size: string;
  color: string;
  pricePerDay: string;
  itemValue: string;
  resalePrice: string;
  listingType?: "RENTAL" | "RESALE" | "RENT_OR_RESALE";
  listedDate: string;
  status:
    | "APPROVED"
    | "AVAILABLE"
    | "RENTED"
    | "MAINTENANCE"
    | "RESERVED"
    | "PENDING"
    | "REJECTED"
    | "UNAVAILABLE"
    | "SOLD";
  isActive: boolean;
  imageUrl: string;
  curatorName: string;
  depreciationPrompt?: boolean;
  rejectionComment?: string | null;
}

// Helper to convert ALL_CAPS status to Initial Caps for display
const formatStatusLabel = (
  status:
    | "APPROVED"
    | "AVAILABLE"
    | "RENTED"
    | "MAINTENANCE"
    | "RESERVED"
    | "PENDING"
    | "REJECTED"
    | "UNAVAILABLE"
    | "SOLD"
    | "All",
): string => {
  if (status === "All") return "All Items";
  if (status === "PENDING") return "Pending approval";
  return status
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
};

const InventoryItemCard: React.FC<InventoryItem> = ({
  id,
  name,
  size,
  color,
  pricePerDay,
  itemValue,
  resalePrice,
  listingType,
  listedDate,
  status,
  isActive,
  imageUrl,
  curatorName,
  depreciationPrompt,
  rejectionComment,
}) => {
  const router = useRouter();

  const statusColors: Record<
    string,
    { dot: string; text: string; badge: string }
  > = {
    AVAILABLE: {
      dot: "bg-green-600",
      text: "text-green-600",
      badge: "text-green-800 bg-green-100",
    },
    RENTED: {
      dot: "bg-blue-600",
      text: "text-blue-600",
      badge: "text-blue-800 bg-blue-100",
    },
    MAINTENANCE: {
      dot: "bg-yellow-600",
      text: "text-yellow-600",
      badge: "text-yellow-800 bg-yellow-100",
    },
    RESERVED: {
      dot: "bg-purple-600",
      text: "text-purple-600",
      badge: "text-purple-800 bg-purple-100",
    },
    PENDING: {
      dot: "bg-orange-500",
      text: "text-orange-600",
      badge: "text-orange-800 bg-orange-100",
    },
    REJECTED: {
      dot: "bg-red-500",
      text: "text-red-600",
      badge: "text-red-800 bg-red-100",
    },
    INACTIVE: {
      dot: "bg-gray-400",
      text: "text-gray-500",
      badge: "text-gray-700 bg-gray-200",
    },
  };

  const colors = statusColors[status] || statusColors.AVAILABLE;

  // Determine type based on listingType from backend
  let type = "Unknown";
  if (listingType === "RENT_OR_RESALE") {
    type = "Rental & Resale";
  } else if (listingType === "RENTAL") {
    type = "Rental";
  } else if (listingType === "RESALE") {
    type = "Resale";
  } else {
    // Fallback to inferring from price values if listingType is not set
    const hasRental = pricePerDay && !pricePerDay.includes("₦0");
    const hasResale = itemValue && !itemValue.includes("₦0");
    if (hasRental && hasResale) {
      type = "Rental & Resale";
    } else if (hasRental) {
      type = "Rental";
    } else if (hasResale) {
      type = "Resale";
    }
  }

  // Determine what price column layout to show based on type
  let priceColumnLabel = "Price";
  let priceValue = "";
  let secondaryPrice = null;

  if (type === "Resale") {
    priceColumnLabel = "Resale Value";
    priceValue = resalePrice;
  } else if (type === "Rental") {
    priceColumnLabel = "Price/Day";
    priceValue = pricePerDay + " /day";
  } else if (type === "Rental & Resale") {
    priceColumnLabel = "Price/Day";
    priceValue = pricePerDay + " /day";
    secondaryPrice = {
      label: "Resale",
      value: resalePrice,
    };
  }

  const handleManage = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(`/listers/inventory/product-details/${id}`);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      {/* Depreciation Warning Banner */}
      {depreciationPrompt && (
        <div className="bg-amber-50 mb-3 p-3 border border-amber-200 rounded-lg">
          <Paragraph1 className="text-amber-800 text-xs">
            ⚠️ This item has been rented 5+ times. Please review your resale
            price and collateral value.
          </Paragraph1>
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-[3fr_1fr_1fr_1fr_1fr_1fr] items-center gap-4 bg-white hover:shadow-md p-4 border border-gray-200 rounded-xl w-full transition-shadow duration-150">
        {/* Product Image & Info - Col 1 (3 units) */}
        <div className="flex items-center space-x-3 w-full">
          <div className="bg-gray-100 rounded-lg w-16 sm:w-20 h-20 sm:h-24 overflow-hidden shrink-0">
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <span className={`w-2.5 h-2.5 rounded-full ${colors.dot}`}></span>
              <Paragraph1 className={`text-xs font-semibold ${colors.text}`}>
                {formatStatusLabel(status)}
              </Paragraph1>
            </div>
            <Paragraph1 className="font-bold text-gray-900 text-sm truncate uppercase">
              {name}
            </Paragraph1>
            <Paragraph1 className="text-gray-600 text-xs">
              Size: {size} | Color: {color}
            </Paragraph1>
          </div>
        </div>

        {/* Type Column - Col 2 (2 units) */}
        <div className="flex flex-col">
          <Paragraph1 className="mb-1 text-gray-500 text-xs">Type</Paragraph1>
          <Paragraph1 className="font-semibold text-gray-900 text-sm">
            {type}
          </Paragraph1>
        </div>

        {/* Price/Value Column - Col 3 (1 unit) */}
        <div className="flex flex-col">
          <Paragraph1 className="mb-1 text-gray-500 text-xs">
            {priceColumnLabel}
          </Paragraph1>
          <div className="flex flex-col">
            <Paragraph1 className="font-semibold text-gray-900 text-sm">
              {priceValue}
            </Paragraph1>
            {secondaryPrice && (
              <Paragraph1 className="text-gray-500 text-xs">
                {secondaryPrice.label} {secondaryPrice.value}
              </Paragraph1>
            )}
          </div>
        </div>

        {/* Listed Date Column - Col 4 (1 unit) */}
        <div className="flex flex-col">
          <Paragraph1 className="mb-1 text-gray-500 text-xs">Listed</Paragraph1>
          <Paragraph1 className="font-semibold text-gray-900 text-sm">
            {listedDate}
          </Paragraph1>
        </div>

        {/* Live Status Badge - Col 5 (1 unit) */}
        <div
          className={`px-3 py-1.5 flex w-full justify-center rounded-lg whitespace-nowrap ${
            isActive
              ? "text-green-700 bg-green-100"
              : "text-gray-700 bg-gray-100"
          }`}
        >
          <Paragraph1 className="font-semibold text-xs">
            {isActive ? "Live" : "Inactive"}
          </Paragraph1>
        </div>

        {/* Manage Button - Col 6 (1 unit) */}
        <button
          type="button"
          onClick={handleManage}
          className="bg-gray-800 hover:bg-black px-6 py-2 rounded-lg font-semibold text-white text-sm whitespace-nowrap transition duration-150"
        >
          Manage
        </button>

        {/* Rejection Reason Banner - Spans full width below */}
        {status === "REJECTED" && rejectionComment && (
          <div className="col-span-full bg-red-50 p-3 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <div className="flex flex-shrink-0 justify-center items-center bg-red-100 rounded-full w-6 h-6">
                <span className="font-semibold text-red-600 text-xs">!</span>
              </div>
              <div className="flex-1">
                <Paragraph1 className="mb-0.5 font-semibold text-red-800 text-xs">
                  Rejection Reason
                </Paragraph1>
                <Paragraph1 className="text-red-700 text-xs leading-relaxed">
                  {rejectionComment}
                </Paragraph1>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default InventoryItemCard;
