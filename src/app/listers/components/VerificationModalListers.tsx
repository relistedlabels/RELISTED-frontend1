"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, Loader, Upload, FileText } from "lucide-react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { useUpdateListerProfileMutation } from "@/lib/queries/listers/useUpdateListerProfileMutation";
import { useUpload } from "@/lib/queries/renters/useUpload";
import { useUploadNinDocument } from "@/lib/queries/listers/useUploadNinDocument";

interface VerificationModalListersProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
  currentBvn?: string | null;
}

type VerificationStep = "welcome" | "input" | "submitting";

export default function VerificationModalListers({
  isOpen,
  onClose,
  onVerified,
  currentBvn,
}: VerificationModalListersProps) {
  const [step, setStep] = useState<VerificationStep>("welcome");
  const [bvn, setBvn] = useState("");
  const [nin, setNin] = useState("");
  const [ninDocument, setNinDocument] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string>("");
  const [uploadId, setUploadId] = useState<string | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [fileUploadError, setFileUploadError] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateListerProfileMutation = useUpdateListerProfileMutation();
  const uploadMutation = useUpload();
  const uploadNinMutation = useUploadNinDocument();

  const handleProceed = () => {
    setStep("input");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNinDocument(file);
      setFileUploadError("");
      setUploadId(null);

      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setFilePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Start uploading the file
      setIsUploadingFile(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        const response = await uploadMutation.mutateAsync(formData);
        const id = response.id || response.data?.uploadId || response.data?.id;
        if (id) {
          setUploadId(id);
        } else {
          throw new Error("No upload ID received from server");
        }
      } catch (err) {
        console.error("File upload error:", err);
        setFileUploadError("Failed to upload file. Please try again.");
        setNinDocument(null);
        setFilePreview("");
      } finally {
        setIsUploadingFile(false);
      }
    }
  };

  const handleVerify = async () => {
    if (!bvn.trim() || !nin.trim() || !ninDocument || !uploadId) {
      setError("Please fill in all fields and upload NIN document");
      return;
    }

    setError("");
    setIsSubmitting(true);
    setStep("submitting");

    try {
      // Submit both requests in parallel
      const promises = [];

      // 1. Update profile with BVN and NIN via PUT /api/listers/profile
      promises.push(
        updateListerProfileMutation.mutateAsync({
          bvn,
          nin,
        }),
      );

      // 2. POST /api/listers/verifications/id (JSON: uploadId + idType)
      promises.push(
        uploadNinMutation.mutateAsync({
          uploadId,
          idType: "NIN",
        }),
      );

      // Wait for both to complete
      await Promise.all(promises);

      // Show success message
      alert("Submission Successful! Processing your document...");

      // Close modal and start countdown
      onVerified();
      onClose();
    } catch (err) {
      console.error("Verification error:", err);
      setError("Submission failed. Please try again.");
      setStep("input");
    } finally {
      setIsSubmitting(false);
    }
  };

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
            className="fixed inset-0 bg-black/50 h-screen bg-opacity-50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto z-50"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
            >
              <X size={20} className="text-gray-600" />
            </button>

            {/* Welcome Step */}
            {step === "welcome" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center space-y-6"
              >
                {/* Logo placeholder */}
                <div className="mb-6 flex justify-center">
                  <img src="/images/logo1.svg" alt="Logo" />
                </div>

                <div>
                  <Paragraph3 className="text-2xl font-bold text-gray-900 mb-2">
                    Let's Verify Your Account! 🎉
                  </Paragraph3>
                  <Paragraph1 className="text-gray-600 text-sm leading-relaxed">
                    To start listing items and build trust with renters, we need
                    to verify your identity. It takes less than 2 minutes!
                  </Paragraph1>
                </div>

                <div className="space-y-3 bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-3">
                    <CheckCircle size={20} className="text-blue-600 mt-0.5" />
                    <Paragraph1 className="text-sm text-blue-900">
                      Your information is secure and encrypted
                    </Paragraph1>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle size={20} className="text-blue-600 mt-0.5" />
                    <Paragraph1 className="text-sm text-blue-900">
                      We follow international security standards
                    </Paragraph1>
                  </div>
                </div>

                <button
                  onClick={handleProceed}
                  className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-900 transition-colors"
                >
                  Proceed to Verification
                </button>
              </motion.div>
            )}

            {/* Input Step */}
            {step === "input" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div>
                  <Paragraph3 className="font-bold text-gray-900 mb-2">
                    Verify Your Identity
                  </Paragraph3>
                  <Paragraph1 className="text-sm text-gray-600">
                    Enter your BVN and NIN to verify your identity
                  </Paragraph1>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <Paragraph1 className="text-xs font-medium text-amber-900 mb-1">
                    ⚠️ Important: Use your correct BVN
                  </Paragraph1>
                  <Paragraph1 className="text-xs text-amber-800">
                    Ensure the BVN you provide is accurate. An incorrect BVN
                    will prevent you from making purchases and delay your
                    verification.
                  </Paragraph1>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <Paragraph1 className="text-xs text-red-700">
                      {error}
                    </Paragraph1>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    BVN (Bank Verification Number)
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your 11-digit BVN"
                    value={bvn}
                    onChange={(e) => setBvn(e.target.value.replace(/\D/g, ""))}
                    maxLength={11}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    NIN (National Identification Number)
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your 11-digit NIN"
                    value={nin}
                    onChange={(e) => setNin(e.target.value.replace(/\D/g, ""))}
                    maxLength={11}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Upload NIN Document <span className="text-red-500">*</span>
                  </label>
                  <label className="relative cursor-pointer">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      disabled={isUploadingFile}
                      className="hidden"
                    />
                    <div
                      className={`w-full px-4 py-3 border-2 border-dashed rounded-lg flex items-center justify-center gap-2 transition-colors ${
                        isUploadingFile
                          ? "border-gray-300 bg-gray-50 cursor-not-allowed"
                          : "border-gray-300 hover:border-black bg-gray-50 cursor-pointer"
                      }`}
                    >
                      {isUploadingFile ? (
                        <>
                          <Loader
                            size={20}
                            className="text-gray-600 animate-spin"
                          />
                          <Paragraph1 className="text-sm text-gray-600">
                            Uploading...
                          </Paragraph1>
                        </>
                      ) : (
                        <>
                          <Upload size={20} className="text-gray-600" />
                          <Paragraph1 className="text-sm text-gray-600">
                            Click to upload or drag and drop
                          </Paragraph1>
                        </>
                      )}
                    </div>
                  </label>

                  {/* File Upload Error */}
                  {fileUploadError && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200"
                    >
                      <Paragraph1 className="text-xs text-red-700">
                        {fileUploadError}
                      </Paragraph1>
                    </motion.div>
                  )}

                  {/* File Preview with Upload Progress */}
                  {ninDocument && filePreview && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`mt-3 p-3 rounded-lg border flex items-center gap-3 ${
                        isUploadingFile
                          ? "bg-yellow-50 border-yellow-200"
                          : uploadId
                            ? "bg-green-50 border-green-200"
                            : "bg-blue-50 border-blue-200"
                      }`}
                    >
                      {ninDocument.type.startsWith("image/") ? (
                        <div
                          className="w-12 h-12 rounded border overflow-hidden flex-shrink-0"
                          style={{
                            borderColor: isUploadingFile
                              ? "#fbbf24"
                              : uploadId
                                ? "#86efac"
                                : "#93c5fd",
                          }}
                        >
                          <img
                            src={filePreview}
                            alt="NIN Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div
                          className="w-12 h-12 rounded flex items-center justify-center flex-shrink-0"
                          style={{
                            backgroundColor: isUploadingFile
                              ? "#fef3c7"
                              : uploadId
                                ? "#dcfce7"
                                : "#dbeafe",
                          }}
                        >
                          <FileText
                            size={24}
                            style={{
                              color: isUploadingFile
                                ? "#d97706"
                                : uploadId
                                  ? "#22c55e"
                                  : "#2563eb",
                            }}
                          />
                        </div>
                      )}
                      <div className="flex-grow min-w-0">
                        <div
                          style={{
                            color: isUploadingFile
                              ? "#92400e"
                              : uploadId
                                ? "#166534"
                                : "#1e3a8a",
                          }}
                        >
                          <Paragraph1 className="text-xs font-semibold truncate">
                            {isUploadingFile
                              ? "Uploading..."
                              : uploadId
                                ? "✓ "
                                : ""}
                            {ninDocument.name}
                          </Paragraph1>
                        </div>
                        <div
                          style={{
                            color: isUploadingFile
                              ? "#b45309"
                              : uploadId
                                ? "#16a34a"
                                : "#1d4ed8",
                          }}
                        >
                          <Paragraph1 className="text-xs">
                            {(ninDocument.size / 1024).toFixed(2)} KB
                          </Paragraph1>
                        </div>
                        {isUploadingFile && (
                          <div className="mt-2 w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: "100%" }}
                              transition={{ duration: 2, ease: "easeInOut" }}
                              className="h-full bg-yellow-500"
                            />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-bold hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleVerify}
                    disabled={
                      !bvn.trim() ||
                      !nin.trim() ||
                      !ninDocument ||
                      !uploadId ||
                      isUploadingFile ||
                      isSubmitting
                    }
                    className="flex-1 px-4 py-3 bg-black text-white rounded-lg font-bold hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {isSubmitting && (
                      <Loader size={16} className="animate-spin" />
                    )}
                    {isSubmitting ? "Submitting..." : "Verify"}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Submitting Step */}
            {step === "submitting" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center space-y-6 py-8"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 mx-auto"
                >
                  <Loader size={64} className="text-black" />
                </motion.div>
                <div>
                  <Paragraph3 className="font-bold text-gray-900">
                    Submitting Your Information
                  </Paragraph3>
                  <Paragraph1 className="text-sm text-gray-600 mt-2">
                    Please wait while we process your verification...
                  </Paragraph1>
                </div>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
