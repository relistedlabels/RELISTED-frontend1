"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Check, CheckCircle } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import { useCheckout } from "@/lib/mutations/renters/useCheckoutMutations";
import { useRouter } from "next/navigation";

const CURRENCY = "₦";

const formatCurrency = (amount: number): string => {
  return amount.toLocaleString("en-NG");
};

// === Skeleton Loader ===
const CheckoutSummarySkeleton = () => (
  <div className="p-4 border border-gray-200 rounded-xl animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-32 mb-6"></div>
    {[...Array(2)].map((_, i) => (
      <div key={i} className="flex items-start gap-4 mb-4">
        <div className="shrink-0 w-16 h-20 bg-gray-200 rounded-md"></div>
        <div className="grow space-y-2">
          <div className="h-4 bg-gray-200 rounded w-32"></div>
          <div className="h-3 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
    ))}
    <div className="h-10 bg-gray-200 rounded mt-6"></div>
  </div>
);

interface FinalOrderSummaryCardProps {
  cartItems?: any[];
  isLoading?: boolean;
  error?: Error | null;
}

export default function FinalOrderSummaryCard({
  cartItems,
  isLoading,
  error,
}: FinalOrderSummaryCardProps) {
  const router = useRouter();
  const checkoutMutation = useCheckout();
  const [isAgree, setIsAgree] = useState(false);

  // Only show products/requests with status 'approved'
  const items = (cartItems || []).filter(
    (item) => item.status === "approved" || item.productStatus === "approved",
  );

  if (isLoading) return <CheckoutSummarySkeleton />;

  if (error) {
    return (
      <div className="p-4 border border-yellow-200 rounded-xl bg-yellow-50">
        <Paragraph1 className="text-sm text-yellow-800">
          Failed to load checkout summary. Please try again.
        </Paragraph1>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="p-4 border border-gray-200 rounded-xl bg-gray-50 text-center">
        <Paragraph1 className="text-gray-600">
          Your cart is empty. Add items to get started!
        </Paragraph1>
      </div>
    );
  }

  const subtotal = items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);

  const handleCheckout = async () => {
    if (!isAgree) {
      alert("Please agree to the terms of service");
      return;
    }

    if (items.length === 0) return;
    checkoutMutation.mutate(
      { requestId: items[0].requestId },
      {
        onSuccess: (response) => {
          const res = response as {
            success: boolean;
            data: { orderId: string };
          };
          router.push(
            `/shop/cart/checkout/success?orderId=${res.data.orderId}`,
          );
        },
      },
    );
  };

  return (
    <div className="p-4 border border-gray-200 rounded-xl">
      <Paragraph1 className="text-xl font-bold text-gray-900 mb-6 tracking-wide">
        ORDER SUMMARY
      </Paragraph1>

      {/* Item List */}
      <div className="space-y-4 pb-6 border-b border-gray-200">
        {items.map((item) => {
          const product = item.productDetail || {};
          const productImageUrl =
            product.attachments?.uploads?.[0]?.url || item.productImage || "";

          return (
            <div key={item.requestId} className="flex items-start gap-4">
              <div className="shrink-0 w-16 h-20 bg-gray-200 rounded-md overflow-hidden border border-gray-100 relative">
                {productImageUrl && (
                  <Image
                    src={productImageUrl}
                    alt={product.name || item.productName}
                    fill
                    className="object-cover"
                  />
                )}
              </div>

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

              <div className="shrink-0 text-sm font-bold text-gray-900 mt-1">
                <Paragraph1>
                  {CURRENCY}
                  {formatCurrency(item.totalPrice || 0)}
                </Paragraph1>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cost Breakdown */}
      <div className="space-y-2 py-4 border-b border-gray-200">
        <div className="flex justify-between text-sm font-medium text-gray-700">
          <Paragraph1>Rental Subtotal</Paragraph1>
          <Paragraph1>
            {CURRENCY}
            {formatCurrency(subtotal)}
          </Paragraph1>
        </div>
        <div className="flex justify-between text-sm font-medium text-gray-700">
          <Paragraph1>Delivery Fees</Paragraph1>
          <Paragraph1>
            {CURRENCY}
            {formatCurrency(0)}
          </Paragraph1>
        </div>
        <div className="flex justify-between text-sm font-medium text-gray-700">
          <Paragraph1>Cleaning Fees</Paragraph1>
          <Paragraph1>
            {CURRENCY}
            {formatCurrency(0)}
          </Paragraph1>
        </div>
        <div className="flex justify-between text-sm font-medium text-gray-700">
          <Paragraph1>Security Deposit</Paragraph1>
          <Paragraph1>
            {CURRENCY}
            {formatCurrency(0)}
          </Paragraph1>
        </div>
      </div>

      {/* Final Total */}
      <div className="flex justify-between items-center pt-4 mb-6">
        <Paragraph1 className="text-lg font-bold text-gray-900">
          Total:
        </Paragraph1>
        <Paragraph1 className="text-xl font-extrabold text-gray-900">
          {CURRENCY}
          {formatCurrency(subtotal)}
        </Paragraph1>
      </div>

      {checkoutMutation.isError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
          <Paragraph1 className="text-xs text-red-700">
            {checkoutMutation.error?.message || "Failed to complete checkout"}
          </Paragraph1>
        </div>
      )}

      <button
        onClick={handleCheckout}
        disabled={!isAgree || checkoutMutation.isPending}
        className="w-full flex justify-center bg-black text-white font-semibold py-3 rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Paragraph1>
          {checkoutMutation.isPending ? "Processing..." : "Complete Order"}
        </Paragraph1>
      </button>

      <div className="flex items-start gap-2 p-3 mt-4 text-xs bg-green-50 text-green-700 rounded-md border border-green-200">
        <CheckCircle size={16} className="mt-0.5 shrink-0" />
        <Paragraph1 className="text-green-700">
          Your <strong>deposit is secure</strong> and fully refunded after item
          return and approval.
        </Paragraph1>
      </div>

      <label className="flex items-start space-x-2 cursor-pointer text-gray-700 mt-4">
        <input
          type="checkbox"
          checked={isAgree}
          onChange={() => setIsAgree(!isAgree)}
          className="hidden"
        />
        <span
          className={`shrink-0 w-6 h-6 rounded border mt-0.5 ${
            isAgree ? "bg-black border-black" : "bg-white border-gray-400"
          } flex items-center justify-center`}
        >
          {isAgree && <Check size={18} className="text-white" />}
        </span>
        <Paragraph1 className="text-xs">
          By confirming this order you accept our{" "}
          <strong>Terms of Service Agreement</strong> and our{" "}
          <strong>Data Protection Policy</strong>
        </Paragraph1>
      </label>
    </div>
  );
}
