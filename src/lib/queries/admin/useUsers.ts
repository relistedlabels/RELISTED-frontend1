import { useQuery } from "@tanstack/react-query";
import { usersApi } from "@/lib/api/admin/";

interface ListParams {
  page?: number;
  limit?: number;
}

export const useUserById = (userId: string) =>
  useQuery({
    queryKey: ["admin", "users", userId],
    queryFn: () => usersApi.getUserById(userId),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: !!userId,
  });

export const useUserRentals = (userId: string, params: ListParams = {}) =>
  useQuery({
    queryKey: ["admin", "users", userId, "rentals", params.page, params.limit],
    queryFn: () => usersApi.getUserRentals(userId, params),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: !!userId,
  });

export const useUserListings = (userId: string, params: ListParams = {}) =>
  useQuery({
    queryKey: ["admin", "users", userId, "listings", params.page, params.limit],
    queryFn: () => usersApi.getUserListings(userId, params),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: !!userId,
  });

export const useUserWallet = (userId: string) =>
  useQuery({
    queryKey: ["admin", "users", userId, "wallet"],
    queryFn: () => usersApi.getUserWallet(userId),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: !!userId,
  });

export const useUserTransactions = (userId: string, params: ListParams = {}) =>
  useQuery({
    queryKey: [
      "admin",
      "users",
      userId,
      "transactions",
      params.page,
      params.limit,
    ],
    queryFn: () => usersApi.getUserTransactions(userId, params),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: !!userId,
  });

export const useUserDisputes = (userId: string, params: ListParams = {}) =>
  useQuery({
    queryKey: ["admin", "users", userId, "disputes", params.page, params.limit],
    queryFn: () => usersApi.getUserDisputes(userId, params),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: !!userId,
  });

export const useUserFavorites = (userId: string, params: ListParams = {}) =>
  useQuery({
    queryKey: [
      "admin",
      "users",
      userId,
      "favorites",
      params.page,
      params.limit,
    ],
    queryFn: () => usersApi.getUserFavorites(userId, params),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: !!userId,
  });
