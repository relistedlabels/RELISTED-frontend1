"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";

import CompleteProfileFlow from "./CompleteProfileFlow";
import CompleteBusinessProfileFlow from "./CompleteBusinessProfileFlow";

function ProfileSetUp() {
  const router = useRouter();
  const role = useUserStore((s) => s.role);

  useEffect(() => {
    if (!role) {
      router.replace("/auth/sign-in");
    }
  }, [role, router]);

  if (!role) return null;

  return (
    <div className="relative w-full bg-gray-100 bg-cover bg-center">
      <motion.div
        className="relative flex flex-col sm:items-center sm:justify-center sm:px-6 sm:py-20"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, ease: "easeOut" }}
      >
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.25 },
            },
          }}
        >
          {role === "RENTER" && <CompleteProfileFlow />}
          {role === "LISTER" && <CompleteBusinessProfileFlow />}
        </motion.div>
      </motion.div>
    </div>
  );
}

export default ProfileSetUp;
