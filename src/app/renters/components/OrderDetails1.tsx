// ENDPOINTS: GET /api/renters/orders/:orderId, GET /api/renters/orders/:orderId/progress,
// POST /api/renters/orders/:orderId/return, POST /order/resale/confirm

"use client";

import React, { useEffect, useState, type ComponentProps } from "react";
import { X, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Paragraph1 } from "@/common/ui/Text";
import ProductCuratorDetails from "./ProductCuratorDetails";
import OrderProgressTimeline from "./OrderProgressTimeline";
import OrderStatusDetails from "./OrderStatusDetails";
import ReadyToReturnSection from "./ReadyToReturnSection";
import OrderDetailSummaryBar from "./OrderDetailSummaryBar";
import ResaleDeliveryConfirmBanner from "./ResaleDeliveryConfirmBanner";
import {
  useOrderDetails,
  useOrderProgress,
} from "@/lib/queries/renters/useOrderDetails";
import {
  isListerResaleOrder,
  shouldShowRenterResaleDeliveryConfirm,
} from "@/lib/listers/listerOrderRow";
import { confirmableResaleShipmentsFromOrder } from "@/lib/orders/resaleDeliveryConfirm";
import { useConfirmResaleDelivery } from "@/lib/mutations/renters/useConfirmResaleDelivery";

type RenterOrderProgressPayload = ComponentProps<
  typeof OrderProgressTimeline
>["progress"];

interface OrderDetailsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  orderId?: string;
  orderData?: Record<string, unknown>;
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
  const confirmResaleDelivery = useConfirmResaleDelivery();

  const resaleOnlyOrder = orderData
    ? isListerResaleOrder(orderData)
    : false;

  const displayOrderId =
    (orderData?.orderId as string | undefined) ?? orderId ?? "";
  const showResaleConfirm =
    !!orderData &&
    !!displayOrderId &&
    shouldShowRenterResaleDeliveryConfirm(orderData);
  const confirmablePackages = orderData
    ? confirmableResaleShipmentsFromOrder(orderData)
    : [];

  const handleConfirmResale = (shipmentId: string) => {
    confirmResaleDelivery.mutate(
      { orderId: displayOrderId, shipmentId },
      {
      onSuccess: (res) => {
        toast.success(
          res?.message ??
            (res?.data?.orderCompleted
              ? "Order completed. Thank you for confirming."
              : "Delivery confirmed for this package."),
        );
      },
      onError: (err) => {
        toast.error(
          err instanceof Error
            ? err.message
            : "Could not confirm delivery. Try again.",
        );
      },
      },
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-99 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="fixed top-0 right-0 flex h-screen w-full flex-col overflow-y-auto hide-scrollbar bg-white px-4 shadow-2xl sm:w-114"
            role="dialog"
            aria-modal="true"
            aria-label="Order details"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white pb-4 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-1 text-gray-500 transition hover:text-black xl:hidden"
                aria-label="Close order details"
              >
                <ArrowLeft size={20} />
              </button>
              <Paragraph1 className="font-bold uppercase tracking-widest text-gray-800">
                Order details
              </Paragraph1>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-1 text-gray-500 transition hover:text-black"
                aria-label="Close order details"
              >
                <X className="hidden xl:block" size={20} />
              </button>
            </div>

            <div className="grow space-y-3 pb-24 pt-4">
              {isLoading ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-14 rounded-xl bg-gray-200" />
                  <div className="h-40 rounded-xl bg-gray-200" />
                  <div className="h-48 rounded-xl bg-gray-200" />
                </div>
              ) : !orderData ? (
                <div className="py-8 text-center text-red-500">
                  <Paragraph1>Failed to load order details</Paragraph1>
                </div>
              ) : (
                <>
                  <OrderDetailSummaryBar
                    orderData={
                      orderData as {
                        orderId?: string;
                        status?: string;
                        createdAt?: string;
                      }
                    }
                  />

                  {showResaleConfirm ? (
                    <ResaleDeliveryConfirmBanner
                      packages={confirmablePackages}
                      isPending={confirmResaleDelivery.isPending}
                      onConfirm={handleConfirmResale}
                    />
                  ) : null}

                  <div className="rounded-xl border border-gray-200 bg-white p-3">
                    {progressLoading ? (
                      <Paragraph1 className="mb-2 text-[10px] text-gray-400">
                        Updating progress…
                      </Paragraph1>
                    ) : null}
                    <OrderProgressTimeline
                      orderData={orderData}
                      progress={progressData ?? undefined}
                    />
                  </div>

                  <ProductCuratorDetails orderData={orderData} />

                  <OrderStatusDetails orderData={orderData} />

                  {!resaleOnlyOrder ? (
                    <ReadyToReturnSection orderId={orderId} />
                  ) : null}
                </>
              )}
            </div>

            <div className="sticky bottom-0 border-t border-gray-100 bg-white py-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-800 transition hover:bg-gray-50"
                >
                  Close
                </button>
                <a
                  href="mailto:support@relisted.com"
                  className="flex-1 rounded-lg bg-black px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-gray-900"
                >
                  Contact support
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface OrderDetailsProps {
  orderId?: string;
  autoOpen?: boolean;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ orderId, autoOpen }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: orderData, isLoading } = useOrderDetails(orderId || "");
  const { data: progressData, isLoading: progressLoading } = useOrderProgress(
    orderId || "",
  );

  useEffect(() => {
    if (autoOpen) setIsOpen(true);
  }, [autoOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full rounded-sm bg-black px-4 py-2 text-white transition-colors hover:bg-gray-800 sm:w-fit"
      >
        <Paragraph1>View details</Paragraph1>
      </button>

      <OrderDetailsPanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        orderId={orderId}
        orderData={orderData as Record<string, unknown> | undefined}
        isLoading={isLoading}
        progressData={progressData}
        progressLoading={progressLoading}
      />
    </>
  );
};

export default OrderDetails;
