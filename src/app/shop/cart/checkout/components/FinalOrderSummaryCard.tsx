"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Check, CheckCircle } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import { useCheckout } from "@/lib/mutations/renters/useCheckoutMutations";
import { useProfile } from "@/lib/queries/user/useProfile";
import { useRouter } from "next/navigation";
import { getOrderSummaryApi } from "@/lib/api/cart";
import { usePassCart } from "@/lib/mutations/renters/usePassCartMutation";
import { useListerProfile } from "@/lib/queries/shop/useListerProfile";
import { toast } from "sonner";

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
      <div className=" flex gap-4 items-center justify-between mb-4">
        <Paragraph1 className="text-lg font-bold text-gray-900  tracking-wide">
          ORDER SUMMARY
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

      {/* Cost Breakdown for this Lister - From Order Summary */}
      {orderSummary?.data?.listerBreakdowns &&
        (() => {
          const listerBreakdown = orderSummary.data.listerBreakdowns.find(
            (breakdown: any) => breakdown.listerId === group.listerId,
          );
          return listerBreakdown ? (
            <div className="space-y-2 py-4 border-b border-gray-200">
              <div className="flex justify-between text-sm font-medium text-gray-700">
                <Paragraph1>Rental Total</Paragraph1>
                <Paragraph1>
                  {CURRENCY}
                  {formatCurrency(listerBreakdown.rentalTotal)}
                </Paragraph1>
              </div>
              <div className="flex justify-between text-sm font-medium text-gray-700">
                <Paragraph1>Security Deposit</Paragraph1>
                <Paragraph1>
                  {CURRENCY}
                  {formatCurrency(listerBreakdown.collateralTotal)}
                </Paragraph1>
              </div>
              <div className="flex justify-between text-sm font-medium text-gray-700">
                <Paragraph1>Cleaning Fees</Paragraph1>
                <Paragraph1>
                  {CURRENCY}
                  {formatCurrency(listerBreakdown.cleaningTotal)}
                </Paragraph1>
              </div>
              <div className="flex justify-between text-sm font-medium text-gray-700">
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
          return listerBreakdown ? (
            <div className="flex justify-between items-center pt-4">
              <Paragraph1 className="text-sm font-bold text-gray-900">
                Subtotal:
              </Paragraph1>
              <Paragraph1 className="text-lg font-extrabold text-gray-900">
                {CURRENCY}
                {formatCurrency(
                  listerBreakdown.rentalTotal +
                    listerBreakdown.collateralTotal +
                    listerBreakdown.cleaningTotal +
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
  const checkoutMutation = useCheckout();
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
        console.log("Order Summary Response:", response);
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

    // Collect all request IDs from all lister groups
    const requestIds = approvedGroups.flatMap((group) =>
      group.items.map((item) => item.requestId),
    );

    if (requestIds.length === 0) return;

    // First, pass cart with selected shipping tier
    passCartMutation.mutate(selectedShippingTier, {
      onSuccess: () => {
        toast.success("Shipping method selected");

        // Then proceed with checkout
        // For now, send the first request ID - backend may need to handle multiple
        // TODO: Update backend to accept multiple requestIds for multi-lister checkout
        checkoutMutation.mutate(
          { requestId: requestIds[0] },
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
            onError: (err: any) => {
              toast.error(
                err?.message ||
                  "Failed to complete checkout. Please try again.",
              );
            },
          },
        );
      },
      onError: (err: any) => {
        toast.error(
          err?.message || "Failed to select shipping method. Please try again.",
        );
      },
    });
  };

  const testHandleCheckout = async () => {
    // If order creation failed, retry it first
    // if (orderCreationError) {
    //   onRetryOrder?.();
    //   return;
    // }

    // If verification is pending, check status first
    // if (verificationSubmittedAt && countdown > 0) {
    //   alert(
    //     `Please wait ${formatCountdown(countdown)} before checking verification status.`,
    //   );
    //   return;
    // }

    // If verification was submitted but countdown expired, check status
    // if (verificationSubmittedAt && countdown === 0) {
    //   await checkVerificationStatus();
    //   return;
    // }

    // Check if user is verified
    // if (!isVerified) {
    //   setIsVerificationModalOpen(true);
    //   return;
    // }

    // if (!isAgree) {
    //   alert("Please agree to the terms of service");
    //   return;
    // }

    // Collect all request IDs from all lister groups
    const requestIds = approvedGroups.flatMap((group) =>
      group.items.map((item) => item.requestId),
    );

    if (requestIds.length === 0) return;

    // For now, send the first request ID - backend may need to handle multiple
    // TODO: Update backend to accept multiple requestIds for multi-lister checkout
    checkoutMutation.mutate(
      { requestId: requestIds[0] },
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
    <div className="space-y-6">
      {isLoading && <CheckoutSummarySkeleton />}

      {error && (
        <div className="p-4 border border-yellow-200 rounded-xl bg-yellow-50">
          <Paragraph1 className="text-sm text-yellow-800">
            Failed to load checkout summary. Please try again.
          </Paragraph1>
        </div>
      )}

      {!isLoading && !error && approvedGroups.length === 0 && (
        <div className="p-4 border border-gray-200 rounded-xl bg-gray-50 text-center">
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
                  <div className="p-4 border border-gray-300 rounded-xl bg-gray-50">
                    <Paragraph1 className="text-lg font-bold text-gray-900 mb-4">
                      PAYMENT BREAKDOWN
                    </Paragraph1>

                    <div className="space-y-3 py-4 border-b border-gray-200">
                      <div className="flex justify-between text-sm font-medium text-gray-700">
                        <Paragraph1>Rental Total</Paragraph1>
                        <Paragraph1>
                          {CURRENCY}
                          {formatCurrency(
                            orderSummary.data.summary.rentalTotal,
                          )}
                        </Paragraph1>
                      </div>
                      <div className="flex justify-between text-sm font-medium text-gray-700">
                        <Paragraph1>Security Deposit</Paragraph1>
                        <Paragraph1>
                          {CURRENCY}
                          {formatCurrency(
                            orderSummary.data.summary.collateralTotal,
                          )}
                        </Paragraph1>
                      </div>
                      <div className="flex justify-between text-sm font-medium text-gray-700">
                        <Paragraph1>Cleaning Fees</Paragraph1>
                        <Paragraph1>
                          {CURRENCY}
                          {formatCurrency(
                            orderSummary.data.summary.cleaningTotal,
                          )}
                        </Paragraph1>
                      </div>
                      <div className="flex justify-between text-sm font-medium text-gray-700">
                        <Paragraph1>Pick-up Fee</Paragraph1>
                        <Paragraph1>
                          {CURRENCY}
                          {formatCurrency(
                            orderSummary.data.summary.pickupTotal,
                          )}
                        </Paragraph1>
                      </div>

                      <div className="flex justify-between text-sm font-medium text-gray-700">
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
                      <div className="flex justify-between text-sm font-medium text-gray-700">
                        <Paragraph1>Service Charge</Paragraph1>
                        <Paragraph1>
                          {CURRENCY}
                          {formatCurrency(
                            orderSummary.data.summary.serviceCharge || 0,
                          )}
                        </Paragraph1>
                      </div>
                      <div className="flex justify-between text-sm font-medium text-gray-700">
                        <Paragraph1>VAT</Paragraph1>
                        <Paragraph1>
                          {CURRENCY}
                          {formatCurrency(
                            orderSummary.data.summary.vatAmount || 0,
                          )}
                        </Paragraph1>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 mb-6">
                      <Paragraph1 className="text-lg font-bold text-gray-900">
                        Grand Total:
                      </Paragraph1>
                      <Paragraph1 className="text-2xl font-extrabold text-gray-900">
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

                    {checkoutMutation.isError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
                        <Paragraph1 className="text-xs text-red-700">
                          {checkoutMutation.error?.message ||
                            "Failed to complete checkout"}
                        </Paragraph1>
                      </div>
                    )}

                    <button
                      onClick={handleCheckout}
                      disabled={
                        !isAgree ||
                        checkoutMutation.isPending ||
                        passCartMutation.isPending
                      }
                      className="w-full flex justify-center bg-black text-white font-semibold py-3 rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Paragraph1>
                        {passCartMutation.isPending ||
                        checkoutMutation.isPending
                          ? "Processing..."
                          : "Complete Order"}
                      </Paragraph1>
                    </button>

                    <div className="flex items-start gap-2 p-3 mt-4 text-xs bg-green-50 text-green-700 rounded-md border border-green-200">
                      <CheckCircle size={16} className="mt-0.5 shrink-0" />
                      <Paragraph1 className="text-green-700">
                        Your <strong>deposit is secure</strong> and fully
                        refunded after item return and approval.
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

                <button
                  onClick={testHandleCheckout}
                  className="w-full flex- - hidden justify-center bg-black text-white font-semibold py-3 rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Paragraph1>Test Complete Order</Paragraph1>
                </button>
              </>
            );
          })()}
        </>
      )}
    </div>
  );
}
