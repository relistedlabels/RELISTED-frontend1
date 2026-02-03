import { useMutation } from "@tanstack/react-query";
import { uploadFile } from "@/lib/api/upload";

type UploadArgs = {
  file: File;
  id: string;
  onProgress?: (percent: number) => void;
};

export const useUpload = () => {
  return useMutation({
    mutationFn: ({ file, id, onProgress }: UploadArgs) =>
      uploadFile({ file, id, onProgress }),
  });
};
