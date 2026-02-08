# Missing API Endpoints - NXAPI

**Status:** Awaiting Backend Implementation
**Last Updated:** 2026-02-08

---

## Admin Dashboard Analytics

### 1. GET /api/admin/analytics/stats

**Location:** `src/app/admin/[id]/dashboard/`

- Components: AnalyticsHeader, AnalyticsStats

**UX Explanation:**
Admins need real-time metrics to monitor platform health and performance. This endpoint provides KPI cards that display:

- Total rentals processed
- Total revenue generated
- Active product listings
- Ongoing disputes count
- Active user count
- Average delivery time

The header dropdown allows filtering by timeframe:

- **All Time** → Shows cumulative statistics
- **1 Year** → Shows stats for the past 12 months (with secondary dropdown to select specific year)
- **1 Month** → Shows stats for current/selected month (with secondary dropdown to select specific month & year)

This helps admins track growth trends, identify peak periods, and monitor platform health over different time periods.

**Request Format:**

```json
GET /api/admin/analytics/stats?timeframe=all_time
GET /api/admin/analytics/stats?timeframe=year&year=2026
GET /api/admin/analytics/stats?timeframe=month&month=02&year=2026
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "totalRentals": 2847,
    "totalRevenue": 12400000, // in naira
    "activeListings": 1234,
    "activeDisputes": 23,
    "activeUsers": 5692,
    "avgDeliveryTime": 3.2, // in days
    "timeframe": "all_time",
    "period": "All Time"
  }
}
```

---

### 2. GET /api/admin/analytics/rentals-revenue-trend

**Location:** `src/app/admin/[id]/dashboard/components/RentalsRevenueTrend.tsx`

**UX Explanation:**
Admins need to visualize platform activity trends over time to understand seasonal patterns, growth trajectories, and revenue correlations with rental volume. This dual-axis chart shows:

- **Left axis:** Number of rentals (area chart in light color)
- **Right axis:** Revenue in thousands (line chart in amber/orange)

This helps admins identify:

- Peak rental seasons
- Revenue correlation with rental volume
- Anomalies or drop-offs in activity
- Business health trends

Data should match the timeframe selection from the analytics header.

**Request Format:**

```json
GET /api/admin/analytics/rentals-revenue-trend?timeframe=all_time
GET /api/admin/analytics/rentals-revenue-trend?timeframe=year&year=2026
GET /api/admin/analytics/rentals-revenue-trend?timeframe=month&month=02&year=2026
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "trend": [
      {
        "month": "Dec",
        "rentals": 500,
        "revenue": 3.5 // in millions
      },
      {
        "month": "Jan",
        "rentals": 700,
        "revenue": 4.5
      },
      {
        "month": "Feb",
        "rentals": 730,
        "revenue": 5.5
      }
      // ... more months
    ],
    "timeframe": "year",
    "year": 2026
  }
}
```

---

### 3. GET /api/admin/analytics/category-breakdown

**Location:** `src/app/admin/[id]/dashboard/components/CategoryBreakdown.tsx`

**UX Explanation:**
Admins need to understand which product categories are most popular by **quantity** (number of products listed and rented), not revenue. This bar chart helps:

- Identify which categories drive the most activity
- Decide on category-specific support, promotions, or features
- Allocate resources based on category demand
- Spot underperforming categories that need attention

The chart displays quantity of products per category to help inventory and curation decisions.

**Request Format:**

```json
GET /api/admin/analytics/category-breakdown?timeframe=all_time
GET /api/admin/analytics/category-breakdown?timeframe=year&year=2026
GET /api/admin/analytics/category-breakdown?timeframe=month&month=02&year=2026
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "breakdown": [
      {
        "category": "Dresses",
        "quantity": 1300 // Total products in this category
      },
      {
        "category": "Bags",
        "quantity": 700
      },
      {
        "category": "Shoes",
        "quantity": 550
      },
      {
        "category": "Jewelry",
        "quantity": 280
      },
      {
        "category": "Accessories",
        "quantity": 100
      }
    ],
    "timeframe": "all_time"
  }
}
```

---

### 4. GET /api/admin/analytics/revenue-by-category

**Location:** `src/app/admin/[id]/dashboard/components/RevenueByCategory.tsx`

**UX Explanation:**
Admins need to understand **revenue distribution** across categories to make pricing, commission, and strategic decisions. This pie chart shows:

- What percentage of total revenue comes from each category
- Which categories are most profitable
- Revenue concentration (whether revenue is diversified or concentrated in few categories)

This data helps with:

- Category-specific commission or fee strategies
- Marketing spend allocation
- Partnership prioritization
- Business strategy decisions

**Request Format:**

```json
GET /api/admin/analytics/revenue-by-category?timeframe=all_time
GET /api/admin/analytics/revenue-by-category?timeframe=year&year=2026
GET /api/admin/analytics/revenue-by-category?timeframe=month&month=02&year=2026
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "revenue": [
      {
        "category": "Dresses",
        "percentage": 42,
        "amount": 5208000 // in naira
      },
      {
        "category": "Bags",
        "percentage": 28,
        "amount": 3472000
      },
      {
        "category": "Shoes",
        "percentage": 18,
        "amount": 2232000
      },
      {
        "category": "Jewelry",
        "percentage": 4,
        "amount": 496000
      },
      {
        "category": "Accessories",
        "percentage": 8,
        "amount": 992000
      }
    ],
    "totalRevenue": 12400000,
    "timeframe": "all_time"
  }
}
```

---

## Admin User Detail & Analysis

### 5. GET /api/admin/users/:userId

**Location:** `src/app/admin/[id]/users/[userId]/`

- Components: UserProfileOverview (Summary tab)

**UX Explanation:**
Admins need comprehensive user profile information to understand user behavior, verify identity, and manage user accounts. This endpoint provides:

- Complete user identification (name, email, phone, avatar)
- Account status and join date
- KYC (Know Your Customer) verification details for compliance
- Emergency contact information for support escalation
- Key metrics: wallet balance, total rentals, active disputes

This allows admins to:

- Assess user trustworthiness based on verification status
- Contact users for disputes or support issues
- Monitor account health and activity levels
- Make informed decisions about account suspension or verification

**Request Format:**

```json
GET /api/admin/users/:userId
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "id": "user_001",
    "name": "Chioma Adeyemi",
    "email": "chioma.adeyemi@example.com",
    "phone": "+234 812 345 6789",
    "avatar": "https://i.pravatar.cc/150?img=5",
    "status": "Active",
    "joinDate": "Oct 2024",
    "walletBalance": 125000,
    "totalRentals": 47,
    "activeDisputes": 1,
    "kyc": {
      "status": "Verified",
      "fullName": "Aba Victor Mazi, Ladi Phone",
      "nin": "22345678901",
      "bvn": "2275-5012-7282",
      "dateOfBirth": "August 2023",
      "idNumber": "22345678901"
    },
    "emergencyContact": {
      "fullName": "Gumil Nkqapert",
      "relationship": "Brother",
      "phone": "+234 812 345 6789",
      "address": "9 Banana Street Road, Hvy. Lagos"
    }
  }
}
```

---

### 6. GET /api/admin/users/:userId/rentals

**Location:** `src/app/admin/[id]/users/[userId]/components/UserRecords.tsx`

- Tab: Rentals

**UX Explanation:**
Admins need to see a user's complete rental history to:

- Track user behavior and rental patterns
- Investigate disputes related to specific rentals
- Monitor item condition and return status
- Identify problematic users (frequent late returns, damage claims)
- Understand user preferences and activity timeline

Each rental record shows the lifecycle of a transaction, helping admins intervene if needed.

**Request Format:**

```json
GET /api/admin/users/:userId/rentals?page=1&limit=20
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "rentals": [
      {
        "id": "rental_001",
        "itemName": "Gucci Blazer",
        "itemImage": "https://images.unsplash.com/photo-1591047990315-385546f5b3b9?w=100&h=100",
        "status": "Delivered",
        "returnDue": "Nov 12, 2024",
        "amount": 25000,
        "rentalDate": "Nov 5, 2024",
        "listerName": "John Doe"
      },
      {
        "id": "rental_002",
        "itemName": "Hermes Silk Scarf",
        "itemImage": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f",
        "status": "Return Due",
        "returnDue": "Nov 8, 2024",
        "amount": 18000,
        "rentalDate": "Oct 24, 2024",
        "listerName": "Jane Smith"
      }
    ],
    "total": 47,
    "page": 1,
    "limit": 20
  }
}
```

---

### 7. GET /api/admin/users/:userId/listings

**Location:** `src/app/admin/[id]/users/[userId]/components/UserListings.tsx`

- Tab: Listings

**UX Explanation:**
Admins need to view listings created by this user (if they're a Lister) to:

- Monitor item quality and authenticity
- Check for policy violations (prohibited items, fake products)
- Review approval status of listings
- Track earnings potential from their inventory
- Identify high-performing listers or problem areas

This helps maintain platform quality and identify top performers.

**Request Format:**

```json
GET /api/admin/users/:userId/listings?page=1&limit=20
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "listings": [
      {
        "id": "listing_001",
        "name": "Hermès Birkin 30",
        "image": "https://images.unsplash.com/photo-1548036328-c9fa89d128fa",
        "brand": "Hermès",
        "category": "Bags",
        "itemValue": 12500000,
        "dailyPrice": 85000,
        "status": "Active",
        "dateAdded": "Jan 15, 2025",
        "totalRentals": 12,
        "earnings": 1020000
      },
      {
        "id": "listing_002",
        "name": "Louis Vuitton Pochette",
        "image": "https://images.unsplash.com/photo-1548036328-c9fa89d128fa",
        "brand": "Louis Vuitton",
        "category": "Bags",
        "itemValue": 8500000,
        "dailyPrice": 60000,
        "status": "Active",
        "dateAdded": "Jan 10, 2025",
        "totalRentals": 8,
        "earnings": 480000
      }
    ],
    "total": 4,
    "page": 1,
    "limit": 20
  }
}
```

---

### 8. GET /api/admin/users/:userId/wallet

**Location:** `src/app/admin/[id]/users/[userId]/components/UserWallet.tsx`

- Tab: Wallet

**UX Explanation:**
Admins need to see the current wallet balance to:

- Verify user solvency (can they pay for rentals?)
- Monitor wallet health and balance trends
- Identify payment issues or frozen accounts
- Review earned funds (if they're a lister)
- Support customer service inquiries about account balance

This single endpoint returns the current balance; transactions are separate.

**Request Format:**

```json
GET /api/admin/users/:userId/wallet
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "userId": "user_001",
    "walletBalance": 125000,
    "currency": "NGN",
    "lastUpdated": "2026-02-08T14:32:00Z"
  }
}
```

---

### 9. GET /api/admin/users/:userId/transactions

**Location:** `src/app/admin/[id]/users/[userId]/components/UserWallet.tsx`

- Tab: Wallet (Transactions Table)

**UX Explanation:**
Admins need detailed transaction history to:

- Audit financial activity
- Investigate payment disputes or failed transactions
- Understand user spending/earning patterns
- Identify suspicious activity (fraud detection)
- Help users resolve payment issues
- Track refunds, deposits, fees, and earnings

Each transaction shows the flow of money in/out of the user's wallet.

**Request Format:**

```json
GET /api/admin/users/:userId/transactions?page=1&limit=20
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "txn_001",
        "date": "Nov 5, 2024",
        "description": "Rental Payment - Gucci Blazer",
        "type": "Debit",
        "amount": 25000,
        "status": "Successful",
        "relatedRentalId": "rental_001"
      },
      {
        "id": "txn_002",
        "date": "Nov 3, 2024",
        "description": "Wallet Top-up",
        "type": "Credit",
        "amount": 50000,
        "status": "Successful",
        "paymentMethod": "Bank Transfer"
      },
      {
        "id": "txn_003",
        "date": "Oct 25, 2024",
        "description": "Late Return Fee",
        "type": "Debit",
        "amount": 6000,
        "status": "Failed",
        "relatedRentalId": "rental_002"
      }
    ],
    "total": 15,
    "page": 1,
    "limit": 20
  }
}
```

---

### 10. GET /api/admin/users/:userId/disputes

**Location:** `src/app/admin/[id]/users/[userId]/components/UserDisputes.tsx`

- Tab: Disputes

**UX Explanation:**
Admins need access to user's dispute history to:

- Assess user reliability (how many disputes? Are they the complainant or respondent?)
- Understand conflict patterns
- Make informed decisions about account action
- Provide context when responding to support tickets
- Identify repeat problem users

Disputes are critical for determining user trustworthiness and platform risk.

**Request Format:**

```json
GET /api/admin/users/:userId/disputes?page=1&limit=20
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "disputes": [
      {
        "id": "D001",
        "disputeId": "D001",
        "itemName": "Hermes Silk Scarf",
        "itemId": "listing_001",
        "status": "Open",
        "dateOpened": "Nov 4, 2024",
        "reason": "Item damaged upon return",
        "party": "Dresser",
        "relatedUserId": "user_002"
      },
      {
        "id": "D002",
        "disputeId": "D002",
        "itemName": "Prada Handbag",
        "itemId": "listing_002",
        "status": "Resolved",
        "dateOpened": "Oct 20, 2024",
        "reason": "Late return",
        "party": "Lister",
        "relatedUserId": "user_003",
        "resolution": "Full refund issued"
      }
    ],
    "total": 2,
    "page": 1,
    "limit": 20
  }
}
```

---

### 11. GET /api/admin/users/:userId/favorites

**Location:** `src/app/admin/[id]/users/[userId]/components/SavedItems.tsx`

- Tab: Favorites (Saved Items)

**UX Explanation:**
Admins need to see what items users have saved/favorited to:

- Understand user preferences and shopping behavior
- Identify product trends that resonate with users
- Track which items are popular (high save count)
- Support listers with demand insights
- Help with customer service (reference user's wishlist)

This shows what users are interested in but haven't rented yet.

**Request Format:**

```json
GET /api/admin/users/:userId/favorites?page=1&limit=20
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "favorites": [
      {
        "id": "fav_001",
        "productId": "listing_001",
        "image": "https://images.unsplash.com/photo-1594938298603-c8148c4dae35",
        "brand": "GUCCI",
        "title": "Classic Easy Zipper Tote",
        "salePrice": 65000,
        "retailPrice": 3800000,
        "savedDate": "Jan 15, 2025",
        "status": "Available"
      },
      {
        "id": "fav_002",
        "productId": "listing_002",
        "image": "https://images.unsplash.com/photo-1548036328-c9fa89d128fa",
        "brand": "DOLCE & GABBANA",
        "title": "Concertina Phone Bag",
        "rentalPrice": 50000,
        "retailPrice": 800000,
        "savedDate": "Jan 12, 2025",
        "status": "Available"
      }
    ],
    "total": 4,
    "page": 1,
    "limit": 20
  }
}
```

---

## Implementation Notes

### Timeframe Parameters

All analytics endpoints should support:

- `timeframe=all_time` → No date restrictions
- `timeframe=year&year=2026` → Full year data (optional: month within year if needed)
- `timeframe=month&month=02&year=2026` → Specific month data

### Data Consistency

- All monetary values in **Nigerian Naira (₦)**
- Revenue in millions: e.g., 3.5 = ₦3,500,000
- Ensure all endpoints respect the selected timeframe consistently
- Data should be aggregated from the rental transactions table

### Performance Considerations

- Consider caching aggregated data for large timeframes
- Use database indexes on date fields for fast filtering
- Consider pre-aggregating monthly/yearly data for faster queries

---

## Admin Orders Management

**Key Concept:** When a customer checks out multiple items, each item creates a **separate order record** but they share the same **payment reference**. This allows:

- Individual tracking of each item's rental period and return
- Separate items can have different statuses
- But they're linked via payment reference for financial reconciliation

### 12. GET /api/admin/orders

**Location:** `src/app/admin/[id]/orders/page.tsx`

- Main page with search, filters, tabs, and order listing

**UX Explanation:**
Admins need a comprehensive order management dashboard to:

- Monitor all rental orders across the platform
- Search for specific orders by order ID, dresser name, or curator name
- Filter orders by status (Preparing, In Transit, Delivered, Return Due, Return Pickup, Disputed)
- View summary stats (total listings, completed orders, active orders, disputed orders, revenue)
- Categorize orders into tabs: Active, Completed, Rejected
- Export order data for reporting

This is the hub for order management and oversight.

**Request Format:**

```json
GET /api/admin/orders?page=1&limit=20&search=&status=All&tab=active
GET /api/admin/orders?page=1&limit=20&search=Grace&status=In Transit
GET /api/admin/orders?page=1&limit=20&status=Disputed&tab=all
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "#RL5-23894",
        "date": "Oct 10, 2025",
        "curator": {
          "id": "curator_001",
          "name": "Grace Adebayo",
          "avatar": "https://..."
        },
        "dresser": {
          "id": "dresser_001",
          "name": "Chioma Eze",
          "avatar": "https://..."
        },
        "items": 3,
        "total": 300000,
        "status": "In Transit",
        "returnDue": "Oct 15, 2025",
        "paymentReference": "PAY-20251010-001"
      }
    ],
    "pagination": {
      "total": 245,
      "page": 1,
      "limit": 20,
      "pages": 13
    },
    "stats": {
      "totalListings": 6,
      "completedOrders": 2,
      "activeOrders": 2,
      "disputedOrders": 2,
      "totalRevenue": 500000
    }
  }
}
```

---

### 13. GET /api/admin/orders/:orderId

**Location:** `src/app/admin/[id]/orders/components/OrderDetailModal.tsx`

- Used by all OrderSection components (1-4)

**UX Explanation:**
When an admin clicks "View Details" on an order, they need the complete order information including:

- Order metadata (id, date, status, return due date)
- Curator information (name, email, avatar, contact)
- Dresser information (name, email, phone, avatar, contact)
- Item details (what was rented)
- Shipping/logistics (tracking ID, courier, rental period)
- Complete payment breakdown (subtotal, fees, total)
- Activity log (timeline of order events)

All this data is needed for:

- Investigating disputes
- Supporting customer inquiries
- Verifying payment and delivery status
- Making administrative decisions (cancellations, refunds via disputes)

**Request Format:**

```json
GET /api/admin/orders/:orderId
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "id": "#RL5-23894",
    "date": "Oct 10, 2025",
    "paymentReference": "PAY-20251010-001",
    "status": "In Transit",
    "returnDue": "Oct 15, 2025",
    "curator": {
      "id": "curator_001",
      "name": "Grace Adebayo",
      "email": "grace@example.com",
      "phone": "+234 812 345 6789",
      "avatar": "https://..."
    },
    "dresser": {
      "id": "dresser_001",
      "name": "Chioma Eze",
      "email": "chioma@example.com",
      "phone": "+234 907 654 3210",
      "avatar": "https://..."
    },
    "items": [
      {
        "id": "item_001",
        "name": "Hermès Birkin",
        "image": "https://...",
        "brand": "Hermès",
        "dailyPrice": 85000,
        "rentalDays": 5,
        "subtotal": 425000
      },
      {
        "id": "item_002",
        "name": "Gucci Blazer",
        "image": "https://...",
        "brand": "Gucci",
        "dailyPrice": 35000,
        "rentalDays": 5,
        "subtotal": 175000
      }
    ],
    "shipping": {
      "rentalPeriod": "5 days",
      "trackingId": "TRK-4589Z301",
      "courier": "DHL Express",
      "pickupDate": "Oct 11, 2025",
      "expectedDelivery": "Oct 13, 2025"
    },
    "payment": {
      "subtotal": 600000,
      "serviceFee": 60000,
      "deliveryFee": 5000,
      "insurance": 10000,
      "total": 675000,
      "paymentStatus": "Escrowed"
    },
    "activity": [
      {
        "id": "act_001",
        "title": "Order placed",
        "timestamp": "Oct 10, 2025 - 2:30 PM",
        "actor": "Chioma Eze",
        "type": "customer_action"
      },
      {
        "id": "act_002",
        "title": "Payment confirmed",
        "timestamp": "Oct 10, 2025 - 2:31 PM",
        "actor": "System",
        "type": "system_action"
      },
      {
        "id": "act_003",
        "title": "Order approved by Curator",
        "timestamp": "Oct 10, 2025 - 3:50 PM",
        "actor": "Grace Adebayo",
        "type": "curator_action"
      }
    ]
  }
}
```

---

### 14. GET /api/admin/orders/stats

**Location:** `src/app/admin/[id]/orders/page.tsx`

- Stat cards on the orders list page

**UX Explanation:**
Summary statistics help admins quickly assess order volume and health:

- Total Listings: How many items on the platform
- Completed Orders: Successfully finished rentals
- Active Orders: Current in-progress orders
- Disputed Orders: Orders with issues needing resolution
- Revenue: Total revenue from rental orders

These stats should update dynamically based on selected filters/timeframe.

**Request Format:**

```json
GET /api/admin/orders/stats?timeframe=all_time
GET /api/admin/orders/stats?timeframe=month&month=02&year=2026
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "totalListings": 6,
    "completedOrders": 2,
    "activeOrders": 2,
    "disputedOrders": 2,
    "totalRevenue": 500000,
    "timeframe": "all_time"
  }
}
```

---

### 15. PUT /api/admin/orders/:orderId/status

**Location:** `src/app/admin/[id]/orders/components/OrderSection1.tsx`

- "Update Status" button

**UX Explanation:**
Admins can manually update order status to:

- Correct data entry errors
- Manually confirm delivery if automated tracking isn't available
- Mark items as return due
- Initiate return pickup
- Handle edge cases where automatic status updates may have failed

Valid status transitions:

- Preparing → In Transit
- In Transit → Delivered
- Delivered → Return Due
- Return Due → Return Pickup
- Return Pickup → Completed
- Any → Disputed (if issues arise)

**Request Format:**

```json
PUT /api/admin/orders/:orderId/status
{
  "status": "In Transit",
  "reason": "Manually updated by admin"
}
```

**Response Format:**

```json
{
  "success": true,
  "message": "Order status updated successfully",
  "data": {
    "orderId": "#RL5-23894",
    "previousStatus": "Preparing",
    "newStatus": "In Transit",
    "updatedAt": "2026-02-08T14:32:00Z",
    "updatedBy": "admin_001"
  }
}
```

---

### 16. POST /api/admin/orders/:orderId/cancel

**Location:** `src/app/admin/[id]/orders/components/OrderSection1.tsx`

- "Cancel Order" button

**UX Explanation:**
Admins need to cancel orders when:

- Customer requests cancellation before fulfillment
- Items are no longer available
- Technical/system errors require order reset
- Fraud or policy violations detected

When cancelled:

- Both curator and dresser are notified
- Payment is released from escrow (refunded)
- Order cannot be re-activated
- Activity log documents the cancellation

Only allows cancellation if order status is "Preparing" or before items ship.

**Request Format:**

```json
POST /api/admin/orders/:orderId/cancel
{
  "reason": "Items no longer available",
  "notifyParties": true
}
```

**Response Format:**

```json
{
  "success": true,
  "message": "Order cancelled successfully",
  "data": {
    "orderId": "#RL5-23894",
    "status": "Cancelled",
    "refundAmount": 675000,
    "refundStatus": "Processed",
    "notificationsSent": {
      "curator": true,
      "dresser": true
    },
    "cancelledAt": "2026-02-08T14:35:00Z",
    "cancelledBy": "admin_001"
  }
}
```

---

### 17. GET /api/admin/orders/:orderId/activity

**Location:** `src/app/admin/[id]/orders/components/OrderSection4.tsx`

- Activity log timeline

**UX Explanation:**
The activity log shows a complete timeline of events for an order to:

- Track order progress visually
- Identify when issues occurred
- Understand what actions were taken and by whom
- Audit trail for compliance

Includes events like:

- Order placement
- Payment processing
- Curator approval
- Shipment pickup
- Delivery
- Return processing
- Disputes
- Admin actions (status changes, cancellations)

**Request Format:**

```json
GET /api/admin/orders/:orderId/activity
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "events": [
      {
        "id": "evt_001",
        "timestamp": "2025-10-10T14:30:00Z",
        "title": "Order placed",
        "description": "Customer created order with 3 items",
        "actor": {
          "id": "dresser_001",
          "name": "Chioma Eze",
          "role": "dresser"
        },
        "type": "customer_action"
      },
      {
        "id": "evt_002",
        "timestamp": "2025-10-10T14:31:00Z",
        "title": "Payment confirmed",
        "description": "Payment of ₦675,000 escrowed",
        "actor": {
          "id": "system",
          "name": "System",
          "role": "system"
        },
        "type": "system_action"
      },
      {
        "id": "evt_003",
        "timestamp": "2025-10-10T15:50:00Z",
        "title": "Order approved by Curator",
        "description": "All items confirmed available and prepared",
        "actor": {
          "id": "curator_001",
          "name": "Grace Adebayo",
          "role": "curator"
        },
        "type": "curator_action"
      }
    ],
    "orderId": "#RL5-23894"
  }
}
```

---

### 18. GET /api/admin/orders/export

**Location:** `src/app/admin/[id]/orders/page.tsx`

- Export button in search bar

**UX Explanation:**
Admins need to export order data for:

- Reporting to stakeholders
- Financial audits
- Data analysis
- Backup and archiving
- Integration with external systems

Export should include all visible columns and respect applied filters.

**Request Format:**

```json
GET /api/admin/orders/export?format=csv&status=All&tab=active&dateRange=all_time
GET /api/admin/orders/export?format=xlsx&search=Grace&status=In Transit
```

**Response Format:**

```
[Binary CSV/XLSX file]

Headers: Order ID, Date, Curator, Dresser, Items, Total, Status, Return Due, Payment Ref
```

---

## Implementation Notes for Orders

### Key Relationships

- Orders are **per-item**: If customer rents 3 items, they create 3 separate orders
- Orders share **payment reference**: All 3 orders link to same PAY-20251010-001
- This allows individual item tracking while maintaining payment cohesion

### Status Lifecycle

```
Preparing → In Transit → Delivered → Return Due → Return Pickup → Completed
                ↓                           ↓
              Disputed ←────────────────────┘
```

### Search Capability

Search should work across:

- Order ID (#RL5-23894)
- Curator name
- Dresser name
- Item names (if indexed)

### Payment Status Notes

- **Escrowed**: Payment held pending delivery
- **Released**: Payment given to curator after return received
- **Refunded**: Payment returned to dresser if order cancelled

### Pagination

All list endpoints support pagination:

- `?page=1&limit=20` for page 1, 20 items per page
- Use `total` and `pages` for pagination UI

---

## Status Tracking

- [ ] GET /api/admin/analytics/stats
- [ ] GET /api/admin/analytics/rentals-revenue-trend
- [ ] GET /api/admin/analytics/category-breakdown
- [ ] GET /api/admin/analytics/revenue-by-category
- [ ] GET /api/admin/users/:userId
- [ ] GET /api/admin/users/:userId/rentals
- [ ] GET /api/admin/users/:userId/listings
- [ ] GET /api/admin/users/:userId/wallet
- [ ] GET /api/admin/users/:userId/transactions
- [ ] GET /api/admin/users/:userId/disputes
- [ ] GET /api/admin/users/:userId/favorites
- [ ] GET /api/admin/orders
- [ ] GET /api/admin/orders/stats
- [ ] GET /api/admin/orders/:orderId
- [ ] PUT /api/admin/orders/:orderId/status
- [ ] POST /api/admin/orders/:orderId/cancel
- [ ] GET /api/admin/orders/:orderId/activity
- [ ] GET /api/admin/orders/export

**Once endpoints are created:** Remove completed items from this file and move them to connection phase.
