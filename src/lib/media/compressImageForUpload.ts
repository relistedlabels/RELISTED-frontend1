import {
  CANONICAL_UPLOAD_IMAGE_TYPE,
  COMPRESS_TARGET_BYTES,
  MAX_IMAGE_EDGE_PX,
  MAX_UPLOAD_IMAGE_BYTES,
  NORMALIZE_JPEG_QUALITY_START,
  formatUploadLimitMb,
  normalizedUploadFileName,
} from "./uploadLimits";
import {
  isHeicLikeFile,
  isNormalizablePhoto,
  shouldNormalizePhoto,
} from "./imageUploadNormalize.util";

function isBrowser(): boolean {
  return typeof document !== "undefined";
}

function loadImageElement(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image"));
    };
    img.src = url;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, CANONICAL_UPLOAD_IMAGE_TYPE, quality);
  });
}

function scaledDimensions(
  width: number,
  height: number,
  maxEdge: number,
): { width: number; height: number } {
  const scale = Math.min(1, maxEdge / Math.max(width, height));
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

async function transcodeHeicToJpeg(file: File): Promise<File> {
  const heic2any = (await import("heic2any")).default;
  const converted = await heic2any({
    blob: file,
    toType: CANONICAL_UPLOAD_IMAGE_TYPE,
    quality: 0.92,
  });
  const blob = Array.isArray(converted) ? converted[0] : converted;
  if (!(blob instanceof Blob)) {
    throw new Error("Could not convert HEIC photo");
  }
  return new File([blob], normalizedUploadFileName(file.name), {
    type: CANONICAL_UPLOAD_IMAGE_TYPE,
    lastModified: Date.now(),
  });
}

async function decodeUploadPhoto(file: File): Promise<File> {
  if (!isHeicLikeFile(file)) return file;
  try {
    return await transcodeHeicToJpeg(file);
  } catch {
    throw new Error(
      "Could not read this photo format. Save as JPEG or PNG and try again.",
    );
  }
}

function drawNormalizedJpeg(
  img: HTMLImageElement,
): Promise<File | null> {
  const { width, height } = scaledDimensions(
    img.naturalWidth,
    img.naturalHeight,
    MAX_IMAGE_EDGE_PX,
  );

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.resolve(null);

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  let quality = NORMALIZE_JPEG_QUALITY_START;

  return (async () => {
    let blob: Blob | null = null;
    while (quality >= 0.55) {
      blob = await canvasToBlob(canvas, quality);
      if (!blob) break;
      if (blob.size <= COMPRESS_TARGET_BYTES) break;
      quality -= 0.08;
    }
    if (!blob) return null;
    return new File([blob], normalizedUploadFileName("upload"), {
      type: CANONICAL_UPLOAD_IMAGE_TYPE,
      lastModified: Date.now(),
    });
  })();
}

/**
 * Ingest normalization: transcode HEIC/WebP/PNG/etc. to JPEG, resize to max edge,
 * and compress under Cloudinary's upload cap. GIFs and non-images pass through.
 */
export async function normalizeImageForUpload(file: File): Promise<File> {
  if (!isBrowser() || !isNormalizablePhoto(file)) {
    return file;
  }

  const decoded = await decodeUploadPhoto(file);

  let img: HTMLImageElement;
  try {
    img = await loadImageElement(decoded);
  } catch {
    if (isHeicLikeFile(file)) {
      throw new Error(
        "Could not read this photo format. Save as JPEG or PNG and try again.",
      );
    }
    return file;
  }

  if (
    !shouldNormalizePhoto(decoded, {
      width: img.naturalWidth,
      height: img.naturalHeight,
    })
  ) {
    return decoded;
  }

  const normalized = await drawNormalizedJpeg(img);
  if (!normalized) return decoded;

  if (
    normalized.size >= decoded.size &&
    decoded.size <= MAX_UPLOAD_IMAGE_BYTES &&
    decoded.type === CANONICAL_UPLOAD_IMAGE_TYPE
  ) {
    return new File([decoded], normalizedUploadFileName(file.name), {
      type: CANONICAL_UPLOAD_IMAGE_TYPE,
      lastModified: decoded.lastModified,
    });
  }

  return new File([normalized], normalizedUploadFileName(file.name), {
    type: CANONICAL_UPLOAD_IMAGE_TYPE,
    lastModified: Date.now(),
  });
}

/** @deprecated Use normalizeImageForUpload */
export const compressImageForUpload = normalizeImageForUpload;

/** Normalize when needed, then enforce the API size cap with a clear error. */
export async function prepareFileForUpload(file: File): Promise<File> {
  const prepared = await normalizeImageForUpload(file);

  if (
    prepared.type.startsWith("image/") &&
    prepared.size > MAX_UPLOAD_IMAGE_BYTES
  ) {
    throw new Error(
      `Photo is still too large after normalization (max ${formatUploadLimitMb(MAX_UPLOAD_IMAGE_BYTES)}MB). Try a smaller image.`,
    );
  }

  return prepared;
}
