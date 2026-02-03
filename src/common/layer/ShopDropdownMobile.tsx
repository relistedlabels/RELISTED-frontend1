"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronRight, X } from "lucide-react";
import { ParagraphLink1, Paragraph1 } from "../ui/Text";
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
  {
    name: "Kids",
    subMenu: null,
    filter: { key: "gender", value: "Kids" },
    title: "Kids",
    description: "Shop kids' collections",
  },
  {
    name: "Sale",
    subMenu: null,
    title: "Sale",
    description: "Browse our sale items",
  },
];

interface ShopDropdownMobileProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShopDropdownMobile: React.FC<ShopDropdownMobileProps> = ({
  isOpen,
  onClose,
}) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const handleCategoryClick = (categoryName: string, hasSubMenu: boolean) => {
    if (hasSubMenu) {
      setExpandedCategory(
        expandedCategory === categoryName ? null : categoryName,
      );
    } else {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-black"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="fixed top-0 left-0 h-screen w-full sm:w-80 bg-black shadow-2xl overflow-y-auto"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <Paragraph1 className="font-bold">Shop</Paragraph1>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-900 rounded"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Navigation Items */}
            <nav className="py-2">
              {/* Main Shop Link */}
              <Link
                href="/shop?title=Shop&description=Browse+all+collections"
                onClick={onClose}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-900 border-b"
              >
                <ParagraphLink1>All Products</ParagraphLink1>
              </Link>

              {/* Category Links */}
              {NAV_LINKS.map((item) => {
                const isExpanded = expandedCategory === item.name;
                const hasSubMenu = item.subMenu && item.subMenu.length > 0;

                let href = "/shop";
                if (item.title && item.description) {
                  href = buildShopUrl(
                    item.title,
                    item.description,
                    item.filter,
                  );
                }

                return (
                  <div key={item.name}>
                    <div
                      className="flex items-center justify-between px-4 py-3 hover:bg-gray-900 border-b cursor-pointer"
                      onClick={() =>
                        handleCategoryClick(item.name, !!hasSubMenu)
                      }
                    >
                      <Link href={href} onClick={onClose} className="flex-1">
                        <ParagraphLink1>{item.name}</ParagraphLink1>
                      </Link>
                      {hasSubMenu && (
                        <ChevronRight
                          size={18}
                          className={`transition-transform ${isExpanded ? "rotate-90" : ""}`}
                        />
                      )}
                    </div>

                    {/* Submenu Items */}
                    <AnimatePresence>
                      {hasSubMenu && isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden bg-gray-50"
                        >
                          {item.subMenu!.map((subItem) => {
                            const subUrl = buildShopUrl(
                              subItem,
                              `Shop ${subItem} collection`,
                              {
                                key: "brands",
                                value: subItem,
                              },
                            );
                            return (
                              <Link
                                key={subItem}
                                href={subUrl}
                                onClick={onClose}
                                className="flex items-center px-8 py-3 hover:bg-gray-100 text-sm"
                              >
                                <ParagraphLink1>{subItem}</ParagraphLink1>
                              </Link>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </nav>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ShopDropdownMobile;
