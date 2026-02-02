"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";

interface BackHeaderProps {
  title: string;
  subtitle?: string;
}

const BackHeader: React.FC<BackHeaderProps> = ({ title, subtitle }) => {
  const router = useRouter();

  return (
    <div className="flex items-center space-x-4">
      <button
        onClick={() => router.back()}
        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Go back"
      >
        <ArrowLeft className="w-6 h-6 text-black" />
      </button>

      <div className="flex flex-col">
        <Paragraph3 className="text-2xl font-bold text-black leading-tight">
          {title}
        </Paragraph3>
        {subtitle && (
          <Paragraph1 className="text-sm text-gray-500">{subtitle}</Paragraph1>
        )}
      </div>
    </div>
  );
};

export default BackHeader;
