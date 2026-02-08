// ENDPOINTS: PUT /api/admin/orders/:orderId/status, POST /api/admin/orders/:orderId/cancel
"use client";

import React from "react";
import { Paragraph1 } from "@/common/ui/Text";

export default function OrderSection1() {
  return (
    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 space-y-4">
      {/* Payment Status */}
      <div className="pt-0 border-t-0 border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <Paragraph1 className="text-sm font-medium text-gray-700">
            💲 Payment Status:
          </Paragraph1>
          <span className="text-blue-600 text-sm font-medium cursor-pointer hover:underline">
            Escrowed
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-4">
          <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition font-medium text-sm">
            Update Status
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm">
            Cancel Order
          </button>
        </div>

        {/* Info Box */}
        <div className="flex gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex-shrink-0 mt-0.5">
            <svg
              className="w-4 h-4 text-blue-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <Paragraph1 className="text-xs text-blue-700">
            Refunds can only be processed via the Disputes panel. If a refund is
            needed, the dresser or curator must file a dispute first.
          </Paragraph1>
        </div>
      </div>
    </div>
  );
}
