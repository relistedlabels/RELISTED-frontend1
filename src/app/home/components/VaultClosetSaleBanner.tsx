"use client";

import { useEffect, useMemo, useState } from "react";
import { useMe } from "@/lib/queries/auth/useMe";
import { ParagraphAny } from "@/common/ui/Text";
import Button from "@/common/ui/Button";
import {
  VAULT_CLOSET_SALE_END,
  VAULT_CLOSET_SALE_START,
} from "@/lib/vaultClosetSaleDates";
import VaultClosetSaleNotifyModal from "./VaultClosetSaleNotifyModal";

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

function CountUnit({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center min-w-9 sm:min-w-10">
      <span className="font-medium tabular-nums text-[11px] text-black sm:text-[13px] leading-none">
        {value}
      </span>
      <span className="mt-0.5 font-medium text-[7px] text-black/55 sm:text-[8px] uppercase tracking-[0.08em]">
        {label}
      </span>
    </div>
  );
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
    if (now > VAULT_CLOSET_SALE_END.getTime()) {
      return { target: null as Date | null, phase: "ended" as const };
    }
    if (now < VAULT_CLOSET_SALE_START.getTime()) {
      return { target: VAULT_CLOSET_SALE_START, phase: "before" as const };
    }
    return { target: VAULT_CLOSET_SALE_END, phase: "during" as const };
  }, [tick]);

  if (phase === "ended" || target === null) {
    return null;
  }

  const remaining = target.getTime() - Date.now();
  const { days, hours, minutes, seconds } = formatRemaining(remaining);
  const dayStr = days > 99 ? String(days) : pad2(days);

  return (
    <>
      <VaultClosetSaleNotifyModal
        open={notifyOpen}
        onClose={() => setNotifyOpen(false)}
        defaultEmail={me?.email ?? ""}
      />
      <div
        className="z-40 relative bg-white border-black/10 border-b w-full text-black"
        role="status"
        aria-live="polite"
      >
        <div className="mx-auto px-4 sm:px-5 pt-2 sm:pt-2.5 pb-1 sm:pb-1.5 container">
          <div className="flex flex-col items-center text-center">
            <ParagraphAny className="font-extrabold text-[16px] text-black sm:text-[16px] md:text-[20px] uppercase tracking-[0.11em] sm:tracking-widest">
              Shop the Vault Closet sale
            </ParagraphAny>

            <div
              className="flex justify-center items-start gap-2 sm:gap-3 mt-1 sm:mt-1.5"
              aria-label={
                phase === "before"
                  ? "Time until sale starts"
                  : "Time until sale ends"
              }
            >
              <CountUnit value={dayStr} label="Days" />
              <span
                className="self-center font-light text-[10px] text-black/20 sm:text-xs leading-none"
                aria-hidden
              >
                :
              </span>
              <CountUnit value={pad2(hours)} label="Hours" />
              <span
                className="self-center font-light text-[10px] text-black/20 sm:text-xs leading-none"
                aria-hidden
              >
                :
              </span>
              <CountUnit value={pad2(minutes)} label="Minutes" />
              <span
                className="self-center font-light text-[10px] text-black/20 sm:text-xs leading-none"
                aria-hidden
              >
                :
              </span>
              <CountUnit value={pad2(seconds)} label="Seconds" />
            </div>
          </div>
        </div>

        <div className="bg-neutral-100 border-black/10 border-t w-full">
          <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 sm:gap-x-6 mx-auto px-4 sm:px-5 py-2 sm:py-2.5 container">
            <p className="font-light text-[10px] text-black sm:text-[12px] md:text-[14px] text-center uppercase tracking-[0.12em]">
              May 15th - May 17th
            </p>
            {phase === "before" && (
              <>
                <span
                  className="text-black/25 text-xs"
                  aria-hidden
                >
                  |
                </span>
                <Button
                  type="button"
                  text="Join Waitlist"
                  simpleHover
                  responsive
                  onClick={() => setNotifyOpen(true)}
                  backgroundColor="bg-black"
                  color="text-white"
                  border="border border-black"
                  additionalClasses="shrink-0 uppercase tracking-wide hover:bg-white hover:text-black"
                />
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
