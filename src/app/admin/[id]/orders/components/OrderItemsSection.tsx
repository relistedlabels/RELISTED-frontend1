"use client";

import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { cloudinaryOptimizedImageUrl } from "@/lib/media/cloudinaryOptimizedImageUrl";

export interface OrderItemDetail {
  id: string;
  name: string;
  image?: string | null;
  brand?: string | null;
  dailyPrice: number;
  rentalDays: number;
  cleaningFee?: number;
  collateralFee?: number;
  listingType?: string | null;
  subtotal: number;
  rentalStart?: string | null;
  rentalEnd?: string | null;
}

interface OrderItemsSectionProps {
  items: OrderItemDetail[];
  formatMoney: (amount: number) => string;
}

export default function OrderItemsSection({
  items,
  formatMoney,
}: OrderItemsSectionProps) {
  if (!items.length) return null;

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 sm:p-6">
      <Paragraph3 className="text-base font-bold text-gray-900 mb-4">
        Items ({items.length})
      </Paragraph3>
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex gap-3 border-b border-gray-200 pb-4 last:border-0 last:pb-0 sm:gap-4"
          >
            {item.image ? (
              <img
                src={cloudinaryOptimizedImageUrl(item.image, {
                  preset: "thumb",
                })}
                alt={item.name}
                className="h-16 w-16 shrink-0 rounded-lg object-cover"
              />
            ) : (
              <div className="h-16 w-16 shrink-0 rounded-lg bg-gray-200" />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <Paragraph1 className="text-sm font-semibold text-gray-900 break-words">
                  {item.name}
                </Paragraph1>
                <Paragraph1 className="shrink-0 text-sm font-semibold text-gray-900">
                  {formatMoney(item.subtotal)}
                </Paragraph1>
              </div>
              {item.brand && (
                <Paragraph1 className="text-xs text-gray-500">{item.brand}</Paragraph1>
              )}
              <Paragraph1 className="mt-1 text-xs text-gray-600 break-words">
                {item.rentalDays > 0
                  ? `${item.rentalDays} day(s) @ ${formatMoney(item.dailyPrice)}/day`
                  : "Resale purchase"}
                {item.cleaningFee
                  ? ` · Cleaning ${formatMoney(item.cleaningFee)}`
                  : ""}
              </Paragraph1>
              {item.rentalStart && item.rentalEnd && (
                <Paragraph1 className="mt-0.5 text-xs text-gray-500 break-words">
                  {item.rentalStart} – {item.rentalEnd}
                </Paragraph1>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
