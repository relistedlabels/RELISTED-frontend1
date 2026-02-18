import { apiFetch } from "../http";

export interface Dispute {
  id: string;
  raisedBy: {
    id: string;
    name: string;
    role: "Dresser" | "Curator";
    avatar: string;
  };
  category: string;
  orderId: string;
  priority: "High" | "Medium" | "Low";
  dateCreated: string;
  status: "pending" | "under-review" | "resolved";
  assignedTo: {
    id: string;
    name: string;
  } | null;
  description: string;
}

export interface DisputeDetail extends Dispute {
  otherParty: {
    id: string;
    name: string;
    role: string;
    email: string;
    phone: string;
    avatar: string;
  };
  evidence: Array<{
    type: string;
    url: string;
    uploadedAt: string;
  }>;
  messages: Array<{
    id: string;
    from: string;
    text: string;
    timestamp: string;
  }>;
  orderDetails: {
    id: string;
    item: string;
    rentalPrice: number;
    rentalDates: {
      startDate: string;
      endDate: string;
      returnDate: string;
    };
  };
  resolution: any | null;
  notes: string;
}

export interface DisputeStats {
  pendingCount: number;
  underReviewCount: number;
  resolvedThisMonth: number;
}

interface DisputesListParams {
  status?: string;
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

  assignDispute: (disputeId: string, adminId: string) =>
    apiFetch(`/api/admin/disputes/${disputeId}/assign`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminId }),
    }),

  updateDisputeStatus: (disputeId: string, status: string) =>
    apiFetch(`/api/admin/disputes/${disputeId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }),

  resolveDispute: (
    disputeId: string,
    resolution: string,
    notes: string,
    actions?: any[],
  ) =>
    apiFetch(`/api/admin/disputes/${disputeId}/resolve`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resolution, notes, actions }),
    }),
};
