"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { OnboardingPromptModal } from "./OnboardingPromptModal";
import { useUserStoreHydrated } from "@/hooks/useUserStoreHydrated";
import {
  authRoleToOnboardingRole,
  shouldShowOnboardingPromptForUser,
} from "@/lib/onboarding/onboardingGate";
import {
  ONBOARDING_IDLE_PROMPT_MS,
  dismissSessionOnboardingPrompt,
  isOnboardingPromptEnabled,
  isOnboardingPromptSuppressedPath,
  isSessionOnboardingPromptDismissed,
  onboardingPromptCopy,
  onboardingPromptReason,
  shouldOfferOnboardingPrompt,
} from "@/lib/onboarding/onboardingPrompt";
import {
  getOnboardingTourPath,
  markOnboardingDismissed,
  resetOnboardingForManualTour,
} from "@/lib/onboarding/onboardingStorage";
import { useMe } from "@/lib/queries/auth/useMe";
import { useUserStore } from "@/store/useUserStore";

export function OnboardingPromptGuard() {
  const pathname = usePathname();
  const router = useRouter();
  const hydrated = useUserStoreHydrated();
  const token = useUserStore((s) => s.token);
  const userId = useUserStore((s) => s.userId);
  const storeRole = useUserStore((s) => s.role);
  const { data: user, isLoading } = useMe();

  const [open, setOpen] = useState(false);
  const [promptReason, setPromptReason] = useState<"idle" | "trouble">("idle");
  const sessionStartRef = useRef<number>(Date.now());
  const idleMsRef = useRef(0);
  const shownRef = useRef(false);

  const role = user?.role ?? storeRole;
  const onboardingRole = authRoleToOnboardingRole(role);

  const canPrompt =
    isOnboardingPromptEnabled() &&
    hydrated &&
    !isLoading &&
    Boolean(token) &&
    Boolean(onboardingRole) &&
    !isOnboardingPromptSuppressedPath(pathname) &&
    shouldShowOnboardingPromptForUser({
      role,
      userId,
      isAuthenticated: true,
    });

  const evaluatePrompt = useCallback(() => {
    if (!canPrompt || !onboardingRole || shownRef.current) return;

    const sessionPromptDismissed = isSessionOnboardingPromptDismissed();
    const shouldShow = shouldOfferOnboardingPrompt({
      userId,
      role: onboardingRole,
      pathname,
      idleMs: idleMsRef.current,
      sessionPromptDismissed,
    });

    if (!shouldShow) return;

    shownRef.current = true;
    setPromptReason(onboardingPromptReason({ pathname, idleMs: idleMsRef.current }));
    setOpen(true);
  }, [canPrompt, onboardingRole, pathname, userId]);

  useEffect(() => {
    sessionStartRef.current = Date.now();
    idleMsRef.current = 0;
    shownRef.current = false;
    setOpen(false);
  }, [userId, onboardingRole]);

  useEffect(() => {
    if (!canPrompt) return;

    idleMsRef.current = Date.now() - sessionStartRef.current;

    if (pathname.startsWith("/shop/cart") || pathname.startsWith("/renters/")) {
      evaluatePrompt();
      return;
    }

    const remaining = Math.max(
      0,
      ONBOARDING_IDLE_PROMPT_MS - idleMsRef.current,
    );
    const timer = window.setTimeout(evaluatePrompt, remaining);
    return () => window.clearTimeout(timer);
  }, [canPrompt, evaluatePrompt, pathname]);

  const handleTakeTour = () => {
    if (!onboardingRole) return;
    setOpen(false);
    resetOnboardingForManualTour(userId, onboardingRole);
    router.push(getOnboardingTourPath(onboardingRole));
  };

  const handleNotNow = () => {
    dismissSessionOnboardingPrompt();
    setOpen(false);
  };

  const handleDontShowAgain = () => {
    if (!onboardingRole) return;
    markOnboardingDismissed(userId, onboardingRole);
    dismissSessionOnboardingPrompt();
    setOpen(false);
  };

  const copy = onboardingPromptCopy(promptReason);

  return (
    <OnboardingPromptModal
      open={open}
      title={copy.title}
      body={copy.body}
      onTakeTour={handleTakeTour}
      onNotNow={handleNotNow}
      onDontShowAgain={handleDontShowAgain}
    />
  );
}
