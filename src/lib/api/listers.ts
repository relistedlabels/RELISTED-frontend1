import { apiFetch } from "./http";

// ============================================================================
// DASHBOARD ENDPOINTS
// ============================================================================

export interface DashboardStats {
  success: boolean;
  data: {
    totalEarnings: number;
    totalOrders: number;
    activeRentals: number;
    pendingPayouts: number;
    earningsChange: number;
    ordersChange: number;
    rentalsChange: number;
    payoutsChange: number;
  };
}

export interface RentalOvertime {
  success: boolean;
  data: {
    month: string;
    revenue: number;
    orders: number;
  }[];
}

export interface TopItem {
  id: string;
  name: string;
  rentalCount: number;
  availability: "Available" | "Unavailable";
  rentalPrice: number;
  image: string;
}

export interface TopItemsResponse {
  success: boolean;
  data: TopItem[];
}

export interface RecentRental {
  id: string;
  itemName: string;
  size: string;
  color: string;
  returnDueDate: string;
  rentalAmount: number;
  status: "Delivered" | "Return Due" | "Completed";
  renterName: string;
  renterImage: string;
}

export interface RecentRentalsResponse {
  success: boolean;
  data: RecentRental[];
}

export async function getDashboardStats(
  timeframe: "week" | "month" | "year" = "month",
): Promise<DashboardStats> {
  return apiFetch("/api/listers/stats", {
    method: "GET",
  });
}

export async function getRentalsOvertime(
  timeframe: "month" | "quarter" | "year" = "year",
  year?: number,
): Promise<RentalOvertime> {
  const params = new URLSearchParams({
    timeframe,
    ...(year && { year: year.toString() }),
  });
  return apiFetch(`/api/listers/rentals/overtime?${params}`, {
    method: "GET",
  });
}

export async function getTopItems(
  limit: number = 5,
): Promise<TopItemsResponse> {
  return apiFetch(`/api/listers/inventory/top-items?limit=${limit}`, {
    method: "GET",
  });
}

export async function getRecentRentals(
  page: number = 1,
  limit: number = 10,
  status: string = "all",
): Promise<RecentRentalsResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    status,
  });
  return apiFetch(`/api/listers/rentals/recent?${params}`, {
    method: "GET",
  });
}

// ============================================================================
// ORDERS MANAGEMENT ENDPOINTS
// ============================================================================

export interface Order {
  id: string;
  orderNumber: string;
  orderDate: string;
  itemCount: number;
  totalAmount: number;
  status: "pending_approval" | "ongoing" | "completed" | "cancelled";
  createdAt: string;
  timeRemainingSeconds?: number;
}

export interface OrdersListResponse {
  success: boolean;
  data: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface OrderItem {
  id: string;
  productName: string;
  size: string;
  color: string;
  returnDueDate: string;
  rentalAmount: number;
  status: "Pending" | "Delivered" | "Return Due" | "Completed";
  productImage: string;
}

export interface OrderItemsResponse {
  success: boolean;
  data: OrderItem[];
}

export interface OrderProgress {
  currentStep: number;
  steps: {
    step: number;
    name: string;
    completed: boolean;
    date?: string;
  }[];
  progressPercentage: number;
}

export interface OrderProgressResponse {
  success: boolean;
  data: OrderProgress;
}

export interface OrderDetails extends Order {
  renterName: string;
  renterImage: string;
  items: OrderItem[];
  progress: OrderProgress;
  escrowAmount: number;
  releaseDate: string;
  notes?: string;
  approval: {
    status: string;
    timeRemainingSeconds?: number;
  };
}

export interface OrderDetailsResponse {
  success: boolean;
  data: OrderDetails;
}

export async function getOrders(
  status?: string,
  page: number = 1,
  limit: number = 20,
  sort: string = "-createdAt",
): Promise<OrdersListResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    sort,
    ...(status && { status }),
  });
  return apiFetch(`/api/listers/orders?${params}`, {
    method: "GET",
  });
}

export async function getOrderDetails(
  orderId: string,
): Promise<OrderDetailsResponse> {
  return apiFetch(`/api/listers/orders/${orderId}`, {
    method: "GET",
  });
}

export async function getOrderItems(
  orderId: string,
): Promise<OrderItemsResponse> {
  return apiFetch(`/api/listers/orders/${orderId}/items`, {
    method: "GET",
  });
}

export async function getOrderProgress(
  orderId: string,
): Promise<OrderProgressResponse> {
  return apiFetch(`/api/listers/orders/${orderId}/progress`, {
    method: "GET",
  });
}

export async function approveOrder(
  orderId: string,
  notes?: string,
): Promise<{ success: boolean; message: string; data: Order }> {
  return apiFetch(`/api/listers/orders/${orderId}/approve`, {
    method: "POST",
    body: JSON.stringify({ notes }),
  });
}

export async function rejectOrder(
  orderId: string,
  reason: string,
  refundType: "full" = "full",
): Promise<{ success: boolean; message: string }> {
  return apiFetch(`/api/listers/orders/${orderId}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason, refundType }),
  });
}

export async function updateOrderStatus(
  orderId: string,
  status:
    | "approved"
    | "dispatched"
    | "in_transit"
    | "delivered"
    | "return_due"
    | "completed",
  estimatedDeliveryDate?: string,
): Promise<{ success: boolean; message: string; data: Order }> {
  return apiFetch(`/api/listers/orders/${orderId}/status`, {
    method: "PUT",
    body: JSON.stringify({ status, estimatedDeliveryDate }),
  });
}

// ============================================================================
// WALLET MANAGEMENT ENDPOINTS
// ============================================================================

export interface WalletStats {
  availableBalance: number;
  lockedBalance: number;
  totalBalance: number;
  pendingEarnings: number;
  totalEarnings: number;
  withdrawalLimit: number;
  lastWithdrawal: string | null;
  lockedBreakdown: {
    orderId: string;
    amount: number;
    unlockDate: string;
  }[];
}

export interface WalletStatsResponse {
  success: boolean;
  data: WalletStats;
}

export interface Transaction {
  id: string;
  type: "credit" | "debit";
  amount: number;
  description: string;
  date: string;
  status: "Completed" | "Pending" | "Failed";
  reference?: string;
}

export interface TransactionsResponse {
  success: boolean;
  data: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface BankAccount {
  id: string;
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  accountType: string;
  verified: boolean;
  createdAt: string;
}

export interface BankAccountsResponse {
  success: boolean;
  data: BankAccount[];
}

export interface Bank {
  code: string;
  name: string;
}

export interface BanksResponse {
  success: boolean;
  data: Bank[];
}

export interface Withdrawal {
  id: string;
  amount: number;
  bankAccountId: string;
  status: "pending" | "processing" | "completed" | "failed";
  createdAt: string;
  expectedDate: string;
  estimatedTime?: string;
  failureReason?: string;
  reference?: string;
}

export interface WithdrawalResponse {
  success: boolean;
  data: Withdrawal;
  message: string;
}

export interface LockedBalance {
  orderId: string;
  amount: number;
  lockedDate: string;
  unlockDate: string;
  status: "locked" | "dispute_locked" | "releasing" | "released";
  disputeId?: string;
}

export interface LockedBalancesResponse {
  success: boolean;
  data: {
    totalLocked: number;
    breakdown: LockedBalance[];
  };
}

export async function getWalletStats(): Promise<WalletStatsResponse> {
  return apiFetch("/api/listers/wallet/stats", {
    method: "GET",
  });
}

export async function getTransactions(
  page: number = 1,
  limit: number = 10,
  type: "credit" | "debit" | "all" = "all",
  sortBy: string = "-date",
): Promise<TransactionsResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    type,
    sortBy,
  });
  return apiFetch(`/api/listers/wallet/transactions?${params}`, {
    method: "GET",
  });
}

export async function getBankAccounts(
  verified: boolean = true,
): Promise<BankAccountsResponse> {
  const params = new URLSearchParams({
    verified: verified.toString(),
  });
  return apiFetch(`/api/listers/wallet/bank-accounts?${params}`, {
    method: "GET",
  });
}

export async function addBankAccount(data: {
  bankCode: string;
  accountNumber: string;
  accountName: string;
  accountType?: "savings" | "current";
}): Promise<{ success: boolean; data: BankAccount; message: string }> {
  return apiFetch("/api/listers/wallet/bank-accounts", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getBanks(country: string = "NG"): Promise<BanksResponse> {
  return apiFetch(`/api/banks?country=${country}`, {
    method: "GET",
  });
}

export async function withdrawFunds(data: {
  amount: number;
  bankAccountId: string;
  notes?: string;
}): Promise<WithdrawalResponse> {
  return apiFetch("/api/listers/wallet/withdraw", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getWithdrawalStatus(
  withdrawalId: string,
): Promise<WithdrawalResponse> {
  return apiFetch(`/api/listers/wallet/withdraw/${withdrawalId}`, {
    method: "GET",
  });
}

export async function getLockedBalances(): Promise<LockedBalancesResponse> {
  return apiFetch("/api/listers/wallet/locked-balances", {
    method: "GET",
  });
}

// ============================================================================
// DISPUTE MANAGEMENT ENDPOINTS
// ============================================================================

export interface DisputeStats {
  totalDisputes: number;
  pending: number;
  inReview: number;
  resolved: number;
}

export interface DisputeStatsResponse {
  success: boolean;
  data: DisputeStats;
}

export interface Dispute {
  id: string;
  disputeId: string;
  itemName: string;
  curatorName: string;
  status: "pending_review" | "in_review" | "resolved" | "rejected";
  dateSubmitted: string;
  amount?: number;
  orderId: string;
}

export interface DisputesResponse {
  success: boolean;
  data: Dispute[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export async function getDisputeStats(
  timeframe: "week" | "month" | "year" = "month",
): Promise<DisputeStatsResponse> {
  return apiFetch(`/api/listers/disputes/stats?timeframe=${timeframe}`, {
    method: "GET",
  });
}

export async function getDisputes(
  page: number = 1,
  limit: number = 10,
  status: string = "all",
  search?: string,
  sortBy: string = "-dateSubmitted",
): Promise<DisputesResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    status,
    sortBy,
    ...(search && { search }),
  });
  return apiFetch(`/api/listers/disputes?${params}`, {
    method: "GET",
  });
}

export interface DisputeOverviewDetails {
  itemName: string;
  curator: string;
  category: string;
  dateSubmitted: string;
  preferredResolution: string;
  description: string;
}

export interface DisputeEvidenceFile {
  fileId: string;
  fileName: string;
  fileType: "image" | "document" | string;
  fileUrl: string;
  fileSize?: string;
  uploadedAt: string;
  uploadedBy?: string;
}

export interface DisputeTimelineEvent {
  eventId: string;
  status: string;
  date: string;
  displayDate: string;
  description: string;
  timestamp: string;
}

export interface DisputeResolutionDetails {
  status: string;
  statusLabel: string;
  resolutionDetails: string | null;
  refundAmount: number | null;
  currency?: string;
  formattedAmount?: string;
  refundDate: string | null;
  refundStatus?: string | null;
  resolvedAt: string | null;
  resolvedBy: string | null;
  appealAvailable: boolean;
}

export interface DisputeMessage {
  messageId: string;
  type: "user" | "admin" | "status" | string;
  content: string;
  createdAt: string;
  createdBy: string;
  adminName?: string;
  displayTimestamp?: string;
}

export interface DisputeDetailResponse {
  success: boolean;
  data: {
    dispute: {
      disputeId: string;
      orderNumber: string;
      status: string;
      statusLabel: string;
      statusIcon?: string;
      statusColor?: string;
      createdAt: string;
      lastUpdatedAt: string;
      estimatedResolutionDate?: string;
      overview: DisputeOverviewDetails;
      evidence: {
        filesCount: number;
        files: DisputeEvidenceFile[];
      };
      timeline: {
        events: DisputeTimelineEvent[];
      };
      resolution: DisputeResolutionDetails;
      messages: {
        count: number;
        lastMessage?: DisputeMessage;
      };
    };
  };
}

export async function getDisputeDetail(
  disputeId: string,
): Promise<DisputeDetailResponse> {
  return apiFetch(`/api/listers/disputes/${disputeId}`, {
    method: "GET",
  });
}

export interface DisputeOverviewResponse {
  success: boolean;
  data: {
    overview: {
      itemInformation: {
        itemName: string;
        curator: string;
        orderId: string;
      };
      disputeDetails: {
        category: string;
        dateSubmitted: string;
        preferredResolution: string;
        description: string;
      };
    };
  };
}

export async function getDisputeOverview(
  disputeId: string,
): Promise<DisputeOverviewResponse> {
  return apiFetch(`/api/listers/disputes/${disputeId}/overview`, {
    method: "GET",
  });
}

export interface DisputeEvidenceResponse {
  success: boolean;
  data: {
    evidence: {
      files: DisputeEvidenceFile[];
      totalFiles: number;
      totalSize?: string;
    };
  };
}

export async function getDisputeEvidence(
  disputeId: string,
): Promise<DisputeEvidenceResponse> {
  return apiFetch(`/api/listers/disputes/${disputeId}/evidence`, {
    method: "GET",
  });
}

export interface DisputeTimelineResponse {
  success: boolean;
  data: {
    timeline: {
      events: DisputeTimelineEvent[];
      totalEvents: number;
      currentStatus: string;
    };
  };
}

export async function getDisputeTimeline(
  disputeId: string,
): Promise<DisputeTimelineResponse> {
  return apiFetch(`/api/listers/disputes/${disputeId}/timeline`, {
    method: "GET",
  });
}

export interface DisputeResolutionResponse {
  success: boolean;
  data: {
    resolution: DisputeResolutionDetails;
  };
}

export async function getDisputeResolution(
  disputeId: string,
): Promise<DisputeResolutionResponse> {
  return apiFetch(`/api/listers/disputes/${disputeId}/resolution`, {
    method: "GET",
  });
}

export interface DisputeMessagesResponse {
  success: boolean;
  data: {
    messages: DisputeMessage[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

export async function getDisputeMessages(
  disputeId: string,
  page: number = 1,
  limit: number = 50,
): Promise<DisputeMessagesResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  return apiFetch(`/api/listers/disputes/${disputeId}/messages?${params}`, {
    method: "GET",
  });
}

export interface SendDisputeMessagePayload {
  content: string;
  mediaIds?: string[];
}

export interface SendDisputeMessageResponse {
  success: boolean;
  message: string;
  data: DisputeMessage;
}

export async function sendDisputeMessage(
  disputeId: string,
  data: SendDisputeMessagePayload,
): Promise<SendDisputeMessageResponse> {
  return apiFetch(`/api/listers/disputes/${disputeId}/messages`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export interface WithdrawDisputeResponse {
  success: boolean;
  message: string;
}

export async function withdrawDispute(
  disputeId: string,
): Promise<WithdrawDisputeResponse> {
  return apiFetch(`/api/listers/disputes/${disputeId}/withdraw`, {
    method: "POST",
  });
}

export interface CreateDisputePayload {
  orderId: string;
  issueCategory: string;
  description: string;
  evidenceFileIds?: string[];
}

export interface CreateDisputeResponse {
  success: boolean;
  message: string;
  data: {
    disputeId: string;
  };
}

export async function createDispute(
  data: CreateDisputePayload,
): Promise<CreateDisputeResponse> {
  return apiFetch("/api/listers/disputes", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ============================================================================
// SETTINGS: PROFILE & BUSINESS
// ============================================================================

export interface ListerAddress {
  addressId: string;
  type: "residential" | "business" | string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
}

export interface ListerProfile {
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  profileImage?: string;
  dateJoined?: string;
  addresses?: ListerAddress[];
}

export interface ListerProfileResponse {
  success: boolean;
  data: {
    profile: ListerProfile;
  };
}

export async function getListerProfile(): Promise<ListerProfileResponse> {
  return apiFetch("/api/listers/profile", {
    method: "GET",
  });
}

export interface ListerAddressesResponse {
  success: boolean;
  data: {
    addresses: ListerAddress[];
    total: number;
  };
}

export async function getListerAddresses(): Promise<ListerAddressesResponse> {
  return apiFetch("/api/listers/profile/addresses", {
    method: "GET",
  });
}

export interface AddAddressPayload {
  type: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export async function addListerAddress(data: AddAddressPayload): Promise<{
  success: boolean;
  message: string;
  data: { address: ListerAddress };
}> {
  return apiFetch("/api/listers/profile/addresses", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateListerAddress(
  addressId: string,
  data: Partial<AddAddressPayload>,
): Promise<{
  success: boolean;
  message: string;
  data: { address: ListerAddress };
}> {
  return apiFetch(`/api/listers/profile/addresses/${addressId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export interface AvatarUploadResponse {
  success: boolean;
  message: string;
  data: {
    profileImage: string;
    uploadedAt: string;
  };
}

export async function uploadListerAvatar(
  formData: FormData,
): Promise<AvatarUploadResponse> {
  return apiFetch("/api/listers/profile/avatar", {
    method: "POST",
    body: formData,
  });
}

export interface BusinessProfile {
  businessId: string;
  businessName: string;
  businessCategory: string;
  businessDescription: string;
  businessEmail: string;
  businessPhone: string;
  businessAddress: string;
  website?: string;
  taxId?: string;
  businessRegistration: string;
  verificationStatus?: string;
  verificationBadge?: string;
  averageResponseTime?: string;
  totalRentals?: number;
  averageRating?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface BusinessProfileResponse {
  success: boolean;
  data: {
    businessProfile: BusinessProfile;
  };
}

export async function getBusinessProfile(): Promise<BusinessProfileResponse> {
  return apiFetch("/api/listers/profile/business", {
    method: "GET",
  });
}

export interface UpdateBusinessProfilePayload {
  businessName?: string;
  businessCategory?: string;
  businessDescription?: string;
  businessEmail?: string;
  businessPhone?: string;
  businessAddress?: string;
  website?: string;
}

export async function updateBusinessProfile(
  data: UpdateBusinessProfilePayload,
): Promise<{
  success: boolean;
  message: string;
  data: { businessProfile: BusinessProfile };
}> {
  return apiFetch("/api/listers/profile/business", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export interface UpdateListerProfilePayload {
  fullName?: string;
  phone?: string;
}

export async function updateListerProfile(
  data: UpdateListerProfilePayload,
): Promise<{
  success: boolean;
  message: string;
  data: { profile: ListerProfile };
}> {
  return apiFetch("/api/listers/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// ============================================================================
// SETTINGS: VERIFICATIONS
// ============================================================================

export interface VerificationStatusDetails {
  status: string;
  document: string;
  verifiedDate?: string;
  expiresAt?: string;
  maskedValue?: string;
  registrationNumber?: string;
}

export interface VerificationStatusResponse {
  success: boolean;
  data: {
    verifications: {
      nin: VerificationStatusDetails;
      bvn: VerificationStatusDetails;
      businessRegistration: VerificationStatusDetails;
    };
  };
}

export async function getVerificationStatus(): Promise<VerificationStatusResponse> {
  return apiFetch("/api/listers/verifications/status", {
    method: "GET",
  });
}

export interface VerificationDocument {
  documentId: string;
  type: string;
  documentUrl: string;
  status: string;
  uploadedDate: string;
  verifiedDate?: string;
  notes?: string;
}

export interface VerificationDocumentsResponse {
  success: boolean;
  data: {
    documents: VerificationDocument[];
  };
}

export async function getVerificationDocuments(): Promise<VerificationDocumentsResponse> {
  return apiFetch("/api/listers/verifications/documents", {
    method: "GET",
  });
}

export interface NinUploadResponse {
  success: boolean;
  message: string;
  data: {
    document: VerificationDocument;
  };
}

export async function uploadNinDocument(
  formData: FormData,
): Promise<NinUploadResponse> {
  return apiFetch("/api/listers/verifications/nin", {
    method: "POST",
    body: formData,
  });
}

export interface BvnVerification {
  maskedValue: string;
  status: string;
  verifiedDate: string;
  bankName: string;
  accountName: string;
}

export interface BvnVerificationResponse {
  success: boolean;
  data: {
    bvn: BvnVerification;
  };
}

export async function getBvnVerification(): Promise<BvnVerificationResponse> {
  return apiFetch("/api/listers/verifications/bvn", {
    method: "GET",
  });
}

export interface EmergencyContactPayload {
  fullName: string;
  email: string;
  phone: string;
  relationship: string;
}

export interface EmergencyContactResponse {
  success: boolean;
  message: string;
  data: {
    emergencyContact: {
      contactId: string;
      fullName: string;
      email: string;
      phone: string;
      relationship: string;
      updatedAt: string;
    };
  };
}

export async function updateEmergencyContact(
  data: EmergencyContactPayload,
): Promise<EmergencyContactResponse> {
  return apiFetch("/api/listers/verifications/emergency-contact", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// ============================================================================
// SETTINGS: SECURITY & NOTIFICATIONS
// ============================================================================

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
  data: {
    passwordChanged: boolean;
    changedAt: string;
  };
}

export async function changeListerPassword(
  data: ChangePasswordPayload,
): Promise<ChangePasswordResponse> {
  return apiFetch("/api/listers/security/password", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export interface NotificationPreferences {
  emailAlerts: {
    enabled: boolean;
    categories?: string[];
  };
  smsUpdates: {
    enabled: boolean;
    categories?: string[];
  };
  productRecommendations: {
    enabled: boolean;
    frequency?: string;
  };
}

export interface NotificationPreferencesResponse {
  success: boolean;
  data: {
    preferences: NotificationPreferences;
    lastUpdated?: string;
  };
}

export async function getNotificationPreferences(): Promise<NotificationPreferencesResponse> {
  return apiFetch("/api/listers/notifications/preferences", {
    method: "GET",
  });
}

export interface UpdateNotificationPreferencesPayload {
  emailAlerts: boolean;
  smsUpdates: boolean;
  productRecommendations: boolean;
}

export interface UpdateNotificationPreferencesResponse {
  success: boolean;
  message: string;
  data: {
    preferences: {
      emailAlerts: boolean;
      smsUpdates: boolean;
      productRecommendations: boolean;
    };
    savedAt: string;
  };
}

export async function updateNotificationPreferences(
  data: UpdateNotificationPreferencesPayload,
): Promise<UpdateNotificationPreferencesResponse> {
  return apiFetch("/api/listers/notifications/preferences", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
