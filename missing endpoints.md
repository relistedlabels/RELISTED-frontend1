missing endpoints

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
