// ENDPOINTS: GET /api/renters/favorites, POST /api/renters/favorites/:itemId, DELETE /api/renters/favorites/:itemId

import React from "react";

import { SITE_FIXED_HEADER_PT } from "@/lib/layout/siteNavOffset";
import Breadcrumbs from "@/common/ui/BreadcrumbItem";
import UserDashboardLayout from "../components/UserDashboardLayout";
import DashboardOrderList from "../components/DashboardOrderList";
import Favorites from "../components/Favorites";

function page() {
  const path = [
    { label: "Home", href: "/" },
    { label: "Dashboard", href: "/renters/orders" },
    { label: "Favorites", href: null }, // Current page, href is null
  ];

  return (
    <div className={`mx-auto ${SITE_FIXED_HEADER_PT} container`}>
      {" "}
      <div className="mb-4 px-4 sm:px-0">
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
