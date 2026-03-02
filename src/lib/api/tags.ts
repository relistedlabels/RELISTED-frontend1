// lib/api/tags.ts
import { apiFetch } from "./http";

export type Tag = {
  id: string;
  name: string;
  createdAt?: string;
};

/** Get all tags */
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
