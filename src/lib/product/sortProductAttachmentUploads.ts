/**
 * Stable gallery order: matches backend `Upload.displayOrder` (0 = hero), then `id`.
 * Use whenever reading `product.attachments.uploads` from any API.
 */
export type ProductAttachmentUploadLike = {
  id?: string;
  url?: string | null;
  displayOrder?: number | null;
  type?: string | null;
};

export function sortProductAttachmentUploads<T extends ProductAttachmentUploadLike>(
  uploads: T[] | null | undefined,
): T[] {
  if (!uploads?.length) return [];
  return [...uploads].sort((a, b) => {
    const ao = typeof a.displayOrder === "number" ? a.displayOrder : 0;
    const bo = typeof b.displayOrder === "number" ? b.displayOrder : 0;
    if (ao !== bo) return ao - bo;
    return String(a.id ?? "").localeCompare(String(b.id ?? ""));
  });
}

/** First image URL after canonical ordering (hero). */
export function firstProductAttachmentImageUrl(
  uploads: ProductAttachmentUploadLike[] | null | undefined,
): string | undefined {
  const u = sortProductAttachmentUploads(uploads)[0]?.url;
  const s = typeof u === "string" ? u.trim() : "";
  return s || undefined;
}

/**
 * Ordered image URLs for carousels, with optional closet cover dedupe
 * (same URL on closet + listing).
 */
export function orderedProductImageUrls(product: {
  attachments?: { uploads?: ProductAttachmentUploadLike[] } | null;
  closet?: { imageUrl?: string | null } | null;
}): string[] {
  const closetCoverUrl = product.closet?.imageUrl?.trim() || null;
  return sortProductAttachmentUploads(product.attachments?.uploads)
    .map((upload) => upload.url?.trim())
    .filter((url): url is string => Boolean(url))
    .filter((url) => !closetCoverUrl || url !== closetCoverUrl);
}
