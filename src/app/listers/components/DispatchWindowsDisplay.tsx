"use client";

import React from "react";
import { Calendar, Clock } from "lucide-react";
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

interface DispatchWindowsDisplayProps {
  dispatchWindows?: DispatchWindow[];
  orderData?: {
    items?: Array<{ returnDue?: string }>;
  };
  /** Panel heading (default: Courier Schedule) */
  sectionTitle?: string;
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

          return (
            <div
              key={`${dw.type}-${dw.window.start}-${dw.window.end}`}
              className="flex items-center gap-3 bg-white p-3 border border-gray-200 rounded-xl"
            >
              <div className="bg-gray-100 p-2 rounded-full text-gray-700 shrink-0">
                {icon}
              </div>
              <div className="flex-1 min-w-0">
                <Paragraph1 className="font-semibold text-gray-900 text-xs">
                  {label}
                </Paragraph1>
                <Paragraph1 className="mt-1 text-gray-600 text-xs">
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
