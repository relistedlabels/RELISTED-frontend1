"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import { useCart } from "@/lib/queries/renters/useCart";
import { useRemoveFromCart } from "@/lib/mutations/renters/useCartMutations";

// --- Formatting Helper (for thousands separator) ---
const formatCurrency = (amount: number): string => {
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

export default function CheckoutProductList() {
  const { data: cartData, isLoading, error } = useCart();
  const removeFromCart = useRemoveFromCart();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const currency = "₦";

  const items = cartData?.cartItems || [];

  if (isLoading) return <CartSkeleton />;

  if (error || !items) {
    return (
      <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <Paragraph1 className="text-sm text-yellow-800">
          Failed to load cart. Please try again.
        </Paragraph1>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <Paragraph1 className="text-sm text-gray-600">
          Your cart is empty. Add items to get started!
        </Paragraph1>
      </div>
    );
  }

  // Toggle selection for an item
  const toggleItemSelection = (cartItemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(cartItemId)
        ? prev.filter((id) => id !== cartItemId)
        : [...prev, cartItemId],
    );
  };

  // Remove item from cart
  const handleRemoveItem = (cartItemId: string) => {
    removeFromCart.mutate(cartItemId);
  };

  return (
    <div className="w-full">
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
        {items.map((item) => {
          const isSelected = selectedItems.includes(item.cartItemId);

          return (
            <div
              key={item.cartItemId}
              className="py-4 px-4 sm:px-0 sm:grid sm:grid-cols-12 items-start hover:bg-gray-50 transition-colors"
            >
              {/* === Product Info (Mobile/Desktop) === */}
              <div className="col-span-5 flex items-start gap-3 w-full">
                {/* Checkbox */}
                <div className="shrink-0 pt-1">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleItemSelection(item.cartItemId)}
                    className="form-checkbox h-4 w-4 text-black border-gray-300 rounded focus:ring-black"
                  />
                </div>
                {/* Image */}
                <div className="shrink-0 w-16 h-20 bg-gray-200 rounded-sm overflow-hidden border border-gray-100 relative">
                  {item.productImage && (
                    <Image
                      src={item.productImage}
                      alt={item.productName}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                {/* Name and Details */}
                <div className="grow">
                  <div className="flex justify-between items-center w-full">
                    <Paragraph1 className="text-sm font-semibold text-gray-800 uppercase leading-snug">
                      {item.productName}
                    </Paragraph1>
                    {/* Trash Icon (Visible on Mobile, positioned top-right) */}
                    <button
                      aria-label={`Remove ${item.productName}`}
                      onClick={() => handleRemoveItem(item.cartItemId)}
                      disabled={removeFromCart.isPending}
                      className="sm:hidden shrink-0 p-1 text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <Paragraph1 className="text-xs text-gray-600 leading-snug mt-1">
                    Lister: <strong>{item.listerName}</strong>
                  </Paragraph1>
                  <Paragraph1 className="text-xs text-gray-600 leading-snug">
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
                    {formatCurrency(item.rentalPrice)}
                  </Paragraph1>
                </div>

                {/* Delivery Fee (Desktop) */}
                <div className="col-span-2 text-center text-gray-900">
                  <Paragraph1>
                    {currency}
                    {formatCurrency(item.deliveryFee)}
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
                  aria-label={`Remove ${item.productName}`}
                  onClick={() => handleRemoveItem(item.cartItemId)}
                  disabled={removeFromCart.isPending}
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
                    {formatCurrency(item.rentalPrice)}
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
