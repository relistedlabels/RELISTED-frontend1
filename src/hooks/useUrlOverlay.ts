"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * Keeps an overlay in sync with a URL search param so mobile back closes the
 * overlay instead of leaving the current page.
 */
export function useUrlOverlay(param: string) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const openedViaPushRef = useRef(false);

  const isOpen = searchParams.get(param) === "1";

  useEffect(() => {
    if (!isOpen) {
      openedViaPushRef.current = false;
    }
  }, [isOpen]);

  const open = useCallback(() => {
    if (searchParams.get(param) === "1") return;

    const params = new URLSearchParams(searchParams.toString());
    params.set(param, "1");
    const qs = params.toString();
    openedViaPushRef.current = true;
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [param, pathname, router, searchParams]);

  const close = useCallback(() => {
    if (searchParams.get(param) !== "1") return;

    if (openedViaPushRef.current) {
      openedViaPushRef.current = false;
      router.back();
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.delete(param);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [param, pathname, router, searchParams]);

  return { isOpen, open, close };
}
