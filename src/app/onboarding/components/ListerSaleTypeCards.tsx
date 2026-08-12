"use client";

import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { listerSaleTypeOptions } from "@/lib/onboarding/copy";

export function ListerSaleTypeCards() {
  return (
    <div className="gap-3 grid grid-cols-1 sm:grid-cols-3">
      {listerSaleTypeOptions.map((option) => (
        <div
          key={option.id}
          className="p-4 border-2 border-gray-200 rounded-lg text-left"
        >
          <Paragraph1 className="font-semibold text-[15px] text-center">
            {option.title}
          </Paragraph1>
          <Paragraph3 className="mt-1 text-gray-500 text-xs text-center">
            {option.subtitle}
          </Paragraph3>
          <Paragraph3 className="mt-3 text-gray-600 text-xs leading-relaxed">
            {option.description}
          </Paragraph3>
        </div>
      ))}
    </div>
  );
}
