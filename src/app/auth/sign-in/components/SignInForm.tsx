"use client";

import { ErrorMessage, Field, Form, Formik } from "formik";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import {
  HiEyeSlash,
  HiOutlineEnvelope,
  HiOutlineEye,
  HiOutlineLockClosed,
} from "react-icons/hi2";
import * as Yup from "yup";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { useLogin, useResendOtp } from "@/lib/mutations";
import { useUserStore } from "@/store/useUserStore";
import SocialSignInOptions from "./SocialSignInOptions";

const LoginSchema = Yup.object({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().required("Password is required"),
});

const SignInForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [emailForResend, setEmailForResend] = useState("");
  const login = useLogin();
  const resendOtp = useResendOtp();
  const router = useRouter();

  const isVerificationError = (msg: string) =>
    /verify|verification|inbox/i.test(msg);

  return (
    <div className="font-sans-">
      <div className="bg-white p-4 md:p-8 pb-[100px] sm:pb-0 sm:rounded-3xl w-full sm:w-[500px] h-screen sm:h-fit text-gray-600 max-">
        {/* Header */}
        <div className="flex flex-col justify-center items-center mb-8 text-center">
          <img src="/images/logo1.svg" alt="" className="mb-4 w-10 h-10" />
          <Paragraph3 className="mb-1 font-bold text-black text-2xl">
            Welcome Back
          </Paragraph3>
          <Paragraph1 className="max-w-[350px] text-gray-600 text-sm leading-relaxed">
            Explore fashion at your fingertips — rent unique pieces or manage
            your listings with ease.
          </Paragraph1>
        </div>

        {/* Form */}
        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={LoginSchema}
          onSubmit={(values) => {
            setEmailForResend(values.email);
            login.mutate(values, {
              onSuccess: async () => {
                // Wait a bit for state to be fully updated and cookies to be set
                await new Promise((resolve) => setTimeout(resolve, 500));

                const state = useUserStore.getState();

                if (state.requiresMfa) {
                  router.push("/auth/OTP");
                } else {
                  const params = new URLSearchParams(window.location.search);
                  const redirectUrl = params.get("redirect");
                  if (redirectUrl) {
                    window.location.href = redirectUrl;
                  } else if (state.role === "LISTER") {
                    window.location.href = "/listers/dashboard";
                  } else {
                    window.location.href = "/";
                  }
                }
              },
            });
          }}
        >
          {() => (
            <Form className="space-y-5">
              {/* Email */}
              <div>
                <Paragraph1 className="mb-2 font-medium text-sm">
                  Email Address
                </Paragraph1>

                <div className="relative">
                  <HiOutlineEnvelope className="top-1/2 left-4 absolute w-5 h-5 text-gray-400 -translate-y-1/2" />
                  <Field
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    className="p-4 pl-12 border border-gray-300 rounded-lg w-full"
                  />
                </div>

                <ErrorMessage
                  name="email"
                  component="p"
                  className="mt-1 text-red-500 text-sm"
                />
              </div>

              {/* Password */}
              <div>
                <Paragraph1 className="mb-2 font-medium text-sm">
                  Password
                </Paragraph1>

                <div className="relative">
                  <HiOutlineLockClosed className="top-1/2 left-4 absolute w-5 h-5 text-gray-400 -translate-y-1/2" />

                  <Field
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="p-4 pr-12 pl-12 border border-gray-300 rounded-lg w-full"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="top-1/2 right-4 absolute -translate-y-1/2"
                  >
                    {showPassword ? (
                      <HiEyeSlash className="w-5 h-5" />
                    ) : (
                      <HiOutlineEye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                <ErrorMessage
                  name="password"
                  component="p"
                  className="mt-1 text-red-500 text-sm"
                />

                <div className="flex justify-end mt-2">
                  <Link
                    href="/auth/forgot-password"
                    className="font-medium text-sm"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={login.isPending}
                className="bg-black disabled:opacity-50 py-4 rounded-lg w-full font-semibold text-white"
              >
                {login.isPending ? "Signing in..." : "Sign in"}
              </button>

              {login.error && (
                <div className="space-y-2">
                  <p className="text-red-500 text-sm">
                    {(login.error as Error).message}
                  </p>
                  {isVerificationError((login.error as Error).message) &&
                    emailForResend && (
                      <button
                        type="button"
                        onClick={() =>
                          resendOtp.mutate({ email: emailForResend })
                        }
                        disabled={resendOtp.isPending}
                        className="disabled:opacity-50 font-medium text-black text-sm underline hover:no-underline"
                      >
                        {resendOtp.isPending
                          ? "Sending…"
                          : "Resend verification link"}
                      </button>
                    )}
                  {resendOtp.isSuccess && (
                    <p className="text-green-600 text-sm">
                      A new link has been sent. Check your inbox.
                    </p>
                  )}
                </div>
              )}
            </Form>
          )}
        </Formik>

        {/* Social Login */}
        <div className="mt-8">
          <SocialSignInOptions />
        </div>
      </div>
    </div>
  );
};

export default SignInForm;
