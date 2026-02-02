import React, { useState } from "react";
import { Paragraph1 } from "@/common/ui/Text";
import { HiOutlineArrowUpTray, HiOutlineChevronDown } from "react-icons/hi2";

// Define possible dispute categories
const ISSUE_CATEGORIES = [
  "Damaged Item",
  "Incorrect Item Received",
  "Item Not Delivered",
  "Hygiene Concern",
  "Misrepresented Description",
  "Other",
];

const RaiseDisputeForm: React.FC = () => {
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Select Issue");

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setIsCategoryDropdownOpen(false);
  };

  return (
    <div className="font-sans ">
      

      {/* Order ID Display (Static in image, but would be an input or display in real app) */}
      <div className="mb-4">
        <Paragraph1 className="text-sm font-medium text-gray-900 mb-2">
          Order ID:
        </Paragraph1>
        <div className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-lg font-semibold text-gray-800">
          20394RRS4
        </div>
      </div>

      {/* Issue Category Dropdown (Simulating Motion) */}
      <div className="mb-4">
        <Paragraph1 className="text-sm font-medium text-red-500 mb-2">
          Issue Category*
        </Paragraph1>
        <div className="relative">
          <button
            onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
            className="w-full p-3 flex items-center justify-between border border-gray-300 rounded-lg bg-white text-base focus:ring-black focus:border-black transition duration-150"
          >
            <span>{selectedCategory}</span>
            <HiOutlineChevronDown
              className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${
                isCategoryDropdownOpen ? "rotate-180" : "rotate-0"
              }`}
            />
          </button>

          {/* Dropdown Content */}
          {isCategoryDropdownOpen && (
            <div
              // Using transition classes to simulate motion
              className="absolute z-10 w-full mt-2 origin-top bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden transition-all duration-300 ease-in-out"
              style={{
                maxHeight: isCategoryDropdownOpen ? "300px" : "0",
                opacity: isCategoryDropdownOpen ? 1 : 0,
              }}
            >
              {ISSUE_CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Description Input */}
      <div className="mb-4">
        <Paragraph1 className="text-sm font-medium text-red-500 mb-2">
          Description*
        </Paragraph1>
        <textarea
          placeholder="Explain the issue clearly..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-black focus:border-black transition duration-150 min-h-[100px] text-sm"
          minLength={20}
        />
        <Paragraph1 className="text-xs text-gray-500 mt-1">
          Minimum 20 characters
        </Paragraph1>
      </div>

      {/* Evidence Upload */}
      <div className="mb-6">
        <Paragraph1 className="text-sm font-medium text-gray-900 mb-2">
          Upload Evidence (Optional)
        </Paragraph1>
        <Paragraph1 className="text-xs text-gray-500 mb-3">
          Upload up to 3 images (damage photos, screenshots, etc.)
        </Paragraph1>

        <div
          className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-black transition duration-150"
          // In a real application, you'd add drag/drop handlers here
        >
          <HiOutlineArrowUpTray className="w-8 h-8 text-gray-400 mb-2" />
          <Paragraph1 className="text-sm font-medium text-gray-700">
            Click to upload or drag and drop
          </Paragraph1>
          <Paragraph1 className="text-xs text-gray-500 mt-1">
            PNG, JPG up to 5MB
          </Paragraph1>
        </div>
      </div>

      {/* Action Button */}
      {/* <button className="w-full py-3 text-lg font-semibold text-white bg-black rounded-lg hover:bg-gray-800 transition duration-150">
        Submit Dispute
      </button> */}
    </div>
  );
};

export default RaiseDisputeForm;
