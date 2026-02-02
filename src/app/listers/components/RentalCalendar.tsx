"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";

const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const RentalCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isPastDate = (day: number) => {
    const date = new Date(year, month, day);
    return date < today;
  };

  const isSelected = (day: number) => {
    if (!startDate) return false;
    const date = new Date(year, month, day);

    if (startDate && !endDate) {
      return date.getTime() === startDate.getTime();
    }

    if (startDate && endDate) {
      return date >= startDate && date <= endDate;
    }

    return false;
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(year, month, day);

    if (isPastDate(day)) return;

    if (!startDate || (startDate && endDate)) {
      setStartDate(clickedDate);
      setEndDate(null);
    } else if (clickedDate < startDate) {
      setStartDate(clickedDate);
    } else {
      setEndDate(clickedDate);
    }
  };

  const changeMonth = (direction: "prev" | "next") => {
    setCurrentDate(new Date(year, month + (direction === "next" ? 1 : -1), 1));
  };

  return (
    <div className="w-full  bg-white rounded-2xl p-4 border border-gray-300 ">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => changeMonth("prev")}
          className="p-2 border border-gray-100 rounded-lg hover:bg-gray-50"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>

        <Paragraph1 className="text-lg font-bold text-black">
          {currentDate.toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </Paragraph1>

        <button
          onClick={() => changeMonth("next")}
          className="p-2 border border-gray-100 rounded-lg hover:bg-gray-50"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-y-2 text-center">
        {daysOfWeek.map((day) => (
          <span
            key={day}
            className="text-[10px] font-bold text-gray-500 tracking-wider"
          >
            {day}
          </span>
        ))}

        {/* Empty cells before first day */}
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {/* Days */}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const past = isPastDate(day);
          const selected = isSelected(day);

          return (
            <button
              key={day}
              onClick={() => handleDateClick(day)}
              disabled={past}
              className={`
                w-10 h-10 mx-auto rounded-lg text-sm font-bold transition
                ${selected ? "bg-black text-white" : ""}
                ${
                  past
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-black hover:bg-gray-100"
                }
              `}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex justify-center space-x-6 mt-10 pt-6 border-t border-gray-50">
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 rounded border border-gray-300 bg-white" />
          <span className="text-xs font-semibold text-gray-700">Available</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 rounded bg-black" />
          <span className="text-xs font-semibold text-gray-700">Selected</span>
        </div>
      </div>
    </div>
  );
};

export default RentalCalendar;
