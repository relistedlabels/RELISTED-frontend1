"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Heart, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Paragraph1 } from "../ui/Text";
import Button from "../ui/Button";
import RentalCartView from "./RentalCartView";
import { usePathname } from "next/navigation";
import SearchModal from "./SearchModal";
import ShopDropdownMobile from "./ShopDropdownMobile";
import { shouldShowNavBar } from "@/lib/navbarRoutes";
import { MobileAuthActions } from "./MobileAuthActions";
import { useFavoriteCountStore } from "@/store/useFavoriteCountStore";

export default function MobileNavbar() {
  const [open, setOpen] = useState(false);
  const [isShopMenuOpen, setIsShopMenuOpen] = useState(false);
  const pathname = usePathname();
  const favoriteCount = useFavoriteCountStore((state) => state.favoriteCount);

  if (!shouldShowNavBar(pathname)) return null;

  return (
    <div className="fixed top-0 left-0 w-full bg-black text-white  px-4 py-5 z-50 xl:hidden">
      <div className="relative flex items-center">
        {/* LEFT - Toggle */}
        <button onClick={() => setOpen(true)} className="z-20">
          <Menu className="w-6 h-6" />
        </button>

        {/* CENTER - FIXED CENTER LOGO */}
        <Link
          href="/"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <Image
            src="/images/logo.svg"
            alt="Logo"
            width={40}
            height={40}
            className="object-contain"
          />
        </Link>

        {/* RIGHT ICONS */}
        <div className="flex gap-4 items-center ml-auto z-20">
          <SearchModal />

          <div className="relative">
            <RentalCartView />
          </div>
        </div>
      </div>

      {/* ---------------- MOBILE MENU OVERLAY ---------------- */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-50 flex flex-col px-4 py-4"
          >
            {/* Top Row */}
            <div className="relative flex items-center justify-center">
              {/* Close Button (Left) */}
              <button
                onClick={() => setOpen(false)}
                className="absolute left-0 top-1/2 -translate-y-1/2"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Center Logo */}
              <Image
                src="/images/logo.svg"
                alt="Logo"
                width={40}
                height={40}
                className="object-contain"
              />

              {/* Bag Icon (Right) */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2">
                <div className="relative">
                  <RentalCartView />
                </div>
              </div>
            </div>

            {/* Slide Down Body */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="mt-10 flex flex-col gap-6 text-lg"
            >
              <Link href="/" onClick={() => setOpen(false)}>
                <Paragraph1>Home</Paragraph1>
              </Link>
              <button
                className=" flex  "
                onClick={() => setIsShopMenuOpen(true)}
              >
                <Paragraph1>Shop</Paragraph1>
              </button>
              <ShopDropdownMobile
                isOpen={isShopMenuOpen}
                onClose={() => {
                  setIsShopMenuOpen(false);
                  setOpen(false);
                }}
              />
              <Link href="/style-spotlight" onClick={() => setOpen(false)}>
                <Paragraph1>Style Spotlight</Paragraph1>
              </Link>
              <Link href="/how-it-works" onClick={() => setOpen(false)}>
                <Paragraph1>How it works</Paragraph1>
              </Link>
              <Link href="/about" onClick={() => setOpen(false)}>
                <Paragraph1>About</Paragraph1>
              </Link>
              <Link href="/contact-us" onClick={() => setOpen(false)}>
                <Paragraph1>Contact</Paragraph1>
              </Link>
              <Link href="/renters/favorites" onClick={() => setOpen(false)}>
                <div className="flex items-center space-x-2">
                  <Paragraph1>Favourites</Paragraph1>
                  <span className="text-sm">({favoriteCount})</span>
                </div>
              </Link>
              <div className="mt- flex flex-col gap-3">
                <MobileAuthActions onClose={() => setOpen(false)} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
