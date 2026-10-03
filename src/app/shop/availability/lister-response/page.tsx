"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import { Header1Plus, Paragraph1 } from "@/common/ui/Text";

type Outcome = "accepted" | "rejected" | "error";

function normalizeOutcome(value: string | null): Outcome {
  if (value === "accepted" || value === "rejected" || value === "error") {
    return value;
  }
  return "error";
}

export default function ListerAvailabilityResponsePage() {
  const searchParams = useSearchParams();
  const outcome = normalizeOutcome(searchParams.get("outcome"));
  const requestId = searchParams.get("requestId") ?? "";
  const productName = searchParams.get("productName") ?? "this item";
  const requestType = searchParams.get("requestType") ?? "rental";
  const message =
    searchParams.get("message") ??
    "This response link is no longer valid. Open your lister dashboard to review the request.";

  const isPurchase = requestType === "purchase";
  const isAccepted = outcome === "accepted";
  const isRejected = outcome === "rejected";
  const isError = outcome === "error";

  const dashboardHref = requestId
    ? `/listers/orders/${encodeURIComponent(requestId)}`
    : "/listers/orders";

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 py-16 text-center">
      <div
        className={`mb-6 flex h-16 w-16 items-center justify-center rounded-full ${
          isAccepted
            ? "bg-green-50 text-green-700"
            : isRejected
              ? "bg-gray-100 text-gray-700"
              : "bg-red-50 text-red-600"
        }`}
      >
        {isError ? (
          <XCircle className="h-8 w-8" />
        ) : (
          <CheckCircle2 className="h-8 w-8" />
        )}
      </div>

      <Header1Plus className="mb-3">
        {isAccepted
          ? "Availability confirmed"
          : isRejected
            ? "Response recorded"
            : "Link unavailable"}
      </Header1Plus>

      <Paragraph1 className="max-w-md text-gray-600 leading-relaxed">
        {isAccepted &&
          (isPurchase
            ? `You confirmed ${productName} is available to buy. The buyer has been notified.`
            : `You confirmed ${productName} is available for these dates. The renter has been notified.`)}
        {isRejected &&
          (isPurchase
            ? `You marked ${productName} as not available to buy. The buyer has been notified.`
            : `You marked ${productName} as not available for these dates. The renter has been notified.`)}
        {isError && message}
      </Paragraph1>

      {!isError && (
        <Paragraph1 className="mt-3 max-w-md text-sm text-gray-500">
          {isAccepted
            ? "We will let them know they can complete checkout."
            : "No further action is needed from you."}
        </Paragraph1>
      )}

      <div className="mt-8 flex w-full max-w-sm flex-col gap-3 sm:flex-row">
        <Link
          href={dashboardHref}
          className="inline-flex flex-1 items-center justify-center rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-900"
        >
          View in dashboard
        </Link>
        <Link
          href="/listers/orders"
          className="inline-flex flex-1 items-center justify-center rounded-lg border border-gray-300 px-4 py-3 text-sm font-semibold transition hover:bg-gray-50"
        >
          All requests
        </Link>
      </div>
    </div>
  );
}
