// ENDPOINTS: GET /api/public/users/:userId, GET /api/public/users/:userId/products, GET /api/public/users/:userId/reviews

import Breadcrumbs from "@/common/ui/BreadcrumbItem";
import React from "react";
import CuratorProfileCard from "../components/CuratorProfileCardProps";
import ProfileTabs from "../components/ProfileTabs";

interface ListerProfilePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ListerProfilePage({
  params,
}: ListerProfilePageProps) {
  const { id } = await params;

  const path = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "Lister Profile", href: null },
  ];

  return (
    <div>
      <div className="container px-4 sm:px-0 mx-auto py-[70px] sm:py-[100px]">
        <Breadcrumbs items={path} />
        <CuratorProfileCard userId={id} />
        <br />
        <ProfileTabs userId={id} />
      </div>
    </div>
  );
}
