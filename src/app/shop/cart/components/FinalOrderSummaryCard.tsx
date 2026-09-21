"use client";

import React from "react";
import Image from "next/image";
import { CheckCircle } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import Link from "next/link";
import { useListerProfile } from "@/lib/queries/shop/useListerProfile";
import { firstProductAttachmentImageUrl } from "@/lib/product/sortProductAttachmentUploads";
import { cloudinaryOptimizedImageUrl } from "@/lib/media/cloudinaryOptimizedImageUrl";
import { formatRentalDuration } from "@/lib/rental/formatRentalDuration";
import { buttonPrimaryFull } from "@/common/ui/buttonClasses";
import {
  cartSurfaceCardClass,
  cartSurfaceCardMutedClass,
} from "../cartSurface";
import {
  lineIsResale,
  resolveLineRentalPrice,
  resolveLineSecurityDeposit,
} from "../cartLinePricing";

const CURRENCY = "₦";

const formatCurrency = (amount: number): string => {
  return amount.toLocaleString("en-NG");
};

function SummaryMoneyRow({
  label,
  amount,
  bold = false,
  large = false,
}: {
  label: string;
  amount: number;
  bold?: boolean;
  large?: boolean;
}) {
  return (
    <div className="flex justify-between items-baseline gap-4">
      <Paragraph1
        className={`text-gray-700 text-sm ${bold ? "font-bold text-gray-900" : ""}`}
      >
        {label}
      </Paragraph1>
      <Paragraph1
        className={`tabular-nums shrink-0 ${
          large
            ? "font-extrabold text-gray-900 text-xl sm:text-2xl"
            : bold
              ? "font-bold text-gray-900 text-base sm:text-lg"
              : "font-medium text-gray-900 text-sm"
        }`}
      >
        {CURRENCY}
        {formatCurrency(amount)}
      </Paragraph1>
    </div>
  );
}

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
  /** Per-lister totals duplicate the checkout footer when there is only one lister. */
  showMoneyBreakdown?: boolean;
}

const ListerSummaryCard: React.FC<ListerSummaryCardProps> = ({
  group,
  showMoneyBreakdown = true,
}) => {
  const { data: listerData, isLoading: isListerLoading } = useListerProfile(
    group.listerId,
  );

  let listerRentalTotal = 0;
  let listerDeliveryFees = 0;
  let listerSecurityDeposit = 0;
  let listerPurchaseTotal = 0;

  group.items.forEach((item) => {
    if (lineIsResale(item)) {
      listerPurchaseTotal += resolveLineRentalPrice(item);
    } else {
      listerRentalTotal += resolveLineRentalPrice(item);
      listerDeliveryFees += item.deliveryFee || 0;
      listerSecurityDeposit += resolveLineSecurityDeposit(item);
    }
  });

  const hasResaleItems = listerPurchaseTotal > 0;
  const hasRentalItems =
    listerRentalTotal > 0 ||
    listerDeliveryFees > 0 ||
    listerSecurityDeposit > 0;
  const listerTotal =
    listerPurchaseTotal +
    listerRentalTotal +
    listerDeliveryFees +
    listerSecurityDeposit;

  // Use fetched lister name, fallback to items data, then fallback to generic
  const listerName =
    listerData?.name ||
    group.items[0]?.listerName ||
    `Lister ${group.listerId}`;

  return (
    <div className={cartSurfaceCardClass}>
      <div className="mb-3 sm:mb-4">
        <Paragraph1 className="font-medium sm:font-bold text-gray-600 text-sm tracking-wide">
          From{" "}
          {isListerLoading ? (
            <span className="inline-block bg-gray-200 rounded w-24 h-5 align-middle animate-pulse" />
          ) : (
            listerName
          )}
        </Paragraph1>
      </div>

      {/* Compact lines on mobile (no images; cart cards above have detail) */}
      <div className="sm:hidden space-y-2 pb-3 border-gray-100 border-b">
        {group.items.map((item) => {
          const product = item.productDetail || {};
          const isResale = lineIsResale(item);
          const rowKey =
            item.requestId ||
            item.cartItemId ||
            item.lineId ||
            item.productId;
          const rentalAmount = resolveLineRentalPrice(item);

          return (
            <div
              key={`compact-${rowKey}`}
              className="flex justify-between items-baseline gap-3"
            >
              <Paragraph1 className="min-w-0 text-gray-700 text-sm leading-snug">
                <span className="font-medium text-gray-900">
                  {product.name || item.productName}
                </span>
                {isResale ? (
                  <span className="text-gray-500"> · Purchase</span>
                ) : (
                  <span className="text-gray-500">
                    {" "}
                    · {formatRentalDuration(item.rentalDays)}
                  </span>
                )}
              </Paragraph1>
              <Paragraph1 className="font-medium text-gray-900 text-sm tabular-nums shrink-0">
                {CURRENCY}
                {formatCurrency(rentalAmount)}
              </Paragraph1>
            </div>
          );
        })}
      </div>

      {/* Full item list in sidebar on desktop */}
      <div className="hidden sm:block space-y-4 pb-6 border-gray-200 border-b">
        {group.items.map((item) => {
          const product = item.productDetail || {};
          const isResale = lineIsResale(item);
          // Try productDetail image, fallback to rental request image
          const productImageUrl = cloudinaryOptimizedImageUrl(
            firstProductAttachmentImageUrl(product.attachments?.uploads) ||
              item.productImage ||
              "",
            { preset: "thumb" },
          );
          const rowKey =
            item.requestId ||
            item.cartItemId ||
            item.lineId ||
            item.productId;
          return (
            <div key={rowKey} className="flex items-start gap-4">
              {/* Product Image */}
              <div className="relative bg-gray-200 border border-gray-100 rounded-md w-16 h-20 overflow-hidden shrink-0">
                {productImageUrl ? (
                  <Image
                    src={productImageUrl}
                    alt={product.name || item.productName}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : null}
              </div>

              {/* Product Details */}
              <div className="grow">
                <Paragraph1 className="font-semibold text-gray-800 text-sm uppercase leading-snug">
                  {product.name || item.productName}
                </Paragraph1>
                <Paragraph1 className="mt-1 text-gray-600 text-xs leading-snug">
                  {isResale ? (
                    <>
                      Type: <strong>Purchase</strong>
                    </>
                  ) : (
                    <>
                      Duration:{" "}
                      <strong>{formatRentalDuration(item.rentalDays)}</strong>
                    </>
                  )}
                </Paragraph1>
                <div className="bg-green-100 mt-4 px-2 py-0.5 border border-green-200 rounded-full w-fit text-green-800">
                  <Paragraph1 className="font-semibold text-xs">
                    Ready to checkout
                  </Paragraph1>
                </div>
              </div>

              {/* Price */}
              <div className="mt-1 font-bold text-gray-900 text-sm shrink-0">
                <Paragraph1>
                  {CURRENCY}
                  {formatCurrency(resolveLineRentalPrice(item))}
                </Paragraph1>
              </div>
            </div>
          );
        })}
      </div>

      {showMoneyBreakdown ? (
        <div className="space-y-2 pt-3 sm:pt-4">
          {hasResaleItems ? (
            <SummaryMoneyRow label="Purchase" amount={listerPurchaseTotal} />
          ) : null}
          {hasRentalItems ? (
            <SummaryMoneyRow label="Rental" amount={listerRentalTotal} />
          ) : null}
          {listerSecurityDeposit > 0 ? (
            <SummaryMoneyRow label="Deposit" amount={listerSecurityDeposit} />
          ) : null}
          {listerDeliveryFees > 0 ? (
            <SummaryMoneyRow label="Delivery" amount={listerDeliveryFees} />
          ) : null}
          <div className="pt-2 border-gray-100 border-t">
            <SummaryMoneyRow label="Total" amount={listerTotal} bold />
          </div>
        </div>
      ) : null}
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
          Nothing ready for checkout yet
        </Paragraph1>
        <Paragraph1 className="text-gray-600 text-xs leading-relaxed">
          When a lister confirms your dates, your items will appear here and in
          your cart.
        </Paragraph1>
      </div>
    );
  }

  let grandRentalTotal = 0;
  let grandDeliveryFees = 0;
  let grandSecurityDeposit = 0;
  let grandPurchaseTotal = 0;

  approvedGroups.forEach((group) => {
    group.items.forEach((item) => {
      if (lineIsResale(item)) {
        grandPurchaseTotal += resolveLineRentalPrice(item);
      } else {
        grandRentalTotal += resolveLineRentalPrice(item);
        grandDeliveryFees += item.deliveryFee || 0;
        grandSecurityDeposit += resolveLineSecurityDeposit(item);
      }
    });
  });

  const hasGrandResaleItems = grandPurchaseTotal > 0;
  const hasGrandRentalItems =
    grandRentalTotal > 0 ||
    grandDeliveryFees > 0 ||
    grandSecurityDeposit > 0;
  const grandTotal =
    grandPurchaseTotal +
    grandRentalTotal +
    grandDeliveryFees +
    grandSecurityDeposit;

  const multipleListers = approvedGroups.length > 1;
  const grandBreakdownRowCount = [
    hasGrandResaleItems,
    hasGrandRentalItems,
    grandSecurityDeposit > 0,
    grandDeliveryFees > 0,
  ].filter(Boolean).length;
  const showGrandBreakdown =
    multipleListers || grandBreakdownRowCount > 1;

  return (
    <div className="space-y-4 min-w-0 w-full max-w-full sm:space-y-6">
      <Paragraph1 className="font-bold text-gray-900 text-sm uppercase tracking-wide">
        Order summary
      </Paragraph1>

      {approvedGroups.map((group) => (
        <ListerSummaryCard
          key={group.listerId}
          group={group}
          showMoneyBreakdown={multipleListers}
        />
      ))}

      <div className={cartSurfaceCardMutedClass}>
        {showGrandBreakdown ? (
          <div className="space-y-2 mb-3 pb-3 border-gray-200 border-b">
            {hasGrandResaleItems ? (
              <SummaryMoneyRow label="Purchase" amount={grandPurchaseTotal} />
            ) : null}
            {hasGrandRentalItems ? (
              <SummaryMoneyRow label="Rental" amount={grandRentalTotal} />
            ) : null}
            {grandSecurityDeposit > 0 ? (
              <SummaryMoneyRow label="Deposit" amount={grandSecurityDeposit} />
            ) : null}
            {grandDeliveryFees > 0 ? (
              <SummaryMoneyRow label="Delivery" amount={grandDeliveryFees} />
            ) : null}
          </div>
        ) : null}

        <SummaryMoneyRow
          label="Total"
          amount={grandTotal}
          bold
          large
        />
        <Paragraph1 className="mt-2 mb-4 text-gray-500 text-xs">
          Delivery fees calculated at checkout.
        </Paragraph1>

        <Link
          href="/shop/cart/checkout"
          className={buttonPrimaryFull}
        >
          <Paragraph1>Proceed to Checkout</Paragraph1>
        </Link>

        {grandSecurityDeposit > 0 ? (
          <div className="flex items-start gap-2 bg-green-50 mt-4 p-3 border border-green-200 rounded-md text-green-700 text-xs">
            <CheckCircle size={16} className="mt-0.5 shrink-0" />
            <Paragraph1 className="text-green-700">
              Deposit refunded after return.
            </Paragraph1>
          </div>
        ) : null}
      </div>
    </div>
  );
}
