"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ComponentType } from "react";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { ParagraphLink1 } from "../ui/Text";
import type { SiteNavItem } from "@/lib/nav/siteNavItems";

type NavDropdownProps = {
  label: string;
  items: SiteNavItem[];
  icon?: ComponentType<{ className?: string }>;
  align?: "left" | "right";
};

export default function NavDropdown({
  label,
  items,
  icon: Icon,
  align = "left",
}: NavDropdownProps) {
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
        {Icon ? <Icon className="h-5 w-5 shrink-0" aria-hidden /> : null}
        <ParagraphLink1>{label}</ParagraphLink1>
        <ChevronDown className="h-3 w-3 transition-transform duration-200" />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className={`absolute top-full z-40 mt-1 min-w-[12rem] overflow-hidden rounded-md bg-black/90 backdrop-blur-xl ${
              align === "right" ? "right-0" : "left-0"
            }`}
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
                      <ItemIcon className="h-4 w-4 shrink-0 text-gray-400" />
                      <ParagraphLink1>{item.label}</ParagraphLink1>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
