// ENDPOINTS: GET /api/admin/orders/:orderId (shipping & user info)
"use client";

import React from "react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";

const defaultAvatar = (name: string) =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;

interface PersonInfo {
  name: string;
  email?: string | null;
  phone?: string | null;
  avatar?: string | null;
}

interface OrderSection2Props {
  listingType?: string | null;
  returnDue: string;
  paymentReference: string;
  paymentStatus?: string;
  trackingNumber?: string | null;
  rentalPeriod?: string;
  lister: PersonInfo;
  additionalListers?: PersonInfo[];
  renter: PersonInfo;
}

export default function OrderSection2({
  listingType,
  returnDue,
  paymentReference,
  paymentStatus,
  trackingNumber,
  rentalPeriod,
  lister,
  additionalListers = [],
  renter,
}: OrderSection2Props) {
  const renderPerson = (person: PersonInfo, label: string) => (
    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
      <Paragraph3 className="text-base font-bold text-gray-900 mb-4">
        {label}
      </Paragraph3>
      <div className="flex items-start gap-3">
        <img
          src={person.avatar || defaultAvatar(person.name)}
          alt={person.name}
          className="w-12 h-12 rounded-full object-cover shrink-0"
        />
        <div>
          <Paragraph1 className="text-sm font-medium text-gray-900">
            {person.name}
          </Paragraph1>
          {person.email && (
            <Paragraph1 className="text-xs text-gray-600">{person.email}</Paragraph1>
          )}
          {person.phone && (
            <Paragraph1 className="text-xs text-gray-600">{person.phone}</Paragraph1>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <Paragraph3 className="text-base font-bold text-gray-900 mb-4">
          Order information
        </Paragraph3>
        <div className="space-y-3">
          {listingType && (
            <div className="flex justify-between items-center">
              <Paragraph1 className="text-sm text-gray-600">Type:</Paragraph1>
              <Paragraph1 className="text-sm font-medium text-gray-900">
                {listingType.replace(/_/g, " ")}
              </Paragraph1>
            </div>
          )}
          {rentalPeriod && rentalPeriod !== "N/A" && (
            <div className="flex justify-between items-center">
              <Paragraph1 className="text-sm text-gray-600">
                Rental period:
              </Paragraph1>
              <Paragraph1 className="text-sm font-medium text-gray-900">
                {rentalPeriod}
              </Paragraph1>
            </div>
          )}
          <div className="flex justify-between items-center">
            <Paragraph1 className="text-sm text-gray-600">Return due:</Paragraph1>
            <Paragraph1 className="text-sm font-medium text-gray-900">
              {returnDue}
            </Paragraph1>
          </div>
          <div className="flex justify-between items-center gap-4">
            <Paragraph1 className="text-sm text-gray-600 shrink-0">
              Payment reference:
            </Paragraph1>
            <Paragraph1 className="text-sm font-medium text-gray-900 break-all text-right">
              {paymentReference}
            </Paragraph1>
          </div>
          {paymentStatus && (
            <div className="flex justify-between items-center">
              <Paragraph1 className="text-sm text-gray-600">Payment:</Paragraph1>
              <Paragraph1 className="text-sm font-medium text-gray-900">
                {paymentStatus}
              </Paragraph1>
            </div>
          )}
          {trackingNumber && trackingNumber !== "N/A" && (
            <div className="flex justify-between items-center">
              <Paragraph1 className="text-sm text-gray-600">Tracking:</Paragraph1>
              <Paragraph1 className="text-sm font-medium text-gray-900">
                {trackingNumber}
              </Paragraph1>
            </div>
          )}
        </div>
      </div>

      {renderPerson(lister, "Lister")}
      {additionalListers.map((l) => renderPerson(l, "Additional lister"))}
      {renderPerson(renter, "Renter")}
    </div>
  );
}
