# Renters API Integration - Testing & Deployment Guide

## Frontend Status: ✅ COMPLETE

All components are connected and ready. The frontend is waiting for backend API implementation.

---

## URLs to Test (Dev Server Running on Port 3003)

### 1. **Dashboard & Wallet**

- `http://localhost:3003/renters/wallet`
  - Displays: Total balance, Available balance, Locked balance
  - Shows: Skeleton loader while loading
  - Shows: "Failed to load wallet" if API fails
  - Buttons: Fund Wallet, Withdraw

- `http://localhost:3003/renters/account`
  - Displays: User profile info
  - Shows: Profile skeleton while loading

### 2. **Orders & Rentals**

- `http://localhost:3003/renters/orders`
  - Displays: List of active/completed orders
  - Features: Tab to switch between active/completed
  - Shows: Order cards with status, dates, prices
  - Action: Click to open order details

- `http://localhost:3003/renters/orders/[orderId]`
  - Displays: Detailed rental information
  - Shows: Progress timeline
  - Shows: Lister details
  - Shows: Return request button

### 3. **Favorites**

- `http://localhost:3003/renters/favorites`
  - Displays: All favorited items
  - Features: Search, sort, remove
  - Shows: Product grid with remove buttons

### 4. **Shopping**

- `http://localhost:3003/shop`
  - Displays: All products
  - Features: Search, filter, favorites
  - Shows: "Add to Favorites" buttons on product cards

---

## What's Connected (Frontend Ready)

### ✅ API Endpoints Integrated

**Dashboard**:

- [x] GET /api/renters/dashboard/summary → useDashboardSummary

**Wallet**:

- [x] GET /api/renters/wallet → useWallet
- [x] GET /api/renters/wallet/transactions → useTransactions
- [x] GET /api/renters/wallet/bank-accounts → useBankAccounts
- [x] GET /api/renters/wallet/locked-balances → useWalletDetails
- [x] GET /api/renters/wallet/withdraw/:id → useWithdrawalStatus
- [x] POST /api/renters/wallet/deposit → useDepositFunds
- [x] POST /api/renters/wallet/withdraw → useWithdrawFunds
- [x] POST /api/renters/wallet/bank-accounts → useAddBankAccount

**Orders**:

- [x] GET /api/renters/orders → useOrders
- [x] GET /api/renters/orders/:orderId → useOrderDetails
- [x] GET /api/renters/orders/:orderId/progress → useOrderProgress
- [x] POST /api/renters/orders/:orderId/return → useInitiateReturn

**Favorites**:

- [x] GET /api/renters/favorites → useFavorites
- [x] POST /api/renters/favorites/:itemId → useAddFavorite
- [x] DELETE /api/renters/favorites/:itemId → useRemoveFavorite

**Profile**:

- [x] GET /api/renters/profile → useProfile
- [x] PUT /api/renters/profile → useUpdateProfile

**Rental Requests** (Shopping Cart with 15-min timer):

- [x] GET /api/renters/rental-requests → useRentalRequests
- [x] POST /api/renters/rental-requests → useSubmitRentalRequest
- [x] DELETE /api/renters/rental-requests/:id → useRemoveRentalRequest
- [x] POST /api/renters/rental-requests/:id/confirm → useConfirmRentalRequest

**Disputes**:

- [x] GET /api/renters/disputes → useDisputes
- [x] POST /api/renters/disputes → useCreateDispute
- [x] GET /api/renters/disputes/:id → useDisputeDetails
- [x] More endpoints documented

---

## Testing Without Backend (Mock Data)

The application will show:

- **Loading states**: Skeleton loaders while "fetching"
- **Error states**: "Failed to load..." messages if API returns 500
- **Empty states**: "No data available" if API returns empty arrays

### To Test Now:

1. Navigate to: `http://localhost:3003/renters/wallet`
2. You'll see: Skeleton loaders (loading state)
3. After 2-3 seconds: "Failed to load wallet" (no backend error)
4. This is expected - confirms frontend is trying to call API

---

## Deployment Checklist

### Frontend (Already Done ✅)

- [x] All components connected to hooks
- [x] All hooks created with proper caching
- [x] All mutations created with invalidation
- [x] TypeScript strict mode passing
- [x] Build succeeding (exit code 0)
- [x] Dev server running (port 3003)
- [x] Routes protected with authentication

### Backend (Needed Before Production)

- [ ] Implement all 40+ endpoints (see RentersAPIs.md)
- [ ] Database models for:
  - Users/Renters
  - Orders/Rentals
  - Wallet/Balances
  - Transactions
  - Bank Accounts
  - Favorites
  - Disputes
- [ ] Authentication middleware (JWT)
- [ ] Authorization checks (renters only)
- [ ] Image upload handling
- [ ] Email notifications
- [ ] Webhook support for order status updates

### Environment Setup (Frontend)

```bash
# 1. Install dependencies
npm install

# 2. Set environment variables (.env.local)
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api

# 3. Start dev server
npm run dev

# 4. Build for production
npm run build
npm run start
```

---

## How to Connect Backend When Ready

### 1. Update Backend URL

In `.env.local`:

```
NEXT_PUBLIC_API_BASE_URL=https://your-backend-domain.com/api
```

### 2. Backend Response Format

All responses should match TypeScript types in `src/lib/api/renters.ts`:

**Example: GET /api/renters/wallet**

```json
{
  "success": true,
  "data": {
    "totalBalance": 50000,
    "availableBalance": 35000,
    "lockedBalance": 15000,
    "currency": "NGN"
  }
}
```

**Example: GET /api/renters/orders**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "order-123",
        "itemName": "Red Dress",
        "listerName": "Fashion Shop",
        "rentalStartDate": "2026-02-20",
        "rentalEndDate": "2026-02-27",
        "totalPrice": 5000,
        "status": "active"
      }
    ],
    "total": 1,
    "page": 1
  }
}
```

### 3. Required Response Headers

```
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
```

### 4. Error Handling

**400 Bad Request**:

```json
{
  "success": false,
  "error": "Invalid request parameters"
}
```

**401 Unauthorized** (Frontend auto-logout):

```json
{
  "success": false,
  "error": "Token expired or invalid",
  "code": 401
}
```

**500 Server Error**:

```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## Performance Metrics

### Current Settings

- **Dashboard**: 5-minute cache
- **Wallet**: 2-minute cache (frequent updates)
- **Orders**: 5-minute cache
- **Rental Requests**: 30-second cache (5-second polling)
- **Retries**: 1 automatic retry on failure

### Expected Performance

- **Page load**: < 2 seconds (with skeleton loaders)
- **Data fetch**: < 500ms (with 5-min cache)
- **Mutation**: < 1 second (user feedback immediate)

---

## Common Issues & Solutions

### Issue: "Failed to load wallet"

**Cause**: Backend not running or endpoint not implemented
**Solution**:

1. Check backend is running: `http://localhost:8000/api/renters/wallet`
2. Verify JWT token in headers
3. Check CORS configuration

### Issue: Loading spinner never stops

**Cause**: Query taking too long or hanging
**Solution**:

1. Check network tab in DevTools
2. Verify backend response format
3. Check TypeScript types match response

### Issue: "Type error" in console

**Cause**: Backend response doesn't match expected type
**Solution**:

1. Update TypeScript types in `src/lib/api/renters.ts`
2. Verify response structure matches
3. Check all required fields are included

### Issue: Data not updating when I change it

**Cause**: Query not being invalidated after mutation
**Solution**: Already handled - mutations automatically invalidate related queries

---

## Real-Time Features

### 15-Minute Shopping Cart Timer

**Implementation**: Every rental request item has a 15-minute countdown

- Backend: Returns `expiresAt` timestamp
- Frontend: Polls every 5 seconds via `useRentalRequests`
- Auto-removes: Items when expiration reached
- Display: Countdown timer on each cart item

**Endpoint**:

```
GET /api/renters/rental-requests
Response includes: expiresAt, itemId, status, quantity, etc.
```

### Order Status Updates

**Implementation**: Order progress updates in real-time

- Backend: Webhooks or status polling
- Frontend: Polls every 30 seconds via `useOrderProgress`
- Display: Timeline showing: Confirmed → Picked up → In Transit → Returned → Completed

**Endpoint**:

```
GET /api/renters/orders/:orderId/progress
Response includes: status, timeline[], lastUpdated, etc.
```

---

## TypeScript Types Reference

All types are in `src/lib/api/renters.ts` - key types:

```typescript
interface RentersDashboardSummary {
  totalSpent: number;
  activeRentals: number;
  completedRentals: number;
  averageRating: number;
}

interface FavoriteItem {
  id: string;
  itemName: string;
  brand: string;
  price: number;
  image: string;
  listerName: string;
}

interface RentalOrder {
  id: string;
  itemName: string;
  listerName: string;
  rentalStartDate: string;
  rentalEndDate: string;
  totalPrice: number;
  status: "active" | "pending" | "completed" | "cancelled";
}

interface WalletInfo {
  totalBalance: number;
  availableBalance: number;
  lockedBalance: number;
  currency: string;
  lastUpdated: string;
}

interface Transaction {
  id: string;
  type: "deposit" | "debit" | "refund" | "withdrawal";
  amount: number;
  date: string;
  status: "completed" | "pending" | "failed";
  description: string;
}

interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  isDefault: boolean;
  isVerified: boolean;
}

interface RentalRequest {
  id: string;
  itemId: string;
  itemName: string;
  rentalStartDate: string;
  rentalEndDate: string;
  duration: number;
  totalPrice: number;
  status: "pending" | "approved" | "rejected" | "expired";
  expiresAt: string;
}
```

---

## Production Deployment Steps

### 1. Build Application

```bash
npm run build
# Output: .next directory
```

### 2. Configure Environment

```
NEXT_PUBLIC_API_BASE_URL=https://api.relisted.com
NODE_ENV=production
```

### 3. Deploy to Hosting

- Vercel (recommended for Next.js)
- AWS Amplify
- Docker container
- Traditional VPS

### 4. Point Domain

Update DNS records to point to deployment

### 5. Verify in Production

- Test all renters routes
- Check API calls in Network tab
- Verify error handling
- Test with real backend

---

## Monitoring & Logs

### Frontend Logs (Console)

All API calls logged via `apiFetch` utility. Check browser DevTools:

1. F12 → Network tab
2. Filter by "api/"
3. Check request/response headers and bodies

### Query Debugging

Enable React Query DevTools (commented out in code):

```tsx
// In src/app/layout.tsx, uncomment:
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
```

Then access: `http://localhost:3003/__REACT_QUERY_DEVTOOLS__`

---

## Support & References

**Documentation**:

- Frontend: See [ARCHITECTURE.md](ARCHITECTURE.md)
- Backend: See [RentersAPIs.md](z-needed-api/RentersAPIs.md)
- Shopping Flow: See [ShoppingRentalFlow.md](z-needed-api/ShoppingRentalFlow.md)

**Stack Used**:

- Next.js 16 with App Router
- React 19
- TypeScript (strict mode)
- TanStack React Query 5
- Zustand for auth state
- Tailwind CSS 4
- Biome for linting/formatting

---

## Ready for Backend!

The frontend is **100% ready** for backend API integration. All components are waiting for real API responses. Once backend is implemented, no frontend changes will be needed - data will automatically flow through the connected hooks.

**Current Status**: ✅ All frontend infrastructure complete
**Next Step**: Backend implementation of 40+ endpoints
