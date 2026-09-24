"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  segmentTabActive,
  segmentTabIdle,
} from "@/common/ui/buttonClasses";
import UserWalletDashboard from "./UserWalletDashboard";
import AllTransactionsList from "./Transaction";

type WalletView = "overview" | "transactions";

const WALLET_TABS: Array<{ key: WalletView; label: string }> = [
  { key: "overview", label: "Overview" },
  { key: "transactions", label: "Transactions" },
];

function parseWalletView(raw: string | null): WalletView {
  if (raw === "transactions") return raw;
  return "overview";
}

export default function WalletDashboardTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [walletView, setWalletView] = useState<WalletView>(() =>
    parseWalletView(tabParam),
  );

  useEffect(() => {
    if (tabParam === "withdraw") {
      router.replace("/renters/withdraw");
      return;
    }
    setWalletView(parseWalletView(tabParam));
  }, [tabParam, router]);

  const handleTabChange = useCallback(
    (view: WalletView) => {
      setWalletView(view);
      const params = new URLSearchParams(searchParams.toString());
      if (view === "overview") {
        params.delete("tab");
      } else {
        params.set("tab", view);
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
  );

  return (
    <div className="w-full">
      <div className="mb-6 w-full max-w-full overflow-x-auto hide-scrollbar">
        <div className="inline-flex rounded-xl border border-gray-200 bg-gray-50 p-1 whitespace-nowrap">
          {WALLET_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTabChange(tab.key)}
              className={
                walletView === tab.key ? segmentTabActive : segmentTabIdle
              }
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {walletView === "overview" ? <UserWalletDashboard /> : null}

      {walletView === "transactions" ? <AllTransactionsList /> : null}
    </div>
  );
}
