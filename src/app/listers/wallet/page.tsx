// ENDPOINTS: GET /api/listers/wallet/stats, GET /api/listers/wallet/transactions, GET /api/listers/wallet/bank-accounts
import Breadcrumbs from "@/common/ui/BreadcrumbItem";
import DashboardLayout from "../components/DashboardLayout";
import { Paragraph2, Paragraph3 } from "@/common/ui/Text";
import WalletBalanceCard from "../components/WalletBalanceCard";
import TransactionList from "../components/TransactionList";
import { Suspense } from "react";
import { OnboardingTaskMount } from "@/app/onboarding/components/OnboardingTaskMount";

export default function Page() {
  const path = [
    { label: "Dashboard", href: "/curators/dashboard" },
    { label: "My Wallet", href: null }, // Current page, href is null
  ];
  return (
    <DashboardLayout>
      <Suspense fallback={null}>
        <OnboardingTaskMount />
      </Suspense>
      <div className=" mb-4 px-4 sm:px-0 ">
        <Breadcrumbs items={path} />{" "}
      </div>
      <div className=" mb-4 px-4 sm:px-0 ">
        <Paragraph2>Wallet</Paragraph2>{" "}
      </div>
      <div>
        <Suspense fallback={null}>
          <WalletBalanceCard />
          <TransactionList />
        </Suspense>
      </div>
    </DashboardLayout>
  );
}
