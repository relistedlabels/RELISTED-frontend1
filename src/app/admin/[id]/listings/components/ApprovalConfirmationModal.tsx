"use client";

import React from "react";
import { X, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Paragraph1, Header3 } from "@/common/ui/Text";
import { Product } from "@/lib/api/admin/listings";
import { usePublicProductById } from "@/lib/queries/product/usePublicProductById";

interface ApprovalConfirmationModalProps {
  isOpen: boolean;
  product: Product | null;
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ApprovalConfirmationModal: React.FC<
  ApprovalConfirmationModalProps
> = ({ isOpen, product, isLoading, onConfirm, onCancel }) => {
  const { data: productData } = usePublicProductById(product?.id || "");
  const firstImageUrl = productData?.attachments?.uploads?.[0]?.url;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-lg z-50 w-full max-w-md mx-4"
          >
            {/* Close button */}
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <X size={24} />
            </button>

            {/* Content */}
            <div className="p-8">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle size={32} className="text-green-600" />
                </div>
              </div>

              {/* Product preview */}
              {product && (
                <div className="mb-6">
                  {/* Product image */}
                  {firstImageUrl && (
                    <img
                      src={firstImageUrl}
                      alt={product.name}
                      className="w-full h-40 object-cover rounded-lg mb-4"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  )}

                  {/* Product details */}
                  <div>
                    <Header3 className="text-gray-900 mb-2">
                      {product.name}
                    </Header3>
                    <Paragraph1 className="text-sm text-gray-600">
                      Daily Price: ₦{product.dailyPrice?.toLocaleString() || 0}
                    </Paragraph1>
                    <Paragraph1 className="text-sm text-gray-600">
                      Original Value: ₦
                      {product.originalValue?.toLocaleString() || 0}
                    </Paragraph1>
                  </div>
                </div>
              )}

              {/* Message */}
              <Paragraph1 className="text-center text-gray-700 mb-8">
                Are you sure you want to approve this item? It will be moved to
                the active listings.
              </Paragraph1>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onCancel}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Approving...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={18} />
                      Approve
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
