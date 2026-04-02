"use client";

import React, { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Paragraph1, Header2 } from "@/common/ui/Text";

interface RejectWithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Optional internal note sent to the API. */
  onConfirm: (note?: string) => void;
  withdrawal: {
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
  };
  isLoading?: boolean;
}

export default function RejectWithdrawalModal({
  isOpen,
  onClose,
  onConfirm,
  withdrawal,
  isLoading = false,
}: RejectWithdrawalModalProps) {
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!isOpen) setNote("");
  }, [isOpen]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
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

  const handleConfirm = () => {
    const trimmed = note.trim();
    onConfirm(trimmed ? trimmed : undefined);
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
            <div className="border-b border-gray-100 px-6 py-4 flex justify-between items-center">
              <Header2 className="text-lg font-bold text-gray-900">
                Reject withdrawal
              </Header2>
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="p-1 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            <div className="px-6 py-6">
              <Paragraph1 className="text-gray-600 mb-6">
                This rejects the withdrawal request. The user should be informed
                according to your internal process.
              </Paragraph1>

              <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-3">
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
                    AMOUNT
                  </Paragraph1>
                  <Paragraph1 className="text-gray-900 font-semibold text-lg">
                    {formatCurrency(withdrawal.amount)}
                  </Paragraph1>
                </div>
              </div>

              <div className="mb-6">
                <label
                  htmlFor="reject-withdrawal-note"
                  className="block text-xs font-semibold text-gray-600 mb-2"
                >
                  Note (optional)
                </label>
                <textarea
                  id="reject-withdrawal-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  disabled={isLoading}
                  rows={3}
                  placeholder="Reason or internal note"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50 resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-900 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Rejecting…
                    </>
                  ) : (
                    "Reject"
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
