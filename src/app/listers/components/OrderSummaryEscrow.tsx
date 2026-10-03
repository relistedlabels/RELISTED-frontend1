"use client";

// ENDPOINTS: GET /api/listers/orders/:orderId (payment & escrow summary)

import type React from "react";
import { Paragraph1 } from "@/common/ui/Text";
import {
  isListerResaleOrder,
  isResaleItem,
} from "@/lib/listers/listerOrderRow";
import {
  computePlatformFee,
  LISTER_PLATFORM_FEE_PERCENT,
} from "@/lib/listers/platformFee";

interface OrderSummaryEscrowProps {
  rentalFeeTotal?: string;
  orderData?: any;
  clickedItem?: any;
}

const OrderSummaryEscrow: React.FC<OrderSummaryEscrowProps> = ({
  rentalFeeTotal: propRentalFeeTotal,
  orderData,
  clickedItem,
}) => {
  // Use item-level data if clickedItem is provided, otherwise order-level
  const isResale = isResaleItem(clickedItem) || isListerResaleOrder(orderData);

  // Extract from clickedItem if available, otherwise from orderData
  const rentalFeeTotal = isResale
    ? clickedItem?.purchasePrice ||
      orderData?.escrow?.purchasePrice ||
      orderData?.totalAmount ||
      propRentalFeeTotal
    : clickedItem?.rentalFee ||
      orderData?.escrow?.rentalFeeTotal ||
      orderData?.totalAmount ||
      propRentalFeeTotal;
  const cleaningFeesTotal =
    Number(
      clickedItem?.cleaningFee ??
        orderData?.listerMerchandise?.cleaningFeesTotal ??
        orderData?.escrow?.cleaningFeeTotal ??
        0,
    ) || 0;
  const orderPlatformFee = orderData?.platformFee;
  const platformFeeRate = Number(
    orderPlatformFee?.ratePercent ?? LISTER_PLATFORM_FEE_PERCENT,
  );
  const fallbackPlatformFeeBase = clickedItem
    ? Number(rentalFeeTotal)
    : Number(
        orderData?.listerMerchandise?.rentalSubtotal ?? rentalFeeTotal ?? 0,
      ) + Number(orderData?.listerMerchandise?.resaleSubtotal ?? 0);
  const earningsBase = fallbackPlatformFeeBase + cleaningFeesTotal;
  // An order-level fee must not be reused for every item in the item detail view.
  const itemHasPlatformFee = clickedItem?.platformFee != null;
  const platformFee =
    clickedItem && itemHasPlatformFee
      ? clickedItem.platformFee
      : clickedItem
        ? undefined
        : orderPlatformFee;
  const platformFeeBaseValue = Number(
    platformFee?.baseAmount ??
      platformFee?.grossEarnings ??
      platformFee?.grossAmount ??
      fallbackPlatformFeeBase,
  );
  const platformFeeBase = Number.isFinite(platformFeeBaseValue)
    ? platformFeeBaseValue
    : 0;
  const reportedFeeBase =
    platformFee?.baseAmount ??
    platformFee?.grossEarnings ??
    platformFee?.grossAmount;
  const netEarningsBase =
    reportedFeeBase != null && Number.isFinite(Number(reportedFeeBase))
      ? Number(reportedFeeBase) + cleaningFeesTotal
      : earningsBase;
  const reportedFeeAmount = Number(platformFee?.amount);
  const platformFeeAmount =
    platformFee?.amount != null && Number.isFinite(reportedFeeAmount)
      ? reportedFeeAmount
      : computePlatformFee(platformFeeBase, platformFeeRate);
  const reportedNetEarnings = Number(platformFee?.netEarnings);
  const netEarnings =
    (!clickedItem || itemHasPlatformFee) &&
    platformFee?.netEarnings != null &&
    Number.isFinite(reportedNetEarnings)
      ? reportedNetEarnings
      : Math.max(0, netEarningsBase - platformFeeAmount);
  // Format currency for display
  const formatCurrency = (value: any) => {
    if (typeof value === "string") return value;
    if (typeof value === "number") {
      return `₦${value.toLocaleString()}`;
    }
    return "₦0";
  };
  return (
    <section className="w-full rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
      <Paragraph1 className="mb-4 font-semibold text-gray-900 text-sm">
        {clickedItem ? "Item amounts" : "Order amounts"}
      </Paragraph1>

      {/* Financial Totals */}
      <div className="mb-4 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <Paragraph1 className="text-sm text-gray-600">
            {isResale ? "Purchase price" : "Rental fee"}
          </Paragraph1>
          <Paragraph1 className="text-right text-sm font-semibold tabular-nums text-gray-900">
            {formatCurrency(rentalFeeTotal)}
          </Paragraph1>
        </div>

        {!isResale && cleaningFeesTotal > 0 && (
          <div className="flex items-start justify-between gap-4">
            <Paragraph1 className="text-sm text-gray-600">
              Cleaning fee
            </Paragraph1>
            <Paragraph1 className="text-right text-sm font-semibold tabular-nums text-gray-900">
              {formatCurrency(cleaningFeesTotal)}
            </Paragraph1>
          </div>
        )}
      </div>

      {!isResale && (
        <div className="mb-4 space-y-2 border-t border-gray-100 pt-3 text-sm">
          <div className="flex justify-between gap-4 text-gray-600">
            <span>Platform fee ({platformFeeRate}%)</span>
            <span className="text-right tabular-nums">
              -{formatCurrency(platformFeeAmount)}
            </span>
          </div>
          <div className="flex justify-between gap-4 font-semibold text-gray-900">
            <span>You earn</span>
            <span className="text-right tabular-nums">
              {formatCurrency(netEarnings)}
            </span>
          </div>
        </div>
      )}
    </section>
  );
};

export default OrderSummaryEscrow;
