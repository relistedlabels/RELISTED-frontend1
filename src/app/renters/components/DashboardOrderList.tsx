// ENDPOINTS: GET /api/renters/orders

"use client";

import { useEffect, useState } from "react";
import { Calendar, Package, Store, Truck } from "lucide-react";
import {
  segmentTabActive,
  segmentTabIdle,
} from "@/common/ui/buttonClasses";
import { Paragraph1 } from "@/common/ui/Text";
import { formatItemCount } from "@/lib/formatItemCount";
import OrderDetails from "./OrderDetails1";
import DashboardStartReturnButton from "./DashboardStartReturnButton";
import { useOrders } from "@/lib/queries/renters/useOrders";
import { resolveRenterStartReturn } from "@/lib/orders/renterStartReturn";
import {
  isReturnDueUrgentOnListOrder,
  shouldPromoteReturnOnListOrder,
} from "@/lib/orders/returnDueUrgency";
import { useSearchParams } from "next/navigation";
import {
  getRenterOrderBadgeClassName,
  getRenterOrderStatusLabel,
} from "@/lib/renters/renterOrderStatus";

export default function DashboardOrderList() {
  const searchParams = useSearchParams();
  const deepLinkedOrderId = (searchParams.get("orderId") || "").trim();
  const [orderView, setOrderView] = useState<"active" | "completed">("active");
  const [deepLinkFallbackTried, setDeepLinkFallbackTried] = useState(false);

  const { data, isLoading, error } = useOrders(
    orderView === "active" ? "active" : "completed",
    1,
    10,
    "newest",
  );

  const orders = data?.orders || [];

  useEffect(() => {
    if (!deepLinkedOrderId || isLoading || deepLinkFallbackTried) return;
    const hasMatch = orders.some(
      (order) => order.orderId === deepLinkedOrderId,
    );
    if (!hasMatch && orderView === "active") {
      setOrderView("completed");
      setDeepLinkFallbackTried(true);
    }
  }, [deepLinkedOrderId, isLoading, deepLinkFallbackTried, orders, orderView]);

  // Filter orders based on view - remove PROCESSING/ACTIVE from completed view
  const filteredOrders = orders.filter((order) => {
    const s = String(order.status ?? "")
      .toUpperCase()
      .replace(/-/g, "_");
    const terminal = new Set([
      "RETURNED",
      "COMPLETED",
      "CANCELLED",
      "REJECTED",
    ]);
    if (orderView === "active") return !terminal.has(s);
    return terminal.has(s);
  });
  const currency = "₦";

  const formatCurrency = (amount: number | undefined): string => {
    if (amount === undefined || amount === null) return "0";
    return amount.toLocaleString("en-NG");
  };

  const getStatusBadge = (status: string) => {
    const label = getRenterOrderStatusLabel(status);
    return (
      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold ${getRenterOrderBadgeClassName(label)}`}
      >
        {label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="w-full animate-pulse">
        <div className="h-20 bg-gray-300 rounded mb-4"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-300 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500 bg-white rounded-xl shadow-sm">
        Failed to load orders. Please try again.
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6 inline-flex rounded-xl border border-gray-200 bg-gray-50 p-1">
        <button
          type="button"
          onClick={() => setOrderView("active")}
          className={
            orderView === "active" ? segmentTabActive : segmentTabIdle
          }
        >
          Ongoing
        </button>
        <button
          type="button"
          onClick={() => setOrderView("completed")}
          className={
            orderView === "completed" ? segmentTabActive : segmentTabIdle
          }
        >
          Completed
        </button>
      </div>

      <div className="space-y-4">
        {filteredOrders.map((order) => {
          const startReturn = resolveRenterStartReturn({
            status: order.status,
            items: order.items,
            showStartReturn: order.showStartReturn,
            startReturnShipmentId: order.startReturnShipmentId,
          });
          const returnPromoted = shouldPromoteReturnOnListOrder({
            status: order.status,
            showStartReturn: startReturn.showStartReturn,
          });
          const returnDueNow = isReturnDueUrgentOnListOrder({
            status: order.status,
            showStartReturn: startReturn.showStartReturn,
          });

          return (
            <div
              key={order.orderId}
              className={`rounded-xl border bg-white p-4 ${
                returnPromoted
                  ? returnDueNow
                    ? "border-amber-300 bg-amber-50/40"
                    : "border-gray-300 bg-gray-50/60"
                  : "border-gray-200"
              }`}
            >
              {returnPromoted ? (
                <div
                  className={`mb-3 flex items-start gap-2 rounded-lg border px-3 py-2 ${
                    returnDueNow
                      ? "border-amber-200 bg-amber-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <Truck
                    size={16}
                    className={`mt-0.5 shrink-0 ${
                      returnDueNow ? "text-amber-900" : "text-gray-800"
                    }`}
                  />
                  <div>
                    <Paragraph1
                      className={`text-sm font-semibold ${
                        returnDueNow ? "text-amber-950" : "text-gray-900"
                      }`}
                    >
                      {returnDueNow
                        ? "Return due today"
                        : "Ready to start your return"}
                    </Paragraph1>
                    <Paragraph1
                      className={`text-xs ${
                        returnDueNow ? "text-amber-900/90" : "text-gray-600"
                      }`}
                    >
                      Start your return request to schedule pickup.
                    </Paragraph1>
                  </div>
                </div>
              ) : null}

              <div className="mb-3 flex items-center justify-between gap-3">
                <Paragraph1 className="font-semibold text-gray-900 text-sm tracking-wide">
                  {order.orderId}
                </Paragraph1>
                {getStatusBadge(order.status)}
              </div>

              <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-600">
                <span className="inline-flex items-center gap-1.5">
                  <Package size={14} className="shrink-0 text-gray-400" />
                  {formatItemCount(order.items.length)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Store size={14} className="shrink-0 text-gray-400" />
                  <span className="font-medium text-gray-800">
                    {order.listerName || "Unknown seller"}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar size={14} className="shrink-0 text-gray-400" />
                  {new Date(order.date).toLocaleDateString()}
                </span>
              </div>

              <hr className="border-gray-200" />

              <div className="flex flex-col justify-between gap-4 pt-4 sm:flex-row sm:items-center">
                <div>
                  <Paragraph1 className="text-gray-500 text-xs">
                    Total amount
                  </Paragraph1>
                  <Paragraph1 className="font-bold text-gray-900 text-lg">
                    {currency}
                    {formatCurrency(order.totalAmount)}
                  </Paragraph1>
                </div>
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-stretch">
                  {startReturn.showStartReturn ? (
                    <DashboardStartReturnButton
                      orderId={order.orderId}
                      shipmentId={startReturn.returnShipmentId}
                      urgent={returnPromoted}
                    />
                  ) : null}
                  <OrderDetails
                    orderId={order.orderId}
                    autoOpen={order.orderId === deepLinkedOrderId}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12 text-gray-500 bg-white rounded-xl shadow-sm">
          No {orderView} orders found.
        </div>
      )}
    </div>
  );
}
