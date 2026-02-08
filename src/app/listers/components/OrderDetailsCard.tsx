"use client";
// ENDPOINTS: GET /api/listers/orders/:orderId (order header details with approval countdown)

import React, { useState, useEffect } from "react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";

interface OrderDetailsProps {
  orderNumber?: string;
  status?: "Pending Approval" | "Ongoing" | "Completed" | "Cancelled";
  dateOrdered?: string;
  itemCount?: number;
  itemsDelivered?: number;
  totalItems?: number;
  totalAmount?: string;
  expiresAt?: string; // ISO timestamp from backend
  timeRemainingSeconds?: number; // Fallback if expiresAt not provided
  onApprove?: () => void;
  onReject?: () => void;
  isLoading?: boolean;
}

const OrderDetailsCard: React.FC<OrderDetailsProps> = ({
  orderNumber = "43RF843R90",
  status = "Pending Approval",
  dateOrdered = "Sun, Oct 19 2025",
  itemCount = 3,
  itemsDelivered = 1,
  totalItems = 6,
  totalAmount = "₦550,000",
  expiresAt,
  timeRemainingSeconds = 900, // Default 15 minutes
  onApprove,
  onReject,
  isLoading = false,
}) => {
  const [secondsRemaining, setSecondsRemaining] =
    useState(timeRemainingSeconds);
  const [isApprovalExpired, setIsApprovalExpired] = useState(false);
  const isPendingApproval = status === "Pending Approval";

  // Countdown timer effect
  useEffect(() => {
    if (!isPendingApproval || isApprovalExpired) return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          setIsApprovalExpired(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPendingApproval, isApprovalExpired]);

  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Determine if timer should show warning color (< 5 minutes)
  const isLowTime = secondsRemaining < 300; // 5 minutes = 300 seconds
  const timerColor = isApprovalExpired
    ? "text-red-600"
    : isLowTime
      ? "text-orange-500"
      : "text-black";
  const timerBg = isApprovalExpired
    ? "bg-red-50"
    : isLowTime
      ? "bg-orange-50"
      : "bg-white";

  return (
    <div className="w-full bg-white border border-gray-300 rounded-2xl p-4">
      {/* 1. Header Row: Order Number and Status Badge */}
      <div className="flex justify-between items-start mb-6">
        <Paragraph3 className="text-xl font-bold text-black uppercase tracking-tight">
          ORDER {orderNumber}
        </Paragraph3>

        <div className="flex flex-col items-end space-y-1">
          <Paragraph1 className="hidden sm:flex text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Order Status
          </Paragraph1>
          <Paragraph1 className="px-4 py-1.5 bg-[#FFF9E5] text-[#D4A017] text-xs font-bold rounded-lg whitespace-nowrap">
            {status}
          </Paragraph1>
        </div>
      </div>

      {/* Countdown Timer - Only show for pending approval */}
      {isPendingApproval && (
        <div
          className={`mb-6 p-4 rounded-lg ${timerBg} border ${isApprovalExpired ? "border-red-300" : isLowTime ? "border-orange-300" : "border-gray-200"}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg">⏱</span>
              <Paragraph1 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                {isApprovalExpired
                  ? "Order Approval Expired"
                  : "Time Remaining to Approve"}
              </Paragraph1>
            </div>
            <div>
              <Paragraph3
                className={`text-2xl font-bold font-mono ${timerColor}`}
              >
                {formatTime(secondsRemaining)}
              </Paragraph3>
              <Paragraph1 className="text-[10px] text-gray-500 text-right mt-1">
                {isApprovalExpired
                  ? "This order will be auto-cancelled"
                  : "Approve or reject order"}
              </Paragraph1>
            </div>
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="w-full h-px bg-gray-300 mb-8" />

      {/* 2. Details Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {/* Date Ordered */}
        <div className="flex flex-col">
          <Paragraph1 className="text-[10px] font-bold text-gray-400 uppercase mb-1">
            Date Ordered
          </Paragraph1>
          <Paragraph1 className="font-bold text-black text-sm">
            {dateOrdered}
          </Paragraph1>
        </div>

        {/* Number of Items */}
        <div className="flex flex-col">
          <Paragraph1 className="text-[10px] font-bold text-gray-400 uppercase mb-1">
            Number of Items
          </Paragraph1>
          <Paragraph1 className="font-bold text-black text-sm">
            {itemCount} Items
          </Paragraph1>
        </div>

        {/* Items Delivered Progress */}
        <div className="flex flex-col sm:items-center ">
          <Paragraph1 className="text-[10px] font-bold text-gray-400 uppercase mb-1">
            Items Delivered
          </Paragraph1>
          <Paragraph1 className="font-bold text-black text-sm">
            {itemsDelivered} / {totalItems} Delivered
          </Paragraph1>
        </div>

        {/* Total Amount */}
        <div className="flex flex-col sm:items-end">
          <Paragraph1 className="text-[10px] font-bold text-gray-400 uppercase mb-1">
            Total Amount
          </Paragraph1>
          <Paragraph1 className="font-bold text-black text-sm">
            {totalAmount}
          </Paragraph1>
        </div>
      </div>

      {/* Action Buttons - Only show for pending approval */}
      {isPendingApproval && !isApprovalExpired && (
        <div className="flex gap-3 mt-8 pt-8 border-t border-gray-300">
          <button
            onClick={onReject}
            disabled={isLoading}
            className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-black font-bold text-sm rounded-lg transition-colors"
          >
            {isLoading ? "Processing..." : "Reject Order"}
          </button>
          <button
            onClick={onApprove}
            disabled={isLoading}
            className="flex-1 px-6 py-3 bg-black hover:bg-gray-900 disabled:opacity-50 text-white font-bold text-sm rounded-lg transition-colors"
          >
            {isLoading ? "Processing..." : "Approve Order"}
          </button>
        </div>
      )}

      {/* Expired Notice */}
      {isApprovalExpired && (
        <div className="mt-8 pt-8 border-t border-red-200 bg-red-50 p-4 rounded-lg">
          <Paragraph1 className="text-xs font-bold text-red-700">
            ⚠ This order's approval deadline has expired and will be
            automatically cancelled.
          </Paragraph1>
        </div>
      )}
    </div>
  );
};

export default OrderDetailsCard;
