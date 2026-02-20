// lib/api/user.ts
import { apiFetch } from "./http";

export type User = {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: "ADMIN" | "LISTER" | "DRESSER";
  isSuspended: boolean;
  createdAt: string;
  updatedAt: string;
  profileDetails?: {
    bio?: string;
    avatar?: string;
    address?: string;
  };
};

export type UserResponse = {
  success: boolean;
  message: string;
  data: User;
};

export type UsersListResponse = {
  success: boolean;
  message: string;
  data: {
    users: User[];
    total: number;
    page: number;
    count: number;
  };
};

export const userApi = {
  deleteUser: (userId: string) =>
    apiFetch<{ success: boolean; message: string }>(`/admin/users/${userId}`, {
      method: "DELETE",
    }),

  resetUserPassword: (userId: string, newPassword: string) =>
    apiFetch<{ success: boolean; message: string }>(
      `/admin/users/${userId}/reset-password`,
      {
        method: "POST",
        body: JSON.stringify({ newPassword }),
      },
    ),
  getUserById: (userId: string) =>
    apiFetch<UserResponse>(`/admin/users/${userId}`, {
      method: "GET",
    }),

  getAllUsers: (page: number = 1, count: number = 10) =>
    apiFetch<UsersListResponse>(
      `/admin/users/all?page=${page}&count=${count}`,
      {
        method: "GET",
      },
    ),

  suspendUser: (userId: string) =>
    apiFetch<UserResponse>(`/admin/users/${userId}/suspend`, {
      method: "PATCH",
    }),

  unsuspendUser: (userId: string) =>
    apiFetch<UserResponse>(`/admin/users/${userId}/unsuspend`, {
      method: "PATCH",
    }),
};
