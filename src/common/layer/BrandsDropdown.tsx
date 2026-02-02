"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { ParagraphLink1 } from "../ui/Text";

export default function BrandsDropdown() {
  const [open, setOpen] = useState(false);

  const brands = [
    "Gucci",
    "Prada",
    "Louis Vuitton",
    "Off-White",
    "Dior",
    "Balenciaga",
    "Bottega Veneta",
  ];

  return (
    <div
      className="relative group"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {/* Trigger */}
      <button className="flex items-center space-x-1">
        <ParagraphLink1>Brands</ParagraphLink1>
        <ChevronDown className="w-3 h-3" />
      </button>

      {/* Dropdown Modal */}
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="absolute left-0 mt-2 w-48 bg-black shadow-xl p-3 z-50"
        >
          <ul className="space-y-2">
            {brands.map((brand) => (
              <li
                key={brand}
                className="hover:bg-black/20 px-3 py-1 rounded-md cursor-pointer text-sm"
              >
                <ParagraphLink1>{brand}</ParagraphLink1>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  );
}
