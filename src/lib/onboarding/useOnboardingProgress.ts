"use client";

import { useCallback, useEffect, useState } from "react";
import { useUserStore } from "@/store/useUserStore";
import {
  type OnboardingProgress,
  type OnboardingRole,
  type RenterShopPreference,
  readOnboardingProgress,
  writeOnboardingProgress,
} from "@/lib/onboarding/onboardingStorage";

export function useOnboardingProgress(role: OnboardingRole, totalSteps: number) {
  const userId = useUserStore((s) => s.userId);
  const [step, setStep] = useState(0);
  const [shopPreference, setShopPreference] =
    useState<RenterShopPreference>("all");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = readOnboardingProgress(userId, role);
    if (saved && !saved.completedAt) {
      setStep(Math.min(saved.step, totalSteps - 1));
      if (saved.shopPreference) setShopPreference(saved.shopPreference);
    }
    setHydrated(true);
  }, [userId, role, totalSteps]);

  const persist = useCallback(
    (next: Partial<OnboardingProgress>) => {
      const existing = readOnboardingProgress(userId, role);
      const progress: OnboardingProgress = {
        step,
        shopPreference,
        activeTask: existing?.activeTask ?? null,
        resumeStepAfterTask: existing?.resumeStepAfterTask ?? null,
        ...next,
      };
      writeOnboardingProgress(userId, role, progress);
    },
    [userId, role, step, shopPreference],
  );

  const goNext = useCallback(() => {
    setStep((current) => {
      const next = Math.min(current + 1, totalSteps - 1);
      persist({ step: next, shopPreference });
      return next;
    });
  }, [persist, shopPreference, totalSteps]);

  const goBack = useCallback(() => {
    setStep((current) => {
      const next = Math.max(current - 1, 0);
      persist({ step: next, shopPreference });
      return next;
    });
  }, [persist, shopPreference]);

  const updateShopPreference = useCallback(
    (preference: RenterShopPreference) => {
      setShopPreference(preference);
      persist({ step, shopPreference: preference });
    },
    [persist, step],
  );

  return {
    step,
    shopPreference,
    hydrated,
    goNext,
    goBack,
    updateShopPreference,
    isFirstStep: step === 0,
    isLastStep: step === totalSteps - 1,
  };
}
