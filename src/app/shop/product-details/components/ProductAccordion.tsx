"use client";

import React from "react";
import AccordionItem from "../../../../common/ui/AccordionItem";
import { Paragraph1 } from "@/common/ui/Text";
import ProductDetailsBlock from "./Specification";
import ProductCareDetails from "./ProductCareDetails";
import ExampleReviewsBlock from "./Review";
import DeliveryAndReturnDetails from "./DeliveryAndReturnDetails";
import { usePublicProductById } from "@/lib/queries/product/usePublicProductById";
import { DetailPanelSkeleton } from "@/common/ui/SkeletonLoaders";

interface ProductAccordionProps {
  productId: string;
}

const ProductAccordion: React.FC<ProductAccordionProps> = ({ productId }) => {
  const { data: product, isLoading } = usePublicProductById(productId);

  if (isLoading || !product) {
    return <DetailPanelSkeleton />;
  }

  return (
    <div className=" bg-white">
      <AccordionItem title="PRODUCT DETAILS">
        <ProductDetailsBlock product={product} />
      </AccordionItem>

      <AccordionItem title="PRODUCT CARE">
        <ProductCareDetails />
      </AccordionItem>

      <AccordionItem title="REVIEWS" count={0}>
        <ExampleReviewsBlock productId={productId} />
      </AccordionItem>

      <AccordionItem title="DELIVERY & RETURN">
        <DeliveryAndReturnDetails />
      </AccordionItem>
    </div>
  );
};

export default ProductAccordion;
