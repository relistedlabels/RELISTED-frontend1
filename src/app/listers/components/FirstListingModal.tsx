"use client";

import React from "react";
import type { JSX } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight } from "lucide-react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { buttonPrimary, buttonSecondary } from "@/common/ui/buttonClasses";
import { dialogBackdrop, dialogCard } from "@/common/ui/dashboardClasses";

interface FirstListingModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onGetStarted: () => void;
}

export default function FirstListingModal({
  isOpen,
  onClose,
  onGetStarted,
}: FirstListingModalProps): JSX.Element {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`${dialogBackdrop} z-40`}
            onClick={onClose}
          >
            <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`${dialogCard} max-h-[85vh] overflow-y-auto flex flex-col rounded-2xl p-0`}
            onClick={(e) => e.stopPropagation()}
          >
              {/* Header */}
              <div className="bg-white border-b border-gray-100 p-6 sticky top-0 z-10">
                <div className="flex items-center justify-between mb-4">
                  <img
                    src="/images/logo1.svg"
                    alt="RELISTED"
                    className="h-8 w-8"
                  />
                  {onClose && (
                    <button
                      onClick={onClose}
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X size={20} className="text-gray-600" />
                    </button>
                  )}
                </div>
                <h2 className="text-xl font-bold text-black mb-1">
                  Create Your First Listing
                </h2>
                <Paragraph3 className="text-gray-600 text-sm">
                  Start earning money from your wardrobe
                </Paragraph3>
              </div>

              {/* Content */}
              <div className="flex-1 p-6 space-y-5">
                {/* Steps */}
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">1</span>
                    </div>
                    <div className="pt-0.5">
                      <Paragraph1 className="font-semibold text-sm text-gray-900 mb-0.5">
                        Add Photos
                      </Paragraph1>
                      <Paragraph3 className="text-xs text-gray-600">
                        Upload clear, well-lit photos of your items
                      </Paragraph3>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">2</span>
                    </div>
                    <div className="pt-0.5">
                      <Paragraph1 className="font-semibold text-sm text-gray-900 mb-0.5">
                        Set Your Price
                      </Paragraph1>
                      <Paragraph3 className="text-xs text-gray-600">
                        Choose daily rental rates for your pieces
                      </Paragraph3>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">3</span>
                    </div>
                    <div className="pt-0.5">
                      <Paragraph1 className="font-semibold text-sm text-gray-900 mb-0.5">
                        Go Live
                      </Paragraph1>
                      <Paragraph3 className="text-xs text-gray-600">
                        Your items are visible to all renters
                      </Paragraph3>
                    </div>
                  </div>
                </div>

                {/* Highlight */}
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <Paragraph3 className="text-xs text-gray-700">
                    <span className="font-semibold">💡 Tip:</span> Better photos
                    = more bookings and higher earnings
                  </Paragraph3>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 border-t border-gray-100 px-6 py-4 flex gap-3 sticky bottom-0">
                {onClose && (
                  <button
                    onClick={onClose}
                    className={`${buttonSecondary} flex-1`}
                  >
                    Later
                  </button>
                )}
                <button
                  onClick={onGetStarted}
                  className={`${buttonPrimary} flex-1`}
                >
                  Let's Go
                  <ArrowRight size={16} />
                </button>
              </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
