import type { CheckoutStep } from "@/app/shop/cart/checkout/components/CheckoutStepper";

/** Maps ?step= query param to delivery (1) or pay (2). */
export function parseCheckoutStep(raw: string | null): CheckoutStep {
  const n = Number(raw);
  if (n === 2) return 2;
  if (n >= 3) return 2;
  return 1;
}
