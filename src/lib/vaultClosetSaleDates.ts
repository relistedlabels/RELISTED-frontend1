/** Sale window for the Vault Closet promo banner (local midnight boundaries). */
export const VAULT_CLOSET_SALE_START = new Date(2026, 4, 15, 0, 0, 0);
export const VAULT_CLOSET_SALE_END = new Date(2026, 4, 17, 23, 59, 59, 999);

/** True while the banner should show (through end of last sale day). */
export function isVaultClosetSaleBannerVisible(now: number = Date.now()) {
  return now <= VAULT_CLOSET_SALE_END.getTime();
}
