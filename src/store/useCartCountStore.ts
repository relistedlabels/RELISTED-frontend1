import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CartCountState {
  cartCount: number;
  setCartCount: (count: number) => void;
  incrementCartCount: (amount?: number) => void;
  decrementCartCount: (amount?: number) => void;
}

/**
 * Store for managing cart count locally.
 * - Updates optimistically when items are added/removed
 * - Synced via useEffect on app load to fetch from DB
 * - Persists across page reloads
 */
export const useCartCountStore = create<CartCountState>()(
  persist(
    (set) => ({
      cartCount: 0,

      setCartCount: (count) => set({ cartCount: count }),

      incrementCartCount: (amount = 1) =>
        set((state) => ({ cartCount: state.cartCount + amount })),

      decrementCartCount: (amount = 1) =>
        set((state) => ({ cartCount: Math.max(0, state.cartCount - amount) })),
    }),
    {
      name: "cart-count-store",
    },
  ),
);
