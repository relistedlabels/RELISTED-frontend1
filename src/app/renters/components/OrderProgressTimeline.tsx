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
    outboundLegs?: Array<{
      shipmentId: string;
      listerId: string | null;
      listerName: string | null;
      status: string;
      scheduledDate: string;
      windowSummary: string | null;
      trackingId: string | null;
      providerTrackingUrl: string | null;
      isBooked: boolean;
    }>;
    outboundSummary?: { total: number; bookedCount: number };
  } | null;
}

function milestoneIcon(milestone: string): React.ElementType {
  const m = milestone.toLowerCase();
  if (m.includes("preparing") || m.includes("processing_order"))
    return Loader;
  if (m.includes("transit")) return Truck;
  if (m.includes("deliver") || m.includes("with_you")) return Home;
  if (m.includes("return") || m.includes("dispatch")) return RefreshCw;
  if (m.includes("accept") || m.includes("confirm") || m.includes("booked"))
    return CheckCircle;
  if (m.includes("complete") || m.includes("returned")) return CheckCircle;
  if (m.includes("cancel")) return RefreshCw;
  return Package;
}

/** Rental / mixed: Prisma `OrderStatus` → timeline stage 1–7 (fallback only). */
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
        description:
          "Carrier pickup is booked and your item is on the way to you.",
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
          "Return the item by the due date. Start a return in the app when you are ready to schedule pickup.",
        icon: RefreshCw,
      },
      {
        id: 7,
        label: "Returned",
        description:
          "The item is back with the lister (delivered or confirmed by them).",
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

  const showReturnSupplement =
    useApi &&
    (Boolean(progress?.returnScheduling?.summary?.trim()) ||
      Boolean(progress?.returnLeg?.trackingId?.trim()) ||
      Boolean(progress?.returnLeg?.providerTrackingUrl?.trim()));

  const showOutboundShipmentsDetail =
    useApi &&
    !resaleOnly &&
    Boolean(progress?.outboundLegs?.length);
  const outboundShipmentCount = progress?.outboundLegs?.length ?? 0;
  const hasMultipleOutboundShipments = outboundShipmentCount > 1;

  if (!orderData) {
    return (
      <div className="bg-white p-6 border border-gray-300 rounded-xl">
        <Paragraph1 className="text-gray-600">
          No progress data available.
        </Paragraph1>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 border border-gray-300 rounded-xl">
      <Paragraph1 className="mb-6 font-bold text-gray-900 text-xl">
        Progress ({percentComplete}%)
      </Paragraph1>

      <div className="bg-gray-200 mb-6 rounded-full h-2 overflow-hidden">
        <div
          className="bg-black h-full transition-all duration-500"
          style={{ width: `${percentComplete}%` }}
        />
      </div>

      <div className="relative pl-8 border-gray-200 border-l-2">
        <div className="top-0 -left-4 absolute">
          <Thermometer
            size={24}
            className="bg-white p-1 border border-gray-200 rounded-full text-gray-900"
          />
        </div>

        {useApi ? (
          <>
            {progress!.timeline.map((row) => {
              const active = row.status === "current";
              const completed = row.status === "completed";
              const Icon = milestoneIcon(row.milestone);

              return (
                <div key={row.milestone} className="relative mb-8">
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
                    <Paragraph1 className="mt-1 text-gray-600 text-sm">
                      {row.description}
                    </Paragraph1>
                    {row.timestamp ? (
                      <Paragraph1 className="mt-1 text-gray-400 text-xs">
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

            {showOutboundShipmentsDetail && (
              <div className="space-y-3 bg-gray-50 mt-4 p-4 border border-gray-200 rounded-lg">
                <Paragraph1 className="font-bold text-gray-700 text-xs uppercase tracking-wide">
                  Shipments to you
                </Paragraph1>
                {(progress?.outboundSummary?.total ?? 0) > 1 ? (
                  <Paragraph1 className="text-gray-700 text-xs font-medium">
                    Carrier bookings: {progress?.outboundSummary?.bookedCount ?? 0}{" "}
                    of {progress?.outboundSummary?.total ?? 0} seller shipments.
                  </Paragraph1>
                ) : null}
                {progress!.outboundLegs!.map((leg, index) => {
                  const sellerName = leg.listerName?.trim() || "Seller";
                  const bookedText = leg.isBooked
                    ? "Booked with carrier"
                    : "Waiting for carrier booking";
                  const scheduledText = new Date(leg.scheduledDate).toLocaleDateString(
                    "en-NG",
                    {
                      timeZone: "Africa/Lagos",
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    },
                  );
                  if (!hasMultipleOutboundShipments) {
                    return (
                      <div
                        key={leg.shipmentId}
                        className="border-gray-200 border-b pb-3 last:border-0 last:pb-0 space-y-1"
                      >
                        <Paragraph1 className="text-gray-900 text-sm font-semibold">
                          {sellerName}
                        </Paragraph1>
                        <Paragraph1 className="text-gray-600 text-xs">
                          {bookedText} {" · "} Scheduled {scheduledText}
                        </Paragraph1>
                        {leg.windowSummary?.trim() ? (
                          <Paragraph1 className="text-gray-600 text-xs">
                            Pickup window: {leg.windowSummary.trim()}
                          </Paragraph1>
                        ) : null}
                        {leg.trackingId?.trim() ? (
                          <Paragraph1 className="text-gray-700 text-xs">
                            Tracking: {leg.trackingId.trim()}
                          </Paragraph1>
                        ) : null}
                        {leg.providerTrackingUrl?.trim() ? (
                          <a
                            href={leg.providerTrackingUrl.trim()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-700 text-xs underline inline-block"
                          >
                            Track shipment
                          </a>
                        ) : null}
                      </div>
                    );
                  }
                  return (
                    <details
                      key={leg.shipmentId}
                      className="bg-white p-3 border border-gray-200 rounded-lg"
                    >
                      <summary className="font-semibold text-gray-900 text-sm cursor-pointer">
                        Shipment {index + 1}: {sellerName} {" · "} {bookedText}
                      </summary>
                      <div className="space-y-1 mt-2">
                        <Paragraph1 className="text-gray-600 text-xs">
                          Scheduled: {scheduledText}
                        </Paragraph1>
                        {leg.windowSummary?.trim() ? (
                          <Paragraph1 className="text-gray-600 text-xs">
                            Pickup window: {leg.windowSummary.trim()}
                          </Paragraph1>
                        ) : null}
                        {leg.trackingId?.trim() ? (
                          <Paragraph1 className="text-gray-700 text-xs">
                            Tracking: {leg.trackingId.trim()}
                          </Paragraph1>
                        ) : null}
                        {leg.providerTrackingUrl?.trim() ? (
                          <a
                            href={leg.providerTrackingUrl.trim()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-700 text-xs underline inline-block"
                          >
                            Track shipment
                          </a>
                        ) : null}
                      </div>
                    </details>
                  );
                })}
              </div>
            )}

            {showReturnSupplement && (
              <div className="space-y-2 bg-slate-50 mt-4 p-4 border border-slate-200 rounded-lg">
                <Paragraph1 className="font-bold text-slate-700 text-xs uppercase tracking-wide">
                  Your return
                </Paragraph1>
                {progress?.returnScheduling?.summary?.trim() ? (
                  <Paragraph1 className="text-slate-800 text-sm">
                    <span className="font-semibold">Pickup window: </span>
                    {progress.returnScheduling.summary.trim()}
                  </Paragraph1>
                ) : null}
                {progress?.returnLeg?.trackingId?.trim() ? (
                  <Paragraph1 className="text-slate-800 text-sm">
                    <span className="font-semibold">Tracking: </span>
                    {progress.returnLeg.trackingId.trim()}
                  </Paragraph1>
                ) : null}
                {progress?.returnLeg?.providerTrackingUrl?.trim() ? (
                  <a
                    href={progress.returnLeg.providerTrackingUrl.trim()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700 text-sm underline"
                  >
                    Track return shipment
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
              <div key={stage.id} className="relative mb-8">
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
                  <Paragraph1 className="mt-1 text-gray-600 text-sm">
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
