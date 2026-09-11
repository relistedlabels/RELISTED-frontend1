/** Shared sizing for admin shipment chips (status, dispatch mode, etc.). */
export const ADMIN_SHIPMENT_CHIP_CLASS =
  "inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium leading-none whitespace-nowrap";

/** Manual / Relisted-handled legs (table + detail modal). */
export const RELISTED_DISPATCH_BADGE_CLASS = `${ADMIN_SHIPMENT_CHIP_CLASS} bg-gray-900 text-white`;

const SHIPPING_QUOTE_WARNING_CARRIER: Record<string, string> = {
  topship: "Topship",
  shipbubble: "Shipbubble",
  chowdeck_relay: "Chowdeck Relay",
  tship: "TShip",
};

/** Admin progressive rate preview loading rows. */
export const ADMIN_RATE_PREVIEW_PROVIDER_LABEL: Record<string, string> = {
  shipbubble: "Shipbubble",
  topship: "Topship",
  chowdeck_relay: "Chowdeck Relay",
  tship: "TShip",
};

/** Admin rate-preview warning: keep backend copy, prefix carrier when missing. */
export function formatShippingQuoteWarningMessage(w: {
  provider: string;
  message: string;
}): string {
  const message = w.message?.trim() || "Carrier API request failed";
  const carrier = SHIPPING_QUOTE_WARNING_CARRIER[w.provider];
  if (!carrier) return message;
  if (message.toLowerCase().startsWith(`${carrier.toLowerCase()}:`)) {
    return message;
  }
  return `${carrier}: ${message}`;
}

/** Strip shipbubble-style prefix for admin shipment detail display. */
export function formatAdminPricingTier(
  tier: string | null | undefined,
): string {
  if (!tier?.trim()) return "—";
  const colon = tier.indexOf(":");
  return colon >= 0 ? tier.slice(colon + 1) : tier;
}
