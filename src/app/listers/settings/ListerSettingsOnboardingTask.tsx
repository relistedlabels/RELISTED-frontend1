"use client";

import { Suspense } from "react";
import { OnboardingTaskMount } from "@/app/onboarding/components/OnboardingTaskMount";

export function ListerSettingsOnboardingTask() {
  return (
    <Suspense fallback={null}>
      <OnboardingTaskMount />
    </Suspense>
  );
}
