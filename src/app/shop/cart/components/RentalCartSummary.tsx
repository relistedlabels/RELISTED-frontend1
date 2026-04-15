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
import {
  isLineRentalApproved,
  rentalLineIsEffectivelyExpired,
  shouldShowRentalRequestTimer,
} from "@/lib/cart/rentalRequestUi";

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
    <Paragraph1 className="font-medium text-orange-600 text-xs">
      Expires in: {timeLeft}
    </Paragraph1>
  );
};

export default function RentalCartSummary() {
  const { data, isLoading, error } = useCart();
  const removeCartItemMutation = useRemoveCartItem();
  const currency = "₦";
  const items = data?.cartItems || [];

  // Calculate Subtotal: Sum of all item totals
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
        <Paragraph1 className="text-gray-600">Your cart is empty</Paragraph1>
      </div>
    );
  }

  const handleRemove = (item: (typeof items)[number], productName: string) => {
    const ok = window.confirm(
      `Remove "${productName}" from your cart? This will cancel your rental request. You can send another if you change your mind.`,
    );
    if (!ok) return;
    removeCartItemMutation.mutate({
      cartItemId: cartLineIdFromRentalItem(item as Record<string, unknown>),
      rentalRequestId: item.requestId,
    });
  };

  return (
    <div>
      {/* List of Cart Items */}
      <div className="space-y-6">
        {items.map((item, idx) => (
          <div
            key={item.requestId || idx}
            className="flex items-start gap-4 pb-4 border-gray-200 border-b last:border-b-0"
          >
            {/* Product Image */}
            <div className="relative bg-gray-200 border border-gray-100 rounded-md w-16 h-16 overflow-hidden shrink-0">
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
              <Paragraph1 className="font-semibold text-gray-800 text-sm uppercase leading-snug">
                {item.productName}
              </Paragraph1>
              {/* Lister name not available in RentalRequest type */}
              <Paragraph1 className="mt-1 font-medium text-gray-800 text-sm">
                {item.rentalDays === 0 ? (
                  <>
                    RESALE - {currency}
                    {formatCurrency(item.totalPrice)}
                  </>
                ) : (
                  <>
                    {item.rentalDays} DAYS - {currency}
                    {formatCurrency(item.totalPrice)}
                  </>
                )}
              </Paragraph1>
              {item.rentalDays === 0 && isLineRentalApproved(item.status) && (
                <span className="inline-block bg-green-100 mt-2 px-2 py-0.5 border border-green-200 rounded-full font-semibold text-green-800 text-xs">
                  Ready to checkout
                </span>
              )}
              {item.rentalDays === 0 && !isLineRentalApproved(item.status) && (
                <span className="inline-block bg-yellow-100 mt-2 px-2 py-0.5 border border-yellow-200 rounded-full font-semibold text-yellow-800 text-xs">
                  Awaiting approval
                </span>
              )}
              {item.rentalDays > 0 &&
                rentalLineIsEffectivelyExpired(item.status, item.expiresAt) && (
                  <span className="inline-block bg-red-100 mt-2 px-2 py-0.5 border border-red-200 rounded-full font-semibold text-red-800 text-xs">
                    Expired
                  </span>
                )}
              {item.rentalDays > 0 &&
                shouldShowRentalRequestTimer(item.status, item.expiresAt) && (
                  <RentalTimer expiresAt={item.expiresAt} />
                )}
            </div>

            {/* Remove Button (Trash Icon) */}
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

      {/* Subtotal Footer */}
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
