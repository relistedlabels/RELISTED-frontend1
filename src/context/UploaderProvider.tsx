"use client"
import { ReactNode } from "react";
import { UploaderContext, useUploaderProvider } from "./UploaderContext";

export function UploaderProvider({ children }: { children: ReactNode }) {
  const uploader = useUploaderProvider();
  
  return (
    <UploaderContext.Provider value={uploader}>
      {children}
    </UploaderContext.Provider>
  );
}