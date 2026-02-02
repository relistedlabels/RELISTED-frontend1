"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import { ParagraphLink1 } from "../ui/Text";

// Type for navigation items
type NavItem = {
  name: string;
  subMenu: string[] | null;
};

const NAV_LINKS: NavItem[] = [
  {
    name: "Brands",
    subMenu: ["Nike", "Adidas", "Puma", "Vans", "New Balance"],
  },
  { name: "Men", subMenu: null },
  { name: "Women", subMenu: null },
  { name: "Kids", subMenu: null },
  { name: "Sale", subMenu: null },
];

const ShopDropdown: React.FC = () => {
  const [isShopModalOpen, setIsShopModalOpen] = useState(false);
  const [isBrandsModalOpen, setIsBrandsModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsShopModalOpen(false);
        setIsBrandsModalOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMouseEnter = () => setIsShopModalOpen(true);
  const handleMouseLeave = () => {
    setTimeout(() => {
      if (!isBrandsModalOpen) setIsShopModalOpen(false);
    }, 120);
  };

  const handleBrandsEnter = () => setIsBrandsModalOpen(true);
  const handleBrandsLeave = () => {
    setTimeout(() => {
      setIsBrandsModalOpen(false);
      if (!isShopModalOpen) setIsShopModalOpen(false);
    }, 120);
  };

  const handleNavLinkClick = () => {
    setIsShopModalOpen(false);
    setIsBrandsModalOpen(false);
  };

  return (
    <div
      ref={dropdownRef}
      className="relative h-full flex items-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* MAIN SHOP BUTTON */}
      <Link href="/shop" className="flex items-center gap-1 p-2">
        <ParagraphLink1>Shop</ParagraphLink1>
        <ChevronDown className="w-3 h-3 transition-transform duration-200" />
      </Link>

      {/* MAIN SHOP DROPDOWN */}
      {isShopModalOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-black/90 backdrop-blur-xl z-20">
          <ul className="py-1">
            {NAV_LINKS.map((item) => (
              <li
                key={item.name}
                className="relative"
                onMouseEnter={item.subMenu ? handleBrandsEnter : undefined}
                onMouseLeave={item.subMenu ? handleBrandsLeave : undefined}
              >
                <Link
                  href="/shop"
                  onClick={handleNavLinkClick}
                  className="flex justify-between items-center px-4 py-2 hover:bg-gray-900"
                >
                  <ParagraphLink1>{item.name}</ParagraphLink1>
                  {item.subMenu && <ChevronRight className="w-4 h-4" />}
                </Link>

                {/* BRANDS SUBMENU */}
                {item.subMenu &&
                  isBrandsModalOpen &&
                  item.name === "Brands" && (
                    <div className="absolute top-0 left-full ml-1 w-40 bg-black/90 backdrop-blur-md z-30">
                      <ul className="py-1">
                        {item.subMenu.map((brand) => (
                          <li key={brand}>
                            <Link
                              href="/shop"
                              onClick={handleNavLinkClick}
                              className="block px-4 py-2 text-sm hover:bg-gray-900"
                            >
                              <ParagraphLink1>{brand}</ParagraphLink1>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ShopDropdown;
