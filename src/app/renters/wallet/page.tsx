// ENDPOINTS: GET /api/renters/wallet, GET /api/renters/wallet/transactions, POST /api/renters/wallet/deposit, GET /api/renters/wallet/bank-accounts, POST /api/renters/wallet/bank-accounts, GET /api/banks, POST /api/renters/wallet/withdraw

"use client";

import React from "react";

import Breadcrumbs from "@/common/ui/BreadcrumbItem";
import UserDashboardLayout from "../components/UserDashboardLayout";
import DashboardOrderList from "../components/DashboardOrderList";
import ExampleUserWalletDashboard from "../components/UserWalletDashboard";
import ExampleAllTransactionsList from "../components/Transaction";

function page() {
  const path = [
    { label: "Home", href: "/" },
    { label: "Dashboard", href: "/orders" },
    { label: "Wallet", href: null }, // Current page, href is null
  ];

  return (
    <div className=" container mx-auto sm:pt-[100px] pt-[70px]">
      {" "}
      <div className=" mb-4 px-4 sm:px-0 ">
        <Breadcrumbs items={path} />{" "}
      </div>
      <UserDashboardLayout>
        <div>
          <ExampleUserWalletDashboard />
          <ExampleAllTransactionsList />
        </div>
      </UserDashboardLayout>
    </div>
  );
}

export default page;
