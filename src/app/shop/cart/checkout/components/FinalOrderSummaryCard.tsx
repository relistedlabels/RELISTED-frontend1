"use client";

import React, { useState, memo, useMemo } from "react";
import type {
  OutboundShippingBucketQuote,
  ReturnShippingBucketQuote,
} from "@/lib/api/cart";
import Image from "next/image";
import Link from "next/link";
import { Check, CheckCircle, MapPin } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import { useRouter } from "next/navigation";
import {
  formatShippingQuoteWarningLine,
  orderIdsFromOrderPost,
  type OrderSummaryApiResult,
  type ReturnPickupAddressPayload,
} from "@/lib/api/cart";
import { usePassCart } from "@/lib/mutations/renters/usePassCartMutation";
import { useQueryClient } from "@tanstack/react-query";
import { useListerProfile } from "@/lib/queries/shop/useListerProfile";
import { toast } from "sonner";
import { isResaleItem } from "@/lib/listers/listerOrderRow";
import { firstProductAttachmentImageUrl } from "@/lib/product/sortProductAttachmentUploads";
import { buttonPrimaryFull } from "@/common/ui/buttonClasses";
import { cloudinaryOptimizedImageUrl } from "@/lib/media/cloudinaryOptimizedImageUrl";
import {
  computeCheckoutGrandTotal,
  computeDisplayOutboundShipping,
  computeDisplayReturnShipping,
} from "@/lib/checkout/checkoutSummaryTotals";
import { formatRentalDuration } from "@/lib/rental/formatRentalDuration";
import type {
  DispatchWindowSelectionMap,
  DispatchWindowsPayload,
  ShipmentDispatchType,
} from "@/lib/checkout/dispatchWindows";

const CURRENCY = "₦";

const formatCurrency = (amount: number): string => {
  return amount.toLocaleString("en-NG");
};

// === Lister Summary Card Component ===
interface ListerSummaryCardProps {
  group: {
    listerId: string;
    items: any[];
  };
}

const ListerOrderCard = memo(({ group }: ListerSummaryCardProps) => {
    const { data: listerData, isLoading: isListerLoading } = useListerProfile(
      group.listerId,
    );

    const listerName =
      listerData?.name ||
      group.items[0]?.listerName ||
      `Lister ${group.listerId}`;

    return (
      <div
        key={group.listerId}
        className="p-4 border border-gray-200 rounded-xl"
      >
        <div className="flex justify-between items-center gap-4 mb-4">
          <Paragraph1 className="font-bold text-gray-900 text-lg tracking-wide">
            ORDER SUMMARY
          </Paragraph1>
          <Paragraph1 className="font-bold text-gray-500 text-lg tracking-wide">
            From -{" "}
            {isListerLoading ? (
              <span className="inline-block bg-gray-200 rounded w-24 h-5 animate-pulse"></span>
            ) : (
              listerName
            )}
          </Paragraph1>
        </div>

        <div className="space-y-4">
          {group.items.map((item) => {
            const product = item.productDetail || {};
            const productImageUrl = cloudinaryOptimizedImageUrl(
              firstProductAttachmentImageUrl(product.attachments?.uploads) ||
                item.productImage ||
                "",
              { preset: "thumb" },
            );

            return (
              <div
                key={item.requestId || item.cartItemId || item.id}
                className="flex items-start gap-4"
              >
                <div className="relative bg-gray-200 border border-gray-100 rounded-md w-16 h-20 overflow-hidden shrink-0">
                  {productImageUrl && (
                    <Image
                      src={productImageUrl}
                      alt={product.name || item.productName}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  )}
                </div>

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
                        Duration:{" "}
                        <strong>{formatRentalDuration(item.rentalDays)}</strong>
                      </>
                    )}
                  </Paragraph1>
                </div>

                <div className="mt-1 font-bold text-gray-900 text-sm shrink-0">
                  <Paragraph1>
                    {CURRENCY}
                    {formatCurrency(item.totalPrice || 0)}
                  </Paragraph1>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
);

ListerOrderCard.displayName = "ListerOrderCard";

// === Skeleton Loader ===
const CheckoutSummarySkeleton = () => (
  <div className="p-4 border border-gray-200 rounded-xl animate-pulse">
    <div className="bg-gray-200 mb-6 rounded w-32 h-6"></div>
    {[...Array(2)].map((_, i) => (
      <div key={i} className="flex items-start gap-4 mb-4">
        <div className="bg-gray-200 rounded-md w-16 h-20 shrink-0"></div>
        <div className="space-y-2 grow">
          <div className="bg-gray-200 rounded w-32 h-4"></div>
          <div className="bg-gray-200 rounded w-24 h-3"></div>
        </div>
      </div>
    ))}
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
  selectedShippingTier?: string;
  selectedTierData?: {
    name: string;
    totalShippingCost: number;
    grandTotal: number;
  };
  hasReturnShippingLeg?: boolean;
  selectedReturnShippingTier?: string;
  selectedReturnTierData?: {
    name: string;
    totalShippingCost: number;
    grandTotal: number;
  };
  outboundShippingByBucket?: OutboundShippingBucketQuote[];
  selectedOutboundTierByBucket?: Record<number, string>;
  returnShippingByBucket?: ReturnShippingBucketQuote[];
  selectedReturnTierByBucket?: Record<number, string>;
  dispatchSelections?: DispatchWindowSelectionMap;
  returnPickupAddress?: ReturnPickupAddressPayload;
  /** Response body from GET /order/summary (parent-owned React Query). */
  orderSummary?: OrderSummaryApiResult;
  orderSummaryLoading?: boolean;
  /** GET /order/summary failed (e.g. expired dispatch window, no approved lines). */
  orderSummaryError?: string | null;
  hasDeliveryAddress?: boolean;
  dispatchReschedules?: Array<{
    cartItemId?: string;
    productName?: string;
    outboundSummary?: string;
    priceUnchanged?: boolean;
  }>;
  onRefetchOrderSummary?: () => void;
  checkoutBlockingIssues?: string[];
  checkoutStep?: 1 | 2 | 3 | 4;
  onCheckoutStepChange?: (step: 1 | 2 | 3 | 4) => void;
}

export default function FinalOrderSummaryCard({
  listerGroups = [],
  isLoading,
  error,
  selectedShippingTier = "",
  selectedTierData,
  hasReturnShippingLeg = false,
  selectedReturnShippingTier = "",
  selectedReturnTierData,
  outboundShippingByBucket = [],
  selectedOutboundTierByBucket = {},
  returnShippingByBucket = [],
  selectedReturnTierByBucket = {},
  dispatchSelections = {},
  returnPickupAddress,
  orderSummary,
  orderSummaryLoading = false,
  orderSummaryError = null,
  hasDeliveryAddress = false,
  dispatchReschedules = [],
  onRefetchOrderSummary,
  checkoutBlockingIssues = [],
  checkoutStep = 1,
  onCheckoutStepChange,
}: FinalOrderSummaryCardProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const passCartMutation = usePassCart();
  const [isAgree, setIsAgree] = useState(false);
  const canCheckout = checkoutBlockingIssues.length === 0;

  const dispatchWindowsPayload = useMemo<
    DispatchWindowsPayload | undefined
  >(() => {
    const payload: DispatchWindowsPayload = {};
    (Object.keys(dispatchSelections) as ShipmentDispatchType[]).forEach(
      (type) => {
        const selection = dispatchSelections[type];
        if (selection?.window) {
          payload[type] = selection.window;
        }
      },
    );
    return Object.keys(payload).length > 0 ? payload : undefined;
  }, [dispatchSelections]);

  // All items are already approved from the API
  const approvedGroups = listerGroups.filter((group) => group.items.length > 0);
  const summary = orderSummary?.data?.summary;
  const shippingQuoteWarnings =
    orderSummary?.data?.shippingQuoteWarnings ?? [];
  const summaryOutboundShipping = summary?.outboundShippingTotal || 0;
  const summaryReturnShipping = summary?.returnShippingTotal || 0;
  const shipmentBucketsMeta = orderSummary?.data?.shipmentBuckets ?? [];

  const usePerBucketOutbound = outboundShippingByBucket.length > 0;
  const usePerBucketReturn =
    hasReturnShippingLeg && returnShippingByBucket.length > 0;

  const displayOutboundShipping = useMemo(
    () =>
      computeDisplayOutboundShipping({
        usePerBucket: usePerBucketOutbound,
        outboundShippingByBucket,
        selectedOutboundTierByBucket,
        shipmentBucketsMeta,
        selectedTierTotal: selectedTierData?.totalShippingCost,
        summaryOutboundTotal: summaryOutboundShipping,
      }),
    [
      usePerBucketOutbound,
      outboundShippingByBucket,
      selectedOutboundTierByBucket,
      shipmentBucketsMeta,
      selectedTierData,
      summaryOutboundShipping,
    ],
  );

  const displayReturnShipping = useMemo(
    () =>
      computeDisplayReturnShipping({
        hasReturnShippingLeg,
        usePerBucketReturn,
        returnShippingByBucket,
        selectedReturnTierByBucket,
        shipmentBucketsMeta,
        selectedReturnTierTotal: selectedReturnTierData?.totalShippingCost,
        summaryReturnTotal: summaryReturnShipping,
      }),
    [
      hasReturnShippingLeg,
      usePerBucketReturn,
      returnShippingByBucket,
      selectedReturnTierByBucket,
      shipmentBucketsMeta,
      selectedReturnTierData,
      summaryReturnShipping,
    ],
  );

  const handleCheckout = async () => {
    if (!isAgree) {
      alert("Please agree to the terms of service");
      return;
    }

    if (usePerBucketOutbound) {
      for (const b of outboundShippingByBucket) {
        const pick =
          selectedOutboundTierByBucket[b.bucketIndex] ??
          b.shippingTiers[0]?.name ??
          "";
        if (!pick.trim()) {
          alert("Please select a delivery method for each order.");
          return;
        }
      }
    } else if (!selectedShippingTier) {
      alert("Please select a delivery method");
      return;
    }
    if (hasReturnShippingLeg && usePerBucketReturn) {
      for (const b of returnShippingByBucket) {
        const pick =
          selectedReturnTierByBucket[b.bucketIndex] ??
          b.shippingTiers[0]?.name ??
          "";
        if (!pick.trim()) {
          alert("Please select a return pickup method for each rental.");
          return;
        }
      }
    } else if (hasReturnShippingLeg && !selectedReturnShippingTier) {
      alert("Please select a return pickup method");
      return;
    }
    if (!canCheckout) {
      toast.error(
        checkoutBlockingIssues[0] ||
          "Resolve delivery schedule conflicts before checkout.",
      );
      return;
    }

    const approvedItemCount = approvedGroups.reduce(
      (n, g) => n + g.items.length,
      0,
    );
    if (approvedItemCount === 0) return;

    const primaryOutboundTier =
      usePerBucketOutbound && outboundShippingByBucket[0]
        ? selectedOutboundTierByBucket[outboundShippingByBucket[0].bucketIndex] ??
          outboundShippingByBucket[0].shippingTiers[0]?.name ??
          selectedShippingTier
        : selectedShippingTier;

    passCartMutation.mutate(
      {
        tierName: primaryOutboundTier,
        returnTierName:
          hasReturnShippingLeg && !usePerBucketReturn
            ? selectedReturnShippingTier
            : undefined,
        outboundPricingByBucket:
          usePerBucketOutbound && outboundShippingByBucket.length > 0
            ? outboundShippingByBucket.map((b) => ({
                bucketIndex: b.bucketIndex,
                pricingTier:
                  selectedOutboundTierByBucket[b.bucketIndex] ??
                  b.shippingTiers[0]?.name ??
                  "",
              }))
            : undefined,
        returnPricingByBucket:
          hasReturnShippingLeg && usePerBucketReturn
            ? returnShippingByBucket.map((b) => ({
                bucketIndex: b.bucketIndex,
                pricingTier:
                  selectedReturnTierByBucket[b.bucketIndex] ??
                  b.shippingTiers[0]?.name ??
                  "",
              }))
            : undefined,
        dispatchWindows: dispatchWindowsPayload,
        returnPickupAddress,
      },
      {
        onSuccess: (passResponse) => {
          const ids = orderIdsFromOrderPost(passResponse);
          const id = ids[0];
          const shipmentIds = passResponse?.data?.shipmentIds || [];

          // Force refetch cart items
          queryClient.invalidateQueries({ queryKey: ["cart", "items"] });
          queryClient.invalidateQueries({
            queryKey: ["renters", "rental-requests"],
          });

          if (!id) {
            toast.error(
              "Checkout succeeded but no order id was returned. Check My Orders or refresh your cart.",
            );
            return;
          }
          toast.success(
            ids.length > 1 ? `${ids.length} orders placed` : "Order placed",
          );
          // Force clear cart cache before navigation
          queryClient.invalidateQueries({ queryKey: ["cart", "items"] });
          queryClient.invalidateQueries({
            queryKey: ["renters", "rental-requests"],
          });
          router.push(
            `/shop/cart/checkout/success?orderId=${encodeURIComponent(id)}`,
          );
        },
        onError: (err: unknown) => {
          toast.error(
            err instanceof Error
              ? err.message
              : "Checkout failed. Please try again.",
          );
        },
      },
    );
  };

  const showItemsSkeleton = isLoading && !error;
  const showPaymentSkeleton =
    hasDeliveryAddress && orderSummaryLoading && !orderSummaryError;
  const showCheckoutActions = checkoutStep === 4;

  return (
    <div className="space-y-6">
      {showItemsSkeleton && <CheckoutSummarySkeleton />}

      {hasDeliveryAddress && dispatchReschedules.length > 0 ? (
        <div className="space-y-2 bg-amber-50 p-4 border border-amber-200 rounded-xl">
          {dispatchReschedules.map((entry) => (
            <Paragraph1
              key={entry.cartItemId ?? entry.productName ?? entry.outboundSummary}
              className="text-amber-900 text-sm leading-relaxed"
            >
              Your delivery time has passed
              {entry.outboundSummary
                ? `. New earliest slot: ${entry.outboundSummary}.`
                : "."}{" "}
              Confirm below or pick another.
              {entry.priceUnchanged ? " Price unchanged." : ""}
            </Paragraph1>
          ))}
        </div>
      ) : null}

      {hasDeliveryAddress && orderSummaryError ? (
        <div className="space-y-3 bg-amber-50 p-4 border border-amber-200 rounded-xl">
          <Paragraph1 className="font-semibold text-amber-950 text-sm">
            Could not load payment summary
          </Paragraph1>
          <Paragraph1 className="text-amber-900 text-sm whitespace-pre-wrap">
            {orderSummaryError}
          </Paragraph1>
          <div className="flex flex-wrap gap-2">
            {onRefetchOrderSummary ? (
              <button
                type="button"
                className="bg-white hover:bg-amber-100 px-3 py-2 border border-amber-300 rounded-lg font-medium text-amber-950 text-sm transition-colors"
                onClick={() => onRefetchOrderSummary()}
              >
                Try again
              </button>
            ) : null}
            <Link
              href="/shop/cart"
              className="inline-flex items-center bg-white hover:bg-amber-100 px-3 py-2 border border-amber-300 rounded-lg font-medium text-amber-950 text-sm transition-colors"
            >
              Back to cart
            </Link>
          </div>
        </div>
      ) : null}

      {shippingQuoteWarnings.length > 0 ? (
        <div className="space-y-2 bg-amber-50 p-3 border border-amber-200 rounded-xl">
          <Paragraph1 className="font-semibold text-amber-950 text-xs">
            Delivery quote note
          </Paragraph1>
          <ul className="space-y-1 pl-4 text-amber-900 text-xs list-disc">
            {shippingQuoteWarnings.map((w, i) => (
              <li
                key={`${w.provider}-${w.leg}-${w.bucketIndex ?? i}-${w.message}`}
              >
                {formatShippingQuoteWarningLine(w)}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {error && (
        <div className="bg-yellow-50 p-4 border border-yellow-200 rounded-xl">
          <Paragraph1 className="text-yellow-800 text-sm">
            Failed to load your checkout items. Please try again.
          </Paragraph1>
        </div>
      )}

      {(orderSummary?.data?.summary?.rentalTotal ?? 0) > 0 ? (
        <div className="bg-white p-4 border border-gray-200 rounded-xl">
          <Paragraph1 className="mb-4 font-bold text-gray-900 text-lg">
            Return pickup details
          </Paragraph1>
          <div className="flex items-start gap-3">
            <div className="bg-gray-100 p-2 rounded-full">
              <MapPin size={18} className="text-gray-700" />
            </div>
            <div>
              <Paragraph1 className="font-semibold text-gray-900 text-sm">
                {returnPickupAddress
                  ? `${returnPickupAddress.street}, ${returnPickupAddress.city}`
                  : "Using your delivery address"}
              </Paragraph1>
              {returnPickupAddress ? (
                <Paragraph1 className="text-gray-600 text-xs">
                  {returnPickupAddress.contactName} •{" "}
                  {returnPickupAddress.phoneNumber}
                </Paragraph1>
              ) : null}
              {returnPickupAddress?.instructions && (
                <Paragraph1 className="mt-1 text-gray-500 text-xs">
                  {returnPickupAddress.instructions}
                </Paragraph1>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {!isLoading && !error && approvedGroups.length === 0 && (
        <div className="bg-gray-50 p-4 border border-gray-200 rounded-xl text-center">
          <Paragraph1 className="text-gray-600">
            No items ready for checkout yet.
          </Paragraph1>
        </div>
      )}

      {!isLoading && !error && approvedGroups.length > 0 && (
        <>
          {approvedGroups.map((group) => (
            <ListerOrderCard key={group.listerId} group={group} />
          ))}

          {showPaymentSkeleton && <CheckoutSummarySkeleton />}

          {!hasDeliveryAddress ? (
            <div className="bg-amber-50 p-4 border border-amber-200 rounded-xl">
              <Paragraph1 className="text-amber-900 text-sm leading-relaxed">
                Add a delivery address to finish checkout.
              </Paragraph1>
            </div>
          ) : null}

          {hasDeliveryAddress && orderSummary?.data?.summary ? (
                  <div className="bg-gray-50 p-4 border border-gray-300 rounded-xl">
                    <Paragraph1 className="mb-4 font-bold text-gray-900 text-lg">
                      PAYMENT BREAKDOWN
                    </Paragraph1>

                    {/* Use API summary data with purchaseTotal */}
                    {(() => {
                      const isResaleOrder =
                        (orderSummary?.data?.summary?.purchaseTotal ?? 0) > 0;
                      const hasRentalItems =
                        (orderSummary?.data?.summary?.rentalTotal ?? 0) > 0;

                      return (
                        <div className="space-y-3 py-4 border-gray-200 border-b">
                          {isResaleOrder && (
                            <div className="flex justify-between font-medium text-gray-700 text-sm">
                              <Paragraph1>Purchase Amount</Paragraph1>
                              <Paragraph1>
                                {CURRENCY}
                                {formatCurrency(
                                  orderSummary.data.summary.purchaseTotal ?? 0,
                                )}
                              </Paragraph1>
                            </div>
                          )}
                          {hasRentalItems && (
                            <div className="flex justify-between font-medium text-gray-700 text-sm">
                              <Paragraph1>Rental Amount</Paragraph1>
                              <Paragraph1>
                                {CURRENCY}
                                {formatCurrency(
                                  orderSummary.data.summary.rentalTotal ?? 0,
                                )}
                              </Paragraph1>
                            </div>
                          )}
                          {hasRentalItems && (
                            <>
                              <div className="flex justify-between font-medium text-gray-700 text-sm">
                                <Paragraph1>Security Deposit</Paragraph1>
                                <Paragraph1>
                                  {CURRENCY}
                                  {formatCurrency(
                                    orderSummary.data.summary.collateralTotal ??
                                      0,
                                  )}
                                </Paragraph1>
                              </div>
                              <div className="flex justify-between font-medium text-gray-700 text-sm">
                                <Paragraph1>Cleaning Fees</Paragraph1>
                                <Paragraph1>
                                  {CURRENCY}
                                  {formatCurrency(
                                    orderSummary.data.summary.cleaningTotal ?? 0,
                                  )}
                                </Paragraph1>
                              </div>
                            </>
                          )}
                          <div className="flex justify-between font-medium text-gray-700 text-sm">
                            <Paragraph1>Delivery fee</Paragraph1>
                            <Paragraph1>
                              {CURRENCY}
                              {formatCurrency(displayOutboundShipping)}
                            </Paragraph1>
                          </div>

                          {hasRentalItems && (
                            <div className="flex justify-between font-medium text-gray-700 text-sm">
                              <Paragraph1>Return fee</Paragraph1>
                              <Paragraph1>
                                {CURRENCY}
                                {formatCurrency(displayReturnShipping)}
                              </Paragraph1>
                            </div>
                          )}
                          <div className="flex justify-between font-medium text-gray-700 text-sm">
                            <Paragraph1>Service Charge</Paragraph1>
                            <Paragraph1>
                              {CURRENCY}
                              {formatCurrency(
                                orderSummary.data.summary.serviceCharge || 0,
                              )}
                            </Paragraph1>
                          </div>
                          <div className="flex justify-between font-medium text-gray-700 text-sm">
                            <Paragraph1>VAT</Paragraph1>
                            <Paragraph1>
                              {CURRENCY}
                              {formatCurrency(
                                orderSummary.data.summary.vatAmount || 0,
                              )}
                            </Paragraph1>
                          </div>
                        </div>
                      );
                    })()}

                    <div className="flex justify-between items-center mb-6 pt-4">
                      <Paragraph1 className="font-bold text-gray-900 text-lg">
                        Grand Total:
                      </Paragraph1>
                      <Paragraph1 className="font-extrabold text-gray-900 text-2xl">
                        {CURRENCY}
                        {formatCurrency(
                          computeCheckoutGrandTotal(
                            orderSummary.data.summary,
                            displayOutboundShipping,
                            displayReturnShipping,
                          ),
                        )}
                      </Paragraph1>
                    </div>

                    {showCheckoutActions ? (
                      <>
                        {passCartMutation.isError && (
                          <div className="bg-red-50 mb-4 p-3 border border-red-200 rounded-lg">
                            <Paragraph1 className="text-red-700 text-xs">
                              {passCartMutation.error?.message ||
                                "Failed to complete checkout"}
                            </Paragraph1>
                          </div>
                        )}

                        <button
                          onClick={handleCheckout}
                          disabled={
                            !isAgree ||
                            passCartMutation.isPending ||
                            !canCheckout
                          }
                          className={buttonPrimaryFull}
                        >
                          <Paragraph1>
                            {passCartMutation.isPending
                              ? "Processing..."
                              : "Complete Order"}
                          </Paragraph1>
                        </button>
                        {!canCheckout && (
                          <div className="bg-amber-50 mt-4 p-3 border border-amber-200 rounded-lg">
                            <Paragraph1 className="font-semibold text-amber-900 text-xs uppercase tracking-wide">
                              Before you pay
                            </Paragraph1>
                            <div className="space-y-1 mt-1">
                              {checkoutBlockingIssues.map((issue) => (
                                <Paragraph1
                                  key={issue}
                                  className="text-amber-900 text-xs"
                                >
                                  {issue}
                                </Paragraph1>
                              ))}
                            </div>
                          </div>
                        )}

                        {(orderSummary?.data?.summary?.rentalTotal ?? 0) > 0 && (
                          <div className="flex items-start gap-2 bg-green-50 mt-4 p-3 border border-green-200 rounded-md text-green-700 text-xs">
                            <CheckCircle
                              size={16}
                              className="mt-0.5 shrink-0"
                            />
                            <Paragraph1 className="text-green-700">
                              Your <strong>refundable security deposit</strong> is
                              returned to your wallet after the item is returned
                              and checked.
                            </Paragraph1>
                          </div>
                        )}

                        <label className="flex items-start space-x-2 mt-4 text-gray-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isAgree}
                            onChange={() => setIsAgree(!isAgree)}
                            className="hidden"
                          />
                          <span
                            className={`shrink-0 w-6 h-6 rounded border mt-0.5 ${
                              isAgree
                                ? "bg-black border-black"
                                : "bg-white border-gray-400"
                            } flex items-center justify-center`}
                          >
                            {isAgree && (
                              <Check size={18} className="text-white" />
                            )}
                          </span>
                          <Paragraph1 className="text-xs">
                            By confirming this order you accept our{" "}
                            <Link
                              href="/terms-and-conditions"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-semibold underline underline-offset-2 hover:text-gray-900"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Terms of Service Agreement
                            </Link>{" "}
                            and our{" "}
                            <Link
                              href="/privacy-policy"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-semibold underline underline-offset-2 hover:text-gray-900"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Data Protection Policy
                            </Link>
                          </Paragraph1>
                        </label>
                      </>
                    ) : null}
                  </div>
          ) : null}
        </>
      )}
    </div>
  );
}
