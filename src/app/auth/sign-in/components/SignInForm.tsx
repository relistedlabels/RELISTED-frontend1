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
import { isPublicBrowseRoute } from "@/lib/auth/signInRedirectPaths";
import { resolvePostAuthDestination } from "@/lib/onboarding/onboardingGate";
import { useLogin, useRequestMagicLink, useResendOtp } from "@/lib/mutations";
import { useUserStore } from "@/store/useUserStore";
import { buttonPrimaryFull } from "@/common/ui/buttonClasses";
import SocialSignInOptions from "./SocialSignInOptions";

const PasswordLoginSchema = Yup.object({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().required("Password is required"),
});

const MagicLinkSchema = Yup.object({
  email: Yup.string().email("Invalid email").required("Email is required"),
});

type SignInMode = "password" | "magic-link";

const isMagicLinkLoginError = (msg: string) =>
  /email login links|login link/i.test(msg);

const isVerificationError = (msg: string) =>
  /verify|verification|inbox/i.test(msg);

const SignInForm: React.FC = () => {
  const [mode, setMode] = useState<SignInMode>("password");
  const [showPassword, setShowPassword] = useState(false);
  const [emailForResend, setEmailForResend] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const login = useLogin();
  const requestMagicLink = useRequestMagicLink();
  const resendOtp = useResendOtp();
  const router = useRouter();

  const redirectUrl =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("redirect")
      : null;

  const handlePostAuthRedirect = async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const state = useUserStore.getState();

    if (state.requiresMfa) {
      router.push("/auth/OTP");
      return;
    }

    const isLister = state.role === "LISTER";
    const honorRedirect = Boolean(
      redirectUrl &&
        !(isLister && isPublicBrowseRoute(redirectUrl.split("?")[0] || "")),
    );

    window.location.href = resolvePostAuthDestination({
      role: state.role,
      userId: state.userId,
      redirectUrl,
      honorRedirect,
    });
  };

  return (
    <div className="font-sans-">
      <div className="bg-white p-4 md:p-8 pb-[100px] sm:pb-0 sm:rounded-3xl w-full sm:w-[500px] h-screen sm:h-fit text-gray-600 max-">
        <div className="flex flex-col justify-center items-center mb-8 text-center">
          <img src="/images/logo1.svg" alt="" className="mb-4 w-10 h-10" />
          <Paragraph3 className="mb-1 font-bold text-black text-2xl">
            Welcome Back
          </Paragraph3>
          <Paragraph1 className="max-w-[350px] text-gray-600 text-sm leading-relaxed">
            {mode === "magic-link"
              ? "Enter your email and we will send you a one-tap sign-in link."
              : "Explore fashion at your fingertips. Rent unique pieces or manage your listings with ease."}
          </Paragraph1>
        </div>

        {mode === "password" ? (
          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={PasswordLoginSchema}
            onSubmit={(values) => {
              setEmailForResend(values.email);
              login.mutate(values, {
                onSuccess: handlePostAuthRedirect,
              });
            }}
          >
            {() => (
              <Form className="space-y-5 p-3">
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

                <button
                  type="submit"
                  disabled={login.isPending}
                  className={`${buttonPrimaryFull} py-4`}
                >
                  {login.isPending ? "Signing in..." : "Sign in"}
                </button>

                {login.error && (
                  <div className="space-y-2">
                    <p className="text-red-500 text-sm">
                      {(login.error as Error).message}
                    </p>
                    {isMagicLinkLoginError((login.error as Error).message) && (
                      <button
                        type="button"
                        onClick={() => setMode("magic-link")}
                        className="font-medium text-black text-sm underline hover:no-underline"
                      >
                        Email me a login link
                      </button>
                    )}
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

                <button
                  type="button"
                  onClick={() => {
                    setMode("magic-link");
                    setMagicLinkSent(false);
                  }}
                  className="w-full text-sm font-medium text-gray-700 underline hover:no-underline"
                >
                  Email me a login link instead
                </button>
              </Form>
            )}
          </Formik>
        ) : (
          <Formik
            initialValues={{ email: emailForResend }}
            enableReinitialize
            validationSchema={MagicLinkSchema}
            onSubmit={(values) => {
              setEmailForResend(values.email);
              setMagicLinkSent(false);
              requestMagicLink.mutate(
                {
                  email: values.email,
                  redirect: redirectUrl ?? undefined,
                },
                {
                  onSuccess: () => setMagicLinkSent(true),
                },
              );
            }}
          >
            {() => (
              <Form className="space-y-5 p-3">
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

                <button
                  type="submit"
                  disabled={requestMagicLink.isPending}
                  className={`${buttonPrimaryFull} py-4`}
                >
                  {requestMagicLink.isPending
                    ? "Sending link…"
                    : "Email me a login link"}
                </button>

                {magicLinkSent && (
                  <p className="text-green-600 text-sm leading-relaxed">
                    If an account with that email exists, a login link has been
                    sent. Check your inbox and tap the link to sign in. You can
                    set a password later from your account settings.
                  </p>
                )}

                {requestMagicLink.error && (
                  <p className="text-red-500 text-sm">
                    {(requestMagicLink.error as Error).message}
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setMode("password");
                    setMagicLinkSent(false);
                  }}
                  className="w-full text-sm font-medium text-gray-700 underline hover:no-underline"
                >
                  Sign in with password instead
                </button>
              </Form>
            )}
          </Formik>
        )}

        <div className="mt-8">
          <SocialSignInOptions />
        </div>
      </div>
    </div>
  );
};

export default SignInForm;
