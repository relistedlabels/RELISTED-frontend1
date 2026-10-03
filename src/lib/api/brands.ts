// lib/api/brands.ts
import { apiFetch } from "./http";

export type Brand = {
  id: string;
  name: string;
  userId?: string;
  fullText?: string;
  createdAt?: string;
  logo?: string;
  isShopVisible?: boolean;
};

/** Get all brands */
export const getBrands = () =>
  apiFetch<Brand[]>("/api/public/brands", {
    method: "GET",
    cache: "no-store",
  });

/** Create brand */
export const createBrand = (data: { name: string }) =>
  apiFetch<Brand>("/brands", {
    method: "POST",
    body: JSON.stringify(data),
  });
