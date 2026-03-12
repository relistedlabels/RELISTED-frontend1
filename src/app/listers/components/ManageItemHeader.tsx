"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Paragraph1 } from "@/common/ui/Text";
import BackHeader from "@/common/ui/BackHeader";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, X } from "lucide-react";
import { useUpdateProductStatus } from "@/lib/queries/listers/useUpdateProductStatus";
import { useDeleteProduct } from "@/lib/queries/listers/useDeleteProduct";

interface ManageItemHeaderProps {
  title?: string;
  subtitle?: string;
}

const ManageItemHeader: React.FC<ManageItemHeaderProps> = ({
  title = "Manage Item",
  subtitle = "Manage your fashion item",
}) => {
  const router = useRouter();
  const params = useParams();
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // ✅ Get product ID from URL params
  const productId = params?.id as string;

  // ✅ Use mutation hooks
  const updateStatusMutation = useUpdateProductStatus();
  const deleteProductMutation = useDeleteProduct();

  const handleEdit = () => {
    if (productId) {
      router.push(`/listers/inventory/product-edit/${productId}`);
    }
  };

  const handleDisableConfirm = async () => {
    if (!productId) return;

    try {
      await updateStatusMutation.mutateAsync({
        productId,
        status: "MAINTENANCE",
        reason: "Item disabled by lister",
      });
      setShowModal(false);
      router.refresh();
    } catch (error) {
      console.error("Error disabling product:", error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!productId) return;

    try {
      await deleteProductMutation.mutateAsync({
        productId,
        reason: "Deleted by lister",
      });
      setShowDeleteModal(false);
      // Redirect to inventory page after successful deletion
      router.push("/listers/inventory");
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  return (
    <div className="w-full flex sm:items-center flex-col sm:flex-row gap-4 sm:justify-between mb-4 bg-transparent">
      <BackHeader title={title} subtitle={subtitle} />

      <div className="flex items-center space-x-3">
        <button
          onClick={() => setShowDeleteModal(true)}
          className="px-6 py-2.5 text-[10px] sm:text-[14px] w-full sm:w-fit border border-red-300 rounded-xl text-sm font-semibold text-red-600 bg-white hover:bg-red-50 transition-all active:scale-95"
        >
          <p>Delete Item</p>
        </button>

        {/* <button
          onClick={() => setShowModal(true)}
          className="px-6 py-2.5 text-[10px] sm:text-[14px] w-full sm:w-fit border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-all active:scale-95"
        >
          <p>Disable Item</p>
        </button> */}

        <button
          onClick={handleEdit}
          className="px-6 py-2.5 text-[10px] sm:text-[14px] w-full sm:w-fit bg-[#33332D] text-white rounded-xl text-sm font-semibold hover:bg-black transition-all shadow-sm active:scale-95"
        >
          <p>Edit Item</p>
        </button>
      </div>

      {/* Disable Confirmation Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() =>
              !updateStatusMutation.isPending && setShowModal(false)
            }
          >
            <motion.div
              className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  <Paragraph1 className="font-semibold text-lg">
                    Disable Item?
                  </Paragraph1>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  disabled={updateStatusMutation.isPending}
                  className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="mb-6">
                <Paragraph1 className="text-gray-600">
                  This item will be set to maintenance and won't be available
                  for rental. You can re-enable it anytime.
                </Paragraph1>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  disabled={updateStatusMutation.isPending}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDisableConfirm}
                  disabled={updateStatusMutation.isPending}
                  className="flex-1 px-4 py-2.5 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateStatusMutation.isPending
                    ? "Disabling..."
                    : "Disable Item"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() =>
              !deleteProductMutation.isPending && setShowDeleteModal(false)
            }
          >
            <motion.div
              className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <Paragraph1 className="font-semibold text-lg">
                    Delete Item?
                  </Paragraph1>
                </div>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleteProductMutation.isPending}
                  className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="mb-6">
                <Paragraph1 className="text-gray-600">
                  This action cannot be undone. The item will be permanently
                  removed from your inventory.
                </Paragraph1>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleteProductMutation.isPending}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleteProductMutation.isPending}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleteProductMutation.isPending
                    ? "Deleting..."
                    : "Delete Item"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageItemHeader;
