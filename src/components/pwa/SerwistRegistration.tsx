"use client";

import { SerwistProvider } from "@serwist/turbopack/react";
import type { ReactNode } from "react";

type SerwistRegistrationProps = {
  children: ReactNode;
};

export default function SerwistRegistration({
  children,
}: SerwistRegistrationProps) {
  return (
    <SerwistProvider swUrl="/serwist/sw.js" reloadOnOnline={false}>
      {children}
    </SerwistProvider>
  );
}
