"use client";

import VaultClosetSaleBanner from "./VaultClosetSaleBanner";
import { useFeaturedShopSale } from "@/lib/queries/shop/useShopSale";
import { isShopSaleBannerActive } from "@/lib/shopSale/bannerVisibility";
import { useClosetShopFeatureEnabled } from "@/lib/queries/site/useClosetShopFeatureEnabled";

/**
 * Vault Closet layout: fixed nav in the root layout, sale banner in page flow
 * directly beneath it (not stacked above the navbar).
 */
export default function HomePageWithSaleBanner({
  children,
}: {
  children: React.ReactNode;
}) {
  const { enabled: closetFeatureEnabled } = useClosetShopFeatureEnabled();
  const { data: featuredRes } = useFeaturedShopSale();
  const reserveNavForSaleBanner =
    closetFeatureEnabled && isShopSaleBannerActive(featuredRes?.data);

  return (
    <div
      className={reserveNavForSaleBanner ? "pt-20 xl:pt-[77px]" : undefined}
    >
      <VaultClosetSaleBanner />
      {children}
    </div>
  );
}
