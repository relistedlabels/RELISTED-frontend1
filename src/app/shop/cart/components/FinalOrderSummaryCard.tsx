"use client";

import React from "react";
import { CheckCircle } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import Link from "next/link";
import { buttonPrimaryFull } from "@/common/ui/buttonClasses";
import { cartSurfaceCardClass } from "../cartSurface";
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
  const grandTotal =
    grandPurchaseTotal +
    grandRentalTotal +
    grandDeliveryFees +
    grandSecurityDeposit;

  const showGrandBreakdown =
    hasGrandResaleItems ||
    grandRentalTotal > 0 ||
    grandSecurityDeposit > 0 ||
    grandDeliveryFees > 0;

  return (
    <div className={`${cartSurfaceCardClass} space-y-4 sm:space-y-5`}>
      <Paragraph1 className="font-bold text-gray-900 text-sm uppercase tracking-wide">
        Order summary
      </Paragraph1>

      {showGrandBreakdown ? (
        <div className="space-y-2">
          {hasGrandResaleItems ? (
            <SummaryMoneyRow label="Purchase" amount={grandPurchaseTotal} />
          ) : null}
          {grandRentalTotal > 0 ? (
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

      <SummaryMoneyRow label="Total" amount={grandTotal} bold large />

      <Paragraph1 className="text-gray-500 text-xs leading-relaxed">
        Delivery fees calculated at checkout.
      </Paragraph1>

      <Link href="/shop/cart/checkout" className={buttonPrimaryFull}>
        <Paragraph1>Proceed to Checkout</Paragraph1>
      </Link>

      {grandSecurityDeposit > 0 ? (
        <div className="flex items-start gap-2 bg-green-50 p-3 border border-green-200 rounded-md text-green-700 text-xs">
          <CheckCircle size={16} className="mt-0.5 shrink-0" />
          <Paragraph1 className="text-green-700">
            Deposit refunded after return.
          </Paragraph1>
        </div>
      ) : null}
    </div>
  );
}
