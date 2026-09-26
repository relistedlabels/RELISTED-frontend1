"use client";

import Breadcrumbs from "@/common/ui/BreadcrumbItem";
import DashboardLayout from "../components/DashboardLayout";
import AccountTabs from "../components/AccountTabs";
import { Paragraph2 } from "@/common/ui/Text";
import { Suspense } from "react";

export default function Page() {
  const path = [
    { label: "Dashboard", href: "/listers/dashboard" },
    { label: "Profile", href: null },
  ];
  return (
    <DashboardLayout>
      <div className="mb-4 px-4 sm:px-0">
        <Breadcrumbs items={path} />
      </div>
      <div className="mb-4 px-4 sm:px-0">
        <Paragraph2>Profile</Paragraph2>
      </div>
      <div>
        <Suspense fallback={null}>
          <AccountTabs />
        </Suspense>
      </div>
    </DashboardLayout>
  );
}