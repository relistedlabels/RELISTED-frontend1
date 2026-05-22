/**
 * Hook to monitor authentication state and handle side effects when user logs out.
 * This ensures React Query cache is synchronized with auth state, especially after 401 errors.
 *
 * Use this in a layout or root component to activate global auth monitoring.
 */

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { isPublicBrowseRoute } from "@/lib/auth/signInRedirectPaths";
import { useUserStore } from "@/store/useUserStore";
import { useSessionStore } from "@/store/useSessionStore";
import { useQueryClient } from "@tanstack/react-query";

export function useAuthStateMonitor() {
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const previousTokenRef = useRef<string | null>(null);

  // Monitor token changes for logout
  const token = useUserStore((s) => s.token);
  const isSessionExpired = useSessionStore((s) => s.isSessionExpired);

  useEffect(() => {
    const hadToken = previousTokenRef.current !== null;
    const hasToken = token !== null;
    const tokenChanged = previousTokenRef.current !== token;

    // If token was cleared (logout due to 401 or manual logout)
    if (hadToken && !hasToken && tokenChanged) {
      const onPublicBrowse =
        typeof window !== "undefined" && isPublicBrowseRoute(pathname);

      if (onPublicBrowse) {
        // Keep catalog queries; drop authed caches only so the shop grid stays visible.
        void queryClient.invalidateQueries({ queryKey: ["auth"] });
        void queryClient.invalidateQueries({ queryKey: ["cart"] });
        void queryClient.invalidateQueries({ queryKey: ["renters"] });
        void queryClient.invalidateQueries({ queryKey: ["profile"] });
      } else {
        void queryClient.invalidateQueries();
        queryClient.clear();
      }
    }

    previousTokenRef.current = token;
  }, [token, queryClient, pathname]);

  // Also monitor session expiry flag
  useEffect(() => {
    if (isSessionExpired) {
      // Session was explicitly marked as expired (via 401 response)
      void queryClient.invalidateQueries({
        queryKey: ["auth"],
        exact: false,
      });
    }
  }, [isSessionExpired, queryClient]);
}
