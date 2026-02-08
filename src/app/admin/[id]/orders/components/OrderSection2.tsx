// ENDPOINTS: GET /api/admin/orders/:orderId (shipping & user info)
"use client";

import React from "react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";

interface OrderSection2Props {
  rentalPeriod: string;
  returnDue: string;
  trackingId: string;
  courier: string;
  curatorName: string;
  curatorEmail: string;
  curatorAvatar: string;
  dresserName: string;
  dresserEmail: string;
  dresserPhone: string;
  dresserAvatar: string;
}

export default function OrderSection2({
  rentalPeriod,
  returnDue,
  trackingId,
  courier,
  curatorName,
  curatorEmail,
  curatorAvatar,
  dresserName,
  dresserEmail,
  dresserPhone,
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
              Rental Period:
            </Paragraph1>
            <Paragraph1 className="text-sm font-medium text-gray-900">
              {rentalPeriod}
            </Paragraph1>
          </div>
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
              Tracking ID:
            </Paragraph1>
            <Paragraph1 className="text-sm font-medium text-gray-900">
              {trackingId}
            </Paragraph1>
          </div>
          <div className="flex justify-between items-center">
            <Paragraph1 className="text-sm text-gray-600">Courier:</Paragraph1>
            <Paragraph1 className="text-sm font-medium text-gray-900">
              {courier}
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
            <Paragraph1 className="text-xs text-gray-500">
              {curatorEmail}
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
            <Paragraph1 className="text-xs text-gray-500">
              {dresserEmail}
            </Paragraph1>
            <Paragraph1 className="text-xs text-gray-500">
              {dresserPhone}
            </Paragraph1>
          </div>
        </div>
      </div>
    </div>
  );
}
