"use client";

import { Paragraph1, Paragraph3 } from "@/common/ui/Text";

type CheckoutStepIntroProps = {
  title: string;
  subtitle?: string;
};

export default function CheckoutStepIntro({
  title,
  subtitle,
}: CheckoutStepIntroProps) {
  return (
    <header className="mb-5 px-5">
      <Paragraph3 className="font-bold text-gray-900 text-lg leading-snug">
        {title}
      </Paragraph3>
      {subtitle ? (
        <Paragraph1 className="mt-2 font-medium text-gray-800 text-sm leading-relaxed">
          {subtitle}
        </Paragraph1>
      ) : null}
    </header>
  );
}
