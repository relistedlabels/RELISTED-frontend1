"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";

const OrderSummaryCards: React.FC = () => {
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
              src="/products/p4.jpg"
              alt="Fendi Arco"
              fill
              className="object-cover "
            />
          </div>

          {/* Product Specs */}
          <div className="flex-1 p-2">
            <div className="flex justify-between items-start ">
              <Paragraph3 className="text-lg font-bold text-black">
                Fendi Arco
              </Paragraph3>
              <button className="flex items-center  text-gray-400 hover:text-black transition-colors">
                <Calendar className="w-3 h-3 mr-1" />
                <Paragraph1>Calender </Paragraph1>
              </button>
            </div>
            <Paragraph1 className="text-xs text-gray-400 mb-2">
              Black leather boots
            </Paragraph1>

            <div className="grid grid-cols-2 gap-y-4 border-t  border-gray-300 py-2">
              <div>
                <Paragraph1 className="text-[10px]  text-gray-400  block">
                  Size
                </Paragraph1>
                <Paragraph1 className="text-sm font-bold  text-black">
                  Small
                </Paragraph1>
              </div>
              <div>
                <Paragraph1 className="text-[10px]  text-gray-400  block">
                  Color
                </Paragraph1>
                <Paragraph1 className="text-sm  text-black font-bold">
                  Black
                </Paragraph1>
              </div>
            </div>

            {/* ty------------------------------ */}

            <div className="grid grid-cols-2 gap-y-4 border-t  border-gray-300 pt-2">
              <div>
                <Paragraph1 className="text-[10px]  text-gray-400  block">
                  Rental Fee
                </Paragraph1>
                <Paragraph1 className="text-sm  text-black font-bold">
                  ₦20,000
                </Paragraph1>
              </div>
              <div>
                <Paragraph1 className="text-[10px]  text-gray-400  block">
                  Item Value
                </Paragraph1>
                <Paragraph1 className="text-sm  text-black font-bold">
                  ₦200,000
                </Paragraph1>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 2. Dresser Assignment Card */}
      <motion.div
        variants={{
          hidden: { opacity: 0, x: 20 },
          visible: { opacity: 1, x: 0 },
        }}
        className="bg-white border border-gray-300 rounded-2xl p-4 "
      >
        <div className="border-b border-gray-50 ">
          <Paragraph1 className="text-sm font-bold uppercase text-black ">
            Dresser
          </Paragraph1>
        </div>

        <hr className=" text-gray-300 my-2" />

        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <Paragraph1 className="text-base font-bold text-black">
              Olivia Anderson
            </Paragraph1>
            <div className="flex items-center text-gray-400 space-x-2">
              <div className="p-1.5 bg-gray-50 rounded-md">
                <Calendar className="w-4 h-4 text-black" />
              </div>
              <Paragraph1 className="text-xs font-medium">
                05 May, 2025 - 08 May, 2025
              </Paragraph1>
            </div>
          </div>

          <div className="text-right">
            <Paragraph1 className="text-xl font-bold text-black tracking-tight">
              3 days
            </Paragraph1>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default OrderSummaryCards;
