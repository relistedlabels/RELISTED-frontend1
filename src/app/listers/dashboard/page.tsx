"use client";
// ENDPOINTS: GET /api/listers/stats, GET /api/listers/rentals/overtime, GET /api/listers/inventory/top-items, GET /api/listers/rentals/recent

import { motion, Variants } from "framer-motion";
import DashboardLayout from "../components/DashboardLayout";
import DashboardStatsRow from "../components/DashboardStatsRow";
import RecentRentalsList from "../components/RecentRentalsList";
import RentalsOvertimeChart from "../components/RentalsOvertimeChart";
import TopRentalsList from "../components/TopRentalsList";

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
  return (
    <DashboardLayout>
      <motion.div variants={containerVariants} initial="hidden" animate="show">
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
  );
}
