"use client";

import React, { useState, useEffect } from "react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { useRouter, useParams } from "next/navigation";
import { useResetPassword } from "@/lib/mutations";
import { AlertCircle } from "lucide-react";

const AdminForgotPasswordVerify: React.FC = () => {
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const router = useRouter();
  const params = useParams();
  const adminId = params.id;
  const resetPasswordMutation = useResetPassword();

  useEffect(() => {
    // Get email from session storage
    const storedEmail = sessionStorage.getItem("resetEmail");
    if (!storedEmail) {
      router.push(`/admin/${adminId}/auth/forgot-password`);
      return;
    }
    setEmail(storedEmail);
  }, [router, adminId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    resetPasswordMutation.mutate(
      {
        code,
        password,
        email,
      },
      {
        onSuccess: (response: any) => {
          if (response.success) {
            sessionStorage.removeItem("resetEmail");
            router.push(
              `/admin/${adminId}/auth/login?message=Password reset successfully`,
            );
          }
        },
        onError: (error: any) => {
          const errorMessage =
            error?.response?.data?.message || "Failed to reset password";
          setError(errorMessage);
        },
      },
    );
  };

  return (
    <div className="font-sans">
      <div className="max-w-xl w-full bg-white p-8 min-h-screen sm:rounded-3xl text-gray-600">
        <div className="mb-8 text-center flex flex-col items-center">
          <img src="/images/logo1.svg" alt="Logo" className="h-10 w-10 mb-4" />
          <Paragraph3 className="text-2xl font-bold text-black mb-1">
            Create New Password
          </Paragraph3>
          <Paragraph1 className="text-sm text-gray-600 max-w-[350px] leading-relaxed">
            Enter the verification code sent to your email and create a new
            password.
          </Paragraph1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <Paragraph1 className="text-sm text-red-600">{error}</Paragraph1>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="code" className="block mb-2">
              <Paragraph1 className="text-sm font-medium text-gray-600">
                Verification Code
              </Paragraph1>
            </label>
            <input
              type="text"
              id="code"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter the 6-digit code"
              disabled={resetPasswordMutation.isPending}
              className="w-full p-4 border border-gray-300 rounded-lg bg-white text-gray-600 placeholder-gray-400 focus:ring-black focus:border-black disabled:bg-gray-50 disabled:text-gray-400 text-center text-lg tracking-widest"
            />
          </div>

          <div>
            <label htmlFor="password" className="block mb-2">
              <Paragraph1 className="text-sm font-medium text-gray-600">
                New Password
              </Paragraph1>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                disabled={resetPasswordMutation.isPending}
                className="w-full p-4 pr-12 border border-gray-300 rounded-lg bg-white text-gray-600 placeholder-gray-400 focus:ring-black focus:border-black disabled:bg-gray-50 disabled:text-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block mb-2">
              <Paragraph1 className="text-sm font-medium text-gray-600">
                Confirm Password
              </Paragraph1>
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                id="confirmPassword"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                disabled={resetPasswordMutation.isPending}
                className="w-full p-4 pr-12 border border-gray-300 rounded-lg bg-white text-gray-600 placeholder-gray-400 focus:ring-black focus:border-black disabled:bg-gray-50 disabled:text-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirm ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={resetPasswordMutation.isPending}
            className="w-full py-2 text-base font-semibold text-white bg-black rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <Paragraph1>
              {resetPasswordMutation.isPending
                ? "Resetting..."
                : "Reset Password"}
            </Paragraph1>
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() =>
                router.push(`/admin/${adminId}/auth/forgot-password`)
              }
              className="text-sm text-gray-600 hover:text-black transition-colors"
            >
              Back to Reset Email
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminForgotPasswordVerify;
