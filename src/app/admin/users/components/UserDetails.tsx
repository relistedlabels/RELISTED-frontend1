"use client";

import React, { useState } from "react";
import {
  SlidersVertical,
  X,
  Search,
  ChevronLeft,
  ArrowLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Paragraph1, Paragraph2 } from "@/common/ui/Text";
import Button from "@/common/ui/Button";
import WalletTopUpForm from "@/app/shop/cart/checkout/components/WalletTopUpForm";
import { FaPlus } from "react-icons/fa";
import { HiOutlineArrowDownRight } from "react-icons/hi2";
import UserDetailsCard from "./UserDetailsCard";
import SuspendUserButton from "./SuspendUserButton";

// --------------------
// Slide-in Filter Panel
// --------------------
interface UserDetailsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserDetailsPanel: React.FC<UserDetailsPanelProps> = ({
  isOpen,
  onClose,
}) => {
  const minPrice = 50000;
  const maxPrice = 200000;

  const variants = {
    hidden: { x: "100%" },
    visible: { x: 0 },
  };

  const ExampleData = {
    rentalDays: 3,
    rentalFeePerPeriod: 165000,
    securityDeposit: 15000,
    cleaningFee: 10000,
  };

  const user = {
    id: "user_001",
    name: "John Doe",
    role: "Renter",
    status: "Active",
    avatar: "https://i.pravatar.cc/150?img=3",
    email: "john.doe@example.com",
    phone: "+234 812 345 6789",
    joinDate: "Jan 12, 2024",
    walletBalance: "₦45,000",
    totalRentals: 12,
    disputesRaised: 1,
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-99 bg-black/70 backdrop--blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="fixed top-0 right-0 h-screen hide-scrollbar overflow-y-auto bg-white shadow-2xl px-4  flex flex-col w-full sm:w-114"
            role="dialog"
            aria-modal="true"
            aria-label="Product UserDetails"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={variants}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between sticky top-0 items-center pb-4 border-b border-gray-100 pt-6 z-10  bg-white">
              <button
                onClick={onClose}
                className="text-gray-500 xl:hidden hover:text-black p-1 rounded-full transition"
                aria-label="Close UserDetails"
              >
                <ArrowLeft size={20} />
              </button>

              <Paragraph1 className=" uppercase font-bold tracking-widest text-gray-800">
                UserDetails FUNDS{" "}
              </Paragraph1>
              <button
                onClick={onClose}
                className="text-gray-500  hover:text-black p-1 rounded-full transition"
                aria-label="Close UserDetails"
              >
                <X className=" hidden xl:flex" size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="grow pt-4 pb-20 space-y-8">
              <UserDetailsCard user={user} />
            </div>

            {/* Footer */}
            <div className="mt-auto py-3 bg-white sticky bottom-0 flex flex-col gap-3">
              <SuspendUserButton />

              <button className="w-full px-4 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition">
                <Paragraph1>Close Panel</Paragraph1>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --------------------
// Main Component
// --------------------
const UserDetails: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Toggle Button */}

      <button
        onClick={() => setIsOpen(true)}
        className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
      >
        <Paragraph1>View Profile</Paragraph1>
      </button>

      {/* Filter Panel */}
      <UserDetailsPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default UserDetails;
