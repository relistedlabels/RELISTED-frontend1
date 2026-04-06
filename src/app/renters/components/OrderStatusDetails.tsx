"use client";

import React from "react";
import { Lock, ShoppingBag, AlertCircle } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";

const CURRENCY = "₦";

const formatCurrency = (amount: number | undefined): string => {
  if (!amount) return "0";
  return amount.toLocaleString("en-NG");
};

interface OrderStatusDetailsProps {
  orderData?: any;
}

export default function OrderStatusDetails({
  orderData,
}: OrderStatusDetailsProps) {
  if (!orderData) {
    return (
      <div className="text-center py-8 text-red-500">
        <Paragraph1>No order data available</Paragraph1>
      </div>
    );
  }

  // Get locked amount from order
  const lockedAmount = orderData.totalAmount || 0;

  const items = Array.isArray(orderData.items) ? orderData.items : [];
  const itemEnds = items
    .map((it: { rentalEndDate?: string | null }) => it.rentalEndDate)
    .filter(Boolean) as string[];
  const latestItemEnd = itemEnds.reduce<string | undefined>((best, d) => {
    if (!best) return d;
    return new Date(d) > new Date(best) ? d : best;
  }, undefined);
  const rentalEndDate =
    orderData.rentalEndDate || latestItemEnd || items[0]?.rentalEndDate;

  const returnDate = rentalEndDate
    ? new Date(rentalEndDate).toLocaleDateString("en-NG", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

  // Get current status
  const status = orderData.status || "PROCESSING";

  // Format status for display
  const formatStatus = (status: string) => {
    return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // Get order date
  const orderDate = orderData.createdAt
    ? new Date(orderData.createdAt).toLocaleDateString("en-NG", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "N/A";

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
              <Paragraph1 className="font-semibold text-gray-900">
                {formatStatus(status)}
              </Paragraph1>
            </div>
          </div>

          {/* Order Date */}
          <div className="p-4 bg-white rounded-xl border border-gray-300">
            <Paragraph1 className="text-xs text-gray-500 block mb-2">
              Order Date
            </Paragraph1>
            <Paragraph1 className="font-semibold text-gray-900">
              {orderDate}
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

              {orderData.canReturn === false && (
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

              {orderData.canReturn === true && (
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

      {/* --- 4. TRACKING STATUS --- */}
      {orderData.tracking && (
        <div>
          <Paragraph1 className="text-base font-bold text-gray-900 mb-3">
            Tracking Status
          </Paragraph1>

          <div className="p-4 bg-white rounded-xl border border-gray-300 space-y-3">
            <div>
              <Paragraph1 className="text-xs text-gray-500 block mb-1">
                Current Status
              </Paragraph1>
              <Paragraph1 className="font-semibold text-blue-600">
                {orderData.tracking.status}
              </Paragraph1>
            </div>

            {orderData.tracking.updates &&
              orderData.tracking.updates.length > 0 && (
                <div>
                  <Paragraph1 className="text-xs text-gray-500 block mb-2">
                    Updates
                  </Paragraph1>
                  <div className="space-y-1">
                    {orderData.tracking.updates.map(
                      (update: any, index: number) => (
                        <Paragraph1
                          key={index}
                          className="text-sm text-gray-700"
                        >
                          {update}
                        </Paragraph1>
                      ),
                    )}
                  </div>
                </div>
              )}
          </div>
        </div>
      )}

      {/* --- 5. SHIPPING ADDRESS --- */}
      {orderData.shippingAddress && (
        <div>
          <Paragraph1 className="text-base font-bold text-gray-900 mb-3">
            Shipping Address
          </Paragraph1>

          <div className="p-4 bg-white rounded-xl border border-gray-300">
            <Paragraph1 className="text-sm text-gray-700 mb-2">
              {orderData.shippingAddress.street}
            </Paragraph1>
            <Paragraph1 className="text-sm text-gray-700">
              {orderData.shippingAddress.city},{" "}
              {orderData.shippingAddress.state}{" "}
              {orderData.shippingAddress.zipCode}
            </Paragraph1>
            <Paragraph1 className="text-sm text-gray-700">
              {orderData.shippingAddress.country}
            </Paragraph1>
          </div>
        </div>
      )}
    </div>
  );
}
