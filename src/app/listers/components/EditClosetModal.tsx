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
          className="z-99 fixed inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="top-0 right-0 fixed flex flex-col bg-white shadow-2xl px-6 w-full sm:w-96 md:w-[480px] h-screen overflow-y-auto"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="top-0 z-10 sticky flex justify-between items-center bg-white py-6 border-gray-200 border-b">
              <div>
                <Paragraph1 className="font-bold text-gray-900 text-lg">
                  Edit Closet
                </Paragraph1>
                <Paragraph1 className="text-gray-500 text-sm">
                  Edit your closet information
                </Paragraph1>
              </div>
              <button
                onClick={onClose}
                className="hover:bg-gray-100 p-2 rounded-full transition"
                aria-label="Close modal"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            <div className="flex-1 space-y-6 py-6">
              <div className="flex flex-col items-center">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => !isUploading && fileInputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (!isUploading && (e.key === "Enter" || e.key === " ")) {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  className="group relative flex justify-center items-center bg-gray-50 hover:bg-gray-100 mb-3 border-2 border-gray-300 border-dashed rounded-full w-24 h-24 overflow-hidden transition cursor-pointer"
                >
                  {previewSrc ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewSrc}
                        alt="Closet photo preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder-image.png";
                        }}
                      />
                      {isUploading && (
                        <div className="absolute inset-0 flex justify-center items-center bg-black/40 rounded-full">
                          <span className="font-bold text-white text-xs">
                            {progress}%
                          </span>
                        </div>
                      )}
                      {!isUploading && (
                        <button
                          type="button"
                          className="top-1 right-1 z-10 absolute bg-red-500 hover:bg-red-600 opacity-0 group-hover:opacity-100 p-1 rounded-full text-white transition-opacity"
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
                      <Upload className="w-6 h-6 text-gray-500" />
                      {uploadStatus ? (
                        <span className="right-0 bottom-1 left-0 absolute px-1 text-[10px] text-gray-600 text-center">
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
                <Paragraph1 className="text-gray-500 text-sm text-center">
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
                <Paragraph1 className="mb-2 font-semibold text-gray-900">
                  Closet Name
                </Paragraph1>
                <input
                  type="text"
                  placeholder="e.g. Amanda Daniels Closet"
                  value={closetName}
                  onChange={(e) => setClosetName(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black w-full text-sm"
                />
              </div>

              <div>
                <Paragraph1 className="mb-2 font-semibold text-gray-900">
                  Description (Optional)
                </Paragraph1>
                <textarea
                  placeholder="One-line description of this closet"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black w-full h-24 text-sm resize-none"
                />
              </div>

              <div className="flex justify-between items-center pt-4">
                <div>
                  <Paragraph1 className="font-semibold text-gray-900">
                    Hide from public
                  </Paragraph1>
                  <Paragraph1 className="text-gray-500 text-sm">
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
                    className="top-0.5 left-0.5 absolute bg-white rounded-full w-5 h-5"
                    animate={{ x: hiddenFromPublic ? 24 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>
            </div>

            <div className="bottom-0 sticky flex gap-4 bg-white py-6 border-gray-200 border-t">
              <button
                onClick={onClose}
                className="flex-1 hover:bg-gray-50 px-4 py-3 border border-gray-300 rounded-lg font-semibold text-gray-900 text-sm transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUpdate}
                disabled={updateCloset.isPending || isUploading}
                className="flex-1 bg-gray-900 hover:bg-black disabled:opacity-50 px-4 py-3 rounded-lg font-semibold text-white text-sm transition"
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
