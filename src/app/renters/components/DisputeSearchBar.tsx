"use client"

import React, { useState } from "react";
import { Paragraph1 } from "@/common/ui/Text";
import {
  HiOutlineMagnifyingGlass,
  HiOutlineChevronDown,
} from "react-icons/hi2";

const STATUS_OPTIONS = [
  "All Statuses",
  "Pending Review",
  "In Review",
  "Resolved",
  "Rejected",
];

const DisputeSearchBar: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(STATUS_OPTIONS[0]);

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setIsDropdownOpen(false);
  };

  return (
    <div className="font-sans mb-4">
      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
        {/* Search Input */}
        <div className="flex-1 relative bg-white">
          <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Dispute ID, Order ID, or Category..."
            className="w-full p-3 pl-10 border border-gray-200 rounded-lg outline-none transition duration-150 text-sm"
          />
        </div>

        {/* Status Dropdown (Simulating Motion) */}
        <div className="relative w-full sm:w-auto sm:min-w-[150px] shrink-0">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full p-3 flex items-center justify-between border border-gray-200 rounded-lg bg-white text-sm  transition duration-150"
          >
            <span>{selectedStatus}</span>
            <HiOutlineChevronDown
              className={`w-4 h-4 transition-transform duration-300 ${
                isDropdownOpen ? "rotate-180" : "rotate-0"
              }`}
            />
          </button>

          {/* Dropdown Content */}
          {isDropdownOpen && (
            <div
              // Using max-h-0/max-h-96 and opacity for a transition effect (simulating motion)
              className="absolute right-0 z-10 w-full mt-2 origin-top-right bg-white border border-gray-200 rounded-lg  overflow-hidden transition-all duration-300 ease-in-out"
              style={{
                maxHeight: isDropdownOpen ? "300px" : "0",
                opacity: isDropdownOpen ? 1 : 0,
              }}
            >
              <div className="py-1">
                {STATUS_OPTIONS.map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DisputeSearchBar;