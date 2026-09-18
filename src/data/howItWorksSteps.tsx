import type { LucideIcon } from "lucide-react";
import {
  Banknote,
  Box,
  CalendarClock,
  CheckCircle2,
  Clock,
  PackageCheck,
  RotateCcw,
  Search,
  ShieldCheck,
  Truck,
  Upload,
  Wallet,
} from "lucide-react";

export type HowItWorksStep = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export const shopperFlowSteps: HowItWorksStep[] = [
  {
    title: "Browse & pick dates",
    description:
      "Explore the shop by category, brand, or occasion. On each item, choose Rent or Buy, then pick your rental dates and delivery windows.",
    icon: Search,
  },
  {
    title: "Request availability",
    description:
      "Submit your request. The lister confirms within about 15 minutes. Once approved, the item moves to your cart ready for checkout.",
    icon: Clock,
  },
  {
    title: "Verify ID & checkout",
    description:
      "Upload a valid ID once, fund your wallet by bank transfer, then pay. Rental fee plus a refundable security deposit at checkout.",
    icon: Wallet,
  },
  {
    title: "Receive & enjoy",
    description:
      "Your item arrives on your chosen date anywhere in Lagos. Confirm delivery in Orders, then wear it for your event.",
    icon: Truck,
  },
  {
    title: "Return & get your deposit back",
    description:
      "Start a return from Orders, share photos, and pick a pickup window. Your deposit returns to your wallet after the lister confirms.",
    icon: RotateCcw,
  },
];

export const listerFlowSteps: HowItWorksStep[] = [
  {
    title: "Create your listing",
    description:
      "Choose rent, resale, or both. Add photos, item details, pricing, and a security deposit for rentals.",
    icon: Upload,
  },
  {
    title: "Go live on the shop",
    description:
      "After a quick review, your listing appears for shoppers to browse. Verify your ID before submitting your first listing.",
    icon: CheckCircle2,
  },
  {
    title: "Approve requests",
    description:
      "When someone wants your item, approve or decline within the deadline. You can also respond from your email link.",
    icon: CalendarClock,
  },
  {
    title: "Ship & track",
    description:
      "Once the shopper pays, fulfill the order within the agreed delivery window. Track progress from your orders dashboard.",
    icon: PackageCheck,
  },
  {
    title: "Confirm return & get paid",
    description:
      "Inspect returned rentals, then earnings land in your wallet. Withdraw to your linked bank account anytime.",
    icon: Banknote,
  },
];

export const deliveryFlowSteps: HowItWorksStep[] = [
  {
    title: "Set your windows",
    description:
      "Choose delivery and return pickup times at checkout. Windows are based on your rental dates and address in Lagos.",
    icon: CalendarClock,
  },
  {
    title: "Delivered to your door",
    description:
      "Trusted logistics partners handle delivery across Lagos. Track your shipment from Orders.",
    icon: Truck,
  },
  {
    title: "Easy returns",
    description:
      "When your rental ends, schedule a pickup from Orders. The lister inspects the item, then it is ready for the next shopper.",
    icon: Box,
  },
];

export const paymentsFlowSteps: HowItWorksStep[] = [
  {
    title: "Fund your wallet",
    description:
      "Transfer to your personal virtual account. Available balance pays for rentals, purchases, and shipping.",
    icon: Wallet,
  },
  {
    title: "Security deposit",
    description:
      "For rentals, a deposit is held as locked balance while the item is out. It returns to available after a confirmed return.",
    icon: ShieldCheck,
  },
  {
    title: "Verified community",
    description:
      "Shoppers and listers verify with a valid ID before checkout or listing. This keeps the marketplace safe and trusted for everyone.",
    icon: CheckCircle2,
  },
];

export const pathOptions = [
  {
    id: "shoppers",
    label: "Shopper",
    title: "Rent or buy standout pieces",
    description: "Browse, request availability, checkout, and track your order.",
    href: "#shoppers",
  },
  {
    id: "listers",
    label: "Lister",
    title: "Earn from your wardrobe",
    description: "List items, approve requests, ship orders, and withdraw earnings.",
    href: "#listers",
  },
] as const;
