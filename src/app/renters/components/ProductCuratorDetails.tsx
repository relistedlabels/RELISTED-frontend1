"use client";

import React from "react";
import { Star } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";

// --- Product and Curator Placeholder Data ---
const productData = {
  name: "Fendi Arco",
  description: "Black hagfish leather boots",
  size: "Small",
  color: "Black",
  rentalFee: 20000,
  itemValueEscrow: 200000,
  returnDuration: "Oct 19, 2025",
};

const curatorData = {
  name: "BETTY DANIELS",
  rating: 4.9,
  // Placeholder for a profile image URL
  profileImageUrl: "/path/to/betty_daniels_profile.png",
};

// Formatting Helper
const formatCurrency = (amount: number): string => {
  return amount.toLocaleString("en-NG");
};
const CURRENCY = "₦";

interface ProductCuratorDetailsProps {
  orderId?: string;
}

export default function ProductCuratorDetails({
  orderId,
}: ProductCuratorDetailsProps) {
  return (
    <div className=" space-y-4">
      {/* --- 1. PRODUCT DETAILS CARD --- */}
      <div className="bg-white p-4 rounded-xl  border border-gray-300">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Product Image */}
          <div className="w-full sm:w-1/3 shrink-0 bg-gray-100 rounded-md overflow-hidden">
            {/* Placeholder for the image */}
          </div>

          {/* Product Info */}
          <div className="grow">
            {/* Title and Description */}
            <Paragraph1 className="text-xl font-bold text-gray-900 leading-tight mb-1">
              {productData.name}
            </Paragraph1>
            <Paragraph1 className="text-sm text-gray-600 mb-4">
              {productData.description}
            </Paragraph1>

            <hr className="mb-4 border-gray-200" />

            {/* Grid Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              {/* Size */}
              <div>
                <span className="text-xs text-gray-500 block mb-1">Size</span>
                <Paragraph1 className="font-semibold text-gray-800">
                  {productData.size}
                </Paragraph1>
              </div>

              {/* Color */}
              <div>
                <span className="text-xs text-gray-500 block mb-1">Color</span>
                <Paragraph1 className="font-semibold text-gray-800">
                  {productData.color}
                </Paragraph1>
              </div>

              {/* Return Duration */}
              <div>
                <span className="text-xs text-gray-500 block mb-1">
                  <Paragraph1> </Paragraph1> Return Duration
                </span>
                <Paragraph1 className="font-semibold text-gray-800">
                  {productData.returnDuration}
                </Paragraph1>
              </div>

              {/* Return Due */}
              <div>
                <span className="text-xs text-gray-500 block mb-1">
                  <Paragraph1>Return Due</Paragraph1>
                </span>
                <Paragraph1 className="font-semibold text-gray-800">
                  {productData.returnDuration}
                </Paragraph1>
                {/* Assuming Return Due is the same as the date calculated from duration */}
              </div>

              {/* Rental Fee */}
              <div>
                <span className="text-xs text-gray-500 block mb-1">
                  <Paragraph1> Rental Fee</Paragraph1>
                </span>
                <Paragraph1 className="text-lg font-bold text-gray-900">
                  {CURRENCY}
                  {formatCurrency(productData.rentalFee)}
                </Paragraph1>
              </div>

              {/* Item Value (Escrow) */}
              <div>
                <span className="text-xs text-gray-500 block mb-1">
                  <Paragraph1>Item Value (Escrow)</Paragraph1>
                </span>
                <Paragraph1 className="text-lg font-bold text-gray-900">
                  {CURRENCY}
                  {formatCurrency(productData.itemValueEscrow)}
                </Paragraph1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- 2. CURATOR CARD --- */}
      <div className="bg-white p-4 rounded-xl  border border-gray-300">
        <Paragraph1 className="text-lg font-bold text-gray-900 mb-4">
          Curator
        </Paragraph1>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            {/* Curator Profile Image/Avatar */}
            <div className="w-14 h-14 bg-gray-200 rounded-full overflow-hidden shrink-0">
              {/* Placeholder image tag */}
            </div>

            {/* Curator Info */}
            <div>
              <Paragraph1 className="text-sm font-bold text-gray-900 uppercase">
                {curatorData.name}
              </Paragraph1>
              <div className="flex items-center mt-1">
                {/* Rating Stars */}
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={
                        i < Math.floor(curatorData.rating)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }
                    />
                  ))}
                <span className="ml-1 text-sm font-medium text-gray-700">
                  {curatorData.rating}
                </span>
              </div>
            </div>
          </div>

          {/* View Profile Button */}
          <button className="text-sm font-semibold text-gray-900 underline hover:text-black transition-colors">
            <Paragraph1> VIEW PROFILE</Paragraph1>
          </button>
        </div>
      </div>
    </div>
  );
}
