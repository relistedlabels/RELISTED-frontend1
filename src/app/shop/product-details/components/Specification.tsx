import React from "react";
import { Paragraph1 } from "@/common/ui/Text";
import { useBrandById } from "@/lib/queries/brand/useBrands";

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
  product: {
    description?: string;
    brandId?: string | null;
    brand?: { name?: string } | null;
    material?: string | null;
    composition?: string | null;
    measurement?: string | null;
    color?: string | null;
  };
}

const ProductDetailsBlock: React.FC<ProductDetailsBlockProps> = ({
  product,
}) => {
  // Fetch brand name using brandId if available
  const { data: brand } = useBrandById(product.brandId || "");
  const brandName = brand?.name || product.brand?.name || "Brand";

  // Compose composition string
  let compositionValue = "";
  if (product.material && product.composition) {
    compositionValue = `${product.material}, ${product.composition}`;
  } else if (product.material) {
    compositionValue = product.material;
  } else if (product.composition) {
    compositionValue = product.composition;
  } else {
    compositionValue = "-";
  }

  const specifications: Specification[] = [
    { label: "Designer", value: brandName },
    { label: "Composition", value: compositionValue },
    { label: "Measurements", value: product.measurement || "-" },
    { label: "Color", value: product.color || "-" },
  ];

  return (
    <ProductSpecifications
      description={product.description || "-"}
      specifications={specifications}
    />
  );
};

export default ProductDetailsBlock;
