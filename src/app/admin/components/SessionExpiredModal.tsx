"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  adminIdFromPathname,
  getAdminLoginPath,
} from "@/lib/auth/adminLoginPath";
import { useSessionStore } from "@/store/useSessionStore";
import { useAdminIdStore } from "@/store/useAdminIdStore";
import { Clock, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { buttonPrimaryFull } from "@/common/ui/buttonClasses";
import { dialogBackdrop, dialogCard } from "@/common/ui/dashboardClasses";

export default function SessionExpiredModal() {
  const router = useRouter();
  const pathname = usePathname();
  const isSessionExpired = useSessionStore((state) => state.isSessionExpired);
  const setSessionExpired = useSessionStore((state) => state.setSessionExpired);
  const adminId = useAdminIdStore((state) => state.adminId);
  const signInPath = getAdminLoginPath(
    adminId ?? adminIdFromPathname(pathname),
  );

  useEffect(() => {
    if (isSessionExpired) {
      // Redirect after 3 seconds
      const timer = setTimeout(() => {
        router.replace(signInPath);
        setSessionExpired(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isSessionExpired, signInPath, router, setSessionExpired]);

  return (
    <AnimatePresence>
      {isSessionExpired && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`${dialogBackdrop} z-[9999]`}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
            className={`${dialogCard} p-8 mx-4 shadow-2xl`}
          >
            <div className="flex flex-col items-center text-center">
              {/* Icon */}
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mb-6"
              >
                <div className="relative">
                  <Clock size={64} className="text-orange-500" />
                  <motion.div
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <AlertCircle
                      size={48}
                      className="text-orange-600 absolute top-4 right-0"
                    />
                  </motion.div>
                </div>
              </motion.div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Session Expired
              </h2>

              {/* Description */}
              <p className="text-gray-600 mb-6">
                Your session has expired for security reasons. Please log in
                again to continue.
              </p>

              {/* Countdown */}
              <motion.div
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-sm text-gray-500 mb-6"
              >
                Redirecting in 3 seconds...
              </motion.div>

              {/* Button */}
              <button
                onClick={() => {
                  router.replace(signInPath);
                  setSessionExpired(false);
                }}
                className={buttonPrimaryFull}
              >
                Sign In Now
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
