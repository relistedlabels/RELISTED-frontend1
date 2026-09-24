// ENDPOINTS: GET /api/renters/wallet, GET /api/renters/wallet/transactions, POST /api/renters/wallet/deposit, GET /api/renters/wallet/bank-accounts, PUT /api/renters/profile (bankAccountInfo), GET /api/banks, POST /api/renters/wallet/withdraw

"use client";

import React, { Suspense } from "react";

import Breadcrumbs from "@/common/ui/BreadcrumbItem";
import UserDashboardLayout from "../components/UserDashboardLayout";
import WalletDashboardTabs from "../components/WalletDashboardTabs";
import { OnboardingTaskMount } from "@/app/onboarding/components/OnboardingTaskMount";

function page() {
  const path = [
    { label: "Home", href: "/" },
    { label: "Dashboard", href: "/renters/orders" },
    { label: "Wallet", href: null },
  ];

  return (
    <div className="mx-auto pt-[70px] sm:pt-[100px] container">
      <div className="mb-4 px-4 sm:px-0">
        <Breadcrumbs items={path} />
      </div>
      <UserDashboardLayout>
        <Suspense fallback={null}>
          <OnboardingTaskMount />
        </Suspense>
        <Suspense fallback={null}>
          <WalletDashboardTabs />
        </Suspense>
      </UserDashboardLayout>
    </div>
  );
}

export default page;
