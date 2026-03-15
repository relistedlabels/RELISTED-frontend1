missing endpoints

---

## Admin Product/Listing Management

### Get Product Rental Availability & Calendar

GET /api/admin/listings/:productId/availability?month=3&year=2026

**Purpose:** Fetch rental availability, booking calendar, and rental stats for a specific product.

**Query Parameters:**

- `month` (required): Month number (1-12)
- `year` (required): Year (e.g., 2026)
- `page` (optional): For pagination if needed

**Response:**

```json
{
  "success": true,
  "data": {
    "productId": "string",
    "month": 3,
    "year": 2026,
    "nextAvailableDate": "2026-03-22",
    "currentlyRented": true,
    "currentRentalEndDate": "2026-03-20",
    "stats": {
      "daysRentedThisMonth": 10,
      "totalRentalsThisMonth": 3,
      "totalRentalRevenue": 150000
    },
    "calendar": [
      {
        "date": "2026-03-01",
        "status": "available",
        "booking": null
      },
      {
        "date": "2026-03-02",
        "status": "rented",
        "booking": {
          "id": "booking_123",
          "dresserId": "user_456",
          "dresserName": "Chioma Eze",
          "startDate": "2026-03-01",
          "endDate": "2026-03-05",
          "orderTotal": 75000
        }
      }
    ]
  }
}
```

### Get Product Activity History

GET /api/admin/listings/:productId/activity

**Purpose:** Fetch complete activity/timeline history for a product (listed, approved, rented, returned, etc.).

**Response:**

```json
{
  "success": true,
  "data": {
    "productId": "string",
    "activities": [
      {
        "id": "activity_001",
        "type": "listed",
        "title": "Listed by Grace Adebayo",
        "description": "Product added to platform",
        "timestamp": "2026-02-28T10:30:00Z",
        "actor": {
          "id": "user_789",
          "name": "Grace Adebayo",
          "email": "grace@example.com"
        }
      },
      {
        "id": "activity_002",
        "type": "approved",
        "title": "Approved by Admin",
        "description": "Product verified and approved",
        "timestamp": "2026-02-28T09:15:00Z",
        "actor": {
          "id": "admin_001",
          "name": "Admin Name",
          "email": "admin@platform.com"
        }
      },
      {
        "id": "activity_003",
        "type": "rented",
        "title": "Rented by Chioma Eze",
        "description": "Rental order created",
        "timestamp": "2026-03-10T14:20:00Z",
        "actor": {
          "id": "user_456",
          "name": "Chioma Eze",
          "email": "chioma@example.com"
        },
        "metadata": {
          "orderId": "order_001",
          "endDate": "2026-03-15"
        }
      },
      {
        "id": "activity_004",
        "type": "returned",
        "title": "Returned",
        "description": "Item returned by renter",
        "timestamp": "2026-03-15T11:45:00Z",
        "actor": null,
        "metadata": {
          "orderId": "order_001"
        }
      }
    ]
  }
}
```

**Activity Types:** `listed`, `approved`, `rejected`, `rented`, `returned`, `damaged`, `updated`, `suspended`, `reactivated`

---

## Admin User Management

### Suspend/Unsuspend Admin

POST /api/admin/settings/admins/:adminId/suspend

**Purpose:** Suspend or unsuspend an admin user account.

**Request Body:**

```json
{
  "suspended": true
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "email": "string",
    "role": "string",
    "isSuspended": true,
    "isVerified": boolean,
    "tokenVersion": number,
    "createdAt": "ISO date",
    "updatedAt": "ISO date"
  }
}
```

### Verify User

PATCH /api/admin/users/:userId/verify

**Purpose:** Mark a user as verified (KYC/identity verification approved).

**Request Body:**

```json
{
  "verified": true
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "email": "string",
    "phone": "string",
    "role": "string",
    "isVerified": true,
    "isSuspended": boolean,
    "createdAt": "ISO date",
    "updatedAt": "ISO date",
    "profile": {
      "avatarUpload": {
        "url": "string"
      }
    }
  }
}
```

---

Withdrawal Request Endpoint

GET /api/admin/wallets/withdrawal-requests?search=&page=1&limit=20

Fields:

- id: string
- userId: string
- user: { id, name, email, avatar }
- bankAccount: { accountNumber, bankName, accountName }
- amount: number
- status: "pending" | "paid" | "failed"
- requestedDate: ISO date
- paidDate: ISO date (optional)
- trackingId: string (optional)
- reason: string (optional)

---

Payouts Endpoint

GET /api/admin/wallets/payouts?search=&page=1&limit=20

Fields:

- id: string
- userId: string
- user: { id, name, email, avatar }
- bankAccount: { accountNumber, bankName, accountName }
- amount: number
- status: "completed" | "paid"
- completedDate: ISO date

---

Mark Withdrawal as Paid

PUT /api/admin/wallets/withdrawal-requests/{withdrawalId}/paid

Request Body:
{
"trackingId": "string"
}

Response:
{
"success": true,
"data": {
"id": "string",
"status": "paid",
"paidDate": "ISO date",
"trackingId": "string"
}
}
