"use client";

import { useEffect, useMemo, useState } from "react";
import { useMe } from "@/lib/queries/auth/useMe";
import VaultClosetSaleNotifyModal from "./VaultClosetSaleNotifyModal";

const SALE_START = new Date(2026, 4, 15, 0, 0, 0);
const SALE_END = new Date(2026, 4, 17, 23, 59, 59, 999);

function pad2(n: number) {
  return n.toString().padStart(2, "0");
}

function formatRemaining(ms: number) {
  if (ms <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
}

export default function VaultClosetSaleBanner() {
  const [tick, setTick] = useState(0);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const { data: me } = useMe();

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const { target, phase } = useMemo(() => {
    const now = Date.now();
    if (now > SALE_END.getTime()) {
      return { target: null as Date | null, phase: "ended" as const };
    }
    if (now < SALE_START.getTime()) {
      return { target: SALE_START, phase: "before" as const };
    }
    return { target: SALE_END, phase: "during" as const };
  }, [tick]);

  if (phase === "ended" || target === null) {
    return null;
  }

  const remaining = target.getTime() - Date.now();
  const { days, hours, minutes, seconds } = formatRemaining(remaining);

  return (
    <>
      <VaultClosetSaleNotifyModal
        open={notifyOpen}
        onClose={() => setNotifyOpen(false)}
        defaultEmail={me?.email ?? ""}
      />
      <div
        className="fixed left-0 right-0 z-45 top-20 xl:top-19.25 border-b border-white/10 bg-neutral-950 text-white shadow-md"
        role="status"
        aria-live="polite"
      >
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-3 px-4 py-2.5 text-center sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-2 sm:text-left">
          <div className="space-y-0.5">
            <p className="text-sm font-semibold tracking-wide sm:text-base">
              Shop The Vault Closet Sale
            </p>
            <p className="text-xs text-white/75 sm:text-sm">May 15th - May 17th</p>
          </div>
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-baseline sm:gap-4">
            <div className="flex items-baseline gap-1 font-mono text-sm tabular-nums tracking-tight sm:text-base">
              <span className="text-white/60">
                {phase === "before" ? "Starts in" : "Ends in"}
              </span>
              <span className="rounded bg-white/10 px-1.5 py-0.5 font-semibold text-amber-100">
                {pad2(days)}d
              </span>
              <span className="text-white/40">:</span>
              <span className="rounded bg-white/10 px-1.5 py-0.5 font-semibold text-amber-100">
                {pad2(hours)}h
              </span>
              <span className="text-white/40">:</span>
              <span className="rounded bg-white/10 px-1.5 py-0.5 font-semibold text-amber-100">
                {pad2(minutes)}m
              </span>
              <span className="text-white/40">:</span>
              <span className="rounded bg-white/10 px-1.5 py-0.5 font-semibold text-amber-100">
                {pad2(seconds)}s
              </span>
            </div>
            {phase === "before" && (
              <button
                type="button"
                onClick={() => setNotifyOpen(true)}
                className="shrink-0 rounded border border-amber-200/40 bg-amber-100/10 px-3 py-1.5 text-xs font-semibold text-amber-100 hover:bg-amber-100/20 sm:text-sm"
              >
                Join waitlist
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
