// ENDPOINTS: GET /api/admin/orders/:orderId (shipping & user info)
"use client";

import React from "react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";

interface OrderSection2Props {
  returnDue: string;
  paymentReference: string;
  curatorName: string;
  curatorAvatar: string;
  dresserName: string;
  dresserAvatar: string;
}

export default function OrderSection2({
  returnDue,
  paymentReference,
  curatorName,
  curatorAvatar,
  dresserName,
  dresserAvatar,
}: OrderSection2Props) {
  return (
    <div className="space-y-6">
      {/* Order Information Section */}
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <Paragraph3 className="text-base font-bold text-gray-900 mb-4">
          Order information
        </Paragraph3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Paragraph1 className="text-sm text-gray-600">
              Return Due:
            </Paragraph1>
            <Paragraph1 className="text-sm font-medium text-gray-900">
              {returnDue}
            </Paragraph1>
          </div>
          <div className="flex justify-between items-center">
            <Paragraph1 className="text-sm text-gray-600">
              Payment Reference:
            </Paragraph1>
            <Paragraph1 className="text-sm font-medium text-gray-900">
              {paymentReference}
            </Paragraph1>
          </div>
        </div>
      </div>

      {/* Curator Section */}
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <Paragraph3 className="text-base font-bold text-gray-900 mb-4">
          Curator
        </Paragraph3>
        <div className="flex items-start gap-3">
          <img
            src={curatorAvatar}
            alt={curatorName}
            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
          />
          <div>
            <Paragraph1 className="text-sm font-medium text-gray-900">
              {curatorName}
            </Paragraph1>
          </div>
        </div>
      </div>

      {/* Dresser Section */}
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <Paragraph3 className="text-base font-bold text-gray-900 mb-4">
          Dresser
        </Paragraph3>
        <div className="flex items-start gap-3">
          <img
            src={dresserAvatar}
            alt={dresserName}
            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
          />
          <div>
            <Paragraph1 className="text-sm font-medium text-gray-900">
              {dresserName}
            </Paragraph1>
          </div>
        </div>
      </div>
    </div>
  );
}
