import React from "react";
import TitleProductCard from "./components/TitleProductCard";
import RentalDetailsCard from "./components/RentalDetailsCard";
import ProductAccordion from "./components/ProductAccordion";
import ProductMediaGallery from "./components/ProductMediaGallery";
import Breadcrumbs from "@/common/ui/BreadcrumbItem";
import TopListingSection from "./components/TopListingSection";

function page() {
  const path = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "Product detail", href: null }, // Current page, href is null
  ];

  return (
    <div>
      {" "}
      <div className=" grid xl:grid-cols-2 ">
        <div className="sm:py-[100px] pt-[70px]  sm:px-[100px] p-4 ">
          <div className=" mb-4">
            <Breadcrumbs items={path} />{" "}
          </div>
          <ProductMediaGallery />
        </div>
        <div className=" sm:py-[100px] bg-white sm:px-[100px] p-4 flex flex-col gap-4 ">
          <TitleProductCard />
          <RentalDetailsCard />
          <ProductAccordion />
        </div>
      </div>

      <TopListingSection />
    </div>
  );
}

export default page;
