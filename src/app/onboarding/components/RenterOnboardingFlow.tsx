"use client";

import { useRouter } from "next/navigation";
import { ShieldCheck, Wallet } from "lucide-react";
import { OnboardingShell } from "./OnboardingShell";
import { OnboardingHowItWorksSteps } from "./OnboardingHowItWorksSteps";
import { OnboardingInfoPanel } from "./OnboardingInfoPanel";
import { RenterRentOrBuyCards } from "./RenterRentOrBuyCards";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import {
  RENTER_ONBOARDING_STEPS,
  renterHowItWorksSteps,
  renterVerificationSteps,
  renterWalletSteps,
} from "@/lib/onboarding/copy";
import { useOnboardingProgress } from "@/lib/onboarding/useOnboardingProgress";
import {
  buildOnboardingTaskUrl,
  renterVerificationOnboardingTask,
  renterWalletOnboardingTask,
  type OnboardingTask,
} from "@/lib/onboarding/onboardingTasks";
import { markOnboardingComplete, startOnboardingTask } from "@/lib/onboarding/onboardingStorage";
import { useUserStore } from "@/store/useUserStore";
import { ONBOARDING_SECONDARY_TEXT } from "@/lib/onboarding/onboardingTypography";

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
    title: "How Renting Works",
    subtitle: "Pay, lock your deposit, get it back after return.",
  },
  {
    title: "Verify Your Identity",
    subtitle: "Required before checkout and wallet top-ups.",
  },
  {
    title: "Fund Your Wallet",
    subtitle: "Top up your wallet before you checkout.",
  },
  {
    title: "Start Shopping",
    subtitle: "You are ready to browse the shop.",
  },
] as const;

export function RenterOnboardingFlow() {
  const router = useRouter();
  const userId = useUserStore((s) => s.userId);
  const {
    step,
    hydrated,
    goNext,
    goBack,
    isFirstStep,
    isLastStep,
  } = useOnboardingProgress("renter", RENTER_ONBOARDING_STEPS);

  const finish = () => {
    markOnboardingComplete(userId, "renter");
    router.replace("/shop");
  };

  const skipTour = () => {
    markOnboardingComplete(userId, "renter");
    router.replace("/shop");
  };

  const startOnboardingDetour = (task: OnboardingTask) => {
    startOnboardingTask(userId, "renter", {
      taskId: task.id,
      currentStep: step,
      resumeStepAfterTask: task.resumeStep,
    });
    router.push(buildOnboardingTaskUrl(task, 0));
  };

  const startVerificationTask = () =>
    startOnboardingDetour(renterVerificationOnboardingTask);
  const startWalletTask = () => startOnboardingDetour(renterWalletOnboardingTask);

  if (!hydrated) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Paragraph3 className="text-gray-500 text-base">Loading...</Paragraph3>
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
          <Paragraph1
            className={`text-gray-600 text-center ${ONBOARDING_SECONDARY_TEXT}`}
          >
            Rent for the moment. Buy what you love.
          </Paragraph1>
        </div>
      ) : null}

      {step === 1 ? <RenterRentOrBuyCards /> : null}

      {step === 2 ? (
        <div className="space-y-4">
          <OnboardingHowItWorksSteps steps={renterHowItWorksSteps} />
          <Paragraph1
            className={`text-gray-600 text-center ${ONBOARDING_SECONDARY_TEXT}`}
          >
            Purchases skip the deposit and are yours to keep.
          </Paragraph1>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="space-y-4">
          <OnboardingInfoPanel
            icon={ShieldCheck}
            body="In My Account, add your ID and BVN under Verifications."
            iconClassName="w-7 h-7 text-blue-600"
            iconWrapClassName="bg-blue-50 border-blue-200"
          />
          <OnboardingHowItWorksSteps steps={renterVerificationSteps} />
          <button
            type="button"
            onClick={startVerificationTask}
            className="hover:bg-gray-50 py-3 border-2 border-gray-800 rounded-lg w-full font-semibold text-gray-900 text-base transition"
          >
            Verify account
          </button>
        </div>
      ) : null}

      {step === 4 ? (
        <div className="space-y-4">
          <OnboardingInfoPanel
            icon={Wallet}
            body="Rentals use Available Balance. Your security deposit sits in Locked Balance until the rental is complete."
            iconClassName="w-7 h-7 text-gray-800"
            iconWrapClassName="bg-gray-50 border-gray-200"
          />
          <OnboardingHowItWorksSteps steps={renterWalletSteps} />
          <button
            type="button"
            onClick={startWalletTask}
            className="hover:bg-gray-50 py-3 border-2 border-gray-800 rounded-lg w-full font-semibold text-gray-900 text-base transition"
          >
            Set up wallet
          </button>
        </div>
      ) : null}

      {step === 5 ? (
        <div className="space-y-4">
          <div className="rounded-xl w-full h-40 overflow-hidden">
            <img
              src="/images/dr3.jpg"
              alt="Browse RELISTED shop"
              className="w-full h-full object-cover"
            />
          </div>
          <Paragraph1
            className={`text-gray-600 text-center ${ONBOARDING_SECONDARY_TEXT}`}
          >
            Browse the shop, save favourites, and checkout when you find
            something you love.
          </Paragraph1>
        </div>
      ) : null}
    </OnboardingShell>
  );
}
