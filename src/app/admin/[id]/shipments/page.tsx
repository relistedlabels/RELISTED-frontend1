// ENDPOINTS: GET /shipments, GET /shipments/:id, GET /shipments/:id/tracking,
// GET /orders/:orderId/shipments, POST /shipments/:id/cancel, POST /shipments/:id/redispatch

"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Paragraph1, Paragraph2 } from "@/common/ui/Text";
import { TableSkeleton } from "@/common/ui/SkeletonLoaders";
import {
  Truck,
  Package,
  ExternalLink,
  RefreshCw,
  XCircle,
  CheckCircle,
  Clock,
  AlertTriangle,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  useShipments,
  useShipment,
  useCancelShipment,
  useRedispatchShipment,
} from "@/lib/queries/admin/useShipments";
import type {
  DispatchAttemptLog,
  Shipment,
  ShipmentStatus,
  ShipmentType,
} from "@/lib/api/shipments";
import { formatWindowRange } from "@/lib/checkout/dispatchWindows";
import { getShipmentStatusLabel } from "@/lib/orders/shipmentAndOrderLabels";
import { toast } from "sonner";

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(value);
};

const koboToNaira = (k?: number | null): string => {
  if (k == null) return "—";
  return formatCurrency(k / 100);
};

const getStatusLabel = (
  status: ShipmentStatus,
  type?: ShipmentType,
): string => {
  return getShipmentStatusLabel(type, status);
};

const getStatusColor = (status: ShipmentStatus): string => {
  switch (status) {
    case "PENDING":
      return "bg-gray-100 text-gray-700";
    case "DISPATCHING":
      return "bg-blue-100 text-blue-700";
    case "DISPATCH_FAILED":
      return "bg-red-100 text-red-700";
    case "DISPATCHED":
      return "bg-indigo-100 text-indigo-700";
    case "IN_TRANSIT":
      return "bg-purple-100 text-purple-700";
    case "COMPLETED":
      return "bg-green-100 text-green-700";
    case "CANCELLED":
      return "bg-gray-200 text-gray-600";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const getStatusIcon = (status: ShipmentStatus) => {
  switch (status) {
    case "PENDING":
      return Clock;
    case "DISPATCHING":
      return Loader2;
    case "DISPATCH_FAILED":
      return AlertTriangle;
    case "DISPATCHED":
      return Truck;
    case "IN_TRANSIT":
      return Package;
    case "COMPLETED":
      return CheckCircle;
    case "CANCELLED":
      return XCircle;
    default:
      return Clock;
  }
};

const getTypeLabel = (type: ShipmentType): string => {
  switch (type) {
    case "OUTBOUND":
      return "Outbound";
    case "RETURN":
      return "Return";
    case "RESALE":
      return "Resale";
    default:
      return type;
  }
};

const STATUS_FILTERS: Array<ShipmentStatus | "All"> = [
  "All",
  "PENDING",
  "DISPATCHING",
  "DISPATCH_FAILED",
  "DISPATCHED",
  "IN_TRANSIT",
  "COMPLETED",
  "CANCELLED",
];

const TYPE_FILTERS: Array<ShipmentType | "All"> = ["All", "OUTBOUND", "RETURN", "RESALE"];

function shortenId(id: string, keep = 8): string {
  if (id.length <= keep + 4) return id;
  return `${id.slice(0, keep)}…${id.slice(-4)}`;
}

/**
 * Snapshot shape matches `topship.provider` / checkout: name, phone, email, city, state, street, zip.
 */
function formatAddress(addr: Record<string, unknown> | undefined): string {
  if (!addr || typeof addr !== "object") return "—";
  const name = addr.name as string | undefined;
  const phone = addr.phone as string | undefined;
  const street =
    (addr.street as string | undefined) ||
    (addr.addressLine1 as string | undefined);
  const city = addr.city as string | undefined;
  const state = addr.state as string | undefined;
  const zip = addr.zip as string | undefined;
  const email = addr.email as string | undefined;
  const line2 = [city, state].filter(Boolean).join(", ");
  const parts = [name, phone, email, street, line2, zip].filter(
    (p): p is string => Boolean(p && String(p).trim()),
  );
  return parts.length ? parts.join(" · ") : JSON.stringify(addr);
}

/** Receiver snapshot street/city/state — source of truth for checkout drop-off (not Topship pickup-hub). */
function formatCheckoutDeliveryStreetLine(
  shipment: Pick<Shipment, "deliveryAddress" | "deliveryLocation">,
): string {
  const addr = shipment.deliveryAddress;
  if (addr && typeof addr === "object") {
    const street =
      (addr.street as string | undefined) ||
      (addr.addressLine1 as string | undefined);
    const city = addr.city as string | undefined;
    const state = addr.state as string | undefined;
    const line = [street, city, state]
      .map((s) => (s ? String(s).trim() : ""))
      .filter(Boolean)
      .join(", ");
    if (line) return line;
  }
  const legacy = shipment.deliveryLocation;
  return legacy && String(legacy).trim() ? String(legacy).trim() : "—";
}

function sortDispatchAttemptLogs(logs: DispatchAttemptLog[] | undefined): DispatchAttemptLog[] {
  if (!logs?.length) return [];
  return [...logs].sort(
    (a, b) => new Date(a.attemptedAt).getTime() - new Date(b.attemptedAt).getTime(),
  );
}

function formatAttemptedAt(iso: string | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString();
}

function formatDispatchDurationMs(ms: number | null | undefined): string | null {
  if (ms == null || ms < 0) return null;
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(1)} s`;
}

function formatDispatchErrorCode(code: string | null | undefined): string | null {
  if (code == null || String(code).trim() === "") return null;
  const c = String(code).trim();
  if (/^\d{3}$/.test(c)) return `HTTP ${c}`;
  if (c === "ERR") return null;
  return `Code: ${c}`;
}

export default function ShipmentsPage() {
  const [statusFilter, setStatusFilter] = useState<ShipmentStatus | "All">("All");
  const [typeFilter, setTypeFilter] = useState<ShipmentType | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, typeFilter, debouncedSearch]);

  const {
    data: shipmentsData,
    isLoading,
    isError,
  } = useShipments({
    status: statusFilter === "All" ? undefined : statusFilter,
    type: typeFilter === "All" ? undefined : typeFilter,
    orderId: debouncedSearch || undefined,
    page: currentPage,
    limit: 20,
  });

  const cancelShipment = useCancelShipment();
  const redispatchShipment = useRedispatchShipment();

  const detailQuery = useShipment(selectedShipment?.id ?? "", {
    enabled: Boolean(isDetailModalOpen && selectedShipment?.id),
  });
  const detailFromApi = detailQuery.data?.data;
  const displayShipment: Shipment | null = detailFromApi ?? selectedShipment;

  const sortedDispatchAttemptLogs = useMemo(
    () => sortDispatchAttemptLogs(displayShipment?.attemptLogs),
    [displayShipment?.attemptLogs, displayShipment?.id],
  );

  const listData = shipmentsData?.data;
  const shipments = listData?.shipments ?? [];
  const total = listData?.total ?? 0;
  const limit = listData?.limit ?? 20;
  const totalPages = listData?.totalPages ?? 0;

  const pagination = useMemo(
    () => ({
      total,
      page: listData?.page ?? currentPage,
      limit,
      pages: totalPages,
    }),
    [total, listData?.page, currentPage, limit, totalPages],
  );

  const handleCancelShipment = async (shipmentId: string) => {
    if (window.confirm("Cancel this shipment? Only pending shipments can be cancelled.")) {
      try {
        await cancelShipment.mutateAsync(shipmentId);
        toast.success("Shipment cancelled");
      } catch {
        toast.error("Could not cancel shipment");
      }
    }
  };

  const handleRedispatchShipment = async (shipmentId: string) => {
    if (
      window.confirm(
        "Queue a manual redispatch? This is only for shipments that failed dispatch.",
      )
    ) {
      try {
        await redispatchShipment.mutateAsync(shipmentId);
        toast.success("Redispatch queued");
      } catch {
        toast.error("Could not redispatch");
      }
    }
  };

  const handleViewDetails = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="min-h-screen">
      <div className="mb-6">
        <Paragraph2 className="mb-1 font-extrabold text-gray-900 text-2xl tracking-tight">
          Shipments
        </Paragraph2>
        <Paragraph1 className="text-gray-600">
          View dispatch state, windows, and tracking for all platform shipments (admin).
        </Paragraph1>
      </div>

      <div className="bg-white mb-6 p-4 border border-gray-200 rounded-lg">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex flex-1 items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg min-w-64">
            <svg
              className="w-4 h-4 text-gray-400 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
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
              placeholder="Filter by order id (e.g. RL-…) or internal order UUID…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-gray-900 text-sm placeholder-gray-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white mb-6 px-6 py-4 border border-gray-200 rounded-lg">
        <Paragraph1 className="mb-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">
          Shipment type
        </Paragraph1>
        <div className="flex items-center gap-2 pb-1 overflow-x-auto">
          {TYPE_FILTERS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTypeFilter(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                typeFilter === t
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {t === "All" ? "All types" : getTypeLabel(t)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white mb-6 px-6 py-4 border border-gray-200 border-b rounded-t-lg">
        <Paragraph1 className="mb-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">
          Status
        </Paragraph1>
        <div className="flex items-center gap-2 pb-2 overflow-x-auto">
          {STATUS_FILTERS.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                statusFilter === status
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {status === "All" ? "All" : getStatusLabel(status)}
            </button>
          ))}
        </div>
      </div>

      {isLoading || isError ? (
        isError ? (
          <div className="bg-white p-8 border border-gray-200 rounded-lg text-center">
            <Paragraph1 className="text-red-600">
              Failed to load shipments. Check your session and try again.
            </Paragraph1>
          </div>
        ) : (
          <TableSkeleton rows={6} columns={8} />
        )
      ) : (
        <>
          <div className="bg-white border border-gray-200 border-t-0 rounded-b-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-gray-200 border-b">
                    <th className="px-6 py-4 text-left">
                      <Paragraph1 className="font-semibold text-gray-600 text-xs uppercase tracking-wide">
                        Reference
                      </Paragraph1>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <Paragraph1 className="font-semibold text-gray-600 text-xs uppercase tracking-wide">
                        Order
                      </Paragraph1>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <Paragraph1 className="font-semibold text-gray-600 text-xs uppercase tracking-wide">
                        Type
                      </Paragraph1>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <Paragraph1 className="font-semibold text-gray-600 text-xs uppercase tracking-wide">
                        Status
                      </Paragraph1>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <Paragraph1 className="font-semibold text-gray-600 text-xs uppercase tracking-wide">
                        Scheduled
                      </Paragraph1>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <Paragraph1 className="font-semibold text-gray-600 text-xs uppercase tracking-wide">
                        Tracking
                      </Paragraph1>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <Paragraph1 className="font-semibold text-gray-600 text-xs uppercase tracking-wide">
                        Customer
                      </Paragraph1>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <Paragraph1 className="font-semibold text-gray-600 text-xs uppercase tracking-wide">
                        Actions
                      </Paragraph1>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {shipments.map((shipment) => {
                    const StatusIcon = getStatusIcon(shipment.status);
                    const humanOrderId = shipment.order?.orderId ?? "—";
                    return (
                      <tr
                        key={shipment.id}
                        className="hover:bg-gray-50 border-gray-100 border-b transition cursor-pointer"
                        onClick={() => handleViewDetails(shipment)}
                      >
                        <td className="px-6 py-4">
                          <span title={shipment.id}>
                            <Paragraph1 className="font-medium text-gray-900 text-sm">
                              {shortenId(shipment.id)}
                            </Paragraph1>
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Paragraph1 className="font-medium text-gray-900 text-sm">
                            {humanOrderId}
                          </Paragraph1>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-block bg-gray-100 px-3 py-1 rounded-full font-semibold text-gray-700 text-xs">
                            {getTypeLabel(shipment.type)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                              shipment.status,
                            )}`}
                          >
                            <StatusIcon
                              size={12}
                              className={
                                shipment.status === "DISPATCHING" ? "animate-spin" : undefined
                              }
                            />
                            {getStatusLabel(shipment.status, shipment.type)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Paragraph1 className="text-gray-700 text-sm">
                            {shipment.scheduledDate
                              ? new Date(shipment.scheduledDate).toLocaleString()
                              : "—"}
                          </Paragraph1>
                        </td>
                        <td className="px-6 py-4">
                          {shipment.trackingId ? (
                            <div className="flex items-center gap-2">
                              <Paragraph1 className="font-mono text-gray-900 text-sm">
                                {shipment.trackingId}
                              </Paragraph1>
                              {shipment.providerTrackingUrl && (
                                <a
                                  href={shipment.providerTrackingUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-blue-600 hover:text-blue-800"
                                  aria-label="Open tracking"
                                >
                                  <ExternalLink size={14} />
                                </a>
                              )}
                            </div>
                          ) : (
                            <Paragraph1 className="text-gray-500 text-sm">—</Paragraph1>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <Paragraph1 className="text-gray-700 text-sm">
                            {shipment.order?.user?.name ||
                              shipment.order?.user?.email ||
                              "—"}
                          </Paragraph1>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {shipment.status === "DISPATCH_FAILED" && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRedispatchShipment(shipment.id);
                                }}
                                disabled={redispatchShipment.isPending}
                                className="hover:bg-blue-50 disabled:opacity-50 p-2 rounded-lg text-blue-600 transition"
                                title="Redispatch (failed only)"
                              >
                                <RefreshCw size={16} />
                              </button>
                            )}
                            {shipment.status === "PENDING" && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelShipment(shipment.id);
                                }}
                                disabled={cancelShipment.isPending}
                                className="hover:bg-red-50 disabled:opacity-50 p-2 rounded-lg text-red-600 transition"
                                title="Cancel (pending only)"
                              >
                                <XCircle size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {shipments.length === 0 && (
            <div className="bg-white mt-4 p-8 border border-gray-200 rounded-lg text-center">
              <Paragraph1 className="text-gray-500">
                No shipments match these filters.
              </Paragraph1>
            </div>
          )}

          {pagination.pages > 1 && (
            <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-4 bg-white mt-6 px-6 py-4 border border-gray-200 rounded-lg">
              <Paragraph1 className="text-gray-600 text-sm">
                Showing {(currentPage - 1) * pagination.limit + 1} to{" "}
                {Math.min(currentPage * pagination.limit, pagination.total)} of{" "}
                {pagination.total} results
              </Paragraph1>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 hover:bg-gray-50 disabled:opacity-50 px-3 py-2 border border-gray-300 rounded-lg font-medium text-sm transition disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>
                <div className="flex flex-wrap items-center gap-1">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
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
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(pagination.pages, p + 1))}
                  disabled={currentPage === pagination.pages}
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

      {isDetailModalOpen && selectedShipment && displayShipment && (
        <div
          className="z-50 fixed inset-0 flex justify-center items-center bg-black/50 p-4"
          onClick={() => setIsDetailModalOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setIsDetailModalOpen(false)}
          role="presentation"
        >
          <div
            className="relative bg-white shadow-lg rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal
            aria-labelledby="shipment-detail-title"
          >
            {detailQuery.isFetching && !detailFromApi && (
              <div className="z-10 absolute inset-0 flex justify-center items-center bg-white/70 rounded-lg">
                <Loader2 className="w-8 h-8 text-gray-600 animate-spin" aria-label="Loading details" />
              </div>
            )}
            <div className="p-6 border-gray-200 border-b">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h2
                    id="shipment-detail-title"
                    className="font-bold text-gray-900 text-xl leading-tight"
                  >
                    Shipment
                  </h2>
                  <Paragraph1 className="mt-1 text-gray-600 text-sm">
                    Order {displayShipment.order?.orderId ?? "—"} ·{" "}
                    {getTypeLabel(displayShipment.type)}
                  </Paragraph1>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDetailModalOpen(false)}
                  className="hover:bg-gray-100 p-1 rounded-lg text-gray-500 hover:text-gray-700"
                  aria-label="Close"
                >
                  <XCircle size={24} />
                </button>
              </div>
            </div>
            <div className="space-y-6 p-6">
              <div className="gap-4 grid grid-cols-1 sm:grid-cols-2">
                <div>
                  <Paragraph1 className="mb-1 text-gray-500 text-xs">Order number</Paragraph1>
                  <Paragraph1 className="font-medium text-gray-900">
                    {displayShipment.order?.orderId ?? "—"}
                  </Paragraph1>
                </div>
                <div>
                  <Paragraph1 className="mb-1 text-gray-500 text-xs">Status</Paragraph1>
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                      displayShipment.status,
                    )}`}
                  >
                    {getStatusLabel(displayShipment.status, displayShipment.type)}
                  </span>
                </div>
                <div>
                  <Paragraph1 className="mb-1 text-gray-500 text-xs">Attempts (latest run)</Paragraph1>
                  <Paragraph1 className="font-medium text-gray-900">
                    {displayShipment.dispatchAttempts ?? 0}
                  </Paragraph1>
                  <Paragraph1 className="mt-0.5 text-gray-500 text-xs">
                    Resets after you use Redispatch. Full history is in the log below.
                  </Paragraph1>
                </div>
                <div>
                  <Paragraph1 className="mb-1 text-gray-500 text-xs">Total tries in log</Paragraph1>
                  <Paragraph1 className="font-medium text-gray-900">
                    {sortedDispatchAttemptLogs.length}
                  </Paragraph1>
                </div>
                <div>
                  <Paragraph1 className="mb-1 text-gray-500 text-xs">Customer</Paragraph1>
                  <Paragraph1 className="font-medium text-gray-900">
                    {displayShipment.order?.user?.name || "—"}
                  </Paragraph1>
                  <Paragraph1 className="text-gray-600 text-sm">
                    {displayShipment.order?.user?.email ?? ""}
                  </Paragraph1>
                </div>
                <div>
                  <Paragraph1 className="mb-1 text-gray-500 text-xs">Shipping option</Paragraph1>
                  <Paragraph1 className="font-medium text-gray-900">
                    {displayShipment.pricingTier ?? "—"}
                  </Paragraph1>
                </div>
              </div>

              {displayShipment.order?.orderItems &&
                displayShipment.order.orderItems.length > 0 && (
                  <div>
                    <Paragraph1 className="mb-2 text-gray-500 text-xs">Items in this order</Paragraph1>
                    <ul className="space-y-1 bg-gray-50 p-3 border border-gray-100 rounded-lg text-gray-800 text-sm list-disc list-inside">
                      {displayShipment.order.orderItems.map((line) => (
                        <li key={line.id ?? line.product?.name}>
                          {line.product?.name ?? "Item"}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              <div className="gap-4 grid grid-cols-1 sm:grid-cols-2">
                <div>
                  <Paragraph1 className="mb-1 text-gray-500 text-xs">Scheduled date</Paragraph1>
                  <Paragraph1 className="font-medium text-gray-900">
                    {displayShipment.scheduledDate
                      ? new Date(displayShipment.scheduledDate).toLocaleString()
                      : "—"}
                  </Paragraph1>
                </div>
                <div>
                  <Paragraph1 className="mb-1 text-gray-500 text-xs">Dispatch window</Paragraph1>
                  <Paragraph1 className="font-medium text-gray-900 text-sm leading-relaxed">
                    {displayShipment.scheduledWindowStart && displayShipment.scheduledWindowEnd
                      ? formatWindowRange({
                          start: displayShipment.scheduledWindowStart,
                          end: displayShipment.scheduledWindowEnd,
                        })
                      : "—"}
                  </Paragraph1>
                </div>
                <div>
                  <Paragraph1 className="mb-1 text-gray-500 text-xs">Dispatched at</Paragraph1>
                  <Paragraph1 className="font-medium text-gray-900">
                    {displayShipment.dispatchedAt
                      ? new Date(displayShipment.dispatchedAt).toLocaleString()
                      : "—"}
                  </Paragraph1>
                </div>
                <div>
                  <Paragraph1 className="mb-1 text-gray-500 text-xs">Pickup partner</Paragraph1>
                  <Paragraph1 className="font-medium text-gray-900">
                    {displayShipment.pickupPartner ?? "—"}
                  </Paragraph1>
                </div>
                <div className="sm:col-span-2">
                  <Paragraph1 className="mb-1 text-gray-500 text-xs">Delivery address</Paragraph1>
                  <Paragraph1 className="font-medium text-gray-900 text-sm">
                    {formatCheckoutDeliveryStreetLine(displayShipment)}
                  </Paragraph1>
                </div>
                <div>
                  <Paragraph1 className="mb-1 text-gray-500 text-xs">Partner pickup booking</Paragraph1>
                  <Paragraph1 className="font-medium text-gray-900 text-sm">
                    {displayShipment.pickupId ?? "—"}
                  </Paragraph1>
                </div>
              </div>

              <div className="gap-3 grid grid-cols-1 sm:grid-cols-3">
                <div className="bg-gray-50 p-3 border border-gray-100 rounded-lg">
                  <Paragraph1 className="mb-1 text-gray-500 text-xs">Shipment (NGN)</Paragraph1>
                  <Paragraph1 className="font-semibold text-gray-900">
                    {koboToNaira(displayShipment.shipmentCharge)}
                  </Paragraph1>
                </div>
                <div className="bg-gray-50 p-3 border border-gray-100 rounded-lg">
                  <Paragraph1 className="mb-1 text-gray-500 text-xs">Pickup (NGN)</Paragraph1>
                  <Paragraph1 className="font-semibold text-gray-900">
                    {koboToNaira(displayShipment.pickupCharge)}
                  </Paragraph1>
                </div>
                <div className="bg-gray-50 p-3 border border-gray-100 rounded-lg">
                  <Paragraph1 className="mb-1 text-gray-500 text-xs">VAT (NGN)</Paragraph1>
                  <Paragraph1 className="font-semibold text-gray-900">
                    {koboToNaira(displayShipment.vatCharge)}
                  </Paragraph1>
                </div>
              </div>

              {(displayShipment.trackingId || displayShipment.providerTrackingUrl) && (
                <div className="bg-gray-50 p-4 border border-gray-100 rounded-lg">
                  <Paragraph1 className="mb-2 text-gray-500 text-xs">Tracking</Paragraph1>
                  {displayShipment.trackingId && (
                    <Paragraph1 className="mb-2 text-gray-900 text-sm">
                      <span className="block mb-0.5 text-gray-500 text-xs">Tracking number</span>
                      {displayShipment.trackingId}
                    </Paragraph1>
                  )}
                  {displayShipment.providerTrackingUrl && (
                    <a
                      href={displayShipment.providerTrackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 text-sm hover:underline"
                    >
                      <ExternalLink size={14} />
                      Track on courier site
                    </a>
                  )}
                </div>
              )}

              <div>
                <Paragraph1 className="flex items-center gap-1 mb-2 text-gray-500 text-xs">
                  <Package size={12} />
                  Pickup from (lister)
                </Paragraph1>
                <Paragraph1 className="bg-gray-50 p-3 border border-gray-100 rounded-lg text-gray-800 text-sm">
                  {formatAddress(displayShipment.pickupAddress)}
                </Paragraph1>
              </div>
              <div>au
                <Paragraph1 className="flex items-center gap-1 mb-2 text-gray-500 text-xs">
                  <Truck size={12} />
                  Deliver to (renter)
                </Paragraph1>
                <Paragraph1 className="bg-gray-50 p-3 border border-gray-100 rounded-lg text-gray-800 text-sm">
                  {formatAddress(displayShipment.deliveryAddress)}
                </Paragraph1>
              </div>

              <div>
                <Paragraph1 className="mb-2 text-gray-500 text-xs">Dispatch history</Paragraph1>
                {sortedDispatchAttemptLogs.length === 0 ? (
                  <Paragraph1 className="bg-gray-50 p-3 border border-gray-100 rounded-lg text-gray-500 text-sm">
                    No attempts recorded yet.
                  </Paragraph1>
                ) : (
                  <div className="space-y-2 pr-1 max-h-72 overflow-y-auto">
                    {sortedDispatchAttemptLogs.map((log, idx) => {
                      const dur = formatDispatchDurationMs(log.durationMs);
                      const codeLine = formatDispatchErrorCode(log.errorCode);
                      return (
                        <div
                          key={log.id}
                          className="bg-gray-50 p-3 border border-gray-200 rounded-lg text-sm"
                        >
                          <div className="flex flex-wrap justify-between gap-2 mb-1">
                            <Paragraph1 className="font-medium text-gray-900">
                              Try #{idx + 1}{" "}
                              <span className={log.success ? "text-green-600" : "text-red-600"}>
                                {log.success ? "OK" : "Fail"}
                              </span>
                            </Paragraph1>
                            <Paragraph1 className="text-gray-500 text-xs shrink-0">
                              {formatAttemptedAt(log.attemptedAt)}
                              {dur ? ` · ${dur}` : ""}
                            </Paragraph1>
                          </div>
                          {!log.success && log.errorMessage && (
                            <Paragraph1 className="bg-red-50/50 mt-1 p-2 border border-red-100 rounded max-h-40 overflow-y-auto text-red-700 text-xs wrap-break-word whitespace-pre-wrap">
                              {log.errorMessage}
                            </Paragraph1>
                          )}
                          {!log.success && codeLine && (
                            <Paragraph1 className="mt-1 text-gray-600 text-xs">{codeLine}</Paragraph1>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex sm:flex-row flex-col gap-3 pt-4 border-gray-200 border-t">
                {displayShipment.status === "DISPATCH_FAILED" && (
                  <button
                    type="button"
                    onClick={() => {
                      handleRedispatchShipment(displayShipment.id);
                    }}
                    disabled={redispatchShipment.isPending}
                    className="flex-1 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 px-4 py-2 rounded-lg font-medium text-white text-sm transition"
                  >
                    {redispatchShipment.isPending ? "Queueing…" : "Redispatch"}
                  </button>
                )}
                {displayShipment.status === "PENDING" && (
                  <button
                    type="button"
                    onClick={() => {
                      handleCancelShipment(displayShipment.id);
                    }}
                    disabled={cancelShipment.isPending}
                    className="flex-1 hover:bg-red-50 disabled:opacity-50 px-4 py-2 border border-red-200 rounded-lg font-medium text-red-700 text-sm transition"
                  >
                    {cancelShipment.isPending ? "Cancelling…" : "Cancel shipment"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
