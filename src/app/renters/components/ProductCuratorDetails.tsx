"use client";

import React from "react";
import { Star } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";

const formatCurrency = (amount: number | undefined): string => {
  if (!amount) return "0";
  return amount.toLocaleString("en-NG");
};
const CURRENCY = "₦";

interface ProductCuratorDetailsProps {
  orderData?: any;
}

export default function ProductCuratorDetails({
  orderData,
}: ProductCuratorDetailsProps) {
  if (!orderData) {
    return (
      <div className="text-center py-8 text-red-500">
        <Paragraph1>No order data available</Paragraph1>
      </div>
    );
  }

  // Extract first item from items array
  const firstItem = orderData.items?.[0];
  
  // Extract product and pricing data from order
  const productInfo = {
    name: firstItem?.name || "Item",
    description: "",
    images: firstItem?.imageUrl ? [firstItem.imageUrl] : [],
    condition: "Good",
  };

  const pricingInfo = {
    rentalPrice: firstItem?.rentalFee || 0,
    cleaningFee: firstItem?.cleaningFee || 0,
    collateralFee: firstItem?.collateralFee || 0,
    deliveryFee: orderData.deliveryFee || 0,
    serviceFee: orderData.serviceFee || 0,
    totalAmount: orderData.totalAmount || 0,
  };

  // Extract lister data
  const listerInfo = {
    name: orderData.lister?.businessName || "Lister",
    avatar: orderData.lister?.imageUrl || "",
    rating: orderData.lister?.rating || 0,
    totalRentals: 0,
  };

  const rentalStartDate = firstItem?.rentalStartDate || orderData.rentalStartDate;
  const rentalEndDate = firstItem?.rentalEndDate || orderData.rentalEndDate;

  const returnDate = rentalEndDate
    ? new Date(rentalEndDate).toLocaleDateString("en-NG", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "N/A";

  return (
    <div className="space-y-4">
      {/* --- 1. PRODUCT DETAILS CARD --- */}
      <div className="bg-white p-4 rounded-xl border border-gray-300">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Product Image */}
          <div className="w-full sm:w-1/3 shrink-0 bg-gray-100 rounded-md overflow-hidden h-32">
            {productInfo.images?.[0] ? (
              <img
                src={productInfo.images[0]}
                alt={productInfo.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No image
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="grow">
            {/* Title and Description */}
            <Paragraph1 className="text-xl font-bold text-gray-900 leading-tight mb-1">
              {productInfo.name}
            </Paragraph1>
            <Paragraph1 className="text-sm text-gray-600 mb-4">
              {productInfo.description || `Quantity: ${firstItem?.quantity || 1}`}
            </Paragraph1>

            <hr className="mb-4 border-gray-200" />

            {/* Grid Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              {/* Condition */}
              <div>
                <Paragraph1 className="text-xs text-gray-500 block mb-1">
                  Condition
                </Paragraph1>
                <Paragraph1 className="font-semibold text-gray-800">
                  {productInfo.condition}
                </Paragraph1>
              </div>

              {/* Rental Period */}
              <div>
                <Paragraph1 className="text-xs text-gray-500 block mb-1">
                  Rental Period
                </Paragraph1>
                <Paragraph1 className="font-semibold text-gray-800">
                  {rentalStartDate && rentalEndDate
                    ? `${new Date(rentalStartDate).toLocaleDateString("en-NG", { month: "short", day: "numeric" })} - ${new Date(rentalEndDate).toLocaleDateString("en-NG", { month: "short", day: "numeric" })}`
                    : "N/A"}
                </Paragraph1>
              </div>

              {/* Return Due */}
              <div>
                <Paragraph1 className="text-xs text-gray-500 block mb-1">
                  Return Due
                </Paragraph1>
                <Paragraph1 className="font-semibold text-gray-800">
                  {returnDate}
                </Paragraph1>
              </div>

              {/* Rental Fee */}
              <div>
                <Paragraph1 className="text-xs text-gray-500 block mb-1">
                  Rental Fee
                </Paragraph1>
                <Paragraph1 className="text-lg font-bold text-gray-900">
                  {CURRENCY}
                  {formatCurrency(pricingInfo.rentalPrice)}
                </Paragraph1>
              </div>

              {/* Delivery Fee */}
              <div>
                <Paragraph1 className="text-xs text-gray-500 block mb-1">
                  Delivery Fee
                </Paragraph1>
                <Paragraph1 className="text-lg font-bold text-gray-900">
                  {CURRENCY}
                  {formatCurrency(pricingInfo.deliveryFee)}
                </Paragraph1>
              </div>

              {/* Service Fee */}
              <div>
                <Paragraph1 className="text-xs text-gray-500 block mb-1">
                  Service Fee
                </Paragraph1>
                <Paragraph1 className="text-lg font-bold text-gray-900">
                  {CURRENCY}
                  {formatCurrency(pricingInfo.serviceFee)}
                </Paragraph1>
              </div>

              {/* Total Amount */}
              <div>
                <Paragraph1 className="text-xs text-gray-500 block mb-1">
                  Total Amount
                </Paragraph1>
                <Paragraph1 className="text-lg font-bold text-black">
                  {CURRENCY}
                  {formatCurrency(pricingInfo.totalAmount)}
                </Paragraph1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- 2. LISTER CARD --- */}
      <div className="bg-white p-4 rounded-xl border border-gray-300">
        <Paragraph1 className="text-lg font-bold text-gray-900 mb-4">
          Lister
        </Paragraph1>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            {/* Lister Avatar */}
            <div className="w-14 h-14 bg-gray-300 rounded-full overflow-hidden shrink-0 flex items-center justify-center">
              {listerInfo.avatar ? (
                <img
                  src={listerInfo.avatar}
                  alt={listerInfo.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Paragraph1 className="text-xl font-bold text-white">
                  {listerInfo.name?.charAt(0) || "L"}
                </Paragraph1>
              )}
            </div>

            {/* Lister Info */}
            <div>
              <Paragraph1 className="text-sm font-bold text-gray-900 uppercase">
                {listerInfo.name}
              </Paragraph1>
              <div className="flex items-center mt-1 gap-1">
                {/* Rating Stars */}
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={
                        i < Math.floor(listerInfo.rating || 0)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }
                    />
                  ))}
                <Paragraph1 className="ml-1 text-sm font-medium text-gray-700">
                  {listerInfo.rating?.toFixed(1) || "0.0"} (
                  {listerInfo.totalRentals || 0} rentals)
                </Paragraph1>
              </div>
            </div>
          </div>

          {/* View Profile Button */}
          <button className="text-sm font-semibold text-gray-900 underline hover:text-black transition-colors">
            <Paragraph1>PROFILE</Paragraph1>
          </button>
        </div>
      </div>
    </div>
  );
}
