import {
  CANONICAL_UPLOAD_IMAGE_TYPE,
  COMPRESS_TARGET_BYTES,
  MAX_IMAGE_EDGE_PX,
} from "./uploadLimits";

const HEIC_TYPES = new Set([
  "image/heic",
  "image/heif",
  "image/heic-sequence",
  "image/heif-sequence",
]);

const HEIC_EXT = /\.(heic|heif)$/i;

/** iPhone and some Android cameras; not universally decodable in browsers. */
export function isHeicLikeFile(file: File): boolean {
  const type = file.type.toLowerCase();
  if (HEIC_TYPES.has(type)) return true;
  if (!type && HEIC_EXT.test(file.name)) return true;
  return HEIC_EXT.test(file.name);
}

export function isNormalizablePhoto(file: File): boolean {
  if (!file.type.startsWith("image/")) return false;
  if (file.type === "image/gif") return false;
  return true;
}

export function shouldNormalizePhoto(
  file: File,
  dimensions: { width: number; height: number },
): boolean {
  if (isHeicLikeFile(file)) return true;
  if (file.type !== CANONICAL_UPLOAD_IMAGE_TYPE) return true;
  if (Math.max(dimensions.width, dimensions.height) > MAX_IMAGE_EDGE_PX) {
    return true;
  }
  if (file.size > COMPRESS_TARGET_BYTES) return true;
  return false;
}
