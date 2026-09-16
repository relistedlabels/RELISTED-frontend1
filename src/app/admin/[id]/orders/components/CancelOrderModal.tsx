"use client";

import React, { useEffect, useState } from "react";
import ActionConfirmModal from "@/common/layer/ActionConfirmModal";

interface CancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId?: string;
  onConfirm: (reason: string) => void;
  isLoading?: boolean;
}

export default function CancelOrderModal({
  isOpen,
  onClose,
  orderId = "#RL5-23894",
  onConfirm,
  isLoading = false,
}: CancelOrderModalProps) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setReason("");
    }
  }, [isOpen]);

  const trimmedReason = reason.trim();
  const canSubmit = trimmedReason.length > 0 && !isLoading;

  return (
    <ActionConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      title="Cancel Order"
      description={`Cancel order ${orderId}? The renter will be refunded to their wallet and both parties will be notified.`}
      actionType="negative"
      actionLabel="Cancel Order"
      cancelLabel="Go Back"
      onConfirm={() => {
        if (!canSubmit) return;
        onConfirm(trimmedReason);
      }}
      isLoading={isLoading}
    >
      <div className="px-6 pb-2">
        <label
          htmlFor="cancel-order-reason"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Reason for cancellation
        </label>
        <textarea
          id="cancel-order-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="e.g. Item no longer available"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>
    </ActionConfirmModal>
  );
}
