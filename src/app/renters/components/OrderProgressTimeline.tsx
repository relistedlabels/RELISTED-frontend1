// ENDPOINTS: GET /api/renters/orders/:orderId/progress (preferred), else derive from order status

"use client";

import React, { useMemo, useState } from "react";
import {
  CheckCircle,
  Package,
  Truck,
  Home,
  RefreshCw,
  Thermometer,
  Loader,
  CircleDot,
  ChevronDown,
} from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import { normalizeRenterOrderStatusKey } from "@/lib/renters/renterOrderStatus";
import {
  isListerResaleOrder,
  orderHasRentalLines,
} from "@/lib/listers/listerOrderRow";
import { ReturnPackageItems, itemsForProgressGroup } from "@/lib/orders/returnPackageItems";

interface TimelineStage {
  id: number;
  label: string;
  description: string;
  icon: React.ElementType;
}

type TimelineRow = {
  milestone: string;
  label: string;
  timestamp?: string | null;
  status: "completed" | "current" | "pending";
  description: string;
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

function shipmentStatusLabel(status: string): string {
  const s = String(status ?? "").toUpperCase();
  if (s === "COMPLETED") return "Delivered";
  if (s === "IN_TRANSIT") return "In transit";
  if (s === "DISPATCHED" || s === "DISPATCHING") return "Booked with carrier";
  if (s === "PENDING") return "Awaiting booking";
  return s.replace(/_/g, " ").toLowerCase();
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
    <div className={`h-2 overflow-hidden rounded-full bg-gray-200 ${className ?? "mb-4"}`}>
      <div
        className="bg-black h-full transition-all duration-500"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

function TimelineRowView({ row, compact }: { row: TimelineRow; compact?: boolean }) {
  const active = row.status === "current";
  const completed = row.status === "completed";
  const Icon = milestoneIcon(row.milestone);
  const mb = compact ? "mb-4" : "mb-8";
  const offset = compact ? "-left-10" : "-left-12";
  const size = compact ? "h-6 w-6" : "h-8 w-8";
  const iconPx = compact ? 12 : 16;

  return (
    <div className={`relative ${mb}`}>
      <div
        className={`absolute top-0 ${offset} flex ${size} items-center justify-center rounded-full
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
      <div>
        <Paragraph1
          className={`font-semibold ${compact ? "text-sm" : "text-base"} ${
            active ? "text-black" : completed ? "text-gray-800" : "text-gray-500"
          }`}
        >
          {row.label}
        </Paragraph1>
        <Paragraph1 className={`mt-1 text-gray-600 ${compact ? "text-xs" : "text-sm"}`}>
          {row.description}
        </Paragraph1>
        {row.timestamp ? (
          <Paragraph1 className="mt-1 text-gray-400 text-xs">
            {formatLagosDateTime(row.timestamp)}
          </Paragraph1>
        ) : null}
      </div>
    </div>
  );
}

function LegTrackingBlock({
  leg,
  label,
}: {
  leg: ShipmentLegDetail;
  label: string;
}) {
  const statusText = shipmentStatusLabel(leg.status);
  const scheduledText = formatLagosDate(leg.scheduledDate);

  return (
    <div className="bg-white p-2.5 border border-gray-100 rounded-md">
      <Paragraph1 className="text-xs font-bold text-gray-900">{label}</Paragraph1>
      <Paragraph1 className="mt-1 text-xs text-gray-600">
        <span className="font-bold text-gray-900">{statusText}</span>
        {scheduledText ? ` · Scheduled ${scheduledText}` : null}
      </Paragraph1>
      {leg.windowSummary?.trim() ? (
        <Paragraph1 className="mt-1 text-xs text-gray-600">
          <span className="font-bold text-gray-900">Window</span>
          {`: ${leg.windowSummary.trim()}`}
        </Paragraph1>
      ) : null}
      {leg.trackingId?.trim() ? (
        <Paragraph1 className="mt-1 text-xs text-gray-600">
          <span className="font-bold text-gray-900">Tracking</span>
          <span className="font-mono text-gray-800">
            {`: ${leg.trackingId.trim()}`}
          </span>
        </Paragraph1>
      ) : null}
      {leg.providerTrackingUrl?.trim() ? (
        <a
          href={leg.providerTrackingUrl.trim()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-1 font-semibold text-blue-700 text-xs underline"
        >
          Track this shipment
        </a>
      ) : null}
    </div>
  );
}

function ShipmentGroupCard({
  group,
  packageIndex,
  packageTotal,
  returnRequestStatus,
  packageItems,
}: {
  group: ShipmentProgressGroup;
  packageIndex: number;
  packageTotal: number;
  returnRequestStatus?: string | null;
  packageItems?: Array<{ name: string; imageUrl?: string | null }>;
}) {
  const kindLabel = group.kind === "rental" ? "Rental" : "Purchase";
  const [isOpen, setIsOpen] = useState(packageIndex === 1);

  return (
    <details
      className="group bg-gray-50 border border-gray-200 rounded-xl overflow-hidden"
      open={isOpen}
      onToggle={(e) => setIsOpen(e.currentTarget.open)}
    >
      <summary className="[&::-webkit-details-marker]:hidden flex justify-between items-start gap-2 p-4 marker:content-none cursor-pointer list-none">
        <div className="flex-1 min-w-0 text-left">
          <div className="space-y-1">
            <Paragraph1 className="font-medium text-gray-500 text-xs uppercase tracking-wide">
              {kindLabel}
            </Paragraph1>
            <Paragraph1 className="font-semibold text-gray-800 text-xs">
              Package {packageIndex} of {packageTotal}
            </Paragraph1>
          </div>
          <Paragraph1 className="mt-2 font-semibold text-gray-900 text-base">
            {group.title}
          </Paragraph1>
          {packageItems && packageItems.length > 0 ? (
            <ReturnPackageItems items={packageItems} />
          ) : null}
          {group.listerName ? (
            <Paragraph1 className="text-gray-500 text-xs">
              Seller: {group.listerName}
            </Paragraph1>
          ) : null}
        </div>
        <div className="flex items-center gap-2 pt-0.5 shrink-0">
          <Paragraph1 className="font-semibold text-gray-900 text-sm">
            {group.percentComplete}%
          </Paragraph1>
          <ChevronDown
            size={16}
            className="text-gray-400 group-open:rotate-180 transition shrink-0"
            aria-hidden
          />
        </div>
      </summary>

      <div className="px-4 pt-3 pb-4 border-gray-200 border-t">
        <ProgressBarInner percent={group.percentComplete} className="mb-4" />

        <div className="relative pl-8 border-gray-200 border-l-2">
          {group.timeline.map((row) => (
            <TimelineRowView key={row.milestone} row={row} compact />
          ))}
        </div>

        {group.delivery ? (
          <div className="mt-3">
            <LegTrackingBlock
              leg={group.delivery}
              label={group.kind === "rental" ? "Delivery to you" : "Delivery"}
            />
          </div>
        ) : null}

        {group.return ? (
          <div className="mt-2">
            <LegTrackingBlock leg={group.return} label="Return to lister" />
          </div>
        ) : null}

        {group.kind === "rental" && returnRequestStatus ? (
          <Paragraph1 className="mt-2 text-slate-700 text-xs">
            Return: {returnRequestStatus.replace(/_/g, " ").toLowerCase()}
          </Paragraph1>
        ) : null}
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
        {
          id: 1,
          label: "Order placed",
          description: "Checkout completed and your purchase is locked in.",
          icon: Package,
        },
        {
          id: 2,
          label: "Confirmed",
          description:
            "Payment received. We are coordinating pickup with the seller.",
          icon: CheckCircle,
        },
        {
          id: 3,
          label: "In transit",
          description: "Courier has picked up the item and it is on the way.",
          icon: Truck,
        },
        {
          id: 4,
          label: "Delivered",
          description: "Carrier confirmed delivery to your address.",
          icon: Home,
        },
      ];
    }
    return [
      {
        id: 1,
        label: "Lister accepted",
        description: "The lister approved your rental dates.",
        icon: CheckCircle,
      },
      {
        id: 2,
        label: "Rental confirmed",
        description: "Your payment went through and your booking is confirmed.",
        icon: Package,
      },
      {
        id: 3,
        label: "Processing order",
        description:
          "We are confirming carrier pickup for each seller. Nothing has shipped yet.",
        icon: Loader,
      },
      {
        id: 4,
        label: "In transit",
        description: "Carrier pickup is booked and your item is on the way.",
        icon: Truck,
      },
      {
        id: 5,
        label: "With you",
        description: "Rental period is active. Enjoy your rental.",
        icon: Home,
      },
      {
        id: 6,
        label: "Return",
        description:
          "Return the item by the due date. Start a return in the app when ready.",
        icon: RefreshCw,
      },
      {
        id: 7,
        label: "Returned",
        description: "The item is back with the lister.",
        icon: CheckCircle,
      },
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

  const useApi = Boolean(progress?.timeline?.length);
  const percentComplete = useApi
    ? Math.min(100, Math.max(0, progress!.percentComplete))
    : fallbackPercent;

  const returnRequestStatusByShipment = useMemo(() => {
    const map = new Map<string, string>();
    for (const rr of progress?.returnRequests ?? []) {
      if (rr.shipmentId) map.set(rr.shipmentId, rr.status);
    }
    return map;
  }, [progress?.returnRequests]);

  if (!orderData) {
    return (
      <div className="bg-white p-6 border border-gray-300 rounded-xl">
        <Paragraph1 className="text-gray-600">No progress data available.</Paragraph1>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap justify-between items-baseline gap-2 mb-1">
        <Paragraph1 className="font-semibold text-gray-900 text-sm">
          Overall progress ({percentComplete}%)
        </Paragraph1>
        {progress?.summaryLabel ? (
          <Paragraph1 className="text-gray-600 text-xs">
            {progress.summaryLabel}
          </Paragraph1>
        ) : null}
      </div>

      <ProgressBarInner percent={percentComplete} className="mb-6" />

      {useGroupProgress ? (
        <div className="space-y-6">
          {useApi && progress!.timeline.length > 0 ? (
            <div className="relative pl-8 border-gray-200 border-l-2">
              <div className="top-0 -left-4 absolute">
                <Thermometer
                  size={24}
                  className="bg-white p-1 border border-gray-200 rounded-full text-gray-900"
                />
              </div>
              {progress!.timeline.map((row) => (
                <TimelineRowView key={row.milestone} row={row} />
              ))}
            </div>
          ) : null}

          <Paragraph1 className="font-semibold text-gray-900 text-sm">
            Package progress
          </Paragraph1>

          {shipmentGroups.map((group, index) => (
            <ShipmentGroupCard
              key={group.id}
              group={group}
              packageIndex={index + 1}
              packageTotal={shipmentGroups.length}
              packageItems={itemsForProgressGroup(
                group,
                orderData?.items as Array<{
                  name?: string;
                  imageUrl?: string | null;
                }>,
              )}
              returnRequestStatus={
                hasRentals && group.kind === "rental" && group.return?.shipmentId
                  ? (returnRequestStatusByShipment.get(
                      group.return.shipmentId,
                    ) ?? null)
                  : null
              }
            />
          ))}
        </div>
      ) : (
        <div className="relative pl-8 border-gray-200 border-l-2">
          <div className="top-0 -left-4 absolute">
            <Thermometer
              size={24}
              className="bg-white p-1 border border-gray-200 rounded-full text-gray-900"
            />
          </div>

          {useApi ? (
            progress!.timeline.map((row) => (
              <TimelineRowView key={row.milestone} row={row} />
            ))
          ) : (
            stages.map((stage) => {
              const active = stage.id === currentStageId;
              const completed = stage.id < currentStageId;
              const Icon = stage.icon;
              return (
                <div key={stage.id} className="relative mb-8">
                  <div
                    className={`absolute -left-12 top-0 flex h-8 w-8 items-center justify-center rounded-full
                      ${
                        active
                          ? "bg-black text-white"
                          : completed
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-500"
                      }`}
                  >
                    {active && <Loader size={16} className="animate-spin" />}
                    {!active && <Icon size={16} />}
                  </div>
                  <div>
                    <Paragraph1
                      className={`text-base font-semibold ${
                        active
                          ? "text-black"
                          : completed
                            ? "text-gray-800"
                            : "text-gray-500"
                      }`}
                    >
                      {stage.label}
                    </Paragraph1>
                    <Paragraph1 className="mt-1 text-gray-600 text-sm">
                      {stage.description}
                    </Paragraph1>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
