"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  DEFAULT_OPERATIONS_PAUSE_CLOSED_FROM,
  DEFAULT_OPERATIONS_PAUSE_RESUME_LABEL,
  OPERATIONS_PAUSE_HERO_SRC,
  type OperationsPauseState,
} from "@/lib/operations/operationsPause";
import { operationsPauseCopy } from "@/lib/operations/operationsPauseCopy";
import {
  OPERATIONS_PAUSE_HERO_CANDIDATES,
  isOperationsPauseHeroPreviewEnabled,
} from "@/lib/operations/operationsPauseHeroCandidates";
import { useSearchParams } from "next/navigation";

type OperationsPauseAnnouncementModalProps = {
  open: boolean;
  pause: OperationsPauseState;
  onContinue: () => void;
  /** When true, closing does not persist session dismiss (hero picker). */
  heroPreview?: boolean;
};

export function OperationsPauseAnnouncementModal({
  open,
  pause,
  onContinue,
  heroPreview = false,
}: OperationsPauseAnnouncementModalProps) {
  const modal = operationsPauseCopy.modal;
  const [mounted, setMounted] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  const searchParams = useSearchParams();
  const previewFromUrl = isOperationsPauseHeroPreviewEnabled(searchParams);
  const showHeroPicker = heroPreview || previewFromUrl;

  const heroEntry = showHeroPicker
    ? OPERATIONS_PAUSE_HERO_CANDIDATES[previewIndex]
    : null;
  const heroSrc = heroEntry?.src ?? OPERATIONS_PAUSE_HERO_SRC;
  const heroLabel = heroEntry?.label ?? OPERATIONS_PAUSE_HERO_SRC.split("/").pop();

  const goPrev = useCallback(() => {
    setPreviewIndex(
      (i) =>
        (i - 1 + OPERATIONS_PAUSE_HERO_CANDIDATES.length) %
        OPERATIONS_PAUSE_HERO_CANDIDATES.length,
    );
  }, []);

  const goNext = useCallback(() => {
    setPreviewIndex((i) => (i + 1) % OPERATIONS_PAUSE_HERO_CANDIDATES.length);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open || !showHeroPicker) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, showHeroPicker, goPrev, goNext]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence mode="wait">
      {open ? (
        <div
          key="operations-pause-overlay"
          className="fixed inset-0 z-[250] flex items-end justify-center md:items-center md:p-8"
        >
          <motion.button
            type="button"
            aria-label="Dismiss announcement"
            className="absolute inset-0 bg-black/65"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onContinue}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="operations-pause-title"
            className="relative z-[1] flex w-full max-h-[min(92dvh,780px)] flex-col overflow-hidden rounded-t-[28px] bg-[#0a0a0a] shadow-2xl md:max-h-[min(85vh,620px)] md:max-w-[860px] md:flex-row md:rounded-2xl"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <div
              className="flex h-11 shrink-0 items-center justify-center md:hidden"
              aria-hidden
            >
              <span className="h-1 w-12 rounded-full bg-white/35" />
            </div>

            <button
              type="button"
              onClick={onContinue}
              className="absolute top-4 right-4 z-20 hidden rounded-full p-2 text-white/70 transition hover:bg-white/10 hover:text-white md:block"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <div
              className="relative shrink-0 md:h-auto md:min-h-[420px] md:w-[42%]"
              aria-hidden={!showHeroPicker}
            >
              <button
                type="button"
                onClick={onContinue}
                className="absolute top-3 right-3 z-20 rounded-full bg-black/55 p-2.5 text-white shadow-sm backdrop-blur-md transition hover:bg-black/75 md:hidden"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={heroSrc}
                src={heroSrc}
                alt=""
                className="block h-[min(30dvh,240px)] w-full object-cover object-[center_40%] sm:h-[min(34dvh,280px)] md:absolute md:inset-0 md:h-full md:max-h-none md:object-[center_30%]"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-[#0a0a0a] md:bg-gradient-to-r md:from-transparent md:to-[#0a0a0a]" />
              {showHeroPicker ? (
                <div className="absolute bottom-3 left-3 right-3 z-10 rounded-xl border border-white/25 bg-black/80 px-3 py-2.5 text-center backdrop-blur-sm">
                  <p className="font-mono text-[11px] font-semibold tracking-wide text-white">
                    {heroLabel}
                  </p>
                  <p className="mt-0.5 text-[10px] text-white/55">
                    {previewIndex + 1} of {OPERATIONS_PAUSE_HERO_CANDIDATES.length}
                  </p>
                  <div className="mt-2 flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        goPrev();
                      }}
                      className="inline-flex items-center gap-1 rounded-full border border-white/30 bg-white/10 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-white/20"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
                      Prev
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        goNext();
                      }}
                      className="inline-flex items-center gap-1 rounded-full border border-white/30 bg-white/10 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-white/20"
                    >
                      Next
                      <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex min-h-0 min-w-0 flex-1 flex-col md:justify-center md:py-8">
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pt-4 text-white [-webkit-overflow-scrolling:touch] md:flex-none md:overflow-visible md:px-10 md:pt-0">
                {showHeroPicker ? (
                  <p className="mb-4 rounded-lg border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-left text-[11px] leading-snug text-amber-100">
                    Hero preview mode. Use Prev/Next or arrow keys. Screenshot
                    the filename you want, then tell us which label to ship.
                  </p>
                ) : null}

                <div className="flex w-full flex-col gap-8 md:max-w-[26rem] md:gap-9">
                  <div className="space-y-3">
                    <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/55">
                      {modal.eyebrow}
                    </p>
                    <h2
                      id="operations-pause-title"
                      className="text-balance font-serif text-[1.875rem] leading-[1.12] text-white md:text-[2rem]"
                    >
                      {modal.headline}
                    </h2>
                  </div>

                  <div className="space-y-4 text-[15px] leading-[1.65] text-white/75">
                    {modal.paragraphs(pause).map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>

                  <div className="space-y-2 pt-1">
                    <p className="font-serif text-[1.0625rem] leading-snug text-white/90">
                      {modal.signOff}
                    </p>
                    <p className="text-[13px] leading-relaxed text-white/45">
                      {modal.team[0]}
                      <br />
                      {modal.team[1]}
                    </p>
                  </div>
                </div>
              </div>

              <div className="shrink-0 border-t border-white/10 bg-[#0a0a0a] px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 sm:px-6 md:mt-8 md:border-0 md:bg-transparent md:px-10 md:pb-0 md:pt-0">
                <button
                  type="button"
                  onClick={onContinue}
                  className="w-full rounded-full bg-white px-5 py-3.5 text-sm font-semibold text-[#0a0a0a] transition active:scale-[0.99] hover:bg-white/90"
                >
                  {modal.continue}
                </button>
                <p className="mt-2 flex items-center justify-center gap-1 text-[10px] text-white/30 md:hidden">
                  <ChevronDown className="h-3 w-3" aria-hidden />
                  {modal.scrollHint}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

/** Pause state used only for hero preview (no API/env required). */
export const OPERATIONS_PAUSE_HERO_PREVIEW_PAUSE: OperationsPauseState = {
  active: true,
  resumeLabel: DEFAULT_OPERATIONS_PAUSE_RESUME_LABEL,
  closedFromLabel: DEFAULT_OPERATIONS_PAUSE_CLOSED_FROM,
};
