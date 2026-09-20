"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  HelpCircle,
  Package,
  ShoppingBagIcon,
  Sparkles,
  Store,
} from "lucide-react";
import NavbarNotificationBell from "@/components/notifications/NavbarNotificationBell";
import LoginModal from "@/common/modals/LoginModal";
import { Paragraph1, ParagraphLink1 } from "../ui/Text";
import SearchModal from "./SearchModal";
import { AuthActions } from "./AuthActions";
import { useNavbarCartCount } from "@/lib/queries/renters/useNavbarCartCount";
import { DesktopSalesNavLink } from "./SalesNavLink";
import NavDropdown from "./NavDropdown";
import { useUserStore } from "@/store/useUserStore";
import {
  HELP_NAV_ITEMS,
  SHOP_NAV_ITEMS,
} from "@/lib/nav/siteNavItems";

function DesktopNavbarContent() {
  const cartCount = useNavbarCartCount();
  const token = useUserStore((s) => s.token);
  const router = useRouter();
  const [loginOpen, setLoginOpen] = useState(false);

  const shopDropdownItems = SHOP_NAV_ITEMS.filter(
    (item) => item.label !== "Style Spotlight",
  );

  const cartAriaLabel =
    cartCount > 0 ? `Cart, ${cartCount} items` : "Cart";

  const cartContent = (
    <>
      <ShoppingBagIcon className="h-5 w-5" aria-hidden />
      <ParagraphLink1>Cart</ParagraphLink1>
      {cartCount > 0 ? <Paragraph1>{cartCount}</Paragraph1> : null}
    </>
  );

  return (
    <>
      <nav className="hidden w-full bg-black/95 text-white backdrop-blur-md xl:block">
        <div className="container relative mx-auto flex w-full items-center justify-between px-[20px] py-4">
          <div className="flex items-center space-x-6">
            <NavDropdown label="Shop" icon={Store} items={shopDropdownItems} />
            <Link href="/style-spotlight" className="flex items-center gap-1.5">
              <Sparkles className="h-5 w-5" aria-hidden />
              <ParagraphLink1>Style Spotlight</ParagraphLink1>
            </Link>
            <NavDropdown
              label="Help"
              icon={HelpCircle}
              items={HELP_NAV_ITEMS}
            />
            <DesktopSalesNavLink />
          </div>

          <Link href="/" className="absolute left-1/2 -translate-x-1/2">
            <Image src="/images/logo.svg" alt="Logo" width={45} height={45} />
          </Link>

          <div className="flex items-center space-x-6 text-sm font-light">
            <SearchModal showLabel />

            <Link href="/renters/orders" className="flex items-center gap-1.5">
              <Package className="h-5 w-5" aria-hidden />
              <ParagraphLink1>Orders</ParagraphLink1>
            </Link>

            {token ? (
              <Link
                href="/shop/cart"
                className="flex items-center gap-1.5"
                aria-label={cartAriaLabel}
              >
                {cartContent}
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setLoginOpen(true)}
                className="flex items-center gap-1.5"
                aria-label={cartAriaLabel}
              >
                {cartContent}
              </button>
            )}

            <NavbarNotificationBell />

            <AuthActions />
          </div>
        </div>
      </nav>

      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onLoginSuccess={() => router.push("/shop/cart")}
      />
    </>
  );
}

export default function DesktopNavbar() {
  return <DesktopNavbarContent />;
}
