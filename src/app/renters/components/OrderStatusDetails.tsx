"use client";

import React from "react";
import {
  Lock,
  ShoppingBag,
  AlertCircle,
  ExternalLink,
  Copy,
} from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import {
  getRenterOrderStatusLabel,
  normalizeRenterOrderStatusKey,
} from "@/lib/renters/renterOrderStatus";
import { toast } from "sonner";

const CURRENCY = "₦";

const formatCurrency = (amount: number | undefined): string => {
  if (!amount) return "0";
  return amount.toLocaleString("en-NG");
};

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
  toast.success("Tracking ID copied to clipboard");
};

interface OrderStatusDetailsProps {
  orderData?: any;
}

export default function OrderStatusDetails({
  orderData,
}: OrderStatusDetailsProps) {
  if (!orderData) {
    return (
      <div className="py-8 text-red-500 text-center">
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

  // Format status for display using proper status mapping
  const statusLabel = getRenterOrderStatusLabel(status);
  const statusKey = normalizeRenterOrderStatusKey(String(status));
  const terminalOrderStatuses = new Set([
    "COMPLETED",
    "RETURNED",
    "CANCELLED",
    "REJECTED",
  ]);
  const showLockedFundsNotice =
    !terminalOrderStatuses.has(statusKey) && lockedAmount > 0;

  // Get order date
  const orderDate = orderData.createdAt
    ? new Date(orderData.createdAt).toLocaleDateString("en-NG", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "N/A";

  const hasReturnDetails =
    Boolean(
      String(orderData.returnPickup?.pickupWindowSummary ?? "").trim(),
    ) ||
    Boolean(String(orderData.returnPickup?.trackingNumber ?? "").trim()) ||
    Boolean(
      String(orderData.returnLeg?.trackingId ?? "").trim() ||
        String(orderData.returnLeg?.providerTrackingUrl ?? "").trim(),
    );

  return (
    <div className="space-y-6">
      {/* --- 1. MONEY LOCKED NOTICE --- */}
      {showLockedFundsNotice && (
        <div className="bg-yellow-50 shadow-sm p-4 border-yellow-400 border-l-4 rounded-xl">
          <div className="flex items-start gap-4">
            <Lock size={24} className="mt-1 text-yellow-600 shrink-0" />
            <div>
              <Paragraph1 className="mb-1 font-bold text-gray-900 text-sm">
                {CURRENCY}
                {formatCurrency(lockedAmount)} is currently locked
              </Paragraph1>
              <Paragraph1 className="text-gray-700 text-sm">
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
        <Paragraph1 className="mb-3 font-bold text-gray-900 text-base">
          Order Status
        </Paragraph1>

        <div className="gap-3 grid grid-cols-1 sm:grid-cols-2">
          {/* Status Badge */}
          <div className="bg-white p-4 border border-gray-300 rounded-xl">
            <Paragraph1 className="block mb-2 text-gray-500 text-xs">
              Current Status
            </Paragraph1>
            <div className="flex items-center gap-2">
              <div className="bg-blue-500 rounded-full w-3 h-3"></div>
              <Paragraph1 className="font-semibold text-gray-900">
                {statusLabel}
              </Paragraph1>
            </div>
          </div>

          {/* Order Date */}
          <div className="bg-white p-4 border border-gray-300 rounded-xl">
            <Paragraph1 className="block mb-2 text-gray-500 text-xs">
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
        <Paragraph1 className="mb-3 font-bold text-gray-900 text-base">
          Return Information
        </Paragraph1>

        <div className="bg-white p-4 border border-gray-300 rounded-xl">
          <div className="flex items-start gap-4">
            <div className="flex justify-center items-center bg-blue-100 rounded-full w-8 h-8 shrink-0">
              <ShoppingBag size={16} className="text-blue-600" />
            </div>

            <div className="flex-1">
              <Paragraph1 className="mb-1 font-bold text-gray-900 text-sm">
                Return Due Date
              </Paragraph1>
              <Paragraph1 className="mb-3 text-gray-700 text-sm">
                Please return the item by{" "}
                <span className="font-semibold text-gray-900">
                  {returnDate}
                </span>
              </Paragraph1>

              {orderData.canReturn === false && (
                <div className="flex items-start gap-2 bg-orange-50 mt-3 p-3 border border-orange-200 rounded">
                  <AlertCircle
                    size={16}
                    className="flex-shrink-0 mt-0.5 text-orange-600"
                  />
                  <Paragraph1 className="text-orange-700 text-xs">
                    You can start the return process once the rental period ends
                  </Paragraph1>
                </div>
              )}

              {orderData.canReturn === true && (
                <div className="flex items-start gap-2 bg-green-50 mt-3 p-3 border border-green-200 rounded">
                  <AlertCircle
                    size={16}
                    className="flex-shrink-0 mt-0.5 text-green-600"
                  />
                  <Paragraph1 className="text-green-700 text-xs">
                    You can now start the return process
                  </Paragraph1>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- 3b. RETURN PICKUP (only when we have a window, tracking, or link) --- */}
      {hasReturnDetails && (
        <div>
          <Paragraph1 className="mb-3 font-bold text-gray-900 text-base">
            Your return
          </Paragraph1>
          <div className="space-y-3 bg-white p-4 border border-gray-300 rounded-xl">
            {orderData.returnPickup?.pickupWindowSummary ? (
              <div>
                <Paragraph1 className="block mb-1 text-gray-500 text-xs">
                  Scheduled pickup window
                </Paragraph1>
                <Paragraph1 className="font-semibold text-gray-900">
                  {orderData.returnPickup.pickupWindowSummary}
                </Paragraph1>
                <Paragraph1 className="mt-2 text-gray-600 text-xs">
                  This is when the carrier plans to collect the return — it is
                  not the same as the package already being on the way to the
                  lister.
                </Paragraph1>
              </div>
            ) : null}
            {orderData.returnPickup?.trackingNumber ? (
              <div>
                <Paragraph1 className="block mb-1 text-gray-500 text-xs">
                  Return tracking
                </Paragraph1>
                <div className="flex items-center gap-2">
                  <Paragraph1 className="font-mono font-semibold text-gray-900">
                    {orderData.returnPickup.trackingNumber}
                  </Paragraph1>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(orderData.returnPickup.trackingNumber)
                    }
                    className="p-1 text-gray-500 hover:text-gray-700 transition"
                    title="Copy tracking"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
            ) : null}
            {orderData.returnLeg &&
            (orderData.returnLeg.trackingId ||
              orderData.returnLeg.providerTrackingUrl) ? (
              <div>
                {orderData.returnLeg.trackingId ? (
                  <div>
                    <Paragraph1 className="block mb-1 text-gray-500 text-xs">
                      Return tracking
                    </Paragraph1>
                    <Paragraph1 className="font-mono font-semibold text-gray-900">
                      {orderData.returnLeg.trackingId}
                    </Paragraph1>
                  </div>
                ) : null}
                {orderData.returnLeg.providerTrackingUrl ? (
                  <a
                    href={orderData.returnLeg.providerTrackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-2 font-semibold text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <ExternalLink size={14} />
                    Track return shipment
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* --- 4. TRACKING STATUS --- */}
      {(orderData.tracking || orderData.trackingId) && (
        <div>
          <Paragraph1 className="mb-3 font-bold text-gray-900 text-base">
            Tracking Status
          </Paragraph1>

          <div className="space-y-3 bg-white p-4 border border-gray-300 rounded-xl">
            {orderData.tracking && (
              <div>
                <Paragraph1 className="block mb-1 text-gray-500 text-xs">
                  Current Status
                </Paragraph1>
                <Paragraph1 className="font-semibold text-blue-600">
                  {getRenterOrderStatusLabel(
                    String(orderData.tracking.status ?? ""),
                  )}
                </Paragraph1>
              </div>
            )}

            {orderData.trackingId && (
              <div>
                <Paragraph1 className="block mb-1 text-gray-500 text-xs">
                  Tracking ID
                </Paragraph1>
                <div className="flex items-center gap-2">
                  <Paragraph1 className="font-mono font-semibold text-gray-900">
                    {orderData.trackingId}
                  </Paragraph1>
                  <button
                    onClick={() => copyToClipboard(orderData.trackingId)}
                    className="p-1 text-gray-500 hover:text-gray-700 transition"
                    title="Copy tracking ID"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
            )}

            <div className="bg-blue-50 p-3 border border-blue-200 rounded-lg">
              <Paragraph1 className="mb-2 text-blue-900 text-sm">
                <strong>Track your shipment:</strong>
              </Paragraph1>
              <Paragraph1 className="mb-2 text-blue-800 text-sm">
                1. Copy your tracking number above
              </Paragraph1>
              <Paragraph1 className="mb-2 text-blue-800 text-sm">
                2. Visit the Topship tracking page
              </Paragraph1>
              <a
                href="https://ship.topship.africa/tracking"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-800 text-sm"
              >
                <ExternalLink size={14} />
                ship.topship.africa/tracking
              </a>
            </div>

            {orderData.tracking?.updates &&
              orderData.tracking.updates.length > 0 && (
                <div>
                  <Paragraph1 className="block mb-2 text-gray-500 text-xs">
                    Updates
                  </Paragraph1>
                  <div className="space-y-1">
                    {orderData.tracking.updates.map(
                      (update: any, index: number) => (
                        <Paragraph1
                          key={index}
                          className="text-gray-700 text-sm"
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
          <Paragraph1 className="mb-3 font-bold text-gray-900 text-base">
            Shipping Address
          </Paragraph1>

          <div className="bg-white p-4 border border-gray-300 rounded-xl">
            <Paragraph1 className="mb-2 text-gray-700 text-sm">
              {orderData.shippingAddress.street}
            </Paragraph1>
            <Paragraph1 className="text-gray-700 text-sm">
              {orderData.shippingAddress.city},{" "}
              {orderData.shippingAddress.state}{" "}
              {orderData.shippingAddress.zipCode}
            </Paragraph1>
            <Paragraph1 className="text-gray-700 text-sm">
              {orderData.shippingAddress.country}
            </Paragraph1>
          </div>
        </div>
      )}
    </div>
  );
}
