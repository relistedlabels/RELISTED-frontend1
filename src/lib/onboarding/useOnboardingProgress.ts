"use client";

import { useCallback, useLayoutEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  type OnboardingProgress,
  type OnboardingRole,
  type RenterShopPreference,
  peekPendingOnboardingResume,
  readOnboardingProgressForUser,
  resetOnboardingForManualTour,
  writeOnboardingProgress,
} from "@/lib/onboarding/onboardingStorage";
import { useOnboardingUserId } from "@/lib/onboarding/useOnboardingUserId";

export function useOnboardingProgress(role: OnboardingRole, totalSteps: number) {
  const userId = useOnboardingUserId();
  const searchParams = useSearchParams();
  const isManualTour = searchParams.get("manual") === "1";
  const resumeStepParam = searchParams.get("resumeStep");
  const [step, setStep] = useState(0);
  const [shopPreference, setShopPreference] =
    useState<RenterShopPreference>("all");
  const [hydrated, setHydrated] = useState(false);

  const applyResumeStep = useCallback(
    (rawStep: number) => {
      const resumeStep = Math.min(Math.max(rawStep, 0), totalSteps - 1);
      const saved = readOnboardingProgressForUser(userId, role);
      setStep(resumeStep);
      writeOnboardingProgress(userId, role, {
        step: resumeStep,
        shopPreference: saved?.shopPreference,
        completedAt: saved?.completedAt,
        dismissedAt: saved?.dismissedAt,
        activeTask: null,
        resumeStepAfterTask: null,
      });
      setHydrated(true);
    },
    [role, totalSteps, userId],
  );

  useLayoutEffect(() => {
    if (isManualTour) {
      resetOnboardingForManualTour(userId, role);
      setStep(0);
      setHydrated(true);
      return;
    }

    if (resumeStepParam != null && resumeStepParam !== "") {
      const parsed = Number(resumeStepParam);
      if (Number.isFinite(parsed)) {
        applyResumeStep(parsed);
        return;
      }
    }

    const pending = peekPendingOnboardingResume(userId, role);
    if (pending != null) {
      applyResumeStep(pending);
      return;
    }

    const saved = readOnboardingProgressForUser(userId, role);
    if (saved && !saved.completedAt) {
      setStep(Math.min(saved.step, totalSteps - 1));
      if (saved.shopPreference) setShopPreference(saved.shopPreference);
    }
    setHydrated(true);
  }, [userId, role, isManualTour, resumeStepParam, applyResumeStep]);

  const persist = useCallback(
    (next: Partial<OnboardingProgress>) => {
      const existing = readOnboardingProgressForUser(userId, role);
      const progress: OnboardingProgress = {
        step,
        shopPreference,
        completedAt: existing?.completedAt,
        dismissedAt: existing?.dismissedAt,
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
