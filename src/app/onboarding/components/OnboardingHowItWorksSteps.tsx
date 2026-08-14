"use client";

import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import type { OnboardingStep } from "@/lib/onboarding/copy";
import { ONBOARDING_SECONDARY_TEXT } from "@/lib/onboarding/onboardingTypography";
import { onboardingStepIconMap } from "./onboardingStepIcons";

type OnboardingHowItWorksStepsProps = {
  steps: readonly OnboardingStep[];
};

export function OnboardingHowItWorksSteps({
  steps,
}: OnboardingHowItWorksStepsProps) {
  return (
    <div className="space-y-3">
      {steps.map((step) => {
        const Icon = onboardingStepIconMap[step.icon];
        return (
          <div
            key={step.title}
            className="flex items-start gap-3 p-3 border border-gray-100 rounded-xl"
          >
            <div className="flex flex-shrink-0 justify-center items-center bg-black rounded-full w-9 h-9">
              <Icon className="w-4 h-4 text-white" aria-hidden />
            </div>
            <div className="pt-0.5 min-w-0">
              <Paragraph1 className="mb-0.5 font-semibold text-gray-900 text-base">
                {step.title}
              </Paragraph1>
              <Paragraph3 className={`text-gray-600 ${ONBOARDING_SECONDARY_TEXT}`}>
                {step.description}
              </Paragraph3>
            </div>
          </div>
        );
      })}
    </div>
  );
}
