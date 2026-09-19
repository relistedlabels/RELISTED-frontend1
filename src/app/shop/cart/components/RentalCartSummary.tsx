"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import { useCart } from "@/lib/queries/renters/useCart";
import {
  cartLineIdFromRentalItem,
  useRemoveCartItem,
} from "@/lib/mutations/cart/useRemoveCartItem";
import { cloudinaryOptimizedImageUrl } from "@/lib/media/cloudinaryOptimizedImageUrl";
import { formatRentalDuration } from "@/lib/rental/formatRentalDuration";

const formatCurrency = (amount: number): string => {
  return amount.toLocaleString("en-NG");
};

const CartSummarySkeleton = () => (
  <div className="space-y-6 animate-pulse">
    {[...Array(3)].map((_, i) => (
      <div
        key={i}
        className="flex items-start gap-4 pb-4 border-gray-200 border-b"
      >
        <div className="bg-gray-200 rounded-md w-16 h-16 shrink-0"></div>
        <div className="space-y-2 grow">
          <div className="bg-gray-200 rounded w-40 h-4"></div>
          <div className="bg-gray-200 rounded w-32 h-3"></div>
          <div className="bg-gray-200 rounded w-24 h-4"></div>
        </div>
        <div className="bg-gray-200 rounded w-6 h-6 shrink-0"></div>
      </div>
    ))}
    <div className="flex justify-between mt-4 pt-6 border-gray-300 border-t">
      <div className="bg-gray-200 rounded w-24 h-5"></div>
      <div className="bg-gray-200 rounded w-32 h-6"></div>
    </div>
  </div>
);

export default function RentalCartSummary() {
  const { data, isLoading, error } = useCart();
  const removeCartItemMutation = useRemoveCartItem();
  const currency = "₦";
  const items = data?.cartItems ?? [];

  const subtotal = useMemo(() => {
    return items.reduce((acc, item) => acc + item.totalPrice, 0);
  }, [items]);

  if (isLoading) return <CartSummarySkeleton />;

  if (error) {
    return (
      <div className="bg-yellow-50 p-4 border border-yellow-200 rounded-lg">
        <Paragraph1 className="text-yellow-800 text-sm">
          Failed to load cart. Please try again.
        </Paragraph1>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-gray-50 p-6 border border-gray-200 rounded-lg text-center">
        <Paragraph1 className="text-gray-600 text-sm leading-relaxed">
          No items ready for checkout yet. When a lister confirms availability,
          they will show up here.
        </Paragraph1>
      </div>
    );
  }

  const handleRemove = (item: (typeof items)[number], productName: string) => {
    const ok = window.confirm(
      `Remove "${productName}" from your cart?`,
    );
    if (!ok) return;
    removeCartItemMutation.mutate({
      cartItemId: cartLineIdFromRentalItem(item as Record<string, unknown>),
      rentalRequestId: item.requestId,
    });
  };

  return (
    <div>
      <div className="space-y-6">
        {items.map((item, idx) => (
          <div
            key={item.requestId || idx}
            className="flex items-start gap-4 pb-4 border-gray-200 border-b last:border-b-0"
          >
            <div className="relative bg-gray-200 border border-gray-100 rounded-md w-16 h-16 overflow-hidden shrink-0">
              {item.productImage ? (
                <Image
                  src={cloudinaryOptimizedImageUrl(item.productImage, {
                    preset: "thumb",
                  })}
                  alt={item.productName}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : null}
            </div>

            <div className="grow">
              <Paragraph1 className="font-semibold text-gray-800 text-sm uppercase leading-snug">
                {item.productName}
              </Paragraph1>
              <Paragraph1 className="mt-1 font-medium text-gray-800 text-sm">
                {item.rentalDays === 0 ? (
                  <>
                    Buy · {currency}
                    {formatCurrency(item.totalPrice)}
                  </>
                ) : (
                  <>
                    {formatRentalDuration(item.rentalDays)} · {currency}
                    {formatCurrency(item.totalPrice)}
                  </>
                )}
              </Paragraph1>
              <span className="inline-block bg-green-100 mt-2 px-2 py-0.5 border border-green-200 rounded-full font-semibold text-green-800 text-xs">
                Ready to checkout
              </span>
            </div>

            <button
              aria-label={`Remove ${item.productName}`}
              onClick={() => handleRemove(item, item.productName)}
              disabled={removeCartItemMutation.isPending}
              className="disabled:opacity-50 p-1 text-red-500 hover:text-red-700 transition-colors disabled:cursor-not-allowed shrink-0"
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mt-4 pt-6 border-gray-300 border-t">
        <Paragraph1 className="font-semibold text-gray-800 text-base tracking-wider">
          SUBTOTAL:
        </Paragraph1>
        <Paragraph1 className="font-bold text-gray-900 text-lg">
          {currency}
          {formatCurrency(subtotal)}
        </Paragraph1>
      </div>
    </div>
  );
}
