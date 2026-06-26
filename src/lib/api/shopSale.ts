import { apiFetch } from "./http";

export type PublicShopSale = {
  id: string;
  slug: string;
  headline: string;
  subheadline: string | null;
  shopTitle: string;
  shopDescription: string | null;
  preSaleMessage: string | null;
  startsAt: string;
  endsAt: string;
  earliestDeliveryAt: string | null;
  bannerEnabled: boolean;
  waitlistEnabled: boolean;
  shopAccessEnabled: boolean;
  showCountdown: boolean;
  phase: "off" | "upcoming" | "live" | "ended";
  productCount: number;
};

export type ShopSaleInterestResponse = {
  success: boolean;
  message: string;
  alreadySubscribed?: boolean;
};

export const shopSaleApi = {
  listActive: () =>
    apiFetch<{ success: true; data: PublicShopSale[] }>(
      "/api/public/shop-sales/active",
    ),

  getFeatured: () =>
    apiFetch<{ success: true; data: PublicShopSale | null }>(
      "/api/public/shop-sales/featured",
    ),

  getBySlug: (slug: string) =>
    apiFetch<{ success: true; data: PublicShopSale }>(
      `/api/public/shop-sales/${encodeURIComponent(slug)}`,
    ),

  registerInterest: (slug: string, email: string) =>
    apiFetch<ShopSaleInterestResponse>(
      `/api/public/shop-sales/${encodeURIComponent(slug)}/interest`,
      { method: "POST", body: JSON.stringify({ email }) },
    ),
};

export function buildSaleShopHref(sale: Pick<PublicShopSale, "slug" | "shopTitle" | "shopDescription">) {
  const params = new URLSearchParams();
  params.set("sale", sale.slug);
  params.set("title", sale.shopTitle);
  if (sale.shopDescription) {
    params.set("description", sale.shopDescription);
  }
  return `/shop?${params.toString()}`;
}

/** Label for header nav links. */
export function saleNavLabel(
  sale: Pick<PublicShopSale, "shopTitle" | "headline">,
): string {
  return sale.shopTitle?.trim() || sale.headline?.trim() || "Sale";
}
