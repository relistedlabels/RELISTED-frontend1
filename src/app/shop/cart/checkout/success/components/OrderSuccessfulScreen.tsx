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
      <div className="flex flex-col justify-center items-center p-8 min-h-screen text-center">
        <Paragraph1 className="text-red-600 text-lg">
          Order ID not found. Please contact support.
        </Paragraph1>
        <Link
          href="/renters/orders"
          className="bg-black hover:bg-gray-900 mt-4 px-8 py-3 rounded-lg font-semibold text-white transition-colors"
        >
          <Paragraph1>View My Orders</Paragraph1>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen animate-pulse">
        <div className="bg-gray-300 mb-8 rounded-full w-28 h-28"></div>
        <div className="bg-gray-300 mb-4 rounded w-48 h-6"></div>
        <div className="bg-gray-300 rounded w-64 h-4"></div>
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
    <div className="flex flex-col justify-center items-center p-8 min-h-screen text-center">
      {/* Success Icon */}
      <div className="flex justify-center items-center mb-8 rounded-full w-28 h-28 animate-bounce">
        <img
          src="/icons/sbox.svg"
          alt="Success"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Title */}
      <Paragraph3 className="mb-4 font-extrabold text-black sm:text-[24px] text-xl uppercase tracking-wider">
        Order Successful!
      </Paragraph3>

      {/* Description */}
      <Paragraph1 className="mb-8 max-w-sm text-gray-700 text-base">
        Thank you for your order. Your rental items are being prepared for
        delivery.
      </Paragraph1>

      {/* Order Details */}
      <div className="bg-gray-50 mb-8 p-6 border border-gray-200 rounded-lg w-full max-w-md">
        <div className="space-y-4">
          {/* Order ID */}
          <div>
            <Paragraph1 className="mb-1 text-gray-600 text-xs">
              ORDER ID
            </Paragraph1>
            <Paragraph1 className="font-mono font-bold text-gray-900 text-lg">
              {orderId}
            </Paragraph1>
          </div>

          {/* Order Date */}
          {/* <div>
            <Paragraph1 className="mb-1 text-gray-600 text-xs">
              ORDER DATE
            </Paragraph1>
            <Paragraph1 className="text-gray-900 text-base">
              {formattedDate}
            </Paragraph1>
          </div> */}

          {/* Order Status */}
          {/* <div>
            <Paragraph1 className="mb-1 text-gray-600 text-xs">
              STATUS
            </Paragraph1>
            <Paragraph1 className="font-semibold text-green-700 text-base">
              {order?.status || "Processing"}
            </Paragraph1>
          </div> */}

          {/* Total Amount */}
          {/* {order && (
            <div className="pt-4 border-gray-300 border-t">
              <div className="flex justify-between items-center">
                <Paragraph1 className="font-medium text-gray-700">
                  Total Amount:
                </Paragraph1>
                <Paragraph1 className="font-bold text-gray-900 text-lg">
                  ₦{(order.totalAmount || 0).toLocaleString("en-NG")}
                </Paragraph1>
              </div>
            </div>
          )} */}
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-blue-50 mb-8 p-4 border border-blue-200 rounded-lg w-full max-w-md">
        <Paragraph1 className="text-blue-900 text-sm">
          <strong>What's Next?</strong>
          <br />
          Your tracking link will be sent on your rental start date. You'll
          receive delivery instructions via email. Check your inbox for updates
          on your rental items.
        </Paragraph1>
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-3 w-full max-w-md">
        <Link
          href="/renters/orders"
          className="bg-black hover:bg-gray-900 shadow-lg px-8 py-3 rounded-lg font-semibold text-white transition-colors"
        >
          <Paragraph1>View My Orders</Paragraph1>
        </Link>

        <Link
          href="/shop"
          className="hover:bg-gray-50 px-8 py-3 border border-black rounded-lg font-semibold text-black transition-colors"
        >
          <Paragraph1>Continue Shopping</Paragraph1>
        </Link>
      </div>
    </div>
  );
}
