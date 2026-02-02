"use client";

import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";

// --- Data Structure for a single item ---
interface CheckoutItem {
  id: number;
  image: string;
  name: string;
  size: string;
  color: string;
  days: number;
  unitPrice: number; // Price per item/period
  deposit: number;
  subtotal: number; // Unit Price + Deposit (or just Unit Price, based on image layout)
}

// Placeholder Data (reflecting the image)
const initialCheckoutItems: CheckoutItem[] = [
  {
    id: 1,
    image: "/path/to/fendi-boots-1.png", // Used unique paths for differentiation
    name: "FENDI ARCO BOOTS",
    size: "S",
    color: "Black",
    days: 12, // Updated days to match image
    unitPrice: 165000,
    deposit: 15000,
    subtotal: 165000,
  },
  {
    id: 2,
    image: "/path/to/fendi-boots-2.png",
    name: "FENDI ARCO BOOTS",
    size: "S",
    color: "Black",
    days: 12, // Updated days to match image
    unitPrice: 165000,
    deposit: 15000,
    subtotal: 165000,
  },
  {
    id: 3,
    image: "/path/to/fendi-boots-1.png",
    name: "FENDI ARCO BOOTS",
    size: "S",
    color: "Black",
    days: 12, // Updated days to match image
    unitPrice: 165000,
    deposit: 15000,
    subtotal: 165000,
  },
];

// --- Formatting Helper (for thousands separator) ---
const formatCurrency = (amount: number): string => {
  return amount.toLocaleString("en-NG");
};

export default function CheckoutProductList() {
  const [items, setItems] = useState(initialCheckoutItems);
  const [selectedItems, setSelectedItems] = useState<number[]>([1, 2, 3]); // IDs of checked items
  const currency = "₦";

  // Toggle selection for an item
  const toggleItemSelection = (itemId: number) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Placeholder for item removal (for Trash icon)
  const removeItem = (itemId: number) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
    setSelectedItems((prev) => prev.filter((id) => id !== itemId));
  };

  return (
    <div className="w-full">
      {/* Table Header Row (Desktop/Tablet View - hidden on mobile) */}
      <div className="hidden sm:grid grid-cols-12 text-xs font-medium text-gray-500 p-2 py-6 border rounded-lg border-gray-200">
        <div className="col-span-5 pl-4 ">
          <Paragraph1>Product Name</Paragraph1>
        </div>
        <div className="col-span-2 text-center">
          <Paragraph1>Unit Price</Paragraph1>
        </div>
        <div className="col-span-2 text-center">
          <Paragraph1>Deposit</Paragraph1>
        </div>
        <div className="col-span-2 text-center">
          <Paragraph1>Subtotal</Paragraph1>
        </div>
        {/* Empty column for trash icon on desktop */}
        <div className="col-span-1"></div>
      </div>

      {/* List of Cart Items */}
      <div className="divide-y divide-gray-100">
        {items.map((item) => {
          const isSelected = selectedItems.includes(item.id);

          return (
            <div
              key={item.id}
              className="py-4 px-4 sm:px-0 sm:grid sm:grid-cols-12 items-start hover:bg-gray-50 transition-colors"
            >
              {/* === Product Info (Mobile/Desktop) === */}
              <div className="col-span-5 flex items-start gap-3 w-full">
                {/* Checkbox */}
                <div className="shrink-0 pt-1">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleItemSelection(item.id)}
                    className="form-checkbox h-4 w-4 text-black border-gray-300 rounded focus:ring-black"
                  />
                </div>
                {/* Image */}
                <div className="shrink-0 w-16 h-20 bg-gray-200 rounded-sm overflow-hidden border border-gray-100">
                  {/* Image tag based on the image provided */}
                </div>
                {/* Name and Details */}
                <div className="grow">
                  <div className="flex justify-between items-center w-full">
                    <Paragraph1 className="text-sm font-semibold text-gray-800 uppercase leading-snug">
                      {item.name}
                    </Paragraph1>
                    {/* Trash Icon (Visible on Mobile, positioned top-right) */}
                    <button
                      aria-label={`Remove ${item.name}`}
                      onClick={() => removeItem(item.id)}
                      className="sm:hidden shrink-0 p-1 text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <Paragraph1 className="text-xs text-gray-600 leading-snug mt-1">
                    Size: **{item.size}** Color: **{item.color}**
                  </Paragraph1>
                  <Paragraph1 className="text-xs text-gray-600 leading-snug">
                    Duration: **{item.days} Days**
                  </Paragraph1>
                </div>
              </div>

              {/* === Price Columns (Desktop View) === */}
              <div className="hidden sm:contents text-sm font-medium">
                {/* Unit Price (Desktop) */}
                <div className="col-span-2 text-center text-gray-900">
                  <Paragraph1>
                    {currency}
                    {formatCurrency(item.unitPrice)}
                  </Paragraph1>
                </div>

                {/* Deposit (Desktop) */}
                <div className="col-span-2 text-center text-gray-900">
                  <Paragraph1>
                    {currency}
                    {formatCurrency(item.deposit)}
                  </Paragraph1>
                </div>

                {/* Subtotal (Desktop) */}
                <div className="col-span-2 text-center font-bold text-lg text-gray-900">
                  <Paragraph1>
                    {currency}
                    {formatCurrency(item.subtotal)}
                  </Paragraph1>
                </div>
              </div>

              {/* Trash Icon (Desktop) */}
              <div className="hidden sm:flex col-span-1 items-center justify-center">
                <button
                  aria-label={`Remove ${item.name}`}
                  onClick={() => removeItem(item.id)}
                  className="p-1 text-red-500 hover:text-red-700 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {/* === Price Row (Mobile View - below product info) === */}
              {/* This new row uses flexbox to align the Unit Price, Deposit, and Subtotal */}
              <div className="sm:hidden flex justify-between items-center w-full mt-4 text-sm font-medium">
                {/* Unit Price (Mobile) */}
                <div className="text-left w-1/3">
                  <Paragraph1 className="text-xs text-gray-500 mb-1">
                    Unit Price
                  </Paragraph1>
                  <Paragraph1 className="text-sm font-semibold text-gray-900">
                    {currency}
                    {formatCurrency(item.unitPrice)}
                  </Paragraph1>
                </div>

                {/* Deposit (Mobile) */}
                <div className="text-center w-1/3">
                  <Paragraph1 className="text-xs text-gray-500 mb-1">
                    Deposit
                  </Paragraph1>
                  <Paragraph1 className="text-sm font-semibold text-gray-900">
                    {currency}
                    {formatCurrency(item.deposit)}
                  </Paragraph1>
                </div>

                {/* Subtotal (Mobile) */}
                <div className="text-right w-1/3">
                  <Paragraph1 className="text-xs text-gray-500 mb-1">
                    Subtotal
                  </Paragraph1>
                  <Paragraph1 className="text-lg font-bold text-gray-900">
                    {currency}
                    {formatCurrency(item.subtotal)}
                  </Paragraph1>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
