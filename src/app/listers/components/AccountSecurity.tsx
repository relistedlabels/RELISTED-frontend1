// ENDPOINTS: POST /api/listers/security/password

"use client";

import React, { useRef, useState } from "react";
import { Paragraph1 } from "@/common/ui/Text";
import { HiOutlineEye, HiOutlineXMark } from "react-icons/hi2";
import { AnimatePresence, motion } from "framer-motion";
import { useChangePassword } from "@/lib/mutations/listers/useChangePassword";
import { useVerifyOtp } from "@/lib/mutations/auth/useVerifyOtp";

// Sub-component for a single password input field
interface PasswordInputProps {
  label: string;
  placeholder: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  placeholder,
  id,
  value,
  onChange,
}) => (
  <div className="mb-4">
    <label
      htmlFor={id}
      className="text-sm font-medium text-gray-900 mb-2 block"
    >
      {label}
    </label>
    <div className="relative">
      <input
        type="password"
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-black focus:border-black transition duration-150"
      />
      {/* Eye icon to toggle visibility */}
      <button
        type="button"
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition duration-150"
        aria-label={`Show ${label}`}
      >
        <HiOutlineEye className="w-5 h-5" />
      </button>
    </div>
  </div>
);

const AccountSecurity: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const inputsRef = useRef<HTMLInputElement[]>([]);

  const changePasswordMutation = useChangePassword();
  const verifyOtpMutation = useVerifyOtp();

  const OTP_LENGTH = 6;

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;

    const otpArray = otp.split("");
    otpArray[index] = value;
    const newOtp = otpArray.join("").slice(0, OTP_LENGTH);
    setOtp(newOtp);

    if (value && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);

    if (otp.length !== OTP_LENGTH) {
      setOtpError("Please enter a 6-digit OTP");
      return;
    }

    verifyOtpMutation.mutate(
      { code: otp },
      {
        onSuccess: () => {
          setShowOtpModal(false);
          setOtp("");
          changePasswordMutation.mutate(
            { currentPassword, newPassword, confirmPassword },
            {
              onSuccess: () => {
                setStatus("success");
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
              },
              onError: () => {
                setStatus("error");
              },
            },
          );
        },
        onError: () => {
          setOtpError("Invalid OTP. Please try again.");
        },
      },
    );
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    setStatus("idle");
    setShowOtpModal(true);
  };

  return (
    <div className="font-sans ">
      <Paragraph1 className="text-xl uppercase font-bold text-gray-900 mb-6">
        Security
      </Paragraph1>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Current Password */}
        <PasswordInput
          id="current-password"
          label="Current password"
          placeholder="Enter your current password"
          value={currentPassword}
          onChange={setCurrentPassword}
        />

        {/* New Password */}
        <PasswordInput
          id="new-password"
          label="New password"
          placeholder="Enter your new password"
          value={newPassword}
          onChange={setNewPassword}
        />

        {/* Complexity Requirement */}
        <Paragraph1 className="text-xs text-gray-500 mt-1 mb-4">
          Must be at least 8 characters with a mix of uppercase, lowercase,
          numbers, and symbols
        </Paragraph1>

        {/* Confirm New Password */}
        <PasswordInput
          id="confirm-password"
          label="Confirm New password"
          placeholder="Re-enter your new password"
          value={confirmPassword}
          onChange={setConfirmPassword}
        />

        {/* Action Button */}
        <div className="flex justify-end pt-6">
          <button
            type="submit"
            disabled={changePasswordMutation.isPending}
            className="px-6 py-2 text-sm font-semibold text-white bg-black rounded-lg hover:bg-gray-800 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {changePasswordMutation.isPending
              ? "Updating..."
              : "Update Password"}
          </button>
        </div>
      </form>

      {status === "success" && (
        <Paragraph1 className="mt-3 text-sm text-green-600">
          Password updated successfully.
        </Paragraph1>
      )}
      {status === "error" && (
        <Paragraph1 className="mt-3 text-sm text-red-600">
          Failed to update password. Please check your details and try again.
        </Paragraph1>
      )}

      {/* OTP Verification Modal */}
      <AnimatePresence>
        {showOtpModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative max-w-md w-full bg-white p-8 rounded-xl border border-gray-200 shadow-xl"
              style={{ zIndex: 60 }}
            >
              <button
                type="button"
                onClick={() => {
                  setShowOtpModal(false);
                  setOtp("");
                  setOtpError(null);
                }}
                className="absolute right-4 top-4 p-2 text-gray-500 hover:text-black focus:outline-none transition"
                aria-label="Close modal"
              >
                <HiOutlineXMark className="w-6 h-6" />
              </button>

              <div className="text-center mb-6">
                <Paragraph1 className="text-lg font-bold text-gray-900 mb-2">
                  Verify Your Identity
                </Paragraph1>
                <Paragraph1 className="text-sm text-gray-600">
                  Enter the 6-digit OTP sent to your email to confirm the
                  password change.
                </Paragraph1>
              </div>

              <form onSubmit={handleOtpSubmit} className="space-y-4">
                {/* OTP Input Fields */}
                <div className="flex justify-between gap-2 mb-4">
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
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition"
                      aria-label={`OTP digit ${index + 1}`}
                    />
                  ))}
                </div>

                {otpError && (
                  <Paragraph1 className="text-sm text-red-600 text-center">
                    {otpError}
                  </Paragraph1>
                )}

                <button
                  type="submit"
                  disabled={verifyOtpMutation.isPending}
                  className="w-full py-3 font-semibold text-white bg-black rounded-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {verifyOtpMutation.isPending ? "Verifying..." : "Verify OTP"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AccountSecurity;
