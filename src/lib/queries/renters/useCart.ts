import { useRentalRequests } from "@/lib/queries/renters/useRentalRequests";

/** Checkout-ready rental lines (lister confirmed availability). */
export const useCart = () => {
  const { data, isLoading, error, refetch } = useRentalRequests(
    "approved",
    1,
    100,
  );
  const cartItems = data?.rentalRequests ?? [];

  return {
    data: {
      cartItems,
    },
    isLoading,
    error,
    refetch,
  };
};

/** Summary totals for checkout-ready cart lines. */
export const useCartSummary = () => {
  const { data, isLoading, error, refetch } = useRentalRequests(
    "approved",
    1,
    100,
  );
  const cartItems = data?.rentalRequests ?? [];
  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.rentalPrice || 0),
    0,
  );
  const totalDeliveryFees = cartItems.reduce(
    (sum, item) => sum + (item.deliveryFee || 0),
    0,
  );
  const totalSecurityDeposit = cartItems.reduce(
    (sum, item) => sum + (item.cleaningFee || 0),
    0,
  );
  const cartTotal = subtotal + totalDeliveryFees + totalSecurityDeposit;
  const itemCount = cartItems.length;

  return {
    data: {
      cartItems,
      subtotal,
      totalDeliveryFees,
      totalSecurityDeposit,
      cartTotal,
      itemCount,
    },
    isLoading,
    error,
    refetch,
  };
};
