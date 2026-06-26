"use client";

import Link from "next/link";
import { useRef, useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ParagraphLink1, Paragraph1 } from "../ui/Text";
import { usePublicSiteFeatures } from "@/lib/queries/site/useSiteFeatures";
import { useActiveShopSales } from "@/lib/queries/shop/useShopSale";
import { buildSaleShopHref, saleNavLabel } from "@/lib/api/shopSale";
import { VAULT_CLOSET_DROPS_BROWSE_SHOP_HREF } from "@/lib/nav/vaultClosetDropsShop";

function useSalesNavSlot() {
  const { data: siteFeaturesRes } = usePublicSiteFeatures();
  const { data: activeRes } = useActiveShopSales();
  const showSlot =
    siteFeaturesRes?.data?.headerClosetsShopNavEnabled !== false;
  const sales = activeRes?.data ?? [];
  return { showSlot, sales };
}

export function DesktopSalesNavLink() {
  const { showSlot, sales } = useSalesNavSlot();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!showSlot) return null;

  if (sales.length === 0) {
    return (
      <Link href={VAULT_CLOSET_DROPS_BROWSE_SHOP_HREF}>
        <ParagraphLink1>Closets</ParagraphLink1>
      </Link>
    );
  }

  if (sales.length === 1) {
    const sale = sales[0]!;
    return (
      <Link href={buildSaleShopHref(sale)}>
        <ParagraphLink1>{saleNavLabel(sale)}</ParagraphLink1>
      </Link>
    );
  }

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => setOpen(false), 120);
  };

  return (
    <div
      ref={dropdownRef}
      className="relative flex items-center h-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        className="flex items-center gap-1 p-2 hover:text-gray-300 transition-colors"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <ParagraphLink1>Sales</ParagraphLink1>
        <ChevronDown className="w-3 h-3 transition-transform duration-200" />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-1 min-w-[12rem] bg-black/90 backdrop-blur-xl z-40 rounded-md overflow-hidden"
          >
            <ul className="py-1">
              {sales.map((sale) => (
                <li key={sale.id}>
                  <Link
                    href={buildSaleShopHref(sale)}
                    className="block px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    {saleNavLabel(sale)}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

type MobileSalesNavLinkProps = {
  onNavigate?: () => void;
};

export function MobileSalesNavLink({ onNavigate }: MobileSalesNavLinkProps) {
  const { showSlot, sales } = useSalesNavSlot();
  const [open, setOpen] = useState(false);

  if (!showSlot) return null;

  if (sales.length === 0) {
    return (
      <Link href={VAULT_CLOSET_DROPS_BROWSE_SHOP_HREF} onClick={onNavigate}>
        <Paragraph1>Closets</Paragraph1>
      </Link>
    );
  }

  if (sales.length === 1) {
    const sale = sales[0]!;
    return (
      <Link href={buildSaleShopHref(sale)} onClick={onNavigate}>
        <Paragraph1>{saleNavLabel(sale)}</Paragraph1>
      </Link>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        className="flex items-center justify-between w-full text-left"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <Paragraph1>Sales</Paragraph1>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open ? (
        <div className="flex flex-col gap-2 pl-4 border-l border-white/20">
          {sales.map((sale) => (
            <Link
              key={sale.id}
              href={buildSaleShopHref(sale)}
              onClick={onNavigate}
              className="text-sm text-white/90 hover:text-white"
            >
              {saleNavLabel(sale)}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
