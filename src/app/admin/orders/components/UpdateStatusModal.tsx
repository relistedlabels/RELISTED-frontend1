"use client";

import React, { useState } from "react";
import ActionConfirmModal from "@/common/layer/ActionConfirmModal";
import { Paragraph1 } from "@/common/ui/Text";

interface UpdateStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  currentStatus: string;
  validStatuses?: string[];
  onConfirm: (newStatus: string) => void;
  isLoading?: boolean;
}

const DEFAULT_STATUSES = [
  "Preparing",
  "In Transit",
  "Delivered",
  "Return Due",
  "Return Pickup",
];

export default function UpdateStatusModal({
  isOpen,
  onClose,
  orderId,
  currentStatus,
  validStatuses = DEFAULT_STATUSES,
  onConfirm,
  isLoading = false,
}: UpdateStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState("");

  const handleConfirm = () => {
    if (selectedStatus) {
      onConfirm(selectedStatus);
      setSelectedStatus("");
    }
  };

  const handleClose = () => {
    setSelectedStatus("");
    onClose();
  };

  return (
    <ActionConfirmModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Update Order Status"
      description={`Change the status of order ${orderId}. Only valid next statuses are shown.`}
      actionType="update"
      actionLabel="Update Status"
      onConfirm={handleConfirm}
      isLoading={isLoading}
    >
      <div className="space-y-2">
        <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          New Status
        </Paragraph1>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        >
          <option value="">Select new status...</option>
          {validStatuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>
    </ActionConfirmModal>
  );
}
