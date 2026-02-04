"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import FullPageLoader from "@/common/ui/FullPageLoader";
import AdminAccessPrompt from "@/common/ui/AdminAccessPrompt";
import { motion } from "framer-motion";

export default function VerifyMfaPage() {
  const router = useRouter();
  const { sessionToken, requiresMfa } = useUserStore();

  useEffect(() => {
    // If no session token or MFA is not required, redirect back to sign in
    if (!sessionToken || !requiresMfa) {
      router.replace("/auth/sign-in");
    }
  }, [sessionToken, requiresMfa, router]);

  if (!sessionToken || !requiresMfa) {
    return <FullPageLoader />;
  }

  return (
   <div
      className="relative w-full h-screen bg-black bg-cover bg-center"
      style={{ backgroundImage: "url('/images/authbg.jpg')" }}
    >
      {/* Dark Overlay */}
      <motion.div
        className="absolute inset-0 bg-black/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />

      {/* Center Content */}
      <motion.div
        className="relative flex flex-col sm:items-center justify-center  text-white px-0 sm:px-6 sm:py-20"
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
              transition: {
                staggerChildren: 0.25,
              },
            },
          }}
        >
               <AdminAccessPrompt autoShow={true} />

        </motion.div>
      </motion.div>
    </div> 
  );
}





