"use client";

import { Paragraph1 } from "@/common/ui/Text";
import {
  getRenterOrderStatusLabel,
  normalizeRenterOrderStatusKey,
} from "@/lib/renters/renterOrderStatus";

const STATUS_STYLES: Record<string, string> = {
  PROCESSING: "bg-gray-100 text-gray-700",
  CONFIRMED: "bg-blue-50 text-blue-800",
  IN_TRANSIT: "bg-amber-50 text-amber-900",
  DELIVERED: "bg-emerald-50 text-emerald-900",
  ACTIVE: "bg-emerald-50 text-emerald-900",
  COMPLETED: "bg-gray-100 text-gray-700",
  CANCELLED: "bg-red-50 text-red-800",
  RETURNED: "bg-gray-100 text-gray-700",
};

interface OrderDetailSummaryBarProps {
  orderData: {
    orderId?: string;
    status?: string;
    createdAt?: string;
  };
}

export default function OrderDetailSummaryBar({
  orderData,
}: OrderDetailSummaryBarProps) {
  const statusRaw = String(orderData.status ?? "");
  const statusKey = normalizeRenterOrderStatusKey(statusRaw);
  const statusLabel = getRenterOrderStatusLabel(statusRaw);
  const badgeClass =
    STATUS_STYLES[statusKey] ?? "bg-gray-100 text-gray-700";

  const orderDate = orderData.createdAt
    ? new Date(orderData.createdAt).toLocaleDateString("en-NG", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div className="flex flex-wrap justify-between items-center gap-2 bg-white px-3.5 py-3 border border-gray-200 rounded-xl">
      <div className="min-w-0">
        <Paragraph1 className="font-bold text-[10px] text-gray-400 uppercase tracking-wider">
          Order
        </Paragraph1>
        <Paragraph1 className="font-mono font-semibold text-gray-900 text-sm truncate">
          {orderData.orderId ?? "—"}
        </Paragraph1>
        {orderDate ? (
          <Paragraph1 className="text-gray-500 text-xs">Placed {orderDate}</Paragraph1>
        ) : null}
      </div>
      <span
        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${badgeClass}`}
      >
        {statusLabel}
      </span>
    </div>
  );
}
