"use client";
// ENDPOINTS: GET /api/listers/orders (list), POST /api/listers/orders/:orderId/approve, POST /api/listers/orders/:orderId/reject

import Link from "next/link";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, Clock, Package } from "lucide-react";

import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { useOrders } from "@/lib/queries/listers/useOrders";

// --- Types ---
type OrderLabel = "pending_approval" | "approved" | "completed" | "cancelled";

const statusLabelMap: Record<string, OrderLabel> = {
  pending_approval: "pending_approval",
  ongoing: "approved",
  completed: "completed",
  cancelled: "cancelled",
};

const displayStatusMap: Record<OrderLabel, string> = {
  pending_approval: "Pending Approval",
  approved: "Approved",
  completed: "Completed",
  cancelled: "Cancelled",
};

const OrdersManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<OrderLabel>("pending_approval");
  const tabs: OrderLabel[] = [
    "pending_approval",
    "approved",
    "completed",
    "cancelled",
  ];

  const { data: ordersData, isLoading } = useOrders(
    activeTab === "pending_approval"
      ? "pending_approval"
      : activeTab === "approved"
        ? "ongoing"
        : activeTab,
    1,
    20,
  );

  const orders = useMemo(
    () =>
      ordersData?.data.map((order) => ({
        ...order,
        statusLabel:
          displayStatusMap[statusLabelMap[order.status] || order.status],
        expiresAt: order.timeRemainingSeconds
          ? new Date(
              Date.now() + order.timeRemainingSeconds * 1000,
            ).toISOString()
          : undefined,
      })) || [],
    [ordersData],
  );

  return (
    <div className="w-full">
      {/* 1. Tab Switcher with Motion Pill */}
      <div className="relative mb-8 w-full overflow-hidden">
        <div className="max-w-full w-[340px] hide-scrollbar sm:w-full overflow-x-auto sm:overflow-visible scrollbar-hide">
          <div
            className="
        inline-flex gap-1 p-1
        bg-[#F9F9F7] border border-gray-300 rounded-xl
        whitespace-nowrap
      "
          >
            {tabs.map((tab, _tabIndex) => {
              const isActive = activeTab === tab;

              return (
                <button
                  key={tab}
                  type="button"
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
                  <Paragraph1 className="capitalize">
                    {activeTab === "pending_approval"
                      ? "Pending"
                      : displayStatusMap[activeTab]}
                  </Paragraph1>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Orders List with Staggered Reveal */}
      <div className="space-y-4">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={`skeleton-${i}`}
                  className="bg-white border border-gray-300 rounded-2xl p-4 animate-pulse"
                >
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
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
              {orders.length > 0 ? (
                orders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={{
                      id: order.id,
                      orderNumber: order.orderNumber,
                      date: new Date(order.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        },
                      ),
                      itemCount: order.itemCount,
                      amount: `₦${order.totalAmount.toLocaleString()}`,
                      statusLabel: order.statusLabel,
                      expiresAt: order.expiresAt,
                    }}
                    isPending={activeTab === "pending_approval"}
                  />
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-20 text-center border-2 border-dashed border-gray-300 rounded-2xl text-gray-400"
                >
                  <Paragraph3>
                    No {activeTab.toLowerCase()} orders found.
                  </Paragraph3>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// --- Sub-component: Order Card ---
const OrderCard: React.FC<{
  order: {
    id: string;
    orderNumber: string;
    date: string;
    itemCount: number;
    amount: string;
    statusLabel: string;
    expiresAt?: string;
  };
  isPending?: boolean;
}> = ({ order, isPending = false }) => {
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [isExpired, setIsExpired] = useState(false);

  // Initialize countdown timer
  useEffect(() => {
    if (!isPending || !order.expiresAt) return;

    const updateTimer = () => {
      const now = Date.now();
      const expiresTime = order.expiresAt
        ? new Date(order.expiresAt).getTime()
        : 0;
      const remaining = Math.max(0, Math.floor((expiresTime - now) / 1000));

      if (remaining === 0) {
        setIsExpired(true);
      } else {
        setSecondsRemaining(remaining);
        setIsExpired(false);
      }
    };

    updateTimer(); // Initial call
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [isPending, order.expiresAt]);

  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const isLowTime = secondsRemaining < 300; // 5 minutes

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      className={`bg-white border rounded-2xl p-4 mb-4 flex flex-col space-y-4 ${
        isPending && isExpired
          ? "border-red-300"
          : isPending && isLowTime
            ? "border-orange-300"
            : "border-gray-300"
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <Paragraph1 className="text-sm font-bold text-black uppercase tracking-tight">
            ORDER {order.orderNumber}
          </Paragraph1>
          <div className="flex items-center space-x-4 text-gray-500 flex-wrap">
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
            {/* Countdown Timer for Pending Approval */}
            {isPending && (
              <div
                className={`flex items-center space-x-1 ${isExpired ? "text-red-600" : isLowTime ? "text-orange-500" : "text-gray-500"}`}
              >
                <Clock className="w-4 h-4" />
                <span
                  className={`text-xs font-bold ${isExpired ? "text-red-600" : isLowTime ? "text-orange-600" : ""}`}
                >
                  {isExpired ? "Expired" : formatTime(secondsRemaining)}
                </span>
              </div>
            )}
          </div>
        </div>

        <Paragraph1
          className={`px-4 py-1.5 text-[10px] font-bold rounded-lg uppercase tracking-wider ${
            isExpired
              ? "bg-red-100 text-red-700"
              : isLowTime
                ? "bg-orange-100 text-orange-700"
                : "bg-[#FFF9E5] text-[#D4A017]"
          }`}
        >
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
          href={`/listers/orders/${order.id}`}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 ${
            isExpired
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "bg-[#33332D] text-white hover:bg-black"
          }`}
          onClick={(e) => {
            if (isExpired) e.preventDefault();
          }}
        >
          View Details
        </Link>
      </div>

      {/* Low Time Warning */}
      {isPending && isLowTime && !isExpired && (
        <div className="pt-3 border-t border-orange-200 bg-orange-50 -mx-4 -mb-4 px-4 py-3 rounded-b-2xl">
          <Paragraph1 className="text-xs font-bold text-orange-700">
            ⚠ Approval deadline approaching - {formatTime(secondsRemaining)}{" "}
            remaining
          </Paragraph1>
        </div>
      )}

      {/* Expired Notice */}
      {isExpired && (
        <div className="pt-3 border-t border-red-200 bg-red-50 -mx-4 -mb-4 px-4 py-3 rounded-b-2xl">
          <Paragraph1 className="text-xs font-bold text-red-700">
            ✕ This order's approval deadline has expired and will be
            auto-cancelled.
          </Paragraph1>
        </div>
      )}
    </motion.div>
  );
};

export default OrdersManagement;
