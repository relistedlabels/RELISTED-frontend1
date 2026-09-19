"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

import {
  HelpCircle,
  Package,
  ShoppingBagIcon,
  Store,
} from "lucide-react";
import { Paragraph1, ParagraphLink1 } from "../ui/Text";
import SearchModal from "./SearchModal";
import { AuthActions } from "./AuthActions";
import { useCartCountStore } from "@/store/useCartCountStore";
import { useCartItems } from "@/lib/queries/renters/useCartItems";
import { useUserStore } from "@/store/useUserStore";
import { DesktopSalesNavLink } from "./SalesNavLink";

function DesktopNavbarContent() {
  const cartCount = useCartCountStore((state) => state.cartCount);
  const setCartCount = useCartCountStore((state) => state.setCartCount);
  const token = useUserStore((s) => s.token);
  const { data } = useCartItems();

  useEffect(() => {
    if (!token) {
      setCartCount(0);
      return;
    }
    if (data?.itemCount !== undefined) {
      setCartCount(data.itemCount);
    }
  }, [token, data?.itemCount, setCartCount]);

  return (
    <nav className="bg-black/95 backdrop-blur-md hidden xl:block text-white w-full">
      <div className="relative flex items-center justify-between container mx-auto w-full py-4 px-[20px]">
        {/* Left Section */}
        <div className="flex items-center space-x-8">
          <Link href="/shop" className="flex items-center gap-1.5">
            <Store className="w-5 h-5" aria-hidden />
            <ParagraphLink1>Shop</ParagraphLink1>
          </Link>
          <Link href="/how-it-works" className="flex items-center gap-1.5">
            <HelpCircle className="w-5 h-5" aria-hidden />
            <ParagraphLink1>How it works</ParagraphLink1>
          </Link>
          <DesktopSalesNavLink />
        </div>

        {/* Center Logo */}
        <Link href="/" className="absolute left-1/2 -translate-x-1/2">
          <Image src="/images/logo.svg" alt="Logo" width={45} height={45} />
        </Link>

        {/* Right Section */}
        <div className="flex items-center space-x-6 text-sm font-light">
          <SearchModal />

          <Link href="/renters/orders" className="flex items-center gap-1.5">
            <Package className="w-5 h-5" aria-hidden />
            <ParagraphLink1>Orders</ParagraphLink1>
          </Link>

          <Link href="/shop/cart" className="flex items-center space-x-1">
            <ShoppingBagIcon className="w-6 h-6" aria-hidden />
            <Paragraph1>{cartCount}</Paragraph1>
          </Link>

          <AuthActions />
        </div>
      </div>
    </nav>
  );
}

export default function DesktopNavbar() {
  return <DesktopNavbarContent />;
}
