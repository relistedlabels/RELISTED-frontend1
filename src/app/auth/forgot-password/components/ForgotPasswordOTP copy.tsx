"use client";

import React, { useRef, useState } from "react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

const ForgotPasswordOTP: React.FC = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputsRef = useRef<HTMLInputElement[]>([]);
  const router = useRouter();

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleBackspace = (index: number, value: string) => {
    if (!value && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("OTP submitted:", otp.join(""));
    router.push("/auth/forgot-password/new-password");
  };

  return (
    <div className="font-sans  ">
      <div className="max-w-xl w-full bg-white p-8 min-h-screen sm:rounded-3xl text-gray-600 shadow-md">
        <div className="mb-8 text-center flex flex-col items-center">
          <img src="/images/logo1.svg" alt="Logo" className="h-10 w-10 mb-4" />
          <Paragraph3 className="text-2xl font-bold text-black mb-1">
            Enter OTP Verification Code{" "}
          </Paragraph3>
          <Paragraph1 className="text-sm text-gray-600 max-w-[350px] leading-relaxed">
            We’ve sent a 6-digit verification code to email address. Enter it
            below to continue.{" "}
          </Paragraph1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <div className="flex justify-between gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    if (el) inputsRef.current[index] = el;
                  }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) =>
                    handleBackspace(index, e.currentTarget.value)
                  }
                  className="w-12 h-12 text-center text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 text-base font-semibold text-white bg-black rounded-lg hover:bg-gray-800"
          >
            <Paragraph1> Verify</Paragraph1>
          </button>
        </form>

        <button className=" flex w-full justify-center gap-1 items-center text-center pt-4">
          {" "}
          <Paragraph1 className=" text-center">
            {" "}
            Didn’t receive a code? Resend Code
          </Paragraph1>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default ForgotPasswordOTP;
