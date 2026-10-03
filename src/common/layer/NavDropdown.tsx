"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";
import {
  type ComponentType,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { SiteNavItem } from "@/lib/nav/siteNavItems";
import { useCategories } from "@/lib/queries/category/useCategories";
import { ParagraphLink1 } from "../ui/Text";

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
  const [expandedListingType, setExpandedListingType] = useState<
    "rent" | "resale" | null
  >(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const { data: categories = [] } = useCategories();
  const categoriesForMenu = useMemo(
    () => [...categories].sort((a, b) => a.name.localeCompare(b.name)),
    [categories],
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        setExpandedListingType(null);
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
    closeTimeoutRef.current = setTimeout(() => {
      setOpen(false);
      setExpandedListingType(null);
    }, 120);
  };

  return (
    <nav
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
                const listingType = item.listingType;
                const isListingType = listingType !== undefined;
                const expanded = expandedListingType === listingType;
                const allItemsHref = isListingType
                  ? `/shop?listingType=${listingType === "rent" ? "rental,rent_or_resale" : "resale,rent_or_resale"}`
                  : item.href;
                return (
                  <li key={item.href} className="relative">
                    <div className="flex items-center hover:bg-gray-800/50">
                      {isListingType ? (
                        <button
                          type="button"
                          aria-expanded={expanded}
                          onClick={() =>
                            setExpandedListingType(
                              expanded ? null : (listingType ?? null),
                            )
                          }
                          className="flex min-w-0 flex-1 items-center gap-2 px-4 py-2 text-left"
                        >
                          <ItemIcon className="h-4 w-4 shrink-0 text-gray-400" />
                          <ParagraphLink1>{item.label}</ParagraphLink1>
                        </button>
                      ) : (
                        <Link
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className="flex min-w-0 flex-1 items-center gap-2 px-4 py-2"
                        >
                          <ItemIcon className="h-4 w-4 shrink-0 text-gray-400" />
                          <ParagraphLink1>{item.label}</ParagraphLink1>
                        </Link>
                      )}
                      {isListingType ? (
                        <button
                          type="button"
                          aria-label={`${expanded ? "Collapse" : "Expand"} ${item.label} categories`}
                          aria-expanded={expanded}
                          onClick={() =>
                            setExpandedListingType(
                              expanded ? null : (listingType ?? null),
                            )
                          }
                          className="px-3 py-2 text-gray-400 hover:text-white"
                        >
                          <ChevronRight
                            className={`h-4 w-4 transition-transform ${expanded ? "rotate-90" : ""}`}
                            aria-hidden
                          />
                        </button>
                      ) : null}
                    </div>
                    {isListingType ? (
                      <AnimatePresence>
                        {expanded ? (
                          <motion.ul
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.18 }}
                            className="overflow-hidden bg-white/5"
                          >
                            <li>
                              <Link
                                href={allItemsHref}
                                onClick={() => setOpen(false)}
                                className="block border-b border-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800/60"
                              >
                                View all
                              </Link>
                            </li>
                            {categoriesForMenu.map((category) => {
                              const params = new URLSearchParams();
                              params.set("title", category.name);
                              params.set(
                                "description",
                                `Shop ${category.name}`,
                              );
                              params.set(
                                "listingType",
                                listingType === "rent"
                                  ? "rental,rent_or_resale"
                                  : "resale,rent_or_resale",
                              );
                              params.set("category", category.id);
                              return (
                                <li key={category.id}>
                                  <Link
                                    href={`/shop?${params.toString()}`}
                                    onClick={() => {
                                      setOpen(false);
                                      setExpandedListingType(null);
                                    }}
                                    className="block py-2 pl-10 pr-4 text-sm text-gray-300 transition-colors hover:bg-gray-800/60 hover:text-white"
                                  >
                                    {category.name}
                                  </Link>
                                </li>
                              );
                            })}
                            {categoriesForMenu.length === 0 ? (
                              <li className="px-4 py-2 text-sm text-gray-400">
                                No categories available
                              </li>
                            ) : null}
                          </motion.ul>
                        ) : null}
                      </AnimatePresence>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </nav>
  );
}
