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
    id: string;
    name: string;
    avatar: string;
  };
  dresser: {
    id: string;
    name: string;
    avatar: string;
  };
  items: number;
  total: number;
  status: string;
  returnDue: string | null;
  paymentReference: string | null;
}

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order?: Order;
}

const getOrderStatusLabel = (raw: unknown): string => {
  const s = String(raw ?? "").trim();
  if (!s) return "—";
  const k = s
    .toUpperCase()
    .replace(/-/g, "_")
    .replace(/\s+/g, "_");

  switch (k) {
    case "PREPARING":
      return "Preparing";
    case "IN_TRANSIT":
      return "In Transit";
    case "DELIVERED":
      return "Delivered";
    case "RETURN_DUE":
      return "Return Due";
    case "RETURN_PICKUP":
      return "Return Pickup";
    case "IN_DISPUTE":
    case "DISPUTED":
      return "Disputed";
    case "COMPLETED":
      return "Completed";
    default:
      return s;
  }
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
  order,
}: OrderDetailModalProps) {
  if (!order) return null;
  const statusLabel = getOrderStatusLabel(order.status);
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
            className="z-40 fixed inset-0 bg-black/50"
          />

          {/* Modal */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="top-0 right-0 bottom-0 z-50 fixed bg-white shadow-lg w-full md:w-3/4 overflow-y-auto"
          >
            {/* Header */}
            <div className="top-0 sticky bg-white p-6 border-gray-200 border-b">
              <div className="flex justify-between items-start gap-4">
                <button
                  onClick={onClose}
                  className="flex-shrink-0 -ml-1 p-1 text-gray-400 hover:text-gray-600 transition"
                >
                  <X size={20} />
                </button>

                <div className="flex-1">
                  <Paragraph3 className="mb-1 font-bold text-gray-900 text-lg">
                    Order Details
                  </Paragraph3>
                  <Paragraph1 className="text-gray-500 text-xs">
                    {order.id} • {order.date}
                  </Paragraph1>
                </div>

                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${getStatusColor(
                    statusLabel,
                  )}`}
                >
                  {statusLabel}
                </span>
              </div>
            </div>

            {/* Content - 4 Sections */}
            <div className="space-y-6 p-6">
              {/* Section 2: Order Details with Curator & Dresser */}
              <OrderSection2
                returnDue={order.returnDue || "N/A"}
                paymentReference={order.paymentReference || "N/A"}
                curatorName={order.curator.name}
                curatorAvatar={order.curator.avatar}
                dresserName={order.dresser.name}
                dresserAvatar={order.dresser.avatar}
              />
              {/* Section 3: Payment Breakdown */}
              <OrderSection3 />

              {/* Section 4: Activity Log */}
              {/* <OrderSection4 /> */}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
