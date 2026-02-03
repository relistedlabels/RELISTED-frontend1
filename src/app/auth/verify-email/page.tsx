"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { useVerifyOtp } from "@/lib/mutations";
import Link from "next/link";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [verified, setVerified] = useState(false);
  const [checked, setChecked] = useState(false);

  const verifyOtp = useVerifyOtp();

  useEffect(() => {
    if (!token || checked) return;
    setChecked(true);
    verifyOtp.mutate(
      { code: token },
      {
        onSuccess: () => setVerified(true),
        onSettled: () => {},
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once when token is present
  }, [token]);

  useEffect(() => {
    if (!verified) return;
    const t = setTimeout(() => router.replace("/auth/sign-in"), 3000);
    return () => clearTimeout(t);
  }, [verified, router]);

  return (
    <div
      className="relative w-full min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/images/authbg.jpg')" }}
    >
      <motion.div
        className="absolute inset-0 bg-black/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />
      <motion.div
        className="relative flex flex-col items-center justify-center min-h-screen text-white sm:px-6 sm:py-20"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="w-full max-w-md bg-white rounded-3xl p-8 text-gray-900 shadow-lg">
          <div className="text-center flex flex-col items-center">
            <img
              src="/images/logo1.svg"
              alt="Relisted"
              className="h-10 w-10 mb-4"
            />
            <Paragraph3 className="text-2xl font-bold text-black mb-2">
              {!token
                ? "Check your email"
                : verifyOtp.isPending
                  ? "Verifying your email…"
                  : verified
                    ? "Email verified"
                    : verifyOtp.isError
                      ? "Verification failed"
                      : "Verifying…"}
            </Paragraph3>
            <Paragraph1 className="text-sm text-gray-600 max-w-[320px]">
              {!token &&
                "We’ve sent a verification link to your email. Click the link to verify your account."}
              {token &&
                verifyOtp.isPending &&
                "Please wait while we verify your email."}
              {token &&
                verified &&
                "Your email is verified. Redirecting you to sign in…"}
              {token && verifyOtp.isError && (
                <>
                  {(verifyOtp.error as Error).message} The link may have
                  expired. You can request a new one from the sign-in page.
                </>
              )}
            </Paragraph1>
          </div>

          {verified && (
            <p className="mt-4 text-center text-sm text-green-600">
              Redirecting to sign in…
            </p>
          )}

          {verifyOtp.isError && (
            <div className="mt-6 text-center">
              <Link
                href="/auth/sign-in"
                className="inline-block py-3 px-6 font-semibold text-white bg-black rounded-lg hover:opacity-90"
              >
                Go to sign in
              </Link>
            </div>
          )}

          {!token && (
            <div className="mt-6 text-center">
              <Link
                href="/auth/sign-in"
                className="inline-block py-3 px-6 font-semibold text-white bg-black rounded-lg hover:opacity-90"
              >
                Back to sign in
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
