import { apiFetch } from "../http";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  status: string;
  joinDate: string;
  walletBalance: number;
  totalRentals: number;
  activeDisputes: number;
  kyc: {
    status: string;
    fullName: string;
    nin: string;
    bvn: string;
    dateOfBirth: string;
    idNumber: string;
  };
  emergencyContact: {
    fullName: string;
    relationship: string;
    phone: string;
    address: string;
  };
}

export interface UserRental {
  id: string;
  itemName: string;
  itemImage: string;
  status: string;
  returnDue: string;
  amount: number;
  rentalDate: string;
  listerName: string;
}

export interface UserListing {
  id: string;
  name: string;
  subText?: string;
  description?: string;
  condition?: string;
  productVerified?: boolean;
  dailyPrice: number;
  isActive?: boolean;
  quantity?: number;
  status: "AVAILABLE" | "PENDING" | "APPROVED" | "REJECTED";
  rejectionComment?: string | null;
  composition?: string;
  measurement?: string;
  originalValue?: number;
  collateralPrice?: number | null;
  material?: string | null;
  warning?: string;
  color?: string;
  brandId?: string;
  categoryId?: string | null;
  curatorId?: string;
  receiveSmsNotifications?: boolean;
  receiveEmailNotifications?: boolean;
  receiveProductRecommendations?: boolean;
  careInstruction?: string;
  careSteps?: string;
  stylingTip?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserWallet {
  id: string;
  userId: string;
  mainBalance: number;
  availableBalance: number;
  collateralBalance: number;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  walletId: string;
  amount: number;
  type: "MAIN" | "AVAILABLE" | "COLLATERAL";
  status: "SUCCESS" | "PENDING" | "FAILED";
  note: string;
  orderId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserDispute {
  id: string;
  disputeId: string;
  itemName: string;
  itemId: string;
  status: string;
  dateOpened: string;
  reason: string;
  party: "Dresser" | "Curator";
  relatedUserId: string;
}

export interface UserFavorite {
  id: string;
  userId: string;
  productId: string;
  createdAt: string;
  fullText: string;
  product: {
    id: string;
    name: string;
    subText?: string;
    description?: string;
    condition?: string;
    productVerified?: boolean;
    dailyPrice: number;
    isActive?: boolean;
    quantity?: number;
    status: "AVAILABLE" | "PENDING" | "APPROVED" | "REJECTED";
    rejectionComment?: string | null;
    composition?: string;
    measurement?: string;
    originalValue?: number;
    collateralPrice?: number | null;
    material?: string | null;
    warning?: string;
    color?: string;
    brandId?: string | null;
    categoryId?: string | null;
    curatorId?: string;
    receiveSmsNotifications?: boolean;
    receiveEmailNotifications?: boolean;
    receiveProductRecommendations?: boolean;
    careInstruction?: string;
    careSteps?: string;
    stylingTip?: string;
    createdAt: string;
    updatedAt: string;
  };
}

interface ListParams {
  page?: number;
  limit?: number;
}

function buildListParams(params: ListParams): string {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.append("page", params.page.toString());
  if (params.limit) searchParams.append("limit", params.limit.toString());
  return searchParams.toString();
}

export const usersApi = {
  // 1. GET /api/admin/users/all
  getAllUsers: (params: {
    page?: number;
    count?: number;
    search?: string;
    status?: string;
    role?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append("page", params.page.toString());
    if (params.count) searchParams.append("count", params.count.toString());
    if (params.search) searchParams.append("search", params.search);
    if (params.status) searchParams.append("status", params.status);
    if (params.role) searchParams.append("role", params.role);
    return apiFetch<{
      success: true;
      data: {
        users: any[];
        total: number;
        page: number;
        count: number;
      };
    }>(`/api/admin/users/?${searchParams.toString()}`);
  },

  // 2. GET /api/admin/users/:userId
  getUserById: (userId: string) =>
    apiFetch<{ success: true; data: UserProfile }>(
      `/api/admin/users/${userId}`,
    ),

  // 3. PATCH /api/admin/users/:userId/suspend
  suspendUser: (userId: string) =>
    apiFetch<{ success: true; data: any }>(
      `/api/admin/users/${userId}/suspend`,
      { method: "PATCH" },
    ),

  // 4. PATCH /api/admin/users/:userId/unsuspend
  unsuspendUser: (userId: string) =>
    apiFetch<{ success: true; data: any }>(
      `/api/admin/users/${userId}/unsuspend`,
      { method: "PATCH" },
    ),

  getUserRentals: (userId: string, params: ListParams) =>
    apiFetch<{
      success: true;
      data: {
        rentals: UserRental[];
        total: number;
        page: number;
        limit: number;
      };
    }>(`/api/admin/users/${userId}/rentals?${buildListParams(params)}`),

  getUserListings: (userId: string, params: ListParams) =>
    apiFetch<{
      success: true;
      data: UserListing[];
    }>(`/api/admin/users/${userId}/listings?${buildListParams(params)}`),

  getUserWallet: (userId: string) =>
    apiFetch<{ success: true; data: UserWallet }>(
      `/api/admin/users/${userId}/wallet`,
    ),

  getUserTransactions: (userId: string, params: ListParams) =>
    apiFetch<{
      success: true;
      data: Transaction[];
    }>(`/api/admin/users/${userId}/transactions?${buildListParams(params)}`),

  getUserDisputes: (userId: string, params: ListParams) =>
    apiFetch<{
      success: true;
      data: {
        disputes: UserDispute[];
        total: number;
        page: number;
        limit: number;
      };
    }>(`/api/admin/users/${userId}/disputes?${buildListParams(params)}`),

  getUserFavorites: (userId: string, params: ListParams) =>
    apiFetch<{
      success: true;
      data: UserFavorite[];
    }>(`/api/admin/users/${userId}/favorites?${buildListParams(params)}`),
};
