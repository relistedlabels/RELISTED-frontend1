// lib/api/brands.ts
import { apiFetch } from "./http";

export type Brand = {
  id: string;
  name: string;
  userId: string;
  fullText: string;
  createdAt: string;
};

/** Get all brands */
export const getBrands = () =>
  apiFetch<Brand[]>("/brands", {
    method: "GET",
  });

/** Create brand */
export const createBrand = (data: { name: string }) =>
  apiFetch<Brand>("/brands", {
    method: "POST",
    body: JSON.stringify(data),
  });
