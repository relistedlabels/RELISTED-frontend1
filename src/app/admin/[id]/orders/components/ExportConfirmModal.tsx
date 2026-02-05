"use client";

import React from "react";
import ActionConfirmModal from "@/common/layer/ActionConfirmModal";

interface ExportConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemType?: string;
  onConfirm: () => void;
  isLoading?: boolean;
}

export default function ExportConfirmModal({
  isOpen,
  onClose,
  itemType = "Orders",
  onConfirm,
  isLoading = false,
}: ExportConfirmModalProps) {
  return (
    <ActionConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      title="Export Data"
      description={`Export all ${itemType.toLowerCase()} data as CSV. You'll receive a download link via email.`}
      actionType="positive"
      actionLabel="Export"
      cancelLabel="Cancel"
      onConfirm={onConfirm}
      isLoading={isLoading}
    />
  );
}
