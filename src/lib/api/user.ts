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
  getAllUsers: (page: number = 1, count: number = 10) =>
    apiFetch<UsersListResponse>(`/user/all?page=${page}&count=${count}`, {
      method: "GET",
    }),

  suspendUser: (userId: string) =>
    apiFetch<UserResponse>(`/user/${userId}/suspend`, {
      method: "PATCH",
    }),

  unsuspendUser: (userId: string) =>
    apiFetch<UserResponse>(`/user/${userId}/unsuspend`, {
      method: "PATCH",
    }),
};
