# Listers API Endpoints - ListersAPIs

**Status:** Awaiting Backend Implementation
**Last Updated:** 2026-02-08

## Overview

This document outlines all API endpoints that **Listers (Curators - sellers)** need to access on the RELISTED platform. Listers use these APIs to manage their inventory, track rentals, monitor earnings, and manage their business on the platform.

**Key Roles:** Listers (sellers who rent out fashion items)

---

## Lister Dashboard

### 1. GET /api/listers/stats

**Location:** `src/app/listers/dashboard/components/DashboardStatsRow.tsx`

**UX Explanation:**
Listers need an at-a-glance view of their business performance on the dashboard. This endpoint provides 4 key KPI cards:

- **Total Earnings**: Cumulative revenue from all completed rentals and sales (₦1,550,000)
- **Total Orders**: Count of all confirmed rental orders placed
- **Active Rentals**: Number of items currently rented out and awaiting return (08)
- **Pending Payouts**: Money earned but not yet withdrawn (₦350,000)

Each card shows:

- The current value
- Percentage change from last month (positive/negative indicator)
- Tooltip with explanation

This helps listers understand their business health at a glance.

**Request Format:**

```json
GET /api/listers/stats?timeframe=month
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "totalEarnings": {
      "amount": 1550000,
      "currency": "NGN",
      "changePercent": 3.16,
      "changeDirection": "up"
    },
    "totalOrders": {
      "count": 150,
      "changePercent": 2.24,
      "changeDirection": "up"
    },
    "activeRentals": {
      "count": 8,
      "changePercent": -1.18,
      "changeDirection": "down"
    },
    "pendingPayouts": {
      "amount": 350000,
      "currency": "NGN",
      "changePercent": 2.24,
      "changeDirection": "up"
    },
    "timeframe": "month",
    "generatedAt": "2026-02-08T10:30:00Z"
  }
}
```

---

### 2. GET /api/listers/rentals/overtime

**Location:** `src/app/listers/dashboard/components/RentalsOvertimeChart.tsx`

**UX Explanation:**
Show historical performance trends to help listers understand:

- Seasonal patterns (when do rentals peak?)
- Revenue trends (is business growing or declining?)
- Comparison between revenue and order count
- Monthly/yearly performance data

The chart displays two lines:

- **Revenue** (blue): Total earnings per month
- **Orders** (purple): Number of orders per month

Allows filtering by timeframe (Month, Quarter, Year).

**Request Format:**

```json
GET /api/listers/rentals/overtime?timeframe=year&year=2026
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "rentalsOvertime": [
      {
        "month": "January",
        "revenue": 125000,
        "orders": 32,
        "timestamp": "2026-01-31T23:59:59Z"
      },
      {
        "month": "February",
        "revenue": 158000,
        "orders": 38,
        "timestamp": "2026-02-08T10:30:00Z"
      }
    ],
    "timeframe": "year",
    "year": 2026,
    "summary": {
      "totalRevenue": 1550000,
      "totalOrders": 150,
      "avgMonthlyRevenue": 155000,
      "avgMonthlyOrders": 15
    }
  }
}
```

---

### 3. GET /api/listers/inventory/top-items

**Location:** `src/app/listers/dashboard/components/TopRentalsList.tsx`

**UX Explanation:**
Listers need to know which items are most popular and profitable:

- Shows top performing items by rental count
- Displays current availability status
- Shows rental pricing per item

Items are ranked by:

- Number of times rented (most rented first)
- Current availability (Available vs Unavailable)

Example shows "FENDI ARCO BOOTS" with 20 rentals at ₦550,000.

**Request Format:**

```json
GET /api/listers/inventory/top-items?limit=5
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "topItems": [
      {
        "id": "item_001",
        "name": "FENDI ARCO BOOTS",
        "image": "https://...",
        "rentalsCount": 20,
        "price": 550000,
        "currency": "NGN",
        "availability": "available",
        "category": "Shoes",
        "condition": "Good",
        "rating": 4.8,
        "reviews": 45
      },
      {
        "id": "item_002",
        "name": "CHANEL CLASSIC FLAP",
        "image": "https://...",
        "rentalsCount": 18,
        "price": 420000,
        "currency": "NGN",
        "availability": "unavailable",
        "category": "Bags",
        "condition": "Excellent",
        "rating": 4.9,
        "reviews": 52
      }
    ],
    "generatedAt": "2026-02-08T10:30:00Z"
  }
}
```

---

### 4. GET /api/listers/rentals/recent

**Location:** `src/app/listers/dashboard/components/RecentRentalsList.tsx`

**UX Explanation:**
Listers need a quick view of recent rental activity:

- Item details (name, size, color)
- Return due date (critical for follow-up)
- Rental amount earned
- Status indicator (Delivered, Return Due)

This helps listers:

- Track which items need to be returned
- Monitor rental timeline
- Identify items that need attention
- Follow up on overdue returns

**Request Format:**

```json
GET /api/listers/rentals/recent?page=1&limit=10&status=all
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "recentRentals": [
      {
        "id": "rental_001",
        "orderId": "#ORD-001",
        "item": {
          "id": "item_001",
          "name": "FENDI ARCO BOOTS",
          "size": "S",
          "color": "Black",
          "image": "https://..."
        },
        "dresser": {
          "id": "user_123",
          "name": "Chioma Eze",
          "avatar": "https://..."
        },
        "rentalPrice": 550000,
        "currency": "NGN",
        "returnDue": "2025-10-19",
        "returnDueDate": "2025-10-19T18:00:00Z",
        "status": "Delivered",
        "statusType": "delivered",
        "rentalStartDate": "2025-10-05",
        "rentalEndDate": "2025-10-19"
      },
      {
        "id": "rental_002",
        "orderId": "#ORD-002",
        "item": {
          "id": "item_001",
          "name": "FENDI ARCO BOOTS",
          "size": "S",
          "color": "Black",
          "image": "https://..."
        },
        "dresser": {
          "id": "user_124",
          "name": "Ada Okafor",
          "avatar": "https://..."
        },
        "rentalPrice": 550000,
        "currency": "NGN",
        "returnDue": "2025-10-19",
        "returnDueDate": "2025-10-19T18:00:00Z",
        "status": "Return Due",
        "statusType": "return_due",
        "rentalStartDate": "2025-10-05",
        "rentalEndDate": "2025-10-19"
      },
      {
        "id": "rental_003",
        "orderId": "#ORD-003",
        "item": {
          "id": "item_001",
          "name": "FENDI ARCO BOOTS",
          "size": "S",
          "color": "Black",
          "image": "https://..."
        },
        "dresser": {
          "id": "user_125",
          "name": "Ngozi Bello",
          "avatar": "https://..."
        },
        "rentalPrice": 550000,
        "currency": "NGN",
        "returnDue": "2025-10-19",
        "returnDueDate": "2025-10-19T18:00:00Z",
        "status": "Return Due",
        "statusType": "return_due",
        "rentalStartDate": "2025-10-05",
        "rentalEndDate": "2025-10-19"
      }
    ],
    "pagination": {
      "total": 45,
      "page": 1,
      "limit": 10,
      "pages": 5
    }
  }
}
```

---

## Lister Order Management

### 5. GET /api/listers/orders

**Location:** `src/app/listers/orders/page.tsx` & `src/app/listers/components/OrdersManagement.tsx`

**UX Explanation:**
Listers need to manage incoming rental orders. This endpoint provides a paginated list of all orders with status filtering:

- **Pending Approval**: New orders awaiting acceptance (⚠️ **15-minute deadline** for auto-cancellation)
- **Ongoing**: Approved orders currently in rental period
- **Completed**: Successfully returned items with payments processed
- **Cancelled**: Orders rejected, expired, or customer-cancelled

Each order card displays:

- Order number (e.g., #ORD-001)
- Order date
- Number of items in order
- Total rental amount
- Status badge with countdown timer for "Pending Approval"
- "View Details" link

**Critical Business Logic:**

- New orders have a **15-minute approval window**
- If not approved within 15 minutes, order automatically cancels
- Countdown timer must display remaining time (MM:SS format)
- Warning visual (yellow/orange) when < 5 minutes remain
- "Order expired" message when countdown reaches 0:00

**Request Format:**

```json
GET /api/listers/orders?status=pending&page=1&limit=20&sort=-createdAt
```

**Query Parameters:**

- `status`: "pending" | "ongoing" | "completed" | "cancelled" (optional, defaults to all)
- `page`: Pagination page number (default: 1)
- `limit`: Items per page (default: 20)
- `sort`: Sort field (createdAt, amount, itemCount) with - for descending

**Response Format:**

```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "order_001",
        "orderNumber": "ORD-001",
        "createdAt": "2026-02-08T09:00:00Z",
        "expiresAt": "2026-02-08T09:15:00Z",
        "timeRemainingSeconds": 245,
        "itemCount": 1,
        "totalAmount": 550000,
        "currency": "NGN",
        "status": "pending_approval",
        "statusLabel": "Pending Approval",
        "dresser": {
          "id": "user_123",
          "name": "Chioma Eze",
          "avatar": "https://...",
          "rating": 4.8
        },
        "items": [
          {
            "id": "item_001",
            "name": "FENDI ARCO BOOTS",
            "size": "S",
            "color": "Black",
            "image": "https://..."
          }
        ]
      },
      {
        "id": "order_002",
        "orderNumber": "ORD-002",
        "createdAt": "2026-02-07T14:30:00Z",
        "approvedAt": "2026-02-07T14:32:00Z",
        "itemCount": 2,
        "totalAmount": 920000,
        "currency": "NGN",
        "status": "ongoing",
        "statusLabel": "Ongoing",
        "currentStep": "in_transit",
        "dresser": {
          "id": "user_124",
          "name": "Ada Okafor",
          "avatar": "https://...",
          "rating": 4.9
        },
        "items": [
          {
            "id": "item_002",
            "name": "CHANEL CLASSIC FLAP",
            "size": "O/S",
            "color": "Beige",
            "image": "https://..."
          },
          {
            "id": "item_003",
            "name": "GUCCI MARMONT HEELS",
            "size": "6",
            "color": "Red",
            "image": "https://..."
          }
        ]
      }
    ],
    "pagination": {
      "total": 127,
      "page": 1,
      "limit": 20,
      "pages": 7
    },
    "summary": {
      "pendingApprovalCount": 3,
      "ongoingCount": 8,
      "completedCount": 95,
      "cancelledCount": 21
    }
  }
}
```

---

### 6. GET /api/listers/orders/:orderId

**Location:** `src/app/listers/orders/id/page.tsx` & `src/app/listers/components/OrderDetailsCard.tsx`

**UX Explanation:**
Detailed order view showing complete order information:

- Order header with number, status, approval status
- **Countdown timer** for pending approval (showing MM:SS remaining)
- Order timeline (Date Ordered, Items, Delivery Progress, Total Amount)
- Item list with individual statuses
- Approve/Reject buttons (only visible if status is "pending_approval")
- Order progress visualization
- Financial breakdown and escrow information

The countdown timer is the critical UI element:

- Large, prominent display (e.g., "⏱ 12:34 remaining")
- Updates every second
- Changes color to orange/red when < 5 minutes remain
- Shows "Order Expired" and disables approve button when time runs out

**Request Format:**

```json
GET /api/listers/orders/:orderId
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "order": {
      "id": "order_001",
      "orderNumber": "ORD-001",
      "createdAt": "2026-02-08T09:00:00Z",
      "expiresAt": "2026-02-08T09:15:00Z",
      "timeRemainingSeconds": 245,
      "status": "pending_approval",
      "statusLabel": "Pending Approval",
      "statusColor": "#FFF9E5",
      "statusTextColor": "#D4A017",
      "itemCount": 1,
      "totalAmount": 550000,
      "currency": "NGN",
      "dresser": {
        "id": "user_123",
        "name": "Chioma Eze",
        "avatar": "https://...",
        "rating": 4.8,
        "reviews": 32,
        "memberSince": "2024-06-15"
      },
      "items": [
        {
          "id": "item_001",
          "name": "FENDI ARCO BOOTS",
          "image": "https://...",
          "size": "S",
          "color": "Black",
          "rentalFee": 550000,
          "itemValue": 2200000,
          "returnDue": "2026-02-22",
          "status": "pending",
          "statusLabel": "Pending"
        }
      ],
      "timeline": {
        "dateOrdered": "2026-02-08",
        "itemsCount": 1,
        "itemsDelivered": 0,
        "currentStep": "pending_approval"
      },
      "escrow": {
        "rentalFeeTotal": 550000,
        "itemValueHeld": 2200000,
        "totalHeld": 2750000,
        "currency": "NGN",
        "releaseCondition": "Upon successful return confirmation"
      },
      "canApprove": true,
      "canReject": true,
      "approvalRequired": true,
      "approvalExpiredAt": "2026-02-08T09:15:00Z"
    }
  }
}
```

---

### 7. GET /api/listers/orders/:orderId/items

**Location:** `src/app/listers/components/OrderItemList.tsx`

**UX Explanation:**
Detailed list of all items in an order with:

- Product image, name, size, color specifications
- Return due date
- Rental amount
- Current status (Pending/Delivered/Return Due/Completed)
- "Preview" button for detailed item view

**Request Format:**

```json
GET /api/listers/orders/:orderId/items
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "item_001",
        "name": "FENDI ARCO BOOTS",
        "image": "https://...",
        "size": "S",
        "color": "Black",
        "returnDue": "2026-02-22",
        "returnDueDate": "2026-02-22T18:00:00Z",
        "amount": 550000,
        "currency": "NGN",
        "status": "pending",
        "statusLabel": "Pending",
        "rentalStartDate": "2026-02-08",
        "rentalEndDate": "2026-02-22",
        "itemValue": 2200000,
        "condition": "Excellent",
        "canPreview": true
      }
    ],
    "orderId": "order_001",
    "totalItems": 1
  }
}
```

---

### 8. GET /api/listers/orders/:orderId/progress

**Location:** `src/app/listers/components/OrderProgress.tsx`

**UX Explanation:**
Visual timeline showing the order lifecycle with 6 steps:

1. **Approved** - Order accepted by lister
2. **Dispatched** - Item(s) shipped out
3. **In Transit** - Package on way to buyer
4. **Delivered** - Package delivered to buyer
5. **Return Due** - Awaiting item return
6. **Completed** - Item returned, transaction closed

Component shows:

- Current step indicator
- Progress percentage
- Icons for each step
- Animated progress bar

**Request Format:**

```json
GET /api/listers/orders/:orderId/progress
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "currentStep": "pending_approval",
    "currentStepIndex": 0,
    "steps": [
      {
        "id": 1,
        "label": "Approved",
        "icon": "check-circle",
        "completed": false,
        "current": false,
        "timestamp": null
      },
      {
        "id": 2,
        "label": "Dispatched",
        "icon": "truck",
        "completed": false,
        "current": false,
        "timestamp": null
      },
      {
        "id": 3,
        "label": "In Transit",
        "icon": "package",
        "completed": false,
        "current": false,
        "timestamp": null
      },
      {
        "id": 4,
        "label": "Delivered",
        "icon": "home",
        "completed": false,
        "current": false,
        "timestamp": null
      },
      {
        "id": 5,
        "label": "Return Due",
        "icon": "reply",
        "completed": false,
        "current": false,
        "timestamp": null
      },
      {
        "id": 6,
        "label": "Completed",
        "icon": "smile",
        "completed": false,
        "current": false,
        "timestamp": null
      }
    ],
    "progressPercentage": 0,
    "orderId": "order_001"
  }
}
```

---

### 9. POST /api/listers/orders/:orderId/approve

**Location:** `src/app/listers/components/OrderDetailsCard.tsx` (Approve button)

**UX Explanation:**
Action endpoint to approve a pending order. This:

- Moves order from "Pending Approval" to "Approved"
- Locks in the rental terms
- Starts the dispatch workflow
- Calculates escrow amounts
- Removes countdown timer
- Sends confirmation to dresser

Only available when:

- Order status is "pending_approval"
- 15-minute timer has not expired (timeRemainingSeconds > 0)

**Request Format:**

```json
POST /api/listers/orders/:orderId/approve

{
  "notes": "Item in excellent condition, ready for dispatch" (optional)
}
```

**Response Format:**

```json
{
  "success": true,
  "message": "Order approved successfully",
  "data": {
    "orderId": "order_001",
    "orderNumber": "ORD-001",
    "status": "approved",
    "statusLabel": "Approved",
    "approvedAt": "2026-02-08T09:03:45Z",
    "approvedBy": "user_456",
    "nextSteps": "Prepare items for dispatch",
    "notification": {
      "sent": true,
      "recipientId": "user_123",
      "type": "order_approved"
    }
  }
}
```

**Status Codes:**

- `200 OK` - Order approved successfully
- `400 Bad Request` - Order not in pending_approval status or approval window expired
- `404 Not Found` - Order not found
- `401 Unauthorized` - User not authorized to approve this order

---

### 10. POST /api/listers/orders/:orderId/reject

**Location:** `src/app/listers/components/OrderDetailsCard.tsx` (Reject button)

**UX Explanation:**
Action endpoint to reject a pending order. This:

- Cancels the order
- Returns escrow to dresser (no funds held)
- Sends rejection notification with reason to dresser
- May request feedback on why rejected (for platform quality)

Only available when:

- Order status is "pending_approval"
- 15-minute timer has not expired

Requires a rejection reason for platform transparency.

**Request Format:**

```json
POST /api/listers/orders/:orderId/reject

{
  "reason": "Item no longer available" | "Item condition issue" | "Scheduling conflict" | "Other",
  "notes": "Additional details for customer (optional)",
  "refundType": "full" (always full for pending orders)
}
```

**Response Format:**

```json
{
  "success": true,
  "message": "Order rejected",
  "data": {
    "orderId": "order_001",
    "orderNumber": "ORD-001",
    "status": "rejected",
    "statusLabel": "Rejected",
    "rejectedAt": "2026-02-08T09:05:30Z",
    "rejectedBy": "user_456",
    "reason": "Item no longer available",
    "refund": {
      "amount": 0,
      "reason": "No payment charged for pending orders"
    },
    "notification": {
      "sent": true,
      "recipientId": "user_123",
      "type": "order_rejected",
      "reason": "Item no longer available"
    }
  }
}
```

**Status Codes:**

- `200 OK` - Order rejected successfully
- `400 Bad Request` - Order not in pending_approval status or approval window expired
- `404 Not Found` - Order not found
- `401 Unauthorized` - User not authorized to reject this order

---

### 11. PUT /api/listers/orders/:orderId/status

**Location:** `src/app/listers/orders/id/page.tsx` (Status updates during order lifecycle)

**UX Explanation:**
Endpoint for lister to update order status as it progresses through the lifecycle:

- Mark as "Dispatched" when sending to customer
- Mark as "In Transit" when carrier confirms pickup
- Mark as "Delivered" when customer receives (usually auto-updated)
- Mark as "Return Due" when awaiting return
- Mark as "Completed" when items returned and verified

**Request Format:**

```json
PUT /api/listers/orders/:orderId/status

{
  "status": "approved" | "dispatched" | "in_transit" | "delivered" | "return_due" | "completed",
  "trackingNumber": "ABC123XYZ" (for dispatched/in_transit status),
  "notes": "Shipped via FedEx",
  "estimatedDeliveryDate": "2026-02-10" (optional)
}
```

**Response Format:**

```json
{
  "success": true,
  "message": "Order status updated",
  "data": {
    "orderId": "order_001",
    "previousStatus": "approved",
    "newStatus": "dispatched",
    "updatedAt": "2026-02-08T10:30:00Z",
    "timeline": {
      "approvedAt": "2026-02-08T09:03:45Z",
      "dispatchedAt": "2026-02-08T10:30:00Z",
      "estimatedDeliveryDate": "2026-02-10T18:00:00Z",
      "externalTrackingUrl": "https://tracking.fedex.com/ABC123XYZ"
    },
    "notification": {
      "sent": true,
      "type": "order_status_updated",
      "recipientId": "user_123"
    }
  }
}
```

---

## Lister Wallet Management

### 12. GET /api/listers/wallet/stats

**Location:** `src/app/listers/wallet/page.tsx` & `src/app/listers/components/WalletBalanceCard.tsx`

**UX Explanation:**
Listers need to monitor their earning balance and wallet status:

- **Current Balance**: Total amount available to withdraw (₦500,000.00)
- **Pending Earnings**: Money from approved orders not yet released (escrow)
- **Total Earnings**: Cumulative earnings from all completed rentals
- **Withdrawal Limit**: Monthly withdrawal limit remaining (e.g., 5 withdrawals per month)
- **Last Withdrawal**: When the lister last withdrew funds

This is displayed prominently as a balance card with animated decorative background.

**Request Format:**

```json
GET /api/listers/wallet/stats
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "wallet": {
      "currentBalance": 500000,
      "currency": "NGN",
      "formattedBalance": "₦500,000.00",
      "pendingEarnings": 280000,
      "totalEarnings": 2100000,
      "withdrawalLimitThisMonth": {
        "limit": 5,
        "used": 2,
        "remaining": 3
      },
      "lastWithdrawal": {
        "date": "2026-02-01T14:30:00Z",
        "amount": 550000,
        "status": "completed"
      },
      "minimumWithdrawalAmount": 10000,
      "updatedAt": "2026-02-08T10:30:00Z"
    }
  }
}
```

---

### 13. GET /api/listers/wallet/transactions

**Location:** `src/app/listers/wallet/page.tsx` & `src/app/listers/components/TransactionList.tsx`

**UX Explanation:**
Listers need a detailed transaction history showing:

- **Withdrawals**: Money withdrawn to their bank account (Debit)
- **Rental Income**: Money earned from rental transactions (Credit)
- **Transaction Details**: ID, date, amount, status (Completed/Successful)
- **Status Color-Coding**: Red for debits, green for credits

This helps listers track their financial activity, verify deposits, and monitor withdrawal history.

**Request Format:**

```json
GET /api/listers/wallet/transactions?page=1&limit=10&type=all&sortBy=-date
```

**Query Parameters:**

- `page`: Pagination page number (default: 1)
- `limit`: Items per page (default: 10)
- `type`: "credit" | "debit" | "all" (default: all)
- `sortBy`: Field to sort by (date, amount) with - for descending

**Response Format:**

```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "345GFDVR4346764",
        "description": "Withdrawal",
        "type": "Debit",
        "icon": "arrow-up-right",
        "date": "2026-02-05T14:30:00Z",
        "displayDate": "Oct 19, 2025",
        "amount": 550000,
        "currency": "NGN",
        "formattedAmount": "₦550,000",
        "status": "Completed",
        "statusType": "completed",
        "statusColor": "bg-[#E8F8F0]",
        "statusTextColor": "text-[#1DB954]",
        "bankAccount": {
          "bankName": "Access Bank",
          "accountNumber": "0234567890",
          "accountName": "John Bassey"
        }
      },
      {
        "id": "345GFDVR4346765",
        "description": "Rental Fee",
        "type": "Credit",
        "icon": "arrow-down-left",
        "date": "2026-02-04T10:15:00Z",
        "displayDate": "Oct 19, 2025",
        "amount": 550000,
        "currency": "NGN",
        "formattedAmount": "+₦550,000",
        "status": "Successful",
        "statusType": "successful",
        "statusColor": "bg-[#E8F8F0]",
        "statusTextColor": "text-[#1DB954]",
        "relatedOrder": {
          "orderId": "order_001",
          "orderNumber": "ORD-001",
          "dresser": "Chioma Eze"
        }
      }
    ],
    "pagination": {
      "total": 145,
      "page": 1,
      "limit": 10,
      "pages": 15
    }
  }
}
```

---

### 14. GET /api/listers/wallet/bank-accounts

**Location:** `src/app/listers/components/BankAccountsDropdownContent.tsx`

**UX Explanation:**
Retrieve list of saved bank accounts that lister has registered for withdrawals:

- **Existing Accounts**: Display list of all saved bank accounts
- **Account Selection**: Dropdown to select which account to withdraw to
- **Add New Account**: Option to add additional bank accounts

Each account shows:

- Bank name (Access Bank, GTBank, UBA, etc.)
- Masked account number (last 4 digits visible)
- Account name (owner name on account)

**Request Format:**

```json
GET /api/listers/wallet/bank-accounts?verified=true
```

**Query Parameters:**

- `verified`: true | false (default: true, only show verified accounts)

**Response Format:**

```json
{
  "success": true,
  "data": {
    "bankAccounts": [
      {
        "id": "account_001",
        "bankName": "Access Bank",
        "bankCode": "044",
        "accountNumber": "0234567890",
        "accountNumberMasked": "****7890",
        "accountName": "John Bassey",
        "isDefault": true,
        "isVerified": true,
        "verifiedAt": "2025-12-01T08:00:00Z",
        "createdAt": "2025-11-15T10:30:00Z"
      },
      {
        "id": "account_002",
        "bankName": "GTBank",
        "bankCode": "058",
        "accountNumber": "0123456789",
        "accountNumberMasked": "****6789",
        "accountName": "John B. Bassey",
        "isDefault": false,
        "isVerified": true,
        "verifiedAt": "2025-12-05T09:15:00Z",
        "createdAt": "2025-12-01T14:20:00Z"
      }
    ],
    "total": 2,
    "defaultAccountId": "account_001"
  }
}
```

---

### 15. POST /api/listers/wallet/bank-accounts

**Location:** `src/app/listers/components/AddNewBankAccountForm.tsx`

**UX Explanation:**
Allow lister to add a new bank account for future withdrawals:

1. **Bank Selection**: Choose from list of Nigerian banks
2. **Account Details**: Enter account number and account name
3. **Verification**: Backend verifies account with bank
4. **Confirmation**: Shows success message when account is verified

Banks supported: Access Bank, GTBank, UBA, FirstBank, Zenith Bank, etc.

**Request Format:**

```json
POST /api/listers/wallet/bank-accounts

{
  "bankCode": "044",
  "bankName": "Access Bank",
  "accountNumber": "0234567890",
  "accountName": "John Bassey",
  "accountType": "savings" | "current" (optional)
}
```

**Response Format:**

```json
{
  "success": true,
  "message": "Bank account added successfully. Verification in progress.",
  "data": {
    "accountId": "account_003",
    "bankName": "Access Bank",
    "accountNumber": "0234567890",
    "accountNumberMasked": "****7890",
    "accountName": "John Bassey",
    "isVerified": false,
    "verificationStatus": "pending",
    "expectedVerificationTime": "24 hours",
    "createdAt": "2026-02-08T10:30:00Z",
    "notification": {
      "sent": true,
      "type": "bank_account_added",
      "message": "Your bank account has been added. Verification typically takes 24 hours."
    }
  }
}
```

**Status Codes:**

- `201 Created` - Bank account added and verification initiated
- `400 Bad Request` - Invalid account number or bank code
- `409 Conflict` - Account already exists
- `422 Unprocessable Entity` - Bank verification failed

---

### 16. GET /api/banks

**Location:** `src/app/listers/components/AddNewBankAccountForm.tsx` (Bank dropdown)

**UX Explanation:**
Get list of all supported Nigerian banks for account registration:

- Used for bank selection dropdown in "Add New Bank Account" form
- Shows bank names and codes needed for account addition
- Helps ensure correct bank selection during account setup

**Request Format:**

```json
GET /api/banks?country=NG
```

**Query Parameters:**

- `country`: "NG" (Nigeria only for this platform)

**Response Format:**

```json
{
  "success": true,
  "data": {
    "banks": [
      {
        "bankCode": "044",
        "bankName": "Access Bank",
        "logo": "https://...",
        "active": true,
        "supportedAccountTypes": ["savings", "current"]
      },
      {
        "bankCode": "058",
        "bankName": "GTBank",
        "logo": "https://...",
        "active": true,
        "supportedAccountTypes": ["savings", "current"]
      },
      {
        "bankCode": "033",
        "bankName": "United Bank for Africa",
        "logo": "https://...",
        "active": true,
        "supportedAccountTypes": ["savings", "current"]
      },
      {
        "bankCode": "011",
        "bankName": "First Bank of Nigeria",
        "logo": "https://...",
        "active": true,
        "supportedAccountTypes": ["savings", "current"]
      },
      {
        "bankCode": "057",
        "bankName": "Zenith Bank",
        "logo": "https://...",
        "active": true,
        "supportedAccountTypes": ["savings", "current"]
      }
    ],
    "total": 24,
    "country": "NG",
    "lastUpdated": "2026-02-08T10:30:00Z"
  }
}
```

---

### 17. POST /api/listers/wallet/withdraw

**Location:** `src/app/listers/components/UserWalletWithdraw.tsx` & `src/app/listers/components/Withdraw.tsx`

**UX Explanation:**
Lister initiates a withdrawal request:

1. **Amount Selection**: Enter amount to withdraw (minimum ₦10,000)
2. **Bank Account Selection**: Choose from saved bank accounts
3. **Confirmation**: Review withdrawal details before submission
4. **Processing**: Withdrawal request submitted and processed

**Business Rules:**

- Maximum 5 withdrawals per calendar month
- Minimum withdrawal amount: ₦10,000
- Processing time: 24-48 hours
- Confirmation email sent upon processing

**Request Format:**

```json
POST /api/listers/wallet/withdraw

{
  "amount": 200000,
  "currency": "NGN",
  "bankAccountId": "account_001",
  "withdrawalReason": "Monthly payout" (optional),
  "notes": "Urgent withdrawal needed" (optional)
}
```

**Response Format:**

```json
{
  "success": true,
  "message": "Withdrawal request submitted successfully",
  "data": {
    "withdrawalId": "withdraw_12345",
    "amount": 200000,
    "currency": "NGN",
    "formattedAmount": "₦200,000.00",
    "status": "pending",
    "statusLabel": "Processing",
    "bankAccount": {
      "bankName": "Access Bank",
      "accountNumberMasked": "****7890",
      "accountName": "John Bassey"
    },
    "requestedAt": "2026-02-08T10:30:00Z",
    "expectedProcessingDate": "2026-02-10T18:00:00Z",
    "fees": {
      "processingFee": 0,
      "bankFee": 0,
      "totalFee": 0
    },
    "newBalance": 300000,
    "notification": {
      "sent": true,
      "type": "withdrawal_submitted",
      "email": "user@example.com",
      "message": "Withdrawal request received. You'll receive ₦200,000 within 24-48 hours."
    }
  }
}
```

**Status Codes:**

- `200 OK` - Withdrawal request submitted successfully
- `400 Bad Request` - Invalid amount or bank account
- `402 Payment Required` - Insufficient balance
- `429 Too Many Requests` - Withdrawal limit exceeded this month
- `422 Unprocessable Entity` - Invalid bank account (not verified)

---

### 18. GET /api/listers/wallet/withdraw/:withdrawalId

**Location:** `src/app/listers/components/Withdraw.tsx` (Status tracking)

**UX Explanation:**
Check status of a specific withdrawal request:

- **Processing Status**: Pending → Processing → Completed
- **Expected Date**: When funds should arrive
- **Estimated Time**: Shows countdown to expected delivery
- **Error Details**: If withdrawal failed, why it failed

Helps lister track funding status and troubleshoot any issues.

**Request Format:**

```json
GET /api/listers/wallet/withdraw/:withdrawalId
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "withdrawal": {
      "withdrawalId": "withdraw_12345",
      "amount": 200000,
      "currency": "NGN",
      "status": "processing",
      "statusLabel": "Processing",
      "statusColor": "bg-blue-100",
      "statusTextColor": "text-blue-700",
      "bankAccount": {
        "bankName": "Access Bank",
        "accountNumber": "0234567890",
        "accountNumberMasked": "****7890",
        "accountName": "John Bassey"
      },
      "timeline": {
        "requestedAt": "2026-02-08T10:30:00Z",
        "processingStartedAt": "2026-02-08T11:00:00Z",
        "expectedCompletionDate": "2026-02-10T18:00:00Z",
        "completedAt": null
      },
      "estimatedHoursRemaining": 32,
      "previousWithdrawals": {
        "thisMonth": 2,
        "totalAmount": 1100000
      },
      "reference": "WD20260208103001",
      "failureReason": null
    }
  }
}
```

---

## Lister Dispute Management

### 19. GET /api/listers/disputes/stats

**Location:** `src/app/listers/dispute/page.tsx` & `src/app/renters/components/DisputesDashboard.tsx`

**UX Explanation:**
Listers need to understand their dispute status at a glance:

- **Total Disputes**: Count of all disputes raised (4)
- **Pending**: Disputes awaiting lister response (1)
- **In Review**: Disputes currently being reviewed by platform (1)
- **Resolved**: Disputes with final decision (1)

Displayed as KPI cards with color-coded counts (black for total, yellow for pending/in-review, green for resolved).

**Request Format:**

```json
GET /api/listers/disputes/stats?timeframe=month
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "disputeStats": {
      "totalDisputes": 4,
      "pendingDisputes": 1,
      "inReviewDisputes": 1,
      "resolvedDisputes": 1,
      "rejectedDisputes": 0,
      "averageResolutionTime": "5 days",
      "litiousChargeRate": "2.5%"
    },
    "generatedAt": "2026-02-08T10:30:00Z"
  }
}
```

---

### 20. GET /api/listers/disputes

**Location:** `src/app/listers/dispute/page.tsx` & `src/app/renters/components/DisputesListTable.tsx` & `src/app/renters/components/DisputeSearchBar.tsx`

**UX Explanation:**
Display paginated list of all disputes with:

- **Dispute ID**: Unique identifier (DQ-0234)
- **Item Name**: What item the dispute is about
- **Curator/Lister**: Who raised the dispute
- **Status**: In Review, Pending Review, Resolved, Rejected
- **Date Submitted**: When dispute was created
- **Search & Filter**: By dispute ID, order ID, category, or status

Helps lister track all disputes and find specific ones quickly.

**Request Format:**

```json
GET /api/listers/disputes?page=1&limit=10&status=all&search=&sortBy=-dateSubmitted
```

**Query Parameters:**

- `page`: Pagination page (default: 1)
- `limit`: Items per page (default: 10)
- `status`: "all" | "pending_review" | "in_review" | "resolved" | "rejected"
- `search`: Search by dispute ID, order ID, or item name
- `sortBy`: "-dateSubmitted" | "status" | "amount"

**Response Format:**

```json
{
  "success": true,
  "data": {
    "disputes": [
      {
        "disputeId": "DQ-0234",
        "itemName": "Vintage Chanel Blazer",
        "curator": "Sarah Mitchell",
        "orderNumber": "ORD-001",
        "status": "in_review",
        "statusLabel": "In Review",
        "statusIcon": "document",
        "statusColor": "text-blue-800",
        "statusBgColor": "bg-blue-100",
        "dateSubmitted": "2026-02-08T10:30:00Z",
        "displayDate": "28 Oct 2025",
        "category": "Damaged Item",
        "amount": 550000,
        "currency": "NGN"
      },
      {
        "disputeId": "DQ-0189",
        "itemName": "Dior Saddle Bag",
        "curator": "Emma Johnson",
        "orderNumber": "ORD-002",
        "status": "pending_review",
        "statusLabel": "Pending Review",
        "statusIcon": "clock",
        "statusColor": "text-yellow-800",
        "statusBgColor": "bg-yellow-100",
        "dateSubmitted": "2026-02-07T14:00:00Z",
        "displayDate": "01 Nov 2025",
        "category": "Incorrect Item",
        "amount": 420000,
        "currency": "NGN"
      }
    ],
    "pagination": {
      "total": 4,
      "page": 1,
      "limit": 10,
      "pages": 1
    }
  }
}
```

---

### 21. POST /api/listers/disputes

**Location:** `src/app/renters/components/RaiseDispute.tsx` & `src/app/renters/components/RaiseDisputeForm.tsx`

**UX Explanation:**
Create a new dispute for an order. Form includes:

- **Order ID**: Which order is the dispute about (required)
- **Issue Category**: Damaged Item, Incorrect Item, Item Not Delivered, Hygiene Concern, Misrepresented Description, Other (required)
- **Description**: Detailed explanation of issue (minimum 20 characters, required)
- **Evidence**: Upload up to 3 images (PNG/JPG, max 5MB each) - optional

Initiates dispute resolution process.

**Request Format:**

```json
POST /api/listers/disputes

{
  "orderId": "order_001",
  "orderNumber": "ORD-001",
  "category": "Damaged Item",
  "description": "The blazer arrived with a visible tear on the right sleeve. This damage was not mentioned in the item description and significantly affects the wearability.",
  "preferredResolution": "Full Refund" | "Partial Refund" | "Item Replacement" | "Other",
  "evidenceFiles": ["file_ids..."] (optional)
}
```

**Response Format:**

```json
{
  "success": true,
  "message": "Dispute created successfully",
  "data": {
    "disputeId": "DQ-0234",
    "orderId": "order_001",
    "orderNumber": "ORD-001",
    "category": "Damaged Item",
    "status": "pending_review",
    "statusLabel": "Pending Review",
    "createdAt": "2026-02-08T10:30:00Z",
    "estimatedResolutionTime": "5-7 business days",
    "notification": {
      "sent": true,
      "type": "dispute_created",
      "message": "Your dispute has been submitted. You'll receive updates via email."
    }
  }
}
```

**Status Codes:**

- `201 Created` - Dispute created successfully
- `400 Bad Request` - Missing required fields
- `404 Not Found` - Order not found
- `422 Unprocessable Entity` - Dispute already exists for this order

---

### 22. GET /api/listers/disputes/:disputeId

**Location:** `src/app/renters/components/DisputeDetails.tsx` & `src/app/renters/components/DisputeDetailTabs.tsx`

**UX Explanation:**
Get complete dispute details with all information:

- Status badge and progress
- Overview (item info, dispute details, description)
- Evidence files (uploaded images/documents)
- Timeline (status updates)
- Resolution (final decision if resolved)
- Conversation (messages between lister and admin)

**Request Format:**

```json
GET /api/listers/disputes/:disputeId
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "dispute": {
      "disputeId": "DQ-0234",
      "orderNumber": "ORD-001",
      "status": "in_review",
      "statusLabel": "In Review",
      "statusIcon": "document",
      "statusColor": "bg-blue-100",
      "createdAt": "2026-02-08T10:30:00Z",
      "lastUpdatedAt": "2026-02-08T14:45:00Z",
      "estimatedResolutionDate": "2026-02-15T18:00:00Z",
      "overview": {
        "itemName": "Vintage Chanel Blazer",
        "curator": "Sarah Mitchell",
        "category": "Damaged Item",
        "dateSubmitted": "28 Oct 2025",
        "preferredResolution": "Full Refund",
        "description": "The blazer arrived with a visible tear on the right sleeve..."
      },
      "evidence": {
        "filesCount": 2,
        "files": [
          {
            "fileId": "file_001",
            "fileName": "damage_photo_1.jpg",
            "fileType": "image",
            "fileUrl": "https://...",
            "uploadedAt": "2026-02-08T10:35:00Z"
          }
        ]
      },
      "timeline": {
        "events": [
          {
            "status": "Submitted",
            "date": "28 Oct 2025",
            "description": "Dispute created and submitted for review"
          },
          {
            "status": "In Review",
            "date": "29 Oct 2025",
            "description": "Our team is reviewing your case and evidence"
          }
        ]
      },
      "resolution": {
        "status": "reviewing",
        "resolutionDetails": null,
        "refundAmount": null,
        "refundDate": null
      },
      "messages": {
        "count": 5,
        "lastMessage": {
          "id": 5,
          "type": "user",
          "content": "I noticed the damage immediately upon opening the package...",
          "timestamp": "28 Oct 2025, 3:45 PM"
        }
      }
    }
  }
}
```

---

### 23. GET /api/listers/disputes/:disputeId/overview

**Location:** `src/app/renters/components/DisputeOverviewContent.tsx`

**UX Explanation:**
Get dispute overview tab content showing:

- Item information (name, curator, order ID)
- Dispute details (category, date submitted, preferred resolution)
- Full description of the issue
- Conversation log

**Request Format:**

```json
GET /api/listers/disputes/:disputeId/overview
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "overview": {
      "itemInformation": {
        "itemName": "Vintage Chanel Blazer",
        "curator": "Sarah Mitchell",
        "orderId": "RL-9832"
      },
      "disputeDetails": {
        "category": "Damaged Item",
        "dateSubmitted": "28 Oct 2025",
        "preferredResolution": "Full Refund",
        "description": "The blazer arrived with a visible tear on the right sleeve..."
      }
    }
  }
}
```

---

### 24. GET /api/listers/disputes/:disputeId/evidence

**Location:** `src/app/renters/components/DisputeEvidenceContent.tsx`

**UX Explanation:**
Retrieve all evidence files uploaded for the dispute:

- Image previews of damage photos
- PDF documents (receipts, inspection reports)
- File metadata (size, upload date)
- Downloadable links

**Request Format:**

```json
GET /api/listers/disputes/:disputeId/evidence
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
          "fileUrl": "https://...",
          "fileSize": "2.5MB",
          "uploadedAt": "2026-02-08T10:35:00Z",
          "uploadedBy": "user_123"
        },
        {
          "fileId": "file_002",
          "fileName": "damage_photo_2.jpg",
          "fileType": "image",
          "fileUrl": "https://...",
          "fileSize": "3.1MB",
          "uploadedAt": "2026-02-08T10:36:00Z",
          "uploadedBy": "user_123"
        },
        {
          "fileId": "file_003",
          "fileName": "receipt_01.pdf",
          "fileType": "document",
          "fileUrl": "https://...",
          "fileSize": "0.8MB",
          "uploadedAt": "2026-02-08T10:37:00Z",
          "uploadedBy": "user_123"
        }
      ],
      "totalFiles": 3,
      "totalSize": "6.4MB"
    }
  }
}
```

---

### 25. GET /api/listers/disputes/:disputeId/timeline

**Location:** `src/app/renters/components/DisputeTimelineContent.tsx`

**UX Explanation:**
Display dispute lifecycle timeline showing:

- Key status updates (Submitted, In Review, Resolved, etc.)
- Dates each status was reached
- Brief description of each event

Helps lister track dispute progress visually.

**Request Format:**

```json
GET /api/listers/disputes/:disputeId/timeline
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "timeline": {
      "events": [
        {
          "eventId": "event_001",
          "status": "Submitted",
          "date": "2026-02-08T10:30:00Z",
          "displayDate": "28 Oct 2025",
          "description": "Dispute created and submitted for review",
          "timestamp": "10:30 AM"
        },
        {
          "eventId": "event_002",
          "status": "In Review",
          "date": "2026-02-09T08:00:00Z",
          "displayDate": "29 Oct 2025",
          "description": "Our team is reviewing your case and evidence",
          "timestamp": "08:00 AM"
        }
      ],
      "totalEvents": 2,
      "currentStatus": "in_review"
    }
  }
}
```

---

### 26. GET /api/listers/disputes/:disputeId/resolution

**Location:** `src/app/renters/components/DisputeResolutionContent.tsx`

**UX Explanation:**
Get resolution status and outcome:

- Current resolution status (Reviewing, Resolved)
- Final decision if resolved
- Refund amount and date if applicable
- Why decision was made

Shows final outcome of dispute investigation.

**Request Format:**

```json
GET /api/listers/disputes/:disputeId/resolution
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "resolution": {
      "status": "reviewing",
      "statusLabel": "Under Review",
      "resolutionDetails": null,
      "refundAmount": null,
      "refundDate": null,
      "refundStatus": null,
      "resolvedAt": null,
      "resolvedBy": null,
      "appealAvailable": false
    }
  }
}
```

**If Resolved Example:**

```json
{
  "success": true,
  "data": {
    "resolution": {
      "status": "resolved",
      "statusLabel": "Resolved",
      "resolutionDetails": "Full refund issued due to confirmed damage to the item.",
      "refundAmount": 550000,
      "currency": "NGN",
      "formattedAmount": "₦550,000",
      "refundDate": "2026-02-15T18:00:00Z",
      "refundStatus": "processed",
      "resolvedAt": "2026-02-14T10:00:00Z",
      "resolvedBy": "RELISTED Admin",
      "appealAvailable": false
    }
  }
}
```

---

### 27. GET /api/listers/disputes/:disputeId/messages

**Location:** `src/app/renters/components/DisputeConversationLog.tsx`

**UX Explanation:**
Retrieve chat/conversation history between lister and RELISTED admin:

- User messages (right-aligned, gray background)
- Admin messages (left-aligned, black background)
- System status updates (centered)
- Timestamps for each message

**Request Format:**

```json
GET /api/listers/disputes/:disputeId/messages?page=1&limit=50
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "messageId": "msg_001",
        "type": "status",
        "content": "Dispute created and submitted for review",
        "createdAt": "2026-02-08T10:30:00Z",
        "createdBy": "system"
      },
      {
        "messageId": "msg_002",
        "type": "user",
        "content": "The item arrived damaged.",
        "createdAt": "2026-02-08T10:32:00Z",
        "createdBy": "user_123",
        "displayTimestamp": "28 Oct 2025, 10:32 AM"
      },
      {
        "messageId": "msg_003",
        "type": "status",
        "content": "Admin joined the conversation",
        "createdAt": "2026-02-08T14:16:00Z",
        "createdBy": "system"
      },
      {
        "messageId": "msg_004",
        "type": "admin",
        "content": "Thank you for bringing this to our attention. We're reviewing the evidence you provided. Could you please provide more details about when you first noticed the damage?",
        "createdAt": "2026-02-08T14:16:00Z",
        "createdBy": "admin_001",
        "adminName": "Support Team",
        "displayTimestamp": "28 Oct 2025, 2:16 PM"
      }
    ],
    "pagination": {
      "total": 5,
      "page": 1,
      "limit": 50,
      "pages": 1
    }
  }
}
```

---

### 28. POST /api/listers/disputes/:disputeId/messages

**Location:** `src/app/renters/components/DisputeConversationLog.tsx` (Message input & send button)

**UX Explanation:**
Send a message in the dispute conversation thread:

- Type written message in input field
- Optionally attach image/media (camera icon)
- Click send button (paper airplane icon)
- Message appears in chat with timestamp

Used for lister to respond to admin questions or provide additional information.

**Request Format:**

```json
POST /api/listers/disputes/:disputeId/messages

{
  "content": "I noticed the damage immediately upon opening the package. The tear on the sleeve was very visible.",
  "mediaIds": [] (optional, if attaching images)
}
```

**Response Format:**

```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "messageId": "msg_005",
    "type": "user",
    "content": "I noticed the damage immediately upon opening the package...",
    "createdAt": "2026-02-08T15:45:00Z",
    "displayTimestamp": "28 Oct 2025, 3:45 PM",
    "senderId": "user_123"
  }
}
```

**Status Codes:**

- `201 Created` - Message sent successfully
- `400 Bad Request` - Empty content or invalid message
- `404 Not Found` - Dispute not found
- `429 Too Many Requests` - Rate limited (max messages per hour)

---

### 29. POST /api/listers/disputes/:disputeId/withdraw

**Location:** `src/app/renters/components/DisputeDetails.tsx` (Withdraw Dispute button in footer)

**UX Explanation:**
Allow lister to withdraw a pending dispute before resolution:

- Only available for "Pending Review" status
- Not allowed if already "In Review" or resolved
- Requires confirmation
- Refunds any dispute fee back to lister

**Request Format:**

```json
POST /api/listers/disputes/:disputeId/withdraw

{
  "reason": "Resolved privately" | "Item received" | "Cancel dispute" | "Other" (optional),
  "notes": "Additional context (optional)"
}
```

**Response Format:**

```json
{
  "success": true,
  "message": "Dispute withdrawn successfully",
  "data": {
    "disputeId": "DQ-0234",
    "previousStatus": "pending_review",
    "newStatus": "withdrawn",
    "withdrawnAt": "2026-02-08T16:00:00Z",
    "refundData": {
      "refunded": true,
      "refundAmount": 0,
      "reason": "No fees charged for this dispute"
    },
    "notification": {
      "sent": true,
      "type": "dispute_withdrawn",
      "message": "Your dispute has been withdrawn."
    }
  }
}
```

**Status Codes:**

- `200 OK` - Dispute withdrawn successfully
- `400 Bad Request` - Cannot withdraw (already in review or resolved)
- `404 Not Found` - Dispute not found
- `409 Conflict` - Dispute in unmodifiable state

---

### 30. GET /api/issue-categories

**Location:** `src/app/renters/components/RaiseDisputeForm.tsx` (Issue Category dropdown)

**UX Explanation:**
Get list of all possible dispute issue categories for the dropdown when raising a dispute.

Used to ensure consistent categorization across all disputes.

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
        "name": "Damaged Item",
        "description": "Item arrived with visible damage or defects",
        "examples": ["Torn fabric", "Broken zipper", "Stain visible"]
      },
      {
        "categoryId": "cat_002",
        "name": "Incorrect Item Received",
        "description": "Wrong item was sent or item doesn't match description",
        "examples": ["Different color", "Wrong size", "Different brand"]
      },
      {
        "categoryId": "cat_003",
        "name": "Item Not Delivered",
        "description": "Item was never received or lost in transit",
        "examples": ["Missing package", "Lost delivery", "No tracking updates"]
      },
      {
        "categoryId": "cat_004",
        "name": "Hygiene Concern",
        "description": "Item has hygiene or cleanliness issues",
        "examples": ["Foul smell", "Visible dirt", "Stain marks"]
      },
      {
        "categoryId": "cat_005",
        "name": "Misrepresented Description",
        "description": "Item doesn't match the seller's description",
        "examples": ["Different condition", "Wrong material", "Missing parts"]
      },
      {
        "categoryId": "cat_006",
        "name": "Other",
        "description": "Other issue not listed above",
        "examples": []
      }
    ],
    "total": 6
  }
}
```

---

## Lister Settings Management

### 31. GET /api/listers/profile

**Location:** `src/app/listers/settings/page.tsx` & `src/app/listers/components/AccountProfileDetails.tsx`

**UX Explanation:**
Retrieve the lister's current personal profile information including name, email, phone, role, and address list. This is displayed in the "Profile" tab of the settings page, allowing listers to view their current information before editing.

Users see:

- Personal Information (Full Name, Email, Phone, Role)
- Address list with options to edit or add new addresses
- Profile image with upload option

**Request Format:**

```json
GET /api/listers/profile
```

**Query Parameters:**

- `includeAddresses` (optional): boolean, default true - Include address list

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
      "role": "LISTER",
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
- `404 Not Found` - User profile not found

---

### 32. PUT /api/listers/profile

**Location:** `src/app/listers/components/AccountProfileDetails.tsx` - Update Profile button

**UX Explanation:**
Update the lister's personal information (name, email, phone). Profile information is edited through the "Profile" tab where users can modify their personal details and click "Update Profile" button.

**Request Format:**

```json
PUT /api/listers/profile
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
      "role": "LISTER",
      "updatedAt": "2026-02-08T14:30:00Z"
    }
  }
}
```

**Status Codes:**

- `200 OK` - Profile updated successfully
- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - User not authenticated
- `409 Conflict` - Email already in use

---

### 33. GET /api/listers/profile/addresses

**Location:** `src/app/listers/components/AccountProfileDetails.tsx` - Address list section

**UX Explanation:**
Retrieve all saved addresses for the user. Displayed in the Profile tab as a list with options to edit or remove each address. Shows complete address details with type indicator (residential/business).

**Request Format:**

```json
GET /api/listers/profile/addresses
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
      },
      {
        "addressId": "addr_002",
        "type": "business",
        "street": "456 Business Ave",
        "city": "Lagos",
        "state": "Lagos",
        "postalCode": "100002",
        "country": "Nigeria",
        "isDefault": false,
        "createdAt": "2025-12-01T08:00:00Z"
      }
    ],
    "total": 2
  }
}
```

**Status Codes:**

- `200 OK` - Addresses retrieved successfully
- `401 Unauthorized` - User not authenticated

---

### 34. POST /api/listers/profile/addresses

**Location:** `src/app/listers/components/AccountProfileDetails.tsx` - Add New Address button

**UX Explanation:**
Add a new address to the user's profile. Users can add multiple addresses (residential, business) through the "Add New Address" button in the Profile tab. New addresses can be marked as default for all future operations.

**Request Format:**

```json
POST /api/listers/profile/addresses
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

- `201 Created` - Address created successfully
- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - User not authenticated

---

### 35. POST /api/listers/profile/avatar

**Location:** `src/app/listers/components/AccountProfileDetails.tsx` - Profile image upload

**UX Explanation:**
Upload and update the user's profile avatar. Users can click the camera icon on their profile image to upload a new photo. This endpoint handles image upload to Cloudinary and updates the profile picture URL in the database.

**Request Format:**

```json
POST /api/listers/profile/avatar
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

### 36. GET /api/listers/profile/business

**Location:** `src/app/listers/components/BusinessDetailsForm.tsx` - Business Details tab

**UX Explanation:**
Retrieve the lister's business information including shop name, category, description, contact details, and verification status. This information is displayed in the new "Business Details" tab where users can view and edit their business profile.

Users see:

- Business Name (editable)
- Business Category (editable dropdown)
- Business Description (editable textarea)
- Contact Information (email, phone, address)
- Legal Information (Tax ID, Registration number - read-only)
- Verification Status Badge

**Request Format:**

```json
GET /api/listers/profile/business
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "businessProfile": {
      "businessId": "biz_001",
      "businessName": "Vintage Chic Curations",
      "businessCategory": "Fashion & Accessories",
      "businessDescription": "Premium vintage and contemporary fashion rental service",
      "businessEmail": "info@vintagechiccurations.com",
      "businessPhone": "+234 (0) 907 123 4567",
      "businessAddress": "123 Fashion St, Lagos, Nigeria",
      "website": "www.vintagechiccurations.com",
      "taxId": "12345678901",
      "businessRegistration": "CAC-2024-001234",
      "verificationStatus": "verified",
      "verificationBadge": "blue",
      "averageResponseTime": "2 hours",
      "totalRentals": 156,
      "averageRating": 4.8,
      "createdAt": "2025-06-15T10:30:00Z",
      "updatedAt": "2026-01-20T08:00:00Z"
    }
  }
}
```

**Status Codes:**

- `200 OK` - Business profile retrieved successfully
- `401 Unauthorized` - User not authenticated
- `404 Not Found` - Business profile not found

---

### 37. PUT /api/listers/profile/business

**Location:** `src/app/listers/components/BusinessDetailsForm.tsx` - Save Changes button

**UX Explanation:**
Update the lister's business information. Users can edit their business name, category, description, and contact information through the Business Details tab. The form shows "Edit Business Details" button initially, then switches to "Cancel" and "Save Changes" buttons when in edit mode.

Fields marked as read-only (Tax ID, Registration) cannot be updated after initial verification.

**Request Format:**

```json
PUT /api/listers/profile/business
Content-Type: application/json

{
  "businessName": "Vintage Chic Curations",
  "businessCategory": "Fashion & Accessories",
  "businessDescription": "Premium vintage and contemporary fashion rental service",
  "businessEmail": "info@vintagechiccurations.com",
  "businessPhone": "+234 (0) 907 123 4567",
  "businessAddress": "123 Fashion St, Lagos, Nigeria",
  "website": "www.vintagechiccurations.com"
}
```

**Response Format:**

```json
{
  "success": true,
  "message": "Business details updated successfully",
  "data": {
    "businessProfile": {
      "businessId": "biz_001",
      "businessName": "Vintage Chic Curations",
      "businessCategory": "Fashion & Accessories",
      "businessDescription": "Premium vintage and contemporary fashion rental service",
      "businessEmail": "info@vintagechiccurations.com",
      "businessPhone": "+234 (0) 907 123 4567",
      "businessAddress": "123 Fashion St, Lagos, Nigeria",
      "website": "www.vintagechiccurations.com",
      "updatedAt": "2026-02-08T14:30:00Z"
    }
  }
}
```

**Status Codes:**

- `200 OK` - Business details updated successfully
- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - User not authenticated
- `409 Conflict` - Business name already in use

---

### 38. GET /api/listers/verifications/status

**Location:** `src/app/listers/components/AccountVerificationsForm.tsx` - Verification badges display

**UX Explanation:**
Check the lister's verification status for all required documents (NIN, BVN, Business Registration). Displayed in the "Verifications" tab as badges showing:

- Verified (green checkmark badge)
- Pending (yellow badge)
- Not Verified (gray badge)

Each document shows its verification date and any required actions.

**Request Format:**

```json
GET /api/listers/verifications/status
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "verifications": {
      "nin": {
        "status": "verified",
        "document": "National Identification Number",
        "verifiedDate": "2025-08-10T09:00:00Z",
        "expiresAt": "2027-08-10T09:00:00Z"
      },
      "bvn": {
        "status": "verified",
        "document": "Bank Verification Number",
        "verifiedDate": "2025-07-15T14:30:00Z",
        "maskedValue": "XXXXX1234"
      },
      "businessRegistration": {
        "status": "verified",
        "document": "Business Registration",
        "verifiedDate": "2025-09-20T11:00:00Z",
        "registrationNumber": "CAC-2024-001234"
      }
    }
  }
}
```

**Status Codes:**

- `200 OK` - Verification status retrieved successfully
- `401 Unauthorized` - User not authenticated

---

### 39. GET /api/listers/verifications/documents

**Location:** `src/app/listers/components/AccountVerificationsForm.tsx` - Document display section

**UX Explanation:**
Retrieve uploaded verification documents and their details. Shows the actual document uploads (images), verification status, upload dates, and any notes from the verification team.

**Request Format:**

```json
GET /api/listers/verifications/documents
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "documents": [
      {
        "documentId": "doc_001",
        "type": "NIN",
        "documentUrl": "https://cloudinary.com/nin-doc-123.jpg",
        "status": "verified",
        "uploadedDate": "2025-08-10T09:00:00Z",
        "verifiedDate": "2025-08-10T10:30:00Z",
        "notes": "Document verified successfully"
      },
      {
        "documentId": "doc_002",
        "type": "BUSINESS_REGISTRATION",
        "documentUrl": "https://cloudinary.com/cac-doc-456.jpg",
        "status": "verified",
        "uploadedDate": "2025-09-20T11:00:00Z",
        "verifiedDate": "2025-09-20T14:00:00Z",
        "notes": "CAC registration document verified"
      }
    ]
  }
}
```

**Status Codes:**

- `200 OK` - Documents retrieved successfully
- `401 Unauthorized` - User not authenticated

---

### 40. POST /api/listers/verifications/nin

**Location:** `src/app/listers/components/AccountVerificationsForm.tsx` - NIN upload section

**UX Explanation:**
Upload or update NIN (National Identification Number) document for verification. Users can upload their NIN document image through the Verifications tab. Once uploaded, the document is queued for verification by the admin team.

**Request Format:**

```json
POST /api/listers/verifications/nin
Content-Type: multipart/form-data

{
  "ninDocument": <File> (JPEG/PNG, max 5MB),
  "ninNumber": "12345678901" (optional, for reference)
}
```

**Response Format:**

```json
{
  "success": true,
  "message": "NIN document uploaded successfully",
  "data": {
    "document": {
      "documentId": "doc_001",
      "type": "NIN",
      "documentUrl": "https://cloudinary.com/nin-doc-123.jpg",
      "status": "pending_verification",
      "uploadedDate": "2026-02-08T14:30:00Z",
      "estimatedVerificationTime": "24-48 hours"
    }
  }
}
```

**Status Codes:**

- `201 Created` - NIN document uploaded successfully
- `400 Bad Request` - Invalid file format or missing required fields
- `401 Unauthorized` - User not authenticated
- `413 Payload Too Large` - File exceeds 5MB limit

---

### 41. GET /api/listers/verifications/bvn

**Location:** `src/app/listers/components/AccountVerificationsForm.tsx` - BVN display field

**UX Explanation:**
Retrieve the user's BVN (Bank Verification Number) in masked format. Only the last 4 digits are shown for security purposes. Users see a read-only display of their BVN status in the Verifications tab.

**Request Format:**

```json
GET /api/listers/verifications/bvn
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "bvn": {
      "maskedValue": "XXXXX1234",
      "status": "verified",
      "verifiedDate": "2025-07-15T14:30:00Z",
      "bankName": "First Bank Nigeria",
      "accountName": "Chioma O. Okafor"
    }
  }
}
```

**Status Codes:**

- `200 OK` - BVN retrieved successfully
- `401 Unauthorized` - User not authenticated
- `404 Not Found` - BVN record not found

---

### 42. PUT /api/listers/verifications/emergency-contact

**Location:** `src/app/listers/components/AccountVerificationsForm.tsx` - Emergency Contact form

**UX Explanation:**
Update emergency contact information. The Verifications tab includes an "Emergency Contact Information" section where users can add or update the contact person to be notified in case of emergencies.

Form fields:

- Emergency Contact Full Name
- Emergency Contact Email
- Emergency Contact Phone
- Relationship (dropdown: Friend, Family, Spouse, Parent, Other)

**Request Format:**

```json
PUT /api/listers/verifications/emergency-contact
Content-Type: application/json

{
  "fullName": "Adekunle Okafor",
  "email": "adekunle@email.com",
  "phone": "+234 (0) 908 234 5678",
  "relationship": "Family"
}
```

**Response Format:**

```json
{
  "success": true,
  "message": "Emergency contact updated successfully",
  "data": {
    "emergencyContact": {
      "contactId": "emg_001",
      "fullName": "Adekunle Okafor",
      "email": "adekunle@email.com",
      "phone": "+234 (0) 908 234 5678",
      "relationship": "Family",
      "updatedAt": "2026-02-08T14:30:00Z"
    }
  }
}
```

**Status Codes:**

- `200 OK` - Emergency contact updated successfully
- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - User not authenticated

---

### 43. POST /api/listers/security/password

**Location:** `src/app/listers/components/AccountSecurity.tsx` - Update Password button

**UX Explanation:**
Change the user's account password. The "Security" tab contains a password change form where users must enter:

1. Current Password (for verification)
2. New Password (with complexity requirements: 8+ chars, uppercase, lowercase, numbers, symbols)
3. Confirm New Password

The form displays password complexity requirements and allows eye toggle to show/hide password.

**Request Format:**

```json
POST /api/listers/security/password
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
    "changedAt": "2026-02-08T14:30:00Z",
    "notification": {
      "sent": true,
      "type": "password_changed",
      "message": "Your password was changed on 2026-02-08 at 14:30"
    }
  }
}
```

**Status Codes:**

- `200 OK` - Password changed successfully
- `400 Bad Request` - Invalid input or password doesn't meet requirements
- `401 Unauthorized` - Current password is incorrect
- `422 Unprocessable Entity` - New password same as old password

---

### 44. GET /api/listers/notifications/preferences

**Location:** `src/app/listers/components/AccountNotifications.tsx` - Load preferences on mount

**UX Explanation:**
Retrieve the user's notification preference settings. The "Notifications" tab shows 3 toggleable settings:

1. **Email Alerts** - Receive email notifications for order updates, dispute alerts, and payment confirmations
2. **SMS Updates** - Receive SMS text messages for urgent notifications
3. **Product Recommendations** - Receive curated product and trend recommendations

Each setting is displayed with a custom animated toggle switch showing current state.

**Request Format:**

```json
GET /api/listers/notifications/preferences
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "preferences": {
      "emailAlerts": {
        "enabled": true,
        "categories": ["orders", "disputes", "payments", "system"]
      },
      "smsUpdates": {
        "enabled": false,
        "categories": ["urgent", "dispute_escalation"]
      },
      "productRecommendations": {
        "enabled": true,
        "frequency": "weekly"
      }
    },
    "lastUpdated": "2026-01-15T10:00:00Z"
  }
}
```

**Status Codes:**

- `200 OK` - Notification preferences retrieved successfully
- `401 Unauthorized` - User not authenticated

---

### 45. PUT /api/listers/notifications/preferences

**Location:** `src/app/listers/components/AccountNotifications.tsx` - Save Preferences button

**UX Explanation:**
Update notification preference settings. Users can toggle each notification type on/off and click "Save Preferences" button to persist their changes. The form provides immediate feedback showing which settings have been updated.

**Request Format:**

```json
PUT /api/listers/notifications/preferences
Content-Type: application/json

{
  "emailAlerts": true,
  "smsUpdates": false,
  "productRecommendations": true
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
      "productRecommendations": true
    },
    "savedAt": "2026-02-08T14:30:00Z"
  }
}
```

**Status Codes:**

- `200 OK` - Notification preferences updated successfully
- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - User not authenticated

---

## Status Tracking

- [x] GET /api/listers/stats
- [x] GET /api/listers/rentals/overtime
- [x] GET /api/listers/inventory/top-items
- [x] GET /api/listers/rentals/recent
- [x] GET /api/listers/orders
- [x] GET /api/listers/orders/:orderId
- [x] GET /api/listers/orders/:orderId/items
- [x] GET /api/listers/orders/:orderId/progress
- [x] POST /api/listers/orders/:orderId/approve
- [x] POST /api/listers/orders/:orderId/reject
- [x] PUT /api/listers/orders/:orderId/status
- [x] GET /api/listers/wallet/stats
- [x] GET /api/listers/wallet/transactions
- [x] GET /api/listers/wallet/bank-accounts
- [x] POST /api/listers/wallet/bank-accounts
- [x] GET /api/banks
- [x] POST /api/listers/wallet/withdraw
- [x] GET /api/listers/wallet/withdraw/:withdrawalId
- [x] GET /api/listers/disputes/stats
- [x] GET /api/listers/disputes
- [x] POST /api/listers/disputes
- [x] GET /api/listers/disputes/:disputeId
- [x] GET /api/listers/disputes/:disputeId/overview
- [x] GET /api/listers/disputes/:disputeId/evidence
- [x] GET /api/listers/disputes/:disputeId/timeline
- [x] GET /api/listers/disputes/:disputeId/resolution
- [x] GET /api/listers/disputes/:disputeId/messages
- [x] POST /api/listers/disputes/:disputeId/messages
- [x] POST /api/listers/disputes/:disputeId/withdraw
- [x] GET /api/issue-categories
- [x] GET /api/listers/profile
- [x] PUT /api/listers/profile
- [x] GET /api/listers/profile/addresses
- [x] POST /api/listers/profile/addresses
- [x] POST /api/listers/profile/avatar
- [x] GET /api/listers/profile/business
- [x] PUT /api/listers/profile/business
- [x] GET /api/listers/verifications/status
- [x] GET /api/listers/verifications/documents
- [x] POST /api/listers/verifications/nin
- [x] GET /api/listers/verifications/bvn
- [x] PUT /api/listers/verifications/emergency-contact
- [x] POST /api/listers/security/password
- [x] GET /api/listers/notifications/preferences
- [x] PUT /api/listers/notifications/preferences

**Total Endpoints: 45**
**Dashboard Endpoints: 4**
**Order Management Endpoints: 7**
**Wallet Management Endpoints: 7**
**Dispute Management Endpoints: 12**
**Settings Management Endpoints: 15**

**Once endpoints are created:** Remove completed items from this file and move them to connection phase.
