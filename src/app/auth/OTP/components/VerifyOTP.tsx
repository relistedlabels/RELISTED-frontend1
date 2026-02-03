"use client";

import React, { useRef } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useVerifyOtp } from "@/lib/queries/auth/useVerifyOtp";
import { useResendOtp } from "@/lib/queries/auth/useResendOtp";
import { useUserStore } from "@/store/useUserStore";

const OTP_LENGTH = 6;

const OtpSchema = Yup.object({
  otp: Yup.string()
    .matches(/^\d{6}$/, "OTP must be 6 digits")
    .required("OTP is required"),
});

const VerifyOTP: React.FC = () => {
  const inputsRef = useRef<HTMLInputElement[]>([]);
  const router = useRouter();

  const verifyOtp = useVerifyOtp();
  const resendOtp = useResendOtp();

  const email = useUserStore((state) => state.email);

  return (
    <div className="font-sans min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-xl w-full bg-white p-8 sm:rounded-3xl text-gray-600 shadow-md">
        {/* Header */}
        <div className="mb-8 text-center flex flex-col items-center">
          <img src="/images/logo1.svg" alt="Logo" className="h-10 w-10 mb-4" />
          <Paragraph3 className="text-2xl font-bold text-black mb-1">
            Enter OTP Verification Code
          </Paragraph3>
          <Paragraph1 className="text-sm text-gray-600 max-w-[350px]">
            We’ve sent a 6-digit verification code to your email address.
          </Paragraph1>
        </div>

        <Formik
          initialValues={{ otp: "" }}
          validationSchema={OtpSchema}
          onSubmit={(values, { setSubmitting }) => {
            verifyOtp.mutate(
              { code: values.otp },
              {
                onSuccess: () => router.push("/auth/login"),
                onSettled: () => setSubmitting(false),
              },
            );
          }}
        >
          {({ values, setFieldValue, isSubmitting, errors, touched }) => (
            <Form className="space-y-5">
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
                    value={values.otp[index] ?? ""}
                    onChange={(e) => {
                      if (!/^\d?$/.test(e.target.value)) return;

                      const otpArray = values.otp.split("");
                      otpArray[index] = e.target.value;

                      const newOtp = otpArray.join("").slice(0, OTP_LENGTH);
                      setFieldValue("otp", newOtp);

                      if (e.target.value && index < OTP_LENGTH - 1) {
                        inputsRef.current[index + 1]?.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (
                        e.key === "Backspace" &&
                        !values.otp[index] &&
                        index > 0
                      ) {
                        inputsRef.current[index - 1]?.focus();
                      }
                    }}
                    className="w-12 h-12 text-center text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none"
                  />
                ))}
              </div>

              {touched.otp && errors.otp && (
                <p className="text-sm text-red-500 text-center">{errors.otp}</p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting || verifyOtp.isPending}
                className="w-full py-3 font-semibold text-white bg-black rounded-lg disabled:opacity-50"
              >
                {verifyOtp.isPending ? "Verifying..." : "Verify"}
              </button>

              {verifyOtp.error && (
                <p className="text-sm text-red-500 text-center">
                  {(verifyOtp.error as Error).message}
                </p>
              )}

              {resendOtp.isSuccess && (
                <p className="text-sm text-green-600 text-center">
                  OTP sent again. Check your email.
                </p>
              )}
            </Form>
          )}
        </Formik>

        {/* Resend */}
        <button
          type="button"
          onClick={() => {
            if (!email) return;
            resendOtp.mutate({ email });
          }}
          disabled={resendOtp.isPending}
          className="flex w-full justify-center gap-1 items-center pt-4 text-sm text-black disabled:opacity-50"
        >
          <Paragraph1>Didn’t receive a code? Resend Code</Paragraph1>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default VerifyOTP;
