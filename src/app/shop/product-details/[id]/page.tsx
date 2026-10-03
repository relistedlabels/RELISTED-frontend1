import React from "react";

// Always fetch fresh data on each request
export const revalidate = 0;
import TitleProductCard from "../components/TitleProductCard";
import ProductDetailsTabsClient from "../components/ProductDetailsTabsClient";
import ProductAccordion from "../components/ProductAccordion";
import ProductMediaGallery from "../components/ProductMediaGallery";
import Breadcrumbs from "@/common/ui/BreadcrumbItem";
import TopListingSection from "../components/TopListingSection";

interface ProductDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductDetailsPage({
  params,
}: ProductDetailsPageProps) {
  const { id } = await params;
  console.log("📄 ProductDetailsPage: ID from params:", id);

  const path = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "Product detail", href: null }, // Current page, href is null
  ];

  return (
    <div>
      <div className=" grid xl:grid-cols-2 ">
        <div className="sm:py-[100px] pt-[70px]  sm:px-[100px] p-4 ">
          <div className=" mb-4">
            <Breadcrumbs items={path} />{" "}
          </div>
          <ProductMediaGallery productId={id} />
        </div>
        <div className="flex flex-col gap-2 bg-white p-4 sm:gap-4 sm:py-[100px] sm:px-[100px]">
          <TitleProductCard productId={id} />
          <ProductDetailsTabsClient productId={id} />
          <ProductAccordion productId={id} />
        </div>
      </div>
      <TopListingSection productId={id} />
    </div>
  );
}
