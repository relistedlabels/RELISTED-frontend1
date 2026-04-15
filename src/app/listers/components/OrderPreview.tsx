"use client";
// ENDPOINTS: GET /api/listers/orders/:orderId, GET /api/listers/orders/:orderId/items (for preview)

import React, { useState } from "react";
import {
  SlidersVertical,
  X,
  Search,
  ChevronLeft,
  ArrowLeft,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import { Paragraph1, Paragraph2 } from "@/common/ui/Text";
import Button from "@/common/ui/Button";
import WalletTopUpForm from "@/app/shop/cart/checkout/components/WalletTopUpForm";
import { FaPlus } from "react-icons/fa";
import { HiOutlineArrowDownRight } from "react-icons/hi2";
import OrderSummaryCards from "./OrderSummaryCards";
import OrderProgress from "./OrderProgress";
import OrderSummaryEscrow from "./OrderSummaryEscrow";

// --------------------
// Slide-in Filter Panel
// --------------------
interface OrderPreviewPanelProps {
  isOpen: boolean;
  onClose: () => void;
  orderData?: any;
  clickedItem?: any;
}

const OrderPreviewPanel: React.FC<OrderPreviewPanelProps> = ({
  isOpen,
  onClose,
  orderData,
  clickedItem,
}) => {
  const minPrice = 50000;
  const maxPrice = 200000;

  const variants = {
    hidden: { x: "100%" },
    visible: { x: 0 },
  };

  const ExampleData = {
    rentalDays: 3,
    rentalFeePerPeriod: 165000,
    securityDeposit: 15000,
    cleaningFee: 10000,
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="z-99 fixed inset-0 bg-black/70 backdrop--blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="top-0 right-0 fixed flex flex-col bg-white shadow-2xl px-4 w-full sm:w-114 h-screen overflow-y-auto hide-scrollbar"
            role="dialog"
            aria-modal="true"
            aria-label="Product OrderPreview"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={variants}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="top-0 z-10 sticky flex justify-between items-center bg-white pt-6 pb-4 border-gray-100 border-b">
              <button
                onClick={onClose}
                className="xl:hidden p-1 rounded-full text-gray-500 hover:text-black transition"
                aria-label="Close OrderPreview"
              >
                <ArrowLeft size={20} />
              </button>

              <Paragraph1 className="font-bold text-gray-800 uppercase tracking-widest">
                Order Preview
              </Paragraph1>
              <button
                onClick={onClose}
                className="p-1 rounded-full text-gray-500 hover:text-black transition"
                aria-label="Close OrderPreview"
              >
                <X className="hidden xl:flex" size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-4 pt-4 pb-20 grow">
              <OrderSummaryCards
                clickedItem={clickedItem}
                orderData={orderData}
              />
              <OrderProgress orderData={orderData} clickedItem={clickedItem} />

              <OrderSummaryEscrow
                orderData={orderData}
                clickedItem={clickedItem}
              />
            </div>

            {/* Footer */}
            <div className="bottom-0 sticky flex flex-col gap-4 bg-white mt-auto py-2 border-gray-200 border-t text-black">
              {/* Approval Status Message */}
              {orderData?.approvalRequired &&
                !orderData?.canApprove &&
                !orderData?.canReject && (
                  <div className="bg-amber-50 p-3 border border-amber-200 rounded-lg">
                    <Paragraph1 className="text-amber-700 text-xs">
                      ⚠️ Approval window expired on{" "}
                      {orderData?.approvalExpiredAt || "N/A"}
                    </Paragraph1>
                  </div>
                )}

              <div className="hidden flex- justify-between gap-4">
                <button
                  disabled={!orderData?.canReject}
                  className={`flex-1 px-4 py-3 font-semibold border rounded-lg transition ${
                    orderData?.canReject
                      ? "text-red-500 border-red-300 hover:bg-red-50"
                      : "text-gray-300 border-gray-200 cursor-not-allowed bg-gray-50"
                  }`}
                >
                  <Paragraph1>Decline Order</Paragraph1>
                </button>

                <button
                  disabled={!orderData?.canApprove}
                  className={`flex-1 px-4 py-3 justify-center font-semibold border rounded-lg transition ${
                    orderData?.canApprove
                      ? "bg-black/80 text-white hover:bg-gray-900"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <Paragraph1>Approve Order</Paragraph1>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --------------------
// Main Component
// --------------------
interface OrderPreviewProps {
  orderData?: any;
  clickedItem?: any;
}

const OrderPreview: React.FC<OrderPreviewProps> = ({
  orderData,
  clickedItem,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Toggle Button */}

      <button
        onClick={() => setIsOpen(true)}
        className="font-bold text-black hover:text-gray-600 text-sm underline transition-colors"
      >
        <Paragraph1> View Details</Paragraph1>
      </button>
      {/* Filter Panel */}
      <OrderPreviewPanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        orderData={orderData}
        clickedItem={clickedItem}
      />
    </>
  );
};

export default OrderPreview;
