"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Trash2, ShoppingCart } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
// import { useCart } from "@/lib/queries/renters/useCart";
import { useRemoveCartItem } from "@/lib/mutations/cart/useRemoveCartItem";
import {
  isLineRentalApproved,
  rentalLineIsEffectivelyExpired,
  shouldShowRentalRequestTimer,
} from "@/lib/cart/rentalRequestUi";
import type { CartCheckoutLine } from "../types";

// --- Formatting Helper (for thousands separator) ---
const formatCurrency = (amount: number): string => {
  if (typeof amount !== "number" || isNaN(amount)) return "0";
  return amount.toLocaleString("en-NG");
};

function isLineRentalPendingWithoutTimer(
  status?: string,
  expiresAt?: string,
): boolean {
  if (expiresAt) return false;
  const u = (status ?? "").trim().toUpperCase();
  return (
    u === "PENDING" ||
    u === "PENDING_LISTER_APPROVAL" ||
    status === "pending_lister_approval"
  );
}

// === Skeleton Loader ===
const CartSkeleton = () => (
  <div className="space-y-4">
    {[...Array(3)].map((_, i) => (
      <div
        key={i}
        className="p-4 bg-gray-200 rounded-lg animate-pulse h-24"
      ></div>
    ))}
  </div>
);

// Timer component for 15 min countdown
const RentalTimer: React.FC<{ expiresAt: string }> = ({ expiresAt }) => {
  const [timeLeft, setTimeLeft] = React.useState<string>("");

  React.useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const expiryTime = new Date(expiresAt).getTime();
      const distance = expiryTime - now;
      if (distance <= 0) {
        setTimeLeft("Expired");
        return;
      }
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, "0")}`);
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  return (
    <span
      className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${timeLeft === "Expired" ? "bg-red-100 text-red-800 border-red-200" : "bg-blue-100 text-blue-800 border-blue-200"} border`}
    >
      {timeLeft === "Expired" ? "Expired" : `Expires in ${timeLeft}`}
    </span>
  );
};

interface CheckoutProductListProps {
  cartItems?: CartCheckoutLine[];
  isLoading?: boolean;
  error?: Error | null;
}

export default function CheckoutProductList({
  cartItems = [],
  isLoading,
  error,
}: CheckoutProductListProps) {
  const removeCartItemMutation = useRemoveCartItem();
  const [selectedLineIds, setSelectedLineIds] = useState<string[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalBulk, setModalBulk] = useState(false);
  const [pendingRemove, setPendingRemove] = useState<{
    cartItemId: string;
    rentalRequestId?: string;
  } | null>(null);
  const currency = "₦";

  if (isLoading) return <CartSkeleton />;

  if (error || !cartItems) {
    return (
      <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <Paragraph1 className="text-sm text-yellow-800">
          Failed to load cart. Please try again.
        </Paragraph1>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <ShoppingCart size={80} className="text-gray-300" />
      </div>
    );
  }

  const toggleItemSelection = (lineId: string) => {
    setSelectedLineIds((prev) =>
      prev.includes(lineId)
        ? prev.filter((id) => id !== lineId)
        : [...prev, lineId],
    );
  };

  const selectAll = () => {
    setSelectedLineIds(cartItems.map((item) => item.lineId));
  };
  const deselectAll = () => {
    setSelectedLineIds([]);
  };

  const handleRemoveItem = (item: CartCheckoutLine) => {
    setPendingRemove({
      cartItemId: item.cartItemId,
      rentalRequestId: item.rentalRequestId,
    });
    setShowConfirmModal(true);
    setModalBulk(false);
  };

  // Bulk remove with confirmation
  const handleBulkRemove = () => {
    setShowConfirmModal(true);
    setModalBulk(true);
  };

  // Confirm removal
  const confirmRemove = () => {
    if (modalBulk) {
      selectedLineIds.forEach((lineId) => {
        const row = cartItems.find((i) => i.lineId === lineId);
        if (row) {
          removeCartItemMutation.mutate({
            cartItemId: row.cartItemId,
            rentalRequestId: row.rentalRequestId,
          });
        }
      });
      setSelectedLineIds([]);
    } else if (pendingRemove) {
      removeCartItemMutation.mutate(pendingRemove);
    }
    setShowConfirmModal(false);
    setPendingRemove(null);
    setModalBulk(false);
  };

  // Cancel removal
  const cancelRemove = () => {
    setShowConfirmModal(false);
    setPendingRemove(null);
    setModalBulk(false);
  };

  return (
    <div className="w-full">
      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm animate-fade-in">
            <Paragraph1 className="text-lg font-semibold mb-4">
              {modalBulk
                ? `Remove ${selectedLineIds.length} selected items from your cart?`
                : `Remove this item from your cart?`}
            </Paragraph1>
            <Paragraph1 className="text-sm text-gray-600 mb-4">
              {modalBulk && selectedLineIds.length !== 1
                ? "This will cancel your rental requests. You can send new ones if you change your mind."
                : "This will cancel your rental request. You can send another if you change your mind."}
            </Paragraph1>
            <div className="flex gap-4 justify-end mt-6">
              <button
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                onClick={cancelRemove}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
                onClick={confirmRemove}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Bulk Actions - only show if any item is selected */}
      <AnimatePresence>
        {selectedLineIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2 mb-4"
          >
            <button
              className="px-3 py-1 rounded bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
              onClick={selectAll}
            >
              <Paragraph1>Select All</Paragraph1>
            </button>
            <button
              className="px-3 py-1 rounded bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
              onClick={deselectAll}
            >
              <Paragraph1>Deselect All</Paragraph1>
            </button>
            <button
              className="px-3 py-1 rounded bg-red-500 text-white border border-red-600 hover:bg-red-600 disabled:opacity-50"
              onClick={handleBulkRemove}
              disabled={selectedLineIds.length === 0}
            >
              <Paragraph1>Remove Selected</Paragraph1>
            </button>
            <Paragraph1 className="text-xs text-gray-500 ml-2">
              {selectedLineIds.length} selected
            </Paragraph1>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Table Header Row (Desktop/Tablet View - hidden on mobile) */}
      <div className="hidden sm:grid grid-cols-12 text-xs font-medium text-gray-500 p-2 py-6 border rounded-lg border-gray-200 gap-2">
        <div className="col-span-4 pl-4 ">
          <Paragraph1>Product Name</Paragraph1>
        </div>
        <div className="col-span-2 text-center">
          <Paragraph1>Unit Price</Paragraph1>
        </div>
        <div className="col-span-1 text-center">
          <Paragraph1>Deposit</Paragraph1>
        </div>
        <div className="col-span-2 text-center">
          <Paragraph1>Subtotal</Paragraph1>
        </div>
        <div className="col-span-3 text-start px-4">
          <Paragraph1>Status</Paragraph1>
        </div>
      </div>

      {/* List of Cart Items */}
      <div className="divide-y divide-gray-100">
        {cartItems.map((item) => {
          const isSelected = selectedLineIds.includes(item.lineId);
          const product = (item.productDetail || {}) as {
            attachments?: { uploads?: { url: string }[] };
            name?: string;
            dailyPrice?: number;
            originalValue?: number;
          };
          const deposit = product.originalValue ?? 0;
          const isApproved = isLineRentalApproved(item.status);
          const isExpired = rentalLineIsEffectivelyExpired(
            item.status,
            item.expiresAt,
          );
          const showTimer = shouldShowRentalRequestTimer(
            item.status,
            item.expiresAt,
          );

          return (
            <div
              key={item.lineId}
              className="py-4 px-4 sm:px-0 sm:grid sm:grid-cols-12 items-center hover:bg-gray-50 transition-colors gap-2"
            >
              {/* === Product Info (Mobile/Desktop) === */}
              <div className="col-span-4 flex items-start gap-3 w-full">
                {/* Checkbox */}
                <div className="shrink-0 pt-1">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleItemSelection(item.lineId)}
                    className="form-checkbox h-4 w-4 text-black border-gray-300 rounded focus:ring-black"
                  />
                </div>
                {/* Image */}
                <div className="shrink-0 w-16 h-20 bg-gray-200 rounded-sm overflow-hidden border border-gray-100 relative">
                  {product.attachments?.uploads?.[0]?.url && (
                    <Image
                      src={product.attachments.uploads[0].url}
                      alt={product.name || item.productName || "Product"}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                {/* Name and Details */}
                <div className="grow">
                  <Paragraph1 className="text-sm font-semibold text-gray-800 uppercase leading-snug">
                    {product.name || item.productName}
                  </Paragraph1>
                  <Paragraph1 className="text-xs text-gray-600 leading-snug mt-1">
                    Size: <strong>S</strong> Color: <strong>Black</strong>
                  </Paragraph1>
                  <Paragraph1 className="text-xs text-gray-600 leading-snug mt-1">
                    Duration: <strong>{item.rentalDays} Days</strong>
                  </Paragraph1>
                  {/* Mobile Status Display */}
                  <div className="flex flex-wrap items-center gap-2 mt-2 sm:hidden">
                    {isExpired && (
                      <div className="flex items-center gap-1">
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-200">
                          Approval expired
                        </span>
                        <button className="text-xs text-blue-600 hover:text-blue-800 font-semibold underline ml-1">
                          Request approval again
                        </button>
                      </div>
                    )}
                    {isApproved && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200 flex items-center gap-1">
                        <span>✓</span> Approved
                      </span>
                    )}
                    {showTimer && (
                      <div className="flex items-center">
                        <span className="text-xs text-gray-500">⏱</span>
                        <RentalTimer expiresAt={item.expiresAt!} />
                        <span className="text-xs text-gray-500 ml-2">
                          You'll be notified once approved
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Trash Icon (Visible on Mobile) */}
                <button
                  aria-label={`Remove ${product.name || item.productName}`}
                  onClick={() => handleRemoveItem(item)}
                  disabled={removeCartItemMutation.isPending}
                  className="sm:hidden shrink-0 p-1 text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {/* === Price Columns (Desktop View) === */}
              <div className="hidden sm:contents text-sm font-medium">
                {/* Unit Price */}
                <div className="col-span-2 text-center text-gray-900">
                  <Paragraph1>
                    {currency}
                    {formatCurrency(product.dailyPrice ?? 0)}
                  </Paragraph1>
                </div>

                {/* Deposit */}
                <div className="col-span-1 text-center text-gray-900">
                  <Paragraph1>
                    {currency}
                    {formatCurrency(deposit)}
                  </Paragraph1>
                </div>

                {/* Subtotal */}
                <div className="col-span-2 text-center font-bold text-gray-900">
                  <Paragraph1>
                    {currency}
                    {formatCurrency(item.totalPrice)}
                  </Paragraph1>
                </div>

                {/* Status Column */}
                <div className="col-span-3 text-center">
                  <div className="flex flex-col items-center gap-2">
                    {isExpired && (
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-orange-600 text-lg">⚠</span>
                          <span className="text-xs font-semibold text-orange-700">
                            Approval expired
                          </span>
                          <button
                            aria-label={`Remove ${product.name || item.productName}`}
                            onClick={() => handleRemoveItem(item)}
                            disabled={removeCartItemMutation.isPending}
                            className="p-1 text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <button className="text-xs text-blue-600 hover:text-blue-800 font-semibold underline">
                          Request approval again
                        </button>
                      </div>
                    )}
                    {isApproved && (
                      <div className="flex items-center gap-2">
                        <span className="text-green-600 text-xl">✓</span>
                        <span className="text-xs font-semibold text-green-700">
                          Approved
                        </span>
                        <button
                          aria-label={`Remove ${product.name || item.productName}`}
                          onClick={() => handleRemoveItem(item)}
                          disabled={removeCartItemMutation.isPending}
                          className="p-1 text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                    {showTimer && (
                      <div className="flex flex-col  gap-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs text-gray-500 font-semibold flex items-center gap-1">
                            <span>⏱</span> Awaiting approval
                          </span>
                          <button
                            aria-label={`Remove ${product.name || item.productName}`}
                            onClick={() => handleRemoveItem(item)}
                            disabled={removeCartItemMutation.isPending}
                            className="p-1 text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <span className="text-xs text-gray-500">
                          You'll be notified once approved
                        </span>
                        <RentalTimer expiresAt={item.expiresAt!} />
                      </div>
                    )}
                    {!isExpired && !isApproved && !showTimer && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">—</span>
                        <button
                          aria-label={`Remove ${product.name || item.productName}`}
                          onClick={() => handleRemoveItem(item)}
                          disabled={removeCartItemMutation.isPending}
                          className="p-1 text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Trash Icon (Desktop) */}
              {/* Now part of Status Column, removed separate icon */}

              {/* === Price Row (Mobile View - below product info) === */}
              <div className="sm:hidden flex justify-between items-center w-full mt-4 text-sm font-medium">
                {/* Unit Price (Mobile) */}
                <div className="text-left w-1/3">
                  <Paragraph1 className="text-xs text-gray-500 mb-1">
                    Unit Price
                  </Paragraph1>
                  <Paragraph1 className="text-sm font-semibold text-gray-900">
                    {currency}
                    {formatCurrency(product.dailyPrice ?? 0)}
                  </Paragraph1>
                </div>

                {/* Deposit (Mobile) */}
                <div className="text-center w-1/3">
                  <Paragraph1 className="text-xs text-gray-500 mb-1">
                    Deposit
                  </Paragraph1>
                  <Paragraph1 className="text-sm font-semibold text-gray-900">
                    {currency}
                    {formatCurrency(deposit)}
                  </Paragraph1>
                </div>

                {/* Subtotal (Mobile) */}
                <div className="text-right w-1/3">
                  <Paragraph1 className="text-xs text-gray-500 mb-1">
                    Subtotal
                  </Paragraph1>
                  <Paragraph1 className="text-lg font-bold text-gray-900">
                    {currency}
                    {formatCurrency(item.totalPrice)}
                  </Paragraph1>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Note */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
        <span className="text-blue-600 text-lg shrink-0">ℹ</span>
        <Paragraph1 className="text-sm text-blue-700">
          Items require curator approval before checkout. If expired request
          again.
        </Paragraph1>
      </div>
    </div>
  );
}
