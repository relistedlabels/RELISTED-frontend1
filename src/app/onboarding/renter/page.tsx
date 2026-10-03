import { Suspense } from "react";
import { RenterOnboardingFlow } from "../components/RenterOnboardingFlow";

export default function RenterOnboardingPage() {
  return (
    <Suspense fallback={null}>
      <RenterOnboardingFlow />
    </Suspense>
  );
}
