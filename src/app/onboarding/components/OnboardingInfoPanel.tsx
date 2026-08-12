"use client";

import type { LucideIcon } from "lucide-react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";

type OnboardingInfoPanelProps = {
  icon: LucideIcon;
  title?: string;
  body: string;
  footnote?: string;
  iconClassName?: string;
  iconWrapClassName?: string;
};

export function OnboardingInfoPanel({
  icon: Icon,
  title,
  body,
  footnote,
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
        <Paragraph1 className="font-semibold text-gray-900 text-sm text-center">
          {title}
        </Paragraph1>
      ) : null}
      <Paragraph1 className="text-gray-600 text-sm text-center leading-relaxed">
        {body}
      </Paragraph1>
      {footnote ? (
        <Paragraph3 className="text-gray-500 text-xs text-center leading-relaxed">
          {footnote}
        </Paragraph3>
      ) : null}
    </div>
  );
}
