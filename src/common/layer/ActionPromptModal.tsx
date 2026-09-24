"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import { cloudinaryOptimizedImageUrl } from "@/lib/media/cloudinaryOptimizedImageUrl";

type ActionPromptModalProps = {
  open: boolean;
  title: string;
  body: string;
  pickupWindowSummary?: string | null;
  imageUrl?: string | null;
  imageAlt?: string;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  onDismiss: () => void;
  isPrimaryLoading?: boolean;
  isSecondaryLoading?: boolean;
};

export function ActionPromptModal({
  open,
  title,
  body,
  pickupWindowSummary,
  imageUrl,
  imageAlt = "",
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  onDismiss,
  isPrimaryLoading = false,
  isSecondaryLoading = false,
}: ActionPromptModalProps) {
  const showImage = Boolean(imageUrl);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="Close prompt"
            className="fixed inset-0 z-[118] bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onDismiss}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="action-prompt-title"
            className="fixed inset-x-4 bottom-20 z-[119] mx-auto max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 xl:inset-x-auto xl:bottom-8 xl:right-8 xl:top-auto xl:w-full xl:max-w-md xl:translate-y-0"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <button
              type="button"
              onClick={onDismiss}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            {showImage ? (
              <div className="mb-3 overflow-hidden rounded-xl bg-gray-100">
                <img
                  src={cloudinaryOptimizedImageUrl(imageUrl!, {
                    preset: "card",
                  })}
                  alt={imageAlt}
                  className="h-36 w-full object-cover"
                />
              </div>
            ) : null}

            <div className="mb-3 min-w-0 space-y-1.5 pr-7">
              <h2
                id="action-prompt-title"
                className="font-bold text-gray-900 text-lg leading-snug"
              >
                {title}
              </h2>
              <Paragraph1 className="break-words text-gray-600 text-sm leading-relaxed">
                {pickupWindowSummary ? (
                  <>
                    <span className="font-semibold text-gray-900">
                      Pickup is {pickupWindowSummary}.
                    </span>{" "}
                  </>
                ) : null}
                {body}
              </Paragraph1>
            </div>

            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={onPrimary}
                disabled={isPrimaryLoading || isSecondaryLoading}
                className="rounded-lg bg-[#231F20] py-2.5 font-semibold text-white text-sm transition hover:bg-gray-800 disabled:pointer-events-none disabled:opacity-60"
              >
                {isPrimaryLoading ? "Working…" : primaryLabel}
              </button>
              {secondaryLabel && onSecondary ? (
                <button
                  type="button"
                  onClick={onSecondary}
                  disabled={isPrimaryLoading || isSecondaryLoading}
                  className="rounded-lg border border-gray-300 bg-white py-2.5 font-semibold text-gray-900 text-sm transition hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-60"
                >
                  {isSecondaryLoading ? "Working…" : secondaryLabel}
                </button>
              ) : null}
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
