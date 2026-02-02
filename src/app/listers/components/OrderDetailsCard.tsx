"use client";

import React from "react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";

interface OrderDetailsProps {
  orderNumber?: string;
  status?: "Pending Approval" | "Ongoing" | "Completed" | "Cancelled";
  dateOrdered?: string;
  itemCount?: number;
  itemsDelivered?: number;
  totalItems?: number;
  totalAmount?: string;
}

const OrderDetailsCard: React.FC<OrderDetailsProps> = ({
  orderNumber = "43RF843R90",
  status = "Pending Approval",
  dateOrdered = "Sun, Oct 19 2025",
  itemCount = 3,
  itemsDelivered = 1,
  totalItems = 6,
  totalAmount = "₦550,000",
}) => {
  return (
    <div className="w-full bg-white border border-gray-300 rounded-2xl p-4">
      {/* 1. Header Row: Order Number and Status Badge */}
      <div className="flex justify-between items-start mb-6">
        <Paragraph3 className="text-xl font-bold text-black uppercase tracking-tight">
          ORDER {orderNumber}
        </Paragraph3>

        <div className="flex flex-col items-end- space-y-1">
          <Paragraph1 className="hidden sm:flex text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Order Status
          </Paragraph1>
          <Paragraph1 className="px-4 py-1.5 bg-[#FFF9E5] text-[#D4A017] text-xs font-bold rounded-lg whitespace-nowrap">
            {status}
          </Paragraph1>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-gray-300 mb-8" />

      {/* 2. Details Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {/* Date Ordered */}
        <div className="flex flex-col">
          <Paragraph1 className="text-[10px] font-bold text-gray-400 uppercase mb-1">
            Date Ordered
          </Paragraph1>
          <Paragraph1 className="font-bold text-black text-sm">
            {dateOrdered}
          </Paragraph1>
        </div>

        {/* Number of Items */}
        <div className="flex flex-col">
          <Paragraph1 className="text-[10px] font-bold text-gray-400 uppercase mb-1">
            Number of Items
          </Paragraph1>
          <Paragraph1 className="font-bold text-black text-sm">
            {itemCount} Items
          </Paragraph1>
        </div>

        {/* Items Delivered Progress */}
        <div className="flex flex-col sm:items-center ">
          <Paragraph1 className="text-[10px] font-bold text-gray-400 uppercase mb-1">
            Items Delivered
          </Paragraph1>
          <Paragraph1 className="font-bold text-black text-sm">
            {itemsDelivered} / {totalItems} Delivered
          </Paragraph1>
        </div>

        {/* Total Amount */}
        <div className="flex flex-col sm:items-end">
          <Paragraph1 className="text-[10px] font-bold text-gray-400 uppercase mb-1">
            Total Amount
          </Paragraph1>
          <Paragraph1 className="font-bold text-black text-sm">
            {totalAmount}
          </Paragraph1>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsCard;
