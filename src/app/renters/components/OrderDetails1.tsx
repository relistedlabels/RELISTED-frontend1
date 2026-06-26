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
import type { ShipmentProgressGroup } from "./OrderProgressTimeline";
import { itemsForProgressGroup } from "@/lib/orders/returnPackageItems";
import OrderDetailSummaryBar from "./OrderDetailSummaryBar";
import ResaleDeliveryConfirmBanner from "./ResaleDeliveryConfirmBanner";
import RentalDeliveryConfirmBanner from "./RentalDeliveryConfirmBanner";
import {
  useOrderDetails,
  useOrderProgress,
} from "@/lib/queries/renters/useOrderDetails";
import {
  isListerResaleOrder,
  shouldShowRenterResaleDeliveryConfirm,
} from "@/lib/listers/listerOrderRow";
import { confirmableResaleShipmentsFromOrder } from "@/lib/orders/resaleDeliveryConfirm";
import {
  canRaiseRentalDeliveryDisputeFromOrder,
  confirmableRentalShipmentsFromOrder,
  firstRentalItemIdFromOrder,
  rentalInspectionLabelFromOrder,
  shouldShowRenterRentalDeliveryConfirm,
} from "@/lib/orders/rentalDeliveryConfirm";
import { useConfirmResaleDelivery } from "@/lib/mutations/renters/useConfirmResaleDelivery";
import { useConfirmRentalDelivery } from "@/lib/mutations/renters/useConfirmRentalDelivery";

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
  const confirmRentalDelivery = useConfirmRentalDelivery();

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
  const showRentalConfirm =
    !!orderData &&
    !!displayOrderId &&
    shouldShowRenterRentalDeliveryConfirm(orderData);
  const confirmableRentalPackages = orderData
    ? confirmableRentalShipmentsFromOrder(orderData)
    : [];
  const rentalInspectionLabel = orderData
    ? rentalInspectionLabelFromOrder(orderData)
    : "1 hour";
  const canReportRentalIssue = orderData
    ? canRaiseRentalDeliveryDisputeFromOrder(orderData)
    : false;
  const rentalItemId = orderData ? firstRentalItemIdFromOrder(orderData) : null;

  const rentalReturnGroups = (
    (progressData?.shipmentGroups as ShipmentProgressGroup[] | undefined) ?? []
  ).filter((g) => g.kind === "rental" && g.return?.shipmentId);
  const orderItems = (orderData?.items as Array<{
    name?: string;
    imageUrl?: string | null;
  }>) ?? [];
  const returnLegByShipment = new Map(
    (
      (orderData?.returnLegDetails as Array<{
        shipmentId: string;
        items?: Array<{ name: string; imageUrl?: string | null }>;
      }>) ?? []
    ).map((leg) => [leg.shipmentId, leg.items ?? []]),
  );
  const returnRequestByShipment = new Map(
    (
      (progressData as { returnRequests?: Array<{ shipmentId: string | null; status: string }> })
        ?.returnRequests ?? []
    )
      .filter((rr) => rr.shipmentId)
      .map((rr) => [rr.shipmentId as string, rr.status]),
  );

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

  const handleConfirmRental = (shipmentId: string) => {
    confirmRentalDelivery.mutate(
      { orderId: displayOrderId, shipmentId },
      {
        onSuccess: (res) => {
          toast.success(
            res?.message ??
              (res?.data?.rentalActivated
                ? "Rental confirmed. Enjoy your rental!"
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

                  {showRentalConfirm ? (
                    <RentalDeliveryConfirmBanner
                      packages={confirmableRentalPackages}
                      inspectionLabel={rentalInspectionLabel}
                      orderId={displayOrderId}
                      orderDisplayId={displayOrderId}
                      itemId={rentalItemId}
                      canReportIssue={canReportRentalIssue}
                      isPending={confirmRentalDelivery.isPending}
                      onConfirm={handleConfirmRental}
                    />
                  ) : null}

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
                    rentalReturnGroups.length > 1 ? (
                      <div className="space-y-4">
                        {rentalReturnGroups.map((group) => (
                          <ReadyToReturnSection
                            key={group.return!.shipmentId}
                            orderId={orderId}
                            shipmentId={group.return!.shipmentId}
                            listerLabel={group.listerName}
                            items={
                              returnLegByShipment.get(
                                group.return!.shipmentId,
                              ) ??
                              itemsForProgressGroup(group, orderItems)
                            }
                            existingRequestStatus={
                              returnRequestByShipment.get(
                                group.return!.shipmentId,
                              ) ?? null
                            }
                          />
                        ))}
                      </div>
                    ) : (
                      <ReadyToReturnSection
                        orderId={orderId}
                        shipmentId={
                          rentalReturnGroups[0]?.return?.shipmentId ??
                          undefined
                        }
                        listerLabel={rentalReturnGroups[0]?.listerName}
                        items={
                          rentalReturnGroups[0]?.return?.shipmentId
                            ? (returnLegByShipment.get(
                                rentalReturnGroups[0].return!.shipmentId,
                              ) ??
                              itemsForProgressGroup(
                                rentalReturnGroups[0],
                                orderItems,
                              ))
                            : itemsForProgressGroup(
                                rentalReturnGroups[0] ?? {
                                  itemNames: [],
                                },
                                orderItems,
                              )
                        }
                        existingRequestStatus={
                          rentalReturnGroups[0]?.return?.shipmentId
                            ? (returnRequestByShipment.get(
                                rentalReturnGroups[0].return!.shipmentId,
                              ) ?? null)
                            : null
                        }
                      />
                    )
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
