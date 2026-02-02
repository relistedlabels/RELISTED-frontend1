

"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { uploadFile } from '@/lib/api/upload';
import {v4 as uuid} from "uuid"
type UploadStatus = {
  id: string;
  file: File;
  done: boolean;
  url?: string;
  progress: number;
  error?: string;
  slotId?: string;
};

type UploaderContextType = {
  uploads: UploadStatus[];
  addUploads: (files: File[], slotId?: string) => UploadStatus[];
  cancelUpload: (id: string) => void;
  getUpload: (id: string) => UploadStatus | undefined;
  clearUploads: () => void;
};



export function useUploaderProvider() {
  const [uploads, setUploads] = useState<UploadStatus[]>([]);

  const addUploads = useCallback((files: File[], slotId?: string): UploadStatus[] => {
    const newUploads = files.map(file => {
      const id = uuid();
      
      const uploadStatus: UploadStatus = {
        id,
        file,
        done: false,
        progress: 0,
        slotId,
      };
      
      //  the actual upload
      uploadFile({
        file,
        id,
        onProgress: (percent) => {
          setUploads(prev => prev.map(u => 
            u.id === id ? { ...u, progress: percent } : u
          ));
        },
      })
      .then((response) => {
        setUploads(prev => prev.map(u => 
          u.id === id ? { 
            ...u, 
            done: true, 
            progress: 100, 
            url: response.url 
          } : u
        ));
      })
      .catch((error) => {
        setUploads(prev => prev.map(u => 
          u.id === id ? { 
            ...u, 
            done: false, 
            error: error.message || 'Upload failed' 
          } : u
        ));
      });
      
      return uploadStatus;
    });
    
    setUploads(prev => [...prev, ...newUploads]);
    return newUploads;
  }, []);

  const cancelUpload = useCallback((id: string) => {

    setUploads(prev => prev.filter(u => u.id !== id));
  }, []);

  const getUpload = useCallback((id: string) => {
    return uploads.find(u => u.id === id);
  }, [uploads]);

  const clearUploads = useCallback(() => {
    setUploads([]);
  }, []);


    return {
    uploads,
    isUploading: uploads.some((up) => !up.done),
    getUpload,
    // addUpload,
    addUploads,
    cancelUpload,
    // cleanup,
   
  };

}
   
export type Uploader = ReturnType<typeof useUploaderProvider>;
export const UploaderContext = createContext<Uploader | null>(null);

export const useUploader = () => {
  const context = useContext(UploaderContext);
  if (!context) {
    throw new Error('useUploader must be used within UploaderProvider');
  }
  return context;
};
