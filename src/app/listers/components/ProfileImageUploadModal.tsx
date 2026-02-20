"use client";

import React, { useState } from "react";
import type { JSX } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Loader } from "lucide-react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
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
      const formData = new FormData();
      formData.append("avatar", selectedFile);
      await uploadListerAvatar(formData);
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
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto flex flex-col">
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
                        <span className="inline-block bg-black text-white px-3 py-1.5 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors text-xs font-medium mt-2">
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
                    className="flex-1 px-4 py-2.5 rounded-lg font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    Skip
                  </button>
                )}
                <button
                  onClick={handleNext}
                  disabled={!preview || isUploading}
                  className="flex-1 px-4 py-2.5 rounded-lg font-medium text-white bg-black hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
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
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
