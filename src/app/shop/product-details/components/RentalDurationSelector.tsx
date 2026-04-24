"use client";

import { AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useRentalError } from "@/common/components/RentalErrorBoundary";
import { RentalCheckSkeleton } from "@/common/ui/SkeletonAuth";
import { Paragraph1 } from "@/common/ui/Text";
import { useSubmitRentalRequest } from "@/lib/mutations/renters/useRentalRequestMutations";
import { useMe } from "@/lib/queries/auth/useMe";
import { useUserStore } from "@/store/useUserStore";

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
const rentalDayOptions = [1, 2, 3];

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
  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();
  const todayDay = today.getDate();

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

  const isSameDayDeliveryDate = (day: number) =>
    year === todayYear && month === todayMonth && day === todayDay;

  const isClickDisabledDay = (day: number) =>
    typeof day === "number" &&
    (!isSameDayDeliveryDate(day) || isUnavailable(day));

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
    if (
      typeof day === "number" &&
      isSameDayDeliveryDate(day) &&
      !isUnavailable(day)
    ) {
      setStartDate(new Date(year, month, day));
    }
  };

  return (
    <div className="bg-white p-4 border border-gray-100 rounded-xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={handlePrevMonth}
          disabled
          className="opacity-50 p-1 rounded-full cursor-not-allowed"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="font-semibold text-gray-800 text-lg">
          {getMonthName(month)} {year}
        </div>
        <button
          onClick={handleNextMonth}
          disabled
          className="opacity-50 p-1 rounded-full cursor-not-allowed"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Days of the Week */}
      <div className="grid grid-cols-7 mb-2 font-medium text-gray-500 text-sm text-center">
        {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
          <div key={day} className="py-2">
            <Paragraph1> {day}</Paragraph1>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="gap-y-1 grid grid-cols-7 text-center">
        {totalDays.map((day, index) => {
          if (day === null) {
            return <div key={index} className="h-10"></div>; // Placeholder padding
          }
          const isUnavailableDay = isUnavailable(day);
          const isClickDisabled = isClickDisabledDay(day);
          const isSelectedDay = isSelectedRange(day);
          let dayClasses =
            "flex items-center justify-center h-10 w-full rounded-md text-gray-900 font-medium";
          if (isUnavailableDay) {
            dayClasses += " text-gray-400 bg-gray-100 cursor-not-allowed";
          } else if (isSelectedDay) {
            dayClasses += " bg-yellow-400 text-white shadow-md";
          } else if (isClickDisabled) {
            dayClasses += " text-gray-400 cursor-not-allowed";
          } else {
            dayClasses += " hover:bg-gray-50 cursor-pointer";
          }
          return (
            <div key={index} className="flex justify-center items-center">
              <button
                className={dayClasses}
                disabled={isClickDisabled}
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
  collateralPrice: number;
  onChangeRentalDays?: (days: number, startDate?: Date) => void;
}

const RentalDurationSelector = ({
  productId,
  listerId,
  dailyPrice,
  collateralPrice,
  onChangeRentalDays,
}: RentalDurationSelectorProps) => {
  const [selectedDuration, setSelectedDuration] = useState<number | "custom">(
    3,
  );
  const [customDays, setCustomDays] = useState<number>(3);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [showCustomInput, setShowCustomInput] = useState(false);

  useEffect(() => {
    const rentalDays =
      selectedDuration === "custom" ? customDays : selectedDuration;
    onChangeRentalDays?.(rentalDays as number, startDate);
  }, [selectedDuration, customDays, startDate, onChangeRentalDays]);
  const [_isLoginModalOpen, _setIsLoginModalOpen] = useState(false);
  const [_pendingAction, _setPendingAction] = useState<boolean>(false);
  const { error, triggerError, clearError } = useRentalError();

  // Get user from store
  const _token = useUserStore((state) => state.token);
  const _userId = useUserStore((state) => state.userId);

  // Check auth status
  const { isLoading: isCheckingAuth, isError: authError } = useMe();
  const _submitRentalRequest = useSubmitRentalRequest();

  // Show loading state while checking auth
  if (isCheckingAuth) {
    return (
      <div className="py-6">
        <Paragraph1 className="mb-4 font-bold text-gray-800 text-xl tracking-wider">
          RENTAL DURATION
        </Paragraph1>
        <RentalCheckSkeleton />
      </div>
    );
  }

  return (
    <div className="py-6">
      <Paragraph1 className="mb-4 font-bold text-gray-800 text-xl tracking-wider">
        RENTAL DURATION
      </Paragraph1>

      {/* Auth Error Alert */}
      {authError && (
        <div className="flex gap-3 bg-yellow-50 mb-4 p-3 border border-yellow-200 rounded-lg">
          <AlertCircle size={20} className="flex-shrink-0 text-yellow-600" />
          <div>
            <Paragraph1 className="text-yellow-800 text-sm">
              Having trouble verifying your session. Please refresh the page.
            </Paragraph1>
          </div>
        </div>
      )}

      {/* Request Error Alert */}
      {error && (
        <div className="flex gap-3 bg-red-50 mb-4 p-3 border border-red-200 rounded-lg">
          <AlertCircle size={20} className="flex-shrink-0 text-red-600" />
          <div className="flex-1">
            <Paragraph1 className="font-medium text-red-800 text-sm">
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
      <div className="gap-2 grid grid-cols-2 xl:grid-cols-4 mb-8">
        {rentalDayOptions.map((days, _idx) => (
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
              {days === 1 ? "1 Day" : `${days} Days`} <br /> ₦
              {(days * dailyPrice).toLocaleString()}
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
              : "Set any days"}
          </Paragraph1>
        </button>
      </div>
      {/* Custom Days Dropdown */}
      {showCustomInput && (
        <div className="flex items-center gap-2 mb-4">
          <Paragraph1>Enter any number of days:</Paragraph1>
          <input
            type="number"
            min={1}
            max={30}
            value={customDays}
            onChange={(e) => {
              let val = Number(e.target.value);
              if (Number.isNaN(val)) val = 1;
              val = Math.max(1, Math.min(30, val));
              setCustomDays(val);
            }}
            className="px-2 py-1 border rounded w-20 text-center"
          />
        </div>
      )}

      <div className="flex gap-3 bg-blue-50 mb-4 p-3 border border-blue-200 rounded-lg">
        <AlertCircle size={20} className="text-blue-700 shrink-0" />
        <Paragraph1 className="text-blue-900 text-sm leading-relaxed">
          Same-day delivery only for now. Scheduled deliveries aren’t available
          yet.
        </Paragraph1>
      </div>

      {/* Calendar Section */}
      <Calendar
        selectedDuration={
          selectedDuration === "custom"
            ? customDays
            : (selectedDuration as number)
        }
        customDays={selectedDuration === "custom" ? customDays : 0}
        startDate={startDate}
        setStartDate={setStartDate}
        unavailableDays={[]}
      />

      {/* Legends */}
      <div className="flex justify-center gap-6 mt-6 text-gray-600 text-sm">
        <div className="flex items-center gap-2">
          <span className="bg-yellow-400 rounded w-4 h-4"></span>
          <Paragraph1>Selected range</Paragraph1>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-gray-300 rounded w-4 h-4"></span>
          <Paragraph1>Unavailable</Paragraph1>
        </div>
      </div>
    </div>
  );
};
export default RentalDurationSelector;
