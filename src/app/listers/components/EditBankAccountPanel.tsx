"use client";
import React from "react";
import { X, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { buttonSecondary } from "@/common/ui/buttonClasses";
import {
  slidePanelBackdrop,
  slidePanelFooter,
  slidePanelHeader,
  slidePanelSheet,
  slidePanelTitle,
} from "@/common/ui/dashboardClasses";
import { Paragraph1 } from "@/common/ui/Text";
import EditBankAccountForm from "./EditBankAccountForm";

interface EditBankAccountPanelProps {
  isOpen: boolean;
  onClose: () => void;
  account: {
    id: string;
    bankCode: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
  } | null;
}

const EditBankAccountPanel: React.FC<EditBankAccountPanelProps> = ({
  isOpen,
  onClose,
  account,
}) => {
  const variants = {
    hidden: { x: "100%" },
    visible: { x: 0 },
  };

  if (!account) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={slidePanelBackdrop}
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={slidePanelSheet}
            role="dialog"
            aria-modal="true"
            aria-label="Edit Bank Account"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={variants}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={slidePanelHeader}>
              <button
                onClick={onClose}
                className="text-gray-500 xl:hidden hover:text-black p-1 rounded-full transition"
                aria-label="Close Edit Bank Account"
              >
                <ArrowLeft size={20} />
              </button>

              <Paragraph1 className={slidePanelTitle}>Edit bank account</Paragraph1>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-black p-1 rounded-full transition"
                aria-label="Close Edit Bank Account"
              >
                <X className="hidden xl:flex" size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="grow pt-4 pb-20 space-y-8">
              <EditBankAccountForm account={account} onSuccess={onClose} />
            </div>

            {/* Footer */}
            <div className={`${slidePanelFooter} flex gap-3`}>
              <button type="button" onClick={onClose} className={`${buttonSecondary} flex-1`}>
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditBankAccountPanel;
