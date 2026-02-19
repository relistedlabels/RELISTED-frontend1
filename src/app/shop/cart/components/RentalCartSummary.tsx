"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import { useCart } from "@/lib/queries/renters/useCart";
import { useRemoveFromCart } from "@/lib/mutations/renters/useCartMutations";

// --- Formatting Helper (for thousands separator) ---
const formatCurrency = (amount: number): string => {
  return amount.toLocaleString("en-NG");
};

// === Skeleton Loader ===
const CartSummarySkeleton = () => (
  <div className="space-y-6 animate-pulse">
    {[...Array(3)].map((_, i) => (
      <div
        key={i}
        className="flex items-start gap-4 pb-4 border-b border-gray-200"
      >
        <div className="shrink-0 w-16 h-16 bg-gray-200 rounded-md"></div>
        <div className="grow space-y-2">
          <div className="h-4 bg-gray-200 rounded w-40"></div>
          <div className="h-3 bg-gray-200 rounded w-32"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>
        <div className="shrink-0 h-6 w-6 bg-gray-200 rounded"></div>
      </div>
    ))}
    <div className="flex justify-between pt-6 mt-4 border-t border-gray-300">
      <div className="h-5 bg-gray-200 rounded w-24"></div>
      <div className="h-6 bg-gray-200 rounded w-32"></div>
    </div>
  </div>
);

// === Timer Component ===
const RentalTimer: React.FC<{ expiresAt: string }> = ({ expiresAt }) => {
  const [timeLeft, setTimeLeft] = React.useState<string>("");

  React.useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const expiryTime = new Date(expiresAt).getTime();
      const distance = expiryTime - now;

      if (distance < 0) {
        setTimeLeft("Expired");
        return;
      }

      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, "0")}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  return (
    <Paragraph1 className="text-xs font-medium text-orange-600">
      Expires in: {timeLeft}
    </Paragraph1>
  );
};

export default function RentalCartSummary() {
  const { data: cartData, isLoading, error } = useCart();
  const removeFromCart = useRemoveFromCart();

  const currency = "₦";
  const items = cartData?.cartItems || [];

  if (isLoading) return <CartSummarySkeleton />;

  if (error) {
    return (
      <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
        <Paragraph1 className="text-sm text-yellow-800">
          Failed to load cart. Please try again.
        </Paragraph1>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="p-6 border border-gray-200 rounded-lg bg-gray-50 text-center">
        <Paragraph1 className="text-gray-600">Your cart is empty</Paragraph1>
      </div>
    );
  }

  // Calculate Subtotal: Sum of all item totals
  const subtotal = useMemo(() => {
    return items.reduce((acc, item) => acc + item.totalPrice, 0);
  }, [items]);

  const handleRemove = (cartItemId: string) => {
    removeFromCart.mutate(cartItemId);
  };

  return (
    <div>
      {/* List of Cart Items */}
      <div className="space-y-6">
        {items.map((item) => (
          <div
            key={item.cartItemId}
            className="flex items-start gap-4 pb-4 border-b border-gray-200 last:border-b-0"
          >
            {/* Product Image */}
            <div className="shrink-0 w-16 h-16 bg-gray-200 rounded-md overflow-hidden border border-gray-100 relative">
              {item.productImage && (
                <Image
                  src={item.productImage}
                  alt={item.productName}
                  fill
                  className="object-cover"
                />
              )}
            </div>

            {/* Product Details */}
            <div className="grow">
              <Paragraph1 className="text-sm font-semibold text-gray-800 uppercase leading-snug">
                {item.productName}
              </Paragraph1>
              <Paragraph1 className="text-xs text-gray-600 leading-snug mt-1">
                Lister: <strong>{item.listerName}</strong>
              </Paragraph1>
              <Paragraph1 className="text-sm font-medium text-gray-800 mt-1">
                {item.rentalDays} DAYS - {currency}
                {formatCurrency(item.totalPrice)}
              </Paragraph1>
              <RentalTimer expiresAt={item.expiresAt} />
            </div>

            {/* Remove Button (Trash Icon) */}
            <button
              aria-label={`Remove ${item.productName}`}
              onClick={() => handleRemove(item.cartItemId)}
              disabled={removeFromCart.isPending}
              className="shrink-0 p-1 text-red-500 hover:text-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>

      {/* Subtotal Footer */}
      <div className="flex justify-between items-center pt-6 mt-4 border-t border-gray-300">
        <Paragraph1 className="text-base font-semibold text-gray-800 tracking-wider">
          SUBTOTAL:
        </Paragraph1>
        <Paragraph1 className="text-lg font-bold text-gray-900">
          {currency}
          {formatCurrency(subtotal)}
        </Paragraph1>
      </div>
    </div>
  );
}
