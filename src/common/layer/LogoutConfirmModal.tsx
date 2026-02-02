"use client";

import React from "react";
import ActionConfirmModal from "@/common/layer/ActionConfirmModal";

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export default function LogoutConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: LogoutConfirmModalProps) {
  return (
    <ActionConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      title="Log Out"
      description="Are you sure you want to log out? You'll need to sign in again to access the admin dashboard."
      actionType="negative"
      actionLabel="Log Out"
      cancelLabel="Stay"
      onConfirm={onConfirm}
      isLoading={isLoading}
    />
  );
}
