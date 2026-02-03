"use client";

import { useState } from "react";
import { Users, ChevronDown } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import { motion, AnimatePresence } from "framer-motion";

interface RelationshipSelectProps {
  value: string;
  onChange: (value: string) => void;
}

const RELATIONSHIPS = ["Spouse", "Parent", "Sibling", "Friend", "Other"];

export function RelationshipSelect({
  value,
  onChange,
}: RelationshipSelectProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <label className="block mb-2">
        <Paragraph1 className="text-sm font-medium text-gray-800">
          Relationship
        </Paragraph1>
      </label>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full p-4 pl-12 pr-10 border border-gray-300 rounded-lg bg-white text-left text-gray-600 focus:ring-2 focus:ring-black focus:border-black relative"
      >
        <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        {value || "Select Relationship"}
        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
          >
            {RELATIONSHIPS.map((item) => (
              <li
                key={item}
                onClick={() => {
                  onChange(item);
                  setOpen(false);
                }}
                className="px-4 py-3 cursor-pointer text-gray-700 hover:bg-gray-100"
              >
                {item}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
