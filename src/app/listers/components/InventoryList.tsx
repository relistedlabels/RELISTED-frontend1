"use client";

import React, { useState } from "react";
import { Paragraph1, Paragraph2, Paragraph3 } from "@/common/ui/Text";
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
      <div className="flex flex-col sm:grid sm:grid-cols-[3fr_1fr_1fr_1fr_1fr_1fr] items-center gap-4 bg-white hover:shadow-md p-4 border border-gray-200 rounded-xl w-full transition-shadow duration-150">
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

// --- Main Inventory List Component ---
interface SelectedCloset {
  id: string;
  name: string;
  itemCount: number;
  avatar?: string;
}

const InventoryList: React.FC<{
  selectedClosetId?: string;
  selectedCloset?: SelectedCloset;
}> = ({ selectedClosetId, selectedCloset }) => {
  const [activeTab, setActiveTab] = useState<
    "AVAILABLE" | "RENTED" | "MAINTENANCE" | "RESERVED" | "All"
  >("All");

  // Log selected closet for debugging
  console.log(
    "InventoryList - Selected Closet ID:",
    selectedClosetId || "empty (regular lister)",
  );

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
      rejectionComment: product.rejectionComment,
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

  // Calculate stats from products
  const availableCount = mappedInventory.filter(
    (item) => item.status === "AVAILABLE",
  ).length;
  const totalRentals = mappedInventory.filter(
    (item) => item.status === "RENTED",
  ).length;

  // Helper to get initials for closet avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Helper to create closet slug for URL
  const getClosetSlug = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, "-");
  };

  const BG_COLORS = [
    "bg-purple-500",
    "bg-blue-500",
    "bg-pink-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-red-500",
  ];

  const getRandomBgColor = (name: string) => {
    const charCode = name.charCodeAt(0);
    return BG_COLORS[charCode % BG_COLORS.length];
  };

  return (
    <div className="w-full">
      {/* Header with Closet Info (for inhouse managers) */}
      {selectedCloset && (
        <>
          {/* Inventory Title and Buttons */}
          <div className="flex justify-between items-center mb-4">
            <Paragraph3 className="font-semibold text-black text-2xl">
              Inventory
            </Paragraph3>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 rounded-lg border border-gray-300 font-semibold text-gray-900 text-sm hover:bg-gray-50 transition duration-150">
                Edit Closet
              </button>
              <Link
                href="/listers/inventory/product-upload"
                className="flex items-center space-x-2 bg-black hover:bg-gray-800 px-4 py-2 rounded-lg font-semibold text-white text-sm transition duration-150"
              >
                <Plus className="w-4 h-4" />
                <Paragraph1>Add New Item</Paragraph1>
              </Link>
            </div>
          </div>

          {/* Closet Info Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
            <div className="grid sm:grid-cols-2 grid-cols-1  items-center justify-between gap-6">
              {/* Left Section: Avatar + Closet Details */}
              <div className="flex items-center gap-4 flex-1">
                {/* Avatar */}
                {selectedCloset.avatar ? (
                  <img
                    src={selectedCloset.avatar}
                    alt={selectedCloset.name}
                    className="w-20 h-20 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div
                    className={`w-20 h-20 rounded-full ${getRandomBgColor(selectedCloset.name)} flex items-center justify-center text-white font-bold text-2xl shrink-0`}
                  >
                    {getInitials(selectedCloset.name)}
                  </div>
                )}

                {/* Closet Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Paragraph3 className="font-bold text-black truncate">
                      {selectedCloset.name}
                    </Paragraph3>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <span>{selectedCloset.itemCount} items</span>
                    {selectedCloset.id === "managed" && (
                      <>
                        <span>·</span>
                        <span className="text-gray-400">
                          Managed by Relisted
                        </span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="truncate">
                      relisted.com/closets/{getClosetSlug(selectedCloset.name)}
                    </span>
                    <button className="p-1 hover:bg-gray-100 rounded transition duration-150 shrink-0">
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Section: Stats */}
              <div className="grid grid-cols-3 items-center gap-8 shrink-0">
                <div className="text-center ">
                  <Paragraph2 className="font-bold text-black">
                    {selectedCloset.itemCount}
                  </Paragraph2>{" "}
                  <Paragraph1 className="text-gray-500 text-xs mb-1">
                    Total Items
                  </Paragraph1>
                </div>
                <div className="text-center border-l border-gray-400">
                  <Paragraph2 className="font-bold text-black">
                    {availableCount}
                  </Paragraph2>
                  <Paragraph1 className="text-gray-500 text-xs mb-1">
                    Available Now
                  </Paragraph1>
                </div>
                <div className="text-center border-l border-gray-400">
                  <Paragraph2 className="font-bold text-black">
                    {totalRentals}
                  </Paragraph2>{" "}
                  <Paragraph1 className="text-gray-500 text-xs mb-1">
                    Total Rentals
                  </Paragraph1>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Simple Header (for regular listers) */}
      {!selectedCloset && (
        <div className="flex justify-between items-center mb-6 pr-2">
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
      )}

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
