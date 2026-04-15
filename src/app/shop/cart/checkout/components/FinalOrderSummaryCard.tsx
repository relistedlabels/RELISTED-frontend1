"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Check, CheckCircle } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import { useProfile } from "@/lib/queries/user/useProfile";
import { useRouter } from "next/navigation";
import { getOrderSummaryApi, orderIdsFromOrderPost } from "@/lib/api/cart";
import { usePassCart } from "@/lib/mutations/renters/usePassCartMutation";
import { useListerProfile } from "@/lib/queries/shop/useListerProfile";
import { toast } from "sonner";
import { isResaleItem } from "@/lib/listers/listerOrderRow";

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

const ListerOrderCard: React.FC<ListerSummaryCardProps> = ({
  group,
  orderSummary,
  selectedTierData,
  approvedGroups,
}) => {
  // Hook called at top level of component
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
    return Math.floor((totalShippingCost * listerItemCount) / totalItemsCount);
  };

  return (
    <div key={group.listerId} className="p-4 border border-gray-200 rounded-xl">
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
          const hasRentalItemsInGroup = group.items.some(
            (item) => !item.isResale,
          );
          const hasResaleItemsInGroup = group.items.some(
            (item) => item.isResale,
          );

          return listerBreakdown ? (
            <div className="space-y-2 py-4 border-gray-200 border-b">
              <div className="flex justify-between font-medium text-gray-700 text-sm">
                <Paragraph1>
                  {hasResaleItemsInGroup && !hasRentalItemsInGroup
                    ? "Item Total"
                    : "Rental Total"}
                </Paragraph1>
                <Paragraph1>
                  {CURRENCY}
                  {formatCurrency(listerBreakdown.rentalTotal)}
                </Paragraph1>
              </div>
              {hasRentalItemsInGroup && (
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
                <Paragraph1>Delivery Fee</Paragraph1>
                <Paragraph1>
                  {CURRENCY}
                  {formatCurrency(
                    listerBreakdown.pickupCost +
                      (selectedTierData
                        ? calculateListerShippingShare(
                            selectedTierData.totalShippingCost,
                            listerBreakdown.itemsCount || 1,
                            approvedGroups.reduce(
                              (sum, g) => sum + g.items.length,
                              0,
                            ),
                          )
                        : listerBreakdown.shippingCost),
                  )}
                </Paragraph1>
              </div>
            </div>
          ) : null;
        })()}

      {/* Lister Subtotal */}
      {orderSummary?.data?.listerBreakdowns &&
        (() => {
          const listerBreakdown = orderSummary.data.listerBreakdowns.find(
            (breakdown: any) => breakdown.listerId === group.listerId,
          );
          const hasRentalItemsInGroup = group.items.some(
            (item) => !item.isResale,
          );

          return listerBreakdown ? (
            <div className="flex justify-between items-center pt-4">
              <Paragraph1 className="font-bold text-gray-900 text-sm">
                Subtotal:
              </Paragraph1>
              <Paragraph1 className="font-extrabold text-gray-900 text-lg">
                {CURRENCY}
                {formatCurrency(
                  listerBreakdown.rentalTotal +
                    (hasRentalItemsInGroup
                      ? listerBreakdown.collateralTotal
                      : 0) +
                    (hasRentalItemsInGroup
                      ? listerBreakdown.cleaningTotal
                      : 0) +
                    listerBreakdown.pickupCost +
                    (selectedTierData
                      ? calculateListerShippingShare(
                          selectedTierData.totalShippingCost,
                          listerBreakdown.itemsCount || 1,
                          approvedGroups.reduce(
                            (sum, g) => sum + g.items.length,
                            0,
                          ),
                        )
                      : listerBreakdown.shippingCost),
                )}
              </Paragraph1>
            </div>
          ) : null;
        })()}
    </div>
  );
};

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
}

export default function FinalOrderSummaryCard({
  listerGroups = [],
  isLoading,
  error,
  selectedShippingTier = "",
  selectedTierData,
}: FinalOrderSummaryCardProps) {
  const router = useRouter();
  const passCartMutation = usePassCart();
  const { data: profile } = useProfile();
  const [isAgree, setIsAgree] = useState(false);
  const [orderSummary, setOrderSummary] = useState<any>(null);
  const [orderSummaryLoading, setOrderSummaryLoading] = useState(false);

  // Check if user is verified on mount
  useEffect(() => {
    if (profile?.bvn) {
      // User is verified, proceed with checkout
    }
  }, [profile]);

  // Fetch order summary on mount
  useEffect(() => {
    const fetchOrderSummary = async () => {
      setOrderSummaryLoading(true);
      try {
        const response = await getOrderSummaryApi();
        setOrderSummary(response);
      } catch (err) {
        console.error("Failed to fetch order summary:", err);
      } finally {
        setOrderSummaryLoading(false);
      }
    };
    fetchOrderSummary();
  }, []);

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

    passCartMutation.mutate(selectedShippingTier, {
      onSuccess: (passResponse) => {
        const ids = orderIdsFromOrderPost(passResponse);
        const id = ids[0];
        if (!id) {
          toast.error(
            "Checkout succeeded but no order id was returned. Check My Orders or refresh your cart.",
          );
          return;
        }
        toast.success(
          ids.length > 1 ? `${ids.length} orders placed` : "Order placed",
        );
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
    });
  };

  return (
    <div className="space-y-6">
      {isLoading && <CheckoutSummarySkeleton />}

      {error && (
        <div className="bg-yellow-50 p-4 border border-yellow-200 rounded-xl">
          <Paragraph1 className="text-yellow-800 text-sm">
            Failed to load checkout summary. Please try again.
          </Paragraph1>
        </div>
      )}

      {!isLoading && !error && approvedGroups.length === 0 && (
        <div className="bg-gray-50 p-4 border border-gray-200 rounded-xl text-center">
          <Paragraph1 className="text-gray-600">
            No approved items. Add items to get started!
          </Paragraph1>
        </div>
      )}

      {!isLoading && !error && approvedGroups.length > 0 && (
        <>
          {/* Calculate grand total */}
          {(() => {
            let grandSubtotal = 0;
            let grandDeliveryFees = 0;
            let grandSecurityDeposit = 0;
            let grandCleaningFees = 0;

            approvedGroups.forEach((group) => {
              group.items.forEach((item) => {
                grandSubtotal += item.rentalPrice || 0;
                grandDeliveryFees += item.deliveryFee || 0;
                grandSecurityDeposit += item.securityDeposit || 0;
                grandCleaningFees += item.cleaningFee || 0;
              });
            });

            const grandTotal =
              grandSubtotal +
              grandDeliveryFees +
              grandSecurityDeposit +
              grandCleaningFees;

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

                    {/* Check if there are any resale items */}
                    {(() => {
                      const hasResaleItems = approvedGroups.some((group) =>
                        group.items.some((item) => item.isResale),
                      );
                      const hasRentalItems = approvedGroups.some((group) =>
                        group.items.some((item) => !item.isResale),
                      );

                      return (
                        <div className="space-y-3 py-4 border-gray-200 border-b">
                          <div className="flex justify-between font-medium text-gray-700 text-sm">
                            <Paragraph1>
                              {hasResaleItems && !hasRentalItems
                                ? "Item Total"
                                : "Rental Total"}
                            </Paragraph1>
                            <Paragraph1>
                              {CURRENCY}
                              {formatCurrency(
                                orderSummary.data.summary.rentalTotal,
                              )}
                            </Paragraph1>
                          </div>
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
                            <Paragraph1>Pick-up Fee</Paragraph1>
                            <Paragraph1>
                              {CURRENCY}
                              {formatCurrency(
                                orderSummary.data.summary.pickupTotal,
                              )}
                            </Paragraph1>
                          </div>

                          <div className="flex justify-between font-medium text-gray-700 text-sm">
                            <Paragraph1>Delivery Fee</Paragraph1>
                            <Paragraph1>
                              {CURRENCY}
                              {formatCurrency(
                                selectedTierData
                                  ? selectedTierData.totalShippingCost
                                  : orderSummary.data.summary.shippingTotal,
                              )}
                            </Paragraph1>
                          </div>
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
                          orderSummary.data.summary.rentalTotal +
                            orderSummary.data.summary.collateralTotal +
                            orderSummary.data.summary.cleaningTotal +
                            orderSummary.data.summary.pickupTotal +
                            (selectedTierData
                              ? selectedTierData.totalShippingCost
                              : orderSummary.data.summary.shippingTotal) +
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

                    <div className="flex items-start gap-2 bg-green-50 mt-4 p-3 border border-green-200 rounded-md text-green-700 text-xs">
                      <CheckCircle size={16} className="mt-0.5 shrink-0" />
                      <Paragraph1 className="text-green-700">
                        Your <strong>deposit is secure</strong> and fully
                        refunded after item return and approval.
                      </Paragraph1>
                    </div>

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
