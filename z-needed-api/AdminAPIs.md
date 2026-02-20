# Missing API Endpoints - NXAPI

**Status:** Awaiting Backend Implementation
**Last Updated:** 2026-02-08

## Admin Product Management

All product management endpoints are now under `/api/admin/products`. These endpoints allow admins to view, search, filter, approve, reject, delete, and manage product listings.
---

### 1. GET /api/admin/products/statistics

**Purpose:** Fetch statistics for all product listings (total, pending, approved, rejected, active).

**Request Example:**

```
GET /api/admin/products/statistics
```

**Response:**

```
{
  "success": true,
  "data": {
    "getTotalProducts": { "count": 1200 },
    "getPendingProducts": { "count": 100, "products": [...] },
    "getApprovedProducts": { "count": 900, "products": [...] },
    "getRejectedProducts": { "count": 50, "products": [...] },
    "getActiveProducts": { "count": 150, "products": [...] }
  }
}
```

---

### 2. GET /api/admin/products/pending

**Purpose:** Fetch all pending product listings.

**Request Example:**

```
GET /api/admin/products/pending?page=1&count=20
```

**Response:**

```
{
  "success": true,
  "data": { "products": [...] }
}
```

---

### 3. GET /api/admin/products/approved

**Purpose:** Fetch all approved product listings.

**Request Example:**

```
GET /api/admin/products/approved?page=1&count=20
```

**Response:**

```
{
  "success": true,
  "data": { "products": [...] }
}
```

---

### 4. GET /api/admin/products/rejected

**Purpose:** Fetch all rejected product listings.

**Request Example:**

```
GET /api/admin/products/rejected?page=1&count=20
```

**Response:**

```
{
  "success": true,
  "data": { "products": [...] }
}
```

---

### 5. PATCH /api/admin/products/:productId/approve

**Purpose:** Approve a product listing.

**Request Example:**

```
PATCH /api/admin/products/12345/approve
```

**Response:**

```
{
  "success": true,
  "data": { ...updated product... }
}
```

---

### 6. PATCH /api/admin/products/:productId/reject

**Purpose:** Reject a product listing with a comment.

**Request Example:**

```
PATCH /api/admin/products/12345/reject
{
  "rejectionComment": "Item is not authentic."
}
```

**Response:**

```
{
  "success": true,
  "data": { ...updated product... }
}
```

---

### 7. PATCH /api/admin/products/:productId/availability

**Purpose:** Toggle product availability (active/inactive).

**Request Example:**

```
PATCH /api/admin/products/12345/availability
{
  "isAvailable": false
}
```

**Response:**

```
{
  "success": true,
  "data": { ...updated product... }
}
```

---

### 8. DELETE /api/admin/products/:productId

**Purpose:** Delete a product listing.

**Request Example:**

```
DELETE /api/admin/products/12345
```

**Response:**

```
{
  "success": true,
  "message": "Product deleted"
}
```

---

## UI Actions & Integration Notes

- **Approve/Reject/Delete Listing:** Buttons in ListingDetailModal call PATCH/DELETE endpoints above.
- **Search, Filter, Tabs:** Use query params on GET endpoints.
- **Availability Toggle:** Calls PATCH endpoint for availability.
- **All hooks, queries, and mutations use /admin/products route.**
- Add new endpoints to docs as new UI actions are implemented.

---



---

## Admin User Management

All user management endpoints are now under `/api/admin/users`. These endpoints allow admins to view, search, filter, suspend, and unsuspend users, as well as access detailed user information.

---

### 1. GET /api/admin/users/all

**Purpose:** Fetch all users with optional pagination, search, and status filters.

**Request Example:**

```
GET /api/admin/users/all?page=1&count=100&search=Grace&status=Active&role=LISTER
```

**Response:**

```
{
  "success": true,
  "data": {
    "users": [ ... ],
    "total": 120,
    "page": 1,
    "count": 100
  }
}
```

---

### 2. GET /api/admin/users/:userId

**Purpose:** Fetch detailed information for a specific user.

**Request Example:**

```
GET /api/admin/users/12345
```

**Response:**

```
{
  "success": true,
  "data": { ...user details... }
}
```

---

### 3. PATCH /api/admin/users/:userId/suspend

**Purpose:** Suspend a user account.

**Request Example:**

```
PATCH /api/admin/users/12345/suspend
```

**Response:**

```
{
  "success": true,
  "data": { ...updated user... }
}
```

---

### 4. PATCH /api/admin/users/:userId/unsuspend

**Purpose:** Unsuspend a user account.

**Request Example:**

```
PATCH /api/admin/users/12345/unsuspend
```

**Response:**

```
{
  "success": true,
  "data": { ...updated user... }
}
```

---

## UI Actions & Missing Endpoints

- **Suspend/Unsuspend Button:** Calls PATCH endpoints above.
- **Search, Filter, Tabs:** Use query params on GET /all.
- **User Details Modal:** Uses GET /:userId.

If any new UI actions are added (e.g., delete user, reset password), add corresponding endpoints:

### 5. DELETE /api/admin/users/:userId

**Purpose:** Delete a user account.

**Request Example:**

```
DELETE /api/admin/users/12345
```

**Response:**

```
{
  "success": true,
  "message": "User deleted"
}
```

### 6. POST /api/admin/users/:userId/reset-password

**Purpose:** Reset a user's password (admin action).

**Request Example:**

```
POST /api/admin/users/12345/reset-password
{
  "newPassword": "secure123!"
}
```

**Response:**

```
{
  "success": true,
  "message": "Password reset"
}
```

---

**Note:** All endpoints require admin authentication.

---

## Integration Notes

- All hooks, queries, and mutations should use the new `/admin/users` route.
- UI actions (buttons, modals) must call the correct endpoint.
- Add new endpoints to docs as new UI actions are implemented.

---

**Backend devs:** See this file for endpoint specs and update implementation accordingly.

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

### 5. GET /api/admin/analytics/top-curators

**Location:** `src/app/admin/[id]/dashboard/components/TopCurators.tsx`

**UX Explanation:**
Show the highest-performing curators (listers) on the platform ranked by:

- Number of successful rentals completed
- Total revenue generated

This helps admins identify:

- Most trusted and active sellers
- Performance trends
- Potential influencers/ambassadors
- Users for case studies or featured listings

**Request Format:**

```json
GET /api/admin/analytics/top-curators?limit=5
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "topCurators": [
      {
        "id": "curator_001",
        "name": "Anita Cole",
        "avatar": "https://...",
        "rentals": 132,
        "revenue": 820000,
        "rating": 4.8
      },
      {
        "id": "curator_002",
        "name": "Blessing Okafor",
        "avatar": "https://...",
        "rentals": 118,
        "revenue": 745000,
        "rating": 4.7
      },
      {
        "id": "curator_003",
        "name": "Chioma Eze",
        "avatar": "https://...",
        "rentals": 97,
        "revenue": 680000,
        "rating": 4.6
      },
      {
        "id": "curator_004",
        "name": "Fatima Bello",
        "avatar": "https://...",
        "rentals": 89,
        "revenue": 590000,
        "rating": 4.5
      },
      {
        "id": "curator_005",
        "name": "Grace Adebayo",
        "avatar": "https://...",
        "rentals": 76,
        "revenue": 520000,
        "rating": 4.4
      }
    ],
    "generatedAt": "2026-02-08T10:30:00Z"
  }
}
```

---

### 6. GET /api/admin/analytics/top-items

**Location:** `src/app/admin/[id]/dashboard/components/TopItems.tsx`

**UX Explanation:**
Display the most popular and profitable items on the platform:

- Item name and category
- Total earnings generated from that item being rented

This helps admins:

- Understand product demand and trends
- Identify high-value categories
- Make recommendations to curators about what to list
- Plan marketing campaigns around bestsellers

**Request Format:**

```json
GET /api/admin/analytics/top-items?limit=5
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "topItems": [
      {
        "id": "item_001",
        "name": "Fendi Arco Boots",
        "category": "Shoes",
        "image": "https://...",
        "totalEarnings": 230000,
        "rentals": 45,
        "rating": 4.9,
        "curator": {
          "id": "curator_002",
          "name": "Blessing Okafor"
        }
      },
      {
        "id": "item_002",
        "name": "Chanel Classic Flap",
        "category": "Bags",
        "image": "https://...",
        "totalEarnings": 420000,
        "rentals": 78,
        "rating": 4.8,
        "curator": {
          "id": "curator_001",
          "name": "Anita Cole"
        }
      },
      {
        "id": "item_003",
        "name": "Versace Silk Dress",
        "category": "Dresses",
        "image": "https://...",
        "totalEarnings": 385000,
        "rentals": 62,
        "rating": 4.7,
        "curator": {
          "id": "curator_003",
          "name": "Chioma Eze"
        }
      },
      {
        "id": "item_004",
        "name": "Gucci Loafers",
        "category": "Shoes",
        "image": "https://...",
        "totalEarnings": 195000,
        "rentals": 38,
        "rating": 4.6,
        "curator": {
          "id": "curator_004",
          "name": "Fatima Bello"
        }
      },
      {
        "id": "item_005",
        "name": "Dior Saddle Bag",
        "category": "Bags",
        "image": "https://...",
        "totalEarnings": 340000,
        "rentals": 55,
        "rating": 4.8,
        "curator": {
          "id": "curator_005",
          "name": "Grace Adebayo"
        }
      }
    ],
    "generatedAt": "2026-02-08T10:30:00Z"
  }
}
```

---

## Admin User Detail & Analysis

### 7. GET /api/admin/users/:userId

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

### 8. GET /api/admin/users/:userId/rentals

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

### 9. GET /api/admin/users/:userId/listings

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

### 10. GET /api/admin/users/:userId/wallet

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

### 12. GET /api/admin/users/:userId/disputes

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

### 13. GET /api/admin/users/:userId/favorites

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

### 14. GET /api/admin/orders

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

### 15. GET /api/admin/orders/:orderId

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

### 19. GET /api/admin/orders/:orderId/activity

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

### 20. GET /api/admin/orders/export

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

## Admin Settings Management

**5 Tabs:** Profile & Security, Platform Controls, Roles & Permissions, Admin Management, Audit Logs

### 21. GET /api/admin/settings/profile

**Location:** `src/app/admin/[id]/settings/` components: UserHeader, ProfileSecurityTab

**UX Explanation:**
Admins need to view and manage their own profile information including:

- Current admin profile (name, email, phone, avatar)
- Account status and role
- Last login information
- Profile edit capability (photo, name, password)

This helps admins manage their own account settings and security.

**Request Format:**

```json
GET /api/admin/settings/profile
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "id": "admin_001",
    "name": "Jane Graham",
    "email": "admin@relisted.com",
    "phone": "+234 801 234 5678",
    "avatar": "https://...",
    "role": "Super Admin",
    "status": "Active",
    "lastLogin": "2026-02-08T10:30:00Z",
    "createdAt": "2025-10-01T08:00:00Z"
  }
}
```

---

### 20. PUT /api/admin/settings/profile

**Location:** `src/app/admin/[id]/settings/components/ProfileSecurityTab.tsx`

- "Save Profile" button

**UX Explanation:**
Admins need to update their profile information (name, email, phone) without affecting their admin permissions.

**Request Format:**

```json
PUT /api/admin/settings/profile
{
  "name": "Jane Graham",
  "email": "admin@relisted.com",
  "phone": "+234 801 234 5678"
}
```

**Response Format:**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "admin_001",
    "name": "Jane Graham",
    "email": "admin@relisted.com",
    "phone": "+234 801 234 5678",
    "updatedAt": "2026-02-08T14:32:00Z"
  }
}
```

---

### 21. PUT /api/admin/settings/profile/photo

**Location:** `src/app/admin/[id]/settings/components/ChangePhotoModal.tsx`

- "Change Photo" modal button

**UX Explanation:**
Admins can upload a new profile photo for their account. Photo should be cropped and validated.

**Request Format:**

```json
PUT /api/admin/settings/profile/photo
[FormData with image file]
```

**Response Format:**

```json
{
  "success": true,
  "message": "Profile photo updated",
  "data": {
    "avatar": "https://...",
    "updatedAt": "2026-02-08T14:32:00Z"
  }
}
```

---

### 22. PUT /api/admin/settings/profile/password

**Location:** `src/app/admin/[id]/settings/components/ChangePasswordModal.tsx`

- "Update Password" button

**UX Explanation:**
Admins must be able to change their password securely. Requires current password verification.

**Request Format:**

```json
PUT /api/admin/settings/profile/password
{
  "currentPassword": "old_password_here",
  "newPassword": "new_password_here",
  "confirmPassword": "new_password_here"
}
```

**Response Format:**

```json
{
  "success": true,
  "message": "Password changed successfully",
  "data": {
    "adminId": "admin_001",
    "changedAt": "2026-02-08T14:32:00Z"
  }
}
```

---

### 23. PUT /api/admin/settings/profile/2fa

**Location:** `src/app/admin/[id]/settings/components/ProfileSecurityTab.tsx`

- 2FA toggle button

**UX Explanation:**
Admins can enable/disable Two-Factor Authentication for enhanced account security.

**Request Format:**

```json
PUT /api/admin/settings/profile/2fa
{
  "enabled": true
}
```

**Response Format:**

```json
{
  "success": true,
  "message": "Two-Factor Authentication updated",
  "data": {
    "twoFactorEnabled": true,
    "updatedAt": "2026-02-08T14:32:00Z"
  }
}
```

---

### 24. GET /api/admin/settings/profile/devices

**Location:** `src/app/admin/[id]/settings/components/ProfileSecurityTab.tsx`

- "Logged-in Devices" section

**UX Explanation:**
Admins need to see all devices where they're currently logged in to:

- Identify unauthorized access attempts
- Manually log out specific devices if compromised
- Manage active sessions

Shows device type (laptop, phone), location, and last activity.

**Request Format:**

```json
GET /api/admin/settings/profile/devices
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "devices": [
      {
        "id": "dev_001",
        "type": "Laptop",
        "name": "MacBook Pro 16\"",
        "osVersion": "macOS 14.1",
        "browser": "Chrome 120",
        "ipAddress": "192.168.1.100",
        "location": "Lagos, Nigeria",
        "lastActive": "2 days ago",
        "isCurrent": true
      },
      {
        "id": "dev_002",
        "type": "Smartphone",
        "name": "iPhone 14 Pro",
        "osVersion": "iOS 17",
        "browser": "Safari",
        "ipAddress": "192.168.1.101",
        "location": "Lagos, Nigeria",
        "lastActive": "1 hour ago",
        "isCurrent": false
      }
    ],
    "totalSessions": 2
  }
}
```

---

### 25. POST /api/admin/settings/profile/logout-all-devices

**Location:** `src/app/admin/[id]/settings/components/ProfileSecurityTab.tsx`

- "Log Out All Devices" button

**UX Explanation:**
Admins can force logout from all devices except the current one for security purposes:

- If account may be compromised
- After changing password
- Ending work sessions

This terminates all other active sessions immediately.

**Request Format:**

```json
POST /api/admin/settings/profile/logout-all-devices
{
  "exceptCurrentDevice": true
}
```

**Response Format:**

```json
{
  "success": true,
  "message": "Logged out from all devices successfully",
  "data": {
    "sessionsTerminated": 2,
    "currentSessionActive": true,
    "terminatedAt": "2026-02-08T14:32:00Z"
  }
}
```

---

### 26. GET /api/admin/settings/platform-controls

**Location:** `src/app/admin/[id]/settings/components/PlatformControlsTab.tsx`

**UX Explanation:**
Platform controls show all configurable settings that affect how the entire platform operates:

- Commission and fee structures
- Escrow and payout rules
- KYC requirements
- Platform access settings

These are critical financial and operational settings.

**Request Format:**

```json
GET /api/admin/settings/platform-controls
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "commissionAndFees": {
      "platformCommission": 15,
      "lateReturnFee": 5000,
      "damageFee": 50
    },
    "escrowAndPayout": {
      "escrowReleaseDelay": "24 Hours",
      "minimumPayoutThreshold": 10000
    },
    "kycRequirements": {
      "requireKycCurators": true,
      "requireKycDressers": false
    },
    "platformAccess": {
      "allowCuratorSignup": true,
      "allowDresserSignup": true
    },
    "lastUpdatedBy": "admin_001",
    "lastUpdatedAt": "2026-02-08T14:00:00Z"
  }
}
```

---

### 27. PUT /api/admin/settings/platform-controls

**Location:** `src/app/admin/[id]/settings/components/PlatformControlsTab.tsx`

- "Save Changes" buttons for each section

**UX Explanation:**
Admins can modify platform-wide settings to:

- Adjust pricing strategy (commission rates)
- Change financial rules (payout thresholds)
- Enforce identity requirements
- Control who can join the platform

Changes apply immediately to all future transactions.

**Request Format:**

```json
PUT /api/admin/settings/platform-controls
{
  "commissionAndFees": {
    "platformCommission": 15,
    "lateReturnFee": 5000,
    "damageFee": 50
  },
  "escrowAndPayout": {
    "escrowReleaseDelay": "24 Hours",
    "minimumPayoutThreshold": 10000
  },
  "kycRequirements": {
    "requireKycCurators": true,
    "requireKycDressers": false
  },
  "platformAccess": {
    "allowCuratorSignup": true,
    "allowDresserSignup": true
  }
}
```

**Response Format:**

```json
{
  "success": true,
  "message": "Platform controls updated successfully",
  "data": {
    "updatedFields": ["commissionAndFees", "escrowAndPayout"],
    "updatedAt": "2026-02-08T14:32:00Z",
    "updatedBy": "admin_001"
  }
}
```

---

### 28. GET /api/admin/settings/roles

**Location:** `src/app/admin/[id]/settings/components/RolesPermissionsTab.tsx`

**UX Explanation:**
Lists all admin roles configured in the system:

- Show role name, description, and number of admins with that role
- Allow editing permissions for each role
- Support creating new roles

**Request Format:**

```json
GET /api/admin/settings/roles
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "roles": [
      {
        "id": "role_001",
        "name": "Super Admin",
        "description": "Full system access and control",
        "adminCount": 2,
        "permissions": {
          "users": true,
          "listings": true,
          "orders": true,
          "disputes": true,
          "payments": true,
          "platformSettings": true
        },
        "createdAt": "2025-01-01T00:00:00Z"
      },
      {
        "id": "role_002",
        "name": "Admin",
        "description": "General administrative access",
        "adminCount": 5,
        "permissions": {
          "users": true,
          "listings": true,
          "orders": true,
          "disputes": true,
          "payments": false,
          "platformSettings": false
        },
        "createdAt": "2025-01-15T00:00:00Z"
      }
    ],
    "totalRoles": 4
  }
}
```

---

### 29. POST /api/admin/settings/roles

**Location:** `src/app/admin/[id]/settings/components/RolesPermissionsTab.tsx`

- "+ Add Role" button

**UX Explanation:**
Admins can create new custom roles with specific permission sets to:

- Assign different access levels to team members
- Control what operations each admin can perform
- Maintain security by limiting sensitive access

**Request Format:**

```json
POST /api/admin/settings/roles
{
  "name": "Operations Manager",
  "description": "Manage orders and disputes",
  "permissions": {
    "users": false,
    "listings": false,
    "orders": true,
    "disputes": true,
    "payments": false,
    "platformSettings": false
  }
}
```

**Response Format:**

```json
{
  "success": true,
  "message": "Role created successfully",
  "data": {
    "id": "role_003",
    "name": "Operations Manager",
    "description": "Manage orders and disputes",
    "permissions": {
      "users": false,
      "listings": false,
      "orders": true,
      "disputes": true,
      "payments": false,
      "platformSettings": false
    },
    "createdAt": "2026-02-08T14:32:00Z",
    "createdBy": "admin_001"
  }
}
```

---

### 30. PUT /api/admin/settings/roles/:roleId/permissions

**Location:** `src/app/admin/[id]/settings/components/RolesPermissionsTab.tsx`

- "Edit Permissions" button in role table

**UX Explanation:**
Modify permissions for an existing role without changing the role name or description. This affects all admins with that role.

**Request Format:**

```json
PUT /api/admin/settings/roles/:roleId/permissions
{
  "permissions": {
    "users": true,
    "listings": true,
    "orders": true,
    "disputes": true,
    "payments": false,
    "platformSettings": false
  }
}
```

**Response Format:**

```json
{
  "success": true,
  "message": "Role permissions updated successfully",
  "data": {
    "roleId": "role_002",
    "roleName": "Admin",
    "permissions": {
      "users": true,
      "listings": true,
      "orders": true,
      "disputes": true,
      "payments": false,
      "platformSettings": false
    },
    "adminsAffected": 5,
    "updatedAt": "2026-02-08T14:32:00Z",
    "updatedBy": "admin_001"
  }
}
```

---

### 31. GET /api/admin/settings/admins

**Location:** `src/app/admin/[id]/settings/components/AdminManagementTab.tsx`

**UX Explanation:**
View all admin users in the system with their:

- Name, email, role, status
- Last activity timestamp
- Recent actions they've taken
- Ability to view detailed profile or manage permissions

**Request Format:**

```json
GET /api/admin/settings/admins?page=1&limit=20
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "admins": [
      {
        "id": "admin_001",
        "name": "Jane Graham",
        "email": "admin@relisted.com",
        "role": "Super Admin",
        "status": "Active",
        "lastActive": "2 mins ago",
        "avatar": "https://...",
        "joinDate": "2025-10-01",
        "recentActions": [
          {
            "action": "Updated platform commission",
            "timestamp": "2 hours ago"
          },
          {
            "action": "Suspended user #12345",
            "timestamp": "5 hours ago"
          },
          {
            "action": "Resolved dispute #DIS-789",
            "timestamp": "1 day ago"
          }
        ]
      },
      {
        "id": "admin_002",
        "name": "Michael Chen",
        "email": "michael@relisted.com",
        "role": "Admin",
        "status": "Active",
        "lastActive": "15 mins ago",
        "avatar": "https://...",
        "joinDate": "2025-11-15",
        "recentActions": [
          {
            "action": "Reviewed new listings",
            "timestamp": "3 hours ago"
          }
        ]
      }
    ],
    "pagination": {
      "total": 12,
      "page": 1,
      "limit": 20,
      "pages": 1
    }
  }
}
```

---

### 32. POST /api/admin/settings/admins

**Location:** `src/app/admin/[id]/settings/components/AdminManagementTab.tsx`

- "+ Add Admin" button

**UX Explanation:**
Create a new admin account and assign them a role. They'll receive an invitation email to set their password.

**Request Format:**

```json
POST /api/admin/settings/admins
{
  "name": "Sarah Johnson",
  "email": "sarah@relisted.com",
  "roleId": "role_003",
  "sendInvitation": true
}
```

**Response Format:**

```json
{
  "success": true,
  "message": "Admin created successfully. Invitation sent.",
  "data": {
    "id": "admin_003",
    "name": "Sarah Johnson",
    "email": "sarah@relisted.com",
    "role": "Operations",
    "status": "Pending",
    "invitationSentAt": "2026-02-08T14:32:00Z",
    "createdBy": "admin_001"
  }
}
```

---

### 33. PUT /api/admin/settings/admins/:adminId

**Location:** `src/app/admin/[id]/settings/components/AdminManagementTab.tsx`

- (Implicit in admin detail view for status changes, role changes, etc.)

**UX Explanation:**
Update admin details:

- Change role assignment
- Suspend/reactivate admin account
- Update basic info

**Request Format:**

```json
PUT /api/admin/settings/admins/:adminId
{
  "roleId": "role_002",
  "status": "Suspended"
}
```

**Response Format:**

```json
{
  "success": true,
  "message": "Admin updated successfully",
  "data": {
    "id": "admin_003",
    "name": "Michael Chen",
    "role": "Admin",
    "status": "Suspended",
    "updatedAt": "2026-02-08T14:32:00Z",
    "updatedBy": "admin_001"
  }
}
```

---

### 34. GET /api/admin/settings/audit-logs

**Location:** `src/app/admin/[id]/settings/components/AuditLogsTab.tsx`

**UX Explanation:**
Complete audit trail of all admin actions on the platform:

- What action was performed (e.g., "Updated platform commission")
- Who performed it (admin name)
- What was affected (target)
- When it happened (timestamp)

Used for compliance, security, and tracking accountability.

**Request Format:**

```json
GET /api/admin/settings/audit-logs?page=1&limit=20&adminId=&actionType=&dateFrom=&dateTo=
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "log_001",
        "timestamp": "2026-02-08T14:32:00Z",
        "action": "Updated platform commission to 15%",
        "actionType": "SETTINGS_UPDATE",
        "performedBy": {
          "id": "admin_001",
          "name": "Jane Graham"
        },
        "target": {
          "type": "PLATFORM_SETTINGS",
          "id": "settings_001",
          "name": "Platform Commission"
        },
        "details": {
          "oldValue": "12%",
          "newValue": "15%"
        },
        "ipAddress": "192.168.1.100",
        "status": "Success"
      },
      {
        "id": "log_002",
        "timestamp": "2026-02-08T14:00:00Z",
        "action": "Suspended user account",
        "actionType": "USER_ACTION",
        "performedBy": {
          "id": "admin_001",
          "name": "Jane Graham"
        },
        "target": {
          "type": "USER",
          "id": "user_12345",
          "name": "User #12345"
        },
        "details": {
          "reason": "Fraudulent activity detected"
        },
        "ipAddress": "192.168.1.100",
        "status": "Success"
      }
    ],
    "pagination": {
      "total": 345,
      "page": 1,
      "limit": 20,
      "pages": 18
    }
  }
}
```

---

### 35. POST /api/admin/settings/audit-logs/export

**Location:** `src/app/admin/[id]/settings/components/AuditLogsTab.tsx`

- "Export CSV" button

**UX Explanation:**
Export audit logs to CSV for:

- Compliance reporting
- External audits
- Backup and archiving
- Analysis in external tools

**Request Format:**

```json
POST /api/admin/settings/audit-logs/export
{
  "format": "csv",
  "dateFrom": "2026-01-01",
  "dateTo": "2026-02-08",
  "adminId": null
}
```

**Response Format:**

```
[Binary CSV file]
Headers: Timestamp, Action, Performed By, Target, Details, IP Address, Status
```

---

## Admin Disputes Management

**3 Tabs:** Pending Review, Under Review, Resolved

### 36. GET /api/admin/disputes/stats

**Location:** `src/app/admin/[id]/disputes/components/StatusCard.tsx`

**UX Explanation:**
Admins need to see key dispute metrics at a glance:

- Count of pending disputes (not yet assigned or reviewed)
- Count of disputes currently under review (assigned to admins)
- Count of disputes resolved in the current month

These 3 cards appear at the top of the disputes page and help admins prioritize workload.

**Request Format:**

```json
GET /api/admin/disputes/stats
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "pendingCount": 1,
    "underReviewCount": 2,
    "resolvedThisMonth": 5
  }
}
```

---

### 37. GET /api/admin/disputes

**Location:** `src/app/admin/[id]/disputes/` components: page, PendingTable, UnderReviewTable, ResolvedTable

**UX Explanation:**
List all disputes with support for:

- Status filtering (pending, under-review, resolved)
- Search by dispute ID, raised by name, or order ID
- Priority levels (High, Medium, Low)
- Assignment information (who is reviewing the dispute)
- Important context: Who raised the dispute (curator or dresser), what order was involved, dispute category

Disputes are the conflicts between renters and listers that need admin intervention.

**Request Format:**

```json
GET /api/admin/disputes?status=pending&search=&page=1&limit=20
GET /api/admin/disputes?status=under-review&search=DQ&page=1&limit=20
GET /api/admin/disputes?status=resolved&search=&page=1&limit=20
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "disputes": [
      {
        "id": "DQ-0345",
        "raisedBy": {
          "id": "user_123",
          "name": "Chioma Eze",
          "role": "Dresser",
          "avatar": "https://..."
        },
        "category": "Damaged Item",
        "orderId": "#RLS-23984",
        "priority": "High",
        "dateCreated": "2025-11-12T08:30:00Z",
        "status": "Pending",
        "assignedTo": null,
        "description": "Received item with tear on sleeve"
      },
      {
        "id": "DQ-0346",
        "raisedBy": {
          "id": "user_124",
          "name": "Ada Okafor",
          "role": "Curator",
          "avatar": "https://..."
        },
        "category": "Late Return",
        "orderId": "#RLS-23985",
        "priority": "Medium",
        "dateCreated": "2025-11-10T14:15:00Z",
        "status": "Under Review",
        "assignedTo": {
          "id": "admin_002",
          "name": "Grace Adebayo"
        },
        "description": "Item returned 2 days late"
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 20,
      "pages": 3
    }
  }
}
```

---

### 38. GET /api/admin/disputes/:disputeId

**Location:** `src/app/admin/[id]/disputes/components/` all tables via "View Details" button

**UX Explanation:**
Get complete details of a specific dispute including:

- Full dispute information (what happened, timeline)
- Messages/communications between parties
- Evidence (photos, chat history)
- Current resolution attempt if any
- Related order details
- User profiles of both involved parties

This allows admins to understand the situation fully before making resolution decisions.

**Request Format:**

```json
GET /api/admin/disputes/:disputeId
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "id": "DQ-0345",
    "orderId": "#RLS-23984",
    "category": "Damaged Item",
    "status": "Pending",
    "priority": "High",
    "dateCreated": "2025-11-12T08:30:00Z",
    "raisedBy": {
      "id": "user_123",
      "name": "Chioma Eze",
      "role": "Dresser",
      "email": "chioma@example.com",
      "phone": "+234 801 234 5678",
      "avatar": "https://..."
    },
    "otherParty": {
      "id": "user_456",
      "name": "Zainab Malik",
      "role": "Curator",
      "email": "zainab@example.com",
      "phone": "+234 802 345 6789",
      "avatar": "https://..."
    },
    "description": "Received item with tear on sleeve that wasn't visible in pictures",
    "evidence": [
      {
        "type": "image",
        "url": "https://...",
        "uploadedAt": "2025-11-12T09:00:00Z"
      }
    ],
    "messages": [
      {
        "id": "msg_001",
        "from": "user_123",
        "text": "The item arrived damaged",
        "timestamp": "2025-11-12T08:30:00Z"
      },
      {
        "id": "msg_002",
        "from": "user_456",
        "text": "I sent it in perfect condition",
        "timestamp": "2025-11-12T10:45:00Z"
      }
    ],
    "orderDetails": {
      "id": "#RLS-23984",
      "item": "Gucci Marmont Bag",
      "rentalPrice": 25000,
      "rentalDates": {
        "startDate": "2025-11-05",
        "endDate": "2025-11-12",
        "returnDate": "2025-11-13"
      }
    },
    "assignedTo": null,
    "resolution": null,
    "notes": ""
  }
}
```

---

### 39. PUT /api/admin/disputes/:disputeId/assign

**Location:** `src/app/admin/[id]/disputes/components/UnderReviewTable.tsx`

- "Assigned To" field showing current admin reviewer

**UX Explanation:**
Assign a dispute to a specific admin for review and resolution. This:

- Ensures accountability (tracks who's handling which dispute)
- Prevents duplicate work (only one admin handling case)
- Allows workload distribution

**Request Format:**

```json
PUT /api/admin/disputes/:disputeId/assign
{
  "adminId": "admin_002"
}
```

**Response Format:**

```json
{
  "success": true,
  "message": "Dispute assigned successfully",
  "data": {
    "disputeId": "DQ-0345",
    "assignedTo": {
      "id": "admin_002",
      "name": "Grace Adebayo"
    },
    "assignedAt": "2026-02-08T14:32:00Z",
    "status": "Under Review"
  }
}
```

---

### 40. PUT /api/admin/disputes/:disputeId/status

**Location:** `src/app/admin/[id]/disputes/` - Used when progressing disputes through workflow

**UX Explanation:**
Move a dispute through the status workflow:

- **Pending** → Initial state when first raised
- **Under Review** → Assigned to an admin for investigation
- **Resolved** → Issue determined and action taken

This tracks the dispute lifecycle.

**Request Format:**

```json
PUT /api/admin/disputes/:disputeId/status
{
  "status": "under-review"
}
```

**Response Format:**

```json
{
  "success": true,
  "message": "Dispute status updated",
  "data": {
    "disputeId": "DQ-0345",
    "status": "Under Review",
    "updatedAt": "2026-02-08T14:32:00Z",
    "updatedBy": "admin_001"
  }
}
```

---

### 41. PUT /api/admin/disputes/:disputeId/resolve

**Location:** `src/app/admin/[id]/disputes/components/UnderReviewTable.tsx` - Resolve dispute button/modal

**UX Explanation:**
Mark a dispute as resolved with a specific resolution type. Possible resolutions:

- **Refund Issued** → Money returned to buyer/renter
- **Both Parties Agreed** → Conflict resolved through negotiation
- **Curator Credited** → Lister reimbursed for damage
- **Dispute Dismissed** → No wrongdoing found

The resolution determines:

- Financial actions (refunds, credits)
- Account status changes
- Dispute closure

**Request Format:**

```json
PUT /api/admin/disputes/:disputeId/resolve
{
  "resolution": "Refund Issued",
  "notes": "Issue appears legitimate. Refund approved.",
  "actions": [
    {
      "type": "refund",
      "amount": 25000,
      "to": "user_123"
    }
  ]
}
```

**Response Format:**

```json
{
  "success": true,
  "message": "Dispute resolved successfully",
  "data": {
    "disputeId": "DQ-0345",
    "status": "Resolved",
    "resolution": "Refund Issued",
    "resolvedAt": "2026-02-08T14:32:00Z",
    "resolvedBy": "admin_001",
    "notes": "Issue appears legitimate. Refund approved.",
    "actionsExecuted": [
      {
        "type": "refund",
        "amount": 25000,
        "to": "user_123",
        "status": "Completed"
      }
    ]
  }
}
```

---

## Admin Wallet & Escrow Management

**3 Tabs:** Wallet, Escrow, Transactions with 4 Metrics Cards and Export functionality

### 42. GET /api/admin/wallets/stats

**Location:** `src/app/admin/[id]/wallets/components/MetricsCard.tsx`

**UX Explanation:**
Platform financial health at a glance. Admins need to monitor:

- **Total Wallet Balance**: Sum of all user wallet balances (₦54,000,000)
- **Total Escrow (Locked)**: Funds currently held in escrow during disputes/verification (₦12,500,000)
- **Released to Curators**: Payments successfully released to listers (₦41,500,000)
- **Platform Earnings**: Commission/fees earned by the platform (₦5,200,000)

Each metric shows trend percentage (15.2%, 12.8%, 18.4%, etc.) to indicate growth/change.

**Request Format:**

```json
GET /api/admin/wallets/stats
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "totalWalletBalance": {
      "amount": 54000000,
      "currency": "NGN",
      "percentage": 15.2
    },
    "totalEscrowLocked": {
      "amount": 12500000,
      "currency": "NGN",
      "percentage": 12.8
    },
    "releasedToCurators": {
      "amount": 41500000,
      "currency": "NGN",
      "percentage": 18.4
    },
    "platformEarnings": {
      "amount": 5200000,
      "currency": "NGN",
      "percentage": 18.4
    }
  }
}
```

---

### 43. GET /api/admin/wallets

**Location:** `src/app/admin/[id]/wallets/components/WalletTable.tsx`

**UX Explanation:**
List all user wallets with support for:

- Search by user name or wallet ID
- Shows wallet ID, user name with avatar, total balance, available balance, locked amount
- Status indicator (Active/Inactive)
- Last updated timestamp
- View Details action to see individual wallet history

Admins use this to track user funds, identify inactive accounts, or investigate wallet issues.

**Request Format:**

```json
GET /api/admin/wallets?search=&page=1&limit=20
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "wallets": [
      {
        "id": "WAL-001",
        "userId": "USER-001",
        "userName": "Chioma Eze",
        "userAvatar": "https://i.pravatar.cc/40?img=1",
        "totalBalance": 2500000,
        "availableBalance": 1800000,
        "lockedAmount": 700000,
        "lastUpdated": "2025-10-10T14:30:00Z",
        "status": "active"
      },
      {
        "id": "WAL-002",
        "userId": "USER-002",
        "userName": "Ada Okafor",
        "userAvatar": "https://i.pravatar.cc/40?img=2",
        "totalBalance": 1200000,
        "availableBalance": 1000000,
        "lockedAmount": 200000,
        "lastUpdated": "2025-10-08T09:15:00Z",
        "status": "active"
      }
    ],
    "pagination": {
      "total": 156,
      "page": 1,
      "limit": 20,
      "pages": 8
    }
  }
}
```

---

### 44. GET /api/admin/wallets/:walletId

**Location:** `src/app/admin/[id]/wallets/components/WalletTable.tsx`

- "View" button in wallet table row

**UX Explanation:**
Get detailed information about a specific user's wallet including:

- Transaction history
- Balance breakdown
- Locked amount details (what's locked and why)
- User profile information
- Account status and history

**Request Format:**

```json
GET /api/admin/wallets/:walletId
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "id": "WAL-001",
    "userId": "USER-001",
    "userName": "Chioma Eze",
    "userAvatar": "https://...",
    "userEmail": "chioma@example.com",
    "userRole": "Curator",
    "totalBalance": 2500000,
    "availableBalance": 1800000,
    "lockedAmount": 700000,
    "lastUpdated": "2025-10-10T14:30:00Z",
    "status": "active",
    "joinDate": "2025-06-15",
    "accountHistory": [
      {
        "event": "Wallet Created",
        "date": "2025-06-15T08:00:00Z"
      },
      {
        "event": "KYC Verified",
        "date": "2025-06-15T10:30:00Z"
      }
    ]
  }
}
```

---

### 45. GET /api/admin/wallets/escrow

**Location:** `src/app/admin/[id]/wallets/components/EscrowTable.tsx`

**UX Explanation:**
Monitor all locked funds held in escrow during various conditions:

- **Locked**: Funds actively held pending resolution (e.g., dispute resolution)
- **Pending**: Awaiting release decision
- **Released**: Already released to the curator

Each escrow record shows:

- Escrow ID, related order ID
- Dresser (renter) and curator (lister) names
- Locked amount and reason for lock
- Locked and expected release dates
- Current status with visual indicators

Admins can manually release escrow if disputes are resolved.

**Request Format:**

```json
GET /api/admin/wallets/escrow?search=&status=&page=1&limit=20
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "escrows": [
      {
        "id": "ESC-001",
        "orderId": "#RLS-23984",
        "dresser": {
          "id": "user_123",
          "name": "Chioma Eze",
          "avatar": "https://..."
        },
        "curator": {
          "id": "user_456",
          "name": "Grace Adebayo",
          "avatar": "https://..."
        },
        "lockedAmount": 550000,
        "reason": "Rental Dispute",
        "lockedDate": "2025-10-10T08:30:00Z",
        "releaseDate": "2025-10-20T08:30:00Z",
        "status": "locked"
      },
      {
        "id": "ESC-002",
        "orderId": "#RLS-23985",
        "dresser": {
          "id": "user_124",
          "name": "Ada Okafor",
          "avatar": "https://..."
        },
        "curator": {
          "id": "user_789",
          "name": "Funmi Adeleke",
          "avatar": "https://..."
        },
        "lockedAmount": 380000,
        "reason": "Payment Hold",
        "lockedDate": "2025-10-08T14:15:00Z",
        "releaseDate": "2025-10-18T14:15:00Z",
        "status": "pending"
      }
    ],
    "pagination": {
      "total": 89,
      "page": 1,
      "limit": 20,
      "pages": 5
    }
  }
}
```

---

### 46. PUT /api/admin/wallets/escrow/:escrowId/release

**Location:** `src/app/admin/[id]/wallets/components/EscrowTable.tsx`

- (Implicit in table row for status management, may have action buttons)

**UX Explanation:**
Manually release escrow funds to the curator if:

- Dispute has been resolved
- Verification period has passed
- Admin determines funds should be released

This transfers the locked amount from escrow to the curator's available balance.

**Request Format:**

```json
PUT /api/admin/wallets/escrow/:escrowId/release
{
  "reason": "Dispute resolved in curator's favor"
}
```

**Response Format:**

```json
{
  "success": true,
  "message": "Escrow released successfully",
  "data": {
    "escrowId": "ESC-001",
    "orderId": "#RLS-23984",
    "curatorId": "user_456",
    "releasedAmount": 550000,
    "releasedAt": "2026-02-08T14:32:00Z",
    "newCuratorBalance": 45500000,
    "status": "released"
  }
}
```

---

### 47. GET /api/admin/wallets/transactions

**Location:** `src/app/admin/[id]/wallets/components/TransactionsTable.tsx`

**UX Explanation:**
View all financial transactions across the platform:

- **Deposits**: Users adding money to wallets
- **Withdrawals**: Users withdrawing money to bank accounts
- **Transfers**: Platform payments for rentals, commissions, refunds

Each transaction shows:

- Transaction ID for tracking
- User involved
- Type with visual icon (down arrow for deposits, up arrow for withdrawals, etc.)
- Amount and resulting balance
- Description of transaction purpose
- Date & time
- Status (Completed, Pending, Failed)

Admins use this for financial auditing and troubleshooting payment issues.

**Request Format:**

```json
GET /api/admin/wallets/transactions?search=&type=&status=&page=1&limit=20
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "TXN-001",
        "transactionId": "TXN20251010001",
        "userId": "user_123",
        "userName": "Chioma Eze",
        "userAvatar": "https://...",
        "type": "deposit",
        "amount": 500000,
        "previousBalance": 2000000,
        "newBalance": 2500000,
        "description": "Wallet Top-up Deposit",
        "date": "2025-10-10",
        "time": "14:45",
        "timestamp": "2025-10-10T14:45:00Z",
        "status": "completed"
      },
      {
        "id": "TXN-002",
        "transactionId": "TXN20251008002",
        "userId": "user_124",
        "userName": "Ada Okafor",
        "userAvatar": "https://...",
        "type": "withdrawal",
        "amount": 250000,
        "previousBalance": 1450000,
        "newBalance": 1200000,
        "description": "Withdrawal to Bank",
        "date": "2025-10-08",
        "time": "10:30",
        "timestamp": "2025-10-08T10:30:00Z",
        "status": "completed"
      },
      {
        "id": "TXN-003",
        "transactionId": "TXN20251005003",
        "userId": "user_125",
        "userName": "Ngozi Bello",
        "userAvatar": "https://...",
        "type": "transfer",
        "amount": 150000,
        "previousBalance": 950000,
        "newBalance": 800000,
        "description": "Transfer to User",
        "date": "2025-10-05",
        "time": "16:15",
        "timestamp": "2025-10-05T16:15:00Z",
        "status": "pending"
      }
    ],
    "pagination": {
      "total": 542,
      "page": 1,
      "limit": 20,
      "pages": 28
    }
  }
}
```

---

### 48. POST /api/admin/wallets/export

**Location:** `src/app/admin/[id]/wallets/page.tsx`

- "Export CSV" button, "Export PDF" button

**UX Explanation:**
Export wallet/transaction data for:

- Compliance reporting
- Financial audits
- External sharing with finance team
- Data backup and archiving

Supports both CSV and PDF formats for different use cases.

**Request Format:**

```json
POST /api/admin/wallets/export
{
  "format": "csv",
  "dataType": "wallets",
  "filters": {
    "status": null,
    "dateFrom": null,
    "dateTo": null
  }
}
```

**Response Format:**

```
[Binary CSV/PDF file]
```

For CSV wallets: Wallet ID, User Name, Total Balance, Available, Locked, Status, Last Updated
For CSV transactions: Transaction ID, User, Type, Amount, Balance, Description, Date & Time, Status

---

## Status Tracking

- [ ] GET /api/admin/analytics/stats
- [ ] GET /api/admin/analytics/rentals-revenue-trend
- [ ] GET /api/admin/analytics/category-breakdown
- [ ] GET /api/admin/analytics/revenue-by-category
- [ ] GET /api/admin/analytics/top-curators
- [ ] GET /api/admin/analytics/top-items
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
- [ ] GET /api/admin/settings/profile
- [ ] PUT /api/admin/settings/profile
- [ ] PUT /api/admin/settings/profile/photo
- [ ] PUT /api/admin/settings/profile/password
- [ ] PUT /api/admin/settings/profile/2fa
- [ ] GET /api/admin/settings/profile/devices
- [ ] POST /api/admin/settings/profile/logout-all-devices
- [ ] GET /api/admin/settings/platform-controls
- [ ] PUT /api/admin/settings/platform-controls
- [ ] GET /api/admin/settings/roles
- [ ] POST /api/admin/settings/roles
- [ ] PUT /api/admin/settings/roles/:roleId/permissions
- [ ] GET /api/admin/settings/admins
- [ ] POST /api/admin/settings/admins
- [ ] PUT /api/admin/settings/admins/:adminId
- [ ] GET /api/admin/settings/audit-logs
- [ ] POST /api/admin/settings/audit-logs/export
- [ ] GET /api/admin/disputes/stats
- [ ] GET /api/admin/disputes
- [ ] GET /api/admin/disputes/:disputeId
- [ ] PUT /api/admin/disputes/:disputeId/assign
- [ ] PUT /api/admin/disputes/:disputeId/status
- [ ] PUT /api/admin/disputes/:disputeId/resolve
- [ ] GET /api/admin/wallets/stats
- [ ] GET /api/admin/wallets
- [ ] GET /api/admin/wallets/:walletId
- [ ] GET /api/admin/wallets/escrow
- [ ] PUT /api/admin/wallets/escrow/:escrowId/release
- [ ] GET /api/admin/wallets/transactions
- [ ] POST /api/admin/wallets/export

**Once endpoints are created:** Remove completed items from this file and move them to connection phase.
