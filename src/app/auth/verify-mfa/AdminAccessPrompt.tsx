"use client";

import React, { useState, useEffect, useRef } from "react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { useMe } from "@/lib/queries/auth/useMe";
import { useRouter } from "next/navigation";
import { useVerifyAdminMfa } from "@/lib/mutations";
import { useUserStore } from "@/store/useUserStore";
import {
  HiOutlineShieldCheck,
  HiOutlineShoppingBag,
  HiOutlineUser,
} from "react-icons/hi2";

const OTP_LENGTH = 6;

interface Props {
  autoShow?: boolean;
}

export default function AdminAccessPrompt({ autoShow = true }: Props) {
  const inputsRef = useRef<HTMLInputElement[]>([]);
  const { data: user } = useMe();
  const router = useRouter();
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

  if (!user) return null;
  const isAdmin = user.role?.toUpperCase() === "ADMIN";
  if (!isAdmin) return null;
  if (!open) return null;

  // const handleAdminDashboard = () => {
  //   setShowOtpVerification(true);
  // };

  const handleVerifyOtp = async () => {
    if (!otp.trim() || !sessionToken) return;

    verifyMfa.mutate(
      { code: otp, sessionToken },
      {
        onSuccess: async () => {
          // Clear OTP and go back to dashboard selection
          setOtp("");
          setShowOtpVerification(false);
          // Don't close modal - let user choose dashboard
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

  return (
    <div className="font-sans  flex items-center justify-center  p-4">
      <div className="max-w-xl w-full bg-white p-8 sm:rounded-3xl text-gray-600 shadow-md">
        {/* Header */}
        <div className="mb-8 text-center flex flex-col items-center">
          <img src="/images/logo1.svg" alt="Logo" className="h-10 w-10 mb-4" />
          <Paragraph3 className="text-2xl font-bold text-black mb-1">
            Welcome, {user.name || "Admin"}
          </Paragraph3>
          <Paragraph1 className="text-sm text-gray-600 max-w-[350px]">
            {!showOtpVerification
              ? "Select a dashboard to access"
              : "Enter your verification code to continue"}
          </Paragraph1>
        </div>

        {!showOtpVerification ? (
          <div className="space-y-3">
            {/* Admin Dashboard */}
            <button
              onClick={() => handleNavigation("/admin/dashboard")}
              className="w-full p-4 text-left border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-start gap-4"
            >
              <div className="p-3 bg-red-100 text-red-600 rounded-lg flex-shrink-0 mt-1">
                <HiOutlineShieldCheck className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <Paragraph3 className="font-semibold text-black mb-1">
                  Admin Dashboard
                </Paragraph3>
                <Paragraph1 className="text-xs text-gray-600">
                  Manage users, content, and platform settings
                </Paragraph1>
                <p className="text-xs text-gray-500 mt-2">
                  Requires OTP Verification
                </p>
              </div>
            </button>

            {/* Lister Dashboard */}
            <button
              onClick={() => handleNavigation("/listers/dashboard")}
              className="w-full p-4 text-left border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-start gap-4"
            >
              <div className="p-3 bg-blue-100 text-blue-600 rounded-lg flex-shrink-0 mt-1">
                <HiOutlineShoppingBag className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <Paragraph3 className="font-semibold text-black mb-1">
                  Lister Dashboard
                </Paragraph3>
                <Paragraph1 className="text-xs text-gray-600">
                  Manage your listings, inventory & orders
                </Paragraph1>
              </div>
            </button>

            {/* Renter Dashboard */}
            <button
              onClick={() => handleNavigation("/")}
              className="w-full p-4 text-left border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-start gap-4"
            >
              <div className="p-3 bg-purple-100 text-purple-600 rounded-lg flex-shrink-0 mt-1">
                <HiOutlineUser className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <Paragraph3 className="font-semibold text-black mb-1">
                  Renter Page
                </Paragraph3>
                <Paragraph1 className="text-xs text-gray-600">
                  Browse, rent & manage your wardrobe
                </Paragraph1>
              </div>
            </button>

            {/* Continue Shopping */}
            <button
              onClick={() => handleNavigation("/")}
              className="w-full py-3 text-black border border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold mt-4"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          /* OTP Verification Section */
          <div className="space-y-5">
            {/* OTP Inputs */}
            <div className="flex justify-between gap-3">
              {Array.from({ length: OTP_LENGTH }).map((_, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    if (el) inputsRef.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={otp[index] ?? ""}
                  onChange={(e) => {
                    if (!/^\d?$/.test(e.target.value)) return;

                    const otpArray = otp.split("");
                    otpArray[index] = e.target.value;

                    const newOtp = otpArray.join("").slice(0, OTP_LENGTH);
                    setOtp(newOtp);

                    if (e.target.value && index < OTP_LENGTH - 1) {
                      inputsRef.current[index + 1]?.focus();
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !otp[index] && index > 0) {
                      inputsRef.current[index - 1]?.focus();
                    }
                  }}
                  className="w-12 h-12 text-center text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none"
                  disabled={verifyMfa.isPending}
                />
              ))}
            </div>

            {verifyMfa.isError && (
              <p className="text-sm text-red-500 text-center">
                {(verifyMfa.error as Error)?.message ||
                  "Invalid code. Please try again."}
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleVerifyOtp}
                disabled={otp.length !== 6 || verifyMfa.isPending}
                className="flex-1 py-3 font-semibold text-white bg-black rounded-lg hover:bg-black/90 disabled:opacity-50 transition"
              >
                {verifyMfa.isPending ? "Verifying..." : "Verify"}
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
        )}
      </div>
    </div>
  );
}
