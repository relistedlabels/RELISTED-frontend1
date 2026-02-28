// ...existing code...

// --- Order Types ---
export interface OrderItem {
  id: string;
  name: string;
  image: string;
  size: string;
  color: string;
  rentalFee: number;
  itemValue: number;
  returnDue: string;
  status: string;
  statusLabel: string;
}

export interface OrderTimeline {
  dateOrdered: string;
  itemsCount: number;
  itemsDelivered: number;
  currentStep: string;
}

export interface OrderEscrow {
  rentalFeeTotal: number;
  itemValueHeld: number;
  totalHeld: number;
  currency: string;
  releaseCondition: string;
}

export interface OrderDetails {
  id: string;
  orderNumber: string;
  createdAt: string;
  expiresAt: string;
  timeRemainingSeconds: number;
  status: string;
  statusLabel: string;
  statusColor: string;
  statusTextColor: string;
  itemCount: number;
  totalAmount: number;
  currency: string;
  dresser: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
    reviews: number;
    memberSince: string;
  };
  items: OrderItem[];
  canApprove: boolean;
  canReject: boolean;
  approvalRequired: boolean;
  approvalExpiredAt: string;
  timeline: OrderTimeline;
  escrow: OrderEscrow;
}
export interface ProfileUser {
  id: string;
  email: string;
  name: string;
  role: string; // e.g. "LISTER" | "RENTER"
  isVerified: boolean;
  isSuspended: boolean;
  tokenVersion?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProfileEmergencyContact {
  id: string;
  profileId: string;
  name: string;
  relationship: string;
  phoneNumber: string;
  city: string;
  state: string;
}

export interface ProfileBusinessInfo {
  id: string;
  profileId: string;
  businessName: string;
  businessEmail: string;
  businessRegistrationNumber: string;
  businessAddress: string;
  businessCity: string;
  businessState: string;
}

export interface ProfileAddress {
  id: string;
  profileId: string;
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Shape of `data` returned from GET /profile/user-profile */
export interface ProfileWallet {
  balance: number;
  currency: string;
}

export interface FullProfile {
  id: string;
  userId: string;
  phoneNumber: string;
  bvn: string | null;
  isApproved: boolean;
  avatarUploadId: string | null;
  ninUploadId: string | null;
  createdAt: string;
  updatedAt: string;

  emergencyContact: ProfileEmergencyContact;
  businessInfo: ProfileBusinessInfo;
  address: ProfileAddress;
  user: ProfileUser;
  wallet?: ProfileWallet;
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
    zipCode?: string;
  };

  avatarUploadId?: string;
  ninUploadId?: string;
}
