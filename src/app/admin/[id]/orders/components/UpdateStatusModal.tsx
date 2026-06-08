"use client";

import React, { useMemo, useState } from "react";
import ActionConfirmModal from "@/common/layer/ActionConfirmModal";
import { Paragraph1 } from "@/common/ui/Text";
import { AdminComboBox } from "@/app/admin/components/AdminComboBox";

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

  const statusOptions = useMemo(
    () => validStatuses.map((status) => ({ value: status, label: status })),
    [validStatuses],
  );

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
        <AdminComboBox
          value={selectedStatus}
          onChange={setSelectedStatus}
          options={statusOptions}
          placeholder="Select new status..."
          ariaLabel="New order status"
        />
      </div>
    </ActionConfirmModal>
  );
}
