"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Compass, X } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";

type OnboardingPromptModalProps = {
  open: boolean;
  title: string;
  body: string;
  onTakeTour: () => void;
  onNotNow: () => void;
  onDontShowAgain: () => void;
};

export function OnboardingPromptModal({
  open,
  title,
  body,
  onTakeTour,
  onNotNow,
  onDontShowAgain,
}: OnboardingPromptModalProps) {
  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="Close tour prompt"
            className="fixed inset-0 z-[120] bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onNotNow}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="onboarding-prompt-title"
            className="fixed inset-x-4 bottom-20 z-[121] mx-auto max-w-md rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 xl:bottom-8 xl:right-8 xl:left-auto xl:translate-y-0"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <button
              type="button"
              onClick={onNotNow}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-4 flex items-start gap-3 pr-6">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-100">
                <Compass className="h-5 w-5 text-gray-800" aria-hidden />
              </div>
              <div>
                <h2
                  id="onboarding-prompt-title"
                  className="mb-1 font-bold text-gray-900 text-lg"
                >
                  {title}
                </h2>
                <Paragraph1 className="text-gray-600 text-sm leading-relaxed">
                  {body}
                </Paragraph1>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={onTakeTour}
                className="rounded-lg bg-[#231F20] py-3 font-semibold text-white text-sm transition hover:bg-gray-800"
              >
                Take the tour
              </button>
              <button
                type="button"
                onClick={onNotNow}
                className="rounded-lg py-2 font-medium text-gray-600 text-sm transition hover:text-gray-900"
              >
                Not now
              </button>
              <button
                type="button"
                onClick={onDontShowAgain}
                className="py-1 font-medium text-gray-400 text-xs transition hover:text-gray-600"
              >
                Don&apos;t show this again
              </button>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
