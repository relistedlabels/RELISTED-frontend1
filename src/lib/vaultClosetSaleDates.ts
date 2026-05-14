/**
 * Sale window for the Vault Closet promo banner (local time).
 * Opens 10:00 May 15; last moment May 17 end-of-day.
 */
export const VAULT_CLOSET_SALE_START = new Date(2026, 4, 15, 10, 0, 0);
export const VAULT_CLOSET_SALE_END = new Date(2026, 4, 17, 23, 59, 59, 999);

/** True while the banner should show (through end of last sale day). */
export function isVaultClosetSaleBannerVisible(now: number = Date.now()) {
  return now <= VAULT_CLOSET_SALE_END.getTime();
}

/**
 * Shown on rent / add-to-cart when the product is in a closet and
 * `headerClosetsShopNavEnabled` is off. Checkout behavior is unchanged.
 */
export const VAULT_CLOSET_SHOP_OFF_PRIMARY_CTA =
  "Available from May 15th - May 17th";

export function publicProductHasCloset(
  product:
    | {
        closetId?: string | null;
        closet?: { id: string } | null;
      }
    | null
    | undefined,
): boolean {
  if (!product) return false;
  if (product.closet?.id) return true;
  const cid = product.closetId;
  return typeof cid === "string" && cid.trim().length > 0;
}
