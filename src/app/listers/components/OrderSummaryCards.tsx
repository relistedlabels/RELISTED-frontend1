"use client";
// ENDPOINTS: GET /api/listers/orders/:orderId (product/dresser summary data)

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";

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
  const rentalFee = product?.rentalFee || 0;
  const itemValue = product?.itemValue || 0;
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: { transition: { staggerChildren: 0.15 } },
      }}
      className="w-full max-w-md space-y-4"
    >
      {/* 1. Product Brief Card */}
      {product && (
        <motion.div
          variants={{
            hidden: { opacity: 0, x: 20 },
            visible: { opacity: 1, x: 0 },
          }}
          className="bg-white border border-gray-300 rounded-2xl p-2"
        >
          <div className="flex space-x-4">
            {/* Image Container */}
            <div className="w-32 h-44 bg-[#F6F6F6] rounded-xl shrink-0 relative overflow-hidden">
              <Image
                src={product.image || "/products/p4.jpg"}
                alt={product.name || "Product"}
                fill
                className="object-cover "
              />
            </div>

            {/* Product Specs */}
            <div className="flex-1 p-2">
              <div className="flex justify-between items-start ">
                <Paragraph3 className="text-lg font-bold text-black">
                  {product.name || "Item"}
                </Paragraph3>
                <button className="flex items-center  text-gray-400 hover:text-black transition-colors">
                  <Calendar className="w-3 h-3 mr-1" />
                  <Paragraph1>Calender </Paragraph1>
                </button>
              </div>
              {product.color && (
                <Paragraph1 className="text-xs text-gray-400 mb-2">
                  {product.color}
                </Paragraph1>
              )}

              <div className="grid grid-cols-2 gap-y-4 border-t  border-gray-300 py-2">
                <div>
                  <Paragraph1 className="text-[10px]  text-gray-400  block">
                    Size
                  </Paragraph1>
                  <Paragraph1 className="text-sm font-bold  text-black">
                    {product.size || "N/A"}
                  </Paragraph1>
                </div>
                <div>
                  <Paragraph1 className="text-[10px]  text-gray-400  block">
                    Color
                  </Paragraph1>
                  <Paragraph1 className="text-sm  text-black font-bold">
                    {product.color || "N/A"}
                  </Paragraph1>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-4 border-t  border-gray-300 pt-2">
                <div>
                  <Paragraph1 className="text-[10px]  text-gray-400  block">
                    Rental Fee
                  </Paragraph1>
                  <Paragraph1 className="text-sm  text-black font-bold">
                    ₦{rentalFee?.toLocaleString() || "0"}
                  </Paragraph1>
                </div>
                <div>
                  <Paragraph1 className="text-[10px]  text-gray-400  block">
                    Item Value
                  </Paragraph1>
                  <Paragraph1 className="text-sm  text-black font-bold">
                    ₦{itemValue?.toLocaleString() || "0"}
                  </Paragraph1>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* 2. Rental Period Card */}
      {timeline && (
        <motion.div
          variants={{
            hidden: { opacity: 0, x: 20 },
            visible: { opacity: 1, x: 0 },
          }}
          className="bg-white border border-gray-300 rounded-2xl p-4 "
        >
          <div className="border-b border-gray-50 ">
            <Paragraph1 className="text-sm font-bold uppercase text-black ">
              Rental Period
            </Paragraph1>
          </div>

          <hr className=" text-gray-300 my-2" />

          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Paragraph1 className="text-base font-bold text-black">
                {timeline.dateOrdered || "TBD"}
              </Paragraph1>
              <div className="flex items-center text-gray-400 space-x-2">
                <div className="p-1.5 bg-gray-50 rounded-md">
                  <Calendar className="w-4 h-4 text-black" />
                </div>
                <Paragraph1 className="text-xs font-medium">
                  {timeline.rentalStartDate && timeline.rentalEndDate
                    ? `${timeline.rentalStartDate} - ${timeline.rentalEndDate}`
                    : "Dates pending"}
                </Paragraph1>
              </div>
            </div>

            <div className="text-right">
              <Paragraph1 className="text-xl font-bold text-black tracking-tight">
                {timeline.itemsCount} item{timeline.itemsCount !== 1 ? "s" : ""}
              </Paragraph1>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default OrderSummaryCards;
