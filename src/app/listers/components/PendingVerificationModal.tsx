"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Paragraph1, Paragraph2, Paragraph3 } from "@/common/ui/Text";

interface PendingVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PendingVerificationModal({
  isOpen,
  onClose,
}: PendingVerificationModalProps) {
  const router = useRouter();

  const handleCheckVerification = () => {
    // Route to settings page with verification tab query parameter
    router.push("/listers/settings?tab=verifications");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{
              duration: 0.3,
              ease: "easeOut",
              type: "spring",
              bounce: 0.25,
            }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-8 shadow-2xl"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Icon Animation */}
            <motion.div
              animate={{ rotate: [0, -10, 10, -5, 0] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatDelay: 2,
              }}
              className="mb-6 flex justify-center"
            >
              <div className="rounded-full bg-amber-50 p-4">
                <AlertCircle className="h-8 w-8 text-amber-600" />
              </div>
            </motion.div>

            {/* Title */}
            <div className="mb-4 text-center">
              <Paragraph1 className="text-xl font-bold text-gray-900 mb-2">
                Account Verification Required
              </Paragraph1>
            </div>

            {/* Message */}
            <div className="mb-6 text-center">
              <Paragraph3 className="text-gray-600 leading-relaxed">
                Your account is pending verification. To continue with listing
                items, please verify your identity by providing your BVN and NIN
                information.
              </Paragraph3>
            </div>

            {/* Info Box */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="mb-6 rounded-lg bg-blue-50 p-4 border border-blue-200"
            >
              <p className="text-sm text-blue-900">
                <span className="font-semibold">Why verify?</span> This helps us
                ensure a safe and trustworthy community for all renters and
                listers.
              </p>
            </motion.div>

            {/* Action Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCheckVerification}
              className="w-full rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 px-6 py-3 text-white font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
            >
              <span>Verify Account</span>
              <motion.div
                animate={{ x: [0, 4, 0] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                }}
              >
                <ArrowRight className="h-5 w-5" />
              </motion.div>
            </motion.button>

            {/* Cancel Button */}
            <button
              onClick={onClose}
              className="mt-3 w-full rounded-xl border border-gray-300 px-6 py-3 text-gray-700 font-semibold hover:bg-gray-50 transition-all"
            >
              Maybe Later
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
