"use client";

import React from "react";
import ActionConfirmModal from "@/common/layer/ActionConfirmModal";

interface CancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId?: string;
  onConfirm: () => void;
  isLoading?: boolean;
}

export default function CancelOrderModal({
  isOpen,
  onClose,
  orderId = "#RL5-23894",
  onConfirm,
  isLoading = false,
}: CancelOrderModalProps) {
  return (
    <ActionConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      title="Cancel Order"
      description={`Are you sure you want to cancel order ${orderId}? This will notify both the curator and dresser.`}
      actionType="negative"
      actionLabel="Cancel Order"
      cancelLabel="Go Back"
      onConfirm={onConfirm}
      isLoading={isLoading}
    />
  );
}
