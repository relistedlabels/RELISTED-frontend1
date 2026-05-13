/** Title query param for `/shop` when browsing vault closet drops (all closets). */
export const CLOSET_DROPS_SHOP_TITLE = "Vault Closet Drops";

const CLOSET_DROPS_SHOP_TITLE_LEGACY = "Closet Drops";

/** Recognizes current and legacy `title` query values (old bookmarks). */
export function matchesClosetDropsShopTitle(
  title: string | null | undefined,
): boolean {
  return (
    title === CLOSET_DROPS_SHOP_TITLE || title === CLOSET_DROPS_SHOP_TITLE_LEGACY
  );
}

export const CLOSET_DROPS_SHOP_DESCRIPTION =
  "Celebrity wardrobes. Limited drops. Shop it before it disappears.";

/** Same destination as home "Browse All" for The Vault Closet Drops. */
export const VAULT_CLOSET_DROPS_BROWSE_SHOP_HREF =
  "/shop?title=" +
  encodeURIComponent(CLOSET_DROPS_SHOP_TITLE) +
  "&description=" +
  encodeURIComponent(CLOSET_DROPS_SHOP_DESCRIPTION) +
  "&onlyWithCloset=true";
