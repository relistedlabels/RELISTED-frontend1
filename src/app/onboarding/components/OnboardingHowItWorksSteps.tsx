"use client";

import { Paragraph1, Paragraph3 } from "@/common/ui/Text";

type Step = {
  title: string;
  description: string;
};

type OnboardingHowItWorksStepsProps = {
  steps: readonly Step[];
};

export function OnboardingHowItWorksSteps({
  steps,
}: OnboardingHowItWorksStepsProps) {
  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <div key={step.title} className="flex gap-3">
          <div className="flex flex-shrink-0 justify-center items-center bg-black rounded-full w-8 h-8">
            <span className="font-bold text-white text-sm">{index + 1}</span>
          </div>
          <div className="pt-0.5">
            <Paragraph1 className="mb-0.5 font-semibold text-gray-900 text-sm">
              {step.title}
            </Paragraph1>
            <Paragraph3 className="text-gray-600 text-xs leading-relaxed">
              {step.description}
            </Paragraph3>
          </div>
        </div>
      ))}
    </div>
  );
}
