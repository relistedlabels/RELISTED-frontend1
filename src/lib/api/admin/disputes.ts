import { apiFetch } from "../http";

export type DisputeStatus =
  | "PENDING"
  | "IN_REVIEW"
  | "WITHDRAW"
  | "RESOLVED"
  | "REJECTED";

export type DisputesListStatus =
  | "pending"
  | "in_review"
  | "under-review"
  | "withdraw"
  | "resolved"
  | "rejected"
  | "all";

export type DisputeParty = {
  id?: string;
  name?: string;
  role?: "Dresser" | "Curator" | string;
  avatar?: string | null;
} | null;

export interface Dispute {
  id: string;
  orderId?: string | null;
  orderDbId?: string | null;
  raisedBy?: DisputeParty;
  lister?: DisputeParty;
  renter?: DisputeParty;
  category?: string | null;
  preferredResolution?: string | null;
  createdAt?: string | null;
  status: string;
  assignedTo: {
    id: string;
    name: string;
  } | null;
  description?: string | null;
}

export interface DisputeDetail extends Dispute {
  otherParty: {
    id: string;
    name: string;
    role: string;
    email?: string;
    phone?: string;
    avatar?: string | null;
  };
  orderDetails: {
    id: string;
    dbId?: string | null;
    totalAmountPaid?: number | null;
    escrow?: {
      status?: "LOCKED" | "PARTIALLY_RELEASED" | "RELEASED" | string;
      collateralAmount?: number | null;
      rentalAmount?: number | null;
      cleaningFee?: number | null;
      resaleAmount?: number | null;
      releasedAt?: string | null;
    } | null;
  } | null;
  evidence: {
    uploads: Array<{
      id?: string;
      fileName?: string;
      fileType?: string;
      url: string;
      thumbnailUrl?: string;
      uploadedAt?: string;
    }>;
  };
  messages: Array<{
    id: string;
    from?: string;
    content?: string;
    createdAt?: string;
    timestamp?: string;
    type?: string;
    createdBy?: "renter" | "lister" | "admin" | string;
    senderId?: string;
    adminName?: string;
    displayTimestamp?: string;
    sender?: {
      id?: string;
      name?: string | null;
      avatarUrl?: string | null;
      role?: "renter" | "lister" | "admin" | string;
    };
    attachments?: Array<{
      id?: string;
      url?: string;
      thumbnailUrl?: string;
      name?: string;
      type?: string;
      size?: number;
    }>;
  }>;
  notes?: string | null;
}

export interface DisputeStats {
  pendingCount: number;
  underReviewCount: number;
  resolvedThisMonth: number;
}

interface DisputesListParams {
  status?: DisputesListStatus;
  search?: string;
  page?: number;
  limit?: number;
}

function buildDisputeParams(params: DisputesListParams): string {
  const searchParams = new URLSearchParams();
  if (params.status) searchParams.append("status", params.status);
  if (params.search) searchParams.append("search", params.search);
  if (params.page) searchParams.append("page", params.page.toString());
  if (params.limit) searchParams.append("limit", params.limit.toString());
  return searchParams.toString();
}

export const disputesApi = {
  getStats: () =>
    apiFetch<{ success: true; data: DisputeStats }>(
      `/api/admin/disputes/stats`,
    ),

  getDisputes: (params: DisputesListParams) =>
    apiFetch<{
      success: true;
      data: {
        disputes: Dispute[];
        pagination: {
          total: number;
          page: number;
          limit: number;
          pages: number;
        };
      };
    }>(`/api/admin/disputes?${buildDisputeParams(params)}`),

  getDisputeById: (disputeId: string) =>
    apiFetch<{ success: true; data: DisputeDetail }>(
      `/api/admin/disputes/${disputeId}`,
    ),

  updateDisputeStatus: (
    disputeId: string,
    status: DisputeStatus,
    note?: string,
  ) =>
    apiFetch(`/api/admin/disputes/${disputeId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, note }),
    }),

  resolveDispute: (
    disputeId: string,
    data: {
      resolutionDetails: string;
      refundAmount?: number;
      collateralWithheldToLister?: number;
    },
  ) =>
    apiFetch(`/api/admin/disputes/${disputeId}/resolve`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
};
