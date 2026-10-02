import type { ReactNode } from "react";
import { Paragraph1, Paragraph2 } from "@/common/ui/Text";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export default function AdminPageHeader({
  title,
  description,
  action,
  className = "",
}: AdminPageHeaderProps) {
  return (
    <div
      className={`mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between ${className}`}
    >
      <div className="min-w-0">
        <Paragraph2 className="mb-1 text-2xl font-extrabold leading-7 tracking-tight text-gray-900">
          {title}
        </Paragraph2>
        {description ? (
          <Paragraph1 className="text-sm leading-5 text-gray-600">
            {description}
          </Paragraph1>
        ) : null}
      </div>
      {action}
    </div>
  );
}
