"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import {
  buttonDestructive,
  buttonPrimary,
  buttonSecondary,
} from "@/common/ui/buttonClasses";

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen ? (
        <div
          className="fixed inset-0 z-[100]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="action-confirm-title"
        >
          <motion.button
            type="button"
            aria-label="Close dialog"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto w-full max-w-sm rounded-xl border border-gray-200 bg-white shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3 p-5">
                <div className="min-w-0 flex-1">
                  <h2
                    id="action-confirm-title"
                    className="font-bold text-gray-900 text-base"
                  >
                    {title}
                  </h2>
                  <p className="mt-2 text-gray-600 text-sm leading-relaxed">
                    {description}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="shrink-0 p-1 text-gray-400 hover:text-gray-600 transition"
                >
                  <X size={18} />
                </button>
              </div>

              {children ? (
                <div className="px-5 pb-4 border-gray-100 border-t pt-4">
                  {children}
                </div>
              ) : null}

              <div className="flex justify-end gap-2.5 px-5 py-4 border-gray-200 border-t bg-gray-50/80">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className={`${buttonSecondary} disabled:cursor-not-allowed`}
                >
                  {cancelLabel}
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={`${getConfirmButtonClass(actionType)} disabled:cursor-not-allowed`}
                >
                  {isLoading ? "Loading..." : actionLabel}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
