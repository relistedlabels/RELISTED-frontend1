"use client";

import React, { useState } from "react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { Plus } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useUserProducts } from "@/lib/queries/product/useUserProducts";
import { useRouter } from "next/navigation";
import { ToolInfo } from "@/common/ui/ToolInfo";
import type { UserProduct } from "@/lib/api/product";

// --- Frontend Inventory Item type ---
interface InventoryItem {
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
  return status
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
};

// --- Individual Item Card ---
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
      <div className="flex items-center gap-4 bg-white hover:shadow-md p-4 border border-gray-200 rounded-xl transition-shadow duration-150">
        {/* Product Image & Info - Left Side */}
        <div className="flex items-start space-x-3 min-w-[280px]">
          <div className="bg-gray-100 rounded-lg w-20 h-24 overflow-hidden shrink-0">
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <span className={`w-2 h-2 rounded-full ${colors.dot}`}></span>
              <Paragraph1 className={`text-xs font-semibold ${colors.text}`}>
                {formatStatusLabel(status)}
              </Paragraph1>
              {!isActive && (
                <span className="bg-gray-100 px-2 py-0.5 rounded font-semibold text-gray-500 text-xs">
                  Disabled
                </span>
              )}
            </div>
            <Paragraph1 className="font-bold text-gray-900 text-sm truncate uppercase">
              {name}
            </Paragraph1>
            <Paragraph1 className="text-gray-600 text-xs">
              Size: {size} | Color: {color}
            </Paragraph1>
          </div>
        </div>

        {/* Type Column */}
        <div className="flex flex-col flex-1">
          <Paragraph1 className="mb-1 text-gray-500 text-xs">Type</Paragraph1>
          <Paragraph1 className="font-semibold text-gray-900 text-sm">
            {type}
          </Paragraph1>
        </div>

        {/* Price/Value Column */}
        <div className="flex flex-col flex-1 items-start">
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

        {/* Listed Date Column */}
        <div className="flex flex-col flex-1 items-start text-center">
          <Paragraph1 className="mb-1 text-gray-500 text-xs">Listed</Paragraph1>
          <Paragraph1 className="font-semibold text-gray-900 text-sm">
            {listedDate}
          </Paragraph1>
        </div>

        {/* Status Badge */}
        <div
          className={`px-3 flex justify-center item-center py-1.5 text-xs font-semibold rounded-lg ${colors.badge}`}
        >
          <Paragraph1 className="font-semibold text-xs">
            {isActive ? "Live" : "Inactive"}
          </Paragraph1>
        </div>

        {/* Manage Button */}
        <button
          type="button"
          onClick={handleManage}
          className="bg-gray-800 hover:bg-black px-6 py-2 rounded-lg font-semibold text-white text-sm whitespace-nowrap transition duration-150"
        >
          Manage
        </button>
      </div>
    </motion.div>
  );
};

// --- Main Inventory List Component ---
const InventoryList: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "AVAILABLE" | "RENTED" | "MAINTENANCE" | "RESERVED" | "All"
  >("All");

  const { data: products, isLoading, error } = useUserProducts();

  const mappedInventory: InventoryItem[] = (products || []).map(
    (product: UserProduct) => ({
      id: product.id,
      name: product.name,
      size: product.measurement,
      color: product.color,
      pricePerDay: `₦${product.dailyPrice.toLocaleString()}`,
      itemValue: `₦${product.originalValue.toLocaleString()}`,
      resalePrice: `₦${(product.resalePrice ?? product.originalValue).toLocaleString()}`,
      listingType: product.listingType,
      listedDate: new Date(product.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      status: product.status,
      isActive: product.isActive,
      imageUrl:
        product.attachments?.uploads?.[0]?.url ?? "/images/placeholder.png",
      curatorName: product.curator?.name ?? "",
      depreciationPrompt: product.depreciationPrompt,
    }),
  );

  const filteredInventory =
    activeTab === "All"
      ? mappedInventory
      : mappedInventory.filter((item) => item.status === activeTab);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Paragraph1 className="text-gray-500">Loading inventory...</Paragraph1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center bg-red-50 p-8 border border-red-200 rounded-lg">
        <Paragraph1 className="text-red-600">
          Failed to load inventory. Please try again.
        </Paragraph1>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Paragraph3 className="font-semibold text-black text-2xl">
            Inventory
          </Paragraph3>
          <ToolInfo content="Lists all items in your inventory, including availability, rental frequency, and pricing." />
        </div>

        <Link
          href="/listers/inventory/product-upload"
          className="flex items-center space-x-2 bg-black hover:bg-gray-800 px-4 py-2 rounded-lg font-semibold text-white text-sm transition duration-150"
        >
          <Plus className="w-4 h-4" />
          <Paragraph1>Add New Item</Paragraph1>
        </Link>
      </div>

      {/* Tab Switcher - Scrollable on mobile, wrapping on desktop */}
      <div className="mb-6 w-[330px] sm:w-fit overflow-x-auto">
        <div className="inline-flex relative gap-1 bg-white shadow-sm p-1 border border-gray-200 rounded-xl min-w-max">
          {(
            ["All", "AVAILABLE", "RENTED", "MAINTENANCE", "RESERVED"] as const
          ).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-2.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition duration-150 z-10 whitespace-nowrap ${
                activeTab === tab
                  ? "text-white"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTab"
                  className="-z-10 absolute inset-0 bg-black rounded-lg"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                />
              )}
              <Paragraph1 className="text-xs sm:text-sm">
                {formatStatusLabel(tab)}
              </Paragraph1>
            </button>
          ))}
        </div>
      </div>

      {/* Inventory List */}
      <motion.div layout className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredInventory.length > 0 ? (
            filteredInventory.map((item) => (
              <InventoryItemCard key={item.id} {...item} />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white p-8 border border-gray-200 rounded-xl text-gray-500 text-center"
            >
              <Paragraph1>
                No{" "}
                {activeTab !== "All"
                  ? formatStatusLabel(activeTab).toLowerCase()
                  : ""}{" "}
                inventory items found.
              </Paragraph1>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default InventoryList;
