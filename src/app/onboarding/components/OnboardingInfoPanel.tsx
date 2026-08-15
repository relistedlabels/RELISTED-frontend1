"use client";

import type { LucideIcon } from "lucide-react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { ONBOARDING_SECONDARY_TEXT } from "@/lib/onboarding/onboardingTypography";

type OnboardingInfoPanelProps = {
  icon: LucideIcon;
  title?: string;
  body?: string;
  footnote?: string;
  bodyClassName?: string;
  footnoteClassName?: string;
  iconClassName?: string;
  iconWrapClassName?: string;
};

export function OnboardingInfoPanel({
  icon: Icon,
  title,
  body,
  footnote,
  bodyClassName = ONBOARDING_SECONDARY_TEXT,
  footnoteClassName = ONBOARDING_SECONDARY_TEXT,
  iconClassName = "w-7 h-7 text-gray-700",
  iconWrapClassName = "bg-gray-100",
}: OnboardingInfoPanelProps) {
  return (
    <div className="space-y-4">
      <div
        className={`flex justify-center items-center mx-auto border border-gray-200 rounded-full w-16 h-16 ${iconWrapClassName}`}
      >
        <Icon className={iconClassName} aria-hidden />
      </div>
      {title ? (
        <Paragraph1 className="font-semibold text-gray-900 text-base text-center">
          {title}
        </Paragraph1>
      ) : null}
      {body ? (
        <Paragraph1
          className={`text-gray-600 text-center leading-relaxed ${bodyClassName}`}
        >
          {body}
        </Paragraph1>
      ) : null}
      {footnote ? (
        <Paragraph3
          className={`text-gray-500 text-center leading-relaxed ${footnoteClassName}`}
        >
          {footnote}
        </Paragraph3>
      ) : null}
    </div>
  );
}
