import React from "react";
import { Paragraph1 } from "@/common/ui/Text";
import type { UserProduct } from "@/lib/api/product";

interface Specification {
  label: string;
  value: string;
}

interface ProductSpecificationsProps {
  description: string;
  specifications: Specification[];
}

const ProductSpecifications: React.FC<ProductSpecificationsProps> = ({
  description,
  specifications,
}) => {
  return (
    <div className="font-sans">
      <Paragraph1 className="mb-4 text-sm leading-relaxed text-gray-700">
        {description}
      </Paragraph1>

      {specifications.length > 0 ? (
        <div className="space-y-4">
          {specifications.map((spec) => (
            <div key={spec.label} className="flex items-start justify-between">
              <Paragraph1 className="w-1/3 shrink-0 pr-4 text-sm font-semibold text-gray-900">
                {spec.label.toUpperCase()}:
              </Paragraph1>
              <Paragraph1 className="w-2/3 text-right text-sm text-gray-700">
                {spec.value}
              </Paragraph1>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};

interface ProductDetailsBlockProps {
  product: UserProduct;
}

const ProductDetailsBlock: React.FC<ProductDetailsBlockProps> = ({
  product,
}) => {
  const specifications: Specification[] = [];

  if (product.material?.trim()) {
    specifications.push({ label: "Material", value: product.material.trim() });
  }

  if (product.composition?.trim()) {
    specifications.push({
      label: "Composition",
      value: product.composition.trim(),
    });
  }

  return (
    <ProductSpecifications
      description={product.description?.trim() || "-"}
      specifications={specifications}
    />
  );
};

export default ProductDetailsBlock;
