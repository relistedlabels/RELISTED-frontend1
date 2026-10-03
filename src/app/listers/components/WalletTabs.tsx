"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Paragraph1 } from "@/common/ui/Text";
import WithdrawalsList from "@/components/wallet/WithdrawalsList";
import TransactionList from "./TransactionList";

type WalletTab = "transactions" | "withdrawals";

const TABS: { key: WalletTab; label: string }[] = [
  { key: "transactions", label: "Transactions" },
  { key: "withdrawals", label: "Withdrawals" },
];

export default function WalletTabs() {
  const [activeTab, setActiveTab] = useState<WalletTab>("transactions");

  return (
    <div className="w-full">
      <div className="relative mb-2 w-full overflow-hidden">
        <div className="inline-flex gap-1 bg-[#F9F9F7] p-1 border border-gray-300 rounded-xl">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`relative shrink-0 px-6 sm:px-8 py-2.5 text-sm font-bold transition-colors duration-300 z-10 ${
                  isActive ? "text-white" : "text-gray-500 hover:text-black"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeWalletTab"
                    className="z-[-1] absolute inset-0 bg-black rounded-lg"
                    transition={{
                      type: "spring",
                      bounce: 0.2,
                      duration: 0.5,
                    }}
                  />
                )}
                <Paragraph1 className="capitalize">{tab.label}</Paragraph1>
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === "transactions" ? (
        <TransactionList />
      ) : (
        <WithdrawalsList variant="lister" />
      )}
    </div>
  );
}
