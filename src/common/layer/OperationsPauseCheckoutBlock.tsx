"use client";

import Link from "next/link";
import { useOperationsPause } from "@/lib/queries/site/useOperationsPause";
import { operationsPauseCopy } from "@/lib/operations/operationsPauseCopy";
import { Header1Plus, Paragraph1 } from "@/common/ui/Text";

type OperationsPauseCheckoutBlockProps = {
  className?: string;
};

export function OperationsPauseCheckoutBlock({
  className = "",
}: OperationsPauseCheckoutBlockProps) {
  const { active, isLoading, ...pause } = useOperationsPause();
  const copy = operationsPauseCopy.checkout;

  if (isLoading || !active) return null;

  return (
    <div
      className={`mx-auto max-w-lg rounded-2xl border border-gray-200 bg-white px-6 py-10 text-center shadow-sm ${className}`}
    >
      <Header1Plus className="mb-3 font-serif text-2xl text-gray-900">
        {copy.headline}
      </Header1Plus>
      <Paragraph1 className="mb-6 text-gray-600 leading-relaxed">
        {copy.body(pause)}
      </Paragraph1>
      <Link
        href="/shop"
        className="inline-flex rounded-full bg-[#0a0a0a] px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
      >
        {copy.cta}
      </Link>
    </div>
  );
}
