import React, { useState } from "react";
import { Paragraph1, Paragraph2 } from "@/common/ui/Text";
import { Plus } from "lucide-react";
import Link from "next/link";
import EditClosetModal from "./EditClosetModal";

interface SelectedCloset {
  id: string;
  name: string;
  itemCount: number;
  avatar?: string;
}

interface ClosetInfoCardProps {
  selectedCloset: SelectedCloset;
  availableCount: number;
  totalRentals: number;
}

const BG_COLORS = [
  "bg-purple-500",
  "bg-blue-500",
  "bg-pink-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-red-500",
];

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const getClosetSlug = (name: string) => {
  return name.toLowerCase().replace(/\s+/g, "-");
};

const getRandomBgColor = (name: string) => {
  const charCode = name.charCodeAt(0);
  return BG_COLORS[charCode % BG_COLORS.length];
};

const ClosetInfoCard: React.FC<ClosetInfoCardProps> = ({
  selectedCloset,
  availableCount,
  totalRentals,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  return (
    <>
      {/* Inventory Title and Buttons */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-black text-2xl">Inventory</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="px-4 py-2 rounded-lg border border-gray-300 font-semibold text-gray-900 text-sm hover:bg-gray-50 transition duration-150"
          >
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
        <div className="grid sm:grid-cols-2 grid-cols-1 items-center justify-between gap-6">
          {/* Left Section: Avatar + Closet Details */}
          <div className="flex items-center gap-4 flex-1">
            {/* Avatar */}
            {selectedCloset.avatar ? (
              <img
                src={selectedCloset.avatar}
                alt={selectedCloset.name}
                className="w-30 h-30 rounded-full object-cover shrink-0"
              />
            ) : (
              <div
                className={`w-30 h-30 rounded-full ${getRandomBgColor(selectedCloset.name)} flex items-center justify-center text-white font-bold text-2xl shrink-0`}
              >
                {getInitials(selectedCloset.name)}
              </div>
            )}

            {/* Closet Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Paragraph2 className="font-bold text-black truncate">
                  {selectedCloset.name}
                </Paragraph2>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <span>{selectedCloset.itemCount} items</span>
                {selectedCloset.id === "managed" && (
                  <>
                    <span>·</span>
                    <span className="text-gray-400">Managed by Relisted</span>
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
            <div className="text-center">
              <Paragraph2 className="font-bold text-black">
                {selectedCloset.itemCount}
              </Paragraph2>
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
              </Paragraph2>
              <Paragraph1 className="text-gray-500 text-xs mb-1">
                Total Rentals
              </Paragraph1>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Closet Modal */}
      <EditClosetModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        closetName={selectedCloset.name}
        closetImage={selectedCloset.avatar}
      />
    </>
  );
};

export default ClosetInfoCard;
