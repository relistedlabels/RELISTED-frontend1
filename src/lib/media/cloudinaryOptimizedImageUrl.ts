const CLOUDINARY_IMAGE_UPLOAD = /^https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\//i;

/** Leading segment already looks like Cloudinary transformation keys (not a version `v123`). */
const LOOKS_LIKE_TRANSFORM_SEGMENT =
  /^(w_|c_|q_|f_|h_|e_|b_|o_|t_|x_|y_|a_|d_|l_|u_|fl_|g_|so_|sp_|ar_|br_|if_|pg_|dn_|du_|co_|bl_|bo_|r_|z_)/i;

/**
 * Inserts Cloudinary fetch transformations so cards and backgrounds do not
 * download multi-megabyte originals. Skips signed URLs (`s--...--`) because
 * changing the path invalidates the signature.
 *
 * Heuristic: only the first path segment after `upload/` is inspected. A public
 * ID whose first folder name looks like a transform (e.g. starts with `w_`) is
 * skipped to avoid corrupting the URL. That is rare in practice.
 */
export function cloudinaryOptimizedImageUrl(
  url: string | null | undefined,
  options?: { maxWidth?: number },
): string {
  if (url == null || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (!trimmed) return "";

  const m = trimmed.match(CLOUDINARY_IMAGE_UPLOAD);
  if (!m) return trimmed;

  const prefix = m[0];
  const afterUpload = trimmed.slice(prefix.length);
  if (!afterUpload || afterUpload.includes("s--")) return trimmed;

  const firstSeg = afterUpload.split("/")[0] ?? "";
  if (LOOKS_LIKE_TRANSFORM_SEGMENT.test(firstSeg)) return trimmed;

  const maxWidth = Math.min(Math.max(options?.maxWidth ?? 900, 240), 4000);
  const chain = `f_auto,q_auto:good,w_${maxWidth},c_limit`;
  return `${prefix}${chain}/${afterUpload}`;
}
