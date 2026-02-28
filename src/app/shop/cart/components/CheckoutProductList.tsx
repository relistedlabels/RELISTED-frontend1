"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
// import { useCart } from "@/lib/queries/renters/useCart";
import { useRemoveRentalRequest } from "@/lib/mutations/renters/useRemoveRentalRequest";

// --- Formatting Helper (for thousands separator) ---
const formatCurrency = (amount: number): string => {
  if (typeof amount !== "number" || isNaN(amount)) return "0";
  return amount.toLocaleString("en-NG");
};

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
  cartItems?: any[];
  isLoading?: boolean;
  error?: Error | null;
}

export default function CheckoutProductList({
  cartItems = [],
  isLoading,
  error,
}: CheckoutProductListProps) {
  const removeRentalRequest = useRemoveRentalRequest();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalBulk, setModalBulk] = useState(false);
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);
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
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <Paragraph1 className="text-sm text-gray-600">
          Your cart is empty. Add items to get started!
        </Paragraph1>
      </div>
    );
  }

  // Toggle selection for an item
  const toggleItemSelection = (requestId: string) => {
    setSelectedItems((prev) =>
      prev.includes(requestId)
        ? prev.filter((id) => id !== requestId)
        : [...prev, requestId],
    );
  };

  // Select all items
  const selectAll = () => {
    setSelectedItems(cartItems.map((item) => item.requestId));
  };
  const deselectAll = () => {
    setSelectedItems([]);
  };

  // Remove item with confirmation
  const handleRemoveItem = (requestId: string) => {
    setPendingRemoveId(requestId);
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
      selectedItems.forEach((id) => removeRentalRequest.mutate(id));
      setSelectedItems([]);
    } else if (pendingRemoveId) {
      removeRentalRequest.mutate(pendingRemoveId);
    }
    setShowConfirmModal(false);
    setPendingRemoveId(null);
    setModalBulk(false);
  };

  // Cancel removal
  const cancelRemove = () => {
    setShowConfirmModal(false);
    setPendingRemoveId(null);
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
                ? `Remove ${selectedItems.length} selected items from cart?`
                : `Remove this item from cart?`}
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
        {selectedItems.length > 0 && (
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
              disabled={selectedItems.length === 0}
            >
              <Paragraph1>Remove Selected</Paragraph1>
            </button>
            <Paragraph1 className="text-xs text-gray-500 ml-2">{selectedItems.length} selected</Paragraph1>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Table Header Row (Desktop/Tablet View - hidden on mobile) */}
      <div className="hidden sm:grid grid-cols-12 text-xs font-medium text-gray-500 p-2 py-6 border rounded-lg border-gray-200">
        <div className="col-span-5 pl-4 ">
          <Paragraph1>Product Name</Paragraph1>
        </div>
        <div className="col-span-2 text-center">
          <Paragraph1>Unit Price</Paragraph1>
        </div>
        <div className="col-span-2 text-center">
          <Paragraph1>Deposit</Paragraph1>
        </div>
        <div className="col-span-2 text-center">
          <Paragraph1>Subtotal</Paragraph1>
        </div>
        {/* Empty column for trash icon on desktop */}
        <div className="col-span-1"></div>
      </div>

      {/* List of Cart Items */}
      <div className="divide-y divide-gray-100">
        {cartItems.map((item) => {
          const isSelected = selectedItems.includes(item.requestId);
          const product = item.productDetail || {};
          return (
            <div
              key={item.requestId}
              className="py-4 px-4 sm:px-0 sm:grid sm:grid-cols-12 items-start hover:bg-gray-50 transition-colors"
            >
              {/* === Product Info (Mobile/Desktop) === */}
              <div className="col-span-5 flex items-start gap-3 w-full">
                {/* Checkbox */}
                  <div className="shrink-0 pt-1">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleItemSelection(item.requestId)}
                      className="form-checkbox h-4 w-4 text-black border-gray-300 rounded focus:ring-black"
                    />
                  </div>
                {/* Image */}
                <div className="shrink-0 w-16 h-20 bg-gray-200 rounded-sm overflow-hidden border border-gray-100 relative">
                  {product.attachments?.uploads?.[0]?.url && (
                    <Image
                      src={product.attachments.uploads[0].url}
                      alt={product.name || item.productName}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                {/* Name and Details */}
                <div className="grow">
                  <div className="flex justify-between items-center w-full">
                    <Paragraph1 className="text-sm font-semibold text-gray-800 uppercase leading-snug">
                      {product.name || item.productName}
                    </Paragraph1>
                    {/* Timer for each item */}
                    {item.expiresAt && (
                      <RentalTimer expiresAt={item.expiresAt} />
                    )}
                    {item.status === "pending_lister_approval" &&
                      !item.expiresAt && (
                        <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200">
                          Pending Approval
                        </span>
                      )}
                    {/* Trash Icon (Visible on Mobile, positioned top-right) */}
                    <button
                      aria-label={`Remove ${product.name || item.productName}`}
                      onClick={() => handleRemoveItem(item.requestId)}
                      disabled={removeRentalRequest.isPending}
                      className="sm:hidden shrink-0 p-1 text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <Paragraph1 className="text-xs text-gray-600 leading-snug mt-1">
                    Duration: <strong>{item.rentalDays} Days</strong>
                  </Paragraph1>
                </div>
              </div>

              {/* === Price Columns (Desktop View) === */}
              <div className="hidden sm:contents text-sm font-medium">
                {/* Rental Price (Desktop) */}
                <div className="col-span-2 text-center text-gray-900">
                  <Paragraph1>
                    {currency}
                    {formatCurrency(product.dailyPrice || item.dailyRate)}
                  </Paragraph1>
                </div>

                {/* Delivery Fee (Desktop) */}
                <div className="col-span-2 text-center text-gray-900">
                  <Paragraph1>
                    {currency}
                    {formatCurrency(product.originalValue)}
                  </Paragraph1>
                </div>

                {/* Subtotal (Desktop) */}
                <div className="col-span-2 text-center font-bold text-lg text-gray-900">
                  <Paragraph1>
                    {currency}
                    {formatCurrency(item.totalPrice)}
                  </Paragraph1>
                </div>
              </div>

              {/* Trash Icon (Desktop) */}
              <div className="hidden sm:flex col-span-1 items-center justify-center">
                <button
                  aria-label={`Remove ${product.name || item.productName}`}
                  onClick={() => handleRemoveItem(item.requestId)}
                  disabled={removeRentalRequest.isPending}
                  className="p-1 text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {/* === Price Row (Mobile View - below product info) === */}
              <div className="sm:hidden flex justify-between items-center w-full mt-4 text-sm font-medium">
                {/* Rental Price (Mobile) */}
                <div className="text-left w-1/3">
                  <Paragraph1 className="text-xs text-gray-500 mb-1">
                    Rental Price
                  </Paragraph1>
                  <Paragraph1 className="text-sm font-semibold text-gray-900">
                    {currency}
                    {formatCurrency(product.dailyPrice || item.dailyRate)}
                  </Paragraph1>
                </div>

                {/* Delivery Fee (Mobile) */}
                <div className="text-center w-1/3">
                  <Paragraph1 className="text-xs text-gray-500 mb-1">
                    Delivery
                  </Paragraph1>
                  <Paragraph1 className="text-sm font-semibold text-gray-900">
                    {currency}
                    {formatCurrency(item.deliveryFee)}
                  </Paragraph1>
                </div>

                {/* Subtotal (Mobile) */}
                <div className="text-right w-1/3">
                  <Paragraph1 className="text-xs text-gray-500 mb-1">
                    Total
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
    </div>
  );
}
