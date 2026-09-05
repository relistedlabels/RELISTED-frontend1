import { describe, expect, it } from "bun:test";
import {
  isHeicLikeFile,
  isNormalizablePhoto,
  shouldNormalizePhoto,
} from "./imageUploadNormalize.util";
import {
  CANONICAL_UPLOAD_IMAGE_TYPE,
  COMPRESS_TARGET_BYTES,
  MAX_IMAGE_EDGE_PX,
  MAX_UPLOAD_IMAGE_BYTES,
  formatUploadLimitMb,
  normalizedUploadFileName,
} from "./uploadLimits";

function mockFile(overrides: Partial<File> & { name: string; type: string }): File {
  return {
    size: 1_000_000,
    lastModified: Date.now(),
    ...overrides,
  } as File;
}

describe("uploadLimits", () => {
  it("uses Cloudinary 10MB cap for uploaded images", () => {
    expect(MAX_UPLOAD_IMAGE_BYTES).toBe(10 * 1024 * 1024);
    expect(COMPRESS_TARGET_BYTES).toBeLessThan(MAX_UPLOAD_IMAGE_BYTES);
  });

  it("normalizes photos to JPEG", () => {
    expect(CANONICAL_UPLOAD_IMAGE_TYPE).toBe("image/jpeg");
    expect(normalizedUploadFileName("IMG_1234.HEIC")).toBe("IMG_1234.jpg");
  });

  it("formats MB for user-facing errors", () => {
    expect(formatUploadLimitMb(10 * 1024 * 1024)).toBe(10);
  });
});

describe("imageUploadNormalize", () => {
  it("detects HEIC by mime and extension", () => {
    expect(
      isHeicLikeFile(mockFile({ name: "photo.heic", type: "image/heic" })),
    ).toBe(true);
    expect(
      isHeicLikeFile(mockFile({ name: "photo.HEIC", type: "" })),
    ).toBe(true);
    expect(
      isHeicLikeFile(mockFile({ name: "photo.jpg", type: "image/jpeg" })),
    ).toBe(false);
  });

  it("skips GIF and non-images", () => {
    expect(
      isNormalizablePhoto(mockFile({ name: "a.gif", type: "image/gif" })),
    ).toBe(false);
    expect(
      isNormalizablePhoto(mockFile({ name: "a.pdf", type: "application/pdf" })),
    ).toBe(false);
    expect(
      isNormalizablePhoto(mockFile({ name: "a.png", type: "image/png" })),
    ).toBe(true);
  });

  it("normalizes non-JPEG, oversized dimensions, or large files", () => {
    expect(
      shouldNormalizePhoto(
        mockFile({ name: "a.png", type: "image/png", size: 1000 }),
        { width: 800, height: 600 },
      ),
    ).toBe(true);

    expect(
      shouldNormalizePhoto(
        mockFile({ name: "a.jpg", type: "image/jpeg", size: 1000 }),
        { width: MAX_IMAGE_EDGE_PX + 1, height: 800 },
      ),
    ).toBe(true);

    expect(
      shouldNormalizePhoto(
        mockFile({
          name: "a.jpg",
          type: "image/jpeg",
          size: COMPRESS_TARGET_BYTES + 1,
        }),
        { width: 1200, height: 900 },
      ),
    ).toBe(true);

    expect(
      shouldNormalizePhoto(
        mockFile({ name: "a.jpg", type: "image/jpeg", size: 500_000 }),
        { width: 1200, height: 900 },
      ),
    ).toBe(false);
  });
});
