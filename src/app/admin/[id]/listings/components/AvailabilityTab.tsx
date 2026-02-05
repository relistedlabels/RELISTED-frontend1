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

interface AvailabilityProps {
  nextAvailableDate?: string;
  currentlyRented?: boolean;
  daysRentedThisMonth?: number;
}

const RENTAL_PACKAGES = [
  { duration: "3 Days", price: "₦75,000" },
  { duration: "6 Days", price: "₦175,000" },
  { duration: "9 Days", price: "₦500,000" },
  { duration: "Custom", price: "NO" },
];

const AVAILABILITY_STATS = [
  {
    label: "Next Available Date",
    value: "Oct 22, 2025",
    icon: Calendar,
    color: "text-gray-700",
  },
  {
    label: "Currently Rented",
    value: "Yes (until Oct 20)",
    icon: AlertCircle,
    color: "text-red-600",
  },
  {
    label: "Days Rented This Month",
    value: "10 Days",
    icon: Clock,
    color: "text-blue-600",
  },
];

export default function AvailabilityTab({
  nextAvailableDate = "Oct 22, 2025",
  currentlyRented = true,
  daysRentedThisMonth = 10,
}: AvailabilityProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 9)); // October 2025
  const [selectedDates, setSelectedDates] = useState<number[]>([]);

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

  // Mock unavailable dates
  const unavailableDates = [22, 23, 24, 25, 26, 27, 28, 29, 30];

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

  const isDateUnavailable = (day: number) => unavailableDates.includes(day);

  return (
    <div className="space-y-6">
      {/* Rental Duration */}
      <div>
        <Paragraph3 className="text-base font-bold text-gray-900 mb-4">
          Rental Duration
        </Paragraph3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {RENTAL_PACKAGES.map((pkg, index) => (
            <button
              key={index}
              className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-center"
            >
              <Paragraph1 className="text-sm font-semibold text-gray-900 mb-1">
                {pkg.duration}
              </Paragraph1>
              <Paragraph1 className="text-sm font-bold text-gray-700">
                {pkg.price}
              </Paragraph1>
            </button>
          ))}
        </div>
      </div>

      {/* Availability Overview */}
      <div>
        <Paragraph3 className="text-base font-bold text-gray-900 mb-4">
          Availability Overview
        </Paragraph3>
        <div className="grid grid-cols-3 gap-4">
          {AVAILABILITY_STATS.map((stat) => {
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
          Booking Calendar
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
              const isUnavailable = isDateUnavailable(day);
              return (
                <button
                  key={day}
                  className={`py-2 flex items-center justify-center rounded-lg text-xs font-medium transition ${
                    isUnavailable
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : day >= 10 && day <= 20
                        ? "bg-yellow-300 text-gray-900"
                        : "text-gray-900 hover:bg-gray-100"
                  }`}
                  disabled={isUnavailable}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-300 rounded"></div>
              <Paragraph1 className="text-xs text-gray-600">
                Selected range
              </Paragraph1>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
              <Paragraph1 className="text-xs text-gray-600">
                Unavailable
              </Paragraph1>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
