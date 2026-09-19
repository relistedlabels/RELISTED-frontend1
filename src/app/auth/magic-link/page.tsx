"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { getAuthToken } from "@/lib/api/http";
import { useConsumeMagicLink } from "@/lib/mutations";
import { resolvePostAuthDestination } from "@/lib/onboarding/onboardingGate";
import { useUserStore } from "@/store/useUserStore";

function safeRedirect(path: string | null): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return "/shop/cart/checkout";
  }
  return path;
}

function redirectToPostAuthDestination(redirectParam: string | null) {
  const state = useUserStore.getState();
  const destination = resolvePostAuthDestination({
    role: state.role,
    userId: state.userId,
    redirectUrl: safeRedirect(redirectParam),
    honorRedirect: true,
  });
  window.location.href = destination;
}

function redirectLoggedInUserToCart() {
  const state = useUserStore.getState();
  const destination = resolvePostAuthDestination({
    role: state.role,
    userId: state.userId,
    redirectUrl: "/shop/cart",
    honorRedirect: true,
  });
  window.location.href = destination;
}

export default function MagicLinkPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const redirectParam = searchParams.get("redirect");
  const consumeStartedRef = useRef(false);
  const [redirecting, setRedirecting] = useState(false);

  const consume = useConsumeMagicLink();

  useEffect(() => {
    if (!token || consumeStartedRef.current) return;
    consumeStartedRef.current = true;

    if (getAuthToken()) {
      setRedirecting(true);
      redirectLoggedInUserToCart();
      return;
    }

    consume.mutate(token, {
      onSuccess: async () => {
        await new Promise((r) => setTimeout(r, 300));
        setRedirecting(true);
        redirectToPostAuthDestination(redirectParam);
      },
      onError: () => {
        if (getAuthToken()) {
          setRedirecting(true);
          redirectLoggedInUserToCart();
        }
      },
    });
  }, [token, consume, redirectParam]);

  const loading =
    redirecting || consume.isPending || (consume.isSuccess && !consume.isError);
  const failed = consume.isError && !redirecting;

  return (
    <div
      className="relative w-full min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/images/authbg.jpg')" }}
    >
      <motion.div className="absolute inset-0 bg-black/10" />
      <div className="relative flex min-h-screen items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-lg">
          <img
            src="/images/logo1.svg"
            alt="Relisted"
            className="mx-auto mb-4 h-10 w-10"
          />
          <Paragraph3 className="mb-2 text-2xl font-bold text-black">
            {!token
              ? "Invalid link"
              : loading
                ? "Signing you in…"
                : failed
                  ? "Link expired"
                  : "Welcome back"}
          </Paragraph3>
          <Paragraph1 className="text-sm leading-relaxed text-gray-600">
            {!token &&
              "This sign-in link is missing or invalid. Request a new one from the sign-in page."}
            {token && loading && (
              <span className="inline-flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                One moment while we sign you in.
              </span>
            )}
            {failed &&
              ((consume.error as Error)?.message ||
                "This link has expired. Request a fresh login link.")}
          </Paragraph1>
          {(failed || !token) && (
            <Link
              href="/auth/sign-in"
              className="mt-6 inline-block rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
            >
              Back to sign in
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
