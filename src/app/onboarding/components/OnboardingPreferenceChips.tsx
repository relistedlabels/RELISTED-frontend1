"use client";

import type { RenterShopPreference } from "@/lib/onboarding/onboardingStorage";
import { Paragraph3 } from "@/common/ui/Text";

const options: Array<{
  id: RenterShopPreference;
  label: string;
}> = [
  { id: "rent", label: "Mostly renting" },
  { id: "resale", label: "Mostly buying" },
  { id: "all", label: "Show me everything" },
];

type OnboardingPreferenceChipsProps = {
  value: RenterShopPreference;
  onChange: (value: RenterShopPreference) => void;
};

export function OnboardingPreferenceChips({
  value,
  onChange,
}: OnboardingPreferenceChipsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {options.map((option) => {
        const selected = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`px-4 py-2 border-2 rounded-full font-medium text-base transition ${
              selected
                ? "border-black bg-black text-white"
                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
            }`}
          >
            <Paragraph3 className="text-inherit text-base">{option.label}</Paragraph3>
          </button>
        );
      })}
    </div>
  );
}
