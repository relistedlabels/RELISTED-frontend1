"use client";

import React, { Suspense } from "react";

import { SITE_FIXED_HEADER_PT } from "@/lib/layout/siteNavOffset";
import Breadcrumbs from "@/common/ui/BreadcrumbItem";
import UserDashboardLayout from "../components/UserDashboardLayout";
import WithdrawDashboard from "../components/WithdrawDashboard";

function page() {
  const path = [
    { label: "Home", href: "/" },
    { label: "Dashboard", href: "/renters/orders" },
    { label: "Withdraw", href: null },
  ];

  return (
    <div className={`mx-auto ${SITE_FIXED_HEADER_PT} container`}>
      <div className="mb-4 px-4 sm:px-0">
        <Breadcrumbs items={path} />
      </div>
      <UserDashboardLayout>
        <Suspense fallback={null}>
          <WithdrawDashboard />
        </Suspense>
      </UserDashboardLayout>
    </div>
  );
}

export default page;
