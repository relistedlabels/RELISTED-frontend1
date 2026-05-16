"use client";

import { Paragraph1, Paragraph3 } from "@/common/ui/Text";

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
    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
      <Paragraph3 className="text-base font-bold text-gray-900 mb-4">
        Items ({items.length})
      </Paragraph3>
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex gap-4 pb-4 border-b border-gray-200 last:border-0 last:pb-0"
          >
            {item.image ? (
              <img
                src={item.image}
                alt={item.name}
                className="w-16 h-16 rounded-lg object-cover shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-gray-200 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <Paragraph1 className="text-sm font-semibold text-gray-900">
                {item.name}
              </Paragraph1>
              {item.brand && (
                <Paragraph1 className="text-xs text-gray-500">
                  {item.brand}
                </Paragraph1>
              )}
              <Paragraph1 className="text-xs text-gray-600 mt-1">
                {item.rentalDays > 0
                  ? `${item.rentalDays} day(s) @ ${formatMoney(item.dailyPrice)}/day`
                  : "Resale purchase"}
                {item.cleaningFee
                  ? ` · Cleaning ${formatMoney(item.cleaningFee)}`
                  : ""}
              </Paragraph1>
              {item.rentalStart && item.rentalEnd && (
                <Paragraph1 className="text-xs text-gray-500 mt-0.5">
                  {item.rentalStart} – {item.rentalEnd}
                </Paragraph1>
              )}
            </div>
            <Paragraph1 className="text-sm font-semibold text-gray-900 shrink-0">
              {formatMoney(item.subtotal)}
            </Paragraph1>
          </div>
        ))}
      </div>
    </div>
  );
}
