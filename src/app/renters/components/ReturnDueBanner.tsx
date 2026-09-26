"use client";

import { Truck } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import StartReturnAction from "./StartReturnAction";
import { ReturnPackageItems } from "@/lib/orders/returnPackageItems";

interface ReturnDueBannerProps {
  orderId: string;
  shipmentId?: string | null;
  headline: string;
  isDueToday: boolean;
  isOverdue: boolean;
  productLabel?: string;
  items?: Array<{ name: string; imageUrl?: string | null }>;
}

export default function ReturnDueBanner({
  orderId,
  shipmentId,
  headline,
  isDueToday,
  isOverdue,
  productLabel,
  items = [],
}: ReturnDueBannerProps) {
  const body = isOverdue
    ? "Your return window has started. Submit your return request now so pickup can be scheduled."
    : isDueToday
      ? "Your return window is today. Start your return request now to schedule pickup."
      : "Your return window is open. Start your return request when you are ready.";

  return (
    <div className="rounded-xl border border-amber-200/80 bg-amber-50/60 p-3.5">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black text-white">
          <Truck size={18} aria-hidden />
        </div>
        <div className="min-w-0 flex-1 space-y-2.5">
          <div className="space-y-0.5">
            <Paragraph1 className="text-sm font-semibold leading-snug text-gray-900">
              {headline}
            </Paragraph1>
            {productLabel ? (
              <Paragraph1 className="text-xs font-medium text-gray-700">
                {productLabel}
              </Paragraph1>
            ) : null}
          </div>
          <Paragraph1 className="text-xs leading-relaxed text-gray-700">
            {body}
          </Paragraph1>
          {items.length > 0 ? <ReturnPackageItems items={items} /> : null}
          <StartReturnAction
            orderId={orderId}
            shipmentId={shipmentId}
            variant="footer"
            urgent
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
