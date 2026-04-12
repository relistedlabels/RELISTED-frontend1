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
}

// ✅ Helper to convert ALL_CAPS status to Initial Caps for display
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
  listedDate,
  status,
  isActive,
  imageUrl,
  curatorName,
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

  // Determine type based on what fields have values
  let type = "Unknown";
  const hasRental = pricePerDay && !pricePerDay.includes("₦0");
  const hasResale = itemValue && !itemValue.includes("₦0");

  if (hasRental && hasResale) {
    type = "Rental & Resale";
  } else if (hasRental) {
    type = "Rental";
  } else if (hasResale) {
    type = "Resale";
  }

  // Determine what price column layout to show based on type
  let priceColumnLabel = "Price";
  let priceValue = "";
  let secondaryPrice = null;

  if (type === "Resale") {
    priceColumnLabel = "Resale Value";
    priceValue = itemValue;
  } else if (type === "Rental") {
    priceColumnLabel = "Price/Day";
    priceValue = pricePerDay + " /day";
  } else if (type === "Rental & Resale") {
    priceColumnLabel = "Price/Day";
    priceValue = pricePerDay + " /day";
    secondaryPrice = {
      label: "Resale",
      value: itemValue,
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
      <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl bg-white hover:shadow-md transition-shadow duration-150">
        {/* Product Image & Info - Left Side */}
        <div className="flex items-start space-x-3 min-w-[280px]">
          <div className="w-20 h-24 bg-gray-100 rounded-lg overflow-hidden shrink-0">
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <span className={`w-2.5 h-2.5 rounded-full ${colors.dot}`}></span>
              <Paragraph1 className={`text-xs font-semibold ${colors.text}`}>
                {formatStatusLabel(status)}
              </Paragraph1>
            </div>
            <Paragraph1 className="font-bold text-gray-900 truncate uppercase text-sm">
              {name}
            </Paragraph1>
            <Paragraph1 className="text-xs text-gray-600">
              Size: {size} | Color: {color}
            </Paragraph1>
          </div>
        </div>

        {/* Type Column */}
        <div className="flex flex-col   flex-1">
          <Paragraph1 className="text-xs text-gray-500 mb-1">Type</Paragraph1>
          <Paragraph1 className="font-semibold text-gray-900 text-sm">
            {type}
          </Paragraph1>
        </div>

        {/* Price/Value Column */}
        <div className="flex flex-col items-start  flex-1">
          <Paragraph1 className="text-xs text-gray-500 mb-1">
            {priceColumnLabel}
          </Paragraph1>
          <div className="flex flex-col">
            <Paragraph1 className="font-semibold text-gray-900 text-sm">
              {priceValue}
            </Paragraph1>
            {secondaryPrice && (
              <Paragraph1 className="text-xs text-gray-500">
                {secondaryPrice.label} {secondaryPrice.value}
              </Paragraph1>
            )}
          </div>
        </div>

        {/* Listed Date Column */}
        <div className="flex flex-col items-start text-center flex-1">
          <Paragraph1 className="text-xs text-gray-500 mb-1">Listed</Paragraph1>
          <Paragraph1 className="font-semibold text-gray-900 text-sm">
            {listedDate}
          </Paragraph1>
        </div>

        {/* Live Status Badge */}
        <div
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
            isActive
              ? "text-green-700 bg-green-100"
              : "text-gray-700 bg-gray-100"
          }`}
        >
          <Paragraph1 className="text-xs font-semibold">
            {isActive ? "Live" : "Inactive"}
          </Paragraph1>
        </div>

        {/* Manage Button */}
        <button
          type="button"
          onClick={handleManage}
          className="px-6 py-2 text-sm font-semibold whitespace-nowrap text-white bg-gray-800 hover:bg-black rounded-lg transition duration-150"
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

  // ✅ Map backend products to frontend InventoryItem
  const mappedInventory: InventoryItem[] = (products || []).map(
    (product: UserProduct) => ({
      id: product.id,
      name: product.name,
      size: product.measurement,
      color: product.color,
      pricePerDay: `₦${product.dailyPrice.toLocaleString()}`,
      itemValue: `₦${product.originalValue.toLocaleString()}`,
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
    }),
  );

  // ✅ Filter by status
  const filteredInventory =
    activeTab === "All"
      ? mappedInventory
      : mappedInventory.filter((item) => item.status === activeTab);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Paragraph1 className="text-gray-500">Loading inventory...</Paragraph1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 bg-red-50 rounded-lg border border-red-200">
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
          <Paragraph3 className="text-2xl font-semibold text-black">
            Inventory
          </Paragraph3>
          <ToolInfo content="Lists all items in your inventory, including availability, rental frequency, and pricing." />
        </div>

        <Link
          href="/listers/inventory/product-upload"
          className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold text-white bg-black rounded-lg hover:bg-gray-800 transition duration-150"
        >
          <Plus className="w-4 h-4" />
          <Paragraph1>Add New Item</Paragraph1>
        </Link>
      </div>

      {/* Tab Switcher - Scrollable on mobile, wrapping on desktop */}
      <div className="mb-6 overflow-x-auto  w-[330px]  sm:w-fit">
        <div className="p-1 bg-white rounded-xl shadow-sm inline-flex border border-gray-200 relative gap-1 min-w-max">
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
                  className="absolute inset-0 bg-black rounded-lg -z-10"
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
              className="p-8 text-center text-gray-500 bg-white rounded-xl border border-gray-200"
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
