// lib/api/profile.ts
import { apiFetch } from "./http";
import { FullProfile, UpdateProfilePayload } from "../../types/profile";

/** Get profile by id */
export const getProfile = () =>
  apiFetch<FullProfile>(`/profile/user-profile`, {
    method: "GET",
  });

/** Create profile */
export const createProfile = (data: UpdateProfilePayload) =>
  apiFetch<FullProfile>("/profile", {
    method: "POST",
    body: JSON.stringify(data),
  });

/** Update profile */
export const updateProfile = (data: UpdateProfilePayload) =>
  apiFetch<FullProfile>("/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
