// ENDPOINTS: GET /api/renters/orders/:orderId, GET /api/renters/orders/:orderId/progress,
// POST /api/renters/orders/:orderId/return, POST /order/resale/confirm

"use client";

import React, { useEffect, useMemo, useState, type ComponentProps } from "react";
import { X, ArrowLeft, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { buttonPrimary, buttonSecondary } from "@/common/ui/buttonClasses";
import {
  slidePanelBackdrop,
  slidePanelFooter,
  slidePanelHeader,
  slidePanelSheet,
  slidePanelTitle,
} from "@/common/ui/dashboardClasses";
import { Paragraph1 } from "@/common/ui/Text";
import ProductCuratorDetails from "./ProductCuratorDetails";
import OrderProgressTimeline from "./OrderProgressTimeline";
import OrderStatusDetails from "./OrderStatusDetails";
import OrderDetailSummaryBar from "./OrderDetailSummaryBar";
import ResaleDeliveryConfirmBanner from "./ResaleDeliveryConfirmBanner";
import RentalDeliveryConfirmBanner from "./RentalDeliveryConfirmBanner";
import StartReturnAction from "./StartReturnAction";
import ReturnDueBanner from "./ReturnDueBanner";
import { shouldPromoteReturnOnDetail } from "@/lib/orders/returnDueUrgency";
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
import { resolveRenterStartReturn } from "@/lib/orders/renterStartReturn";
import { useConfirmResaleDelivery } from "@/lib/mutations/renters/useConfirmResaleDelivery";
import { useConfirmRentalDelivery } from "@/lib/mutations/renters/useConfirmRentalDelivery";
import LeaveReviewModal from "./LeaveReviewModal";
import { isReviewPromptSkipped } from "@/lib/reviews/reviewPromptStorage";

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
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

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

  const returnRequests = (
    progressData as {
      returnRequests?: Array<{ shipmentId: string | null; status: string }>;
    }
  )?.returnRequests ?? [];

  const returnSubmitted = returnRequests.some(
    (rr) => rr.status && String(rr.status).toUpperCase() !== "REJECTED",
  );

  const startReturn = orderData
    ? resolveRenterStartReturn({
        status: String(orderData.status ?? ""),
        items: (orderData.items as Array<{
          days?: number;
          listingType?: string;
        }>) ?? [],
        shipments: (orderData.shipments as Array<{
          id?: string;
          type?: string;
          status?: string;
          listerId?: string | null;
        }>) ?? [],
        returnRequests,
      })
    : { showStartReturn: false, returnShipmentId: null };

  const returnPromotion = shouldPromoteReturnOnDetail({
    status: String(orderData?.status ?? ""),
    showStartReturn: startReturn.showStartReturn,
    returnSubmitted,
    items: (orderData?.items as Array<{
      name?: string;
      imageUrl?: string | null;
      returnDueDate?: string | null;
      rentalEndDate?: string | null;
    }>) ?? [],
  });

  const returnPackageItems =
    ((orderData?.items as Array<{
      name?: string;
      imageUrl?: string | null;
    }>) ?? [])
      .filter((line) => Boolean(line?.name))
      .map((line) => ({
        name: line.name ?? "Item",
        imageUrl: line.imageUrl ?? null,
      }));

  const returnProductLabel =
    returnPackageItems.length === 1
      ? returnPackageItems[0]?.name
      : returnPackageItems.length > 1
        ? `${returnPackageItems.length} items`
        : undefined;

  const showFooterReturn =
    !resaleOnlyOrder &&
    startReturn.showStartReturn &&
    !returnSubmitted &&
    !returnPromotion.promote &&
    !!displayOrderId;

  const reviewProductLabel = useMemo(() => {
    const items =
      (orderData?.items as Array<{ name?: string }> | undefined) ?? [];
    if (items.length === 1) return items[0]?.name?.trim() || null;
    if (items.length > 1) return `${items.length} items`;
    return null;
  }, [orderData]);

  const maybeOpenReviewModal = () => {
    if (!displayOrderId || isReviewPromptSkipped(displayOrderId)) return;
    setReviewModalOpen(true);
  };

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
          maybeOpenReviewModal();
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
          maybeOpenReviewModal();
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
    <>
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
            aria-label="Order details"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={slidePanelHeader}>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-1 text-gray-500 transition hover:text-black xl:hidden"
                aria-label="Close order details"
              >
                <ArrowLeft size={20} />
              </button>
              <Paragraph1 className={slidePanelTitle}>Order details</Paragraph1>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-1 text-gray-500 transition hover:text-black"
                aria-label="Close order details"
              >
                <X className="hidden xl:block" size={20} />
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto hide-scrollbar py-4">
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
                    statusOverrideKey={
                      showRentalConfirm ? "CONFIRM_DELIVERY" : undefined
                    }
                    statusOverrideLabel={
                      showRentalConfirm ? "Confirm delivery" : undefined
                    }
                  />

                  {returnSubmitted ? (
                    <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2.5">
                      <CheckCircle size={16} className="shrink-0 text-green-600" />
                      <Paragraph1 className="text-sm font-medium text-green-900">
                        Return submitted
                      </Paragraph1>
                    </div>
                  ) : returnPromotion.promote ? (
                    <ReturnDueBanner
                      orderId={displayOrderId}
                      shipmentId={startReturn.returnShipmentId}
                      headline={returnPromotion.headline}
                      isDueToday={returnPromotion.isDueToday}
                      isOverdue={returnPromotion.isOverdue}
                      productLabel={returnProductLabel}
                      items={returnPackageItems}
                    />
                  ) : null}

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

                  <div className="rounded-xl border border-gray-200 bg-white p-4">
                    {progressLoading ? (
                      <Paragraph1 className="mb-2 text-[10px] text-gray-400">
                        Updating…
                      </Paragraph1>
                    ) : null}
                    <OrderProgressTimeline
                      orderData={orderData}
                      progress={progressData ?? undefined}
                    />
                  </div>

                  <div className="space-y-2">
                    <ProductCuratorDetails orderData={orderData} />
                    <OrderStatusDetails orderData={orderData} />
                  </div>
                </>
              )}
            </div>

            <div className={slidePanelFooter}>
              <div className="flex gap-2">
                {showFooterReturn ? (
                  <StartReturnAction
                    orderId={displayOrderId}
                    shipmentId={startReturn.returnShipmentId}
                    variant="footer"
                  />
                ) : null}
                <button
                  type="button"
                  onClick={onClose}
                  className={`${buttonSecondary} ${showFooterReturn ? "" : "flex-1"}`}
                >
                  Close
                </button>
                {!showFooterReturn ? (
                  <a
                    href="mailto:support@relisted.com"
                    className={`${buttonPrimary} flex-1`}
                  >
                    Contact support
                  </a>
                ) : null}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    <LeaveReviewModal
      isOpen={reviewModalOpen}
      onClose={() => setReviewModalOpen(false)}
      orderId={displayOrderId}
      itemLabel={reviewProductLabel}
      context="delivery"
    />
    </>
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
        className={`${buttonPrimary} w-full sm:w-auto`}
      >
        View details
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
