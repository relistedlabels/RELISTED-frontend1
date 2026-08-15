"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence, Variants } from "framer-motion";

// Components
import AccountProfileDetails from "./AccountProfileDetails";
import AccountVerificationsForm from "./AccountVerificationsForm";
import AccountNotifications from "./AccountNotifications";
import AccountSecurity from "./AccountSecurity";

type TabKey = "profile" | "verifications" | "notifications" | "security";

interface Tab {
  key: TabKey;
  label: string;
}

const ACCOUNT_TABS: Tab[] = [
  { key: "profile", label: "Profile" },
  { key: "verifications", label: "Verifications" },
  { key: "notifications", label: "Notifications" },
  { key: "security", label: "Security" },
];

const tabContentVariants: Variants = {
  initial: { opacity: 0, y: 10 },
  enter: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

const ProfileContent: React.FC = () => (
  <motion.div
    variants={tabContentVariants}
    initial="initial"
    animate="enter"
    exit="exit"
    className="p-4 bg-white border border-gray-200 rounded-xl min-h-[300px]"
  >
    <AccountProfileDetails />
  </motion.div>
);

const VerificationsContent: React.FC = () => (
  <motion.div
    variants={tabContentVariants}
    initial="initial"
    animate="enter"
    exit="exit"
    className="p-4 bg-white border border-gray-200 rounded-xl min-h-[300px]"
  >
    <AccountVerificationsForm />
  </motion.div>
);

const NotificationsContent: React.FC = () => (
  <motion.div
    variants={tabContentVariants}
    initial="initial"
    animate="enter"
    exit="exit"
    className="p-4 bg-white border border-gray-200 rounded-xl min-h-[300px]"
  >
    <AccountNotifications />
  </motion.div>
);

const SecurityContent: React.FC = () => (
  <motion.div
    variants={tabContentVariants}
    initial="initial"
    animate="enter"
    exit="exit"
    className="p-6 bg-white border border-gray-200 rounded-xl min-h-[300px]"
  >
    <AccountSecurity />
  </motion.div>
);

const AccountTabs: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabKey>("profile");
  const onboardingTask = searchParams.get("onboardingTask");

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ACCOUNT_TABS.some((t) => t.key === tabParam)) {
      setActiveTab(tabParam as TabKey);
    }
  }, [searchParams]);

  const handleTabChange = (tabKey: TabKey) => {
    setActiveTab(tabKey);

    if (onboardingTask) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tabKey);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  };

  const contentMap: Record<TabKey, React.ReactNode> = {
    profile: <ProfileContent key="profile" />,
    verifications: <VerificationsContent key="verifications" />,
    notifications: <NotificationsContent key="notifications" />,
    security: <SecurityContent key="security" />,
  };

  return (
    <div className="font-sans">
      <div className="relative hide-scrollbar mb-6 w-[340px] overflow-hidden sm:w-full overflow-x-auto bg-white border p-1 border-gray-200 rounded-lg">
        <div className="flex justify-between md:justify-between gap-3 md:gap-0 w-max md:w-full px-1 md:px-0 py-1 relative">
          {ACCOUNT_TABS.map((tab) => {
            const isActive = tab.key === activeTab;

            return (
              <button
                key={tab.key}
                type="button"
                data-onboarding-target={
                  tab.key === "verifications"
                    ? "renter-verifications-tab"
                    : undefined
                }
                onClick={() => handleTabChange(tab.key)}
                className={`
                  py-2 px-4 sm:px-6 w-full relative z-10 text-sm font-semibold transition-colors duration-300
                  ${
                    isActive
                      ? "text-white"
                      : "text-gray-500 hover:text-gray-900"
                  }
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="renter-active-tab-indicator"
                    className="absolute inset-0 bg-black rounded-lg -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="pb-10">
        <AnimatePresence mode="wait">{contentMap[activeTab]}</AnimatePresence>
      </div>
    </div>
  );
};

export default AccountTabs;
