"use client";

import React from "react";
import { Paragraph1, Paragraph2 } from "@/common/ui/Text";
import { Star } from "lucide-react";
import Calendar from "./Calendar";
import { useProductDetailsStore } from "@/store/useProductDetailsStore";

interface InventoryItemDetailsHeaderProps {
  onEdit?: () => void;
  onDisable?: () => void;
}

const InventoryItemDetailsHeader: React.FC<InventoryItemDetailsHeaderProps> = ({
  onEdit,
  onDisable,
}) => {
  const product = useProductDetailsStore((state) => state.product);

  if (!product) return null;

  const status = product.status === "REJECTED" ? "Rejected" : "Active";
  const rejectionComment = product.rejectionComment;
  const rating = product.rating || 4.9;
  const reviewCount = product.reviewCount || 0;
  const dailyPrice = product.dailyPrice ?? 0;
  const originalValue = product.originalValue ?? 0;
  const resalePrice = product.resalePrice ?? originalValue;
  const listingType = product.listingType;

  return (
    <div className="bg-transparent w-full max-w-2xl">
      {/* Title & Status */}
      <div className="flex flex-row justify-between items-start gap-2 mb-1">
        <div className="flex flex-wrap items-center gap-2">
          <Paragraph2 className="font-bold text-black text-2xl sm:text-3xl">
            {product.name}
          </Paragraph2>
          <Paragraph1 className="bg-gray-200 px-3 py-0.5 rounded font-bold text-gray-700 text-xs uppercase tracking-wider">
            {status}
          </Paragraph1>
        </div>
        <Calendar />
      </div>

      {/* Description */}
      <Paragraph1 className="mb-2 text-gray-500">{product.subText}</Paragraph1>

      {/* Rejection Reason Banner */}
      {product.status === "REJECTED" && rejectionComment && (
        <div className="bg-red-50 mb-4 p-4 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="flex flex-shrink-0 justify-center items-center bg-red-100 rounded-full w-8 h-8">
              <span className="font-semibold text-red-600 text-sm">!</span>
            </div>
            <div className="flex-1">
              <Paragraph1 className="mb-1 font-semibold text-red-800 text-sm">
                Rejection Reason
              </Paragraph1>
              <Paragraph1 className="text-red-700 text-sm leading-relaxed">
                {rejectionComment}
              </Paragraph1>
            </div>
          </div>
        </div>
      )}

      {/* Rating */}
      <div className="flex flex-wrap items-center gap-1 mb-6">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < Math.floor(rating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-1 font-bold text-black text-sm">{rating}</span>
        <span className="ml-1 text-gray-500 text-sm">
          ({reviewCount} Reviews)
        </span>
      </div>

      {/* Details Box */}
      <div className="bg-[#F7F7F7] mb-4 p-4 border border-gray-300 rounded-[10px]">
        {/* Prices */}
        <div className="flex flex-row justify-between gap-4 mb-2 pb-2 border-gray-300 border-b">
          {listingType === "RESALE" ? (
            <>
              <div>
                <Paragraph1 className="mb-1 font-medium text-gray-500 text-xs uppercase">
                  Resale Price
                </Paragraph1>
                <Paragraph2 className="font-bold text-black text-xl sm:text-2xl">
                  ₦{resalePrice.toLocaleString()}
                </Paragraph2>
              </div>
              <div>
                <Paragraph1 className="mb-1 font-medium text-gray-500 text-xs uppercase">
                  Original Value
                </Paragraph1>
                <Paragraph2 className="font-bold text-gray-500 text-xl sm:text-2xl">
                  ₦{originalValue.toLocaleString()}
                </Paragraph2>
              </div>
            </>
          ) : listingType === "RENTAL" ? (
            <div className="w-full">
              <Paragraph1 className="mb-1 font-medium text-gray-500 text-xs uppercase">
                Daily Rental Price
              </Paragraph1>
              <Paragraph2 className="font-bold text-black text-xl sm:text-2xl">
                ₦{dailyPrice.toLocaleString()}
              </Paragraph2>
            </div>
          ) : (
            // RENT_OR_RESALE or default
            <>
              <div>
                <Paragraph1 className="mb-1 font-medium text-gray-500 text-xs uppercase">
                  Daily Rental Price
                </Paragraph1>
                <Paragraph2 className="font-bold text-black text-xl sm:text-2xl">
                  ₦{dailyPrice.toLocaleString()}
                </Paragraph2>
              </div>
              <div>
                <Paragraph1 className="mb-1 font-medium text-gray-500 text-xs uppercase">
                  Resale Price
                </Paragraph1>
                <Paragraph2 className="font-bold text-black text-xl sm:text-2xl">
                  ₦{resalePrice.toLocaleString()}
                </Paragraph2>
              </div>
            </>
          )}
        </div>

        {/* Specs */}
        <div className="gap-4 grid grid-cols-3 sm:grid-cols-3">
          <div>
            <Paragraph1 className="mb-1 font-medium text-gray-500 text-xs uppercase">
              Size
            </Paragraph1>
            <Paragraph1 className="font-bold text-black">
              {product.measurement}
            </Paragraph1>
          </div>
          <div>
            <Paragraph1 className="mb-1 font-medium text-gray-500 text-xs uppercase">
              Color
            </Paragraph1>
            <Paragraph1 className="font-bold text-black">
              {product.color}
            </Paragraph1>
          </div>
          <div>
            <Paragraph1 className="mb-1 font-medium text-gray-500 text-xs uppercase">
              Condition
            </Paragraph1>
            <Paragraph1 className="font-bold text-black">
              {product.condition}
            </Paragraph1>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryItemDetailsHeader;
