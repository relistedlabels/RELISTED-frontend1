import React from "react";
import { Paragraph1 } from "@/common/ui/Text"; // Using your custom text component

interface Specification {
  /** The title of the specification (e.g., "DESIGNER:") */
  label: string;
  /** The value of the specification (e.g., "FENDI") */
  value: string;
}

interface ProductSpecificationsProps {
  /** The main paragraph describing the product */
  description: string;
  /** Array of key product details */
  specifications: Specification[];
  /** Optional: Flag for any special notes like origin */
  madeIn?: string;
}

const ProductSpecifications: React.FC<ProductSpecificationsProps> = ({
  description,
  specifications,
  madeIn,
}) => {
  return (
    <div className="font-sans p-4 sm:p-0">
      {/* Product Description */}
      <Paragraph1 className="text-sm text-gray-700 leading-relaxed mb-4">
        {description}
      </Paragraph1>

      {/* Made In Note (if provided) */}
      {madeIn && (
        <Paragraph1 className="text-sm font-semibold text-gray-900 mb-6">
          {madeIn}
        </Paragraph1>
      )}

      {/* Specifications List */}
      <div className="space-y-4">
        {specifications.map((spec) => (
          <div key={spec.label} className="flex items-start justify-between">
            {/* Specification Label */}
            <Paragraph1 className="text-sm font-semibold text-gray-900 pr-4 w-1/3 shrink-0">
              {spec.label.toUpperCase()}:
            </Paragraph1>
            {/* Specification Value */}
            <Paragraph1 className="text-sm text-gray-700 w-2/3 text-right">
              {spec.value}
            </Paragraph1>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Example Usage matching the provided image content ---

interface ProductDetailsBlockProps {
  product?: {
    description?: string;
  };
}

const ProductDetailsBlock: React.FC<ProductDetailsBlockProps> = ({
  product,
}) => {
  const exampleDescription =
    product?.description ||
    "Tubular boots with tapered toe and high heel featuring the iconic Arco line, customised with metal detail and engraved logo. Made of black shiny hagfish leather. Covered heel and leather sole.";

  const exampleSpecs: Specification[] = [
    { label: "Designer", value: "FENDI" },
    {
      label: "Composition",
      value: "100% hagfish, inside: 100% calfleather",
    },
    { label: "Measurements", value: "Heel height : 95 mm" },
    { label: "Color", value: "Black" },
  ];

  return (
    <ProductSpecifications
      description={exampleDescription}
      specifications={exampleSpecs}
      madeIn="Made in Italy"
    />
  );
};

export default ProductDetailsBlock;
