// lib/api/users.ts
import { apiFetch } from "./http";

export type User = {
  id: string;
  name: string | null;
  avatar: string | null;
  role: "lister" | "renter";
  // Add other user fields as needed
};

export type UsersResponse = {
  success: boolean;
  message: string;
  data: User[];
};

export const getUser = (id: string) => apiFetch(`/users/${id}`);

export const getAllUsers = () =>
  apiFetch<UsersResponse>("/users", {
    method: "GET",
  });

export const createUser = (data: any) =>
  apiFetch(`/users`, {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateUser = (id: string, data: any) =>
  apiFetch(`/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const deleteUser = (id: string) =>
  apiFetch(`/users/${id}`, {
    method: "DELETE",
  });
