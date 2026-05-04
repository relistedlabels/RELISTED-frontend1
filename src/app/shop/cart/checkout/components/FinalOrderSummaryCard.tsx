"use client";

import React, { useState, memo, useMemo, useEffect } from "react";
import Image from "next/image";
import { Check, CheckCircle, MapPin, Zap, Compass } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import { useProfile } from "@/lib/queries/user/useProfile";
import { useRouter } from "next/navigation";
import {
  getOrderSummaryApi,
  orderIdsFromOrderPost,
  type ReturnPickupAddressPayload,
} from "@/lib/api/cart";
import { usePassCart } from "@/lib/mutations/renters/usePassCartMutation";
import { useQueryClient } from "@tanstack/react-query";
import { useListerProfile } from "@/lib/queries/shop/useListerProfile";
import { toast } from "sonner";
import { isResaleItem } from "@/lib/listers/listerOrderRow";
import { useQuery } from "@tanstack/react-query";
import type {
  DispatchWindowSelectionMap,
  DispatchWindowsPayload,
  ShipmentDispatchType,
} from "@/lib/checkout/dispatchWindows";
import {
  formatWindowRange,
  isImmediateDispatch,
} from "@/lib/checkout/dispatchWindows";
import type { DispatchWindowContext } from "@/lib/checkout/dispatchWindows";

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
  orderSummary: any;
  selectedTierData?: {
    name: string;
    totalShippingCost: number;
    grandTotal: number;
  };
  approvedGroups: Array<{
    listerId: string;
    items: any[];
  }>;
}

const ListerOrderCard = memo(
  ({
    group,
    orderSummary,
    selectedTierData,
    approvedGroups,
  }: ListerSummaryCardProps) => {
    // Hook called at top level of component
    const { data: listerData, isLoading: isListerLoading } = useListerProfile(
      group.listerId,
    );

    // Use API breakdown data instead of manual calculations

    // Use fetched lister name with fallbacks
    const listerName =
      listerData?.name ||
      group.items[0]?.listerName ||
      `Lister ${group.listerId}`;

    const calculateListerShippingShare = (
      totalShippingCost: number,
      listerItemCount: number,
      totalItemsCount: number,
    ): number => {
      if (totalItemsCount === 0) return 0;
      return Math.floor(
        (totalShippingCost * listerItemCount) / totalItemsCount,
      );
    };

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

        {/* Item List for this Lister */}
        <div className="space-y-4 pb-6 border-gray-200 border-b">
          {group.items.map((item) => {
            const product = item.productDetail || {};
            const productImageUrl =
              product.attachments?.uploads?.[0]?.url || item.productImage || "";

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
                        Duration: <strong>{item.rentalDays} Days</strong>
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

        {/* Cost Breakdown for this Lister - From Order Summary */}
        {orderSummary?.data?.listerBreakdowns &&
          (() => {
            const listerBreakdown = orderSummary.data.listerBreakdowns.find(
              (breakdown: any) => breakdown.listerId === group.listerId,
            );
            const hasResaleItems = listerBreakdown?.purchaseTotal > 0;
            const hasRentalItems = listerBreakdown?.rentalTotal > 0;

            return listerBreakdown ? (
              <div className="space-y-2 py-4 border-gray-200 border-b">
                {hasResaleItems && (
                  <div className="flex justify-between font-medium text-gray-700 text-sm">
                    <Paragraph1>Purchase Amount</Paragraph1>
                    <Paragraph1>
                      {CURRENCY}
                      {formatCurrency(listerBreakdown.purchaseTotal)}
                    </Paragraph1>
                  </div>
                )}
                {hasRentalItems && (
                  <div className="flex justify-between font-medium text-gray-700 text-sm">
                    <Paragraph1>Rental Amount</Paragraph1>
                    <Paragraph1>
                      {CURRENCY}
                      {formatCurrency(listerBreakdown.rentalTotal)}
                    </Paragraph1>
                  </div>
                )}
                {hasRentalItems && (
                  <>
                    <div className="flex justify-between font-medium text-gray-700 text-sm">
                      <Paragraph1>Security Deposit</Paragraph1>
                      <Paragraph1>
                        {CURRENCY}
                        {formatCurrency(listerBreakdown.collateralTotal)}
                      </Paragraph1>
                    </div>
                    <div className="flex justify-between font-medium text-gray-700 text-sm">
                      <Paragraph1>Cleaning Fees</Paragraph1>
                      <Paragraph1>
                        {CURRENCY}
                        {formatCurrency(listerBreakdown.cleaningTotal)}
                      </Paragraph1>
                    </div>
                  </>
                )}
                <div className="flex justify-between font-medium text-gray-700 text-sm">
                  <Paragraph1>Outbound Pick-up Fee</Paragraph1>
                  <Paragraph1>
                    {CURRENCY}
                    {formatCurrency(listerBreakdown.outboundPickupCost || 0)}
                  </Paragraph1>
                </div>
                {hasRentalItems && (
                  <div className="flex justify-between font-medium text-gray-700 text-sm">
                    <Paragraph1>Return Pick-up Fee</Paragraph1>
                    <Paragraph1>
                      {CURRENCY}
                      {formatCurrency(listerBreakdown.returnPickupCost || 0)}
                    </Paragraph1>
                  </div>
                )}
                <div className="flex justify-between font-medium text-gray-700 text-sm">
                  <Paragraph1>Outbound Shipping</Paragraph1>
                  <Paragraph1>
                    {CURRENCY}
                    {formatCurrency(listerBreakdown.outboundShippingCost || 0)}
                  </Paragraph1>
                </div>
                {hasRentalItems && (
                  <div className="flex justify-between font-medium text-gray-700 text-sm">
                    <Paragraph1>Return Shipping</Paragraph1>
                    <Paragraph1>
                      {CURRENCY}
                      {formatCurrency(listerBreakdown.returnShippingCost || 0)}
                    </Paragraph1>
                  </div>
                )}
              </div>
            ) : null;
          })()}

        {/* Lister Subtotal */}
        {orderSummary?.data?.listerBreakdowns &&
          (() => {
            const listerBreakdown = orderSummary.data.listerBreakdowns.find(
              (breakdown: any) => breakdown.listerId === group.listerId,
            );
            const hasResaleItems = listerBreakdown?.purchaseTotal > 0;
            const hasRentalItems = listerBreakdown?.rentalTotal > 0;

            return listerBreakdown ? (
              <div className="flex justify-between items-center pt-4">
                <Paragraph1 className="font-bold text-gray-900 text-sm">
                  Subtotal:
                </Paragraph1>
                <Paragraph1 className="font-extrabold text-gray-900 text-lg">
                  {CURRENCY}
                  {formatCurrency(
                    (hasResaleItems ? listerBreakdown.purchaseTotal : 0) +
                      (hasRentalItems ? listerBreakdown.rentalTotal : 0) +
                      (hasRentalItems ? listerBreakdown.collateralTotal : 0) +
                      (hasRentalItems ? listerBreakdown.cleaningTotal : 0) +
                      listerBreakdown.outboundPickupCost +
                      listerBreakdown.returnPickupCost +
                      listerBreakdown.outboundShippingCost +
                      listerBreakdown.returnShippingCost,
                  )}
                </Paragraph1>
              </div>
            ) : null;
          })()}
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
  dispatchSelections?: DispatchWindowSelectionMap;
  dispatchContexts?: DispatchWindowContext[];
  returnPickupAddress?: ReturnPickupAddressPayload;
}

export default function FinalOrderSummaryCard({
  listerGroups = [],
  isLoading,
  error,
  selectedShippingTier = "",
  selectedTierData,
  dispatchSelections = {},
  dispatchContexts = [],
  returnPickupAddress,
}: FinalOrderSummaryCardProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const passCartMutation = usePassCart();
  const { data: profile } = useProfile();
  const [isAgree, setIsAgree] = useState(false);

  // Use React Query for order summary - refetch when return pickup address changes
  const {
    data: orderSummary,
    isLoading: orderSummaryLoading,
    refetch,
  } = useQuery({
    queryKey: [
      "orderSummary",
      returnPickupAddress?.city,
      returnPickupAddress?.street,
    ],
    queryFn: () =>
      getOrderSummaryApi({
        returnStreet: returnPickupAddress?.street,
        returnCity: returnPickupAddress?.city,
        returnState: returnPickupAddress?.state,
        returnLandmark: returnPickupAddress?.instructions,
      }),
    staleTime: 30000,
    retry: 1,
  });

  // Refetch when return pickup address changes
  useEffect(() => {
    if (returnPickupAddress?.city && returnPickupAddress?.street) {
      refetch();
    }
  }, [returnPickupAddress?.city, returnPickupAddress?.street, refetch]);

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

  const handleCheckout = async () => {
    if (!isAgree) {
      alert("Please agree to the terms of service");
      return;
    }

    if (!selectedShippingTier) {
      alert("Please select a shipping method");
      return;
    }

    const approvedItemCount = approvedGroups.reduce(
      (n, g) => n + g.items.length,
      0,
    );
    if (approvedItemCount === 0) return;

    passCartMutation.mutate(
      {
        tierName: selectedShippingTier,
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

  return (
    <div className="space-y-6">
      {(isLoading || orderSummaryLoading) && <CheckoutSummarySkeleton />}

      {error && (
        <div className="bg-yellow-50 p-4 border border-yellow-200 rounded-xl">
          <Paragraph1 className="text-yellow-800 text-sm">
            Failed to load checkout summary. Please try again.
          </Paragraph1>
        </div>
      )}

      {orderSummary?.data?.summary?.rentalTotal > 0 && (
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
              <Paragraph1 className="text-gray-600 text-xs">
                {returnPickupAddress
                  ? `${returnPickupAddress.contactName} • ${returnPickupAddress.phoneNumber}`
                  : "Courier collects from the same location as your drop-off."}
              </Paragraph1>
              {returnPickupAddress?.instructions && (
                <Paragraph1 className="mt-1 text-gray-500 text-xs">
                  {returnPickupAddress.instructions}
                </Paragraph1>
              )}
            </div>
          </div>
        </div>
      )}

      {!isLoading && !error && approvedGroups.length === 0 && (
        <div className="bg-gray-50 p-4 border border-gray-200 rounded-xl text-center">
          <Paragraph1 className="text-gray-600">
            No approved items. Add items to get started!
          </Paragraph1>
        </div>
      )}

      {dispatchContexts.length > 0 && (
        <div className="bg-white p-4 border border-gray-200 rounded-xl">
          <Paragraph1 className="mb-4 font-bold text-gray-900 text-lg">
            Dispatch windows
          </Paragraph1>
          <div className="bg-gray-50 p-3 border border-gray-200 rounded-lg">
            <div className="space-y-3">
              {dispatchContexts
                .filter(
                  (ctx) =>
                    ctx.type === "OUTBOUND" ||
                    ctx.type === "RETURN" ||
                    ctx.type === "RESALE",
                )
                .map((ctx) => {
                  const selectedWindow =
                    dispatchSelections[ctx.type]?.window ??
                    ctx.lockedWindow ??
                    ctx.suggested.window;
                  return (
                    <div key={ctx.type}>
                      <Paragraph1 className="font-semibold text-[11px] text-gray-400 uppercase tracking-[0.2em]">
                        {ctx.type === "OUTBOUND"
                          ? "Delivery"
                          : ctx.type === "RESALE"
                            ? "Delivery"
                            : "Return pickup"}
                      </Paragraph1>
                      <Paragraph1 className="font-semibold text-gray-900 text-sm">
                        {formatWindowRange(selectedWindow)}
                      </Paragraph1>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {!isLoading && !error && approvedGroups.length > 0 && (
        <>
          {/* Use API summary data directly */}
          {(() => {
            return (
              <>
                {/* Per-Lister Summary Cards */}
                {approvedGroups.map((group) => (
                  <ListerOrderCard
                    key={group.listerId}
                    group={group}
                    orderSummary={orderSummary}
                    selectedTierData={selectedTierData}
                    approvedGroups={approvedGroups}
                  />
                ))}

                {/* Grand Total and Checkout - From Order Summary */}
                {orderSummary?.data?.summary && (
                  <div className="bg-gray-50 p-4 border border-gray-300 rounded-xl">
                    <Paragraph1 className="mb-4 font-bold text-gray-900 text-lg">
                      PAYMENT BREAKDOWN
                    </Paragraph1>

                    {/* Use API summary data with purchaseTotal */}
                    {(() => {
                      const isResaleOrder =
                        orderSummary?.data?.summary?.purchaseTotal > 0;
                      const hasRentalItems =
                        orderSummary?.data?.summary?.rentalTotal > 0;

                      return (
                        <div className="space-y-3 py-4 border-gray-200 border-b">
                          {isResaleOrder && (
                            <div className="flex justify-between font-medium text-gray-700 text-sm">
                              <Paragraph1>Purchase Amount</Paragraph1>
                              <Paragraph1>
                                {CURRENCY}
                                {formatCurrency(
                                  orderSummary.data.summary.purchaseTotal,
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
                                  orderSummary.data.summary.rentalTotal,
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
                                    orderSummary.data.summary.collateralTotal,
                                  )}
                                </Paragraph1>
                              </div>
                              <div className="flex justify-between font-medium text-gray-700 text-sm">
                                <Paragraph1>Cleaning Fees</Paragraph1>
                                <Paragraph1>
                                  {CURRENCY}
                                  {formatCurrency(
                                    orderSummary.data.summary.cleaningTotal,
                                  )}
                                </Paragraph1>
                              </div>
                            </>
                          )}
                          <div className="flex justify-between font-medium text-gray-700 text-sm">
                            <Paragraph1>Outbound Pick-up Fee</Paragraph1>
                            <Paragraph1>
                              {CURRENCY}
                              {formatCurrency(
                                orderSummary.data.summary.outboundPickupTotal ||
                                  0,
                              )}
                            </Paragraph1>
                          </div>

                          {hasRentalItems && (
                            <div className="flex justify-between font-medium text-gray-700 text-sm">
                              <Paragraph1>Return Pick-up Fee</Paragraph1>
                              <Paragraph1>
                                {CURRENCY}
                                {formatCurrency(
                                  orderSummary.data.summary.returnPickupTotal ||
                                    0,
                                )}
                              </Paragraph1>
                            </div>
                          )}

                          <div className="flex justify-between font-medium text-gray-700 text-sm">
                            <Paragraph1>Outbound Shipping</Paragraph1>
                            <Paragraph1>
                              {CURRENCY}
                              {formatCurrency(
                                orderSummary.data.summary
                                  .outboundShippingTotal || 0,
                              )}
                            </Paragraph1>
                          </div>

                          {hasRentalItems && (
                            <div className="flex justify-between font-medium text-gray-700 text-sm">
                              <Paragraph1>Return Shipping</Paragraph1>
                              <Paragraph1>
                                {CURRENCY}
                                {formatCurrency(
                                  orderSummary.data.summary
                                    .returnShippingTotal || 0,
                                )}
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
                          (orderSummary.data.summary.purchaseTotal || 0) +
                            orderSummary.data.summary.rentalTotal +
                            orderSummary.data.summary.collateralTotal +
                            orderSummary.data.summary.cleaningTotal +
                            orderSummary.data.summary.outboundPickupTotal +
                            orderSummary.data.summary.returnPickupTotal +
                            orderSummary.data.summary.outboundShippingTotal +
                            orderSummary.data.summary.returnShippingTotal +
                            (orderSummary.data.summary.serviceCharge || 0) +
                            (orderSummary.data.summary.vatAmount || 0),
                        )}
                      </Paragraph1>
                    </div>

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
                      disabled={!isAgree || passCartMutation.isPending}
                      className="flex justify-center bg-black hover:bg-gray-900 disabled:opacity-50 py-3 rounded-lg w-full font-semibold text-white transition-colors disabled:cursor-not-allowed"
                    >
                      <Paragraph1>
                        {passCartMutation.isPending
                          ? "Processing..."
                          : "Complete Order"}
                      </Paragraph1>
                    </button>

                    {orderSummary?.data?.summary?.rentalTotal > 0 && (
                      <div className="flex items-start gap-2 bg-green-50 mt-4 p-3 border border-green-200 rounded-md text-green-700 text-xs">
                        <CheckCircle size={16} className="mt-0.5 shrink-0" />
                        <Paragraph1 className="text-green-700">
                          Your <strong>deposit is secure</strong> and fully
                          refunded after item return and approval.
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
                        {isAgree && <Check size={18} className="text-white" />}
                      </span>
                      <Paragraph1 className="text-xs">
                        By confirming this order you accept our{" "}
                        <strong>Terms of Service Agreement</strong> and our{" "}
                        <strong>Data Protection Policy</strong>
                      </Paragraph1>
                    </label>
                  </div>
                )}
              </>
            );
          })()}
        </>
      )}
    </div>
  );
}
