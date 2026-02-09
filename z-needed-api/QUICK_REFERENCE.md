# Shopping & Rental Flow - Quick Reference Guide

## 🎯 5-Minute Overview

### The Flow in 30 Seconds

1. **User browses** products publicly (no login needed)
2. **Selects dates** from calendar on product detail page
3. **Clicks "Check Availability"** → Shows **login modal if not logged in**
4. **Submits request** → Item added to cart with **15-minute countdown timer**
5. **Waits in cart** → Shows "Request Processing..." (no checkout button)
6. **Lister approves** → Payment deducted, **order created**, item removed from cart
7. **Rental begins** → Item now in Orders section

### 3 Key Components

1. **RentalDurationSelector** - Calendar picker, submits `POST /api/renters/rental-requests`
2. **RentalCartSummary** - Shows pending items with countdown timers
3. **LoginModal** - Appears if user tries to check availability without login

---

## 🚀 Quick API Reference

### Public Browsing (No Auth)

```
GET /api/public/products
  └─ Browse all items with filters

GET /api/public/products/:productId
  └─ View product details

GET /api/public/products/:productId/availability
  └─ Fetch available calendar dates
```

### Rental Workflow (Auth Required)

```
POST /api/renters/rental-requests
  └─ Submit availability check (add to cart)
  └─ Returns: 15-minute countdown timer

GET /api/renters/rental-requests
  └─ Fetch cart items with timers
  └─ Refresh every 5 seconds

GET /api/renters/rental-requests/:requestId
  └─ Monitor request status (for polling)

DELETE /api/renters/rental-requests/:requestId
  └─ Remove item from cart

POST /api/renters/rental-requests/:requestId/confirm
  └─ Finalize order (payment deduction)
```

---

## ⏱️ Timer System

**Duration:** 15 minutes from request creation
**Refresh:** Every 5 seconds
**Auto-Remove:** When timer reaches 0:00
**Manual Remove:** Trash icon always available
**Format:** MM:SS (e.g., "14:30")

```
Request Created at 2:30 PM
  ↓
Timer: 14:59, 14:58, 14:57... 0:01, 0:00
  ↓
Auto-removed from cart → "Request expired" message
```

---

## 🔐 Authentication Checkpoint

**Trigger:** Click "Check Availability" without login
**Action:** Show login modal
**After Login:** Auto-continue with rental request
**No Page Redirect:** Modal only, smooth experience

---

## 💰 Insufficient Funds Flow

**Detection Point:** When submitting `POST /api/renters/rental-requests`
**What's Checked:** Available balance only (not locked balance)

**Deduction Breakdown:**

| Component        | Amount            | Example                         |
| ---------------- | ----------------- | ------------------------------- |
| Rental Fee       | Daily rate × days | ₦55,000/day × 3 days = ₦165,000 |
| Delivery Fee     | Fixed amount      | ₦2,000                          |
| Security Deposit | Item value        | ₦500,000                        |
| **TOTAL**        | Sum of above      | **₦667,000**                    |

**Error Response:**

```json
{
  "error": "INSUFFICIENT_FUNDS",
  "message": "Your current cart is above your wallet balance",
  "data": {
    "requiredAmount": 667000,
    "requiredBreakdown": {
      "rentalFee": 165000,
      "deliveryFee": 2000,
      "securityDeposit": 500000
    },
    "availableBalance": 500000,
    "shortfall": 167000
  }
}
```

**User Action:** "Add Funds to Wallet" → Deposit ₦167,000+ → Retry

---

## 🔒 Wallet Lock Mechanism (3-Day Hold)

**RENTER SIDE - What Gets Deducted:**

- ✅ Rental Fee (locked 3 days, then released if no disputes)
- ✅ Delivery Fee (released when item returned)
- ✅ Security Deposit (released when item confirmed good condition)

**LISTER SIDE - What Gets Locked:**

- ✅ Rental Fee locked in wallet for **3 days after renter receives item**
- ✅ After 3 days: If no disputes raised, fee becomes available for withdrawal
- ✅ If dispute raised: Fee stays locked until dispute resolved

**Timeline Example:**

```
Feb 8 @ 2:30 PM  - Renter confirms (₦165,000 rental fee locked in lister wallet)
Feb 8 @ 2:30 PM  - Renter wallet: ₦165,000 rental fee deducted
                 - Renter wallet: ₦2,000 delivery fee deducted
                 - Renter wallet: ₦500,000 security deposit deducted
Feb 8 @ 2:30 PM  - Lister sees rental fee locked (shows as "locked_3day_hold")
Feb 11 @ 2:30 PM - 3-day lock period expires
Feb 11 @ 2:30 PM - IF no disputes: ₦165,000 becomes available in lister wallet
                 - IF dispute raised: Fee stays locked until resolved
Feb 15 @ 2:30 PM - Item returned to lister
                 - ₦500,000 security deposit returned to renter (if item OK)
                 - ₦2,000 delivery fee returned to renter
```

**Key Points:**

- **Available Balance:** What the renter can spend right now (minus locked funds)
- **Locked Balance:** What's tied up in active rentals + disputes
- **Wallet Page:** Renter can see "Locked Balance" breakdown by order
- **Lister Wallet:** Shows locked rental fees + unlock dates

---

## 🎛️ Auto-Pay Option

**Default:** Enabled (toggle switch on product page)

**When Enabled (autoPay: true)**

- Lister approves → Auto-deduct payment → Order created
- Fast, seamless experience

**When Disabled (autoPay: false)**

- Lister approves → Show notification
- User must manually confirm → Then payment deducted
- More deliberate checkout

---

## 🔄 Processing State

**What Shows:**

- ✅ "Request Processing..." with loader
- ✅ Cart items with countdown timers
- ✅ Cart total
- ✅ Trash icons to remove items

**What Doesn't Show:**

- ❌ Checkout button (commented out)
- ❌ Payment form
- ❌ Shipping options

**Why?** Waiting for lister approval. No checkout until approved.

---

## 🛒 Cart Item Structure

```json
{
  "requestId": "req_001",
  "cartItemId": "cart_item_001",
  "productName": "FENDI ARCO BOOTS",
  "listerName": "Betty Daniels",
  "rentalDays": 3,
  "rentalPrice": 165000,
  "totalPrice": 172000,
  "status": "pending_lister_approval",
  "timeRemainingMinutes": 14,
  "autoPay": true
}
```

---

## ⚠️ Error Handl Scenarios

| Error                | Code                       | Action                  |
| -------------------- | -------------------------- | ----------------------- |
| Not logged in        | (client-side)              | Show login modal        |
| Insufficient balance | INSUFFICIENT_FUNDS         | Show wallet modal       |
| Dates unavailable    | ITEM_UNAVAILABLE_FOR_DATES | Suggest alternate dates |
| Request expired      | REQUEST_EXPIRED            | Auto-remove from cart   |
| Lister rejected      | rejected_by_lister         | Remove from cart        |

---

## 📞 Key Component Files

```
src/app/shop/
  ├── page.tsx (with endpoint comment)
  └── product-details/
      ├── page.tsx (with endpoint comment)
      └── components/
          ├── RentalDurationSelector.tsx ← DATE PICKER
          ├── RentalCartSummary.tsx ← CART WITH TIMERS
          ├── RentalDetailsCard.tsx
          └── ...others (no endpoints needed)
```

---

## 🔗 Related Endpoint Documents

- **Full Renter Endpoints:** [RentersAPIs.md](RentersAPIs.md) (42 endpoints)
- **Public Endpoints:** [PublicAPIs.md](PublicAPIs.md) (12 endpoints)
- **Implementation Guide:** [ShoppingRentalFlow.md](ShoppingRentalFlow.md) (detailed 2-page guide)

---

## 💡 Implementation Tips

### 1. Calendar Component

```tsx
// Fetch dates
const { data } = await fetch(`/api/public/products/${productId}/availability`);
const available = data.availability.availableDates;
const unavailable = data.availability.unavailableDates;

// Mark dates: available = clickable, unavailable = grayed out
```

### 2. Cart Polling

```tsx
useEffect(() => {
  const interval = setInterval(async () => {
    const { data } = await fetch("/api/renters/rental-requests");
    setCartItems(data.rentalRequests);
  }, 5000); // Every 5 seconds

  return () => clearInterval(interval);
}, []);
```

### 3. Timer Display

```tsx
// Update display every second for smooth countdown
const minutes = Math.floor(timeRemaining / 60);
const seconds = timeRemaining % 60;
return (
  <div>
    {minutes}:{String(seconds).padStart(2, "0")}
  </div>
);
```

### 4. Auto-Remove Expired Items

```tsx
cartItems.forEach((item) => {
  if (item.timeRemainingSeconds <= 0) {
    delete `/api/renters/rental-requests/${item.requestId}`;
  }
});
```

---

## 📊 Request/Response Examples

### Submit Availability Check

```bash
POST /api/renters/rental-requests
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
↓
{
  "success": true,
  "data": {
    "requestId": "req_001",
    "cartItemId": "cart_item_001",
    "expiresAt": "2026-02-08T14:45:00Z",
    "timerMinutes": 15
  }
}
```

### Fetch Cart Items

```bash
GET /api/renters/rental-requests?status=pending
↓
{
  "success": true,
  "data": {
    "rentalRequests": [
      {
        "requestId": "req_001",
        "productName": "FENDI ARCO BOOTS",
        "totalPrice": 172000,
        "timeRemainingSeconds": 840,
        "timeRemainingMinutes": 14
      }
    ],
    "cartSummary": {
      "cartTotal": 172000
    }
  }
}
```

---

## ✅ Checklist for Developers

- [ ] Read complete [ShoppingRentalFlow.md](ShoppingRentalFlow.md)
- [ ] Review [RentersAPIs.md](RentersAPIs.md) endpoints 38-42
- [ ] Review [PublicAPIs.md](PublicAPIs.md) endpoint 3
- [ ] Implement RentalDurationSelector calendar integration
- [ ] Implement RentalCartSummary with polling
- [ ] Add login modal trigger
- [ ] Add insufficient funds error handling
- [ ] Test 15-minute timer accuracy
- [ ] Test auto-remove on expiration
- [ ] Test lister approval flow
- [ ] Test auto-pay vs manual pay
- [ ] Mobile responsive testing

---

## 🎓 Key Learnings

1. **Two-phase approach:** Public browsing first, then authentication
2. **Real-time timers:** Use polling (5 sec intervals) for reliability
3. **Seamless UX:** Login modal instead of page redirect
4. **Smart validation:** Check funds before submission, not after
5. **Clear feedback:** "Processing" state prevents confusion during wait
6. **User control:** Both auto-pay and manual options available
7. **Auto-cleanup:** Backend handles 15-minute timers, frontend supplements

---

## 📞 Questions?

See the detailed guides:

- **API Details:** [RentersAPIs.md](RentersAPIs.md) / [PublicAPIs.md](PublicAPIs.md)
- **Implementation:** [ShoppingRentalFlow.md](ShoppingRentalFlow.md)
- **Component Files:** Endpoint comments in tsx files
