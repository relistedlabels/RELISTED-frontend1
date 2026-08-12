"use client";

import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { listerSaleTypeOptions } from "@/lib/onboarding/copy";
import { onboardingStepIconMap } from "./onboardingStepIcons";

export function ListerSaleTypeCards() {
  return (
    <div className="space-y-3">
      {listerSaleTypeOptions.map((option) => {
        const Icon = onboardingStepIconMap[option.icon];
        return (
          <div
            key={option.id}
            className="p-4 border-2 border-gray-200 rounded-xl"
          >
            <div className="flex items-start gap-3">
              <div className="flex flex-shrink-0 justify-center items-center bg-gray-100 rounded-full w-10 h-10">
                <Icon className="w-5 h-5 text-gray-800" aria-hidden />
              </div>
              <div className="min-w-0">
                <Paragraph1 className="font-semibold text-gray-900 text-sm leading-snug">
                  {option.title}
                </Paragraph1>
                <Paragraph3 className="mt-1 text-gray-600 text-xs leading-relaxed">
                  {option.description}
                </Paragraph3>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
