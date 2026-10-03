"use client";

import { useEffect, useMemo } from "react";
import { countVisibleCartItems } from "@/lib/cart/visibleCartCount";
import { useCartItems } from "@/lib/queries/renters/useCartItems";
import { useRentalRequests } from "@/lib/queries/renters/useRentalRequests";
import { useCartCountStore } from "@/store/useCartCountStore";
import { useUserStore } from "@/store/useUserStore";

/** Navbar badge count aligned with visible rows on /shop/cart. */
export function useNavbarCartCount(): number {
  const token = useUserStore((s) => s.token);
  const cartCount = useCartCountStore((state) => state.cartCount);
  const setCartCount = useCartCountStore((state) => state.setCartCount);
  const { data: cartData } = useCartItems();
  const { data: approvedData } = useRentalRequests("approved", 1, 100);

  const visibleCount = useMemo(
    () =>
      countVisibleCartItems(
        cartData?.items,
        approvedData?.rentalRequests ?? [],
      ),
    [cartData?.items, approvedData?.rentalRequests],
  );

  useEffect(() => {
    if (!token) {
      setCartCount(0);
      return;
    }
    if (cartData?.items !== undefined) {
      setCartCount(visibleCount);
    }
  }, [token, cartData?.items, visibleCount, setCartCount]);

  return cartCount;
}
