"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import Link from "next/link";
import { useOrder } from "@/lib/queries/renters/useOrders";

export default function OrderSuccessfulScreen() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [isLoading, setIsLoading] = useState(true);

  const { data: order } = useOrder(orderId || "");

  useEffect(() => {
    // Simulate load time for success animation
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (!orderId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-8">
        <Paragraph1 className="text-red-600 text-lg">
          Order ID not found. Please contact support.
        </Paragraph1>
        <Link
          href="/renters/orders"
          className="mt-4 px-8 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-900 transition-colors"
        >
          <Paragraph1>View My Orders</Paragraph1>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen animate-pulse">
        <div className="w-28 h-28 bg-gray-300 rounded-full mb-8"></div>
        <div className="h-6 bg-gray-300 rounded w-48 mb-4"></div>
        <div className="h-4 bg-gray-300 rounded w-64"></div>
      </div>
    );
  }

  const orderDate = new Date();
  const formattedDate = orderDate.toLocaleDateString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-8">
      {/* Success Icon */}
      <div className="w-28 h-28 rounded-full flex items-center justify-center mb-8 animate-bounce">
        <img
          src="/icons/sbox.svg"
          alt="Success"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Title */}
      <Paragraph3 className="text-xl sm:text-[24px] font-extrabold text-black mb-4 uppercase tracking-wider">
        Order Successful!
      </Paragraph3>

      {/* Description */}
      <Paragraph1 className="text-base text-gray-700 max-w-sm mb-8">
        Thank you for your order. Your rental items are being prepared for
        delivery.
      </Paragraph1>

      {/* Order Details */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-w-md mb-8 w-full">
        <div className="space-y-4">
          {/* Order ID */}
          <div>
            <Paragraph1 className="text-xs text-gray-600 mb-1">
              ORDER ID
            </Paragraph1>
            <Paragraph1 className="text-lg font-bold text-gray-900 font-mono">
              {orderId}
            </Paragraph1>
          </div>

          {/* Order Date */}
          <div>
            <Paragraph1 className="text-xs text-gray-600 mb-1">
              ORDER DATE
            </Paragraph1>
            <Paragraph1 className="text-base text-gray-900">
              {formattedDate}
            </Paragraph1>
          </div>

          {/* Order Status */}
          <div>
            <Paragraph1 className="text-xs text-gray-600 mb-1">
              STATUS
            </Paragraph1>
            <Paragraph1 className="text-base font-semibold text-green-700">
              {order?.status || "Processing"}
            </Paragraph1>
          </div>

          {/* Total Amount */}
          {order && (
            <div className="border-t border-gray-300 pt-4">
              <div className="flex justify-between items-center">
                <Paragraph1 className="text-gray-700 font-medium">
                  Total Amount:
                </Paragraph1>
                <Paragraph1 className="text-lg font-bold text-gray-900">
                  ₦{(order.totalPrice || 0).toLocaleString("en-NG")}
                </Paragraph1>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mb-8 w-full">
        <Paragraph1 className="text-sm text-blue-900">
          <strong>What's Next?</strong>
          <br />
          You'll receive a tracking link and delivery instructions via email
          shortly. Check your inbox for updates on your rental items.
        </Paragraph1>
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-3 w-full max-w-md">
        <Link
          href="/renters/orders"
          className="px-8 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-900 transition-colors shadow-lg"
        >
          <Paragraph1>View My Orders</Paragraph1>
        </Link>

        <Link
          href="/shop"
          className="px-8 py-3 border border-black text-black font-semibold rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Paragraph1>Continue Shopping</Paragraph1>
        </Link>
      </div>
    </div>
  );
}
