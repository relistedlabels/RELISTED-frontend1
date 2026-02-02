"use client";

import { Paragraph1 } from "@/common/ui/Text";
import React from "react";

// Define the shape of the props the component expects
interface RentalSummaryProps {
  rentalDays: number;
  rentalFeePerPeriod: number;
  securityDeposit: number;
  cleaningFee: number;
}

export default function RentalSummaryCard({
  rentalDays,
  rentalFeePerPeriod,
  securityDeposit,
  cleaningFee,
}: RentalSummaryProps) {
  // --- Calculation ---
  const total = rentalFeePerPeriod + securityDeposit + cleaningFee;
  const currency = "₦"; // Nigerian Naira symbol, matching the image

  // --- Formatting Helper (for thousands separator) ---
  const formatCurrency = (amount: number): string => {
    // Ensure the number is formatted with commas for thousands
    return amount.toLocaleString("en-NG");
  };

  return (
    <div className="  ">
      {/* Header */}
      <Paragraph1 className="text-sm font-semibold text-gray-700 tracking-wider mb-4">
        RENTAL SUMMARY
      </Paragraph1>

      {/* Summary Card */}
      <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100">
        <div className="space-y-4 text-sm">
          {/* 1. Rental Fee */}
          <div className="flex justify-between items-center">
            <Paragraph1 className="text-gray-700">
              Rental Fee ( {rentalDays} Days)
            </Paragraph1>
            <Paragraph1 className="font-bold text-gray-900">
              {currency}
              {formatCurrency(rentalFeePerPeriod)}
            </Paragraph1>
          </div>

          {/* 2. Security Deposit */}
          <div className="flex justify-between items-center">
            <Paragraph1 className="text-gray-700">Security Deposit</Paragraph1>
            <Paragraph1 className="font-bold text-gray-900">
              {currency}
              {formatCurrency(securityDeposit)}
            </Paragraph1>
          </div>

          {/* 3. Cleaning Fee */}
          <div className="flex justify-between items-center">
            <Paragraph1 className="text-gray-700">Cleaning Fee</Paragraph1>
            <Paragraph1 className="font-bold text-gray-900">
              {currency}
              {formatCurrency(cleaningFee)}
            </Paragraph1>
          </div>
        </div>

        {/* Separator Line */}
        <hr className="my-6 border-t border-gray-200" />

        {/* Total */}
        <div className="flex justify-between items-center">
          <Paragraph1 className="text-lg font-semibold text-gray-900">
            Total
          </Paragraph1>
          <Paragraph1 className="text-xl font-extrabold text-gray-900">
            {currency}
            {formatCurrency(total)}
          </Paragraph1>
        </div>
      </div>

      {/* Footer Note */}
      <p className="text-xs text-gray-500 text-center mt-4">
        Delivery fees calculated at checkout.
      </p>
    </div>
  );
}

// --- Example Usage (You would use actual state/props in your main app) ---
// const ExampleData = {
//   rentalDays: 3,
//   rentalFeePerPeriod: 165000,
//   securityDeposit: 15000,
//   cleaningFee: 10000,
// };
// <RentalSummaryCard {...ExampleData} />
