"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { ONBOARDING_SECONDARY_TEXT } from "@/lib/onboarding/onboardingTypography";

type OnboardingShellProps = {
  step: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
  children: ReactNode;
  onBack?: () => void;
  onNext?: () => void;
  onSkip?: () => void;
  nextLabel?: string;
  skipLabel?: string;
  showBack?: boolean;
  showNext?: boolean;
  footer?: ReactNode;
  onSkipTour?: () => void;
  skipTourLabel?: string;
};

export function OnboardingShell({
  step,
  totalSteps,
  title,
  subtitle,
  children,
  onBack,
  onNext,
  onSkip,
  nextLabel = "Continue",
  skipLabel = "Skip for now",
  showBack = true,
  showNext = true,
  footer,
  onSkipTour,
  skipTourLabel = "Skip tour",
}: OnboardingShellProps) {
  const progress = ((step + 1) / totalSteps) * 100;

  return (
    <div className="flex flex-col justify-center items-center p-4 min-h-[100dvh] font-sans">
      <div className="relative flex flex-col bg-white/82 backdrop-blur-2xl p-6 md:p-10 border border-white/70 rounded-3xl w-full max-w-[600px] min-h-[min(720px,90vh)] shadow-[0_28px_90px_-24px_rgba(27,31,38,0.22)]">
        {onSkipTour ? (
          <button
            type="button"
            onClick={onSkipTour}
            className="top-6 right-6 absolute font-medium text-gray-500 text-base hover:text-gray-800 transition"
          >
            {skipTourLabel}
          </button>
        ) : null}
        <div className="flex flex-col items-center mb-6 text-center">
          <img src="/images/logo1.svg" alt="RELISTED" className="mb-4 w-10 h-10" />
          <Paragraph3 className="mb-1 font-bold text-gray-500 text-base uppercase tracking-widest">
            Step {step + 1} of {totalSteps}
          </Paragraph3>
          <div className="bg-gray-200 mb-4 rounded-full w-full h-2">
            <motion.div
              className="bg-black rounded-full h-2"
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex flex-col flex-1"
          >
            <div className="mb-6 text-center">
              <h1 className="mb-2 font-bold text-black text-2xl md:text-3xl">
                {title}
              </h1>
              {subtitle ? (
                <Paragraph1
                  className={`mx-auto max-w-md text-gray-600 ${ONBOARDING_SECONDARY_TEXT}`}
                >
                  {subtitle}
                </Paragraph1>
              ) : null}
            </div>

            <div className="flex-1">{children}</div>
          </motion.div>
        </AnimatePresence>

        {footer ?? (
          <div className="flex flex-col gap-3 mt-8 pt-4 border-gray-100 border-t">
            <div className="flex gap-3">
              {showBack && onBack ? (
                <button
                  type="button"
                  onClick={onBack}
                  className="flex flex-1 justify-center items-center gap-1 hover:bg-gray-50 py-3 border border-gray-200 rounded-lg font-medium text-gray-700 text-base transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
              ) : null}
              {showNext && onNext ? (
                <button
                  type="button"
                  onClick={onNext}
                  className="flex-1 bg-[#231F20] hover:bg-gray-800 py-3 rounded-lg font-semibold text-white text-base transition"
                >
                  {nextLabel}
                </button>
              ) : null}
            </div>
            {onSkip ? (
              <button
                type="button"
                onClick={onSkip}
                className="py-1 font-medium text-gray-500 text-base hover:text-gray-800 transition"
              >
                {skipLabel}
              </button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
