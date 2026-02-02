"use client";

import React from "react";
import { CheckCircle } from "lucide-react";
import { Header1, Paragraph1 } from "@/common/ui/Text";
import Link from "next/link";

// --- Data Structure for a single item in the final summary ---
interface FinalSummaryItem {
  id: number;
  image: string;
  name: string;
  size: string;
  color: string;
  duration: number; // Duration in days
  price: number; // Rental price for the duration
}

// Placeholder Data (reflecting the image)
const initialFinalItems: FinalSummaryItem[] = [
  {
    id: 1,
    image: "/path/to/fendi-boots.png",
    name: "FENDI ARCO BOOTS",
    size: "S",
    color: "Black",
    duration: 12,
    price: 165000,
  },
  {
    id: 2,
    image: "/path/to/fendi-boots.png",
    name: "FENDI ARCO BOOTS",
    size: "S",
    color: "Black",
    duration: 12,
    price: 185000, // Different price for the second item
  },
];

// --- Hardcoded Fees from the image ---
const VAT_AMOUNT = 15000;
// NOTE: The image shows Subtotal (205,000) + VAT (15,000) = 220,000,
// but the displayed Total is ₦550,000.
// We will calculate Subtotal from item prices and use the displayed Total for the final output,
// assuming additional fees (like Cleaning/Deposit/Shipping) are included in the ₦550,000 figure,
// or there's a display anomaly. We'll show the calculation path.

const CURRENCY = "₦";

// --- Formatting Helper (for thousands separator) ---
const formatCurrency = (amount: number): string => {
  return amount.toLocaleString("en-NG");
};

export default function FinalOrderSummaryCard() {
  const items = initialFinalItems;

  // 1. Calculate the Subtotal from the item prices listed
  const calculatedSubtotal = items.reduce((acc, item) => acc + item.price, 0);
  // Should equal 165,000 + 185,000 = 350,000.
  // However, the image displays ₦205,000. We will use the displayed ₦205,000 for consistency
  // with the image's calculation flow, assuming the item prices shown are just "unit price".
  const displayedSubtotal = 205000;

  // 2. Calculate the Total based on the displayed Subtotal and VAT
  const calculatedTotal = displayedSubtotal + VAT_AMOUNT;

  // 3. Use the hardcoded total from the image for the final line
  const finalTotalDisplay = 550000;

  return (
    <div className="p-4 border border-gray-200 rounded-xl">
      <Paragraph1 className="text-xl font-bold text-gray-900 mb-6 tracking-wide">
        SUMMARY
      </Paragraph1>

      {/* Item List */}
      <div className="space-y-4 pb-6 border-b border-gray-200">
        {items.map((item) => (
          <div key={item.id} className="flex items-start gap-4">
            {/* Product Image */}
            <div className="shrink-0 w-16 h-20 bg-gray-200 rounded-md overflow-hidden border border-gray-100">
              {/* Placeholder image tag */}
            </div>

            {/* Product Details */}
            <div className="grow">
              <Paragraph1 className="text-sm font-semibold text-gray-800 uppercase leading-snug">
                {item.name}
              </Paragraph1>
              <Paragraph1 className="text-xs text-gray-600 leading-snug mt-1">
                Size: {item.size} Color: {item.color}
              </Paragraph1>
              <Paragraph1 className="text-xs text-gray-600 leading-snug">
                Duration: {item.duration} Days
              </Paragraph1>
            </div>

            {/* Price */}
            <div className="shrink-0 text-sm font-bold text-gray-900 mt-1">
              <Paragraph1>
                {CURRENCY}
                {formatCurrency(item.price)}
              </Paragraph1>
            </div>
          </div>
        ))}
      </div>

      {/* Subtotal and VAT Breakdown */}
      <div className="space-y-2 py-4 border-b border-gray-200">
        <div className="flex justify-between text-sm font-medium text-gray-700">
          <Paragraph1>Subtotal</Paragraph1>
          <Paragraph1>
            {CURRENCY}
            {formatCurrency(displayedSubtotal)}{" "}
          </Paragraph1>
        </div>
        <div className="flex justify-between text-sm font-medium text-gray-700">
          <Paragraph1>VAT:</Paragraph1>
          <Paragraph1>
            {CURRENCY}
            {formatCurrency(VAT_AMOUNT)}
          </Paragraph1>
        </div>
      </div>

      {/* Final Total */}
      <div className="flex justify-between items-center pt-4">
        <Paragraph1 className="text-lg font-bold text-gray-900">
          Total:
        </Paragraph1>
        <Paragraph1 className="text-xl font-extrabold text-gray-900">
          {CURRENCY}
          {formatCurrency(finalTotalDisplay)}
        </Paragraph1>
      </div>

      {/* Proceed Button */}
      <Link href="/shop/cart/checkout"
        className="w-full flex justify-center bg-black text-white font-semibold py-3 mt-6 rounded-lg hover:bg-gray-800 transition-colors"
        onClick={() => console.log("Proceeding to checkout...")} // Placeholder action
      >
        <Paragraph1> Proceed to Checkout</Paragraph1>
      </Link>

      {/* Security Note */}
      <div className="flex items-start gap-2 p-3 mt-4 text-xs bg-green-50 text-green-700 rounded-md border border-green-200">
        <CheckCircle size={16} className="mt-0.5 shrink-0" />
        <Paragraph1 className="text-green-700">
          Your **deposit is secure** and fully refunded after item return and
          approval.
        </Paragraph1>
      </div>
    </div>
  );
}
