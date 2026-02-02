"use client";

import { useState } from "react";
import { Banknote, ChevronDown } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import { motion, AnimatePresence } from "framer-motion";

interface BankSelectProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * Licensed commercial & major banks in Nigeria (CBN-recognized)
 */
const NIGERIAN_BANKS = [
  "Access Bank",
  "Citibank Nigeria",
  "Ecobank Nigeria",
  "Fidelity Bank",
  "First Bank of Nigeria",
  "First City Monument Bank (FCMB)",
  "Globus Bank",
  "Guaranty Trust Bank (GTBank)",
  "Heritage Bank",
  "Keystone Bank",
  "Parallex Bank",
  "Polaris Bank",
  "PremiumTrust Bank",
  "Providus Bank",
  "Stanbic IBTC Bank",
  "Standard Chartered Bank Nigeria",
  "Sterling Bank",
  "SunTrust Bank",
  "Titan Trust Bank",
  "Union Bank of Nigeria",
  "United Bank for Africa (UBA)",
  "Unity Bank",
  "Wema Bank",
  "Zenith Bank",
];

export function BankSelect({ value, onChange }: BankSelectProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <label className="block mb-2">
        <Paragraph1 className="text-sm font-medium text-gray-800">
          Bank Name
        </Paragraph1>
      </label>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full p-4 pl-12 pr-10 border border-gray-300 rounded-lg bg-white text-left text-gray-600 focus:ring-2 focus:ring-black focus:border-black relative"
      >
        <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        {value || "Select Bank"}
        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-72 overflow-y-auto"
          >
            {NIGERIAN_BANKS.map((bank) => (
              <li
                key={bank}
                onClick={() => {
                  onChange(bank);
                  setOpen(false);
                }}
                className="px-4 py-3 cursor-pointer text-gray-700 hover:bg-gray-100"
              >
                {bank}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
