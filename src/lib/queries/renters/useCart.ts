import { useRentalRequests } from "@/lib/queries/renters/useRentalRequests";

/**
 * Fetches all pending rental requests (used as cart items)
 */
export const useCart = () => {
  // Only pending requests are considered cart items
  const { data, isLoading, error, refetch } = useRentalRequests("pending");
  const cartItems = data?.rentalRequests || [];
  console.log("Rental Requests List:", cartItems);
  // Fetch product details for each productId and log them
  const fetchProductDetails = async () => {
    for (const item of cartItems) {
      try {
        const response = await import("@/lib/api/product").then(
          ({ productApi }) => productApi.getPublicById(item.productId),
        );
        console.log(
          `Product details for productId ${item.productId}:`,
          response.data,
        );
      } catch (err) {
        console.error(`Error fetching productId ${item.productId}:`, err);
      }
    }
  };
  if (cartItems.length > 0) {
    fetchProductDetails();
  }
  // Normalize to match previous cart shape
  return {
    data: {
      cartItems,
    },
    isLoading,
    error,
    refetch,
  };
};

/**
 * Returns a summary of pending rental requests (cart)
 * Calculates subtotal, delivery, deposit, and total
 */
export const useCartSummary = () => {
  const { data, isLoading, error, refetch } = useRentalRequests("pending");
  const cartItems = data?.rentalRequests || [];
  // Calculate summary fields
  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.rentalFee || 0),
    0,
  );
  const totalDeliveryFees = cartItems.reduce(
    (sum, item) => sum + (item.deliveryFee || 0),
    0,
  );
  const totalSecurityDeposit = cartItems.reduce(
    (sum, item) => sum + (item.securityDeposit || 0),
    0,
  );
  const cartTotal = subtotal + totalDeliveryFees + totalSecurityDeposit;
  const itemCount = cartItems.length;
  const expiredItems = cartItems
    .filter((item) => item.status === "expired")
    .map((item) => item.id);
  return {
    data: {
      cartItems,
      subtotal,
      totalDeliveryFees,
      totalSecurityDeposit,
      cartTotal,
      itemCount,
      expiredItems,
    },
    isLoading,
    error,
    refetch,
  };
};
