"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Package } from "lucide-react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import Link from "next/link";

// --- Types & Mock Data ---
type OrderStatus = "Pending" | "Ongoing" | "Completed" | "Cancelled";

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  itemCount: number;
  amount: string;
  statusLabel: string;
}

const ordersData: Record<OrderStatus, Order[]> = {
  Pending: [
    {
      id: "1",
      orderNumber: "20394RRS4",
      date: "05 May, 2025",
      itemCount: 5,
      amount: "₦550,000",
      statusLabel: "Pending Approval",
    },
    {
      id: "2",
      orderNumber: "20394RRS4",
      date: "05 May, 2025",
      itemCount: 5,
      amount: "₦550,000",
      statusLabel: "Pending Approval",
    },
    {
      id: "3",
      orderNumber: "20394RRS4",
      date: "05 May, 2025",
      itemCount: 5,
      amount: "₦550,000",
      statusLabel: "Pending Approval",
    },
  ],
  Ongoing: [],
  Completed: [],
  Cancelled: [],
};

const OrdersManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<OrderStatus>("Pending");
  const tabs: OrderStatus[] = ["Pending", "Ongoing", "Completed", "Cancelled"];

  return (
    <div className="w-full">
      {/* 1. Tab Switcher with Motion Pill */}
      <div className="relative mb-8 w-full overflow-hidden">
        {/* Scroll container */}
        <div
          className="
      max-w-full w-[340px] hide-scrollbar sm:w-full
      overflow-x-auto
      sm:overflow-visible
      scrollbar-hide
    "
        >
          {/* Actual tabs */}
          <div
            className="
        inline-flex gap-1 p-1
        bg-[#F9F9F7] border border-gray-300 rounded-xl
        whitespace-nowrap
      "
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab;

              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative shrink-0 px-4 sm:px-8 py-2.5 text-sm font-bold transition-colors duration-300 z-10 ${
                    isActive ? "text-white" : "text-gray-500 hover:text-black"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeOrderTab"
                      className="absolute inset-0 bg-[#33332D] rounded-lg z-[-1]"
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.5,
                      }}
                    />
                  )}
                  <Paragraph1>{tab}</Paragraph1>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Orders List with Staggered Reveal */}
      <div className="space-y-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={{
              visible: { transition: { staggerChildren: 0.1 } },
              hidden: {
                transition: { staggerChildren: 0.05, staggerDirection: -1 },
              },
            }}
          >
            {ordersData[activeTab].length > 0 ? (
              ordersData[activeTab].map((order) => (
                <OrderCard key={order.id} order={order} />
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-20 text-center border-2 border-dashed border-gray-300 rounded-2xl text-gray-400"
              >
                <Paragraph3>
                  {" "}
                  No {activeTab.toLowerCase()} orders found.
                </Paragraph3>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

// --- Sub-component: Order Card ---
const OrderCard: React.FC<{ order: Order }> = ({ order }) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      className="bg-white border border-gray-300 rounded-2xl p-4 mb-4  flex flex-col space-y-4"
    >
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <Paragraph1 className="text-sm font-bold text-black uppercase tracking-tight">
            ORDER {order.orderNumber}
          </Paragraph1>
          <div className="flex items-center space-x-4 text-gray-500">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span className="text-xs font-medium">{order.date}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Package className="w-4 h-4" />
              <Paragraph1 className="text-xs font-medium">
                {order.itemCount} Items
              </Paragraph1>
            </div>
          </div>
        </div>

        <Paragraph1 className="px-4 py-1.5 bg-[#FFF9E5] text-[#D4A017] text-[10px] font-bold rounded-lg uppercase tracking-wider">
          {order.statusLabel}
        </Paragraph1>
      </div>

      <div className="h-px bg-gray-300 w-full" />

      <div className="flex flex-col sm:flex-row sm:justify-between gap-4 sm:items-center">
        <div>
          <Paragraph1 className="text-[10px] font-medium text-gray-400 uppercase mb-0.5">
            Total Amount
          </Paragraph1>
          <Paragraph1 className="text-lg font-bold text-black">
            {order.amount}
          </Paragraph1>
        </div>

        <Link
          href="/listers/orders/id"
          className="px-6 py-2.5 bg-[#33332D] text-white rounded-xl text-sm font-bold hover:bg-black transition-all active:scale-95"
        >
          View Details
        </Link>
      </div>
    </motion.div>
  );
};

export default OrdersManagement;
