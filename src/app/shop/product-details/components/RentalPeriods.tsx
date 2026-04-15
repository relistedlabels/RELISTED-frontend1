"use client";

import React, { useCallback, useState } from "react";
import { toast } from "sonner";
import {
  SlidersVertical,
  X,
  Search,
  ChevronLeft,
  ArrowLeft,
  Loader2,
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

  // const [rentalDays, setRentalDays] = useState(1);

  // State for rental days
  const [rentalDays, setRentalDays] = useState(3);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [autoPay, setAutoPay] = useState(false); // Default OFF
  const [summaryData, setSummaryData] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [countdownActive, setCountdownActive] = useState(false);
  const shippingFee = 5000; // Fixed amount, can be adjusted
  const submitRentalRequest = useSubmitRentalRequest();

  const addCartItem = useAddCartItem();

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
      const endDayOffset = isResale
        ? 0
        : rentalDays === 1
          ? 1
          : Math.max(0, rentalDays - 1);
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
                />
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
                    isChecking || countdownActive
                      ? "bg-gray-400 text-white cursor-not-allowed opacity-70"
                      : "bg-black text-white hover:bg-gray-900 active:scale-95"
                  }`}
                  onClick={handleCheckAvailability}
                  disabled={isChecking || countdownActive}
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
                  ) : (
                    "Check Availability"
                  )}
                </button>
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

      {/* Profile Setup Required Modal */}
      <AnimatePresence>
        {isProfileSetupModalOpen && (
          <motion.div
            className="z-[101] fixed inset-0 flex justify-center items-center bg-black/50 p-4"
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
