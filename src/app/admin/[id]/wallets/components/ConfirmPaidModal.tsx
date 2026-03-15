"use client";

import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Paragraph1, Header2 } from "@/common/ui/Text";

interface ConfirmPaidModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (trackingId: string) => void;
  withdrawal: {
    id: string;
    user: {
      name: string;
      email: string;
    };
    bankAccount: {
      accountNumber: string;
      bankName: string;
      accountName: string;
    };
    amount: number;
    requestedDate: string;
  };
  isLoading?: boolean;
}

export default function ConfirmPaidModal({
  isOpen,
  onClose,
  onConfirm,
  withdrawal,
  isLoading = false,
}: ConfirmPaidModalProps) {
  const [trackingId, setTrackingId] = useState("");

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleConfirm = () => {
    if (!trackingId.trim()) {
      alert("Please enter a transaction tracking ID");
      return;
    }
    onConfirm(trackingId);
    setTrackingId("");
  };

  const handleClose = () => {
    setTrackingId("");
    onClose();
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const modalVariants = {
    hidden: { scale: 0.95, opacity: 0, y: 20 },
    visible: { scale: 1, opacity: 1, y: 0 },
    exit: { scale: 0.95, opacity: 0, y: 20 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-lg shadow-xl max-w-md w-full"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="border-b border-gray-100 px-6 py-4 flex justify-between items-center">
              <Header2 className="text-lg font-bold text-gray-900">
                Confirm Payment
              </Header2>
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="p-1 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
              <Paragraph1 className="text-gray-600 mb-6">
                Please confirm to mark this withdrawal request as paid. This
                action cannot be undone.
              </Paragraph1>

              {/* Withdrawal Details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
                <div>
                  <Paragraph1 className="text-gray-600 text-xs font-semibold">
                    USER
                  </Paragraph1>
                  <Paragraph1 className="text-gray-900 font-medium">
                    {withdrawal.user.name}
                  </Paragraph1>
                  <span className="text-xs text-gray-500">
                    {withdrawal.user.email}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-3">
                  <Paragraph1 className="text-gray-600 text-xs font-semibold">
                    BANK ACCOUNT
                  </Paragraph1>
                  <Paragraph1 className="text-gray-900 font-medium">
                    {withdrawal.bankAccount.accountNumber}
                  </Paragraph1>
                  <span className="text-xs text-gray-500">
                    {withdrawal.bankAccount.bankName} -{" "}
                    {withdrawal.bankAccount.accountName}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-3">
                  <Paragraph1 className="text-gray-600 text-xs font-semibold">
                    AMOUNT
                  </Paragraph1>
                  <Paragraph1 className="text-gray-900 font-semibold text-lg">
                    {formatCurrency(withdrawal.amount)}
                  </Paragraph1>
                </div>
              </div>

              {/* Transaction Tracking ID Input */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-gray-600 mb-2">
                  TRANSACTION TRACKING ID *
                </label>
                <input
                  type="text"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  placeholder="Enter transaction tracking ID for future reference"
                  disabled={isLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50 disabled:opacity-50"
                />
                <Paragraph1 className="text-gray-500 text-xs mt-1">
                  This ID will be used for tracking and reference purposes
                </Paragraph1>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-900 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isLoading || !trackingId.trim()}
                  className="flex-1 px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Confirm Payment"
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
