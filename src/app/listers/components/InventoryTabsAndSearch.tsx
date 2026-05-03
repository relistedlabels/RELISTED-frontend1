"use client";

import React, { useState } from "react";
import { Paragraph1 } from "@/common/ui/Text";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface InventoryTabsAndSearchProps {
  activeTab: "AVAILABLE" | "RENTED" | "MAINTENANCE" | "RESERVED" | "All";
  setActiveTab: (
    tab: "AVAILABLE" | "RENTED" | "MAINTENANCE" | "RESERVED" | "All",
  ) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedClosetId?: string;
}

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

const InventoryTabsAndSearch: React.FC<InventoryTabsAndSearchProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  selectedClosetId: _selectedClosetId,
}) => {
  const [showFilter, setShowFilter] = useState(false);
  const [selectedType, setSelectedType] = useState("All");

  const typeOptions = ["All", "Rental", "Resale", "Rent & Resale"];

  const handleClearAll = () => {
    setSelectedType("All");
    setSearchQuery("");
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 relative">
      {/* Tab Switcher - Scrollable on mobile, wrapping on desktop */}
      <div className="w-[330px] sm:w-fit overflow-x-auto">
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

      {/* Search and Filter - Right side */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition duration-150"
        />

        {/* Filter Button */}
        <div className="relative">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="px-4 py-2 border border-gray-300 rounded-lg font-semibold text-gray-900 text-sm hover:bg-gray-50 transition duration-150 flex items-center gap-2"
          >
            Filter
            <ChevronDown className="w-4 h-4" />
          </button>

          {/* Filter Dropdown Modal */}
          <AnimatePresence>
            {showFilter && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full right-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
              >
                <div className="p-6">
                  {/* Type Filter */}
                  <div className="mb-6">
                    <Paragraph1 className="text-gray-500 text-xs mb-3">
                      Type
                    </Paragraph1>
                    <div className="grid grid-cols-2 gap-2">
                      {typeOptions.map((type) => (
                        <button
                          key={type}
                          onClick={() => setSelectedType(type)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition duration-150 ${
                            selectedType === type
                              ? "bg-gray-900 text-white"
                              : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-gray-200 my-4" />

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={handleClearAll}
                      className="text-gray-500 text-sm font-medium hover:text-gray-900 transition duration-150"
                    >
                      Clear all
                    </button>
                    <button
                      onClick={() => setShowFilter(false)}
                      className="px-6 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-black transition duration-150"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default InventoryTabsAndSearch;
