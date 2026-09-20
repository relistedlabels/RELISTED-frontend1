"use client";

import { useEffect, useMemo, useState, type ComponentType } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, LogOut, Menu, X } from "lucide-react";
import NavbarNotificationBell from "@/components/notifications/NavbarNotificationBell";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header1Plus, Paragraph1 } from "../ui/Text";
import SearchModal from "./SearchModal";
import LogoutConfirmModal from "./LogoutConfirmModal";
import { useMobileMenuStore } from "@/store/useMobileMenuStore";
import { useMe } from "@/lib/queries/auth/useMe";
import { useLogout } from "@/lib/mutations";
import {
  getMyRelistedNavItems,
  HELP_NAV_ITEMS,
  LIST_NAV_ITEMS,
  SHOP_NAV_ITEMS,
  type SiteNavItem,
} from "@/lib/nav/siteNavItems";

type MobileNavLinkProps = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  onNavigate: () => void;
  labelClassName?: string;
  iconClassName?: string;
  showChevron?: boolean;
};

function MobileNavLink({
  href,
  label,
  icon: Icon,
  onNavigate,
  labelClassName = "text-white",
  iconClassName = "text-gray-400",
  showChevron = true,
}: MobileNavLinkProps) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="flex items-center gap-3 rounded-lg px-1 py-2.5 transition-colors hover:bg-white/5"
    >
      <Icon className={`h-5 w-5 shrink-0 ${iconClassName}`} aria-hidden />
      <Paragraph1 className={`flex-1 text-base ${labelClassName}`}>
        {label}
      </Paragraph1>
      {showChevron ? (
        <ChevronRight className="h-4 w-4 shrink-0 text-gray-500" aria-hidden />
      ) : null}
    </Link>
  );
}

function MobileNavSection({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      {title ? (
        <p className="px-1 pb-1 text-[11px] font-medium uppercase tracking-[0.14em] text-gray-500">
          {title}
        </p>
      ) : null}
      {children}
    </div>
  );
}

function renderNavItems(items: SiteNavItem[], onNavigate: () => void) {
  return items.map((item) => (
    <MobileNavLink
      key={`${item.label}-${item.href}`}
      href={item.href}
      label={item.label}
      icon={item.icon}
      onNavigate={onNavigate}
    />
  ));
}

function MobileNavbarContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const open = useMobileMenuStore((state) => state.isOpen);
  const openMenu = useMobileMenuStore((state) => state.openMenu);
  const closeMenu = useMobileMenuStore((state) => state.closeMenu);
  const { data: user, isLoading } = useMe();
  const logout = useLogout();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [signInRedirectUrl, setSignInRedirectUrl] = useState(pathname);

  const isLister = user?.role?.toLowerCase() === "lister";
  const myRelistedItems = useMemo(
    () =>
      getMyRelistedNavItems({
        isLoggedIn: Boolean(user),
        isLister,
      }),
    [user, isLister],
  );

  useEffect(() => {
    closeMenu();
  }, [pathname, closeMenu]);

  useEffect(() => {
    const qs = searchParams.toString();
    setSignInRedirectUrl(qs ? `${pathname}?${qs}` : pathname);
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const handleLogoutConfirm = () => {
    setShowLogoutConfirm(false);
    closeMenu();
    logout.mutate(undefined, {
      onSuccess: () => {
        router.replace("/auth/sign-in");
      },
    });
  };

  return (
    <div className="xl:hidden w-full bg-black px-4 py-5 text-white">
      <div className="relative flex items-center">
        <button onClick={openMenu} className="z-20" aria-label="Open menu">
          <Menu className="h-6 w-6" />
        </button>

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

        <div className="z-20 ml-auto flex items-center gap-3">
          <SearchModal />
          <NavbarNotificationBell />
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex"
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="flex h-full w-[min(88vw,340px)] max-w-[340px] flex-col bg-black shadow-2xl"
            >
              <div className="relative flex shrink-0 items-center justify-center px-4 py-4">
                <button
                  onClick={closeMenu}
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6" />
                </button>

                <div className="flex flex-col items-center gap-1 px-8 text-center">
                  <Header1Plus className="text-[24px] leading-none tracking-[0.08em]">
                    RELISTED
                  </Header1Plus>
                  <p className="text-[8px] uppercase tracking-[0.16em] text-gray-400">
                    A more sustainable way to indulge
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))]">
                <div className="flex flex-col gap-6 py-2">
                  <MobileNavSection>
                    {renderNavItems(SHOP_NAV_ITEMS, closeMenu)}
                  </MobileNavSection>

                  <div className="border-t border-gray-800" />

                  <MobileNavSection title="List">
                    {renderNavItems(LIST_NAV_ITEMS, closeMenu)}
                  </MobileNavSection>

                  <div className="border-t border-gray-800" />

                  <MobileNavSection title="My Relisted">
                    {renderNavItems(myRelistedItems, closeMenu)}
                  </MobileNavSection>

                  <div className="border-t border-gray-800" />

                  <MobileNavSection title="Help">
                    {renderNavItems(HELP_NAV_ITEMS, closeMenu)}
                  </MobileNavSection>

                  <div className="border-t border-gray-800 pt-2">
                    {!isLoading && user ? (
                      <button
                        type="button"
                        onClick={() => setShowLogoutConfirm(true)}
                        disabled={logout.isPending}
                        className="flex w-full items-center gap-3 rounded-lg px-1 py-2.5 text-left transition-colors hover:bg-white/5 disabled:opacity-50"
                      >
                        <LogOut className="h-5 w-5 shrink-0 text-red-500" />
                        <Paragraph1 className="text-base text-red-500">
                          {logout.isPending ? "Logging out..." : "Log Out"}
                        </Paragraph1>
                      </button>
                    ) : !isLoading ? (
                      <div className="flex flex-col gap-3 px-1 py-2">
                        <Link
                          href={`/auth/sign-in?redirect=${encodeURIComponent(signInRedirectUrl)}`}
                          onClick={closeMenu}
                        >
                          <button
                            type="button"
                            className="w-full rounded-lg border border-white px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/5"
                          >
                            Sign In
                          </button>
                        </Link>
                        <Link href="/auth/create-account" onClick={closeMenu}>
                          <button
                            type="button"
                            className="w-full rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black transition-colors hover:bg-gray-100"
                          >
                            Sign Up
                          </button>
                        </Link>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </motion.div>

            <button
              type="button"
              className="min-w-0 flex-1 bg-black/50"
              onClick={closeMenu}
              aria-label="Close menu"
            />

            <LogoutConfirmModal
              isOpen={showLogoutConfirm}
              onClose={() => setShowLogoutConfirm(false)}
              onConfirm={handleLogoutConfirm}
              isLoading={logout.isPending}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default function MobileNavbar() {
  return <MobileNavbarContent />;
}
