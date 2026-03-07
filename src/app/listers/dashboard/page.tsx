"use client";
// ENDPOINTS: GET /api/listers/stats, GET /api/listers/rentals/overtime, GET /api/listers/inventory/top-items, GET /api/listers/rentals/recent

import { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import DashboardLayout from "../components/DashboardLayout";
import DashboardStatsRow from "../components/DashboardStatsRow";
import RecentRentalsList from "../components/RecentRentalsList";
import RentalsOvertimeChart from "../components/RentalsOvertimeChart";
import TopRentalsList from "../components/TopRentalsList";
import ProfileImageUploadModal from "../components/ProfileImageUploadModal";
import FirstListingModal from "../components/FirstListingModal";
import { useProfile } from "@/lib/queries/user/useProfile";
import { useRouter } from "next/navigation";
import { useTopItems } from "@/lib/queries/listers";
import { useRecentRentals } from "@/lib/queries/listers";
import { useDashboardSummary } from "@/lib/queries/renters/useDashboardSummary";

/* ---------- Motion Variants ---------- */

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 16,
      mass: 0.8,
    },
  },
};

/* ---------- Page ---------- */

export default function Page() {
  const router = useRouter();
  const { data: profile, isLoading } = useProfile();
  const [showProfileImageModal, setShowProfileImageModal] = useState(false);
  const [showFirstListingModal, setShowFirstListingModal] = useState(false);

  // Test API calls
  const topItemsQuery = useTopItems(5);
  const recentRentalsQuery = useRecentRentals(1, 10, "all");
  const dashboardSummaryQuery = useDashboardSummary();

  // Check if user has profile image on load
  useEffect(() => {
    if (!isLoading && profile) {
      // If no avatar, show profile image modal
      if (!profile.avatarUploadId) {
        setShowProfileImageModal(true);
      }
    }
  }, [profile, isLoading]);

  // Log API responses to console
  useEffect(() => {
    console.log("=== API TEST RESPONSES ===");
    console.log("Top Items:", topItemsQuery.data);
    console.log("Recent Rentals:", recentRentalsQuery.data);
    console.log("Dashboard Summary:", dashboardSummaryQuery.data);
  }, [topItemsQuery.data, recentRentalsQuery.data, dashboardSummaryQuery.data]);

  const handleProfileImageNext = () => {
    setShowProfileImageModal(false);
    // Show first listing modal after profile image is set
    setShowFirstListingModal(true);
  };

  const handleFirstListingGetStarted = () => {
    setShowFirstListingModal(false);
    // Redirect to product creation page
    router.push("/listers/inventory");
  };

  return (
    <>
      <DashboardLayout>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={itemVariants}>
            <DashboardStatsRow />
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-5 mt-8 gap-4"
          >
            <RentalsOvertimeChart />
            <TopRentalsList />
          </motion.div>

          <motion.div variants={itemVariants} className="mt-8">
            <RecentRentalsList />
          </motion.div>
        </motion.div>
      </DashboardLayout>

      {/* Profile Image Upload Modal */}
      <ProfileImageUploadModal
        isOpen={showProfileImageModal}
        onClose={() => setShowProfileImageModal(false)}
        onNext={handleProfileImageNext}
        profileName="Lister"
      />

      {/* First Listing Modal */}
      <FirstListingModal
        isOpen={showFirstListingModal}
        onClose={() => setShowFirstListingModal(false)}
        onGetStarted={handleFirstListingGetStarted}
      />

      {/* test field */}
      {/* <div className="mt-8 p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50">
        <h3 className="font-semibold mb-4">
          API Test Responses (Check Console & Network Tab)
        </h3>

        <div className="space-y-4 text-sm font-mono">
          <div>
            <h4 className="font-bold mb-2">
              GET /api/listers/inventory/top-items
            </h4>
            <pre className="bg-white p-2 rounded overflow-auto max-h-40 text-xs">
              {JSON.stringify(topItemsQuery.data, null, 2)}
            </pre>
          </div>

          <div>
            <h4 className="font-bold mb-2">GET /api/listers/rentals/recent</h4>
            <pre className="bg-white p-2 rounded overflow-auto max-h-40 text-xs">
              {JSON.stringify(recentRentalsQuery.data, null, 2)}
            </pre>
          </div>

          <div>
            <h4 className="font-bold mb-2">
              GET /api/renters/dashboard/summary
            </h4>
            <pre className="bg-white p-2 rounded overflow-auto max-h-40 text-xs">
              {JSON.stringify(dashboardSummaryQuery.data, null, 2)}
            </pre>
          </div>
        </div>
      </div> */}
    </>
  );
}
