import { matchesClosetDropsShopTitle } from "@/lib/nav/vaultClosetDropsShop";

export function isClosetShopFeatureEnabled(
  features: { headerClosetsShopNavEnabled?: boolean } | null | undefined,
): boolean {
  return features?.headerClosetsShopNavEnabled !== false;
}

/** Remove closet-drop URL params when the admin closet feature is off. */
export function stripClosetShopSearchParams(params: URLSearchParams): boolean {
  let changed = false;

  if (params.has("onlyWithCloset")) {
    params.delete("onlyWithCloset");
    changed = true;
  }
  if (params.has("closetId")) {
    params.delete("closetId");
    changed = true;
  }
  if (matchesClosetDropsShopTitle(params.get("title"))) {
    params.delete("title");
    params.delete("description");
    changed = true;
  }

  return changed;
}
