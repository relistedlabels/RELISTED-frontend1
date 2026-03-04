import { useMutation } from "@tanstack/react-query";
import { uploadFile } from "@/lib/api/upload";

interface UploadResponse {
  id: string;
  name?: string;
  type?: string;
  url?: string;
  uploadId?: string;
  data?: {
    id?: string;
    url?: string;
    uploadId?: string;
    name?: string;
    type?: string;
  };
}

export function useUpload() {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      // Extract file from FormData
      const file = formData.get("file") as File;
      if (!file) {
        throw new Error("No file provided");
      }

      // Generate a temporary ID for the upload
      const tempId = `upload-${Date.now()}`;

      const response = await uploadFile({
        file,
        id: tempId,
      });

      return response as UploadResponse;
    },
    onError: (error: any) => {
      console.error("Upload failed:", error);
    },
  });
}
