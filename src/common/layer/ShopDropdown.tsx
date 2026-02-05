"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import { ParagraphLink1 } from "../ui/Text";
import { motion, AnimatePresence } from "framer-motion";

// Type for navigation items
type NavItem = {
  name: string;
  subMenu: string[] | null;
  filter?: { key: string; value: string };
  title?: string;
  description?: string;
};

// Helper function to build shop URL with filters
const buildShopUrl = (
  title: string,
  description: string,
  filter?: { key: string; value: string },
) => {
  const params = new URLSearchParams();
  params.set("title", title);
  params.set("description", description);
  if (filter) {
    params.append(filter.key, filter.value);
  }
  return `/shop?${params.toString()}`;
};

const NAV_LINKS: NavItem[] = [
  {
    name: "Brands",
    subMenu: ["Nike", "Adidas", "Puma", "Vans", "New Balance"],
  },
  {
    name: "Men",
    subMenu: null,
    filter: { key: "gender", value: "Men" },
    title: "Men",
    description: "Shop men's collections",
  },
  {
    name: "Women",
    subMenu: null,
    filter: { key: "gender", value: "Woman" },
    title: "Women",
    description: "Shop women's collections",
  },
  // {
  //   name: "Kids",
  //   subMenu: null,
  //   filter: { key: "gender", value: "Kids" },
  //   title: "Kids",
  //   description: "Shop kids' collections",
  // },
  {
    name: "Sale",
    subMenu: null,
    title: "Sale",
    description: "Browse our sale items",
  },
];

const ShopDropdown: React.FC = () => {
  const [isShopModalOpen, setIsShopModalOpen] = useState(false);
  const [expandedBrand, setExpandedBrand] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const shopDropdownTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const brandsSubmenuTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsShopModalOpen(false);
        setExpandedBrand(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMouseEnter = () => {
    if (shopDropdownTimeoutRef.current)
      clearTimeout(shopDropdownTimeoutRef.current);
    setIsShopModalOpen(true);
  };

  const handleMouseLeave = () => {
    shopDropdownTimeoutRef.current = setTimeout(() => {
      setIsShopModalOpen(false);
      setExpandedBrand(false);
    }, 120);
  };

  const handleBrandsEnter = () => {
    if (brandsSubmenuTimeoutRef.current)
      clearTimeout(brandsSubmenuTimeoutRef.current);
    setExpandedBrand(true);
  };

  const handleBrandsLeave = () => {
    brandsSubmenuTimeoutRef.current = setTimeout(() => {
      setExpandedBrand(false);
    }, 120);
  };

  return (
    <div
      ref={dropdownRef}
      className="relative h-full flex items-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* MAIN SHOP BUTTON */}
      <Link
        href="/shop?title=Shop&description=Browse+all+collections"
        className="flex items-center gap-1 p-2 hover:text-gray-300 transition-colors"
      >
        <ParagraphLink1>Shop</ParagraphLink1>
        <ChevronDown className="w-3 h-3 transition-transform duration-200" />
      </Link>

      {/* MAIN SHOP DROPDOWN */}
      <AnimatePresence>
        {isShopModalOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-1 w-48 bg-black/90 backdrop-blur-xl z-20 rounded-md overflow-hidden"
          >
            <ul className="py-1">
              {NAV_LINKS.map((item) => {
                const href =
                  item.title && item.description
                    ? buildShopUrl(item.title, item.description, item.filter)
                    : "/shop";
                const isBrands = item.name === "Brands";

                return (
                  <li
                    key={item.name}
                    className="relative"
                    onMouseEnter={isBrands ? handleBrandsEnter : undefined}
                    onMouseLeave={isBrands ? handleBrandsLeave : undefined}
                  >
                    <Link
                      href={href}
                      className="flex justify-between items-center px-4 py-2 hover:bg-gray-800/50 transition-colors"
                    >
                      <ParagraphLink1>{item.name}</ParagraphLink1>
                      {item.subMenu && (
                        <ChevronRight
                          className="w-4 h-4 transition-transform"
                          style={{
                            transform:
                              expandedBrand && isBrands
                                ? "rotate(90deg)"
                                : "rotate(0deg)",
                          }}
                        />
                      )}
                    </Link>

                    {/* BRANDS SUBMENU */}
                    <AnimatePresence>
                      {isBrands && expandedBrand && item.subMenu && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-0 left-full ml-2 w-44 bg-black z-30 rounded-md overflow-hidden shadow-lg"
                        >
                          <ul className="py-1">
                            {item.subMenu.map((brand, index) => {
                              const brandUrl = buildShopUrl(
                                brand,
                                `Shop ${brand} collection`,
                                {
                                  key: "brands",
                                  value: brand,
                                },
                              );
                              return (
                                <motion.li
                                  key={brand}
                                  initial={{ opacity: 0, x: -5 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.03 }}
                                >
                                  <Link
                                    href={brandUrl}
                                    className="block w-full px-4 py-2 text-sm bg-black hover:bg-gray-900 transition-colors"
                                  >
                                    <ParagraphLink1>{brand}</ParagraphLink1>
                                  </Link>
                                </motion.li>
                              );
                            })}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShopDropdown;
