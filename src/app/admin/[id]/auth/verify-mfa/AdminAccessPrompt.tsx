"use client";

import React, { useState, useEffect, useRef } from "react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { useRouter } from "next/navigation";
import { useAdminIdStore } from "@/store/useAdminIdStore";
import { useVerifyAdminMfa } from "@/lib/mutations";
import { useUserStore } from "@/store/useUserStore";
import { useMe } from "@/lib/queries/auth/useMe";

const OTP_LENGTH = 6;

export default function AdminAccessPrompt({
  autoShow = true,
}: {
  autoShow?: boolean;
}) {
  const inputsRef = useRef<HTMLInputElement[]>([]);
  const router = useRouter();
  const adminId = useAdminIdStore((state) => state.adminId);
  const verifyMfa = useVerifyAdminMfa();
  const { sessionToken, requiresMfa, name, role } = useUserStore();
  const { data: user, isLoading: isMeLoading } = useMe();

  const [open, setOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [isMfaVerified, setIsMfaVerified] = useState(false);
  const [isRoleConfirmed, setIsRoleConfirmed] = useState(false);

  // Auto-show when admin logs in with MFA pending
  useEffect(() => {
    if (!autoShow) return;
    if (!sessionToken) return;
    if (!requiresMfa) return;

    setOpen(true);
  }, [autoShow, sessionToken, requiresMfa]);

  // Check if role has been confirmed after MFA verification
  useEffect(() => {
    if (!isMfaVerified) return;

    // If useMe query has loaded and user role is ADMIN, role is confirmed
    if (!isMeLoading && user && user.role === "ADMIN") {
      setIsRoleConfirmed(true);
    }
  }, [isMfaVerified, isMeLoading, user]);

  // Redirect after role is confirmed
  useEffect(() => {
    if (!isRoleConfirmed) return;

    const timer = setTimeout(() => {
      router.push(`/admin/${adminId}/dashboard`);
    }, 2000);
    return () => clearTimeout(timer);
  }, [isRoleConfirmed, adminId, router]);

  if (!sessionToken && !isMfaVerified) return null;
  if (!requiresMfa && !isMfaVerified) return null;
  if (!open && !isMfaVerified) return null;

  const handleVerifyOtp = async () => {
    if (!otp.trim() || !sessionToken) return;

    verifyMfa.mutate(
      { code: otp, sessionToken },
      {
        onSuccess: async () => {
          // Mark MFA as verified, but don't route yet
          // Wait for useMe() to confirm admin role
          setIsMfaVerified(true);
        },
      },
    );
  };

  return (
    <div className="font-sans flex items-center justify-center min-h-screen p-4">
      <div className="max-w-xl w-full bg-white py-8 p-4 sm:p-8 sm:rounded-3xl text-gray-600 shadow-md min-h-fit">
        {/* Header */}
        <div className="mb-8 text-center flex flex-col items-center">
          <img src="/images/logo1.svg" alt="Logo" className="h-10 w-10 mb-4" />
          <Paragraph3 className="text-2xl font-bold text-black mb-1">
            Welcome, {name || "Admin"}
          </Paragraph3>
          <Paragraph1 className="text-sm text-gray-600 max-w-[350px]">
            {isMfaVerified
              ? "Confirming admin access..."
              : "Enter your verification code to continue"}
          </Paragraph1>
        </div>

        {isMfaVerified ? (
          /* Loading State - Waiting for role confirmation */
          <div className="flex flex-col items-center justify-center w-full py-16">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mb-6"></div>
            <div className="text-center w-full">
              <Paragraph3 className="text-lg font-semibold text-black mb-2">
                {isRoleConfirmed
                  ? "Access confirmed, loading dashboard..."
                  : "Verifying admin credentials..."}
              </Paragraph3>
              <div className="flex justify-center gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                <span
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></span>
                <span
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                ></span>
              </div>
            </div>
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
                {(verifyMfa.error as any)?.message ||
                  (verifyMfa.error as Error)?.message ||
                  "Invalid code. Please try again."}
              </p>
            )}

            <button
              onClick={handleVerifyOtp}
              disabled={otp.length !== 6 || verifyMfa.isPending}
              className="w-full py-3 font-semibold text-white bg-black rounded-lg hover:bg-black/90 disabled:opacity-50 transition"
            >
              {verifyMfa.isPending ? "Verifying..." : "Verify"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
