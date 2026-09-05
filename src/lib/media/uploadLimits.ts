/** Hard cap for images sent to the API (Cloudinary limit). */
export const MAX_UPLOAD_IMAGE_BYTES = 10 * 1024 * 1024;

/** Allow larger picks on the client; we normalize before upload. */
export const MAX_SOURCE_IMAGE_BYTES = 25 * 1024 * 1024;

export const MAX_UPLOAD_VIDEO_BYTES = 30 * 1024 * 1024;

export const MAX_UPLOAD_PDF_BYTES = 10 * 1024 * 1024;

/** Match Cloudinary incoming transform in the backend. */
export const MAX_IMAGE_EDGE_PX = 1600;

/** Target size after normalization (headroom under Cloudinary 10MB). */
export const COMPRESS_TARGET_BYTES = 9 * 1024 * 1024;

/** Canonical ingest format for user photos (transcode/normalize target). */
export const CANONICAL_UPLOAD_IMAGE_TYPE = "image/jpeg";

export const NORMALIZE_JPEG_QUALITY_START = 0.88;

export function formatUploadLimitMb(bytes: number): number {
  return Math.round(bytes / (1024 * 1024));
}

export function normalizedUploadFileName(originalName: string): string {
  const base = originalName.replace(/\.[^.]+$/, "") || "upload";
  return `${base}.jpg`;
}
