"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Upload, X } from "lucide-react";
import { Paragraph3, Paragraph1 } from "@/common/ui/Text";
import { ToolInfo } from "@/common/ui/ToolInfo";
import { Attachment, useProductDraftStore } from "@/store/useProductDraftStore";
import { useUploader } from "@/context/UploaderContext";

type Slot = {
  id: string;
  label: string;
};

const SLOTS: Slot[] = [
  { id: "main", label: "Main Photo" },
  { id: "photo1", label: "Photo 1" },
  { id: "photo2", label: "Photo 2" },
  { id: "photo3", label: "Photo 3" },
  { id: "video", label: "Video 1" },
];

export const ItemImageUploader: React.FC = () => {
  const { data, setField } = useProductDraftStore();
  const uploader = useUploader();

  const [tempPreviews, setTempPreviews] = useState<Record<string, string>>({});
  const [uploadStatus, setUploadStatus] = useState<Record<string, string>>({});
  const attachments = Array.isArray(data.attachments) ? data.attachments : [];

  // ✅ Watch uploads and save them to store when done
  useEffect(() => {
    uploader.uploads.forEach((upload) => {
      // ✅ Guard against undefined slotId
      if (upload.done && upload.slotId && upload.url) {
        const slotId = upload.slotId; // Narrow type

        // Check if this attachment is already in store
        const alreadyExists = attachments.some(
          (att) => att.slotId === slotId && att.id === upload.id,
        );

        if (!alreadyExists) {
          console.log(`💾 Saving upload to store:`, {
            id: upload.id,
            slotId,
            url: upload.url,
          });

          const newAttachment: Attachment = {
            id: upload.id,
            slotId,
            url: upload.url,
            name: upload.file.name,
            type: upload.file.type.startsWith("video") ? "video" : "image",
            progress: 100,
          };

          const updatedAttachments = [
            ...attachments.filter((att) => att.slotId !== slotId),
            newAttachment,
          ];

          setField("attachments", updatedAttachments);
          setUploadStatus((prev) => ({
            ...prev,
            [slotId]: "saved ✅",
          }));
        }
      }
    });
  }, [uploader.uploads, attachments, setField]);

  const handleUpload = useCallback(
    (file: File, slotId: string) => {
      console.log(`🚀 Starting upload for slot: ${slotId}, file: ${file.name}`);

      // Validate file size (7MB max)
      const maxFileSize = 7 * 1024 * 1024; // 7MB in bytes
      if (file.size > maxFileSize) {
        console.error("❌ File size exceeds 7MB limit");
        setUploadStatus((prev) => ({
          ...prev,
          [slotId]: "error: file too large (max 7MB)",
        }));
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      setTempPreviews((prev) => ({ ...prev, [slotId]: previewUrl }));
      setUploadStatus((prev) => ({ ...prev, [slotId]: "uploading..." }));

      // Add upload to context
      const uploadItems = uploader.addUploads([file], slotId);
      console.log(`✨ Upload items created:`, uploadItems);

      if (uploadItems.length === 0) {
        console.error("❌ No upload items returned");
        setUploadStatus((prev) => ({ ...prev, [slotId]: "error: no upload" }));
        return;
      }
    },
    [uploader],
  );

  const handleRemove = useCallback(
    (slotId: string, attachmentId: string) => {
      console.log(`🗑️ Removing attachment:`, { slotId, attachmentId });

      uploader.cancelUpload(attachmentId);

      const updatedAttachments = attachments.filter(
        (att) => !(att.slotId === slotId && att.id === attachmentId),
      );
      setField("attachments", updatedAttachments);

      setTempPreviews((prev) => {
        const copy = { ...prev };
        if (copy[slotId]?.startsWith("blob:")) {
          URL.revokeObjectURL(copy[slotId]);
        }
        delete copy[slotId];
        return copy;
      });

      setUploadStatus((prev) => {
        const copy = { ...prev };
        delete copy[slotId];
        return copy;
      });
    },
    [uploader, setField, attachments],
  );

  useEffect(() => {
    return () => {
      Object.values(tempPreviews).forEach((url) => {
        if (url?.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [tempPreviews]);

  return (
    <div className="w-full rounded-xl border border-gray-200 p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <Paragraph3 className="text-sm font-semibold text-black">
            Item Image
          </Paragraph3>
          <Paragraph1 className="text-xs text-gray-500">
            Upload at least 5 high quality images and videos of your item
          </Paragraph1>
        </div>
        <ToolInfo content="Upload clear, high-quality photos of your item from different angles. This helps potential buyers understand what they're getting." />
      </div>

      <div className="grid grid-cols-5 gap-4">
        {SLOTS.map((slot) => {
          const attachment = attachments.find((att) => att.slotId === slot.id);
          const previewSrc = attachment?.url ?? tempPreviews[slot.id] ?? null;
          const currentUpload = uploader.uploads.find(
            (u) => u.slotId === slot.id,
          );

          const isUploading = currentUpload && !currentUpload.done;
          const progress = currentUpload?.progress ?? 0;

          return (
            <label
              key={slot.id}
              className="group relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 p-2 text-center transition hover:border-gray-400"
            >
              {previewSrc ? (
                <>
                  {slot.id === "video" ||
                  previewSrc?.includes(".mp4") ||
                  previewSrc?.includes(".mov") ||
                  previewSrc?.includes(".avi") ? (
                    <div className="relative flex h-16 w-24 items-center justify-center rounded bg-gray-100">
                      <video
                        src={previewSrc}
                        className="h-full w-full rounded object-cover"
                        muted
                      />
                      <div className="absolute bottom-1 right-1 rounded bg-black/50 p-1">
                        <span className="text-xs text-white">VIDEO</span>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={previewSrc}
                      alt={attachment?.name || "Preview"}
                      className="h-16 w-24 rounded object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder-image.png";
                      }}
                    />
                  )}

                  {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center rounded bg-black/20">
                      <div className="text-center">
                        <div className="text-xs font-bold text-white">
                          {progress}%
                        </div>
                      </div>
                    </div>
                  )}

                  {!isUploading && attachment && (
                    <button
                      type="button"
                      className="absolute right-1 top-1 z-10 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRemove(slot.id, attachment.id);
                      }}
                    >
                      <X size={12} />
                    </button>
                  )}
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5 text-gray-500" />
                  <span className="text-xs text-gray-600">{slot.label}</span>
                  {uploadStatus[slot.id] && (
                    <span className="text-xs text-gray-500">
                      {uploadStatus[slot.id]}
                    </span>
                  )}
                </>
              )}

              <input
                type="file"
                accept={slot.id === "video" ? "video/*" : "image/*"}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload(file, slot.id);
                  e.target.value = "";
                }}
                disabled={!!attachment || isUploading}
              />
            </label>
          );
        })}
      </div>

      {/* Debug Info */}
      <div className="mt-4 space-y-1 hidden rounded bg-blue-50 p-3 text-xs text-blue-900">
        <p>
          📦 <strong>Attachments in store: {attachments.length}</strong>
        </p>
        <p>
          ⬆️{" "}
          <strong>
            Uploads in progress:{" "}
            {uploader.uploads.filter((u) => !u.done).length}
          </strong>
        </p>
        <p>
          ✅ <strong>Total uploads: {uploader.uploads.length}</strong>
        </p>
        {attachments.length > 0 && (
          <div className="mt-2 max-h-32 overflow-y-auto rounded bg-white p-2">
            {attachments.map((att) => (
              <p key={att.id} className="truncate font-mono text-xs">
                🖼️ {att.slotId}: {att.url?.substring(0, 40)}...
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
