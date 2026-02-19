"use client";

import React from "react";
import Image from "next/image";
import { CheckCircle } from "lucide-react";
import { Header1, Paragraph1 } from "@/common/ui/Text";
import Link from "next/link";
import { useCartSummary } from "@/lib/queries/renters/useCart";

const CURRENCY = "₦";

// --- Formatting Helper (for thousands separator) ---
const formatCurrency = (amount: number): string => {
  return amount.toLocaleString("en-NG");
};

// === Skeleton Loader ===
const SummarySkeleton = () => (
  <div className="p-4 border border-gray-200 rounded-xl space-y-4 animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-32"></div>
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-4 bg-gray-200 rounded"></div>
      ))}
    </div>
    <div className="h-10 bg-gray-200 rounded mt-6"></div>
  </div>
);

export default function FinalOrderSummaryCard() {
  const { data: cartSummary, isLoading, error } = useCartSummary();

  if (isLoading) return <SummarySkeleton />;

  if (error || !cartSummary) {
    return (
      <div className="p-4 border border-yellow-200 rounded-xl bg-yellow-50">
        <Paragraph1 className="text-sm text-yellow-800">
          Failed to load cart summary. Please try again.
        </Paragraph1>
      </div>
    );
  }

  const items = cartSummary.cartItems || [];

  return (
    <div className="p-4 border border-gray-200 rounded-xl">
      <Paragraph1 className="text-xl font-bold text-gray-900 mb-6 tracking-wide">
        SUMMARY
      </Paragraph1>

      {/* Item List */}
      <div className="space-y-4 pb-6 border-b border-gray-200">
        {items.map((item) => (
          <div key={item.cartItemId} className="flex items-start gap-4">
            {/* Product Image */}
            <div className="shrink-0 w-16 h-20 bg-gray-200 rounded-md overflow-hidden border border-gray-100 relative">
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
              <Paragraph1 className="text-xs text-gray-600 leading-snug">
                Duration: <strong>{item.rentalDays} Days</strong>
              </Paragraph1>
            </div>

            {/* Price */}
            <div className="shrink-0 text-sm font-bold text-gray-900 mt-1">
              <Paragraph1>
                {CURRENCY}
                {formatCurrency(item.totalPrice)}
              </Paragraph1>
            </div>
          </div>
        ))}
      </div>

      {/* Breakdown */}
      <div className="space-y-2 py-4 border-b border-gray-200">
        <div className="flex justify-between text-sm font-medium text-gray-700">
          <Paragraph1>Rental Subtotal</Paragraph1>
          <Paragraph1>
            {CURRENCY}
            {formatCurrency(cartSummary.subtotal)}
          </Paragraph1>
        </div>
        <div className="flex justify-between text-sm font-medium text-gray-700">
          <Paragraph1>Delivery Fees:</Paragraph1>
          <Paragraph1>
            {CURRENCY}
            {formatCurrency(cartSummary.totalDeliveryFees)}
          </Paragraph1>
        </div>
        <div className="flex justify-between text-sm font-medium text-gray-700">
          <Paragraph1>Cleaning Fees:</Paragraph1>
          <Paragraph1>
            {CURRENCY}
            {formatCurrency(cartSummary.totalCleaningFees)}
          </Paragraph1>
        </div>
        <div className="flex justify-between text-sm font-medium text-gray-700">
          <Paragraph1>Security Deposit:</Paragraph1>
          <Paragraph1>
            {CURRENCY}
            {formatCurrency(cartSummary.totalSecurityDeposit)}
          </Paragraph1>
        </div>
      </div>

      {/* Final Total */}
      <div className="flex justify-between items-center pt-4">
        <Paragraph1 className="text-lg font-bold text-gray-900">
          Total:
        </Paragraph1>
        <Paragraph1 className="text-xl font-extrabold text-gray-900">
          {CURRENCY}
          {formatCurrency(cartSummary.cartTotal)}
        </Paragraph1>
      </div>

      {/* Proceed Button */}
      <Link
        href="/shop/cart/checkout"
        className="w-full flex justify-center bg-black text-white font-semibold py-3 mt-6 rounded-lg hover:bg-gray-800 transition-colors"
      >
        <Paragraph1> Proceed to Checkout</Paragraph1>
      </Link>

      {/* Security Note */}
      <div className="flex items-start gap-2 p-3 mt-4 text-xs bg-green-50 text-green-700 rounded-md border border-green-200">
        <CheckCircle size={16} className="mt-0.5 shrink-0" />
        <Paragraph1 className="text-green-700">
          Your <strong>deposit is secure</strong> and fully refunded after item
          return and approval.
        </Paragraph1>
      </div>
    </div>
  );
}
