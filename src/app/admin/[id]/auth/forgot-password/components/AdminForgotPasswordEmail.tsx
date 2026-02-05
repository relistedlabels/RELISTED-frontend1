"use client";

import React, { useState } from "react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { HiOutlineEnvelope } from "react-icons/hi2";
import { useRouter, useParams } from "next/navigation";
import { useForgotPassword } from "@/lib/mutations";
import { AlertCircle } from "lucide-react";

const AdminForgotPasswordEmail: React.FC = () => {
  const [email, setEmail] = useState("");
  const [rateLimitError, setRateLimitError] = useState("");
  const router = useRouter();
  const params = useParams();
  const adminId = params.id;
  const forgotPasswordMutation = useForgotPassword();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRateLimitError("");

    forgotPasswordMutation.mutate(
      { email },
      {
        onSuccess: (response: unknown) => {
          const data = response as { success: boolean };
          if (data.success) {
            // Store email and adminId in session storage
            sessionStorage.setItem("resetEmail", email);
            sessionStorage.setItem("adminId", String(adminId));
            router.push(`/admin/${adminId}/auth/forgot-password/verify`);
          }
        },
        onError: (error: any) => {
          const errorMessage =
            error?.response?.data?.message || "An error occurred";
          if (errorMessage.includes("wait")) {
            setRateLimitError(errorMessage);
          } else {
            setRateLimitError("Failed to send reset code. Please try again.");
          }
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
            Reset Password
          </Paragraph3>
          <Paragraph1 className="text-sm text-gray-600 max-w-[350px] leading-relaxed">
            Enter your email below to receive a password reset code.
          </Paragraph1>
        </div>

        {rateLimitError && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <Paragraph1 className="text-sm text-yellow-600">
              {rateLimitError}
            </Paragraph1>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block mb-2">
              <Paragraph1 className="text-sm font-medium text-gray-600">
                Email Address
              </Paragraph1>
            </label>
            <div className="relative">
              <HiOutlineEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={forgotPasswordMutation.isPending}
                className="w-full p-4 pl-12 border border-gray-300 rounded-lg bg-white text-gray-600 placeholder-gray-400 focus:ring-black focus:border-black disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={forgotPasswordMutation.isPending}
            className="w-full py-2 text-base font-semibold text-white bg-black rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <Paragraph1>
              {forgotPasswordMutation.isPending
                ? "Sending..."
                : "Send Reset Code"}
            </Paragraph1>
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => router.push(`/admin/${adminId}/auth/login`)}
              className="text-sm text-gray-600 hover:text-black transition-colors"
            >
              Back to Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminForgotPasswordEmail;
