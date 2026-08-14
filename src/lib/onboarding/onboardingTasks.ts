export type OnboardingTaskId =
  | "lister-profile"
  | "lister-first-listing"
  | "lister-payouts"
  | "renter-verification"
  | "renter-wallet";

export type ListerSettingsTab = "profile" | "business" | "verifications";

export type RenterAccountTab =
  | "profile"
  | "verifications"
  | "notifications"
  | "security";

export type OnboardingTaskStep = {
  target: string;
  title: string;
  body: string;
  path?: string;
  tab?: ListerSettingsTab | RenterAccountTab;
};

export type OnboardingTask = {
  id: OnboardingTaskId;
  label: string;
  role: "lister" | "renter";
  basePath: string;
  resumeStep: number;
  steps: readonly OnboardingTaskStep[];
};

export const listerProfileOnboardingTask = {
  id: "lister-profile" as const,
  label: "Profile setup",
  role: "lister" as const,
  basePath: "/listers/settings",
  resumeStep: 4,
  steps: [
    {
      target: '[data-onboarding-target="lister-avatar"]',
      title: "Add a profile photo",
      body: "Tap anywhere in this section to upload a clear photo renters will recognize.",
      tab: "profile",
    },
    {
      target: '[data-onboarding-target="lister-business-tab"]',
      title: "Open Business Details",
      body: "Open this tab to set the business name on your public profile.",
      tab: "profile",
    },
    {
      target: '[data-onboarding-target="lister-business-name"]',
      title: "Set your business name",
      body: "This is the name shoppers see on your profile and listings. Save when you are done.",
      tab: "business",
    },
    {
      target: '[data-onboarding-target="lister-verifications-tab"]',
      title: "Verify your identity",
      body: "Open Verifications and add your ID and BVN. Both are required before you can list items.",
      tab: "profile",
    },
    {
      target: '[data-onboarding-target="lister-id-section"]',
      title: "Add your ID",
      body: "Upload a valid ID document and enter your ID number.",
      tab: "verifications",
    },
    {
      target: '[data-onboarding-target="lister-bvn-section"]',
      title: "Submit your BVN",
      body: "Enter your 11-digit BVN to complete verification.",
      tab: "verifications",
    },
  ] satisfies OnboardingTaskStep[],
};

export const listerFirstListingOnboardingTask = {
  id: "lister-first-listing" as const,
  label: "Create listing",
  role: "lister" as const,
  basePath: "/listers/inventory/product-upload",
  resumeStep: 5,
  steps: [
    {
      target: '[data-onboarding-target="lister-listing-sale-type"]',
      title: "Choose a sale type",
      body: "Pick rent, resale, or both for this listing.",
    },
    {
      target: '[data-onboarding-target="lister-listing-photos"]',
      title: "Add photos",
      body: "Upload clear photos of your item from a few angles.",
    },
    {
      target: '[data-onboarding-target="lister-listing-details"]',
      title: "Basic information and category",
      body: "Add the item name, details, and pick a category for your listing.",
    },
    {
      target: '[data-onboarding-target="lister-listing-submit"]',
      title: "Post your listing",
      body: "Review everything, then post your item when you are ready.",
    },
  ] satisfies OnboardingTaskStep[],
};

export const listerPayoutsOnboardingTask = {
  id: "lister-payouts" as const,
  label: "Payout setup",
  role: "lister" as const,
  basePath: "/listers/wallet",
  resumeStep: 5,
  steps: [
    {
      target: '[data-onboarding-target="lister-withdraw-button"]',
      title: "Set up withdrawals",
      body: "Tap Withdraw to link a bank account and receive your earnings.",
    },
    {
      target: '[data-onboarding-target="lister-bank-account"]',
      title: "Add your bank details",
      body: "Enter the account where you want to receive payouts. Double-check everything before saving.",
    },
  ] satisfies OnboardingTaskStep[],
};

export const renterVerificationOnboardingTask = {
  id: "renter-verification" as const,
  label: "Verification setup",
  role: "renter" as const,
  basePath: "/renters/account",
  resumeStep: 4,
  steps: [
    {
      target: '[data-onboarding-target="renter-verifications-tab"]',
      title: "Open Verifications",
      body: "Tap Verifications to add your ID and BVN.",
      tab: "profile",
    },
    {
      target: '[data-onboarding-target="renter-id-section"]',
      title: "Add your ID",
      body: "Upload a valid ID document and enter your ID number.",
      tab: "verifications",
    },
    {
      target: '[data-onboarding-target="renter-bvn-section"]',
      title: "Submit your BVN",
      body: "Enter your 11-digit BVN to complete verification.",
      tab: "verifications",
    },
  ] satisfies OnboardingTaskStep[],
};

export const renterWalletOnboardingTask = {
  id: "renter-wallet" as const,
  label: "Wallet setup",
  role: "renter" as const,
  basePath: "/renters/wallet",
  resumeStep: 5,
  steps: [
    {
      target: '[data-onboarding-target="renter-fund-wallet-button"]',
      title: "Fund your wallet",
      body: "Tap Fund Wallet to add money for rentals and purchases.",
    },
    {
      target: '[data-onboarding-target="renter-fund-wallet-details"]',
      title: "Transfer to top up",
      body: "Send a bank transfer to your virtual account number. Funds appear in your wallet balance.",
    },
    {
      target: '[data-onboarding-target="renter-locked-balance"]',
      title: "Locked Balance",
      body: "Your security deposit sits here during active rentals. It returns to Available Balance after return is approved.",
    },
  ] satisfies OnboardingTaskStep[],
};

const onboardingTasksById: Record<OnboardingTaskId, OnboardingTask> = {
  "lister-profile": listerProfileOnboardingTask,
  "lister-first-listing": listerFirstListingOnboardingTask,
  "lister-payouts": listerPayoutsOnboardingTask,
  "renter-verification": renterVerificationOnboardingTask,
  "renter-wallet": renterWalletOnboardingTask,
};

export function getOnboardingTaskById(
  taskId: string | null,
): OnboardingTask | null {
  if (!taskId) return null;
  return onboardingTasksById[taskId as OnboardingTaskId] ?? null;
}

export function getOnboardingReturnPath(task: OnboardingTask): string {
  return task.role === "renter" ? "/onboarding/renter" : "/onboarding/lister";
}

export function buildOnboardingTaskUrl(
  task: OnboardingTask,
  taskStep: number,
): string {
  const step = task.steps[taskStep];
  const path = step?.path ?? task.basePath;
  const params = new URLSearchParams({
    onboardingTask: task.id,
    taskStep: String(taskStep),
  });

  if (step?.tab) {
    params.set("tab", step.tab);
  }

  return `${path}?${params.toString()}`;
}

export function onboardingTaskPathForStep(
  task: OnboardingTask,
  taskStep: number,
): string {
  const step = task.steps[taskStep];
  return step?.path ?? task.basePath;
}
