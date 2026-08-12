export type OnboardingStepIcon =
  | "search"
  | "choice"
  | "return"
  | "upload"
  | "ship"
  | "wallet"
  | "camera"
  | "tag"
  | "sparkles";

export type OnboardingStep = {
  title: string;
  description: string;
  icon: OnboardingStepIcon;
};

export const renterHowItWorksSteps: readonly OnboardingStep[] = [
  {
    title: "Browse",
    description: "Find pieces to rent or buy.",
    icon: "search",
  },
  {
    title: "Rent or Buy",
    description: "Pick one action on each item.",
    icon: "choice",
  },
  {
    title: "Return or Keep",
    description: "Return rentals. Keep your purchases.",
    icon: "return",
  },
];

export const listerHowItWorksSteps: readonly OnboardingStep[] = [
  {
    title: "List Your Pieces",
    description: "Add photos and choose rent, resale, or both.",
    icon: "upload",
  },
  {
    title: "Approve & Ship",
    description: "Approve requests, then ship rentals or resale purchases out.",
    icon: "ship",
  },
  {
    title: "Earn Securely",
    description: "Get paid to your wallet after each order.",
    icon: "wallet",
  },
];

export const listerSaleTypeOptions = [
  {
    id: "rent",
    title: "Rent",
    subtitle: "Rent only",
    description: "Rent by the day.",
    icon: "choice" as const,
  },
  {
    id: "resale",
    title: "Resale",
    subtitle: "Sell permanently",
    description: "Sell it outright.",
    icon: "tag" as const,
  },
  {
    id: "rent-resale",
    title: "Rent & Resale",
    subtitle: "Rent or sell",
    description: "Offer both options.",
    icon: "sparkles" as const,
  },
] as const;

export const listerFirstListingSteps: readonly OnboardingStep[] = [
  {
    title: "Add Photos",
    description: "Upload clear photos of your item.",
    icon: "camera",
  },
  {
    title: "Choose Sale Type",
    description: "Pick rent, resale, or both.",
    icon: "tag",
  },
  {
    title: "Go Live",
    description: "Submit and start getting requests.",
    icon: "sparkles",
  },
];

export const RENTER_ONBOARDING_STEPS = 5;
export const LISTER_ONBOARDING_STEPS = 6;
