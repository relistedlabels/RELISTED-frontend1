"use client";

import { Paragraph1 } from "@/common/ui/Text";
import {
  getRenterOrderBadgeClassName,
  getRenterOrderStatusLabel,
} from "@/lib/renters/renterOrderStatus";

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
  const statusLabel = getRenterOrderStatusLabel(statusRaw);
  const badgeClass = getRenterOrderBadgeClassName(statusLabel);

  const orderDate = orderData.createdAt
    ? new Date(orderData.createdAt).toLocaleDateString("en-NG", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-3">
      <div className="min-w-0">
        <Paragraph1 className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
          Order
        </Paragraph1>
        <Paragraph1 className="truncate font-mono text-sm font-semibold text-gray-900">
          {orderData.orderId ?? "—"}
        </Paragraph1>
        {orderDate ? (
          <Paragraph1 className="text-xs text-gray-500">Placed {orderDate}</Paragraph1>
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
