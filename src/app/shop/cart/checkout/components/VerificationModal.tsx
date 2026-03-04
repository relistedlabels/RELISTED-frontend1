"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, Loader, Upload, FileText } from "lucide-react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { useUpdateProfileMutation } from "@/lib/queries/renters/useUpdateProfileMutation";
import { useUploadIdDocument } from "@/lib/queries/renters/useUploadIdDocument";

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
  currentBvn?: string | null;
  currentNin?: string | null;
}

type VerificationStep = "welcome" | "input" | "submitting";

export default function VerificationModal({
  isOpen,
  onClose,
  onVerified,
  currentBvn,
  currentNin,
}: VerificationModalProps) {
  const [step, setStep] = useState<VerificationStep>("welcome");
  const [bvn, setBvn] = useState("");
  const [nin, setNin] = useState("");
  const [idFile, setIdFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string>("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateProfileMutation = useUpdateProfileMutation();
  const uploadIdDocMutation = useUploadIdDocument();

  const handleProceed = () => {
    setStep("input");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIdFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setFilePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const isFormComplete = bvn.trim() && nin.trim() && idFile;

  const handleVerify = async () => {
    if (!bvn.trim() || !nin.trim() || !idFile) {
      setError("Please fill in all fields: BVN, NIN, and ID document");
      return;
    }

    setError("");
    setIsSubmitting(true);
    setStep("submitting");

    try {
      // Submit both requests in parallel
      const promises = [];

      // 1. Update profile with BVN and NIN via PUT /api/renters/profile
      promises.push(
        updateProfileMutation.mutateAsync({
          bvn,
          nin,
        } as any),
      );

      // 2. Upload ID document via POST /api/renters/profile/verifications/id-document
      const idFormData = new FormData();
      idFormData.append("idDocument", idFile);
      idFormData.append("idType", "national_id");
      promises.push(uploadIdDocMutation.mutateAsync(idFormData));

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
                    Let's Get You Verified! 🎉
                  </Paragraph3>
                  <Paragraph1 className="text-gray-600 text-sm leading-relaxed">
                    To unlock the full RELISTED experience and complete your
                    first rental, we just need to verify your identity. It takes
                    less than 2 minutes!
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
                    Upload ID Document <span className="text-red-500">*</span>
                  </label>
                  <label className="relative cursor-pointer">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-black transition-colors flex items-center justify-center gap-2 bg-gray-50">
                      <Upload size={20} className="text-gray-600" />
                      <Paragraph1 className="text-sm text-gray-600">
                        Click to upload or drag and drop
                      </Paragraph1>
                    </div>
                  </label>

                  {/* File Preview */}
                  {idFile && filePreview && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200 flex items-center gap-3"
                    >
                      {idFile.type.startsWith("image/") ? (
                        <div className="w-12 h-12 rounded border border-blue-300 overflow-hidden flex-shrink-0">
                          <img
                            src={filePreview}
                            alt="ID Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <FileText size={24} className="text-blue-600" />
                        </div>
                      )}
                      <div className="flex-grow min-w-0">
                        <Paragraph1 className="text-xs font-semibold text-blue-900 truncate">
                          ✓ {idFile.name}
                        </Paragraph1>
                        <Paragraph1 className="text-xs text-blue-600">
                          {(idFile.size / 1024).toFixed(2)} KB
                        </Paragraph1>
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
                    disabled={!isFormComplete || isSubmitting}
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
