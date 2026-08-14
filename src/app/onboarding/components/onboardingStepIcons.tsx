import type { LucideIcon } from "lucide-react";
import {
  CalendarRange,
  Camera,
  Package,
  Search,
  ShieldCheck,
  Sparkles,
  Tag,
  Truck,
  Users,
  Wallet,
} from "lucide-react";
import type { OnboardingStepIcon } from "@/lib/onboarding/copy";

export const onboardingStepIconMap: Record<OnboardingStepIcon, LucideIcon> = {
  search: Search,
  choice: CalendarRange,
  return: Package,
  upload: Camera,
  ship: Truck,
  wallet: Wallet,
  camera: Camera,
  tag: Tag,
  sparkles: Sparkles,
  account: Users,
};

export const onboardingTrustIcon = ShieldCheck;
