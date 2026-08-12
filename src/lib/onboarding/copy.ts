export const renterHowItWorksSteps = [
  {
    title: "Browse",
    description:
      "Explore curated pieces from trusted listers. Filter by rent or buy to find what you need.",
  },
  {
    title: "Rent or Buy",
    description:
      "On each item, choose to rent for an occasion or buy it outright. One listing, one action.",
  },
  {
    title: "Return or Keep",
    description:
      "Send rentals back when you're done. Purchases are delivered to you and yours to keep.",
  },
] as const;

export const listerHowItWorksSteps = [
  {
    title: "List Your Pieces",
    description:
      "Upload photos and set how each item is offered: rent only, resale only, or both.",
  },
  {
    title: "Approve & Ship",
    description:
      "Approve requests, then ship rentals out and back, or send resale purchases once.",
  },
  {
    title: "Earn Securely",
    description:
      "Get paid to your wallet after each completed rental or sale. Verification keeps everyone safe.",
  },
] as const;

export const listerSaleTypeOptions = [
  {
    id: "rent",
    title: "Rent",
    subtitle: "Rent only",
    description: "Allow customers to rent this item for set dates.",
  },
  {
    id: "resale",
    title: "Resale",
    subtitle: "Sell permanently",
    description: "List this item for a one-time purchase.",
  },
  {
    id: "rent-resale",
    title: "Rent & Resale",
    subtitle: "Rent or sell",
    description: "Let customers rent or purchase the same item.",
  },
] as const;

export const RENTER_ONBOARDING_STEPS = 5;
export const LISTER_ONBOARDING_STEPS = 6;
