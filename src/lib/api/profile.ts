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
  const res = await apiFetch<ProfileResponse>("/api/renters/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return res.data;
};

/** Update renter profile with phone number */
export const updateRenterProfilePhone = async (
  phoneNumber: string,
  bvn?: string,
): Promise<FullProfile> => {
  const res = await apiFetch<ProfileResponse>("/api/renters/profile", {
    method: "PUT",
    body: JSON.stringify({ phoneNumber, bvn }),
  });
  return res.data;
};

/** Submit renter profile address */
export const submitRenterAddress = async (data: {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode?: string;
  type?: string;
  isDefault?: boolean;
}): Promise<any> => {
  const res = await apiFetch<any>("/api/renters/profile/addresses", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data;
};
