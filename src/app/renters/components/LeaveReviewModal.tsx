"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Star, X } from "lucide-react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { buttonPrimary, buttonPrimaryFull } from "@/common/ui/buttonClasses";
import { dialogBackdrop, dialogCard } from "@/common/ui/dashboardClasses";
import { useSubmitReview } from "@/lib/mutations/renters/useSubmitReview";
import { skipReviewPrompt } from "@/lib/reviews/reviewPromptStorage";
import { toast } from "sonner";

type LeaveReviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  itemLabel?: string | null;
  context?: "delivery" | "return";
};

export default function LeaveReviewModal({
  isOpen,
  onClose,
  orderId,
  itemLabel,
  context = "delivery",
}: LeaveReviewModalProps) {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<"form" | "success">("form");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const isMountedRef = useRef(true);
  const submitReview = useSubmitReview();

  useEffect(() => {
    setMounted(true);
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setStep("form");
      setRating(0);
      setHoverRating(0);
      setComment("");
    }
  }, [isOpen]);

  const handleClose = () => {
    onClose();
  };

  const handleSkip = () => {
    skipReviewPrompt(orderId);
    handleClose();
  };

  const handleSubmit = async () => {
    if (rating < 1) {
      toast.error("Select a rating to continue.");
      return;
    }

    try {
      await submitReview.mutateAsync({
        orderId,
        rating,
        comment: comment.trim(),
      });
      if (!isMountedRef.current) return;
      setStep("success");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not submit your review.",
      );
    }
  };

  const title =
    context === "return"
      ? "How was your rental?"
      : "How was your order?";
  const lead = itemLabel
    ? `Share your experience with ${itemLabel}.`
    : "Share your experience with the lister.";

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className={`${dialogBackdrop} z-[9999]`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className={`${dialogCard} max-h-[90vh] overflow-y-auto rounded-lg p-0`}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-gray-100 bg-white p-4">
              <Paragraph3 className="font-bold text-gray-900 text-lg">
                Leave a review
              </Paragraph3>
              <button
                type="button"
                onClick={handleClose}
                className="text-gray-400 transition hover:text-gray-600"
                aria-label="Close"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4 p-6">
              {step === "form" ? (
                <>
                  <div className="space-y-1">
                    <Paragraph1 className="font-semibold text-gray-900">
                      {title}
                    </Paragraph1>
                    <Paragraph1 className="text-sm text-gray-600">{lead}</Paragraph1>
                  </div>

                  <div className="flex justify-center gap-2 py-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="transition focus:outline-none"
                      >
                        <Star
                          size={36}
                          className={
                            star <= (hoverRating || rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }
                        />
                      </button>
                    ))}
                  </div>

                  <label className="block space-y-2">
                    <Paragraph1 className="text-sm text-gray-600">
                      Add a note (optional)
                    </Paragraph1>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Was the item as described? How was the experience?"
                      className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
                      rows={4}
                    />
                  </label>

                  <div className="flex flex-col gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={submitReview.isPending || rating === 0}
                      className={`${buttonPrimaryFull} disabled:bg-gray-400`}
                    >
                      {submitReview.isPending ? "Submitting…" : "Submit review"}
                    </button>
                    <button
                      type="button"
                      onClick={handleSkip}
                      disabled={submitReview.isPending}
                      className="py-2 text-sm font-medium text-gray-500 transition hover:text-gray-800"
                    >
                      Skip for now
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-4 py-4 text-center">
                  <div className="flex justify-center">
                    <div className="rounded-full bg-green-50 p-4">
                      <CheckCircle2 className="text-green-600" size={48} />
                    </div>
                  </div>
                  <Paragraph1 className="font-bold text-gray-900">
                    Thanks for your feedback
                  </Paragraph1>
                  <Paragraph1 className="text-gray-600">
                    Your review helps other renters and listers on Relisted.
                  </Paragraph1>
                  <button
                    type="button"
                    onClick={handleClose}
                    className={buttonPrimaryFull}
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
