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
import { isResaleItem } from "@/lib/listers/listerOrderRow";

const CURRENCY = "₦";

// --- Formatting Helper (for thousands separator) ---
const formatCurrency = (amount: number): string => {
  return amount.toLocaleString("en-NG");
};

// === Skeleton Loader ===
const SummarySkeleton = () => (
  <div className="space-y-4 p-4 border border-gray-200 rounded-xl animate-pulse">
    <div className="bg-gray-200 rounded w-32 h-6"></div>
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-gray-200 rounded h-4"></div>
      ))}
    </div>
    <div className="bg-gray-200 mt-6 rounded h-10"></div>
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
      <div className="space-y-1 mb-4">
        <div className="flex sm:flex-row flex-col sm:justify-between sm:items-start gap-1 sm:gap-4">
          <div>
            <Paragraph1 className="font-bold text-gray-900 text-lg tracking-wide">
              SUMMARY
            </Paragraph1>
          </div>
          <Paragraph1 className="font-bold text-gray-600 text-sm sm:text-right tracking-wide shrink-0">
            From{" "}
            {isListerLoading ? (
              <span className="inline-block bg-gray-200 rounded w-24 h-5 align-middle animate-pulse" />
            ) : (
              listerName
            )}
          </Paragraph1>
        </div>
      </div>

      {/* Item List for this Lister */}
      <div className="space-y-4 pb-6 border-gray-200 border-b">
        {group.items.map((item) => {
          const product = item.productDetail || {};
          // Try productDetail image, fallback to rental request image
          const productImageUrl =
            product.attachments?.uploads?.[0]?.url || item.productImage || "";
          return (
            <div key={item.requestId} className="flex items-start gap-4">
              {/* Product Image */}
              <div className="relative bg-gray-200 border border-gray-100 rounded-md w-16 h-20 overflow-hidden shrink-0">
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
                <Paragraph1 className="font-semibold text-gray-800 text-sm uppercase leading-snug">
                  {product.name || item.productName}
                </Paragraph1>
                <Paragraph1 className="mt-1 text-gray-600 text-xs leading-snug">
                  {item.isResale || isResaleItem(item) ? (
                    <>
                      Type: <strong>Resale</strong>
                    </>
                  ) : (
                    <>
                      Duration: <strong>{item.rentalDays} Days</strong>
                    </>
                  )}
                </Paragraph1>
                {item.isResale && item.status === "APPROVED" && (
                  <div className="bg-green-100 mt-4 px-2 py-0.5 border border-green-200 rounded-full w-fit text-green-800">
                    <Paragraph1 className="font-semibold text-xs">
                      Ready to checkout
                    </Paragraph1>
                  </div>
                )}
                {item.isResale && item.status !== "APPROVED" && (
                  <div className="bg-yellow-100 mt-4 px-2 py-0.5 border border-yellow-200 rounded-full w-fit text-yellow-800">
                    <Paragraph1 className="font-semibold text-xs">
                      Awaiting approval
                    </Paragraph1>
                  </div>
                )}
                {!item.isResale && (
                  <div className="bg-green-100 mt-4 px-2 py-0.5 border border-green-200 rounded-full w-fit text-green-800">
                    <Paragraph1 className="font-semibold text-xs">
                      Approved
                    </Paragraph1>
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="mt-1 font-bold text-gray-900 text-sm shrink-0">
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
      <div className="hidden space-y-2 py-4 border-gray-200 border-b">
        <div className="flex justify-between font-medium text-gray-700 text-sm">
          <Paragraph1>Rental Subtotal</Paragraph1>
          <Paragraph1>
            {CURRENCY}
            {formatCurrency(listerSubtotal)}
          </Paragraph1>
        </div>
        <div className="flex justify-between font-medium text-gray-700 text-sm">
          <Paragraph1>Delivery Fees:</Paragraph1>
          <Paragraph1>
            {CURRENCY}
            {formatCurrency(listerDeliveryFees)}
          </Paragraph1>
        </div>
        <div className="flex justify-between font-medium text-gray-700 text-sm">
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
        <div className="flex justify-between font-medium text-gray-700 text-sm">
          <Paragraph1>Security Deposit:</Paragraph1>
          <Paragraph1>
            {CURRENCY}
            {formatCurrency(listerSecurityDeposit)}
          </Paragraph1>
        </div>
      </div>

      {/* Lister Total */}
      <div className="flex justify-between items-center pt-4">
        <Paragraph1 className="font-bold text-gray-900 text-sm">
          Subtotal:
        </Paragraph1>
        <Paragraph1 className="font-extrabold text-gray-900 text-lg">
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
      <div className="bg-yellow-50 p-4 border border-yellow-200 rounded-xl">
        <Paragraph1 className="text-yellow-800 text-sm">
          Failed to load cart summary. Please try again.
        </Paragraph1>
      </div>
    );
  }

  const approvedGroups = listerGroups.filter((group) => group.items.length > 0);

  if (approvedGroups.length === 0) {
    return (
      <div className="space-y-2 bg-gray-50 p-4 border border-gray-200 rounded-xl">
        <Paragraph1 className="font-semibold text-gray-800 text-sm">
          No approved items yet
        </Paragraph1>
        <Paragraph1 className="text-gray-600 text-xs leading-relaxed">
          This panel only shows items after the lister approves. Pending
          requests appear in your main cart list on the left.
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
      <div className="space-y-1 px-0.5">
        <Paragraph1 className="font-bold text-gray-900 text-sm uppercase tracking-wide">
          Checkout summary
        </Paragraph1>
        <Paragraph1 className="text-gray-600 text-xs leading-relaxed">
          Totals and checkout apply to <strong>approved</strong> items only.
        </Paragraph1>
      </div>

      {approvedGroups.map((group) => (
        <ListerSummaryCard key={group.listerId} group={group} />
      ))}

      <div className="bg-gray-50 p-4 border border-gray-300 rounded-xl">
        <div className="flex justify-between items-center mb-1">
          <Paragraph1 className="font-bold text-gray-900 text-lg">
            Approved total
          </Paragraph1>
          <Paragraph1 className="font-extrabold text-gray-900 text-2xl">
            {CURRENCY}
            {formatCurrency(grandTotal)}
          </Paragraph1>
        </div>
        <Paragraph1 className="mb-4 text-gray-500 text-xs">
          Sum of approved items above, before shipping or final taxes if any.
        </Paragraph1>

        {/* Proceed Button */}
        <Link
          href="/shop/cart/checkout"
          className="flex justify-center bg-black hover:bg-gray-800 py-3 rounded-lg w-full font-semibold text-white transition-colors"
        >
          <Paragraph1>Proceed to Checkout</Paragraph1>
        </Link>

        {/* Security Note */}
        <div className="flex items-start gap-2 bg-green-50 mt-4 p-3 border border-green-200 rounded-md text-green-700 text-xs">
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
