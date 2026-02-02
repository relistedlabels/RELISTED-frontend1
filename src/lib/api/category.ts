import { apiFetch } from "./http";

export const categoryApi={
      getCategories: () =>
        apiFetch("/categories", {
          method: "GET",
        }),
}