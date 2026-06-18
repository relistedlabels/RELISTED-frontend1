"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useMemo } from "react";

/** Current path + query string for post-login return navigation. */
export function useAuthReturnUrl(): string {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return useMemo(() => {
    const qs = searchParams.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }, [pathname, searchParams]);
}

export function buildSignInUrl(returnUrl: string): string {
  return `/auth/sign-in?redirect=${encodeURIComponent(returnUrl)}`;
}
