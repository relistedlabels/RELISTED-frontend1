"use client";

import React from "react";
import { Trash2 } from "lucide-react";
import { Header1, Paragraph1 } from "@/common/ui/Text";

// ============================================================================
// API ENDPOINTS USED:
// ============================================================================
// GET /api/renters/rental-requests - Fetch user's pending availability requests
//   Returns: Array of cart items with 15-minute timers, each item has:
//   - requestId, productId, productName, listerId, listerName
//   - rentalStartDate, rentalEndDate, rentalDays, totalPrice
//   - status: "pending_lister_approval"
//   - expiresAt (15 minutes from request creation)
//   - timeRemainingSeconds, timeRemainingMinutes (for countdown timer)
//   - autoPay (whether user agreed to auto-pay)
//   Frontend should poll/refresh every 5 seconds to update timers
//
// DELETE /api/renters/rental-requests/:requestId - Remove item from cart
//   Used when user clicks trash icon to remove pending request
//   Frontend should also auto-remove items when timeRemaining <= 0
//
// GET /api/renters/rental-requests/:requestId - Monitor status of pending request
//   Used to check if lister approved/rejected when cart item is showing
//   Once approved, switch from "Request Processing..." to order confirmation
//   Once rejected or expired, remove item from cart
//
// POST /api/renters/rental-requests/:requestId/confirm - Finalize rental order
//   Called automatically when lister approves (if autoPay=true)
//   OR manually when lister rejects and user clicks confirm after adding funds
//   Creates order and deducts payment from wallet
// ============================================================================

// --- Data Structure for a single item ---
interface CartItem {
  id: number;
  image: string; // URL or path to the product image
  name: string;
  size: string;
  color: string;
  days: number;
  price: number; // Price for the specified rental days
}

// Placeholder Data (reflecting the image)
const initialCartItems: CartItem[] = [
  {
    id: 1,
    image: "/path/to/fendi-boots.png", // Replace with actual image path
    name: "FENDI ARCO BOOTS",
    size: "8",
    color: "Black",
    days: 3,
    price: 165000,
  },
  {
    id: 2,
    image: "/path/to/fendi-boots.png",
    name: "FENDI ARCO BOOTS",
    size: "8",
    color: "Black",
    days: 3,
    price: 165000,
  },
  {
    id: 3,
    image: "/path/to/fendi-boots.png",
    name: "FENDI ARCO BOOTS",
    size: "8",
    color: "Black",
    days: 3,
    price: 165000,
  },
];

// --- Formatting Helper (for thousands separator) ---
const formatCurrency = (amount: number): string => {
  return amount.toLocaleString("en-NG");
};

export default function RentalCartSummary() {
  const cartItems = initialCartItems; // In a real app, this would be managed by state (useState/Redux/Context)
  const currency = "₦";

  // Calculate Subtotal: Sum of all item prices
  const subtotal = cartItems.reduce((acc, item) => acc + item.price, 0);

  return (
    <div className="p-6 bg-gray-50 max-w-sm mx-auto">
      {/* List of Cart Items */}
      <div className="space-y-6">
        {cartItems.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-4 pb-4 border-b border-gray-200 last:border-b-0"
          >
            {/* Product Image */}
            <div className="shrink-0 w-16 h-16 bg-gray-200 rounded-md overflow-hidden">
              {/* Placeholder image tag */}
            </div>

            {/* Product Details */}
            <div className="grow">
              <Paragraph1 className="text-sm font-semibold text-gray-800 uppercase leading-snug">
                {item.name}
              </Paragraph1>
              <Paragraph1 className="text-xs text-gray-600 leading-snug mt-1">
                Size: {item.size} Color: {item.color}
              </Paragraph1>
              <Paragraph1 className="text-sm font-medium text-gray-800 mt-1">
                {item.days} DAYS - {currency}
                {formatCurrency(item.price)}
              </Paragraph1>
            </div>

            {/* Remove Button (Trash Icon) */}
            <button
              aria-label={`Remove ${item.name}`}
              className="shrink-0 p-1 text-red-500 hover:text-red-700 transition-colors"
              // In a real app, this would trigger a removeItem function
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>

      {/* Subtotal Footer */}
      <div className="flex justify-between items-center pt-6 mt-4 border-t border-gray-300">
        <Header1 className="text-base font-semibold text-gray-800 tracking-wider">
          SUBTOTAL:
        </Header1>
        <Header1 className="text-lg font-bold text-gray-900">
          {currency}
          {formatCurrency(subtotal)}
        </Header1>
      </div>
    </div>
  );
}
