"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Trash2, ShoppingCart } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
// import { useCart } from "@/lib/queries/renters/useCart";
import { useRemoveCartItem } from "@/lib/mutations/cart/useRemoveCartItem";
import { isLineRentalApproved } from "@/lib/cart/rentalRequestUi";
import type { CartCheckoutLine } from "../types";
import { isResaleItem } from "@/lib/listers/listerOrderRow";
import { firstProductAttachmentImageUrl } from "@/lib/product/sortProductAttachmentUploads";
import { cloudinaryOptimizedImageUrl } from "@/lib/media/cloudinaryOptimizedImageUrl";
import { formatRentalDuration } from "@/lib/rental/formatRentalDuration";
import { cartSurfaceCardClass } from "../cartSurface";

// --- Formatting Helper (for thousands separator) ---
const formatCurrency = (amount: number): string => {
  if (typeof amount !== "number" || isNaN(amount)) return "0";
  return amount.toLocaleString("en-NG");
};

function mergedProductStatus(line: CartCheckoutLine): string {
  const fromLine = (line.productStatus ?? "").trim();
  if (fromLine) return fromLine;
  const pd = line.productDetail as { status?: string } | undefined;
  return (pd?.status ?? "").trim();
}

/** Backend also blocks POST /cart-items/:id/request when the item is sold or rented out. */
function inventoryBlockMessage(line: CartCheckoutLine): string | null {
  const ps = mergedProductStatus(line).toUpperCase();
  if (ps === "SOLD") {
    return "This item has been sold. Remove it from your cart if you no longer need it.";
  }
  if (ps === "RENTED") {
    return "This item is rented out right now. Remove it from your cart or try again later.";
  }
  return null;
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
      <div className="bg-yellow-50 p-4 border border-yellow-200 rounded-lg">
        <Paragraph1 className="text-yellow-800 text-sm">
          Failed to load cart. Please try again.
        </Paragraph1>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <ShoppingCart size={80} className="text-gray-300 mb-4" />
        <Paragraph1 className="max-w-sm text-gray-600 text-sm leading-relaxed">
          No items ready for checkout yet. When a lister confirms availability,
          they will show up here.
        </Paragraph1>
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
    <div className="min-w-0 w-full max-w-full">
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
      <div className="space-y-3 min-w-0 w-full sm:space-y-0 sm:divide-y sm:divide-gray-100">
        {cartItems.map((item) => {
          const isSelected = selectedLineIds.includes(item.lineId);
          const product = (item.productDetail || {}) as {
            attachments?: {
              uploads?: Array<{ url: string; displayOrder?: number | null }>;
            };
            name?: string;
            dailyPrice?: number;
            resalePrice?: number;
            originalValue?: number;
            collateralPrice?: number;
          };
          const thumbUrl = cloudinaryOptimizedImageUrl(
            firstProductAttachmentImageUrl(product.attachments?.uploads),
            { preset: "thumb" },
          );
          const deposit = item.isResale
            ? 0
            : (product.collateralPrice ?? product.originalValue ?? 0);
          const unitPrice = item.isResale
            ? (product.resalePrice ?? 0)
            : (product.dailyPrice ?? 0);
          const isApproved = isLineRentalApproved(item.status);
          const inventoryMessage = inventoryBlockMessage(item);
          const dueBeforeShipping = item.isResale
            ? item.totalPrice
            : item.totalPrice + deposit;

          const statusBadge = inventoryMessage ? (
            <span className="text-gray-600 text-xs leading-snug max-w-56">
              {inventoryMessage}
            </span>
          ) : (
            <span className="bg-green-100 px-2 py-0.5 border border-green-200 rounded-full font-semibold text-green-800 text-xs">
              {isApproved || item.isResale ? "Ready to checkout" : "Ready"}
            </span>
          );

          return (
            <div
              key={item.lineId}
              className={`${cartSurfaceCardClass} sm:items-center sm:grid sm:grid-cols-12 sm:hover:bg-gray-50 sm:px-0 sm:py-4 sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0 overflow-hidden transition-colors`}
            >
              {/* === Product Info (Mobile/Desktop) === */}
              <div className="flex items-start gap-3 sm:col-span-4 w-full">
                <div className="flex items-center gap-2.5 shrink-0 sm:items-start sm:gap-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleItemSelection(item.lineId)}
                    className="border-gray-300 rounded focus:ring-black w-4 h-4 text-black form-checkbox sm:mt-1"
                  />
                  <div className="relative bg-gray-200 border border-gray-100 rounded-md w-16 h-20 overflow-hidden shrink-0">
                    {thumbUrl ? (
                      <Image
                        src={thumbUrl}
                        alt={product.name || item.productName || "Product"}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : null}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <Paragraph1 className="flex-1 font-semibold text-gray-800 text-sm uppercase leading-snug">
                      {product.name || item.productName}
                    </Paragraph1>
                    <div className="sm:hidden flex items-start gap-1 shrink-0">
                      <div className="text-right">
                        <Paragraph1 className="font-bold text-gray-900 text-sm tabular-nums">
                          {currency}
                          {formatCurrency(dueBeforeShipping)}
                        </Paragraph1>
                        {!item.isResale && deposit > 0 ? (
                          <Paragraph1 className="mt-0.5 text-gray-500 text-[11px] leading-none">
                            incl. {currency}
                            {formatCurrency(deposit)} deposit
                          </Paragraph1>
                        ) : null}
                      </div>
                      <button
                        aria-label={`Remove ${product.name || item.productName}`}
                        onClick={() => handleRemoveItem(item)}
                        disabled={removeCartItemMutation.isPending}
                        className="disabled:opacity-50 p-1 text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <Paragraph1 className="mt-1.5 text-gray-600 text-xs leading-snug">
                    Size: <strong>S</strong> Color: <strong>Black</strong>
                  </Paragraph1>
                  {item.isResale || isResaleItem(item) ? (
                    <Paragraph1 className="mt-1 text-gray-600 text-xs leading-snug">
                      Type: <strong>Purchase</strong>
                    </Paragraph1>
                  ) : (
                    <Paragraph1 className="mt-1 text-gray-600 text-xs leading-snug">
                      Duration:{" "}
                      <strong>{formatRentalDuration(item.rentalDays)}</strong>
                    </Paragraph1>
                  )}

                  <div className="sm:hidden mt-3">{statusBadge}</div>
                </div>
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

                <div className="col-span-3 text-center">
                  <div className="flex flex-col items-center gap-2">
                    {statusBadge}
                    <button
                      aria-label={`Remove ${product.name || item.productName}`}
                      onClick={() => handleRemoveItem(item)}
                      disabled={removeCartItemMutation.isPending}
                      className="disabled:opacity-50 p-1 text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
