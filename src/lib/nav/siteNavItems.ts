import type { LucideIcon } from "lucide-react";
import {
  Calendar,
  FileText,
  Heart,
  HelpCircle,
  MessageCircle,
  Shirt,
  ShoppingBag,
  Sparkles,
  Star,
  Tag,
  Upload,
  User,
  Wallet,
} from "lucide-react";

export type SiteNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const SHOP_NAV_ITEMS: SiteNavItem[] = [
  {
    label: "Rent",
    href: "/shop?listingType=RENTAL,RENT_OR_RESALE",
    icon: Shirt,
  },
  {
    label: "Shop Resale",
    href: "/shop?listingType=RESALE,RENT_OR_RESALE",
    icon: ShoppingBag,
  },
  {
    label: "New In",
    href: "/shop?title=New+In&description=Latest+arrivals&listingType=RENTAL,RENT_OR_RESALE,RESALE&sort=newest",
    icon: Star,
  },
  {
    label: "Style Spotlight",
    href: "/style-spotlight",
    icon: Sparkles,
  },
];

export const LIST_NAV_ITEMS: SiteNavItem[] = [
  {
    label: "List Your Wardrobe",
    href: "/auth/create-account",
    icon: Upload,
  },
];

export const HELP_NAV_ITEMS: SiteNavItem[] = [
  {
    label: "How It Works",
    href: "/how-it-works",
    icon: HelpCircle,
  },
  {
    label: "Help & FAQs",
    href: "/how-it-works#faq",
    icon: FileText,
  },
  {
    label: "Contact Us",
    href: "/contact-us",
    icon: MessageCircle,
  },
];

function authAwareHref(path: string, isLoggedIn: boolean): string {
  if (isLoggedIn) return path;
  return `/auth/sign-in?redirect=${encodeURIComponent(path)}`;
}

export function getMyRelistedNavItems(options: {
  isLoggedIn: boolean;
  isLister: boolean;
}): SiteNavItem[] {
  const { isLoggedIn, isLister } = options;
  const listingsHref = isLister
    ? "/listers/inventory"
    : "/auth/create-account";

  return [
    {
      label: "Saved Items",
      href: authAwareHref("/renters/favorites", isLoggedIn),
      icon: Heart,
    },
    {
      label: "My Rentals & Orders",
      href: authAwareHref("/renters/orders", isLoggedIn),
      icon: Calendar,
    },
    {
      label: "My Listings",
      href: authAwareHref(listingsHref, isLoggedIn),
      icon: Tag,
    },
    {
      label: "Wallet",
      href: authAwareHref("/renters/wallet", isLoggedIn),
      icon: Wallet,
    },
    {
      label: "Account Settings",
      href: authAwareHref("/renters/account", isLoggedIn),
      icon: User,
    },
  ];
}
