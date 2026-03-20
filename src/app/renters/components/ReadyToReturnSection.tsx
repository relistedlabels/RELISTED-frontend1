"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Truck, Clock, AlertCircle } from "lucide-react";
import { Paragraph1, Paragraph2 } from "@/common/ui/Text";
import ReadyToReturnModal from "./ReadyToReturnModal";
import { useInitiateReturn } from "@/lib/queries/renters/useInitiateReturn";

interface ReadyToReturnSectionProps {
  orderId?: string;
}

const ReadyToReturnSection: React.FC<ReadyToReturnSectionProps> = ({
  orderId,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const initiateReturnMutation = useInitiateReturn();

  const handleReturnConfirm = async (
    images: File[],
    condition: string,
    notes: string,
  ): Promise<void> => {
    if (!orderId) {
      setErrorMessage("Order ID not found");
      throw new Error("Order ID not found");
    }

    try {
      setErrorMessage(null);
      await initiateReturnMutation.mutateAsync({
        orderId,
        conditionImages: images,
        itemCondition: condition as "good" | "fair" | "poor",
        damageNotes: notes,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to initiate return";
      setErrorMessage(message);
      throw error;
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setErrorMessage(null);
  };

  return (
    <>
      <div className="space-y-4">
        {/* Section Header */}
        <div>
          <Paragraph1 className="font-bold text-gray-900">
            Ready to Return?
          </Paragraph1>
          <Paragraph1 className="text-gray-600 mt-1">
            Return your item when you're finished with the rental
          </Paragraph1>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle
              size={16}
              className="text-red-600 flex-shrink-0 mt-0.5"
            />
            <Paragraph1 className="text-red-700 text-sm">
              {errorMessage}
            </Paragraph1>
          </div>
        )}

        {/* Info Cards */}
        <div className="grid grid-cols-1 gap-3">
          {/* Card 1: Easy Pickup */}
          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
            <div className="flex gap-3 items-start">
              <div className="bg-blue-50 p-2 rounded-lg flex-shrink-0">
                <Truck className="text-blue-600" size={20} />
              </div>
              <div>
                <Paragraph1 className="font-semibold text-gray-900 text-sm">
                  Easy Pickup
                </Paragraph1>
                <Paragraph1 className="text-gray-600 text-xs mt-0.5">
                  Schedule your pickup in seconds
                </Paragraph1>
              </div>
            </div>
          </div>

          {/* Card 2: Return on Time */}
          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
            <div className="flex gap-3 items-start">
              <div className="bg-amber-50 p-2 rounded-lg flex-shrink-0">
                <Clock className="text-amber-600" size={20} />
              </div>
              <div>
                <Paragraph1 className="font-semibold text-gray-900 text-sm">
                  Return on Time
                </Paragraph1>
                <Paragraph1 className="text-gray-600 text-xs mt-0.5">
                  Late returns attract extra rental charges
                </Paragraph1>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <motion.button
          onClick={() => setIsModalOpen(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={initiateReturnMutation.isPending}
          className="w-full px-4 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-900 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Truck size={18} />
          {initiateReturnMutation.isPending
            ? "Processing..."
            : "Start Return Process"}
        </motion.button>
      </div>

      {/* Modal */}
      <ReadyToReturnModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onConfirm={handleReturnConfirm}
        isLoading={initiateReturnMutation.isPending}
      />
    </>
  );
};

export default ReadyToReturnSection;
