"use client";

import React, { useMemo, useState } from "react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { Plus } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  useUserProducts,
  type UserProductsFilters,
} from "@/lib/queries/product/useUserProducts";
import { ToolInfo } from "@/common/ui/ToolInfo";
import ClosetInfoCard from "./ClosetInfoCard";
import CreateClosetModal from "./CreateClosetModal";
import InventoryItemCard, { InventoryItem } from "./InventoryItemCard";
import InventoryTabsAndSearch from "./InventoryTabsAndSearch";
import type { UserProduct } from "@/lib/api/product";

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

interface SelectedCloset {
  id: string;
  name: string;
  itemCount: number;
  avatar?: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
}

function filtersForClosetSelection(id: string): UserProductsFilters | undefined {
  if (id === "all") return undefined;
  if (id === "uncategorized") return { uncategorized: true };
  return { closetId: id };
}

const InventoryList: React.FC<{
  selectedClosetId?: string;
  selectedCloset?: SelectedCloset;
  /** Return to the closet grid (create/switch closets) */
  onOpenClosetPicker?: () => void;
}> = ({ selectedClosetId, selectedCloset, onOpenClosetPicker }) => {
  const [createClosetOpen, setCreateClosetOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "AVAILABLE" | "RENTED" | "MAINTENANCE" | "RESERVED" | "All"
  >("All");
  const [searchQuery, setSearchQuery] = useState("");

  const listFilters = useMemo(
    () =>
      selectedClosetId
        ? filtersForClosetSelection(selectedClosetId)
        : undefined,
    [selectedClosetId],
  );

  const { data: products, isLoading, error } = useUserProducts(listFilters, {
    enabled: !!selectedClosetId,
  });

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

  let filteredInventory =
    activeTab === "All"
      ? mappedInventory
      : mappedInventory.filter((item) => item.status === activeTab);

  if (searchQuery.trim()) {
    filteredInventory = filteredInventory.filter((item) => {
      const query = searchQuery.toLowerCase();
      return (
        (item.name && item.name.toLowerCase().includes(query)) ||
        (item.color && item.color.toLowerCase().includes(query)) ||
        (item.size && item.size.toLowerCase().includes(query))
      );
    });
  }

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

  const availableCount = mappedInventory.filter(
    (item) => item.status === "AVAILABLE",
  ).length;
  const totalRentals = mappedInventory.filter(
    (item) => item.status === "RENTED",
  ).length;

  const showClosetHeader =
    selectedCloset &&
    selectedCloset.id !== "all" &&
    selectedCloset.id !== "uncategorized";

  const showSimpleHeader =
    !selectedCloset ||
    selectedCloset.id === "all" ||
    selectedCloset.id === "uncategorized";

  return (
    <div className="w-full">
      {showClosetHeader && (
        <ClosetInfoCard
          selectedCloset={selectedCloset}
          availableCount={availableCount}
          totalRentals={totalRentals}
          onBrowseClosets={onOpenClosetPicker}
          onCreateCloset={() => setCreateClosetOpen(true)}
        />
      )}

      {showSimpleHeader && (
        <div className="flex justify-between items-center mb-6 pr-2 flex-wrap gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {onOpenClosetPicker ? (
              <button
                type="button"
                onClick={onOpenClosetPicker}
                className="shrink-0 text-sm font-semibold text-gray-600 hover:text-black transition-colors"
              >
                ← All closets
              </button>
            ) : null}
            <div className="flex items-center gap-2">
              <Paragraph3 className="font-semibold text-black text-2xl">
                Inventory
              </Paragraph3>
              <ToolInfo content="Lists all items in your inventory, including availability, rental frequency, and pricing." />
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setCreateClosetOpen(true)}
              className="px-4 py-2 rounded-lg border border-gray-300 font-semibold text-gray-900 text-sm hover:bg-gray-50 transition duration-150"
            >
              Create closet
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
      )}

      <InventoryTabsAndSearch
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedClosetId={selectedClosetId}
      />

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

      <CreateClosetModal
        isOpen={createClosetOpen}
        onClose={() => setCreateClosetOpen(false)}
      />
    </div>
  );
};

export default InventoryList;
