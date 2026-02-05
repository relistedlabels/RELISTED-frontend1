"use client";

import React, { useState } from "react";
import { Paragraph1, Paragraph2, Paragraph3 } from "@/common/ui/Text";
import { Calendar, Download, Eye } from "lucide-react";
import { HiOutlineShoppingBag } from "react-icons/hi";
import { PiCheckCircle, PiWarning, PiPackage } from "react-icons/pi";
import { PiHash } from "react-icons/pi";
import OrderDetailModal from "./components/OrderDetailModal";

interface Order {
  id: string;
  date: string;
  curator: {
    name: string;
    avatar: string;
  };
  dresser: {
    name: string;
    avatar: string;
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

const ORDERS: Order[] = [
  {
    id: "#RL5-23894",
    date: "Oct 10, 2025",
    curator: {
      name: "Grace Adebayo",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=32&h=32&fit=crop&radius=50",
    },
    dresser: {
      name: "Chioma Eze",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&radius=50",
    },
    items: 3,
    total: "₦300,000",
    status: "In Transit",
    returnDue: "Oct 15, 2025",
  },
  {
    id: "#RL5-23975",
    date: "Oct 8, 2025",
    curator: {
      name: "Blessing Okafor",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&radius=50",
    },
    dresser: {
      name: "Amaka Johnson",
      avatar:
        "https://images.unsplash.com/photo-1552058544-f8b08422c7f3?w=32&h=32&fit=crop&radius=50",
    },
    items: 2,
    total: "₦260,000",
    status: "Delivered",
    returnDue: "Oct 15, 2025",
  },
];

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

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const statCards = [
    {
      label: "TOTAL LISTINGS",
      value: "6",
      icon: HiOutlineShoppingBag,
      bgColor: "bg-gray-50",
    },
    {
      label: "COMPLETED ORDERS",
      value: "2",
      icon: PiCheckCircle,
      bgColor: "bg-blue-50",
    },
    {
      label: "ACTIVE ORDERS",
      value: "2",
      icon: PiPackage,
      bgColor: "bg-green-50",
    },
    {
      label: "DISPUTED ORDERS",
      value: "2",
      icon: PiWarning,
      bgColor: "bg-yellow-50",
    },
    {
      label: "REVENUE (in naira)",
      value: "N0.5M",
      icon: PiHash,
      bgColor: "bg-pink-50",
    },
  ];

  return (
    <>
      <div className="min-h-screen ">
        {/* Header */}
        <div className="mb-6">
          <Paragraph2 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-1">
            Orders
          </Paragraph2>
          <Paragraph1 className="text-gray-600">
            Track, verify, and manage all rental orders.
          </Paragraph1>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg p-4 mb-6 border border-gray-200">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-64 flex items-center gap-2  rounded-lg px-4 py-2 border border-gray-200">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search orders, dressers, curators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-sm text-gray-900 placeholder-gray-500 outline-none flex-1"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                <Calendar size={16} className="text-gray-600" />
                <select className="bg-transparent text-sm font-medium text-gray-900 outline-none">
                  <option>All Time</option>
                </select>
              </div>

              <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition font-medium text-sm">
                <Download size={16} />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {statCards.map((card, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-4 border border-gray-200"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded ${card.bgColor} flex-shrink-0`}>
                  <card.icon size={20} className="text-gray-700" />
                </div>
                <div className="flex-1">
                  <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {card.label}
                  </Paragraph1>
                  <Paragraph3 className="text-xl font-bold text-gray-900 mt-0.5">
                    {card.value}
                  </Paragraph3>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-t-lg border-b border-gray-200 mb-0">
          <div className="flex items-center gap-8 px-6">
            {[
              { id: "active", label: "Active", count: 4 },
              { id: "completed", label: "Completed", count: 1 },
              { id: "rejected", label: "Rejected", count: 1 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "text-gray-900 border-black"
                    : "text-gray-500 border-transparent hover:text-gray-700"
                }`}
              >
                {tab.label}
                <span className="ml-2 text-gray-500">({tab.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="bg-white px-6 py-4 border-b border-gray-200 mb-6">
          <div className="flex items-center gap-4 overflow-x-auto pb-2">
            {[
              "All",
              "Preparing",
              "In Transit",
              "Delivered",
              "Return Due",
              "Return Pickup",
              "Disputed",
            ].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  statusFilter === status
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-4 text-left">
                    <Paragraph1 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Order ID
                    </Paragraph1>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <Paragraph1 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Date
                    </Paragraph1>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <Paragraph1 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Curator
                    </Paragraph1>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <Paragraph1 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Dresser
                    </Paragraph1>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <Paragraph1 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Items
                    </Paragraph1>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <Paragraph1 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Total
                    </Paragraph1>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <Paragraph1 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Status
                    </Paragraph1>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <Paragraph1 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Return Due
                    </Paragraph1>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <Paragraph1 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Action
                    </Paragraph1>
                  </th>
                </tr>
              </thead>
              <tbody>
                {ORDERS.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4">
                      <Paragraph1 className="text-sm font-medium text-gray-900">
                        {order.id}
                      </Paragraph1>
                    </td>
                    <td className="px-6 py-4">
                      <Paragraph1 className="text-sm text-gray-700">
                        {order.date}
                      </Paragraph1>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <img
                          src={order.curator.avatar}
                          alt={order.curator.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <Paragraph1 className="text-sm text-gray-900">
                          {order.curator.name}
                        </Paragraph1>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <img
                          src={order.dresser.avatar}
                          alt={order.dresser.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <Paragraph1 className="text-sm text-gray-900">
                          {order.dresser.name}
                        </Paragraph1>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Paragraph1 className="text-sm text-gray-700">
                        {order.items} items
                      </Paragraph1>
                    </td>
                    <td className="px-6 py-4">
                      <Paragraph1 className="text-sm font-medium text-gray-900">
                        {order.total}
                      </Paragraph1>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          order.status,
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Paragraph1 className="text-sm text-gray-700">
                        {order.returnDue}
                      </Paragraph1>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setIsDetailModalOpen(true);
                        }}
                        className="flex items-center gap-1 px-3 py-1 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition font-medium text-sm"
                      >
                        <Eye size={16} />
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <OrderDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        order={selectedOrder || undefined}
      />
    </>
  );
}
