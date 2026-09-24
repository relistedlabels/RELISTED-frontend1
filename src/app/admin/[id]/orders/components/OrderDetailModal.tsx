// ENDPOINTS: GET /api/admin/orders/:orderId
"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { toast } from "sonner";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { slidePanelBackdrop } from "@/common/ui/dashboardClasses";
import OrderSection2 from "./OrderSection2";
import OrderSection3 from "./OrderSection3";
import OrderItemsSection from "./OrderItemsSection";
import CancelOrderModal from "./CancelOrderModal";
import { useOrderById } from "@/lib/queries/admin/useOrders";
import { useCancelOrder } from "@/lib/mutations/admin";
import type { OrderDetail } from "@/lib/api/admin/orders";
import { getAdminOrderStatusLabel } from "@/lib/orders/shipmentAndOrderLabels";
import ReturnRequestSection from "../../../components/ReturnRequestSection";

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string | null;
}

const formatMoney = (amount: number): string =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);

const getStatusColor = (statusLabel: string) => {
  switch (statusLabel) {
    case "Processing":
    case "Accepted":
    case "Confirmed":
    case "Preparing":
      return "bg-gray-100 text-gray-700";
    case "In transit":
      return "bg-blue-100 text-blue-700";
    case "Delivered":
    case "Active (rental)":
      return "bg-green-100 text-green-700";
    case "Return due":
    case "Return pickup":
      return "bg-yellow-100 text-yellow-700";
    case "Returned":
      return "bg-indigo-100 text-indigo-800";
    case "Completed":
      return "bg-emerald-100 text-emerald-800";
    case "Cancelled":
    case "Rejected":
    case "In dispute":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const CANCELLABLE_STATUSES = new Set(["CONFIRMED", "PROCESSING", "ACCEPTED"]);

export default function OrderDetailModal({
  isOpen,
  onClose,
  orderId,
}: OrderDetailModalProps) {
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { data, isLoading, isError } = useOrderById(orderId ?? "", isOpen);

  useEffect(() => {
    setMounted(true);
  }, []);
  const cancelOrder = useCancelOrder();
  const order = data?.data as OrderDetail | undefined;

  const statusLabel = order
    ? getAdminOrderStatusLabel(order.status)
    : "—";
  const canCancel =
    !!order && CANCELLABLE_STATUSES.has(String(order.status).toUpperCase());

  const handleCancelOrder = async (reason: string) => {
    if (!orderId) return;
    try {
      const response = await cancelOrder.mutateAsync({
        orderId,
        reason,
        notifyParties: true,
      });
      toast.success(
        response?.message ?? "Order cancelled. Refund sent to renter wallet.",
      );
      setCancelModalOpen(false);
      onClose();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not cancel this order.";
      toast.error(message);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && orderId && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className={slidePanelBackdrop}
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-[100] flex h-[100dvh] w-full max-w-full flex-col overflow-y-auto bg-white shadow-2xl hide-scrollbar md:inset-y-0 md:left-auto md:w-[min(100%,48rem)] lg:w-3/4"
          >
            <div className="top-0 sticky bg-white border-gray-200 border-b p-4 sm:p-6">
              <div className="flex items-start gap-3">
                <button
                  onClick={onClose}
                  className="shrink-0 -ml-1 p-1 text-gray-400 hover:text-gray-600 transition"
                  aria-label="Close order details"
                >
                  <X size={20} />
                </button>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <Paragraph3 className="mb-1 font-bold text-gray-900 text-lg">
                        Order details
                      </Paragraph3>
                      <Paragraph1 className="break-all text-gray-500 text-xs">
                        {orderId}
                        {order?.date ? ` · ${order.date}` : ""}
                      </Paragraph1>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {!isLoading && order && (
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(
                            statusLabel,
                          )}`}
                        >
                          {statusLabel}
                        </span>
                      )}
                      {canCancel && (
                        <button
                          type="button"
                          onClick={() => setCancelModalOpen(true)}
                          className="rounded-lg bg-red-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-red-700"
                        >
                          Cancel order
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 px-4 py-4 sm:space-y-6 sm:px-6 sm:py-6">
              {isLoading && (
                <Paragraph1 className="text-gray-500 text-sm">
                  Loading order details…
                </Paragraph1>
              )}

              {isError && (
                <Paragraph1 className="text-red-600 text-sm">
                  Could not load order details. Check the API and try again.
                </Paragraph1>
              )}

              {order && !isLoading && (
                <>
                  <OrderSection2
                    listingType={order.listingType}
                    returnDue={order.returnDue ?? "N/A"}
                    paymentReference={order.paymentReference ?? "N/A"}
                    paymentStatus={order.payment?.paymentStatus}
                    trackingNumber={order.trackingNumber}
                    rentalPeriod={order.shipping?.rentalPeriod}
                    lister={{
                      name: order.lister?.name ?? "N/A",
                      email: order.lister?.email,
                      phone: order.lister?.phone,
                      avatar: order.lister?.avatar,
                    }}
                    additionalListers={(order.listers ?? [])
                      .filter((l) => l && l.id !== order.lister?.id)
                      .map((l) => ({
                        name: l!.name,
                        email: l!.email,
                        phone: l!.phone,
                        avatar: l!.avatar,
                      }))}
                    renter={{
                      name: order.renter?.name ?? "N/A",
                      email: order.renter?.email,
                      phone: order.renter?.phone,
                      avatar: order.renter?.avatar,
                    }}
                  />

                  <OrderItemsSection
                    items={order.items_details ?? []}
                    formatMoney={formatMoney}
                  />

                  <ReturnRequestSection returnRequest={order.returnRequest} />

                  <OrderSection3
                    subtotal={formatMoney(order.payment?.subtotal ?? 0)}
                    serviceFee={formatMoney(order.payment?.serviceFee ?? 0)}
                    deliveryFee={formatMoney(order.payment?.deliveryFee ?? 0)}
                    vat={formatMoney(order.payment?.vat ?? 0)}
                    total={formatMoney(order.payment?.total ?? order.total ?? 0)}
                    paymentStatus={order.payment?.paymentStatus}
                  />

                  {(order.escrows?.length ?? 0) > 0 && (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 sm:p-6">
                      <Paragraph3 className="text-base font-bold text-gray-900 mb-4">
                        Escrow
                      </Paragraph3>
                      <div className="space-y-3">
                        {order.escrows!.map((e) => (
                          <div
                            key={e.id}
                            className="flex justify-between items-center text-sm"
                          >
                            <Paragraph1 className="text-gray-600">
                              {e.status.replace(/_/g, " ")}
                            </Paragraph1>
                            <Paragraph1 className="font-medium text-gray-900">
                              {formatMoney(e.lockedAmount)} locked
                            </Paragraph1>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
          <CancelOrderModal
            isOpen={cancelModalOpen}
            onClose={() => setCancelModalOpen(false)}
            orderId={orderId}
            onConfirm={handleCancelOrder}
            isLoading={cancelOrder.isPending}
          />
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
