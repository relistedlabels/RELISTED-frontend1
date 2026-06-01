// ENDPOINTS: GET /shipments, GET /shipments/costs, GET /shipments/:id, GET /shipments/:id/tracking,
// GET /orders/:orderId/shipments, POST /shipments/:id/cancel, POST /shipments/:id/redispatch,
// POST /shipments/:id/manual-complete, POST /shipments/:id/manual-delivered (Relisted dispatch)

"use client";

import React, { Suspense, useMemo, useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
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
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  useShipments,
  useShipmentCosts,
  useShipment,
  useCancelShipment,
  useRedispatchShipment,
  useCompleteManualShipment,
  useMarkManualShipmentDelivered,
} from "@/lib/queries/admin/useShipments";
import type {
  DispatchAttemptLog,
  Shipment,
  ShipmentOrderLineItem,
  ShipmentStatus,
  ShipmentType,
} from "@/lib/api/shipments";
import { getShipment } from "@/lib/api/shipments";
import { formatLagosDate, formatWindowRange } from "@/lib/checkout/dispatchWindows";
import {
  getShipmentLegDisplayLabel,
  getShipmentPartyRowLabels,
  getShipmentStatusLabel,
} from "@/lib/orders/shipmentAndOrderLabels";
import { toast } from "sonner";
import {
  AdminListingThumb,
  listingThumbnailUrl,
} from "@/app/admin/lib/adminListingDisplay";

const PROVIDER_LABELS: Record<string, string> = {
  all: "All",
  topship: "Topship",
  shipbubble: "Shipbubble",
  chowdeck_relay: "Chowdeck Relay",
  manual: "Relisted dispatch",
};

function shipmentLineItemThumbnailUrl(line: ShipmentOrderLineItem): string | null {
  if (!line.product) return null;
  return listingThumbnailUrl(line.product);
}

function firstShipmentItemThumbnail(shipment: Shipment): string | null {
  const items = shipment.order?.orderItems;
  if (!items?.length) return null;
  for (const line of items) {
    const url = shipmentLineItemThumbnailUrl(line);
    if (url) return url;
  }
  return null;
}

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

function formatShipmentRowCost(
  shipment: Pick<Shipment, "shipmentCharge" | "pickupCharge" | "vatCharge">,
): string {
  const kobo =
    (shipment.shipmentCharge ?? 0) +
    (shipment.pickupCharge ?? 0) +
    (shipment.vatCharge ?? 0);
  if (
    kobo <= 0 &&
    shipment.shipmentCharge == null &&
    shipment.pickupCharge == null &&
    shipment.vatCharge == null
  ) {
    return "—";
  }
  return koboToNaira(kobo);
}

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

type FulfillmentFilter = "all" | "manual" | "automated";

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
  return (
    <Suspense
      fallback={
        <div className="min-h-screen">
          <TableSkeleton rows={8} columns={10} />
        </div>
      }
    >
      <ShipmentsPageInner />
    </Suspense>
  );
}

function ShipmentsPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [statusFilter, setStatusFilter] = useState<ShipmentStatus | "All">("All");
  const [typeFilter, setTypeFilter] = useState<ShipmentType | "All">("All");
  const [fulfillmentFilter, setFulfillmentFilter] = useState<FulfillmentFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [manualTrackingRef, setManualTrackingRef] = useState("");
  const [manualTrackingUrl, setManualTrackingUrl] = useState("");
  const [costProvider, setCostProvider] = useState("all");
  const [costCourier, setCostCourier] = useState("all");
  const [costsOpen, setCostsOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [costDateFrom, setCostDateFrom] = useState("");
  const [costDateTo, setCostDateTo] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const shipmentIdFromLink = searchParams.get("shipmentId")?.trim() ?? "";
  const processedShipmentLinkRef = useRef<string | null>(null);

  useEffect(() => {
    if (!shipmentIdFromLink) {
      processedShipmentLinkRef.current = null;
      return;
    }
    if (processedShipmentLinkRef.current === shipmentIdFromLink) return;
    processedShipmentLinkRef.current = shipmentIdFromLink;

    void (async () => {
      try {
        const res = await getShipment(shipmentIdFromLink);
        if (!res?.data) return;
        setSelectedShipment(res.data);
        setIsDetailModalOpen(true);
      } catch {
        toast.error("Could not load shipment from link");
        processedShipmentLinkRef.current = null;
      } finally {
        const next = new URLSearchParams(searchParams.toString());
        next.delete("shipmentId");
        const q = next.toString();
        router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
      }
    })();
  }, [shipmentIdFromLink, pathname, router, searchParams]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, typeFilter, fulfillmentFilter, debouncedSearch, dateFrom, dateTo]);

  useEffect(() => {
    setCostProvider("all");
    setCostCourier("all");
  }, [
    statusFilter,
    typeFilter,
    fulfillmentFilter,
    debouncedSearch,
    dateFrom,
    dateTo,
    costDateFrom,
    costDateTo,
  ]);

  const manualFulfillmentParam =
    fulfillmentFilter === "manual"
      ? true
      : fulfillmentFilter === "automated"
        ? false
        : undefined;

  const {
    data: shipmentsData,
    isLoading,
    isError,
  } = useShipments({
    status: statusFilter === "All" ? undefined : statusFilter,
    type: typeFilter === "All" ? undefined : typeFilter,
    orderId: debouncedSearch || undefined,
    manualFulfillment: manualFulfillmentParam,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    page: currentPage,
    limit: 20,
  });

  const { data: costsRes } = useShipmentCosts({
    status: statusFilter === "All" ? undefined : statusFilter,
    type: typeFilter === "All" ? undefined : typeFilter,
    orderId: debouncedSearch || undefined,
    manualFulfillment: manualFulfillmentParam,
    dateFrom: costDateFrom || undefined,
    dateTo: costDateTo || undefined,
    provider: costProvider,
    courier: costCourier,
  });
  const costs = costsRes?.data;

  const cancelShipment = useCancelShipment();
  const redispatchShipment = useRedispatchShipment();
  const completeManualShipment = useCompleteManualShipment();
  const markManualDelivered = useMarkManualShipmentDelivered();

  const detailQuery = useShipment(selectedShipment?.id ?? "", {
    enabled: Boolean(isDetailModalOpen && selectedShipment?.id),
  });
  const detailFromApi = detailQuery.data?.data;
  const displayShipment: Shipment | null = detailFromApi ?? selectedShipment;

  useEffect(() => {
    if (!displayShipment?.id) return;
    setManualTrackingRef("");
    setManualTrackingUrl("");
  }, [displayShipment?.id]);

  const sortedDispatchAttemptLogs = useMemo(
    () => sortDispatchAttemptLogs(displayShipment?.attemptLogs),
    [displayShipment?.attemptLogs, displayShipment?.id],
  );

  const detailPartyLabels = useMemo(
    () => getShipmentPartyRowLabels(displayShipment?.type),
    [displayShipment?.type],
  );

  const showPickupFeeRow = (displayShipment?.pickupCharge ?? 0) > 0;

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

  const handleMarkManualDispatched = async () => {
    if (!displayShipment?.id) return;
    try {
      await completeManualShipment.mutateAsync({
        shipmentId: displayShipment.id,
        trackingId: manualTrackingRef.trim() || undefined,
        trackingUrl: manualTrackingUrl.trim() || undefined,
      });
      toast.success("Marked as dispatched. Customer notified.");
      setIsDetailModalOpen(false);
    } catch {
      toast.error("Could not complete shipment");
    }
  };

  const handleMarkManualDelivered = async () => {
    if (!displayShipment?.id) return;
    if (
      !window.confirm(
        "Mark this leg as delivered? The order status will update and the buyer can confirm receipt (or auto-complete after the inspection period).",
      )
    ) {
      return;
    }
    try {
      await markManualDelivered.mutateAsync(displayShipment.id);
      toast.success("Marked as delivered. Order status updated.");
      await detailQuery.refetch();
    } catch {
      toast.error("Could not mark as delivered");
    }
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

      <div className="bg-white mb-6 border border-gray-200 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => setCostsOpen((open) => !open)}
          className="flex justify-between items-center gap-4 hover:bg-gray-50 px-5 py-4 w-full text-left transition-colors"
          aria-expanded={costsOpen}
        >
          <div className="flex items-center gap-3 min-w-0">
            {costsOpen ? (
              <ChevronUp className="w-4 h-4 text-gray-500 shrink-0" aria-hidden />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" aria-hidden />
            )}
            <div className="min-w-0">
              <Paragraph2 className="font-semibold text-gray-900">Shipping costs</Paragraph2>
              <Paragraph1 className="text-gray-500 text-sm">
                Aggregated shipping spend with its own date range and breakdown filters
              </Paragraph1>
            </div>
          </div>
        </button>

        {costsOpen && (
          <div className="px-5 py-4 border-gray-200 border-t">
            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 mb-4">
              <input
                type="date"
                value={costDateFrom}
                onChange={(e) => setCostDateFrom(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-lg min-w-[160px] text-gray-900 text-sm"
                aria-label="Cost scheduled from"
              />

              <input
                type="date"
                value={costDateTo}
                onChange={(e) => setCostDateTo(e.target.value)}
                min={costDateFrom || undefined}
                className="px-4 py-2.5 border border-gray-200 rounded-lg min-w-[160px] text-gray-900 text-sm"
                aria-label="Cost scheduled to"
              />

              <select
                value={costProvider}
                onChange={(e) => {
                  setCostProvider(e.target.value);
                  setCostCourier("all");
                }}
                className="px-4 py-2.5 border border-gray-200 rounded-lg min-w-[160px] text-gray-900 text-sm"
                aria-label="Shipping provider"
              >
                <option value="all">All providers</option>
                {(costs?.providers ?? []).map((p) => (
                  <option key={p} value={p}>
                    {PROVIDER_LABELS[p] ?? p}
                  </option>
                ))}
              </select>

              {(costs?.couriers.length ?? 0) > 0 && (
                <select
                  value={costCourier}
                  onChange={(e) => setCostCourier(e.target.value)}
                  className="px-4 py-2.5 border border-gray-200 rounded-lg min-w-[160px] text-gray-900 text-sm"
                  aria-label="Courier"
                >
                  <option value="all">All couriers</option>
                  {(costs?.couriers ?? []).map((c) => (
                    <option key={c} value={c}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </option>
                  ))}
                </select>
              )}
            </div>
            {costs && costs.count > 0 ? (
              <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
                <div>
                  <Paragraph1 className="mb-2 font-medium text-gray-700 text-sm">By month</Paragraph1>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-gray-200 border-b text-left text-gray-500 text-xs uppercase">
                        <th className="py-2 pr-2">Month</th>
                        <th className="py-2 pr-2">Shipments</th>
                        <th className="py-2">Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {costs.trend.map((row) => (
                        <tr key={row.month} className="border-gray-100 border-b">
                          <td className="py-2 pr-2">{row.month}</td>
                          <td className="py-2 pr-2">{row.count}</td>
                          <td className="py-2">{koboToNaira(row.kobo)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-gray-300 border-t font-semibold text-gray-900">
                        <td className="py-2 pr-2">Total</td>
                        <td className="py-2 pr-2">{costs.count}</td>
                        <td className="py-2">{koboToNaira(costs.totalKobo)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <div>
                  <Paragraph1 className="mb-2 font-medium text-gray-700 text-sm">
                    {costProvider !== "all" || costCourier !== "all" ? "By courier" : "By provider"}
                  </Paragraph1>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-gray-200 border-b text-left text-gray-500 text-xs uppercase">
                        <th className="py-2 pr-2">
                          {costProvider !== "all" || costCourier !== "all" ? "Courier" : "Provider"}
                        </th>
                        <th className="py-2 pr-2">Shipments</th>
                        <th className="py-2">Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {costs.groups.map((row) => (
                        <tr key={row.key} className="border-gray-100 border-b">
                          <td className="py-2 pr-2">{row.label}</td>
                          <td className="py-2 pr-2">{row.count}</td>
                          <td className="py-2">{koboToNaira(row.kobo)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-gray-300 border-t font-semibold text-gray-900">
                        <td className="py-2 pr-2">Total</td>
                        <td className="py-2 pr-2">{costs.count}</td>
                        <td className="py-2">{koboToNaira(costs.totalKobo)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            ) : (
              <Paragraph1 className="text-gray-500 text-sm">No cost data for these filters.</Paragraph1>
            )}
          </div>
        )}
      </div>

      <div className="bg-white mb-6 border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-gray-200 border-b">
          <Paragraph2 className="mb-1 font-semibold text-gray-900">Shipment list</Paragraph2>
          <Paragraph1 className="text-gray-500 text-sm">
            Search and filters apply to the shipment table below.
          </Paragraph1>
        </div>

        <div className="flex flex-col lg:flex-row flex-wrap items-stretch lg:items-center gap-3 px-6 py-4 border-gray-200 border-b">
          <div className="flex flex-1 items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg min-w-[220px]">
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
              placeholder="Order id or UUID…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-gray-900 text-sm placeholder-gray-500"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as ShipmentType | "All")}
            className="px-4 py-2.5 border border-gray-200 rounded-lg min-w-[160px] text-gray-900 text-sm"
            aria-label="Shipment type"
          >
            {TYPE_FILTERS.map((t) => (
              <option key={t} value={t}>
                {t === "All" ? "All types" : getShipmentLegDisplayLabel(t)}
              </option>
            ))}
          </select>

          <select
            value={fulfillmentFilter}
            onChange={(e) => setFulfillmentFilter(e.target.value as FulfillmentFilter)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg min-w-[180px] text-gray-900 text-sm"
            aria-label="Fulfillment"
          >
            <option value="all">All fulfillment</option>
            <option value="manual">Relisted dispatch</option>
            <option value="automated">Carrier (Topship)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ShipmentStatus | "All")}
            className="px-4 py-2.5 border border-gray-200 rounded-lg min-w-[180px] text-gray-900 text-sm"
            aria-label="Status"
          >
            {STATUS_FILTERS.map((status) => (
              <option key={status} value={status}>
                {status === "All" ? "All statuses" : getStatusLabel(status)}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg min-w-[160px] text-gray-900 text-sm"
            aria-label="Scheduled from"
          />

          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            min={dateFrom || undefined}
            className="px-4 py-2.5 border border-gray-200 rounded-lg min-w-[160px] text-gray-900 text-sm"
            aria-label="Scheduled to"
          />
        </div>

      {isLoading || isError ? (
        isError ? (
          <div className="p-8 text-center">
            <Paragraph1 className="text-red-600">
              Failed to load shipments. Check your session and try again.
            </Paragraph1>
          </div>
        ) : (
          <TableSkeleton rows={6} columns={10} />
        )
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-gray-200 border-b">
                    <th className="px-6 py-4 text-left">
                      <Paragraph1 className="font-semibold text-gray-600 text-xs uppercase tracking-wide">
                        Item
                      </Paragraph1>
                    </th>
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
                        Cost
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
                    const itemThumb = firstShipmentItemThumbnail(shipment);
                    const firstItemName =
                      shipment.order?.orderItems?.[0]?.product?.name ?? "Item";
                    return (
                      <tr
                        key={shipment.id}
                        className="hover:bg-gray-50 border-gray-100 border-b transition cursor-pointer"
                        onClick={() => handleViewDetails(shipment)}
                      >
                        <td className="px-6 py-4">
                          <div
                            className="w-12 h-12 shrink-0"
                            title={firstItemName}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <AdminListingThumb
                              url={itemThumb}
                              alt={firstItemName}
                            />
                          </div>
                        </td>
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
                          <div className="flex flex-col items-start gap-1">
                            <span className="inline-block bg-gray-100 px-3 py-1 rounded-full font-semibold text-gray-700 text-xs">
                              {getShipmentLegDisplayLabel(shipment.type)}
                            </span>
                            {shipment.manualFulfillment && (
                              <span className="inline-block bg-amber-100 px-2 py-0.5 rounded font-medium text-amber-900 text-[10px] tracking-wide uppercase">
                                Relisted dispatch
                              </span>
                            )}
                          </div>
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
                              ? formatLagosDate(shipment.scheduledDate)
                              : "—"}
                          </Paragraph1>
                        </td>
                        <td className="px-6 py-4">
                          <Paragraph1 className="font-medium text-gray-900 text-sm">
                            {formatShipmentRowCost(shipment)}
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
                            {shipment.status === "DISPATCH_FAILED" && !shipment.manualFulfillment && (
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

          {shipments.length === 0 && (
            <div className="p-8 text-center">
              <Paragraph1 className="text-gray-500">
                No shipments match these filters.
              </Paragraph1>
            </div>
          )}

          {pagination.pages > 1 && (
            <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-4 px-6 py-4 border-gray-200 border-t">
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
      </div>

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
                    {getShipmentLegDisplayLabel(displayShipment.type)}
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

              {displayShipment.manualFulfillment && (
                <div className="bg-amber-50 p-4 border border-amber-200 rounded-lg">
                  <Paragraph1 className="mb-1 font-semibold text-amber-950 text-sm">
                    Relisted dispatch
                  </Paragraph1>
                  <Paragraph1 className="text-amber-900 text-sm leading-relaxed">
                    This order did not get an automated Topship quote. Arrange pickup or a rider using the addresses below, then mark the shipment as dispatched. The customer is notified with any tracking reference or link you add.
                  </Paragraph1>
                </div>
              )}

              {displayShipment.order?.orderItems &&
                displayShipment.order.orderItems.length > 0 && (
                  <div>
                    <Paragraph1 className="mb-2 text-gray-500 text-xs">Items in this shipment</Paragraph1>
                    <ul className="space-y-2 bg-gray-50 p-3 border border-gray-100 rounded-lg">
                      {displayShipment.order.orderItems.map((line) => {
                        const name = line.product?.name ?? "Item";
                        const thumb = shipmentLineItemThumbnailUrl(line);
                        return (
                          <li
                            key={line.id ?? name}
                            className="flex items-center gap-3 text-gray-800 text-sm"
                          >
                            <div className="w-14 h-14 shrink-0">
                              <AdminListingThumb url={thumb} alt={name} />
                            </div>
                            <span className="font-medium text-gray-900">{name}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

              <div className="gap-4 grid grid-cols-1 sm:grid-cols-2">
                <div>
                  <Paragraph1 className="mb-1 text-gray-500 text-xs">
                    Scheduled date (calendar day, Lagos)
                  </Paragraph1>
                  <Paragraph1 className="font-medium text-gray-900">
                    {displayShipment.scheduledDate
                      ? formatLagosDate(displayShipment.scheduledDate, {
                          includeWeekday: true,
                        })
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

              <div
                className={`gap-3 grid grid-cols-1 ${showPickupFeeRow ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}
              >
                <div className="bg-gray-50 p-3 border border-gray-100 rounded-lg">
                  <Paragraph1 className="mb-1 text-gray-500 text-xs">Shipment (NGN)</Paragraph1>
                  <Paragraph1 className="font-semibold text-gray-900">
                    {koboToNaira(displayShipment.shipmentCharge)}
                  </Paragraph1>
                </div>
                {showPickupFeeRow && (
                  <div className="bg-gray-50 p-3 border border-gray-100 rounded-lg">
                    <Paragraph1 className="mb-1 text-gray-500 text-xs">Pickup (NGN)</Paragraph1>
                    <Paragraph1 className="font-semibold text-gray-900">
                      {koboToNaira(displayShipment.pickupCharge)}
                    </Paragraph1>
                  </div>
                )}
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
                  {detailPartyLabels.pickupHeading}
                </Paragraph1>
                <Paragraph1 className="bg-gray-50 p-3 border border-gray-100 rounded-lg text-gray-800 text-sm">
                  {formatAddress(displayShipment.pickupAddress)}
                </Paragraph1>
              </div>
              <div>
                <Paragraph1 className="flex items-center gap-1 mb-2 text-gray-500 text-xs">
                  <Truck size={12} />
                  {detailPartyLabels.deliveryHeading}
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

              {displayShipment.manualFulfillment &&
                (displayShipment.status === "PENDING" ||
                  displayShipment.status === "DISPATCHING") && (
                  <div className="space-y-3 pt-2 border-gray-100 border-t">
                    <Paragraph1 className="font-semibold text-gray-700 text-xs uppercase tracking-wide">
                      Mark dispatched (manual)
                    </Paragraph1>
                    <div className="gap-3 grid grid-cols-1 sm:grid-cols-2">
                      <label className="block">
                        <Paragraph1 className="mb-1 text-gray-500 text-xs">
                          Reference (phone, rider id, etc.)
                        </Paragraph1>
                        <input
                          type="text"
                          value={manualTrackingRef}
                          onChange={(e) => setManualTrackingRef(e.target.value)}
                          className="px-3 py-2 border border-gray-200 rounded-lg w-full text-gray-900 text-sm"
                          placeholder="Optional"
                        />
                      </label>
                      <label className="block">
                        <Paragraph1 className="mb-1 text-gray-500 text-xs">
                          Tracking URL
                        </Paragraph1>
                        <input
                          type="url"
                          value={manualTrackingUrl}
                          onChange={(e) => setManualTrackingUrl(e.target.value)}
                          className="px-3 py-2 border border-gray-200 rounded-lg w-full text-gray-900 text-sm"
                          placeholder="https://…"
                        />
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        void handleMarkManualDispatched();
                      }}
                      disabled={completeManualShipment.isPending}
                      className="bg-gray-900 hover:bg-gray-800 disabled:opacity-50 px-4 py-2 rounded-lg w-full sm:w-auto font-medium text-white text-sm transition"
                    >
                      {completeManualShipment.isPending ? "Saving…" : "Mark dispatched"}
                    </button>
                  </div>
                )}

              {displayShipment.manualFulfillment &&
                (displayShipment.status === "DISPATCHED" ||
                  displayShipment.status === "IN_TRANSIT") && (
                  <div className="space-y-3 pt-2 border-gray-100 border-t">
                    <Paragraph1 className="font-semibold text-gray-700 text-xs uppercase tracking-wide">
                      Mark delivered (manual)
                    </Paragraph1>
                    <Paragraph1 className="text-gray-600 text-xs leading-relaxed">
                      Use when the item reached the buyer or renter. This updates
                      the order to delivered (or active for rentals) and notifies
                      the customer to confirm receipt where applicable.
                    </Paragraph1>
                    <button
                      type="button"
                      onClick={() => {
                        void handleMarkManualDelivered();
                      }}
                      disabled={markManualDelivered.isPending}
                      className="bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 px-4 py-2 rounded-lg w-full sm:w-auto font-medium text-white text-sm transition"
                    >
                      {markManualDelivered.isPending
                        ? "Saving…"
                        : "Mark delivered"}
                    </button>
                  </div>
                )}

              <div className="flex sm:flex-row flex-col gap-3 pt-4 border-gray-200 border-t">
                {displayShipment.status === "DISPATCH_FAILED" && !displayShipment.manualFulfillment && (
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
