"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, AlertCircle, Loader2 } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import { useUserStore } from "@/store/useUserStore";
import { useMe } from "@/lib/queries/auth/useMe";
import LoginModal from "@/common/modals/LoginModal";
import { RentalCheckSkeleton } from "@/common/ui/SkeletonAuth";
import { useRentalError } from "@/common/components/RentalErrorBoundary";
import { useSubmitRentalRequest } from "@/lib/mutations/renters/useRentalRequestMutations";
import { useRentalRequests } from "@/lib/queries/renters/useRentalRequests";

// ============================================================================
// API ENDPOINTS USED:
// ============================================================================
// GET /api/public/products/:productId/availability - Fetch available dates for calendar
//   Returns: Available dates, unavailable dates, monthly availability percentages
//
// POST /api/renters/rental-requests - Send availability check to lister
//   Body Params: productId, listerId, rentalStartDate, rentalEndDate, rentalDays,
//               estimatedRentalPrice, deliveryAddressId, autoPay, currency
//   Requirements: Authentication required (show login modal if not authenticated)
//   Response includes: 15-minute countdown timer, requestId, cartItemId
//
// DELETE /api/renters/rental-requests/:requestId - Remove item from cart
//   Used when user removes pending requests
// ============================================================================

// --- Data for predefined durations ---
const rentalDayOptions = [3, 6, 9];

// --- Helper Functions for Date Logic ---

// Get the days in a given month/year
const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

// Get the day of the week for the first day of the month (0=Sun, 6=Sat)
const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay();
};

// Simple function to get month name
const getMonthName = (monthIndex: number) => {
  const date = new Date(2000, monthIndex);
  return date.toLocaleString("en-US", { month: "long" });
};

// --- Calendar Component ---
const Calendar = ({
  selectedDuration,
  customDays,
  startDate,
  setStartDate,
  unavailableDays = [],
}: {
  selectedDuration: number;
  customDays: number;
  startDate: Date;
  setStartDate: (date: Date) => void;
  unavailableDays?: number[];
}) => {
  const [currentDate, setCurrentDate] = useState(startDate);

  useEffect(() => {
    setCurrentDate(startDate);
  }, [startDate]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const startingDay = getFirstDayOfMonth(year, month);

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingArray = Array.from({ length: startingDay }, () => null);
  const totalDays = [...paddingArray, ...daysArray];

  // Logic for navigating months
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Function to determine if a day is "unavailable"
  const isUnavailable = (day: number) =>
    typeof day === "number" && unavailableDays.includes(day);

  // Function to determine if a day is part of the selected range
  const isSelectedRange = (day: number) => {
    if (typeof day !== "number") return false;
    const start =
      currentDate.getFullYear() === startDate.getFullYear() &&
      currentDate.getMonth() === startDate.getMonth()
        ? startDate.getDate()
        : 1;
    const duration = customDays || selectedDuration;
    return day >= start && day < start + duration && !isUnavailable(day);
  };

  // Handle selecting a new start date
  const handleDayClick = (day: number) => {
    if (typeof day === "number" && !isUnavailable(day)) {
      setStartDate(new Date(year, month, day));
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl  border border-gray-100">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={handlePrevMonth}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="text-lg font-semibold text-gray-800">
          {getMonthName(month)} {year}
        </div>
        <button
          onClick={handleNextMonth}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Days of the Week */}
      <div className="grid grid-cols-7 text-center text-sm font-medium text-gray-500 mb-2">
        {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
          <div key={day} className="py-2">
            <Paragraph1> {day}</Paragraph1>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {totalDays.map((day, index) => {
          if (day === null) {
            return <div key={index} className="h-10"></div>; // Placeholder padding
          }
          const isUnavailableDay = isUnavailable(day);
          const isSelectedDay = isSelectedRange(day);
          let dayClasses =
            "flex items-center justify-center h-10 w-full rounded-md text-gray-900 font-medium";
          if (isUnavailableDay) {
            dayClasses += " text-gray-400 bg-gray-100 cursor-not-allowed";
          } else if (isSelectedDay) {
            dayClasses += " bg-yellow-400 text-white shadow-md";
          } else {
            dayClasses += " hover:bg-gray-50 cursor-pointer";
          }
          return (
            <div key={index} className="flex justify-center items-center">
              <button
                className={dayClasses}
                disabled={isUnavailableDay}
                onClick={() => handleDayClick(day as number)}
              >
                <Paragraph1> {typeof day === "number" ? day : ""}</Paragraph1>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- Main Component ---

interface RentalDurationSelectorProps {
  productId: string;
  listerId: string;
  dailyPrice: number;
  securityDeposit: number;
}

const RentalDurationSelector = ({
  productId,
  listerId,
  dailyPrice,
  securityDeposit,
}: RentalDurationSelectorProps) => {
  const [selectedDuration, setSelectedDuration] = useState<number | "custom">(
    3,
  );
  const [customDays, setCustomDays] = useState<number>(3);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<boolean>(false);
  const { error, triggerError, clearError } = useRentalError();

  // Get user from store
  const token = useUserStore((state) => state.token);
  const userId = useUserStore((state) => state.userId);

  // Check auth status
  const { isLoading: isCheckingAuth, isError: authError } = useMe();
  const submitRentalRequest = useSubmitRentalRequest();

  // Countdown state for 15 min timer
  const [countdown, setCountdown] = useState<number | null>(null);
  const [countdownActive, setCountdownActive] = useState(false);

  // Fetch pending rental requests on mount
  const {
    data: pendingRequestsData,
    isLoading: isLoadingPendingRequests,
    refetch: refetchPendingRequests,
  } = useRentalRequests("pending");

  // Restore countdown from pending request if exists for this product
  useEffect(() => {
    if (
      pendingRequestsData &&
      Array.isArray(pendingRequestsData.rentalRequests)
    ) {
      const req = pendingRequestsData.rentalRequests.find(
        (r: any) =>
          r.productId === productId && r.status === "pending_lister_approval",
      );
      if (req) {
        // Calculate seconds remaining from expiresAt
        const expiresAt = new Date(req.expiresAt).getTime();
        const now = Date.now();
        const secondsLeft = Math.floor((expiresAt - now) / 1000);
        if (secondsLeft > 0) {
          setCountdown(secondsLeft);
          setCountdownActive(true);
        } else {
          setCountdown(null);
          setCountdownActive(false);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingRequestsData, productId]);

  // Countdown timer effect
  useEffect(() => {
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

  const handleCheckAvailability = useCallback(async () => {
    try {
      clearError();

      // If user is not authenticated, show login modal
      if (!token) {
        setIsLoginModalOpen(true);
        return;
      }

      setPendingAction(true);

      // Calculate rental days
      const rentalDays =
        selectedDuration === "custom" ? customDays : selectedDuration;
      // Calculate end date
      const rentalStartDate = startDate.toISOString();
      const rentalEndDate = new Date(
        startDate.getTime() + (rentalDays - 1) * 24 * 60 * 60 * 1000,
      ).toISOString();

      // Call mutation
      const res = await submitRentalRequest.mutateAsync({
        productId,
        rentalStartDate,
        rentalEndDate,
        autoPay: true,
      });

      // Show success toast
      toast.success("Rental request sent! Waiting for lister to confirm.");

      // Refetch pending requests to update state
      refetchPendingRequests();

      // Start 15 min countdown (900 seconds)
      setCountdown(900);
      setCountdownActive(true);
    } catch (error: any) {
      // Handle insufficient funds error
      if (
        error?.error === "INSUFFICIENT_FUNDS" ||
        error?.message?.includes("wallet balance")
      ) {
        triggerError(
          "Insufficient wallet balance. Please fund your wallet and try again.",
        );
      } else {
        const errorMessage = error?.message || "Failed to check availability";
        triggerError(errorMessage);
        toast.error(errorMessage);
      }
      console.error("Error checking availability:", error);
    } finally {
      setPendingAction(false);
    }
  }, [
    token,
    selectedDuration,
    customDays,
    startDate,
    submitRentalRequest,
    clearError,
    triggerError,
    productId,
    refetchPendingRequests,
  ]);

  const handleLoginSuccess = useCallback(() => {
    console.log("Login successful, proceeding with availability check");
    // After successful login, automatically proceed with availability check
    setTimeout(() => {
      handleCheckAvailability();
    }, 500);
  }, [handleCheckAvailability]);

  // Show loading state while checking auth
  if (isCheckingAuth) {
    return (
      <div className="py-6">
        <Paragraph1 className="text-xl font-bold text-gray-800 mb-4 tracking-wider">
          RENTAL DURATION
        </Paragraph1>
        <RentalCheckSkeleton />
      </div>
    );
  }

  return (
    <>
      <div className="py-6 ">
        <Paragraph1 className="text-xl font-bold text-gray-800 mb-4 tracking-wider">
          RENTAL DURATION
        </Paragraph1>

        {/* Auth Error Alert */}
        {authError && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-3">
            <AlertCircle size={20} className="text-yellow-600 flex-shrink-0" />
            <div>
              <Paragraph1 className="text-sm text-yellow-800">
                Having trouble verifying your session. Please refresh the page.
              </Paragraph1>
            </div>
          </div>
        )}

        {/* Request Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
            <div className="flex-1">
              <Paragraph1 className="text-sm text-red-800 font-medium">
                {error.message}
              </Paragraph1>
            </div>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-800"
            >
              ✕
            </button>
          </div>
        )}

        {/* Duration Buttons */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-2 mb-8">
          {rentalDayOptions.map((days) => (
            <button
              key={days}
              onClick={() => {
                setSelectedDuration(days);
                setShowCustomInput(false);
                setCustomDays(days);
              }}
              className={`
                p-3 px-5 rounded-lg border text-sm font-semibold transition-colors
                ${
                  selectedDuration === days && !showCustomInput
                    ? "bg-black text-white border-black"
                    : "bg-white text-gray-800 border-gray-300 hover:border-gray-500"
                }
              `}
            >
              <Paragraph1>
                {days} Days <br /> ₦{(days * dailyPrice).toLocaleString()}
              </Paragraph1>
            </button>
          ))}
          {/* Custom Button */}
          <button
            onClick={() => {
              setSelectedDuration("custom");
              setShowCustomInput(true);
            }}
            className={`
              p-3 px-5 rounded-lg border text-sm font-semibold transition-colors
              ${
                selectedDuration === "custom" || showCustomInput
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-800 border-gray-300 hover:border-gray-500"
              }
            `}
          >
            <Paragraph1>
              Custom <br />
              {customDays
                ? `₦${(customDays * dailyPrice).toLocaleString()}`
                : "Set days"}
            </Paragraph1>
          </button>
        </div>
        {/* Custom Days Dropdown */}
        {showCustomInput && (
          <div className="mb-4 flex items-center gap-2">
            <Paragraph1>Enter days:</Paragraph1>
            <input
              type="number"
              min={2}
              max={30}
              value={customDays}
              onChange={(e) => {
                // Enforce min 2, max 12
                let val = Number(e.target.value);
                if (isNaN(val)) val = 2;
                val = Math.max(2, Math.min(12, val));
                setCustomDays(val);
              }}
              className="border rounded px-2 py-1 w-20 text-center"
            />
          </div>
        )}

        {/* Calendar Section */}
        <Calendar
          selectedDuration={
            selectedDuration === "custom"
              ? Math.max(2, Math.min(12, customDays))
              : Math.max(2, Math.min(12, selectedDuration as number))
          }
          customDays={
            selectedDuration === "custom"
              ? Math.max(2, Math.min(12, customDays))
              : 0
          }
          startDate={startDate}
          setStartDate={setStartDate}
          unavailableDays={[]}
        />

        {/* Legends */}
        <div className="flex justify-center gap-6 mt-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-yellow-400 rounded"></span>
            <Paragraph1>Selected range</Paragraph1>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-gray-300 rounded"></span>
            <Paragraph1>Unavailable</Paragraph1>
          </div>
        </div>

        {/* Check Availability Button */}
        <button
          onClick={handleCheckAvailability}
          disabled={
            pendingAction || isCheckingAuth || authError || countdownActive
          }
          className={`
            w-full mt-6 py-3 px-4 rounded-lg font-semibold transition-all
            flex items-center justify-center gap-2
            ${
              pendingAction || isCheckingAuth || authError || countdownActive
                ? "bg-gray-400 text-white cursor-not-allowed opacity-70"
                : "bg-black text-white hover:bg-gray-900 active:scale-95"
            }
          `}
        >
          {pendingAction ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Checking Availability...</span>
            </>
          ) : isCheckingAuth ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Verifying...</span>
            </>
          ) : countdownActive && countdown !== null ? (
            <span>
              {Math.floor(countdown / 60)
                .toString()
                .padStart(2, "0")}
              :{(countdown % 60).toString().padStart(2, "0")} min left
            </span>
          ) : (
            "Check Availability"
          )}
        </button>
        {countdownActive && countdown !== null && (
          <div className="text-center mt-2 text-yellow-700 font-medium">
            Waiting for Lister to confirm request...
          </div>
        )}
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
};
export default RentalDurationSelector;
