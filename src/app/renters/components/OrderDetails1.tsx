// ENDPOINTS: GET /api/renters/orders/:orderId, GET /api/renters/orders/:orderId/progress, POST /api/renters/orders/:orderId/return

"use client";

import React, { useState, type ComponentProps } from "react";
import { X, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Paragraph1 } from "@/common/ui/Text";
import ProductCuratorDetails from "./ProductCuratorDetails";
import OrderProgressTimeline from "./OrderProgressTimeline";
import OrderStatusDetails from "./OrderStatusDetails";
import ReadyToReturnSection from "./ReadyToReturnSection";
import {
  useOrderDetails,
  useOrderProgress,
} from "@/lib/queries/renters/useOrderDetails";
import DispatchWindowsDisplay, {
  type DispatchWindow,
} from "@/app/listers/components/DispatchWindowsDisplay";
import { isListerResaleOrder } from "@/lib/listers/listerOrderRow";

type RenterOrderProgressPayload = ComponentProps<
  typeof OrderProgressTimeline
>["progress"];

interface OrderDetailsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  orderId?: string;
  orderData?: any;
  isLoading?: boolean;
  progressData?: RenterOrderProgressPayload;
  progressLoading?: boolean;
}

const OrderDetailsPanel: React.FC<OrderDetailsPanelProps> = ({
  isOpen,
  onClose,
  orderId,
  orderData,
  isLoading,
  progressData,
  progressLoading,
}) => {
  const variants = {
    hidden: { x: "100%" },
    visible: { x: 0 },
  };

  const resaleOnlyOrder = orderData
    ? isListerResaleOrder(orderData as Record<string, unknown>)
    : false;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-99 bg-black/70 backdrop--blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="fixed top-0 right-0 h-screen hide-scrollbar overflow-y-auto bg-white shadow-2xl px-4  flex flex-col w-full sm:w-114"
            role="dialog"
            aria-modal="true"
            aria-label="Product OrderDetails"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={variants}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between sticky top-0 items-center pb-4 border-b border-gray-100 pt-6 z-10  bg-white">
              <button
                onClick={onClose}
                className="text-gray-500 xl:hidden hover:text-black p-1 rounded-full transition"
                aria-label="Close OrderDetails"
              >
                <ArrowLeft size={20} />
              </button>

              <Paragraph1 className=" font-bold uppercase tracking-widest text-gray-800">
                Order details{" "}
              </Paragraph1>
              <button
                onClick={onClose}
                className="text-gray-500  hover:text-black p-1 rounded-full transition"
                aria-label="Close OrderDetails"
              >
                <X className=" hidden xl:flex" size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="grow pt-4 pb-20 space-y-4">
              {isLoading ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-xl"></div>
                  <div className="h-32 bg-gray-200 rounded-xl"></div>
                  <div className="h-40 bg-gray-200 rounded-xl"></div>
                </div>
              ) : !orderData ? (
                <div className="text-center py-8 text-red-500">
                  <Paragraph1>Failed to load order details</Paragraph1>
                </div>
              ) : (
                <>
                  <ProductCuratorDetails orderData={orderData} />

                  <DispatchWindowsDisplay
                    dispatchWindows={
                      orderData?.dispatchWindows as
                        | DispatchWindow[]
                        | undefined
                    }
                    orderData={orderData}
                    sectionTitle="Dispatch windows"
                  />

                  <OrderProgressTimeline
                    orderData={orderData}
                    progress={progressData ?? undefined}
                  />
                  {progressLoading ? (
                    <Paragraph1 className="text-xs text-gray-400">
                      Refreshing progress…
                    </Paragraph1>
                  ) : null}
                  <OrderStatusDetails orderData={orderData} />
                  {!resaleOnlyOrder ? (
                    <ReadyToReturnSection orderId={orderId} />
                  ) : null}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="mt-auto py-2 bg-white flex justify-between gap-4 sticky bottom-0">
              <button
                onClick={onClose}
                className="flex-1  px-4 py-3 text-sm font-semibold border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                <Paragraph1>Cancel </Paragraph1>
              </button>

              <button className="flex-1  px-4 py-3 text-sm font-semibold border bg-black text-white rounded-lg hover:bg-gray-900 transition">
                <Paragraph1>Contact Support </Paragraph1>
              </button>
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
interface OrderDetailsProps {
  orderId?: string;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ orderId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: orderData, isLoading } = useOrderDetails(orderId || "");
  const { data: progressData, isLoading: progressLoading } = useOrderProgress(
    orderId || "",
  );

  return (
    <>
      {/* Right Side: Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="bg-black w-full sm:w-fit text-white  py-2 px-4 rounded-sm hover:bg-gray-800 transition-colors"
      >
        <Paragraph1>View Details</Paragraph1>
      </button>

      {/* Filter Panel */}
      <OrderDetailsPanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        orderId={orderId}
        orderData={orderData}
        isLoading={isLoading}
        progressData={progressData}
        progressLoading={progressLoading}
      />
    </>
  );
};

export default OrderDetails;
