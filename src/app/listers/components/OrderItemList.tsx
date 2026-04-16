"use client";
// ENDPOINTS: GET /api/listers/orders/:orderId/items

import React from "react";
import { useOrderItems } from "@/lib/queries/listers/useOrderItems";
import Image from "next/image";
import { motion } from "framer-motion";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import OrderPreview from "./OrderPreview";
import {
  formatListerOrderStatusLabel,
  normalizeListerOrderStatusKey,
} from "@/lib/listers/listerOrderStatus";
import { isResaleItem } from "@/lib/listers/listerOrderRow";

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
  orderData?: any;
}

const ORDER_ITEM_IMAGE_FALLBACK =
  "https://via.placeholder.com/300?text=No+Image";

const OrderItemList: React.FC<OrderItemListProps> = ({
  orderId,
  items,
  orderData,
}) => {
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
    <div className="mt-8 w-full">
      <Paragraph3 className="mb-4 font-bold text-black text-sm uppercase tracking-tight">
        ITEM ({displayItems.length})
      </Paragraph3>
      <div className="space-y-3">
        {isLoading && displayItems.length === 0 ? (
          <Paragraph1>Loading items...</Paragraph1>
        ) : displayItems.length === 0 ? (
          <Paragraph1>No items found for this order.</Paragraph1>
        ) : (
          displayItems.map((item, index) => {
            const itemSk = normalizeListerOrderStatusKey(
              String(item.status ?? ""),
            );
            const statusText =
              item.statusLabel ||
              formatListerOrderStatusLabel(String(item.status ?? ""));
            const isResale = isResaleItem(item);

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="sm:flex justify-between items-start sm:items-center gap-4 grid grid-cols-3 bg-white p-4 border border-gray-300 rounded-2xl w-full"
              >
                <div className="flex justify-start items-center gap-2 sm:gap-4 col-span-2">
                  <div className="relative bg-gray-50 rounded-lg w-12 sm:w-16 h-16 overflow-hidden shrink-0">
                    <div className="absolute inset-0 bg-[#F6F6F6]" />
                    <Image
                      src={item.image || ORDER_ITEM_IMAGE_FALLBACK}
                      alt={item.name ?? "Order item"}
                      fill
                      sizes="(max-width: 640px) 48px, 64px"
                      className="object-contain"
                    />
                  </div>
                  <div className="flex flex-col">
                    <Paragraph1 className="font-bold text-black text-sm tracking-tight">
                      {item.name}
                    </Paragraph1>
                    <Paragraph1 className="font-medium text-[10px] text-gray-400">
                      Size: {item.size} &nbsp; Color: {item.color}
                    </Paragraph1>
                  </div>
                </div>
                <div className="hidden md:flex flex-col">
                  <Paragraph1 className="mb-0.5 font-bold text-[10px] text-gray-400 uppercase">
                    Order Type
                  </Paragraph1>
                  <Paragraph1 className="font-bold text-black text-sm">
                    {isResale ? "Resale" : "Rental"}
                  </Paragraph1>
                </div>
                <div className="hidden md:flex flex-col">
                  <Paragraph1 className="mb-0.5 font-bold text-[10px] text-gray-400 uppercase">
                    Return Due
                  </Paragraph1>
                  <Paragraph1 className="font-bold text-black text-sm">
                    {isResale ? "-" : item.returnDue}
                  </Paragraph1>
                </div>
                <div className="hidden md:flex flex-col">
                  <Paragraph1 className="mb-0.5 font-bold text-[10px] text-gray-400 uppercase">
                    Price
                  </Paragraph1>
                  <Paragraph1 className="font-bold text-black text-sm">
                    ₦
                    {isResale
                      ? Number(item.purchasePrice || 0).toLocaleString()
                      : Number(item.rentalFee || 0).toLocaleString()}
                  </Paragraph1>
                </div>
                <div className="flex sm:flex-row flex-col justify-end items-center gap-4 sm:space-x-8 w-fit">
                  <Paragraph1
                    className={`
                  px-4 py-1.5 text-[10px] font-bold rounded-lg uppercase tracking-wider
                  ${
                    itemSk === "PENDING" ||
                    itemSk === "PENDING_APPROVAL" ||
                    itemSk === "PENDING_LISTER_APPROVAL"
                      ? "bg-[#FFF9E5] text-[#D4A017]"
                      : itemSk === "DELIVERED"
                        ? "bg-[#E8F8F0] text-[#1DB954]"
                        : itemSk === "ACCEPTED" ||
                            itemSk === "APPROVED" ||
                            itemSk === "ONGOING"
                          ? "bg-[#E8F8F0] text-[#166534]"
                          : itemSk === "REJECTED" ||
                              itemSk === "EXPIRED" ||
                              itemSk === "CANCELLED_BY_RENTER"
                            ? "bg-red-50 text-red-800"
                            : "bg-gray-200 text-gray-700"
                  }
                `}
                  >
                    {statusText}
                  </Paragraph1>
                  <OrderPreview orderData={orderData} clickedItem={item} />
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default OrderItemList;
