"use client";

import React from "react";
import { X, Loader2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Paragraph1, Header2 } from "@/common/ui/Text";
import { buttonDestructive, buttonSecondary } from "@/common/ui/buttonClasses";
import { dialogBackdrop, dialogCard } from "@/common/ui/dashboardClasses";

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
          className={dialogBackdrop}
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
        >
          <motion.div
            className={`${dialogCard} p-0 overflow-hidden shadow-xl`}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="border-b border-gray-100 px-6 py-4 flex justify-between items-center">
              <Header2 className="text-lg font-bold text-gray-900">
                Log Out All Devices
              </Header2>
              <button
                onClick={onClose}
                disabled={isLoading}
                className="p-1 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
              <div className="flex gap-3 mb-4">
                <AlertCircle size={24} className="text-red-600 flex-shrink-0" />
                <div>
                  <Paragraph1 className="text-gray-900 font-medium mb-2">
                    Warning
                  </Paragraph1>
                  <Paragraph1 className="text-gray-600 text-sm">
                    You will be logged out from all devices including the
                    current one. You will need to log in again.
                  </Paragraph1>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className={`${buttonSecondary} flex-1 disabled:cursor-not-allowed`}
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={`${buttonDestructive} flex-1 disabled:cursor-not-allowed`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Logging out...
                    </>
                  ) : (
                    "Confirm Logout"
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
