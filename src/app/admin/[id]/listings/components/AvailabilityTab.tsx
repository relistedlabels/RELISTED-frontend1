"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  AlertCircle,
  Clock,
} from "lucide-react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { useProductAvailability } from "@/lib/queries/admin/useListings";

interface AvailabilityTabProps {
  productId: string;
}

export default function AvailabilityTab({ productId }: AvailabilityTabProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today);

  // Fetch availability data from API
  const {
    data: availabilityData,
    isLoading,
    error,
  } = useProductAvailability(
    productId,
    currentMonth.getMonth() + 1,
    currentMonth.getFullYear(),
  );

  const availability = availabilityData?.data;

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentMonth);
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1),
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1),
    );
  };

  // Get availability status for a specific date
  const getDateStatus = (day: number) => {
    if (!availability?.calendar) return "unavailable";
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const entry = availability.calendar.find((e) => e.date === dateStr);
    return entry?.status || "unavailable";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Paragraph1>Loading availability data...</Paragraph1>
      </div>
    );
  }

  if (error || !availability) {
    return (
      <div className="flex items-center justify-center p-8">
        <Paragraph1 className="text-red-600">
          Failed to load availability data
        </Paragraph1>
      </div>
    );
  }

  // Build dynamic stats
  const stats = [
    {
      label: "Next Available Date",
      value: availability.nextAvailableDate
        ? new Date(availability.nextAvailableDate).toLocaleDateString()
        : "N/A",
      icon: Calendar,
      color: "text-gray-700",
    },
    {
      label: "Currently Rented",
      value: availability.currentlyRented
        ? `Yes (until ${new Date(availability.currentRentalEndDate || "").toLocaleDateString()})`
        : "No",
      icon: AlertCircle,
      color: availability.currentlyRented ? "text-red-600" : "text-green-600",
    },
    {
      label: "Days Rented This Month",
      value: `${availability.stats.daysRentedThisMonth} Days`,
      icon: Clock,
      color: "text-blue-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Availability Overview */}
      <div>
        <Paragraph3 className="text-base font-bold text-gray-900 mb-4">
          Availability Overview
        </Paragraph3>
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-gray-50 p-4 rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-2 mb-2">
                  <IconComponent size={18} className={stat.color} />
                  <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {stat.label}
                  </Paragraph1>
                </div>
                <Paragraph1 className="text-sm font-semibold text-gray-900">
                  {stat.value}
                </Paragraph1>
              </div>
            );
          })}
        </div>
      </div>

      {/* Booking Calendar */}
      <div>
        <Paragraph3 className="text-base font-bold text-gray-900 mb-4">
          Booking Calendar - {availability.stats.totalRentalsThisMonth} Rentals
          ({availability.stats.totalRentalRevenue.toLocaleString()} NGN)
        </Paragraph3>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ChevronLeft size={20} />
            </button>
            <Paragraph3 className="text-lg font-bold text-gray-900">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </Paragraph3>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {dayNames.map((day) => (
              <div key={day} className="text-center py-2">
                <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {day}
                </Paragraph1>
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2 mb-6">
            {/* Empty cells for days before month starts */}
            {Array.from({ length: firstDayOfMonth }).map((_, index) => (
              <div key={`empty-${index}`}></div>
            ))}

            {/* Days of the month */}
            {daysArray.map((day) => {
              const status = getDateStatus(day);
              const isRented = status === "rented";
              return (
                <div
                  key={day}
                  className={`py-2 flex items-center justify-center rounded-lg text-xs font-medium transition relative group ${
                    isRented
                      ? "bg-red-100 text-red-700 cursor-not-allowed"
                      : "bg-green-100 text-green-700 hover:bg-green-200"
                  }`}
                  title={isRented ? "Rented" : "Available"}
                >
                  {day}
                  {isRented && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded p-2 whitespace-nowrap z-10">
                      Click to view booking details
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 rounded border border-green-700"></div>
              <Paragraph1 className="text-xs text-gray-600">
                Available
              </Paragraph1>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 rounded border border-red-700"></div>
              <Paragraph1 className="text-xs text-gray-600">Rented</Paragraph1>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
