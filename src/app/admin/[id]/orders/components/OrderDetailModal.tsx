// ENDPOINTS: GET /api/admin/orders/:orderId
"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import OrderSection2 from "./OrderSection2";
import OrderSection3 from "./OrderSection3";
import OrderItemsSection from "./OrderItemsSection";
import { useOrderById } from "@/lib/queries/admin/useOrders";
import type { OrderDetail } from "@/lib/api/admin/orders";
import { getAdminOrderStatusLabel } from "@/lib/orders/shipmentAndOrderLabels";

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

export default function OrderDetailModal({
  isOpen,
  onClose,
  orderId,
}: OrderDetailModalProps) {
  const { data, isLoading, isError } = useOrderById(orderId ?? "", isOpen);
  const order = data?.data as OrderDetail | undefined;

  const statusLabel = order
    ? getAdminOrderStatusLabel(order.status)
    : "—";

  return (
    <AnimatePresence>
      {isOpen && orderId && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="z-40 fixed inset-0 bg-black/50"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="top-0 right-0 bottom-0 z-50 fixed bg-white shadow-lg w-full md:w-3/4 overflow-y-auto"
          >
            <div className="top-0 sticky bg-white p-6 border-gray-200 border-b">
              <div className="flex justify-between items-start gap-4">
                <button
                  onClick={onClose}
                  className="shrink-0 -ml-1 p-1 text-gray-400 hover:text-gray-600 transition"
                >
                  <X size={20} />
                </button>

                <div className="flex-1">
                  <Paragraph3 className="mb-1 font-bold text-gray-900 text-lg">
                    Order details
                  </Paragraph3>
                  <Paragraph1 className="text-gray-500 text-xs">
                    {orderId}
                    {order?.date ? ` · ${order.date}` : ""}
                  </Paragraph1>
                </div>

                {!isLoading && order && (
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold shrink-0 ${getStatusColor(
                      statusLabel,
                    )}`}
                  >
                    {statusLabel}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-6 p-6">
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

                  <OrderSection3
                    subtotal={formatMoney(order.payment?.subtotal ?? 0)}
                    serviceFee={formatMoney(order.payment?.serviceFee ?? 0)}
                    deliveryFee={formatMoney(order.payment?.deliveryFee ?? 0)}
                    vat={formatMoney(order.payment?.vat ?? 0)}
                    total={formatMoney(order.payment?.total ?? order.total ?? 0)}
                    paymentStatus={order.payment?.paymentStatus}
                  />

                  {(order.escrows?.length ?? 0) > 0 && (
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
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
        </>
      )}
    </AnimatePresence>
  );
}
