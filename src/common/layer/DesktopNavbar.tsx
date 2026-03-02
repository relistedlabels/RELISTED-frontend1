"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

import { Heart, ShoppingBagIcon } from "lucide-react";
import { Paragraph1, ParagraphLink1 } from "../ui/Text";
import ShopDropdown from "./ShopDropdown";
import RentalCartView from "./RentalCartView";
import { usePathname } from "next/navigation";
import SearchModal from "./SearchModal";
import { AuthActions } from "./AuthActions";
import { shouldShowNavBar } from "@/lib/navbarRoutes";
import { useFavoriteCountStore } from "@/store/useFavoriteCountStore";
import { useRentalRequests } from "@/lib/queries/renters/useRentalRequests";

function DesktopNavbarContent() {
  const favoriteCount = useFavoriteCountStore((state) => state.favoriteCount);
  const { data } = useRentalRequests("pending", 1, 50);

  const totalItems = data?.cartSummary?.totalItems ?? 0;
  return (
    <nav className="bg-black/95 backdrop-blur-md hidden xl:block text-white fixed w-full z-50">
      <div className="relative flex items-center justify-between container mx-auto w-full py-4 px-[20px]">
        {/* Left Section */}
        <div className="flex items-center space-x-8">
          <ShopDropdown />
          <Link href="/style-spotlight">
            <ParagraphLink1>Style Spotlight</ParagraphLink1>
          </Link>
          <Link href="/how-it-works">
            <ParagraphLink1>How it works</ParagraphLink1>
          </Link>
        </div>

        {/* Center Logo */}
        <Link href="/" className="absolute left-1/2 -translate-x-1/2">
          <Image src="/images/logo.svg" alt="Logo" width={45} height={45} />
        </Link>

        {/* Right Section */}
        <div className="flex items-center space-x-6 text-sm font-light">
          <SearchModal />

          <Link
            href="/renters/favorites"
            className="flex items-center space-x-1"
          >
            <Heart className="w-5 h-5" />
            <span>{favoriteCount}</span>
          </Link>

          <Link href="/shop/cart" className="flex items-center space-x-1">
            <ShoppingBagIcon className="w-6 h-6" />
            <Paragraph1>{totalItems}</Paragraph1>
          </Link>

          {/* <RentalCartView /> */}
          <AuthActions />
        </div>
      </div>
    </nav>
  );
}

export default function DesktopNavbar() {
  const pathname = usePathname();
  if (!shouldShowNavBar(pathname)) return null;

  return <DesktopNavbarContent />;
}
