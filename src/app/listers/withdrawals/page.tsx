"use client";

import Breadcrumbs from "@/common/ui/BreadcrumbItem";
import DashboardLayout from "../components/DashboardLayout";
import { Paragraph2 } from "@/common/ui/Text";
import Withdraw from "../components/Withdraw";
import WithdrawalsList from "@/components/wallet/WithdrawalsList";
import { Suspense } from "react";

export default function Page() {
  const path = [
    { label: "Dashboard", href: "/listers/dashboard" },
    { label: "Withdrawals", href: null },
  ];
  return (
    <DashboardLayout>
      <div className="mb-4 px-4 sm:px-0">
        <Breadcrumbs items={path} />
      </div>
      <div className="mb-4 px-4 sm:px-0">
        <Paragraph2>Withdrawals</Paragraph2>
      </div>
      <div className="space-y-6">
        <Withdraw />
        <Suspense fallback={null}>
          <WithdrawalsList variant="lister" />
        </Suspense>
      </div>
    </DashboardLayout>
  );
}