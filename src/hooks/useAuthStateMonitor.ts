/**
 * Hook to monitor authentication state and handle side effects when user logs out.
 * This ensures React Query cache is synchronized with auth state, especially after 401 errors.
 *
 * Use this in a layout or root component to activate global auth monitoring.
 */

import { useEffect, useRef } from "react";
import { useUserStore } from "@/store/useUserStore";
import { useSessionStore } from "@/store/useSessionStore";
import { useQueryClient } from "@tanstack/react-query";

export function useAuthStateMonitor() {
  const queryClient = useQueryClient();
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
      // Immediately invalidate all queries when user is logged out
      void queryClient.invalidateQueries();

      // Clear error states to prevent stale error messages
      queryClient.clear();
    }

    previousTokenRef.current = token;
  }, [token, queryClient]);

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
