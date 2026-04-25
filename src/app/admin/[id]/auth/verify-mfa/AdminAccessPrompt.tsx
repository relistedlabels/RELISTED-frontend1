"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { useVerifyAdminMfa } from "@/lib/mutations";
import { useMe } from "@/lib/queries/auth/useMe";
import { useAdminIdStore } from "@/store/useAdminIdStore";
import { useUserStore } from "@/store/useUserStore";

const OTP_LENGTH = 6;
const OTP_FIELDS = Array.from({ length: OTP_LENGTH }).map((_, index) => ({
  key: `otp-${index}`,
  index,
}));

export default function AdminAccessPrompt({
  autoShow = true,
}: {
  autoShow?: boolean;
}) {
  const inputsRef = useRef<HTMLInputElement[]>([]);
  const router = useRouter();
  const params = useParams();
  const adminId = useAdminIdStore((state) => state.adminId);
  const paramAdminId = Array.isArray(params.id) ? params.id[0] : params.id;
  const resolvedAdminId = paramAdminId ?? adminId;
  const verifyMfa = useVerifyAdminMfa();
  const { sessionToken, requiresMfa, name, token } = useUserStore();
  // Only fetch user data after MFA is verified and we have a real token
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
    if (!token) return; // Wait for token to be set first
    if (isMeLoading) return; // Wait for useMe query to finish loading
    if (!user) return; // Wait for user data to be available

    // If user role is ADMIN, role is confirmed
    if (user.role === "ADMIN") {
      setIsRoleConfirmed(true);
    }
  }, [isMfaVerified, token, isMeLoading, user]);

  // Redirect after role is confirmed - add 12 second loader delay
  useEffect(() => {
    if (!isRoleConfirmed) return;
    if (!resolvedAdminId) return;

    // Add 12 second delay for loader animation before routing
    const timer = setTimeout(() => {
      router.push(`/admin/${resolvedAdminId}/dashboard`);
    }, 12000);

    return () => clearTimeout(timer);
  }, [isRoleConfirmed, resolvedAdminId, router]);

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
    <div className="flex justify-center items-center p-4 min-h-screen font-sans">
      <div className="bg-white shadow-md p-4 sm:p-8 py-8 sm:rounded-3xl w-full max-w-xl min-h-fit text-gray-600">
        {/* Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <img src="/images/logo1.svg" alt="Logo" className="mb-4 w-10 h-10" />
          <Paragraph3 className="mb-1 font-bold text-black text-2xl">
            Welcome, {name || "Admin"}
          </Paragraph3>
          <Paragraph1 className="max-w-[350px] text-gray-600 text-sm">
            {isMfaVerified
              ? "Confirming admin access..."
              : "Enter your verification code to continue"}
          </Paragraph1>
        </div>

        {isMfaVerified ? (
          /* Loading State - Waiting for role confirmation */
          <div className="flex flex-col justify-center items-center py-16 w-full">
            <div className="mb-6 border-4 border-gray-200 border-t-black rounded-full w-12 h-12 animate-spin"></div>
            <div className="w-full text-center">
              <Paragraph3 className="mb-2 font-semibold text-black text-lg">
                {isRoleConfirmed
                  ? "Access confirmed, loading dashboard..."
                  : "Verifying admin credentials..."}
              </Paragraph3>
              <div className="flex justify-center gap-1">
                <span className="bg-gray-400 rounded-full w-2 h-2 animate-bounce"></span>
                <span
                  className="bg-gray-400 rounded-full w-2 h-2 animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></span>
                <span
                  className="bg-gray-400 rounded-full w-2 h-2 animate-bounce"
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
              {OTP_FIELDS.map(({ key, index }) => (
                <input
                  key={key}
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
                  onPaste={(e) => {
                    e.preventDefault();
                    const pastedText = e.clipboardData.getData("text");
                    const digits = pastedText
                      .replace(/\D/g, "")
                      .slice(0, OTP_LENGTH);

                    if (digits.length > 0) {
                      setOtp(digits);
                      // Focus the last filled input or the next empty one
                      const focusIndex = Math.min(
                        digits.length,
                        OTP_LENGTH - 1,
                      );
                      setTimeout(() => {
                        inputsRef.current[focusIndex]?.focus();
                      }, 0);
                    }
                  }}
                  className="border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-black w-12 h-12 text-lg text-center"
                  disabled={verifyMfa.isPending}
                />
              ))}
            </div>

            {verifyMfa.isError && (
              <p className="text-red-500 text-sm text-center">
                {verifyMfa.error instanceof Error
                  ? verifyMfa.error.message
                  : typeof (verifyMfa.error as { message?: unknown } | null)
                        ?.message === "string"
                    ? (verifyMfa.error as { message: string }).message
                    : "Invalid code. Please try again."}
              </p>
            )}

            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={otp.length !== 6 || verifyMfa.isPending}
              className="bg-black hover:bg-black/90 disabled:opacity-50 py-3 rounded-lg w-full font-semibold text-white transition"
            >
              {verifyMfa.isPending ? "Verifying..." : "Verify"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
