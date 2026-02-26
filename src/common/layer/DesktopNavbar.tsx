"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

import {
  Search,
  Heart,
  ShoppingCart,
  ChevronDown,
  ShoppingBag,
  ShoppingBagIcon,
} from "lucide-react";
import { ParagraphLink1 } from "../ui/Text";
import Button from "../ui/Button";
import BrandsDropdown from "./BrandsDropdown";
import ShopDropdown from "./ShopDropdown";
import RentalCartView from "./RentalCartView";
import { usePathname } from "next/navigation";
import SearchModal from "./SearchModal";
import { AuthActions } from "./AuthActions";
import { shouldShowNavBar } from "@/lib/navbarRoutes";
import { useFavoriteCountStore } from "@/store/useFavoriteCountStore";

export default function DesktopNavbar() {
  const pathname = usePathname();
  const favoriteCount = useFavoriteCountStore((state) => state.favoriteCount);

  if (!shouldShowNavBar(pathname)) return null;

  return (
    <nav className="bg-black/95  backdrop-blur-md hidden xl:block text-white fixed w-full z-50">
      <div className="relative flex items-center justify-between container mx-auto w-full py-4 [20px]">
        {/* Left Section */}
        <div className="flex items-center space-x-8  ">
          <ShopDropdown />
          {/* <BrandsDropdown /> */}
          <Link href="/style-spotlight">
            <ParagraphLink1>Style Spotlight</ParagraphLink1>
          </Link>
          <Link href="/how-it-works">
            <ParagraphLink1>How it works</ParagraphLink1>
          </Link>
        </div>

        {/* Center Logo — Always perfectly centered */}
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

          <RentalCartView />
          <AuthActions />

          {/* <div className="flex gap-[9px] items-center">
            <Button
              text="Sign In"
              isLink={true}
              href="/auth/sign-in"
              backgroundColor="bg-transparent"
              border="border border-white"
              color="text-white"
            />
            <Button
              text="Sign Up"
              isLink={true}
              href="/auth/create-account"
              backgroundColor="bg-white"
              color="text-black hover:text-white"
              border="border border-white"
            />
          </div> */}
        </div>
      </div>
    </nav>
  );
}
