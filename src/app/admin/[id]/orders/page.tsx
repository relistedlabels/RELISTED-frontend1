// ENDPOINTS: GET /api/admin/orders, GET /api/admin/orders/stats, GET /api/admin/orders/:orderId, PUT /api/admin/orders/:orderId/status, POST /api/admin/orders/:orderId/cancel, GET /api/admin/orders/export
"use client";

import React, { useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { Paragraph1, Paragraph2, Paragraph3 } from "@/common/ui/Text";
import { TableSkeleton, StatCardSkeleton } from "@/common/ui/SkeletonLoaders";
import {
  Calendar,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { HiOutlineShoppingBag } from "react-icons/hi";
import { PiCheckCircle, PiWarning, PiPackage } from "react-icons/pi";
import { PiHash } from "react-icons/pi";
import OrderDetailModal from "./components/OrderDetailModal";
import ReturnDetailModal from "./components/ReturnDetailModal";
import { useOrders, useOrderStats } from "@/lib/queries/admin/useOrders";
import type { Order, Return } from "@/lib/api/admin/orders";

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(value);
};

const getDefaultAvatar = (name?: string): string => {
  // Create a simple avatar using UI Avatars service
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || "user")}`;
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

export default function OrdersPage() {
  const router = useRouter();
  const params = useParams();
  const adminId = params.id as string;

  const [activeTab, setActiveTab] = useState("all");
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<any>(null);
  const [isReturnDetailModalOpen, setIsReturnDetailModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch orders and stats
  const {
    data: ordersData,
    isLoading: ordersLoading,
    isError: ordersError,
  } = useOrders({
    tab: activeTab,
    status: statusFilter !== "All" ? statusFilter : undefined,
    search: searchQuery || undefined,
  }) as any;

  const {
    data: statsData,
    isLoading: statsLoading,
    isError: statsError,
  } = useOrderStats("all_time");

  // Log errors to console if they exist
  if (statsError) console.error("Statistics error:", statsError);
  if (ordersError) console.error("Orders error:", ordersError);

  // Extract orders or returns from the response
  const orders = useMemo(() => {
    if (statusFilter === "Returns") {
      return (ordersData?.data?.returns || []) as Return[];
    }
    return (ordersData?.data?.orders || []) as Order[];
  }, [ordersData, statusFilter]);

  // Get pagination info
  const pagination = useMemo(() => {
    return (
      ordersData?.data?.pagination || { total: 0, page: 1, limit: 20, pages: 1 }
    );
  }, [ordersData]);

  // Build stat cards from real data
  const statCards = useMemo(() => {
    const stats = statsData?.data;
    return [
      {
        label: "TOTAL LISTINGS",
        value: stats?.totalListings?.toString() || "0",
        icon: HiOutlineShoppingBag,
        bgColor: "bg-gray-50",
      },
      {
        label: "COMPLETED ORDERS",
        value: stats?.completedOrders?.toString() || "0",
        icon: PiCheckCircle,
        bgColor: "bg-blue-50",
      },
      {
        label: "ACTIVE ORDERS",
        value: stats?.activeOrders?.toString() || "0",
        icon: PiPackage,
        bgColor: "bg-green-50",
      },
      {
        label: "DISPUTED ORDERS",
        value: stats?.disputedOrders?.toString() || "0",
        icon: PiWarning,
        bgColor: "bg-yellow-50",
      },
      {
        label: "REVENUE (in naira)",
        value: stats?.totalRevenue ? formatCurrency(stats.totalRevenue) : "₦0",
        icon: PiHash,
        bgColor: "bg-pink-50",
      },
    ];
  }, [statsData]);

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

            <div className="flex- hidden items-center gap-2">
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
          {statsLoading ? (
            <>
              {[...Array(5)].map((_, index) => (
                <StatCardSkeleton key={index} />
              ))}
            </>
          ) : (
            statCards.map((card, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-4 border border-gray-200"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded ${card.bgColor} flex-shrink-0`}
                  >
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
            ))
          )}
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
                {/* <span className="ml-2 text-gray-500">({tab.count})</span> */}
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
              "Returns",
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

        {/* Orders/Returns Table */}
        {ordersLoading || ordersError ? (
          <TableSkeleton rows={5} columns={9} />
        ) : (
          <>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      {statusFilter === "Returns" ? (
                        <>
                          <th className="px-6 py-4 text-left">
                            <Paragraph1 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                              Return ID
                            </Paragraph1>
                          </th>
                          <th className="px-6 py-4 text-left">
                            <Paragraph1 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                              Order ID
                            </Paragraph1>
                          </th>
                          <th className="px-6 py-4 text-left">
                            <Paragraph1 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                              Item Name
                            </Paragraph1>
                          </th>
                          <th className="px-6 py-4 text-left">
                            <Paragraph1 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                              Lister
                            </Paragraph1>
                          </th>
                          <th className="px-6 py-4 text-left">
                            <Paragraph1 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                              Renter
                            </Paragraph1>
                          </th>
                          <th className="px-6 py-4 text-left">
                            <Paragraph1 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                              Condition
                            </Paragraph1>
                          </th>
                          <th className="px-6 py-4 text-left">
                            <Paragraph1 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                              Damage Notes
                            </Paragraph1>
                          </th>
                          <th className="px-6 py-4 text-left">
                            <Paragraph1 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                              Status
                            </Paragraph1>
                          </th>
                          <th className="px-6 py-4 text-left">
                            <Paragraph1 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                              Date
                            </Paragraph1>
                          </th>
                        </>
                      ) : (
                        <>
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
                              Lister
                            </Paragraph1>
                          </th>
                          <th className="px-6 py-4 text-left">
                            <Paragraph1 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                              Renter
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
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((item: any) => (
                      <tr
                        key={item.id}
                        onClick={() => {
                          if (statusFilter === "Returns") {
                            setSelectedReturn(item);
                            setIsReturnDetailModalOpen(true);
                          } else if (item.curator?.id) {
                            router.push(
                              `/admin/${adminId}/users/${item.curator.id}`,
                            );
                          }
                        }}
                        className={`border-b border-gray-100 ${
                          statusFilter !== "Returns"
                            ? "hover:bg-gray-50 cursor-pointer"
                            : "hover:bg-gray-50 cursor-pointer"
                        } transition`}
                      >
                        {statusFilter === "Returns" ? (
                          <>
                            <td className="px-6 py-4">
                              <Paragraph1 className="text-sm font-medium text-gray-900">
                                {item.id}
                              </Paragraph1>
                            </td>
                            <td className="px-6 py-4">
                              <Paragraph1 className="text-sm text-gray-700">
                                {item.orderId}
                              </Paragraph1>
                            </td>
                            <td className="px-6 py-4">
                              <Paragraph1 className="text-sm text-gray-900">
                                {item.itemName}
                              </Paragraph1>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <img
                                  src={
                                    item.lister.avatar ||
                                    getDefaultAvatar(item.lister.name)
                                  }
                                  alt={item.lister.name}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                                <Paragraph1 className="text-sm text-gray-900">
                                  {item.lister.name}
                                </Paragraph1>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <img
                                  src={
                                    item.renter.avatar ||
                                    getDefaultAvatar(item.renter.name)
                                  }
                                  alt={item.renter.name}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                                <Paragraph1 className="text-sm text-gray-900">
                                  {item.renter.name}
                                </Paragraph1>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                                {item.itemCondition}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <Paragraph1 className="text-sm text-gray-700">
                                {item.damageNotes || "-"}
                              </Paragraph1>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                  item.status === "APPROVED"
                                    ? "bg-green-100 text-green-700"
                                    : item.status === "REJECTED"
                                      ? "bg-red-100 text-red-700"
                                      : "bg-yellow-100 text-yellow-700"
                                }`}
                              >
                                {item.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <Paragraph1 className="text-sm text-gray-700">
                                {new Date(item.createdAt).toLocaleDateString()}
                              </Paragraph1>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-6 py-4">
                              <Paragraph1 className="text-sm font-medium text-gray-900">
                                {item.id}
                              </Paragraph1>
                            </td>
                            <td className="px-6 py-4">
                              <Paragraph1 className="text-sm text-gray-700">
                                {item.date}
                              </Paragraph1>
                            </td>
                            <td className="px-6 py-4">
                              {item.curator ? (
                                <div className="flex items-center gap-2">
                                  <img
                                    src={
                                      item.curator.avatar ||
                                      getDefaultAvatar(item.curator.name)
                                    }
                                    alt={item.curator.name}
                                    className="w-8 h-8 rounded-full object-cover"
                                  />
                                  <Paragraph1 className="text-sm text-gray-900">
                                    {item.curator.name}
                                  </Paragraph1>
                                </div>
                              ) : (
                                <Paragraph1 className="text-sm text-gray-500">
                                  N/A
                                </Paragraph1>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {item.dresser ? (
                                <div className="flex items-center gap-2">
                                  <img
                                    src={
                                      item.dresser.avatar ||
                                      getDefaultAvatar(item.dresser.name)
                                    }
                                    alt={item.dresser.name}
                                    className="w-8 h-8 rounded-full object-cover"
                                  />
                                  <Paragraph1 className="text-sm text-gray-900">
                                    {item.dresser.name}
                                  </Paragraph1>
                                </div>
                              ) : (
                                <Paragraph1 className="text-sm text-gray-500">
                                  N/A
                                </Paragraph1>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <Paragraph1 className="text-sm text-gray-700">
                                {item.items} items
                              </Paragraph1>
                            </td>
                            <td className="px-6 py-4">
                              <Paragraph1 className="text-sm font-medium text-gray-900">
                                {formatCurrency(item.total)}
                              </Paragraph1>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                  item.status,
                                )}`}
                              >
                                {item.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <Paragraph1 className="text-sm text-gray-700">
                                {item.returnDue}
                              </Paragraph1>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-6 px-6 py-4 bg-white rounded-lg border border-gray-200">
                <Paragraph1 className="text-sm text-gray-600">
                  Showing {(currentPage - 1) * pagination.limit + 1} to{" "}
                  {Math.min(currentPage * pagination.limit, pagination.total)}{" "}
                  of {pagination.total} results
                </Paragraph1>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium"
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from(
                      { length: pagination.pages },
                      (_, i) => i + 1,
                    ).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                          currentPage === page
                            ? "bg-gray-900 text-white"
                            : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(pagination.pages, p + 1))
                    }
                    disabled={currentPage === pagination.pages}
                    className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium"
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <OrderDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        order={selectedOrder || undefined}
      />

      <ReturnDetailModal
        isOpen={isReturnDetailModalOpen}
        onClose={() => setIsReturnDetailModalOpen(false)}
        return={selectedReturn || undefined}
      />
    </>
  );
}
