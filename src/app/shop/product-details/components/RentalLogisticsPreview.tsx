"use client";

import { Paragraph1 } from "@/common/ui/Text";
import { addCalendarDaysLocal } from "@/lib/dates/formatDateOnlyLocal";

function formatShortDate(d: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(d);
}

type RentalLogisticsPreviewProps = {
  startDate: Date;
  rentalDays: number;
};

/** Wear-window summary at availability check. Times live in dispatch picker. */
export default function RentalLogisticsPreview({
  startDate,
  rentalDays,
}: RentalLogisticsPreviewProps) {
  if (rentalDays <= 0) return null;

  const wearEnd = addCalendarDaysLocal(startDate, Math.max(0, rentalDays - 1));

  return (
    <div className="bg-gray-50 p-4 border border-gray-100 rounded-2xl">
      <Paragraph1 className="mb-2 font-semibold text-[11px] text-gray-500 uppercase tracking-[0.2em]">
        Your rental dates
      </Paragraph1>
      <Paragraph1 className="font-semibold text-gray-900 text-base">
        {formatShortDate(startDate)} – {formatShortDate(wearEnd)}
        <span className="ml-2 font-normal text-gray-600 text-sm">
          ({rentalDays}-day rental)
        </span>
      </Paragraph1>
    </div>
  );
}
