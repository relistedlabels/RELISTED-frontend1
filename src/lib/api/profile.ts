// lib/api/profile.ts
import { apiFetch } from "./http";
import type { FullProfile, UpdateProfilePayload } from "../../types/profile";

interface ProfileResponse {
  message: string;
  data: FullProfile;
}

/** Get profile for the current user */
export const getProfile = async (): Promise<FullProfile> => {
  const res = await apiFetch<ProfileResponse>(`/profile/user-profile`, {
    method: "GET",
  });
  return res.data;
};

/** Create profile */
export const createProfile = async (
  data: UpdateProfilePayload,
): Promise<FullProfile> => {
  const res = await apiFetch<ProfileResponse>("/profile", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data;
};

/** Update profile */
export const updateProfile = async (
  data: UpdateProfilePayload,
): Promise<FullProfile> => {
  const res = await apiFetch<ProfileResponse>("/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return res.data;
};
