import { apiFetch } from "./http";

export type Category = {
  id: string;
  name: string;
  userId?: string;
  createdAt?: string;
  description?: string;
  image?: string;
};

export const categoryApi = {
  getCategories: () =>
    apiFetch<Category[]>("/api/public/categories", {
      method: "GET",
    }),

  createCategory: (data: { name: string }) =>
    apiFetch<Category>("/api/listers/categories", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
