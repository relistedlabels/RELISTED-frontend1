// ENDPOINTS: GET /api/admin/availability-requests, GET /api/admin/availability-requests/stats, GET /api/admin/availability-requests/:id, POST .../nudge-renter, POST .../resend-to-lister
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import {
  HiOutlineClock,
  HiOutlineExclamationTriangle,
  HiOutlineHandRaised,
  HiOutlineShoppingBag,
} from "react-icons/hi2";
import { Paragraph1, Paragraph2 } from "@/common/ui/Text";
import {
  ResponsiveDataTable,
  type ResponsiveColumnDef,
} from "@/common/ui/ResponsiveDataTable";
import { TableSkeleton } from "@/common/ui/SkeletonLoaders";
import { AdminComboBox, AdminFilterField } from "@/app/admin/components/AdminComboBox";
import {
  AdminFilterButton,
  AdminFilterDrawer,
} from "@/app/admin/components/AdminFilterDrawer";
import { ADMIN_FILTER_INPUT_CLASS } from "@/lib/admin/adminListFilters";
import { AdminListingThumb } from "@/app/admin/lib/adminListingDisplay";
import type { AvailabilityRequest } from "@/lib/api/admin/availabilityRequests";
import {
  useAvailabilityRequestStats,
  useAvailabilityRequests,
} from "@/lib/queries/admin/useAvailabilityRequests";
import RequestDetailModal, {
  getAvailabilityStatusColor,
  getAvailabilityStatusLabel,
} from "./components/RequestDetailModal";

const PAGE_SIZE = 20;

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(value);

const formatDateTime = (value?: string | null): string => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

function buildRequestColumns(): ResponsiveColumnDef<AvailabilityRequest>[] {
  return [
    {
      id: "item",
      header: "Item",
      mobile: "primary",
      render: (request) => (
        <div className="flex min-w-[220px] items-center gap-3">
          <AdminListingThumb
            url={request.product?.image ?? null}
            alt={request.product?.name}
          />
          <div className="min-w-0">
            <Paragraph1 className="max-w-[180px] truncate text-sm font-medium text-gray-900">
              {request.product?.name || "Unknown item"}
            </Paragraph1>
            <Paragraph1 className="max-w-[180px] truncate text-xs text-gray-400">
              {request.product?.brand || "No brand"}
            </Paragraph1>
          </div>
        </div>
      ),
    },
    {
      id: "type",
      header: "Type",
      mobile: "badge",
      render: (request) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
            request.requestType === "purchase"
              ? "bg-violet-100 text-violet-800"
              : "bg-sky-100 text-sky-800"
          }`}
        >
          {request.requestType === "purchase"
            ? "Purchase"
            : `Rental · ${request.rentalDays}d`}
        </span>
      ),
    },
    {
      id: "renter",
      header: "Renter",
      mobile: "detail",
      render: (request) => (
        <div className="min-w-[140px]">
          <Paragraph1 className="text-sm font-medium text-gray-900">
            {request.requester?.name || "—"}
          </Paragraph1>
          <Paragraph1 className="max-w-[160px] truncate text-xs text-gray-400">
            {request.requester?.email || ""}
          </Paragraph1>
        </div>
      ),
    },
    {
      id: "lister",
      header: "Lister",
      mobile: "detail",
      render: (request) => (
        <div className="min-w-[140px]">
          <Paragraph1 className="text-sm font-medium text-gray-900">
            {request.lister?.name || "—"}
          </Paragraph1>
          <Paragraph1 className="max-w-[160px] truncate text-xs text-gray-400">
            {request.lister?.email || ""}
          </Paragraph1>
        </div>
      ),
    },
    {
      id: "value",
      header: "Value",
      mobile: "detail",
      render: (request) => (
        <span className="whitespace-nowrap text-sm font-medium">
          {formatCurrency(request.totalPrice)}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      mobile: "badge",
      render: (request) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getAvailabilityStatusColor(request.status)}`}
        >
          {getAvailabilityStatusLabel(request.status)}
        </span>
      ),
    },
    {
      id: "requested",
      header: "Requested",
      mobile: "detail",
      render: (request) => (
        <span className="whitespace-nowrap text-sm text-gray-600">
          {formatDateTime(request.createdAt)}
        </span>
      ),
    },
  ];
}

const STATUS_FILTERS = [
  "All",
  "PENDING",
  "ACCEPTED",
  "EXPIRED",
  "REJECTED",
  "CANCELLED_BY_RENTER",
] as const;

const TYPE_FILTERS = [
  { value: "all", label: "All types" },
  { value: "purchase", label: "Purchase" },
  { value: "rental", label: "Rental" },
] as const;

const STATUS_FILTER_OPTIONS = STATUS_FILTERS.map((status) => ({
  value: status,
  label:
    status === "All"
      ? "All statuses"
      : getAvailabilityStatusLabel(status),
}));

type StatusFilter = (typeof STATUS_FILTERS)[number];
type TypeFilter = (typeof TYPE_FILTERS)[number]["value"];

export default function RequestsPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null,
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, typeFilter, debouncedSearch, dateFrom, dateTo]);

  const {
    data: statsData,
    isLoading: statsLoading,
    isError: statsError,
  } = useAvailabilityRequestStats();

  const {
    data: listData,
    isLoading: listLoading,
    isFetching: listFetching,
    isError: listError,
  } = useAvailabilityRequests({
    page: currentPage,
    limit: PAGE_SIZE,
    status: statusFilter === "All" ? undefined : statusFilter,
    type: typeFilter === "all" ? undefined : typeFilter,
    search: debouncedSearch || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  const stats = statsData?.data;
  const requests = useMemo(
    () => (listData?.data?.requests || []) as AvailabilityRequest[],
    [listData],
  );
  const pagination = useMemo(
    () =>
      listData?.data?.pagination || {
        total: 0,
        page: 1,
        limit: PAGE_SIZE,
        pages: 1,
      },
    [listData],
  );

  useEffect(() => {
    if (pagination.pages && currentPage > pagination.pages) {
      setCurrentPage(pagination.pages);
    }
  }, [pagination.pages, currentPage]);

  const openRequest = (id: string) => {
    setSelectedRequestId(id);
    setIsDetailOpen(true);
  };

  const requestColumns = buildRequestColumns();

  const attentionCount = stats?.needingAttention ?? 0;
  const activeFilterCount =
    Number(statusFilter !== "All") +
    Number(typeFilter !== "all") +
    Number(Boolean(dateFrom)) +
    Number(Boolean(dateTo));

  const clearFilters = () => {
    setStatusFilter("All");
    setTypeFilter("all");
    setDateFrom("");
    setDateTo("");
  };

  return (
    <div className="min-h-screen space-y-6">
      <div>
        <Paragraph2 className="mb-1 text-2xl font-extrabold tracking-tight text-gray-900">
          Availability requests
        </Paragraph2>
        <Paragraph1 className="text-gray-600">
          Review purchase and rental requests from renters.
        </Paragraph1>
      </div>

      {statsError && (
        <Paragraph1 className="text-red-600 text-sm">
          Could not load request stats.
        </Paragraph1>
      )}

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {statsLoading ? (
          <>
            {Array.from({ length: 4 }, (_, index) => (
              <div
                key={index}
                className="flex h-[76px] animate-pulse items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 lg:h-24 lg:p-4"
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
          <>
            {[
              {
                label: "Needs attention",
                value: attentionCount,
                icon: HiOutlineExclamationTriangle,
                color: "bg-amber-50",
                iconColor: "text-amber-700",
              },
              {
                label: "Awaiting lister",
                value: stats?.pending ?? 0,
                icon: HiOutlineClock,
                color: "bg-sky-50",
                iconColor: "text-sky-700",
              },
              {
                label: "Purchase requests",
                value: stats?.purchase ?? 0,
                icon: HiOutlineShoppingBag,
                color: "bg-violet-50",
                iconColor: "text-violet-700",
              },
              {
                label: "Rental requests",
                value: stats?.rental ?? 0,
                icon: HiOutlineHandRaised,
                color: "bg-emerald-50",
                iconColor: "text-emerald-700",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex min-w-0 items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 lg:p-4"
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${stat.color}`}
                >
                  <stat.icon size={20} className={stat.iconColor} />
                </div>
                <div className="min-w-0">
                  <Paragraph1 className="break-words text-[10px] font-semibold uppercase leading-tight tracking-wide text-gray-500 sm:text-xs">
                    {stat.label}
                  </Paragraph1>
                  <Paragraph2 className="mt-0.5 text-xl font-bold text-gray-900">
                    {stat.value}
                  </Paragraph2>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      <div className="mb-6 overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="flex items-end gap-2 border-b border-gray-200 px-4 py-4 sm:px-6">
          <AdminFilterField label="Search" className="min-w-0 flex-1">
            <div className="relative">
            <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                aria-hidden
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Item, renter, lister, or request id..."
                className={`${ADMIN_FILTER_INPUT_CLASS} pl-9`}
            />
            </div>
          </AdminFilterField>
          <AdminFilterButton
            onClick={() => setFiltersOpen(true)}
            activeCount={activeFilterCount}
          />
        </div>

        {listError && (
          <div className="px-6 py-8">
            <Paragraph1 className="text-red-600 text-sm">
              Could not load requests.
            </Paragraph1>
          </div>
        )}

        {listLoading ? (
          <div className="p-6">
            <TableSkeleton rows={8} />
          </div>
        ) : requests.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Paragraph2 className="font-semibold text-gray-900">
              No requests match these filters
            </Paragraph2>
            <Paragraph1 className="mt-2 text-gray-500 text-sm">
              When renters request purchase or rental approval, they will show
              up here.
            </Paragraph1>
          </div>
        ) : (
          <>
            <ResponsiveDataTable
              rows={requests}
              columns={requestColumns}
              getRowKey={(request) => request.id}
              onRowClick={(request) => openRequest(request.id)}
              className={listFetching ? "opacity-60" : ""}
            />

            {pagination.total > 0 && (
              <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-3 px-6 py-4 border-gray-100 border-t">
                <Paragraph1 className="text-gray-600 text-sm">
                  Showing{" "}
                  {(pagination.page - 1) * pagination.limit + 1} to{" "}
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total,
                  )}{" "}
                  of {pagination.total}
                </Paragraph1>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={listFetching || pagination.page <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed p-2 border border-gray-200 rounded-lg"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <Paragraph1 className="text-sm text-gray-700">
                    Page {pagination.page} of {pagination.pages}
                  </Paragraph1>
                  <button
                    type="button"
                    disabled={
                      listFetching || pagination.page >= pagination.pages
                    }
                    onClick={() =>
                      setCurrentPage((p) =>
                        Math.min(pagination.pages, p + 1),
                      )
                    }
                    className="hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed p-2 border border-gray-200 rounded-lg"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <RequestDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedRequestId(null);
        }}
        requestId={selectedRequestId}
      />
      <AdminFilterDrawer
        isOpen={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        onClear={clearFilters}
        activeCount={activeFilterCount}
        title="Request filters"
      >
        <div className="space-y-5">
          <AdminFilterField label="Status">
            <AdminComboBox
              ariaLabel="Filter by status"
              value={statusFilter}
              onChange={(v) => setStatusFilter(v as StatusFilter)}
              options={STATUS_FILTER_OPTIONS}
            />
          </AdminFilterField>
          <AdminFilterField label="Request type">
            <AdminComboBox
              ariaLabel="Filter by request type"
              value={typeFilter}
              onChange={(v) => setTypeFilter(v as TypeFilter)}
              options={[...TYPE_FILTERS]}
            />
          </AdminFilterField>
          <AdminFilterField label="Requested from">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
          </AdminFilterField>
          <AdminFilterField label="Requested to">
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
          </AdminFilterField>
        </div>
      </AdminFilterDrawer>
    </div>
  );
}
