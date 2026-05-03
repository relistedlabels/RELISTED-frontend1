// ENDPOINTS: GET /api/renters/orders

"use client";

import React, { useState } from "react";
import { Calendar, Package } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import OrderDetails from "./OrderDetails1";
import { useOrders } from "@/lib/queries/renters/useOrders";
import {
  getRenterOrderBadgeClassName,
  getRenterOrderStatusLabel,
} from "@/lib/renters/renterOrderStatus";

export default function DashboardOrderList() {
  const [orderView, setOrderView] = useState<"active" | "completed">("active");

  const { data, isLoading, error } = useOrders(
    orderView === "active" ? "active" : "completed",
    1,
    10,
    "newest",
  );

  const orders = data?.orders || [];

  // Filter orders based on view - remove PROCESSING/ACTIVE from completed view
  const filteredOrders = orders.filter((order) => {
    const s = String(order.status ?? "")
      .toUpperCase()
      .replace(/-/g, "_");
    const terminal = new Set([
      "RETURNED",
      "COMPLETED",
      "CANCELLED",
      "REJECTED",
    ]);
    if (orderView === "active") return !terminal.has(s);
    return terminal.has(s);
  });
  const currency = "₦";

  const formatCurrency = (amount: number | undefined): string => {
    if (amount === undefined || amount === null) return "0";
    return amount.toLocaleString("en-NG");
  };

  const getStatusBadge = (status: string) => {
    const label = getRenterOrderStatusLabel(status);
    return (
      <span
        className={`px-4 py-1 font-bold rounded-sm text-xs ${getRenterOrderBadgeClassName(label)}`}
      >
        {label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="w-full animate-pulse">
        <div className="h-20 bg-gray-300 rounded mb-4"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-300 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500 bg-white rounded-xl shadow-sm">
        Failed to load orders. Please try again.
      </div>
    );
  }

  return (
    <div className=" w-full">
      <div className="flex w-fit border rounded-sm p-1 border-gray-300  mb-6 ">
        <button
          onClick={() => setOrderView("active")}
          className={`
                        px-8 py-2 font-semibold text-sm transition-colors duration-150
                        ${
                          orderView === "active"
                            ? "bg-black text-white rounded-sm"
                            : "text-gray-700  hover:bg-gray-100 rounded-sm"
                        }
                    `}
        >
          <Paragraph1>Ongoing</Paragraph1>
        </button>
        <button
          onClick={() => setOrderView("completed")}
          className={`
                        px-8 py-2 font-semibold text-sm transition-colors duration-150
                        ${
                          orderView === "completed"
                            ? "bg-black text-white rounded-sm"
                            : "text-gray-700 hover:bg-gray-100  "
                        }
                    `}
        >
          <Paragraph1>Completed</Paragraph1>
        </button>
      </div>

      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <div
            key={order.orderId}
            className="bg-white p-4 rounded-sm border border-gray-300 "
          >
            <div>
              <div className="flex items-center justify-between space-x-3 mb-3">
                <Paragraph1 className="font-bold text-gray-900 tracking-wider">
                  {order.orderId}
                </Paragraph1>
                <Paragraph1> {getStatusBadge(order.status)}</Paragraph1>
              </div>

              <div className="flex items-center text-xs text-gray-500 mb-3 space-x-2 flex-wrap">
                <Package size={14} className="shrink-0" />
                <span>{order.items.length} item(s)</span>
                <Package size={14} className="shrink-0" />
                <span className="text-xs text-gray-700 font-semibold">
                  {order.listerName}
                </span>
                <Calendar size={14} className="shrink-0" />
                <span>{new Date(order.date).toLocaleDateString()}</span>
              </div>
              <hr className="text-gray-300" />
              <div className="flex pt-3 flex-col sm:flex-row justify-between gap-3 sm:items-center">
                <div className="text-lg font-bold text-gray-900">
                  <Paragraph1> Total Amount</Paragraph1>{" "}
                  <Paragraph1>
                    {" "}
                    {currency}
                    {formatCurrency(order.totalAmount)}
                  </Paragraph1>{" "}
                </div>
                <OrderDetails orderId={order.orderId} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12 text-gray-500 bg-white rounded-xl shadow-sm">
          No {orderView} orders found.
        </div>
      )}
    </div>
  );
}
