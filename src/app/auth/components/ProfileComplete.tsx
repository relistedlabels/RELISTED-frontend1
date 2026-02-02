"use client";

import React from "react";
import { Box } from "lucide-react";
import { Header1, Paragraph1, Paragraph3 } from "@/common/ui/Text";
import Link from "next/link";

// Example data for the order details
const ORDER_ID = "23H445K566"; // Matches the ID shown in the image done1.svg

export default function ProfileComplete() {
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
        <img src="/images/done1.svg" alt="" />
      </div>

      {/* Title */}
      <Paragraph3 className="text-xl sm:text-[24px] font-extrabold text-black mb-4 uppercase tracking-wider">
        Profile Complete{" "}
      </Paragraph3>

      {/* Description */}
      <Paragraph1 className="text-base text-gray-700 max-w-sm mb-2">
        Your account is all set! You can now explore curated collections, rent
        designer pieces, and track your orders securely.
      </Paragraph1>

      <Link
        href="/listers/inventory"
        onClick={handleTrackOrder}
        className="px-8 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors shadow-lg"
      >
        <Paragraph1>Start shopping Now </Paragraph1>
      </Link>
    </div>
  );
}
