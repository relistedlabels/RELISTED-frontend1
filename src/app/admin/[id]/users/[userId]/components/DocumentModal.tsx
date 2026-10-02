"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download } from "lucide-react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { buttonPrimary, buttonSecondary } from "@/common/ui/buttonClasses";
import { dialogBackdrop, dialogCard } from "@/common/ui/dashboardClasses";

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentData: {
    title: string;
    documentType: string;
    fileName: string;
    contentType: string;
    url: string;
  };
}

export default function DocumentModal({
  isOpen,
  onClose,
  documentData,
}: DocumentModalProps) {
  const isImage =
    documentData.contentType.startsWith("image/") ||
    /\.(avif|gif|jpe?g|png|webp)(?:[?#]|$)/i.test(documentData.url);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className={dialogBackdrop}
          >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`${dialogCard} max-h-[90vh] max-w-lg overflow-y-auto p-0 shadow-2xl`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-gray-200 p-4 sm:p-6">
              <div className="min-w-0">
                <Paragraph3 className="text-lg font-bold text-gray-900">
                  {documentData.title}
                </Paragraph3>
                <Paragraph1 className="mt-1 break-all text-xs text-gray-500">
                  {documentData.documentType} · {documentData.fileName}
                </Paragraph1>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close document preview"
                className="shrink-0 rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6">
              {/* Document Image */}
              <div className="mb-6 flex h-[60vh] max-h-[32rem] min-h-64 items-center justify-center overflow-hidden rounded-xl bg-gray-100">
                {isImage ? (
                  <img
                    src={documentData.url}
                    alt={documentData.title}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <iframe
                    src={documentData.url}
                    title={documentData.title}
                    className="h-full w-full border-0 bg-white"
                  />
                )}
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={onClose}
                  className={`${buttonSecondary} min-h-11 flex-1 text-sm`}
                >
                  Close
                </button>
                <a
                  href={documentData.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={documentData.fileName}
                  className={`${buttonPrimary} min-h-11 flex-1 text-sm`}
                >
                  <Download size={18} />
                  Download
                </a>
              </div>
            </div>
          </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
