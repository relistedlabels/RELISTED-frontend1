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

  const items: Array<{
    id?: string;
    name?: string;
    price?: number;
    imageUrl?: string | null;
    quantity?: number;
    rentalDays?: number;
    rentalFee?: number;
    cleaningFee?: number;
    collateralFee?: number;
    rentalStartDate?: string | null;
    rentalEndDate?: string | null;
  }> = Array.isArray(orderData.items) ? orderData.items : [];

  const orderDeliveryFee = orderData.deliveryFee || 0;
  const orderServiceFee = orderData.serviceFee || 0;
  const orderTotalAmount = orderData.totalAmount || 0;

  const listerInfo = {
    name: orderData.lister?.businessName || "Lister",
    avatar: orderData.lister?.imageUrl || "",
    rating: orderData.lister?.rating || 0,
    totalRentals: 0,
  };

  const formatRentalPeriod = (
    start?: string | null,
    end?: string | null,
    rentalDays?: number,
  ) => {
    if (start && end) {
      return `${new Date(start).toLocaleDateString("en-NG", { month: "short", day: "numeric" })} - ${new Date(end).toLocaleDateString("en-NG", { month: "short", day: "numeric" })}`;
    }
    if (typeof rentalDays === "number" && rentalDays > 0) {
      return `${rentalDays} day${rentalDays === 1 ? "" : "s"}`;
    }
    return "N/A";
  };

  const formatReturn = (end?: string | null) =>
    end
      ? new Date(end).toLocaleDateString("en-NG", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "N/A";

  return (
    <div className="space-y-4">
      <Paragraph1 className="text-sm font-bold uppercase tracking-wide text-gray-500">
        Items in this order ({items.length})
      </Paragraph1>

      {items.length === 0 ? (
        <div className="bg-white p-4 rounded-xl border border-gray-300">
          <Paragraph1 className="text-sm text-gray-600">No line items</Paragraph1>
        </div>
      ) : (
        items.map((line, index) => {
          const key =
            line.id != null ? `${String(line.id)}-${index}` : `item-${index}`;
          const start = line.rentalStartDate ?? orderData.rentalStartDate;
          const end = line.rentalEndDate ?? orderData.rentalEndDate;
          return (
            <div
              key={key}
              className="bg-white p-4 rounded-xl border border-gray-300"
            >
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-1/3 shrink-0 bg-gray-100 rounded-md overflow-hidden h-32">
                  {line.imageUrl ? (
                    <img
                      src={line.imageUrl}
                      alt={line.name || "Item"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                      No image
                    </div>
                  )}
                </div>
                <div className="grow">
                  <Paragraph1 className="text-xl font-bold text-gray-900 leading-tight mb-1">
                    {line.name || "Item"}
                  </Paragraph1>
                  <div className="text-sm text-gray-600 mb-4 space-y-0.5">
                    <Paragraph1>
                      Quantity:{" "}
                      <span className="font-semibold text-gray-800">
                        {line.quantity ?? 1}
                      </span>
                    </Paragraph1>
                    {typeof line.rentalDays === "number" && line.rentalDays > 0 ? (
                      <Paragraph1>
                        Rental length:{" "}
                        <span className="font-semibold text-gray-800">
                          {line.rentalDays} day
                          {line.rentalDays === 1 ? "" : "s"}
                        </span>
                      </Paragraph1>
                    ) : null}
                    {typeof line.price === "number" && line.price > 0 ? (
                      <Paragraph1>
                        Daily rate:{" "}
                        <span className="font-semibold text-gray-800">
                          {CURRENCY}
                          {formatCurrency(line.price)}
                        </span>
                      </Paragraph1>
                    ) : null}
                  </div>
                  <hr className="mb-4 border-gray-200" />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Paragraph1 className="text-xs text-gray-500 block mb-1">
                        Condition
                      </Paragraph1>
                      <Paragraph1 className="font-semibold text-gray-800">
                        Good
                      </Paragraph1>
                    </div>
                    <div>
                      <Paragraph1 className="text-xs text-gray-500 block mb-1">
                        Rental period
                      </Paragraph1>
                      <Paragraph1 className="font-semibold text-gray-800">
                        {formatRentalPeriod(start, end, line.rentalDays)}
                      </Paragraph1>
                    </div>
                    <div>
                      <Paragraph1 className="text-xs text-gray-500 block mb-1">
                        Return due
                      </Paragraph1>
                      <Paragraph1 className="font-semibold text-gray-800">
                        {formatReturn(end)}
                      </Paragraph1>
                    </div>
                    <div>
                      <Paragraph1 className="text-xs text-gray-500 block mb-1">
                        Rental fee
                      </Paragraph1>
                      <Paragraph1 className="text-lg font-bold text-gray-900">
                        {CURRENCY}
                        {formatCurrency(line.rentalFee)}
                      </Paragraph1>
                    </div>
                    <div>
                      <Paragraph1 className="text-xs text-gray-500 block mb-1">
                        Cleaning
                      </Paragraph1>
                      <Paragraph1 className="font-semibold text-gray-900">
                        {CURRENCY}
                        {formatCurrency(line.cleaningFee)}
                      </Paragraph1>
                    </div>
                    <div>
                      <Paragraph1 className="text-xs text-gray-500 block mb-1">
                        Collateral
                      </Paragraph1>
                      <Paragraph1 className="font-semibold text-gray-900">
                        {CURRENCY}
                        {formatCurrency(line.collateralFee)}
                      </Paragraph1>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}

      <div className="bg-white p-4 rounded-xl border border-gray-300">
        <Paragraph1 className="text-sm font-bold text-gray-900 mb-4">
          Order totals
        </Paragraph1>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <Paragraph1 className="text-xs text-gray-500 block mb-1">
              Delivery fee
            </Paragraph1>
            <Paragraph1 className="text-lg font-bold text-gray-900">
              {CURRENCY}
              {formatCurrency(orderDeliveryFee)}
            </Paragraph1>
          </div>
          <div>
            <Paragraph1 className="text-xs text-gray-500 block mb-1">
              Service fee
            </Paragraph1>
            <Paragraph1 className="text-lg font-bold text-gray-900">
              {CURRENCY}
              {formatCurrency(orderServiceFee)}
            </Paragraph1>
          </div>
          <div className="col-span-2">
            <Paragraph1 className="text-xs text-gray-500 block mb-1">
              Total amount
            </Paragraph1>
            <Paragraph1 className="text-lg font-bold text-black">
              {CURRENCY}
              {formatCurrency(orderTotalAmount)}
            </Paragraph1>
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
