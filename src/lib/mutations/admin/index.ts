import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ordersApi,
  disputesApi,
  walletsApi,
  settingsApi,
} from "@/lib/api/admin/";

// Orders mutations
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      orderId,
      status,
      reason,
    }: {
      orderId: string;
      status: string;
      reason?: string;
    }) => ordersApi.updateOrderStatus(orderId, status, reason),
    onSuccess: (_, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders", orderId] });
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      orderId,
      reason,
      notifyParties,
    }: {
      orderId: string;
      reason: string;
      notifyParties?: boolean;
    }) => ordersApi.cancelOrder(orderId, reason, notifyParties),
    onSuccess: (_, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders", orderId] });
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
  });
};

// Disputes mutations
export const useAssignDispute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      disputeId,
      adminId,
    }: {
      disputeId: string;
      adminId: string;
    }) => disputesApi.assignDispute(disputeId, adminId),
    onSuccess: (_, { disputeId }) => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "disputes", disputeId],
      });
      queryClient.invalidateQueries({ queryKey: ["admin", "disputes"] });
    },
  });
};

export const useUpdateDisputeStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      disputeId,
      status,
    }: {
      disputeId: string;
      status: string;
    }) => disputesApi.updateDisputeStatus(disputeId, status),
    onSuccess: (_, { disputeId }) => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "disputes", disputeId],
      });
      queryClient.invalidateQueries({ queryKey: ["admin", "disputes"] });
    },
  });
};

export const useResolveDispute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      disputeId,
      resolution,
      notes,
      actions,
    }: {
      disputeId: string;
      resolution: string;
      notes: string;
      actions?: any[];
    }) => disputesApi.resolveDispute(disputeId, resolution, notes, actions),
    onSuccess: (_, { disputeId }) => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "disputes", disputeId],
      });
      queryClient.invalidateQueries({ queryKey: ["admin", "disputes"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "disputes", "stats"],
      });
    },
  });
};

// Wallets mutations
export const useReleaseEscrow = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ escrowId, reason }: { escrowId: string; reason: string }) =>
      walletsApi.releaseEscrow(escrowId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "wallets"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "wallets", "stats"],
      });
    },
  });
};

// Settings mutations
export const useUpdateAdminProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      name,
      email,
      phone,
    }: {
      name: string;
      email: string;
      phone: string;
    }) => settingsApi.updateProfile(name, email, phone),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "settings", "profile"],
      });
    },
  });
};

export const useUpdateAdminPassword = () => {
  return useMutation({
    mutationFn: ({
      currentPassword,
      newPassword,
      confirmPassword,
    }: {
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    }) =>
      settingsApi.updatePassword(currentPassword, newPassword, confirmPassword),
  });
};

export const useUpdatePlatformControls = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => settingsApi.updatePlatformControls(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "settings", "platform-controls"],
      });
    },
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      name,
      description,
      permissions,
    }: {
      name: string;
      description: string;
      permissions: any;
    }) => settingsApi.createRole(name, description, permissions),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "settings", "roles"],
      });
    },
  });
};

export const useUpdateRolePermissions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      roleId,
      permissions,
    }: {
      roleId: string;
      permissions: any;
    }) => settingsApi.updateRolePermissions(roleId, permissions),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "settings", "roles"],
      });
    },
  });
};

export const useCreateAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      name,
      email,
      roleId,
      sendInvitation,
    }: {
      name: string;
      email: string;
      roleId: string;
      sendInvitation?: boolean;
    }) => settingsApi.createAdmin(name, email, roleId, sendInvitation),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "settings", "admins"],
      });
    },
  });
};

export const useUpdateAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      adminId,
      roleId,
      status,
    }: {
      adminId: string;
      roleId?: string;
      status?: string;
    }) => settingsApi.updateAdmin(adminId, roleId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "settings", "admins"],
      });
    },
  });
};
