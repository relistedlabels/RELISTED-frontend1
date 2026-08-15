export type OnboardingStepIcon =
  | "search"
  | "choice"
  | "return"
  | "upload"
  | "ship"
  | "wallet"
  | "camera"
  | "tag"
  | "sparkles"
  | "account";

export type OnboardingStep = {
  title: string;
  description: string;
  icon: OnboardingStepIcon;
};

export const renterHowItWorksSteps: readonly OnboardingStep[] = [
  {
    title: "Pay from your wallet",
    description: "Checkout uses rental fee plus a security deposit.",
    icon: "wallet",
  },
  {
    title: "Deposit is locked",
    description: "Your security deposit shows as Locked Balance while the item is out.",
    icon: "choice",
  },
  {
    title: "Return the item",
    description: "After the lister approves, your deposit returns to Available Balance.",
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

export const renterRentOrBuyOptions = [
  {
    id: "rent",
    title: "Rent",
    description: "Pick dates, wear it, return when done.",
    icon: "choice" as const,
  },
  {
    id: "buy",
    title: "Buy",
    description: "Purchase outright. Yours to keep.",
    icon: "tag" as const,
  },
] as const;

export const renterVerificationSteps: readonly OnboardingStep[] = [
  {
    title: "Open Verifications",
    description: "My Account → Verifications tab.",
    icon: "account",
  },
  {
    title: "Add your ID",
    description: "Upload your document and ID number.",
    icon: "camera",
  },
  {
    title: "Submit your BVN",
    description: "Enter your 11-digit BVN.",
    icon: "sparkles",
  },
];

export const renterWalletSteps: readonly OnboardingStep[] = [
  {
    title: "Open Wallet",
    description: "Find Wallet in your dashboard sidebar.",
    icon: "wallet",
  },
  {
    title: "Fund Wallet",
    description: "Tap Fund Wallet and transfer to your virtual account.",
    icon: "sparkles",
  },
  {
    title: "After return",
    description: "Deposit returns to Available Balance. Disputes are under My Orders.",
    icon: "return",
  },
];

export const listerPayoutSteps: readonly OnboardingStep[] = [
  {
    title: "Open Wallet",
    description: "Find Wallet in your lister dashboard sidebar.",
    icon: "wallet",
  },
  {
    title: "Withdraw",
    description: "Tap Withdraw to link a bank account for payouts.",
    icon: "sparkles",
  },
  {
    title: "Add bank details",
    description: "Enter the account where you want to receive earnings.",
    icon: "account",
  },
];

export const listerFirstListingSteps: readonly OnboardingStep[] = [
  {
    title: "Choose Sale Type",
    description: "Pick rent, resale, or both.",
    icon: "tag",
  },
  {
    title: "Add Photos",
    description: "Upload clear photos of your item.",
    icon: "camera",
  },
  {
    title: "Basic Info and Category",
    description: "Add item details and pick a category.",
    icon: "upload",
  },
  {
    title: "Go Live",
    description: "Review and post your listing.",
    icon: "sparkles",
  },
];

export const RENTER_ONBOARDING_STEPS = 6;
export const LISTER_ONBOARDING_STEPS = 6;
