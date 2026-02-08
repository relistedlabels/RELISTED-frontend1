"use client";

import { useState } from "react";
import { X, Upload, ImageIcon } from "lucide-react";
import { Paragraph1, Paragraph2 } from "@/common/ui/Text";

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

  const handleUpload = () => {
    if (file) {
      console.log("Uploading file:", file);
      // Handle upload logic here
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
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
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              <Paragraph1>Cancel</Paragraph1>
            </button>
            <button
              onClick={handleUpload}
              disabled={!file}
              className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Paragraph1>Upload Photo</Paragraph1>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
