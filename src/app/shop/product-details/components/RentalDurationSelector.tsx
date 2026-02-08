"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";

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
const rentalOptions = [
  { days: 3, price: "₦150,000" },
  { days: 6, price: "₦170,000" },
  { days: 9, price: "₦200,000" },
];

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

const Calendar = () => {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);

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

  // Function to determine if a day is "unavailable" (Placeholder logic)
  const isUnavailable = (day: number) => {
    // Example: Make days 24, 25, 26 unavailable in the current view
    return [24, 25, 26].includes(day);
  };

  // Function to determine if a day is part of the "selected range" (Placeholder logic)
  const isSelectedRange = (day: number) => {
    // Example: Days 13, 14, 15 are the selected range
    return [13, 14, 15].includes(day);
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
            dayClasses += " text-gray-400 bg-gray-100 cursor-not-allowed"; // Unavailable style
          } else if (isSelectedDay) {
            dayClasses += " bg-yellow-400 text-white shadow-md"; // Selected range style
          } else {
            dayClasses += " hover:bg-gray-50 cursor-pointer"; // Default style
          }

          return (
            <div key={index} className="flex justify-center items-center">
              <button className={dayClasses} disabled={isUnavailableDay}>
                <Paragraph1> {day}</Paragraph1>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- Main Component ---

export default function RentalDurationSelector() {
  const [selectedDuration, setSelectedDuration] = useState<number | "custom">(
    3,
  );

  return (
    <div className="py-6 ">
      <Paragraph1 className="text-xl font-bold text-gray-800 mb-4 tracking-wider">
        RENTAL DURATION
      </Paragraph1>

      {/* Duration Buttons */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-2 mb-8">
        {rentalOptions.map((option) => (
          <button
            key={option.days}
            onClick={() => setSelectedDuration(option.days)}
            className={`
              p-3 px-5 rounded-lg border text-sm font-semibold transition-colors
              ${
                selectedDuration === option.days
                  ? "bg-black text-white border-black" // Selected style
                  : "bg-white text-gray-800 border-gray-300 hover:border-gray-500" // Default style
              }
            `}
          >
            <Paragraph1>
              {" "}
              {option.days} Days <br /> {option.price}
            </Paragraph1>
          </button>
        ))}

        {/* Custom Button */}
        <button
          onClick={() => setSelectedDuration("custom")}
          className={`
            p-3 px-5 rounded-lg border text-sm font-semibold transition-colors
            ${
              selectedDuration === "custom"
                ? "bg-black text-white border-black" // Selected style (Matches image)
                : "bg-white text-gray-800 border-gray-300 hover:border-gray-500" // Default style
            }
          `}
        >
          <Paragraph1>
            {" "}
            Custom <br /> NO
          </Paragraph1>
        </button>
      </div>

      {/* Calendar Section */}
      <Calendar />

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
    </div>
  );
}
