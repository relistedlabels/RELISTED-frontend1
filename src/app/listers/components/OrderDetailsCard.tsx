"use client";
// ENDPOINTS: GET /api/listers/orders/:orderId, POST …/approve, POST …/reject, return actions, etc.
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { approveOrder } from "@/lib/api/listers";
import { rejectOrder } from "@/lib/api/listers";
import { rejectReturn } from "@/lib/api/listers";

import React, { useState, useEffect } from "react";
import { useOrderDetails } from "@/lib/queries/listers/useOrderDetails";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import BackHeader from "@/common/ui/BackHeader";
import { div } from "framer-motion/client";
import OrderItemList from "./OrderItemList";
import ConfirmReturnReceiptSection from "./ConfirmReturnReceiptSection";
import {
  getListerOrderStatusLabel,
  isListerAvailabilityPending,
  normalizeListerOrderStatusKey,
} from "@/lib/listers/listerOrderStatus";

interface OrderDetailsCardProps {
  orderId: string;
}

const OrderDetailsCard: React.FC<OrderDetailsCardProps> = ({
  orderId: initialOrderId,
}) => {
  const queryClient = useQueryClient();

  // Approve mutation state
  const [showApproveMessage, setShowApproveMessage] = useState(false);
  const approveMutation = useMutation({
    mutationFn: () => approveOrder(orderId),
    onSuccess: () => {
      setShowApproveMessage(true);
      queryClient.invalidateQueries({ queryKey: ["listers", "orders"] });
    },
    onError: () => {
      setShowApproveMessage(false);
    },
  });

  // Reject mutation state
  const [showRejectMessage, setShowRejectMessage] = useState(false);
  const rejectMutation = useMutation({
    mutationFn: () => rejectOrder(orderId, "Item no longer available", "full"),
    onSuccess: () => {
      setShowRejectMessage(true);
      queryClient.invalidateQueries({ queryKey: ["listers", "orders"] });
    },
    onError: () => {
      setShowRejectMessage(false);
    },
  });

  // Return rejection mutation state
  const [showRejectReturnMessage, setShowRejectReturnMessage] = useState(false);
  const rejectReturnMutation = useMutation({
    mutationFn: () => rejectReturn(orderId),
    onSuccess: () => {
      setShowRejectReturnMessage(true);
    },
    onError: () => {
      setShowRejectReturnMessage(false);
    },
  });
  // Use local state for orderId
  const [orderId, setOrderId] = useState(initialOrderId);

  useEffect(() => {
    if (!orderId) {
      let fallbackOrderId = undefined;
      if (typeof window !== "undefined") {
        const pathname = window.location.pathname;
        const segments = pathname.split("/");
        const ordersIndex = segments.indexOf("orders");
        if (ordersIndex !== -1 && segments.length > ordersIndex + 1) {
          fallbackOrderId = segments[ordersIndex + 1];
        }
      }
      if (fallbackOrderId) {
        setOrderId(fallbackOrderId);
      }
    }
  }, [orderId]);

  const { data, isLoading, error } = useOrderDetails(orderId) as {
    data?: { data?: any };
    isLoading: boolean;
    error?: any;
  };

  const order = data?.data?.order;

  // State for the timer
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [isApprovalExpired, setIsApprovalExpired] = useState(false);

  useEffect(() => {
    if (order) {
      const remaining = order.timeRemainingSeconds ?? 0;
      setSecondsRemaining(remaining);
      setIsApprovalExpired(remaining <= 0);
    }
  }, [order]);

  const status = getListerOrderStatusLabel(order);
  const orderNumber = order?.orderNumber || orderId;
  const dateOrdered = order
    ? new Date(order.createdAt).toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "-";

  const itemCount = order?.itemCount ?? 0;
  const itemsDelivered = 0;
  const totalItems = itemCount;
  const totalAmount = order ? `₦${order.totalAmount?.toLocaleString()}` : "-";

  const isPendingApproval = isListerAvailabilityPending(order);
  const isPendingReturn =
    normalizeListerOrderStatusKey(String(order?.status ?? "")) === "RETURN_DUE";

  // Countdown timer effect
  useEffect(() => {
    if (!isPendingApproval || isApprovalExpired || secondsRemaining <= 0)
      return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          setIsApprovalExpired(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPendingApproval, isApprovalExpired, secondsRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const isLowTime = secondsRemaining > 0 && secondsRemaining < 300;
  const timerColor = isApprovalExpired
    ? "text-red-600"
    : isLowTime
      ? "text-orange-500"
      : "text-black";
  const timerBg = isApprovalExpired
    ? "bg-red-50"
    : isLowTime
      ? "bg-orange-50"
      : "bg-white";

  // Loading State
  if (isLoading) {
    return (
      <div className="flex justify-center items-center w-full h-32">
        Loading order details...
      </div>
    );
  }

  // Error/Empty State
  if (!order && !isLoading) {
    return (
      <div className="bg-white p-4 border border-red-300 rounded-2xl w-full">
        <Paragraph1 className="font-bold text-red-700">
          No order data found for ID: {orderId}
        </Paragraph1>
        <pre className="bg-gray-100 mt-2 p-2 max-h-40 overflow-auto text-[10px]">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <BackHeader
          title={`Order ${orderNumber}`}
          subtitle="View order information"
        />
      </div>
      <div className="bg-white p-4 border border-gray-300 rounded-2xl w-full">
        <div className="flex justify-between items-start mb-6">
          <Paragraph3 className="font-bold text-black text-xl uppercase tracking-tight">
            ORDER {orderNumber}
          </Paragraph3>
          <div className="flex flex-col items-end space-y-1">
            <Paragraph1 className="hidden sm:flex font-bold text-[10px] text-gray-400 uppercase tracking-widest">
              Order Status
            </Paragraph1>
            <Paragraph1 className="px-4 py-1.5 rounded-lg font-bold text-xs whitespace-nowrap">
              {status}
            </Paragraph1>
          </div>
        </div>

        {isPendingApproval && (
          <div
            className={`mb-6 p-4 rounded-lg ${timerBg} border ${isApprovalExpired ? "border-red-300" : isLowTime ? "border-orange-300" : "border-gray-200"}`}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Paragraph1 className="font-bold text-gray-500 text-xs uppercase tracking-widest">
                  {isApprovalExpired
                    ? "Order Approval Expired"
                    : "Time Remaining to Approve"}
                </Paragraph1>
              </div>
              <div>
                <Paragraph3
                  className={`text-2xl font-bold font-mono ${timerColor}`}
                >
                  {isApprovalExpired ? "Expired" : formatTime(secondsRemaining)}
                </Paragraph3>
                <Paragraph1 className="mt-1 text-[10px] text-gray-500 text-right">
                  {isApprovalExpired
                    ? "This order will be auto-cancelled"
                    : "Approve or reject order"}
                </Paragraph1>
              </div>
            </div>
          </div>
        )}

        <div className="bg-gray-300 mb-8 w-full h-px" />

        <div className="gap-8 grid grid-cols-2 md:grid-cols-4">
          <div>
            <Paragraph1 className="mb-1 font-bold text-[10px] text-gray-400 uppercase">
              Date Ordered
            </Paragraph1>
            <Paragraph1 className="font-bold text-black text-sm">
              {dateOrdered}
            </Paragraph1>
          </div>
          <div>
            <Paragraph1 className="mb-1 font-bold text-[10px] text-gray-400 uppercase">
              Number of Items
            </Paragraph1>
            <Paragraph1 className="font-bold text-black text-sm">
              {itemCount} Items
            </Paragraph1>
          </div>
          <div>
            <Paragraph1 className="mb-1 font-bold text-[10px] text-gray-400 uppercase">
              Items Delivered
            </Paragraph1>
            <Paragraph1 className="font-bold text-black text-sm">
              {itemsDelivered} / {totalItems} Delivered
            </Paragraph1>
          </div>
          <div className="sm:items-end">
            <Paragraph1 className="mb-1 font-bold text-[10px] text-gray-400 uppercase">
              Total Amount
            </Paragraph1>
            <Paragraph1 className="font-bold text-black text-sm">
              {totalAmount}
            </Paragraph1>
          </div>
        </div>

        {isPendingApproval &&
          !isApprovalExpired &&
          !showApproveMessage &&
          !showRejectMessage && (
            <div className="flex gap-3 mt-8 pt-8 border-gray-300 border-t">
              <button
                className="flex-1 bg-gray-100 hover:bg-gray-200 px-6 py-3 rounded-lg font-bold text-black text-sm"
                onClick={() => rejectMutation.mutate()}
                disabled={rejectMutation.isPending}
              >
                {rejectMutation.isPending ? "Rejecting..." : "Reject Order"}
              </button>
              <button
                className="flex-1 bg-black hover:bg-gray-900 px-6 py-3 rounded-lg font-bold text-white text-sm"
                onClick={() => approveMutation.mutate()}
                disabled={approveMutation.isPending}
              >
                {approveMutation.isPending ? "Approving..." : "Approve Order"}
              </button>
            </div>
          )}

        {showRejectMessage && (
          <div className="flex flex-col justify-center items-center mt-8 pt-8 border-gray-300 border-t">
            <Paragraph1 className="mb-2 font-bold text-red-700 text-lg">
              Order rejected.
            </Paragraph1>
            <Paragraph1 className="text-gray-500 text-sm">
              The order has been cancelled and the customer notified. No payment
              will be charged for this order.
            </Paragraph1>
          </div>
        )}

        {showApproveMessage && (
          <div className="flex flex-col justify-center items-center mt-8 pt-8 border-gray-300 border-t">
            <Paragraph1 className="mb-2 font-bold text-green-700 text-lg">
              Waiting for renter to make payment...
            </Paragraph1>
            <Paragraph1 className="text-gray-500 text-sm">
              The order has been approved. The customer will be notified and
              prompted to complete payment. You will be updated when payment is
              received and dispatch can begin.
            </Paragraph1>
          </div>
        )}

        {isApprovalExpired && isPendingApproval && (
          <div className="bg-red-50 mt-8 p-4 pt-8 border-red-200 border-t rounded-lg">
            <Paragraph1 className="font-bold text-red-700 text-xs">
              This order&apos;s approval deadline has expired and will be
              automatically cancelled.
            </Paragraph1>
          </div>
        )}

        {showRejectReturnMessage && (
          <div className="flex flex-col justify-center items-center mt-8 pt-8 border-gray-300 border-t">
            <Paragraph1 className="mb-2 font-bold text-red-700 text-lg">
              Return rejected.
            </Paragraph1>
            <Paragraph1 className="text-gray-500 text-sm">
              The returned item has been rejected. The customer has been
              notified.
            </Paragraph1>
          </div>
        )}
      </div>

      <div>
        <OrderItemList
          orderId={orderId}
          items={order?.items ?? []}
          orderData={order}
        />
      </div>

      {/* Confirm Return Receipt Section */}
      {isPendingReturn && (
        <div className="mt-6">
          <ConfirmReturnReceiptSection
            orderId={orderId}
            onReject={async () => {
              await rejectReturnMutation.mutateAsync();
            }}
            renterInfo={{
              name: order?.renterName || "",
              phone: order?.renterPhone,
              email: order?.renterEmail,
              address: order?.renterAddress,
            }}
            itemCondition={order?.returnRequest?.itemCondition}
            renterDamageNotes={order?.returnRequest?.damageNotes}
            imageUrls={order?.returnRequest?.imageUrls}
          />
        </div>
      )}
    </div>
  );
};

export default OrderDetailsCard;
