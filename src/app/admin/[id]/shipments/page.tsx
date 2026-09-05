// ENDPOINTS: GET /shipments, GET /shipments/costs, GET /shipments/:id, GET /shipments/:id/tracking,
// GET /orders/:orderId/shipments, POST /shipments/:id/cancel, POST /shipments/:id/redispatch,
// POST /shipments/:id/manual-complete, POST /shipments/:id/manual-delivered (Relisted dispatch),
// GET /shipments/:id/rate-preview, POST /shipments/:id/dispatch-now,
// POST /shipments/:id/reconcile-manual

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
  Search,
} from "lucide-react";
import {
  useShipments,
  useShipmentCosts,
  useShipment,
  useCancelShipment,
  useRedispatchShipment,
  useCompleteManualShipment,
  useMarkManualShipmentDelivered,
  useShipmentRatePreview,
  useDispatchShipmentNow,
  useReconcileManualShipment,
  useSwitchShipmentToManual,
} from "@/lib/queries/admin/useShipments";
import type {
  DispatchAttemptLog,
  Shipment,
  ShipmentOrderLineItem,
  ShipmentRateTier,
  ShipmentStatus,
  ShipmentType,
} from "@/lib/api/shipments";
import { getShipment } from "@/lib/api/shipments";
import { formatLagosDate, formatWindowRange } from "@/lib/checkout/dispatchWindows";
import { formatAdminPricingTier } from "@/lib/admin/shipmentDisplay";
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
import ReturnRequestSection from "@/app/admin/components/ReturnRequestSection";
import {
  AdminComboBox,
  AdminFilterField,
} from "@/app/admin/components/AdminComboBox";

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

function formatRateDelta(deltaKobo: number): string {
  if (deltaKobo === 0) return "Same as renter paid";
  const abs = formatCurrency(Math.abs(deltaKobo) / 100);
  return deltaKobo > 0 ? `${abs} above renter paid` : `${abs} below renter paid`;
}

function isShipmentScheduledInFuture(shipment: Shipment): boolean {
  const now = Date.now();
  const start = shipment.scheduledWindowStart
    ? new Date(shipment.scheduledWindowStart).getTime()
    : new Date(shipment.scheduledDate).getTime();
  return start > now;
}

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

const FILTER_INPUT_CLASS =
  "w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900";

const ADMIN_FIELD_INPUT_CLASS = FILTER_INPUT_CLASS;

const ADMIN_PRIMARY_BTN =
  "bg-gray-900 hover:bg-gray-800 disabled:opacity-50 px-4 py-2 rounded-lg font-medium text-white text-sm transition";

const ADMIN_SECONDARY_BTN =
  "bg-white hover:bg-gray-50 disabled:opacity-50 px-4 py-2 border border-gray-200 rounded-lg font-medium text-gray-800 text-sm transition";

function formatListingTypeLabel(value?: string | null): string | null {
  if (!value) return null;
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function shipmentLineItemMetadata(
  line: ShipmentOrderLineItem,
): Array<{ label: string; value: string }> {
  const product = line.product;
  if (!product) return [];

  const rows: Array<{ label: string; value: string } | null> = [
    product.brand?.name ? { label: "Brand", value: product.brand.name } : null,
    product.category?.name
      ? { label: "Category", value: product.category.name }
      : null,
    product.color ? { label: "Color", value: product.color } : null,
    product.condition ? { label: "Condition", value: product.condition } : null,
    product.measurement ? { label: "Size", value: product.measurement } : null,
    product.material ? { label: "Material", value: product.material } : null,
    product.composition
      ? { label: "Composition", value: product.composition }
      : null,
    product.listingType
      ? {
          label: "Listing type",
          value: formatListingTypeLabel(product.listingType) ?? product.listingType,
        }
      : null,
    line.days && line.days > 0
      ? {
          label: "Rental days",
          value: `${line.days} day${line.days === 1 ? "" : "s"}`,
        }
      : null,
  ];

  return rows.filter((row): row is { label: string; value: string } => row != null);
}

function ShipmentModalSection({
  title,
  summary,
  defaultOpen = false,
  children,
}: {
  title: string;
  summary?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details className="group border border-gray-100 rounded-lg" open={defaultOpen}>
      <summary className="[&::-webkit-details-marker]:hidden flex justify-between items-center gap-3 p-3.5 cursor-pointer list-none">
        <div className="min-w-0">
          <Paragraph1 className="font-medium text-gray-900 text-sm">{title}</Paragraph1>
          {summary ? (
            <Paragraph1 className="mt-0.5 text-gray-500 text-xs truncate">{summary}</Paragraph1>
          ) : null}
        </div>
        <ChevronDown
          size={16}
          className="text-gray-400 group-open:rotate-180 transition shrink-0"
        />
      </summary>
      <div className="space-y-4 px-3.5 pb-3.5 border-gray-100 border-t">{children}</div>
    </details>
  );
}

function DetailField({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Paragraph1 className="mb-1 text-gray-500 text-xs">{label}</Paragraph1>
      {children}
    </div>
  );
}

const FILTER_DATE_CLASS =
  "px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 w-[9rem]";

const FILTER_SELECT_WRAP_CLASS = "w-[9.5rem] shrink-0";

const FULFILLMENT_FILTER_OPTIONS = [
  { value: "all", label: "All fulfillment" },
  { value: "manual", label: "Relisted dispatch" },
  { value: "automated", label: "Carrier booking" },
] as const;

const TYPE_FILTER_OPTIONS = TYPE_FILTERS.map((t) => ({
  value: t,
  label: t === "All" ? "All types" : getShipmentLegDisplayLabel(t),
}));

const STATUS_FILTER_OPTIONS = STATUS_FILTERS.map((status) => ({
  value: status,
  label: status === "All" ? "All statuses" : getStatusLabel(status),
}));

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
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleString("en-NG", {
        timeZone: "Africa/Lagos",
        dateStyle: "medium",
        timeStyle: "short",
      });
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
  const [ratePreviewOpen, setRatePreviewOpen] = useState(false);
  const [rateForImmediate, setRateForImmediate] = useState(true);
  const [selectedCarrierTier, setSelectedCarrierTier] = useState<string | null>(
    null,
  );
  const [reconcileTrackingRef, setReconcileTrackingRef] = useState("");
  const [reconcileTrackingUrl, setReconcileTrackingUrl] = useState("");
  const [reconcileActualCostNgn, setReconcileActualCostNgn] = useState("");
  const [reconcileNote, setReconcileNote] = useState("");
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

  const costProviderOptions = useMemo(
    () => [
      { value: "all", label: "All providers" },
      ...(costs?.providers ?? []).map((p) => ({
        value: p,
        label: PROVIDER_LABELS[p] ?? p,
      })),
    ],
    [costs?.providers],
  );

  const costCourierOptions = useMemo(
    () => [
      { value: "all", label: "All couriers" },
      ...(costs?.couriers ?? []).map((c) => ({
        value: c,
        label: c.charAt(0).toUpperCase() + c.slice(1),
      })),
    ],
    [costs?.couriers],
  );

  const cancelShipment = useCancelShipment();
  const redispatchShipment = useRedispatchShipment();
  const completeManualShipment = useCompleteManualShipment();
  const markManualDelivered = useMarkManualShipmentDelivered();
  const dispatchShipmentNow = useDispatchShipmentNow();
  const reconcileManualShipment = useReconcileManualShipment();
  const switchShipmentToManual = useSwitchShipmentToManual();

  const detailQuery = useShipment(selectedShipment?.id ?? "", {
    enabled: Boolean(isDetailModalOpen && selectedShipment?.id),
  });
  const detailFromApi = detailQuery.data?.data;
  const displayShipment: Shipment | null = detailFromApi ?? selectedShipment;

  const shipmentScheduledInFuture = displayShipment
    ? isShipmentScheduledInFuture(displayShipment)
    : false;

  const ratePreviewQuery = useShipmentRatePreview(
    displayShipment?.id ?? "",
    rateForImmediate,
    Boolean(isDetailModalOpen && ratePreviewOpen && displayShipment?.id),
  );
  const ratePreview = ratePreviewQuery.data?.data;
  const carrierTiers = ratePreview?.tiers ?? [];
  const ratesLoading =
    ratePreviewOpen &&
    (ratePreviewQuery.isLoading || ratePreviewQuery.isFetching);

  useEffect(() => {
    if (!displayShipment?.id) return;
    setManualTrackingRef("");
    setManualTrackingUrl("");
    setRatePreviewOpen(false);
    setSelectedCarrierTier(null);
    setRateForImmediate(true);
    setReconcileTrackingRef("");
    setReconcileTrackingUrl("");
    setReconcileActualCostNgn("");
    setReconcileNote("");
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

  const dispatchWindowLabel =
    displayShipment?.scheduledWindowStart && displayShipment?.scheduledWindowEnd
      ? formatWindowRange({
          start: displayShipment.scheduledWindowStart,
          end: displayShipment.scheduledWindowEnd,
        })
      : null;

  const scheduledRateQuoteDetail =
    dispatchWindowLabel ??
    (displayShipment?.scheduledDate
      ? formatLagosDate(displayShipment.scheduledDate, { includeWeekday: true })
      : "Original scheduled date");

  const shipmentDetailsSummary = useMemo(() => {
    if (!displayShipment) return undefined;
    const parts = [
      formatAdminPricingTier(displayShipment.pricingTier),
      displayShipment.pickupPartner,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(" · ") : undefined;
  }, [displayShipment]);

  const deliveryWindowSummary = useMemo(() => {
    if (dispatchWindowLabel) return dispatchWindowLabel;
    if (displayShipment?.scheduledDate) {
      return formatLagosDate(displayShipment.scheduledDate, { includeWeekday: true });
    }
    return undefined;
  }, [dispatchWindowLabel, displayShipment?.scheduledDate]);

  const dispatchedAtLabel = displayShipment?.dispatchedAt
    ? new Date(displayShipment.dispatchedAt).toLocaleString("en-NG", {
        timeZone: "Africa/Lagos",
        dateStyle: "medium",
        timeStyle: "short",
      })
    : null;

  const dispatchHistorySummary = useMemo(() => {
    const n = sortedDispatchAttemptLogs.length;
    if (n === 0) return "No attempts yet";
    const failCount = sortedDispatchAttemptLogs.filter((log) => !log.success).length;
    if (failCount === n) return `${n} ${n === 1 ? "try" : "tries"}, all failed`;
    const latest = sortedDispatchAttemptLogs[n - 1];
    if (latest?.success) return `${n} ${n === 1 ? "try" : "tries"}, latest succeeded`;
    return `${n} ${n === 1 ? "try" : "tries"}, latest failed`;
  }, [sortedDispatchAttemptLogs]);

  const shipmentItems = displayShipment?.order?.orderItems ?? [];
  const shipmentItemSummary = useMemo(() => {
    if (shipmentItems.length === 0) return undefined;
    const names = shipmentItems.map((line) => line.product?.name ?? "Item").slice(0, 2);
    const extra =
      shipmentItems.length > 2 ? ` +${shipmentItems.length - 2} more` : "";
    return `${shipmentItems.length} ${shipmentItems.length === 1 ? "item" : "items"} · ${names.join(", ")}${extra}`;
  }, [shipmentItems]);

  const returnRequestSummary = useMemo(() => {
    const rr = displayShipment?.returnRequest;
    if (!rr) return "No return request";
    const parts = [rr.statusLabel];
    if (rr.itemCondition) parts.push(rr.itemCondition);
    return parts.join(" · ");
  }, [displayShipment?.returnRequest]);

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

  const handleLoadCarrierRates = () => {
    setSelectedCarrierTier(null);
    if (ratePreviewOpen) {
      void ratePreviewQuery.refetch();
      return;
    }
    setRatePreviewOpen(true);
  };

  const handleDispatchNow = async (options?: { pricingTier?: string }) => {
    if (!displayShipment?.id) return;
    const needsTier = displayShipment.manualFulfillment;
    const tier = options?.pricingTier ?? selectedCarrierTier ?? undefined;
    if (needsTier && !tier) {
      toast.error("Select a carrier rate first");
      return;
    }
    const confirmed = shipmentScheduledInFuture
      ? window.confirm(
          "Book this shipment now? The dispatch window will be pulled forward to the current slot.",
        )
      : window.confirm("Queue carrier booking for this shipment now?");
    if (!confirmed) return;
    try {
      await dispatchShipmentNow.mutateAsync({
        shipmentId: displayShipment.id,
        pricingTier: tier,
        updateWindow: shipmentScheduledInFuture,
      });
      toast.success("Carrier booking queued");
      setIsDetailModalOpen(false);
    } catch {
      toast.error("Could not queue carrier booking");
    }
  };

  const selectableCarrierTiers = carrierTiers.filter(
    (tier) => tier.name.toLowerCase() !== "relisted dispatch",
  );

  const showCarrierBookingPanel =
    displayShipment &&
    (displayShipment.status === "PENDING" ||
      displayShipment.status === "DISPATCH_FAILED") &&
    (displayShipment.manualFulfillment ||
      shipmentScheduledInFuture ||
      displayShipment.status === "DISPATCH_FAILED");

  const showSwitchToManualPanel =
    displayShipment &&
    !displayShipment.manualFulfillment &&
    !displayShipment.reconciledAsManualAt &&
    (displayShipment.status === "PENDING" ||
      displayShipment.status === "DISPATCHING" ||
      displayShipment.status === "DISPATCH_FAILED");

  const showReconcileManualPanel = showSwitchToManualPanel;

  const showMarkManualDispatchedPanel =
    Boolean(
      displayShipment?.manualFulfillment &&
        (displayShipment.status === "PENDING" ||
          displayShipment.status === "DISPATCHING"),
    );

  const showMarkDeliveredPanel =
    Boolean(
      displayShipment?.manualFulfillment &&
        (displayShipment.status === "DISPATCHED" ||
          displayShipment.status === "IN_TRANSIT"),
    );

  const showOpsPanel =
    showCarrierBookingPanel ||
    showSwitchToManualPanel ||
    showMarkManualDispatchedPanel ||
    showMarkDeliveredPanel;

  const handleSwitchToManual = async () => {
    if (!displayShipment?.id) return;
    if (
      !window.confirm(
        "Switch this leg to Relisted dispatch? Carrier booking will be skipped. Mark dispatched when the item is on the way.",
      )
    ) {
      return;
    }
    try {
      await switchShipmentToManual.mutateAsync({
        shipmentId: displayShipment.id,
        adminReconcileNote: reconcileNote.trim() || undefined,
      });
      toast.success("Switched to Relisted dispatch");
      await detailQuery.refetch();
    } catch {
      toast.error("Could not switch to Relisted dispatch");
    }
  };

  const handleReconcileManual = async () => {
    if (!displayShipment?.id) return;
    if (
      !window.confirm(
        "Mark this leg as dispatched in-house now? The carrier will not be used. What the renter paid stays the same.",
      )
    ) {
      return;
    }
    const parsedCost = reconcileActualCostNgn.trim()
      ? Math.round(Number.parseFloat(reconcileActualCostNgn) * 100)
      : undefined;
    if (
      reconcileActualCostNgn.trim() &&
      (parsedCost == null || Number.isNaN(parsedCost) || parsedCost < 0)
    ) {
      toast.error("Enter a valid actual cost in NGN, or leave it blank");
      return;
    }
    try {
      await reconcileManualShipment.mutateAsync({
        shipmentId: displayShipment.id,
        trackingId: reconcileTrackingRef.trim() || undefined,
        trackingUrl: reconcileTrackingUrl.trim() || undefined,
        actualFulfillmentCostKobo: parsedCost,
        adminReconcileNote: reconcileNote.trim() || undefined,
      });
      toast.success("Marked as dispatched. Customer notified.");
      await detailQuery.refetch();
    } catch {
      toast.error("Could not mark as dispatched");
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

      <div className="bg-white mb-4 border border-gray-200 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => setCostsOpen((open) => !open)}
          className="flex justify-between items-center gap-3 hover:bg-gray-50 px-5 py-3 w-full text-left transition-colors"
          aria-expanded={costsOpen}
        >
          <div className="flex items-center gap-2 min-w-0">
            {costsOpen ? (
              <ChevronUp className="w-4 h-4 text-gray-500 shrink-0" aria-hidden />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" aria-hidden />
            )}
            <Paragraph2 className="font-semibold text-gray-900 text-sm">Shipping costs</Paragraph2>
          </div>
          {!costsOpen && costs && costs.count > 0 && (
            <Paragraph1 className="text-gray-500 text-sm shrink-0">
              {costs.count} shipments · {koboToNaira(costs.totalKobo)}
            </Paragraph1>
          )}
        </button>

        {costsOpen && (
          <div className="px-5 py-4 border-gray-200 border-t">
            <div className="flex flex-wrap items-end gap-3 mb-4">
              <AdminFilterField label="From" className="shrink-0">
                <input
                  type="date"
                  value={costDateFrom}
                  onChange={(e) => setCostDateFrom(e.target.value)}
                  className={FILTER_DATE_CLASS}
                  aria-label="Cost scheduled from"
                />
              </AdminFilterField>

              <AdminFilterField label="To" className="shrink-0">
                <input
                  type="date"
                  value={costDateTo}
                  onChange={(e) => setCostDateTo(e.target.value)}
                  min={costDateFrom || undefined}
                  className={FILTER_DATE_CLASS}
                  aria-label="Cost scheduled to"
                />
              </AdminFilterField>

              <AdminFilterField label="Provider" className={FILTER_SELECT_WRAP_CLASS}>
                <AdminComboBox
                  value={costProvider}
                  onChange={(value) => {
                    setCostProvider(value);
                    setCostCourier("all");
                  }}
                  options={costProviderOptions}
                  ariaLabel="Shipping provider"
                />
              </AdminFilterField>

              {(costs?.couriers.length ?? 0) > 0 && (
                <AdminFilterField label="Courier" className={FILTER_SELECT_WRAP_CLASS}>
                  <AdminComboBox
                    value={costCourier}
                    onChange={setCostCourier}
                    options={costCourierOptions}
                    ariaLabel="Courier"
                  />
                </AdminFilterField>
              )}
            </div>
            {costs && costs.count > 0 ? (
              <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
                <div>
                  <Paragraph1 className="mb-2 font-medium text-gray-700 text-sm">By month</Paragraph1>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-gray-200 border-b text-gray-500 text-xs text-left uppercase">
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
                      <tr className="border-gray-200 border-b text-gray-500 text-xs text-left uppercase">
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
        <div className="px-5 py-4 border-gray-200 border-b">
          <div className="flex flex-wrap items-end gap-3">
            <AdminFilterField label="Search" className="flex-1 min-w-[12rem] basis-[12rem]">
              <div className="relative">
                <Search
                  className="top-1/2 left-3 absolute w-4 h-4 text-gray-400 -translate-y-1/2 pointer-events-none"
                  aria-hidden
                />
                <input
                  type="text"
                  placeholder="Order id or UUID…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`${FILTER_INPUT_CLASS} pl-9`}
                />
              </div>
            </AdminFilterField>

            <AdminFilterField label="Type" className={FILTER_SELECT_WRAP_CLASS}>
              <AdminComboBox
                value={typeFilter}
                onChange={(value) => setTypeFilter(value as ShipmentType | "All")}
                options={TYPE_FILTER_OPTIONS}
                ariaLabel="Shipment type"
              />
            </AdminFilterField>

            <AdminFilterField label="Fulfillment" className="w-[10.5rem] shrink-0">
              <AdminComboBox
                value={fulfillmentFilter}
                onChange={(value) =>
                  setFulfillmentFilter(value as FulfillmentFilter)
                }
                options={[...FULFILLMENT_FILTER_OPTIONS]}
                ariaLabel="Fulfillment"
              />
            </AdminFilterField>

            <AdminFilterField label="Status" className={FILTER_SELECT_WRAP_CLASS}>
              <AdminComboBox
                value={statusFilter}
                onChange={(value) =>
                  setStatusFilter(value as ShipmentStatus | "All")
                }
                options={STATUS_FILTER_OPTIONS}
                ariaLabel="Status"
              />
            </AdminFilterField>

            <AdminFilterField label="From" className="shrink-0">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className={FILTER_DATE_CLASS}
                aria-label="Scheduled from"
              />
            </AdminFilterField>

            <AdminFilterField label="To" className="shrink-0">
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                min={dateFrom || undefined}
                className={FILTER_DATE_CLASS}
                aria-label="Scheduled to"
              />
            </AdminFilterField>
          </div>
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
                    <th className="px-5 py-3 text-left">
                      <Paragraph1 className="font-semibold text-gray-600 text-xs uppercase tracking-wide">
                        Item
                      </Paragraph1>
                    </th>
                    <th className="px-5 py-3 text-left">
                      <Paragraph1 className="font-semibold text-gray-600 text-xs uppercase tracking-wide">
                        Reference
                      </Paragraph1>
                    </th>
                    <th className="px-5 py-3 text-left">
                      <Paragraph1 className="font-semibold text-gray-600 text-xs uppercase tracking-wide">
                        Order
                      </Paragraph1>
                    </th>
                    <th className="px-5 py-3 text-left">
                      <Paragraph1 className="font-semibold text-gray-600 text-xs uppercase tracking-wide">
                        Type
                      </Paragraph1>
                    </th>
                    <th className="px-5 py-3 text-left">
                      <Paragraph1 className="font-semibold text-gray-600 text-xs uppercase tracking-wide">
                        Status
                      </Paragraph1>
                    </th>
                    <th className="px-5 py-3 text-left">
                      <Paragraph1 className="font-semibold text-gray-600 text-xs uppercase tracking-wide">
                        Scheduled
                      </Paragraph1>
                    </th>
                    <th className="px-5 py-3 text-left">
                      <Paragraph1 className="font-semibold text-gray-600 text-xs uppercase tracking-wide">
                        Cost
                      </Paragraph1>
                    </th>
                    <th className="px-5 py-3 text-left">
                      <Paragraph1 className="font-semibold text-gray-600 text-xs uppercase tracking-wide">
                        Tracking
                      </Paragraph1>
                    </th>
                    <th className="px-5 py-3 text-left">
                      <Paragraph1 className="font-semibold text-gray-600 text-xs uppercase tracking-wide">
                        Customer
                      </Paragraph1>
                    </th>
                    <th className="px-5 py-3 text-left">
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
                        <td className="px-5 py-3">
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
                        <td className="px-5 py-3">
                          <span title={shipment.id}>
                            <Paragraph1 className="font-medium text-gray-900 text-sm">
                              {shortenId(shipment.id)}
                            </Paragraph1>
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <Paragraph1 className="font-medium text-gray-900 text-sm">
                            {humanOrderId}
                          </Paragraph1>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex flex-col items-start gap-1">
                            <span className="inline-block bg-gray-100 px-3 py-1 rounded-full font-semibold text-gray-700 text-xs">
                              {getShipmentLegDisplayLabel(shipment.type)}
                            </span>
                            {shipment.manualFulfillment && (
                              <span className="inline-block bg-amber-100 px-2 py-0.5 rounded font-medium text-[10px] text-amber-900 uppercase tracking-wide">
                                Relisted dispatch
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3">
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
                        <td className="px-5 py-3">
                          <Paragraph1 className="text-gray-700 text-sm">
                            {shipment.scheduledDate
                              ? formatLagosDate(shipment.scheduledDate)
                              : "—"}
                          </Paragraph1>
                        </td>
                        <td className="px-5 py-3">
                          <Paragraph1 className="font-medium text-gray-900 text-sm">
                            {formatShipmentRowCost(shipment)}
                          </Paragraph1>
                        </td>
                        <td className="px-5 py-3">
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
                        <td className="px-5 py-3">
                          <Paragraph1 className="text-gray-700 text-sm">
                            {shipment.order?.user?.name ||
                              shipment.order?.user?.email ||
                              "—"}
                          </Paragraph1>
                        </td>
                        <td className="px-5 py-3">
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
            <div className="p-5 border-gray-200 border-b">
              <div className="flex justify-between items-start gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2
                      id="shipment-detail-title"
                      className="font-bold text-gray-900 text-lg leading-tight"
                    >
                      {getShipmentLegDisplayLabel(displayShipment.type)}
                    </h2>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(
                        displayShipment.status,
                      )}`}
                    >
                      {getStatusLabel(displayShipment.status, displayShipment.type)}
                    </span>
                    {displayShipment.reconciledAsManualAt ? (
                      <span className="inline-flex items-center bg-gray-100 px-2 py-0.5 rounded-full font-medium text-gray-700 text-xs">
                        Manually dispatched
                      </span>
                    ) : null}
                    {displayShipment.manualFulfillment && !displayShipment.reconciledAsManualAt ? (
                      <span className="inline-flex items-center bg-amber-100 px-2 py-0.5 rounded-full font-medium text-amber-900 text-xs">
                        Relisted dispatch
                      </span>
                    ) : null}
                  </div>
                  <Paragraph1 className="mt-1 font-medium text-gray-900 text-sm">
                    {displayShipment.order?.orderId ?? "—"}
                  </Paragraph1>
                  <Paragraph1 className="mt-0.5 text-gray-600 text-sm truncate">
                    {displayShipment.order?.user?.name || "—"}
                    {displayShipment.order?.user?.email
                      ? ` · ${displayShipment.order.user.email}`
                      : ""}
                  </Paragraph1>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDetailModalOpen(false)}
                  className="hover:bg-gray-100 p-1 rounded-lg text-gray-500 hover:text-gray-700 shrink-0"
                  aria-label="Close"
                >
                  <XCircle size={24} />
                </button>
              </div>
            </div>
            <div className="space-y-4 p-5">
              <div className="space-y-2 bg-gray-50 p-4 border border-gray-100 rounded-lg text-sm">
                {dispatchWindowLabel ? (
                  <div className="flex gap-2">
                    <span className="w-20 text-gray-500 shrink-0">Window</span>
                    <span className="text-gray-900">{dispatchWindowLabel}</span>
                  </div>
                ) : null}
                {dispatchedAtLabel ? (
                  <div className="flex gap-2">
                    <span className="w-20 text-gray-500 shrink-0">Dispatched</span>
                    <span className="text-gray-900">{dispatchedAtLabel}</span>
                  </div>
                ) : null}
                <div className="flex gap-2">
                  <span className="w-20 text-gray-500 shrink-0">Carrier</span>
                  <span className="text-gray-900 break-all">
                    {formatAdminPricingTier(displayShipment.pricingTier)}
                  </span>
                </div>
                {displayShipment.trackingId || displayShipment.providerTrackingUrl ? (
                  <div className="flex gap-2">
                    <span className="w-20 text-gray-500 shrink-0">Tracking</span>
                    <span className="text-gray-900">
                      {displayShipment.trackingId ? (
                        <span className="break-all">{displayShipment.trackingId}</span>
                      ) : null}
                      {displayShipment.providerTrackingUrl ? (
                        <a
                          href={displayShipment.providerTrackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-1 text-blue-600 hover:underline${displayShipment.trackingId ? " ml-2" : ""}`}
                        >
                          <ExternalLink size={14} />
                          Track
                        </a>
                      ) : null}
                    </span>
                  </div>
                ) : null}
                <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-gray-600 text-xs">
                  <span>Charged {koboToNaira(displayShipment.shipmentCharge)}</span>
                  {showPickupFeeRow ? (
                    <span>Pickup {koboToNaira(displayShipment.pickupCharge)}</span>
                  ) : null}
                  <span>VAT {koboToNaira(displayShipment.vatCharge)}</span>
                  {displayShipment.actualFulfillmentCostKobo != null ? (
                    <span>
                      Actual {koboToNaira(displayShipment.actualFulfillmentCostKobo)}
                    </span>
                  ) : null}
                </div>
                {displayShipment.adminReconcileNote ? (
                  <Paragraph1 className="pt-1 text-gray-600 text-xs">
                    Note: {displayShipment.adminReconcileNote}
                  </Paragraph1>
                ) : null}
              </div>

              {showOpsPanel && (
                <div className="space-y-4 bg-gray-50 p-4 border border-gray-100 rounded-lg">
                  <Paragraph1 className="text-gray-500 text-xs">Admin actions</Paragraph1>

                  {showCarrierBookingPanel && (
                    <div className="space-y-3">
                      <Paragraph1 className="text-gray-600 text-sm">
                        {displayShipment.manualFulfillment
                          ? "Book with a carrier instead of fulfilling manually."
                          : shipmentScheduledInFuture
                            ? "Book now and pull the dispatch window forward."
                            : "Load fresh rates or retry with the current tier."}
                      </Paragraph1>

                      {shipmentScheduledInFuture && (
                        <fieldset className="space-y-2">
                          <legend className="mb-1 font-medium text-gray-700 text-sm">
                           Get shipping rates for                           
                           </legend>
                          <div className="space-y-2">
                            <label className="flex items-start gap-2.5 text-gray-700 text-sm cursor-pointer">
                              <input
                                type="radio"
                                name={`rate-quote-${displayShipment.id}`}
                                checked={rateForImmediate}
                                onChange={() => {
                                  setRateForImmediate(true);
                                  setSelectedCarrierTier(null);
                                }}
                                className="mt-0.5 border-gray-300"
                              />
                              <span>
                                <span className="font-medium text-gray-900">Today</span>
                                <span className="block text-gray-500 text-xs">
                                  Get it delivered today
                                </span>
                              </span>
                            </label>
                            <label className="flex items-start gap-2.5 text-gray-700 text-sm cursor-pointer">
                              <input
                                type="radio"
                                name={`rate-quote-${displayShipment.id}`}
                                checked={!rateForImmediate}
                                onChange={() => {
                                  setRateForImmediate(false);
                                  setSelectedCarrierTier(null);
                                }}
                                className="mt-0.5 border-gray-300"
                              />
                              <span>
                                <span className="font-medium text-gray-900">
                                  Original scheduled window
                                </span>
                                <span className="block text-gray-500 text-xs">
                                  Get it delivered on {scheduledRateQuoteDetail}
                                </span>
                              </span>
                            </label>
                          </div>
                        </fieldset>
                      )}

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={handleLoadCarrierRates}
                          disabled={ratesLoading}
                          className={ADMIN_SECONDARY_BTN}
                        >
                          {ratesLoading ? (
                            <span className="inline-flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                              Loading…
                            </span>
                          ) : (
                            "Load rates"
                          )}
                        </button>
                        {!displayShipment.manualFulfillment && (
                          <button
                            type="button"
                            onClick={() => {
                              void handleDispatchNow();
                            }}
                            disabled={dispatchShipmentNow.isPending}
                            className={ADMIN_PRIMARY_BTN}
                          >
                            {dispatchShipmentNow.isPending
                              ? "Queueing…"
                              : shipmentScheduledInFuture
                                ? "Dispatch now"
                                : "Retry dispatch"}
                          </button>
                        )}
                      </div>

                      {ratePreviewOpen && ratesLoading && (
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                          <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                          Fetching carrier rates…
                        </div>
                      )}

                      {ratePreviewOpen && !ratesLoading && ratePreviewQuery.isError && (
                        <Paragraph1 className="text-red-700 text-sm">
                          Could not load rates.
                        </Paragraph1>
                      )}

                      {ratePreview && !ratesLoading && (
                        <div className="space-y-3 pt-1">
                          <Paragraph1 className="text-gray-500 text-xs">
                            Renter paid {koboToNaira(ratePreview.renterChargedKobo)}
                            {ratePreview.forImmediate ? " · today" : ""}
                          </Paragraph1>
                          {ratePreview.warnings.length > 0 && (
                            <ul className="space-y-1 text-amber-900 text-xs">
                              {ratePreview.warnings.map((w) => (
                                <li key={`${w.provider}-${w.message}`}>{w.message}</li>
                              ))}
                            </ul>
                          )}
                          {selectableCarrierTiers.length === 0 ? (
                            <Paragraph1 className="text-gray-500 text-sm">
                              No carrier rates available.
                            </Paragraph1>
                          ) : (
                            <div className="gap-2 grid grid-cols-1 sm:grid-cols-2">
                              {selectableCarrierTiers.map((tier: ShipmentRateTier) => (
                                <label
                                  key={tier.pricingTier}
                                  className={`flex items-start gap-2.5 p-3 border rounded-lg cursor-pointer transition ${
                                    selectedCarrierTier === tier.pricingTier
                                      ? "border-gray-900 bg-white"
                                      : "border-gray-200 bg-white/80 hover:border-gray-300"
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name="carrier-tier"
                                    checked={selectedCarrierTier === tier.pricingTier}
                                    onChange={() => setSelectedCarrierTier(tier.pricingTier)}
                                    className="mt-0.5"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <Paragraph1 className="font-medium text-gray-900 text-sm">
                                      {tier.name}
                                    </Paragraph1>
                                    <Paragraph1 className="text-gray-500 text-xs">
                                      {koboToNaira(tier.totalCostKobo)} ·{" "}
                                      {formatRateDelta(tier.deltaKobo)}
                                    </Paragraph1>
                                  </div>
                                </label>
                              ))}
                            </div>
                          )}
                          {selectableCarrierTiers.length > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                void handleDispatchNow();
                              }}
                              disabled={
                                dispatchShipmentNow.isPending || !selectedCarrierTier
                              }
                              className={ADMIN_PRIMARY_BTN}
                            >
                              {dispatchShipmentNow.isPending
                                ? "Queueing…"
                                : "Book selected rate"}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {showCarrierBookingPanel && showSwitchToManualPanel && (
                    <div className="border-gray-200 border-t" />
                  )}

                  {showSwitchToManualPanel && (
                    <div className="space-y-3">
                      <Paragraph1 className="text-gray-600 text-sm">
                        Fulfilling in-house instead of the carrier?
                      </Paragraph1>
                      <button
                        type="button"
                        onClick={() => {
                          void handleSwitchToManual();
                        }}
                        disabled={switchShipmentToManual.isPending}
                        className={ADMIN_SECONDARY_BTN}
                      >
                        {switchShipmentToManual.isPending
                          ? "Switching…"
                          : "Switch to Relisted dispatch"}
                      </button>
                      <Paragraph1 className="text-gray-500 text-xs">
                        Stops carrier booking and keeps this leg pending until you mark
                        dispatched. What the renter paid stays the same.
                      </Paragraph1>

                      <details className="group pt-1">
                        <summary className="[&::-webkit-details-marker]:hidden font-medium text-gray-800 text-sm cursor-pointer list-none">
                          <span className="inline-flex items-center gap-1.5">
                            <ChevronDown
                              size={16}
                              className="text-gray-500 group-open:rotate-180 transition"
                            />
                            Already sent in-house?
                          </span>
                        </summary>
                        <div className="space-y-3 mt-3 pl-5">
                          <Paragraph1 className="text-gray-500 text-xs">
                            Use when the item is already on the way and you want to mark
                            dispatched now without waiting on the carrier.
                          </Paragraph1>
                          <div className="gap-3 grid grid-cols-1 sm:grid-cols-2">
                            <label className="block">
                              <Paragraph1 className="mb-1 text-gray-500 text-xs">
                                Reference
                              </Paragraph1>
                              <input
                                type="text"
                                value={reconcileTrackingRef}
                                onChange={(e) => setReconcileTrackingRef(e.target.value)}
                                className={ADMIN_FIELD_INPUT_CLASS}
                                placeholder="Optional"
                              />
                            </label>
                            <label className="block">
                              <Paragraph1 className="mb-1 text-gray-500 text-xs">
                                Tracking URL
                              </Paragraph1>
                              <input
                                type="url"
                                value={reconcileTrackingUrl}
                                onChange={(e) => setReconcileTrackingUrl(e.target.value)}
                                className={ADMIN_FIELD_INPUT_CLASS}
                                placeholder="https://…"
                              />
                            </label>
                            <label className="block">
                              <Paragraph1 className="mb-1 text-gray-500 text-xs">
                                Actual cost (NGN)
                              </Paragraph1>
                              <input
                                type="number"
                                min="0"
                                step="1"
                                value={reconcileActualCostNgn}
                                onChange={(e) => setReconcileActualCostNgn(e.target.value)}
                                className={ADMIN_FIELD_INPUT_CLASS}
                                placeholder="Optional"
                              />
                            </label>
                            <label className="block sm:col-span-2">
                              <Paragraph1 className="mb-1 text-gray-500 text-xs">
                                Internal note
                              </Paragraph1>
                              <textarea
                                value={reconcileNote}
                                onChange={(e) => setReconcileNote(e.target.value)}
                                rows={2}
                                className={ADMIN_FIELD_INPUT_CLASS}
                                placeholder="Optional"
                              />
                            </label>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              void handleReconcileManual();
                            }}
                            disabled={reconcileManualShipment.isPending}
                            className={ADMIN_PRIMARY_BTN}
                          >
                            {reconcileManualShipment.isPending
                              ? "Saving…"
                              : "Mark dispatched"}
                          </button>
                        </div>
                      </details>
                    </div>
                  )}

                  {(showCarrierBookingPanel || showSwitchToManualPanel) &&
                    (showMarkManualDispatchedPanel || showMarkDeliveredPanel) && (
                    <div className="border-gray-200 border-t" />
                  )}

                  {showMarkManualDispatchedPanel && (
                    <div className="space-y-3">
                      <Paragraph1 className="text-gray-600 text-sm">
                        Mark dispatched when the item is on the way.
                      </Paragraph1>
                      <div className="gap-3 grid grid-cols-1 sm:grid-cols-2">
                        <label className="block">
                          <Paragraph1 className="mb-1 text-gray-500 text-xs">
                            Reference
                          </Paragraph1>
                          <input
                            type="text"
                            value={manualTrackingRef}
                            onChange={(e) => setManualTrackingRef(e.target.value)}
                            className={ADMIN_FIELD_INPUT_CLASS}
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
                            className={ADMIN_FIELD_INPUT_CLASS}
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
                        className={ADMIN_PRIMARY_BTN}
                      >
                        {completeManualShipment.isPending ? "Saving…" : "Mark dispatched"}
                      </button>
                    </div>
                  )}

                  {showMarkDeliveredPanel && (
                    <button
                      type="button"
                      onClick={() => {
                        void handleMarkManualDelivered();
                      }}
                      disabled={markManualDelivered.isPending}
                      className={ADMIN_PRIMARY_BTN}
                    >
                      {markManualDelivered.isPending ? "Saving…" : "Mark delivered"}
                    </button>
                  )}
                </div>
              )}

              {shipmentItemSummary ? (
                <ShipmentModalSection
                  title="Items"
                  summary={shipmentItemSummary}
                  defaultOpen
                >
                  <ul className="space-y-4">
                    {shipmentItems.map((line) => {
                      const name = line.product?.name ?? "Item";
                      const thumb = shipmentLineItemThumbnailUrl(line);
                      const metadata = shipmentLineItemMetadata(line);
                      return (
                        <li
                          key={line.id ?? name}
                          className="bg-gray-50 p-3 border border-gray-100 rounded-lg"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-14 h-14 shrink-0">
                              <AdminListingThumb url={thumb} alt={name} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <Paragraph1 className="font-medium text-gray-900 text-sm">
                                {name}
                              </Paragraph1>
                              {metadata.length > 0 ? (
                                <dl className="gap-x-4 gap-y-1.5 grid grid-cols-1 sm:grid-cols-2 mt-2">
                                  {metadata.map((row) => (
                                    <div key={row.label}>
                                      <dt className="text-gray-500 text-xs">{row.label}</dt>
                                      <dd className="text-gray-800 text-sm">{row.value}</dd>
                                    </div>
                                  ))}
                                </dl>
                              ) : (
                                <Paragraph1 className="mt-1 text-gray-500 text-xs">
                                  No listing details available
                                </Paragraph1>
                              )}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </ShipmentModalSection>
              ) : null}

              <ShipmentModalSection title="Shipment details" summary={shipmentDetailsSummary}>
                <div className="space-y-4">
                  <div className="gap-4 grid grid-cols-1 sm:grid-cols-2">
                    <DetailField label="Carrier / tier">
                      <Paragraph1 className="font-medium text-gray-900 text-sm break-all">
                        {formatAdminPricingTier(displayShipment.pricingTier)}
                      </Paragraph1>
                    </DetailField>
                    <DetailField label="Pickup partner">
                      <Paragraph1 className="font-medium text-gray-900 text-sm">
                        {displayShipment.pickupPartner ?? "—"}
                      </Paragraph1>
                    </DetailField>
                    <DetailField label="Delivery address" className="sm:col-span-2">
                      <Paragraph1 className="font-medium text-gray-900 text-sm">
                        {formatCheckoutDeliveryStreetLine(displayShipment)}
                      </Paragraph1>
                    </DetailField>
                    <DetailField label="Partner pickup booking" className="sm:col-span-2">
                      <Paragraph1 className="font-medium text-gray-900 text-sm break-all">
                        {displayShipment.pickupId ?? "—"}
                      </Paragraph1>
                    </DetailField>
                    {(displayShipment.trackingId || displayShipment.providerTrackingUrl) && (
                      <DetailField label="Tracking" className="sm:col-span-2">
                        <Paragraph1 className="font-medium text-gray-900 text-sm">
                          {displayShipment.trackingId ? (
                            <span className="break-all">{displayShipment.trackingId}</span>
                          ) : null}
                          {displayShipment.providerTrackingUrl ? (
                            <a
                              href={displayShipment.providerTrackingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`inline-flex items-center gap-1 text-blue-600 hover:underline${displayShipment.trackingId ? " ml-2" : ""}`}
                            >
                              <ExternalLink size={14} />
                              Track
                            </a>
                          ) : null}
                        </Paragraph1>
                      </DetailField>
                    )}
                    <DetailField label="Dispatch attempts (latest run)">
                      <Paragraph1 className="font-medium text-gray-900 text-sm">
                        {displayShipment.dispatchAttempts ?? 0}
                      </Paragraph1>
                      <Paragraph1 className="mt-0.5 text-gray-500 text-xs">
                        Resets after Redispatch.
                      </Paragraph1>
                    </DetailField>
                    <DetailField label="Charged (NGN)">
                      <Paragraph1 className="font-medium text-gray-900 text-sm">
                        {koboToNaira(displayShipment.shipmentCharge)}
                        {showPickupFeeRow
                          ? ` · pickup ${koboToNaira(displayShipment.pickupCharge)}`
                          : ""}
                        {` · VAT ${koboToNaira(displayShipment.vatCharge)}`}
                      </Paragraph1>
                    </DetailField>
                    {displayShipment.actualFulfillmentCostKobo != null ? (
                      <DetailField label="Actual cost (NGN)">
                        <Paragraph1 className="font-medium text-gray-900 text-sm">
                          {koboToNaira(displayShipment.actualFulfillmentCostKobo)}
                        </Paragraph1>
                      </DetailField>
                    ) : null}
                    {displayShipment.adminReconcileNote ? (
                      <DetailField label="Internal note" className="sm:col-span-2">
                        <Paragraph1 className="font-medium text-gray-900 text-sm">
                          {displayShipment.adminReconcileNote}
                        </Paragraph1>
                      </DetailField>
                    ) : null}
                  </div>

                  <div className="space-y-3 pt-1 border-gray-100 border-t">
                    <div>
                      <Paragraph1 className="flex items-center gap-1 mb-1.5 text-gray-500 text-xs">
                        <Package size={12} />
                        {detailPartyLabels.pickupHeading}
                      </Paragraph1>
                      <Paragraph1 className="bg-gray-50 p-3 border border-gray-100 rounded-lg text-gray-800 text-sm">
                        {formatAddress(displayShipment.pickupAddress)}
                      </Paragraph1>
                    </div>
                    <div>
                      <Paragraph1 className="flex items-center gap-1 mb-1.5 text-gray-500 text-xs">
                        <Truck size={12} />
                        {detailPartyLabels.deliveryHeading}
                      </Paragraph1>
                      <Paragraph1 className="bg-gray-50 p-3 border border-gray-100 rounded-lg text-gray-800 text-sm">
                        {formatAddress(displayShipment.deliveryAddress)}
                      </Paragraph1>
                    </div>
                  </div>
                </div>
              </ShipmentModalSection>

              <ShipmentModalSection title="Delivery window" summary={deliveryWindowSummary}>
                <div className="gap-4 grid grid-cols-1 sm:grid-cols-2">
                  <DetailField label="Scheduled date (Lagos)">
                    <Paragraph1 className="font-medium text-gray-900 text-sm">
                      {displayShipment.scheduledDate
                        ? formatLagosDate(displayShipment.scheduledDate, {
                            includeWeekday: true,
                          })
                        : "—"}
                    </Paragraph1>
                  </DetailField>
                  <DetailField label="Dispatch window">
                    <Paragraph1 className="font-medium text-gray-900 text-sm">
                      {dispatchWindowLabel ?? "—"}
                    </Paragraph1>
                  </DetailField>
                  <DetailField label="Dispatched at">
                    <Paragraph1 className="font-medium text-gray-900 text-sm">
                      {dispatchedAtLabel ?? "—"}
                    </Paragraph1>
                  </DetailField>
                </div>
              </ShipmentModalSection>

              {displayShipment.type === "RETURN" ? (
                <ShipmentModalSection title="Return request" summary={returnRequestSummary}>
                  <ReturnRequestSection
                    returnRequest={displayShipment.returnRequest}
                    visible
                    embedded
                  />
                </ShipmentModalSection>
              ) : null}

              <ShipmentModalSection title="Dispatch history" summary={dispatchHistorySummary}>
                {sortedDispatchAttemptLogs.length === 0 ? (
                  <Paragraph1 className="text-gray-500 text-sm">No attempts recorded yet.</Paragraph1>
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
              </ShipmentModalSection>

              <div className="flex sm:flex-row flex-col gap-3 pt-2 border-gray-200 border-t">
                {displayShipment.status === "DISPATCH_FAILED" &&
                  !displayShipment.manualFulfillment &&
                  !showCarrierBookingPanel && (
                  <button
                    type="button"
                    onClick={() => {
                      handleRedispatchShipment(displayShipment.id);
                    }}
                    disabled={redispatchShipment.isPending}
                    className={`flex-1 ${ADMIN_PRIMARY_BTN}`}
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
