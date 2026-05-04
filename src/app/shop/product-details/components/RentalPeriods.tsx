"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  SlidersVertical,
  X,
  Search,
  ChevronLeft,
  ArrowLeft,
  Loader2,
  Bell,
  CalendarDays,
  Clock3,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter, usePathname } from "next/navigation";
import { Paragraph1, Paragraph2, Paragraph3 } from "@/common/ui/Text";
import Button from "@/common/ui/Button";
import RentalDurationSelector from "./RentalDurationSelector";
import RentalSummaryCard from "./RentalSummaryCard";
import { useSubmitRentalRequest } from "@/lib/mutations/renters/useRentalRequestMutations";

import RentalCartView from "../../cart/components/RentalCartView";
import { useAddCartItem } from "@/lib/mutations/renters/useAddCartItem";
import { useMe } from "@/lib/queries/auth/useMe";
import { useAddresses } from "@/lib/queries/renters/useAddresses";
import { useProfileDetails } from "@/lib/queries/renters/useProfileDetails";
import { useUserStore } from "@/store/useUserStore";
import Link from "next/link";
import { getCartItemsApi } from "@/lib/api/cart";
import {
  addCalendarDaysLocal,
  formatDateOnlyLocal,
} from "@/lib/dates/formatDateOnlyLocal";
import DispatchWindowsScheduler from "@/app/shop/cart/checkout/components/DispatchWindowsScheduler";
import type {
  DispatchWindowContext,
  DispatchWindowSelection,
  DispatchWindowSelectionMap,
  DispatchWindowsPayload,
  ShipmentDispatchType,
} from "@/lib/checkout/dispatchWindows";
import { formatLagosTime } from "@/lib/checkout/dispatchWindows";
import {
  buildDispatchWindowContexts,
  formatWindowRange,
  getSuggestedRentalCalendarStartYmd,
} from "@/lib/checkout/dispatchWindows";
import { useDispatchScheduleClock } from "@/lib/checkout/useDispatchScheduleClock";

function cartLineIdFromAddCartPayload(payload: unknown): string | undefined {
  const walk = (v: unknown): string | undefined => {
    if (v == null || typeof v !== "object") return undefined;
    const o = v as Record<string, unknown>;
    for (const k of ["id", "cartItemId", "cart_item_id"] as const) {
      const s = o[k];
      if (typeof s === "string" && s.trim()) return s.trim();
    }
    for (const nested of [o.data, o.item, o.cartItem]) {
      const found = walk(nested);
      if (found) return found;
    }
    return undefined;
  };
  return walk(payload);
}

// Hook to get renter profile (uses GET /api/renters/profile)
// Hook to get renter addresses (uses GET /api/renters/profile/addresses)

// --------------------
// Types
// --------------------
type FilterItemProps = {
  label: string;
  type?: "radio" | "checkbox";
};

// --------------------
// Slide-in Filter Panel
// --------------------
interface RentalPeriodsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  listerId: string;
  dailyPrice: number;
  collateralPrice: number;
  listingType?: "RENTAL" | "RESALE" | "RENT_OR_RESALE";
  resalePrice?: number | null;
}

const DISPATCH_SLOT_MINUTES = 60;

const dispatchWindowMeta: Record<
  ShipmentDispatchType,
  {
    title: string;
    kicker: string;
    description: string;
  }
> = {
  OUTBOUND: {
    title: "Courier arrival window",
    kicker: "Rental start delivery",
    description: "Courier brings your item as your rental begins.",
  },
  RETURN: {
    title: "Courier arrival window",
    kicker: "Return pickup",
    description: "Courier collects the item when your rental ends.",
  },
  RESALE: {
    title: "Delivery drop-off window",
    kicker: "Delivery drop-off",
    description: "Courier drops off your purchase at your address.",
  },
};

const RentalPeriodsPanel: React.FC<RentalPeriodsPanelProps> = ({
  isOpen,
  onClose,
  productId,
  listerId,
  dailyPrice,
  collateralPrice,
  listingType,
  resalePrice,
}) => {
  const minPrice = 50000;
  const maxPrice = 200000;
  const { data: user } = useMe();

  // GET /api/renters/profile - Check if user has a profile
  const {
    data: profileData,
    isLoading: isProfileLoading,
    isError: isProfileError,
  } = useProfileDetails();

  // GET /api/renters/profile/addresses - Get user addresses
  const { data: addresses, isLoading: isAddressesLoading } = useAddresses();

  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const setUser = useUserStore((s) => s.setUser);

  // Profile setup modal state
  const [isProfileSetupModalOpen, setIsProfileSetupModalOpen] = useState(false);

  const variants = {
    hidden: { x: "100%" },
    visible: { x: 0 },
  };

  const [rentalDays, setRentalDays] = useState(3);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [autoPay, setAutoPay] = useState(false); // Default OFF
  const [summaryData, setSummaryData] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [countdownActive, setCountdownActive] = useState(false);
  const [showNotifyMe, setShowNotifyMe] = useState(false);
  const shippingFee = 5000; // Fixed amount, can be adjusted
  const submitRentalRequest = useSubmitRentalRequest();

  const addCartItem = useAddCartItem();

  const [dispatchSelections, setDispatchSelections] =
    useState<DispatchWindowSelectionMap>({});
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [dispatchModalStep, setDispatchModalStep] = useState(0);
  const dispatchScheduleClock = useDispatchScheduleClock();

  const suggestedRentalCalendarStartYmd = useMemo(() => {
    void dispatchScheduleClock;
    return getSuggestedRentalCalendarStartYmd(DISPATCH_SLOT_MINUTES);
  }, [dispatchScheduleClock]);

  const rentalStartDateIso = useMemo(
    () => formatDateOnlyLocal(startDate),
    [startDate],
  );

  const rentalEndDateIso = useMemo(() => {
    return formatDateOnlyLocal(addCalendarDaysLocal(startDate, rentalDays));
  }, [startDate, rentalDays]);

  const supportsRentalShipments = useMemo(
    () => listingType !== "RESALE",
    [listingType],
  );

  const dispatchContexts = useMemo<DispatchWindowContext[]>(() => {
    if (!supportsRentalShipments || rentalDays <= 0) {
      return [];
    }
    return buildDispatchWindowContexts([
      {
        type: "OUTBOUND",
        baseDate: rentalStartDateIso,
        durationMinutes: DISPATCH_SLOT_MINUTES,
        title: dispatchWindowMeta.OUTBOUND.title,
        subtitle: dispatchWindowMeta.OUTBOUND.description,
      },
      {
        type: "RETURN",
        baseDate: rentalEndDateIso,
        durationMinutes: DISPATCH_SLOT_MINUTES,
        title: dispatchWindowMeta.RETURN.title,
        subtitle: dispatchWindowMeta.RETURN.description,
      },
    ]);
  }, [
    supportsRentalShipments,
    rentalDays,
    rentalStartDateIso,
    rentalEndDateIso,
    dispatchScheduleClock,
  ]);

  useEffect(() => {
    if (dispatchContexts.length === 0) {
      setDispatchSelections({});
      return;
    }
    setDispatchSelections((prev) => {
      const next = { ...prev } as DispatchWindowSelectionMap;
      let changed = false;
      dispatchContexts.forEach((ctx) => {
        const existing = next[ctx.type];
        if (!existing || existing.mode === "DEFAULT") {
          next[ctx.type] = {
            type: ctx.type,
            window: ctx.suggested.window,
            mode: "DEFAULT",
            baseDate: ctx.suggested.baseDate,
            scheduledDate: ctx.suggested.scheduledDate,
            rolledForwardDays: ctx.suggested.rolledForwardDays,
          } satisfies DispatchWindowSelection;
          changed = true;
        }
      });

      (Object.keys(next) as ShipmentDispatchType[]).forEach((type) => {
        if (!dispatchContexts.some((ctx) => ctx.type === type)) {
          delete next[type];
          changed = true;
        }
      });

      return changed ? next : prev;
    });
  }, [dispatchContexts]);

  useEffect(() => {
    if (!isOpen) {
      setIsDispatchModalOpen(false);
      setDispatchModalStep(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isDispatchModalOpen) {
      setDispatchModalStep(0);
    }
  }, [isDispatchModalOpen]);

  const handleDispatchSelectionChange = useCallback(
    (
      type: ShipmentDispatchType,
      selection: DispatchWindowSelection | undefined,
    ) => {
      setDispatchSelections((prev) => {
        const next = { ...prev } as DispatchWindowSelectionMap;
        if (!selection) {
          delete next[type];
        } else {
          next[type] = selection;
        }
        return next;
      });
    },
    [],
  );

  const dispatchWindowsPayload = useMemo<
    DispatchWindowsPayload | undefined
  >(() => {
    if (dispatchContexts.length === 0) {
      return undefined;
    }
    const payload: DispatchWindowsPayload = {};
    dispatchContexts.forEach((ctx) => {
      const selection = dispatchSelections[ctx.type];
      if (selection?.window) {
        payload[ctx.type] = selection.window;
      }
    });
    return Object.keys(payload).length > 0 ? payload : undefined;
  }, [dispatchContexts, dispatchSelections]);

  const totalDispatchSteps = dispatchContexts.length;
  const activeDispatchContext =
    totalDispatchSteps > 0 ? dispatchContexts[dispatchModalStep] : undefined;
  const stepProgress =
    totalDispatchSteps > 0
      ? ((dispatchModalStep + 1) / totalDispatchSteps) * 100
      : 100;

  const handleOpenDispatchModal = () => {
    if (dispatchContexts.length === 0) return;
    setIsDispatchModalOpen(true);
  };

  const handleCloseDispatchModal = () => {
    setIsDispatchModalOpen(false);
  };

  const handleNextDispatchModal = () => {
    if (dispatchModalStep < totalDispatchSteps - 1) {
      setDispatchModalStep((prev) =>
        Math.min(prev + 1, totalDispatchSteps - 1),
      );
      return;
    }
    handleCloseDispatchModal();
  };

  const handlePrevDispatchModal = () => {
    setDispatchModalStep((prev) => Math.max(0, prev - 1));
  };

  const handleRentalDaysChange = useCallback((days: number, start?: Date) => {
    setRentalDays(days);
    if (start) setStartDate(start);
  }, []);

  // Handler for Check Availability
  const handleCheckAvailability = async () => {
    setSummaryData(null);
    try {
      // Wait for both profile and addresses to load
      if (isProfileLoading || isAddressesLoading) {
        toast.info("Loading your profile and addresses...");
        return;
      }

      // Check if profile exists
      if (!profileData) {
        toast.error("Profile not found. Please complete your profile setup.");
        setIsProfileSetupModalOpen(true);
        return;
      }

      // Check if there's a profile error
      if (isProfileError) {
        toast.error("Error loading profile. Please try again.");
        setIsProfileSetupModalOpen(true);
        return;
      }

      // Check if addresses exist
      if (!addresses || addresses.length === 0) {
        toast.info("Please add a delivery address to continue.");
        setIsProfileSetupModalOpen(true);
        return;
      }

      // Get default address from addresses (using GET /api/renters/profile/addresses)
      const defaultAddr = addresses.find((a) => a.isDefault);
      const deliveryAddressId = defaultAddr?.id || addresses[0]?.id || "";

      if (!deliveryAddressId) {
        toast.error("Unable to select a delivery address. Please try again.");
        return;
      }

      if (!Number.isFinite(startDate.getTime())) {
        toast.error("Invalid rental start date.");
        return;
      }

      if (dispatchContexts.length > 0 && !dispatchWindowsPayload) {
        toast.error("Please confirm dispatch windows for courier handoff.");
        return;
      }

      setIsChecking(true);

      let cartItemId: string | undefined;
      try {
        const addRes = await addCartItem.mutateAsync({
          productId,
          days: rentalDays,
        });
        cartItemId = cartLineIdFromAddCartPayload(addRes?.data ?? addRes);
      } catch (cartErr: any) {
        const msg = String(cartErr?.message ?? "");
        const alreadyInCart = /already in cart/i.test(msg);
        if (alreadyInCart) {
          try {
            const cart = await getCartItemsApi();
            const line = [...(cart.items ?? [])]
              .reverse()
              .find((i) => i.productId === productId);
            cartItemId = line?.id;
          } catch {}
        } else {
          console.error("❌ Error posting cart item:", cartErr);
          toast.error(msg || "Could not add to cart.");
          return;
        }
      }

      const isResale =
        listingType === "RESALE" ||
        (listingType === "RENT_OR_RESALE" && rentalDays === 0);

      const rentalStartDate = isResale ? null : formatDateOnlyLocal(startDate);
      const endDayOffset = isResale ? 0 : Math.max(0, rentalDays - 1);
      const rentalEndDate = isResale
        ? null
        : formatDateOnlyLocal(addCalendarDaysLocal(startDate, endDayOffset));
      const estimatedRentalPrice = isResale
        ? (resalePrice ?? 0)
        : dailyPrice * rentalDays;
      const currency = "NGN";
      const res = await submitRentalRequest.mutateAsync({
        productId,
        listerId,
        rentalStartDate,
        rentalEndDate,
        rentalDays,
        estimatedRentalPrice,
        deliveryAddressId,
        autoPay,
        currency,
        ...(cartItemId ? { cartItemId } : {}),
        ...(dispatchWindowsPayload
          ? { dispatchWindows: dispatchWindowsPayload }
          : {}),
      });
      if (res?.success && res?.data) {
        setSummaryData(res.data);
        toast.success("Request sent! Awaiting lister approval.");
        // Setup countdown from expiresAt
        if (res.data.expiresAt) {
          const expires = new Date(res.data.expiresAt).getTime();
          const now = Date.now();
          const secondsLeft = Math.floor((expires - now) / 1000);
          if (secondsLeft > 0) {
            setCountdown(secondsLeft);
            setCountdownActive(true);
          }
        }
      }
    } catch (e: any) {
      console.error("❌ Error in handleCheckAvailability:", e);
      toast.error(e?.message || "Could not submit request. Please try again.");
    } finally {
      setIsChecking(false);
    }
  };

  // Countdown timer effect
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdownActive && countdown !== null && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => (prev !== null ? prev - 1 : null));
      }, 1000);
    } else if (countdown === 0) {
      setCountdownActive(false);
    }
    return () => clearInterval(timer);
  }, [countdownActive, countdown]);

  // Handle profile setup modal proceed
  const handleProfileSetupProceed = () => {
    // Set user role to RENTER
    setUser({ role: "RENTER" });
    // Encode current pathname as return URL
    const returnUrl = encodeURIComponent(pathname);
    router.push(`/auth/profile-setup?returnUrl=${returnUrl}`);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="z-99 fixed inset-0 bg-black/70 backdrop--blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="top-0 right-0 fixed flex flex-col bg-white shadow-2xl px-4 w-full sm:w-114 h-screen overflow-y-auto hide-scrollbar"
              role="dialog"
              aria-modal="true"
              aria-label="Product RentalPeriods"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={variants}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="top-0 z-10 sticky flex justify-between items-center bg-white pt-6 pb-4 border-gray-100 border-b">
                <button
                  onClick={onClose}
                  className="xl:hidden p-1 rounded-full text-gray-500 hover:text-black transition"
                  aria-label="Close RentalPeriods"
                >
                  <ArrowLeft size={20} />
                </button>

                <Paragraph1 className="font-bold text-gray-800 tracking-widest">
                  CHOOSE RENTAL PERIOD
                </Paragraph1>
                <button
                  onClick={onClose}
                  className="p-1 rounded-full text-gray-500 hover:text-black transition"
                  aria-label="Close RentalPeriods"
                >
                  <X className="hidden xl:flex" size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="space-y-8 pt-4 pb-20 grow">
                <RentalDurationSelector
                  productId={productId}
                  listerId={listerId}
                  dailyPrice={dailyPrice}
                  collateralPrice={collateralPrice}
                  onChangeRentalDays={handleRentalDaysChange}
                  suggestedStartLagosYmd={suggestedRentalCalendarStartYmd}
                />
                {dispatchContexts.length > 0 && (
                  <div className="space-y-3">
                    <div className="bg-linear-to-br from-gray-50 to-white shadow-sm p-4 border border-gray-100 rounded-3xl">
                      <div className="flex flex-wrap justify-between items-center gap-3">
                        <button
                          type="button"
                          onClick={handleOpenDispatchModal}
                          className="relative bg-black hover:bg-gray-900 px-[17px] py-[7px] border border-black rounded-lg w-full overflow-hidden font-semibold text-[13px] text-white transition"
                        >
                          Book drop-off & pickup
                        </button>
                      </div>
                      <div className="space-y-3 mt-4">
                        {dispatchContexts.map((ctx) => {
                          const selection = dispatchSelections[ctx.type];
                          const window =
                            selection?.window ?? ctx.suggested.window;
                          const isCustom = selection?.mode === "CUSTOM";
                          const meta = dispatchWindowMeta[ctx.type];
                          const startTime = formatLagosTime(window.start);
                          const endTime = formatLagosTime(window.end);
                          return (
                            <div
                              key={ctx.type}
                              className="flex items-start gap-3 bg-white/90 hover:bg-gray-100 p-2 border border-gray-100 rounded-2xl"
                              onClick={handleOpenDispatchModal}
                            >
                              <div className="bg-gray-900/5 p-2 rounded-full text-gray-900">
                                <CalendarDays size={18} />
                              </div>
                              <div className="flex-1 space-y-1">
                                <div className="flex justify-between items-center gap-2">
                                  <Paragraph1 className="font-semibold text-[11px] text-gray-500 uppercase tracking-[0.2em]">
                                    {meta?.kicker ?? ctx.type}
                                  </Paragraph1>
                                  {meta?.description && (
                                    <span
                                      className="text-gray-400"
                                      title={meta.description}
                                    >
                                      <Info size={12} />
                                    </span>
                                  )}
                                </div>
                                <Paragraph1 className="font-semibold text-gray-900">
                                  {ctx.baseDateLabel}
                                </Paragraph1>
                                <Paragraph1 className="font-semibold text-gray-900 text-sm">
                                  {startTime} – {endTime} WAT
                                </Paragraph1>
                                <Paragraph1 className="text-[11px] text-gray-400">
                                  {isCustom
                                    ? "Custom delivery"
                                    : "Earliest delivery"}
                                </Paragraph1>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <Paragraph1 className="flex items-center gap-1 mt-3 text-[11px] text-gray-400 uppercase tracking-[0.2em]">
                        <Clock3 size={12} /> Change them anytime before checkout
                      </Paragraph1>
                    </div>
                  </div>
                )}
                <div className="hidden flex- items-center gap-2 mt-4">
                  <button
                    type="button"
                    aria-pressed={autoPay}
                    onClick={() => setAutoPay((v) => !v)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black ${
                      autoPay
                        ? "bg-black border-black"
                        : "bg-gray-200 border-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                        autoPay ? "translate-x-5" : "translate-x-1"
                      }`}
                    />
                    <span className="sr-only">Toggle Auto Pay</span>
                  </button>
                  <Paragraph1>
                    Auto Pay (pay immediately if approved)
                  </Paragraph1>
                </div>
                <button
                  type="button"
                  className={`mt-4 w-full py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2.5 ${
                    isChecking || countdownActive || summaryData !== null
                      ? "bg-gray-400 text-white cursor-not-allowed opacity-70"
                      : "bg-black text-white hover:bg-gray-900 active:scale-95"
                  }`}
                  onClick={handleCheckAvailability}
                  disabled={
                    isChecking || countdownActive || summaryData !== null
                  }
                >
                  {isChecking ? (
                    <>
                      <Loader2
                        className="w-4 h-4 animate-spin shrink-0"
                        aria-hidden
                      />
                      Checking…
                    </>
                  ) : countdownActive && countdown !== null ? (
                    <>
                      {Math.floor(countdown / 60)
                        .toString()
                        .padStart(2, "0")}
                      :{(countdown % 60).toString().padStart(2, "0")} min left
                    </>
                  ) : summaryData !== null ? (
                    "Request Sent!"
                  ) : (
                    "Check Availability"
                  )}
                </button>

                {/* Notify Me When Available Button - Shows after successful request */}
                {summaryData !== null && (
                  <div className="space-y-3 mt-4">
                    <button
                      type="button"
                      onClick={() => setShowNotifyMe(!showNotifyMe)}
                      className="flex justify-center items-center gap-2 hover:bg-gray-50 px-4 py-3 border-2 border-gray-800 rounded-lg w-full font-semibold text-gray-800 transition duration-150"
                    >
                      <Bell className="w-5 h-5" />
                      Notify Me When Available
                    </button>
                    <AnimatePresence>
                      {showNotifyMe && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="bg-blue-50 p-3 border border-blue-200 rounded-lg"
                        >
                          <Paragraph1 className="text-blue-900 text-sm leading-relaxed">
                            We'll email you the moment this item is available to
                            rent or buy.
                          </Paragraph1>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
                {countdownActive && countdown !== null && (
                  <div className="mt-2 font-medium text-yellow-700 text-center">
                    Item has been added to cart while Waiting for Lister to
                    confirm your request...
                  </div>
                )}
                {summaryData && (
                  <RentalSummaryCard
                    rentalDays={summaryData.rentalDays ?? 0}
                    rentalFeePerPeriod={
                      summaryData.estimatedPrice?.rentalFee ??
                      summaryData.rentalPrice ??
                      0
                    }
                    securityDeposit={
                      summaryData.estimatedPrice?.securityDeposit ??
                      summaryData.estimatedPrice?.collateralPrice ??
                      0
                    }
                    cleaningFee={
                      summaryData.estimatedPrice?.cleaningFee ??
                      summaryData.cleaningFee ??
                      0
                    }
                    shippingFee={
                      summaryData.estimatedPrice?.deliveryFee ??
                      summaryData.deliveryFee ??
                      0
                    }
                  />
                )}
              </div>

              {/* Footer */}
              <div className="bottom-0 sticky flex justify-between gap-4 bg-white mt-auto py-2">
                <button className="flex-1 hover:bg-gray-50 px-4 py-3 border border-gray-300 rounded-lg font-semibold text-sm transition">
                  <Paragraph1>Shop More </Paragraph1>
                </button>

                <Link
                  href="/shop/cart"
                  className="flex flex-1 justify-center items-center gap-1 bg-black px-4 py- border rounded-lg w-full text-white transition cursor-pointer"
                >
                  <Paragraph1> View cart</Paragraph1>
                </Link>

                {/* <RentalCartView /> */}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDispatchModalOpen && activeDispatchContext && (
          <motion.div
            className="z-120 fixed inset-0 flex justify-center items-center bg-black/60 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseDispatchModal}
          >
            <motion.div
              className="bg-white shadow-2xl p-6 rounded-3xl w-full max-w-3xl"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 24, stiffness: 260 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start gap-4">
                <div>
                  <Paragraph1 className="font-semibold text-gray-500 text-xs uppercase tracking-[0.3em]">
                    Window {dispatchModalStep + 1} of {totalDispatchSteps}
                  </Paragraph1>
                  <Paragraph2 className="font-semibold text-gray-900 text-2xl">
                    {dispatchWindowMeta[activeDispatchContext.type]?.title ??
                      activeDispatchContext.title}
                  </Paragraph2>
                  <Paragraph1 className="text-gray-600 text-sm">
                    {dispatchWindowMeta[activeDispatchContext.type]
                      ?.description ?? activeDispatchContext.subtitle}
                  </Paragraph1>
                </div>
                <button
                  type="button"
                  onClick={handleCloseDispatchModal}
                  className="bg-gray-100 p-1.5 border border-gray-200 rounded-lg text-gray-500 hover:text-black"
                  aria-label="Close dispatch modal"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="bg-gray-100 mt-4 w-full h-[3px]">
                <div
                  className="bg-gray-900 h-full transition-all duration-300"
                  style={{ width: `${stepProgress}%` }}
                />
              </div>

              {/* <div className="bg-gray-50 mt-4 px-3 py-2 border border-gray-200 rounded-lg">
                <Paragraph1 className="font-semibold text-gray-500 text-xs uppercase tracking-[0.2em]">
                  We’re planning for
                </Paragraph1>
                <Paragraph1 className="font-semibold text-gray-900">
                  {activeDispatchContext.baseDateLabel}
                </Paragraph1>
                {activeDispatchContext.baseDateReason && (
                  <Paragraph1 className="text-gray-500 text-xs">
                    {activeDispatchContext.baseDateReason}
                  </Paragraph1>
                )}
              </div> */}

              <div className="mt-6">
                <DispatchWindowsScheduler
                  contexts={[activeDispatchContext]}
                  selections={dispatchSelections}
                  onSelectionChange={handleDispatchSelectionChange}
                />
              </div>

              <div className="flex flex-wrap justify-between items-center gap-3 mt-6">
                <button
                  type="button"
                  onClick={handlePrevDispatchModal}
                  disabled={dispatchModalStep === 0}
                  className={`relative overflow-hidden rounded-lg border px-[17px] py-[7px] text-[13px] font-semibold transition ${
                    dispatchModalStep === 0
                      ? "cursor-not-allowed border-gray-200 text-gray-300"
                      : "border-gray-300 bg-white text-gray-900 hover:border-gray-900"
                  }`}
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNextDispatchModal}
                  className="relative bg-black hover:bg-gray-900 px-[17px] py-[7px] border border-black rounded-lg overflow-hidden font-semibold text-[13px] text-white transition"
                >
                  {dispatchModalStep === totalDispatchSteps - 1
                    ? "Save pickup windows"
                    : "Next window →"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Setup Required Modal */}
      <AnimatePresence>
        {isProfileSetupModalOpen && (
          <motion.div
            className="z-101 fixed inset-0 flex justify-center items-center bg-black/50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white shadow-xl p-8 rounded-2xl w-full max-w-md"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
            >
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="flex justify-center items-center bg-blue-100 rounded-full w-16 h-16">
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              </div>

              {/* Title */}
              <Paragraph2 className="mb-2 font-bold text-gray-900 text-2xl text-center">
                Complete Your Profile
              </Paragraph2>

              {/* Description */}
              <Paragraph1 className="mb-6 text-gray-600 text-center leading-relaxed">
                To complete this action and start renting, you need to set up
                your profile first. This will only take a few minutes!
              </Paragraph1>

              {/* Modal Actions */}
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={handleProfileSetupProceed}
                  className="bg-black hover:bg-gray-800 px-4 py-3 rounded-lg w-full font-semibold text-white text-sm transition-colors"
                >
                  Proceed to Setup
                </button>
                <button
                  type="button"
                  onClick={() => setIsProfileSetupModalOpen(false)}
                  className="hover:bg-gray-50 px-4 py-3 border border-gray-300 rounded-lg w-full font-semibold text-gray-900 text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// --------------------
// Main Component
// --------------------

interface RentalPeriodsProps {
  productId: string;
  listerId: string;
  dailyPrice: number;
  collateralPrice: number;
  listingType?: "RENTAL" | "RESALE" | "RENT_OR_RESALE";
  resalePrice?: number | null;
}

const RentalPeriods: React.FC<RentalPeriodsProps> = ({
  productId,
  listerId,
  dailyPrice,
  collateralPrice,
  listingType,
  resalePrice,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: user } = useMe();

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => {
          if (!user) {
            // Capture current page URL
            const currentUrl = encodeURIComponent(window.location.href);
            window.location.href = `/auth/sign-in?redirect=${currentUrl}`;
            return;
          }
          setIsOpen(true);
        }}
        className="flex justify-center items-center gap-1 bg-black hover:bg-gray-100 px-4 py-2 border border-black rounded-lg w-full font-semibold text-white hover:text-black text-sm transition cursor-pointer"
      >
        <Paragraph1>Rent now</Paragraph1>
      </button>

      {/* Filter Panel */}
      <RentalPeriodsPanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        productId={productId}
        listerId={listerId}
        dailyPrice={dailyPrice}
        collateralPrice={collateralPrice}
        listingType={listingType}
        resalePrice={resalePrice}
      />
    </>
  );
};

export default RentalPeriods;
