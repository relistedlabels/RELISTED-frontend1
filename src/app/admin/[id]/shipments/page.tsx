// ENDPOINTS: GET /shipments, GET /shipments/costs, GET /shipments/:id, GET /shipments/:id/tracking,
// GET /orders/:orderId/shipments, POST /shipments/:id/cancel, POST /shipments/:id/redispatch,
// POST /shipments/:id/manual-complete, POST /shipments/:id/manual-delivered (mark leg completed),
// GET /shipments/:id/rate-preview, POST /shipments/:id/dispatch-now,
// POST /shipments/:id/reconcile-manual

"use client";

import React, { Suspense, useMemo, useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Paragraph1, Paragraph2 } from "@/common/ui/Text";
import {
  ResponsiveDataTable,
  type ResponsiveColumnDef,
} from "@/common/ui/ResponsiveDataTable";
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
  useAdminShipmentRatePreview,
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
import {
  ADMIN_SHIPMENT_CHIP_CLASS,
  ADMIN_RATE_PREVIEW_PROVIDER_LABEL,
  formatAdminPricingTier,
  formatShippingQuoteWarningMessage,
  RELISTED_DISPATCH_BADGE_CLASS,
} from "@/lib/admin/shipmentDisplay";
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
import {
  AdminFilterButton,
  AdminFilterDrawer,
} from "@/app/admin/components/AdminFilterDrawer";
import {
  ADMIN_FILTER_BAR_CLASS,
  ADMIN_FILTER_DATE_CLASS,
  ADMIN_FILTER_INPUT_CLASS,
  DISPATCH_FILTER_LABEL,
  DISPATCH_FILTER_OPTIONS,
  type DispatchFilter,
} from "@/lib/admin/adminListFilters";
import ActionConfirmModal from "@/common/layer/ActionConfirmModal";

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

function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value.trim());
}

/** Maps admin URL/rider input to API tracking fields. */
function parseAdminTrackingContact(
  urlOrRider: string,
): { trackingId?: string; trackingUrl?: string } {
  const contact = urlOrRider.trim();
  if (!contact) return {};
  if (isHttpUrl(contact)) return { trackingUrl: contact };
  return { trackingId: contact };
}

function ShipmentTrackingContact({
  trackingId,
  providerTrackingUrl,
  linkClassName = "inline-flex items-center gap-1 text-blue-600 hover:underline",
  linkOnClick,
}: {
  trackingId?: string | null;
  providerTrackingUrl?: string | null;
  linkClassName?: string;
  linkOnClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  const id = trackingId?.trim();
  const contact = providerTrackingUrl?.trim();

  if (!id && !contact) return null;

  return (
    <span className="inline-flex min-w-0 max-w-full items-center gap-2 whitespace-nowrap">
      {id ? (
        <span
          className="truncate font-mono text-xs text-gray-900 tabular-nums"
          title={id}
        >
          {id}
        </span>
      ) : null}
      {contact ? (
        isHttpUrl(contact) ? (
          <a
            href={contact}
            target="_blank"
            rel="noopener noreferrer"
            onClick={linkOnClick}
            className={`${linkClassName} shrink-0`}
          >
            <ExternalLink size={14} />
            Track
          </a>
        ) : (
          <span className="shrink-0 text-gray-900">{contact}</span>
        )
      ) : null}
    </span>
  );
}

const ADMIN_TRACKING_CONTACT_PLACEHOLDER = "Paste a tracking link or rider phone no.";

function isShipmentScheduledInFuture(shipment: Shipment): boolean {
  const now = Date.now();
  const start = shipment.scheduledWindowStart
    ? new Date(shipment.scheduledWindowStart).getTime()
    : new Date(shipment.scheduledDate).getTime();
  return start > now;
}

type ShipmentConfirmAction =
  | { type: "cancel"; shipmentId: string }
  | { type: "redispatch"; shipmentId: string }
  | { type: "markCompleted" }
  | { type: "dispatchNow"; pricingTier?: string }
  | { type: "switchToManual" }
  | { type: "reconcileManual" };

function getDispatchNowConfirmCopy(options: {
  shipmentScheduledInFuture: boolean;
  rateForImmediate: boolean;
  scheduledRateQuoteDetail: string;
}): { title: string; description: string; actionLabel: string } {
  if (!options.shipmentScheduledInFuture) {
    return {
      title: "Book with carrier",
      description: "Start carrier booking for this shipment now?",
      actionLabel: "Book with carrier",
    };
  }
  if (options.rateForImmediate) {
    return {
      title: "Book for today",
      description: "Book this shipment for delivery today?",
      actionLabel: "Book for today",
    };
  }
  return {
    title: "Book for scheduled window",
    description: `Book this shipment for ${options.scheduledRateQuoteDetail}?`,
    actionLabel: "Book for scheduled window",
  };
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
      return "bg-gray-100 text-gray-800";
    case "DISPATCHING":
      return "bg-blue-100 text-blue-800";
    case "DISPATCH_FAILED":
      return "bg-red-100 text-red-800";
    case "DISPATCHED":
      return "bg-indigo-100 text-indigo-900";
    case "IN_TRANSIT":
      return "bg-purple-100 text-purple-900";
    case "COMPLETED":
      return "bg-green-100 text-green-900";
    case "CANCELLED":
      return "bg-gray-200 text-gray-700";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

function ShipmentStatusBadge({
  status,
  type,
}: {
  status: ShipmentStatus;
  type?: ShipmentType;
}) {
  const StatusIcon = getStatusIcon(status);
  const label = getStatusLabel(status, type);
  return (
    <span
      className={`${ADMIN_SHIPMENT_CHIP_CLASS} gap-1.5 ${getStatusColor(status)}`}
      title={label}
    >
      <StatusIcon
        size={13}
        className={`shrink-0 ${status === "DISPATCHING" ? "animate-spin" : ""}`}
        aria-hidden
      />
      {label}
    </span>
  );
}

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

function buildShipmentListColumns(handlers: {
  onViewDetails: (shipment: Shipment) => void;
  onRedispatch: (shipmentId: string) => void;
  onCancel: (shipmentId: string) => void;
  redispatchPending: boolean;
  cancelPending: boolean;
}): ResponsiveColumnDef<Shipment>[] {
  return [
    {
      id: "item",
      header: "Item",
      mobile: "thumbnail",
      render: (shipment) => {
        const itemThumb = firstShipmentItemThumbnail(shipment);
        const firstItemName =
          shipment.order?.orderItems?.[0]?.product?.name ?? "Item";
        return (
          <div className="h-12 w-12 shrink-0" title={firstItemName}>
            <AdminListingThumb url={itemThumb} alt={firstItemName} />
          </div>
        );
      },
    },
    {
      id: "reference",
      header: "Reference",
      mobile: "detail",
      render: (shipment) => (
        <span
          className="font-mono text-xs font-medium tabular-nums text-gray-900"
          title={shipment.id}
        >
          {shortenId(shipment.id)}
        </span>
      ),
    },
    {
      id: "order",
      header: "Order",
      mobile: "primary",
      render: (shipment) => {
        const humanOrderId = shipment.order?.orderId ?? "—";
        return (
          <span
            className="block max-w-[14rem] truncate text-sm font-medium text-gray-900"
            title={humanOrderId !== "—" ? humanOrderId : undefined}
          >
            {humanOrderId}
          </span>
        );
      },
    },
    {
      id: "type",
      header: "Type",
      mobile: "detail",
      renderMobile: (shipment) => (
        <div className="flex flex-col items-start gap-1.5 text-sm text-gray-900">
          <span>{getShipmentLegDisplayLabel(shipment.type)}</span>
          {shipment.manualFulfillment ? (
            <span className="text-xs font-medium text-gray-500">
              Relisted dispatch
            </span>
          ) : null}
        </div>
      ),
      render: (shipment) => (
        <div className="flex min-w-[9.5rem] flex-col items-start gap-1.5">
          <span className={`${ADMIN_SHIPMENT_CHIP_CLASS} bg-gray-100 text-gray-800`}>
            {getShipmentLegDisplayLabel(shipment.type)}
          </span>
          {shipment.manualFulfillment ? (
            <span className={RELISTED_DISPATCH_BADGE_CLASS}>Relisted dispatch</span>
          ) : null}
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      mobile: "badge",
      render: (shipment) => (
        <ShipmentStatusBadge status={shipment.status} type={shipment.type} />
      ),
    },
    {
      id: "scheduled",
      header: "Scheduled",
      mobile: "detail",
      render: (shipment) => (
        <Paragraph1 className="text-sm text-gray-700">
          {shipment.scheduledDate
            ? formatLagosDate(shipment.scheduledDate)
            : "—"}
        </Paragraph1>
      ),
    },
    {
      id: "cost",
      header: "Cost",
      mobile: "detail",
      render: (shipment) => (
        <Paragraph1 className="text-sm font-medium text-gray-900">
          {formatShipmentRowCost(shipment)}
        </Paragraph1>
      ),
    },
    {
      id: "tracking",
      header: "Tracking",
      mobile: "detail",
      render: (shipment) =>
        shipment.trackingId || shipment.providerTrackingUrl ? (
          <ShipmentTrackingContact
            trackingId={shipment.trackingId}
            providerTrackingUrl={shipment.providerTrackingUrl}
            linkClassName="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline"
          />
        ) : (
          <span className="text-sm text-gray-500">—</span>
        ),
    },
    {
      id: "customer",
      header: "Customer",
      mobile: "detail",
      render: (shipment) => (
        <Paragraph1 className="text-sm text-gray-700">
          {shipment.order?.user?.name ||
            shipment.order?.user?.email ||
            "—"}
        </Paragraph1>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      mobile: "hidden",
      render: (shipment) => (
        <div className="flex items-center gap-2">
          {shipment.status === "DISPATCH_FAILED" && !shipment.manualFulfillment ? (
            <button
              type="button"
              onClick={() => handlers.onRedispatch(shipment.id)}
              disabled={handlers.redispatchPending}
              className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50 disabled:opacity-50"
              title="Retry booking (failed only)"
            >
              <RefreshCw size={16} />
            </button>
          ) : null}
          {shipment.status === "PENDING" ? (
            <button
              type="button"
              onClick={() => handlers.onCancel(shipment.id)}
              disabled={handlers.cancelPending}
              className="rounded-lg p-2 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
              title="Cancel (pending only)"
            >
              <XCircle size={16} />
            </button>
          ) : null}
        </div>
      ),
    },
  ];
}

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

const ADMIN_FIELD_INPUT_CLASS = ADMIN_FILTER_INPUT_CLASS;

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
    <details
      className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:border-gray-300 hover:shadow-md open:border-gray-300"
      open={defaultOpen}
    >
      <summary className="flex list-none cursor-pointer items-center justify-between gap-3 bg-gray-50/70 px-4 py-3.5 transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gray-400 [&::-webkit-details-marker]:hidden">
        <div className="min-w-0 flex-1">
          <Paragraph1 className="font-semibold text-gray-900 text-sm">
            {title}
          </Paragraph1>
          {summary ? (
            <Paragraph1 className="mt-1 line-clamp-2 text-gray-600 text-xs leading-relaxed sm:line-clamp-1">
              {summary}
            </Paragraph1>
          ) : null}
        </div>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors group-hover:border-gray-300 group-hover:text-gray-700 group-open:bg-gray-100">
          <ChevronDown
            size={17}
            className="transition-transform group-open:rotate-180"
            aria-hidden
          />
        </span>
      </summary>
      <div className="space-y-4 border-t border-gray-100 bg-white px-4 py-4 sm:px-5">
        {children}
      </div>
    </details>
  );
}

function RateQuoteOptionCard({
  selected,
  onSelect,
  title,
  description,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`p-3 border rounded-lg text-left transition ${
        selected
          ? "border-gray-900 bg-gray-50 ring-1 ring-gray-900"
          : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      <Paragraph1 className="font-medium text-gray-900 text-sm">{title}</Paragraph1>
      <Paragraph1 className="mt-0.5 text-gray-500 text-xs">{description}</Paragraph1>
    </button>
  );
}

function ShipmentActionCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3 bg-gray-50 p-3 border border-gray-100 rounded-lg">
      <div>
        <Paragraph1 className="font-medium text-gray-900 text-sm">{title}</Paragraph1>
        <Paragraph1 className="mt-0.5 text-gray-500 text-xs">{description}</Paragraph1>
      </div>
      {children}
    </div>
  );
}

function ManualTrackingField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <Paragraph1 className="mb-1 text-gray-500 text-xs">
        Tracking URL or rider number
      </Paragraph1>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={ADMIN_FIELD_INPUT_CLASS}
        placeholder={ADMIN_TRACKING_CONTACT_PLACEHOLDER}
      />
    </label>
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
    <div className={`min-w-0 rounded-lg border border-gray-100 bg-gray-50/80 p-3 ${className ?? ""}`}>
      <Paragraph1 className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </Paragraph1>
      {children}
    </div>
  );
}

function AddressCard({
  address,
}: {
  address: Record<string, unknown> | undefined;
}) {
  const lines = formatAddressLines(address);

  return (
    <div className="min-h-full rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-3">
      {lines.length ? (
        <div className="space-y-1">
          {lines.map((line, index) => (
            <Paragraph1
              key={`${index}-${line}`}
              className={
                index === 0
                  ? "break-words text-sm font-semibold leading-snug text-gray-900"
                  : "break-words text-xs leading-relaxed text-gray-600"
              }
            >
              {line}
            </Paragraph1>
          ))}
        </div>
      ) : (
        <Paragraph1 className="text-sm text-gray-500">—</Paragraph1>
      )}
    </div>
  );
}

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
function formatAddressLines(addr: Record<string, unknown> | undefined): string[] {
  if (!addr || typeof addr !== "object") return [];
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
  const contacts = [phone, email].filter(Boolean).join(" · ");
  const parts = [name, contacts, street, line2, zip].filter(
    (p): p is string => Boolean(p && String(p).trim()),
  );
  return parts.length ? parts : [JSON.stringify(addr) ?? "Address details unavailable"];
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
  const [dispatchFilter, setDispatchFilter] = useState<DispatchFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [manualTrackingUrl, setManualTrackingUrl] = useState("");
  const [ratePreviewOpen, setRatePreviewOpen] = useState(false);
  const [rateForImmediate, setRateForImmediate] = useState(true);
  const [selectedCarrierTier, setSelectedCarrierTier] = useState<string | null>(
    null,
  );
  const [reconcileTrackingUrl, setReconcileTrackingUrl] = useState("");
  const [reconcileActualCostNgn, setReconcileActualCostNgn] = useState("");
  const [pendingConfirm, setPendingConfirm] = useState<ShipmentConfirmAction | null>(
    null,
  );
  const [reconcileNote, setReconcileNote] = useState("");
  const [costProvider, setCostProvider] = useState("all");
  const [costCourier, setCostCourier] = useState("all");
  const [costsOpen, setCostsOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [costDateFrom, setCostDateFrom] = useState("");
  const [costDateTo, setCostDateTo] = useState("");

  const activeFilterCount =
    Number(typeFilter !== "All") +
    Number(dispatchFilter !== "all") +
    Number(statusFilter !== "All") +
    Number(Boolean(dateFrom)) +
    Number(Boolean(dateTo));

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
  }, [statusFilter, typeFilter, dispatchFilter, debouncedSearch, dateFrom, dateTo]);

  useEffect(() => {
    setCostProvider("all");
    setCostCourier("all");
  }, [
    statusFilter,
    typeFilter,
    dispatchFilter,
    debouncedSearch,
    dateFrom,
    dateTo,
    costDateFrom,
    costDateTo,
  ]);

  const manualFulfillmentParam =
    dispatchFilter === "manual"
      ? true
      : dispatchFilter === "automated"
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

  const ratePreviewEnabled = Boolean(
    isDetailModalOpen && ratePreviewOpen && displayShipment?.id,
  );
  const ratePreviewQuery = useAdminShipmentRatePreview(
    displayShipment?.id ?? "",
    rateForImmediate,
    ratePreviewEnabled,
  );
  const ratePreview = ratePreviewQuery.data?.data;
  const carrierTiers = ratePreview?.tiers ?? [];
  const rateProviderStatus = ratePreviewQuery.providerStatus;
  const ratesSourcesLoading =
    ratePreviewOpen && ratePreviewQuery.sourcesLoading;
  const anyRateProviderLoading =
    ratePreviewOpen && ratePreviewQuery.anyProviderLoading;
  const ratesLoading = ratesSourcesLoading || anyRateProviderLoading;

  useEffect(() => {
    if (!displayShipment?.id) return;
    setManualTrackingUrl("");
    setRatePreviewOpen(false);
    setSelectedCarrierTier(null);
    setRateForImmediate(true);
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

  const handleCancelShipment = (shipmentId: string) => {
    setPendingConfirm({ type: "cancel", shipmentId });
  };

  const handleRedispatchShipment = (shipmentId: string) => {
    setPendingConfirm({ type: "redispatch", shipmentId });
  };

  const handleViewDetails = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setIsDetailModalOpen(true);
  };

  const shipmentColumns = buildShipmentListColumns({
    onViewDetails: handleViewDetails,
    onRedispatch: handleRedispatchShipment,
    onCancel: handleCancelShipment,
    redispatchPending: redispatchShipment.isPending,
    cancelPending: cancelShipment.isPending,
  });

  const handleMarkManualDispatched = async () => {
    if (!displayShipment?.id) return;
    try {
      await completeManualShipment.mutateAsync({
        shipmentId: displayShipment.id,
        ...parseAdminTrackingContact(manualTrackingUrl),
      });
      toast.success("Marked as dispatched. Customer notified.");
      setIsDetailModalOpen(false);
    } catch {
      toast.error("Could not complete shipment");
    }
  };

  const handleMarkCompleted = () => {
    if (!displayShipment?.id) return;
    setPendingConfirm({ type: "markCompleted" });
  };

  const handleLoadCarrierRates = () => {
    setSelectedCarrierTier(null);
    if (ratePreviewOpen) {
      void ratePreviewQuery.refetch();
      return;
    }
    setRatePreviewOpen(true);
  };

  const handleDispatchNow = (options?: { pricingTier?: string }) => {
    if (!displayShipment?.id) return;
    const needsTier = displayShipment.manualFulfillment;
    const tier = options?.pricingTier ?? selectedCarrierTier ?? undefined;
    if (needsTier && !tier) {
      toast.error("Select a carrier rate first");
      return;
    }
    setPendingConfirm({ type: "dispatchNow", pricingTier: tier });
  };

  const selectableCarrierTiers = carrierTiers.filter(
    (tier) => tier.name.toLowerCase() !== "relisted dispatch",
  );

  const showCarrierBookingPanel =
    displayShipment &&
    (displayShipment.status === "PENDING" ||
      displayShipment.status === "DISPATCH_FAILED");

  const showSwitchToManualPanel =
    displayShipment &&
    !displayShipment.manualFulfillment &&
    !displayShipment.reconciledAsManualAt &&
    (displayShipment.status === "PENDING" ||
      displayShipment.status === "DISPATCHING" ||
      displayShipment.status === "DISPATCH_FAILED");

  const showMarkManualDispatchedPanel =
    Boolean(
      displayShipment?.manualFulfillment &&
        (displayShipment.status === "PENDING" ||
          displayShipment.status === "DISPATCHING"),
    );

  const showMarkCompletedPanel =
    Boolean(
      displayShipment &&
        (displayShipment.status === "PENDING" ||
          displayShipment.status === "DISPATCH_FAILED" ||
          displayShipment.status === "DISPATCHED" ||
          displayShipment.status === "IN_TRANSIT"),
    );

  const markCompletedDescription =
    displayShipment?.status === "DISPATCH_FAILED"
      ? "Carrier booking failed or was never completed. Mark completed if the item was still delivered."
      : displayShipment?.status === "PENDING"
        ? "Mark completed if the item was delivered before booking finished here."
        : displayShipment?.manualFulfillment
          ? "Mark completed when the item was delivered."
          : "Mark completed when delivery happened but carrier tracking has not updated.";

  const handleSwitchToManual = () => {
    if (!displayShipment?.id) return;
    setPendingConfirm({ type: "switchToManual" });
  };

  const handleReconcileManual = () => {
    if (!displayShipment?.id) return;
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
    setPendingConfirm({ type: "reconcileManual" });
  };

  const executePendingConfirm = async () => {
    if (!pendingConfirm) return;

    try {
      switch (pendingConfirm.type) {
        case "cancel":
          await cancelShipment.mutateAsync(pendingConfirm.shipmentId);
          toast.success("Shipment cancelled");
          break;
        case "redispatch":
          await redispatchShipment.mutateAsync(pendingConfirm.shipmentId);
          toast.success("Carrier booking restarted");
          break;
        case "markCompleted":
          if (!displayShipment?.id) return;
          await markManualDelivered.mutateAsync(displayShipment.id);
          toast.success("Marked as completed. Order status updated.");
          await detailQuery.refetch();
          break;
        case "dispatchNow": {
          if (!displayShipment?.id) return;
          const dispatchResult = await dispatchShipmentNow.mutateAsync({
            shipmentId: displayShipment.id,
            pricingTier: pendingConfirm.pricingTier,
            updateWindow: shipmentScheduledInFuture ? rateForImmediate : undefined,
          });
          toast.success(dispatchResult.message);
          setIsDetailModalOpen(false);
          break;
        }
        case "switchToManual":
          if (!displayShipment?.id) return;
          await switchShipmentToManual.mutateAsync({
            shipmentId: displayShipment.id,
            adminReconcileNote: reconcileNote.trim() || undefined,
          });
          toast.success("Switched to Relisted dispatch");
          await detailQuery.refetch();
          break;
        case "reconcileManual": {
          if (!displayShipment?.id) return;
          const parsedCost = reconcileActualCostNgn.trim()
            ? Math.round(Number.parseFloat(reconcileActualCostNgn) * 100)
            : undefined;
          await reconcileManualShipment.mutateAsync({
            shipmentId: displayShipment.id,
            ...parseAdminTrackingContact(reconcileTrackingUrl),
            actualFulfillmentCostKobo: parsedCost,
            adminReconcileNote: reconcileNote.trim() || undefined,
          });
          toast.success("Marked as dispatched. Customer notified.");
          await detailQuery.refetch();
          break;
        }
      }
      setPendingConfirm(null);
    } catch {
      const errorMessages: Record<ShipmentConfirmAction["type"], string> = {
        cancel: "Could not cancel shipment",
        redispatch: "Could not redispatch",
        markCompleted: "Could not mark as completed",
        dispatchNow: "Could not start carrier booking",
        switchToManual: "Could not switch to Relisted dispatch",
        reconcileManual: "Could not mark as dispatched",
      };
      toast.error(errorMessages[pendingConfirm.type]);
    }
  };

  const confirmModalProps = useMemo(() => {
    if (!pendingConfirm) return null;

    switch (pendingConfirm.type) {
      case "cancel":
        return {
          title: "Cancel shipment",
          description:
            "Cancel this shipment? Only pending shipments can be cancelled.",
          actionLabel: "Cancel shipment",
          actionType: "negative" as const,
        };
      case "redispatch":
        return {
          title: "Retry carrier booking",
          description:
            "Try carrier booking again? Use this only when the previous booking failed.",
          actionLabel: "Retry booking",
          actionType: "update" as const,
        };
      case "markCompleted": {
        const carrierBooked = Boolean(
          displayShipment &&
            !displayShipment.manualFulfillment &&
            (displayShipment.providerShipmentId ||
              displayShipment.reconciledAsManualAt),
        );
        const dispatchFailed = displayShipment?.status === "DISPATCH_FAILED";
        const pendingUndispatched = displayShipment?.status === "PENDING";
        const description = dispatchFailed
          ? "Carrier booking failed or was never finished, but use this if the item was still delivered. Order status will update."
          : pendingUndispatched
            ? "Use when the item was delivered but booking never completed here. Order status will update."
            : carrierBooked
              ? "Use when delivery happened but carrier tracking has not caught up. Order status and downstream steps will update."
              : "Order status will update and the buyer can confirm receipt where applicable.";
        return {
          title: "Mark as completed",
          description,
          actionLabel: "Mark completed",
          actionType: "update" as const,
        };
      }
      case "dispatchNow":
        return {
          ...getDispatchNowConfirmCopy({
            shipmentScheduledInFuture,
            rateForImmediate,
            scheduledRateQuoteDetail,
          }),
          actionType: "positive" as const,
        };
      case "switchToManual":
        return {
          title: "Switch to Relisted dispatch",
          description:
            "Handle this leg in-house. Mark dispatched when the item is on the way.",
          actionLabel: "Switch to Relisted dispatch",
          actionType: "update" as const,
        };
      case "reconcileManual":
        return {
          title: "Mark dispatched in-house",
          description:
            "The carrier will not be used. What the renter paid stays the same.",
          actionLabel: "Mark dispatched",
          actionType: "update" as const,
        };
      default:
        return null;
    }
  }, [
    pendingConfirm,
    displayShipment,
    shipmentScheduledInFuture,
    rateForImmediate,
    scheduledRateQuoteDetail,
  ]);

  const confirmModalLoading =
    cancelShipment.isPending ||
    redispatchShipment.isPending ||
    markManualDelivered.isPending ||
    dispatchShipmentNow.isPending ||
    switchShipmentToManual.isPending ||
    reconcileManualShipment.isPending;

  return (
    <div className="min-h-screen">
      <div className="mb-6">
        <Paragraph2 className="mb-1 font-extrabold text-gray-900 text-2xl tracking-tight">
          Shipments
        </Paragraph2>
        <Paragraph1 className="text-gray-600">
          View dispatch state, windows, and tracking for all platform shipments.
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
            <div className={`${ADMIN_FILTER_BAR_CLASS} mb-4`}>
              <AdminFilterField label="From">
                <input
                  type="date"
                  value={costDateFrom}
                  onChange={(e) => setCostDateFrom(e.target.value)}
                  className={ADMIN_FILTER_DATE_CLASS}
                  aria-label="Cost scheduled from"
                />
              </AdminFilterField>

              <AdminFilterField label="To">
                <input
                  type="date"
                  value={costDateTo}
                  onChange={(e) => setCostDateTo(e.target.value)}
                  min={costDateFrom || undefined}
                  className={ADMIN_FILTER_DATE_CLASS}
                  aria-label="Cost scheduled to"
                />
              </AdminFilterField>

              <AdminFilterField label="Provider" className="col-span-2 sm:col-span-1 lg:w-44">
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
                <AdminFilterField label="Courier" className="col-span-2 sm:col-span-1 lg:w-44">
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
        <div className="flex items-end gap-2 border-b border-gray-200 px-4 py-4 sm:px-6">
          <AdminFilterField label="Search" className="min-w-0 flex-1">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                aria-hidden
              />
              <input
                type="text"
                placeholder="Order id or UUID…"
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

        <AdminFilterDrawer
          isOpen={filtersOpen}
          onClose={() => setFiltersOpen(false)}
          onClear={() => {
            setTypeFilter("All");
            setDispatchFilter("all");
            setStatusFilter("All");
            setDateFrom("");
            setDateTo("");
          }}
          activeCount={activeFilterCount}
          title="Shipment filters"
        >
          <div className="space-y-5">
            <AdminFilterField label="Leg type">
              <AdminComboBox
                value={typeFilter}
                onChange={(value) => setTypeFilter(value as ShipmentType | "All")}
                options={TYPE_FILTER_OPTIONS}
                ariaLabel="Leg type"
              />
            </AdminFilterField>
            <AdminFilterField label={DISPATCH_FILTER_LABEL}>
              <AdminComboBox
                value={dispatchFilter}
                onChange={(value) => setDispatchFilter(value as DispatchFilter)}
                options={DISPATCH_FILTER_OPTIONS}
                ariaLabel={DISPATCH_FILTER_LABEL}
              />
            </AdminFilterField>
            <AdminFilterField label="Status">
              <AdminComboBox
                value={statusFilter}
                onChange={(value) => setStatusFilter(value as ShipmentStatus | "All")}
                options={STATUS_FILTER_OPTIONS}
                ariaLabel="Status"
              />
            </AdminFilterField>
            <AdminFilterField label="Scheduled from">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className={ADMIN_FILTER_DATE_CLASS}
                aria-label="Scheduled from"
              />
            </AdminFilterField>
            <AdminFilterField label="Scheduled to">
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                min={dateFrom || undefined}
                className={ADMIN_FILTER_DATE_CLASS}
                aria-label="Scheduled to"
              />
            </AdminFilterField>
          </div>
        </AdminFilterDrawer>

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
          <ResponsiveDataTable
            rows={shipments}
            columns={shipmentColumns}
            getRowKey={(shipment) => shipment.id}
            onRowClick={handleViewDetails}
            emptyState={
              <Paragraph1 className="p-8 text-center text-gray-500">
                No shipments match these filters.
              </Paragraph1>
            }
          />

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
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
          onClick={() => setIsDetailModalOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setIsDetailModalOpen(false)}
          role="presentation"
        >
          <div
            className="relative flex max-h-[100dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-gray-200 bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal
            aria-labelledby="shipment-detail-title"
          >
            {detailQuery.isFetching && !detailFromApi && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70">
                <Loader2 className="w-8 h-8 text-gray-600 animate-spin" aria-label="Loading details" />
              </div>
            )}
            <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-4 sm:px-6">
              <div className="relative min-w-0">
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2 pr-10">
                  <h2
                    id="shipment-detail-title"
                    className="text-xs font-bold uppercase leading-tight tracking-[0.12em] text-gray-500 sm:text-sm"
                  >
                    {getShipmentLegDisplayLabel(displayShipment.type)} shipment
                  </h2>
                  <ShipmentStatusBadge
                    status={displayShipment.status}
                    type={displayShipment.type}
                  />
                </div>
                {displayShipment.reconciledAsManualAt ||
                (displayShipment.manualFulfillment &&
                  !displayShipment.reconciledAsManualAt) ? (
                  <div className="mt-2 flex flex-wrap gap-1.5 pr-10">
                    {displayShipment.reconciledAsManualAt ? (
                      <span
                        className={`${ADMIN_SHIPMENT_CHIP_CLASS} bg-gray-100 text-gray-800`}
                      >
                        Manually dispatched
                      </span>
                    ) : null}
                    {displayShipment.manualFulfillment &&
                    !displayShipment.reconciledAsManualAt ? (
                      <span className={RELISTED_DISPATCH_BADGE_CLASS}>
                        Relisted dispatch
                      </span>
                    ) : null}
                  </div>
                ) : null}
                <button
                  type="button"
                  onClick={() => setIsDetailModalOpen(false)}
                  className="absolute right-0 top-0 shrink-0 rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                  aria-label="Close"
                >
                  <XCircle size={22} />
                </button>
              </div>
              <div className="mt-3 grid w-full grid-cols-2 gap-2 rounded-xl border border-gray-200 bg-gray-50/80 p-3">
                <div className="min-w-0">
                  <Paragraph1 className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                    Order
                  </Paragraph1>
                  <Paragraph1 className="break-all font-mono text-xs font-medium leading-relaxed text-gray-800">
                    {displayShipment.order?.orderId ?? "—"}
                  </Paragraph1>
                </div>
                <div className="min-w-0 border-l border-gray-200 pl-3">
                  <Paragraph1 className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                    Renter
                  </Paragraph1>
                  <Paragraph1 className="break-words text-sm font-semibold leading-snug text-gray-900">
                    {displayShipment.order?.user?.name || "—"}
                  </Paragraph1>
                  {displayShipment.order?.user?.email ? (
                    <Paragraph1 className="mt-0.5 break-all text-xs leading-snug text-gray-500">
                      {displayShipment.order.user.email}
                    </Paragraph1>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4 sm:space-y-4 sm:px-6 sm:py-5">
              <section
                aria-label="Shipment overview"
                className="grid grid-cols-2 gap-2 rounded-xl border border-gray-200 bg-gray-50 p-3 sm:gap-3 sm:p-4"
              >
                {[
                  ...(dispatchWindowLabel || displayShipment.scheduledDate
                    ? [
                        {
                          label: "Scheduled",
                          value:
                            dispatchWindowLabel ??
                            (displayShipment.scheduledDate
                              ? formatLagosDate(displayShipment.scheduledDate, {
                                  includeWeekday: true,
                                })
                              : "—"),
                        },
                      ]
                    : []),
                  {
                    label: "Carrier",
                    value: formatAdminPricingTier(displayShipment.pricingTier),
                  },
                  ...(displayShipment.trackingId ||
                  displayShipment.providerTrackingUrl
                    ? [
                        {
                          label: "Tracking",
                          value: (
                            <ShipmentTrackingContact
                              trackingId={displayShipment.trackingId}
                              providerTrackingUrl={
                                displayShipment.providerTrackingUrl
                              }
                            />
                          ),
                        },
                      ]
                    : []),
                  {
                    label: "Total charged",
                    value: formatShipmentRowCost(displayShipment),
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="min-w-0 rounded-lg bg-white px-3 py-2.5"
                  >
                    <Paragraph1 className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                      {item.label}
                    </Paragraph1>
                    <div className="break-words text-sm font-medium text-gray-900">
                      {item.value}
                    </div>
                  </div>
                ))}
              </section>

              {showCarrierBookingPanel && (
                <ShipmentModalSection
                  title="Carrier booking"
                  summary={
                    displayShipment.manualFulfillment
                      ? "Use a carrier for this leg."
                      : "Fetch rates or book dispatch."
                  }
                  defaultOpen
                >
                  {shipmentScheduledInFuture && (
                    <div
                      role="radiogroup"
                      aria-label="Rate quote window"
                      className="gap-2 grid grid-cols-2"
                    >
                      <RateQuoteOptionCard
                        selected={rateForImmediate}
                        onSelect={() => {
                          setRateForImmediate(true);
                          setSelectedCarrierTier(null);
                        }}
                        title="Today"
                        description="Get it delivered today"
                      />
                      <RateQuoteOptionCard
                        selected={!rateForImmediate}
                        onSelect={() => {
                          setRateForImmediate(false);
                          setSelectedCarrierTier(null);
                        }}
                        title="Scheduled window"
                        description={`Get it delivered on ${scheduledRateQuoteDetail}`}
                      />
                    </div>
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
                        "Fetch rates"
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
                          ? "Booking…"
                          : shipmentScheduledInFuture
                            ? "Dispatch now"
                            : "Retry booking"}
                      </button>
                    )}
                  </div>

                  {ratePreviewOpen && ratesSourcesLoading && (
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                      Preparing rate sources…
                    </div>
                  )}

                  {ratePreviewOpen &&
                    !ratesSourcesLoading &&
                    ratePreviewQuery.isError && (
                    <Paragraph1 className="text-red-700 text-sm">
                      Could not fetch rates.
                    </Paragraph1>
                  )}

                  {ratePreviewOpen && !ratesSourcesLoading && (
                    <div className="space-y-3 pt-1">
                      {ratePreview && (
                        <Paragraph1 className="text-gray-500 text-xs">
                          Renter paid {koboToNaira(ratePreview.renterChargedKobo)}
                          {ratePreview.forImmediate ? " · today" : ""}
                        </Paragraph1>
                      )}
                      {rateProviderStatus.some((p) => p.loading) && (
                        <ul className="space-y-1.5">
                          {rateProviderStatus
                            .filter((p) => p.loading)
                            .map((p) => (
                              <li
                                key={p.provider}
                                className="flex items-center gap-2 text-gray-500 text-xs"
                              >
                                <Loader2
                                  className="w-3.5 h-3.5 shrink-0 animate-spin"
                                  aria-hidden
                                />
                                Loading{" "}
                                {ADMIN_RATE_PREVIEW_PROVIDER_LABEL[p.provider] ??
                                  p.provider}
                                …
                              </li>
                            ))}
                        </ul>
                      )}
                      {ratePreview && ratePreview.warnings.length > 0 && (
                        <ul className="space-y-1 text-amber-900 text-xs">
                          {ratePreview.warnings.map((w) => (
                            <li key={`${w.provider}-${w.message}`}>
                              {formatShippingQuoteWarningMessage(w)}
                            </li>
                          ))}
                        </ul>
                      )}
                      {selectableCarrierTiers.length === 0 &&
                      !anyRateProviderLoading ? (
                        <Paragraph1 className="text-gray-500 text-sm">
                          No carrier rates available.
                        </Paragraph1>
                      ) : selectableCarrierTiers.length > 0 ? (
                        <div className="gap-2 grid grid-cols-2">
                          {selectableCarrierTiers.map((tier: ShipmentRateTier) => (
                            <label
                              key={tier.pricingTier}
                              className={`flex items-start gap-2.5 p-3 border rounded-lg cursor-pointer transition ${
                                selectedCarrierTier === tier.pricingTier
                                  ? "border-gray-900 bg-gray-50 ring-1 ring-gray-900"
                                  : "border-gray-200 bg-white hover:border-gray-300"
                              }`}
                            >
                              <input
                                type="radio"
                                name="carrier-tier"
                                checked={selectedCarrierTier === tier.pricingTier}
                                onChange={() => setSelectedCarrierTier(tier.pricingTier)}
                                className="sr-only"
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
                      ) : null}
                      {selectableCarrierTiers.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            void handleDispatchNow();
                          }}
                          disabled={dispatchShipmentNow.isPending || !selectedCarrierTier}
                          className={ADMIN_PRIMARY_BTN}
                        >
                          {dispatchShipmentNow.isPending ? "Booking…" : "Book selected rate"}
                        </button>
                      )}
                    </div>
                  )}
                </ShipmentModalSection>
              )}

              {showSwitchToManualPanel && (
                <ShipmentModalSection
                  title="Relisted dispatch"
                  summary="Handle this leg in-house instead of the carrier"
                  defaultOpen={!showCarrierBookingPanel}
                >
                  <div className="space-y-3">
                    <ShipmentActionCard
                      title="Switch to Relisted dispatch"
                      description="What the renter paid stays the same. Mark dispatched when the item is on the way."
                    >
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
                    </ShipmentActionCard>

                    <ShipmentActionCard
                      title="Already on the way?"
                      description="Mark dispatched now without waiting on the carrier."
                    >
                      <ManualTrackingField
                        value={reconcileTrackingUrl}
                        onChange={setReconcileTrackingUrl}
                      />
                      <details className="group">
                        <summary className="text-gray-500 text-xs cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                          Cost or internal note (optional)
                        </summary>
                        <div className="gap-3 grid grid-cols-1 sm:grid-cols-2 mt-3">
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
                      </details>
                      <button
                        type="button"
                        onClick={() => {
                          void handleReconcileManual();
                        }}
                        disabled={reconcileManualShipment.isPending}
                        className={ADMIN_PRIMARY_BTN}
                      >
                        {reconcileManualShipment.isPending ? "Saving…" : "Mark dispatched"}
                      </button>
                    </ShipmentActionCard>
                  </div>
                </ShipmentModalSection>
              )}

              {showMarkManualDispatchedPanel && (
                <ShipmentModalSection
                  title="Relisted dispatch"
                  summary="Mark dispatched when the item is on the way"
                  defaultOpen
                >
                  <ManualTrackingField
                    value={manualTrackingUrl}
                    onChange={setManualTrackingUrl}
                  />
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
                </ShipmentModalSection>
              )}

              {showMarkCompletedPanel && (
                <ShipmentModalSection
                  title="Complete leg"
                  summary={markCompletedDescription}
                >
                  <button
                    type="button"
                    onClick={() => {
                      void handleMarkCompleted();
                    }}
                    disabled={markManualDelivered.isPending}
                    className={ADMIN_PRIMARY_BTN}
                  >
                    {markManualDelivered.isPending ? "Saving…" : "Mark completed"}
                  </button>
                </ShipmentModalSection>
              )}

              {shipmentItemSummary ? (
                <ShipmentModalSection
                  title="Items"
                  summary={shipmentItemSummary}
                  defaultOpen
                >
                  <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {shipmentItems.map((line) => {
                      const name = line.product?.name ?? "Item";
                      const thumb = shipmentLineItemThumbnailUrl(line);
                      const metadata = shipmentLineItemMetadata(line);
                      return (
                        <li
                          key={line.id ?? name}
                          className="bg-gray-50 p-3 border border-gray-100 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-14 w-14 shrink-0">
                              <AdminListingThumb url={thumb} alt={name} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <Paragraph1 className="text-sm font-semibold text-gray-900">
                                {name}
                              </Paragraph1>
                            </div>
                          </div>
                          {metadata.length > 0 ? (
                            <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-gray-100 pt-3">
                              {metadata.map((row) => (
                                <div key={row.label} className="min-w-0">
                                  <dt className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">{row.label}</dt>
                                  <dd className="mt-0.5 break-words text-sm font-medium leading-snug text-gray-800">{row.value}</dd>
                                </div>
                              ))}
                            </dl>
                          ) : (
                            <Paragraph1 className="mt-3 border-t border-gray-100 pt-3 text-xs text-gray-500">
                              No listing details available
                            </Paragraph1>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </ShipmentModalSection>
              ) : null}

              <ShipmentModalSection title="Shipment details" summary={shipmentDetailsSummary}>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <DetailField label="Pickup partner">
                      <Paragraph1 className="font-medium text-gray-900 text-sm">
                        {displayShipment.pickupPartner ?? "—"}
                      </Paragraph1>
                    </DetailField>
                    <DetailField label="Delivery address">
                      <Paragraph1 className="break-words font-medium text-gray-900 text-sm">
                        {formatCheckoutDeliveryStreetLine(displayShipment)}
                      </Paragraph1>
                    </DetailField>
                    <DetailField label="Tracking">
                      {displayShipment.trackingId ||
                      displayShipment.providerTrackingUrl ? (
                        <ShipmentTrackingContact
                          trackingId={displayShipment.trackingId}
                          providerTrackingUrl={displayShipment.providerTrackingUrl}
                          linkClassName="inline-flex items-center gap-1 text-blue-700 hover:text-blue-900 hover:underline"
                        />
                      ) : (
                        <Paragraph1 className="text-sm text-gray-500">
                          No tracking link available
                        </Paragraph1>
                      )}
                    </DetailField>
                    <DetailField label="Dispatch attempts">
                      <Paragraph1 className="font-medium text-gray-900 text-sm">
                        {displayShipment.dispatchAttempts ?? 0}
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
                      <DetailField label="Internal note" className="col-span-2">
                        <Paragraph1 className="font-medium text-gray-900 text-sm">
                          {displayShipment.adminReconcileNote}
                        </Paragraph1>
                      </DetailField>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-4">
                    <div className="min-w-0">
                      <Paragraph1 className="mb-2 flex items-center gap-1 text-xs font-semibold text-gray-600">
                        <Package size={12} />
                        {detailPartyLabels.pickupHeading}
                      </Paragraph1>
                      <AddressCard address={displayShipment.pickupAddress} />
                    </div>
                    <div className="min-w-0">
                      <Paragraph1 className="mb-2 flex items-center gap-1 text-xs font-semibold text-gray-600">
                        <Truck size={12} />
                        {detailPartyLabels.deliveryHeading}
                      </Paragraph1>
                      <AddressCard address={displayShipment.deliveryAddress} />
                    </div>
                  </div>
                </div>
              </ShipmentModalSection>

              <ShipmentModalSection title="Delivery window" summary={deliveryWindowSummary}>
                <div className="gap-3 grid grid-cols-2">
                  <DetailField label="Scheduled date">
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
                  <div className="grid max-h-72 grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
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

              <div className="-mx-4 sticky bottom-0 flex flex-col gap-2 border-t border-gray-200 bg-white/95 px-4 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur sm:-mx-6 sm:flex-row sm:gap-3 sm:px-6 sm:pb-4">
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
                    {redispatchShipment.isPending ? "Booking…" : "Retry booking"}
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

      <ActionConfirmModal
        isOpen={pendingConfirm != null && confirmModalProps != null}
        onClose={() => setPendingConfirm(null)}
        title={confirmModalProps?.title ?? ""}
        description={confirmModalProps?.description ?? ""}
        actionType={confirmModalProps?.actionType ?? "positive"}
        actionLabel={confirmModalProps?.actionLabel ?? "Confirm"}
        cancelLabel="Go back"
        onConfirm={() => {
          void executePendingConfirm();
        }}
        isLoading={confirmModalLoading}
      />
    </div>
  );
}
