"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";

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
  const getActionButtonColor = (type: ActionType) => {
    switch (type) {
      case "negative":
      case "delete":
        return "bg-red-600 hover:bg-red-700 text-white";
      case "positive":
      case "update":
      default:
        return "bg-gray-900 hover:bg-gray-800 text-white";
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
            className="fixed h-screen inset-0 bg-black/50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 h-screen z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
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
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-sm disabled:opacity-50"
                >
                  {cancelLabel}
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={`px-6 py-2 rounded-lg font-medium text-sm transition disabled:opacity-50 ${getActionButtonColor(
                    actionType,
                  )}`}
                >
                  {isLoading ? "Loading..." : actionLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
