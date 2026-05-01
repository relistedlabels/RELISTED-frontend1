"use client";

import React, { useRef, useState, useEffect } from "react";
import { Paragraph1 } from "@/common/ui/Text";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { AnimatePresence } from "framer-motion";

interface EditClosetModalProps {
  isOpen: boolean;
  onClose: () => void;
  closetName: string;
  closetDescription?: string;
  closetImage?: string;
}

const EditClosetModal: React.FC<EditClosetModalProps> = ({
  isOpen,
  onClose,
  closetName: initialName,
  closetDescription: initialDescription = "",
  closetImage: initialImage,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialImage || null,
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [closetName, setClosetName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [isDisabled, setIsDisabled] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setClosetName(initialName);
      setDescription(initialDescription || "");
      setImagePreview(initialImage || null);
      setSelectedFile(null);
      setIsDisabled(false);
    }
  }, [isOpen, initialName, initialDescription, initialImage]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert("File size must be less than 2MB");
        return;
      }

      // Validate file type
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        alert("Only JPG or PNG files are allowed");
        return;
      }

      setSelectedFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadAreaClick = () => {
    fileInputRef.current?.click();
  };

  const handleSaveUpdate = () => {
    console.log("Save Closet Update:", {
      closetName,
      description,
      image: selectedFile,
      imagePreview,
      isDisabled,
    });

    // Here you would call your API to update the closet
    onClose();
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
            {/* Header */}
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

            {/* Content */}
            <div className="flex-1 py-6 space-y-6">
              {/* Photo Upload */}
              <div className="flex flex-col items-center">
                <div
                  onClick={handleUploadAreaClick}
                  className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 mb-3 cursor-pointer hover:bg-gray-100 transition overflow-hidden"
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400 text-2xl">+</span>
                  )}
                </div>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handleImageChange}
                  className="hidden"
                  aria-label="Upload closet photo"
                />

                <Paragraph1 className="text-sm text-gray-500 text-center">
                  Upload profile photo
                </Paragraph1>
                <Paragraph1 className="text-xs text-gray-400">
                  JPG or PNG, max 2MB
                </Paragraph1>
              </div>

              {/* Closet Name */}
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

              {/* Description */}
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

              {/* Disable Closet Toggle */}
              <div className="flex items-center justify-between pt-4">
                <div>
                  <Paragraph1 className="font-semibold text-gray-900">
                    Disable Closet
                  </Paragraph1>
                  <Paragraph1 className="text-sm text-gray-500">
                    Turn off visibility for this closet
                  </Paragraph1>
                </div>
                <button
                  onClick={() => setIsDisabled(!isDisabled)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    isDisabled ? "bg-gray-900" : "bg-gray-300"
                  }`}
                >
                  <motion.div
                    className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white"
                    animate={{ x: isDisabled ? 24 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-4 py-6 border-t border-gray-200 sticky bottom-0 bg-white">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 text-sm font-semibold border border-gray-300 rounded-lg hover:bg-gray-50 transition text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUpdate}
                className="flex-1 px-4 py-3 text-sm font-semibold bg-gray-900 hover:bg-black text-white rounded-lg transition"
              >
                Save Update
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditClosetModal;
