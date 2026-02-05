"use client";

import React from "react";
import ActionConfirmModal from "@/common/layer/ActionConfirmModal";

interface SuspendUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  onConfirm: () => void;
  isLoading?: boolean;
}

export default function SuspendUserModal({
  isOpen,
  onClose,
  userName = "Chioma Adeyemi",
  onConfirm,
  isLoading = false,
}: SuspendUserModalProps) {
  return (
    <ActionConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      title="Suspend User Account"
      description={`Suspend ${userName}'s account? They'll lose access until reactivated by an admin.`}
      actionType="negative"
      actionLabel="Suspend Account"
      cancelLabel="Cancel"
      onConfirm={onConfirm}
      isLoading={isLoading}
    />
  );
}
