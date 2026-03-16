"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, CheckCircle2, AlertCircle } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import Button from "@/common/ui/Button";

interface ReadyToReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (
    images: File[],
    itemCondition: string,
    damageNotes: string,
  ) => Promise<void>;
  isLoading?: boolean;
}

type ModalStep = "confirmation" | "upload" | "success";

const ReadyToReturnModal: React.FC<ReadyToReturnModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading: externalIsLoading = false,
}) => {
  const [currentStep, setCurrentStep] = useState<ModalStep>("confirmation");
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [itemCondition, setItemCondition] = useState<string>("good");
  const [damageNotes, setDamageNotes] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedImages((prev) => [...prev, ...files]);

    // Create preview URLs
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewUrls((prev) => [...prev, event.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleProceed = async () => {
    if (uploadedImages.length === 0) {
      alert("Please upload at least one image");
      return;
    }

    setIsLoading(true);
    try {
      await onConfirm(uploadedImages, itemCondition, damageNotes);
      setCurrentStep("success");
    } catch (error) {
      console.error("Error confirming return:", error);
      alert("Failed to confirm return. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (currentStep === "success") {
      setCurrentStep("confirmation");
      setUploadedImages([]);
      setPreviewUrls([]);
      setItemCondition("good");
      setDamageNotes("");
      onClose();
    } else {
      onClose();
      setCurrentStep("confirmation");
      setUploadedImages([]);
      setPreviewUrls([]);
      setItemCondition("good");
      setDamageNotes("");
    }
  };

  const handleSuccessClose = () => {
    setCurrentStep("confirmation");
    setUploadedImages([]);
    setPreviewUrls([]);
    setItemCondition("good");
    setDamageNotes("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Return Item</h2>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {currentStep === "confirmation" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* Icon */}
                  <div className="flex justify-center mb-4">
                    <div className="bg-blue-50 p-4 rounded-full">
                      <AlertCircle className="text-blue-600" size={40} />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-3">
                    <Paragraph1 className="font-semibold text-gray-900">
                      Ready to Return?
                    </Paragraph1>
                    <Paragraph1 className="text-gray-600 leading-relaxed">
                      Before proceeding, please make sure:
                    </Paragraph1>

                    {/* Checklist */}
                    <ul className="space-y-2 ml-2">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold mt-0.5">
                          ✓
                        </span>
                        <Paragraph1 className="text-gray-700">
                          Item is in good condition
                        </Paragraph1>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold mt-0.5">
                          ✓
                        </span>
                        <Paragraph1 className="text-gray-700">
                          Item is properly packaged
                        </Paragraph1>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold mt-0.5">
                          ✓
                        </span>
                        <Paragraph1 className="text-gray-700">
                          Item is ready to ship
                        </Paragraph1>
                      </li>
                    </ul>

                    {/* Rider Info */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
                      <Paragraph1 className="text-green-700">
                        <span className="font-semibold">Free Pickup:</span> A
                        rider will be assigned at no extra cost to collect your
                        item.
                      </Paragraph1>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleClose}
                      className="flex-1 px-4 py-3 text-sm font-semibold border border-gray-300 rounded-lg hover:bg-gray-50 transition text-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setCurrentStep("upload")}
                      className="flex-1 px-4 py-3 text-sm font-semibold bg-black text-white rounded-lg hover:bg-gray-900 transition"
                    >
                      Continue
                    </button>
                  </div>
                </motion.div>
              )}

              {currentStep === "upload" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* Header */}
                  <div>
                    <Paragraph1 className="font-semibold text-gray-900">
                      Upload Item Photos
                    </Paragraph1>
                    <Paragraph1 className="text-gray-600 mt-1">
                      Take photos of the item in its current state to confirm
                      condition
                    </Paragraph1>
                  </div>

                  {/* Image Upload Area */}
                  <div className="space-y-3">
                    <label className="block">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition cursor-pointer">
                        <Upload
                          className="mx-auto text-gray-400 mb-2"
                          size={32}
                        />
                        <Paragraph1 className="text-gray-600 font-medium">
                          Click to upload photos
                        </Paragraph1>
                        <Paragraph1 className="text-gray-500 text-xs mt-1">
                          PNG, JPG up to 5MB each
                        </Paragraph1>
                      </div>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>

                    {/* Image Previews */}
                    {previewUrls.length > 0 && (
                      <div className="space-y-2">
                        <Paragraph1 className="font-medium text-gray-700">
                          Uploaded Images ({previewUrls.length})
                        </Paragraph1>
                        <div className="grid grid-cols-3 gap-3">
                          {previewUrls.map((url, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={url}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg"
                              />
                              <button
                                onClick={() => removeImage(index)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Info Box */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <Paragraph1 className="text-blue-700 text-xs">
                      <span className="font-semibold">Tip:</span> Upload clear
                      photos showing the overall condition, any wear, and
                      packaging
                    </Paragraph1>
                  </div>

                  {/* Item Condition */}
                  <div className="space-y-2">
                    <label className="block">
                      <Paragraph1 className="font-semibold text-gray-900 mb-2">
                        Item Condition <span className="text-red-500">*</span>
                      </Paragraph1>
                      <select
                        value={itemCondition}
                        onChange={(e) => setItemCondition(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900"
                      >
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                        <option value="poor">Poor</option>
                      </select>
                    </label>
                  </div>

                  {/* Damage Notes */}
                  <div className="space-y-2">
                    <label className="block">
                      <Paragraph1 className="font-semibold text-gray-900 mb-2">
                        Damage Notes{" "}
                        <span className="text-gray-500">(Optional)</span>
                      </Paragraph1>
                      <textarea
                        value={damageNotes}
                        onChange={(e) => setDamageNotes(e.target.value)}
                        placeholder="Describe any damage, stains, or issues with the item..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900 placeholder-gray-400 resize-none"
                        rows={3}
                      />
                    </label>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setCurrentStep("confirmation")}
                      className="flex-1 px-4 py-3 text-sm font-semibold border border-gray-300 rounded-lg hover:bg-gray-50 transition text-gray-700"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleProceed}
                      disabled={
                        isLoading ||
                        externalIsLoading ||
                        uploadedImages.length === 0
                      }
                      className="flex-1 px-4 py-3 text-sm font-semibold bg-black text-white rounded-lg hover:bg-gray-900 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {isLoading || externalIsLoading
                        ? "Processing..."
                        : "Proceed"}
                    </button>
                  </div>
                </motion.div>
              )}

              {currentStep === "success" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-4 text-center py-4"
                >
                  {/* Success Icon */}
                  <div className="flex justify-center mb-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 15,
                      }}
                      className="bg-green-50 p-4 rounded-full"
                    >
                      <CheckCircle2 className="text-green-600" size={48} />
                    </motion.div>
                  </div>

                  {/* Success Message */}
                  <div className="space-y-2">
                    <Paragraph1 className="font-bold text-gray-900">
                      Return Confirmed!
                    </Paragraph1>
                    <Paragraph1 className="text-gray-600">
                      Your return request has been submitted successfully.
                    </Paragraph1>
                  </div>

                  {/* Info Box */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                    <Paragraph1 className="font-semibold text-blue-900">
                      What happens next?
                    </Paragraph1>
                    <Paragraph1 className="text-blue-700 text-sm leading-relaxed">
                      A rider will contact you shortly to arrange pickup at your
                      convenience. Make sure to keep the item in the location
                      you specified.
                    </Paragraph1>
                  </div>

                  {/* Close Button */}
                  <button
                    onClick={handleSuccessClose}
                    className="w-full px-4 py-3 text-sm font-semibold bg-black text-white rounded-lg hover:bg-gray-900 transition"
                  >
                    Done
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReadyToReturnModal;
