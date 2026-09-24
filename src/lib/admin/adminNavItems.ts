export type AdminNavCountKey =
  | "pendingListings"
  | "pendingAvailabilityRequests"
  | "activeOrders"
  | "pendingShipments"
  | "pendingWithdrawals"
  | "pendingDisputes";

export type AdminNavItemDefinition = {
  id: string;
  label: string;
  /** Compact label shown under the icon when the mobile sidebar is collapsed. */
  shortLabel?: string;
  getHref: (adminId: string) => string;
  showNewBadge?: boolean;
  countKey?: AdminNavCountKey;
};

/** Serializable admin sidebar entries (icons are attached in AdminSidebar). */
export function getAdminNavItemDefinitions(): AdminNavItemDefinition[] {
  return [
    {
      id: "overview",
      label: "Overview",
      getHref: (id) => `/admin/${id}/dashboard`,
    },
    {
      id: "users",
      label: "Users",
      getHref: (id) => `/admin/${id}/users`,
    },
    {
      id: "listings",
      label: "Listings",
      getHref: (id) => `/admin/${id}/listings`,
      countKey: "pendingListings",
    },
    {
      id: "shop",
      label: "Brands",
      getHref: (id) => `/admin/${id}/shop`,
      showNewBadge: true,
    },
    {
      id: "requests",
      label: "Availability Requests",
      shortLabel: "Availability",
      getHref: (id) => `/admin/${id}/requests`,
      showNewBadge: true,
      countKey: "pendingAvailabilityRequests",
    },
    {
      id: "orders",
      label: "Orders",
      getHref: (id) => `/admin/${id}/orders`,
      countKey: "activeOrders",
    },
    {
      id: "shipments",
      label: "Shipments",
      getHref: (id) => `/admin/${id}/shipments`,
      countKey: "pendingShipments",
    },
    {
      id: "closets",
      label: "Closets",
      getHref: (id) => `/admin/${id}/closets`,
    },
    {
      id: "sales",
      label: "Campaigns",
      getHref: (id) => `/admin/${id}/sales`,
      showNewBadge: true,
    },
    {
      id: "wallet",
      label: "Payments",
      getHref: (id) => `/admin/${id}/wallets`,
    },
    {
      id: "withdrawals",
      label: "Withdrawal Requests",
      shortLabel: "Withdrawals",
      getHref: (id) => `/admin/${id}/withdrawal-requests`,
      countKey: "pendingWithdrawals",
    },
    {
      id: "dispute",
      label: "Dispute",
      getHref: (id) => `/admin/${id}/disputes`,
      countKey: "pendingDisputes",
    },
    {
      id: "reviews",
      label: "Reviews",
      getHref: (id) => `/admin/${id}/reviews`,
    },
    {
      id: "settings",
      label: "Settings",
      getHref: (id) => `/admin/${id}/settings`,
    },
  ];
}

export function getAdminNavItemIds(): string[] {
  return getAdminNavItemDefinitions().map((item) => item.id);
}
