/** Shop browse tab bar only applies on the catalog route, not cart or PDP. */
export function isShopBrowseNavPath(pathname: string): boolean {
  return pathname === "/shop";
}

/** Rent tab: primary filter starts with RENTAL (not RESALE,RENT_OR_RESALE). */
export function isRentShopNavActive(
  pathname: string,
  listingType: string,
): boolean {
  if (!isShopBrowseNavPath(pathname)) return false;
  if (!listingType) return true;
  return listingType.startsWith("RENTAL");
}

/** Buy tab: primary filter starts with RESALE. */
export function isBuyShopNavActive(
  pathname: string,
  listingType: string,
): boolean {
  if (!isShopBrowseNavPath(pathname)) return false;
  return listingType.startsWith("RESALE");
}
