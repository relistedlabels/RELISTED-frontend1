"use client";

import React from "react";
import { Box } from "lucide-react";
import { Header1, Paragraph1, Paragraph3 } from "@/common/ui/Text";
import Link from "next/link";

// Example data for the order details
const ORDER_ID = "23H445K566"; // Matches the ID shown in the image

export default function OrderSuccessfulScreen() {
  // In a real application, the ORDER_ID would be passed as a prop or fetched from the URL/state.

  const handleTrackOrder = () => {
    // Placeholder function: Navigate the user to the order tracking page/dashboard
    console.log(`Navigating to tracking page for Order ID: ${ORDER_ID}`);
    // Example: router.push(`/dashboard/orders/${ORDER_ID}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen  text-center p-8">
      {/* Icon: Large, filled box icon */}
      <div className="w-28- h-28-  rounded-full flex items-center justify-center mb-8">
        <img src="/icons/sbox.svg" alt="" />
      </div>

      {/* Title */}
      <Paragraph3 className="text-xl sm:text-[24px] font-extrabold text-black mb-4 uppercase tracking-wider">
        ORDER SUCCESSFUL!
      </Paragraph3>

      {/* Description */}
      <Paragraph1 className="text-base text-gray-700 max-w-sm mb-2">
        Your order is now processing, track and review your order in your
        dashboard
      </Paragraph1>

      {/* Order ID */}
      <Paragraph1 className="text-lg font-bold text-gray-900 mb-8">
        Order ID: {ORDER_ID}
      </Paragraph1>

      {/* Track Order Button */}
      <Link href="/dressers/orders"
        onClick={handleTrackOrder}
        className="px-8 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors shadow-lg"
      >
        <Paragraph1>Track Order </Paragraph1>
      </Link>
    </div>
  );
}
