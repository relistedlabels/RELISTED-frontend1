"use client";

import { Clock, MapPin, Truck, Wallet } from "lucide-react";
import { useMemo } from "react";
import Link from "next/link";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import {
  formatShippingQuoteWarningLine,
  type OrderSummaryApiResult,
  type ShippingQuoteWarning,
  type OutboundShippingBucketQuote,
  type ReturnPickupAddressPayload,
  type ReturnShippingBucketQuote,
} from "@/lib/api/cart";
import { useMe } from "@/lib/queries/auth/useMe";
import { useWallet } from "@/lib/queries/renters/useWallet";
import { useProfile } from "@/lib/queries/user/useProfile";
import ChangeAddress from "./ChangeAddress";
import ChangeReturnPickup from "./ChangeReturnPickup";
import {
  formatDeliveryAddressLine,
  formatReturnPickupAddressLine,
} from "@/lib/checkout/deliveryAddress";
import FundWallet from "./FundWallet";
import DispatchWindowsScheduler from "./DispatchWindowsScheduler";
import type { DispatchWindowContext } from "@/lib/checkout/dispatchWindows";
import type {
  DispatchWindowSelection,
  DispatchWindowSelectionMap,
  ShipmentDispatchType,
} from "@/lib/checkout/dispatchWindows";
import { buttonPrimaryFull } from "@/common/ui/buttonClasses";
import type { CheckoutStep } from "./CheckoutStepper";
import CheckoutDispatchLegPreview, {
  CheckoutShippingLegHeader,
} from "./CheckoutDispatchLegPreview";
import CheckoutSectionHeading from "./CheckoutSectionHeading";
import CheckoutStepIntro from "./CheckoutStepIntro";
import CheckoutStepNav from "./CheckoutStepNav";

interface CheckoutContactAndPaymentProps {
  /** Same GET /order/summary payload as the sidebar (used for wallet shortfall vs checkout total). */
  orderSummary?: OrderSummaryApiResult;
  onShippingTierSelected?: (tierName: string) => void;
  shippingTiers?: Array<{
    name: string;
    totalShippingCost: number;
    grandTotal: number;
  }>;
  selectedShippingTier?: string;
  /** When present, delivery quotes are per shipment bucket (multi-lister carts). */
  outboundShippingByBucket?: OutboundShippingBucketQuote[];
  selectedOutboundTierByBucket?: Record<number, string>;
  onOutboundTierForBucket?: (bucketIndex: number, tierName: string) => void;
  /** Rental return leg (outbound-only costs per option). */
  returnShippingTiers?: Array<{
    name: string;
    totalShippingCost: number;
    grandTotal: number;
  }>;
  returnShippingByBucket?: ReturnShippingBucketQuote[];
  selectedReturnShippingTier?: string;
  selectedReturnTierByBucket?: Record<number, string>;
  onReturnShippingTierSelected?: (tierName: string) => void;
  onReturnTierForBucket?: (bucketIndex: number, tierName: string) => void;
  /** When true, show a separate return-leg carrier picker after return pickup. */
  showReturnShippingTierPicker?: boolean;
  isShippingTiersLoading?: boolean;
  dispatchContexts?: DispatchWindowContext[];
  dispatchSelections?: DispatchWindowSelectionMap;
  onDispatchSelectionChange?: (
    type: ShipmentDispatchType,
    selection: DispatchWindowSelection | undefined,
  ) => void;
  returnPickupAddress?: ReturnPickupAddressPayload;
  onReturnPickupChange?: (value?: ReturnPickupAddressPayload) => void;
  checkoutBlockingIssues?: string[];
  /** GET /order/summary failed (shown above shipping so renters know what to do). */
  orderSummaryError?: string | null;
  hasDeliveryAddress?: boolean;
  dispatchReschedules?: Array<{
    cartItemId?: string;
    productName?: string;
    outboundSummary?: string;
    priceUnchanged?: boolean;
  }>;
  /** Optional carrier quote failures (summary still loads with fallback tiers). */
  shippingQuoteWarnings?: ShippingQuoteWarning[];
  onRefetchOrderSummary?: () => void;
  /** After delivery address is saved to profile (refetch profile + order summary). */
  onAddressSaved?: () => void;
  /** Quote-based dispatch: one optional heading per shipment bucket, then rental/return rows. */
  summaryDispatchPreview?: Array<{
    bucketIndex?: number;
    groupHeading: string | null;
    listerLocation?: string;
    rows: Array<{ title: string; range: string }>;
  }>;
  /** When true, rental dispatch UI waits for per-bucket summary (no rentalItems[0] fallback). */
  multiListerRentalCart?: boolean;
  isResaleOnly?: boolean;
  checkoutStep?: CheckoutStep;
  onCheckoutStepChange?: (step: CheckoutStep) => void;
}

const CONTACT_SKELETON_KEYS = [
  "contact-1",
  "contact-2",
  "contact-3",
  "contact-4",
];
const SHIPPING_SKELETON_KEYS = ["shipping-1", "shipping-2", "shipping-3"];
const SAME_DAY_TIER_KEYWORDS = [
  "chowdeck",
  "errandlr",
  "dellyman",
  "glovo",
  "gokada",
  "go-kada",
  "via shipbubble",
];
const SAME_DAY_CUTOFF_DISCLAIMER =
  "Orders placed after 11:00am may be delivered the next day.";

const isShipbubbleShippingTierName = (tierName: string) =>
  tierName.toLowerCase().includes("via shipbubble");

const isSameDayShippingTierName = (tierName: string) => {
  const normalized = tierName.toLowerCase();
  return SAME_DAY_TIER_KEYWORDS.some((keyword) => normalized.includes(keyword));
};

const showSameDayCutoffDisclaimer = (tierName: string) =>
  isSameDayShippingTierName(tierName) && !isShipbubbleShippingTierName(tierName);

// === Skeleton Loader ===
const ContactSkeleton = () => (
  <div className="space-y-6 bg-gray-50 animate-pulse">
    {CONTACT_SKELETON_KEYS.map((key) => (
      <div key={key} className="bg-white p-4 border border-gray-100 rounded-xl">
        <div className="bg-gray-200 mb-3 rounded w-32 h-5"></div>
        <hr className="mb-3" />
        <div className="bg-gray-200 rounded w-48 h-4"></div>
      </div>
    ))}
  </div>
);

const DISPATCH_QUOTE_SKELETON_KEYS = ["dq-s1", "dq-s2"];

const DispatchWindowsQuoteSkeleton = () => (
  <div className="space-y-3 bg-linear-to-b from-neutral-50 to-neutral-50/40 p-3 sm:p-4 border border-gray-100 rounded-xl animate-pulse">
    {DISPATCH_QUOTE_SKELETON_KEYS.map((key) => (
      <div
        key={key}
        className="bg-white shadow-sm border border-gray-200/90 rounded-lg overflow-hidden"
      >
        <div className="space-y-3 px-4 sm:px-5 py-4">
          <div className="bg-gray-200 rounded-md w-36 h-4" />
          <div className="bg-gray-200 rounded-md w-full max-w-md h-5" />
          <div className="bg-gray-200 rounded-md w-full max-w-sm h-5" />
        </div>
      </div>
    ))}
  </div>
);

// === Delivery Tier Helper Function ===
const getDeliveryTierDetails = (
  tierName: string,
  tierDescription?: string,
) => {
  const normalized = tierName.toLowerCase();
  if (normalized.includes("via shipbubble")) {
    return {
      type: tierName,
      description: "Same-day courier pickup via Shipbubble",
    };
  }
  if (normalized.includes("shipbubble")) {
    return {
      type: tierName,
      description:
        tierDescription?.trim() ||
        "Verified address shipping via Shipbubble (courier pickup at sender)",
    };
  }
  if (normalized.includes("chowdeck") && normalized.includes("relay")) {
    return {
      type: tierName,
      description: "On-demand delivery via Chowdeck Relay",
    };
  }
  return {
    type: tierName,
    description: "Shipping partner",
  };
};

export default function CheckoutContactAndPayment({
  orderSummary,
  onShippingTierSelected,
  shippingTiers,
  selectedShippingTier = "",
  outboundShippingByBucket,
  selectedOutboundTierByBucket = {},
  onOutboundTierForBucket,
  returnShippingTiers,
  returnShippingByBucket,
  selectedReturnShippingTier = "",
  selectedReturnTierByBucket = {},
  onReturnShippingTierSelected,
  onReturnTierForBucket,
  showReturnShippingTierPicker = false,
  isShippingTiersLoading = false,
  dispatchContexts: dispatchContextsProp,
  dispatchSelections,
  onDispatchSelectionChange,
  returnPickupAddress,
  onReturnPickupChange,
  checkoutBlockingIssues = [],
  orderSummaryError = null,
  hasDeliveryAddress = false,
  dispatchReschedules = [],
  shippingQuoteWarnings = [],
  onRefetchOrderSummary,
  onAddressSaved,
  summaryDispatchPreview,
  multiListerRentalCart = false,
  isResaleOnly = false,
  checkoutStep = 1,
  onCheckoutStepChange,
}: CheckoutContactAndPaymentProps) {
  const dispatchContexts = dispatchContextsProp ?? [];
  const hasRentalDispatch = useMemo(
    () =>
      dispatchContexts.some(
        (c) => c.type === "OUTBOUND" || c.type === "RETURN",
      ),
    [dispatchContexts],
  );
  const hasSummaryDispatchPreview = Boolean(
    summaryDispatchPreview && summaryDispatchPreview.length > 0,
  );
  /** Avoid read-only scheduler from rentalItems[0] while GET /order/summary is still loading (multi-lister carts). */
  const showQuoteDispatchLoading =
    !isResaleOnly &&
    (hasRentalDispatch || multiListerRentalCart) &&
    isShippingTiersLoading &&
    !hasSummaryDispatchPreview &&
    !orderSummaryError;
  const { data: user } = useMe();
  const { data: profile } = useProfile();
  const { data: walletResponse } = useWallet();
  const tierList = shippingTiers ?? [];
  const returnTierList = returnShippingTiers ?? [];
  const outboundBuckets = outboundShippingByBucket ?? [];
  const usePerBucketOutbound = outboundBuckets.length > 0;
  const returnBuckets = returnShippingByBucket ?? [];
  const usePerBucketReturn = returnBuckets.length > 0;

  /** Matches grand total in FinalOrderSummaryCard (line items plus selected outbound and return shipping). */
  const checkoutGrandTotalNgN = useMemo(() => {
    const summary = orderSummary?.data?.summary;
    if (!summary) return undefined;

    const baselineOutbound = summary.outboundShippingTotal ?? 0;
    const baselineReturn = summary.returnShippingTotal ?? 0;
    const bucketsMeta = orderSummary?.data?.shipmentBuckets ?? [];

    let selectedOutboundCost = baselineOutbound;
    if (usePerBucketOutbound) {
      selectedOutboundCost = outboundBuckets.reduce((sum, b) => {
        const pick =
          selectedOutboundTierByBucket[b.bucketIndex] ??
          b.shippingTiers[0]?.name ??
          "";
        const row = b.shippingTiers.find((t) => t.name === pick);
        if (row) return sum + row.totalShippingCost;
        const fb = bucketsMeta.find((sb) => sb.bucketIndex === b.bucketIndex);
        return sum + (fb?.outboundShippingCost ?? 0);
      }, 0);
    } else {
      const outboundRow = tierList.find((t) => t.name === selectedShippingTier);
      selectedOutboundCost =
        outboundRow?.totalShippingCost ?? baselineOutbound;
    }

    let selectedReturnCost = baselineReturn;
    if (showReturnShippingTierPicker) {
      if (usePerBucketReturn) {
        selectedReturnCost = returnBuckets.reduce((sum, b) => {
          const pick =
            selectedReturnTierByBucket[b.bucketIndex] ??
            b.shippingTiers[0]?.name ??
            "";
          const row = b.shippingTiers.find((t) => t.name === pick);
          if (row) return sum + row.totalShippingCost;
          const fb = bucketsMeta.find((sb) => sb.bucketIndex === b.bucketIndex);
          return sum + (fb?.returnShippingCost ?? 0);
        }, 0);
      } else {
        const returnRow = returnTierList.find(
          (t) => t.name === selectedReturnShippingTier,
        );
        selectedReturnCost = returnRow?.totalShippingCost ?? baselineReturn;
      }
    }

    return (
      (summary.purchaseTotal ?? 0) +
      (summary.rentalTotal ?? 0) +
      (summary.collateralTotal ?? 0) +
      (summary.cleaningTotal ?? 0) +
      selectedOutboundCost +
      (showReturnShippingTierPicker ? selectedReturnCost : baselineReturn) +
      (summary.serviceCharge ?? 0) +
      (summary.vatAmount ?? 0)
    );
  }, [
    orderSummary?.data?.summary,
    orderSummary?.data?.shipmentBuckets,
    tierList,
    returnTierList,
    outboundBuckets,
    usePerBucketOutbound,
    selectedOutboundTierByBucket,
    returnBuckets,
    usePerBucketReturn,
    selectedReturnTierByBucket,
    selectedShippingTier,
    selectedReturnShippingTier,
    showReturnShippingTierPicker,
  ]);

  const deliveryPickupDefaults = useMemo<ReturnPickupAddressPayload>(
    () => ({
      contactName: user?.name ?? "",
      phoneNumber: profile?.phoneNumber ?? "",
      street: profile?.address?.street ?? "",
      city: profile?.address?.city ?? "",
      state: profile?.address?.state ?? "",
      instructions: "",
    }),
    [
      user?.name,
      profile?.phoneNumber,
      profile?.address?.street,
      profile?.address?.city,
      profile?.address?.state,
    ],
  );

  const handleShippingTierChange = (tierName: string) => {
    onShippingTierSelected?.(tierName);
  };

  const handleReturnShippingTierChange = (tierName: string) => {
    onReturnShippingTierSelected?.(tierName);
  };

  const isRelistedDispatchTierName = (tierName: string) =>
    tierName.trim().toLowerCase().includes("relisted dispatch");

  const renderOutboundTierRadios = (
    tiers: Array<{
      name: string;
      totalShippingCost: number;
      grandTotal: number;
      description?: string;
    }>,
    selectedName: string,
    radioGroupName: string,
    onPick: (name: string) => void,
  ) => {
    const hasThirdPartyTier = tiers.some(
      (tier) => !isRelistedDispatchTierName(tier.name),
    );
    return [...tiers]
      .filter((tier) => {
        if (hasThirdPartyTier && isRelistedDispatchTierName(tier.name)) {
          return false;
        }
        // Keep Shipbubble tiers (e.g. "Bubble Express (via Shipbubble)") even when the
        // courier name contains "express"; only hide legacy DHL/international express rows.
        if (isShipbubbleShippingTierName(tier.name)) {
          return true;
        }
        const normalized = tier.name.toLowerCase();
        const isLegacyExpressOption =
          normalized.includes("dhl") || normalized.includes("express");
        return !isLegacyExpressOption;
      })
      .map((tier) => {
        const tierDetails = getDeliveryTierDetails(tier.name, tier.description);
        const isSameDay = isSameDayShippingTierName(tier.name);
        const isSelected = selectedName === tier.name;
        return (
          <label
            key={`${radioGroupName}-${tier.name}`}
            className={`group relative block rounded-2xl border-2 p-4 transition-all duration-200 cursor-pointer ${
              isSelected
                ? "border-gray-900 shadow-xl shadow-gray-900/10"
                : "border-gray-200 hover:border-gray-400"
            }`}
          >
            <input
              type="radio"
              name={radioGroupName}
              value={tier.name}
              checked={isSelected}
              onChange={() => onPick(tier.name)}
              className="hidden"
            />
            <div className="flex items-start gap-4">
              <div
                className={`rounded-full p-3 ${
                  isSelected
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                <Truck size={18} />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Paragraph1 className="font-semibold text-gray-900">
                    {tierDetails.type}
                  </Paragraph1>
                  {isSameDay && (
                    <span className="bg-amber-100 px-2 py-0.5 rounded-full font-semibold text-[11px] text-amber-700">
                      Same-day
                    </span>
                  )}
                </div>
                {showSameDayCutoffDisclaimer(tier.name) && (
                  <Paragraph1 className="mt-2 text-amber-700 text-xs">
                    {SAME_DAY_CUTOFF_DISCLAIMER}
                  </Paragraph1>
                )}
              </div>
              <div className="text-right">
                <Paragraph1 className="text-gray-500 text-xs">Shipping</Paragraph1>
                <Paragraph1 className="font-bold text-gray-900 text-lg">
                  ₦{formatCurrency(tier.totalShippingCost)}
                </Paragraph1>
              </div>
            </div>
          </label>
        );
      });
  };

  const orderReviewLegs = useMemo(() => {
    type ReviewLeg = {
      id: string;
      title: string;
      address: string;
      windows: string[];
      shipping: Array<{ method: string; cost?: number }>;
    };

    const deliveryAddressLine =
      formatDeliveryAddressLine(profile?.address) ?? "No address set";
    const returnPickupAddressLine =
      formatReturnPickupAddressLine(returnPickupAddress ?? {}) ??
      deliveryAddressLine;

    const deliveryWindows: string[] = [];
    const returnWindows: string[] = [];
    for (const group of summaryDispatchPreview ?? []) {
      for (const row of group.rows) {
        if (row.title.toLowerCase().includes("return pickup")) {
          returnWindows.push(row.range);
        } else {
          deliveryWindows.push(row.range);
        }
      }
    }

    const deliveryShipping: Array<{ method: string; cost?: number }> = [];
    const returnShipping: Array<{ method: string; cost?: number }> = [];

    if (usePerBucketOutbound) {
      for (const bucket of outboundBuckets) {
        const pick =
          selectedOutboundTierByBucket[bucket.bucketIndex] ??
          bucket.shippingTiers[0]?.name ??
          "";
        const row = bucket.shippingTiers.find((tier) => tier.name === pick);
        if (pick) {
          deliveryShipping.push({
            method: pick,
            cost: row?.totalShippingCost,
          });
        }
      }
    } else {
      const pick = selectedShippingTier || tierList[0]?.name || "";
      const row = tierList.find((tier) => tier.name === pick);
      if (pick) {
        deliveryShipping.push({ method: pick, cost: row?.totalShippingCost });
      }
    }

    if (showReturnShippingTierPicker) {
      if (usePerBucketReturn) {
        for (const bucket of returnBuckets) {
          const pick =
            selectedReturnTierByBucket[bucket.bucketIndex] ??
            bucket.shippingTiers[0]?.name ??
            "";
          const row = bucket.shippingTiers.find((tier) => tier.name === pick);
          if (pick) {
            returnShipping.push({
              method: pick,
              cost: row?.totalShippingCost,
            });
          }
        }
      } else {
        const pick =
          selectedReturnShippingTier || returnTierList[0]?.name || "";
        const row = returnTierList.find((tier) => tier.name === pick);
        if (pick) {
          returnShipping.push({ method: pick, cost: row?.totalShippingCost });
        }
      }
    }

    const legs: ReviewLeg[] = [
      {
        id: "delivery",
        title: "Delivery to you",
        address: deliveryAddressLine,
        windows: deliveryWindows,
        shipping: deliveryShipping,
      },
    ];

    if (!isResaleOnly) {
      legs.push({
        id: "return",
        title: "Return from you",
        address: returnPickupAddressLine,
        windows: returnWindows,
        shipping: returnShipping,
      });
    }

    return legs;
  }, [
    profile?.address,
    returnPickupAddress,
    summaryDispatchPreview,
    usePerBucketOutbound,
    outboundBuckets,
    selectedOutboundTierByBucket,
    selectedShippingTier,
    tierList,
    showReturnShippingTierPicker,
    usePerBucketReturn,
    returnBuckets,
    selectedReturnTierByBucket,
    selectedReturnShippingTier,
    returnTierList,
    isResaleOnly,
  ]);

  if (!user) return <ContactSkeleton />;

  const deliveryAddress =
    formatDeliveryAddressLine(profile?.address) ?? "No address set";
  const returnPickupAddressLine =
    formatReturnPickupAddressLine(returnPickupAddress ?? {}) ??
    deliveryAddress;

  const walletData = walletResponse?.wallet?.balance;
  const availableBalance = walletData?.availableBalance || 0;
  const isWalletFunded = availableBalance > 0;

  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString("en-NG");
  };

  const walletTopUpNgN =
    checkoutGrandTotalNgN !== undefined
      ? Math.max(0, Math.round(checkoutGrandTotalNgN - availableBalance))
      : undefined;

  const walletCoversOrder =
    checkoutGrandTotalNgN !== undefined &&
    walletTopUpNgN !== undefined &&
    walletTopUpNgN <= 0;

  return (
    <div className="space-y-6 bg-gray-50">
      {checkoutStep === 1 ? (
        <>
          <CheckoutStepIntro
            title={isResaleOnly ? "Delivery address" : "Delivery and return"}
            subtitle={
              isResaleOnly
                ? "Add where we should deliver your order."
                : "Where we deliver your rental, and where we pick it up when you're done."
            }
          />

          <div className="space-y-4 bg-white p-5 border border-gray-100 rounded-xl">
            <CheckoutSectionHeading>Deliver to you</CheckoutSectionHeading>

            {hasDeliveryAddress ? (
              <ChangeAddress
                addressLine={deliveryAddress}
                buttonLabel="Change"
                variant="row"
                onAddressSaved={onAddressSaved ?? onRefetchOrderSummary}
              />
            ) : (
              <div className="space-y-4 bg-gray-50 p-6 rounded-xl text-center">
                <MapPin
                  size={28}
                  className="mx-auto text-gray-400"
                  aria-hidden
                />
                <Paragraph1 className="text-gray-700 text-sm">
                  Add where we should deliver your order.
                </Paragraph1>
                <ChangeAddress
                  buttonLabel="Add address"
                  panelTitle="Add delivery address"
                  variant="outline"
                  onAddressSaved={onAddressSaved ?? onRefetchOrderSummary}
                />
              </div>
            )}
          </div>

          {!isResaleOnly ? (
            <div className="space-y-4 bg-white p-5 border border-gray-100 rounded-xl">
              <CheckoutSectionHeading>Pickup from you</CheckoutSectionHeading>

              <ChangeReturnPickup
                addressLine={returnPickupAddressLine}
                returnPickupAddress={returnPickupAddress}
                deliveryDefaults={deliveryPickupDefaults}
                onReturnPickupChange={onReturnPickupChange}
                buttonLabel="Change"
                variant="row"
              />
            </div>
          ) : null}

          <CheckoutStepNav
            onContinue={
              onCheckoutStepChange
                ? () => onCheckoutStepChange(2)
                : undefined
            }
            continueLabel="Continue to shipping"
            continueDisabled={!hasDeliveryAddress}
            checkoutGrandTotalNgN={checkoutGrandTotalNgN}
          />
        </>
      ) : null}

      {checkoutStep === 2 ? (
        <>
          <CheckoutStepIntro
            title="Shipping and schedule"
            subtitle="Pick carriers and delivery times."
          />

          {!hasDeliveryAddress ? (
            <div className="bg-amber-50 p-4 border border-amber-200 rounded-xl">
              <Paragraph1 className="text-amber-900 text-sm leading-relaxed">
                Add a delivery address first, then come back to this step.
              </Paragraph1>
            </div>
          ) : null}

          {hasDeliveryAddress && shippingQuoteWarnings.length > 0 ? (
            <div className="space-y-2 bg-amber-50 p-4 border border-amber-200 rounded-xl">
              <Paragraph1 className="font-semibold text-amber-950 text-sm">
                Some shipping options are unavailable
              </Paragraph1>
              <ul className="space-y-1.5 list-disc pl-5 text-amber-900 text-sm">
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

          {hasDeliveryAddress && dispatchReschedules.length > 0 ? (
            <div className="space-y-2 bg-amber-50 p-4 border border-amber-200 rounded-xl">
              {dispatchReschedules.map((entry) => (
                <Paragraph1
                  key={
                    entry.cartItemId ?? entry.productName ?? entry.outboundSummary
                  }
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

          {hasDeliveryAddress ? (
            <>
      {/* DELIVERY / OUTBOUND SHIPPING */}
      <div className="bg-white p-4 border border-gray-100 rounded-xl">
        {usePerBucketOutbound && outboundBuckets.length > 1 ? (
          <CheckoutShippingLegHeader
            sectionLabel={
              showReturnShippingTierPicker ? "DELIVERY SHIPPING" : "SHIPPING METHOD"
            }
            leg="outbound"
          />
        ) : (
          <CheckoutShippingLegHeader
            sectionLabel={
              showReturnShippingTierPicker ? "DELIVERY SHIPPING" : "SHIPPING METHOD"
            }
            groups={
              hasSummaryDispatchPreview ? summaryDispatchPreview : undefined
            }
            bucketIndex={
              usePerBucketOutbound
                ? outboundBuckets[0]?.bucketIndex
                : undefined
            }
            leg="outbound"
          />
        )}

        <hr className="my-4 text-gray-100" />

        {isShippingTiersLoading ? (
          <div className="space-y-3">
            {SHIPPING_SKELETON_KEYS.map((key) => (
              <div
                key={key}
                className="bg-gray-200 rounded-2xl h-20 animate-pulse"
              ></div>
            ))}
          </div>
        ) : usePerBucketOutbound ? (
          <div className="space-y-8">
            {showQuoteDispatchLoading && !hasSummaryDispatchPreview ? (
              <div className="mb-4 pb-4 border-gray-100 border-b">
                <DispatchWindowsQuoteSkeleton />
              </div>
            ) : null}
            {outboundBuckets.map((bucket) => {
              const selectedName =
                selectedOutboundTierByBucket[bucket.bucketIndex] ??
                bucket.shippingTiers[0]?.name ??
                "";
              return (
                <div key={bucket.bucketIndex} className="space-y-3">
                  {outboundBuckets.length > 1 && hasSummaryDispatchPreview ? (
                    <CheckoutDispatchLegPreview
                      groups={summaryDispatchPreview}
                      bucketIndex={bucket.bucketIndex}
                      leg="outbound"
                    />
                  ) : null}
                  {bucket.shippingTiers.length > 0 ? (
                    <div className="space-y-3">
                      {renderOutboundTierRadios(
                        bucket.shippingTiers,
                        selectedName,
                        `outboundBucket-${bucket.bucketIndex}`,
                        (name) =>
                          onOutboundTierForBucket?.(bucket.bucketIndex, name),
                      )}
                    </div>
                  ) : (
                    <Paragraph1 className="text-gray-600 text-sm">
                      No shipping methods for this order segment.
                    </Paragraph1>
                  )}
                </div>
              );
            })}
          </div>
        ) : tierList.length > 0 ? (
          <div className="space-y-3">
            {!hasSummaryDispatchPreview &&
            (dispatchContexts.length > 0 || multiListerRentalCart) ? (
              <div className="mb-4 pb-4 border-gray-100 border-b">
                {showQuoteDispatchLoading ? (
                  <DispatchWindowsQuoteSkeleton />
                ) : (
                  <DispatchWindowsScheduler
                    contexts={dispatchContexts}
                    selections={dispatchSelections || {}}
                    onSelectionChange={onDispatchSelectionChange}
                    readOnly={true}
                  />
                )}
              </div>
            ) : null}
            {renderOutboundTierRadios(
              tierList,
              selectedShippingTier,
              "outboundShippingTierLegacy",
              handleShippingTierChange,
            )}
          </div>
        ) : (
          <Paragraph1 className="text-gray-600 text-sm">
            No shipping methods available
          </Paragraph1>
        )}
      </div>

      {showReturnShippingTierPicker && (
        <div className="bg-white p-4 border border-gray-100 rounded-xl">
          {usePerBucketReturn && returnBuckets.length > 1 ? (
            <CheckoutShippingLegHeader sectionLabel="RETURN SHIPPING" leg="return" />
          ) : (
            <CheckoutShippingLegHeader
              sectionLabel="RETURN SHIPPING"
              groups={
                hasSummaryDispatchPreview ? summaryDispatchPreview : undefined
              }
              bucketIndex={
                usePerBucketReturn ? returnBuckets[0]?.bucketIndex : undefined
              }
              leg="return"
            />
          )}
          <hr className="my-4 text-gray-100" />
          {isShippingTiersLoading &&
          (usePerBucketReturn
            ? returnBuckets.length === 0
            : returnTierList.length === 0) ? (
            <div className="space-y-3">
              {SHIPPING_SKELETON_KEYS.map((key) => (
                <div
                  key={`ret-${key}`}
                  className="bg-gray-200 rounded-2xl h-20 animate-pulse"
                />
              ))}
            </div>
          ) : usePerBucketReturn ? (
            <div className="space-y-8">
              {returnBuckets.map((bucket) => {
                const selectedName =
                  selectedReturnTierByBucket[bucket.bucketIndex] ??
                  bucket.shippingTiers[0]?.name ??
                  "";
                return (
                  <div key={bucket.bucketIndex} className="space-y-3">
                    {returnBuckets.length > 1 && hasSummaryDispatchPreview ? (
                      <CheckoutDispatchLegPreview
                        groups={summaryDispatchPreview}
                        bucketIndex={bucket.bucketIndex}
                        leg="return"
                      />
                    ) : null}
                    {bucket.shippingTiers.length > 0 ? (
                      <div className="space-y-3">
                        {renderOutboundTierRadios(
                          bucket.shippingTiers,
                          selectedName,
                          `returnBucket-${bucket.bucketIndex}`,
                          (name) =>
                            onReturnTierForBucket?.(bucket.bucketIndex, name),
                        )}
                      </div>
                    ) : (
                      <Paragraph1 className="text-gray-600 text-sm">
                        No return shipping methods for this segment.
                      </Paragraph1>
                    )}
                  </div>
                );
              })}
            </div>
          ) : returnTierList.length > 0 ? (
            <div className="space-y-3">
              {renderOutboundTierRadios(
                returnTierList,
                selectedReturnShippingTier,
                "returnShippingTier",
                handleReturnShippingTierChange,
              )}
            </div>
          ) : (
            <Paragraph1 className="text-gray-600 text-sm">
              No return shipping methods available for this pickup address.
            </Paragraph1>
          )}
        </div>
      )}

      {checkoutBlockingIssues.length > 0 ? (
        <div className="bg-amber-50 p-4 border border-amber-200 rounded-xl">
          <Paragraph1 className="font-semibold text-amber-950 text-sm">
            Before you pay
          </Paragraph1>
          <div className="space-y-1 mt-2">
            {checkoutBlockingIssues.map((issue) => (
              <Paragraph1 key={issue} className="text-amber-900 text-sm">
                {issue}
              </Paragraph1>
            ))}
          </div>
        </div>
      ) : null}

        </>
          ) : null}

          <CheckoutStepNav
            onBack={
              onCheckoutStepChange ? () => onCheckoutStepChange(1) : undefined
            }
            onContinue={
              onCheckoutStepChange ? () => onCheckoutStepChange(3) : undefined
            }
            continueLabel="Continue to payment"
            continueDisabled={!hasDeliveryAddress}
            checkoutGrandTotalNgN={checkoutGrandTotalNgN}
          />
        </>
      ) : null}

      {checkoutStep === 3 ? (
        <>
          <CheckoutStepIntro title="Pay with your wallet" />

          {!hasDeliveryAddress ? (
            <div className="bg-amber-50 p-4 border border-amber-200 rounded-xl">
              <Paragraph1 className="text-amber-900 text-sm leading-relaxed">
                Add a delivery address first, then come back to this step.
              </Paragraph1>
            </div>
          ) : null}

          {hasDeliveryAddress ? (
            <div className="bg-white p-4 border border-gray-100 rounded-xl">
              <Paragraph1 className="mb-4 font-bold text-gray-800 tracking-wider">
                WALLET
              </Paragraph1>
              <hr className="mb-3 text-gray-300" />
              <div className="flex justify-between items-start gap-4">
                <div className="flex flex-1 items-start gap-3">
                  <Wallet size={30} className="mt-0.5 text-gray-700 shrink-0" />
                  <div className="space-y-2">
                    <Paragraph1 className="text-gray-600 text-xs">
                      Available balance
                    </Paragraph1>
                    <Paragraph3
                      className={`font-bold ${
                        isWalletFunded ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      ₦{formatCurrency(availableBalance)}
                    </Paragraph3>
                    {walletTopUpNgN !== undefined && walletTopUpNgN > 0 ? (
                      <Paragraph1 className="mt-2 max-w-56 sm:max-w-none text-green-700 text-xs leading-relaxed">
                        Fund your wallet with ₦{formatCurrency(walletTopUpNgN)}{" "}
                        to complete your order.
                      </Paragraph1>
                    ) : null}
                  </div>
                </div>
                <FundWallet />
              </div>
            </div>
          ) : null}

          <CheckoutStepNav
            onBack={
              onCheckoutStepChange ? () => onCheckoutStepChange(2) : undefined
            }
            onContinue={
              onCheckoutStepChange ? () => onCheckoutStepChange(4) : undefined
            }
            continueLabel="Review order"
            continueDisabled={!hasDeliveryAddress || !walletCoversOrder}
            checkoutGrandTotalNgN={checkoutGrandTotalNgN}
          />
        </>
      ) : null}

      {checkoutStep === 4 ? (
        <>
          <CheckoutStepIntro
            title="Review your order"
            subtitle="Check the details below, then complete your order in the summary."
          />

          <div className="space-y-4 bg-white p-5 border border-gray-100 rounded-xl">
            <CheckoutSectionHeading>Order details</CheckoutSectionHeading>

            <div className="space-y-4">
              {orderReviewLegs.map((leg) => (
                <div
                  key={leg.id}
                  className="space-y-4 bg-gray-50 p-4 sm:p-5 border border-gray-100 rounded-xl"
                >
                  <h4 className="font-semibold text-gray-900 text-[15px] leading-snug">
                    {leg.title}
                  </h4>

                  <div className="flex items-start gap-3.5">
                    <MapPin
                      className="mt-1 size-4 text-gray-400 shrink-0"
                      aria-hidden
                    />
                    <div className="min-w-0 space-y-1">
                      <Paragraph1 className="font-medium text-gray-500 text-xs">
                        Address
                      </Paragraph1>
                      <Paragraph1 className="text-gray-900 text-[15px] leading-relaxed">
                        {leg.address}
                      </Paragraph1>
                    </div>
                  </div>

                  {leg.windows.map((windowRange, index) => (
                    <div
                      key={`${leg.id}-window-${index}`}
                      className="flex items-start gap-3.5"
                    >
                      <Clock
                        className="mt-1 size-4 text-gray-400 shrink-0"
                        aria-hidden
                      />
                      <div className="min-w-0 space-y-1">
                        <Paragraph1 className="font-medium text-gray-500 text-xs">
                          Time window
                        </Paragraph1>
                        <Paragraph1 className="text-gray-900 text-[15px] leading-relaxed">
                          {windowRange}
                        </Paragraph1>
                      </div>
                    </div>
                  ))}

                  {leg.shipping.map((ship, index) => (
                    <div
                      key={`${leg.id}-ship-${index}`}
                      className="flex justify-between items-start gap-4"
                    >
                      <div className="flex items-start gap-3.5 min-w-0">
                        <Truck
                          className="mt-1 size-4 text-gray-400 shrink-0"
                          aria-hidden
                        />
                        <div className="min-w-0 space-y-1">
                          <Paragraph1 className="font-medium text-gray-500 text-xs">
                            Shipping
                          </Paragraph1>
                          <Paragraph1 className="text-gray-900 text-[15px] leading-relaxed">
                            {ship.method}
                          </Paragraph1>
                        </div>
                      </div>
                      {ship.cost !== undefined ? (
                        <Paragraph1 className="font-semibold text-gray-900 text-[15px] shrink-0">
                          ₦{formatCurrency(ship.cost)}
                        </Paragraph1>
                      ) : null}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <CheckoutStepNav
            onBack={
              onCheckoutStepChange ? () => onCheckoutStepChange(3) : undefined
            }
            backLabel="Back to payment"
            showMobileSticky={false}
          />
        </>
      ) : null}
    </div>
  );
}
