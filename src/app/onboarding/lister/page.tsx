import { Suspense } from "react";
import { ListerOnboardingFlow } from "../components/ListerOnboardingFlow";

export default function ListerOnboardingPage() {
  return (
    <Suspense fallback={null}>
      <ListerOnboardingFlow />
    </Suspense>
  );
}
