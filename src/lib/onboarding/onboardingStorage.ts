export type OnboardingRole = "renter" | "lister";

export type RenterShopPreference = "rent" | "resale" | "all";

export type OnboardingProgress = {
  step: number;
  shopPreference?: RenterShopPreference;
  completedAt?: string;
};

const progressKey = (userId: string | null, role: OnboardingRole) =>
  `relisted-onboarding:${role}:${userId ?? "anonymous"}`;

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
  writeOnboardingProgress(userId, role, {
    step: 0,
    completedAt: new Date().toISOString(),
  });
}

export function isOnboardingComplete(
  userId: string | null,
  role: OnboardingRole,
): boolean {
  return Boolean(readOnboardingProgress(userId, role)?.completedAt);
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
