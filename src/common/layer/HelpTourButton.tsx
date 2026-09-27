"use client";

import { useRouter } from "next/navigation";
import { Compass } from "lucide-react";
import { authRoleToOnboardingRole } from "@/lib/onboarding/onboardingGate";
import {
  getOnboardingTourPath,
  resetOnboardingForManualTour,
} from "@/lib/onboarding/onboardingStorage";
import { useUserStore } from "@/store/useUserStore";
import { useMe } from "@/lib/queries/auth/useMe";

export function HelpTourButton() {
  const router = useRouter();
  const storeRole = useUserStore((s) => s.role);
  const userId = useUserStore((s) => s.userId);
  const token = useUserStore((s) => s.token);
  const { data: user } = useMe();

  const role = user?.role ?? storeRole;
  const onboardingRole = authRoleToOnboardingRole(role);

  if (!onboardingRole) return null;

  const handleTakeTour = () => {
    resetOnboardingForManualTour(userId, onboardingRole);
    router.push(getOnboardingTourPath(onboardingRole));
  };

  return (
    <button
      type="button"
      onClick={handleTakeTour}
      className="flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-100"
    >
      <Compass size={18} className="text-gray-600 flex-shrink-0" aria-hidden />
      <span className="text-sm font-medium text-gray-700">Take the tour</span>
    </button>
  );
}
