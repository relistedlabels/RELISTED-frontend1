"use client";

import { Suspense, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { shouldShowNavBar } from "@/lib/navbarRoutes";
import DesktopNavbar from "./DesktopNavbar";
import MobileNavbar from "./MobileNavbar";
import { OperationsPauseSiteLayer } from "./OperationsPauseSiteLayer";

function syncSiteHeaderHeight(node: HTMLElement | null) {
  if (!node) return;
  document.documentElement.style.setProperty(
    "--site-fixed-header-height",
    `${Math.ceil(node.getBoundingClientRect().height)}px`,
  );
}

/** Fixed site nav only. Sale banner renders in page flow below the bar (see home page). */
export default function SiteHeader() {
  const pathname = usePathname();
  const showNav = shouldShowNavBar(pathname);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showNav) {
      document.documentElement.style.removeProperty(
        "--site-fixed-header-height",
      );
      return;
    }

    const node = headerRef.current;
    if (!node) return;

    const update = () => syncSiteHeaderHeight(node);
    update();

    const observer = new ResizeObserver(update);
    observer.observe(node);
    window.addEventListener("resize", update);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [showNav, pathname]);

  if (!showNav) return null;

  return (
    <div
      ref={headerRef}
      className="fixed top-0 left-0 right-0 z-50 w-full"
    >
      <Suspense fallback={null}>
        <OperationsPauseSiteLayer>
          <DesktopNavbar />
          <MobileNavbar />
        </OperationsPauseSiteLayer>
      </Suspense>
    </div>
  );
}
