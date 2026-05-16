"use client";

import { ReactNode } from "react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";

interface StatCardProps {
  icon: ReactNode;
  value: string;
  label: string;
  detail?: string;
}

const StatCard = ({ icon, value, label, detail }: StatCardProps) => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 w-full">
      <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-black text-yellow-400">
        {icon}
      </div>

      <div className="mt-3">
        <Paragraph3 className="text-xl font-extrabold text-gray-900">
          {value}
        </Paragraph3>
        <Paragraph1 className="text-xs font-medium text-gray-500 uppercase">
          {label}
        </Paragraph1>
        {detail ? (
          <Paragraph1 className="text-gray-500 text-xs mt-1.5 leading-snug normal-case">
            {detail}
          </Paragraph1>
        ) : null}
      </div>
    </div>
  );
};

export default StatCard;
