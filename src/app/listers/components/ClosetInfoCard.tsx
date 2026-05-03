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
  slug?: string;
  description?: string;
  isActive?: boolean;
}

interface ClosetInfoCardProps {
  selectedCloset: SelectedCloset;
  availableCount: number;
  totalRentals: number;
  onBrowseClosets?: () => void;
  onCreateCloset?: () => void;
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

const getRandomBgColor = (name: string) => {
  const charCode = name.charCodeAt(0);
  return BG_COLORS[charCode % BG_COLORS.length];
};

const ClosetInfoCard: React.FC<ClosetInfoCardProps> = ({
  selectedCloset,
  availableCount,
  totalRentals,
  onBrowseClosets,
  onCreateCloset,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const slugSegment = selectedCloset.slug ?? "";

  return (
    <>
      <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {onBrowseClosets ? (
            <button
              type="button"
              onClick={onBrowseClosets}
              className="shrink-0 text-sm font-semibold text-gray-600 hover:text-black transition-colors"
            >
              ← All closets
            </button>
          ) : null}
          <h2 className="font-semibold text-black text-2xl">Inventory</h2>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {onCreateCloset ? (
            <button
              type="button"
              onClick={onCreateCloset}
              className="px-4 py-2 rounded-lg border border-gray-300 font-semibold text-gray-900 text-sm hover:bg-gray-50 transition duration-150"
            >
              Create closet
            </button>
          ) : null}
          <button
            type="button"
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

      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <div className="grid sm:grid-cols-2 grid-cols-1 items-center justify-between gap-6">
          <div className="flex items-center gap-4 flex-1">
            {selectedCloset.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
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

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Paragraph2 className="font-bold text-black truncate">
                  {selectedCloset.name}
                </Paragraph2>
                {selectedCloset.isActive === false && (
                  <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
                    Hidden
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <span>{selectedCloset.itemCount} items</span>
              </div>
              {slugSegment ? (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Link
                    href={`/closets/${encodeURIComponent(slugSegment)}`}
                    className="truncate underline hover:text-gray-800"
                  >
                    /closets/{slugSegment}
                  </Link>
                </div>
              ) : null}
            </div>
          </div>

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

      <EditClosetModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        closetId={selectedCloset.id}
        closetName={selectedCloset.name}
        closetDescription={selectedCloset.description}
        closetImage={selectedCloset.avatar}
        isActive={selectedCloset.isActive ?? true}
      />
    </>
  );
};

export default ClosetInfoCard;
