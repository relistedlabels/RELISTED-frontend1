import React from "react";

import Breadcrumbs from "@/common/ui/BreadcrumbItem";
import UserDashboardLayout from "../components/UserDashboardLayout";
import DashboardOrderList from "../components/DashboardOrderList";
import Favorites from "../components/Favorites";

function page() {
  const path = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "Favourites", href: null }, // Current page, href is null
  ];

  return (
    <div className=" container mx-auto sm:pt-[100px] pt-[70px]">
      {" "}
      <div className=" mb-4 px-4 sm:px-0 ">
        <Breadcrumbs items={path} />{" "}
      </div>
      <UserDashboardLayout>
        <div>
          <Favorites />{" "}
        </div>
      </UserDashboardLayout>
    </div>
  );
}

export default page;
