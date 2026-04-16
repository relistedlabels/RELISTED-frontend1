"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Trash2, ShoppingCart } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
// import { useCart } from "@/lib/queries/renters/useCart";
import { useRemoveCartItem } from "@/lib/mutations/cart/useRemoveCartItem";
import { useReRequestAvailability } from "@/lib/mutations/cart/useReRequestAvailability";
import {
  isLineRentalApproved,
  rentalLineIsEffectivelyExpired,
  shouldShowRentalRequestTimer,
} from "@/lib/cart/rentalRequestUi";
import type { CartCheckoutLine } from "../types";
import { isResaleItem } from "@/lib/listers/listerOrderRow";

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
        className="bg-gray-200 p-4 rounded-lg h-24 animate-pulse"
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
  const reRequestMutation = useReRequestAvailability();
  const [selectedLineIds, setSelectedLineIds] = useState<string[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalBulk, setModalBulk] = useState(false);
  const [pendingRemove, setPendingRemove] = useState<{
    cartItemId: string;
    rentalRequestId?: string;
  } | null>(null);
  const currency = "₦";

  const handleReRequest = async (cartItemId: string) => {
    try {
      await reRequestMutation.mutateAsync(cartItemId);
    } catch (error) {
      console.error("Failed to re-request availability:", error);
    }
  };

  if (isLoading) return <CartSkeleton />;

  if (error || !cartItems) {
    return (
      <div className="bg-yellow-50 p-4 border border-yellow-200 rounded-lg">
        <Paragraph1 className="text-yellow-800 text-sm">
          Failed to load cart. Please try again.
        </Paragraph1>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="flex justify-center items-center py-16">
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
        <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/40">
          <div className="bg-white shadow-lg p-6 rounded-lg w-full max-w-sm animate-fade-in">
            <Paragraph1 className="mb-4 font-semibold text-lg">
              {modalBulk
                ? `Remove ${selectedLineIds.length} selected items from your cart?`
                : `Remove this item from your cart?`}
            </Paragraph1>
            <Paragraph1 className="mb-4 text-gray-600 text-sm">
              {modalBulk && selectedLineIds.length !== 1
                ? "This will cancel your rental requests. You can send new ones if you change your mind."
                : "This will cancel your rental request. You can send another if you change your mind."}
            </Paragraph1>
            <div className="flex justify-end gap-4 mt-6">
              <button
                className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded text-gray-700"
                onClick={cancelRemove}
              >
                Cancel
              </button>
              <button
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-white"
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
              className="bg-gray-100 hover:bg-gray-200 px-3 py-1 border border-gray-300 rounded text-gray-700"
              onClick={selectAll}
            >
              <Paragraph1>Select All</Paragraph1>
            </button>
            <button
              className="bg-gray-100 hover:bg-gray-200 px-3 py-1 border border-gray-300 rounded text-gray-700"
              onClick={deselectAll}
            >
              <Paragraph1>Deselect All</Paragraph1>
            </button>
            <button
              className="bg-red-500 hover:bg-red-600 disabled:opacity-50 px-3 py-1 border border-red-600 rounded text-white"
              onClick={handleBulkRemove}
              disabled={selectedLineIds.length === 0}
            >
              <Paragraph1>Remove Selected</Paragraph1>
            </button>
            <Paragraph1 className="ml-2 text-gray-500 text-xs">
              {selectedLineIds.length} selected
            </Paragraph1>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Table Header Row (Desktop/Tablet View - hidden on mobile) */}
      <div className="hidden gap-2 sm:grid grid-cols-12 p-2 py-6 border border-gray-200 rounded-lg font-medium text-gray-500 text-xs">
        <div className="col-span-4 pl-4">
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
        <div className="col-span-3 px-4 text-start">
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
            resalePrice?: number;
            originalValue?: number;
            collateralPrice?: number;
          };
          const deposit = item.isResale
            ? 0
            : (product.collateralPrice ?? product.originalValue ?? 0);
          const unitPrice = item.isResale
            ? (product.resalePrice ?? 0)
            : (product.dailyPrice ?? 0);
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
              className="items-center gap-2 sm:grid sm:grid-cols-12 hover:bg-gray-50 px-4 sm:px-0 py-4 transition-colors"
            >
              {/* === Product Info (Mobile/Desktop) === */}
              <div className="flex items-start gap-3 col-span-4 w-full">
                {/* Checkbox */}
                <div className="pt-1 shrink-0">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleItemSelection(item.lineId)}
                    className="border-gray-300 rounded focus:ring-black w-4 h-4 text-black form-checkbox"
                  />
                </div>
                {/* Image */}
                <div className="relative bg-gray-200 border border-gray-100 rounded-sm w-16 h-20 overflow-hidden shrink-0">
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
                  <Paragraph1 className="font-semibold text-gray-800 text-sm uppercase leading-snug">
                    {product.name || item.productName}
                  </Paragraph1>
                  <Paragraph1 className="mt-1 text-gray-600 text-xs leading-snug">
                    Size: <strong>S</strong> Color: <strong>Black</strong>
                  </Paragraph1>
                  {item.isResale || isResaleItem(item) ? (
                    <Paragraph1 className="mt-1 text-gray-600 text-xs leading-snug">
                      Type: <strong>Resale</strong>
                    </Paragraph1>
                  ) : (
                    <Paragraph1 className="mt-1 text-gray-600 text-xs leading-snug">
                      Duration: <strong>{item.rentalDays} Days</strong>
                    </Paragraph1>
                  )}
                  {/* Mobile Status Display */}
                  <div className="sm:hidden flex flex-wrap items-center gap-2 mt-2">
                    {item.isResale &&
                      !showTimer &&
                      !isExpired &&
                      !isApproved && (
                        <div className="flex items-center gap-2">
                          <span className="bg-green-100 px-2 py-0.5 border border-green-200 rounded-full font-semibold text-green-800 text-xs">
                            Ready to checkout
                          </span>
                          <button
                            aria-label={`Remove ${product.name || item.productName}`}
                            onClick={() => handleRemoveItem(item)}
                            disabled={removeCartItemMutation.isPending}
                            className="disabled:opacity-50 p-1 text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    {item.isResale && showTimer && (
                      <div className="flex items-center">
                        <span className="text-gray-500 text-xs">⏱</span>
                        <RentalTimer expiresAt={item.expiresAt!} />
                        <span className="ml-2 text-gray-500 text-xs">
                          You'll be notified once approved
                        </span>
                      </div>
                    )}
                    {item.isResale && isExpired && (
                      <div className="flex items-center gap-1">
                        <span className="bg-orange-100 px-2 py-0.5 border border-orange-200 rounded-full font-semibold text-orange-800 text-xs">
                          Approval expired
                        </span>
                        <button
                          type="button"
                          onClick={() => handleReRequest(item.cartItemId)}
                          disabled={reRequestMutation.isPending}
                          className="ml-1 font-semibold text-blue-600 hover:text-blue-800 text-xs underline disabled:opacity-50"
                        >
                          {reRequestMutation.isPending
                            ? "Requesting..."
                            : "Request approval again"}
                        </button>
                      </div>
                    )}
                    {item.isResale && isApproved && (
                      <div className="flex items-center gap-2">
                        <span className="text-green-600 text-xl">✓</span>
                        <span className="text-xs font-semibold text-green-700">
                          Approved
                        </span>
                        <button
                          aria-label={`Remove ${product.name || item.productName}`}
                          onClick={() => handleRemoveItem(item)}
                          disabled={removeCartItemMutation.isPending}
                          className="disabled:opacity-50 p-1 text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                    {!item.isResale && isExpired && (
                      <div className="flex items-center gap-1">
                        <span className="bg-orange-100 px-2 py-0.5 border border-orange-200 rounded-full font-semibold text-orange-800 text-xs">
                          Approval expired
                        </span>
                        <button
                          type="button"
                          onClick={() => handleReRequest(item.cartItemId)}
                          disabled={reRequestMutation.isPending}
                          className="ml-1 font-semibold text-blue-600 hover:text-blue-800 text-xs underline disabled:opacity-50"
                        >
                          {reRequestMutation.isPending
                            ? "Requesting..."
                            : "Request approval again"}
                        </button>
                      </div>
                    )}
                    {!item.isResale && isApproved && (
                      <div className="flex items-center gap-2">
                        <span className="text-green-600 text-xl">✓</span>
                        <span className="text-xs font-semibold text-green-700">
                          Approved
                        </span>
                        <button
                          aria-label={`Remove ${product.name || item.productName}`}
                          onClick={() => handleRemoveItem(item)}
                          disabled={removeCartItemMutation.isPending}
                          className="disabled:opacity-50 p-1 text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                    {!item.isResale && showTimer && (
                      <div className="flex items-center">
                        <span className="text-gray-500 text-xs">⏱</span>
                        <RentalTimer expiresAt={item.expiresAt!} />
                        <span className="ml-2 text-gray-500 text-xs">
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
                  className="sm:hidden disabled:opacity-50 p-1 text-red-500 hover:text-red-700 transition-colors shrink-0"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {/* === Price Columns (Desktop View) === */}
              <div className="hidden sm:contents font-medium text-sm">
                {/* Unit Price */}
                <div className="col-span-2 text-gray-900 text-center">
                  <Paragraph1>
                    {currency}
                    {formatCurrency(unitPrice)}
                  </Paragraph1>
                </div>

                {/* Deposit */}
                <div className="col-span-1 text-gray-900 text-center">
                  <Paragraph1>
                    {item.isResale
                      ? "-"
                      : `${currency}${formatCurrency(deposit)}`}
                  </Paragraph1>
                </div>

                {/* Subtotal */}
                <div className="col-span-2 font-bold text-gray-900 text-center">
                  <Paragraph1>
                    {currency}
                    {formatCurrency(item.totalPrice)}
                  </Paragraph1>
                </div>

                {/* Status Column */}
                <div className="col-span-3 text-center">
                  <div className="flex flex-col items-center gap-2">
                    {item.isResale &&
                      !showTimer &&
                      !isExpired &&
                      !isApproved && (
                        <div className="flex items-center gap-2">
                          <span className="bg-green-100 px-2 py-0.5 border border-green-200 rounded-full font-semibold text-green-800 text-xs">
                            Ready to checkout
                          </span>
                          <button
                            aria-label={`Remove ${product.name || item.productName}`}
                            onClick={() => handleRemoveItem(item)}
                            disabled={removeCartItemMutation.isPending}
                            className="disabled:opacity-50 p-1 text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    {item.isResale && showTimer && (
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center gap-1">
                          <span className="flex items-center gap-1 font-semibold text-gray-500 text-xs">
                            <span>⏱</span> Awaiting approval
                          </span>
                          <button
                            aria-label={`Remove ${product.name || item.productName}`}
                            onClick={() => handleRemoveItem(item)}
                            disabled={removeCartItemMutation.isPending}
                            className="disabled:opacity-50 p-1 text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <span className="text-gray-500 text-xs">
                          You'll be notified once approved
                        </span>
                        <RentalTimer expiresAt={item.expiresAt!} />
                      </div>
                    )}
                    {item.isResale && isExpired && (
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-orange-600 text-lg">⚠</span>
                          <span className="font-semibold text-orange-700 text-xs">
                            Approval expired
                          </span>
                          <button
                            aria-label={`Remove ${product.name || item.productName}`}
                            onClick={() => handleRemoveItem(item)}
                            disabled={removeCartItemMutation.isPending}
                            className="disabled:opacity-50 p-1 text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleReRequest(item.cartItemId)}
                          disabled={reRequestMutation.isPending}
                          className="font-semibold text-blue-600 hover:text-blue-800 text-xs underline disabled:opacity-50"
                        >
                          {reRequestMutation.isPending
                            ? "Requesting..."
                            : "Request approval again"}
                        </button>
                      </div>
                    )}
                    {item.isResale && isApproved && (
                      <div className="flex items-center gap-2">
                        <span className="text-green-600 text-xl">✓</span>
                        <span className="text-xs font-semibold text-green-700">
                          Approved
                        </span>
                        <button
                          aria-label={`Remove ${product.name || item.productName}`}
                          onClick={() => handleRemoveItem(item)}
                          disabled={removeCartItemMutation.isPending}
                          className="disabled:opacity-50 p-1 text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                    {!item.isResale && isExpired && (
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-orange-600 text-lg">⚠</span>
                          <span className="font-semibold text-orange-700 text-xs">
                            Approval expired
                          </span>
                          <button
                            aria-label={`Remove ${product.name || item.productName}`}
                            onClick={() => handleRemoveItem(item)}
                            disabled={removeCartItemMutation.isPending}
                            className="disabled:opacity-50 p-1 text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleReRequest(item.cartItemId)}
                          disabled={reRequestMutation.isPending}
                          className="font-semibold text-blue-600 hover:text-blue-800 text-xs underline disabled:opacity-50"
                        >
                          {reRequestMutation.isPending
                            ? "Requesting..."
                            : "Request approval again"}
                        </button>
                      </div>
                    )}
                    {!item.isResale && isApproved && (
                      <div className="flex items-center gap-2">
                        <span className="text-green-600 text-xl">✓</span>
                        <span className="text-xs font-semibold text-green-700">
                          Approved
                        </span>
                        <button
                          aria-label={`Remove ${product.name || item.productName}`}
                          onClick={() => handleRemoveItem(item)}
                          disabled={removeCartItemMutation.isPending}
                          className="disabled:opacity-50 p-1 text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                    {!item.isResale && showTimer && (
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center gap-1">
                          <span className="flex items-center gap-1 font-semibold text-gray-500 text-xs">
                            <span>⏱</span> Awaiting approval
                          </span>
                          <button
                            aria-label={`Remove ${product.name || item.productName}`}
                            onClick={() => handleRemoveItem(item)}
                            disabled={removeCartItemMutation.isPending}
                            className="disabled:opacity-50 p-1 text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <span className="text-gray-500 text-xs">
                          You'll be notified once approved
                        </span>
                        <RentalTimer expiresAt={item.expiresAt!} />
                      </div>
                    )}
                    {!item.isResale &&
                      !isExpired &&
                      !isApproved &&
                      !showTimer && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 text-xs">—</span>
                          <button
                            aria-label={`Remove ${product.name || item.productName}`}
                            onClick={() => handleRemoveItem(item)}
                            disabled={removeCartItemMutation.isPending}
                            className="disabled:opacity-50 p-1 text-red-500 hover:text-red-700 transition-colors"
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
              <div className="sm:hidden flex justify-between items-center mt-4 w-full font-medium text-sm">
                {/* Unit Price (Mobile) */}
                <div className="w-1/3 text-left">
                  <Paragraph1 className="mb-1 text-gray-500 text-xs">
                    Unit Price
                  </Paragraph1>
                  <Paragraph1 className="font-semibold text-gray-900 text-sm">
                    {currency}
                    {formatCurrency(unitPrice)}
                  </Paragraph1>
                </div>

                {/* Deposit (Mobile) */}
                <div className="w-1/3 text-center">
                  <Paragraph1 className="mb-1 text-gray-500 text-xs">
                    Deposit
                  </Paragraph1>
                  <Paragraph1 className="font-semibold text-gray-900 text-sm">
                    {item.isResale
                      ? "-"
                      : `${currency}${formatCurrency(deposit)}`}
                  </Paragraph1>
                </div>

                {/* Subtotal (Mobile) */}
                <div className="w-1/3 text-right">
                  <Paragraph1 className="mb-1 text-gray-500 text-xs">
                    Subtotal
                  </Paragraph1>
                  <Paragraph1 className="font-bold text-gray-900 text-lg">
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
      <div className="flex items-center gap-3 bg-blue-50 mt-6 p-4 border border-blue-200 rounded-lg">
        <span className="text-blue-600 text-lg shrink-0">ℹ</span>
        <Paragraph1 className="text-blue-700 text-sm">
          Items require curator approval before checkout. If expired request
          again.
        </Paragraph1>
      </div>
    </div>
  );
}
