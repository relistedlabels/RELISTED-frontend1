"use client";

import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { listerSaleTypeOptions } from "@/lib/onboarding/copy";
import { onboardingStepIconMap } from "./onboardingStepIcons";

export function ListerSaleTypeCards() {
  return (
    <div className="gap-3 grid grid-cols-1 sm:grid-cols-3">
      {listerSaleTypeOptions.map((option) => {
        const Icon = onboardingStepIconMap[option.icon];
        return (
          <div
            key={option.id}
            className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg text-center"
          >
            <div className="flex justify-center items-center bg-gray-100 mb-3 rounded-full w-10 h-10">
              <Icon className="w-5 h-5 text-gray-800" aria-hidden />
            </div>
            <Paragraph1 className="font-semibold text-[15px]">
              {option.title}
            </Paragraph1>
            <Paragraph3 className="mt-1 text-gray-500 text-xs">
              {option.subtitle}
            </Paragraph3>
            <Paragraph3 className="mt-2 text-gray-600 text-xs leading-relaxed">
              {option.description}
            </Paragraph3>
          </div>
        );
      })}
    </div>
  );
}
