"use client";

import React, { useState } from "react";
import type { JSX } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Loader } from "lucide-react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { buttonPrimary, buttonSecondary } from "@/common/ui/buttonClasses";
import { dialogBackdrop, dialogCard } from "@/common/ui/dashboardClasses";
import { uploadListerAvatar } from "@/lib/api/listers";
import { useQueryClient } from "@tanstack/react-query";

interface ProfileImageUploadModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onNext: () => void;
  profileName?: string;
}

export default function ProfileImageUploadModal({
  isOpen,
  onClose,
  onNext,
  profileName = "Lister",
}: ProfileImageUploadModalProps): JSX.Element {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const queryClient = useQueryClient();

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    setSelectedFile(file);
  };

  const handleNext = async () => {
    if (!selectedFile) {
      alert("Please select a profile image first");
      return;
    }
    setIsUploading(true);
    try {
      await uploadListerAvatar(selectedFile);
      queryClient.invalidateQueries({ queryKey: ["listers", "profile"] });
      onNext();
    } catch (error: any) {
      console.error("Failed to upload profile image:", error);
      alert("Failed to upload profile image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`${dialogBackdrop} z-40`}
            onClick={onClose}
          >
            <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`${dialogCard} max-h-[85vh] overflow-y-auto flex flex-col rounded-2xl p-0`}
            onClick={(e) => e.stopPropagation()}
          >
              {/* Header */}
              <div className="bg-white border-b border-gray-100 p-6 sticky top-0 z-10">
                <div className="flex items-center justify-between mb-4">
                  <img
                    src="/images/logo1.svg"
                    alt="RELISTED"
                    className="h-8 w-8"
                  />
                  {onClose && (
                    <button
                      onClick={onClose}
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X size={20} className="text-gray-600" />
                    </button>
                  )}
                </div>
                <h2 className="text-xl font-bold text-black mb-1">
                  Add Your Photo
                </h2>
                <Paragraph3 className="text-gray-600 text-sm">
                  Help renters get to know you
                </Paragraph3>
              </div>

              {/* Content */}
              <div className="flex-1 p-6 space-y-4">
                {/* Upload Area */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                    isDragging
                      ? "border-black bg-gray-50"
                      : "border-gray-300 hover:border-gray-400 bg-gray-50/50"
                  }`}
                >
                  {preview ? (
                    <div className="space-y-3">
                      <div className="relative inline-block">
                        <img
                          src={preview}
                          alt="Preview"
                          className="w-24 h-24 rounded-full object-cover shadow-md"
                        />
                      </div>
                      <div>
                        <Paragraph1 className="font-medium text-sm mb-0.5">
                          Ready to upload
                        </Paragraph1>
                        <Paragraph3 className="text-xs text-gray-600">
                          {isUploading ? "Uploading..." : "Photo selected"}
                        </Paragraph3>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-center mb-1">
                        <Upload size={32} className="text-gray-400" />
                      </div>
                      <Paragraph1 className="font-medium text-sm text-gray-900">
                        Upload your photo
                      </Paragraph1>
                      <Paragraph3 className="text-xs text-gray-600">
                        Drag & drop or click to browse
                      </Paragraph3>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="sr-only"
                        id="profile-image-input"
                        disabled={isUploading}
                      />
                      <label htmlFor="profile-image-input">
                        <span className={`${buttonPrimary} mt-2 px-3 py-1.5 text-xs font-medium cursor-pointer`}>
                          Choose File
                        </span>
                      </label>
                    </div>
                  )}
                </div>

                {/* Quick Tip */}
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <Paragraph3 className="text-xs text-gray-700">
                    <span className="font-semibold">Pro tip:</span> Clear photos
                    with good lighting help boost your listing ratings.
                  </Paragraph3>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 border-t border-gray-100 px-6 py-4 flex gap-3 sticky bottom-0">
                {onClose && (
                  <button
                    onClick={onClose}
                    disabled={isUploading}
                    className={`${buttonSecondary} flex-1 disabled:opacity-50`}
                  >
                    Skip
                  </button>
                )}
                <button
                  onClick={handleNext}
                  disabled={!preview || isUploading}
                  className={`${buttonPrimary} flex-1 disabled:opacity-50`}
                >
                  {isUploading ? (
                    <>
                      <Loader size={16} className="animate-spin" />
                      Uploading
                    </>
                  ) : (
                    "Next"
                  )}
                </button>
              </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
