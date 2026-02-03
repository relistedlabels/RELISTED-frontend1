"use client";

import React from "react";
import {
  Wallet,
  Heart,
  Users,
  FileText,
  ShoppingBag,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Paragraph2, Paragraph3, ParagraphLink1 } from "@/common/ui/Text";

interface NavItem {
  name: string;
  icon: React.ElementType;
  href: string;
}

const navItems: NavItem[] = [
  { name: "My Orders", icon: ShoppingBag, href: "/renters/orders" },
  { name: "Wallet", icon: Wallet, href: "/renters/wallet" },
  { name: "Favourites", icon: Heart, href: "/renters/favorites" },
  { name: "My Disputes", icon: FileText, href: "/renters/dispute" },
  { name: "My Account", icon: Users, href: "/renters/account" },
];

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Get the active page title
  const activeItem = navItems.find((item) => pathname.startsWith(item.href));
  const title = activeItem?.name || "";

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-14 sm:w-64 border-r border-gray-200 shrink-0">
        <nav className="flex flex-col h-full">
          <ul>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`
                      flex items-center px-2 sm:px-4 py-5 transition-colors
                      ${
                        isActive
                          ? "bg-black text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }
                    `}
                  >
                    <Icon
                      size={22}
                      className={`mx-auto sm:mr-3 sm:mx-0 ${
                        isActive ? "text-white" : "text-gray-600"
                      }`}
                    />

                    <span className="hidden sm:inline font-semibold">
                      <ParagraphLink1>{item.name} </ParagraphLink1>
                    </span>
                  </Link>
                </li>
              );
            })}

            <button
              className={`
                      flex text-red-500 hover:bg-red-100 w-full  items-center px-2 sm:px-4 py-5 transition-colors
                      
                    `}
            >
              <LogOut size={22} className={`mx-auto sm:mr-3 sm:mx-0`} />

              <span className="hidden sm:inline ">
                <ParagraphLink1 className="font-bold">Log out</ParagraphLink1>
              </span>
            </button>
            <div className="">
              {" "}
              <ParagraphLink1> </ParagraphLink1>
            </div>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="grow h-screen overflow-x-auto px-4 sm:pl-8 sm:px-0 py-">
        <Paragraph2 className="text-2xl font-bold mb-6">{title}</Paragraph2>
        {children}
      </main>
    </div>
  );
}
