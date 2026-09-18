/** Rent tab: primary filter starts with RENTAL (not RESALE,RENT_OR_RESALE). */
export function isRentShopNavActive(
  pathname: string,
  listingType: string,
): boolean {
  if (!pathname.startsWith("/shop")) return false;
  if (!listingType) return true;
  return listingType.startsWith("RENTAL");
}

/** Buy tab: primary filter starts with RESALE. */
export function isBuyShopNavActive(
  pathname: string,
  listingType: string,
): boolean {
  if (!pathname.startsWith("/shop")) return false;
  return listingType.startsWith("RESALE");
}
