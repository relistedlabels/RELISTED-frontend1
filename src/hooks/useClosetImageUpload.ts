"use client";

import { useCallback, useEffect, useState } from "react";
import { useUploader } from "@/context/UploaderContext";

/** Same limit as product images (non-video slots) in `ItemImageUploader`. */
const MAX_IMAGE_BYTES = 7 * 1024 * 1024;

export const CLOSET_AVATAR_SLOT_CREATE = "closet-avatar-create";
export const CLOSET_AVATAR_SLOT_EDIT = "closet-avatar-edit";

/**
 * Single-image upload for closet avatar — same pipeline as product uploads:
 * `UploaderContext` → `uploadFile` → `POST /upload/:id`.
 */
export function useClosetImageUpload(options: {
  slotId: string;
  enabled: boolean;
  initialImageUrl?: string | null;
}) {
  const { slotId, enabled, initialImageUrl } = options;
  const uploader = useUploader();

  const [tempPreview, setTempPreview] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [savedUrl, setSavedUrl] = useState<string | null>(
    initialImageUrl ?? null,
  );

  // When sheet opens or closet changes: clear this slot in the global uploader (incl. stale "done" rows)
  // and reset local state from server. Intentionally omit `uploader.uploads` from deps to avoid resets on every progress tick.
  useEffect(() => {
    if (!enabled) return;
    uploader.uploads
      .filter((u) => u.slotId === slotId)
      .forEach((u) => uploader.cancelUpload(u.id));

    setSavedUrl(initialImageUrl ?? null);
    setTempPreview((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return null;
    });
    setUploadStatus("");
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only reset when sheet context changes
  }, [enabled, slotId, initialImageUrl]);

  // When an upload for this slot finishes, store CDN URL (same pattern as ItemImageUploader)
  useEffect(() => {
    if (!enabled) return;

    const finished = uploader.uploads.find(
      (u) => u.slotId === slotId && u.done && u.url,
    );
    if (!finished?.url) return;

    setSavedUrl(finished.url);
    setUploadStatus("saved ✅");
    setTempPreview((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return null;
    });
  }, [enabled, slotId, uploader.uploads]);

  useEffect(() => {
    if (!enabled) return;
    const failed = uploader.uploads.find(
      (u) => u.slotId === slotId && u.error,
    );
    if (failed?.error) setUploadStatus(`error: ${failed.error}`);
  }, [enabled, slotId, uploader.uploads]);

  const handleFile = useCallback(
    (file: File) => {
      if (file.size > MAX_IMAGE_BYTES) {
        setUploadStatus(`error: file too large (max 7MB)`);
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      setTempPreview((prev) => {
        if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
        return previewUrl;
      });
      setUploadStatus("uploading...");

      const items = uploader.addUploads([file], slotId);
      if (items.length === 0) {
        setUploadStatus("error: no upload");
      }
    },
    [uploader, slotId],
  );

  const remove = useCallback(() => {
    uploader.uploads
      .filter((u) => u.slotId === slotId)
      .forEach((u) => uploader.cancelUpload(u.id));

    setSavedUrl(null);
    setTempPreview((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return null;
    });
    setUploadStatus("");
  }, [uploader, slotId]);

  useEffect(() => {
    return () => {
      if (tempPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(tempPreview);
      }
    };
  }, [tempPreview]);

  const currentUpload = uploader.uploads.find((u) => u.slotId === slotId);
  const isUploading = !!currentUpload && !currentUpload.done;
  const progress = currentUpload?.progress ?? 0;
  const previewSrc = savedUrl ?? tempPreview;

  return {
    previewSrc,
    savedUrl,
    isUploading,
    progress,
    uploadStatus,
    handleFile,
    remove,
  };
}
