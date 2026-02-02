"use client";

import React, { useState } from "react";
import { Wallet, Heart, Users, FileText, ShoppingBag } from "lucide-react";
import { Paragraph2 } from "@/common/ui/Text";
import DashboardOrderList from "./DashboardOrderList";
import ExampleUserWalletDashboard from "./UserWalletDashboard";
import ExampleAllTransactionsList from "./Transaction";
import Favorites from "./Favorites";

interface NavItem {
  name: string;
  icon: React.ElementType;
  href: string;
}

const navItems: NavItem[] = [
  { name: "My Orders", icon: ShoppingBag, href: "/dashboard/orders" },
  { name: "Wallet", icon: Wallet, href: "/dashboard/wallet" },
  { name: "Favourites", icon: Heart, href: "/dashboard/favourites" },
  { name: "Dispute", icon: FileText, href: "/dashboard/dispute" },
  { name: "My Account", icon: Users, href: "/dashboard/account" },
];

export default function UserDashboardLayout() {
  const [activeTab, setActiveTab] = useState("/dashboard/orders");

  const pageTitle =
    navItems.find((item) => item.href === activeTab)?.name ?? "Dashboard";

  const renderMainContent = () => {
    switch (activeTab) {
      case "/dashboard/orders":
        return (
          <div>
            <DashboardOrderList />
          </div>
        );
      case "/dashboard/wallet":
        return (
          <div>
            <ExampleUserWalletDashboard />
            <ExampleAllTransactionsList />
          </div>
        );
      case "/dashboard/favourites":
        return <div><Favorites /> </div>;
      case "/dashboard/dispute":
        return <div>Dispute Resolution Center</div>;
      case "/dashboard/account":
        return <div>Account Settings</div>;
      default:
        return (
          <div>
            <DashboardOrderList />
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className="
          w-14           /* mobile width */
          sm:w-64        /* desktop width */
          border-r border-gray-200
          
          shrink-0
        "
      >
        <nav className="flex flex-col h-full">
          <ul>
            {navItems.map((item) => {
              const isActive = item.href === activeTab;
              const Icon = item.icon;

              return (
                <li key={item.name}>
                  <a
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab(item.href);
                    }}
                    className={`flex items-center px-2 sm:px-4 py-5 transition-colors 
                      ${
                        isActive
                          ? "bg-black text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    <Icon size={22} className="mx-auto sm:mr-3 sm:mx-0" />

                    {/* hide text on mobile, show only on sm+ */}
                    <span className="hidden sm:inline font-semibold">
                      {item.name}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="grow px-4 sm:pl-8 sm:px-0">
        <Paragraph2 className="  mb-4">{pageTitle}</Paragraph2>

        <div>{renderMainContent()}</div>
      </main>
    </div>
  );
}
