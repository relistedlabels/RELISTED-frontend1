"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";

interface RejectOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { reason: string; notes?: string }) => void;
  isRejecting: boolean;
}

const REASON_OPTIONS = [
  "Item is no longer available",
  "Time slot doesn't work for me",
  "Item is damaged or needs maintenance",
  "Scheduling conflict",
  "Other",
];

const RejectOrderModal: React.FC<RejectOrderModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isRejecting,
}) => {
  const [selectedReason, setSelectedReason] = useState("");
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (selectedReason) {
      onConfirm({
        reason: selectedReason,
        notes: notes.trim() || undefined,
      });
    }
  };

  const handleClose = () => {
    setSelectedReason("");
    setNotes("");
    onClose();
  };

  return (
    <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/50">
      <div className="bg-white shadow-xl mx-4 p-6 rounded-2xl w-full max-w-md">
        <div className="flex justify-between items-start mb-6">
          <Paragraph3 className="font-bold text-black text-lg">
            Reject Order
          </Paragraph3>
          <button
            type="button"
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <Paragraph1 className="mb-3 font-semibold text-gray-900 text-xs uppercase tracking-wide">
              Reason for rejection
            </Paragraph1>
            <div className="space-y-2">
              {REASON_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSelectedReason(option)}
                  className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors ${
                    selectedReason === option
                      ? "border-black bg-black text-white"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Paragraph1 className="mb-2 font-semibold text-gray-900 text-xs uppercase tracking-wide">
              Additional notes (optional)
            </Paragraph1>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional details..."
              className="p-3 border border-gray-200 focus:border-gray-900 rounded-lg focus:outline-none w-full min-h-[80px] text-sm resize-none"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isRejecting}
              className="flex-1 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 px-6 py-3 rounded-lg font-bold text-black text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!selectedReason || isRejecting}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 px-6 py-3 rounded-lg font-bold text-white text-sm transition-colors"
            >
              {isRejecting ? "Rejecting..." : "Reject Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RejectOrderModal;
