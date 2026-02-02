// store/useProfileStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface EmergencyContacts {
  name: string;
  relationship: string;
  phoneNumber: string;
  city: string;
  state: string;
  
}

interface BusinessInfo {
  businessName: string;
  businessEmail: string;
  businessRegistrationNumber: string;
  businessAddress: string;
  businessCity: string;
  businessState: string;
}

interface BankAccounts {
  bankName: string;
  accountNumber: string;
  nameOfAccount: string;
}

interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
}

interface ProfileState {
  phoneNumber: string;
  bvn: string;

  emergencyContacts: EmergencyContacts;
  businessInfo: BusinessInfo;
  bankAccounts: BankAccounts;
  address: Address;

  avatarUploadId?: string;
  ninUploadId?: string;

  setProfile: (data: Partial<ProfileState>) => void;
  resetProfile: () => void;
}

const initialState = {
  phoneNumber: "+234",
  bvn: "",

  emergencyContacts: {
    name: "",
    relationship: "",
    phoneNumber: "",
  
    city: "",
    state: "",
  },

  businessInfo: {
    businessName: "",
    businessEmail: "",
    businessRegistrationNumber: "",
    businessAddress: "",
    businessCity: "",
    businessState: "",
  },

  bankAccounts: {
    bankName: "",
    accountNumber: "",
    nameOfAccount: "",
  },

  address: {
    street: "",
    city: "",
    state: "",
    country: "",
  },

  avatarUploadId: undefined,
  ninUploadId: undefined,
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      ...initialState,

      setProfile: (data) =>
        set((state) => ({
          ...state,
          ...data,
        })),

      resetProfile: () => set(initialState),
    }),
    {
      name: "profile-store", // localStorage key
      version: 1,
    },
  ),
);
