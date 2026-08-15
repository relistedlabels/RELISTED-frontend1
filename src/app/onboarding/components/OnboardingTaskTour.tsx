"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import type { OnboardingTaskStep } from "@/lib/onboarding/onboardingTasks";
import {
  buildOnboardingTaskUrl,
  getOnboardingTaskById,
} from "@/lib/onboarding/onboardingTasks";
import { completeOnboardingTask } from "@/lib/onboarding/onboardingStorage";
import { useUserStore } from "@/store/useUserStore";

type TargetRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

const TOOLTIP_WIDTH = 320;
const TOOLTIP_HEIGHT = 280;
const TOOLTIP_GAP = 16;
const VIEWPORT_PADDING = 16;

function getTooltipPosition(targetRect: TargetRect): { top: number; left: number } {
  const cardWidth = Math.min(window.innerWidth * 0.92, TOOLTIP_WIDTH);
  const cardHeight = TOOLTIP_HEIGHT;

  const clampLeft = (left: number) =>
    Math.max(
      VIEWPORT_PADDING,
      Math.min(left, window.innerWidth - cardWidth - VIEWPORT_PADDING),
    );

  const clampTop = (top: number) =>
    Math.max(
      VIEWPORT_PADDING,
      Math.min(top, window.innerHeight - cardHeight - VIEWPORT_PADDING),
    );

  const overlapsTarget = (top: number, left: number) => {
    const bottom = top + cardHeight;
    const right = left + cardWidth;
    return (
      bottom > targetRect.top - TOOLTIP_GAP &&
      top < targetRect.top + targetRect.height + TOOLTIP_GAP &&
      right > targetRect.left - TOOLTIP_GAP &&
      left < targetRect.left + targetRect.width + TOOLTIP_GAP
    );
  };

  const fitsInViewport = (top: number, left: number) =>
    top >= VIEWPORT_PADDING &&
    left >= VIEWPORT_PADDING &&
    top + cardHeight <= window.innerHeight - VIEWPORT_PADDING &&
    left + cardWidth <= window.innerWidth - VIEWPORT_PADDING;

  const leftAlignedOnTarget = clampLeft(targetRect.left);

  const candidates = [
    {
      top: clampTop(targetRect.top + targetRect.height + TOOLTIP_GAP),
      left: leftAlignedOnTarget,
    },
    {
      top: clampTop(targetRect.top - cardHeight - TOOLTIP_GAP),
      left: leftAlignedOnTarget,
    },
    {
      top: clampTop(targetRect.top),
      left: clampLeft(targetRect.left + targetRect.width + TOOLTIP_GAP),
    },
    {
      top: clampTop(targetRect.top),
      left: clampLeft(targetRect.left - cardWidth - TOOLTIP_GAP),
    },
    {
      top: clampTop(window.innerHeight - cardHeight - VIEWPORT_PADDING),
      left: VIEWPORT_PADDING,
    },
    {
      top: VIEWPORT_PADDING,
      left: VIEWPORT_PADDING,
    },
  ];

  for (const candidate of candidates) {
    if (
      fitsInViewport(candidate.top, candidate.left) &&
      !overlapsTarget(candidate.top, candidate.left)
    ) {
      return candidate;
    }
  }

  return candidates[0];
}

type OnboardingTaskTourProps = {
  taskId: string;
  steps: readonly OnboardingTaskStep[];
  returnPath: string;
};

function waitForTarget(selector: string, attempts = 30): Promise<Element | null> {
  return new Promise((resolve) => {
    let tries = 0;
    const tick = () => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }
      tries += 1;
      if (tries >= attempts) {
        resolve(null);
        return;
      }
      window.setTimeout(tick, 120);
    };
    tick();
  });
}

const SPOTLIGHT_PADDING = 8;

const TOUR_Z = {
  backdrop: 200,
  ring: 201,
  tooltip: 210,
} as const;

const backdropPanelClass =
  "fixed bg-black/55 border-0 p-0 cursor-default pointer-events-auto";

function TourBackdrop({
  targetRect,
  onDismiss,
}: {
  targetRect: TargetRect | null;
  onDismiss: () => void;
}) {
  const clickPanelClass =
    "fixed border-0 p-0 cursor-default pointer-events-auto bg-transparent";

  if (!targetRect) {
    return (
      <button
        type="button"
        aria-label="Dismiss guide"
        className={`inset-0 ${backdropPanelClass}`}
        style={{ zIndex: TOUR_Z.backdrop }}
        onClick={onDismiss}
      />
    );
  }

  const top = Math.max(0, targetRect.top - SPOTLIGHT_PADDING);
  const left = Math.max(0, targetRect.left - SPOTLIGHT_PADDING);
  const width = targetRect.width + SPOTLIGHT_PADDING * 2;
  const height = targetRect.height + SPOTLIGHT_PADDING * 2;
  const bottom = top + height;
  const right = left + width;
  const panelZ = { zIndex: TOUR_Z.backdrop };

  return (
    <>
      {/* Dimming via one continuous shadow (avoids 1px seams between panels) */}
      <div
        className="pointer-events-none fixed rounded-xl ring-4 ring-white/90"
        style={{
          top,
          left,
          width,
          height,
          zIndex: TOUR_Z.ring,
          boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.55)",
        }}
        aria-hidden
      />

      {/* Transparent click targets around the spotlight hole */}
      <button
        type="button"
        aria-label="Dismiss guide"
        className={clickPanelClass}
        style={{ top: 0, left: 0, right: 0, height: top + 1, ...panelZ }}
        onClick={onDismiss}
      />
      <button
        type="button"
        aria-hidden
        tabIndex={-1}
        className={clickPanelClass}
        style={{ top: bottom - 1, left: 0, right: 0, bottom: 0, ...panelZ }}
        onClick={onDismiss}
      />
      <button
        type="button"
        aria-hidden
        tabIndex={-1}
        className={clickPanelClass}
        style={{ top: top - 1, left: 0, width: left + 1, height: height + 2, ...panelZ }}
        onClick={onDismiss}
      />
      <button
        type="button"
        aria-hidden
        tabIndex={-1}
        className={clickPanelClass}
        style={{ top: top - 1, left: right - 1, right: 0, height: height + 2, ...panelZ }}
        onClick={onDismiss}
      />
    </>
  );
}

export function OnboardingTaskTour({
  taskId,
  steps,
  returnPath,
}: OnboardingTaskTourProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = useUserStore((s) => s.userId);
  const task = useMemo(() => getOnboardingTaskById(taskId), [taskId]);

  const taskStep = Math.min(
    Math.max(Number(searchParams.get("taskStep") ?? "0"), 0),
    steps.length - 1,
  );

  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const minimizeTour = () => setIsMinimized(true);
  const currentStep = steps[taskStep];
  const isLastStep = taskStep === steps.length - 1;
  const tooltipPosition = useMemo(
    () => (targetRect ? getTooltipPosition(targetRect) : null),
    [targetRect],
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const syncTarget = async () => {
      const element = await waitForTarget(currentStep.target);
      if (cancelled || !element) {
        setTargetRect(null);
        return;
      }

      element.scrollIntoView({ behavior: "smooth", block: "center" });
      window.setTimeout(() => {
        if (cancelled) return;
        const rect = element.getBoundingClientRect();
        setTargetRect({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        });
      }, 250);
    };

    syncTarget();

    const handleResize = () => {
      const element = document.querySelector(currentStep.target);
      if (!element) return;
      const rect = element.getBoundingClientRect();
      setTargetRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize, true);

    return () => {
      cancelled = true;
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize, true);
    };
  }, [currentStep.target, taskStep]);

  useEffect(() => {
    if (isMinimized) return;

    const element = document.querySelector(currentStep.target);
    if (!(element instanceof HTMLElement)) return;

    element.classList.add("relative");
    return () => {
      element.classList.remove("relative");
    };
  }, [currentStep.target, taskStep, isMinimized]);

  useEffect(() => {
    setIsMinimized(false);
  }, [taskStep, taskId]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        minimizeTour();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const finishTour = () => {
    if (task) {
      completeOnboardingTask(userId, task.role);
    }
    router.replace(returnPath);
  };

  const goToStep = (nextStep: number) => {
    if (!task) return;
    router.replace(buildOnboardingTaskUrl(task, nextStep));
  };

  if (!task || !isMounted) return null;

  function renderCardContent() {
    return (
      <>
        <div className="flex items-center gap-3 mb-1 pr-6">
          <Paragraph3 className="font-medium text-gray-500 text-base">
            {taskStep + 1} of {steps.length}
          </Paragraph3>
          <button
            type="button"
            onClick={finishTour}
            className="font-medium text-gray-500 text-sm hover:text-gray-800 transition shrink-0"
          >
            Skip tour
          </button>
        </div>
        <Paragraph1 className="mb-1 font-semibold text-gray-900 text-base">
          {currentStep.title}
        </Paragraph1>
        <Paragraph3 className="mb-4 text-gray-600 text-base leading-relaxed">
          {currentStep.body}
        </Paragraph3>

        <div className="flex gap-2">
          {taskStep > 0 ? (
            <button
              type="button"
              onClick={() => goToStep(taskStep - 1)}
              className="flex-1 hover:bg-gray-50 py-2.5 border border-gray-200 rounded-lg font-medium text-gray-700 text-base transition"
            >
              Back
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => {
              if (isLastStep) {
                finishTour();
                return;
              }
              goToStep(taskStep + 1);
            }}
            className="flex-1 bg-[#231F20] hover:bg-gray-800 py-2.5 rounded-lg font-semibold text-white text-base transition"
          >
            {isLastStep ? "Continue tour" : "Next"}
          </button>
        </div>
      </>
    );
  }

  const tourUi = isMinimized ? (
    <button
      type="button"
      onClick={() => setIsMinimized(false)}
      className="right-6 bottom-6 fixed bg-[#231F20] hover:bg-gray-800 shadow-lg px-4 py-2.5 rounded-full font-semibold text-white text-base transition pointer-events-auto"
      style={{ zIndex: TOUR_Z.tooltip }}
    >
      Resume Tour
    </button>
  ) : (
    <>
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: TOUR_Z.backdrop }}
        aria-hidden
      >
        <TourBackdrop targetRect={targetRect} onDismiss={minimizeTour} />
      </div>

      <div
        className={`fixed isolate bg-white shadow-2xl p-5 border border-gray-200 rounded-2xl w-[min(92vw,320px)] pointer-events-auto ${
          tooltipPosition ? "" : "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        }`}
        style={{
          zIndex: TOUR_Z.tooltip,
          ...(tooltipPosition
            ? {
                top: tooltipPosition.top,
                left: tooltipPosition.left,
              }
            : {}),
        }}
        role="dialog"
        aria-live="polite"
        aria-label="Onboarding guide"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={minimizeTour}
          className="top-3 right-3 absolute hover:bg-gray-100 p-1 rounded-md text-gray-400 hover:text-gray-700 transition"
          aria-label="Close guide"
        >
          <X className="w-4 h-4" />
        </button>
        {renderCardContent()}
      </div>
    </>
  );

  return createPortal(tourUi, document.body);
}
