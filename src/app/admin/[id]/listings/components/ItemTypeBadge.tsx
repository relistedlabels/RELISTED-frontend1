import React from "react";

interface ItemTypeBadgeProps {
  listingType?: "RENTAL" | "RESALE" | "RENT_OR_RESALE" | string;
  className?: string;
}

export const ItemTypeBadge: React.FC<ItemTypeBadgeProps> = ({
  listingType,
  className = "",
}) => {
  if (!listingType) return null;

  const normalizedType = listingType.toLowerCase();

  if (normalizedType === "rental" || normalizedType === "rent") {
    return (
      <span
        className={`bg-white text-black border border-black px-2.5 py-1 rounded-full text-[10px] font-semibold ${className}`}
      >
        RENT
      </span>
    );
  }

  if (normalizedType === "resale") {
    return (
      <span
        className={`bg-black text-white px-2.5 py-1 rounded-full text-[10px] font-semibold ${className}`}
      >
        RESALE
      </span>
    );
  }

  if (
    normalizedType === "rent_or_resale" ||
    normalizedType === "rent-resale" ||
    normalizedType === "both"
  ) {
    return (
      <div className={`flex gap-1 ${className}`}>
        <span className="bg-white text-black border border-black px-2.5 py-1 rounded-l-full text-[10px] font-semibold">
          RENT
        </span>
        <span className="bg-black text-white px-2.5 py-1 rounded-r-full text-[10px] font-semibold">
          RESALE
        </span>
      </div>
    );
  }

  return null;
};

export default ItemTypeBadge;
