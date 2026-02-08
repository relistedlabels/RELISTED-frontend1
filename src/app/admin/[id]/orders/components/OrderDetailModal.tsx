// ENDPOINTS: GET /api/admin/orders/:orderId
"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import OrderSection1 from "./OrderSection1";
import OrderSection2 from "./OrderSection2";
import OrderSection3 from "./OrderSection3";
import OrderSection4 from "./OrderSection4";

interface Order {
  id: string;
  date: string;
  curator: {
    name: string;
    avatar: string;
    email?: string;
  };
  dresser: {
    name: string;
    avatar: string;
    email?: string;
    phone?: string;
  };
  items: number;
  total: string;
  status:
    | "Preparing"
    | "In Transit"
    | "Delivered"
    | "Return Due"
    | "Return Pickup"
    | "Disputed";
  returnDue: string;
}

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order?: Order;
}

const DEFAULT_ORDER: Order = {
  id: "#RL5-23894",
  date: "Oct 10, 2025",
  curator: {
    name: "Grace Adebayo",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop&radius=50",
  },
  dresser: {
    name: "Chioma Eze",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&radius=50",
  },
  items: 3,
  total: "₦300,000",
  status: "In Transit",
  returnDue: "Oct 15, 2025",
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "Preparing":
      return "bg-gray-100 text-gray-700";
    case "In Transit":
      return "bg-blue-100 text-blue-700";
    case "Delivered":
      return "bg-green-100 text-green-700";
    case "Return Due":
      return "bg-yellow-100 text-yellow-700";
    case "Return Pickup":
      return "bg-purple-100 text-purple-700";
    case "Disputed":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

export default function OrderDetailModal({
  isOpen,
  onClose,
  order = DEFAULT_ORDER,
}: OrderDetailModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed right-0 top-0 bottom-0 w-full md:w-3/4 bg-white z-50 overflow-y-auto shadow-lg"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex items-start justify-between gap-4">
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition p-1 -ml-1 flex-shrink-0"
                >
                  <X size={20} />
                </button>

                <div className="flex-1">
                  <Paragraph3 className="text-lg font-bold text-gray-900 mb-1">
                    Order Details
                  </Paragraph3>
                  <Paragraph1 className="text-xs text-gray-500">
                    {order.id} • {order.date}
                  </Paragraph1>
                </div>

                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${getStatusColor(
                    order.status,
                  )}`}
                >
                  {order.status}
                </span>
              </div>
            </div>

            {/* Content - 4 Sections */}
            <div className="p-6 space-y-6">
              {/* Section 1: Order Information */}
              <OrderSection1 />

              {/* Section 2: Order Details with Curator & Dresser */}
              <OrderSection2
                rentalPeriod="5 days"
                returnDue="Oct 19, 2025"
                trackingId="TRK-4589Z301"
                courier="DHL Express"
                curatorName={order.curator.name}
                curatorEmail={order.curator.email || "curator@example.com"}
                curatorAvatar={order.curator.avatar}
                dresserName={order.dresser.name}
                dresserEmail={order.dresser.email || "dresser@example.com"}
                dresserPhone={order.dresser.phone || "+234 803-456-7890"}
                dresserAvatar={order.dresser.avatar}
              />
              {/* Section 3: Payment Breakdown */}
              <OrderSection3 />

              {/* Section 4: Activity Log */}
              <OrderSection4 />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
