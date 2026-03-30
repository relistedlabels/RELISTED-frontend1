"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSessionStore } from "@/store/useSessionStore";
import { shouldSuppressSignInRedirect } from "@/lib/auth/signInRedirectPaths";

/**
 * Single owner of 401 → sign-in navigation. apiFetch only sets pending URL in the session store;
 * parallel 401s coalesce via requestSignInRedirect, and this effect runs at most one replace.
 */
export function UnauthorizedSignInRedirect() {
  const router = useRouter();
  const pathname = usePathname();
  const pendingSignInReturnUrl = useSessionStore(
    (s) => s.pendingSignInReturnUrl,
  );
  const clearPendingSignInRedirect = useSessionStore(
    (s) => s.clearPendingSignInRedirect,
  );

  useEffect(() => {
    if (!pendingSignInReturnUrl) return;

    if (shouldSuppressSignInRedirect(pathname)) {
      clearPendingSignInRedirect();
      return;
    }

    const target = `/auth/sign-in?redirect=${encodeURIComponent(pendingSignInReturnUrl)}`;
    clearPendingSignInRedirect();
    router.replace(target);
  }, [pendingSignInReturnUrl, pathname, router, clearPendingSignInRedirect]);

  return null;
}
