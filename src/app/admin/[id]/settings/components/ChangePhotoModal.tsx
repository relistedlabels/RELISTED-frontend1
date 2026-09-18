"use client";

import { useState } from "react";
import { X, Upload, ImageIcon, Loader2 } from "lucide-react";
import { Paragraph1, Paragraph2 } from "@/common/ui/Text";
import { buttonPrimary, buttonSecondary } from "@/common/ui/buttonClasses";
import { dialogBackdrop, dialogCard } from "@/common/ui/dashboardClasses";
import { useUpdateProfilePhoto } from "@/lib/mutations/admin";

interface ChangePhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChangePhotoModal({
  isOpen,
  onClose,
}: ChangePhotoModalProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const uploadMutation = useUpdateProfilePhoto();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (file) {
      try {
        await uploadMutation.mutateAsync(file);
        setPreview(null);
        setFile(null);
        onClose();
      } catch (error) {
        console.error("Error uploading photo:", error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className={dialogBackdrop}>
      <div className={`${dialogCard} p-0 overflow-hidden`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <Paragraph2 className="text-gray-900">
            Change Profile Photo
          </Paragraph2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {/* Preview Section */}
          <div className="mb-6">
            <Paragraph1 className="text-gray-600 font-medium mb-3">
              Preview
            </Paragraph1>
            <div className="w-32 h-32 mx-auto rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300">
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImageIcon size={48} className="text-gray-400" />
              )}
            </div>
          </div>

          {/* Upload Section */}
          <div className="mb-6">
            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <Upload size={32} className="text-gray-400 mb-2" />
              <Paragraph1 className="text-gray-600 font-medium">
                Click to upload
              </Paragraph1>
              <Paragraph1 className="text-gray-500 text-sm">
                or drag and drop
              </Paragraph1>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={uploadMutation.isPending}
              className={`${buttonSecondary} flex-1 disabled:cursor-not-allowed`}
            >
              <Paragraph1>Cancel</Paragraph1>
            </button>
            <button
              onClick={handleUpload}
              disabled={!file || uploadMutation.isPending}
              className={`${buttonPrimary} flex-1 disabled:cursor-not-allowed`}
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <Paragraph1>Uploading...</Paragraph1>
                </>
              ) : (
                <Paragraph1>Upload Photo</Paragraph1>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
