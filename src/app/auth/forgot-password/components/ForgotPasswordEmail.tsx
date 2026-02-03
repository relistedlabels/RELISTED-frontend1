"use client";

import React, { useState } from "react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { HiOutlineEnvelope } from "react-icons/hi2";
import { useRouter } from "next/navigation";

const ForgotPasswordEmail: React.FC = () => {
  const [email, setEmail] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Email submitted:", email);
    router.push("/auth/forgot-password/otp"); // Navigate to OTP page
  };

  return (
    <div className="font-sans ">
      <div className="max-w-xl w-full bg-white p-8 min-h-screen sm:rounded-3xl text-gray-600">
        <div className="mb-8 text-center flex flex-col items-center">
          <img src="/images/logo1.svg" alt="Logo" className="h-10 w-10 mb-4" />
          <Paragraph3 className="text-2xl font-bold text-black mb-1">
            Reset Password{" "}
          </Paragraph3>
          <Paragraph1 className="text-sm text-gray-600 max-w-[350px] leading-relaxed">
            Enter your email below to receive a secure reset link.{" "}
          </Paragraph1>
        </div>

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
                className="w-full p-4 pl-12 border border-gray-300 rounded-lg bg-white text-gray-600 placeholder-gray-400 focus:ring-black focus:border-black"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 text-base font-semibold text-white bg-black rounded-lg hover:bg-gray-800"
          >
            <Paragraph1>Send OTP </Paragraph1>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordEmail;
