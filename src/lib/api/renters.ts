import { apiFetch } from "./http";

export type RentersDashboardSummary = {
  activeRentals: number;
  pendingReturns: number;
  walletBalance: number;
  totalSpent: number;
  favoriteItems: number;
  recentOrders: Array<{
    id: string;
    itemName: string;
    listerName: string;
    rentalPrice: number;
    status: string;
    rentalDate: string;
  }>;
};

export type FavoriteItem = {
  id: string;
  productId: string;
  itemName: string;
  brand: string;
  listerName: string;
  rentalPrice: number;
  image: string;
  condition: string;
  addedDate: string;
};

export type RentalOrder = {
  id: string;
  itemId: string;
  itemName: string;
  listerName: string;
  listerImage: string;
  rentalStartDate: string;
  rentalEndDate: string;
  deliveryDate: string;
  returnDate: string;
  status: "active" | "completed" | "returned" | "cancelled";
  rentalPrice: number;
  deliveryFee: number;
  securityDeposit: number;
  totalPrice: number;
  itemImage: string;
};

export type WalletInfo = {
  userId: string;
  totalBalance: number;
  availableBalance: number;
  lockedBalance: number;
  totalDeposits: number;
  totalSpent: number;
};

export type Transaction = {
  id: string;
  date: string;
  type: "deposit" | "debit" | "refund" | "withdrawal";
  amount: number;
  description: string;
  status: "completed" | "pending" | "failed";
  orderId?: string;
  timestamp?: string;
};

export type BankAccount = {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  accountType: string;
  verified: boolean;
};

export type RentalRequest = {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  rentalStartDate: string;
  rentalEndDate: string;
  rentalDays: number;
  dailyRate: number;
  rentalFee: number;
  deliveryFee: number;
  securityDeposit: number;
  totalPrice: number;
  status: "pending_lister_approval" | "approved" | "rejected" | "expired";
  autoPay: boolean;
  expiresAt: string;
  createdAt: string;
};

export type Dispute = {
  id: string;
  disputeId: string;
  orderId: string;
  itemName: string;
  listerName: string;
  category: string;
  status: "pending" | "in_review" | "resolved";
  description: string;
  rentalPrice: number;
  amountDisputed: number;
  raisedDate: string;
  lastUpdated: string;
  issueCategory?: string;
};

export type DisputeStats = {
  totalDisputes: number;
  pendingDisputes: number;
  inReviewDisputes: number;
  resolvedDisputes: number;
  averageResolutionTime?: string;
  resolutionRate?: string;
};

export type CartItem = {
  cartItemId: string;
  requestId: string;
  productId: string;
  productName: string;
  productImage: string;
  listerName: string;
  rentalStartDate: string;
  rentalEndDate: string;
  rentalDays: number;
  rentalPrice: number;
  deliveryFee: number;
  cleaningFee: number;
  securityDeposit: number;
  totalPrice: number;
  status: "pending_lister_approval" | "approved" | "rejected" | "expired";
  autoPay: boolean;
  expiresAt: string;
  timeRemainingSeconds: number;
  timeRemainingMinutes: number;
};

export type CartSummary = {
  cartItems: CartItem[];
  subtotal: number;
  totalDeliveryFees: number;
  totalCleaningFees: number;
  totalSecurityDeposit: number;
  cartTotal: number;
  itemCount: number;
  expiredItems: string[]; // requestIds of expired items
};

export type CheckoutResponse = {
  orderId: string;
  orderStatus: "confirmed" | "pending" | "payment_processing";
  cartCleared: boolean;
  message: string;
};

export const rentersApi = {
  // Dashboard
  getDashboardSummary: (params?: { timeframe?: "week" | "month" | "year" }) =>
    apiFetch<{ success: boolean; data: RentersDashboardSummary }>(
      "/api/renters/dashboard/summary",
      {
        method: "GET",
        ...(params && { params }),
      },
    ),

  // Favorites
  getFavorites: (params?: {
    page?: number;
    limit?: number;
    sort?: "newest" | "oldest" | "price_low" | "price_high";
  }) =>
    apiFetch<{
      success: boolean;
      data: {
        favorites: FavoriteItem[];
        totalFavorites: number;
        total: number;
        page: number;
        totalPages: number;
      };
    }>("/api/renters/favorites", { method: "GET", ...(params && { params }) }),

  addFavorite: (itemId: string) =>
    apiFetch<{ success: boolean; data: FavoriteItem }>(
      `/api/renters/favorites/${itemId}`,
      { method: "POST" },
    ),

  removeFavorite: (itemId: string) =>
    apiFetch<{ success: boolean }>(`/api/renters/favorites/${itemId}`, {
      method: "DELETE",
    }),

  // Orders/Rentals
  getOrders: (params?: {
    status?: "active" | "completed" | "returned" | "cancelled";
    page?: number;
    limit?: number;
    sort?: "newest" | "oldest" | "ending_soon";
  }) =>
    apiFetch<{
      success: boolean;
      data: { orders: RentalOrder[]; total: number };
    }>("/api/renters/orders", { method: "GET", ...(params && { params }) }),

  getOrderDetails: (orderId: string) =>
    apiFetch<{ success: boolean; data: RentalOrder }>(
      `/api/renters/orders/${orderId}`,
      { method: "GET" },
    ),

  getOrderProgress: (orderId: string) =>
    apiFetch<{
      success: boolean;
      data: {
        timeline: Array<{
          milestone: string;
          label: string;
          timestamp?: string;
          status: "completed" | "current" | "pending";
          description: string;
        }>;
        currentMilestone: string;
        percentComplete: number;
      };
    }>(`/api/renters/orders/${orderId}/progress`, { method: "GET" }),

  initiateReturn: (
    orderId: string,
    data: { returnMethod: "pickup" | "dropoff"; damageNotes?: string },
  ) =>
    apiFetch<{ success: boolean; data: { trackingNumber: string } }>(
      `/api/renters/orders/${orderId}/return`,
      { method: "POST", body: JSON.stringify(data) },
    ),

  // Wallet
  getWallet: () =>
    apiFetch<{ success: boolean; data: WalletInfo }>("/api/renters/wallet", {
      method: "GET",
    }),

  getTransactions: (params?: {
    page?: number;
    limit?: number;
    type?: "deposit" | "debit" | "refund" | "withdrawal" | "all";
    status?: "completed" | "pending" | "failed" | "all";
    sort?: "newest" | "oldest";
  }) =>
    apiFetch<{
      success: boolean;
      data: { transactions: Transaction[]; total: number };
    }>("/api/renters/wallet/transactions", {
      method: "GET",
      ...(params && { params }),
    }),

  depositFunds: (data: {
    amount: number;
    paymentMethod: string;
    bankAccountId?: string;
  }) =>
    apiFetch<{ success: boolean; data: { transactionId: string } }>(
      "/api/renters/wallet/deposit",
      { method: "POST", body: JSON.stringify(data) },
    ),

  getBankAccounts: () =>
    apiFetch<{ success: boolean; data: { bankAccounts: BankAccount[] } }>(
      "/api/renters/wallet/bank-accounts",
      { method: "GET" },
    ),

  addBankAccount: (data: {
    bankCode: string;
    accountNumber: string;
    accountName: string;
    accountType: string;
  }) =>
    apiFetch<{ success: boolean; data: BankAccount }>(
      "/api/renters/wallet/bank-accounts",
      { method: "POST", body: JSON.stringify(data) },
    ),

  withdrawFunds: (data: { amount: number; bankAccountId: string }) =>
    apiFetch<{ success: boolean; data: { withdrawalId: string } }>(
      "/api/renters/wallet/withdraw",
      { method: "POST", body: JSON.stringify(data) },
    ),

  getWithdrawalStatus: (withdrawalId: string) =>
    apiFetch<{
      success: boolean;
      data: {
        id: string;
        amount: number;
        status: "pending" | "processing" | "completed" | "failed";
        estimatedDate: string;
      };
    }>(`/api/renters/wallet/withdraw/${withdrawalId}`, { method: "GET" }),

  getLockedBalances: () =>
    apiFetch<{
      success: boolean;
      data: Array<{
        type: string;
        amount: number;
        reason: string;
        releaseDate: string;
      }>;
    }>("/api/renters/wallet/locked-balances", { method: "GET" }),

  // Profile
  getProfile: () =>
    apiFetch<{
      success: boolean;
      data: {
        id: string;
        fullName: string;
        email: string;
        phone: string;
        avatar?: string;
        createdAt: string;
      };
    }>("/api/renters/profile", { method: "GET" }),

  updateProfile: (data: { fullName?: string; phone?: string }) =>
    apiFetch<{ success: boolean; data: object }>("/api/renters/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Disputes
  getDisputeStats: () =>
    apiFetch<{
      success: boolean;
      data: DisputeStats;
    }>("/api/renters/disputes/stats", { method: "GET" }),

  getDisputes: (params?: {
    status?: "all" | "pending" | "in_review" | "resolved";
    page?: number;
    limit?: number;
    sort?: "newest" | "oldest";
  }) =>
    apiFetch<{
      success: boolean;
      data: { disputes: Dispute[]; total: number };
    }>("/api/renters/disputes", { method: "GET", ...(params && { params }) }),

  getDisputeDetails: (disputeId: string) =>
    apiFetch<{ success: boolean; data: Dispute }>(
      `/api/renters/disputes/${disputeId}`,
      { method: "GET" },
    ),

  raiseDispute: (data: {
    orderId: string;
    itemId: string;
    issueCategory: string;
    description: string;
    amountDisputed?: number;
  }) =>
    apiFetch<{ success: boolean; data: Dispute }>("/api/renters/disputes", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Rental Requests (Shopping Cart)
  getRentalRequests: (params?: {
    status?: "pending" | "approved" | "rejected";
  }) =>
    apiFetch<{
      success: boolean;
      data: { rentalRequests: RentalRequest[] };
    }>("/api/renters/rental-requests", {
      method: "GET",
      ...(params && { params }),
    }),

  submitRentalRequest: (data: {
    productId: string;
    rentalStartDate: string;
    rentalEndDate: string;
    autoPay: boolean;
  }) =>
    apiFetch<{ success: boolean; data: RentalRequest }>(
      "/api/renters/rental-requests",
      { method: "POST", body: JSON.stringify(data) },
    ),

  getRentalRequestDetails: (requestId: string) =>
    apiFetch<{ success: boolean; data: RentalRequest }>(
      `/api/renters/rental-requests/${requestId}`,
      { method: "GET" },
    ),

  removeRentalRequest: (requestId: string) =>
    apiFetch<{ success: boolean }>(
      `/api/renters/rental-requests/${requestId}`,
      { method: "DELETE" },
    ),

  confirmRentalRequest: (
    requestId: string,
    data?: { confirmPayment?: boolean },
  ) =>
    apiFetch<{ success: boolean; data: { orderId: string } }>(
      `/api/renters/rental-requests/${requestId}/confirm`,
      { method: "POST", body: JSON.stringify(data || {}) },
    ),
  // Checkout validation
  validateCheckout: () =>
    apiFetch<{ success: boolean; data: object }>(
      "/api/renters/checkout/validate",
      { method: "GET" },
    ),
  // Checkout summary
  getCheckoutSummary: () =>
    apiFetch<{ success: boolean; data: object }>(
      "/api/renters/checkout/summary",
      { method: "GET" },
    ),
};
