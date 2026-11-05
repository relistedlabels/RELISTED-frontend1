"use client";

import { useEffect, useRef } from "react";
import type { OperationsPauseState } from "@/lib/operations/operationsPause";
import {
  clearOperationsPauseBannerHeight,
  syncOperationsPauseBannerHeight,
} from "@/lib/operations/operationsPauseBannerHeight";
import { operationsPauseCopy } from "@/lib/operations/operationsPauseCopy";

type OperationsPauseBannerProps = {
  pause: OperationsPauseState;
  onOpenAnnouncement: () => void;
  /** Fixed under lister/admin chrome; inline stacks inside the shop header. */
  placement?: "inline" | "fixed";
};

export function OperationsPauseBanner({
  pause,
  onOpenAnnouncement,
  placement = "inline",
}: OperationsPauseBannerProps) {
  const copy = operationsPauseCopy.banner;
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (placement !== "fixed") return;

    const node = bannerRef.current;
    if (!node) return;

    const update = () => syncOperationsPauseBannerHeight(node);
    update();

    const observer = new ResizeObserver(update);
    observer.observe(node);
    window.addEventListener("resize", update);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
      clearOperationsPauseBannerHeight();
    };
  }, [placement]);

  return (
    <div
      ref={bannerRef}
      className={`w-full shrink-0 border-b border-white/10 bg-[#0a0a0a] text-white ${
        placement === "fixed"
          ? "fixed top-0 left-0 right-0 z-[60]"
          : ""
      }`}
      role="status"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2 sm:px-6 md:py-2.5">
        <p className="min-w-0 flex-1 text-[11px] leading-snug sm:text-xs">
          <span className="font-medium text-white">{copy.lead()}</span>
          <span className="text-white/60">{copy.body(pause)}</span>
        </p>
        <button
          type="button"
          onClick={onOpenAnnouncement}
          className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/75 underline-offset-2 transition hover:text-white hover:underline sm:text-[11px]"
        >
          {copy.readUpdate}
        </button>
      </div>
    </div>
  );
}
