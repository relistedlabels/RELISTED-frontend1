"use client";

import React from "react";
import Image from "next/image";
import { CheckCircle } from "lucide-react";
import { Header1, Paragraph1 } from "@/common/ui/Text";
import Link from "next/link";
// import { useCartSummary } from "@/lib/queries/renters/useCart";
import { useQuery } from "@tanstack/react-query";
import { publicApi } from "@/lib/api/public";

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

interface FinalOrderSummaryCardProps {
  cartItems?: any[];
  isLoading?: boolean;
  error?: Error | null;
}

export function FinalOrderSummaryCard({ cartItems = [], isLoading, error }: FinalOrderSummaryCardProps) {
  if (isLoading) return <SummarySkeleton />;

  if (error || !cartItems) {
    return (
      <div className="p-4 border border-yellow-200 rounded-xl bg-yellow-50">
        <Paragraph1 className="text-sm text-yellow-800">
          Failed to load cart summary. Please try again.
        </Paragraph1>
      </div>
    );
  }

  const items = cartItems;
  // Calculate summary fields
  const subtotal = items.reduce(
    (sum, item) => sum + (item.rentalPrice || 0),
    0,
  );
  const totalDeliveryFees = items.reduce(
    (sum, item) => sum + (item.deliveryFee || 0),
    0,
  );
  const totalSecurityDeposit = items.reduce(
    (sum, item) => sum + (item.securityDeposit || 0),
    0,
  );
  const cartTotal = subtotal + totalDeliveryFees + totalSecurityDeposit;

  return (
    <div className="p-4 border border-gray-200 rounded-xl">
      <Paragraph1 className="text-xl font-bold text-gray-900 mb-6 tracking-wide">
        SUMMARY
      </Paragraph1>

      {/* Item List */}
      <div className="space-y-4 pb-6 border-b border-gray-200">
        {items.map((item) => {
          const product = item.productDetail || {};
          // Try productDetail image, fallback to rental request image
          const productImageUrl = product.attachments?.uploads?.[0]?.url || item.productImage || "";
          return (
            <div key={item.requestId} className="flex items-start gap-4">
              {/* Product Image */}
              <div className="shrink-0 w-16 h-20 bg-gray-200 rounded-md overflow-hidden border border-gray-100 relative">
                {productImageUrl ? (
                  <Image
                    src={productImageUrl}
                    alt={product.name || item.productName}
                    fill
                    className="object-cover"
                  />
                ) : null}
              </div>

              {/* Product Details */}
              <div className="grow">
                <Paragraph1 className="text-sm font-semibold text-gray-800 uppercase leading-snug">
                  {product.name || item.productName}
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
          );
        })}
      </div>

      {/* Breakdown */}
      <div className="space-y-2 py-4 border-b border-gray-200">
        <div className="flex justify-between text-sm font-medium text-gray-700">
          <Paragraph1>Rental Subtotal</Paragraph1>
          <Paragraph1>
            {CURRENCY}
            {formatCurrency(subtotal)}
          </Paragraph1>
        </div>
        <div className="flex justify-between text-sm font-medium text-gray-700">
          <Paragraph1>Delivery Fees:</Paragraph1>
          <Paragraph1>
            {CURRENCY}
            {formatCurrency(totalDeliveryFees)}
          </Paragraph1>
        </div>
        <div className="flex justify-between text-sm font-medium text-gray-700">
          <Paragraph1>Cleaning Fees:</Paragraph1>
          <Paragraph1>
            {CURRENCY}
            {/* {formatCurrency(cartSummary.totalCleaningFees)} */}0
          </Paragraph1>
        </div>
        <div className="flex justify-between text-sm font-medium text-gray-700">
          <Paragraph1>Security Deposit:</Paragraph1>
          <Paragraph1>
            {CURRENCY}
            {formatCurrency(totalSecurityDeposit)}
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
          {formatCurrency(cartTotal)}
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
