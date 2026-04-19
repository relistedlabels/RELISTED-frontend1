"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, Upload, X as XIcon } from "lucide-react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { useUpload } from "@/lib/queries/renters/useUpload";

interface ConfirmReturnReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (
    actualCondition: "GOOD" | "FAIR" | "POOR",
    damageNotes: string,
    images: string[],
  ) => Promise<void>;
  isLoading?: boolean;
  renterInfo?: {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  itemCondition?: string;
  renterDamageNotes?: string;
  imageUrls?: string[];
}

type ModalStep = "confirmation" | "success";

const ConfirmReturnReceiptModal: React.FC<ConfirmReturnReceiptModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading: externalIsLoading = false,
  renterInfo,
  itemCondition,
  renterDamageNotes,
  imageUrls,
}) => {
  const [currentStep, setCurrentStep] = useState<ModalStep>("confirmation");
  const [actualCondition, setActualCondition] = useState<
    "GOOD" | "FAIR" | "POOR"
  >("GOOD");
  const [damageNotes, setDamageNotes] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const uploadMutation = useUpload();

  // Cleanup object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newFiles = [...uploadedImages, ...files];
    const newPreviews = [...previewUrls];

    files.forEach((file) => {
      const url = URL.createObjectURL(file);
      newPreviews.push(url);
    });

    setUploadedImages(newFiles);
    setPreviewUrls(newPreviews);
  };

  const handleRemoveImage = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClose = () => {
    if (currentStep === "success") {
      setCurrentStep("confirmation");
      setActualCondition("GOOD");
      setDamageNotes("");
      setUploadedImages([]);
      setPreviewUrls([]);
      setErrorMessage(null);
      onClose();
    } else {
      onClose();
      setCurrentStep("confirmation");
      setActualCondition("GOOD");
      setDamageNotes("");
      setUploadedImages([]);
      setPreviewUrls([]);
      setErrorMessage(null);
    }
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      // Upload images first to get UUIDs
      const imageUuids: string[] = [];
      for (const file of uploadedImages) {
        const formData = new FormData();
        formData.append("file", file);
        const uploadResult = await uploadMutation.mutateAsync(formData);
        imageUuids.push(uploadResult.uploadId || uploadResult.id || "");
      }

      // Call onConfirm with images
      await onConfirm(actualCondition, damageNotes, imageUuids);
      setCurrentStep("success");
    } catch (error) {
      console.error("Error confirming return receipt:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Failed to confirm return receipt. Please try again.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="z-[100] fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <motion.div
          className="bg-white shadow-2xl rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto scroll-smooth"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-gray-200 border-b">
            <h2 className="font-bold text-gray-900 text-lg">
              {currentStep === "confirmation"
                ? "Confirm Return Receipt"
                : "Return Confirmed"}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-4 p-4">
            {currentStep === "confirmation" && (
              <>
                {/* Renter Info */}
                {renterInfo && renterInfo.name && (
                  <div className="space-y-2 bg-gray-50 p-3 rounded-lg">
                    <Paragraph1 className="font-semibold text-gray-900">
                      Renter Information
                    </Paragraph1>
                    <Paragraph1 className="text-gray-700 text-sm">
                      <span className="font-semibold">Name:</span>{" "}
                      {renterInfo.name}
                    </Paragraph1>
                    {renterInfo.phone && (
                      <Paragraph1 className="text-gray-700 text-sm">
                        <span className="font-semibold">Phone:</span>{" "}
                        {renterInfo.phone}
                      </Paragraph1>
                    )}
                    {renterInfo.email && (
                      <Paragraph1 className="text-gray-700 text-sm">
                        <span className="font-semibold">Email:</span>{" "}
                        {renterInfo.email}
                      </Paragraph1>
                    )}
                    {renterInfo.address && (
                      <Paragraph1 className="text-gray-700 text-sm">
                        <span className="font-semibold">Address:</span>{" "}
                        {renterInfo.address}
                      </Paragraph1>
                    )}
                  </div>
                )}

                {/* Renter Reported Condition */}
                {itemCondition && (
                  <div className="space-y-2 bg-blue-50 p-3 rounded-lg">
                    <Paragraph1 className="font-semibold text-blue-900">
                      Renter Reported Condition
                    </Paragraph1>
                    <Paragraph1 className="text-blue-700 text-sm">
                      <span className="font-semibold">Condition:</span>{" "}
                      {itemCondition}
                    </Paragraph1>
                    {renterDamageNotes && (
                      <Paragraph1 className="text-blue-700 text-sm">
                        <span className="font-semibold">Notes:</span>{" "}
                        {renterDamageNotes}
                      </Paragraph1>
                    )}
                  </div>
                )}

                {/* Renter's Condition Images */}
                {imageUrls && imageUrls.length > 0 && (
                  <div className="space-y-2">
                    <Paragraph1 className="font-semibold text-gray-900">
                      Renter's Condition Photos
                    </Paragraph1>
                    <div className="gap-2 grid grid-cols-3">
                      {imageUrls.map((url, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg aspect-square overflow-hidden"
                        >
                          <img
                            src={url}
                            alt={`Renter's condition photo ${index + 1}`}
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={() => window.open(url, "_blank")}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Lister's Image Upload */}
                <div className="space-y-2">
                  <Paragraph1 className="font-semibold text-gray-900">
                    Your Condition Photos (Optional)
                  </Paragraph1>
                  <Paragraph1 className="text-gray-600 text-sm">
                    Add photos of the item condition upon receipt
                  </Paragraph1>

                  {/* Upload Button */}
                  <label className="block">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      id="lister-image-upload"
                    />
                    <div className="p-4 border-2 border-gray-300 hover:border-gray-400 border-dashed rounded-lg transition cursor-pointer">
                      <div className="flex flex-col items-center gap-2">
                        <Upload size={24} className="text-gray-400" />
                        <Paragraph1 className="text-gray-600 text-sm text-center">
                          Click to upload condition photos
                        </Paragraph1>
                      </div>
                    </div>
                  </label>

                  {/* Image Previews */}
                  {previewUrls.length > 0 && (
                    <div className="gap-2 grid grid-cols-3">
                      {previewUrls.map((url, index) => (
                        <div
                          key={index}
                          className="relative border border-gray-200 rounded-lg aspect-square overflow-hidden"
                        >
                          <img
                            src={url}
                            alt={`Uploaded photo ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => handleRemoveImage(index)}
                            className="top-1 right-1 absolute bg-black/70 hover:bg-black/80 p-1 rounded-full text-white transition"
                          >
                            <XIcon size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Condition Assessment */}
                <div className="space-y-2">
                  <Paragraph1 className="font-semibold text-gray-900">
                    Assess Item Condition{" "}
                    <span className="text-red-500">*</span>
                  </Paragraph1>
                  <select
                    value={actualCondition}
                    onChange={(e) =>
                      setActualCondition(
                        e.target.value as "GOOD" | "FAIR" | "POOR",
                      )
                    }
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black w-full text-gray-900"
                  >
                    <option value="GOOD">
                      Good - Item in expected condition
                    </option>
                    <option value="FAIR">
                      Fair - Minor wear/tear beyond expected
                    </option>
                    <option value="POOR">
                      Poor - Significant damage or issues
                    </option>
                  </select>
                </div>

                {/* Damage Notes */}
                <div className="space-y-2">
                  <Paragraph1 className="font-semibold text-gray-900">
                    Damage Notes (Optional)
                  </Paragraph1>
                  <textarea
                    value={damageNotes}
                    onChange={(e) => setDamageNotes(e.target.value)}
                    placeholder="Describe any damage or condition notes..."
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black w-full text-gray-900 resize-none placeholder-gray-400"
                    rows={3}
                  />
                </div>

                {/* Info Box */}
                <div className="space-y-2 bg-yellow-50 p-3 border border-yellow-200 rounded-lg">
                  <Paragraph1 className="font-semibold text-yellow-900">
                    Important
                  </Paragraph1>
                  <Paragraph1 className="text-yellow-700 text-sm leading-relaxed">
                    Confirming receipt will release the collateral to the
                    renter. Make sure you have received and inspected the item
                    before confirming.
                  </Paragraph1>
                </div>

                {/* Error Message */}
                {errorMessage && (
                  <div className="bg-red-50 px-3 py-2 border border-red-200 rounded text-red-700 text-sm">
                    {errorMessage}
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleClose}
                    className="flex-1 hover:bg-gray-50 px-4 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 text-sm transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={isLoading || externalIsLoading}
                    className="flex-1 bg-black hover:bg-gray-900 disabled:bg-gray-400 px-4 py-3 rounded-lg font-semibold text-white text-sm transition disabled:cursor-not-allowed"
                  >
                    {isLoading || externalIsLoading
                      ? "Confirming..."
                      : "Confirm Receipt"}
                  </button>
                </div>
              </>
            )}

            {currentStep === "success" && (
              <>
                {/* Success Message */}
                <div className="flex flex-col items-center space-y-4 py-6">
                  <CheckCircle2 size={64} className="text-green-600" />
                  <div className="space-y-2 text-center">
                    <Paragraph1 className="font-bold text-gray-900">
                      Return Receipt Confirmed!
                    </Paragraph1>
                    <Paragraph1 className="text-gray-600">
                      The collateral has been released to the renter and the
                      order status has been updated.
                    </Paragraph1>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={handleClose}
                  className="bg-black hover:bg-gray-900 px-4 py-3 rounded-lg w-full font-semibold text-white text-sm transition"
                >
                  Done
                </button>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
};

export default ConfirmReturnReceiptModal;
