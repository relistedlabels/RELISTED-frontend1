"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  isClosetShopFeatureEnabled,
  stripClosetShopSearchParams,
} from "@/lib/site/closetShopFeature";
import { usePublicSiteFeatures } from "@/lib/queries/site/useSiteFeatures";

/** Strips closet-drop query params when admin has the closet feature off. */
export default function ShopClosetParamsGuard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: siteFeatures, isLoading } = usePublicSiteFeatures();

  useEffect(() => {
    if (isLoading) return;
    if (isClosetShopFeatureEnabled(siteFeatures?.data)) return;

    const hasClosetParams =
      searchParams.get("onlyWithCloset") === "true" ||
      Boolean(searchParams.get("closetId"));

    if (!hasClosetParams) return;

    const params = new URLSearchParams(searchParams.toString());
    stripClosetShopSearchParams(params);
    params.delete("page");
    const qs = params.toString();
    router.replace(qs ? `/shop?${qs}` : "/shop");
  }, [isLoading, router, searchParams, siteFeatures?.data]);

  return null;
}
