import type { OnboardingTaskId } from "./onboardingTasks";

export type OnboardingRole = "renter" | "lister";

export type RenterShopPreference = "rent" | "resale" | "all";

export type OnboardingProgress = {
  step: number;
  shopPreference?: RenterShopPreference;
  completedAt?: string;
  dismissedAt?: string;
  activeTask?: OnboardingTaskId | null;
  resumeStepAfterTask?: number | null;
};

const progressKey = (userId: string | null, role: OnboardingRole) =>
  `relisted-onboarding:${role}:${userId ?? "anonymous"}`;

const pendingResumeKey = (userId: string | null, role: OnboardingRole) =>
  `relisted-onboarding-pending-resume:${role}:${userId ?? "anonymous"}`;

/** Read progress from the signed-in user key, then anonymous fallback. */
export function readOnboardingProgressForUser(
  userId: string | null,
  role: OnboardingRole,
): OnboardingProgress | null {
  if (userId) {
    const byUser = readOnboardingProgress(userId, role);
    if (byUser) return byUser;
  }
  return readOnboardingProgress(null, role);
}

export function setPendingOnboardingResume(
  userId: string | null,
  role: OnboardingRole,
  resumeStep: number,
): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(pendingResumeKey(userId, role), String(resumeStep));
}

export function peekPendingOnboardingResume(
  userId: string | null,
  role: OnboardingRole,
): number | null {
  if (typeof window === "undefined") return null;

  const keys = userId
    ? [pendingResumeKey(userId, role), pendingResumeKey(null, role)]
    : [pendingResumeKey(null, role)];

  for (const key of keys) {
    const raw = sessionStorage.getItem(key);
    if (!raw) continue;
    const value = Number(raw);
    if (Number.isFinite(value)) return value;
  }

  return null;
}

export function clearPendingOnboardingResume(
  userId: string | null,
  role: OnboardingRole,
): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(pendingResumeKey(userId, role));
  sessionStorage.removeItem(pendingResumeKey(null, role));
}

export function resolveOnboardingResumeStep(
  userId: string | null,
  role: OnboardingRole,
  fallbackStep?: number,
): number | null {
  const progress = readOnboardingProgressForUser(userId, role);
  const pending = peekPendingOnboardingResume(userId, role);

  if (pending != null) return pending;
  if (progress?.resumeStepAfterTask != null) return progress.resumeStepAfterTask;
  if (typeof progress?.step === "number") return progress.step + 1;
  if (fallbackStep != null) return fallbackStep;
  return null;
}

export function buildOnboardingWizardReturnUrl(
  returnPath: string,
  resumeStep: number,
): string {
  return `${returnPath}?resumeStep=${resumeStep}`;
}

export function readOnboardingProgress(
  userId: string | null,
  role: OnboardingRole,
): OnboardingProgress | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(progressKey(userId, role));
    if (!raw) return null;
    return JSON.parse(raw) as OnboardingProgress;
  } catch {
    return null;
  }
}

export function writeOnboardingProgress(
  userId: string | null,
  role: OnboardingRole,
  progress: OnboardingProgress,
): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(progressKey(userId, role), JSON.stringify(progress));
}

export function markOnboardingComplete(
  userId: string | null,
  role: OnboardingRole,
): void {
  const existing = readOnboardingProgress(userId, role);
  writeOnboardingProgress(userId, role, {
    step: 0,
    shopPreference: existing?.shopPreference,
    completedAt: new Date().toISOString(),
    dismissedAt: existing?.dismissedAt,
  });
}

export function markOnboardingDismissed(
  userId: string | null,
  role: OnboardingRole,
): void {
  const existing = readOnboardingProgress(userId, role);
  writeOnboardingProgress(userId, role, {
    step: existing?.step ?? 0,
    shopPreference: existing?.shopPreference,
    dismissedAt: new Date().toISOString(),
    activeTask: null,
    resumeStepAfterTask: null,
  });
}

export function isOnboardingComplete(
  userId: string | null,
  role: OnboardingRole,
): boolean {
  return Boolean(readOnboardingProgress(userId, role)?.completedAt);
}

export function isOnboardingDismissed(
  userId: string | null,
  role: OnboardingRole,
): boolean {
  return Boolean(readOnboardingProgress(userId, role)?.dismissedAt);
}

/** True when we should not auto-prompt (completed or permanently skipped). */
export function isOnboardingAutoPromptSuppressed(
  userId: string | null,
  role: OnboardingRole,
): boolean {
  const progress = readOnboardingProgress(userId, role);
  return Boolean(progress?.completedAt || progress?.dismissedAt);
}

export function resetOnboardingForManualTour(
  userId: string | null,
  role: OnboardingRole,
): void {
  const existing = readOnboardingProgress(userId, role);
  writeOnboardingProgress(userId, role, {
    step: 0,
    shopPreference: existing?.shopPreference,
    completedAt: existing?.completedAt,
    dismissedAt: existing?.dismissedAt,
    activeTask: null,
    resumeStepAfterTask: null,
  });
}

export function shopPathForPreference(preference: RenterShopPreference): string {
  switch (preference) {
    case "rent":
      return "/shop?availability=Rent";
    case "resale":
      return "/shop?availability=Resale";
    default:
      return "/shop";
  }
}

export function hasActiveOnboardingTask(
  userId: string | null,
  role: OnboardingRole,
): boolean {
  return Boolean(readOnboardingProgress(userId, role)?.activeTask);
}

export function startOnboardingTask(
  userId: string | null,
  role: OnboardingRole,
  options: {
    taskId: OnboardingTaskId;
    currentStep: number;
    resumeStepAfterTask: number;
  },
): void {
  const existing = readOnboardingProgressForUser(userId, role);
  setPendingOnboardingResume(userId, role, options.resumeStepAfterTask);
  writeOnboardingProgress(userId, role, {
    step: options.currentStep,
    shopPreference: existing?.shopPreference,
    completedAt: existing?.completedAt,
    dismissedAt: existing?.dismissedAt,
    activeTask: options.taskId,
    resumeStepAfterTask: options.resumeStepAfterTask,
  });
}

export function completeOnboardingTask(
  userId: string | null,
  role: OnboardingRole,
  fallbackStep?: number,
): number | null {
  const progress = readOnboardingProgressForUser(userId, role);
  const resumeStep = resolveOnboardingResumeStep(userId, role, fallbackStep);
  clearPendingOnboardingResume(userId, role);

  writeOnboardingProgress(userId, role, {
    step: resumeStep ?? progress?.step ?? 0,
    shopPreference: progress?.shopPreference,
    completedAt: progress?.completedAt,
    dismissedAt: progress?.dismissedAt,
    activeTask: null,
    resumeStepAfterTask: null,
  });

  return resumeStep;
}

export function getOnboardingTourPath(role: OnboardingRole): string {
  return `/onboarding/${role}?manual=1`;
}
