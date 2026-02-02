"use client";

import React, { useState } from "react";
import ActionConfirmModal from "@/common/layer/ActionConfirmModal";
import { Paragraph1 } from "@/common/ui/Text";

interface RejectListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingName?: string;
  onConfirm: (reason: string) => void;
  isLoading?: boolean;
}

export default function RejectListingModal({
  isOpen,
  onClose,
  listingName = "Hermès Birkin",
  onConfirm,
  isLoading = false,
}: RejectListingModalProps) {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    if (reason.trim()) {
      onConfirm(reason);
      setReason("");
    }
  };

  const handleClose = () => {
    setReason("");
    onClose();
  };

  return (
    <ActionConfirmModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Reject Listing"
      description={`Reject the listing for "${listingName}". The curator will be notified of the rejection reason.`}
      actionType="negative"
      actionLabel="Reject Listing"
      onConfirm={handleConfirm}
      isLoading={isLoading}
    >
      <div className="space-y-2">
        <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Rejection Reason
        </Paragraph1>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Explain why this listing is being rejected..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 resize-none"
          rows={4}
        />
      </div>
    </ActionConfirmModal>
  );
}
