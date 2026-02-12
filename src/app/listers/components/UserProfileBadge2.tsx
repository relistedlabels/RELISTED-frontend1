"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, User, LayoutDashboard, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useProfile } from "@/lib/queries/user/useProfile";

export function UserProfileBadge2() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: profile } = useProfile();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const name = profile?.user?.name?.trim() || "New user";
  const avatar = null; // avatar URL not yet exposed from profile API

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity focus:outline-none"
      >
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-800 overflow-hidden flex items-center justify-center border border-gray-700">
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-5 h-5 text-gray-400" />
          )}
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          <ChevronDown size={18} />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="absolute right-0 mt-3 w-56 origin-top-right rounded-xl bg-[#241F20] z-50 overflow-hidden"
          >
            <div className="py-2">
              <Link
                href="/shop"
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <ShoppingBag size={18} />
                <span>View the Market</span>
              </Link>
              <Link
                href="/dressers/orders"
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <LayoutDashboard size={18} />
                <span>Renter Dashboard</span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
