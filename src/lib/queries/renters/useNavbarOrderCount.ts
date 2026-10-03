"use client";

import { useOrders } from "@/lib/queries/renters/useOrders";
import { useUserStore } from "@/store/useUserStore";

/** Navbar badge count for ongoing orders on /renters/orders. */
export function useNavbarOrderCount(): number {
  const token = useUserStore((s) => s.token);
  const { data } = useOrders("active", 1, 1);

  if (!token) return 0;

  return data?.totalOrders ?? 0;
}
