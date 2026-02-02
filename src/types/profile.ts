/** Full API response shape */
export interface FullProfile {
  id: string;
  name: string | null;
  avatar: string | null;
  role: "curator" | "dresser";

  phoneNumber?: string;
  bvn?: string;

  emergencyContacts?: {
    name: string;
    relationship: string;
    phoneNumber: string;
    city: string;
    state: string;
  };

  businessInfo?: {
    businessName: string;
    businessEmail: string;
    businessRegistrationNumber: string;
    businessAddress: string;
    businessCity: string;
    businessState: string;
  };

  bankAccounts?: {
    bankName: string;
    accountNumber: string;
    nameOfAccount: string;
  };

  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
  };

  avatarUploadId?: string;
  ninUploadId?: string;

  createdAt?: string;
  updatedAt?: string;
}



/** API contract */
export interface UpdateProfilePayload {
  phoneNumber?: string;
  bvn?: string;

  emergencyContacts?: {
    name: string;
    relationship: string;
    phoneNumber: string;
    city: string;
    state: string;
  };

  businessInfo?: {
    businessName: string;
    businessEmail: string;
    businessRegistrationNumber: string;
    businessAddress: string;
    businessCity: string;
    businessState: string;
  };

  bankAccounts?: {
    bankName: string;
    accountNumber: string;
    nameOfAccount: string;
  };

  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
  };

  avatarUploadId?: string;
  ninUploadId?: string;
}