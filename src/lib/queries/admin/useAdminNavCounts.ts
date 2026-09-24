import type { AdminNavCountKey } from "@/lib/admin/adminNavItems";
import { useAvailabilityRequestStats } from "./useAvailabilityRequests";
import { useDisputes } from "./useDisputes";
import { useListingsStatistics } from "./useListings";
import { useOrderStats } from "./useOrders";
import { useShipments } from "./useShipments";
import { useWithdrawalRequests } from "./useWallets";

export function useAdminNavCounts(): Record<AdminNavCountKey, number> {
  const { data: listingsStats } = useListingsStatistics();
  const { data: availabilityStats } = useAvailabilityRequestStats();
  const { data: orderStats } = useOrderStats();
  const { data: pendingShipments } = useShipments({
    status: "PENDING",
    page: 1,
    limit: 1,
  });
  const { data: pendingWithdrawals } = useWithdrawalRequests({
    page: 1,
    limit: 1,
  });
  const { data: pendingDisputes } = useDisputes({
    status: "pending",
    page: 1,
    limit: 1,
  });

  return {
    pendingListings:
      listingsStats?.data?.getPendingProducts?.count ?? 0,
    pendingAvailabilityRequests: availabilityStats?.data?.pending ?? 0,
    activeOrders: orderStats?.data?.activeOrders ?? 0,
    pendingShipments: pendingShipments?.data?.total ?? 0,
    pendingWithdrawals:
      pendingWithdrawals?.data?.pagination?.total ?? 0,
    pendingDisputes: pendingDisputes?.data?.pagination?.total ?? 0,
  };
}
