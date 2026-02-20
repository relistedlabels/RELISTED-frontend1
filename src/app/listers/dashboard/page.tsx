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

  // Check if user has profile image on load
  useEffect(() => {
    if (!isLoading && profile) {
      // If no avatar, show profile image modal
      if (!profile.avatarUploadId) {
        setShowProfileImageModal(true);
      }
    }
  }, [profile, isLoading]);

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
    </>
  );
}
