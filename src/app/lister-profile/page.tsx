import Breadcrumbs from "@/common/ui/BreadcrumbItem";
import React from "react";
import ExampleCuratorProfile from "./components/CuratorProfileCardProps";
import ExampleProfileTabs from "./components/ProfileTabs";

function page() {
  const path = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "Product Details", href: null }, // Current page, href is null
  ];
  return (
    <div>
      <div className=" container px-4 sm:px-0 mx-auto py-[70px] sm:py-[100px]">
        <Breadcrumbs items={path} />
        <ExampleCuratorProfile />
        <ExampleProfileTabs />
      </div>
    </div>
  );
}

export default page;
