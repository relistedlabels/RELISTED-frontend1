"use client";

import React, { useState } from "react";
import { X, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Paragraph1 } from "@/common/ui/Text";
import { buttonPrimary, buttonSecondary } from "@/common/ui/buttonClasses";
import {
  slidePanelBackdrop,
  slidePanelFooter,
  slidePanelHeader,
  slidePanelSheet,
} from "@/common/ui/dashboardClasses";
import { useGetUserById } from "@/lib/queries/user/useGetUserById";
import SuspendUserButton from "./SuspendUserButton";
import DresserDetailsCard from "./DresserDetailsCard";
import ListerDetailsCard from "./ListerDetailsCard";
import AdminDetailsCard from "./AdminDetailsCard";
import DeleteUserButton from "./DeleteUserButton";
import ResetUserPasswordButton from "./ResetUserPasswordButton";

interface UserDetailsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userRole: "LISTER" | "DRESSER" | "ADMIN";
}

const UserDetailsPanel: React.FC<UserDetailsPanelProps> = ({
  isOpen,
  onClose,
  userId,
  userRole,
}) => {
  const { data: user, isLoading, error } = useGetUserById(userId);

  const variants = {
    hidden: { x: "100%" },
    visible: { x: 0 },
  };

  const renderDetailCard = () => {
    if (!user) return null;

    switch (userRole) {
      case "LISTER":
        return <ListerDetailsCard user={user} />;
      case "DRESSER":
        return <DresserDetailsCard user={user} />;
      case "ADMIN":
        return <AdminDetailsCard user={user} />;
      default:
        return <DresserDetailsCard user={user} />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={slidePanelBackdrop}
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={`${slidePanelSheet} flex flex-col`}
            role="dialog"
            aria-modal="true"
            aria-label="User Details"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={variants}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={slidePanelHeader}>
              <button
                onClick={onClose}
                className="text-gray-500 xl:hidden hover:text-black p-1 rounded-full transition"
                aria-label="Close User Details"
              >
                <ArrowLeft size={20} />
              </button>

              <Paragraph1 className="uppercase font-bold tracking-widest text-gray-800">
                {userRole} DETAILS
              </Paragraph1>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-black p-1 rounded-full transition"
                aria-label="Close User Details"
              >
                <X className="hidden xl:flex" size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="grow pt-4 pb-20 space-y-8">
              {isLoading && (
                <div className="flex justify-center py-8">
                  <Paragraph1 className="text-gray-500">Loading...</Paragraph1>
                </div>
              )}
              {error && (
                <div className="flex justify-center py-8">
                  <Paragraph1 className="text-red-500">
                    Error loading user details
                  </Paragraph1>
                </div>
              )}
              {user && renderDetailCard()}
            </div>

            {/* Footer */}
            <div className={`${slidePanelFooter} flex flex-col gap-3`}>
              {user && (
                <SuspendUserButton userId={userId} userName={user.name} />
              )}

              {/* Delete User Button */}
              <DeleteUserButton userId={userId} userName={user?.name} />

              {/* Reset Password Button */}
              <ResetUserPasswordButton userId={userId} userName={user?.name} />

              <button
                onClick={onClose}
                className={`${buttonSecondary} w-full`}
              >
                <Paragraph1>Close Panel</Paragraph1>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface UserDetailsProps {
  userId: string;
  userRole: "LISTER" | "DRESSER" | "ADMIN";
  isSuspended?: boolean;
}

const UserDetails: React.FC<UserDetailsProps> = ({
  userId,
  userRole,
  isSuspended,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={buttonPrimary}
      >
        <Paragraph1>View Profile</Paragraph1>
      </button>

      <UserDetailsPanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        userId={userId}
        userRole={userRole}
      />
    </>
  );
};

export default UserDetails;
