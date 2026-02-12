"use client";
// ENDPOINTS: GET /api/listers/wallet/transactions (list with pagination & filters)

import React, { useState } from "react";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { motion, Variants } from "framer-motion";
import { useTransactions } from "@/lib/queries/listers/useTransactions";

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
      ease: "easeOut",
    },
  },
};

const TransactionList: React.FC = () => {
  const [page] = useState(1);
  const [type] = useState<"credit" | "debit" | "all">("all");
  const {
    data: transactionsData,
    isLoading,
    isError,
  } = useTransactions(page, 10, type, "-date");

  const typeColor = (txType: "credit" | "debit") => {
    return txType === "debit" ? "text-[#FF5C5C]" : "text-[#1DB954]";
  };

  const typeIcon = (txType: "credit" | "debit") => {
    return txType === "debit" ? (
      <ArrowUpRight className="w-3 h-3 ml-1" />
    ) : (
      <ArrowDownLeft className="w-3 h-3 ml-1" />
    );
  };

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
        {isLoading || isError ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="w-full bg-white border border-gray-300 rounded-2xl p-4 animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded mb-2" />
              <div className="h-3 bg-gray-100 rounded w-3/4" />
            </div>
          ))
        ) : transactionsData?.data && transactionsData.data.length > 0 ? (
          transactionsData.data.map((tx, index) => (
            <motion.div
              key={`${tx.id}-${index}`}
              variants={itemVariants}
              whileHover={{ scale: 1.005, borderColor: "rgb(156 163 175)" }}
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
                    className={`flex items-center text-sm font-bold ${typeColor(tx.type)}`}
                  >
                    <Paragraph1>
                      {tx.type === "credit" ? "Credit" : "Debit"}
                    </Paragraph1>
                    {typeIcon(tx.type)}
                  </div>
                </div>

                <div className="flex flex-col md:min-w-[120px]">
                  <Paragraph1 className="text-[10px] font-bold text-gray-400 uppercase">
                    Date
                  </Paragraph1>
                  <Paragraph1 className="text-sm font-bold text-black">
                    {new Date(tx.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
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
                      tx.type === "credit" ? "text-[#1DB954]" : "text-black"
                    }`}
                  >
                    {tx.type === "credit" ? "+" : "-"}₦
                    {tx.amount.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Paragraph1>
                </div>

                <div className="flex items-center justify-end">
                  <div className="px-4 py-1.5 bg-[#E8F8F0] text-[#1DB954] text-[10px] font-bold rounded-lg uppercase tracking-wider">
                    {tx.status}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-8">
            <Paragraph1 className="text-gray-500">
              No transactions yet
            </Paragraph1>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default TransactionList;
