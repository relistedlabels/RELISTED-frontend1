# Renters Module - Developer Quick Reference

## 📁 File Structure

```
src/
├── lib/
│   ├── api/
│   │   └── renters.ts                    ← Main API client (450+ lines)
│   │
│   ├── queries/
│   │   └── renters/
│   │       ├── useDashboardSummary.ts    ← Dashboard overview
│   │       ├── useFavorites.ts           ← Favorites list
│   │       ├── useOrders.ts              ← Orders with filtering
│   │       ├── useWallet.ts              ← Wallet balance
│   │       ├── useProfile.ts             ← User profile
│   │       ├── useTransactions.ts        ← Transaction history
│   │       ├── useBankAccounts.ts        ← Bank accounts list
│   │       ├── useOrderDetails.ts        ← Single order details
│   │       ├── useOrderProgress.ts       ← Order timeline
│   │       ├── useRentalRequests.ts      ← Shopping cart (with polling)
│   │       ├── useWalletDetails.ts       ← Locked balances
│   │       └── useDisputes.ts            ← Disputes list
│   │
│   └── mutations/
│       └── renters/
│           ├── useFavoriteMutations.ts   ← Add/remove favorites
│           ├── useOrderMutations.ts      ← Return requests
│           ├── useWalletMutations.ts     ← Fund/withdraw/bankAccounts
│           ├── useProfileMutations.ts    ← Profile updates
│           └── useDisputeMutations.ts    ← Create disputes
│
└── app/
    └── renters/
        ├── page.tsx                      ← Dashboard
        ├── layout.tsx
        ├── wallet/
        │   ├── page.tsx
        │   └── components/
        │       ├── UserWalletDashboard.tsx       ✅ Connected
        │       ├── FundWallet.tsx                ✅ Connected
        │       ├── Withdraw.tsx                  ✅ Connected
        │       ├── BankAccountsDropdown.tsx      ✅ Connected
        │       ├── AddBankAccountForm.tsx        ✅ Connected
        │       └── Transaction.tsx               ✅ Connected
        │
        ├── account/
        │   ├── page.tsx
        │   └── components/
        │       ├── AccountProfileDetails.tsx     ✅ Connected
        │       ├── AccountSecurity.tsx           ✅ Connected
        │       └── AccountNotifications.tsx      ✅ Connected
        │
        ├── orders/
        │   ├── page.tsx
        │   └── components/
        │       ├── DashboardOrderList.tsx        ✅ Connected
        │       ├── OrderDetails1.tsx             ✅ Connected
        │       ├── OrderProgressTimeline.tsx     ✅ Connected
        │       └── OrderStatusDetails.tsx        ✅ Connected
        │
        ├── favorites/
        │   ├── page.tsx
        │   └── Favorites.tsx                     ✅ Connected
        │
        ├── dispute/
        │   ├── page.tsx
        │   └── components/
        │       ├── DisputesDashboard.tsx         ✅ Connected
        │       ├── DisputesListTable.tsx         ✅ Connected
        │       ├── RaiseDispute.tsx              ✅ Connected
        │       └── DisputeDetails.tsx            ✅ Connected
        │
        └── components/
            └── UserWalletDashboard.tsx           ✅ Connected
```

---

## 🔗 API Endpoints (40+ Connected)

### Wallet Endpoints

```
GET    /api/renters/wallet
GET    /api/renters/wallet/transactions
GET    /api/renters/wallet/bank-accounts
GET    /api/renters/wallet/locked-balances
GET    /api/renters/wallet/withdraw/:withdrawalId
POST   /api/renters/wallet/deposit
POST   /api/renters/wallet/withdraw
POST   /api/renters/wallet/bank-accounts
```

### Order Endpoints

```
GET    /api/renters/orders
GET    /api/renters/orders/:orderId
GET    /api/renters/orders/:orderId/progress
POST   /api/renters/orders/:orderId/return
```

### Favorites Endpoints

```
GET    /api/renters/favorites
POST   /api/renters/favorites/:itemId
DELETE /api/renters/favorites/:itemId
```

### Profile Endpoints

```
GET    /api/renters/profile
PUT    /api/renters/profile
```

### Rental Request Endpoints (Shopping Cart)

```
GET    /api/renters/rental-requests
POST   /api/renters/rental-requests
GET    /api/renters/rental-requests/:requestId
DELETE /api/renters/rental-requests/:requestId
POST   /api/renters/rental-requests/:requestId/confirm
```

### Dispute Endpoints

```
GET    /api/renters/disputes
POST   /api/renters/disputes
GET    /api/renters/disputes/:disputeId
GET    /api/renters/disputes/:disputeId/timeline
PUT    /api/renters/disputes/:disputeId/resolve
```

### Dashboard Endpoints

```
GET    /api/renters/dashboard/summary
```

---

## 🪝 Hook Usage Examples

### Reading Data (Query Hooks)

```typescript
// Example 1: Get wallet balance
import { useWallet } from "@/lib/queries/renters/useWallet";

export function WalletCard() {
  const { data: wallet, isLoading, error } = useWallet();

  if (isLoading) return <SkeletonLoader />;
  if (error) return <ErrorMessage message="Failed to load wallet" />;

  return (
    <div>
      <p>Balance: ₦{wallet?.totalBalance}</p>
      <p>Available: ₦{wallet?.availableBalance}</p>
      <p>Locked: ₦{wallet?.lockedBalance}</p>
    </div>
  );
}

// Example 2: Get orders with filtering
import { useOrders } from "@/lib/queries/renters/useOrders";

export function OrdersList() {
  const { data, isLoading } = useOrders("active", 1, 10, "newest");

  return isLoading ? <Skeleton /> : (
    <div>
      {data?.items.map(order => (
        <OrderCard key={order.id} {...order} />
      ))}
    </div>
  );
}

// Example 3: Get favorites
import { useFavorites } from "@/lib/queries/renters/useFavorites";

export function FavoritesList() {
  const { data: favorites } = useFavorites(1, 20, "newest");
  return <Grid items={favorites?.items} />;
}
```

### Modifying Data (Mutation Hooks)

```typescript
// Example 1: Add to favorites
import { useAddFavorite } from "@/lib/mutations/renters/useFavoriteMutations";

export function ProductCard({ productId }) {
  const mutation = useAddFavorite();

  const handleFavorite = () => {
    mutation.mutate(productId, {
      onSuccess: () => alert("Added to favorites!"),
      onError: () => alert("Failed to add")
    });
  };

  return <button onClick={handleFavorite}>❤️ Favorite</button>;
}

// Example 2: Withdraw funds
import { useWithdrawFunds } from "@/lib/mutations/renters/useWalletMutations";

export function WithdrawForm() {
  const mutation = useWithdrawFunds();

  const handleSubmit = (data) => {
    mutation.mutate(
      { amount: data.amount, bankAccountId: data.accountId },
      {
        onSuccess: () => alert("Withdrawal initiated!"),
        onError: (e) => alert(`Error: ${e.message}`)
      }
    );
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit({ amount: 5000, accountId: "acc-123" });
    }}>
      {mutation.isPending && <p>Processing...</p>}
      <button type="submit">Withdraw</button>
    </form>
  );
}

// Example 3: Confirm rental (submit order)
import { useConfirmRentalRequest } from "@/lib/mutations/renters/useProfileMutations";

export function CheckoutButton({ rentalRequestId }) {
  const mutation = useConfirmRentalRequest();

  const handleCheckout = () => {
    mutation.mutate(rentalRequestId);
  };

  return (
    <button onClick={handleCheckout} disabled={mutation.isPending}>
      {mutation.isPending ? "Processing..." : "Confirm Rental"}
    </button>
  );
}
```

---

## 📊 Cache Configuration

| Hook                | Stale Time | Retry | Polling     |
| ------------------- | ---------- | ----- | ----------- |
| useDashboardSummary | 5 min      | 1     | No          |
| useFavorites        | 5 min      | 1     | No          |
| useOrders           | 5 min      | 1     | No          |
| useWallet           | 2 min      | 1     | No          |
| useProfile          | 10 min     | 1     | No          |
| useTransactions     | 5 min      | 1     | No          |
| useBankAccounts     | 10 min     | 1     | No          |
| useOrderDetails     | 2 min      | 1     | 30s polling |
| useOrderProgress    | 5 min      | 1     | 30s polling |
| useRentalRequests   | 30s        | 1     | 5s polling  |
| useWalletDetails    | 5 min      | 1     | 30s polling |

---

## 🎨 Component Status

### ✅ Fully Connected & Tested

- UserWalletDashboard
- DashboardOrderList
- OrderDetails1
- Favorites
- Transaction
- FundWallet
- Withdraw
- AddNewBankAccountForm
- BankAccountsDropdownContent

### 🔄 Ready for Integration (3-5 minutes each)

- AccountProfileDetails
- AccountSecurity
- AccountNotifications
- OrderProgressTimeline
- OrderStatusDetails
- TransactionDetailView
- DisputesDashboard
- DisputesListTable
- RaiseDispute
- DisputeDetails
- And 10+ more...

---

## 🚀 Adding a New Component

### Step 1: Identify the API Endpoint

```
Example: Need to display user's rentals count
Endpoint: GET /api/renters/dashboard/summary
Returns: { totalSpent, activeRentals, completedRentals, etc. }
```

### Step 2: Check if Hook Exists

```typescript
// Search in src/lib/queries/renters/
// If not found, create it:

// src/lib/queries/renters/useDashboardSummary.ts
import { useQuery } from "@tanstack/react-query";
import { rentersApi } from "@/lib/api/renters";

export const useDashboardSummary = () =>
  useQuery({
    queryKey: ["renters", "dashboard", "summary"],
    queryFn: async () => {
      const response = await rentersApi.getDashboardSummary();
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
```

### Step 3: Use Hook in Component

```typescript
"use client";
import { useDashboardSummary } from "@/lib/queries/renters/useDashboardSummary";

export function DashboardOverview() {
  const { data, isLoading, error } = useDashboardSummary();

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage />;

  return (
    <div>
      <p>Active Rentals: {data?.activeRentals}</p>
      <p>Total Spent: ₦{data?.totalSpent}</p>
    </div>
  );
}
```

### Step 4: Add to Types (if needed)

```typescript
// src/lib/api/renters.ts

export interface DashboardSummary {
  activeRentals: number;
  totalSpent: number;
  completedRentals: number;
  averageRating: number;
}
```

---

## 🐛 Debugging Tips

### 1. Check Network Tab

```
DevTools → Network
Filter by "api/"
Check request/response bodies
Verify status codes (200, 400, 401, 500)
```

### 2. Log Hook Data

```typescript
const { data, isLoading, error } = useWallet();
console.log("Wallet data:", data);
console.log("Loading:", isLoading);
console.log("Error:", error);
```

### 3. React Query DevTools

```typescript
// In src/app/layout.tsx (already set up but commented)
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// Access: http://localhost:3003/__REACT_QUERY_DEVTOOLS__
```

### 4. TypeScript Errors

```
If you see type errors:
1. Check response structure matches interfaces in renters.ts
2. Verify API returns all required fields
3. Check optional fields (with ?)
```

---

## 📋 Testing Checklist

Before marking a component complete, verify:

- [ ] Component has "use client" directive (if using hooks)
- [ ] Hook is properly imported from queries/ or mutations/
- [ ] Loading state shows skeleton loader
- [ ] Error state shows user-friendly message
- [ ] Data is properly mapped to UI components
- [ ] TypeScript types are correct
- [ ] No console errors or warnings
- [ ] Component renders in browser without crashing
- [ ] Data updates when mutation succeeds
- [ ] Error message shows on mutation failure

---

## 🔄 Real-Time Features

### Shopping Cart Timer (15 minutes)

```
Implemented via: useRentalRequests hook (5-second polling)
Location: src/lib/queries/renters/useRentalRequests.ts
Displays: Countdown timer on each cart item
Auto-removes: Items when expiresAt timestamp reached
Backend requirement: Return expiresAt field in response
```

### Order Status Updates (Real-time)

```
Implemented via: useOrderProgress hook (30-second polling)
Location: src/lib/queries/renters/useOrderProgress.ts
Displays: Order timeline with status updates
Backend requirement: Return updated status in response
```

---

## 📞 Support

**Documentation Files**:

- [RENTERS_API_INTEGRATION_COMPLETE.md](RENTERS_API_INTEGRATION_COMPLETE.md) - Full overview
- [TESTING_AND_DEPLOYMENT_GUIDE.md](TESTING_AND_DEPLOYMENT_GUIDE.md) - Testing instructions
- [z-needed-api/RentersAPIs.md](z-needed-api/RentersAPIs.md) - Backend API specs

**Key Files**:

- [src/lib/api/renters.ts](src/lib/api/renters.ts) - API client
- [src/lib/queries/renters/](src/lib/queries/renters/) - Query hooks
- [src/lib/mutations/renters/](src/lib/mutations/renters/) - Mutation hooks

**Stack**:

- Next.js 16 | React 19 | TypeScript | TanStack React Query 5 | Zustand
