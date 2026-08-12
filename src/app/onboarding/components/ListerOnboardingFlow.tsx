"use client";

import { useRouter } from "next/navigation";
import { Camera, ShieldCheck, Wallet } from "lucide-react";
import { OnboardingShell } from "./OnboardingShell";
import { OnboardingHowItWorksSteps } from "./OnboardingHowItWorksSteps";
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
      nextLabel={
        step === 4
          ? "Create Listing"
          : isLastStep
            ? "Go to Dashboard"
            : "Continue"
      }
      onSkip={step === 5 ? finish : undefined}
      skipLabel="Go to dashboard"
      onSkipTour={skipTour}
      showBack={!isFirstStep}
      footer={
        step === 4 ? (
          <div className="flex flex-col gap-3 mt-8 pt-4 border-gray-100 border-t">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={goBack}
                className="flex-1 hover:bg-gray-50 py-3 border border-gray-200 rounded-lg font-medium text-gray-700 text-sm transition"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  markOnboardingComplete(userId, "lister");
                  router.push("/listers/inventory/product-upload");
                }}
                className="flex-1 bg-[#231F20] hover:bg-gray-800 py-3 rounded-lg font-semibold text-white text-sm transition"
              >
                Create Listing
              </button>
            </div>
            <button
              type="button"
              onClick={goNext}
              className="py-1 font-medium text-gray-500 text-sm hover:text-gray-800 transition"
            >
              I will do this later
            </button>
          </div>
        ) : undefined
      }
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
        <div className="space-y-4">
          <div className="flex justify-center items-center bg-gray-100 mx-auto rounded-full w-16 h-16">
            <Camera className="w-8 h-8 text-gray-700" />
          </div>
          <Paragraph1 className="text-gray-600 text-sm text-center leading-relaxed">
            Add a profile photo and brand name in settings.
          </Paragraph1>
          <button
            type="button"
            onClick={() => router.push("/listers/settings")}
            className="py-3 border-2 border-gray-800 rounded-lg w-full font-semibold text-gray-900 text-sm hover:bg-gray-50 transition"
          >
            Update profile
          </button>
        </div>
      ) : null}

      {step === 4 ? (
        <OnboardingHowItWorksSteps steps={listerFirstListingSteps} />
      ) : null}

      {step === 5 ? (
        <div className="space-y-4">
          <div className="gap-4 grid grid-cols-2">
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
            Set up payouts in settings after each completed order.
          </Paragraph1>
          <button
            type="button"
            onClick={() => router.push("/listers/settings")}
            className="py-3 border-2 border-gray-800 rounded-lg w-full font-semibold text-gray-900 text-sm hover:bg-gray-50 transition"
          >
            Set up payouts
          </button>
        </div>
      ) : null}
    </OnboardingShell>
  );
}
