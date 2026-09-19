import React from "react";
import { Paragraph1 } from "@/common/ui/Text";

interface ProductCareDetailsProps {
  careInstruction?: string | null;
  careSteps?: string | null;
}

function parseCareSteps(careSteps: string): string[] {
  return careSteps
    .split(/\n|•/)
    .map((step) => step.trim())
    .filter(Boolean);
}

const ProductCareDetails: React.FC<ProductCareDetailsProps> = ({
  careInstruction,
  careSteps,
}) => {
  const instruction = careInstruction?.trim();
  const steps = careSteps?.trim() ? parseCareSteps(careSteps.trim()) : [];

  if (instruction || steps.length > 0) {
    return (
      <div className="font-sans p-4 -mt-2 sm:p-0">
        {instruction ? (
          <Paragraph1 className="text-sm text-gray-700 leading-relaxed mb-6">
            {instruction}
          </Paragraph1>
        ) : null}

        {steps.length > 0 ? (
          <div>
            <Paragraph1 className="text-sm font-semibold text-gray-900 tracking-wider mb-2">
              CARE STEPS:
            </Paragraph1>
            <ul className="space-y-2 text-sm text-gray-700 list-none pl-0">
              {steps.map((step) => (
                <li key={step} className="flex items-start">
                  <span className="text-xl leading-none mr-2 mt-[-3px]">•</span>
                  {step}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="font-sans p-4 -mt-2 sm:p-0">
      <div className="mb-6">
        <Paragraph1 className="text-sm font-semibold text-gray-900 tracking-wider mb-2">
          PROFESSIONAL CLEANING INCLUDED:
        </Paragraph1>
        <Paragraph1 className="text-sm text-gray-700 leading-relaxed">
          We handle all cleaning before and after your rental.
        </Paragraph1>
      </div>

      <div>
        <Paragraph1 className="text-sm font-semibold text-gray-900 tracking-wider mb-2">
          WHILE WEARING:
        </Paragraph1>
        <ul className="space-y-2 text-sm text-gray-700 list-none pl-0">
          <li className="flex items-start">
            <span className="text-xl leading-none mr-2 mt-[-3px]">•</span>
            Avoid contact with makeup and oils
          </li>
          <li className="flex items-start">
            <span className="text-xl leading-none mr-2 mt-[-3px]">•</span>
            Handle delicate beadwork with care
          </li>
          <li className="flex items-start">
            <span className="text-xl leading-none mr-2 mt-[-3px]">•</span>
            Avoid sitting on rough surfaces
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ProductCareDetails;
