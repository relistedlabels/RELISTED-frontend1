"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, FileText, Loader, Upload, X } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { useUpdateProfileMutation } from "@/lib/queries/renters/useUpdateProfileMutation";
import { useUploadIdDocument } from "@/lib/queries/renters/useUploadIdDocument";
import { buttonPrimary, buttonPrimaryFull, buttonSecondary } from "@/common/ui/buttonClasses";
import { dialogBackdrop, dialogCard } from "@/common/ui/dashboardClasses";

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
}

type VerificationStep = "welcome" | "input" | "submitting";

export default function VerificationModal({
  isOpen,
  onClose,
  onVerified,
}: VerificationModalProps) {
  const [step, setStep] = useState<VerificationStep>("welcome");
  const [idNumber, setIdNumber] = useState("");
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

      const reader = new FileReader();
      reader.onload = (event) => {
        setFilePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const isFormComplete = idNumber.trim().length >= 5 && idFile;

  const handleVerify = async () => {
    if (!idNumber.trim() || !idFile) {
      setError("Please enter your ID number and upload your ID document.");
      return;
    }

    setError("");
    setIsSubmitting(true);
    setStep("submitting");

    try {
      const promises: Promise<unknown>[] = [];

      promises.push(
        updateProfileMutation.mutateAsync({
          nin: idNumber.trim(),
        } as any),
      );

      const idFormData = new FormData();
      idFormData.append("idDocument", idFile);
      idFormData.append("idType", "NIN");
      promises.push(uploadIdDocMutation.mutateAsync(idFormData));

      await Promise.all(promises);

      onVerified();
      onClose();
    } catch (err) {
      console.error("Verification error:", err);
      const message =
        err instanceof Error ? err.message : "Submission failed. Please try again.";
      setError(message);
      setStep("input");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className={`${dialogBackdrop} z-40`}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`${dialogCard} relative max-h-[90vh] overflow-y-auto rounded-2xl p-8`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
            >
              <X size={20} className="text-gray-600" />
            </button>

            {step === "welcome" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center space-y-6"
              >
                <div className="mb-6 flex justify-center">
                  <img src="/images/logo1.svg" alt="Logo" />
                </div>

                <div>
                  <Paragraph3 className="text-2xl font-bold text-gray-900 mb-2">
                    Let's Get You Verified! 🎉
                  </Paragraph3>
                  <Paragraph1 className="text-gray-600 text-sm leading-relaxed">
                    Upload a valid ID to unlock checkout and wallet top-ups. It
                    takes less than 2 minutes.
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
                  className={buttonPrimaryFull}
                >
                  Proceed to Verification
                </button>
              </motion.div>
            )}

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
                    Enter your ID number and upload a photo of your ID document.
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
                    ID Number
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your ID number"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value.replace(/\s/g, ""))}
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
                    className={`${buttonSecondary} flex-1 py-3 font-bold`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleVerify}
                    disabled={!isFormComplete || isSubmitting}
                    className={`${buttonPrimary} flex-1 py-3 font-bold`}
                  >
                    {isSubmitting && (
                      <Loader size={16} className="animate-spin" />
                    )}
                    {isSubmitting ? "Submitting..." : "Verify"}
                  </button>
                </div>
              </motion.div>
            )}

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
        </motion.div>
      )}
    </AnimatePresence>
  );
}
