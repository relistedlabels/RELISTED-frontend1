"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { ParagraphLink1 } from "@/common/ui/Text";
import { HelpTourButton } from "./HelpTourButton";
import type { SiteNavItem } from "@/lib/nav/siteNavItems";

type HelpDropdownProps = {
  items: SiteNavItem[];
};

export default function HelpDropdown({ items }: HelpDropdownProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

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
      className="relative flex h-full items-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        className="flex items-center gap-1.5 p-2 transition-colors hover:text-gray-300"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <HelpCircle className="h-5 w-5 shrink-0" aria-hidden />
        <ParagraphLink1>Help</ParagraphLink1>
        <ChevronDown className="h-3 w-3 transition-transform duration-200" />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full z-40 mt-1 min-w-[12rem] overflow-hidden rounded-md bg-black/90 backdrop-blur-xl"
          >
            <ul className="py-1">
              {items.map((item) => {
                const ItemIcon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 transition-colors hover:bg-gray-800/50"
                    >
                      <ItemIcon className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
                      <ParagraphLink1>{item.label}</ParagraphLink1>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="border-t border-white/10" />
            <HelpTourButton />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
