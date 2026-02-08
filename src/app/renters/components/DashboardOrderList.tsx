// ENDPOINTS: GET /api/renters/orders

"use client";

import React, { useState } from "react";
import { Calendar, Package } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import OrderDetails from "./OrderDetails1";

// --- Order Data Structure ---
interface Order {
  id: string;
  date: string;
  items: number;
  total: number;
  status: "In Progress" | "In Transit" | "Delivered" | "Returned";
  view: "ongoing" | "completed";
}

// --- Placeholder Data reflecting the image and logic ---
const initialOrders: Order[] = [
  // Ongoing Orders
  {
    id: "20394RR54",
    date: "05 May, 2025",
    items: 6475,
    total: 550000,
    status: "In Progress",
    view: "ongoing",
  },
  {
    id: "20394RR54",
    date: "05 May, 2025",
    items: 5,
    total: 434000,
    status: "In Transit",
    view: "ongoing",
  },
  // Completed/Finalized Orders
  {
    id: "212194RR54",
    date: "05 May, 2025",
    items: 509,
    total: 550000,
    status: "Delivered",
    view: "completed",
  },
  {
    id: "20394RR54",
    date: "05 May, 2025",
    items: 5,
    total: 550000,
    status: "Returned",
    view: "completed",
  },
];

export default function DashboardOrderList() {
  const [orderView, setOrderView] = useState<"ongoing" | "completed">(
    "ongoing",
  );

  const orders = initialOrders.filter((order) => order.view === orderView);
  const currency = "₦";

  // Formatting Helper
  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString("en-NG");
  };

  // Status Badge Colors (matches colors in both images)
  const getStatusBadge = (status: Order["status"]) => {
    let classes = "px-4 py-1  font-bold rounded-sm";
    let text = status;

    switch (status) {
      case "In Progress":
        classes += " bg-yellow-100 text-yellow-800";
        break;
      case "In Transit":
        classes += " bg-blue-100 text-blue-800";
        break;
      case "Delivered":
        classes += " bg-gray-100 text-gray-800";
        break;
      case "Returned":
        classes += " bg-green-100 text-green-800";
        break;
    }

    return <span className={classes}>{text}</span>;
  };

  return (
    <div className=" w-full">
      {/* Tab Navigation (Ongoing / Completed) */}
      <div className="flex w-fit border rounded-sm p-1 border-gray-300  mb-6 ">
        <button
          onClick={() => setOrderView("ongoing")}
          className={`
                        px-8 py-2 font-semibold text-sm transition-colors duration-150
                        ${
                          orderView === "ongoing"
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

      {/* Order List */}
      <div className="space-y-4">
        {orders.map((order, index) => (
          <div
            key={index}
            className="bg-white p-4 rounded-sm border border-gray-300 "
          >
            {/* Left Side: Details */}
            <div>
              <div className="flex items-center justify-between space-x-3 mb-1">
                <Paragraph1 className="font-bold text-gray-900 tracking-wider">
                  ORDER {order.id}
                </Paragraph1>
                <Paragraph1> {getStatusBadge(order.status)}</Paragraph1>
              </div>

              <div className="flex items-center text-xs text-gray-500 mb-3 space-x-3">
                <span className="flex items-center">
                  <Calendar size={14} className="mr-1" /> {order.date}
                </span>
                <span className="flex items-center">
                  <Package size={14} className="mr-1" /> {order.items} Items
                </span>
              </div>
              <hr className="text-gray-300" />
              <div className="flex pt-3 flex-col sm:flex-row justify-between gap-3 sm:items-center">
                <div className="text-lg font-bold text-gray-900">
                  <Paragraph1> Total Amount</Paragraph1>{" "}
                  <Paragraph1>
                    {" "}
                    {currency}
                    {formatCurrency(order.total)}
                  </Paragraph1>{" "}
                </div>
                {/* Right Side: Action Button */}
                <OrderDetails />
              </div>
            </div>
          </div>
        ))}
      </div>

      {orders.length === 0 && (
        <div className="text-center py-12 text-gray-500 bg-white rounded-xl shadow-sm">
          No {orderView} orders found.
        </div>
      )}
    </div>
  );
}
