"use client";

import React from "react";
import { Calendar, Clock, ExternalLink } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import {
  formatLagosTime,
  formatLagosDate,
} from "@/lib/checkout/dispatchWindows";

export interface DispatchWindow {
  type: "OUTBOUND" | "RETURN" | "RESALE";
  window: {
    start: string;
    end: string;
  };
  mode: "DEFAULT" | "CUSTOM";
  scheduledDate: string;
  baseDate: string;
}

type WindowTracking = {
  trackingId?: string | null;
  providerTrackingUrl?: string | null;
};

interface DispatchWindowsDisplayProps {
  dispatchWindows?: DispatchWindow[];
  orderData?: {
    items?: Array<{ returnDue?: string }>;
  };
  /** Panel heading (default: Courier Schedule) */
  sectionTitle?: string;
  trackingByType?: Partial<
    Record<DispatchWindow["type"], WindowTracking>
  >;
}

const TYPE_LABELS: Record<string, string> = {
  OUTBOUND: "Rental delivery",
  RETURN: "Rental return",
  RESALE: "Resale delivery",
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  OUTBOUND: <Calendar size={16} />,
  RETURN: <Clock size={16} />,
  RESALE: <Calendar size={16} />,
};

const DispatchWindowsDisplay: React.FC<DispatchWindowsDisplayProps> = ({
  dispatchWindows,
  orderData: _orderData,
  sectionTitle = "Courier Schedule",
  trackingByType,
}) => {
  if (!dispatchWindows || dispatchWindows.length === 0) {
    return null;
  }

  return (
    <div className={sectionTitle ? "mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-4" : ""}>
      {sectionTitle ? (
        <Paragraph1 className="mb-3 font-bold text-[10px] text-gray-400 uppercase tracking-widest">
          {sectionTitle}
        </Paragraph1>
      ) : null}
      <div className="space-y-2">
        {dispatchWindows.map((dw) => {
          const startTime = formatLagosTime(dw.window.start);
          const endTime = formatLagosTime(dw.window.end);
          const date = formatLagosDate(dw.window.start, {
            includeWeekday: true,
          });
          const label = TYPE_LABELS[dw.type] || dw.type;
          const icon = TYPE_ICONS[dw.type] || <Calendar size={16} />;
          const tracking = trackingByType?.[dw.type];
          const trackingUrl = tracking?.providerTrackingUrl?.trim();

          return (
            <div
              key={`${dw.type}-${dw.window.start}-${dw.window.end}`}
              className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3"
            >
              <div className="shrink-0 rounded-full bg-gray-100 p-2 text-gray-700">
                {icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <Paragraph1 className="text-xs font-semibold text-gray-900">
                    {label}
                  </Paragraph1>
                  {trackingUrl ? (
                    <a
                      href={trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-blue-600 hover:text-blue-800"
                    >
                      Track
                      <ExternalLink size={10} aria-hidden />
                    </a>
                  ) : null}
                </div>
                <Paragraph1 className="mt-1 text-xs text-gray-600">
                  {startTime} to {endTime}
                </Paragraph1>
                <Paragraph1 className="mt-0.5 text-[10px] text-gray-400">
                  {date}
                </Paragraph1>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DispatchWindowsDisplay;
