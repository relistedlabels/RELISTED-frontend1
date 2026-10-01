"use client";

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
    <div className="px-4 pt-3 pb-2 sm:px-5 sm:pb-4">
      <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
        {greetingForHour(now.getHours())}, {firstName} 👋
      </h1>
      <p className="mt-3 text-[13px] text-gray-500">
        {dateLabel} · Here&apos;s what needs your attention today.
      </p>
    </div>
  );
};

export default OverviewHeader;
