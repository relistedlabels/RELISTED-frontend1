// ENDPOINTS: GET /api/public/users/:userId/products, GET /api/public/users/:userId/reviews, GET /api/public/users/:userId

"use client";

import React, { useState } from "react";
import { Paragraph1, ParagraphLink1 } from "@/common/ui/Text";
import NewListingsSection from "./NewListingsSection";
import { motion, AnimatePresence } from "framer-motion";
import DetailedReview from "./DetailedReview";
import CuratorAboutDetails from "./CuratorAboutDetails";

type TabKey = "items" | "reviews" | "about";

interface Tab {
  key: TabKey;
  label: string;
}

interface ProfileTabsProps {
  userId: string;
}

const TABS: Tab[] = [
  { key: "items", label: "Items" },
  { key: "reviews", label: "Reviews" },
  { key: "about", label: "About" },
];

const ProfileTabs: React.FC<ProfileTabsProps> = ({ userId }) => {
  const [activeTab, setActiveTab] = useState<TabKey>("items");

  const contentMap: Record<TabKey, React.ReactNode> = {
    items: <NewListingsSection userId={userId} />,
    reviews: <DetailedReview userId={userId} />,
    about: <CuratorAboutDetails userId={userId} />,
  };

  return (
    <div className="font-sans">
      {/* Tab Navigation Bar */}
      <div className="bg-white rounded-lg w-fit border border-gray-200 overflow-hidden">
        <div className="flex space-x-0">
          {TABS.map((tab) => {
            const isActive = tab.key === activeTab;

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-3 px-6 text-center text-sm font-semibold transition duration-150 ${
                  isActive
                    ? "bg-black text-white"
                    : "text-gray-700 hover:text-gray-900"
                }`}
              >
                <ParagraphLink1>{tab.label}</ParagraphLink1>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content Area */}
      <div className="mt-6 min-h-[300px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab} // Re-animate whenever activeTab changes
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            {contentMap[activeTab]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProfileTabs;
