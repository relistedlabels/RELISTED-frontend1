import { apiFetch } from "../http";

export interface AdminProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: string;
  status: string;
  lastLogin: string;
  createdAt: string;
}

export interface PlatformControls {
  commissionAndFees: {
    platformCommission: number;
    lateReturnFee: number;
    damageFee: number;
  };
  escrowAndPayout: {
    escrowReleaseDelay: string;
    minimumPayoutThreshold: number;
  };
  kycRequirements: {
    requireKycCurators: boolean;
    requireKycDressers: boolean;
  };
  platformAccess: {
    allowCuratorSignup: boolean;
    allowDresserSignup: boolean;
  };
  lastUpdatedBy: string;
  lastUpdatedAt: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  adminCount: number;
  permissions: {
    users: boolean;
    listings: boolean;
    orders: boolean;
    disputes: boolean;
    payments: boolean;
    platformSettings: boolean;
  };
  createdAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastActive: string;
  avatar: string;
  joinDate: string;
  recentActions: Array<{
    action: string;
    timestamp: string;
  }>;
}

export interface Device {
  id: string;
  type: string;
  name: string;
  osVersion: string;
  browser: string;
  ipAddress: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  actionType: string;
  performedBy: {
    id: string;
    name: string;
  };
  target: {
    type: string;
    id: string;
    name: string;
  };
  details: any;
  ipAddress: string;
  status: string;
}

export const settingsApi = {
  getProfile: () =>
    apiFetch<{ success: true; data: AdminProfile }>(
      `/api/admin/settings/profile`,
    ),

  updateProfile: (name: string, email: string, phone: string) =>
    apiFetch(`/api/admin/settings/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone }),
    }),

  updateProfilePhoto: (formData: FormData) =>
    apiFetch(`/api/admin/settings/profile/photo`, {
      method: "PUT",
      body: formData,
    }),

  updatePassword: (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
  ) =>
    apiFetch(`/api/admin/settings/profile/password`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword,
        newPassword,
        confirmPassword,
      }),
    }),

  updateTwoFactorAuth: (enabled: boolean) =>
    apiFetch(`/api/admin/settings/profile/2fa`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled }),
    }),

  getDevices: () =>
    apiFetch<{
      success: true;
      data: { devices: Device[]; totalSessions: number };
    }>(`/api/admin/settings/profile/devices`),

  logoutAllDevices: (exceptCurrentDevice: boolean = true) =>
    apiFetch(`/api/admin/settings/profile/logout-all-devices`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exceptCurrentDevice }),
    }),

  getPlatformControls: () =>
    apiFetch<{ success: true; data: PlatformControls }>(
      `/api/admin/settings/platform-controls`,
    ),

  updatePlatformControls: (data: Partial<PlatformControls>) =>
    apiFetch(`/api/admin/settings/platform-controls`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  getRoles: () =>
    apiFetch<{ success: true; data: { roles: Role[]; totalRoles: number } }>(
      `/api/admin/settings/roles`,
    ),

  createRole: (name: string, description: string, permissions: any) =>
    apiFetch(`/api/admin/settings/roles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, permissions }),
    }),

  updateRolePermissions: (roleId: string, permissions: any) =>
    apiFetch(`/api/admin/settings/roles/${roleId}/permissions`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ permissions }),
    }),

  getAdmins: (page: number = 1, limit: number = 20) =>
    apiFetch<{
      success: true;
      data: {
        admins: AdminUser[];
        pagination: {
          total: number;
          page: number;
          limit: number;
          pages: number;
        };
      };
    }>(`/api/admin/settings/admins?page=${page}&limit=${limit}`),

  createAdmin: (
    name: string,
    email: string,
    roleId: string,
    sendInvitation: boolean = true,
  ) =>
    apiFetch(`/api/admin/settings/admins`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, roleId, sendInvitation }),
    }),

  updateAdmin: (adminId: string, roleId?: string, status?: string) =>
    apiFetch(`/api/admin/settings/admins/${adminId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roleId, status }),
    }),

  getAuditLogs: (
    page: number = 1,
    limit: number = 20,
    adminId?: string,
    actionType?: string,
  ) => {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());
    if (adminId) params.append("adminId", adminId);
    if (actionType) params.append("actionType", actionType);
    return apiFetch<{
      success: true;
      data: {
        logs: AuditLog[];
        pagination: {
          total: number;
          page: number;
          limit: number;
          pages: number;
        };
      };
    }>(`/api/admin/settings/audit-logs?${params.toString()}`);
  },

  exportAuditLogs: (
    format: "csv",
    dateFrom?: string,
    dateTo?: string,
    adminId?: string,
  ) =>
    apiFetch(`/api/admin/settings/audit-logs/export`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ format, dateFrom, dateTo, adminId }),
    }),
};
