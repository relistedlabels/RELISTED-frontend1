import { orderedProductImageUrls } from "@/lib/product/sortProductAttachmentUploads";

/**
 * Hero image for product cards / strips: prefer a real listing photo, not the
 * closet cover when the same URL was stored on both (common reuse).
 */
export function primaryProductHeroImage(product: {
  closet?: { imageUrl: string | null } | null;
  attachments?: {
    uploads?: Array<{
      url?: string | null;
      displayOrder?: number | null;
      id?: string;
    }>;
  } | null;
}): string {
  const urls = orderedProductImageUrls(product);
  return urls[0] || "/placeholder.jpg";
}

export {
  firstProductAttachmentImageUrl,
  orderedProductImageUrls,
  sortProductAttachmentUploads,
} from "@/lib/product/sortProductAttachmentUploads";
