import { apiFetch } from "./http";

export type Category = {
  id: string;
  name: string;
  imageUrl: string | null;
  userId: string | null;
  createdAt: string;
};

export const categoryApi = {
  getCategories: () =>
    apiFetch<Category[]>("/categories", {
      method: "GET",
    }),

  createCategory: (data: { name: string }) =>
    apiFetch<Category>("/api/listers/categories", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
