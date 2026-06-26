"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { toast } from "sonner";
import { Paragraph1 } from "@/common/ui/Text";
import { useRaiseDispute } from "@/lib/mutations/renters/useDisputeMutations";
import { useUpload } from "@/lib/queries/renters/useUpload";

const DELIVERY_ISSUE_CATEGORIES = [
  "Damaged Item",
  "Incorrect Item Received",
  "Item Not Delivered",
  "Hygiene Concern",
  "Misrepresented Description",
  "Other",
];

interface RentalDeliveryIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderDisplayId: string;
  itemId: string;
  itemLabel: string;
  inspectionLabel: string;
}

export default function RentalDeliveryIssueModal({
  isOpen,
  onClose,
  orderId,
  orderDisplayId,
  itemId,
  itemLabel,
  inspectionLabel,
}: RentalDeliveryIssueModalProps) {
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const raiseDisputeMutation = useRaiseDispute();
  const uploadMutation = useUpload();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) {
      toast.error("Please select an issue category.");
      return;
    }
    const trimmed = description.trim();
    if (trimmed.length < 20) {
      toast.error("Please describe the issue in at least 20 characters.");
      return;
    }

    try {
      const evidenceFiles: string[] = [];
      for (const file of uploadedFiles) {
        const formData = new FormData();
        formData.append("file", file);
        const uploadResult: unknown = await uploadMutation.mutateAsync(formData);
        const result = uploadResult as {
          uploadId?: string;
          id?: string;
          data?: { uploadId?: string; id?: string };
        };
        const uploadId =
          result?.uploadId ||
          result?.id ||
          result?.data?.uploadId ||
          result?.data?.id;
        if (uploadId) evidenceFiles.push(uploadId);
      }

      await raiseDisputeMutation.mutateAsync({
        orderId,
        itemId,
        issueCategory: category,
        description: trimmed,
        amountDisputed: 0,
        preferredResolution: "Full Refund",
        ...(evidenceFiles.length > 0 ? { evidenceFiles } : {}),
      });

      toast.success("Issue reported. Our team will review your dispute.");
      onClose();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not submit your report.",
      );
    }
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-[120] flex items-end justify-center bg-black/60 p-4 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Report delivery issue"
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-5 shadow-xl"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <Paragraph1 className="text-base font-bold text-gray-900">
                  Report a delivery issue
                </Paragraph1>
                <Paragraph1 className="mt-1 text-xs text-gray-600">
                  Order {orderDisplayId} · {itemLabel}
                </Paragraph1>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-1 text-gray-500 hover:text-black"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <Paragraph1 className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-950">
              You can only report delivery problems within {inspectionLabel} of
              delivery. A dispute will be opened and we will hold funds while we
              review.
            </Paragraph1>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="rental-issue-category"
                  className="mb-1.5 block text-sm font-medium text-gray-900"
                >
                  What went wrong?
                </label>
                <select
                  id="rental-issue-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
                >
                  <option value="">Select a category</option>
                  {DELIVERY_ISSUE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="rental-issue-description"
                  className="mb-1.5 block text-sm font-medium text-gray-900"
                >
                  Describe the issue
                </label>
                <textarea
                  id="rental-issue-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Include what you received, what was wrong, and any damage details."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="rental-issue-photos"
                  className="mb-1.5 block text-sm font-medium text-gray-900"
                >
                  Photos (optional)
                </label>
                <input
                  id="rental-issue-photos"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) =>
                    setUploadedFiles(Array.from(e.target.files ?? []))
                  }
                  className="w-full text-sm"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    raiseDisputeMutation.isPending || uploadMutation.isPending
                  }
                  className="flex-1 rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {raiseDisputeMutation.isPending
                    ? "Submitting…"
                    : "Submit report"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
