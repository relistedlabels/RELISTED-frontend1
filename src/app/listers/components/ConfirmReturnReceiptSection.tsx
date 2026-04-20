"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Package } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import ConfirmReturnReceiptModal from "./ConfirmReturnReceiptModal";
import { useConfirmReturnReceipt } from "@/lib/queries/listers/useConfirmReturnReceipt";

interface ConfirmReturnReceiptSectionProps {
  orderId?: string;
  onReject?: () => Promise<void>;
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

const ConfirmReturnReceiptSection: React.FC<
  ConfirmReturnReceiptSectionProps
> = ({
  orderId,
  onReject,
  renterInfo,
  itemCondition,
  renterDamageNotes,
  imageUrls,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const confirmReturnMutation = useConfirmReturnReceipt();

  const handleConfirmReceipt = async (
    actualCondition: "GOOD" | "FAIR" | "POOR",
    damageNotes: string,
    images: string[],
  ): Promise<void> => {
    if (!orderId) {
      setErrorMessage("Order ID not found");
      throw new Error("Order ID not found");
    }

    try {
      setErrorMessage(null);
      await confirmReturnMutation.mutateAsync({
        orderId,
        actualCondition,
        damageNotes,
        images,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to confirm receipt";
      setErrorMessage(message);
      throw error;
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setErrorMessage(null);
  };

  return (
    <div className="space-y-3">
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 border border-green-200 rounded-xl">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            <div className="bg-green-100 p-2 rounded-lg">
              <Package size={20} className="text-green-600" />
            </div>
          </div>
          <div className="flex-1 space-y-2">
            <Paragraph1 className="font-bold text-gray-900">
              Return Ready for Confirmation
            </Paragraph1>
            <Paragraph1 className="text-gray-700 text-sm">
              The renter has marked this order as ready to return. Please
              confirm receipt once you have received and inspected the item.
            </Paragraph1>

            {errorMessage && (
              <div className="bg-red-50 px-3 py-2 border border-red-200 rounded text-red-700 text-sm">
                {errorMessage}
              </div>
            )}

            <motion.button
              onClick={() => setIsModalOpen(true)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              disabled={confirmReturnMutation.isPending}
              className="flex justify-center items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 px-4 py-3.5 rounded-xl w-full font-bold text-white text-sm transition-all shadow-sm hover:shadow-md disabled:cursor-not-allowed"
            >
              <Package size={18} />
              {confirmReturnMutation.isPending
                ? "Confirming..."
                : "Confirm Return Receipt"}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <ConfirmReturnReceiptModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onConfirm={handleConfirmReceipt}
        onReject={onReject}
        isLoading={confirmReturnMutation.isPending}
        renterInfo={renterInfo}
        itemCondition={itemCondition}
        renterDamageNotes={renterDamageNotes}
        imageUrls={imageUrls}
      />
    </div>
  );
};

export default ConfirmReturnReceiptSection;
