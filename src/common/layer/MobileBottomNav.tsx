"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Home, Shirt, ShoppingBag, Package, User } from "lucide-react";
import { useState } from "react";
import { shouldShowMobileBottomNav } from "@/lib/navbarRoutes";
import {
  isBuyShopNavActive,
  isRentShopNavActive,
} from "@/lib/nav/shopNavMatch";
import { useUserStore } from "@/store/useUserStore";
import MobileGuestAuthSheet from "./MobileGuestAuthSheet";
import {
  BUY_LISTING_TYPES,
  RENT_LISTING_TYPES,
} from "@/lib/shop/shopBrowse";
import { mergePreservedShopParams } from "@/lib/shop/listingFilters";

function shopTabHref(
  pathname: string,
  searchParams: URLSearchParams,
  listingType: string,
): string {
  if (!pathname.startsWith("/shop")) {
    return `/shop?listingType=${listingType}`;
  }
  const params = new URLSearchParams(searchParams.toString());
  mergePreservedShopParams(params, searchParams);
  params.set("listingType", listingType);
  params.delete("page");
  return `/shop?${params.toString()}`;
}

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home, match: (p: string) => p === "/" },
  {
    label: "Rent",
    icon: Shirt,
    shopListingType: RENT_LISTING_TYPES,
    match: (p: string, listingType: string) =>
      isRentShopNavActive(p, listingType),
  },
  {
    label: "Buy",
    icon: ShoppingBag,
    shopListingType: BUY_LISTING_TYPES,
    match: (p: string, listingType: string) =>
      isBuyShopNavActive(p, listingType),
  },
  {
    href: "/renters/orders",
    label: "Orders",
    icon: Package,
    match: (p: string) => p.startsWith("/renters/orders"),
    guestOpensAuth: true,
  },
  {
    href: "/renters/account",
    label: "Account",
    icon: User,
    match: (p: string) =>
      p.startsWith("/renters/account") ||
      p.startsWith("/renters/wallet") ||
      p.startsWith("/renters/dispute"),
    guestOpensAuth: true,
  },
] as const;

export default function MobileBottomNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const token = useUserStore((s) => s.token);
  const [authSheetOpen, setAuthSheetOpen] = useState(false);

  if (!shouldShowMobileBottomNav(pathname)) return null;

  const listingType = searchParams.get("listingType") ?? "";

  return (
    <>
      <nav
        className="xl:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)]"
        aria-label="Main navigation"
      >
        <ul className="flex items-stretch justify-around">
          {NAV_ITEMS.map((item) => {
            const { label, icon: Icon, match, ...rest } = item;
            const guestOpensAuth =
              "guestOpensAuth" in rest && rest.guestOpensAuth;
            const href =
              "shopListingType" in rest && rest.shopListingType
                ? shopTabHref(pathname, searchParams, rest.shopListingType)
                : "href" in item
                  ? item.href
                  : "/";
            const isActive = match(pathname, listingType);

            const itemClass = `flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors w-full ${
              isActive ? "text-black" : "text-gray-500"
            }`;

            if (!token && guestOpensAuth) {
              return (
                <li key={label} className="flex-1">
                  <button
                    type="button"
                    onClick={() => setAuthSheetOpen(true)}
                    className={itemClass}
                  >
                    <Icon
                      className={`h-5 w-5 ${isActive ? "stroke-[2.5px]" : "stroke-[1.75px]"}`}
                      aria-hidden
                    />
                    <span>{label}</span>
                  </button>
                </li>
              );
            }

            return (
              <li key={label} className="flex-1">
                <Link href={href} className={itemClass}>
                  <Icon
                    className={`h-5 w-5 ${isActive ? "stroke-[2.5px]" : "stroke-[1.75px]"}`}
                    aria-hidden
                  />
                  <span>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <MobileGuestAuthSheet
        isOpen={authSheetOpen}
        onClose={() => setAuthSheetOpen(false)}
      />
    </>
  );
}
