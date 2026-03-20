// lib/api/tags.ts
import { apiFetch } from "./http";

export type Tag = {
  id: string;
  name: string;
  userId: string | null;
  createdAt: string;
};

/** Get all tags - Public endpoint for browsing */
export const getTags = () =>
  apiFetch<Tag[]>("/tags", {
    method: "GET",
  });

/** Create tag */
export const createTag = (data: { name: string }) =>
  apiFetch<Tag>("/tags", {
    method: "POST",
    body: JSON.stringify(data),
  });
