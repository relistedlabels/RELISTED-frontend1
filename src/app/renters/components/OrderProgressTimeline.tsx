// ENDPOINTS: GET /api/renters/orders/:orderId/progress (preferred), else derive from order status

"use client";

import React, { useMemo } from "react";
import {
  CheckCircle,
  Package,
  Truck,
  Home,
  RefreshCw,
  Thermometer,
  Loader,
  CircleDot,
} from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import { normalizeRenterOrderStatusKey } from "@/lib/renters/renterOrderStatus";

interface TimelineStage {
  id: number;
  label: string;
  description: string;
  icon: React.ElementType;
  milestone?: string;
}

interface OrderProgressTimelineProps {
  orderData?: any;
  /** When set, timeline + percent come from GET …/progress (aligned with backend). */
  progress?: {
    timeline: Array<{
      milestone: string;
      label: string;
      timestamp?: string | null;
      status: "completed" | "current" | "pending";
      description: string;
    }>;
    currentMilestone: string;
    percentComplete: number;
    returnScheduling?: {
      requestStatus: string;
      trackingNumber: string | null;
      pickupWindowStart: string | null;
      pickupWindowEnd: string | null;
      pickupScheduledAt: string | null;
      summary: string | null;
    } | null;
    returnLeg?: {
      status: string;
      label: string;
      trackingId: string | null;
      providerTrackingUrl: string | null;
      windowSummary: string | null;
    } | null;
  } | null;
}

function milestoneIcon(milestone: string): React.ElementType {
  const m = milestone.toLowerCase();
  if (m.includes("transit")) return Truck;
  if (m.includes("deliver") || m.includes("with_you")) return Home;
  if (m.includes("return") || m.includes("dispatch")) return RefreshCw;
  if (m.includes("accept") || m.includes("confirm") || m.includes("booked"))
    return CheckCircle;
  if (m.includes("complete") || m.includes("returned")) return CheckCircle;
  if (m.includes("cancel")) return RefreshCw;
  return Package;
}

/** Rental / mixed: Prisma `OrderStatus` → timeline stage 1–6 (fallback only). */
function rentalOrderStatusToStageId(statusRaw: string | undefined): number {
  const k = normalizeRenterOrderStatusKey(String(statusRaw ?? ""));
  const map: Record<string, number> = {
    PROCESSING: 1,
    ACCEPTED: 2,
    CONFIRMED: 2,
    IN_TRANSIT: 3,
    DELIVERED: 4,
    ACTIVE: 4,
    RETURN_DUE: 5,
    RETURNED: 6,
    IN_DISPUTE: 5,
    COMPLETED: 6,
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

function isResaleOnlyOrder(orderData: any): boolean {
  return String(orderData?.listingType ?? "").toUpperCase() === "RESALE";
}

export default function OrderProgressTimeline({
  orderData,
  progress,
}: OrderProgressTimelineProps) {
  const resaleOnly = isResaleOnlyOrder(orderData);

  const stages: TimelineStage[] = useMemo(() => {
    if (resaleOnly) {
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
            "Payment received — we are coordinating pickup with the seller.",
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
        label: "Order Placed",
        description: "Your order has been placed and is being processed.",
        icon: Package,
      },
      {
        id: 2,
        label: "Confirmed",
        description: "Lister confirmed and is preparing the item.",
        icon: CheckCircle,
      },
      {
        id: 3,
        label: "In Transit",
        description: "Item is on the way via delivery partner.",
        icon: Truck,
      },
      {
        id: 4,
        label: "With you",
        description: "Rental is active — item is with you.",
        icon: Home,
      },
      {
        id: 5,
        label: "Return",
        description: "Return window or return shipment.",
        icon: RefreshCw,
      },
      {
        id: 6,
        label: "Returned",
        description: "Item is back with the lister.",
        icon: CheckCircle,
      },
    ];
  }, [resaleOnly]);

  const currentStageId = useMemo(() => {
    const fn = resaleOnly
      ? resaleOrderStatusToStageId
      : rentalOrderStatusToStageId;
    return fn(orderData?.status);
  }, [orderData?.status, resaleOnly]);

  const fallbackPercent = useMemo(() => {
    if (stages.length <= 1) return 0;
    return Math.round(((currentStageId - 1) / (stages.length - 1)) * 100);
  }, [currentStageId, stages.length]);

  const useApi = Boolean(progress?.timeline?.length);

  const percentComplete = useApi
    ? Math.min(100, Math.max(0, progress!.percentComplete))
    : fallbackPercent;

  if (!orderData) {
    return (
      <div className="p-6 bg-white border border-gray-300 rounded-xl">
        <Paragraph1 className="text-gray-600">
          No progress data available.
        </Paragraph1>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white border border-gray-300 rounded-xl">
      <Paragraph1 className="text-xl font-bold text-gray-900 mb-6">
        Progress ({percentComplete}%)
      </Paragraph1>

      <div className="mb-6 bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="bg-black h-full transition-all duration-500"
          style={{ width: `${percentComplete}%` }}
        />
      </div>

      <div className="relative border-l-2 border-gray-200 pl-8">
        <div className="absolute top-0 -left-4">
          <Thermometer
            size={24}
            className="text-gray-900 bg-white p-1 rounded-full border border-gray-200"
          />
        </div>

        {useApi ? (
          <>
            {progress!.timeline.map((row) => {
              const active = row.status === "current";
              const completed = row.status === "completed";
              const Icon = milestoneIcon(row.milestone);

              return (
                <div key={row.milestone} className="mb-8 relative">
                  <div
                    className={`absolute -left-12 top-0 w-8 h-8 rounded-full flex items-center justify-center 
                                ${
                                  active
                                    ? "bg-black text-white"
                                    : completed
                                      ? "bg-green-500 text-white"
                                      : "bg-gray-200 text-gray-500"
                                }`}
                  >
                    {active ? (
                      <CircleDot size={16} />
                    ) : (
                      <Icon size={16} />
                    )}
                  </div>

                  <div className="ml-0">
                    <Paragraph1
                      className={`text-base font-semibold ${
                        active
                          ? "text-black"
                          : completed
                            ? "text-gray-800"
                            : "text-gray-500"
                      }`}
                    >
                      {row.label}
                    </Paragraph1>
                    <Paragraph1 className="text-sm text-gray-600 mt-1">
                      {row.description}
                    </Paragraph1>
                    {row.timestamp ? (
                      <Paragraph1 className="text-xs text-gray-400 mt-1">
                        {new Date(row.timestamp).toLocaleString("en-NG", {
                          timeZone: "Africa/Lagos",
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </Paragraph1>
                    ) : null}
                  </div>
                </div>
              );
            })}

            {(progress!.returnScheduling?.summary ||
              progress!.returnLeg?.label) && (
              <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <Paragraph1 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Return shipment
                </Paragraph1>
                {progress!.returnScheduling?.summary ? (
                  <Paragraph1 className="text-sm text-slate-800">
                    <span className="font-semibold">Your pickup window: </span>
                    {progress!.returnScheduling.summary}
                  </Paragraph1>
                ) : null}
                {progress!.returnLeg?.label ? (
                  <Paragraph1 className="text-sm text-slate-800">
                    <span className="font-semibold">Carrier leg: </span>
                    {progress!.returnLeg.label}
                    {progress!.returnLeg.trackingId
                      ? ` · ${progress!.returnLeg.trackingId}`
                      : ""}
                  </Paragraph1>
                ) : null}
                {progress!.returnLeg?.providerTrackingUrl ? (
                  <a
                    href={progress!.returnLeg.providerTrackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-700 underline"
                  >
                    Open tracking link
                  </a>
                ) : null}
              </div>
            )}
          </>
        ) : (
          stages.map((stage) => {
            const active = stage.id === currentStageId;
            const completed = stage.id < currentStageId;
            const Icon = stage.icon;

            return (
              <div key={stage.id} className="mb-8 relative">
                <div
                  className={`absolute -left-12 top-0 w-8 h-8 rounded-full flex items-center justify-center 
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

                <div className="ml-0">
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
                  <Paragraph1 className="text-sm text-gray-600 mt-1">
                    {stage.description}
                  </Paragraph1>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
