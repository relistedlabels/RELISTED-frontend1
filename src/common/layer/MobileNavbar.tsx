"use client";

import { useEffect, type ComponentType } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle,
  Home,
  Menu,
  Package,
  Shirt,
  ShoppingBag,
  ShoppingBagIcon,
  Store,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Paragraph1 } from "../ui/Text";
import RentalCartView from "./RentalCartView";
import SearchModal from "./SearchModal";
import { MobileAuthActions } from "./MobileAuthActions";
import { useCartCountStore } from "@/store/useCartCountStore";
import { useCartItems } from "@/lib/queries/renters/useCartItems";
import { useUserStore } from "@/store/useUserStore";
import { useMobileMenuStore } from "@/store/useMobileMenuStore";
import { MobileSalesNavLink } from "./SalesNavLink";

type MobileNavLinkProps = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  onNavigate: () => void;
};

function MobileNavLink({
  href,
  label,
  icon: Icon,
  onNavigate,
}: MobileNavLinkProps) {
  return (
    <Link href={href} onClick={onNavigate} className="flex items-center gap-3">
      <Icon className="h-5 w-5 shrink-0 text-gray-400" aria-hidden />
      <Paragraph1>{label}</Paragraph1>
    </Link>
  );
}

function MobileNavbarContent() {
  const pathname = usePathname();
  const open = useMobileMenuStore((state) => state.isOpen);
  const openMenu = useMobileMenuStore((state) => state.openMenu);
  const closeMenu = useMobileMenuStore((state) => state.closeMenu);
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

  useEffect(() => {
    closeMenu();
  }, [pathname, closeMenu]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <div className="xl:hidden bg-black text-white px-4 py-5 w-full">
      <div className="relative flex items-center">
        {/* LEFT - Toggle */}
        <button onClick={openMenu} className="z-20" aria-label="Open menu">
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

          <Link href="/shop/cart" className="flex items-center space-x-1">
            <ShoppingBagIcon className="w-6 h-6" aria-hidden />
            <Paragraph1>{cartCount}</Paragraph1>
          </Link>
        </div>
      </div>

      {/* ---------------- MOBILE MENU OVERLAY ---------------- */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col bg-black"
          >
            {/* Top Row */}
            <div className="relative flex shrink-0 items-center justify-center px-4 py-4">
              <button
                onClick={closeMenu}
                className="absolute left-4 top-1/2 -translate-y-1/2"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>

              <Image
                src="/images/logo.svg"
                alt="Logo"
                width={40}
                height={40}
                className="object-contain"
              />

              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <RentalCartView />
              </div>
            </div>

            {/* Scrollable menu body — extra bottom padding clears fixed bottom nav */}
            <motion.div
              initial={{ y: -12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -12, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="flex-1 overflow-y-auto overscroll-contain px-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))]"
            >
              <div className="flex flex-col gap-6 py-4 text-lg">
                <MobileNavLink
                  href="/"
                  label="Home"
                  icon={Home}
                  onNavigate={closeMenu}
                />
                <MobileNavLink
                  href="/shop"
                  label="Shop"
                  icon={Store}
                  onNavigate={closeMenu}
                />
                <MobileNavLink
                  href="/shop?listingType=RENTAL,RENT_OR_RESALE"
                  label="Rent"
                  icon={Shirt}
                  onNavigate={closeMenu}
                />
                <MobileNavLink
                  href="/shop?listingType=RESALE,RENT_OR_RESALE"
                  label="Buy"
                  icon={ShoppingBag}
                  onNavigate={closeMenu}
                />
                <MobileNavLink
                  href="/renters/orders"
                  label="Orders"
                  icon={Package}
                  onNavigate={closeMenu}
                />
                <MobileNavLink
                  href="/how-it-works"
                  label="How it works"
                  icon={HelpCircle}
                  onNavigate={closeMenu}
                />
                <MobileSalesNavLink onNavigate={closeMenu} />
              </div>

              <div className="mt-2 border-t border-gray-800 pt-6">
                <MobileAuthActions onClose={closeMenu} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function MobileNavbar() {
  return <MobileNavbarContent />;
}
