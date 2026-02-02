// lib/api/product.ts
import { apiFetch } from "./http";

export type ProductUpload = {
  id: string;
  url: string;
};

export type ProductAttachment = {
  id: string;
  uploads: ProductUpload[];
} | null;

export type ProductCurator = {
  name: string;
  id: string;
};

export type UserProduct = {
  id: string;
  name: string;
  subText: string;
  description: string;
  condition: string;
  productVerified: boolean;
  dailyPrice: number;
  isActive: boolean;
  quantity: number;
  status: "AVAILABLE" | "RENTED" | "MAINTENANCE" | "RESERVED";
  composition: string;
  measurement: string;
  originalValue: number;
  warning: string;
  color: string;
  brandId: string | null;
  categoryId: string | null;
  tagId: string | null;
  curatorId: string;
  receiveSmsNotifications: boolean;
  receiveEmailNotifications: boolean;
  receiveProductRecommendations: boolean;
  careInstruction: string;
  careSteps: string;
  stylingTip: string;
  createdAt: string;
  updatedAt: string;
  attachments: ProductAttachment | null;
  curator: ProductCurator;
};

export type ProductPayload = {
  name: string;
  subText: string;
  description: string;
  condition: string;
  composition: string;
  measurement: string;
  originalValue: number;
  dailyPrice: number;
  quantity: number;
  color: string;
  warning: string;
  careInstruction: string;
  careSteps?: string;
  stylingTip: string;
  attachments: string[];
  categoryId: string;
  tagId: string;
  brandId: string;
};

export type ProductResponse = {
  message: string;
};

export type UserProductsResponse = {
  success: boolean;
  message: string;
  data: UserProduct[];
};

export const productApi = {
  create: (data: ProductPayload) =>
    apiFetch<ProductResponse>("/product", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getById: (id: string) =>
    apiFetch<UserProduct>(`/product/${id}`, {
      method: "GET",
    }),

  update: (id: string, data: Partial<ProductPayload>) =>
    apiFetch<ProductResponse>(`/product/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  remove: (id: string) =>
    apiFetch<ProductResponse>(`/product/${id}`, {
      method: "DELETE",
    }),

  getUserProducts: () =>
    apiFetch<UserProductsResponse>("/product/user-products", {
      method: "GET",
    }),
};
