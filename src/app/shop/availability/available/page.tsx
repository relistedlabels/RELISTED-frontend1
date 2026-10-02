"use client";

import { useQuery } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Header1Plus, Paragraph1 } from "@/common/ui/Text";
import {
  getAuthenticatedAvailabilityStatus,
  getPublicAvailabilityStatus,
} from "@/lib/api/publicAvailability";
import { useRequestMagicLink } from "@/lib/mutations";
import { useUserStore } from "@/store/useUserStore";

export default function AvailabilityAvailablePage() {
  const searchParams = useSearchParams();
  const requestId = searchParams.get("requestId") ?? "";
  const token = searchParams.get("token") ?? "";
  const [linkSent, setLinkSent] = useState(false);

  const requestMagicLink = useRequestMagicLink();
  const signedInUserId = useUserStore((s) => s.userId);

  const { data, isLoading } = useQuery({
    queryKey: ["availability-status", requestId, token],
    queryFn: () => getPublicAvailabilityStatus(requestId, token),
    enabled: Boolean(requestId && token),
    refetchInterval: (query) =>
      query.state.data?.data?.status === "available" ? false : 15000,
  });
  const { data: signedInStatus } = useQuery({
    queryKey: [
      "availability-status",
      requestId,
      "authenticated",
      signedInUserId,
    ],
    queryFn: () => getAuthenticatedAvailabilityStatus(requestId),
    enabled: Boolean(requestId && signedInUserId && !token),
    refetchInterval: (query) =>
      query.state.data?.data?.status === "available" ? false : 15000,
  });

  const statusData = token ? data?.data : signedInStatus?.data;
  const productName = statusData?.productName ?? "this piece";
  const totalPrice = statusData?.totalPrice;
  const requesterEmail = statusData?.requesterEmail as
    | string
    | null
    | undefined;
  const isPurchase = statusData?.rentalDays === 0;

  const completeRentalUrl = statusData?.completeRentalUrl;
  const signedInEmail = useUserStore((s) => s.email);
  const signedInRole = useUserStore((s) => s.role);
  const isSignedInAsRequester = Boolean(
    signedInUserId &&
      signedInEmail &&
      requesterEmail &&
      signedInEmail.toLowerCase() === requesterEmail.toLowerCase(),
  );
  const isApprovedForSignedInUser =
    Boolean(signedInUserId) &&
    (signedInRole === "SHOPPER" || isSignedInAsRequester) &&
    (signedInStatus?.data?.status ?? data?.data?.status) === "available" &&
    !statusData?.canStillBeApproved;

  const handleLoginLink = () => {
    if (isApprovedForSignedInUser) {
      window.location.href = "/shop/cart/checkout";
      return;
    }
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
        {isLoading && !signedInStatus
          ? "Loading your details…"
          : `${productName} is available ${isPurchase ? "to buy" : "for your dates"}. Continue to checkout to complete your order.`}
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
          {requestMagicLink.isPending ? "Please wait…" : "Continue to checkout"}
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
          We emailed you a sign-in link. Tap it to continue to checkout.
        </Paragraph1>
      )}
    </div>
  );
}
