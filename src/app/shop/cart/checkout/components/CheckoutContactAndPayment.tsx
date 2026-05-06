"use client";

import {
  Check,
  Clock,
  Compass,
  Home,
  MapPin,
  Truck,
  User,
  Wallet,
  ChevronDown,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { toast } from "sonner";
import type {
  OrderSummaryApiResult,
  ReturnPickupAddressPayload,
} from "@/lib/api/cart";
import { useMe } from "@/lib/queries/auth/useMe";
import { useWallet } from "@/lib/queries/renters/useWallet";
import { useProfile } from "@/lib/queries/user/useProfile";
import ChangeAddress from "./ChangeAddress";
import FundWallet from "./FundWallet";
import DispatchWindowsScheduler from "./DispatchWindowsScheduler";
import type { DispatchWindowContext } from "@/lib/checkout/dispatchWindows";
import type {
  DispatchWindowSelection,
  DispatchWindowSelectionMap,
  ShipmentDispatchType,
} from "@/lib/checkout/dispatchWindows";

const TOPSHIP_CITIES = [
  "Abule Egba",
  "Agbara",
  "Agege",
  "Ajah",
  "Alagbole",
  "Alakuko",
  "Amuwo Odofin",
  "Apapa",
  "Arepo",
  "Atan",
  "Badagry",
  "Bariga",
  "Ebute Metta",
  "Egbeda",
  "Epe",
  "Ibeju-Lekki",
  "Igando",
  "Igbogbo",
  "Ijegun",
  "Ikeja",
  "Ikorodu",
  "Ikotun",
  "Ikoyi",
  "Ipaja",
  "Isolo",
  "Iyana Ipaja",
  "Ketu",
  "Kosofe",
  "Lagos",
  "Lagos Island",
  "Lekki",
  "Magboro",
  "Marina",
  "Maryland",
  "Mowe",
  "Mushin",
  "Ogba",
  "Ojo",
  "Ojokoro Ijaiye",
  "Onikan",
  "Oshodi",
  "Sangotedo",
  "Somolu",
  "Surulere",
  "Victoria Island",
  "Yaba",
];

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
  /** Quote-based dispatch: one optional heading per shipment bucket, then rental/return rows. */
  summaryDispatchPreview?: Array<{
    groupHeading: string | null;
    rows: Array<{ title: string; range: string }>;
  }>;
  isResaleOnly?: boolean;
}

const CONTACT_SKELETON_KEYS = [
  "contact-1",
  "contact-2",
  "contact-3",
  "contact-4",
];
const SHIPPING_SKELETON_KEYS = ["shipping-1", "shipping-2", "shipping-3"];
const SAME_DAY_TIER_KEYWORDS = ["chowdeck", "errandlr", "dellyman", "glovo"];
const SAME_DAY_CUTOFF_DISCLAIMER =
  "Orders placed after 11:00am WAT (Lagos time) may be delivered the next day.";

const isSameDayShippingTierName = (tierName: string) => {
  const normalized = tierName.toLowerCase();
  return SAME_DAY_TIER_KEYWORDS.some((keyword) => normalized.includes(keyword));
};

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

// === Reservation Timer Component ===
const ReservationTimer = () => {
  const [timeLeft, setTimeLeft] = useState<string>("15:00");

  useEffect(() => {
    const expiryTime = new Date(Date.now() + 15 * 60 * 1000);

    const updateTimer = () => {
      const now = Date.now();
      const expiryTimeMs = expiryTime.getTime();
      const distance = expiryTimeMs - now;

      if (distance <= 0) {
        setTimeLeft("0:00");
        return;
      }

      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, "0")}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-3 bg-amber-50 mb-6 p-4 border border-amber-200 rounded-xl">
      <Clock className="w-6 h-6 text-amber-700 shrink-0" />
      <Paragraph1 className="font-medium text-amber-900">
        These items are reserved for{" "}
        <span className="font-bold">{timeLeft}</span> — complete payment to
        secure these items
      </Paragraph1>
    </div>
  );
};

// === Delivery Tier Helper Function ===
const getDeliveryTierDetails = (tierName: string) => {
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
  isShippingTiersLoading = false,
  dispatchContexts: dispatchContextsProp,
  dispatchSelections,
  onDispatchSelectionChange,
  returnPickupAddress,
  onReturnPickupChange,
  checkoutBlockingIssues = [],
  summaryDispatchPreview,
  isResaleOnly = false,
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
    hasRentalDispatch &&
    isShippingTiersLoading &&
    !hasSummaryDispatchPreview;
  const { data: user } = useMe();
  const { data: profile } = useProfile();
  const { data: walletResponse } = useWallet();
  const [isSameAsBilling, setIsSameAsBilling] = useState(true);
  const tierList = shippingTiers ?? [];

  /** Matches grand total in FinalOrderSummaryCard (line items plus selected-tier shipping adjustment). */
  const checkoutGrandTotalNgN = useMemo(() => {
    const summary = orderSummary?.data?.summary;
    if (!summary) return undefined;

    const summaryOutboundShipping = summary.outboundShippingTotal || 0;
    const summaryReturnShipping = summary.returnShippingTotal || 0;
    const summarySplitShippingTotal =
      summaryOutboundShipping + summaryReturnShipping;
    const summaryShippingTotal =
      summary.shippingTotal || summarySplitShippingTotal;

    const tiers = shippingTiers ?? [];
    const selectedTierRow = tiers.find((t) => t.name === selectedShippingTier);
    const selectedShippingTotal =
      selectedTierRow?.totalShippingCost ?? summaryShippingTotal;
    const shippingTierAdjustment = selectedShippingTotal - summaryShippingTotal;

    return (
      (summary.purchaseTotal ?? 0) +
      (summary.rentalTotal ?? 0) +
      (summary.collateralTotal ?? 0) +
      (summary.cleaningTotal ?? 0) +
      (summary.outboundShippingTotal ?? 0) +
      (summary.returnShippingTotal ?? 0) +
      (summary.serviceCharge ?? 0) +
      (summary.vatAmount ?? 0) +
      shippingTierAdjustment
    );
  }, [orderSummary?.data?.summary, shippingTiers, selectedShippingTier]);

  const basePickupDefaults = useMemo<ReturnPickupAddressPayload>(
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
  const [returnPickupForm, setReturnPickupForm] =
    useState<ReturnPickupAddressPayload>(
      returnPickupAddress ?? basePickupDefaults,
    );
  const [returnPickupMode, setReturnPickupMode] = useState<
    "delivery" | "custom"
  >(returnPickupAddress ? "custom" : "delivery");
  const [hasTouchedReturnPickup, setHasTouchedReturnPickup] = useState(false);
  const [savingPickup, setSavingPickup] = useState(false);

  const handleShippingTierChange = (tierName: string) => {
    onShippingTierSelected?.(tierName);
  };

  useEffect(() => {
    if (returnPickupMode === "delivery") {
      setReturnPickupForm(basePickupDefaults);
      onReturnPickupChange?.(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [basePickupDefaults, returnPickupMode]);

  useEffect(() => {
    if (returnPickupAddress) {
      setReturnPickupMode("custom");
      setReturnPickupForm(returnPickupAddress);
    }
  }, [returnPickupAddress]);

  const handleReturnPickupModeChange = (mode: "delivery" | "custom") => {
    setReturnPickupMode(mode);
    setHasTouchedReturnPickup(true);
    if (mode === "delivery") {
      onReturnPickupChange?.(undefined);
    } else {
      onReturnPickupChange?.(returnPickupForm);
    }
  };

  const handleReturnPickupFieldChange = (
    field: keyof ReturnPickupAddressPayload,
    value: string,
  ) => {
    setHasTouchedReturnPickup(true);
    setReturnPickupForm((prev) => {
      return { ...prev, [field]: value };
    });
  };

  const handleSaveReturnPickup = () => {
    if (returnPickupMode === "custom" && returnPickupErrors.length === 0) {
      setSavingPickup(true);
      onReturnPickupChange?.(returnPickupForm);
      setTimeout(() => {
        setSavingPickup(false);
        toast.success("Pickup spot saved");
      }, 500);
    }
  };

  const returnPickupErrors = useMemo(() => {
    if (returnPickupMode === "delivery") return [] as string[];
    const required: Array<{
      field: keyof ReturnPickupAddressPayload;
      label: string;
    }> = [
      { field: "contactName", label: "Contact name" },
      { field: "phoneNumber", label: "Phone number" },
      { field: "street", label: "Street" },
      { field: "city", label: "City" },
      { field: "state", label: "State" },
    ];
    return required
      .filter(({ field }) => !returnPickupForm[field]?.trim())
      .map(({ label }) => `${label} is required`);
  }, [returnPickupForm, returnPickupMode]);

  if (!user) return <ContactSkeleton />;

  const deliveryAddress = profile?.address
    ? `${profile.address.street}, ${profile.address.city}, ${profile.address.state}, ${profile.address.country}`
    : "No address set";

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

  return (
    <div className="space-y-6 bg-gray-50">
      {/* Payment expiring timer */}
      <ReservationTimer />

      {/* 1. CONTACT Section */}
      <div className="bg-white p-4 border border-gray-100 rounded-xl">
        <Paragraph1 className="mb-3 font-bold text-gray-800 tracking-wider">
          CONTACT
        </Paragraph1>

        <hr className="mb-3 text-gray-300" />
        <div className="flex items-start gap-3">
          <User size={30} className="mt-0.5 text-gray-700 shrink-0" />
          <div>
            <Paragraph1 className="font-medium text-gray-900 leading-snug">
              {user.name}
            </Paragraph1>
            <Paragraph1 className="text-gray-600 text-xs leading-snug">
              {user.email}
            </Paragraph1>
            <Paragraph1 className="text-gray-600 text-xs leading-snug">
              {profile?.phoneNumber || "No phone number"}
            </Paragraph1>
          </div>
        </div>
      </div>

      {/* 2. DELIVERY ADDRESS Section */}
      <div className="bg-white p-4 border border-gray-100 rounded-xl">
        <Paragraph1 className="mb-4 font-bold text-gray-800 tracking-wider">
          DELIVERY ADDRESS
        </Paragraph1>
        <hr className="mb-3 text-gray-300" />

        {/* Address Row */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-start gap-3">
            <Home size={30} className="mt-0.5 text-gray-700 shrink-0" />
            <Paragraph1 className="max-w-[70%] text-gray-900 leading-snug">
              {deliveryAddress}
            </Paragraph1>
          </div>
          <ChangeAddress />
        </div>
        <hr className="mb-3 text-gray-300" />

        {/* Same as Billing Checkbox */}
        <label className="flex items-center space-x-2 mt-2 text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={isSameAsBilling}
            onChange={() => setIsSameAsBilling(!isSameAsBilling)}
            className="hidden" // Hide default checkbox
          />
          <span
            className={`w-6 h-6 rounded border ${
              isSameAsBilling
                ? "bg-black border-black"
                : "bg-white border-gray-400"
            } flex items-center justify-center`}
          >
            {isSameAsBilling && <Check size={18} className="text-white" />}
          </span>
          <Paragraph1>Same as billing address</Paragraph1>
        </label>
      </div>

      {/* 3. SHIPPING METHOD Section */}
      <div className="bg-white p-4 border border-gray-100 rounded-xl">
        <div className="flex justify-between items-start gap-3">
          <div>
            <Paragraph1 className="font-bold text-gray-800 tracking-wider">
              SHIPPING METHOD
            </Paragraph1>
          </div>
          <Truck size={24} className="text-gray-400" />
        </div>

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
        ) : tierList.length > 0 ? (
          <div className="space-y-3">
            {[...tierList]
              .filter((tier) => {
                const isExpress =
                  tier.name.toLowerCase().includes("dhl") ||
                  tier.name.toLowerCase().includes("express");
                return !isExpress;
              })
              .map((tier) => {
                const tierDetails = getDeliveryTierDetails(tier.name);
                const isSameDay = isSameDayShippingTierName(tier.name);
                const isSelected = selectedShippingTier === tier.name;
                return (
                  <label
                    key={tier.name}
                    className={`group relative block rounded-2xl border-2 p-4 transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? "border-gray-900 shadow-xl shadow-gray-900/10"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <input
                      type="radio"
                      name="shippingTier"
                      value={tier.name}
                      checked={isSelected}
                      onChange={() => handleShippingTierChange(tier.name)}
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
                        <Paragraph1 className="mt-1 text-gray-600 text-xs">
                          {tierDetails.description}
                        </Paragraph1>
                        {isSameDay && (
                          <Paragraph1 className="mt-2 text-amber-700 text-xs">
                            {SAME_DAY_CUTOFF_DISCLAIMER}
                          </Paragraph1>
                        )}
                      </div>
                      <div className="text-right">
                        <Paragraph1 className="text-gray-500 text-xs">
                          Shipping
                        </Paragraph1>
                        <Paragraph1 className="font-bold text-gray-900 text-lg">
                          ₦{formatCurrency(tier.totalShippingCost)}
                        </Paragraph1>
                      </div>
                    </div>
                  </label>
                );
              })}
          </div>
        ) : (
          <Paragraph1 className="text-gray-600 text-sm">
            No shipping methods available
          </Paragraph1>
        )}
      </div>

      {/* 4. RETURN PICKUP Section - Only show for rental orders */}
      {!isResaleOnly && (
        <div className="bg-white p-4 border border-gray-100 rounded-xl">
          <div className="flex justify-between items-start gap-3">
            <div>
              <Paragraph1 className="font-bold text-gray-800 tracking-wider">
                RETURN PICKUP
              </Paragraph1>
              <Paragraph1 className="text-gray-600 text-sm">
                Share where the courier should collect items at rental wrap-up.
                We'll lock this in alongside your pickup window.
              </Paragraph1>
            </div>
            <Compass size={22} className="text-amber-500" />
          </div>

          <div className="flex flex-wrap gap-3 mt-4">
            {[
              { label: "Use delivery address", value: "delivery" },
              { label: "Custom pickup spot", value: "custom" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  handleReturnPickupModeChange(
                    option.value as "delivery" | "custom",
                  )
                }
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  returnPickupMode === option.value
                    ? "bg-gray-900 text-white shadow-lg shadow-gray-900/20"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {returnPickupMode === "delivery" ? (
            <div className="bg-gray-50 mt-4 p-4 border border-gray-200 rounded-2xl">
              <Paragraph1 className="font-semibold text-gray-900 text-sm">
                {returnPickupForm.street
                  ? `${returnPickupForm.street}, ${returnPickupForm.city}`
                  : deliveryAddress}
              </Paragraph1>
            </div>
          ) : (
            <div className="space-y-4 mt-4">
              <div className="gap-3 grid sm:grid-cols-2">
                <label className="font-semibold text-gray-500 text-xs uppercase tracking-wide">
                  Contact name
                  <input
                    type="text"
                    value={returnPickupForm.contactName}
                    onChange={(e) =>
                      handleReturnPickupFieldChange(
                        "contactName",
                        e.target.value,
                      )
                    }
                    className="mt-1 px-3 py-2 border border-gray-200 focus:border-gray-900 rounded-lg focus:outline-none w-full text-sm"
                    placeholder="e.g. Adaora N."
                  />
                </label>
                <label className="font-semibold text-gray-500 text-xs uppercase tracking-wide">
                  Phone number
                  <input
                    type="tel"
                    value={returnPickupForm.phoneNumber}
                    onChange={(e) =>
                      handleReturnPickupFieldChange(
                        "phoneNumber",
                        e.target.value,
                      )
                    }
                    className="mt-1 px-3 py-2 border border-gray-200 focus:border-gray-900 rounded-lg focus:outline-none w-full text-sm"
                    placeholder="0801..."
                  />
                </label>
                <label className="sm:col-span-2 font-semibold text-gray-500 text-xs uppercase tracking-wide">
                  Street
                  <input
                    type="text"
                    value={returnPickupForm.street}
                    onChange={(e) =>
                      handleReturnPickupFieldChange("street", e.target.value)
                    }
                    className="mt-1 px-3 py-2 border border-gray-200 focus:border-gray-900 rounded-lg focus:outline-none w-full text-sm"
                    placeholder="Apartment, street, landmark"
                  />
                </label>
                <label className="font-semibold text-gray-500 text-xs uppercase tracking-wide">
                  City
                  <div className="relative">
                    <select
                      value={returnPickupForm.city}
                      onChange={(e) => {
                        handleReturnPickupFieldChange("city", e.target.value);
                        handleReturnPickupFieldChange("state", "Lagos");
                      }}
                      className="bg-white mt-1 px-3 py-2 pr-10 border border-gray-200 focus:border-gray-900 rounded-lg focus:outline-none w-full text-sm appearance-none"
                    >
                      <option value="">Select City</option>
                      {TOPSHIP_CITIES.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="top-1/2 right-3 absolute w-4 h-4 text-gray-400 -translate-y-1/2 pointer-events-none" />
                  </div>
                </label>
                <label className="font-semibold text-gray-500 text-xs uppercase tracking-wide">
                  State
                  <input
                    type="text"
                    value="Lagos"
                    disabled
                    className="bg-gray-50 mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none w-full text-gray-500 text-sm"
                  />
                </label>
              </div>

              <label className="font-semibold text-gray-500 text-xs uppercase tracking-wide">
                Handoff notes (optional)
                <textarea
                  value={returnPickupForm.instructions ?? ""}
                  onChange={(e) =>
                    handleReturnPickupFieldChange(
                      "instructions",
                      e.target.value,
                    )
                  }
                  className="mt-1 px-3 py-2 border border-gray-200 focus:border-gray-900 rounded-lg focus:outline-none w-full text-sm"
                  rows={3}
                  placeholder="Gate codes, concierge numbers, etc."
                />
              </label>

              {returnPickupErrors.length > 0 && hasTouchedReturnPickup && (
                <div className="bg-red-50 p-3 border border-red-200 rounded-2xl text-red-700 text-xs">
                  {returnPickupErrors.map((error) => (
                    <p key={error}>{error}</p>
                  ))}
                </div>
              )}

              <div className="bg-gray-50 p-4 border border-gray-200 rounded-2xl">
                <Paragraph1 className="font-semibold text-gray-900 text-sm">
                  Pickup summary
                </Paragraph1>
                <Paragraph1 className="text-gray-600 text-sm">
                  {returnPickupForm.contactName} — {returnPickupForm.street} ·{" "}
                  {returnPickupForm.city}, {returnPickupForm.state}
                </Paragraph1>
                <Paragraph1 className="mt-1 text-gray-500 text-xs">
                  Phone: {returnPickupForm.phoneNumber || "—"}
                </Paragraph1>
              </div>

              <button
                type="button"
                onClick={handleSaveReturnPickup}
                disabled={returnPickupErrors.length > 0 || savingPickup}
                className="bg-black hover:bg-gray-900 disabled:opacity-50 mt-3 px-4 py-2 rounded-lg font-semibold text-white text-xs"
              >
                {savingPickup ? "Saving..." : "Save pickup spot"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* 4. DISPATCH WINDOWS Section */}
      {dispatchContexts.length > 0 && (
        <div className="bg-white p-4 border border-gray-100 rounded-xl">
          <Paragraph1 className="mb-4 font-bold text-gray-800 tracking-wider">
            {isResaleOnly ? "DELIVERY OPTIONS" : "DISPATCH WINDOWS"}
          </Paragraph1>
          <Paragraph1 className="mb-4 text-gray-600 text-sm">
            {isResaleOnly
              ? "The delivery slot below is the one we will use for this purchase."
              : showQuoteDispatchLoading
                ? "Loading windows that match your quote. Each lister or schedule can have its own delivery and return slot."
                : hasSummaryDispatchPreview
                  ? "Windows below match your checkout quote (each rental schedule may have its own outbound and return slot)."
                  : "These windows were selected when you created your approval request."}
          </Paragraph1>
          {hasSummaryDispatchPreview ? (
            <div className="space-y-3 bg-linear-to-b from-neutral-50 to-neutral-50/40 p-3 sm:p-4 border border-gray-100 rounded-xl">
              {(summaryDispatchPreview ?? []).map((group, gi) => (
                <div
                  key={`dispatch-group-${gi}`}
                  className="bg-white shadow-sm border border-gray-200/90 rounded-lg overflow-hidden"
                >
                  {group.groupHeading ? (
                    <div className="flex gap-2.5 bg-neutral-50/70 px-4 py-3 border-gray-100 border-b">
                      <Clock
                        className="mt-0.5 size-4 text-gray-400 shrink-0"
                        strokeWidth={2}
                        aria-hidden
                      />
                      <Paragraph1 className="font-semibold text-gray-900 text-sm leading-snug">
                        {group.groupHeading}
                      </Paragraph1>
                    </div>
                  ) : null}
                  <div className="divide-y divide-gray-100">
                    {group.rows.map((row, ri) => (
                      <div
                        key={`${row.title}-${gi}-${ri}`}
                        className="px-4 sm:px-5 py-3.5 sm:py-4"
                      >
                        <Paragraph1 className="mb-1 font-semibold text-[10px] text-gray-500 uppercase tracking-[0.18em]">
                          {row.title}
                        </Paragraph1>
                        <Paragraph1 className="font-medium text-[15px] text-gray-950 leading-relaxed tracking-tight">
                          {row.range}
                        </Paragraph1>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : showQuoteDispatchLoading ? (
            <DispatchWindowsQuoteSkeleton />
          ) : (
            <DispatchWindowsScheduler
              contexts={dispatchContexts}
              selections={dispatchSelections || {}}
              onSelectionChange={onDispatchSelectionChange}
              readOnly={true}
            />
          )}
          {checkoutBlockingIssues.length > 0 && (
            <div className="bg-red-50 mt-4 p-3 border border-red-200 rounded-lg">
              <Paragraph1 className="font-semibold text-red-700 text-xs uppercase tracking-wide">
                Action needed before payment
              </Paragraph1>
              <div className="space-y-1 mt-1">
                {checkoutBlockingIssues.map((issue) => (
                  <Paragraph1 key={issue} className="text-red-700 text-xs">
                    {issue}
                  </Paragraph1>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. PAYMENT Section */}
      <div className="bg-white p-4 border border-gray-100 rounded-xl">
        <Paragraph1 className="mb-4 font-bold text-gray-800 tracking-wider">
          PAYMENT
        </Paragraph1>
        <hr className="mb-3 text-gray-300" />

        {/* Wallet Balance Row */}
        <div className="flex justify-between items-start gap-4">
          <div className="flex flex-1 items-start gap-3">
            <Wallet size={30} className="mt-0.5 text-gray-700 shrink-0" />
            <div className="space-y-2">
              <div>
                <Paragraph1 className="text-gray-600 text-xs">
                  Available Balance
                </Paragraph1>
                <Paragraph3
                  className={`font-bold ${
                    isWalletFunded ? "text-green-700" : "text-red-700"
                  }`}
                >
                  ₦{formatCurrency(availableBalance)}
                </Paragraph3>
                {walletTopUpNgN !== undefined && walletTopUpNgN > 0 ? (
                  <Paragraph1 className="mt-2 max-w-56 sm:max-w-none text-green-700 text-xs leading-snug">
                    Fund your wallet with ₦{formatCurrency(walletTopUpNgN)} to complete your order.
                  </Paragraph1>
                ) : null}
              </div>
            </div>
          </div>
          <FundWallet />
        </div>
      </div>
    </div>
  );
}
