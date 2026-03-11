"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import {
  SlidersVertical,
  X,
  Search,
  ChevronLeft,
  ArrowLeft,
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
  securityDeposit: number;
}

const RentalPeriodsPanel: React.FC<RentalPeriodsPanelProps> = ({
  isOpen,
  onClose,
  productId,
  listerId,
  dailyPrice,
  securityDeposit,
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

  // Handler to update rental days and start date from child
  const handleRentalDaysChange = (days: number, start?: Date) => {
    setRentalDays(days);
    if (start) setStartDate(start);
  };

  // Handler for Check Availability
  const handleCheckAvailability = async () => {
    setIsChecking(true);
    setSummaryData(null);
    try {
      // Wait for both profile and addresses to load
      if (isProfileLoading || isAddressesLoading) {
        toast.info("Loading your profile and addresses...");
        setIsChecking(false);
        return;
      }

      // Detailed logging for debugging
      console.group("🔍 Profile Check Debug");
      console.log("Profile data present:", !!profileData);
      console.log("Profile data:", profileData);
      console.log("Profile error:", isProfileError);
      console.log("Addresses present:", !!addresses);
      console.log("Addresses data:", addresses);
      console.log("Addresses count:", addresses?.length || 0);
      console.groupEnd();

      // Check if profile exists
      if (!profileData) {
        toast.error("Profile not found. Please complete your profile setup.");
        setIsChecking(false);
        setIsProfileSetupModalOpen(true);
        return;
      }

      // Check if there's a profile error
      if (isProfileError) {
        toast.error("Error loading profile. Please try again.");
        setIsChecking(false);
        setIsProfileSetupModalOpen(true);
        return;
      }

      // Check if addresses exist
      if (!addresses || addresses.length === 0) {
        toast.info("Please add a delivery address to continue.");
        setIsChecking(false);
        setIsProfileSetupModalOpen(true);
        return;
      }

      // Get default address from addresses (using GET /api/renters/profile/addresses)
      const defaultAddr = addresses.find((a) => a.isDefault);
      const deliveryAddressId = defaultAddr?.id || addresses[0]?.id || "";

      if (!deliveryAddressId) {
        toast.error("Unable to select a delivery address. Please try again.");
        setIsChecking(false);
        return;
      }

      // --- Add to cart with only productId and days using mutation hook ---
      try {
        await addCartItem.mutateAsync({ productId, days: rentalDays });
      } catch (cartErr: any) {
        console.error("❌ Error posting cart item:", cartErr);
        toast.error(cartErr?.message || "Could not add to cart.");
      }

      console.log("✅ All checks passed. Proceeding with rental request...");

      const rentalStartDate = startDate.toISOString();
      const rentalEndDate = new Date(
        startDate.getTime() + (rentalDays - 1) * 24 * 60 * 60 * 1000,
      ).toISOString();
      const estimatedRentalPrice = dailyPrice * rentalDays;
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
            className="fixed inset-0 z-99 bg-black/70 backdrop--blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="fixed top-0 right-0 h-screen hide-scrollbar overflow-y-auto bg-white shadow-2xl px-4  flex flex-col w-full sm:w-114"
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
              <div className="flex justify-between sticky top-0 items-center pb-4 border-b border-gray-100 pt-6 z-10  bg-white">
                <button
                  onClick={onClose}
                  className="text-gray-500 xl:hidden hover:text-black p-1 rounded-full transition"
                  aria-label="Close RentalPeriods"
                >
                  <ArrowLeft size={20} />
                </button>

                <Paragraph1 className=" font-bold tracking-widest text-gray-800">
                  CHOOSE RENTAL PERIOD
                </Paragraph1>
                <button
                  onClick={onClose}
                  className="text-gray-500  hover:text-black p-1 rounded-full transition"
                  aria-label="Close RentalPeriods"
                >
                  <X className=" hidden xl:flex" size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="grow pt-4 pb-20 space-y-8">
                <RentalDurationSelector
                  productId={productId}
                  listerId={listerId}
                  dailyPrice={dailyPrice}
                  securityDeposit={securityDeposit}
                  onChangeRentalDays={(days, start) =>
                    handleRentalDaysChange(days, start)
                  }
                />
                <div className="flex- hidden items-center gap-2 mt-4">
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
                  className={`mt-4 w-full py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                    isChecking || countdownActive
                      ? "bg-gray-400 text-white cursor-not-allowed opacity-70"
                      : "bg-black text-white hover:bg-gray-900 active:scale-95"
                  }`}
                  onClick={handleCheckAvailability}
                  disabled={isChecking || countdownActive}
                >
                  {isChecking ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>Checking...
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
                  <div className="text-center mt-2 text-yellow-700 font-medium">
                    Waiting for Lister to confirm request...
                  </div>
                )}
                {summaryData && (
                  <RentalSummaryCard
                    rentalDays={summaryData.rentalDays}
                    rentalFeePerPeriod={summaryData.estimatedPrice.rentalFee}
                    securityDeposit={summaryData.estimatedPrice.securityDeposit}
                    cleaningFee={0}
                    shippingFee={summaryData.estimatedPrice.deliveryFee}
                  />
                )}
              </div>

              {/* Footer */}
              <div className="mt-auto py-2 bg-white flex justify-between gap-4 sticky bottom-0">
                <button className="flex-1  px-4 py-3 text-sm font-semibold border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                  <Paragraph1>Cancel </Paragraph1>
                </button>

                <Link
                  href="/shop/cart"
                  className="border flex-1 rounded-lg bg-black text-white px-4 items-center   justify-center  w-full py- flex gap-1 cursor-pointer  transition "
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
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[101] p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl max-w-md w-full p-8 shadow-xl"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
            >
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
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
              <Paragraph2 className="text-2xl font-bold text-center text-gray-900 mb-2">
                Complete Your Profile
              </Paragraph2>

              {/* Description */}
              <Paragraph1 className="text-center text-gray-600 mb-6 leading-relaxed">
                To complete this action and start renting, you need to set up
                your profile first. This will only take a few minutes!
              </Paragraph1>

              {/* Modal Actions */}
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={handleProfileSetupProceed}
                  className="w-full px-4 py-3 text-sm font-semibold text-white bg-black rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Proceed to Setup
                </button>
                <button
                  type="button"
                  onClick={() => setIsProfileSetupModalOpen(false)}
                  className="w-full px-4 py-3 text-sm font-semibold text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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
  securityDeposit: number;
}

const RentalPeriods: React.FC<RentalPeriodsProps> = ({
  productId,
  listerId,
  dailyPrice,
  securityDeposit,
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
        className="border px-4 items-center rounded-lg bg-black text-white justify-center w-full py-2 flex gap-1 cursor-pointer font-semibold hover:text-black text-sm border-black hover:bg-gray-100 transition"
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
        securityDeposit={securityDeposit}
      />
    </>
  );
};

export default RentalPeriods;
