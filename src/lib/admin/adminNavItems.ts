export type AdminNavItemDefinition = {
  id: string;
  label: string;
  getHref: (adminId: string) => string;
  showNewBadge?: boolean;
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
    },
    {
      id: "shop",
      label: "Shop",
      getHref: (id) => `/admin/${id}/shop`,
      showNewBadge: true,
    },
    {
      id: "requests",
      label: "Requests",
      getHref: (id) => `/admin/${id}/requests`,
      showNewBadge: true,
    },
    {
      id: "orders",
      label: "Orders",
      getHref: (id) => `/admin/${id}/orders`,
    },
    {
      id: "shipments",
      label: "Shipments",
      getHref: (id) => `/admin/${id}/shipments`,
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
      label: "Payments & balances",
      getHref: (id) => `/admin/${id}/wallets`,
    },
    {
      id: "dispute",
      label: "Dispute",
      getHref: (id) => `/admin/${id}/disputes`,
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
