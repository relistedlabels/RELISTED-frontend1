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

  const shipmentPending = useShipments({
    status: "PENDING",
    page: 1,
    limit: 1,
  });
  const shipmentDispatching = useShipments({
    status: "DISPATCHING",
    page: 1,
    limit: 1,
  });
  const shipmentDispatchFailed = useShipments({
    status: "DISPATCH_FAILED",
    page: 1,
    limit: 1,
  });
  const shipmentDispatched = useShipments({
    status: "DISPATCHED",
    page: 1,
    limit: 1,
  });
  const shipmentInTransit = useShipments({
    status: "IN_TRANSIT",
    page: 1,
    limit: 1,
  });
  const shipmentCancelled = useShipments({
    status: "CANCELLED",
    page: 1,
    limit: 1,
  });

  const disputePending = useDisputes({ status: "pending", page: 1, limit: 1 });
  const disputeInReview = useDisputes({
    status: "in_review",
    page: 1,
    limit: 1,
  });
  const disputeInDispute = useDisputes({
    status: "in_dispute",
    page: 1,
    limit: 1,
  });
  const disputeWithdraw = useDisputes({
    status: "withdraw",
    page: 1,
    limit: 1,
  });
  const disputeRejected = useDisputes({
    status: "rejected",
    page: 1,
    limit: 1,
  });

  const pendingWithdrawals = useWithdrawalRequests({
    page: 1,
    limit: 1,
  });

  return {
    pendingListings: listingsStats?.data?.getPendingProducts?.count ?? 0,
    pendingAvailabilityRequests: availabilityStats?.data?.pending ?? 0,
    activeOrders: orderStats?.data?.activeOrders ?? 0,
    pendingShipments: [
      shipmentPending.data,
      shipmentDispatching.data,
      shipmentDispatchFailed.data,
      shipmentDispatched.data,
      shipmentInTransit.data,
      shipmentCancelled.data,
    ].reduce((sum, d) => sum + (d?.data?.total ?? 0), 0),
    pendingWithdrawals: pendingWithdrawals.data?.data?.pagination?.total ?? 0,
    pendingDisputes: [
      disputePending.data,
      disputeInReview.data,
      disputeInDispute.data,
      disputeWithdraw.data,
      disputeRejected.data,
    ].reduce((sum, d) => sum + (d?.data?.pagination?.total ?? 0), 0),
  };
}
