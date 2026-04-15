"use client";
// ENDPOINTS: GET /api/listers/orders/:orderId (product/dresser summary data)

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { isResaleItem } from "@/lib/listers/listerOrderRow";

interface OrderSummaryCardsProps {
  orderData?: any;
  clickedItem?: any;
}

const OrderSummaryCards: React.FC<OrderSummaryCardsProps> = ({
  orderData,
  clickedItem,
}) => {
  // Use the clickedItem if provided, otherwise extract from items array
  const product = clickedItem || orderData?.items?.[0];
  const timeline = orderData?.timeline;
  const isResale = isResaleItem(product);
  const rentalFee = isResale
    ? product?.purchasePrice || 0
    : product?.rentalFee || 0;
  const itemValue = product?.itemValue || 0;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: { transition: { staggerChildren: 0.15 } },
      }}
      className="space-y-4 w-full max-w-md"
    >
      {/* 1. Product Brief Card */}
      {product && (
        <motion.div
          variants={{
            hidden: { opacity: 0, x: 20 },
            visible: { opacity: 1, x: 0 },
          }}
          className="bg-white p-2 border border-gray-300 rounded-2xl"
        >
          <div className="flex space-x-4">
            {/* Image Container */}
            <div className="relative bg-[#F6F6F6] rounded-xl w-32 h-44 overflow-hidden shrink-0">
              <Image
                src={product.image || "/products/p4.jpg"}
                alt={product.name || "Product"}
                fill
                className="object-cover"
              />
            </div>

            {/* Product Specs */}
            <div className="flex-1 p-2">
              <div className="flex justify-between items-start">
                <Paragraph3 className="font-bold text-black text-lg">
                  {product.name || "Item"}
                </Paragraph3>
                <button className="flex items-center text-gray-400 hover:text-black transition-colors">
                  <Calendar className="mr-1 w-3 h-3" />
                  <Paragraph1>Calendar </Paragraph1>
                </button>
              </div>
              {product.color && (
                <Paragraph1 className="mb-2 text-gray-400 text-xs">
                  {product.color}
                </Paragraph1>
              )}

              <div className="gap-y-4 grid grid-cols-2 py-2 border-gray-300 border-t">
                <div>
                  <Paragraph1 className="block text-[10px] text-gray-400">
                    Size
                  </Paragraph1>
                  <Paragraph1 className="font-bold text-black text-sm">
                    {product.size || "N/A"}
                  </Paragraph1>
                </div>
                <div>
                  <Paragraph1 className="block text-[10px] text-gray-400">
                    Color
                  </Paragraph1>
                  <Paragraph1 className="font-bold text-black text-sm">
                    {product.color || "N/A"}
                  </Paragraph1>
                </div>
              </div>

              <div className="gap-y-4 grid grid-cols-2 pt-2 border-gray-300 border-t">
                <div>
                  <Paragraph1 className="block text-[10px] text-gray-400">
                    {isResale ? "Price" : "Rental Fee"}
                  </Paragraph1>
                  <Paragraph1 className="font-bold text-black text-sm">
                    ₦{Number(rentalFee || 0).toLocaleString() || "0"}
                  </Paragraph1>
                </div>
                <div>
                  <Paragraph1 className="block text-[10px] text-gray-400">
                    Item Value
                  </Paragraph1>
                  <Paragraph1 className="font-bold text-black text-sm">
                    ₦{itemValue?.toLocaleString() || "0"}
                  </Paragraph1>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* 2. Rental Period Card - hide for resale */}
      {!isResale && timeline && (
        <motion.div
          variants={{
            hidden: { opacity: 0, x: 20 },
            visible: { opacity: 1, x: 0 },
          }}
          className="bg-white p-4 border border-gray-300 rounded-2xl"
        >
          <div className="border-gray-50 border-b">
            <Paragraph1 className="font-bold text-black text-sm uppercase">
              Rental Period
            </Paragraph1>
          </div>

          <hr className="my-2 text-gray-300" />

          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Paragraph1 className="font-bold text-black text-base">
                {product.rentalStartDate && product.rentalEndDate
                  ? `${product.rentalStartDate} - ${product.rentalEndDate}`
                  : "Dates pending"}
              </Paragraph1>
              <div className="flex items-center space-x-2 text-gray-400">
                <div className="bg-gray-50 p-1.5 rounded-md">
                  <Calendar className="w-4 h-4 text-black" />
                </div>
                <Paragraph1 className="font-medium text-xs">
                  {product.rentalDays || 0} day
                  {product.rentalDays !== 1 ? "s" : ""}
                </Paragraph1>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default OrderSummaryCards;
