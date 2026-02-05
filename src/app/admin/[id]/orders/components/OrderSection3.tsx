"use client";

import React from "react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";

interface OrderSection3Props {
  subtotal?: string;
  serviceFee?: string;
  deliveryFee?: string;
  insurance?: string;
  total?: string;
}

export default function OrderSection3({
  subtotal = "₦350,000",
  serviceFee = "₦35,000",
  deliveryFee = "₦5,000",
  insurance = "₦10,000",
  total = "₦400,000",
}: OrderSection3Props) {
  return (
    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
      <Paragraph3 className="text-base font-bold text-gray-900 mb-4">
        Payment Breakdown
      </Paragraph3>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between items-center">
          <Paragraph1 className="text-sm text-gray-600">Subtotal:</Paragraph1>
          <Paragraph1 className="text-sm font-medium text-gray-900">
            {subtotal}
          </Paragraph1>
        </div>

        <div className="flex justify-between items-center">
          <Paragraph1 className="text-sm text-gray-600">
            Service Fee (10%):
          </Paragraph1>
          <Paragraph1 className="text-sm font-medium text-gray-900">
            {serviceFee}
          </Paragraph1>
        </div>

        <div className="flex justify-between items-center">
          <Paragraph1 className="text-sm text-gray-600">
            Delivery Fee:
          </Paragraph1>
          <Paragraph1 className="text-sm font-medium text-gray-900">
            {deliveryFee}
          </Paragraph1>
        </div>

        <div className="flex justify-between items-center">
          <Paragraph1 className="text-sm text-gray-600">Insurance:</Paragraph1>
          <Paragraph1 className="text-sm font-medium text-gray-900">
            {insurance}
          </Paragraph1>
        </div>

        <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
          <Paragraph1 className="text-sm font-semibold text-gray-900">
            Total:
          </Paragraph1>
          <Paragraph1 className="text-sm font-bold text-gray-900">
            {total}
          </Paragraph1>
        </div>
      </div>

      <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium text-sm">
        Export Receipt
      </button>
    </div>
  );
}
