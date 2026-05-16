// ENDPOINTS: GET /api/admin/orders/:orderId (payment breakdown)
"use client";

import React from "react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";

interface OrderSection3Props {
  subtotal: string;
  serviceFee: string;
  deliveryFee: string;
  vat: string;
  total: string;
  paymentStatus?: string;
}

export default function OrderSection3({
  subtotal,
  serviceFee,
  deliveryFee,
  vat,
  total,
  paymentStatus,
}: OrderSection3Props) {
  return (
    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
      <Paragraph3 className="text-base font-bold text-gray-900 mb-4">
        Payment breakdown
      </Paragraph3>

      {paymentStatus && (
        <Paragraph1 className="text-sm text-gray-600 mb-4">
          Status:{" "}
          <span className="font-medium text-gray-900">{paymentStatus}</span>
        </Paragraph1>
      )}

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Paragraph1 className="text-sm text-gray-600">Items subtotal:</Paragraph1>
          <Paragraph1 className="text-sm font-medium text-gray-900">
            {subtotal}
          </Paragraph1>
        </div>

        <div className="flex justify-between items-center">
          <Paragraph1 className="text-sm text-gray-600">Service fee:</Paragraph1>
          <Paragraph1 className="text-sm font-medium text-gray-900">
            {serviceFee}
          </Paragraph1>
        </div>

        <div className="flex justify-between items-center">
          <Paragraph1 className="text-sm text-gray-600">Delivery fee:</Paragraph1>
          <Paragraph1 className="text-sm font-medium text-gray-900">
            {deliveryFee}
          </Paragraph1>
        </div>

        <div className="flex justify-between items-center">
          <Paragraph1 className="text-sm text-gray-600">VAT:</Paragraph1>
          <Paragraph1 className="text-sm font-medium text-gray-900">{vat}</Paragraph1>
        </div>

        <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
          <Paragraph1 className="text-sm font-semibold text-gray-900">Total:</Paragraph1>
          <Paragraph1 className="text-sm font-bold text-gray-900">{total}</Paragraph1>
        </div>
      </div>
    </div>
  );
}
