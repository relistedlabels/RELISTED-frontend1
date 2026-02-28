"use client";
// ENDPOINTS: GET /api/listers/orders/:orderId/items

import React from "react";
import { useOrderItems } from "@/lib/queries/listers/useOrderItems";
import Image from "next/image";
import { motion } from "framer-motion";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import OrderPreview from "./OrderPreview";

// --- Types & Mock Data ---
interface OrderedItem {
  id: string;
  name: string;
  size: string;
  color: string;
  returnDue: string;
  amount: string;
  status: "Pending" | "Delivered" | "Return Due";
  imageSrc: string;
}

interface OrderItemListProps {
  orderId: string;
  items?: any[];
}

const OrderItemList: React.FC<OrderItemListProps> = ({ orderId, items }) => {
  // If items are passed as props, use them; otherwise, fetch
  let displayItems: any[] = [];
  let isLoading = false;
  if (items && items.length > 0) {
    displayItems = items;
  } else {
    const query = useOrderItems(orderId);
    displayItems = query.data?.data || [];
    isLoading = query.isLoading;
  }
  return (
    <div className="w-full mt-8">
      <Paragraph3 className="text-sm font-bold text-black mb-4 uppercase tracking-tight">
        ITEM ({displayItems.length})
      </Paragraph3>
      <div className="space-y-3">
        {isLoading && displayItems.length === 0 ? (
          <Paragraph1>Loading items...</Paragraph1>
        ) : displayItems.length === 0 ? (
          <Paragraph1>No items found for this order.</Paragraph1>
        ) : (
          displayItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="sm:flex sm:items-center grid items-start grid-cols-3 w-full  gap-4 justify-between bg-white border border-gray-300 rounded-2xl p-4 "
            >
              <div className="flex items-center col-span-2 justify-start  gap-2 sm:gap-4 ">
                <div className="sm:w-16 w-12 h-16 bg-gray-50 rounded-lg shrink-0 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[#F6F6F6]" />
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-contain "
                  />
                </div>
                <div className="flex flex-col">
                  <Paragraph1 className="text-sm font-bold text-black tracking-tight">
                    {item.name}
                  </Paragraph1>
                  <Paragraph1 className="text-[10px] text-gray-400 font-medium">
                    Size: {item.size} &nbsp; Color: {item.color}
                  </Paragraph1>
                </div>
              </div>
              <div className="hidden md:flex flex-col">
                <Paragraph1 className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">
                  Return Due
                </Paragraph1>
                <Paragraph1 className="text-sm font-bold text-black">
                  {item.returnDue}
                </Paragraph1>
              </div>
              <div className="hidden md:flex flex-col">
                <Paragraph1 className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">
                  Amount
                </Paragraph1>
                <Paragraph1 className="text-sm font-bold text-black">
                  ₦{item.rentalFee?.toLocaleString()}
                </Paragraph1>
              </div>
              <div className="flex items-center flex-col sm:flex-row gap-4  w-fit justify-end sm:space-x-8">
                <Paragraph1
                  className={`
                  px-4 py-1.5 text-[10px] font-bold rounded-lg uppercase tracking-wider
                  ${
                    item.status === "pending_approval"
                      ? "bg-[#FFF9E5] text-[#D4A017]"
                      : item.status === "delivered"
                        ? "bg-[#E8F8F0] text-[#1DB954]"
                        : "bg-gray-200 text-gray-700"
                  }
                `}
                >
                  {item.statusLabel || item.status}
                </Paragraph1>
                <OrderPreview />
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrderItemList;
