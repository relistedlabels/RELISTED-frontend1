"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import type { Return } from "@/lib/api/admin/orders";

interface ReturnDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  return?: Return;
}

const ReturnDetailModal: React.FC<ReturnDetailModalProps> = ({
  isOpen,
  onClose,
  return: returnData,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const totalImages = returnData?.imageUrls?.length || 0;
  const currentImage = returnData?.imageUrls?.[currentImageIndex];

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? totalImages - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === totalImages - 1 ? 0 : prev + 1));
  };

  React.useEffect(() => {
    if (isOpen) {
      setCurrentImageIndex(0);
    }
  }, [isOpen, returnData]);

  if (!returnData) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center">
              <div>
                <Paragraph3 className="text-lg font-bold text-gray-900">
                  Return Details
                </Paragraph3>
                <Paragraph1 className="text-gray-600 mt-1">
                  {returnData.itemName}
                </Paragraph1>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Image Viewer */}
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                  <div className="relative w-full h-[400px] aspect-square flex items-center justify-center bg-gray-100">
                    {currentImage ? (
                      <img
                        src={currentImage}
                        alt={`Return image ${currentImageIndex + 1}`}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <Paragraph1 className="text-gray-400">
                        No images available
                      </Paragraph1>
                    )}

                    {/* Navigation Buttons */}
                    {totalImages > 1 && (
                      <>
                        <button
                          onClick={handlePrevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition"
                        >
                          <ChevronLeft size={24} />
                        </button>
                        <button
                          onClick={handleNextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition"
                        >
                          <ChevronRight size={24} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Image Counter */}
                {totalImages > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <Paragraph1 className="text-sm text-gray-600">
                      Image {currentImageIndex + 1} of {totalImages}
                    </Paragraph1>
                    <div className="flex gap-1">
                      {Array.from({ length: totalImages }).map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-2 h-2 rounded-full transition ${
                            index === currentImageIndex
                              ? "bg-gray-900"
                              : "bg-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Return Details */}
              <div className="border-t border-gray-200 pt-6 space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                      Return ID
                    </Paragraph1>
                    <Paragraph1 className="font-semibold text-gray-900">
                      {returnData.id}
                    </Paragraph1>
                  </div>
                  <div>
                    <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                      Order ID
                    </Paragraph1>
                    <Paragraph1 className="font-semibold text-gray-900">
                      {returnData.orderId}
                    </Paragraph1>
                  </div>
                  <div>
                    <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                      Item Condition
                    </Paragraph1>
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                      {returnData.itemCondition}
                    </span>
                  </div>
                  <div>
                    <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                      Status
                    </Paragraph1>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        returnData.status === "APPROVED"
                          ? "bg-green-100 text-green-700"
                          : returnData.status === "REJECTED"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {returnData.status}
                    </span>
                  </div>
                </div>

                <div>
                  <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                    Damage Notes
                  </Paragraph1>
                  <Paragraph1 className="text-gray-700">
                    {returnData.damageNotes || "-"}
                  </Paragraph1>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                      Lister
                    </Paragraph1>
                    <Paragraph1 className="font-semibold text-gray-900">
                      {returnData.lister.name}
                    </Paragraph1>
                  </div>
                  <div>
                    <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                      Renter
                    </Paragraph1>
                    <Paragraph1 className="font-semibold text-gray-900">
                      {returnData.renter.name}
                    </Paragraph1>
                  </div>
                </div>

                <div>
                  <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                    Date
                  </Paragraph1>
                  <Paragraph1 className="text-gray-700">
                    {new Date(returnData.createdAt).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}
                  </Paragraph1>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReturnDetailModal;
