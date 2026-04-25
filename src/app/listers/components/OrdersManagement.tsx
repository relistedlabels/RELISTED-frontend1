"use client";
// ENDPOINTS: GET /api/listers/orders (list), POST …/orders/:orderId/approve, POST …/reject

import Link from "next/link";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, Clock, Package } from "lucide-react";

import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { useOrders } from "@/lib/queries/listers/useOrders";
import {
  getListerOrderStatusLabel,
  getListerOrderBadgeClassName,
  isListerAvailabilityPending,
} from "@/lib/listers/listerOrderStatus";
import {
  isListerAvailabilityRequestRow,
  isListerResaleOrder,
  shouldShowListerAvailabilityDeadlineUi,
} from "@/lib/listers/listerOrderRow";
import type { ListerOrdersSummary } from "@/lib/api/listers";

type ListerTabKey = "all" | "pending" | "ongoing" | "completed" | "cancelled";

const TABS: ListerTabKey[] = [
  "all",
  "pending",
  "ongoing",
  "completed",
  "cancelled",
];

const TAB_LABEL: Record<ListerTabKey, string> = {
  all: "All",
  pending: "Pending Approval",
  ongoing: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

function tabSummaryCount(
  tab: ListerTabKey,
  summary?: ListerOrdersSummary,
): number | undefined {
  if (!summary) return undefined;
  switch (tab) {
    case "pending":
      return summary.pendingApprovalCount;
    case "ongoing":
      return (summary.ongoingCount ?? 0) + (summary.inDisputeCount ?? 0);
    case "completed":
      return summary.completedCount;
    case "cancelled":
      return summary.cancelledCount;
    case "all": {
      const a = summary.pendingApprovalCount ?? 0;
      const b = summary.ongoingCount ?? 0;
      const e = summary.inDisputeCount ?? 0;
      const c = summary.completedCount ?? 0;
      const d = summary.cancelledCount ?? 0;
      return a + b + c + d + e;
    }
    default:
      return undefined;
  }
}

function resolveOrderExpiresAt(
  order: Record<string, unknown>,
): string | undefined {
  const abs =
    (typeof order.expiresAt === "string" && order.expiresAt.trim()) ||
    (typeof order.expires_at === "string" && order.expires_at.trim()) ||
    (typeof order.approvalDeadline === "string" &&
      order.approvalDeadline.trim());
  if (abs) return abs;

  const approval = order.approval as Record<string, unknown> | undefined;
  if (
    approval &&
    typeof approval.expiresAt === "string" &&
    approval.expiresAt.trim()
  ) {
    return approval.expiresAt.trim();
  }

  const sec = order.timeRemainingSeconds;
  if (typeof sec === "number" && Number.isFinite(sec)) {
    return new Date(Date.now() + sec * 1000).toISOString();
  }
  return undefined;
}

const OrdersManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ListerTabKey>("pending");

  const apiStatus = activeTab === "all" ? undefined : activeTab;

  const { data: ordersData, isLoading } = useOrders(apiStatus, 1, 20) as {
    data?: any;
    isLoading: boolean;
  };

  const { orders, summary, pagination } = useMemo(() => {
    if (!ordersData?.data) {
      return {
        orders: [] as Record<string, unknown>[],
        summary: undefined as ListerOrdersSummary | undefined,
        pagination: undefined as
          | { page: number; limit: number; total: number; pages: number }
          | undefined,
      };
    }
    const d = ordersData.data;
    const rawOrders: Record<string, unknown>[] = Array.isArray(d)
      ? d
      : ((d.orders ?? []) as Record<string, unknown>[]);
    const enrich = (order: Record<string, unknown>) => ({
      ...order,
      statusLabel: getListerOrderStatusLabel(order),
      expiresAt: resolveOrderExpiresAt(order),
    });
    return {
      orders: rawOrders.map(enrich),
      summary: Array.isArray(d)
        ? undefined
        : (d.summary as ListerOrdersSummary),
      pagination: Array.isArray(d)
        ? ordersData.pagination
        : (d.pagination ?? ordersData.pagination),
    };
  }, [ordersData]);

  return (
    <div className="w-full">
      {/* 1. Tab Switcher with Motion Pill */}
      <div className="relative mb-8 w-full overflow-hidden">
        <div className="w-[340px] sm:w-full max-w-full sm:overflow-visible overflow-x-auto hide-scrollbar scrollbar-hide">
          <div className="inline-flex gap-1 bg-[#F9F9F7] p-1 border border-gray-300 rounded-xl whitespace-nowrap">
            {TABS.map((tab) => {
              const isActive = activeTab === tab;
              const count = tabSummaryCount(tab, summary);

              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`relative shrink-0 px-4 sm:px-8 py-2.5 text-sm font-bold transition-colors duration-300 z-10 ${
                    isActive ? "text-white" : "text-gray-500 hover:text-black"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeOrderTab"
                      className="z-[-1] absolute inset-0 bg-[#33332D] rounded-lg"
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.5,
                      }}
                    />
                  )}
                  <Paragraph1 className="capitalize">
                    {TAB_LABEL[tab]}
                    {typeof count === "number" ? (
                      <span className="opacity-90 font-semibold">
                        {" "}
                        ({count})
                      </span>
                    ) : null}
                  </Paragraph1>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Orders List with Staggered Reveal */}
      <div className="space-y-4">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={`skeleton-${i}`}
                  className="bg-white p-4 border border-gray-300 rounded-2xl animate-pulse"
                >
                  <div className="bg-gray-200 mb-4 rounded w-1/3 h-4" />
                  <div className="bg-gray-100 rounded w-1/2 h-3" />
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              key={activeTab}
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={{
                visible: { transition: { staggerChildren: 0.1 } },
                hidden: {
                  transition: { staggerChildren: 0.05, staggerDirection: -1 },
                },
              }}
            >
              {orders.length > 0 ? (
                orders.map((order) => {
                  const row = order as Record<string, unknown>;
                  const isAvail = isListerAvailabilityRequestRow(row);
                  const isResale = isListerResaleOrder(row);
                  const expiresAt =
                    typeof row.expiresAt === "string"
                      ? row.expiresAt
                      : undefined;
                  const pendingApproval = isListerAvailabilityPending(row);
                  const showDeadlineUi = shouldShowListerAvailabilityDeadlineUi(
                    row,
                    expiresAt,
                    pendingApproval,
                  );
                  const created = row.createdAt
                    ? new Date(String(row.createdAt)).toLocaleDateString(
                        "en-US",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        },
                      )
                    : "—";
                  const total = Number(row.totalAmount ?? 0);

                  return (
                    <OrderCard
                      key={String(row.id)}
                      order={{
                        id: String(row.id),
                        orderNumber: String(row.orderNumber ?? ""),
                        date: created,
                        itemCount: Number(row.itemCount ?? 0),
                        amount: `₦${total.toLocaleString()}`,
                        statusLabel: String(row.statusLabel ?? ""),
                        expiresAt,
                      }}
                      showDeadlineUi={showDeadlineUi}
                      isAvailabilityRequest={isAvail}
                      isResale={isResale}
                    />
                  );
                })
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-20 border-2 border-gray-300 border-dashed rounded-2xl text-gray-400 text-center"
                >
                  <Paragraph3>
                    No {TAB_LABEL[activeTab].toLowerCase()} items found.
                  </Paragraph3>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {pagination && pagination.total > 0 ? (
        <Paragraph1 className="mt-6 text-gray-500 text-xs text-center">
          Page {pagination.page} of {pagination.pages} · {pagination.total}{" "}
          total
        </Paragraph1>
      ) : null}
    </div>
  );
};

// --- Sub-component: Order Card ---
const OrderCard: React.FC<{
  order: {
    id: string;
    orderNumber: string;
    date: string;
    itemCount: number;
    amount: string;
    statusLabel: string;
    expiresAt?: string;
  };
  showDeadlineUi: boolean;
  isAvailabilityRequest: boolean;
  isResale: boolean;
}> = ({ order, showDeadlineUi, isAvailabilityRequest, isResale }) => {
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [isExpired, setIsExpired] = useState(false);

  const hasExpiresAt = Boolean(order.expiresAt?.trim());

  // Initialize countdown timer
  useEffect(() => {
    if (!showDeadlineUi) {
      setIsExpired(false);
      setSecondsRemaining(0);
      return;
    }

    if (!hasExpiresAt) {
      setIsExpired(true);
      setSecondsRemaining(0);
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const expiresTime = new Date(order.expiresAt!).getTime();
      const remaining = Math.max(0, Math.floor((expiresTime - now) / 1000));

      if (remaining <= 0) {
        setIsExpired(true);
        setSecondsRemaining(0);
      } else {
        setSecondsRemaining(remaining);
        setIsExpired(false);
      }
    };

    updateTimer(); // Initial call
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [showDeadlineUi, hasExpiresAt, order.expiresAt]);

  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const isLowTime = secondsRemaining > 0 && secondsRemaining < 300;

  const statusBadgeClass = getListerOrderBadgeClassName(order.statusLabel);

  const borderClass =
    showDeadlineUi && isExpired
      ? "border-red-300"
      : showDeadlineUi && isLowTime
        ? "border-orange-300"
        : "border-gray-300";

  const badgeClass = showDeadlineUi
    ? isExpired
      ? "bg-red-100 text-red-700"
      : isLowTime
        ? "bg-orange-100 text-orange-700"
        : "bg-[#FFF9E5] text-[#D4A017]"
    : statusBadgeClass;

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      className={`bg-white border rounded-2xl p-4 mb-4 flex flex-col space-y-4 ${borderClass}`}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="space-y-1 min-w-0">
          <Paragraph1 className="font-bold text-black text-sm break-words uppercase tracking-tight">
            ORDER {order.orderNumber}
          </Paragraph1>
          {isAvailabilityRequest ? (
            <Paragraph1 className="font-medium text-[10px] text-gray-500 uppercase tracking-wide">
              Pre-checkout request
            </Paragraph1>
          ) : null}
          <div className="flex flex-wrap items-center gap-y-1 space-x-4 text-gray-500">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4 shrink-0" />
              <span className="font-medium text-xs">{order.date}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Package className="w-4 h-4 shrink-0" />
              <Paragraph1 className="font-medium text-xs">
                {order.itemCount} Items
              </Paragraph1>
            </div>
            {/* Countdown Timer for Pending Approval */}
            {showDeadlineUi ? (
              <div
                className={`flex items-center space-x-1 ${isExpired ? "text-red-600" : isLowTime ? "text-orange-500" : "text-gray-500"}`}
              >
                <Clock className="w-4 h-4 shrink-0" />
                <span
                  className={`text-xs font-bold ${isExpired ? "text-red-600" : isLowTime ? "text-orange-600" : ""}`}
                >
                  {!hasExpiresAt || isExpired
                    ? "Expired"
                    : formatTime(secondsRemaining)}
                </span>
              </div>
            ) : null}
          </div>
        </div>

        <Paragraph1
          className={`px-4 py-1.5 text-[10px] font-bold rounded-lg uppercase tracking-wider shrink-0 ${badgeClass}`}
        >
          {order.statusLabel}
        </Paragraph1>
      </div>

      <div className="bg-gray-300 w-full h-px" />

      <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-4">
        <div>
          <Paragraph1 className="mb-0.5 font-medium text-[10px] text-gray-400 uppercase">
            Total Amount
          </Paragraph1>
          <Paragraph1 className="font-bold text-black text-lg">
            {order.amount}
          </Paragraph1>
        </div>

        <Link
          href={`/listers/orders/${order.id}`}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 ${
            showDeadlineUi && isExpired
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "bg-[#33332D] text-white hover:bg-black"
          }`}
          onClick={(e) => {
            if (showDeadlineUi && isExpired) e.preventDefault();
          }}
        >
          View Details
        </Link>
      </div>

      {/* Low Time Warning */}
      {showDeadlineUi && hasExpiresAt && isLowTime && !isExpired && (
        <div className="bg-orange-50 -mx-4 -mb-4 px-4 py-3 pt-3 border-orange-200 border-t rounded-b-2xl">
          <Paragraph1 className="font-bold text-orange-700 text-xs">
            ⚠ Approval deadline approaching - {formatTime(secondsRemaining)}{" "}
            remaining
          </Paragraph1>
        </div>
      )}

      {/* Expired Notice */}
      {showDeadlineUi && isExpired && (
        <div className="bg-red-50 -mx-4 -mb-4 px-4 py-3 pt-3 border-red-200 border-t rounded-b-2xl">
          <Paragraph1 className="font-bold text-red-700 text-xs">
            ✕ This order&apos;s approval deadline has expired and will be
            auto-cancelled.
          </Paragraph1>
        </div>
      )}
    </motion.div>
  );
};

export default OrdersManagement;
