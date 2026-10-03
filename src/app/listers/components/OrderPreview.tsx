"use client";

// ENDPOINTS: GET /api/listers/orders/:orderId

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, X } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  slidePanelBody,
  slidePanelSheetPinned,
} from "@/common/ui/dashboardClasses";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import DispatchWindowsDisplay, {
  type DispatchWindow,
} from "./DispatchWindowsDisplay";
import OrderProgress from "./OrderProgress";
import OrderSummaryCards from "./OrderSummaryCards";
import OrderSummaryEscrow from "./OrderSummaryEscrow";

interface OrderPreviewPanelProps {
  isOpen: boolean;
  onClose: () => void;
  orderData?: Record<string, unknown>;
  clickedItem?: Record<string, unknown>;
}

const OrderPreviewPanel: React.FC<OrderPreviewPanelProps> = ({
  isOpen,
  onClose,
  orderData,
  clickedItem,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  const lm = orderData?.listerMerchandise as
    | {
        rentalSubtotal?: number;
        cleaningFeesTotal?: number;
        resaleSubtotal?: number;
        total?: number;
      }
    | undefined;

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            type="button"
            aria-label="Close item details"
            onClick={onClose}
            className="fixed inset-0 z-[99] bg-black/35"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className={`${slidePanelSheetPinned} z-[100] px-0 sm:w-[32rem]`}
            role="dialog"
            aria-modal="true"
            aria-label={String(clickedItem?.name ?? "Item details")}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={{
              hidden: { x: "100%" },
              visible: { x: 0 },
            }}
            transition={{ type: "tween", duration: 0.22, ease: "easeOut" }}
          >
            <header className="sticky top-0 z-20 flex shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 sm:px-6">
              <button
                type="button"
                onClick={onClose}
                className="-ml-2 rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                aria-label="Close order preview"
              >
                <ArrowLeft size={20} aria-hidden />
              </button>
              <div className="min-w-0 flex-1">
                <Paragraph3 className="truncate text-base font-bold text-gray-900">
                  {String(clickedItem?.name ?? "Item details")}
                </Paragraph3>
                <Paragraph1 className="truncate text-xs text-gray-500">
                  Order #{String(orderData?.orderNumber ?? "")}
                </Paragraph1>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                aria-label="Close item details"
              >
                <X size={18} aria-hidden />
              </button>
            </header>

            <main
              className={`${slidePanelBody} space-y-4 px-4 py-4 sm:space-y-5 sm:px-6 sm:py-6`}
            >
              {Boolean(
                (orderData?.dresser as { name?: string } | undefined)?.name,
              ) && (
                <section className="rounded-2xl border border-gray-200 bg-white p-4">
                  <Paragraph1 className="mb-3 text-sm font-semibold text-gray-900">
                    Order information
                  </Paragraph1>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="min-w-0">
                      <Paragraph1 className="text-xs text-gray-500">
                        Renter
                      </Paragraph1>
                      <Paragraph1 className="mt-0.5 break-words text-sm font-medium text-gray-900">
                        {(orderData?.dresser as { name: string }).name}
                      </Paragraph1>
                    </div>
                    <div className="min-w-0">
                      <Paragraph1 className="text-xs text-gray-500">
                        Order
                      </Paragraph1>
                      <Paragraph1 className="mt-0.5 break-words text-sm font-medium text-gray-900">
                        #{String(orderData?.orderNumber ?? "—")}
                      </Paragraph1>
                    </div>
                  </div>
                </section>
              )}

              <OrderSummaryCards
                clickedItem={clickedItem}
                orderData={orderData}
              />

              {lm && !clickedItem && (
                <section className="rounded-2xl border border-gray-200 bg-white p-4">
                  <h3 className="mb-3 text-sm font-semibold text-gray-900">
                    Your amounts
                  </h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    {Number(lm.rentalSubtotal) > 0 && (
                      <div className="flex justify-between gap-4">
                        <span>Rental subtotal</span>
                        <span className="font-medium tabular-nums">
                          ₦{Number(lm.rentalSubtotal).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {Number(lm.cleaningFeesTotal) > 0 && (
                      <div className="flex justify-between gap-4">
                        <span>Cleaning fees</span>
                        <span className="font-medium tabular-nums">
                          ₦{Number(lm.cleaningFeesTotal).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {Number(lm.resaleSubtotal) > 0 && (
                      <div className="flex justify-between gap-4">
                        <span>Resale</span>
                        <span className="font-medium tabular-nums">
                          ₦{Number(lm.resaleSubtotal).toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between gap-4 border-t border-gray-200 pt-2 font-semibold text-gray-900">
                      <span>Total</span>
                      <span className="tabular-nums">
                        ₦{Number(lm.total ?? 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </section>
              )}

              <OrderProgress orderData={orderData} clickedItem={clickedItem} />

              <DispatchWindowsDisplay
                dispatchWindows={
                  orderData?.dispatchWindows as DispatchWindow[] | undefined
                }
                orderData={orderData}
                sectionTitle="Courier schedule"
              />

              <OrderSummaryEscrow
                orderData={orderData}
                clickedItem={clickedItem}
              />
            </main>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
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
        type="button"
        onClick={() => setIsOpen(true)}
        className="min-h-10 rounded-lg px-3 text-sm font-semibold text-gray-900 underline underline-offset-2 transition hover:bg-gray-100 hover:text-gray-600"
      >
        <Paragraph1>View details</Paragraph1>
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
