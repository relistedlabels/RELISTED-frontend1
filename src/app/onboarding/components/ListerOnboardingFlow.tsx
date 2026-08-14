"use client";

import { useRouter } from "next/navigation";
import { Camera, Wallet } from "lucide-react";
import { OnboardingShell } from "./OnboardingShell";
import { OnboardingHowItWorksSteps } from "./OnboardingHowItWorksSteps";
import { OnboardingInfoPanel } from "./OnboardingInfoPanel";
import { ListerSaleTypeCards } from "./ListerSaleTypeCards";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import {
  LISTER_ONBOARDING_STEPS,
  listerFirstListingSteps,
  listerHowItWorksSteps,
  listerPayoutSteps,
} from "@/lib/onboarding/copy";
import { useOnboardingProgress } from "@/lib/onboarding/useOnboardingProgress";
import {
  buildOnboardingTaskUrl,
  listerFirstListingOnboardingTask,
  listerPayoutsOnboardingTask,
  listerProfileOnboardingTask,
  type OnboardingTask,
} from "@/lib/onboarding/onboardingTasks";
import { markOnboardingComplete, startOnboardingTask } from "@/lib/onboarding/onboardingStorage";
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
    subtitle:
      "Add a photo, business name, and verify your ID and BVN for your public profile.",
  },
  {
    title: "Create Your First Listing",
    subtitle: "Four quick steps to go live.",
  },
  {
    title: "Get Paid Securely",
    subtitle: "Link a bank account to receive withdrawals.",
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

  const startOnboardingDetour = (task: OnboardingTask) => {
    startOnboardingTask(userId, "lister", {
      taskId: task.id,
      currentStep: step,
      resumeStepAfterTask: task.resumeStep,
    });
    router.push(buildOnboardingTaskUrl(task, 0));
  };

  const startProfileTask = () => startOnboardingDetour(listerProfileOnboardingTask);
  const startFirstListingTask = () =>
    startOnboardingDetour(listerFirstListingOnboardingTask);
  const startPayoutsTask = () => startOnboardingDetour(listerPayoutsOnboardingTask);

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
      totalSteps={LISTER_ONBOARDING_STEPS}
      title={meta.title}
      subtitle={meta.subtitle}
      onBack={isFirstStep ? undefined : goBack}
      onNext={isLastStep ? finish : goNext}
      nextLabel={isLastStep ? "Go to Dashboard" : "Continue"}
      onSkipTour={skipTour}
      showBack={!isFirstStep}
    >
      {step === 0 ? (
        <div className="space-y-4">
          <div className="bg-[#3A3A32] p-6 rounded-xl text-white">
            <Paragraph1 className="mb-2 font-semibold text-lg">
              Turn your closet into income
            </Paragraph1>
            <Paragraph3 className="text-gray-300 text-base leading-relaxed">
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
          <OnboardingInfoPanel icon={Camera} />
          <button
            type="button"
            onClick={startProfileTask}
            className="hover:bg-gray-50 py-3 border-2 border-gray-800 rounded-lg w-full font-semibold text-gray-900 text-base transition"
          >
            Update profile
          </button>
        </div>
      ) : null}

      {step === 4 ? (
        <div className="space-y-4">
          <OnboardingHowItWorksSteps steps={listerFirstListingSteps} />
          <button
            type="button"
            onClick={startFirstListingTask}
            className="hover:bg-gray-50 py-3 border-2 border-gray-800 rounded-lg w-full font-semibold text-gray-900 text-base transition"
          >
            Create listing
          </button>
        </div>
      ) : null}

      {step === 5 ? (
        <div className="space-y-4">
          <OnboardingInfoPanel
            icon={Wallet}
            iconClassName="w-7 h-7 text-gray-800"
            iconWrapClassName="bg-gray-50 border-gray-200"
          />
          <OnboardingHowItWorksSteps steps={listerPayoutSteps} />
          <button
            type="button"
            onClick={startPayoutsTask}
            className="hover:bg-gray-50 py-3 border-2 border-gray-800 rounded-lg w-full font-semibold text-gray-900 text-base transition"
          >
            Set up payouts
          </button>
        </div>
      ) : null}
    </OnboardingShell>
  );
}
