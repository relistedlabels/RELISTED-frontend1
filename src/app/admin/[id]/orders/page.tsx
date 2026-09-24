// ENDPOINTS: GET /api/admin/orders, GET /api/admin/orders/stats, GET /api/admin/orders/:orderId, PUT /api/admin/orders/:orderId/status, POST /api/admin/orders/:orderId/cancel, GET /api/admin/orders/export
"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Paragraph1, Paragraph2, Paragraph3 } from "@/common/ui/Text";
import { TableSkeleton, StatCardSkeleton } from "@/common/ui/SkeletonLoaders";
import {
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { HiOutlineShoppingBag } from "react-icons/hi";
import { PiCheckCircle, PiWarning, PiPackage } from "react-icons/pi";
import { PiHash } from "react-icons/pi";
import OrderDetailModal from "./components/OrderDetailModal";
import ReturnDetailModal from "./components/ReturnDetailModal";
import { useOrders, useOrderStats } from "@/lib/queries/admin/useOrders";
import type { Order, Return } from "@/lib/api/admin/orders";
import type { ShipmentType } from "@/lib/api/shipments";
import {
  getAdminOrderStatusLabel,
  getShipmentLegDisplayLabel,
} from "@/lib/orders/shipmentAndOrderLabels";
import { adminOrderListStatusToApiParam } from "@/lib/orders/adminOrderListFilters";
import {
  AdminComboBox,
  AdminFilterField,
} from "@/app/admin/components/AdminComboBox";
import {
  ADMIN_FILTER_BAR_CLASS,
  ADMIN_FILTER_DATE_CLASS,
  ADMIN_FILTER_FIELD_WIDTH,
  ADMIN_FILTER_INPUT_CLASS,
  ADMIN_FILTER_SECTION_CLASS,
  DISPATCH_FILTER_LABEL,
  DISPATCH_FILTER_OPTIONS,
  type DispatchFilter,
} from "@/lib/admin/adminListFilters";
import { AdminTabBar, AdminTabButton } from "../../components/AdminSectionTabs";
import { ResponsiveDataTable } from "@/common/ui/ResponsiveDataTable";
import { orderColumns, returnColumns } from "./orderListColumns";

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

const getStatusColor = (statusLabel: string) => {
  switch (statusLabel) {
    case "Processing":
    case "Accepted":
    case "Confirmed":
    case "Preparing":
      return "bg-gray-100 text-gray-700";
    case "In transit":
      return "bg-blue-100 text-blue-700";
    case "Delivered":
    case "Active (rental)":
      return "bg-green-100 text-green-700";
    case "Return due":
    case "Return pickup":
      return "bg-yellow-100 text-yellow-700";
    case "Returned":
      return "bg-indigo-100 text-indigo-800";
    case "Completed":
      return "bg-emerald-100 text-emerald-800";
    case "Cancelled":
    case "Rejected":
      return "bg-red-100 text-red-700";
    case "In dispute":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const ORDERS_PAGE_SIZE = 20;

const TYPE_FILTERS: Array<ShipmentType | "All"> = [
  "All",
  "OUTBOUND",
  "RETURN",
  "RESALE",
];

const ORDER_STATUS_FILTERS = [
  "All",
  "Preparing",
  "In Transit",
  "Delivered",
  "Return Due",
  "Returns",
  "Return Pickup",
  "Disputed",
] as const;

type OrderStatusFilter = (typeof ORDER_STATUS_FILTERS)[number];

const TYPE_FILTER_OPTIONS = TYPE_FILTERS.map((t) => ({
  value: t,
  label: t === "All" ? "All types" : getShipmentLegDisplayLabel(t),
}));

const ORDER_STATUS_FILTER_OPTIONS = ORDER_STATUS_FILTERS.map((status) => ({
  value: status,
  label: status === "All" ? "All statuses" : status,
}));

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState("active");
  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>("All");
  const [typeFilter, setTypeFilter] = useState<ShipmentType | "All">("All");
  const [dispatchFilter, setDispatchFilter] = useState<DispatchFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<any>(null);
  const [isReturnDetailModalOpen, setIsReturnDetailModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    activeTab,
    statusFilter,
    debouncedSearch,
    typeFilter,
    dispatchFilter,
    dateFrom,
    dateTo,
  ]);

  const isReturnsView = statusFilter === "Returns";

  const manualFulfillmentParam =
    dispatchFilter === "manual"
      ? true
      : dispatchFilter === "automated"
        ? false
        : undefined;

  // Fetch orders and stats
  const {
    data: ordersData,
    isLoading: ordersLoading,
    isFetching: ordersFetching,
    isError: ordersError,
  } = useOrders({
    page: currentPage,
    limit: ORDERS_PAGE_SIZE,
    tab: isReturnsView ? undefined : activeTab,
    status: adminOrderListStatusToApiParam(statusFilter),
    search: debouncedSearch || undefined,
    type: typeFilter === "All" ? undefined : typeFilter,
    manualFulfillment: isReturnsView ? undefined : manualFulfillmentParam,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
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
      ordersData?.data?.pagination || {
        total: 0,
        page: 1,
        limit: ORDERS_PAGE_SIZE,
        pages: 1,
      }
    );
  }, [ordersData]);

  useEffect(() => {
    const totalPages = ordersData?.data?.pagination?.pages;
    if (totalPages && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [ordersData?.data?.pagination?.pages, currentPage]);

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
      <div className="min-h-screen">
        {/* Header */}
        <div className="mb-6">
          <Paragraph2 className="mb-1 font-extrabold text-gray-900 text-2xl tracking-tight">
            Orders
          </Paragraph2>
          <Paragraph1 className="text-gray-600">
            Track, verify, and manage all rental orders.
          </Paragraph1>
        </div>

        {/* Stats Cards */}
        <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 mb-6">
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
                className="bg-white p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded ${card.bgColor} flex-shrink-0`}
                  >
                    <card.icon size={20} className="text-gray-700" />
                  </div>
                  <div className="flex-1">
                    <Paragraph1 className="font-semibold text-gray-500 text-xs uppercase tracking-wide">
                      {card.label}
                    </Paragraph1>
                    <Paragraph3 className="mt-0.5 font-bold text-gray-900 text-xl">
                      {card.value}
                    </Paragraph3>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="bg-white mb-6 border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-gray-200 border-b">
            <Paragraph2 className="mb-1 font-semibold text-gray-900">
              Order list
            </Paragraph2>
            <Paragraph1 className="text-gray-500 text-sm">
              Search and filters apply to the order table below.
            </Paragraph1>
          </div>

          {/* Tabs */}
          <AdminTabBar className="px-6">
            <AdminTabButton
              active={activeTab === "active"}
              onClick={() => {
                setActiveTab("active");
                if (statusFilter === "Returns") {
                  setStatusFilter("All");
                }
              }}
              label="Active"
            />
            <AdminTabButton
              active={activeTab === "completed"}
              onClick={() => {
                setActiveTab("completed");
                if (statusFilter === "Returns") {
                  setStatusFilter("All");
                }
              }}
              label="Completed"
            />
            <AdminTabButton
              active={activeTab === "rejected"}
              onClick={() => {
                setActiveTab("rejected");
                if (statusFilter === "Returns") {
                  setStatusFilter("All");
                }
              }}
              label="Rejected"
            />
          </AdminTabBar>

          <div className={ADMIN_FILTER_SECTION_CLASS}>
            <div className={ADMIN_FILTER_BAR_CLASS}>
              <AdminFilterField
                label="Search"
                className={ADMIN_FILTER_FIELD_WIDTH.search}
              >
                <div className="relative">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                    aria-hidden
                  />
                  <input
                    type="text"
                    placeholder="Order id, renter, or lister..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`${ADMIN_FILTER_INPUT_CLASS} pl-9`}
                  />
                </div>
              </AdminFilterField>

              {!isReturnsView && (
                <>
                  <AdminFilterField
                    label="Leg type"
                    className={ADMIN_FILTER_FIELD_WIDTH.type}
                  >
                    <AdminComboBox
                      value={typeFilter}
                      onChange={(value) =>
                        setTypeFilter(value as ShipmentType | "All")
                      }
                      options={TYPE_FILTER_OPTIONS}
                      ariaLabel="Leg type"
                    />
                  </AdminFilterField>

                  <AdminFilterField
                    label={DISPATCH_FILTER_LABEL}
                    className={ADMIN_FILTER_FIELD_WIDTH.dispatch}
                  >
                    <AdminComboBox
                      value={dispatchFilter}
                      onChange={(value) =>
                        setDispatchFilter(value as DispatchFilter)
                      }
                      options={DISPATCH_FILTER_OPTIONS}
                      ariaLabel={DISPATCH_FILTER_LABEL}
                    />
                  </AdminFilterField>
                </>
              )}

              <AdminFilterField
                label="Status"
                className={ADMIN_FILTER_FIELD_WIDTH.status}
              >
                <AdminComboBox
                  value={statusFilter}
                  onChange={(value) =>
                    setStatusFilter(value as OrderStatusFilter)
                  }
                  options={ORDER_STATUS_FILTER_OPTIONS}
                  ariaLabel="Status"
                />
              </AdminFilterField>

              <AdminFilterField label="Created from">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className={ADMIN_FILTER_DATE_CLASS}
                  aria-label="Created from"
                />
              </AdminFilterField>

              <AdminFilterField label="Created to">
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  min={dateFrom || undefined}
                  className={ADMIN_FILTER_DATE_CLASS}
                  aria-label="Created to"
                />
              </AdminFilterField>
            </div>
          </div>

        {/* Orders/Returns Table */}
        {ordersLoading && !ordersData ? (
          <TableSkeleton rows={5} columns={9} />
        ) : ordersError ? (
          <TableSkeleton rows={5} columns={9} />
        ) : (
          <>
            <div
              className={`overflow-hidden transition-opacity ${
                ordersFetching ? "opacity-60" : "opacity-100"
              }`}
            >
              <ResponsiveDataTable
                rows={orders}
                columns={statusFilter === "Returns" ? returnColumns : orderColumns}
                getRowKey={(item) => item.id}
                onRowClick={(item) => {
                  if (statusFilter === "Returns") {
                    setSelectedReturn(item);
                    setIsReturnDetailModalOpen(true);
                  } else {
                    setSelectedOrderId(item.id);
                    setIsDetailModalOpen(true);
                  }
                }}
              />
            </div>

            {/* Pagination */}
            {pagination.total > 0 && (
              <div className="flex justify-between items-center px-6 py-4 border-gray-200 border-t">
                <Paragraph1 className="text-gray-600 text-sm">
                  Showing {(currentPage - 1) * pagination.limit + 1} to{" "}
                  {Math.min(currentPage * pagination.limit, pagination.total)}{" "}
                  of {pagination.total} results
                </Paragraph1>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1 || ordersFetching}
                    className="flex items-center gap-1 hover:bg-gray-50 disabled:opacity-50 px-3 py-2 border border-gray-300 rounded-lg font-medium text-sm transition disabled:cursor-not-allowed"
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
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        disabled={ordersFetching}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${
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
                    type="button"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(pagination.pages, p + 1))
                    }
                    disabled={
                      currentPage === pagination.pages || ordersFetching
                    }
                    className="flex items-center gap-1 hover:bg-gray-50 disabled:opacity-50 px-3 py-2 border border-gray-300 rounded-lg font-medium text-sm transition disabled:cursor-not-allowed"
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
      </div>

      <OrderDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedOrderId(null);
        }}
        orderId={selectedOrderId}
      />

      <ReturnDetailModal
        isOpen={isReturnDetailModalOpen}
        onClose={() => setIsReturnDetailModalOpen(false)}
        return={selectedReturn || undefined}
      />
    </>
  );
}
