const CLOUDINARY_IMAGE_UPLOAD =
  /^https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\//i;

/** Leading segment already looks like Cloudinary transformation keys (not a version `v123`). */
const LOOKS_LIKE_TRANSFORM_SEGMENT =
  /^(w_|c_|q_|f_|h_|e_|b_|o_|t_|x_|y_|a_|d_|l_|u_|fl_|g_|so_|sp_|ar_|br_|if_|pg_|dn_|du_|co_|bl_|bo_|r_|z_)/i;

/**
 * Fixed delivery ladder so each asset produces few reusable derivatives.
 * Prefer `f_webp` over `f_auto` to avoid format multiplication (separate credits).
 */
export const CLOUDINARY_SIZE_PRESETS = {
  thumb: "f_webp,q_auto:eco,w_200,c_limit",
  card: "f_webp,q_auto:eco,w_600,c_limit",
  detail: "f_webp,q_auto:eco,w_1200,c_limit",
} as const;

export type CloudinarySizePreset = keyof typeof CLOUDINARY_SIZE_PRESETS;

/**
 * Inserts Cloudinary fetch transformations so cards and backgrounds do not
 * download multi-megabyte originals. Skips signed URLs (`s--...--`) because
 * changing the path invalidates the signature.
 *
 * Heuristic: only the first path segment after `upload/` is inspected. A public
 * ID whose first folder name looks like a transform (e.g. starts with `w_`) is
 * skipped to avoid corrupting the URL. That is rare in practice.
 *
 * When the URL already has a transform segment, it is returned unchanged
 * (including our ladder strings) so callers can safely re-apply.
 */
export function cloudinaryOptimizedImageUrl(
  url: string | null | undefined,
  options?: { preset?: CloudinarySizePreset; maxWidth?: number },
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

  const preset = options?.preset;
  if (preset && preset in CLOUDINARY_SIZE_PRESETS) {
    return `${prefix}${CLOUDINARY_SIZE_PRESETS[preset]}/${afterUpload}`;
  }

  // Legacy maxWidth: snap to nearest ladder size so we do not invent new widths.
  if (options?.maxWidth != null) {
    const w = options.maxWidth;
    const snapped: CloudinarySizePreset =
      w <= 300 ? "thumb" : w <= 800 ? "card" : "detail";
    return `${prefix}${CLOUDINARY_SIZE_PRESETS[snapped]}/${afterUpload}`;
  }

  return `${prefix}${CLOUDINARY_SIZE_PRESETS.card}/${afterUpload}`;
}
