"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { useMe } from "@/lib/queries/auth/useMe";
import { useRouter, usePathname } from "next/navigation";
import { useVerifyAdminMfa } from "@/lib/mutations";
import { useUserStore } from "@/store/useUserStore";
import {
  HiOutlineShieldCheck,
  HiOutlineShoppingBag,
  HiOutlineUser,
  HiOutlineArrowRight,
} from "react-icons/hi2";

interface Props {
  autoShow?: boolean;
}

export default function AdminAccessPrompt({ autoShow = true }: Props) {
  const { data: user } = useMe();
  const router = useRouter();
  const pathname = usePathname();
  const verifyMfa = useVerifyAdminMfa();
  const { sessionToken, requiresMfa } = useUserStore();

  const [open, setOpen] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [otp, setOtp] = useState("");

  // Auto-show when admin logs in with MFA pending
  useEffect(() => {
    if (!autoShow) return;
    if (!user) return;
    if (!requiresMfa) return;

    setOpen(true);
    setShowOtpVerification(true);
  }, [autoShow, user, requiresMfa]);

  const handleAdminDashboard = () => {
    setShowOtpVerification(true);
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim() || !sessionToken) return;

    verifyMfa.mutate(
      { code: otp, sessionToken },
      {
        onSuccess: () => {
          setOpen(false);
          setOtp("");
          setShowOtpVerification(false);
          router.push("/admin/dashboard");
        },
      },
    );
  };

  const handleNavigation = (path: string) => {
    setOpen(false);
    setOtp("");
    setShowOtpVerification(false);
    router.push(path);
  };

  if (!user) return null;
  const isAdmin = user.role?.toUpperCase() === "ADMIN";

  if (!isAdmin) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        >
          <motion.div
            initial={{ y: 20, scale: 0.95 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 12, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-black to-gray-900 p-8 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    Welcome, {user.name || "Admin"}
                  </h2>
                  <Paragraph1 className="text-gray-300">
                    Select a dashboard to access or continue shopping
                  </Paragraph1>
                </div>
                <button
                  aria-label="close"
                  onClick={() => {
                    setOpen(false);
                    setOtp("");
                    setShowOtpVerification(false);
                  }}
                  className="text-white/60 hover:text-white transition"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              {!showOtpVerification ? (
                <div>
                  <Paragraph1 className="text-gray-600 mb-8 text-center">
                    Choose where you'd like to go
                  </Paragraph1>

                  {/* Dashboard Options Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {/* Admin Dashboard */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleAdminDashboard}
                      className="group relative p-6 bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-xl hover:shadow-lg transition text-left"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-red-600 text-white rounded-lg group-hover:bg-red-700 transition">
                          <HiOutlineShieldCheck className="w-6 h-6" />
                        </div>
                        <HiOutlineArrowRight className="w-5 h-5 text-red-600 opacity-0 group-hover:opacity-100 transition" />
                      </div>
                      <Paragraph3 className="font-bold text-gray-900 mb-1">
                        Admin Dashboard
                      </Paragraph3>
                      <Paragraph1 className="text-xs text-gray-600">
                        Manage users, content, and platform settings
                      </Paragraph1>
                      <div className="mt-3 text-xs text-red-600 font-medium">
                        Requires OTP Verification
                      </div>
                    </motion.button>

                    {/* Lister Dashboard */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleNavigation("/listers/dashboard")}
                      className="group relative p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl hover:shadow-lg transition text-left"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-blue-600 text-white rounded-lg group-hover:bg-blue-700 transition">
                          <HiOutlineShoppingBag className="w-6 h-6" />
                        </div>
                        <HiOutlineArrowRight className="w-5 h-5 text-blue-600 opacity-0 group-hover:opacity-100 transition" />
                      </div>
                      <Paragraph3 className="font-bold text-gray-900 mb-1">
                        Lister Dashboard
                      </Paragraph3>
                      <Paragraph1 className="text-xs text-gray-600">
                        Manage your listings, inventory & orders
                      </Paragraph1>
                    </motion.button>

                    {/* Renter Dashboard */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleNavigation("/renters/dashboard")}
                      className="group relative p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl hover:shadow-lg transition text-left"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-purple-600 text-white rounded-lg group-hover:bg-purple-700 transition">
                          <HiOutlineUser className="w-6 h-6" />
                        </div>
                        <HiOutlineArrowRight className="w-5 h-5 text-purple-600 opacity-0 group-hover:opacity-100 transition" />
                      </div>
                      <Paragraph3 className="font-bold text-gray-900 mb-1">
                        Renter Dashboard
                      </Paragraph3>
                      <Paragraph1 className="text-xs text-gray-600">
                        Browse, rent & manage your wardrobe
                      </Paragraph1>
                    </motion.button>
                  </div>

                  {/* Close Button */}
                  <button
                    onClick={() => handleNavigation("/")}
                    className="w-full py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                /* OTP Verification Section */
                <div className="max-w-sm mx-auto">
                  <div className="mb-6">
                    <Paragraph3 className="font-bold mb-2">
                      Verify Your Identity
                    </Paragraph3>
                    <Paragraph1 className="text-sm text-gray-600">
                      Enter the 6-digit code sent to your registered contact to
                      access the admin dashboard
                    </Paragraph1>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <input
                        type="text"
                        maxLength={6}
                        value={otp}
                        onChange={(e) =>
                          setOtp(e.target.value.replace(/\D/g, ""))
                        }
                        placeholder="000000"
                        className="w-full px-4 py-3 text-2xl text-center tracking-widest border-2 border-gray-300 rounded-lg font-mono focus:outline-none focus:border-black transition"
                        disabled={verifyMfa.isPending}
                      />
                      <p className="text-xs text-gray-500 mt-1 text-center">
                        {otp.length} of 6 characters
                      </p>
                    </div>

                    {verifyMfa.isError && (
                      <div className="p-3 bg-red-100 text-red-700 text-sm rounded-lg">
                        {(verifyMfa.error as Error)?.message ||
                          "Invalid code. Please try again."}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={handleVerifyOtp}
                        disabled={otp.length !== 6 || verifyMfa.isPending}
                        className="flex-1 py-3 bg-black text-white font-semibold rounded-lg hover:bg-black/90 disabled:opacity-50 transition"
                      >
                        {verifyMfa.isPending
                          ? "Verifying..."
                          : "Verify & Access"}
                      </button>

                      <button
                        onClick={() => {
                          setShowOtpVerification(false);
                          setOtp("");
                        }}
                        className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
                        disabled={verifyMfa.isPending}
                      >
                        Back
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
