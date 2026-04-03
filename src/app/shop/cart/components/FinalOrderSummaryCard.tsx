"use client";

import React from "react";
import Image from "next/image";
import { CheckCircle } from "lucide-react";
import { Header1, Paragraph1 } from "@/common/ui/Text";
import Link from "next/link";
// import { useCartSummary } from "@/lib/queries/renters/useCart";
import { useQuery } from "@tanstack/react-query";
import { publicApi } from "@/lib/api/public";
import { useListerProfile } from "@/lib/queries/shop/useListerProfile";

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

// === Lister Summary Card Component ===
interface ListerSummaryCardProps {
  group: {
    listerId: string;
    items: any[];
  };
}

const ListerSummaryCard: React.FC<ListerSummaryCardProps> = ({ group }) => {
  const { data: listerData, isLoading: isListerLoading } = useListerProfile(
    group.listerId,
  );

  // Calculate per-lister totals
  let listerSubtotal = 0;
  let listerDeliveryFees = 0;
  let listerSecurityDeposit = 0;

  group.items.forEach((item) => {
    listerSubtotal += item.rentalPrice || 0;
    listerDeliveryFees += item.deliveryFee || 0;
    listerSecurityDeposit += item.securityDeposit || 0;
  });

  const listerTotal =
    listerSubtotal + listerDeliveryFees + listerSecurityDeposit;

  // Use fetched lister name, fallback to items data, then fallback to generic
  const listerName =
    listerData?.name ||
    group.items[0]?.listerName ||
    `Lister ${group.listerId}`;

  return (
    <div className="p-4 border border-gray-200 rounded-xl">
      <div className="flex gap-4 items-center justify-between mb-4">
        <Paragraph1 className="text-lg font-bold text-gray-900  tracking-wide">
          SUMMARY
        </Paragraph1>
        <Paragraph1 className="text-lg font-bold text-gray-500  tracking-wide">
          From -{" "}
          {isListerLoading ? (
            <span className="inline-block w-24 h-5 bg-gray-200 rounded animate-pulse"></span>
          ) : (
            listerName
          )}
        </Paragraph1>
      </div>

      {/* Item List for this Lister */}
      <div className="space-y-4 pb-6 border-b border-gray-200">
        {group.items.map((item) => {
          const product = item.productDetail || {};
          // Try productDetail image, fallback to rental request image
          const productImageUrl =
            product.attachments?.uploads?.[0]?.url || item.productImage || "";
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
                  Duration: <strong>{item.rentalDays} Days</strong>
                </Paragraph1>
                <div className="w-fit px-2 py-0.5 mt-4 rounded-full bg-green-100 border border-green-200 text-green-800">
                  <Paragraph1 className="text-xs font-semibold">
                    Approved
                  </Paragraph1>
                </div>
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

      {/* Breakdown for this Lister */}
      <div className="space-y-2 - hidden  py-4 border-b border-gray-200">
        <div className="flex justify-between text-sm font-medium text-gray-700">
          <Paragraph1>Rental Subtotal</Paragraph1>
          <Paragraph1>
            {CURRENCY}
            {formatCurrency(listerSubtotal)}
          </Paragraph1>
        </div>
        <div className="flex- hidden  justify-between text-sm font-medium text-gray-700">
          <Paragraph1>Delivery Fees:</Paragraph1>
          <Paragraph1>
            {CURRENCY}
            {formatCurrency(listerDeliveryFees)}
          </Paragraph1>
        </div>
        <div className="flex- hidden justify-between text-sm font-medium text-gray-700">
          <Paragraph1>Cleaning Fees:</Paragraph1>
          <Paragraph1>
            {CURRENCY}
            {formatCurrency(
              group.items.reduce(
                (sum, item) => sum + (item.cleaningFee || 0),
                0,
              ),
            )}
          </Paragraph1>
        </div>
        <div className="flex- hidden  justify-between text-sm font-medium text-gray-700">
          <Paragraph1>Security Deposit:</Paragraph1>
          <Paragraph1>
            {CURRENCY}
            {formatCurrency(listerSecurityDeposit)}
          </Paragraph1>
        </div>
      </div>

      {/* Lister Total */}
      <div className="flex justify-between items-center pt-4">
        <Paragraph1 className="text-sm font-bold text-gray-900">
          Subtotal:
        </Paragraph1>
        <Paragraph1 className="text-lg font-extrabold text-gray-900">
          {CURRENCY}
          {formatCurrency(listerTotal)}
        </Paragraph1>
      </div>
    </div>
  );
};

interface FinalOrderSummaryCardProps {
  listerGroups?: Array<{
    listerId: string;
    items: any[];
  }>;
  isLoading?: boolean;
  error?: Error | null;
}

export function FinalOrderSummaryCard({
  listerGroups = [],
  isLoading,
  error,
}: FinalOrderSummaryCardProps) {
  if (isLoading) return <SummarySkeleton />;

  if (error || !listerGroups) {
    return (
      <div className="p-4 border border-yellow-200 rounded-xl bg-yellow-50">
        <Paragraph1 className="text-sm text-yellow-800">
          Failed to load cart summary. Please try again.
        </Paragraph1>
      </div>
    );
  }

  const approvedGroups = listerGroups.filter((group) => group.items.length > 0);

  if (approvedGroups.length === 0) {
    return (
      <div className="p-4 border border-gray-200 rounded-xl bg-gray-50">
        <Paragraph1 className="text-sm text-gray-600">
          No approved items in cart
        </Paragraph1>
      </div>
    );
  }

  // Calculate grand total across all listers
  let grandSubtotal = 0;
  let grandDeliveryFees = 0;
  let grandSecurityDeposit = 0;

  approvedGroups.forEach((group) => {
    group.items.forEach((item) => {
      grandSubtotal += item.rentalPrice || 0;
      grandDeliveryFees += item.deliveryFee || 0;
      grandSecurityDeposit += item.securityDeposit || 0;
    });
  });

  const grandTotal = grandSubtotal + grandDeliveryFees + grandSecurityDeposit;

  return (
    <div className="space-y-6">
      {/* Per-Lister Summary Cards */}
      {approvedGroups.map((group, index) => (
        <ListerSummaryCard key={group.listerId} group={group} />
      ))}

      {/* Grand Total */}
      <div className="p-4 border border-gray-300 rounded-xl bg-gray-50">
        <div className="flex justify-between items-center mb-4">
          <Paragraph1 className="text-lg font-bold text-gray-900">
            {/* Grand */}
            Total:
          </Paragraph1>
          <Paragraph1 className="text-2xl font-extrabold text-gray-900">
            {CURRENCY}
            {formatCurrency(grandTotal)}
          </Paragraph1>
        </div>

        {/* Proceed Button */}
        <Link
          href="/shop/cart/checkout"
          className="w-full flex justify-center bg-black text-white font-semibold py-3 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Paragraph1>Proceed to Checkout</Paragraph1>
        </Link>

        {/* Security Note */}
        <div className="flex items-start gap-2 p-3 mt-4 text-xs bg-green-50 text-green-700 rounded-md border border-green-200">
          <CheckCircle size={16} className="mt-0.5 shrink-0" />
          <Paragraph1 className="text-green-700">
            Your <strong>deposit is secure</strong> and fully refunded after
            item return and approval.
          </Paragraph1>
        </div>
      </div>
    </div>
  );
}
