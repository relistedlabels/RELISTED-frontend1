# RELISTED Shopping & Rental Flow - Implementation Guide

**Status:** Complete API Documentation
**Last Updated:** 2026-02-08
**Total Pages:** 2
**Total Endpoints:** 42 (37 Renters + 4 Public + 3 new Shopping/Rental endpoints)

---

## 📋 Table of Contents

1. [Flow Overview](#flow-overview)
2. [Component Architecture](#component-architecture)
3. [Authentication & Login Modal](#authentication--login-modal)
4. [Calendar & Date Selection](#calendar--date-selection)
5. [Cart & Timer System](#cart--timer-system)
6. [Processing State & Checkout](#processing-state--checkout)
7. [Insufficient Funds Handling](#insufficient-funds-handling)
8. [Auto-Pay Option](#auto-pay-option)
9. [API Integration Guide](#api-integration-guide)
10. [Error Handling](#error-handling)

---

## Flow Overview

### Complete User Journey

```
START
  ↓
[1] BROWSE PRODUCTS (Public, No Auth Required)
  • GET /api/public/products - Fetch all items with filters
  • Shop Page with category/brand/price filters
  • Product Grid with infinite scroll
  ↓
[2] VIEW PRODUCT DETAILS (Public, No Auth Required)
  • GET /api/public/products/:productId - Product info
  • GET /api/public/products/:productId/availability - Calendar dates
  • RentalDurationSelector shows calendar with available dates
  ↓
[3] AUTH CHECKPOINT - Select Dates
  • User selects start/end dates from calendar
  • User clicks "Check Availability" button
  • ✓ IF Authenticated → Continue to [4]
  • ✗ IF NOT Authenticated → Show login modal → Login → Continue to [4]
  ↓
[4] SUBMIT AVAILABILITY CHECK (Auth Required)
  • Renter chooses auto-pay option (toggle switch)
  • POST /api/renters/rental-requests - Send request to lister
  • ⚠️ IF Insufficient Balance → Show error modal → Redirect to Fund Wallet → Retry
  • ✓ IF Success → Item added to cart with 15-min timer
  ↓
[5] CART DISPLAY (Auth Required)
  • GET /api/renters/rental-requests - Display pending items
  • Each item shows:
    - Product image, name, lister, dates, price
    - 15-minute countdown timer
    - Trash icon to remove item
  • Cart total shows subtotal + delivery + cleaning fees
  • Auto-refresh every 5 seconds to update timers
  ↓
[6] PROCESSING STATE (Waiting for Lister)
  • GET /api/renters/rental-requests/:requestId - Poll status
  • Display "Request Processing..." with loader
  • NO Checkout button visible (commented out)
  • Status changes as lister approves/rejects
  ↓
[7a] IF LISTER ACCEPTS (Auto)
  • POST /api/renters/rental-requests/:requestId/confirm - Create order
  • Deduct payment from wallet
  • Item removed from cart (it's now an order)
  • Show order confirmation
  ↓
[7b] IF LISTER REJECTS (Auto)
  • DELETE /api/renters/rental-requests - Remove from cart
  • Show "Item no longer available" message
  ↓
[7c] IF 15-MINUTE TIMER EXPIRES (Auto)
  • DELETE /api/renters/rental-requests - Remove from cart
  • Show "Request expired" message
  ↓
[8] ORDER CREATED
  • GET /api/renters/orders - View active rentals
  • Item now in "Orders" section, not cart
  • Rental period begins on scheduled start date
END
```

---

## Component Architecture

### Shop Page Structure

**File:** `src/app/shop/page.tsx`

```
Shop Page
├── EndlessStyleHero (Hero banner)
└── NewListingsSection (Product grid with filters)
    ├── Filters Component (sidebar)
    │   ├── Gender filter (radio)
    │   ├── Category filter (checkbox)
    │   ├── Brand filter (checkbox)
    │   ├── Size filter (checkbox)
    │   └── PriceRangeSlider (custom range)
    └── Product Grid
        └── ProductCard × N (each with favorite heart icon)
```

**Endpoints Used:**

- `GET /api/public/products` - with query params for filters/search

---

### Product Details Page Structure

**File:** `src/app/shop/product-details/page.tsx`

```
Product Details Page
├── ProductMediaGallery (image carousel)
├── TitleProductCard (name, brand, rating, reviews)
├── RentalDetailsCard (pricing breakdown)
│   └── RentalPeriods (preset duration options)
├── ProductAccordion (expandable sections)
│   ├── ProductCareDetails
│   ├── DeliveryAndReturnDetails
│   ├── Specification
│   ├── SizeChartTable
│   ├── SizeGuide
│   └── Review (customer reviews)
└── TopListingSection (related products from same lister)
```

**Critical Components for Rental Flow:**

1. **RentalDurationSelector** - Date picker with calendar
2. **RentalCartSummary** - Cart display with timers
3. **RentalDetailsCard** - Pricing display
4. **RentalSummaryCard** - Total calculation

---

## Authentication & Login Modal

### Trigger Point

Click "Check Availability" button in RentalDurationSelector without being logged in.

### Implementation

```tsx
// RentalDurationSelector.tsx - "Check Availability" button handler
const handleCheckAvailability = async () => {
  // Check if user is authenticated
  const user = useUserStore((state) => state.user);

  if (!user) {
    // SHOW LOGIN MODAL
    showLoginModal(true); // Modal component handles this
    return;
  }

  // User is authenticated, proceed with availability check
  submitAvailabilityRequest();
};
```

### Login Modal Behavior

- **Trigger:** When non-authenticated renter clicks "Check Availability"
- **Type:** Modal dialog (not page redirect)
- **Components within modal:**
  - Sign in form
  - "Don't have account?" link to sign up
  - Close button
- **Post-login:** Modal closes, proceed with availability check automatically
- **Location:** `src/common/layer/` (likely in AuthActions or dedicated LoginModal component)

### API Used

- `POST /api/auth/sign-in` - User login (not explicitly listed but assumed)
- `POST /api/auth/sign-up` - User registration

---

## Calendar & Date Selection

### RentalDurationSelector Component Features

**Location:** `src/app/shop/product-details/components/RentalDurationSelector.tsx`

**Features:**

1. **Preset Duration Buttons:**
   - 3 Days: ₦150,000
   - 6 Days: ₦170,000
   - 9 Days: ₦200,000
   - Custom (select dates manually)

2. **Interactive Calendar:**
   - Navigate months with prev/next buttons
   - Days of week header (SUN, MON, TUE, etc.)
   - Clickable date cells
   - Highlighted selected dates (yellow background)
   - Grayed out unavailable dates
   - Hover effect on available dates

3. **Legend:**
   - Yellow square = Selected range
   - Gray square = Unavailable date

4. **Data Source:**
   - `GET /api/public/products/:productId/availability` provides:
     - `availableDates`: Array of ISO date strings
     - `unavailableDates`: Array of ISO date strings
     - `calendarData`: Detailed day info with availability status

### Implementation Check

```tsx
// Fetch available dates from API
const { data: availability } = await fetch(
  `/api/public/products/${productId}/availability`,
);

// availableDates: ["2026-02-10", "2026-02-11", ...]
// unavailableDates: ["2026-02-22", "2026-02-23", ...]

// Calendar filters dates based on these arrays
const isUnavailable = (day) => unavailableDates.includes(dateString);
const isSelectable = (day) => availableDates.includes(dateString);
```

---

## Cart & Timer System

### Cart Display (RentalCartSummary Component)

**Location:** `src/app/shop/product-details/components/RentalCartSummary.tsx`

**Cart Item Structure:**

```json
{
  "requestId": "req_001",
  "cartItemId": "cart_item_001",
  "productName": "FENDI ARCO BOOTS",
  "productImage": "https://cloudinary.com/fendi-boots.jpg",
  "listerName": "Betty Daniels",
  "rentalDays": 3,
  "rentalPrice": 165000,
  "deliveryFee": 2000,
  "cleaningFee": 5000,
  "totalPrice": 172000,
  "autoPay": true,
  "status": "pending_lister_approval",
  "expiresAt": "2026-02-08T14:45:00Z",
  "timeRemainingSeconds": 840, // 14 minutes
  "timeRemainingMinutes": 14
}
```

### 15-Minute Countdown Timer

**Behavior:**

1. Request created with `expiresAt` timestamp (15 min from now)
2. Frontend calculates `timeRemaining = expiresAt - currentTime`
3. Timer counts down in real-time (seconds decrease)
4. Display format: "14:30" (minutes:seconds)
5. Auto-refresh every 5 seconds via polling

**When Timer Reaches Zero:**

- Frontend automatically calls DELETE endpoint
- Item removed from cart
- Show message: "Request expired. Lister did not respond in time."

**Frontend Implementation:**

```tsx
// RentalCartSummary.tsx
const [cartItems, setCartItems] = useState([]);

useEffect(() => {
  // Initial fetch
  fetchCartItems();

  // Poll every 5 seconds
  const interval = setInterval(() => {
    fetchCartItems();

    // Check for expired items
    cartItems.forEach((item) => {
      if (item.timeRemainingSeconds <= 0) {
        removeExpiredItem(item.requestId);
      }
    });
  }, 5000);

  return () => clearInterval(interval);
}, []);

async function fetchCartItems() {
  const { data } = await fetch("/api/renters/rental-requests?status=pending");
  setCartItems(data.rentalRequests);
}

async function removeExpiredItem(requestId) {
  await fetch(`/api/renters/rental-requests/${requestId}`, {
    method: "DELETE",
  });
  // Update UI
}

// Render timer for each item
<div className="timer">
  {Math.floor(item.timeRemainingMinutes)}:
  {String(item.timeRemainingSeconds % 60).padStart(2, "0")}
</div>;
```

### Cart Actions

1. **Remove Item (Trash Icon):**

   ```
   DELETE /api/renters/rental-requests/:requestId
   → Item immediately removed from cart
   ```

2. **Monitor Status:**
   ```
   GET /api/renters/rental-requests/:requestId
   → Check if lister approved/rejected
   → Update processing state accordingly
   ```

---

## Processing State & Checkout

### UI State Flow

```
Initialization
  ↓
Waiting State (Processing...)
├─ Loading spinner/animation
├─ "Request Processing... Waiting for seller response"
├─ NO visible checkout button
├─ Shows cart total
└─ Items showing countdown timers
  ↓
Lister Responds
├─ If APPROVED → Order created (item removed from cart)
├─ If REJECTED → Remove from cart, show rejection
└─ If EXPIRED → Auto-remove from cart
  ↓
Processing Complete
```

### Implementation

```tsx
// RentalCartSummary.tsx - Processing state

const [requestStatus, setRequestStatus] = useState("pending_lister_approval");

// Show different UI based on status
if (requestStatus === "pending_lister_approval") {
  return (
    <div className="processing-state">
      <Spinner /> {/* Animated loader */}
      <p>Request Processing...</p>
      <p className="text-sm text-gray-500">Waiting for seller response...</p>
      {/* Cart items with timers */}
      <CartItemsList items={cartItems} />
      {/* NO CHECKOUT BUTTON - commented out or hidden */}
      {/* 
      <button className="invisible">Proceed to Checkout</button>
      */}
    </div>
  );
}

if (requestStatus === "approved") {
  return (
    <div className="order-confirmed">
      <CheckIcon />
      <p>Order Confirmed!</p>
      <p>Your rental order has been created.</p>
      <Link href="/renters/orders">View Orders</Link>
    </div>
  );
}

if (requestStatus === "rejected") {
  return (
    <div className="request-rejected">
      <AlertIcon />
      <p>Request Declined</p>
      <p>The seller is unable to fulfill this request.</p>
      <button onClick={() => continueShopping()}>Continue Shopping</button>
    </div>
  );
}
```

### Backend Processing

When lister approves and `autoPay=true`:

1. Backend calls `POST /api/renters/rental-requests/:requestId/confirm` automatically
2. Deducts payment from renter's wallet
3. Creates rental order
4. Sends notifications to both parties
5. Removes item from cart

---

## Insufficient Funds Handling

### Detection Point

When renter clicks "Check Availability" with insufficient wallet balance.

### Error Response from Backend

**Endpoint:** `POST /api/renters/rental-requests`

```json
{
  "success": false,
  "message": "Insufficient wallet balance",
  "error": "INSUFFICIENT_FUNDS",
  "data": {
    "requiredAmount": 165000,
    "availableBalance": 42000,
    "shortfall": 123000,
    "currency": "NGN"
  }
}
```

### Frontend Handling

```tsx
// RentalDurationSelector.tsx - "Check Availability" handler

async function handleCheckAvailability() {
  try {
    const response = await fetch("/api/renters/rental-requests", {
      method: "POST",
      body: JSON.stringify({
        productId,
        listerId,
        rentalStartDate,
        rentalEndDate,
        rentalDays,
        estimatedRentalPrice,
        deliveryAddressId,
        autoPay,
        currency,
      }),
    });

    if (!response.ok && response.status === 400) {
      const error = await response.json();

      if (error.error === "INSUFFICIENT_FUNDS") {
        showInsufficientFundsModal({
          required: error.data.requiredAmount,
          available: error.data.availableBalance,
          shortfall: error.data.shortfall,
        });
        return;
      }
    }

    // Success - item added to cart
    showCartSuccessMessage();
  } catch (error) {
    console.error("Error submitting rental request:", error);
  }
}
```

### Insufficient Funds Modal

**Content:**

```
❌ Insufficient Wallet Balance

Required Amount:     ₦165,000
Available Balance:   ₦42,000
───────────────────────────
Shortfall:           ₦123,000

⭐ To proceed with this rental, you need to add
   ₦123,000 to your wallet.

[Add Funds to Wallet]  [Cancel]
```

**Actions:**

- **Click "Add Funds to Wallet":**
  - Navigate to `/renters/wallet`
  - Wallet deposit form
  - After adding funds, user can retry rental request
- **Click "Cancel":**
  - Return to product details
  - User can select cheaper item or different dates

### Wallet Integration

**Endpoints for adding funds:**

```
POST /api/renters/wallet/deposit
Body: {
  "amount": 123000,
  "currency": "NGN",
  "paymentMethod": "bank_transfer",
  "bankAccountId": "bank_acc_123"
}

Response: {
  "status": "pending",
  "reference": "REF-2026-001",
  "amount": 123000
}
```

---

## Auto-Pay Option

### Location & Display

**Component:** `RentalDetailsCard.tsx`
**Near:** Rental duration buttons and pricing

### Toggle Switch

```tsx
// RentalDetailsCard.tsx

const [autoPay, setAutoPay] = useState(true); // Default: enabled

return (
  <div className="auto-pay-section">
    <label>Auto-pay option</label>
    <p className="text-sm text-gray-600">
      If enabled, payment will be automatically deducted from your wallet when
      the seller accepts your request.
    </p>
    <ToggleSwitch
      checked={autoPay}
      onChange={(checked) => setAutoPay(checked)}
    />
  </div>
);
```

### Behavior

**When `autoPay = true`:**

1. Renter submits availability check
2. Item added to cart with timer
3. Lister approves (via their admin interface)
4. ** Backend automatically** calls confirm endpoint
5. Payment deducted from wallet
6. Order created immediately
7. Item removed from cart, appears in Orders

**When `autoPay = false`:**

1. Renter submits availability check
2. Item added to cart with timer
3. Lister approves
4. **Renter must manually confirm** before payment
5. Frontend shows notification/prompt to confirm
6. Renter clicks confirm → backend deducts payment
7. Order created
8. Item removed from cart, appears in Orders

### API Integration

```tsx
// Submit availability check with autoPay value

const response = await fetch("/api/renters/rental-requests", {
  method: "POST",
  body: JSON.stringify({
    productId,
    listerId,
    rentalStartDate,
    rentalEndDate,
    rentalDays,
    estimatedRentalPrice,
    deliveryAddressId,
    autoPay: true, // or false
    currency: "NGN",
  }),
});

// Response includes autoPay status
const { data } = await response.json();
console.log(data.autoPay); // true/false
```

---

## API Integration Guide

### Key Endpoints Summary

| #   | Endpoint                                   | Method | Auth    | Purpose                                 |
| --- | ------------------------------------------ | ------ | ------- | --------------------------------------- |
| 1   | `/api/public/products`                     | GET    | No      | Browse products with filters            |
| 2   | `/api/public/products/:id`                 | GET    | No      | View product details                    |
| 3   | `/api/public/products/:id/availability`    | GET    | No      | Fetch available dates calendar          |
| 4   | `/api/renters/rental-requests`             | POST   | **Yes** | Submit availability check (add to cart) |
| 5   | `/api/renters/rental-requests`             | GET    | **Yes** | Fetch cart items with timers            |
| 6   | `/api/renters/rental-requests/:id`         | GET    | **Yes** | Monitor request status                  |
| 7   | `/api/renters/rental-requests/:id`         | DELETE | **Yes** | Remove item from cart                   |
| 8   | `/api/renters/rental-requests/:id/confirm` | POST   | **Yes** | Finalize order (manual confirmation)    |

### Request/Response Examples

#### 1. Get Product Availability

```bash
GET /api/public/products/prod_001/availability?startDate=2026-02-10&endDate=2026-04-30
```

**Response:**

```json
{
  "success": true,
  "data": {
    "availability": {
      "productId": "prod_001",
      "dailyPrice": 55000,
      "availableDates": ["2026-02-10", "2026-02-11", ...],
      "unavailableDates": ["2026-02-22", "2026-02-23", ...],
      "calendarData": [...]
    }
  }
}
```

#### 2. Submit Availability Check

```bash
POST /api/renters/rental-requests
Content-Type: application/json

{
  "productId": "prod_001",
  "listerId": "lister_456",
  "rentalStartDate": "2026-02-15T10:00:00Z",
  "rentalEndDate": "2026-02-18T10:00:00Z",
  "rentalDays": 3,
  "estimatedRentalPrice": 165000,
  "deliveryAddressId": "addr_001",
  "autoPay": true,
  "currency": "NGN"
}
```

**Response (Success):**

```json
{
  "success": true,
  "message": "Availability request submitted successfully",
  "data": {
    "requestId": "req_001",
    "cartItemId": "cart_item_001",
    "status": "pending_lister_approval",
    "expiresAt": "2026-02-08T14:45:00Z",
    "timerMinutes": 15
  }
}
```

**Response (Error - Insufficient Funds):**

```json
{
  "success": false,
  "message": "Insufficient wallet balance",
  "error": "INSUFFICIENT_FUNDS",
  "data": {
    "requiredAmount": 165000,
    "availableBalance": 42000,
    "shortfall": 123000,
    "currency": "NGN"
  }
}
```

#### 3. Fetch Cart Items

```bash
GET /api/renters/rental-requests?status=pending
```

**Response:**

```json
{
  "success": true,
  "data": {
    "rentalRequests": [
      {
        "requestId": "req_001",
        "productName": "FENDI ARCO BOOTS",
        "listerName": "Betty Daniels",
        "totalPrice": 172000,
        "status": "pending_lister_approval",
        "expiresAt": "2026-02-08T14:45:00Z",
        "timeRemainingSeconds": 840,
        "timeRemainingMinutes": 14
      }
    ],
    "cartSummary": {
      "totalItems": 1,
      "cartTotal": 172000,
      "currency": "NGN"
    }
  }
}
```

#### 4. Monitor Request Status

```bash
GET /api/renters/rental-requests/req_001
```

**Response:**

```json
{
  "success": true,
  "data": {
    "request": {
      "requestId": "req_001",
      "status": "pending_lister_approval",
      "listerResponse": null,
      "message": "Waiting for lister approval..."
    }
  }
}
```

#### 5. Finalize Order (After Lister Approves)

```bash
POST /api/renters/rental-requests/req_001/confirm
Content-Type: application/json

{
  "walletId": "wallet_renter_123",
  "confirmPayment": true
}
```

**Response:**

```json
{
  "success": true,
  "message": "Rental order created successfully",
  "data": {
    "orderId": "ORD-001",
    "totalAmount": 172000,
    "walletBalance": 50000
  }
}
```

---

## Error Handling

### Common Error Scenarios

#### Error 1: Not Authenticated

**When:** Click "Check Availability" without login
**Action:** Show login modal
**Endpoint:** None (client-side check)

```tsx
if (!user) {
  showLoginModal();
  return;
}
```

#### Error 2: Insufficient Wallet Balance

**When:** Submitted rental request exceeds wallet balance
**Status Code:** 400 Bad Request
**Error Code:** `INSUFFICIENT_FUNDS`
**Action:** Show modal with "Add Funds to Wallet" button

```json
{
  "success": false,
  "error": "INSUFFICIENT_FUNDS",
  "data": {
    "requiredAmount": 165000,
    "availableBalance": 42000,
    "shortfall": 123000
  }
}
```

#### Error 3: Product Unavailable

**When:** All dates unavailable for selected period
**Status Code:** 409 Conflict
**Error Code:** `ITEM_UNAVAILABLE_FOR_DATES`
**Action:** Show message, suggest alternate dates

```json
{
  "success": false,
  "message": "Product unavailable for selected dates",
  "error": "ITEM_UNAVAILABLE_FOR_DATES",
  "data": {
    "suggestedDates": ["2026-02-20", "2026-02-21", ...]
  }
}
```

#### Error 4: Request Expired (15 minutes)

**When:** User waits > 15 minutes without lister response
**Status Code:** 409 Conflict
**Error Code:** `REQUEST_EXPIRED`
**Action:** Auto-remove from cart, show message

```json
{
  "success": false,
  "message": "Your availability request has expired",
  "error": "REQUEST_EXPIRED"
}
```

#### Error 5: Lister Rejected

**When:** Lister declines availability request
**Status Code:** 200 OK (still successful, but with rejection status)
**Data:** Contains rejection reason
**Action:** Remove from cart, show rejection message

```json
{
  "success": true,
  "data": {
    "requestId": "req_001",
    "status": "rejected_by_lister",
    "rejectionReason": "Item already reserved",
    "message": "The lister is unable to fulfill your request"
  }
}
```

### Error Handling Flow Diagram

```
POST /api/renters/rental-requests
  ↓
┌─────────────────────────────────────────┐
│ Response Status Check                   │
└─────────────────────────────────────────┘
  ↓
┌──────────────────────────────────────────┐
│ 200 OK: Request submitted                │
│ → Add to cart, show item in cart          │
│ → Start polling GET /api/renters/rental- │
│   requests/:requestId for status updates  │
└──────────────────────────────────────────┘
  ↓
┌──────────────────────────────────────────┐
│ 400 Bad Request: Invalid data            │
│ Check error.error code:                  │
│ → INSUFFICIENT_FUNDS: Show wallet modal  │
│ → ITEM_UNAVAILABLE_FOR_DATES: Suggest    │
│   alternate dates                        │
│ → Other: Show generic error message      │
└──────────────────────────────────────────┘
  ↓
┌──────────────────────────────────────────┐
│ 401 Unauthorized: Not authenticated      │
│ → Redirect to login (shouldn't reach here │
│   due to client-side check)              │
└──────────────────────────────────────────┘
  ↓
┌──────────────────────────────────────────┐
│ 404 Not Found: Product or lister not     │
│ found                                    │
│ → Show error, suggest searching again    │
└──────────────────────────────────────────┘
  ↓
┌──────────────────────────────────────────┐
│ 409 Conflict: Item already requested or  │
│ other conflict                           │
│ → ITEM_UNAVAILABLE_FOR_DATES              │
│ → REQUEST_IN_PROGRESS                    │
│ → Show appropriate message               │
└──────────────────────────────────────────┘
```

---

## Implementation Checklist

### Phase 1: UI Components (Complete)

- [x] RentalDurationSelector with calendar
- [x] RentalCartSummary with timers
- [x] RentalDetailsCard with pricing
- [x] Login modal integration
- [x] Insufficient funds modal
- [x] Processing state UI (no checkout button)

### Phase 2: API Integration (In Progress)

- [ ] Fetch product availability dates
- [ ] Submit availability check request
- [ ] Fetch cart items with polling
- [ ] Monitor request status
- [ ] Remove expired items from cart
- [ ] Handle all error scenarios
- [ ] Wallet balance integration
- [ ] Auto-pay option handling

### Phase 3: Lister-Side (Backend)

- [ ] Receive availability requests
- [ ] Process approval/rejection
- [ ] Auto-call confirm endpoint if autoPay
- [ ] Handle 15-minute expiration timer
- [ ] Send notifications to renter

### Phase 4: Testing

- [ ] End-to-end flow testing
- [ ] Timer accuracy verification
- [ ] Error scenario testing
- [ ] Wallet integration testing
- [ ] Login modal flow testing

---

## Summary

This document provides complete guidance for implementing the RELISTED shopping and rental flow. Key points:

1. **Two-Phase Authentication:** Public browsing, then login at availability check
2. **15-Minute Cart Timer:** Items auto-expire if lister doesn't respond
3. **Insufficient Funds Protection:** Checked before request, prevents failed payments
4. **Processing State:** Shows loader instead of checkout button while waiting
5. **Auto-Pay Option:** Simplifies conversion when enabled; manual confirm when disabled
6. **Real-Time Updates:** Polling every 5 seconds for cart/status changes
7. **Comprehensive Error Handling:** 5+ error scenarios documented with responses

All 4 public endpoints and 5 renter rental-related endpoints are fully documented with request/response formats in PublicAPIs.md and RentersAPIs.md.
