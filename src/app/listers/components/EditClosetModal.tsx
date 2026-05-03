"use client";

import React, { useRef, useState, useEffect } from "react";
import { Paragraph1 } from "@/common/ui/Text";
import { motion } from "framer-motion";
import { Upload, X } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useUpdateCloset } from "@/lib/mutations/closet/useUpdateCloset";
import {
  CLOSET_AVATAR_SLOT_EDIT,
  useClosetImageUpload,
} from "@/hooks/useClosetImageUpload";

interface EditClosetModalProps {
  isOpen: boolean;
  onClose: () => void;
  closetId: string;
  closetName: string;
  closetDescription?: string;
  closetImage?: string;
  isActive?: boolean;
}

const EditClosetModal: React.FC<EditClosetModalProps> = ({
  isOpen,
  onClose,
  closetId,
  closetName: initialName,
  closetDescription: initialDescription = "",
  closetImage: initialImage,
  isActive: initialIsActive = true,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [closetName, setClosetName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  /** When true, closet is hidden from public marketing routes */
  const [hiddenFromPublic, setHiddenFromPublic] = useState(!initialIsActive);
  const updateCloset = useUpdateCloset(closetId);

  const baselineImageUrl = initialImage ?? null;

  const {
    previewSrc,
    savedUrl,
    isUploading,
    progress,
    uploadStatus,
    handleFile,
    remove,
  } = useClosetImageUpload({
    slotId: CLOSET_AVATAR_SLOT_EDIT,
    enabled: isOpen,
    initialImageUrl: baselineImageUrl,
  });

  useEffect(() => {
    if (isOpen) {
      setClosetName(initialName);
      setDescription(initialDescription || "");
      setHiddenFromPublic(!initialIsActive);
    }
  }, [isOpen, initialName, initialDescription, initialIsActive]);

  const handleSaveUpdate = () => {
    const name = closetName.trim();
    if (!name) {
      toast.error("Closet name is required.");
      return;
    }

    if (isUploading) {
      toast.error("Wait for the photo upload to finish.");
      return;
    }

    const imageChanged = savedUrl !== baselineImageUrl;

    updateCloset.mutate(
      {
        name,
        description: description.trim() || undefined,
        isActive: !hiddenFromPublic,
        ...(imageChanged ? { imageUrl: savedUrl ?? "" } : {}),
      },
      {
        onSuccess: () => {
          toast.success("Closet updated");
          onClose();
        },
        onError: (err: Error) => {
          toast.error(err.message || "Could not update closet");
        },
      },
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-99 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="fixed top-0 right-0 h-screen overflow-y-auto bg-white shadow-2xl px-6 flex flex-col w-full sm:w-96 md:w-[480px]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center py-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <div>
                <Paragraph1 className="font-bold text-lg text-gray-900">
                  Edit Closet
                </Paragraph1>
                <Paragraph1 className="text-sm text-gray-500">
                  Edit your closet information
                </Paragraph1>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition"
                aria-label="Close modal"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            <div className="flex-1 py-6 space-y-6">
              <div className="flex flex-col items-center">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => !isUploading && fileInputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (
                      !isUploading &&
                      (e.key === "Enter" || e.key === " ")
                    ) {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  className="group relative flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-gray-300 bg-gray-50 mb-3 transition hover:bg-gray-100"
                >
                  {previewSrc ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewSrc}
                        alt="Closet photo preview"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder-image.png";
                        }}
                      />
                      {isUploading && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
                          <span className="text-xs font-bold text-white">
                            {progress}%
                          </span>
                        </div>
                      )}
                      {!isUploading && (
                        <button
                          type="button"
                          className="absolute right-1 top-1 z-10 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            remove();
                            if (fileInputRef.current)
                              fileInputRef.current.value = "";
                          }}
                          aria-label="Remove photo"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <Upload className="h-6 w-6 text-gray-500" />
                      {uploadStatus ? (
                        <span className="absolute bottom-1 left-0 right-0 px-1 text-center text-[10px] text-gray-600">
                          {uploadStatus}
                        </span>
                      ) : null}
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                    e.target.value = "";
                  }}
                  className="hidden"
                  disabled={isUploading}
                  aria-label="Upload closet photo"
                />
                <Paragraph1 className="text-sm text-gray-500 text-center">
                  Profile photo — same upload as item photos (max 7MB)
                </Paragraph1>
                {uploadStatus ? (
                  <Paragraph1
                    className={`mt-1 text-center text-xs ${
                      uploadStatus.startsWith("error")
                        ? "text-red-600"
                        : "text-gray-600"
                    }`}
                  >
                    {uploadStatus}
                  </Paragraph1>
                ) : null}
              </div>

              <div>
                <Paragraph1 className="font-semibold text-gray-900 mb-2">
                  Closet Name
                </Paragraph1>
                <input
                  type="text"
                  placeholder="e.g. Amanda Daniels Closet"
                  value={closetName}
                  onChange={(e) => setClosetName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
                />
              </div>

              <div>
                <Paragraph1 className="font-semibold text-gray-900 mb-2">
                  Description (Optional)
                </Paragraph1>
                <textarea
                  placeholder="One-line description of this closet"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm resize-none h-24"
                />
              </div>

              <div className="flex items-center justify-between pt-4">
                <div>
                  <Paragraph1 className="font-semibold text-gray-900">
                    Hide from public
                  </Paragraph1>
                  <Paragraph1 className="text-sm text-gray-500">
                    Turn off the public closet landing page
                  </Paragraph1>
                </div>
                <button
                  type="button"
                  onClick={() => setHiddenFromPublic(!hiddenFromPublic)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    hiddenFromPublic ? "bg-gray-900" : "bg-gray-300"
                  }`}
                >
                  <motion.div
                    className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white"
                    animate={{ x: hiddenFromPublic ? 24 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>
            </div>

            <div className="flex gap-4 py-6 border-t border-gray-200 sticky bottom-0 bg-white">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 text-sm font-semibold border border-gray-300 rounded-lg hover:bg-gray-50 transition text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUpdate}
                disabled={updateCloset.isPending || isUploading}
                className="flex-1 px-4 py-3 text-sm font-semibold bg-gray-900 hover:bg-black text-white rounded-lg transition disabled:opacity-50"
              >
                {updateCloset.isPending ? "Saving…" : "Save Update"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditClosetModal;
