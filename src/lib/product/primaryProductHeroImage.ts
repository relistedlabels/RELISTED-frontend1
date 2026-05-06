/**
 * Hero image for product cards / strips: prefer a real listing photo, not the
 * closet cover when the same URL was stored on both (common reuse).
 */
export function primaryProductHeroImage(product: {
  closet?: { imageUrl: string | null } | null;
  attachments?: { uploads?: { url?: string }[] } | null;
}): string {
  const closetUrl = product.closet?.imageUrl?.trim() || null;
  const urls =
    product.attachments?.uploads
      ?.map((u) => u.url?.trim())
      .filter((u): u is string => Boolean(u)) ?? [];
  const withoutClosetCover = closetUrl
    ? urls.filter((u) => u !== closetUrl)
    : urls;
  return withoutClosetCover[0] || "/placeholder.jpg";
}
