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
import { Paragraph1, Paragraph2, Paragraph3 } from "@/common/ui/Text";
import { StatCardSkeleton, TableSkeleton } from "@/common/ui/SkeletonLoaders";
import { AdminComboBox } from "@/app/admin/components/AdminComboBox";
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

  const attentionCount = stats?.needingAttention ?? 0;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div>
        <Paragraph3 className="font-bold text-gray-900 text-2xl">
          Purchase & rental requests
        </Paragraph3>
        <Paragraph1 className="mt-1 text-gray-500 text-sm max-w-2xl">
          Track purchase and rental requests from renters. Follow up with
          listers or nudge renters when a request is waiting or has expired.
        </Paragraph1>
      </div>

      {statsError && (
        <Paragraph1 className="text-red-600 text-sm">
          Could not load request stats.
        </Paragraph1>
      )}

      <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        {statsLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <div className="bg-white shadow-sm p-5 border border-gray-100 rounded-2xl">
              <div className="flex justify-between items-start">
                <div>
                  <Paragraph1 className="text-gray-500 text-sm">
                    Needs attention
                  </Paragraph1>
                  <Paragraph2 className="mt-2 font-bold text-gray-900 text-2xl">
                    {attentionCount}
                  </Paragraph2>
                  <Paragraph1 className="mt-1 text-gray-400 text-xs">
                    Awaiting lister + expired
                  </Paragraph1>
                </div>
                <div className="bg-amber-50 p-2 rounded-xl text-amber-700">
                  <HiOutlineExclamationTriangle size={20} />
                </div>
              </div>
            </div>
            <div className="bg-white shadow-sm p-5 border border-gray-100 rounded-2xl">
              <div className="flex justify-between items-start">
                <div>
                  <Paragraph1 className="text-gray-500 text-sm">
                    Awaiting lister
                  </Paragraph1>
                  <Paragraph2 className="mt-2 font-bold text-gray-900 text-2xl">
                    {stats?.pending ?? 0}
                  </Paragraph2>
                </div>
                <div className="bg-sky-50 p-2 rounded-xl text-sky-700">
                  <HiOutlineClock size={20} />
                </div>
              </div>
            </div>
            <div className="bg-white shadow-sm p-5 border border-gray-100 rounded-2xl">
              <div className="flex justify-between items-start">
                <div>
                  <Paragraph1 className="text-gray-500 text-sm">
                    Purchase requests
                  </Paragraph1>
                  <Paragraph2 className="mt-2 font-bold text-gray-900 text-2xl">
                    {stats?.purchase ?? 0}
                  </Paragraph2>
                </div>
                <div className="bg-violet-50 p-2 rounded-xl text-violet-700">
                  <HiOutlineShoppingBag size={20} />
                </div>
              </div>
            </div>
            <div className="bg-white shadow-sm p-5 border border-gray-100 rounded-2xl">
              <div className="flex justify-between items-start">
                <div>
                  <Paragraph1 className="text-gray-500 text-sm">
                    Rental requests
                  </Paragraph1>
                  <Paragraph2 className="mt-2 font-bold text-gray-900 text-2xl">
                    {stats?.rental ?? 0}
                  </Paragraph2>
                </div>
                <div className="bg-emerald-50 p-2 rounded-xl text-emerald-700">
                  <HiOutlineHandRaised size={20} />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden">
        <div className="flex flex-col xl:flex-row xl:items-end gap-3 p-4 sm:p-5 border-gray-100 border-b">
          <div className="relative flex-1 min-w-[200px]">
            <Search
              size={16}
              className="top-1/2 left-3 absolute text-gray-400 -translate-y-1/2"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search item, renter, lister, or request id"
              className="bg-gray-50 py-2.5 pr-3 pl-9 border border-gray-200 focus:border-gray-400 rounded-lg outline-none w-full text-sm"
            />
          </div>
          <div className="w-full sm:w-44">
            <AdminComboBox
              ariaLabel="Filter by status"
              value={statusFilter}
              onChange={(v) => setStatusFilter(v as StatusFilter)}
              options={STATUS_FILTER_OPTIONS}
            />
          </div>
          <div className="w-full sm:w-40">
            <AdminComboBox
              ariaLabel="Filter by request type"
              value={typeFilter}
              onChange={(v) => setTypeFilter(v as TypeFilter)}
              options={[...TYPE_FILTERS]}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="bg-gray-50 px-3 py-2.5 border border-gray-200 rounded-lg text-sm"
            />
            <span className="text-gray-400 text-sm">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-gray-50 px-3 py-2.5 border border-gray-200 rounded-lg text-sm"
            />
          </div>
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
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-gray-100 border-b text-gray-500 text-xs uppercase tracking-wide">
                    <th className="px-4 sm:px-6 py-3 font-medium">Item</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Renter</th>
                    <th className="px-4 py-3 font-medium">Lister</th>
                    <th className="px-4 py-3 font-medium">Value</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Requested</th>
                    <th className="px-4 sm:px-6 py-3 font-medium text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className={listFetching ? "opacity-60" : ""}>
                  {requests.map((request) => (
                    <tr
                      key={request.id}
                      className="hover:bg-gray-50 border-gray-100 border-b transition-colors"
                    >
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center gap-3 min-w-[220px]">
                          <AdminListingThumb
                            url={request.product?.image ?? null}
                            alt={request.product?.name}
                          />
                          <div className="min-w-0">
                            <Paragraph1 className="font-medium text-gray-900 text-sm truncate max-w-[180px]">
                              {request.product?.name || "Unknown item"}
                            </Paragraph1>
                            <Paragraph1 className="text-gray-400 text-xs truncate max-w-[180px]">
                              {request.product?.brand || "No brand"}
                            </Paragraph1>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                            request.requestType === "purchase"
                              ? "bg-violet-100 text-violet-800"
                              : "bg-sky-100 text-sky-800"
                          }`}
                        >
                          {request.requestType === "purchase"
                            ? "Purchase"
                            : `Rental · ${request.rentalDays}d`}
                        </span>
                      </td>
                      <td className="px-4 py-4 min-w-[140px]">
                        <Paragraph1 className="font-medium text-gray-900 text-sm">
                          {request.requester?.name || "—"}
                        </Paragraph1>
                        <Paragraph1 className="text-gray-400 text-xs truncate max-w-[160px]">
                          {request.requester?.email || ""}
                        </Paragraph1>
                      </td>
                      <td className="px-4 py-4 min-w-[140px]">
                        <Paragraph1 className="font-medium text-gray-900 text-sm">
                          {request.lister?.name || "—"}
                        </Paragraph1>
                        <Paragraph1 className="text-gray-400 text-xs truncate max-w-[160px]">
                          {request.lister?.email || ""}
                        </Paragraph1>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap font-medium text-sm">
                        {formatCurrency(request.totalPrice)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getAvailabilityStatusColor(
                            request.status,
                          )}`}
                        >
                          {getAvailabilityStatusLabel(request.status)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-gray-600 text-sm whitespace-nowrap">
                        {formatDateTime(request.createdAt)}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => openRequest(request.id)}
                          className="hover:bg-gray-100 px-3 py-1.5 border border-gray-200 rounded-lg font-medium text-gray-800 text-sm transition"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

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
    </div>
  );
}
