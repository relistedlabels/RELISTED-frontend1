"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Clock3, XCircle } from "lucide-react";
import { Header1Plus, Paragraph1 } from "@/common/ui/Text";
import { useQuery } from "@tanstack/react-query";
import {
  getAvailabilityShopFilters,
  getPublicAvailabilityStatus,
} from "@/lib/api/publicAvailability";
import { getAuthToken } from "@/lib/api/http";
import { useEffect, useMemo } from "react";
import { buildSimilarShopHref } from "@/lib/shop/buildSimilarShopHref";
import { usePublicProductById } from "@/lib/queries/product/usePublicProductById";
import TopListingSection from "@/app/shop/product-details/components/TopListingSection";

export default function AvailabilityCheckingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const requestId = searchParams.get("requestId") ?? "";
  const token = searchParams.get("token") ?? "";
  const productIdFromUrl = searchParams.get("productId") ?? "";
  const { data, isLoading } = useQuery({
    queryKey: ["availability-status", requestId, token],
    queryFn: () => getPublicAvailabilityStatus(requestId, token),
    enabled: Boolean(requestId && token),
    refetchInterval: (query) => {
      const s = query.state.data?.data?.status;
      return s === "checking" || s === "awaiting_lister" ? 15000 : false;
    },
  });
  const { data: shopFiltersData } = useQuery({
    queryKey: ["availability-shop-filters", requestId],
    queryFn: () => getAvailabilityShopFilters(requestId),
    enabled: Boolean(requestId),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
  const productId =
    productIdFromUrl || shopFiltersData?.data?.productId || "";
  const { data: productFromUrl } = usePublicProductById(productId);

  const status = data?.data?.status;
  const productName =
    data?.data?.productName ?? productFromUrl?.name ?? "this piece";
  const completeRentalUrl = data?.data?.completeRentalUrl;
  const isPurchase =
    data?.data?.rentalDays === 0 ||
    shopFiltersData?.data?.rentalDays === 0;
  const similarShopHref = useMemo(() => {
    const similarShop =
      shopFiltersData?.data?.similarShop ?? data?.data?.similarShop;

    if (similarShop) {
      return buildSimilarShopHref({
        isPurchase,
        ...similarShop,
      });
    }

    if (productFromUrl) {
      return buildSimilarShopHref({
        isPurchase,
        categoryId: productFromUrl.categoryId,
        brandName: productFromUrl.brand?.name ?? null,
        color: productFromUrl.color,
        size: productFromUrl.measurement,
        primaryTag: productFromUrl.tags?.[0]?.name ?? null,
      });
    }

    return buildSimilarShopHref({ isPurchase });
  }, [
    shopFiltersData?.data?.similarShop,
    data?.data?.similarShop,
    isPurchase,
    productFromUrl,
  ]);
  const isAvailable = status === "available";
  const isAwaitingLister = status === "awaiting_lister";
  const isDatesPassed = status === "dates_passed";
  const isUnavailable =
    status === "unavailable" ||
    status === "dates_passed" ||
    status === "cancelled";

  useEffect(() => {
    if (!isAvailable || !requestId || !token) return;
    if (getAuthToken()) {
      router.replace("/shop/cart");
      return;
    }
    const availableUrl =
      completeRentalUrl ??
      `/shop/availability/available?requestId=${encodeURIComponent(requestId)}&token=${encodeURIComponent(token)}`;
    router.replace(availableUrl);
  }, [isAvailable, requestId, token, completeRentalUrl, router]);

  if (isAvailable) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 py-16 text-center">
        <Header1Plus className="mb-3">It&apos;s available!</Header1Plus>
        <Paragraph1 className="text-gray-600">Taking you to your cart…</Paragraph1>
      </div>
    );
  }

  return (
    <div>
      <div className="flex min-h-[55vh] flex-col items-center justify-center px-6 py-16 text-center">
        <div
          className={`mb-6 flex h-16 w-16 items-center justify-center rounded-full ${
            isUnavailable
              ? "bg-red-50 text-red-600"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          {isUnavailable ? (
            <XCircle className="h-8 w-8" />
          ) : (
            <Clock3 className="h-8 w-8" />
          )}
        </div>

        <Header1Plus className="mb-3">
          {isLoading && !status
            ? "Loading…"
            : isDatesPassed
              ? "These dates have passed"
              : isUnavailable
                ? "Not available"
                : isAwaitingLister
                  ? "Still waiting on the lister"
                  : "We're checking availability"}
        </Header1Plus>

        <Paragraph1 className="max-w-md text-gray-600 leading-relaxed">
          {isDatesPassed &&
            (isPurchase
              ? `These dates are no longer valid for ${productName}. Check again if you would still like to buy it.`
              : `These rental dates have passed for ${productName}. Check again with new dates if you are still interested.`)}
          {isUnavailable &&
            !isDatesPassed &&
            (isPurchase
              ? `Sorry, ${productName} is not available to buy right now.`
              : `Sorry, ${productName} is not available for your dates right now.`)}
          {isAwaitingLister &&
            (isPurchase
              ? `We have not heard back yet on ${productName}. The lister can still confirm while your request is valid. We will email you if it is available.`
              : `We have not heard back yet on your dates for ${productName}. The lister can still confirm while your dates are valid. We will email you if it is available.`)}
          {!isUnavailable &&
            !isAwaitingLister &&
            (isPurchase
              ? "We've asked the lister to confirm this item is still available. We'll notify you by email as soon as we hear back."
              : "We've asked the lister to confirm your dates. We'll notify you by email as soon as we hear back.")}
        </Paragraph1>

        <div className="mt-8 flex w-full max-w-sm flex-col gap-3 sm:flex-row">
          <Link
            href={similarShopHref}
            className="inline-flex flex-1 items-center justify-center rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-900"
          >
            View similar pieces
          </Link>
          <Link
            href="/shop?listingType=RENTAL,RENT_OR_RESALE"
            className="inline-flex flex-1 items-center justify-center rounded-lg border border-gray-300 px-4 py-3 text-sm font-semibold transition hover:bg-gray-50"
          >
            Continue shopping
          </Link>
        </div>
      </div>

      {productId ? <TopListingSection productId={productId} /> : null}
    </div>
  );
}
