"use client";

import type { ReactNode } from "react";

type CheckoutSectionHeadingProps = {
  children: ReactNode;
  description?: string;
};

/** In-card section title. Visually below step intro headings. */
export default function CheckoutSectionHeading({
  children,
  description,
}: CheckoutSectionHeadingProps) {
  return (
    <div className={description ? "space-y-1.5" : undefined}>
      <h3 className="font-semibold text-gray-800 text-sm sm:text-[15px] leading-snug">
        {children}
      </h3>
      {description ? (
        <p className="text-gray-500 text-sm leading-[1.55]">{description}</p>
      ) : null}
    </div>
  );
}
