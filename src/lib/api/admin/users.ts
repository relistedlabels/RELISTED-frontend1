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
  image: string;
  brand: string;
  category: string;
  itemValue: number;
  dailyPrice: number;
  status: string;
  dateAdded: string;
  totalRentals: number;
  earnings: number;
}

export interface UserWallet {
  userId: string;
  walletBalance: number;
  currency: string;
  lastUpdated: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  type: "Debit" | "Credit";
  amount: number;
  status: string;
  relatedRentalId?: string;
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
  productId: string;
  image: string;
  brand: string;
  title: string;
  rentalPrice?: number;
  retailPrice: number;
  savedDate: string;
  status: string;
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
  getUserById: (userId: string) =>
    apiFetch<{ success: true; data: UserProfile }>(
      `/api/admin/users/${userId}`,
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
      data: {
        listings: UserListing[];
        total: number;
        page: number;
        limit: number;
      };
    }>(`/api/admin/users/${userId}/listings?${buildListParams(params)}`),

  getUserWallet: (userId: string) =>
    apiFetch<{ success: true; data: UserWallet }>(
      `/api/admin/users/${userId}/wallet`,
    ),

  getUserTransactions: (userId: string, params: ListParams) =>
    apiFetch<{
      success: true;
      data: {
        transactions: Transaction[];
        total: number;
        page: number;
        limit: number;
      };
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
      data: {
        favorites: UserFavorite[];
        total: number;
        page: number;
        limit: number;
      };
    }>(`/api/admin/users/${userId}/favorites?${buildListParams(params)}`),
};
