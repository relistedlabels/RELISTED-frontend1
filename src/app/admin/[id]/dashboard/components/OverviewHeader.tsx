"use client";

import { Paragraph1, Paragraph2 } from "@/common/ui/Text";
import { useMe } from "@/lib/queries/auth/useMe";

const greetingForHour = (hour: number): string => {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const OverviewHeader = () => {
  const { data: user } = useMe();
  const now = new Date();
  const firstName = (user?.name || "").trim().split(/\s+/)[0] || "there";
  const dateLabel = now.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="px-4 pb-4 pt-3 sm:px-5">
      <Paragraph2 className="text-xl font-bold leading-7 tracking-tight text-gray-900 sm:text-2xl">
        {greetingForHour(now.getHours())}, {firstName} 👋
      </Paragraph2>
      <Paragraph1 className="mt-1 text-sm leading-5 text-gray-500">
        {dateLabel} · Needs your attention today.
      </Paragraph1>
    </div>
  );
};

export default OverviewHeader;
