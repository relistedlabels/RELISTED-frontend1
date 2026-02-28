"use client";

import { useMutation } from "@tanstack/react-query";
import { approveOrder } from "@/lib/api/listers";
import { rejectOrder } from "@/lib/api/listers";

import React, { useState, useEffect } from "react";
import { useOrderDetails } from "@/lib/queries/listers/useOrderDetails";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import BackHeader from "@/common/ui/BackHeader";
import { div } from "framer-motion/client";
import OrderItemList from "./OrderItemList";

interface OrderDetailsCardProps {
  orderId: string;
}

const OrderDetailsCard: React.FC<OrderDetailsCardProps> = ({
  orderId: initialOrderId,
}) => {
  // Approve mutation state
  const [showApproveMessage, setShowApproveMessage] = useState(false);
  const approveMutation = useMutation({
    mutationFn: () => approveOrder(orderId),
    onSuccess: () => {
      setShowApproveMessage(true);
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
    },
    onError: () => {
      setShowRejectMessage(false);
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

  // FIX: Access the correct path based on your JSON (data.data.order is OrderDetails)
  const order = data?.data?.order;

  // State for the timer
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [isApprovalExpired, setIsApprovalExpired] = useState(false);

  // FIX 2: Sync state when data is loaded
  useEffect(() => {
    if (order) {
      const remaining = order.timeRemainingSeconds ?? 0;
      setSecondsRemaining(remaining);
      setIsApprovalExpired(remaining <= 0);
    }
  }, [order]);

  // Fallbacks and Mappings
  const status = order?.status || "Pending Approval";
  const orderNumber = order?.orderNumber || orderId;
  const dateOrdered = order
    ? new Date(order.createdAt).toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "-";

  // FIX 3: Map items count from the correct JSON fields (order.timeline)
  const itemCount = order?.itemCount ?? 0;
  // timeline is not present, fallback to itemCount
  const itemsDelivered = 0;
  const totalItems = itemCount;
  const totalAmount = order ? `₦${order.totalAmount?.toLocaleString()}` : "-";

  const isPendingApproval = order?.status === "pending_approval";

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

  const isLowTime = secondsRemaining < 300;
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
      <div className="w-full h-32 flex items-center justify-center">
        Loading order details...
      </div>
    );
  }

  // Error/Empty State
  if (!order && !isLoading) {
    return (
      <div className="w-full bg-white border border-red-300 rounded-2xl p-4">
        <Paragraph1 className="text-red-700 font-bold">
          No order data found for ID: {orderId}
        </Paragraph1>
        <pre className="text-[10px] bg-gray-100 p-2 mt-2 overflow-auto max-h-40">
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
          subtitle="View rental information"
        />
      </div>
      <div className="w-full bg-white border border-gray-300 rounded-2xl p-4">
        <div className="flex justify-between items-start mb-6">
          <Paragraph3 className="text-xl font-bold text-black uppercase tracking-tight">
            ORDER {orderNumber}
          </Paragraph3>
          <div className="flex flex-col items-end space-y-1">
            <Paragraph1 className="hidden sm:flex text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Order Status
            </Paragraph1>
            <Paragraph1 className="px-4 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap">
              {status}
            </Paragraph1>
          </div>
        </div>

        {isPendingApproval && (
          <div
            className={`mb-6 p-4 rounded-lg ${timerBg} border ${isApprovalExpired ? "border-red-300" : isLowTime ? "border-orange-300" : "border-gray-200"}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-lg">⏱</span>
                <Paragraph1 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                  {isApprovalExpired
                    ? "Order Approval Expired"
                    : "Time Remaining to Approve"}
                </Paragraph1>
              </div>
              <div>
                <Paragraph3
                  className={`text-2xl font-bold font-mono ${timerColor}`}
                >
                  {formatTime(secondsRemaining)}
                </Paragraph3>
                <Paragraph1 className="text-[10px] text-gray-500 text-right mt-1">
                  {isApprovalExpired
                    ? "This order will be auto-cancelled"
                    : "Approve or reject order"}
                </Paragraph1>
              </div>
            </div>
          </div>
        )}

        <div className="w-full h-px bg-gray-300 mb-8" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <Paragraph1 className="text-[10px] font-bold text-gray-400 uppercase mb-1">
              Date Ordered
            </Paragraph1>
            <Paragraph1 className="font-bold text-black text-sm">
              {dateOrdered}
            </Paragraph1>
          </div>
          <div>
            <Paragraph1 className="text-[10px] font-bold text-gray-400 uppercase mb-1">
              Number of Items
            </Paragraph1>
            <Paragraph1 className="font-bold text-black text-sm">
              {itemCount} Items
            </Paragraph1>
          </div>
          <div>
            <Paragraph1 className="text-[10px] font-bold text-gray-400 uppercase mb-1">
              Items Delivered
            </Paragraph1>
            <Paragraph1 className="font-bold text-black text-sm">
              {itemsDelivered} / {totalItems} Delivered
            </Paragraph1>
          </div>
          <div className="sm:items-end">
            <Paragraph1 className="text-[10px] font-bold text-gray-400 uppercase mb-1">
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
            <div className="flex gap-3 mt-8 pt-8 border-t border-gray-300">
              <button
                className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-black font-bold text-sm rounded-lg"
                onClick={() => rejectMutation.mutate()}
                disabled={rejectMutation.isPending}
              >
                {rejectMutation.isPending ? "Rejecting..." : "Reject Order"}
              </button>
              <button
                className="flex-1 px-6 py-3 bg-black hover:bg-gray-900 text-white font-bold text-sm rounded-lg"
                onClick={() => approveMutation.mutate()}
                disabled={approveMutation.isPending}
              >
                {approveMutation.isPending ? "Approving..." : "Approve Order"}
              </button>
            </div>
          )}

        {showRejectMessage && (
          <div className="flex flex-col items-center justify-center mt-8 pt-8 border-t border-gray-300">
            <Paragraph1 className="text-red-700 font-bold text-lg mb-2">
              Order rejected.
            </Paragraph1>
            <Paragraph1 className="text-gray-500 text-sm">
              The order has been cancelled and the renter notified. No payment
              will be charged for this order.
            </Paragraph1>
          </div>
        )}

        {showApproveMessage && (
          <div className="flex flex-col items-center justify-center mt-8 pt-8 border-t border-gray-300">
            <Paragraph1 className="text-green-700 font-bold text-lg mb-2">
              Waiting for renter to make payment...
            </Paragraph1>
            <Paragraph1 className="text-gray-500 text-sm">
              The order has been approved. The renter will be notified and
              prompted to complete payment. You will be updated when payment is
              received and dispatch can begin.
            </Paragraph1>
          </div>
        )}

        {isApprovalExpired && isPendingApproval && (
          <div className="mt-8 pt-8 border-t border-red-200 bg-red-50 p-4 rounded-lg">
            <Paragraph1 className="text-xs font-bold text-red-700">
              ⚠ This order&apos;s approval deadline has expired and will be
              automatically cancelled.
            </Paragraph1>
          </div>
        )}
      </div>

      <div>
        <OrderItemList orderId={orderId} items={order?.items ?? []} />
      </div>
    </div>
  );
};

export default OrderDetailsCard;
