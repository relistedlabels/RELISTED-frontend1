import { apiFetch } from "./http";

export const brandApi={
      getAllBrand: () =>
        apiFetch("brands", {
          method: "GET",
        }),
}