"use client";

import React from "react";
import { Banknote, CheckCircle2, X, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Paragraph1, Header2 } from "@/common/ui/Text";
import { buttonPrimary, buttonSecondary } from "@/common/ui/buttonClasses";
import { dialogBackdrop, dialogCard } from "@/common/ui/dashboardClasses";

interface WithdrawalActionsPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  withdrawal: {
    user: { name: string };
    amount: number;
  };
  showApprove: boolean;
  showMarkPaid: boolean;
  onChooseApprove: () => void;
  onChooseReject: () => void;
  onChooseMarkPaid: () => void;
}

export default function WithdrawalActionsPickerModal({
  isOpen,
  onClose,
  withdrawal,
  showApprove,
  showMarkPaid,
  onChooseApprove,
  onChooseReject,
  onChooseMarkPaid,
}: WithdrawalActionsPickerModalProps) {
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
    hidden: { scale: 0.96, opacity: 0, y: 8 },
    visible: { scale: 1, opacity: 1, y: 0 },
    exit: { scale: 0.96, opacity: 0, y: 8 },
  };

  const pick = (fn: () => void) => {
    onClose();
    fn();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={dialogBackdrop}
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
        >
          <motion.div
            className={`${dialogCard} max-w-xs p-0 overflow-hidden shadow-xl`}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: "spring", stiffness: 400, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-start gap-2">
              <div>
                <Header2 className="text-base font-bold text-gray-900">
                  Actions
                </Header2>
                <Paragraph1 className="text-xs text-gray-500 mt-0.5 leading-snug">
                  {formatCurrency(withdrawal.amount)} · {withdrawal.user.name}
                </Paragraph1>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 -mr-1 -mt-0.5 hover:bg-gray-100 rounded-lg text-gray-500"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-3 flex flex-col gap-2">
              {showApprove && (
                <button
                  type="button"
                  onClick={() => pick(onChooseApprove)}
                  className={`${buttonSecondary} w-full shadow-sm`}
                >
                  <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                  Approve
                </button>
              )}
              {showApprove && (
                <button
                  type="button"
                  onClick={() => pick(onChooseReject)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border-2 border-red-200 text-red-700 bg-white hover:bg-red-50 hover:border-red-300 transition-colors shadow-sm"
                >
                  <XCircle className="h-4 w-4 shrink-0" />
                  Reject
                </button>
              )}
              {showMarkPaid && (
                <button
                  type="button"
                  onClick={() => pick(onChooseMarkPaid)}
                  className={`${buttonPrimary} w-full shadow-sm`}
                >
                  <Banknote className="h-4 w-4 shrink-0 opacity-90" />
                  Mark as paid
                </button>
              )}
            </div>

            <div className="px-3 pb-3 pt-0">
              <button
                type="button"
                onClick={onClose}
                className={`${buttonSecondary} w-full`}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
