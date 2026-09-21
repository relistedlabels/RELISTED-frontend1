"use client";

import type { ReactNode } from "react";

export function CheckoutFieldLabel({ children }: { children: ReactNode }) {
  return (
    <span className="font-medium text-[10px] text-gray-500 uppercase tracking-[0.12em]">
      {children}
    </span>
  );
}

type CheckoutReadonlyDetailProps = {
  label: string;
  value?: string | null;
  className?: string;
};

export function CheckoutReadonlyDetail({
  label,
  value,
  className = "mb-3",
}: CheckoutReadonlyDetailProps) {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  return (
    <div className={className}>
      <CheckoutFieldLabel>{label}</CheckoutFieldLabel>
      <p className="mt-0.5 text-gray-900 text-sm leading-snug">{trimmed}</p>
    </div>
  );
}

type CheckoutLabeledBlockProps = {
  label: string;
  children: ReactNode;
  className?: string;
};

/** Label + content with the same gap as readonly contact fields. */
export function CheckoutLabeledBlock({
  label,
  children,
  className,
}: CheckoutLabeledBlockProps) {
  return (
    <div className={className}>
      <CheckoutFieldLabel>{label}</CheckoutFieldLabel>
      <div className="mt-0.5 space-y-3">{children}</div>
    </div>
  );
}
