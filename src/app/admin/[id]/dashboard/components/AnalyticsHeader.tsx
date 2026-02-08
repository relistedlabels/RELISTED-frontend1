// ENDPOINTS: GET /api/admin/analytics/stats (with timeframe filters)
"use client";
import React, { useState, useRef, useEffect } from "react";
import { Paragraph1, Paragraph2 } from "@/common/ui/Text";
import {
  HiOutlineChevronDown,
  HiOutlineMapPin,
  HiOutlineClock,
  HiOutlineScale,
  HiOutlineAcademicCap,
} from "react-icons/hi2";
import { HiOutlineDownload } from "react-icons/hi";

interface StatItemProps {
  icon: React.ElementType;
  label: string;
}

const StatItem: React.FC<StatItemProps> = ({ icon: Icon, label }) => (
  <div className="flex items-center gap-2 px-4 first:pl-0 border-r border-gray-200 last:border-0">
    <Icon className="w-4 h-4 text-yellow-600" />
    <Paragraph1 className="text-xs font-semibold text-gray-700">
      {label}
    </Paragraph1>
  </div>
);

type TimeframeType = "last6months" | "alltime" | "year" | "month";

const months = [
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

const getYears = () => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 10 }, (_, i) => currentYear - i);
};

const TimeframeDropdown: React.FC<{
  timeframeType: TimeframeType;
  selectedYear: number;
  selectedMonth: number;
  onTimeframeChange: (type: TimeframeType) => void;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
}> = ({
  timeframeType,
  selectedYear,
  selectedMonth,
  onTimeframeChange,
  onYearChange,
  onMonthChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isYearOpen, setIsYearOpen] = useState(false);
  const [isMonthOpen, setIsMonthOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setIsYearOpen(false);
        setIsMonthOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getDisplayLabel = () => {
    if (timeframeType === "last6months") return "Last 6 Months";
    if (timeframeType === "alltime") return "All Time";
    if (timeframeType === "year") return `Year ${selectedYear}`;
    if (timeframeType === "month")
      return `${months[selectedMonth]} ${selectedYear}`;
    return "Select Period";
  };

  return (
    <div ref={dropdownRef} className="flex items-center gap-2">
      {/* Main Timeframe Dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between px-4 py-2 border border-gray-200 rounded-lg bg-white cursor-pointer hover:bg-gray-50 transition-colors min-w-[180px]"
        >
          <Paragraph1 className="text-sm font-medium text-gray-700">
            {getDisplayLabel()}
          </Paragraph1>
          <HiOutlineChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <button
              onClick={() => {
                onTimeframeChange("last6months");
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
            >
              <Paragraph1
                className={`text-sm font-medium ${
                  timeframeType === "last6months"
                    ? "text-yellow-600"
                    : "text-gray-700"
                }`}
              >
                Last 6 Months
              </Paragraph1>
            </button>
            <button
              onClick={() => {
                onTimeframeChange("alltime");
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
            >
              <Paragraph1
                className={`text-sm font-medium ${
                  timeframeType === "alltime"
                    ? "text-yellow-600"
                    : "text-gray-700"
                }`}
              >
                All Time
              </Paragraph1>
            </button>
            <button
              onClick={() => {
                onTimeframeChange("year");
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
            >
              <Paragraph1
                className={`text-sm font-medium ${
                  timeframeType === "year" ? "text-yellow-600" : "text-gray-700"
                }`}
              >
                By Year
              </Paragraph1>
            </button>
            <button
              onClick={() => {
                onTimeframeChange("month");
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
            >
              <Paragraph1
                className={`text-sm font-medium ${
                  timeframeType === "month"
                    ? "text-yellow-600"
                    : "text-gray-700"
                }`}
              >
                By Month
              </Paragraph1>
            </button>
          </div>
        )}
      </div>

      {/* Year Dropdown - Show when "year" is selected */}
      {timeframeType === "year" && (
        <div className="relative">
          <button
            onClick={() => setIsYearOpen(!isYearOpen)}
            className="flex items-center justify-between px-4 py-2 border border-yellow-300 rounded-lg bg-yellow-50 cursor-pointer hover:bg-yellow-100 transition-colors min-w-[140px]"
          >
            <Paragraph1 className="text-sm font-medium text-gray-700">
              {selectedYear}
            </Paragraph1>
            <HiOutlineChevronDown
              className={`w-4 h-4 text-yellow-600 transition-transform ${
                isYearOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isYearOpen && (
            <div className="absolute top-full left-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
              {getYears().map((year) => (
                <button
                  key={year}
                  onClick={() => {
                    onYearChange(year);
                    setIsYearOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-yellow-50 transition-colors border-b border-gray-100 last:border-0"
                >
                  <Paragraph1
                    className={`text-sm font-medium ${
                      selectedYear === year
                        ? "text-yellow-600"
                        : "text-gray-700"
                    }`}
                  >
                    {year}
                  </Paragraph1>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Month & Year Dropdowns - Show when "month" is selected */}
      {timeframeType === "month" && (
        <>
          <div className="relative">
            <button
              onClick={() => setIsMonthOpen(!isMonthOpen)}
              className="flex items-center justify-between px-4 py-2 border border-yellow-300 rounded-lg bg-yellow-50 cursor-pointer hover:bg-yellow-100 transition-colors min-w-[140px]"
            >
              <Paragraph1 className="text-sm font-medium text-gray-700">
                {months[selectedMonth]}
              </Paragraph1>
              <HiOutlineChevronDown
                className={`w-4 h-4 text-yellow-600 transition-transform ${
                  isMonthOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isMonthOpen && (
              <div className="absolute top-full left-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                {months.map((month, index) => (
                  <button
                    key={month}
                    onClick={() => {
                      onMonthChange(index);
                      setIsMonthOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-yellow-50 transition-colors border-b border-gray-100 last:border-0"
                  >
                    <Paragraph1
                      className={`text-sm font-medium ${
                        selectedMonth === index
                          ? "text-yellow-600"
                          : "text-gray-700"
                      }`}
                    >
                      {month}
                    </Paragraph1>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setIsYearOpen(!isYearOpen)}
              className="flex items-center justify-between px-4 py-2 border border-yellow-300 rounded-lg bg-yellow-50 cursor-pointer hover:bg-yellow-100 transition-colors min-w-[140px]"
            >
              <Paragraph1 className="text-sm font-medium text-gray-700">
                {selectedYear}
              </Paragraph1>
              <HiOutlineChevronDown
                className={`w-4 h-4 text-yellow-600 transition-transform ${
                  isYearOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isYearOpen && (
              <div className="absolute top-full left-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                {getYears().map((year) => (
                  <button
                    key={year}
                    onClick={() => {
                      onYearChange(year);
                      setIsYearOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-yellow-50 transition-colors border-b border-gray-100 last:border-0"
                  >
                    <Paragraph1
                      className={`text-sm font-medium ${
                        selectedYear === year
                          ? "text-yellow-600"
                          : "text-gray-700"
                      }`}
                    >
                      {year}
                    </Paragraph1>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const AnalyticsHeader: React.FC = () => {
  const [timeframeType, setTimeframeType] =
    useState<TimeframeType>("last6months");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  return (
    <div className="w-full ">
      {/* Top Row: Title and Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <Paragraph2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          Analytics Overview
        </Paragraph2>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Timeframe Selection */}
          <TimeframeDropdown
            timeframeType={timeframeType}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            onTimeframeChange={setTimeframeType}
            onYearChange={setSelectedYear}
            onMonthChange={setSelectedMonth}
          />

          {/* Export Button */}
          <button className="flex items-center gap-2 px-5 py-2 bg-yellow-600 hover:bg-yellow-700 transition-colors rounded-lg text-white shadow-sm">
            <HiOutlineDownload className="w-4 h-4" />
            <Paragraph1 className="text-sm font-bold">Export Report</Paragraph1>
          </button>
        </div>
      </div>

      {/* Bottom Row: Inline Stats */}
      <div className="flex items-center py-4 border-y border-gray-300">
        <StatItem icon={HiOutlineAcademicCap} label="Chanel" />
        <StatItem icon={HiOutlineMapPin} label="Lagos" />
        <StatItem icon={HiOutlineScale} label="2.3%" />
        <StatItem icon={HiOutlineClock} label="1.1 days" />
      </div>
    </div>
  );
};

export default AnalyticsHeader;
