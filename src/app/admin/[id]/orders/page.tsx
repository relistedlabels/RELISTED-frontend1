// ENDPOINTS: GET /api/admin/orders, GET /api/admin/orders/stats, GET /api/admin/orders/:orderId, PUT /api/admin/orders/:orderId/status, POST /api/admin/orders/:orderId/cancel, GET /api/admin/orders/export
"use client";

import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PiCheckCircle, PiPackage, PiWarning } from "react-icons/pi";
import {
  AdminComboBox,
  AdminFilterField,
} from "@/app/admin/components/AdminComboBox";
import {
  AdminFilterButton,
  AdminFilterDrawer,
} from "@/app/admin/components/AdminFilterDrawer";
import AdminPageHeader from "@/app/admin/components/AdminPageHeader";
import { ResponsiveDataTable } from "@/common/ui/ResponsiveDataTable";
import { TableSkeleton } from "@/common/ui/SkeletonLoaders";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import {
  ADMIN_FILTER_DATE_CLASS,
  ADMIN_FILTER_INPUT_CLASS,
  DISPATCH_FILTER_LABEL,
  DISPATCH_FILTER_OPTIONS,
  type DispatchFilter,
} from "@/lib/admin/adminListFilters";
import type { Order, Return } from "@/lib/api/admin/orders";
import type { ShipmentType } from "@/lib/api/shipments";
import { adminOrderListStatusToApiParam } from "@/lib/orders/adminOrderListFilters";
import { getShipmentLegDisplayLabel } from "@/lib/orders/shipmentAndOrderLabels";
import { useOrderStats, useOrders } from "@/lib/queries/admin/useOrders";
import { AdminTabBar, AdminTabButton } from "../../components/AdminSectionTabs";
import OrderDetailModal from "./components/OrderDetailModal";
import ReturnDetailModal from "./components/ReturnDetailModal";
import {
  OrderMobileCard,
  orderColumns,
  returnColumns,
} from "./orderListColumns";

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
  const [filtersOpen, setFiltersOpen] = useState(false);
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
  const activeFilterCount =
    Number(statusFilter !== "All") +
    Number(!isReturnsView && typeFilter !== "All") +
    Number(!isReturnsView && dispatchFilter !== "all") +
    Number(Boolean(dateFrom)) +
    Number(Boolean(dateTo));

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
        label: "ACTIVE ORDERS",
        value: stats?.activeOrders?.toString() || "0",
        icon: PiPackage,
        bgColor: "bg-green-50",
      },
      {
        label: "COMPLETED ORDERS",
        value: stats?.completedOrders?.toString() || "0",
        icon: PiCheckCircle,
        bgColor: "bg-blue-50",
      },
      {
        label: "DISPUTED ORDERS",
        value: stats?.disputedOrders?.toString() || "0",
        icon: PiWarning,
        bgColor: "bg-yellow-50",
      },
    ];
  }, [statsData]);

  return (
    <>
      <div className="min-h-screen">
        {/* Header */}
        <AdminPageHeader
          title="Orders"
          description="Manage orders, returns, and fulfillment."
        />

        {/* Stats Cards */}
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3 lg:gap-4">
          {statsLoading ? (
            <>
              {[...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className="flex h-[76px] animate-pulse items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 lg:h-24 lg:flex-col lg:items-start lg:p-6"
                >
                  <div className="h-10 w-10 shrink-0 rounded-lg bg-gray-200" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="h-3 w-20 rounded bg-gray-200" />
                    <div className="h-5 w-12 rounded bg-gray-200" />
                  </div>
                </div>
              ))}
            </>
          ) : (
            statCards.map((card, index) => (
              <div
                key={index}
                className="flex min-w-0 items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 lg:flex-col lg:items-start lg:p-6"
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg lg:mb-3 lg:h-12 lg:w-12 ${card.bgColor}`}
                >
                  <card.icon size={20} className="text-gray-700" />
                </div>
                <div className="min-w-0">
                  <Paragraph1 className="text-[10px] font-semibold uppercase leading-tight tracking-wide text-gray-500 sm:text-xs">
                    {card.label}
                  </Paragraph1>
                  <Paragraph3 className="mt-0.5 text-xl font-bold text-gray-900 lg:text-3xl">
                    {card.value}
                  </Paragraph3>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="bg-white mb-6 border border-gray-200 rounded-lg overflow-hidden">
          <div className="flex items-end gap-2 border-b border-gray-200 px-4 py-4 sm:px-6">
            <AdminFilterField label="Search" className="min-w-0 flex-1">
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
            <AdminFilterButton
              onClick={() => setFiltersOpen(true)}
              activeCount={activeFilterCount}
            />
          </div>

          <AdminTabBar className="px-4 sm:px-6">
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

          <AdminFilterDrawer
            isOpen={filtersOpen}
            onClose={() => setFiltersOpen(false)}
            onClear={() => {
              setStatusFilter("All");
              setTypeFilter("All");
              setDispatchFilter("all");
              setDateFrom("");
              setDateTo("");
            }}
            activeCount={activeFilterCount}
            title="Order filters"
          >
            <div className="space-y-5">
              {!isReturnsView && (
                <AdminFilterField label="Leg type">
                  <AdminComboBox
                    value={typeFilter}
                    onChange={(value) =>
                      setTypeFilter(value as ShipmentType | "All")
                    }
                    options={TYPE_FILTER_OPTIONS}
                    ariaLabel="Leg type"
                  />
                </AdminFilterField>
              )}
              {!isReturnsView && (
                <AdminFilterField label={DISPATCH_FILTER_LABEL}>
                  <AdminComboBox
                    value={dispatchFilter}
                    onChange={(value) =>
                      setDispatchFilter(value as DispatchFilter)
                    }
                    options={DISPATCH_FILTER_OPTIONS}
                    ariaLabel={DISPATCH_FILTER_LABEL}
                  />
                </AdminFilterField>
              )}
              <AdminFilterField label="Status">
                <AdminComboBox
                  value={statusFilter}
                  onChange={(value) => {
                    const nextStatus = value as OrderStatusFilter;
                    if (nextStatus === "Returns") {
                      setTypeFilter("All");
                      setDispatchFilter("all");
                    }
                    setStatusFilter(nextStatus);
                  }}
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
          </AdminFilterDrawer>

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
                  columns={
                    statusFilter === "Returns" ? returnColumns : orderColumns
                  }
                  renderMobileCard={
                    statusFilter === "Returns"
                      ? undefined
                      : (order) => <OrderMobileCard order={order} />
                  }
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
