"use client";

import { useState } from "react";
import { UploadCloud } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import { useUpload } from "@/lib/mutations";
import { v4 as uuid } from "uuid";
type FileUploaderProps = {
  onUploaded: (data: { id: string; url?: string }) => void;
  helperText?: string;
};

export function FileUploader({
  onUploaded,
  helperText = "International Passport, NIN, Driver's License",
}: FileUploaderProps) {
  const upload = useUpload();
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = (file: File) => {
    setFileName(file.name);

    if (file.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }

    upload.mutate(
      {
        file,
        id: uuid(),
        onProgress: (percent) => {
          console.log("Upload progress:", percent);
        },
      },
      {
        onSuccess: (data) => {
          onUploaded(data);
        },
      },
    );
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>,
  ) => {
    e.preventDefault();

    const file =
      "dataTransfer" in e ? e.dataTransfer.files?.[0] : e.target.files?.[0];

    if (!file) return;
    handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div>
      <label className="block mb-2">
        <Paragraph1 className="text-sm font-medium text-gray-800">
          Means of Identification
        </Paragraph1>
      </label>
      <div
        onDrop={handleFileUpload}
        onDragOver={handleDragOver}
        className="relative flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 cursor-pointer hover:border-black transition resize overflow-auto min-h-[220px]"
        style={{ resize: "both" }}
      >
        {!preview && !fileName && (
          <>
            <UploadCloud className="w-8 h-8 text-gray-500 mb-2" />
            <Paragraph1 className="text-sm text-gray-600">
              Drop your file here or{" "}
              <label
                htmlFor="file-upload"
                className="text-black font-semibold cursor-pointer hover:underline"
              >
                Click to upload
              </label>
            </Paragraph1>

            {helperText && (
              <Paragraph1 className="text-xs text-gray-400 mt-1">
                {helperText}
              </Paragraph1>
            )}
          </>
        )}

        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="max-h-40 rounded-md object-contain mb-2"
          />
        )}

        {fileName && !preview && (
          <Paragraph1 className="text-sm text-gray-700">{fileName}</Paragraph1>
        )}

        {upload.isPending && (
          <div className="absolute bottom-3 left-3 right-3">
            <div className="w-full h-2 bg-gray-200 rounded">
              <div className="h-2 bg-black rounded animate-pulse w-full" />
            </div>
          </div>
        )}

        {upload.error && (
          <p className="text-red-600 text-xs mt-2">
            {(upload.error as Error).message}
          </p>
        )}

        <input
          id="file-upload"
          type="file"
          onChange={handleFileUpload}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
}
