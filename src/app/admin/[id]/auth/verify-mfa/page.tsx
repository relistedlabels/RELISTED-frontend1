"use client";

import React, { useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAdminIdStore } from "@/store/useAdminIdStore";
import { useUserStore } from "@/store/useUserStore";
import { motion } from "framer-motion";
import AdminAccessPrompt from "./AdminAccessPrompt";

export default function AdminVerifyMfaPage() {
  const router = useRouter();
  const params = useParams();
  const storeAdminId = useAdminIdStore((state) => state.adminId);
  const adminId = (storeAdminId || (params?.id as string | undefined)) ?? null;
  const { sessionToken, requiresMfa, token } = useUserStore();
  const initialRenderRef = useRef(true);

  useEffect(() => {
    // On initial render, check if user came here without MFA state
    if (initialRenderRef.current) {
      initialRenderRef.current = false;
      if (!sessionToken && !requiresMfa) {
        if (adminId) {
          router.replace(`/admin/${adminId}/auth/login`);
        }
        return;
      }
    }

    // If user has a full auth token and no longer requires MFA,
    // ensure they are on the dashboard (fallback in case the OTP
    // modal navigation doesn't run for any reason).
    if (token && !requiresMfa && !sessionToken && adminId) {
      router.replace(`/admin/${adminId}/dashboard`);
    }
  }, [sessionToken, requiresMfa, token, router, adminId]);

  return (
    <div
      className="relative w-full h-full min-h-screen bg-black bg-cover bg-center"
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
        className="relative flex flex-col sm:items-center justify-center px-0 sm:px-6 sm:py-20 min-h-screen"
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
