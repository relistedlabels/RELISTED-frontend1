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
import { Paragraph1, Paragraph2, Paragraph3 } from "@/common/ui/Text";
import Button from "@/common/ui/Button";
import RentalDurationSelector from "./RentalDurationSelector";
import RentalSummaryCard from "./RentalSummaryCard";
import { useSubmitRentalRequest } from "@/lib/mutations/renters/useRentalRequestMutations";
import RentalCartView from "../../cart/components/RentalCartView";
import { useMe } from "@/lib/queries/auth/useMe";
import { useAddresses } from "@/lib/queries/renters/useAddresses";
import { useAddProfileAddress } from "@/lib/queries/renters/useProfileDetails";
import { StateSelect } from "@/app/auth/profile-setup/components/StateSelect";
import { CityLGASelect } from "@/app/auth/profile-setup/components/CityLGASelect";
import Link from "next/link";

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
  const { data: addresses, isLoading: isAddressesLoading } = useAddresses();
  const addAddressMutation = useAddProfileAddress();
  const queryClient = useQueryClient();

  // Address modal state
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addressFormData, setAddressFormData] = useState({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Nigeria",
    type: "residential",
    isDefault: true, // Default to true since they need an address
  });

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
      // Get default addressId from addresses
      let deliveryAddressId = "";
      if (addresses && Array.isArray(addresses)) {
        // API returns addresses as [{ id, ... }], not addressId
        const defaultAddr = addresses.find((a) => a.isDefault);
        deliveryAddressId = defaultAddr?.id || addresses[0]?.id || "";
      }
      if (!deliveryAddressId) {
        // Open address modal instead of error
        setIsAddressModalOpen(true);
        setIsChecking(false);
        return;
      }
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

  // Handle add address
  const handleAddAddress = () => {
    if (
      !addressFormData.street.trim() ||
      !addressFormData.city.trim() ||
      !addressFormData.state.trim()
    ) {
      toast.error("Please fill in street, city, and state fields");
      return;
    }

    addAddressMutation.mutate(
      {
        type: addressFormData.type,
        street: addressFormData.street,
        city: addressFormData.city,
        state: addressFormData.state,
        postalCode: addressFormData.postalCode,
        country: addressFormData.country,
        isDefault: addressFormData.isDefault,
      },
      {
        onSuccess: () => {
          toast.success("Address added successfully!");
          setIsAddressModalOpen(false);
          setAddressFormData({
            street: "",
            city: "",
            state: "",
            postalCode: "",
            country: "Nigeria",
            type: "residential",
            isDefault: true,
          });
          // Invalidate addresses query to refetch
          queryClient.invalidateQueries({ queryKey: ["renters", "addresses"] });
          // After adding address, retry the check availability
          handleCheckAvailability();
        },
        onError: (error: any) => {
          toast.error(error?.message || "Failed to add address");
        },
      },
    );
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
                <div className="flex items-center gap-2 mt-4">
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

      {/* Address Modal */}
      <AnimatePresence>
        {isAddressModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-lg max-w-md w-full p-6 shadow-lg"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <Paragraph3 className="text-lg font-bold text-gray-900 mb-4">
                Add Delivery Address
              </Paragraph3>

              <div className="space-y-4">
                {/* Street */}
                <div>
                  <label className="text-sm font-medium text-gray-900 mb-1 block">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    value={addressFormData.street}
                    onChange={(e) =>
                      setAddressFormData({
                        ...addressFormData,
                        street: e.target.value,
                      })
                    }
                    placeholder="e.g., 123 Main Street"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition"
                  />
                </div>

                {/* City */}
                <div>
                  <label className="text-sm font-medium text-gray-900 mb-1 block">
                    City *
                  </label>
                  <CityLGASelect
                    value={addressFormData.city}
                    onChange={(value) =>
                      setAddressFormData({
                        ...addressFormData,
                        city: value,
                      })
                    }
                  />
                </div>

                {/* State */}
                <div>
                  <label className="text-sm font-medium text-gray-900 mb-1 block">
                    State *
                  </label>
                  <StateSelect
                    value={addressFormData.state}
                    onChange={(value) =>
                      setAddressFormData({
                        ...addressFormData,
                        state: value,
                      })
                    }
                  />
                </div>

                {/* Postal Code */}
                <div>
                  <label className="text-sm font-medium text-gray-900 mb-1 block">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={addressFormData.postalCode}
                    onChange={(e) =>
                      setAddressFormData({
                        ...addressFormData,
                        postalCode: e.target.value,
                      })
                    }
                    placeholder="e.g., 100001"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition"
                  />
                </div>

                {/* Address Type */}
                <div>
                  <label className="text-sm font-medium text-gray-900 mb-1 block">
                    Address Type
                  </label>
                  <select
                    value={addressFormData.type}
                    onChange={(e) =>
                      setAddressFormData({
                        ...addressFormData,
                        type: e.target.value,
                      })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition"
                  >
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Default Address Checkbox */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={addressFormData.isDefault}
                    onChange={(e) =>
                      setAddressFormData({
                        ...addressFormData,
                        isDefault: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-black cursor-pointer"
                  />
                  <label
                    htmlFor="isDefault"
                    className="ml-2 text-sm font-medium text-gray-900 cursor-pointer"
                  >
                    Set as default address
                  </label>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="flex-1 px-4 py-2 text-sm font-semibold text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddAddress}
                  disabled={addAddressMutation.isPending}
                  className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-black rounded-lg hover:bg-gray-800 disabled:opacity-50 transition"
                >
                  {addAddressMutation.isPending ? "Adding..." : "Add Address"}
                </button>
              </div>

              {addAddressMutation.isError && (
                <Paragraph1 className="text-red-600 text-sm mt-3">
                  Error:{" "}
                  {(addAddressMutation.error as any)?.message ||
                    "Failed to add address"}
                </Paragraph1>
              )}
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
