"use client";
// ENDPOINTS: GET /api/listers/wallet/transactions (list with pagination & filters)

import React from "react";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { motion, Variants } from "framer-motion";

interface Transaction {
  id: string;
  description: "Withdrawal" | "Rental Fee";
  type: "Debit" | "Credit";
  date: string;
  amount: string;
  status: "Completed" | "Successful";
}

const transactionData: Transaction[] = [
  {
    id: "345GFDVR4346764",
    description: "Withdrawal",
    type: "Debit",
    date: "Oct 19, 2025",
    amount: "₦550,000",
    status: "Completed",
  },
  {
    id: "345GFDVR4346764",
    description: "Rental Fee",
    type: "Credit",
    date: "Oct 19, 2025",
    amount: "+₦550,000",
    status: "Successful",
  },
  {
    id: "345GFDVR4346764",
    description: "Withdrawal",
    type: "Debit",
    date: "Oct 19, 2025",
    amount: "₦550,000",
    status: "Completed",
  },
];

// --- Fixed Animation Variants ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut", // TypeScript now accepts this because of the Variants type
    },
  },
};

const TransactionList: React.FC = () => {
  return (
    <div className="w-full mt-10">
      <Paragraph3 className="font-bold text-black mb-4 uppercase">
        All Transactions
      </Paragraph3>

      <motion.div
        className="space-y-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {transactionData.map((tx, index) => (
          <motion.div
            key={`${tx.id}-${index}`} // Combined key for uniqueness
            variants={itemVariants}
            whileHover={{ scale: 1.005, borderColor: "rgb(156 163 175)" }} // Fixed hover color to a tailwind-like gray
            className="w-full bg-white border border-gray-300 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-0 transition-colors duration-200 cursor-default"
          >
            {/* 1. ID & Description */}
            <div className="flex flex-row md:contents justify-between items-start">
              <div className="flex flex-col min-w-[140px]">
                <Paragraph1 className="text-[10px] font-bold text-gray-400 uppercase">
                  ID
                </Paragraph1>
                <Paragraph1 className="text-xs font-bold text-black truncate max-w-[120px] md:max-w-none">
                  {tx.id}
                </Paragraph1>
              </div>

              <div className="flex flex-col md:min-w-[140px]">
                <Paragraph1 className="text-[10px] font-bold text-gray-400 uppercase">
                  Description
                </Paragraph1>
                <Paragraph1 className="text-sm font-bold text-black">
                  {tx.description}
                </Paragraph1>
              </div>
            </div>

            {/* 2. Type & Date */}
            <div className="flex flex-row md:contents justify-between items-center border-t border-gray-50 pt-4 md:pt-0 md:border-0">
              <div className="flex flex-col md:min-w-[100px]">
                <Paragraph1 className="text-[10px] font-bold text-gray-400 uppercase">
                  Type
                </Paragraph1>
                <div
                  className={`flex items-center text-sm font-bold ${
                    tx.type === "Debit" ? "text-[#FF5C5C]" : "text-[#1DB954]"
                  }`}
                >
                  <Paragraph1>{tx.type}</Paragraph1>
                  {tx.type === "Debit" ? (
                    <ArrowUpRight className="w-3 h-3 ml-1" />
                  ) : (
                    <ArrowDownLeft className="w-3 h-3 ml-1" />
                  )}
                </div>
              </div>

              <div className="flex flex-col md:min-w-[120px]">
                <Paragraph1 className="text-[10px] font-bold text-gray-400 uppercase">
                  Date
                </Paragraph1>
                <Paragraph1 className="text-sm font-bold text-black">
                  {tx.date}
                </Paragraph1>
              </div>
            </div>

            {/* 3. Amount & Status */}
            <div className="flex flex-row md:contents justify-between items-center border-t border-gray-50 pt-4 md:pt-0 md:border-0">
              <div className="flex flex-col md:min-w-[120px]">
                <Paragraph1 className="text-[10px] font-bold text-gray-400 uppercase">
                  Amount
                </Paragraph1>
                <Paragraph1
                  className={`text-sm font-bold ${
                    tx.type === "Credit" ? "text-[#1DB954]" : "text-black"
                  }`}
                >
                  {tx.amount}
                </Paragraph1>
              </div>

              <div className="flex items-center justify-end">
                <div className="px-4 py-1.5 bg-[#E8F8F0] text-[#1DB954] text-[10px] font-bold rounded-lg uppercase tracking-wider">
                  {tx.status}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default TransactionList;
