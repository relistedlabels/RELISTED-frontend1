"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import {
  buttonDestructive,
  buttonPrimary,
  buttonSecondary,
} from "@/common/ui/buttonClasses";
import { dialogBackdrop, dialogCard } from "@/common/ui/dashboardClasses";

export type ActionType = "positive" | "negative" | "delete" | "update";

interface ActionConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  actionType?: ActionType;
  actionLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  isLoading?: boolean;
  children?: React.ReactNode;
}

export default function ActionConfirmModal({
  isOpen,
  onClose,
  title,
  description,
  actionType = "positive",
  actionLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  isLoading = false,
  children,
}: ActionConfirmModalProps) {
  const getConfirmButtonClass = (type: ActionType) => {
    switch (type) {
      case "negative":
      case "delete":
        return buttonDestructive;
      case "positive":
      case "update":
      default:
        return buttonPrimary;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className={dialogBackdrop}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`${dialogCard} p-0 overflow-hidden shadow-lg`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between p-6 border-b border-gray-200">
                <div className="flex-1">
                  <Paragraph3 className="text-lg font-bold text-gray-900 mb-1">
                    {title}
                  </Paragraph3>
                  <Paragraph1 className="text-sm text-gray-600">
                    {description}
                  </Paragraph1>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition p-1 -mr-2 flex-shrink-0"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              {children && (
                <div className="p-6 border-b border-gray-200">{children}</div>
              )}

              {/* Footer */}
              <div className="p-6 flex gap-3 justify-end">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className={`${buttonSecondary} disabled:cursor-not-allowed`}
                >
                  {cancelLabel}
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={`${getConfirmButtonClass(actionType)} disabled:cursor-not-allowed`}
                >
                  {isLoading ? "Loading..." : actionLabel}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
