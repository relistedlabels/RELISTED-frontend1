"use client";
// ENDPOINTS: GET /api/listers/orders/:orderId (payment & escrow summary)

import React from "react";
import { Lock } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import {
  isListerResaleOrder,
  isResaleItem,
} from "@/lib/listers/listerOrderRow";

interface OrderSummaryEscrowProps {
  rentalFeeTotal?: string;
  escrowValueHeld?: string;
  orderData?: any;
  clickedItem?: any;
}

const OrderSummaryEscrow: React.FC<OrderSummaryEscrowProps> = ({
  rentalFeeTotal: propRentalFeeTotal,
  escrowValueHeld: propEscrowValueHeld,
  orderData,
  clickedItem,
}) => {
  // Use item-level data if clickedItem is provided, otherwise order-level
  const isResale = isResaleItem(clickedItem) || isListerResaleOrder(orderData);

  // Extract from clickedItem if available, otherwise from orderData
  const rentalFeeTotal = isResale
    ? clickedItem?.purchasePrice ||
      orderData?.escrow?.purchasePrice ||
      orderData?.totalAmount ||
      propRentalFeeTotal
    : clickedItem?.rentalFee ||
      orderData?.escrow?.rentalFeeTotal ||
      orderData?.totalAmount ||
      propRentalFeeTotal;
  const escrowValueHeld = isResale
    ? clickedItem?.purchasePrice ||
      orderData?.escrow?.purchasePrice ||
      orderData?.totalAmount ||
      propEscrowValueHeld
    : clickedItem?.itemValue ||
      clickedItem?.itemValueHeld ||
      orderData?.escrow?.totalHeld ||
      orderData?.totalAmount ||
      propEscrowValueHeld;
  const releaseCondition =
    orderData?.escrow?.releaseCondition || "return confirmation";

  // Format currency for display
  const formatCurrency = (value: any) => {
    if (typeof value === "string") return value;
    if (typeof value === "number") {
      return `₦${value.toLocaleString()}`;
    }
    return "₦0";
  };
  return (
    <div className="bg-white p-4 border border-gray-300 rounded-2xl w-full">
      <Paragraph1 className="mb-4 font-bold text-black text-xl uppercase">
        {clickedItem ? "Item Summary" : "Order Summary"}
      </Paragraph1>

      {/* Financial Totals */}
      <div className="space-y-4 mb-4">
        <div className="flex justify-between items-center">
          <Paragraph1 className="font-bold text-black text-lg">
            {isResale ? "Price Total:" : "Rental Fee Total:"}
          </Paragraph1>
          <Paragraph1 className="font-bold text-black text-2xl">
            {formatCurrency(rentalFeeTotal)}
          </Paragraph1>
        </div>

        <div className="flex justify-between items-center">
          <Paragraph1 className="font-bold text-black text-lg">
            Escrow Value Held:
          </Paragraph1>
          <Paragraph1 className="font-bold text-black text-2xl">
            {formatCurrency(escrowValueHeld)}
          </Paragraph1>
        </div>
      </div>

      {/* Escrow Informational Box */}
      <div className="flex items-start space-x-4 bg-[#FFFCEB] p-4 border border-[#FFEB82] rounded-xl">
        <div className="mt-1 shrink-0">
          <div className="bg-[#FFD700] p-1.5 rounded-md">
            <Lock className="fill-current w-4 h-4 text-white" />
          </div>
        </div>

        <div className="flex flex-col space-y-1">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-black text-base">
              {formatCurrency(escrowValueHeld)}
            </span>
            <span className="font-medium text-black text-base">
              locked in escrow
            </span>
          </div>
          <Paragraph1 className="text-gray-700 text-sm leading-relaxed">
            Funds will be released to the renters wallet after{" "}
            {isResale ? "delivery confirmation" : releaseCondition}
          </Paragraph1>
        </div>
      </div>
    </div>
  );
};

export default OrderSummaryEscrow;
