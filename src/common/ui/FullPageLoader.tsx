// common/ui/FullPageLoader.tsx
"use client";

import Image from "next/image";

export default function FullPageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <Image
        src="/images/logo.svg" // your logo path
        alt="Loading"
        width={80}
        height={80}
        className="animate-pulse"
        priority
      />
    </div>
  );
}
