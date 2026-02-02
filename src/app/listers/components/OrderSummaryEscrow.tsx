"use client";

import React from "react";
import { Lock } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";

interface OrderSummaryEscrowProps {
  rentalFeeTotal?: string;
  escrowValueHeld?: string;
}

const OrderSummaryEscrow: React.FC<OrderSummaryEscrowProps> = ({
  rentalFeeTotal = "₦50,000",
  escrowValueHeld = "₦200,000",
}) => {
  return (
    <div className="w-full  bg-white border border-gray-300 rounded-2xl p-4 ">
      <Paragraph1 className="text-xl font-bold uppercase text-black mb-4">Order Summary</Paragraph1>

      {/* Financial Totals */}
      <div className="space-y-4 mb-4">
        <div className="flex justify-between items-center">
          <Paragraph1 className="text-lg font-bold text-black">
            Rental Fee Total:
          </Paragraph1>
          <Paragraph1 className="text-2xl font-bold text-black">
            {rentalFeeTotal}
          </Paragraph1>
        </div>

        <div className="flex justify-between items-center">
          <Paragraph1 className="text-lg font-bold text-black">
            Escrow Value Held:
          </Paragraph1>
          <Paragraph1 className="text-2xl font-bold text-black">
            {escrowValueHeld}
          </Paragraph1>
        </div>
      </div>

      {/* Escrow Informational Box */}
      <div className="bg-[#FFFCEB] border border-[#FFEB82] rounded-xl p-4 flex items-start space-x-4">
        <div className="mt-1 shrink-0">
          <div className="bg-[#FFD700] p-1.5 rounded-md">
            <Lock className="w-4 h-4 text-white fill-current" />
          </div>
        </div>

        <div className="flex flex-col space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-base font-bold text-black">
              {escrowValueHeld}
            </span>
            <span className="text-base font-medium text-black">
              locked in escrow
            </span>
          </div>
          <Paragraph1 className="text-sm text-gray-700 leading-relaxed">
            Funds will be released to your wallet after return confirmation
          </Paragraph1>
        </div>
      </div>
    </div>
  );
};

export default OrderSummaryEscrow;
