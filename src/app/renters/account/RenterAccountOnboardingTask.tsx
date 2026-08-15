"use client";

import { Suspense } from "react";
import { OnboardingTaskMount } from "@/app/onboarding/components/OnboardingTaskMount";

export function RenterAccountOnboardingTask() {
  return (
    <Suspense fallback={null}>
      <OnboardingTaskMount />
    </Suspense>
  );
}
