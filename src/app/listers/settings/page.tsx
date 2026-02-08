// ENDPOINTS: Multiple settings endpoints - see AccountTabs and component files for specific endpoints used

import Breadcrumbs from "@/common/ui/BreadcrumbItem";
import DashboardLayout from "../components/DashboardLayout";
import AccountTabs from "../components/AccountTabs";
import { Paragraph2 } from "@/common/ui/Text";

export default function Page() {
  const path = [
    { label: "Dashboard", href: "/curators/dashboard" },
    { label: "Settings", href: null }, // Current page, href is null
  ];
  return (
    <DashboardLayout>
      <div className=" mb-4 px-4 sm:px-0 ">
        <Breadcrumbs items={path} />{" "}
      </div>
      <div className=" mb-4 px-4 sm:px-0 ">
        <Paragraph2>Settings</Paragraph2>{" "}
      </div>
      <div>
        <AccountTabs />
      </div>
    </DashboardLayout>
  );
}
