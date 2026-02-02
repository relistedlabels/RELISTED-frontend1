// lib/api/users.ts
import { apiFetch } from "./http";

export const getUser = (id: string) => apiFetch(`/users/${id}`);

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
