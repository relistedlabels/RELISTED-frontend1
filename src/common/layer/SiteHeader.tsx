"use client";

import { usePathname } from "next/navigation";
import { shouldShowNavBar } from "@/lib/navbarRoutes";
import DesktopNavbar from "./DesktopNavbar";
import MobileNavbar from "./MobileNavbar";

/** Fixed site nav only. Sale banner renders in page flow below the bar (see home page). */
export default function SiteHeader() {
  const pathname = usePathname();
  if (!shouldShowNavBar(pathname)) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 w-full">
      <DesktopNavbar />
      <MobileNavbar />
    </div>
  );
}
