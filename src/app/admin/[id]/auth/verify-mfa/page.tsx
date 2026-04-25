"use client";

import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useAdminIdStore } from "@/store/useAdminIdStore";
import { useUserStore } from "@/store/useUserStore";
import AdminAccessPrompt from "./AdminAccessPrompt";

export default function AdminVerifyMfaPage() {
  const router = useRouter();
  const params = useParams();
  const storeAdminId = useAdminIdStore((state) => state.adminId);
  const paramAdminId = Array.isArray(params.id) ? params.id[0] : params.id;
  const adminId = paramAdminId ?? storeAdminId ?? null;
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

    // If user has verified MFA and no longer requires it, they should be routed
    // by the AdminAccessPrompt component - don't route here to avoid conflicts
    if (token && !requiresMfa && !sessionToken && adminId) {
      // This is a fallback - AdminAccessPrompt should handle routing
      // Only use this if somehow the OTP modal doesn't redirect
      router.replace(`/admin/${adminId}/dashboard`);
    }
  }, [sessionToken, requiresMfa, token, router, adminId]);

  return (
    <div
      className="relative bg-black bg-cover bg-center w-full h-full min-h-screen"
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
        className="relative flex flex-col justify-center sm:items-center px-0 sm:px-6 sm:py-20 min-h-screen"
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
