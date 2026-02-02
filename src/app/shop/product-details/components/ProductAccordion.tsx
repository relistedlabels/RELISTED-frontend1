"use client"

import React from "react";
import AccordionItem from "../../../../common/ui/AccordionItem"; // Assuming AccordionItem is in the same directory or imported correctly
import { Paragraph1 } from "@/common/ui/Text";
import ProductDetailsBlock from "./Specification";
import ProductCareDetails from "./ProductCareDetails";
import ExampleReviewsBlock from "./Review";
import DeliveryAndReturnDetails from "./DeliveryAndReturnDetails";

const ProductAccordion: React.FC = () => {
  return (
    <div className=" bg-white">
      <AccordionItem title="PRODUCT DETAILS">
        <ProductDetailsBlock />
      </AccordionItem>

      <AccordionItem title="PRODUCT CARE">
       <ProductCareDetails />
      </AccordionItem>

      <AccordionItem title="REVIEWS" count={12}>
        <ExampleReviewsBlock />
      </AccordionItem>

      <AccordionItem title="DELIVERY & RETURN">
        <DeliveryAndReturnDetails />
      </AccordionItem>
    </div>
  );
};

export default ProductAccordion;
