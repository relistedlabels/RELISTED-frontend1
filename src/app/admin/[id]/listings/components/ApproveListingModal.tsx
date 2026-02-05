"use client";

import React from "react";
import ActionConfirmModal from "@/common/layer/ActionConfirmModal";

interface ApproveListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingName?: string;
  onConfirm: () => void;
  isLoading?: boolean;
}

export default function ApproveListingModal({
  isOpen,
  onClose,
  listingName = "Hermès Birkin",
  onConfirm,
  isLoading = false,
}: ApproveListingModalProps) {
  return (
    <ActionConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      title="Approve Listing"
      description={`Approve the listing for "${listingName}". This item will be visible to all renters.`}
      actionType="positive"
      actionLabel="Approve Listing"
      cancelLabel="Cancel"
      onConfirm={onConfirm}
      isLoading={isLoading}
    />
  );
}
