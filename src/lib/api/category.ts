import { apiFetch } from "./http";

export const categoryApi = {
  getCategories: () =>
    apiFetch("/api/public/categories", {
      method: "GET",
    }),
};
