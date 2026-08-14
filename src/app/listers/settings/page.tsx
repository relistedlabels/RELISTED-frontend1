// ENDPOINTS: Multiple settings endpoints - see AccountTabs and component files for specific endpoints used

import Breadcrumbs from "@/common/ui/BreadcrumbItem";
import DashboardLayout from "../components/DashboardLayout";
import AccountTabs from "../components/AccountTabs";
import { Paragraph2 } from "@/common/ui/Text";
import { Suspense } from "react";
import { ListerSettingsOnboardingTask } from "./ListerSettingsOnboardingTask";

export default function Page() {
  const path = [
    { label: "Dashboard", href: "/listers/dashboard" },
    { label: "Settings", href: null },
  ];
  return (
    <DashboardLayout>
      <Suspense fallback={null}>
        <ListerSettingsOnboardingTask />
      </Suspense>
      <div className=" mb-4 px-4 sm:px-0 ">
        <Breadcrumbs items={path} />{" "}
      </div>
      <div className=" mb-4 px-4 sm:px-0 ">
        <Paragraph2>Settings</Paragraph2>{" "}
      </div>
      <div>
        <Suspense fallback={null}>
          <AccountTabs />
        </Suspense>
      </div>
    </DashboardLayout>
  );
}
