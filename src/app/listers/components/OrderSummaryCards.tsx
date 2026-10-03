"use client";

// ENDPOINTS: GET /api/listers/orders/:orderId (product/dresser summary data)

import Image from "next/image";
import type React from "react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { formatLagosDate } from "@/lib/checkout/dispatchWindows";
import { isResaleItem } from "@/lib/listers/listerOrderRow";
import { cloudinaryOptimizedImageUrl } from "@/lib/media/cloudinaryOptimizedImageUrl";

interface OrderSummaryCardsProps {
  orderData?: any;
  clickedItem?: any;
}

const OrderSummaryCards: React.FC<OrderSummaryCardsProps> = ({
  orderData,
  clickedItem,
}) => {
  // Use the clickedItem if provided, otherwise extract from items array
  const product = clickedItem || orderData?.items?.[0];
  const timeline = orderData?.timeline;
  const isResale = isResaleItem(product);
  const rentalFee = isResale
    ? product?.purchasePrice || 0
    : product?.rentalFee || 0;
  const formatScheduleDate = (value?: string | null) => {
    if (!value) return "To be scheduled";
    const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
    const parsed = dateOnly
      ? new Date(`${value}T12:00:00+01:00`)
      : new Date(value);
    return Number.isNaN(parsed.getTime())
      ? "To be scheduled"
      : formatLagosDate(parsed, { includeWeekday: true });
  };
  return (
    <div className="space-y-4 w-full">
      {/* 1. Product Brief Card */}
      {product && (
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <div className="flex gap-4 p-3 sm:p-4">
            {/* Image Container */}
            <div className="relative h-32 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-100 sm:h-40 sm:w-32">
              <Image
                src={
                  cloudinaryOptimizedImageUrl(product.image, {
                    preset: "card",
                  }) || "/products/p4.jpg"
                }
                alt={product.name || "Product"}
                fill
                className="object-cover"
                unoptimized
              />
            </div>

            {/* Product Specs */}
            <div className="min-w-0 flex-1 py-1">
              <div className="flex justify-between items-start">
                <Paragraph3 className="break-words font-bold text-gray-900 text-base sm:text-lg">
                  {product.name || "Item"}
                </Paragraph3>
              </div>
              <Paragraph1 className="mt-1 text-xs text-gray-500">
                {[product.size, product.color].filter(Boolean).join(" · ") ||
                  "Size and color not provided"}
              </Paragraph1>

              <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-gray-100 pt-3">
                <div>
                  <Paragraph1 className="block text-[10px] text-gray-500">
                    {isResale ? "Price" : "Rental Fee"}
                  </Paragraph1>
                  <Paragraph1 className="font-semibold text-gray-900 text-sm">
                    ₦{Number(rentalFee || 0).toLocaleString()}
                  </Paragraph1>
                </div>
                {!isResale &&
                  Number(
                    (product as { cleaningFee?: number }).cleaningFee ?? 0,
                  ) > 0 && (
                    <div className="col-span-2">
                      <Paragraph1 className="block text-[10px] text-gray-500">
                        Cleaning fee
                      </Paragraph1>
                      <Paragraph1 className="font-semibold text-gray-900 text-sm">
                        ₦
                        {Number(
                          (product as { cleaningFee?: number }).cleaningFee,
                        ).toLocaleString()}
                      </Paragraph1>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. Rental Period Card - hide for resale */}
      {!isResale && timeline && (
        <section className="rounded-2xl border border-gray-200 bg-white p-4">
          <Paragraph1 className="mb-3 text-sm font-semibold text-gray-900">
            Rental schedule
          </Paragraph1>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-gray-50 p-3">
              <Paragraph1 className="text-xs text-gray-500">Pickup</Paragraph1>
              <Paragraph1 className="mt-1 text-sm font-medium text-gray-900">
                {formatScheduleDate(
                  (product as { rentalStartDate?: string }).rentalStartDate,
                )}
              </Paragraph1>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <Paragraph1 className="text-xs text-gray-500">Return</Paragraph1>
              <Paragraph1 className="mt-1 text-sm font-medium text-gray-900">
                {formatScheduleDate(
                  (product as { rentalEndDate?: string; returnDue?: string })
                    .rentalEndDate ??
                    (product as { returnDue?: string }).returnDue,
                )}
              </Paragraph1>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default OrderSummaryCards;
