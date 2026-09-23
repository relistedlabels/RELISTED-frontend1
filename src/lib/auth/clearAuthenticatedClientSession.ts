import type { QueryClient } from "@tanstack/react-query";
import { useCartCountStore } from "@/store/useCartCountStore";

const AUTHENTICATED_QUERY_PREFIXES = [
  ["auth"],
  ["cart"],
  ["renters"],
  ["profile"],
  ["listers"],
  ["notifications"],
  ["wallet"],
  ["renter-verifications-status"],
  ["orderSummary"],
  ["admin"],
] as const;

/** Drop authed React Query caches and local cart badge state after logout or 401. */
export function clearAuthenticatedClientSession(queryClient: QueryClient) {
  for (const queryKey of AUTHENTICATED_QUERY_PREFIXES) {
    queryClient.removeQueries({ queryKey });
  }
  useCartCountStore.getState().setCartCount(0);
}
