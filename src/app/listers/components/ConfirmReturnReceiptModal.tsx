"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CheckCircle2,
  Upload,
  X as XIcon,
  AlertTriangle,
  ShieldAlert,
} from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import { useUpload } from "@/lib/queries/renters/useUpload";
import { toast } from "sonner";

interface ConfirmReturnReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (
    actualCondition: "GOOD" | "FAIR" | "POOR",
    damageNotes: string,
    images: string[],
  ) => Promise<void>;
  onReject?: () => Promise<void>;
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
type SuccessMode = "released" | "dispute";

const ConfirmReturnReceiptModal: React.FC<ConfirmReturnReceiptModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onReject,
  isLoading: externalIsLoading = false,
  renterInfo,
  itemCondition,
  renterDamageNotes,
  imageUrls,
}) => {
  const [currentStep, setCurrentStep] = useState<ModalStep>("confirmation");
  const [successMode, setSuccessMode] = useState<SuccessMode>("released");
  const [actualCondition, setActualCondition] = useState<
    "GOOD" | "FAIR" | "POOR"
  >("GOOD");
  const [damageNotes, setDamageNotes] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const uploadMutation = useUpload();
  const isDamageReport = actualCondition === "POOR";

  const resetForm = () => {
    setCurrentStep("confirmation");
    setSuccessMode("released");
    setActualCondition("GOOD");
    setDamageNotes("");
    setUploadedImages([]);
    setPreviewUrls([]);
    setErrorMessage(null);
  };

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
    resetForm();
    onClose();
  };

  const handleConfirm = async () => {
    if (isDamageReport) {
      if (damageNotes.trim().length < 20) {
        setErrorMessage(
          "Please describe the damage in at least 20 characters.",
        );
        return;
      }
      if (uploadedImages.length === 0) {
        setErrorMessage("Upload at least one photo of the damage.");
        return;
      }
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const imageUuids: string[] = [];
      for (const file of uploadedImages) {
        const formData = new FormData();
        formData.append("file", file);
        const uploadResult = await uploadMutation.mutateAsync(formData);
        imageUuids.push(uploadResult.uploadId || uploadResult.id || "");
      }

      await onConfirm(actualCondition, damageNotes, imageUuids);
      setSuccessMode(isDamageReport ? "dispute" : "released");
      setCurrentStep("success");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : isDamageReport
            ? "Failed to submit damage report. Please try again."
            : "Failed to confirm return receipt. Please try again.";
      toast.error(message);
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (onReject) {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        await onReject();
        onClose();
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to reject return. Please try again.";
        toast.error(message);
        setErrorMessage(message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="z-100 fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm p-4"
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
          <div className="flex justify-between items-center p-4 border-gray-200 border-b">
            <h2 className="font-bold text-gray-900 text-lg">
              {currentStep === "confirmation"
                ? isDamageReport
                  ? "Report Return Damage"
                  : "Inspect Returned Item"
                : successMode === "dispute"
                  ? "Dispute Opened"
                  : "Return Confirmed"}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4 p-4">
            {currentStep === "confirmation" && (
              <>
                <div className="gap-3 grid grid-cols-1">
                  {renterInfo && renterInfo.name && (
                    <div className="space-y-2 bg-gray-50 p-4 border border-gray-100 rounded-xl">
                      <Paragraph1 className="font-bold text-gray-900 text-xs uppercase tracking-wider">
                        Renter Details
                      </Paragraph1>
                      <div className="space-y-1">
                        <Paragraph1 className="text-gray-700 text-sm">
                          <span className="font-medium text-gray-500">
                            Name:
                          </span>{" "}
                          {renterInfo.name}
                        </Paragraph1>
                        {renterInfo.phone && (
                          <Paragraph1 className="text-gray-700 text-sm">
                            <span className="font-medium text-gray-500">
                              Phone:
                            </span>{" "}
                            {renterInfo.phone}
                          </Paragraph1>
                        )}
                        {renterInfo.email && (
                          <Paragraph1 className="text-gray-700 text-sm truncate">
                            <span className="font-medium text-gray-500">
                              Email:
                            </span>{" "}
                            {renterInfo.email}
                          </Paragraph1>
                        )}
                      </div>
                    </div>
                  )}

                  {itemCondition && (
                    <div className="space-y-2 bg-blue-50 p-4 border border-blue-100 rounded-xl">
                      <Paragraph1 className="font-bold text-blue-900 text-xs uppercase tracking-wider">
                        Renter Reported Condition
                      </Paragraph1>
                      <div className="space-y-1">
                        <Paragraph1 className="text-blue-700 text-sm">
                          <span className="font-medium text-blue-500">
                            Condition:
                          </span>{" "}
                          {itemCondition}
                        </Paragraph1>
                        {renterDamageNotes && (
                          <Paragraph1 className="text-blue-700 text-sm">
                            <span className="font-medium text-blue-500">
                              Notes:
                            </span>{" "}
                            {renterDamageNotes}
                          </Paragraph1>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {imageUrls && imageUrls.length > 0 && (
                  <div className="space-y-3">
                    <label className="block font-bold text-gray-900 text-sm">
                      Renter&apos;s Condition Photos
                    </label>
                    <div className="gap-3 grid grid-cols-3">
                      {imageUrls.map((url, index) => (
                        <div
                          key={index}
                          className="group relative shadow-sm border border-gray-200 rounded-xl hover:ring-2 hover:ring-blue-500 aspect-square overflow-hidden transition-all cursor-pointer"
                          onClick={() => window.open(url, "_blank")}
                        >
                          <img
                            src={url}
                            alt={`Renter's condition photo ${index + 1}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <label className="block font-bold text-gray-900 text-sm">
                      Assess Item Condition{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={actualCondition}
                        onChange={(e) => {
                          setActualCondition(
                            e.target.value as "GOOD" | "FAIR" | "POOR",
                          );
                          setErrorMessage(null);
                        }}
                        className="bg-white px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black w-full text-gray-900 text-sm transition-all appearance-none"
                      >
                        <option value="GOOD">
                          Good - In expected condition
                        </option>
                        <option value="FAIR">Fair - Minor wear/tear</option>
                        <option value="POOR">
                          Poor - Significant damage
                        </option>
                      </select>
                      <div className="top-1/2 right-4 absolute -translate-y-1/2 pointer-events-none">
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {isDamageReport && (
                    <div className="flex gap-3 bg-red-50 p-4 border border-red-200 rounded-xl">
                      <ShieldAlert
                        size={20}
                        className="flex-shrink-0 mt-0.5 text-red-600"
                      />
                      <div className="space-y-1">
                        <Paragraph1 className="font-bold text-red-900 text-sm">
                          A dispute will be opened automatically
                        </Paragraph1>
                        <Paragraph1 className="text-red-800 text-xs leading-relaxed">
                          Submitting this report confirms you received the item
                          but found significant damage. We will create a damage
                          dispute, hold the renter&apos;s deposit and your
                          payout, and notify our team to review your photos and
                          notes. Collateral will not be released until the
                          dispute is resolved.
                        </Paragraph1>
                      </div>
                    </div>
                  )}

                  {!isDamageReport && (
                    <div className="flex gap-3 bg-green-50 p-4 border border-green-100 rounded-xl">
                      <CheckCircle2
                        size={20}
                        className="flex-shrink-0 mt-0.5 text-green-600"
                      />
                      <div className="space-y-1">
                        <Paragraph1 className="font-bold text-green-900 text-sm">
                          No issues reported
                        </Paragraph1>
                        <Paragraph1 className="text-green-800 text-xs leading-relaxed">
                          Confirming will release the renter&apos;s collateral
                          and credit your rental amount plus cleaning fee to
                          your wallet.
                        </Paragraph1>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="block font-bold text-gray-900 text-sm">
                      Your Condition Photos{" "}
                      {isDamageReport ? (
                        <span className="text-red-500">*</span>
                      ) : (
                        <span className="font-normal text-gray-500">
                          (Optional)
                        </span>
                      )}
                    </label>
                    <Paragraph1 className="text-gray-500 text-xs">
                      {isDamageReport
                        ? "Upload clear photos of the damage. At least one is required."
                        : "Add photos of the item condition upon receipt"}
                    </Paragraph1>
                  </div>

                  <label className="group block">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      id="lister-image-upload"
                    />
                    <div
                      className={`bg-gray-50/50 hover:bg-white p-6 border-2 border-dashed rounded-xl transition-all cursor-pointer ${
                        isDamageReport
                          ? "border-red-200 hover:border-red-400"
                          : "border-gray-200 hover:border-black"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Upload
                          size={20}
                          className={
                            isDamageReport
                              ? "text-red-400 group-hover:text-red-600 transition-colors"
                              : "text-gray-400 group-hover:text-black transition-colors"
                          }
                        />
                        <Paragraph1
                          className={`font-medium text-xs text-center transition-colors ${
                            isDamageReport
                              ? "text-red-500 group-hover:text-red-700"
                              : "text-gray-500 group-hover:text-black"
                          }`}
                        >
                          {isDamageReport
                            ? "Upload damage photos (required)"
                            : "Click to upload condition photos"}
                        </Paragraph1>
                      </div>
                    </div>
                  </label>

                  {previewUrls.length > 0 && (
                    <div className="gap-3 grid grid-cols-3">
                      {previewUrls.map((url, index) => (
                        <div
                          key={index}
                          className="relative shadow-sm border border-gray-200 rounded-xl aspect-square overflow-hidden"
                        >
                          <img
                            src={url}
                            alt={`Uploaded photo ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => handleRemoveImage(index)}
                            className="top-1 right-1 absolute bg-black/70 hover:bg-black/80 p-1.5 rounded-full text-white hover:scale-110 transition-all"
                          >
                            <XIcon size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block font-bold text-gray-900 text-sm">
                    Condition Notes{" "}
                    {isDamageReport ? (
                      <span className="text-red-500">*</span>
                    ) : (
                      <span className="font-normal text-gray-500">
                        (Optional)
                      </span>
                    )}
                  </label>
                  <textarea
                    value={damageNotes}
                    onChange={(e) => setDamageNotes(e.target.value)}
                    placeholder={
                      isDamageReport
                        ? "Describe the damage in detail (minimum 20 characters)..."
                        : "Describe any damage or specific condition notes..."
                    }
                    className={`px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 w-full text-gray-900 text-sm transition-all resize-none placeholder-gray-400 ${
                      isDamageReport
                        ? "border-red-200 focus:ring-red-500"
                        : "border-gray-200 focus:ring-black"
                    }`}
                    rows={3}
                  />
                  {isDamageReport && (
                    <Paragraph1 className="text-gray-500 text-xs">
                      {damageNotes.trim().length}/20 characters minimum
                    </Paragraph1>
                  )}
                </div>

                {!isDamageReport && (
                  <div className="flex gap-3 bg-amber-50 p-4 border border-amber-100 rounded-xl">
                    <AlertTriangle
                      size={18}
                      className="flex-shrink-0 mt-0.5 text-amber-700"
                    />
                    <Paragraph1 className="text-amber-800 text-xs leading-relaxed">
                      Only confirm if the item is in acceptable condition. If
                      there is significant damage, select{" "}
                      <strong>Poor - Significant damage</strong> instead so we
                      can open a dispute and hold funds for review.
                    </Paragraph1>
                  </div>
                )}

                {errorMessage && (
                  <div className="bg-red-50 px-4 py-3 border border-red-100 rounded-xl font-medium text-red-700 text-xs">
                    {errorMessage}
                  </div>
                )}

                <div className="flex flex-col gap-3 pt-4 border-gray-100 border-t">
                  <button
                    onClick={handleConfirm}
                    disabled={isLoading || externalIsLoading}
                    className={`shadow-sm py-3.5 rounded-lg w-full font-bold text-white text-sm active:scale-[0.98] transition-all duration-200 disabled:cursor-not-allowed disabled:bg-gray-300 ${
                      isDamageReport
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-gray-900 hover:bg-gray-800"
                    }`}
                  >
                    {isLoading || externalIsLoading
                      ? isDamageReport
                        ? "Submitting report..."
                        : "Confirming..."
                      : isDamageReport
                        ? "Submit Damage Report & Open Dispute"
                        : "Confirm Receipt & Release Funds"}
                  </button>

                  <div className="flex gap-3">
                    <button
                      onClick={handleClose}
                      className="flex-1 bg-white hover:bg-gray-50 py-3 border border-gray-200 rounded-lg font-semibold text-gray-700 text-xs transition-all duration-200"
                    >
                      Cancel
                    </button>
                    {onReject && !isDamageReport && (
                      <button
                        onClick={handleReject}
                        disabled={isLoading || externalIsLoading}
                        className="flex-1 bg-red-50 hover:bg-red-100 py-3 border border-red-100 hover:border-red-200 rounded-lg font-semibold text-red-600 text-xs transition-all duration-200 disabled:cursor-not-allowed"
                      >
                        {isLoading || externalIsLoading
                          ? "Reporting..."
                          : "Item Not Received"}
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}

            {currentStep === "success" && (
              <>
                <div className="flex flex-col items-center space-y-4 py-6">
                  {successMode === "dispute" ? (
                    <ShieldAlert size={64} className="text-red-600" />
                  ) : (
                    <CheckCircle2 size={64} className="text-green-600" />
                  )}
                  <div className="space-y-2 text-center">
                    <Paragraph1 className="font-bold text-gray-900">
                      {successMode === "dispute"
                        ? "Damage Report Submitted"
                        : "Return Receipt Confirmed!"}
                    </Paragraph1>
                    <Paragraph1 className="text-gray-600 text-sm">
                      {successMode === "dispute"
                        ? "A dispute has been opened automatically. The renter's deposit and your payout are on hold while our team reviews. You can track progress under Disputes."
                        : "The collateral has been released to the renter and the order status has been updated."}
                    </Paragraph1>
                  </div>
                </div>

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
