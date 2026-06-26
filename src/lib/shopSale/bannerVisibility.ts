import type { PublicShopSale } from "@/lib/api/shopSale";

/** Whether the featured sale promo banner should render (matches Vault Closet placement rules). */
export function isShopSaleBannerActive(
  sale: PublicShopSale | null | undefined,
  now: number = Date.now(),
): boolean {
  if (!sale || !sale.bannerEnabled) return false;
  if (sale.phase === "ended" || sale.phase === "off") return false;

  const start = new Date(sale.startsAt).getTime();
  const end = new Date(sale.endsAt).getTime();
  if (now > end) return false;

  return now < start || now <= end;
}
