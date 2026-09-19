"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Header1Plus, Paragraph1 } from "@/common/ui/Text";
import { useQuery } from "@tanstack/react-query";
import { getPublicAvailabilityStatus } from "@/lib/api/publicAvailability";
import { useRequestMagicLink } from "@/lib/mutations";
import { useState } from "react";

export default function AvailabilityAvailablePage() {
  const searchParams = useSearchParams();
  const requestId = searchParams.get("requestId") ?? "";
  const token = searchParams.get("token") ?? "";
  const [linkSent, setLinkSent] = useState(false);

  const requestMagicLink = useRequestMagicLink();

  const { data, isLoading } = useQuery({
    queryKey: ["availability-status", requestId, token],
    queryFn: () => getPublicAvailabilityStatus(requestId, token),
    enabled: Boolean(requestId && token),
  });

  const productName = data?.data?.productName ?? "this piece";
  const totalPrice = data?.data?.totalPrice;
  const requesterEmail = data?.data?.requesterEmail as string | null | undefined;
  const isPurchase = data?.data?.rentalDays === 0;

  const completeRentalUrl = data?.data?.completeRentalUrl;

  const handleLoginLink = () => {
    if (completeRentalUrl) {
      window.location.href = completeRentalUrl;
      return;
    }
    if (!requesterEmail) {
      window.location.href = "/auth/sign-in?redirect=/shop/cart/checkout";
      return;
    }
    setLinkSent(false);
    requestMagicLink.mutate(
      {
        email: requesterEmail,
        redirect: "/shop/cart/checkout",
      },
      { onSuccess: () => setLinkSent(true) },
    );
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-700">
        <CheckCircle2 className="h-8 w-8" />
      </div>
      <Header1Plus className="mb-3">It&apos;s available!</Header1Plus>
      <Paragraph1 className="max-w-md text-gray-600 leading-relaxed">
        {isLoading
          ? "Loading your details…"
          : isPurchase
            ? `${productName} is available to buy. Tap the button below and we will email you a one-tap sign-in link to complete checkout.`
            : `${productName} is available for your dates. Tap the button below and we will email you a one-tap sign-in link to complete checkout.`}
      </Paragraph1>
      {totalPrice ? (
        <Paragraph1 className="mt-2 text-lg font-bold text-gray-900">
          {isPurchase ? "Buy for" : "Rent for"} ₦
          {Number(totalPrice).toLocaleString()}
        </Paragraph1>
      ) : null}

      <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        <button
          type="button"
          onClick={handleLoginLink}
          disabled={requestMagicLink.isPending}
          className="flex-1 rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {requestMagicLink.isPending
            ? "Sending link…"
            : "Email me a login link"}
        </button>
        <Link
          href="/shop?listingType=RENTAL,RENT_OR_RESALE"
          className="flex-1 inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-3 text-sm font-semibold hover:bg-gray-50"
        >
          Continue shopping
        </Link>
      </div>

      {linkSent && (
        <Paragraph1 className="mt-4 max-w-md text-sm text-green-600">
          Login link sent. Check your inbox and tap the link to sign in and
          checkout.
        </Paragraph1>
      )}
    </div>
  );
}
