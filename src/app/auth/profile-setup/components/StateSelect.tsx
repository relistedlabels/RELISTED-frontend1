"use client";

import { useState } from "react";
import { MapPin, ChevronDown } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import { motion, AnimatePresence } from "framer-motion";

interface StateSelectProps {
  value: string;
  onChange: (value: string) => void;
}

const STATES = [
  "Lagos",
  // "Abuja FCT",
  // "Rivers"
];

export function StateSelect({ value, onChange }: StateSelectProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex-1 relative">
     

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full p-4 pl-12 pr-10 border border-gray-300 rounded-lg bg-white text-left text-gray-600 focus:ring-2 focus:ring-black focus:border-black relative"
      >
        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        {value || "Select State"}
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
            {STATES.map((state) => (
              <li
                key={state}
                onClick={() => {
                  onChange(state);
                  setOpen(false);
                }}
                className="px-4 py-3 cursor-pointer text-gray-700 hover:bg-gray-100"
              >
                {state}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
