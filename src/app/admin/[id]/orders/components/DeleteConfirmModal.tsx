"use client";

import React from "react";
import ActionConfirmModal from "@/common/layer/ActionConfirmModal";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  onConfirm: () => void;
  isLoading?: boolean;
  itemName?: string;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  title = "Delete Item",
  description = "This action cannot be undone. Are you sure you want to delete this item?",
  onConfirm,
  isLoading = false,
  itemName,
}: DeleteConfirmModalProps) {
  return (
    <ActionConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={itemName ? `${description} (${itemName})` : description}
      actionType="delete"
      actionLabel="Delete"
      cancelLabel="Cancel"
      onConfirm={onConfirm}
      isLoading={isLoading}
    />
  );
}
