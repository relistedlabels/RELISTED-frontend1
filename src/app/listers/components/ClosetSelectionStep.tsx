"use client";

import React, { useState } from "react";
import { Paragraph1, Header1Plus, Paragraph2 } from "@/common/ui/Text";
import { motion } from "framer-motion";
import Link from "next/link";
import { FileText } from "lucide-react";
import CreateClosetModal from "./CreateClosetModal";

interface Closet {
  id: string;
  name: string;
  itemCount: number;
  icon?: React.ReactNode;
  description?: string;
  bgColor?: string;
  avatar?: string;
}

// Generate random background colors for initials
const BG_COLORS = [
  "bg-blue-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-red-500",
  "bg-green-500",
  "bg-indigo-500",
  "bg-teal-500",
  "bg-amber-500",
  "bg-cyan-500",
  "bg-rose-500",
];

const getRandomBgColor = (name: string) => {
  const charCode = name.charCodeAt(0);
  return BG_COLORS[charCode % BG_COLORS.length];
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

interface ClosetSelectionStepProps {
  closets: Closet[];
  onSelectCloset: (closetId: string) => void;
  isLoading?: boolean;
}

const ClosetSelectionStep: React.FC<ClosetSelectionStepProps> = ({
  closets,
  onSelectCloset,
  isLoading = false,
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Paragraph2 className=" tracking-wide mb-1">Inventory</Paragraph2>
          <Paragraph1 className="text-gray-500">
            Manage all inventory and closets
          </Paragraph1>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-black text-white font-semibold rounded-lg transition-colors duration-150"
        >
          <Paragraph1>
            {" "}
            <span>+ Create Closet</span>
          </Paragraph1>
        </button>
      </div>

      {/* Closet Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {closets.map((closet) => {
          const bgColor = closet.bgColor || getRandomBgColor(closet.name);
          const initials = getInitials(closet.name);
          const isAllInventories = closet.id === "all";

          return (
            <motion.div
              key={closet.id}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="flex flex-col items-center justify-center p-6 border border-gray-200 rounded-2xl bg-white hover:border-gray-300 hover:shadow-lg transition-all duration-200"
            >
              {/* Icon Circle */}
              <div
                className={`w-24 h-24 rounded-full  flex items-center justify-center mb-4 ${
                  isAllInventories ? "bg-gray-100 border" : bgColor
                }`}
              >
                {isAllInventories ? (
                  <FileText className="w-12 h-12 text-black" />
                ) : closet.avatar ? (
                  <img
                    src={closet.avatar}
                    alt={closet.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <Paragraph2 className="text-2xl font-bold text-white">
                    {initials}
                  </Paragraph2>
                )}
              </div>

              {/* Closet Name */}
              <Paragraph1 className="font-semibold text-gray-900 text-center text-base mb-1 line-clamp-2">
                {closet.name}
              </Paragraph1>

              {/* Item Count */}
              <Paragraph1 className="text-sm text-gray-500 mb-4">
                {closet.itemCount} items
              </Paragraph1>

              {/* Manage Button */}
              <button
                onClick={() => onSelectCloset(closet.id)}
                disabled={isLoading}
                className="w-full px-4 py-2.5 bg-black  hover:bg-gray-800 text-white font-semibold text-sm rounded-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Manage
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Create Closet Modal */}
      <CreateClosetModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};

export default ClosetSelectionStep;
