"use client";

import React from "react";
import { Lock, ShoppingBag, AlertCircle } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import { useOrderDetails } from "@/lib/queries/renters/useOrderDetails";
import { useWallet } from "@/lib/queries/renters/useWallet";

const CURRENCY = "₦";

const formatCurrency = (amount: number | undefined): string => {
  if (!amount) return "0";
  return amount.toLocaleString("en-NG");
};

interface OrderStatusDetailsProps {
  orderId?: string;
}

export default function OrderStatusDetails({
  orderId,
}: OrderStatusDetailsProps) {
  const { data: order, isLoading: orderLoading } = useOrderDetails(
    orderId || "",
  );
  const { data: walletData, isLoading: walletLoading } = useWallet();

  if (orderLoading || walletLoading) {
    return <div className="animate-pulse h-40 bg-gray-200 rounded-xl"></div>;
  }

  if (!order) {
    return (
      <div className="text-center py-8 text-red-500">
        Failed to load order status
      </div>
    );
  }

  // Get locked amount from wallet data or use security deposit from order
  const lockedAmount = order.pricing?.totalAmount || 0;

  // Get return date from order timeline
  const returnDate = order.rentalTimeline?.returnDueDate
    ? new Date(order.rentalTimeline.returnDueDate).toLocaleDateString("en-NG", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

  // Get current status
  const status = order.status || "pending";

  return (
    <div className="space-y-6">
      {/* --- 1. MONEY LOCKED NOTICE --- */}
      {status !== "completed" && lockedAmount > 0 && (
        <div className="p-4 bg-yellow-50 rounded-xl border-l-4 border-yellow-400 shadow-sm">
          <div className="flex items-start gap-4">
            <Lock size={24} className="shrink-0 mt-1 text-yellow-600" />
            <div>
              <Paragraph1 className="text-sm font-bold text-gray-900 mb-1">
                {CURRENCY}
                {formatCurrency(lockedAmount)} is currently locked
              </Paragraph1>
              <Paragraph1 className="text-sm text-gray-700">
                Money from your wallet is locked until you return the item and
                it's approved by the lister. This protects both you and the
                lister.
              </Paragraph1>
            </div>
          </div>
        </div>
      )}

      {/* --- 2. ORDER STATUS --- */}
      <div>
        <Paragraph1 className="text-base font-bold text-gray-900 mb-3">
          Order Status
        </Paragraph1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Status Badge */}
          <div className="p-4 bg-white rounded-xl border border-gray-300">
            <Paragraph1 className="text-xs text-gray-500 block mb-2">
              Current Status
            </Paragraph1>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <Paragraph1 className="font-semibold text-gray-900 capitalize">
                {status}
              </Paragraph1>
            </div>
          </div>

          {/* Order Date */}
          <div className="p-4 bg-white rounded-xl border border-gray-300">
            <Paragraph1 className="text-xs text-gray-500 block mb-2">
              Order Date
            </Paragraph1>
            <Paragraph1 className="font-semibold text-gray-900">
              {order.rentalTimeline?.orderDate
                ? new Date(order.rentalTimeline.orderDate).toLocaleDateString(
                    "en-NG",
                    {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    },
                  )
                : "N/A"}
            </Paragraph1>
          </div>
        </div>
      </div>

      {/* --- 3. RETURN STATUS --- */}
      <div>
        <Paragraph1 className="text-base font-bold text-gray-900 mb-3">
          Return Information
        </Paragraph1>

        <div className="p-4 bg-white rounded-xl border border-gray-300">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
              <ShoppingBag size={16} className="text-blue-600" />
            </div>

            <div className="flex-1">
              <Paragraph1 className="text-sm font-bold text-gray-900 mb-1">
                Return Due Date
              </Paragraph1>
              <Paragraph1 className="text-sm text-gray-700 mb-3">
                Please return the item by{" "}
                <span className="font-semibold text-gray-900">
                  {returnDate}
                </span>
              </Paragraph1>

              {order.canReturn === false && (
                <div className="flex items-start gap-2 mt-3 p-3 bg-orange-50 rounded border border-orange-200">
                  <AlertCircle
                    size={16}
                    className="text-orange-600 flex-shrink-0 mt-0.5"
                  />
                  <Paragraph1 className="text-xs text-orange-700">
                    You can start the return process once the rental period ends
                  </Paragraph1>
                </div>
              )}

              {order.canReturn === true && (
                <div className="flex items-start gap-2 mt-3 p-3 bg-green-50 rounded border border-green-200">
                  <AlertCircle
                    size={16}
                    className="text-green-600 flex-shrink-0 mt-0.5"
                  />
                  <Paragraph1 className="text-xs text-green-700">
                    You can now start the return process
                  </Paragraph1>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- 4. DELIVERY TRACKING --- */}
      {order.deliveryTracking && (
        <div>
          <Paragraph1 className="text-base font-bold text-gray-900 mb-3">
            Delivery Tracking
          </Paragraph1>

          <div className="p-4 bg-white rounded-xl border border-gray-300 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <Paragraph1 className="text-xs text-gray-500 block mb-1">
                  Tracking ID
                </Paragraph1>
                <Paragraph1 className="font-semibold text-gray-900">
                  {order.deliveryTracking.trackingId}
                </Paragraph1>
              </div>
              <div className="text-right">
                <Paragraph1 className="text-xs text-gray-500 block mb-1">
                  Carrier
                </Paragraph1>
                <Paragraph1 className="font-semibold text-gray-900">
                  {order.deliveryTracking.carrier}
                </Paragraph1>
              </div>
            </div>

            <div>
              <Paragraph1 className="text-xs text-gray-500 block mb-1">
                Status
              </Paragraph1>
              <Paragraph1 className="font-semibold text-blue-600">
                {order.deliveryTracking.currentLocation}
              </Paragraph1>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
