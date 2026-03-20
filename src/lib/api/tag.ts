import { apiFetch } from "./http";

export type Tag = {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
};

export type TagsResponse = {
  success: boolean;
  message: string;
  data: Tag[];
};

export const tagApi = {
  // Public API - Get all available tags
  getTags: () =>
    apiFetch<TagsResponse>("/tags", {
      method: "GET",
    }),
};
