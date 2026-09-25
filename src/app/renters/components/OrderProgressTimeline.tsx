"use client";

import React, { useMemo, useState } from "react";
import {
  CheckCircle,
  Package,
  Truck,
  Home,
  RefreshCw,
  Loader,
  CircleDot,
  ChevronDown,
  ExternalLink,
} from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import { normalizeRenterOrderStatusKey } from "@/lib/renters/renterOrderStatus";
import {
  isListerResaleOrder,
  orderHasRentalLines,
} from "@/lib/listers/listerOrderRow";

interface TimelineStage {
  id: number;
  label: string;
  icon: React.ElementType;
}

type TimelineRow = {
  milestone: string;
  label: string;
  timestamp?: string | null;
  status: "completed" | "current" | "pending";
  description: string;
};

type EnrichedTimelineRow = TimelineRow & {
  displayLabel?: string;
  detail?: string | null;
  trackUrl?: string | null;
};

type ShipmentLegDetail = {
  legType: "OUTBOUND" | "RETURN" | "RESALE";
  shipmentId: string;
  status: string;
  trackingId: string | null;
  providerTrackingUrl: string | null;
  scheduledDate: string | null;
  windowSummary: string | null;
  isBooked: boolean;
  isDelivered: boolean;
};

export type ShipmentProgressGroup = {
  id: string;
  kind: "rental" | "resale";
  title: string;
  itemNames: string[];
  listerName: string | null;
  delivery: ShipmentLegDetail | null;
  return: ShipmentLegDetail | null;
  timeline: TimelineRow[];
  percentComplete: number;
  currentLabel: string;
};

interface OrderProgressTimelineProps {
  orderData?: any;
  progress?: {
    timeline: TimelineRow[];
    currentMilestone?: string;
    percentComplete: number;
    summaryLabel?: string;
    shipmentGroups?: ShipmentProgressGroup[];
    returnScheduling?: { summary: string | null } | null;
    returnRequests?: Array<{
      id: string;
      shipmentId: string | null;
      status: string;
      pickupWindowSummary?: string | null;
    }>;
  } | null;
}

function formatLagosDate(iso: string | null | undefined): string | null {
  if (!iso?.trim()) return null;
  return new Date(iso).toLocaleDateString("en-NG", {
    timeZone: "Africa/Lagos",
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatLagosDateTime(iso: string | null | undefined): string | null {
  if (!iso?.trim()) return null;
  return new Date(iso).toLocaleString("en-NG", {
    timeZone: "Africa/Lagos",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function milestoneIcon(milestone: string): React.ElementType {
  const m = milestone.toLowerCase();
  if (m.includes("transit")) return Truck;
  if (m.includes("deliver") || m.includes("with_you")) return Home;
  if (m.includes("return") || m.includes("dispatch") || m.includes("booked"))
    return RefreshCw;
  if (m.includes("complete") || m.includes("returned") || m.includes("placed"))
    return CheckCircle;
  return Package;
}

function ProgressBarInner({ percent, className }: { percent: number; className?: string }) {
  const clamped = Math.min(100, Math.max(0, percent));
  return (
    <div className={`h-2 overflow-hidden rounded-full bg-gray-200 ${className ?? ""}`}>
      <div
        className="h-full bg-black transition-all duration-500"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

function legWindowLabel(leg: ShipmentLegDetail): string | null {
  const window = leg.windowSummary?.trim();
  if (window) return window;
  return formatLagosDate(leg.scheduledDate);
}

function humanizeReturnRequestStatus(status: string): string {
  const key = status.toUpperCase().replace(/-/g, "_");
  const labels: Record<string, string> = {
    PENDING: "Return pending pickup",
    PENDING_PICKUP: "Return pending pickup",
    PICKUP_SCHEDULED: "Pickup scheduled",
    IN_TRANSIT: "Return in transit",
    COMPLETED: "Return complete",
    REJECTED: "Return rejected",
  };
  return labels[key] ?? status.replace(/_/g, " ").toLowerCase();
}

function trackUrlForMilestone(
  milestone: string,
  group: ShipmentProgressGroup,
): string | null {
  const deliveryMilestones = new Set(["delivery_transit", "purchase_transit"]);
  const returnMilestones = new Set(["return"]);

  if (deliveryMilestones.has(milestone)) {
    return group.delivery?.providerTrackingUrl?.trim() || null;
  }
  if (returnMilestones.has(milestone)) {
    return group.return?.providerTrackingUrl?.trim() || null;
  }
  return null;
}

function enrichGroupTimeline(
  group: ShipmentProgressGroup,
  options: {
    returnRequestStatus?: string | null;
    orderStatus?: string;
  },
): EnrichedTimelineRow[] {
  const orderStatusKey = String(options.orderStatus ?? "")
    .toUpperCase()
    .replace(/-/g, "_");
  const returnWindow =
    group.return && group.return.status === "PENDING"
      ? legWindowLabel(group.return)
      : null;

  return group.timeline.map((row) => {
    const trackUrl = trackUrlForMilestone(row.milestone, group);
    let displayLabel = row.label;
    let detail: string | null = null;

    if (row.milestone === "return" && group.kind === "rental") {
      if (options.returnRequestStatus) {
        detail = humanizeReturnRequestStatus(options.returnRequestStatus);
        if (row.status === "current" && orderStatusKey === "RETURN_DUE") {
          displayLabel = "Return due";
        }
      } else if (row.status === "current") {
        displayLabel = "Return due";
        detail = returnWindow
          ? `Return by ${returnWindow}`
          : "Schedule your return pickup";
      } else if (returnWindow && row.status !== "pending") {
        detail = `Return window: ${returnWindow}`;
      }
    }

    return {
      ...row,
      displayLabel,
      detail,
      trackUrl,
    };
  });
}

function TimelineRowView({
  row,
  compact,
  isLast,
}: {
  row: EnrichedTimelineRow;
  compact?: boolean;
  isLast?: boolean;
}) {
  const active = row.status === "current";
  const completed = row.status === "completed";
  const Icon = milestoneIcon(row.milestone);
  const circleSize = compact ? "h-7 w-7" : "h-8 w-8";
  const railWidth = compact ? "w-7" : "w-8";
  const iconPx = compact ? 13 : 16;
  const timestamp = formatLagosDateTime(row.timestamp);
  const label = row.displayLabel ?? row.label;
  const trackUrl = row.trackUrl?.trim();

  return (
    <div className="flex gap-3">
      <div className={`flex ${railWidth} shrink-0 flex-col items-center self-stretch`}>
        <div
          className={`relative z-10 flex ${circleSize} shrink-0 items-center justify-center rounded-full
            ${
              active
                ? "bg-black text-white"
                : completed
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-500"
            }`}
        >
          {active ? <CircleDot size={iconPx} /> : <Icon size={iconPx} />}
        </div>
        {!isLast ? (
          <div className="my-1 w-px flex-1 min-h-4 bg-gray-200" aria-hidden />
        ) : null}
      </div>
      <div className={`min-w-0 flex-1 pt-0.5 ${isLast ? "pb-0" : "pb-4"}`}>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <Paragraph1
            className={`font-semibold leading-snug ${compact ? "text-sm" : "text-base"} ${
              active ? "text-black" : completed ? "text-gray-800" : "text-gray-500"
            }`}
          >
            {label}
          </Paragraph1>
          {trackUrl ? (
            <a
              href={trackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-0.5 text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              Track
              <ExternalLink size={11} aria-hidden />
            </a>
          ) : null}
        </div>
        {row.detail ? (
          <Paragraph1
            className={`mt-1 text-xs leading-relaxed ${
              active && row.milestone === "return"
                ? "font-medium text-amber-800"
                : "text-gray-500"
            }`}
          >
            {row.detail}
          </Paragraph1>
        ) : null}
        {timestamp ? (
          <Paragraph1 className="mt-1 text-xs text-gray-400">{timestamp}</Paragraph1>
        ) : null}
      </div>
    </div>
  );
}

function TimelineList({
  rows,
  compact,
}: {
  rows: EnrichedTimelineRow[];
  compact?: boolean;
}) {
  return (
    <div>
      {rows.map((row, index) => (
        <TimelineRowView
          key={row.milestone}
          row={row}
          compact={compact}
          isLast={index === rows.length - 1}
        />
      ))}
    </div>
  );
}

function ShipmentGroupCard({
  group,
  packageIndex,
  packageTotal,
  returnRequestStatus,
  orderStatus,
}: {
  group: ShipmentProgressGroup;
  packageIndex: number;
  packageTotal: number;
  returnRequestStatus?: string | null;
  orderStatus?: string;
}) {
  const multi = packageTotal > 1;
  const [isOpen, setIsOpen] = useState(true);
  const timelineRows = enrichGroupTimeline(group, {
    returnRequestStatus,
    orderStatus,
  });

  return (
    <details
      className="group overflow-hidden rounded-xl border border-gray-200 bg-gray-50/80"
      open={isOpen}
      onToggle={(e) => setIsOpen(e.currentTarget.open)}
    >
      <summary className="flex cursor-pointer list-none items-start justify-between gap-3 p-4 marker:content-none [&::-webkit-details-marker]:hidden">
        <div className="min-w-0 flex-1 text-left">
          {multi ? (
            <Paragraph1 className="mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Package {packageIndex} of {packageTotal}
            </Paragraph1>
          ) : null}
          <Paragraph1 className="text-base font-semibold leading-snug text-gray-900">
            {group.title}
          </Paragraph1>
          {group.listerName ? (
            <Paragraph1 className="mt-1 text-sm text-gray-500">
              {group.listerName}
            </Paragraph1>
          ) : null}
        </div>
        <ChevronDown
          size={16}
          className="shrink-0 pt-0.5 text-gray-400 transition group-open:rotate-180"
          aria-hidden
        />
      </summary>

      <div className="space-y-5 border-t border-gray-200 px-4 pb-5 pt-4">
        <ProgressBarInner percent={group.percentComplete} />

        <TimelineList rows={timelineRows} compact />
      </div>
    </details>
  );
}

function rentalOrderStatusToStageId(statusRaw: string | undefined): number {
  const k = normalizeRenterOrderStatusKey(String(statusRaw ?? ""));
  const map: Record<string, number> = {
    PROCESSING: 1,
    ACCEPTED: 1,
    CONFIRMED: 2,
    IN_TRANSIT: 4,
    DELIVERED: 5,
    ACTIVE: 5,
    RETURN_DUE: 6,
    RETURNED: 7,
    IN_DISPUTE: 5,
    COMPLETED: 7,
    CANCELLED: 1,
    REJECTED: 1,
  };
  return map[k] ?? 1;
}

function resaleOrderStatusToStageId(statusRaw: string | undefined): number {
  const k = normalizeRenterOrderStatusKey(String(statusRaw ?? ""));
  const map: Record<string, number> = {
    PROCESSING: 1,
    ACCEPTED: 2,
    CONFIRMED: 2,
    IN_TRANSIT: 3,
    DELIVERED: 4,
    ACTIVE: 4,
    COMPLETED: 4,
    RETURNED: 4,
    RETURN_DUE: 4,
    IN_DISPUTE: 2,
    CANCELLED: 1,
    REJECTED: 1,
  };
  return map[k] ?? 1;
}

export default function OrderProgressTimeline({
  orderData,
  progress,
}: OrderProgressTimelineProps) {
  const pureResale = isListerResaleOrder(orderData);
  const hasRentals = orderHasRentalLines(orderData);
  const shipmentGroups = progress?.shipmentGroups ?? [];
  const useGroupProgress = shipmentGroups.length > 0;

  const stages: TimelineStage[] = useMemo(() => {
    if (pureResale) {
      return [
        { id: 1, label: "Order placed", icon: Package },
        { id: 2, label: "Confirmed", icon: CheckCircle },
        { id: 3, label: "In transit", icon: Truck },
        { id: 4, label: "Delivered", icon: Home },
      ];
    }
    return [
      { id: 1, label: "Lister accepted", icon: CheckCircle },
      { id: 2, label: "Rental confirmed", icon: Package },
      { id: 3, label: "Processing", icon: Loader },
      { id: 4, label: "In transit", icon: Truck },
      { id: 5, label: "With you", icon: Home },
      { id: 6, label: "Return", icon: RefreshCw },
      { id: 7, label: "Returned", icon: CheckCircle },
    ];
  }, [pureResale]);

  const currentStageId = useMemo(() => {
    const fn = pureResale
      ? resaleOrderStatusToStageId
      : rentalOrderStatusToStageId;
    return fn(orderData?.status);
  }, [orderData?.status, pureResale]);

  const fallbackPercent = useMemo(() => {
    if (stages.length <= 1) return 0;
    return Math.round(((currentStageId - 1) / (stages.length - 1)) * 100);
  }, [currentStageId, stages.length]);

  const returnRequestStatusByShipment = useMemo(() => {
    const map = new Map<string, string>();
    for (const rr of progress?.returnRequests ?? []) {
      if (rr.shipmentId) map.set(rr.shipmentId, rr.status);
    }
    return map;
  }, [progress?.returnRequests]);

  if (!orderData) {
    return (
      <Paragraph1 className="text-sm text-gray-600">No progress data.</Paragraph1>
    );
  }

  if (useGroupProgress) {
    const groupPercent =
      shipmentGroups.length > 0
        ? Math.round(
            shipmentGroups.reduce((s, g) => s + g.percentComplete, 0) /
              shipmentGroups.length,
          )
        : Math.min(100, Math.max(0, progress?.percentComplete ?? 0));
    const headline =
      progress?.summaryLabel ??
      shipmentGroups[0]?.currentLabel ??
      "In progress";
    const singlePackage = shipmentGroups.length === 1;

    return (
      <div className="space-y-4">
        {!singlePackage ? (
          <>
            <Paragraph1 className="text-sm font-semibold text-gray-900">
              {headline}
            </Paragraph1>
            <ProgressBarInner percent={groupPercent} />
          </>
        ) : null}

        <div className="space-y-4">
          {shipmentGroups.map((group, index) => (
            <ShipmentGroupCard
              key={group.id}
              group={group}
              packageIndex={index + 1}
              packageTotal={shipmentGroups.length}
              returnRequestStatus={
                hasRentals && group.kind === "rental" && group.return?.shipmentId
                  ? (returnRequestStatusByShipment.get(
                      group.return.shipmentId,
                    ) ?? null)
                  : null
              }
              orderStatus={orderData?.status}
            />
          ))}
        </div>
      </div>
    );
  }

  const useApi = Boolean(progress?.timeline?.length);
  const percentComplete = useApi
    ? Math.min(100, Math.max(0, progress!.percentComplete))
    : fallbackPercent;

  return (
    <div>
      <Paragraph1 className="mb-2 text-sm font-semibold text-gray-900">
        Progress
      </Paragraph1>
      <ProgressBarInner percent={percentComplete} className="mb-4" />

      <TimelineList
        rows={
          useApi
            ? progress!.timeline
            : stages.map((stage) => {
                const active = stage.id === currentStageId;
                const completed = stage.id < currentStageId;
                return {
                  milestone: String(stage.id),
                  label: stage.label,
                  timestamp: null,
                  status: active
                    ? ("current" as const)
                    : completed
                      ? ("completed" as const)
                      : ("pending" as const),
                  description: "",
                };
              })
        }
        compact
      />
    </div>
  );
}
