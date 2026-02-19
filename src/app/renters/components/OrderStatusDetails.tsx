"use client";

import React from "react";
import { Lock, ShoppingBag } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";

// --- Placeholder Data ---
const escrowAmount = 200000;
const returnDate = "Oct 14, 2025";
const CURRENCY = "₦";

// Formatting Helper
const formatCurrency = (amount: number): string => {
  return amount.toLocaleString("en-NG");
};

interface OrderStatusDetailsProps {
  orderId?: string;
}

export default function OrderStatusDetails({
  orderId,
}: OrderStatusDetailsProps) {
  return (
    <div className=" space-y-6">
      {/* --- 1. ESCROW LOCK NOTICE --- */}
      <div className="p-4 bg-yellow-50 rounded-xl border-l-4 border-yellow-400 shadow-sm">
        <div className="flex items-start gap-4">
          <Lock size={24} className="shrink-0 mt-1 text-yellow-600" />
          <div>
            <Paragraph1 className="text-sm font-bold text-gray-900 mb-1">
              {CURRENCY}
              {formatCurrency(escrowAmount)} is currently locked in escrow to
              protect this item.
            </Paragraph1>
            <Paragraph1 className="text-sm text-gray-700">
              You cannot withdraw this amount until the item is returned and
              approved by the curator.
            </Paragraph1>
          </div>
        </div>
      </div>

      {/* --- 2. RETURN STATUS --- */}
      <div>
        <Paragraph1 className="text-base font-bold text-gray-900 mb-3">
          Return Status
        </Paragraph1>

        <div className="p-4 bg-white rounded-xl border border-gray-300">
          <div className="flex items-start gap-4">
            {/* The icon in the image resembles a package or a shopping bag/basket */}
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
              <ShoppingBag size={16} className="text-white" />
            </div>

            <div>
              <Paragraph1 className="text-sm font-bold text-gray-900 mb-1">
                Return on Precise Date
              </Paragraph1>
              <Paragraph1 className="text-sm text-gray-700">
                Please return the item by **{returnDate}**
              </Paragraph1>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
