import { useQuery } from "@tanstack/react-query";
import { getCartItemsApi, CartData } from "@/lib/api/cart";
import { useUserStore } from "@/store/useUserStore";

export type CartItemsData = CartData & {
  itemCount: number; // Number of items
};

/**
 * Query hook for fetching cart items (GET /cart-items)
 */
export const useCartItems = () => {
  const token = useUserStore((s) => s.token);

  const query = useQuery<CartItemsData, Error>({
    queryKey: ["cart", "items"],
    queryFn: async () => {
      const cartData = await getCartItemsApi();
      const items = cartData?.items || [];

      return {
        cartId: cartData.cartId,
        items,
        total: cartData.total,
        itemCount: items.length,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: token !== null,
  });

  return {
    ...query,
    data: token !== null ? query.data : undefined,
  };
};
