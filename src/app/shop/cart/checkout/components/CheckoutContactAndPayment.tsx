"use client";

import { Loader2, Truck } from "lucide-react";
import { useMemo } from "react";
import Link from "next/link";
import { Paragraph1 } from "@/common/ui/Text";
import {
  formatShippingQuoteWarningLine,
  type OrderSummaryApiResult,
  type ShippingQuoteWarning,
  type OutboundShippingBucketQuote,
  type ReturnPickupAddressPayload,
  type ReturnShippingBucketQuote,
} from "@/lib/api/cart";
import { useMe } from "@/lib/queries/auth/useMe";
import { useProfile } from "@/lib/queries/user/useProfile";
import CheckoutDeliveryContact, {
  CheckoutDeliveryContactEmpty,
} from "./CheckoutDeliveryContact";
import {
  formatPhoneDisplayLine,
  profileHasPhone,
  profilePhoneNeedsUpdate,
  resolveProfilePhone,
} from "@/lib/checkout/profilePhone";
import { useProfileDetails } from "@/lib/queries/renters/useProfileDetails";
import CheckoutReturnPickupContact from "./CheckoutReturnPickupContact";
import {
  formatDeliveryAddressLine,
  formatReturnPickupAddressLine,
} from "@/lib/checkout/deliveryAddress";
import type { DispatchWindowContext } from "@/lib/checkout/dispatchWindows";
import {
  formatWindowRange,
  type DispatchWindowSelection,
  type DispatchWindowSelectionMap,
  type ShipmentDispatchType,
} from "@/lib/checkout/dispatchWindows";
import type { CheckoutReviewDeliveryShipment } from "@/lib/checkout/checkoutFlow";
import {
  CheckoutLabeledBlock,
  CheckoutReadonlyDetail,
} from "./CheckoutFieldLabel";
import { buttonPrimaryFull } from "@/common/ui/buttonClasses";
import type { CheckoutStep } from "./CheckoutStepper";
import { CheckoutShippingLegHeader } from "./CheckoutDispatchLegPreview";
import CheckoutSectionHeading from "./CheckoutSectionHeading";
import CheckoutStepIntro from "./CheckoutStepIntro";
import CheckoutStepNav, {
  checkoutStepContinueLabel,
} from "./CheckoutStepNav";
import {
  buildCheckoutStickySummaryLines,
  computeDisplayOutboundShipping,
  computeDisplayReturnShipping,
} from "@/lib/checkout/checkoutSummaryTotals";
import {
  buildCheckoutReviewDelivery,
  buildCheckoutReviewReturn,
  type CheckoutDispatchPreviewGroup,
} from "@/lib/checkout/checkoutFlow";
import CheckoutShipmentBlock from "./CheckoutShipmentBlock";
import { type CheckoutListerGroup } from "./CheckoutOrderItems";

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
  summaryDispatchPreview?: CheckoutDispatchPreviewGroup[];
  /** When true, rental dispatch UI waits for per-bucket summary (no rentalItems[0] fallback). */
  multiListerRentalCart?: boolean;
  isResaleOnly?: boolean;
  listerGroups?: CheckoutListerGroup[];
  checkoutStep?: CheckoutStep;
  onCheckoutStepChange?: (step: CheckoutStep) => void;
}

const CONTACT_SKELETON_KEYS = [
  "contact-1",
  "contact-2",
  "contact-3",
  "contact-4",
];
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

function resolveOutboundDeliveryWindowText(
  shipment: CheckoutReviewDeliveryShipment | undefined,
  dispatchContexts: DispatchWindowContext[],
  dispatchSelections: DispatchWindowSelectionMap,
): string | undefined {
  if (shipment?.deliveryWindow?.trim()) return shipment.deliveryWindow.trim();

  const context =
    dispatchContexts.find((c) => c.type === "OUTBOUND") ??
    dispatchContexts.find((c) => c.type === "RESALE");
  if (!context) return undefined;

  const selection = dispatchSelections[context.type];
  if (selection?.window) return formatWindowRange(selection.window);
  if (context.suggested?.window) {
    return formatWindowRange(context.suggested.window);
  }
  return undefined;
}

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

function FetchingDeliveryOptions({ label }: { label: string }) {
  return (
    <div
      className="flex items-center gap-3 py-6 text-gray-600"
      role="status"
      aria-live="polite"
    >
      <Loader2 className="h-5 w-5 animate-spin shrink-0" aria-hidden />
      <Paragraph1 className="text-gray-600 text-sm">{label}</Paragraph1>
    </div>
  );
}

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
        "Verified address delivery via Shipbubble (courier pickup at sender)",
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
    description: "Delivery partner",
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
  listerGroups = [],
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
  const { data: renterProfileDetails } = useProfileDetails();
  const resolvedProfilePhone = resolveProfilePhone(
    profile,
    renterProfileDetails?.profile,
  );
  const tierList = shippingTiers ?? [];
  const returnTierList = returnShippingTiers ?? [];
  const outboundBuckets = outboundShippingByBucket ?? [];
  const usePerBucketOutbound = outboundBuckets.length > 0;
  const returnBuckets = returnShippingByBucket ?? [];
  const usePerBucketReturn = returnBuckets.length > 0;

  const checkoutItemCount = useMemo(
    () => listerGroups.reduce((count, group) => count + group.items.length, 0),
    [listerGroups],
  );

  const shipmentBucketsMeta = orderSummary?.data?.shipmentBuckets ?? [];

  const displayOutboundShipping = useMemo(
    () =>
      computeDisplayOutboundShipping({
        usePerBucket: usePerBucketOutbound,
        outboundShippingByBucket: outboundBuckets,
        selectedOutboundTierByBucket,
        shipmentBucketsMeta,
        selectedTierTotal: tierList.find((t) => t.name === selectedShippingTier)
          ?.totalShippingCost,
        summaryOutboundTotal: orderSummary?.data?.summary?.outboundShippingTotal ?? 0,
      }),
    [
      usePerBucketOutbound,
      outboundBuckets,
      selectedOutboundTierByBucket,
      shipmentBucketsMeta,
      tierList,
      selectedShippingTier,
      orderSummary?.data?.summary?.outboundShippingTotal,
    ],
  );

  const displayReturnShipping = useMemo(
    () =>
      computeDisplayReturnShipping({
        hasReturnShippingLeg: showReturnShippingTierPicker,
        usePerBucketReturn,
        returnShippingByBucket: returnBuckets,
        selectedReturnTierByBucket,
        shipmentBucketsMeta,
        selectedReturnTierTotal: returnTierList.find(
          (t) => t.name === selectedReturnShippingTier,
        )?.totalShippingCost,
        summaryReturnTotal: orderSummary?.data?.summary?.returnShippingTotal ?? 0,
      }),
    [
      showReturnShippingTierPicker,
      usePerBucketReturn,
      returnBuckets,
      selectedReturnTierByBucket,
      shipmentBucketsMeta,
      returnTierList,
      selectedReturnShippingTier,
      orderSummary?.data?.summary?.returnShippingTotal,
    ],
  );

  const stickySummaryLines = useMemo(() => {
    const summary = orderSummary?.data?.summary;
    if (!summary) return undefined;
    return buildCheckoutStickySummaryLines({
      summary,
      displayOutboundShipping,
      displayReturnShipping,
      hasReturnShippingLeg: showReturnShippingTierPicker,
    });
  }, [
    orderSummary?.data?.summary,
    displayOutboundShipping,
    displayReturnShipping,
    showReturnShippingTierPicker,
  ]);

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
      phoneNumber: resolvedProfilePhone ?? "",
      street: profile?.address?.street ?? "",
      city: profile?.address?.city ?? "",
      state: profile?.address?.state ?? "",
      instructions: "",
    }),
    [
      user?.name,
      resolvedProfilePhone,
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
                <Paragraph1 className="text-gray-500 text-xs">Delivery</Paragraph1>
                <Paragraph1 className="font-bold text-gray-900 text-lg">
                  ₦{formatCurrency(tier.totalShippingCost)}
                </Paragraph1>
              </div>
            </div>
          </label>
        );
      });
  };

  const orderReviewDelivery = useMemo(() => {
    const deliveryAddressLine =
      formatDeliveryAddressLine(profile?.address) ?? "No address set";

    return buildCheckoutReviewDelivery({
      deliveryAddressLine,
      listerGroups,
      summaryDispatchPreview,
      usePerBucketOutbound,
      outboundBuckets,
      selectedOutboundTierByBucket,
      selectedShippingTier,
      tierList,
    });
  }, [
    profile?.address,
    listerGroups,
    summaryDispatchPreview,
    usePerBucketOutbound,
    outboundBuckets,
    selectedOutboundTierByBucket,
    selectedShippingTier,
    tierList,
  ]);

  const orderReviewReturn = useMemo(() => {
    if (!showReturnShippingTierPicker) return null;

    const returnPickupAddressLine =
      formatReturnPickupAddressLine(returnPickupAddress ?? {}) ??
      formatDeliveryAddressLine(profile?.address) ??
      "No address set";

    return buildCheckoutReviewReturn({
      returnPickupAddressLine,
      listerGroups,
      summaryDispatchPreview,
      usePerBucketReturn,
      returnBuckets,
      selectedReturnTierByBucket,
      selectedReturnShippingTier,
      returnTierList,
    });
  }, [
    showReturnShippingTierPicker,
    returnPickupAddress,
    profile?.address,
    listerGroups,
    summaryDispatchPreview,
    usePerBucketReturn,
    returnBuckets,
    selectedReturnTierByBucket,
    selectedReturnShippingTier,
    returnTierList,
  ]);

  if (!user) return <ContactSkeleton />;

  const deliveryAddress =
    formatDeliveryAddressLine(profile?.address) ?? "No address set";
  const phoneLine = formatPhoneDisplayLine(
    profile,
    renterProfileDetails?.profile,
  );
  const hasPhone = profileHasPhone(profile, renterProfileDetails?.profile);
  const phoneNeedsUpdate = profilePhoneNeedsUpdate(
    profile,
    renterProfileDetails?.profile,
  );
  const returnPickupAddressLine =
    formatReturnPickupAddressLine(returnPickupAddress ?? {}) ??
    deliveryAddress;

  const stickyNavProps = {
    checkoutGrandTotalNgN,
    itemCount: checkoutItemCount,
    summaryLines: stickySummaryLines,
    summaryLoading: isShippingTiersLoading && checkoutGrandTotalNgN === undefined,
  };

  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString("en-NG");
  };

  return (
    <div className="space-y-6 bg-gray-50">
      {checkoutStep === 1 ? (
        <>
          <CheckoutStepIntro
            title={isResaleOnly ? "Delivery" : "Delivery and return"}
            subtitle={
              isResaleOnly
                ? "Add your address and pick a delivery option."
                : "Set your addresses, then pick your delivery options."
            }
          />

          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
            <div className="p-4 sm:p-5">
              <CheckoutShippingLegHeader
                sectionLabel={
                  showReturnShippingTierPicker ? "DELIVERY" : "DELIVERY METHOD"
                }
                leg="outbound"
              />

              <hr className="my-4 text-gray-100" />

              {hasDeliveryAddress ? (
                <>
                  {orderReviewDelivery.shipments.length > 0 ? (
                    <div className="bg-gray-50/50 mb-4 p-3 sm:p-3.5 border border-gray-200 rounded-lg">
                      {orderReviewDelivery.shipments.map((shipment, index) => (
                        <CheckoutShipmentBlock
                          key={shipment.bucketIndex ?? `delivery-item-${index}`}
                          shipment={shipment}
                          showDivider={index > 0}
                          showWindows={false}
                          prominentItems
                        />
                      ))}
                    </div>
                  ) : null}

                  <CheckoutDeliveryContact
                    contactName={user?.name}
                    deliveryAddress={deliveryAddress}
                    phoneLine={phoneLine}
                    onContactSaved={onAddressSaved ?? onRefetchOrderSummary}
                  />
                </>
              ) : (
                <CheckoutDeliveryContactEmpty
                  onContactSaved={onAddressSaved ?? onRefetchOrderSummary}
                />
              )}

              {hasDeliveryAddress ? (
                <>
                  {shippingQuoteWarnings.length > 0 ? (
                    <div className="space-y-2 bg-amber-50 mb-4 p-4 border border-amber-200 rounded-xl">
                      <Paragraph1 className="font-semibold text-amber-950 text-sm">
                        Some delivery options are unavailable
                      </Paragraph1>
                      <ul className="space-y-1.5 pl-5 text-amber-900 text-sm list-disc">
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

                  {dispatchReschedules.length > 0 ? (
                    <div className="space-y-2 bg-amber-50 mb-4 p-4 border border-amber-200 rounded-xl">
                      {dispatchReschedules.map((entry) => (
                        <Paragraph1
                          key={
                            entry.cartItemId ??
                            entry.productName ??
                            entry.outboundSummary
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

                  {isShippingTiersLoading ? (
                    <FetchingDeliveryOptions label="Fetching delivery options…" />
                  ) : usePerBucketOutbound ? (
          <div className="space-y-8">
            {showQuoteDispatchLoading && !hasSummaryDispatchPreview ? (
              <div className="mb-4 pb-4 border-gray-100 border-b">
                <DispatchWindowsQuoteSkeleton />
              </div>
            ) : null}
            {outboundBuckets.map((bucket, bucketIndex) => {
              const selectedName =
                selectedOutboundTierByBucket[bucket.bucketIndex] ??
                bucket.shippingTiers[0]?.name ??
                "";
              const shipment =
                orderReviewDelivery.shipments.find(
                  (row) => row.bucketIndex === bucket.bucketIndex,
                ) ?? orderReviewDelivery.shipments[bucketIndex];
              const deliveryWindowText = resolveOutboundDeliveryWindowText(
                shipment,
                dispatchContexts,
                dispatchSelections ?? {},
              );
              return (
                <div key={bucket.bucketIndex} className="space-y-3">
                  {bucketIndex > 0 ? (
                    <hr className="border-gray-100" />
                  ) : null}
                  <CheckoutReadonlyDetail
                    label="Delivery window"
                    value={deliveryWindowText}
                  />
                  {bucket.shippingTiers.length > 0 ? (
                    <CheckoutLabeledBlock label="Delivery options">
                      {renderOutboundTierRadios(
                        bucket.shippingTiers,
                        selectedName,
                        `outboundBucket-${bucket.bucketIndex}`,
                        (name) =>
                          onOutboundTierForBucket?.(bucket.bucketIndex, name),
                      )}
                    </CheckoutLabeledBlock>
                  ) : (
                    <Paragraph1 className="text-gray-600 text-sm">
                      No delivery options for this order segment.
                    </Paragraph1>
                  )}
                </div>
              );
            })}
          </div>
        ) : tierList.length > 0 ? (
          <div className="space-y-3">
            {showQuoteDispatchLoading && !hasSummaryDispatchPreview ? (
              <DispatchWindowsQuoteSkeleton />
            ) : (
              <CheckoutReadonlyDetail
                label="Delivery window"
                value={resolveOutboundDeliveryWindowText(
                  orderReviewDelivery.shipments[0],
                  dispatchContexts,
                  dispatchSelections ?? {},
                )}
              />
            )}
            <CheckoutLabeledBlock label="Delivery options">
              {renderOutboundTierRadios(
                tierList,
                selectedShippingTier,
                "outboundShippingTierLegacy",
                handleShippingTierChange,
              )}
            </CheckoutLabeledBlock>
          </div>
        ) : (
          <Paragraph1 className="text-gray-600 text-sm">
            No delivery options available
          </Paragraph1>
        )}
                </>
              ) : null}
            </div>
          </div>

          {!isResaleOnly ? (
            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
              <div className="p-4 sm:p-5">
                <CheckoutShippingLegHeader sectionLabel="RETURN" leg="return" />
                <hr className="my-4 text-gray-100" />

                {hasDeliveryAddress ? (
                  <>
                    {(orderReviewReturn?.shipments.length ?? 0) > 0 ? (
                      <div className="bg-gray-50/50 mb-4 p-3 sm:p-3.5 border border-gray-200 rounded-lg">
                        {orderReviewReturn?.shipments.map((shipment, index) => (
                          <CheckoutShipmentBlock
                            key={shipment.bucketIndex ?? `return-item-${index}`}
                            shipment={shipment}
                            showDivider={index > 0}
                            showWindows={false}
                            prominentItems
                          />
                        ))}
                      </div>
                    ) : null}
                  </>
                ) : null}

                <CheckoutReturnPickupContact
                  returnPickupAddress={returnPickupAddress}
                  deliveryDefaults={deliveryPickupDefaults}
                  onReturnPickupChange={onReturnPickupChange}
                />

                {hasDeliveryAddress && showReturnShippingTierPicker ? (
                  <>
                    {isShippingTiersLoading ? (
                      <FetchingDeliveryOptions label="Fetching return options…" />
                    ) : usePerBucketReturn ? (
                      <div className="space-y-8">
                        {returnBuckets.map((bucket, bucketIndex) => {
                          const selectedName =
                            selectedReturnTierByBucket[bucket.bucketIndex] ??
                            bucket.shippingTiers[0]?.name ??
                            "";
                          const shipment =
                            orderReviewReturn?.shipments.find(
                              (row) => row.bucketIndex === bucket.bucketIndex,
                            ) ?? orderReviewReturn?.shipments[bucketIndex];
                          return (
                            <div key={bucket.bucketIndex} className="space-y-3">
                              {bucketIndex > 0 ? (
                                <hr className="border-gray-100" />
                              ) : null}
                              <CheckoutReadonlyDetail
                                label="Pickup window"
                                value={shipment?.pickupWindow}
                              />
                              {bucket.shippingTiers.length > 0 ? (
                                <CheckoutLabeledBlock label="Return options">
                                  {renderOutboundTierRadios(
                                    bucket.shippingTiers,
                                    selectedName,
                                    `returnBucket-${bucket.bucketIndex}`,
                                    (name) =>
                                      onReturnTierForBucket?.(
                                        bucket.bucketIndex,
                                        name,
                                      ),
                                  )}
                                </CheckoutLabeledBlock>
                              ) : (
                                <Paragraph1 className="text-gray-600 text-sm">
                                  No return pickup options for this segment.
                                </Paragraph1>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : returnTierList.length > 0 ? (
                      <div className="space-y-3">
                        <CheckoutReadonlyDetail
                          label="Pickup window"
                          value={orderReviewReturn?.shipments[0]?.pickupWindow}
                        />
                        <CheckoutLabeledBlock label="Return options">
                          {renderOutboundTierRadios(
                            returnTierList,
                            selectedReturnShippingTier,
                            "returnShippingTier",
                            handleReturnShippingTierChange,
                          )}
                        </CheckoutLabeledBlock>
                      </div>
                    ) : (
                      <Paragraph1 className="text-gray-600 text-sm">
                        No return pickup options available for this pickup
                        address.
                      </Paragraph1>
                    )}
                  </>
                ) : null}
              </div>
            </div>
          ) : null}

      {hasDeliveryAddress && checkoutBlockingIssues.length > 0 ? (
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

      {hasDeliveryAddress && phoneNeedsUpdate ? (
        <div className="bg-amber-50 p-4 border border-amber-200 rounded-xl">
          <Paragraph1 className="font-semibold text-amber-950 text-sm">
            Update your phone number
          </Paragraph1>
          <Paragraph1 className="mt-1 text-amber-900 text-sm">
            Your saved phone number needs to be updated before you can
            continue. Tap Phone above to fix it.
          </Paragraph1>
        </div>
      ) : null}

          <CheckoutStepNav
            onContinue={
              onCheckoutStepChange ? () => onCheckoutStepChange(2) : undefined
            }
            continueLabel={checkoutStepContinueLabel(1)}
            continueDisabled={!hasDeliveryAddress || !hasPhone}
            {...stickyNavProps}
          />
        </>
      ) : null}

    </div>
  );
}
