"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

function readOverlayParam(param: string): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get(param) === "1";
}

/**
 * Keeps an overlay in sync with a URL search param so mobile back closes the
 * overlay instead of leaving the current page.
 *
 * Uses history.pushState rather than router.push to avoid Next.js soft
 * navigations that can shift page layout while the overlay is open.
 */
export function useUrlOverlay(param: string) {
  const searchParams = useSearchParams();
  const openedViaPushRef = useRef(false);
  const [isOpen, setIsOpen] = useState(
    () => searchParams.get(param) === "1",
  );

  useEffect(() => {
    if (openedViaPushRef.current) return;
    setIsOpen(searchParams.get(param) === "1");
  }, [param, searchParams]);

  useEffect(() => {
    const onPopState = () => {
      setIsOpen(readOverlayParam(param));
      openedViaPushRef.current = false;
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [param]);

  const open = useCallback(() => {
    if (readOverlayParam(param)) {
      setIsOpen(true);
      return;
    }

    const url = new URL(window.location.href);
    url.searchParams.set(param, "1");
    openedViaPushRef.current = true;
    window.history.pushState({ overlay: param }, "", url);
    setIsOpen(true);
  }, [param]);

  const close = useCallback(() => {
    if (!isOpen && !readOverlayParam(param)) return;

    if (openedViaPushRef.current) {
      openedViaPushRef.current = false;
      window.history.back();
      return;
    }

    const url = new URL(window.location.href);
    url.searchParams.delete(param);
    const nextUrl = `${url.pathname}${url.search}${url.hash}`;
    window.history.replaceState(window.history.state, "", nextUrl);
    setIsOpen(false);
  }, [isOpen, param]);

  return { isOpen, open, close };
}
