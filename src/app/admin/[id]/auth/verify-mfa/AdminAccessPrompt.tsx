"use client";

import React, { useState, useEffect, useRef } from "react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { useMe } from "@/lib/queries/auth/useMe";
import { useRouter } from "next/navigation";
import { useAdminIdStore } from "@/store/useAdminIdStore";
import { useVerifyAdminMfa } from "@/lib/mutations";
import { useUserStore } from "@/store/useUserStore";

const OTP_LENGTH = 6;

export default function AdminAccessPrompt({
  autoShow = true,
}: {
  autoShow?: boolean;
}) {
  const inputsRef = useRef<HTMLInputElement[]>([]);
  const { data: user } = useMe();
  const router = useRouter();
  const adminId = useAdminIdStore((state) => state.adminId);
  const verifyMfa = useVerifyAdminMfa();
  const { sessionToken, requiresMfa } = useUserStore();

  const [open, setOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Auto-show when admin logs in with MFA pending
  useEffect(() => {
    if (!autoShow) return;
    if (!user) return;
    if (!requiresMfa) return;

    setOpen(true);
  }, [autoShow, user, requiresMfa]);

  // Redirect after successful verification
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        router.push(`/admin/${adminId}/dashboard`);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, adminId, router]);

  if (!user) return null;
  const isAdmin = user.role?.toUpperCase() === "ADMIN";
  if (!isAdmin) return null;
  if (!open) return null;

  const handleVerifyOtp = async () => {
    if (!otp.trim() || !sessionToken) return;

    verifyMfa.mutate(
      { code: otp, sessionToken },
      {
        onSuccess: async () => {
          setIsSuccess(true);
        },
      },
    );
  };

  return (
    <div className="font-sans flex items-center justify-center">
      <div className="max-w-xl w-full h-screen sm:h-fit bg-white py-8 p-4 sm:p-8 sm:rounded-3xl text-gray-600 shadow-md">
        {/* Header */}
        <div className="mb-8 text-center flex flex-col items-center">
          <img src="/images/logo1.svg" alt="Logo" className="h-10 w-10 mb-4" />
          <Paragraph3 className="text-2xl font-bold text-black mb-1">
            Welcome, {user.name || "Admin"}
          </Paragraph3>
          <Paragraph1 className="text-sm text-gray-600 max-w-[350px]">
            {isSuccess
              ? "Verifying access..."
              : "Enter your verification code to continue"}
          </Paragraph1>
        </div>

        {isSuccess ? (
          /* Loading State */
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mb-6"></div>
            <div className="text-center">
              <Paragraph3 className="text-lg font-semibold text-black mb-2">
                Getting your dashboard ready
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
