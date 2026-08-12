"use client";

import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { OnboardingShell } from "./OnboardingShell";
import { OnboardingHowItWorksSteps } from "./OnboardingHowItWorksSteps";
import { RenterRentOrBuyCards } from "./RenterRentOrBuyCards";
import { OnboardingPreferenceChips } from "./OnboardingPreferenceChips";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import {
  RENTER_ONBOARDING_STEPS,
  renterHowItWorksSteps,
} from "@/lib/onboarding/copy";
import { useOnboardingProgress } from "@/lib/onboarding/useOnboardingProgress";
import {
  markOnboardingComplete,
  shopPathForPreference,
} from "@/lib/onboarding/onboardingStorage";
import { useUserStore } from "@/store/useUserStore";

const stepMeta = [
  {
    title: "Welcome to RELISTED",
    subtitle: "Rent or buy from trusted listers.",
  },
  {
    title: "Rent or Buy",
    subtitle: "On each item, pick one action.",
  },
  {
    title: "How It Works",
    subtitle: "Browse, choose, then return or keep.",
  },
  {
    title: "Stay Protected",
    subtitle: "Quick verification keeps rentals and purchases secure.",
  },
  {
    title: "Find Your Next Fit",
    subtitle: "Where should we start?",
  },
] as const;

export function RenterOnboardingFlow() {
  const router = useRouter();
  const userId = useUserStore((s) => s.userId);
  const {
    step,
    shopPreference,
    hydrated,
    goNext,
    goBack,
    updateShopPreference,
    isFirstStep,
    isLastStep,
  } = useOnboardingProgress("renter", RENTER_ONBOARDING_STEPS);

  const finish = () => {
    markOnboardingComplete(userId, "renter");
    router.replace(shopPathForPreference(shopPreference));
  };

  const skipTour = () => {
    markOnboardingComplete(userId, "renter");
    router.replace(shopPathForPreference(shopPreference));
  };

  const skipVerification = () => {
    goNext();
  };

  if (!hydrated) {
    return (
      <div className="flex justify-center items-center bg-[#fafaf8] min-h-screen">
        <Paragraph3 className="text-gray-500 text-sm">Loading...</Paragraph3>
      </div>
    );
  }

  const meta = stepMeta[step];

  return (
    <OnboardingShell
      step={step}
      totalSteps={RENTER_ONBOARDING_STEPS}
      title={meta.title}
      subtitle={meta.subtitle}
      onBack={isFirstStep ? undefined : goBack}
      onNext={isLastStep ? finish : goNext}
      nextLabel={isLastStep ? "Start Shopping" : "Continue"}
      onSkip={step === 3 ? skipVerification : undefined}
      skipLabel="Skip for now"
      onSkipTour={skipTour}
      showBack={!isFirstStep}
    >
      {step === 0 ? (
        <div className="space-y-4">
          <div className="rounded-xl w-full h-48 overflow-hidden">
            <img
              src="/images/sin1.jpg"
              alt="RELISTED renter fashion"
              className="w-full h-full object-cover"
            />
          </div>
          <Paragraph1 className="text-gray-600 text-sm text-center leading-relaxed">
            Rent for the moment. Buy what you love.
          </Paragraph1>
        </div>
      ) : null}

      {step === 1 ? <RenterRentOrBuyCards /> : null}

      {step === 2 ? (
        <OnboardingHowItWorksSteps steps={renterHowItWorksSteps} />
      ) : null}

      {step === 3 ? (
        <div className="space-y-4">
          <div className="flex justify-center items-center bg-blue-50 mx-auto border border-blue-200 rounded-full w-14 h-14">
            <ShieldCheck className="w-7 h-7 text-blue-600" />
          </div>
          <Paragraph1 className="text-gray-600 text-sm text-center leading-relaxed">
            Add BVN and ID now, or verify at checkout.
          </Paragraph1>
          <button
            type="button"
            onClick={() => router.push("/renters/account")}
            className="py-3 border-2 border-gray-800 rounded-lg w-full font-semibold text-gray-900 text-sm hover:bg-gray-50 transition"
          >
            Verify now
          </button>
        </div>
      ) : null}

      {step === 4 ? (
        <div className="space-y-6">
          <div className="rounded-xl w-full h-40 overflow-hidden">
            <img
              src="/images/dr3.jpg"
              alt="Browse RELISTED shop"
              className="w-full h-full object-cover"
            />
          </div>
          <OnboardingPreferenceChips
            value={shopPreference}
            onChange={updateShopPreference}
          />
        </div>
      ) : null}
    </OnboardingShell>
  );
}
