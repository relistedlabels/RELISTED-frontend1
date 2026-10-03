import type { ReturnPickupWindowOptions } from "@/lib/queries/renters/useReturnPickupWindowOptions";

export function resolveReturnPickupWindowSummary(
  options: ReturnPickupWindowOptions | undefined,
): string | null {
  if (!options) return null;

  const booked = options.bookedPickupWindow?.summary?.trim();
  if (booked) return booked;

  const suggested = options.suggested?.summary?.trim();
  if (suggested) return suggested;

  const dayLabel = options.scheduledDayLabel?.trim();
  if (dayLabel) return dayLabel;

  return null;
}

export function renterReturnPromptCopy(productLabel: string) {
  return {
    title: "Ready to send it back?",
    body: `Add photos and get ${productLabel} ready for pickup. We will send a rider for your slot.`,
    primaryLabel: "Return item",
  };
}
