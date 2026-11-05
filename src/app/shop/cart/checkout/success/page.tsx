import React from "react";

import { SITE_FIXED_HEADER_PT } from "@/lib/layout/siteNavOffset";
import Breadcrumbs from "@/common/ui/BreadcrumbItem";
import { Header1, Header1Plus } from "@/common/ui/Text";
import OrderSuccessfulScreen from "./components/OrderSuccessfulScreen";

function page() {
  const path = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "Your Cart", href: "/shop/cart" },
    { label: "Checkout", href: null }, // Current page, href is null
  ];

  return (
    <div
      className={`container mx-auto px-4 ${SITE_FIXED_HEADER_PT} pb-[70px] sm:pb-[100px] sm:px-0`}
    >
      {" "}
      <div className=" mb-4">
        <Breadcrumbs items={path} />{" "}
      </div>
      <div className="  ">
        <OrderSuccessfulScreen />
      </div>
    </div>
  );
}

export default page;
