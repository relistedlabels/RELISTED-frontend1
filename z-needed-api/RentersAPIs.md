# Renters API Endpoints - RentersAPIs

**Status:** Awaiting Backend Implementation
**Last Updated:** 2026-02-08

## Overview

This document outlines all API endpoints that **Renters (Dressers - buyers)** need to access on the RELISTED platform. Renters use these APIs to browse fashion items, rent from listers, track their rentals, manage their wallet, and resolve disputes.

**Key Roles:** Renters (buyers who rent fashion items from listers)

---

## Renter Dashboard

### 1. GET /api/renters/dashboard/summary

**Location:** `src/app/renters/account/page.tsx` (Dashboard overview)

**UX Explanation:**
Renters need a quick overview of their rental activity and account status when they first access their dashboard. This endpoint provides:

- **Active Rentals**: Number of items currently rented out (items in rental period)
- **Pending Returns**: Items waiting to be returned
- **Wallet Balance**: Current balance available to spend
- **Total Spent**: Cumulative spending on all rentals (lifetime)
- **Favorite Items**: Number of items saved to favorites
- **Recent Orders**: Quick links to last 5 rentals

**Request Format:**

```json
GET /api/renters/dashboard/summary
```

**Query Parameters:**

- `timeframe` (optional): "week" | "month" | "year" - defaults to "month"

**Response Format:**

```json
{
  "success": true,
  "data": {
    "dashboard": {
      "activeRentals": {
        "count": 3,
        "items": [
          {
            "orderId": "ORD-001",
            "itemName": "Vintage Gucci Handbag",
            "listerName": "Vintage Chic",
            "rentalStartDate": "2026-01-20T10:00:00Z",
            "rentalEndDate": "2026-02-15T10:00:00Z",
            "daysRemaining": 7,
            "status": "active"
          }
        ]
      },
      "pendingReturns": {
        "count": 1,
        "dueDate": "2026-02-10T10:00:00Z"
      },
      "walletBalance": {
        "amount": 50000,
        "currency": "NGN"
      },
      "totalSpent": {
        "amount": 250000,
        "currency": "NGN"
      },
      "favoriteItems": 12,
      "recentOrders": 5
    }
  }
}
```

**Status Codes:**

- `200 OK` - Dashboard summary retrieved successfully
- `401 Unauthorized` - User not authenticated

---

### 2. GET /api/renters/favorites

**Location:** `src/app/renters/components/Favorites.tsx` & `src/app/renters/favorites/page.tsx`

**UX Explanation:**
Retrieve list of all items the renter has marked as favorite. Users can save items they like for later browsing. The Favorites page displays all saved items with options to:

- View item details
- Remove from favorites
- Rent the item
- Share the item

Displayed with product images, lister info, pricing, and condition.

**Request Format:**

```json
GET /api/renters/favorites?page=1&limit=20&sort=newest
```

**Query Parameters:**

- `page` (optional): Page number, default 1
- `limit` (optional): Items per page, default 20
- `sort` (optional): "newest" | "oldest" | "price_low" | "price_high" - default "newest"

**Response Format:**

```json
{
  "success": true,
  "data": {
    "favorites": [
      {
        "favoriteId": "fav_001",
        "itemId": "item_123",
        "itemName": "Vintage Gucci Handbag",
        "listerName": "Vintage Chic Curations",
        "listerId": "lister_456",
        "itemImage": "https://cloudinary.com/item-123.jpg",
        "rentalPrice": 8500,
        "currency": "NGN",
        "condition": "Excellent",
        "rating": 4.8,
        "addedToFavoritesDate": "2026-01-15T10:00:00Z",
        "isInStock": true
      },
      {
        "favoriteId": "fav_002",
        "itemId": "item_124",
        "itemName": "Givenchy Designer Shoes",
        "listerName": "Luxury Rentals",
        "listerId": "lister_789",
        "itemImage": "https://cloudinary.com/item-124.jpg",
        "rentalPrice": 5000,
        "currency": "NGN",
        "condition": "Good",
        "rating": 4.5,
        "addedToFavoritesDate": "2026-01-10T10:00:00Z",
        "isInStock": true
      }
    ],
    "totalFavorites": 24,
    "page": 1,
    "totalPages": 2
  }
}
```

**Status Codes:**

- `200 OK` - Favorites retrieved successfully
- `401 Unauthorized` - User not authenticated

---

### 3. POST /api/renters/favorites/:itemId

**Location:** `src/app/shop/components/ProductCard.tsx` & `src/app/shop/product-details/page.tsx` (Add to Favorites button)

**UX Explanation:**
Add an item to the renter's favorites list. Users can click a heart icon on any product card or product details page to save it for later. This endpoint adds the item to their personal favorites list.

**Request Format:**

```json
POST /api/renters/favorites/:itemId
```

**URL Parameters:**

- `:itemId` - ID of the item to favorite

**Response Format:**

```json
{
  "success": true,
  "message": "Item added to favorites",
  "data": {
    "favoriteId": "fav_001",
    "itemId": "item_123",
    "itemName": "Vintage Gucci Handbag",
    "addedAt": "2026-02-08T14:30:00Z"
  }
}
```

**Status Codes:**

- `201 Created` - Item added to favorites successfully
- `400 Bad Request` - Item already in favorites
- `401 Unauthorized` - User not authenticated
- `404 Not Found` - Item not found

---

### 4. DELETE /api/renters/favorites/:itemId

**Location:** `src/app/renters/components/Favorites.tsx` (Remove from Favorites button) & Product cards (heart icon toggle)

**UX Explanation:**
Remove an item from the renter's favorites list. Users can click the heart icon again or use a "Remove from Favorites" button to unfavorite an item.

**Request Format:**

```json
DELETE /api/renters/favorites/:itemId
```

**URL Parameters:**

- `:itemId` - ID of the item to remove from favorites

**Response Format:**

```json
{
  "success": true,
  "message": "Item removed from favorites",
  "data": {
    "itemId": "item_123",
    "remainingFavorites": 23
  }
}
```

**Status Codes:**

- `200 OK` - Item removed from favorites successfully
- `404 Not Found` - Favorite item not found
- `401 Unauthorized` - User not authenticated

---

## Renter Order Management (Rentals)

### 5. GET /api/renters/orders

**Location:** `src/app/renters/components/DashboardOrderList.tsx` & `src/app/renters/orders/page.tsx`

**UX Explanation:**
Retrieve all rental orders for the renter. The Orders page displays a list of all current and past rentals with ability to:

- Filter by status (Active, Completed, Returned, Cancelled)
- Search by item name or lister
- Sort by date
- View rental timeline

Each order shows:

- Item image and name
- Lister info
- Rental dates
- Current status
- Rental price
- Return date countdown (if active)

**Request Format:**

```json
GET /api/renters/orders?status=active&page=1&limit=10&sort=newest
```

**Query Parameters:**

- `status` (optional): "active" | "completed" | "returned" | "cancelled" - default all
- `page` (optional): Page number, default 1
- `limit` (optional): Orders per page, default 10
- `sort` (optional): "newest" | "oldest" | "ending_soon" - default "newest"

**Response Format:**

```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "orderId": "ORD-001",
        "itemId": "item_123",
        "itemName": "Vintage Gucci Handbag",
        "itemImage": "https://cloudinary.com/item-123.jpg",
        "listerName": "Vintage Chic Curations",
        "listerId": "lister_456",
        "rentalStartDate": "2026-01-20T10:00:00Z",
        "rentalEndDate": "2026-02-15T10:00:00Z",
        "rentalPrice": 8500,
        "currency": "NGN",
        "status": "active",
        "daysRemaining": 7,
        "deliveryDate": "2026-01-22T14:00:00Z",
        "returnTrackingId": "TRK-2026-001",
        "condition": "Good"
      }
    ],
    "totalOrders": 15,
    "page": 1,
    "totalPages": 2
  }
}
```

**Status Codes:**

- `200 OK` - Orders retrieved successfully
- `401 Unauthorized` - User not authenticated

---

### 6. GET /api/renters/orders/:orderId

**Location:** `src/app/renters/components/OrderDetails1.tsx` (Order details modal/page)

**UX Explanation:**
Retrieve detailed information about a specific rental order. Displayed when user clicks on an order or views "Order Details". Shows:

- Item details and images
- Lister profile and rating
- Rental timeline (start, delivery, return dates)
- Tracking information
- Order status and history
- Damage assessment form (if applicable)
- Return instructions
- Dispute option (if applicable)

**Request Format:**

```json
GET /api/renters/orders/:orderId
```

**URL Parameters:**

- `:orderId` - ID of the order to retrieve

**Response Format:**

```json
{
  "success": true,
  "data": {
    "order": {
      "orderId": "ORD-001",
      "itemId": "item_123",
      "itemName": "Vintage Gucci Handbag",
      "itemImages": [
        "https://cloudinary.com/item-1.jpg",
        "https://cloudinary.com/item-2.jpg"
      ],
      "itemDescription": "Authentic vintage Gucci handbag in excellent condition",
      "condition": "Good",
      "listerProfile": {
        "listerId": "lister_456",
        "name": "Vintage Chic Curations",
        "avatar": "https://cloudinary.com/lister-456.jpg",
        "rating": 4.8,
        "totalRentals": 156
      },
      "rentalTimeline": {
        "orderDate": "2026-01-15T10:00:00Z",
        "rentalStartDate": "2026-01-20T10:00:00Z",
        "deliveryDate": "2026-01-22T14:00:00Z",
        "rentalEndDate": "2026-02-15T10:00:00Z",
        "returnDueDate": "2026-02-17T10:00:00Z",
        "returnedDate": null
      },
      "pricing": {
        "rentalPrice": 8500,
        "deliveryFee": 2000,
        "serviceFee": 1500,
        "totalAmount": 12000,
        "currency": "NGN"
      },
      "status": "active",
      "deliveryTracking": {
        "trackingId": "TRK-2026-001",
        "carrier": "GIG Logistics",
        "currentLocation": "In Transit",
        "estimatedDelivery": "2026-01-22T14:00:00Z"
      },
      "returnTracking": null,
      "itemImages": ["https://cloudinary.com/item-123.jpg"],
      "damageAssessment": null,
      "canRaiseDis dispute": true,
      "canReturn": false
    }
  }
}
```

**Status Codes:**

- `200 OK` - Order details retrieved successfully
- `401 Unauthorized` - User not authenticated
- `404 Not Found` - Order not found

---

### 7. GET /api/renters/orders/:orderId/progress

**Location:** `src/app/renters/components/OrderProgressTimeline.tsx` (Order progress timeline)

**UX Explanation:**
Retrieve the detailed timeline of a rental order showing all key milestones. Displayed as a vertical timeline showing:

- Order placed (✓ completed)
- Payment processed (✓ completed)
- Item packaging (✓ completed)
- In transit (current status)
- Delivered (upcoming)
- Rental period active (upcoming)
- Return collected (upcoming)
- Completed (upcoming)

Each milestone shows exact timestamp and status.

**Request Format:**

```json
GET /api/renters/orders/:orderId/progress
```

**URL Parameters:**

- `:orderId` - ID of the order

**Response Format:**

```json
{
  "success": true,
  "data": {
    "timeline": [
      {
        "milestone": "order_placed",
        "label": "Order Placed",
        "timestamp": "2026-01-15T10:00:00Z",
        "status": "completed",
        "description": "Your rental order has been confirmed"
      },
      {
        "milestone": "payment_processed",
        "label": "Payment Processed",
        "timestamp": "2026-01-15T10:15:00Z",
        "status": "completed",
        "description": "Payment of ₦12,000 received"
      },
      {
        "milestone": "item_packaged",
        "label": "Item Packaged",
        "timestamp": "2026-01-16T09:00:00Z",
        "status": "completed",
        "description": "Lister has packaged your item"
      },
      {
        "milestone": "in_transit",
        "label": "In Transit",
        "timestamp": "2026-01-20T08:00:00Z",
        "status": "current",
        "description": "Your item is on the way",
        "trackingId": "TRK-2026-001"
      },
      {
        "milestone": "delivered",
        "label": "Delivered",
        "timestamp": null,
        "status": "pending",
        "estimatedDate": "2026-01-22T14:00:00Z",
        "description": "Item will be delivered to you"
      },
      {
        "milestone": "rental_active",
        "label": "Rental Period Active",
        "timestamp": null,
        "status": "pending",
        "estimatedDate": "2026-01-22T14:00:00Z",
        "description": "You can wear and enjoy the item"
      },
      {
        "milestone": "return_collected",
        "label": "Return Collected",
        "timestamp": null,
        "status": "pending",
        "estimatedDate": "2026-02-17T10:00:00Z",
        "description": "Lister will collect the item"
      },
      {
        "milestone": "completed",
        "label": "Rental Completed",
        "timestamp": null,
        "status": "pending",
        "estimatedDate": "2026-02-20T10:00:00Z",
        "description": "Rental period ends"
      }
    ],
    "currentMilestone": "in_transit",
    "percentComplete": 50
  }
}
```

**Status Codes:**

- `200 OK` - Order progress retrieved successfully
- `401 Unauthorized` - User not authenticated
- `404 Not Found` - Order not found

---

### 8. POST /api/renters/orders/:orderId/return

**Location:** `src/app/renters/components/OrderDetails1.tsx` (Return item button/form)

**UX Explanation:**
Initiate item return after rental period ends. Renter can schedule return pickup or use dropoff locations. This endpoint:

- Marks return as initiated
- Generates return tracking number
- Sends return shipping label (if applicable)
- Notifies lister of return
- Starts return timeline

**Request Format:**

```json
POST /api/renters/orders/:orderId/return
Content-Type: application/json

{
  "returnMethod": "pickup",
  "returnDate": "2026-02-17T10:00:00Z",
  "itemCondition": "good",
  "damageNotes": "Minor wear on handle, fully functional"
}
```

**Response Format:**

```json
{
  "success": true,
  "message": "Return initiated successfully",
  "data": {
    "orderId": "ORD-001",
    "returnTrackingId": "RTN-2026-001",
    "returnMethod": "pickup",
    "returnDate": "2026-02-17T10:00:00Z",
    "returnDeadline": "2026-02-20T10:00:00Z",
    "pickupInfo": {
      "address": "123 Fashion Lane, Lagos",
      "phone": "+234 907 123 4567",
      "instructions": "Please have item ready for pickup"
    },
    "returnShippingLabel": "https://cloudinary.com/return-label-001.pdf",
    "status": "return_initiated",
    "initiatedAt": "2026-02-08T14:30:00Z"
  }
}
```

**Status Codes:**

- `201 Created` - Return initiated successfully
- `400 Bad Request` - Invalid return method or date
- `401 Unauthorized` - User not authenticated
- `404 Not Found` - Order not found
- `409 Conflict` - Cannot return item at this time (rental still active)

---

## Renter Wallet Management

### 9. GET /api/renters/wallet

**Location:** `src/app/renters/components/UserWalletDashboard.tsx` & `src/app/renters/wallet/page.tsx`

**UX Explanation:**
Retrieve renter's wallet balance and basic wallet info. The Wallet page displays:

- **Available Balance**: Amount available to spend on new rentals (not locked in active rentals)
- **Locked Balance**: Money deducted from active rentals (rental fee + delivery fee + security deposits)
- **Total Balance**: Available + Locked (complete wallet balance)
- **Breakdown of Locked Funds**: By rental order and dispute holds
- **Total Deposits**: Sum of all funds added to wallet
- **Total Spent**: Cumulative amount spent on completed rentals
- **Transaction History**: Recent deposits and deductions
- **Quick Actions**: Fund Wallet, Withdraw Money buttons

**Important:** Cart validation checks **available balance** only, not total balance. When a renter attempts to create a rental request, the system verifies:

- Rental fee + Delivery fee + Security deposit ≤ Available balance

**Request Format:**

```json
GET /api/renters/wallet
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "wallet": {
      "walletId": "wallet_renter_123",
      "userId": "user_456",
      "balance": {
        "availableBalance": 50000,
        "lockedBalance": 667000,
        "totalBalance": 717000,
        "currency": "NGN",
        "lastUpdated": "2026-02-08T14:30:00Z"
      },
      "lockedBreakdown": {
        "activeRentals": [
          {
            "orderId": "ORD-001",
            "itemName": "Vintage Gucci Handbag",
            "rentalFeeLockedAmount": 165000,
            "deliveryFeeLockedAmount": 2000,
            "securityDepositLockedAmount": 500000,
            "totalLockedAmount": 667000,
            "lockExpiryDate": "2026-02-18T10:00:00Z",
            "status": "locked_in_active_rental"
          }
        ],
        "disputeHolds": [
          {
            "orderId": "ORD-002",
            "reason": "Item condition dispute",
            "heldAmount": 150000,
            "disputeStartDate": "2026-02-05T10:00:00Z",
            "expectedResolutionDate": "2026-02-12T10:00:00Z"
          }
        ],
        "totalLockedAmount": 667000
      },
      "statistics": {
        "totalDeposits": 200000,
        "totalSpent": 150000,
        "totalRefunds": 12000,
        "lifetimeTransactions": 25,
        "activeRentalOrders": 1,
        "activeDisputes": 1
      },
      "lastTransaction": {
        "type": "debit",
        "amount": 667000,
        "description": "Rental deduction for ORD-001 (Rental fee ₦165,000 + Delivery ₦2,000 + Security Deposit ₦500,000)",
        "date": "2026-02-08T14:30:00Z"
      },
      "linkedBankAccounts": 1,
      "canWithdraw": true,
      "minimumFundsForTransaction": 10000
    }
  }
}
```

**Key Differences - Available vs Locked Balance:**

| Type                 | When Locked         | When Released                                        | Example                              |
| -------------------- | ------------------- | ---------------------------------------------------- | ------------------------------------ |
| **Rental Fee**       | At order creation   | 3 days after renter receives item (if no disputes)   | ₦165,000 locked for 3 days           |
| **Delivery Fee**     | At order creation   | When lister receives return                          | ₦2,000 locked during rental period   |
| **Security Deposit** | At order creation   | When lister confirms item received in good condition | ₦500,000 locked, refunded if item OK |
| **Disputed Amount**  | When dispute raised | When dispute is resolved                             | Amount varies by case                |

**Status Codes:**

- `200 OK` - Wallet information retrieved successfully
- `401 Unauthorized` - User not authenticated

---

### 10. GET /api/renters/wallet/transactions

**Location:** `src/app/renters/components/Transaction.tsx` & `src/app/renters/wallet/page.tsx` (Transaction history)

**UX Explanation:**
Retrieve detailed transaction history for the renter's wallet. Displayed as a list showing:

- Transaction date and time
- Type (Deposit, Rental Charge, Refund, Withdrawal)
- Amount
- Transaction ID
- Status (Completed, Pending, Failed)
- Related order or action
- Filter and search options

**Request Format:**

```json
GET /api/renters/wallet/transactions?page=1&limit=20&type=all&status=all&sort=newest
```

**Query Parameters:**

- `page` (optional): Page number, default 1
- `limit` (optional): Transactions per page, default 20
- `type` (optional): "deposit" | "debit" | "refund" | "withdrawal" | "all" - default "all"
- `status` (optional): "completed" | "pending" | "failed" | "all" - default "all"
- `sort` (optional): "newest" | "oldest" - default "newest"
- `startDate` (optional): ISO date string for date range
- `endDate` (optional): ISO date string for date range

**Response Format:**

```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "transactionId": "txn_001",
        "type": "debit",
        "amount": 12000,
        "currency": "NGN",
        "description": "Rental charge for Vintage Gucci Handbag",
        "orderId": "ORD-001",
        "status": "completed",
        "timestamp": "2026-01-15T10:00:00Z",
        "relatedOrder": {
          "orderId": "ORD-001",
          "itemName": "Vintage Gucci Handbag",
          "listerName": "Vintage Chic"
        }
      },
      {
        "transactionId": "txn_002",
        "type": "deposit",
        "amount": 50000,
        "currency": "NGN",
        "description": "Wallet top-up",
        "status": "completed",
        "timestamp": "2026-01-10T14:30:00Z",
        "method": "bank_transfer",
        "bankReference": "BANK-REF-12345"
      },
      {
        "transactionId": "txn_003",
        "type": "refund",
        "amount": 8500,
        "currency": "NGN",
        "description": "Refund for cancelled order ORD-002",
        "orderId": "ORD-002",
        "status": "completed",
        "timestamp": "2026-01-08T09:00:00Z"
      }
    ],
    "totalTransactions": 45,
    "page": 1,
    "totalPages": 3
  }
}
```

**Status Codes:**

- `200 OK` - Transactions retrieved successfully
- `401 Unauthorized` - User not authenticated

---

### 11. POST /api/renters/wallet/deposit

**Location:** `src/app/renters/components/FundWallet.tsx` (Fund Wallet form)

**UX Explanation:**
Add funds to the renter's wallet via bank transfer, card, or other payment methods. The Fund Wallet modal/page allows users to:

- Select amount to deposit
- Choose payment method
- Enter or select bank account
- Complete payment
- See transaction confirmation

**Request Format:**

```json
POST /api/renters/wallet/deposit
Content-Type: application/json

{
  "amount": 50000,
  "currency": "NGN",
  "paymentMethod": "bank_transfer",
  "bankAccountId": "bank_acc_123"
}
```

**Response Format:**

```json
{
  "success": true,
  "message": "Deposit initiated successfully",
  "data": {
    "transactionId": "txn_004",
    "amount": 50000,
    "currency": "NGN",
    "status": "pending",
    "paymentDetails": {
      "method": "bank_transfer",
      "bankName": "First Bank Nigeria",
      "accountNumber": "2002XXXXXXX",
      "bankCode": "011",
      "accountName": "RELISTED LIMITED"
    },
    "amountToPay": 50000,
    "reference": "REF-2026-001",
    "expiryTime": "2026-02-08T16:00:00Z",
    "initiatedAt": "2026-02-08T14:30:00Z"
  }
}
```

**Status Codes:**

- `201 Created` - Deposit initiated successfully
- `400 Bad Request` - Invalid amount or payment method
- `401 Unauthorized` - User not authenticated

---

### 12. GET /api/renters/wallet/bank-accounts

**Location:** `src/app/renters/components/BankAccountsDropdownContent.tsx` (Bank account selection)

**UX Explanation:**
Retrieve list of bank accounts linked to the renter's wallet. Used when:

- Depositing funds (select source account)
- Withdrawing funds (select destination account)
- Updating account information

Shows:

- Bank name and account type
- Masked account number (last 4 digits visible)
- Account holder name
- Verification status

**Request Format:**

```json
GET /api/renters/wallet/bank-accounts
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "bankAccounts": [
      {
        "accountId": "bank_acc_123",
        "bankName": "First Bank Nigeria",
        "bankCode": "011",
        "accountNumber": "XXXX2345",
        "accountName": "Chioma Okafor",
        "accountType": "Savings",
        "verificationStatus": "verified",
        "verifiedDate": "2025-08-10T09:00:00Z",
        "isDefault": true
      },
      {
        "accountId": "bank_acc_124",
        "bankName": "Access Bank",
        "bankCode": "044",
        "accountNumber": "XXXX6789",
        "accountName": "Chioma Okafor",
        "accountType": "Current",
        "verificationStatus": "verified",
        "verifiedDate": "2025-09-15T10:00:00Z",
        "isDefault": false
      }
    ],
    "totalAccounts": 2
  }
}
```

**Status Codes:**

- `200 OK` - Bank accounts retrieved successfully
- `401 Unauthorized` - User not authenticated

---

### 13. POST /api/renters/wallet/bank-accounts

**Location:** `src/app/renters/components/AddNewBankAccountForm.tsx` (Add bank account form)

**UX Explanation:**
Link a new bank account to the renter's wallet. Used for deposits and withdrawals. The form collects:

- Bank name/code
- Account number
- Account holder name
- Account type

Account verification happens automatically via BVN or account matching.

**Request Format:**

```json
POST /api/renters/wallet/bank-accounts
Content-Type: application/json

{
  "bankCode": "057",
  "accountNumber": "1234567890",
  "accountName": "Chioma Okafor"
}
```

**Response Format:**

```json
{
  "success": true,
  "message": "Bank account added successfully",
  "data": {
    "accountId": "bank_acc_125",
    "bankName": "GTB",
    "bankCode": "057",
    "accountNumber": "XXXX7890",
    "accountName": "Chioma Okafor",
    "accountType": "Savings",
    "verificationStatus": "pending",
    "verificationMessage": "Account will be verified within 24 hours",
    "addedAt": "2026-02-08T14:30:00Z"
  }
}
```

**Status Codes:**

- `201 Created` - Bank account added successfully
- `400 Bad Request` - Invalid account details
- `401 Unauthorized` - User not authenticated
- `409 Conflict` - Account already linked

---

### 14. GET /api/banks

**Location:** `src/app/renters/components/AddNewBankAccountForm.tsx` (Bank dropdown selection)

**UX Explanation:**
Get list of all supported Nigerian banks for account linking. Used to populate a dropdown when adding bank accounts.

**Request Format:**

```json
GET /api/banks
```

**Query Parameters:**

- `country` (optional): Country code, default "NG" for Nigeria

**Response Format:**

```json
{
  "success": true,
  "data": {
    "banks": [
      {
        "bankCode": "011",
        "bankName": "First Bank Nigeria",
        "logo": "https://cloudinary.com/firstbank-logo.jpg"
      },
      {
        "bankCode": "044",
        "bankName": "Access Bank",
        "logo": "https://cloudinary.com/accessbank-logo.jpg"
      },
      {
        "bankCode": "057",
        "bankName": "GTB",
        "logo": "https://cloudinary.com/gtb-logo.jpg"
      },
      {
        "bankCode": "058",
        "bankName": "Guaranty Trust Bank",
        "logo": "https://cloudinary.com/gtbank-logo.jpg"
      }
    ],
    "total": 25,
    "country": "NG"
  }
}
```

**Status Codes:**

- `200 OK` - Banks list retrieved successfully

---

### 15. POST /api/renters/wallet/withdraw

**Location:** `src/app/renters/components/UserWalletWithdraw.tsx` & `src/app/renters/components/Withdraw.tsx` (Withdrawal form)

**UX Explanation:**
Withdraw funds from renter's wallet to their linked bank account. The withdrawal form allows:

- Select amount (min/max limits)
- Choose destination bank account
- Review withdrawal fee (if applicable)
- Confirm withdrawal
- Get reference number

Withdrawals are processed within 24-48 hours.

**Request Format:**

```json
POST /api/renters/wallet/withdraw
Content-Type: application/json

{
  "amount": 30000,
  "currency": "NGN",
  "bankAccountId": "bank_acc_123"
}
```

**Response Format:**

```json
{
  "success": true,
  "message": "Withdrawal initiated successfully",
  "data": {
    "withdrawalId": "wtd_001",
    "amount": 30000,
    "currency": "NGN",
    "bankAccount": {
      "bankName": "First Bank Nigeria",
      "accountNumber": "XXXX2345",
      "accountName": "Chioma Okafor"
    },
    "fee": 0,
    "netAmount": 30000,
    "status": "pending",
    "estimatedDelivery": "2026-02-10T14:30:00Z",
    "reference": "WTD-2026-001",
    "initiatedAt": "2026-02-08T14:30:00Z"
  }
}
```

**Status Codes:**

- `201 Created` - Withdrawal initiated successfully
- `400 Bad Request` - Invalid amount or account
- `401 Unauthorized` - User not authenticated
- `403 Forbidden` - Insufficient balance for withdrawal
- `409 Conflict` - Cannot withdraw at this time

---

### 16. GET /api/renters/wallet/withdraw/:withdrawalId

**Location:** `src/app/renters/components/TransactionDetailView.tsx` (Withdrawal details)

**UX Explanation:**
Check status of a withdrawal request. Users can track:

- Withdrawal amount
- Estimated delivery date
- Current status (Pending, Processing, Completed, Failed)
- Error message (if failed)
- Transaction reference

**Request Format:**

```json
GET /api/renters/wallet/withdraw/:withdrawalId
```

**URL Parameters:**

- `:withdrawalId` - ID of the withdrawal to track

**Response Format:**

```json
{
  "success": true,
  "data": {
    "withdrawal": {
      "withdrawalId": "wtd_001",
      "amount": 30000,
      "currency": "NGN",
      "bankAccount": {
        "bankName": "First Bank Nigeria",
        "accountNumber": "XXXX2345"
      },
      "fee": 0,
      "netAmount": 30000,
      "status": "processing",
      "estimatedDelivery": "2026-02-10T14:30:00Z",
      "reference": "WTD-2026-001",
      "initiatedAt": "2026-02-08T14:30:00Z",
      "timeline": [
        {
          "event": "initiated",
          "timestamp": "2026-02-08T14:30:00Z",
          "status": "completed"
        },
        {
          "event": "verified",
          "timestamp": "2026-02-08T15:00:00Z",
          "status": "completed"
        },
        {
          "event": "processing",
          "timestamp": "2026-02-08T15:30:00Z",
          "status": "current"
        },
        {
          "event": "completed",
          "timestamp": null,
          "status": "pending",
          "estimatedTime": "2026-02-10T14:30:00Z"
        }
      ]
    }
  }
}
```

**Status Codes:**

- `200 OK` - Withdrawal information retrieved successfully
- `401 Unauthorized` - User not authenticated
- `404 Not Found` - Withdrawal not found

---

### 17. GET /api/renters/wallet/locked-balances

**Location:** `src/app/renters/components/LockedBalanceCard.tsx` & `src/app/renters/wallet/page.tsx`

**UX Explanation:**
Retrieve detailed breakdown of locked funds in the renter's wallet. This shows:

- Security deposits locked in active rentals (when released)
- Rental fees locked in active orders
- Amount locked due to disputes
- Detailed timeline for when each amount becomes available
- Lock release schedule

**Request Format:**

```json
GET /api/renters/wallet/locked-balances
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "lockedBalances": {
      "totalLocked": 667000,
      "currency": "NGN",
      "activeRentals": [
        {
          "orderId": "ORD-001",
          "itemName": "Vintage Gucci Handbag",
          "listerName": "Betty Daniels",
          "productImage": "https://cloudinary.com/item-123.jpg",
          "breakdown": {
            "rentalFee": {
              "amount": 165000,
              "lockedAt": "2026-02-08T14:30:00Z",
              "releasesAt": "2026-02-18T14:30:00Z",
              "daysRemaining": 10,
              "reason": "Locked for 3 days after renter receives item"
            },
            "deliveryFee": {
              "amount": 2000,
              "lockedAt": "2026-02-08T14:30:00Z",
              "releasesAt": "2026-02-15T14:30:00Z",
              "daysRemaining": 7,
              "reason": "Locked until item returned to lister"
            },
            "securityDeposit": {
              "amount": 500000,
              "lockedAt": "2026-02-08T14:30:00Z",
              "releasesAt": "2026-02-15T14:30:00Z",
              "daysRemaining": 7,
              "reason": "Refundable when item confirmed in good condition by lister"
            }
          },
          "totalLockedForThisOrder": 667000,
          "rentalStatus": "active",
          "estimatedReturnDate": "2026-02-18T10:00:00Z"
        }
      ],
      "disputeHolds": [
        {
          "orderId": "ORD-002",
          "itemName": "Chanel Classic Flap",
          "heldAmount": 150000,
          "reason": "Item condition dispute raised",
          "disputeStatus": "under_review",
          "initiatedDate": "2026-02-05T10:00:00Z",
          "expectedResolutionDate": "2026-02-12T10:00:00Z",
          "daysUntilResolution": 4
        }
      ],
      "lockReleaseSchedule": {
        "nextReleaseDate": "2026-02-15T14:30:00Z",
        "nextReleaseAmount": 502000,
        "upcomingReleases": [
          {
            "date": "2026-02-15T14:30:00Z",
            "amount": 502000,
            "reason": "Delivery fee + security deposit for ORD-001"
          },
          {
            "date": "2026-02-18T14:30:00Z",
            "amount": 165000,
            "reason": "Rental fee for ORD-001 (if no disputes)"
          }
        ]
      }
    }
  }
}
```

**Status Codes:**

- `200 OK` - Locked balances retrieved successfully
- `401 Unauthorized` - User not authenticated

---

## Renter Account & Settings

### 18. GET /api/renters/profile

**Location:** `src/app/renters/components/AccountProfileDetails.tsx` (Profile tab)

**UX Explanation:**
Retrieve the renter's personal profile information. Displayed in Account tab with:

- Personal information (name, email, phone)
- Role display (read-only: "Renter")
- Address list
- Profile image
- Account creation date

**Request Format:**

```json
GET /api/renters/profile
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "profile": {
      "userId": "user_123",
      "fullName": "Chioma Okafor",
      "email": "chioma.okafor@email.com",
      "phone": "+234 (0) 907 123 4567",
      "role": "RENTER",
      "profileImage": "https://cloudinary.com/profile-img-123.jpg",
      "dateJoined": "2025-06-15T10:30:00Z",
      "addresses": [
        {
          "addressId": "addr_001",
          "type": "residential",
          "street": "123 Fashion Lane",
          "city": "Lagos",
          "state": "Lagos",
          "postalCode": "100001",
          "country": "Nigeria",
          "isDefault": true
        }
      ]
    }
  }
}
```

**Status Codes:**

- `200 OK` - Profile retrieved successfully
- `401 Unauthorized` - User not authenticated

---

### 18. PUT /api/renters/profile

**Location:** `src/app/renters/components/AccountProfileDetails.tsx` (Update Profile button)

**UX Explanation:**
Update personal profile information. Allows renters to edit:

- Full name
- Phone number
- Addresses

Email cannot be changed after account creation for security reasons.

**Request Format:**

```json
PUT /api/renters/profile
Content-Type: application/json

{
  "fullName": "Chioma Okafor Updated",
  "phone": "+234 (0) 907 987 6543"
}
```

**Response Format:**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "profile": {
      "userId": "user_123",
      "fullName": "Chioma Okafor Updated",
      "email": "chioma.okafor@email.com",
      "phone": "+234 (0) 907 987 6543",
      "updatedAt": "2026-02-08T14:30:00Z"
    }
  }
}
```

**Status Codes:**

- `200 OK` - Profile updated successfully
- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - User not authenticated

---

### 19. GET /api/renters/profile/addresses

**Location:** `src/app/renters/components/AccountProfileDetails.tsx` (Address list)

**UX Explanation:**
Retrieve all saved delivery addresses for the renter. Used when:

- Placing rental order (select delivery address)
- Managing account addresses
- Updating profile

**Request Format:**

```json
GET /api/renters/profile/addresses
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "addresses": [
      {
        "addressId": "addr_001",
        "type": "residential",
        "street": "123 Fashion Lane",
        "city": "Lagos",
        "state": "Lagos",
        "postalCode": "100001",
        "country": "Nigeria",
        "isDefault": true,
        "createdAt": "2025-06-15T10:30:00Z"
      }
    ],
    "total": 1
  }
}
```

**Status Codes:**

- `200 OK` - Addresses retrieved successfully
- `401 Unauthorized` - User not authenticated

---

### 20. POST /api/renters/profile/addresses

**Location:** `src/app/renters/components/AccountProfileDetails.tsx` (Add address button)

**UX Explanation:**
Add a new delivery address to the renter's profile. Addresses are used for:

- Selecting delivery location when renting
- Setting default delivery address

**Request Format:**

```json
POST /api/renters/profile/addresses
Content-Type: application/json

{
  "type": "residential",
  "street": "789 New Street",
  "city": "Lagos",
  "state": "Lagos",
  "postalCode": "100003",
  "country": "Nigeria",
  "isDefault": false
}
```

**Response Format:**

```json
{
  "success": true,
  "message": "Address added successfully",
  "data": {
    "address": {
      "addressId": "addr_003",
      "type": "residential",
      "street": "789 New Street",
      "city": "Lagos",
      "state": "Lagos",
      "postalCode": "100003",
      "country": "Nigeria",
      "isDefault": false,
      "createdAt": "2026-02-08T14:30:00Z"
    }
  }
}
```

**Status Codes:**

- `201 Created` - Address added successfully
- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - User not authenticated

---

### 21. POST /api/renters/profile/avatar

**Location:** `src/app/renters/components/AccountProfileDetails.tsx` (Profile image upload)

**UX Explanation:**
Upload or update profile avatar. Users click camera icon on profile image to upload photo.

**Request Format:**

```json
POST /api/renters/profile/avatar
Content-Type: multipart/form-data

{
  "avatar": <File> (JPEG/PNG, max 5MB)
}
```

**Response Format:**

```json
{
  "success": true,
  "message": "Profile avatar updated successfully",
  "data": {
    "profileImage": "https://cloudinary.com/profile-img-updated-123.jpg",
    "uploadedAt": "2026-02-08T14:30:00Z"
  }
}
```

**Status Codes:**

- `200 OK` - Avatar updated successfully
- `400 Bad Request` - Invalid file format or size too large
- `401 Unauthorized` - User not authenticated
- `413 Payload Too Large` - File exceeds 5MB limit

---

### 22. GET /api/renters/verifications/status

**Location:** `src/app/renters/components/AccountVerificationsForm.tsx` (Verification badges)

**UX Explanation:**
Check renter's ID verification status. Renters must verify identity with valid ID to:

- Place rental orders
- Withdraw funds
- Participate in disputes

Shows verification status for:

- Valid ID document
- BVN (Bank Verification Number)

**Request Format:**

```json
GET /api/renters/verifications/status
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "verifications": {
      "validId": {
        "status": "verified",
        "document": "Valid ID",
        "verifiedDate": "2025-08-10T09:00:00Z",
        "expiresAt": "2027-08-10T09:00:00Z"
      },
      "bvn": {
        "status": "verified",
        "document": "Bank Verification Number",
        "verifiedDate": "2025-07-15T14:30:00Z",
        "maskedValue": "XXXXX1234"
      }
    }
  }
}
```

**Status Codes:**

- `200 OK` - Verification status retrieved successfully
- `401 Unauthorized` - User not authenticated

---

### 23. POST /api/renters/verifications/id-document

**Location:** `src/app/renters/components/AccountVerificationsForm.tsx` (ID upload)

**UX Explanation:**
Upload valid ID document for verification. Renters can upload:

- National ID
- International Passport
- Driver's License

Document is verified by admin team within 24-48 hours.

**Request Format:**

```json
POST /api/renters/verifications/id-document
Content-Type: multipart/form-data

{
  "idDocument": <File> (JPEG/PNG, max 5MB),
  "idType": "national_id"
}
```

**Response Format:**

```json
{
  "success": true,
  "message": "ID document uploaded successfully",
  "data": {
    "documentId": "doc_001",
    "idType": "national_id",
    "status": "pending_verification",
    "uploadedDate": "2026-02-08T14:30:00Z",
    "estimatedVerificationTime": "24-48 hours"
  }
}
```

**Status Codes:**

- `201 Created` - ID uploaded successfully
- `400 Bad Request` - Invalid file or missing fields
- `401 Unauthorized` - User not authenticated

---

### 24. POST /api/renters/security/password

**Location:** `src/app/renters/components/AccountSecurity.tsx` (Password change form)

**UX Explanation:**
Change account password. Users enter:

1. Current password (for verification)
2. New password (with requirements shown)
3. Confirm new password

Requirements: 8+ chars, uppercase, lowercase, numbers, symbols.

**Request Format:**

```json
POST /api/renters/security/password
Content-Type: application/json

{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewSecurePass456!",
  "confirmPassword": "NewSecurePass456!"
}
```

**Response Format:**

```json
{
  "success": true,
  "message": "Password changed successfully",
  "data": {
    "passwordChanged": true,
    "changedAt": "2026-02-08T14:30:00Z"
  }
}
```

**Status Codes:**

- `200 OK` - Password changed successfully
- `400 Bad Request` - Invalid input or password doesn't meet requirements
- `401 Unauthorized` - Current password is incorrect

---

### 25. GET /api/renters/notifications/preferences

**Location:** `src/app/renters/components/AccountNotifications.tsx` (Load preferences)

**UX Explanation:**
Get renter's notification preferences. Shows which notification types are enabled:

- Email alerts (orders, returns, disputes)
- SMS updates (urgent notifications)
- Marketing/promotions

**Request Format:**

```json
GET /api/renters/notifications/preferences
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "preferences": {
      "emailAlerts": {
        "enabled": true,
        "categories": ["orders", "returns", "disputes"]
      },
      "smsUpdates": {
        "enabled": false,
        "categories": ["urgent"]
      },
      "marketingEmails": {
        "enabled": true
      }
    }
  }
}
```

**Status Codes:**

- `200 OK` - Preferences retrieved successfully
- `401 Unauthorized` - User not authenticated

---

### 26. PUT /api/renters/notifications/preferences

**Location:** `src/app/renters/components/AccountNotifications.tsx` (Save preferences)

**UX Explanation:**
Update notification preferences. Renters toggle notification types on/off.

**Request Format:**

```json
PUT /api/renters/notifications/preferences
Content-Type: application/json

{
  "emailAlerts": true,
  "smsUpdates": false,
  "marketingEmails": true
}
```

**Response Format:**

```json
{
  "success": true,
  "message": "Notification preferences updated successfully",
  "data": {
    "preferences": {
      "emailAlerts": true,
      "smsUpdates": false,
      "marketingEmails": true
    },
    "savedAt": "2026-02-08T14:30:00Z"
  }
}
```

**Status Codes:**

- `200 OK` - Preferences updated successfully
- `401 Unauthorized` - User not authenticated

---

## Renter Dispute Management

### 27. GET /api/renters/disputes/stats

**Location:** `src/app/renters/components/DisputesDashboard.tsx` (Dispute stats cards)

**UX Explanation:**
Get renter's dispute statistics. Shows:

- Total disputes raised
- Pending disputes (awaiting response)
- In review (being reviewed by platform)
- Resolved disputes
- Dispute resolution rate

**Request Format:**

```json
GET /api/renters/disputes/stats
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "disputeStats": {
      "totalDisputes": 2,
      "pendingDisputes": 0,
      "inReviewDisputes": 1,
      "resolvedDisputes": 1,
      "averageResolutionTime": "3 days",
      "resolutionRate": "100%"
    }
  }
}
```

**Status Codes:**

- `200 OK` - Stats retrieved successfully
- `401 Unauthorized` - User not authenticated

---

### 28. GET /api/renters/disputes

**Location:** `src/app/renters/components/DisputesListTable.tsx` & `src/app/renters/dispute/page.tsx`

**UX Explanation:**
List all disputes raised by the renter. The table shows:

- Dispute ID
- Related order/item
- Issue category
- Date raised
- Current status
- Lister name
- Action buttons (View, Withdraw)

**Request Format:**

```json
GET /api/renters/disputes?status=all&page=1&limit=10&sort=newest
```

**Query Parameters:**

- `status` (optional): "all" | "pending" | "in_review" | "resolved"
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response Format:**

```json
{
  "success": true,
  "data": {
    "disputes": [
      {
        "disputeId": "DSP-001",
        "orderId": "ORD-001",
        "itemName": "Vintage Gucci Handbag",
        "listerName": "Vintage Chic",
        "issueCategory": "Damaged Item",
        "status": "in_review",
        "raisedDate": "2026-01-25T10:00:00Z",
        "lastUpdated": "2026-02-05T14:00:00Z",
        "priority": "medium"
      }
    ],
    "totalDisputes": 2,
    "page": 1
  }
}
```

**Status Codes:**

- `200 OK` - Disputes retrieved successfully
- `401 Unauthorized` - User not authenticated

---

### 29. POST /api/renters/disputes

**Location:** `src/app/renters/components/RaiseDisputeForm.tsx` (Raise dispute form)

**UX Explanation:**
Raise a new dispute against a lister/rental order. Renters specify:

- Issue category (e.g., Damaged Item, Wrong Item, Not Delivered)
- Description of the problem
- Supporting evidence (images/videos)
- Amount being disputed (if applicable)

**Request Format:**

```json
POST /api/renters/disputes
Content-Type: multipart/form-data

{
  "orderId": "ORD-001",
  "itemId": "item_123",
  "issueCategory": "Damaged Item",
  "description": "Item arrived with torn seams and visible stains",
  "images": [<File1>, <File2>],
  "amountDisputed": 8500
}
```

**Response Format:**

```json
{
  "success": true,
  "message": "Dispute raised successfully",
  "data": {
    "dispute": {
      "disputeId": "DSP-001",
      "orderId": "ORD-001",
      "status": "pending_lister_response",
      "issueCategory": "Damaged Item",
      "raisedDate": "2026-02-08T14:30:00Z",
      "resolution": null
    }
  }
}
```

**Status Codes:**

- `201 Created` - Dispute created successfully
- `400 Bad Request` - Invalid data or order not eligible
- `401 Unauthorized` - User not authenticated

---

### 30. GET /api/renters/disputes/:disputeId

**Location:** `src/app/renters/components/DisputeDetails.tsx` (Dispute details page)

**UX Explanation:**
Get full dispute details. Displayed with:

- Dispute overview
- Related order info
- Issue category and description
- Evidence submitted
- Communications/messages
- Resolution details (if applicable)
- Timeline of events

**Request Format:**

```json
GET /api/renters/disputes/:disputeId
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "dispute": {
      "disputeId": "DSP-001",
      "orderId": "ORD-001",
      "itemName": "Vintage Gucci Handbag",
      "listerName": "Vintage Chic",
      "category": "Damaged Item",
      "status": "in_review",
      "description": "Item arrived with torn seams",
      "rentalPrice": 8500,
      "amountDisputed": 8500,
      "raisedDate": "2026-01-25T10:00:00Z",
      "timeline": [
        {
          "event": "dispute_raised",
          "date": "2026-01-25T10:00:00Z"
        },
        {
          "event": "lister_responded",
          "date": "2026-01-26T14:00:00Z"
        },
        {
          "event": "in_review",
          "date": "2026-01-27T09:00:00Z"
        }
      ]
    }
  }
}
```

**Status Codes:**

- `200 OK` - Dispute details retrieved successfully
- `401 Unauthorized` - User not authenticated
- `404 Not Found` - Dispute not found

---

### 31. GET /api/renters/disputes/:disputeId/overview

**Location:** `src/app/renters/components/DisputeOverviewContent.tsx` (Overview tab in dispute details)

**UX Explanation:**
Get dispute overview details for the Overview tab. This includes:

- Item information (name, lister, order ID)
- Dispute details (category, date submitted, preferred resolution, description)
- Used in the first tab of the dispute detail panel

**Request Format:**

```json
GET /api/renters/disputes/:disputeId/overview
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "overview": {
      "itemName": "Vintage Gucci Handbag",
      "curator": "Vintage Chic",
      "orderID": "ORD-001",
      "category": "Damaged Item",
      "dateSubmitted": "2026-01-25T10:00:00Z",
      "preferredResolution": "Full Refund",
      "description": "Item arrived with torn seams and interior staining"
    }
  }
}
```

**Status Codes:**

- `200 OK` - Overview retrieved successfully
- `401 Unauthorized` - User not authenticated
- `404 Not Found` - Dispute not found

---

### 32. GET /api/renters/disputes/:disputeId/evidence

**Location:** `src/app/renters/components/DisputeEvidenceContent.tsx` (Evidence tab in dispute details)

**UX Explanation:**
Retrieve all evidence files submitted for a dispute. The Evidence tab displays:

- List of uploaded evidence files (images and documents)
- File previews (image thumbnails or document icons)
- File names and types
- Empty state if no evidence uploaded

**Request Format:**

```json
GET /api/renters/disputes/:disputeId/evidence
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "evidence": {
      "files": [
        {
          "fileId": "file_001",
          "fileName": "damage_photo_1.jpg",
          "fileType": "image",
          "fileUrl": "https://cloudinary.com/damage_photo_1.jpg",
          "uploadedDate": "2026-01-25T11:30:00Z"
        },
        {
          "fileId": "file_002",
          "fileName": "damage_photo_2.jpg",
          "fileType": "image",
          "fileUrl": "https://cloudinary.com/damage_photo_2.jpg",
          "uploadedDate": "2026-01-25T11:35:00Z"
        },
        {
          "fileId": "file_003",
          "fileName": "invoice_scan.pdf",
          "fileType": "document",
          "fileUrl": "https://cloudinary.com/invoice_scan.pdf",
          "uploadedDate": "2026-01-25T12:00:00Z"
        }
      ]
    }
  }
}
```

**Status Codes:**

- `200 OK` - Evidence files retrieved successfully
- `401 Unauthorized` - User not authenticated
- `404 Not Found` - Dispute not found

---

### 33. GET /api/renters/disputes/:disputeId/timeline

**Location:** `src/app/renters/components/DisputeTimelineContent.tsx` (Timeline tab in dispute details)

**UX Explanation:**
Retrieve chronological timeline of dispute events. The Timeline tab displays:

- Dispute submitted event
- Status changes (In Review, Pending Review, etc.)
- Admin/curator responses
- Resolution events
- Each event shows status, date, and description

**Request Format:**

```json
GET /api/renters/disputes/:disputeId/timeline
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "timeline": {
      "events": [
        {
          "status": "Submitted",
          "date": "2026-01-25T10:00:00Z",
          "description": "Your dispute has been submitted for review"
        },
        {
          "status": "In Review",
          "date": "2026-01-26T09:30:00Z",
          "description": "Our team is reviewing your dispute and evidence"
        },
        {
          "status": "Curator Response",
          "date": "2026-01-27T14:00:00Z",
          "description": "The lister has responded to your dispute"
        }
      ]
    }
  }
}
```

**Status Codes:**

- `200 OK` - Timeline events retrieved successfully
- `401 Unauthorized` - User not authenticated
- `404 Not Found` - Dispute not found

---

### 34. GET /api/renters/disputes/:disputeId/resolution

**Location:** `src/app/renters/components/DisputeResolutionContent.tsx` (Resolution tab in dispute details)

**UX Explanation:**
Retrieve dispute resolution status and details. The Resolution tab displays:

- **Reviewing State**: Shows "No resolution yet" message while dispute is being reviewed
- **Resolved State**: Shows resolution outcome with refund details if applicable
  - Resolution status (Resolved, Rejected, etc.)
  - Refund amount (if approved)
  - Refund date (when refund was processed)
  - Resolution details/explanation

**Request Format:**

```json
GET /api/renters/disputes/:disputeId/resolution
```

**Response Format (Reviewing State):**

```json
{
  "success": true,
  "data": {
    "resolution": {
      "status": "Reviewing",
      "resolutionDetails": "Your dispute is currently being reviewed by our team",
      "refundAmount": null,
      "refundDate": null
    }
  }
}
```

**Response Format (Resolved State):**

```json
{
  "success": true,
  "data": {
    "resolution": {
      "status": "Resolved",
      "resolutionDetails": "Dispute resolved in favor of renter. Full refund approved.",
      "refundAmount": 8500,
      "refundDate": "2026-02-01T10:00:00Z"
    }
  }
}
```

**Status Codes:**

- `200 OK` - Resolution details retrieved successfully
- `401 Unauthorized` - User not authenticated
- `404 Not Found` - Dispute not found

---

### 35. GET /api/renters/disputes/:disputeId/messages

**Location:** `src/app/renters/components/DisputeConversationLog.tsx` (Conversation log in dispute overview)

**UX Explanation:**
Retrieve all messages/conversations in a dispute. The Conversation section displays:

- Messages from renter (right-aligned, light background)
- Messages from admin/platform (left-aligned, dark background)
- System status updates (centered, gray pill)
- Timestamps for each message
- Used in the Overview tab of dispute details

**Request Format:**

```json
GET /api/renters/disputes/:disputeId/messages
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": 1,
        "type": "status",
        "content": "Dispute created and submitted for review",
        "timestamp": null
      },
      {
        "id": 2,
        "type": "user",
        "content": "The item arrived damaged.",
        "timestamp": "2026-01-25T10:32:00Z"
      },
      {
        "id": 3,
        "type": "status",
        "content": "Admin joined the conversation",
        "timestamp": null
      },
      {
        "id": 4,
        "type": "admin",
        "content": "Thank you for bringing this to our attention. We're reviewing the evidence you provided. Could you please provide more details about when you first noticed the damage?",
        "timestamp": "2026-01-25T14:16:00Z"
      },
      {
        "id": 5,
        "type": "user",
        "content": "I noticed the damage immediately upon opening the package. The tear on the sleeve was very visible.",
        "timestamp": "2026-01-25T15:45:00Z"
      }
    ]
  }
}
```

**Status Codes:**

- `200 OK` - Messages retrieved successfully
- `401 Unauthorized` - User not authenticated
- `404 Not Found` - Dispute not found

---

### 36. POST /api/renters/disputes/:disputeId/messages

**Location:** `src/app/renters/components/DisputeConversationLog.tsx` (Send message button in conversation)

**UX Explanation:**
Send a new message in the dispute conversation. This allows renters to:

- Reply to admin responses
- Provide additional information or clarification
- Communicate about the dispute resolution
- Messages appear in the Conversation section of the Overview tab
- Can include text and optional file attachments

**Request Format:**

```json
POST /api/renters/disputes/:disputeId/messages
```

**Body Parameters:**

```json
{
  "message": "Additional photos of the damage are attached",
  "attachmentUrls": ["https://cloudinary.com/additional_photo_1.jpg"]
}
```

**Response Format:**

```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "messageId": "msg_001",
    "type": "user",
    "content": "Additional photos of the damage are attached",
    "timestamp": "2026-01-25T16:30:00Z",
    "attachments": [
      {
        "attachmentId": "att_001",
        "url": "https://cloudinary.com/additional_photo_1.jpg",
        "type": "image"
      }
    ]
  }
}
```

**Status Codes:**

- `201 Created` - Message sent successfully
- `400 Bad Request` - Invalid message content or attachments
- `401 Unauthorized` - User not authenticated
- `404 Not Found` - Dispute not found
- `413 Payload Too Large` - File attachment too large

---

### 37. GET /api/issue-categories

**Location:** `src/app/renters/components/RaiseDisputeForm.tsx` (Dispute category dropdown)

**UX Explanation:**
Retrieve list of available dispute issue categories. Used in the "Raise New Dispute" form to populate the category dropdown. Shows standard dispute categories that renters can select from when raising a dispute.

**Request Format:**

```json
GET /api/issue-categories
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "categoryId": "cat_001",
        "categoryName": "Damaged Item",
        "description": "Item arrived damaged or in worse condition than described"
      },
      {
        "categoryId": "cat_002",
        "categoryName": "Incorrect Item Received",
        "description": "Received a different item than what was ordered"
      },
      {
        "categoryId": "cat_003",
        "categoryName": "Item Not Delivered",
        "description": "Item was not delivered within agreed timeframe"
      },
      {
        "categoryId": "cat_004",
        "categoryName": "Hygiene Concern",
        "description": "Item concerns related to hygiene or cleanliness"
      },
      {
        "categoryId": "cat_005",
        "categoryName": "Misrepresented Description",
        "description": "Item does not match the description provided by lister"
      },
      {
        "categoryId": "cat_006",
        "categoryName": "Other",
        "description": "Other dispute reasons not listed above"
      }
    ]
  }
}
```

**Status Codes:**

- `200 OK` - Categories retrieved successfully

---

## Renter Shopping & Rental Request Workflow

### 38. POST /api/renters/rental-requests

**Location:** `src/app/shop/product-details/components/RentalDurationSelector.tsx` (Check Availability button)

**UX Explanation:**
Submit availability check request for a product rental. This is the first critical step in the rental workflow where:

1. Renter selects dates from calendar (in RentalDurationSelector component)
2. Renter clicks "Check Availability" button
3. System checks if renter is authenticated (shows login modal if not)
4. Renter confirms auto-pay option preference
5. Request is sent to lister with selected dates
6. Item is added to cart with PENDING status
7. 15-minute countdown timer starts

The renter can select predefined rental durations (3, 6, 9 days) or custom dates through calendar.

**Request Format:**

```json
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

**Request Parameters:**

- `productId` (string, required): ID of the item being rented
- `listerId` (string, required): ID of the lister/curator
- `rentalStartDate` (ISO string, required): Start date of rental
- `rentalEndDate` (ISO string, required): End date of rental
- `rentalDays` (number, required): Number of days for rental
- `estimatedRentalPrice` (number, required): Daily rental price × number of days (e.g., ₦55,000/day × 3 days = ₦165,000)
- `deliveryAddressId` (string, required): Renter's delivery address ID
- `autoPay` (boolean, required): Whether renter agrees to auto-pay if seller accepts
- `currency` (string, required): Currency code (NGN)

**Response Format:**

```json
{
  "success": true,
  "message": "Availability request submitted successfully",
  "data": {
    "requestId": "req_001",
    "productId": "prod_001",
    "productName": "FENDI ARCO BOOTS",
    "productValue": 500000,
    "listerId": "lister_456",
    "listerName": "Betty Daniels",
    "rentalStartDate": "2026-02-15T10:00:00Z",
    "rentalEndDate": "2026-02-18T10:00:00Z",
    "rentalDays": 3,
    "estimatedPrice": {
      "rentalFee": 165000,
      "deliveryFee": 2000,
      "securityDeposit": 500000,
      "total": 667000,
      "currency": "NGN"
    },
    "deductionExplanation": "At order confirmation, ₦165,000 rental fee + ₦2,000 delivery fee + ₦500,000 security deposit will be deducted from your wallet. Security deposit is refunded when item is returned to lister in good condition. Rental fee is locked in lister's wallet for 3 days after you receive the item.",
    "autoPay": true,
    "status": "pending_lister_approval",
    "requestCreatedAt": "2026-02-08T14:30:00Z",
    "expiresAt": "2026-02-08T14:45:00Z",
    "timerMinutes": 15,
    "cartItemId": "cart_item_001"
  }
}
```

**Status Codes:**

- `201 Created` - Request submitted successfully
- `400 Bad Request` - Invalid dates, insufficient wallet balance, or missing fields
- `401 Unauthorized` - User not authenticated (client should show login modal)
- `404 Not Found` - Product or lister not found
- `409 Conflict` - Item unavailable for selected dates

**Error Response (Insufficient Funds):**

When a renter's **available balance** is less than the required total (rental fee + delivery fee + security deposit):

```json
{
  "success": false,
  "message": "Your current cart is above your wallet balance",
  "error": "INSUFFICIENT_FUNDS",
  "data": {
    "requiredAmount": 667000,
    "requiredBreakdown": {
      "rentalFee": 165000,
      "deliveryFee": 2000,
      "securityDeposit": 500000
    },
    "availableBalance": 500000,
    "lockedBalance": 350000,
    "totalBalance": 850000,
    "shortfall": 167000,
    "currency": "NGN",
    "suggestion": "You need ₦167,000 more in your available balance. Add funds to your wallet to proceed.",
    "walletLink": "/renters/wallet"
  }
}
```

**Key Points:**

- Only the **available balance** is checked for cart validation, not locked balance
- **What gets deducted:** Rental fee (₦165,000) + Delivery fee (₦2,000) + Security deposit (₦500,000) = ₦667,000 total
- **Security deposit timing:** Refunded when product is returned to lister and condition is verified
- **Rental fee locking:** Locked in lister's wallet for 3 days after renter receives item, then becomes available if no disputes

---

### 39. GET /api/renters/rental-requests

**Location:** `src/app/shop/product-details/components/RentalCartSummary.tsx` (Cart display with pending items)

**UX Explanation:**
Retrieve all pending availability requests sent by the renter. Used to populate the shopping cart showing:

- All items with pending approval from lister
- Remaining time on each item (countdown from 15 minutes)
- Item details (name, lister, price, rental dates)
- Auto-pay preference for each request
- Ability to remove items from cart
- Total cart value

The cart should only show items with status "pending_lister_approval". Items that expire after 15 minutes are automatically removed by the backend, but frontend should also track and remove them.

**Request Format:**

```json
GET /api/renters/rental-requests?status=pending&page=1&limit=20
```

**Query Parameters:**

- `status` (optional): "pending" | "approved" | "rejected" | "expired" | "all" - default "pending"
- `page` (optional): Page number, default 1
- `limit` (optional): Items per page, default 20

**Response Format:**

```json
{
  "success": true,
  "data": {
    "rentalRequests": [
      {
        "requestId": "req_001",
        "cartItemId": "cart_item_001",
        "productId": "prod_001",
        "productName": "FENDI ARCO BOOTS",
        "productImage": "https://cloudinary.com/fendi-boots.jpg",
        "listerId": "lister_456",
        "listerName": "Betty Daniels",
        "rentalStartDate": "2026-02-15T10:00:00Z",
        "rentalEndDate": "2026-02-18T10:00:00Z",
        "rentalDays": 3,
        "rentalPrice": 165000,
        "deliveryFee": 2000,
        "cleaningFee": 5000,
        "totalPrice": 172000,
        "currency": "NGN",
        "autoPay": true,
        "status": "pending_lister_approval",
        "requestCreatedAt": "2026-02-08T14:30:00Z",
        "expiresAt": "2026-02-08T14:45:00Z",
        "timeRemainingSeconds": 840,
        "timeRemainingMinutes": 14
      },
      {
        "requestId": "req_002",
        "cartItemId": "cart_item_002",
        "productId": "prod_002",
        "productName": "GUCCI LEATHER BAG",
        "productImage": "https://cloudinary.com/gucci-bag.jpg",
        "listerId": "lister_789",
        "listerName": "Luxury Rentals",
        "rentalStartDate": "2026-02-20T10:00:00Z",
        "rentalEndDate": "2026-02-27T10:00:00Z",
        "rentalDays": 7,
        "rentalPrice": 250000,
        "deliveryFee": 3000,
        "cleaningFee": 7500,
        "totalPrice": 260500,
        "currency": "NGN",
        "autoPay": false,
        "status": "pending_lister_approval",
        "requestCreatedAt": "2026-02-08T13:00:00Z",
        "expiresAt": "2026-02-08T13:15:00Z",
        "timeRemainingSeconds": 120,
        "timeRemainingMinutes": 2
      }
    ],
    "cartSummary": {
      "totalItems": 2,
      "subtotal": 432000,
      "totalDeliveryFee": 5000,
      "totalCleaningFee": 12500,
      "cartTotal": 449500,
      "currency": "NGN"
    },
    "page": 1,
    "totalPages": 1
  }
}
```

**Status Codes:**

- `200 OK` - Requests retrieved successfully
- `401 Unauthorized` - User not authenticated

---

### 40. DELETE /api/renters/rental-requests/:requestId

**Location:** `src/app/shop/product-details/components/RentalCartSummary.tsx` (Remove item button in cart)

**UX Explanation:**
Remove a rental request from the cart. Renters can click the trash icon to remove items while waiting for lister approval. This is used to:

- Remove items manually before timer expires
- Clean up cart if renter changes mind
- Remove expired items (though backend should handle this)

**Request Format:**

```json
DELETE /api/renters/rental-requests/:requestId
```

**URL Parameters:**

- `:requestId` - ID of the rental request to remove

**Response Format:**

```json
{
  "success": true,
  "message": "Request removed from cart successfully",
  "data": {
    "requestId": "req_001",
    "cartItemId": "cart_item_001",
    "removedAt": "2026-02-08T14:35:00Z",
    "remainingCartItems": 1
  }
}
```

**Status Codes:**

- `200 OK` - Request removed successfully
- `401 Unauthorized` - User not authenticated
- `404 Not Found` - Request not found

---

### 41. POST /api/renters/rental-requests/:requestId/confirm

**Location:** `src/app/shop/product-details/components/RentalCartSummary.tsx` (Processing state - when lister approves)

**UX Explanation:**
Finalize and confirm a rental request after lister has approved it. This endpoint:

1. Waits for lister approval response (happens in backend/socket)
2. Once lister approves, this endpoint creates the actual order
3. Deducts payment from renter's wallet
4. Generates rental/delivery tracking numbers
5. Sends confirmation to both renter and lister
6. Removes item from cart
7. Creates order record

This is triggered automatically when lister approves the request, OR when renter manually confirms if auto-pay is false (manual payment required).

**Request Format:**

```json
POST /api/renters/rental-requests/:requestId/confirm
Content-Type: application/json

{
  "walletId": "wallet_renter_123",
  "confirmPayment": true
}
```

**Response Format:**

```json
{
  "success": true,
  "message": "Rental order created successfully",
  "data": {
    "orderId": "ORD-001",
    "requestId": "req_001",
    "productName": "FENDI ARCO BOOTS",
    "listerName": "Betty Daniels",
    "rentalStartDate": "2026-02-15T10:00:00Z",
    "rentalEndDate": "2026-02-18T10:00:00Z",
    "totalAmount": 172000,
    "currency": "NGN",
    "walletBalance": 50000,
    "status": "order_created",
    "orderCreatedAt": "2026-02-08T14:40:00Z",
    "nextStatus": "item_packaging",
    "estimatedDeliveryDate": "2026-02-17T14:00:00Z"
  }
}
```

**Status Codes:**

- `201 Created` - Order created successfully
- `400 Bad Request` - Invalid request or insufficient funds
- `401 Unauthorized` - User not authenticated
- `404 Not Found` - Request not found
- `409 Conflict` - Lister has not approved or request expired

---

### 42. GET /api/renters/rental-requests/:requestId

**Location:** `src/app/shop/product-details/components/RentalCartSummary.tsx` (Monitor request status)

**UX Explanation:**
Get detailed status of a single rental request. Used to:

- Monitor request status while waiting for lister approval
- Display countdown timer details
- Check if lister has approved/rejected
- Determine if showing "Request Processing..." loader or removal from cart

**Request Format:**

```json
GET /api/renters/rental-requests/:requestId
```

**URL Parameters:**

- `:requestId` - ID of the rental request

**Response Format:**

```json
{
  "success": true,
  "data": {
    "request": {
      "requestId": "req_001",
      "cartItemId": "cart_item_001",
      "productId": "prod_001",
      "productName": "FENDI ARCO BOOTS",
      "listerId": "lister_456",
      "listerName": "Betty Daniels",
      "rentalStartDate": "2026-02-15T10:00:00Z",
      "rentalEndDate": "2026-02-18T10:00:00Z",
      "rentalDays": 3,
      "totalPrice": 172000,
      "currency": "NGN",
      "autoPay": true,
      "status": "pending_lister_approval",
      "requestCreatedAt": "2026-02-08T14:30:00Z",
      "expiresAt": "2026-02-08T14:45:00Z",
      "timeRemainingSeconds": 480,
      "timeRemainingMinutes": 8,
      "listerResponse": null,
      "listerResponseAt": null,
      "message": "Waiting for lister approval..."
    }
  }
}
```

**Status Codes:**

- `200 OK` - Request details retrieved
- `401 Unauthorized` - User not authenticated
- `404 Not Found` - Request not found

---

## Status Tracking

- [x] GET /api/renters/dashboard/summary
- [x] GET /api/renters/favorites
- [x] POST /api/renters/favorites/:itemId
- [x] DELETE /api/renters/favorites/:itemId
- [x] GET /api/renters/orders
- [x] GET /api/renters/orders/:orderId
- [x] GET /api/renters/orders/:orderId/progress
- [x] POST /api/renters/orders/:orderId/return
- [x] GET /api/renters/wallet
- [x] GET /api/renters/wallet/transactions
- [x] POST /api/renters/wallet/deposit
- [x] GET /api/renters/wallet/bank-accounts
- [x] POST /api/renters/wallet/bank-accounts
- [x] GET /api/banks
- [x] POST /api/renters/wallet/withdraw
- [x] GET /api/renters/wallet/withdraw/:withdrawalId
- [x] GET /api/renters/profile
- [x] PUT /api/renters/profile
- [x] GET /api/renters/profile/addresses
- [x] POST /api/renters/profile/addresses
- [x] POST /api/renters/profile/avatar
- [x] GET /api/renters/verifications/status
- [x] POST /api/renters/verifications/id-document
- [x] POST /api/renters/security/password
- [x] GET /api/renters/notifications/preferences
- [x] PUT /api/renters/notifications/preferences
- [x] GET /api/renters/disputes/stats
- [x] GET /api/renters/disputes
- [x] POST /api/renters/disputes
- [x] GET /api/renters/disputes/:disputeId
- [x] GET /api/renters/disputes/:disputeId/overview
- [x] GET /api/renters/disputes/:disputeId/evidence
- [x] GET /api/renters/disputes/:disputeId/timeline
- [x] GET /api/renters/disputes/:disputeId/resolution
- [x] GET /api/renters/disputes/:disputeId/messages
- [x] POST /api/renters/disputes/:disputeId/messages
- [x] GET /api/issue-categories
- [x] POST /api/renters/rental-requests
- [x] GET /api/renters/rental-requests
- [x] DELETE /api/renters/rental-requests/:requestId
- [x] POST /api/renters/rental-requests/:requestId/confirm
- [x] GET /api/renters/rental-requests/:requestId
- [ ] GET /api/issue-categories

**Total Endpoints: 37 (in progress)**

**Once endpoints are created:** Remove completed items from this file and move them to connection phase.
