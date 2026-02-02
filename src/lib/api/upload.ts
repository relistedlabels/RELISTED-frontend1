import { apiFetch, getAuthToken } from "./http";
import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const uploadFile = async ({
  file,
  id,
  onProgress,
}: {
  file: File;
  id: string;
  onProgress?: (percent: number) => void;
}) => {
  const formData = new FormData();
  formData.append("file", file);
  const token = getAuthToken();
  const response = await axios.post(
    `${BASE_URL}/upload/${id}`,
    formData,
    {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      // withCredentials: true, 
      onUploadProgress: (progressEvent) => {
        if (!progressEvent.total) return;

        const percent = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );

        onProgress?.(percent);
      },
    }
  );

  return response.data; 
};

export const getUploads = async (ids: string[]) => {
  return apiFetch<{ id: string; url: string,name?:string,type?:string }[]>("/upload/bulk", {
    method: "POST",
    body: JSON.stringify({ ids }),
  });
};


export const cleanupUploads = async (ids: string[]|string) => {
  return apiFetch(`upload`, {
    method: "DELETE",
    body: JSON.stringify({ ids }),
  })}
