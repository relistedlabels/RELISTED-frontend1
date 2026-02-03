"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Paragraph1, Paragraph2 } from "@/common/ui/Text";
import { useDeleteProduct } from "@/lib/mutations";
import { useRouter } from "next/navigation";

interface DeleteProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
}

const DeleteProductModal: React.FC<DeleteProductModalProps> = ({
  isOpen,
  onClose,
  productId,
  productName,
}) => {
  const router = useRouter();
  const deleteProduct = useDeleteProduct(productId);

  const handleDelete = async () => {
    deleteProduct.mutate(undefined, {
      onSuccess: () => {
        // Redirect after successful deletion
        router.push("/listers/inventory");
      },
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-red-100 rounded-full p-3"
              >
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </motion.div>
            </div>

            {/* Content */}
            <Paragraph2 className="text-center font-bold text-lg mb-2 text-black">
              Delete Item?
            </Paragraph2>
            <Paragraph1 className="text-center text-gray-600 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold">"{productName}"</span>? This
              action cannot be undone.
            </Paragraph1>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={deleteProduct.isPending}
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteProduct.isPending}
                className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleteProduct.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>

            {/* Error Message */}
            {deleteProduct.isError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <Paragraph1 className="text-red-700 text-xs">
                  {deleteProduct.error?.message || "Failed to delete product"}
                </Paragraph1>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DeleteProductModal;
