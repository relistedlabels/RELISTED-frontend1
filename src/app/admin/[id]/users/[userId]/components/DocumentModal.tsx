"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download } from "lucide-react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentData?: {
    title: string;
    documentType: string;
    idNumber: string;
    expiryDate: string;
    image: string;
  };
}

export default function DocumentModal({
  isOpen,
  onClose,
  documentData = {
    title: "Identity Document",
    documentType: "National ID Card",
    idNumber: "5678-9012-3456-7890",
    expiryDate: "August 2029",
    image:
      "https://images.unsplash.com/photo-1570303008347-89a1e76eb0f4?w=400&h=500&fit=crop",
  },
}: DocumentModalProps) {
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
            className="fixed inset-0 bg-black/50  z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <Paragraph3 className="text-lg font-bold text-gray-900">
                  {documentData.title}
                </Paragraph3>
                <Paragraph1 className="text-xs text-gray-500 mt-1">
                  {documentData.documentType} - {documentData.idNumber}
                </Paragraph1>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition p-1"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Document Image */}
              <div className="bg-gray-900 rounded-lg overflow-hidden mb-6 flex items-center justify-center h-80">
                <img
                  src={documentData.image}
                  alt={documentData.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Document Details */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                  <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Document Type
                  </Paragraph1>
                  <Paragraph1 className="text-sm font-medium text-gray-900">
                    {documentData.documentType}
                  </Paragraph1>
                </div>
                <div>
                  <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    ID Number
                  </Paragraph1>
                  <Paragraph1 className="text-sm font-medium text-gray-900">
                    {documentData.idNumber}
                  </Paragraph1>
                </div>
                <div>
                  <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Expiry Date
                  </Paragraph1>
                  <Paragraph1 className="text-sm font-medium text-gray-900">
                    {documentData.expiryDate}
                  </Paragraph1>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-sm text-gray-700"
                >
                  Close
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition font-medium text-sm">
                  <Download size={18} />
                  Download Document
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
