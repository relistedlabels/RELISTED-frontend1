"use client";
// ENDPOINTS: GET /api/listers/orders/:orderId

import React, { useState } from "react";
import { X, ArrowLeft } from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import { buttonPrimary } from "@/common/ui/buttonClasses";
import {
  slidePanelBackdrop,
  slidePanelFooter,
  slidePanelHeader,
  slidePanelSheet,
  slidePanelTitle,
} from "@/common/ui/dashboardClasses";
import { Paragraph1 } from "@/common/ui/Text";
import OrderSummaryCards from "./OrderSummaryCards";
import OrderProgress from "./OrderProgress";
import OrderSummaryEscrow from "./OrderSummaryEscrow";
import DispatchWindowsDisplay, {
  type DispatchWindow,
} from "./DispatchWindowsDisplay";

interface OrderPreviewPanelProps {
  isOpen: boolean;
  onClose: () => void;
  orderData?: Record<string, unknown>;
  clickedItem?: Record<string, unknown>;
}

function formatNgn(n: unknown): string {
  const v = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(v)) return "0";
  return v.toLocaleString();
}

const OrderPreviewPanel: React.FC<OrderPreviewPanelProps> = ({
  isOpen,
  onClose,
  orderData,
  clickedItem,
}) => {
  const variants = {
    hidden: { x: "100%" },
    visible: { x: 0 },
  };

  const lm = orderData?.listerMerchandise as
    | {
        rentalSubtotal?: number;
        cleaningFeesTotal?: number;
        resaleSubtotal?: number;
        total?: number;
      }
    | undefined;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={slidePanelBackdrop}
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={slidePanelSheet}
            role="dialog"
            aria-modal="true"
            aria-label="Order preview"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={variants}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={slidePanelHeader}>
              <button
                onClick={onClose}
                className="xl:hidden p-1 rounded-full text-gray-500 hover:text-black transition"
                aria-label="Close order preview"
              >
                <ArrowLeft size={20} />
              </button>

              <Paragraph1 className={slidePanelTitle}>Order preview</Paragraph1>
              <button
                onClick={onClose}
                className="p-1 rounded-full text-gray-500 hover:text-black transition"
                aria-label="Close order preview"
              >
                <X className="hidden xl:flex" size={20} />
              </button>
            </div>

            <div className="space-y-4 pt-4 pb-20 grow">
              {orderData && (
                <div className="rounded-2xl border border-gray-200 bg-gray-50/90 px-3 py-3 space-y-1.5">
                  <Paragraph1 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    Order
                  </Paragraph1>
                  <Paragraph1 className="text-sm text-gray-900">
                    <span className="font-semibold">#</span>
                    {String(orderData.orderNumber ?? "")}
                  </Paragraph1>
                  {Boolean(
                    (orderData.dresser as { name?: string } | undefined)?.name,
                  ) && (
                    <Paragraph1 className="text-xs text-gray-600">
                      Renter:{" "}
                      <span className="font-medium text-gray-900">
                        {(orderData.dresser as { name: string }).name}
                      </span>
                    </Paragraph1>
                  )}
                </div>
              )}

              {lm && (
                <div className="rounded-2xl border border-gray-200 p-4 space-y-2">
                  <Paragraph1 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    Your amounts
                  </Paragraph1>
                  <div className="space-y-1.5 text-sm text-gray-800">
                    {Number(lm.rentalSubtotal) > 0 && (
                      <div className="flex justify-between gap-4">
                        <span>Rental subtotal</span>
                        <span className="font-semibold tabular-nums">
                          ₦{formatNgn(lm.rentalSubtotal)}
                        </span>
                      </div>
                    )}
                    {Number(lm.cleaningFeesTotal) > 0 && (
                      <div className="flex justify-between gap-4">
                        <span>Cleaning fees</span>
                        <span className="font-semibold tabular-nums">
                          ₦{formatNgn(lm.cleaningFeesTotal)}
                        </span>
                      </div>
                    )}
                    {Number(lm.resaleSubtotal) > 0 && (
                      <div className="flex justify-between gap-4">
                        <span>Resale</span>
                        <span className="font-semibold tabular-nums">
                          ₦{formatNgn(lm.resaleSubtotal)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between gap-4 pt-1 border-t border-gray-200">
                      <span className="font-semibold">Total</span>
                      <span className="font-bold tabular-nums">
                        ₦{formatNgn(lm.total)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <DispatchWindowsDisplay
                dispatchWindows={
                  orderData?.dispatchWindows as DispatchWindow[] | undefined
                }
                orderData={orderData}
                sectionTitle="Dispatch windows"
              />

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

            <div className={`${slidePanelFooter} flex flex-col gap-4`}>
              {Boolean(orderData?.approvalRequired) &&
                !orderData?.canApprove &&
                !orderData?.canReject && (
                  <div className="bg-amber-50 p-3 border border-amber-200 rounded-lg">
                    <Paragraph1 className="text-amber-700 text-xs">
                      Approval window expired on{" "}
                      {String(orderData?.approvalExpiredAt ?? "N/A")}
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
                  className={`flex-1 ${
                    orderData?.canApprove
                      ? buttonPrimary
                      : "cursor-not-allowed rounded-lg bg-gray-200 px-4 py-3 font-semibold text-gray-400"
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

interface OrderPreviewProps {
  orderData?: Record<string, unknown>;
  clickedItem?: Record<string, unknown>;
}

const OrderPreview: React.FC<OrderPreviewProps> = ({
  orderData,
  clickedItem,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="font-bold text-black hover:text-gray-600 text-sm underline transition-colors"
      >
        <Paragraph1> View Details</Paragraph1>
      </button>
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
