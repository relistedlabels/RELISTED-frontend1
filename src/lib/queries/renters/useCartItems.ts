import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { getCartItemsApi, CartItem, CartData } from "@/lib/api/cart";

export type CartItemsData = CartData & {
  itemCount: number; // Number of items
};

/**
 * Query hook for fetching cart items (GET /cart-items)
 */
export const useCartItems = (): UseQueryResult<CartItemsData, Error> => {
  return useQuery<CartItemsData, Error>({
    queryKey: ["cart", "items"],
    queryFn: async () => {
      const cartData = await getCartItemsApi();
      console.log("🛒 Cart API Response:", cartData);

      const items = cartData?.items || [];

      console.log("🛒 Parsed Cart Items:", {
        cartId: cartData?.cartId,
        itemCount: items.length,
        total: cartData?.total,
      });

      return {
        cartId: cartData.cartId,
        items,
        total: cartData.total,
        itemCount: items.length,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
