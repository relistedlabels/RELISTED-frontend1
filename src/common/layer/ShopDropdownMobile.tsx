"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, X } from "lucide-react";
import { ParagraphLink1, Paragraph1 } from "../ui/Text";
import { motion, AnimatePresence } from "framer-motion";
import { useBrands } from "@/lib/queries/brand/useBrands";
import { useCategories } from "@/lib/queries/category/useCategories";

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
    subMenu: null,
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
  const { data: brandsData } = useBrands();
  const { data: categoriesData = [] } = useCategories();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [navLinks, setNavLinks] = useState<NavItem[]>(NAV_LINKS);
  const [randomCategories, setRandomCategories] = useState<NavItem[]>([]);

  // Select 3 random categories
  useEffect(() => {
    if (categoriesData && categoriesData.length > 0) {
      const shuffled = [...categoriesData].sort(() => 0.5 - Math.random());
      const randomCats = shuffled.slice(0, 3).map((cat: any) => ({
        name: cat.name,
        subMenu: null,
        title: cat.name,
        description: `Shop ${cat.name} collection`,
        filter: { key: "category", value: cat.name },
      }));
      setRandomCategories(randomCats);
    }
  }, [categoriesData]);

  // Update NAV_LINKS when brands data is fetched
  useEffect(() => {
    if (brandsData && brandsData.length > 0) {
      const brandNames = brandsData
        .slice(0, 32)
        .map((brand: any) => brand.name || brand);

      setNavLinks([
        {
          name: "Brands",
          subMenu: brandNames,
        },
        ...randomCategories,
      ]);
    }
  }, [brandsData, randomCategories]);

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
            <div className="flex justify-between items-center p-4 ">
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
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-900 "
              >
                <ParagraphLink1>All Products</ParagraphLink1>
              </Link>

              {/* Category Links */}
              {navLinks.map((item) => {
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
                      className="flex items-center justify-between px-4 py-3 hover:bg-gray-900  cursor-pointer"
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
                          className="overflow-hidden bg-black"
                        >
                          {/* 2-Column Grid with Scrollable Container */}
                          <div className="max-h-58 overflow-y-auto px-4 py-3">
                            <div className="grid grid-cols-2 gap-2">
                              {item.subMenu!.map((subItem, index) => {
                                const subUrl = buildShopUrl(
                                  subItem,
                                  `Shop ${subItem} collection`,
                                  {
                                    key: "brands",
                                    value: subItem,
                                  },
                                );
                                return (
                                  <motion.div
                                    key={`${subItem}-${index}`}
                                    initial={{ opacity: 0, y: -3 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: (index % 4) * 0.02 }}
                                  >
                                    <Link
                                      href={subUrl}
                                      onClick={onClose}
                                      className="block w-full px-2 py-2 text-xs text-center bg-gray-900 hover:bg-gray-700 transition-colors rounded whitespace-nowrap overflow-hidden text-ellipsis"
                                    >
                                      <ParagraphLink1 className="text-xs">
                                        {subItem}
                                      </ParagraphLink1>
                                    </Link>
                                  </motion.div>
                                );
                              })}
                            </div>
                          </div>
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
