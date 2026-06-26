import {
  getClosetEarliestDeliveryLagosYmd,
  VAULT_CLOSET_SHOP_OFF_PRIMARY_CTA,
} from "@/lib/vaultClosetSaleDates";

export type ProductActiveSale = {
  slug: string;
  headline: string;
  preSaleMessage: string | null;
  shopAccessEnabled: boolean;
  phase: "upcoming" | "live" | "ended" | "off";
  earliestDeliveryAt: string | null;
};

export function productHasActiveSale(
  product: { activeSale?: ProductActiveSale | null } | null | undefined,
): product is { activeSale: ProductActiveSale } {
  return Boolean(product?.activeSale?.slug);
}

// Pre-sale CTA overrides on product-page "Rent now" / "Buy now" (admin field:
// "Message before sale opens"). Set to true to restore gated-shopping labels.
const PRODUCT_PRE_SALE_CTA_ENABLED = false;

/** CTA when shopping is gated (waitlist / pre-open). Sale config wins over legacy closet copy. */
export function getProductPreSaleCta(
  product:
    | {
        activeSale?: ProductActiveSale | null;
        closetId?: string | null;
        closet?: { id: string } | null;
      }
    | null
    | undefined,
  options?: { legacyClosetFallback?: boolean },
): string | undefined {
  if (!PRODUCT_PRE_SALE_CTA_ENABLED) return undefined;

  if (!product) return undefined;
  const sale = product.activeSale;
  if (sale && !sale.shopAccessEnabled) {
    return (
      sale.preSaleMessage?.trim() ||
      (options?.legacyClosetFallback ? VAULT_CLOSET_SHOP_OFF_PRIMARY_CTA : undefined)
    );
  }
  if (options?.legacyClosetFallback) {
    return VAULT_CLOSET_SHOP_OFF_PRIMARY_CTA;
  }
  return undefined;
}

/** Lagos YYYY-MM-DD floor for delivery scheduling (sale items). */
export function getProductSaleEarliestDeliveryLagosYmd(
  product: { activeSale?: ProductActiveSale | null } | null | undefined,
): string | undefined {
  const iso = product?.activeSale?.earliestDeliveryAt;
  if (!iso) return undefined;
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return undefined;
    return d.toLocaleDateString("en-CA", { timeZone: "Africa/Lagos" });
  } catch {
    return undefined;
  }
}

export function getCheckoutItemEarliestDeliveryLagosYmd(item: unknown): string | undefined {
  if (!item || typeof item !== "object") return undefined;
  const o = item as Record<string, unknown>;
  const detail = (o.productDetail ?? o.product) as
    | { activeSale?: ProductActiveSale | null }
    | undefined;
  return (
    getProductSaleEarliestDeliveryLagosYmd(detail) ??
    (detail?.activeSale ? getClosetEarliestDeliveryLagosYmd() : undefined)
  );
}

export function checkoutItemInActiveSale(item: unknown): boolean {
  if (!item || typeof item !== "object") return false;
  const o = item as Record<string, unknown>;
  const detail = o.productDetail ?? o.product;
  return productHasActiveSale(
    detail as { activeSale?: ProductActiveSale | null },
  );
}
