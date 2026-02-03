"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Paragraph1 } from "@/common/ui/Text";
import { useMe } from "@/lib/queries/auth/useMe";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import {
  useSendAdminOtpMutation,
  useVerifyAdminOtpMutation,
} from "@/lib/mutations";

interface Props {
  autoShow?: boolean;
}

export default function AdminAccessPrompt({ autoShow = true }: Props) {
  const { data: user } = useMe();
  const router = useRouter();
  const pathname = usePathname();

  const sendOtpMutation = useSendAdminOtpMutation();
  const verifyOtpMutation = useVerifyAdminOtpMutation();

  const [open, setOpen] = useState(() => {
    if (!autoShow) return false;
    if (!user) return false;
    const elevated = [
      "ADMIN",
      "CUSTOMER_CARE",
      "CUSTOMERCARE",
      "CUSTOMER-CARE",
    ].includes((user.role || "").toUpperCase());
    return elevated && !pathname?.startsWith("/admin");
  });

  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  async function sendOtp() {
    try {
      await sendOtpMutation.mutateAsync();
      setIsOtpSent(true);
      toast.success("OTP sent to your registered contact");
    } catch (e) {
      toast.error("Failed to send OTP");
    }
  }

  async function verifyOtp() {
    try {
      await verifyOtpMutation.mutateAsync(otp);
      toast.success("Verified — redirecting to admin dashboard");
      setTimeout(() => router.push("/admin"), 600);
    } catch (e: any) {
      toast.error(e?.message || "OTP verification failed");
    }
  }

  if (!user) return null;
  const hasElevatedRole = ["ADMIN", "CUSTOMER_CARE", "ACCOUNTANT"].includes(
    (user.role || "").toUpperCase(),
  );

  if (!hasElevatedRole) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ y: 20, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 12, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="w-full max-w-md bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">Admin Access Detected</h3>
                <Paragraph1 className="text-sm text-gray-600">
                  We noticed your account has admin-level privileges. Would you
                  like to go to the Admin Dashboard or continue shopping?
                </Paragraph1>
              </div>
              <button
                aria-label="close"
                onClick={() => setOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="mt-4">
              {!isOtpSent ? (
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      // start OTP flow
                      sendOtp();
                    }}
                    className="px-4 py-2 bg-black text-white rounded-lg"
                    disabled={sendOtpMutation.isPending}
                  >
                    {sendOtpMutation.isPending
                      ? "Sending..."
                      : "Go to Admin (verify)"}
                  </button>

                  <button
                    onClick={() => router.push("/")}
                    className="px-4 py-2 border rounded-lg"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div>
                  <Paragraph1 className="text-sm text-gray-600">
                    Enter the OTP sent to your contact
                  </Paragraph1>
                  <div className="flex gap-2 mt-3">
                    <input
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="flex-1 p-3 border rounded-lg"
                      placeholder="123456"
                    />
                    <button
                      onClick={verifyOtp}
                      disabled={verifyOtpMutation.isPending || otp.length === 0}
                      className="px-4 py-2 bg-black text-white rounded-lg"
                    >
                      {verifyOtpMutation.isPending ? "Verifying..." : "Verify"}
                    </button>
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
