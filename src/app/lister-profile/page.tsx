import Breadcrumbs from "@/common/ui/BreadcrumbItem";
import React from "react";
import CuratorProfileCard from "./components/CuratorProfileCardProps";
import ProfileTabs from "./components/ProfileTabs";

function ListerProfileDefaultPage() {
  const path = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "Lister Profile", href: null }, // Current page, href is null
  ];

  // Default to a demo lister ID - this page shouldn't be accessed without an ID
  const demoUserId = "user_001";

  return (
    <div>
      <div className="container px-4 sm:px-0 mx-auto py-[70px] sm:py-[100px]">
        <Breadcrumbs items={path} />
        <CuratorProfileCard userId={demoUserId} />
        <ProfileTabs userId={demoUserId} />
      </div>
    </div>
  );
}

export default ListerProfileDefaultPage;
