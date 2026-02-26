// ENDPOINTS: POST /api/renters/disputes, GET /api/issue-categories

"use client";

import React, { useState } from "react";
import { Paragraph1 } from "@/common/ui/Text";
import { HiOutlineArrowUpTray, HiOutlineChevronDown } from "react-icons/hi2";
import { useRaiseDispute } from "@/lib/mutations/renters/useDisputeMutations";

// Define possible dispute categories
const ISSUE_CATEGORIES = [
  "Damaged Item",
  "Incorrect Item Received",
  "Item Not Delivered",
  "Hygiene Concern",
  "Misrepresented Description",
  "Other",
];

interface RaiseDisputeFormProps {
  orderId?: string;
  itemId?: string;
  onSuccess?: () => void;
}

const RaiseDisputeForm: React.FC<RaiseDisputeFormProps> = ({
  orderId: propOrderId,
  itemId: propItemId,
  onSuccess,
}) => {
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [description, setDescription] = useState("");
  const [amountDisputed, setAmountDisputed] = useState<number | undefined>();
  const [orderId, setOrderId] = useState(propOrderId || "");
  const [itemId, setItemId] = useState(propItemId || "");

  const raiseDisputeMutation = useRaiseDispute();

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setIsCategoryDropdownOpen(false);
  };

  const handleSubmit = async () => {
    if (!orderId || !itemId || !selectedCategory || !description) {
      alert("Please fill in all required fields");
      return;
    }

    raiseDisputeMutation.mutate(
      {
        orderId,
        itemId,
        issueCategory: selectedCategory,
        description,
        amountDisputed,
      },
      {
        onSuccess: () => {
          alert("Dispute raised successfully!");
          setOrderId(propOrderId || "");
          setItemId(propItemId || "");
          setSelectedCategory("");
          setDescription("");
          setAmountDisputed(undefined);
          onSuccess?.();
        },
        onError: (error: any) => {
          alert(error?.message || "Failed to raise dispute");
        },
      },
    );
  };

  return (
    <div className="font-sans ">
      {/* Order ID Input */}
      <div className="mb-4">
        <Paragraph1 className="text-sm font-medium text-gray-900 mb-2">
          Order ID*
        </Paragraph1>
        <input
          type="text"
          placeholder="Enter order ID"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-black focus:border-black transition duration-150"
        />
      </div>

      {/* Item ID Input */}
      <div className="mb-4">
        <Paragraph1 className="text-sm font-medium text-gray-900 mb-2">
          Item ID*
        </Paragraph1>
        <input
          type="text"
          placeholder="Enter item ID"
          value={itemId}
          onChange={(e) => setItemId(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-black focus:border-black transition duration-150"
        />
      </div>

      {/* Issue Category Dropdown */}
      <div className="mb-4">
        <Paragraph1 className="text-sm font-medium text-red-500 mb-2">
          Issue Category*
        </Paragraph1>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
            className="w-full p-3 flex items-center justify-between border border-gray-300 rounded-lg bg-white text-base focus:ring-black focus:border-black transition duration-150"
          >
            <span>{selectedCategory || "Select Issue"}</span>
            <HiOutlineChevronDown
              className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${
                isCategoryDropdownOpen ? "rotate-180" : "rotate-0"
              }`}
            />
          </button>

          {/* Dropdown Content */}
          {isCategoryDropdownOpen && (
            <div className="absolute z-10 w-full mt-2 origin-top bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden transition-all duration-300 ease-in-out">
              {ISSUE_CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
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
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-black focus:border-black transition duration-150 min-h-[100px] text-sm"
          minLength={20}
        />
        <Paragraph1 className="text-xs text-gray-500 mt-1">
          {description.length}/20 characters minimum
        </Paragraph1>
      </div>

      {/* Amount Disputed (Optional) */}
      <div className="mb-6">
        <Paragraph1 className="text-sm font-medium text-gray-900 mb-2">
          Amount Disputed (Optional)
        </Paragraph1>
        <div className="relative">
          <input
            type="number"
            placeholder="0"
            value={amountDisputed || ""}
            onChange={(e) =>
              setAmountDisputed(
                e.target.value ? parseFloat(e.target.value) : undefined,
              )
            }
            className="w-full p-3 pl-8 border border-gray-300 rounded-lg focus:ring-black focus:border-black transition duration-150"
          />
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold">
            ₦
          </span>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={raiseDisputeMutation.isPending}
        className="w-full py-3 text-lg font-semibold text-white bg-black rounded-lg hover:bg-gray-800 disabled:opacity-50 transition duration-150"
      >
        {raiseDisputeMutation.isPending ? "Submitting..." : "Submit Dispute"}
      </button>

      {raiseDisputeMutation.isError && (
        <Paragraph1 className="text-red-600 text-sm mt-2">
          Error:{" "}
          {(raiseDisputeMutation.error as any)?.message ||
            "Failed to raise dispute"}
        </Paragraph1>
      )}
    </div>
  );
};

export default RaiseDisputeForm;
