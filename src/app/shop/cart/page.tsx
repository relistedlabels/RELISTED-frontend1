import React from "react";

import Breadcrumbs from "@/common/ui/BreadcrumbItem";
import { Header1, Header1Plus } from "@/common/ui/Text";
import CheckoutProductList from "./components/CheckoutProductList";
import FinalOrderSummaryCard from "./components/FinalOrderSummaryCard";

function page() {
  const path = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "Your Cart", href: null }, // Current page, href is null
  ];

  return (
    <div className=" container mx-auto px-4 py-[70px] sm:py-[100px] sm:px-0">
      {" "}
      <div className=" mb-4">
        <Breadcrumbs items={path} />{" "}
      </div>
      <Header1Plus className=" uppercase mb-8 ">Your Cart</Header1Plus>
      <div className=" grid xl:grid-cols-3 gap-4 sm:gap-16  ">
        <div className=" col-span-2  ">
          <CheckoutProductList />{" "}
        </div>
        <div className="  flex flex-col gap-4 ">
          <FinalOrderSummaryCard />
        </div>
      </div>
    </div>
  );
}

export default page;
