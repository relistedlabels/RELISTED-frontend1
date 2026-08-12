"use client";

import { useRouter } from "next/navigation";
import { Camera, ShieldCheck, Wallet } from "lucide-react";
import { OnboardingShell } from "./OnboardingShell";
import { OnboardingHowItWorksSteps } from "./OnboardingHowItWorksSteps";
import { OnboardingInfoPanel } from "./OnboardingInfoPanel";
import { ListerSaleTypeCards } from "./ListerSaleTypeCards";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import {
  LISTER_ONBOARDING_STEPS,
  listerFirstListingSteps,
  listerHowItWorksSteps,
} from "@/lib/onboarding/copy";
import { useOnboardingProgress } from "@/lib/onboarding/useOnboardingProgress";
import { markOnboardingComplete } from "@/lib/onboarding/onboardingStorage";
import { useUserStore } from "@/store/useUserStore";

const stepMeta = [
  {
    title: "Welcome, Lister",
    subtitle: "Rent, sell, or both. Earn from your wardrobe.",
  },
  {
    title: "How You Can List",
    subtitle: "Pick a sale type for each item.",
  },
  {
    title: "Your Earning Loop",
    subtitle: "List, ship, get paid.",
  },
  {
    title: "Look Trustworthy",
    subtitle: "A photo and brand name help renters trust you.",
  },
  {
    title: "Create Your First Listing",
    subtitle: "Three quick steps to go live.",
  },
  {
    title: "Get Paid Securely",
    subtitle: "Verify and link a bank account for payouts.",
  },
] as const;

export function ListerOnboardingFlow() {
  const router = useRouter();
  const userId = useUserStore((s) => s.userId);
  const {
    step,
    hydrated,
    goNext,
    goBack,
    isFirstStep,
    isLastStep,
  } = useOnboardingProgress("lister", LISTER_ONBOARDING_STEPS);

  const finish = () => {
    markOnboardingComplete(userId, "lister");
    router.replace("/listers/dashboard");
  };

  const skipTour = () => {
    markOnboardingComplete(userId, "lister");
    router.replace("/listers/dashboard");
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
      totalSteps={LISTER_ONBOARDING_STEPS}
      title={meta.title}
      subtitle={meta.subtitle}
      onBack={isFirstStep ? undefined : goBack}
      onNext={isLastStep ? finish : goNext}
      nextLabel={isLastStep ? "Go to Dashboard" : "Continue"}
      onSkip={step === 5 ? finish : undefined}
      skipLabel="Go to dashboard"
      onSkipTour={skipTour}
      showBack={!isFirstStep}
    >
      {step === 0 ? (
        <div className="space-y-4">
          <div className="bg-[#3A3A32] p-6 rounded-xl text-white">
            <Paragraph1 className="mb-2 font-semibold text-lg">
              Turn your closet into income
            </Paragraph1>
            <Paragraph3 className="text-gray-300 text-sm leading-relaxed">
              List pieces, fulfill orders, and earn on your terms.
            </Paragraph3>
          </div>
          <div className="rounded-xl w-full h-40 overflow-hidden">
            <img
              src="/images/sin2.jpg"
              alt="RELISTED lister"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      ) : null}

      {step === 1 ? <ListerSaleTypeCards /> : null}

      {step === 2 ? (
        <OnboardingHowItWorksSteps steps={listerHowItWorksSteps} />
      ) : null}

      {step === 3 ? (
        <OnboardingInfoPanel
          icon={Camera}
          body="Add a profile photo and brand name so renters trust your closet."
          footnote="You can update this anytime in Settings after the tour."
        />
      ) : null}

      {step === 4 ? (
        <OnboardingHowItWorksSteps steps={listerFirstListingSteps} />
      ) : null}

      {step === 5 ? (
        <div className="space-y-4">
          <div className="gap-3 grid grid-cols-2">
            <div className="flex flex-col items-center bg-gray-50 p-4 border border-gray-200 rounded-xl text-center">
              <ShieldCheck className="mb-2 w-6 h-6 text-blue-600" />
              <Paragraph3 className="font-semibold text-gray-900 text-xs">
                Verify identity
              </Paragraph3>
            </div>
            <div className="flex flex-col items-center bg-gray-50 p-4 border border-gray-200 rounded-xl text-center">
              <Wallet className="mb-2 w-6 h-6 text-gray-800" />
              <Paragraph3 className="font-semibold text-gray-900 text-xs">
                Link bank account
              </Paragraph3>
            </div>
          </div>
          <Paragraph1 className="text-gray-600 text-sm text-center leading-relaxed">
            Verify your identity and link a bank account to receive payouts.
          </Paragraph1>
          <Paragraph3 className="text-gray-500 text-xs text-center leading-relaxed">
            Set this up in Settings whenever you are ready.
          </Paragraph3>
        </div>
      ) : null}
    </OnboardingShell>
  );
}
