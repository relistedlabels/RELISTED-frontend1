"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BarChart3,
  ShoppingBag,
  Wallet,
  AlertCircle,
  CreditCard,
  Heart,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Paragraph1, Paragraph2, Paragraph3 } from "@/common/ui/Text";
import UserProfileOverview from "./components/UserProfileOverview";
import UserRecords from "./components/UserRecords";
import UserWallet from "./components/UserWallet";
import UserDisputes from "./components/UserDisputes";
import SavedItems from "./components/SavedItems";

interface UserDetailPageProps {
  params: {
    id: string;
  };
}

// Demo user data
const DEMO_USER = {
  id: "user_001",
  name: "Chioma Adeyemi",
  status: "Active",
  avatar: "https://i.pravatar.cc/150?img=5",
  walletBalance: "₦125,000",
  totalRentals: 47,
  activeDisputes: 1,
  joinDate: "Oct 2024",
  email: "chioma.adeyemi@example.com",
  phone: "+234 812 345 6789",
  kyc: {
    status: "Verified",
    fullName: "Aba Victor Mazi, Ladi Phone",
    nin: "22345678901",
    dateOfBirth: "August 2023",
    id: "22345678901",
    bvn: "2275-5012-7282",
  },
  emergencyContact: {
    fullName: "Gumil Nkqapert",
    relationship: "Brother",
    phone: "+234 812 345 6789",
    address: "9 Banana Street Road, Hvy. Lagos",
  },
};

const TABS = [
  { id: "summary", label: "Summary", icon: BarChart3 },
  { id: "rentals", label: "Rentals", icon: ShoppingBag },
  { id: "wallet", label: "Wallet", icon: Wallet },
  { id: "disputes", label: "Disputes", icon: AlertCircle },
  { id: "transactions", label: "Favorites", icon: Heart },
];

export default function UserDetailPage({ params }: UserDetailPageProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("summary");
  const [direction, setDirection] = useState(0);

  const handleTabChange = (tabId: string) => {
    const currentIndex = TABS.findIndex((t) => t.id === activeTab);
    const newIndex = TABS.findIndex((t) => t.id === tabId);
    setDirection(newIndex > currentIndex ? 1 : -1);
    setActiveTab(tabId);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "summary":
        return <UserProfileOverview user={DEMO_USER} />;
      case "rentals":
        return <UserRecords user={DEMO_USER} />;
      case "wallet":
        return <UserWallet user={DEMO_USER} />;
      case "disputes":
        return <UserDisputes user={DEMO_USER} />;
      case "transactions":
        return <SavedItems user={DEMO_USER} />;
      default:
        return <UserProfileOverview user={DEMO_USER} />;
    }
  };

  return (
    <div className="min-h-screen ">
      <div className="">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-6 border-b border-gray-200 pb-6">
          <div className="flex items-center gap-4 flex-1">
            <div className="flex items-center gap-4">
              <img
                src={DEMO_USER.avatar}
                alt={DEMO_USER.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <Paragraph2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                  {DEMO_USER.name}
                </Paragraph2>
                <Paragraph1 className="text-xs text-gray-500">
                  Joined {DEMO_USER.joinDate}
                </Paragraph1>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-medium">
              {DEMO_USER.status}
            </span>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm">
              Suspend
            </button>
            <button
              onClick={() => router.back()}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="ba border-b border-gray-200">
          <div className="flex">
            {TABS.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`px-6 py-4 transition-all duration-300 flex items-center gap-2 ${
                    activeTab === tab.id
                      ? "text-black border-b-4 border-black"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <IconComponent size={18} />
                  <Paragraph1 className="font-medium">{tab.label}</Paragraph1>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: direction * 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -100 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="py-6"
        >
          {renderTabContent()}
        </motion.div>
      </div>
    </div>
  );
}
