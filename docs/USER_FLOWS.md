# Core User Flows - RELISTED Platform

## Overview

RELISTED is a peer-to-peer fashion rental platform connecting listers (sellers) with renters (customers). This document outlines the core user flows, from registration through order completion.

---

## 1. Renter Flow (Customer)

The renter is someone who wants to rent fashion items for events, everyday wear, or content creation.

### 1.1 Registration & Onboarding

```
┌─────────────────────────────────────────────────────────────────┐
│  /auth/create-account                                           │
│       ↓                                                         │
│  Select Role: "Renter" or "Lister"                              │
│       ↓                                                         │
│  /auth/create-account/sign-up                                   │
│       ↓                                                         │
│  Submit: name, email, password                                  │
│       ↓                                                         │
│  OTP Verification: /auth/verify-otp                             │
│       ↓                                                         │
│  Redirect to: / (home page)                                      │
└─────────────────────────────────────────────────────────────────┘
```

**Key Pages:**
- `/auth/create-account` - Role selection
- `/auth/create-account/sign-up` - Registration form
- `/auth/verify-email` - Email verification
- `/auth/sign-in` - Login

**Backend Endpoints:**
- `POST /auth/signup` - Create account
- `POST /auth/login` - Authenticate
- `POST /auth/verify-otp` - Verify email

### 1.2 Browse & Search Products

```
┌─────────────────────────────────────────────────────────────────┐
│  /shop                                                           │
│       ↓                                                         │
│  View: Available Listings (grid)                                 │
│       ↓                                                         │
│  Filter: category, brand, size, color, price, condition         │
│       ↓                                                         │
│  Search: /api/public/search                                      │
│       ↓                                                         │
│  View Product: /shop/product-details/:id                        │
└─────────────────────────────────────────────────────────────────┘
```

**Key Pages:**
- `/shop` - Product listing with filters
- `/shop/product-details/[id]` - Product detail page

**Filters Available:**
- Category (Dresses, Bags, Accessories, etc.)
- Brand
- Size/Measurement
- Color
- Price range (min/max)
- Condition (New, Like New, Good, Fair)
- Material

**Public API:**
- `GET /api/public/products` - List all approved products
- `GET /api/public/products/:id` - Product details
- `GET /api/public/search` - Search across products, brands, listers

### 1.3 Add to Cart (Rental Request)

```
┌─────────────────────────────────────────────────────────────────┐
│  Product Detail Page                                            │
│       ↓                                                         │
│  Select: Rental dates                                           │
│       ↓                                                         │
│  Click: "Add to Cart"                                           │
│       ↓                                                         │
│  /api/renters/rental-requests (POST)                           │
│       ↓                                                         │
│  View Cart: /shop/cart                                           │
└─────────────────────────────────────────────────────────────────┘
```

**Key Pages:**
- `/shop/cart` - Cart/rental requests view

**Backend Endpoints:**
- `POST /api/renters/rental-requests` - Add item to cart
- `GET /api/renters/rental-requests` - View cart/rental requests
- `DELETE /api/renters/rental-requests/:id` - Remove from cart

**Cart Behavior:**
- Renters submit "rental requests" rather than direct purchases
- Requests go to lister for approval
- Can have multiple pending requests

### 1.4 Checkout & Payment

```
┌─────────────────────────────────────────────────────────────────┐
│  /shop/cart                                                     │
│       ↓                                                         │
│  Select: Approved requests to checkout                          │
│       ↓                                                         │
│  /shop/cart/checkout                                            │
│       ↓                                                         │
│  Step 1: Contact & Delivery Details                             │
│       ↓                                                         │
│  Step 2: Payment (Wallet/Fund Account)                          │
│       ↓                                                         │
│  Step 3: Review & Confirm                                       │
│       ↓                                                         │
│  POST /order                                                    │
│       ↓                                                         │
│  Order Created → Payment Held in Escrow                         │
└─────────────────────────────────────────────────────────────────┘
```

**Key Pages:**
- `/shop/cart/checkout` - Multi-step checkout
- `/shop/cart/checkout/success` - Order confirmation

**Backend Endpoints:**
- `GET /order/summary` - Get order total
- `POST /order` - Create order
- `POST /api/renters/wallet/fund` - Fund wallet (if needed)

**Payment Flow:**
1. Renter adds funds to wallet (via bank transfer)
2. At checkout, funds are held in escrow
3. Upon successful delivery, funds remain held
4. On return confirmation, funds released to lister

### 1.5 Order Management

```
┌─────────────────────────────────────────────────────────────────┐
│  /renters/orders                                                │
│       ↓                                                         │
│  View: All orders (pending, active, completed)                  │
│       ↓                                                         │
│  Order Details: /renters/orders/:id                             │
│       ↓                                                         │
│  Track: /renters/orders/:id/progress                            │
│       ↓                                                         │
│  Initiate Return: /renters/orders/:id/return                    │
└─────────────────────────────────────────────────────────────────┘
```

**Key Pages:**
- `/renters/orders` - Order listing
- `/renters/orders/[id]` - Order details
- `/renters/dashboard` - Overview with stats

**Backend Endpoints:**
- `GET /api/renters/orders` - List all orders
- `GET /api/renters/orders/:id` - Order details
- `GET /api/renters/orders/:id/progress` - Timeline/status
- `POST /api/renters/orders/:id/return` - Initiate return

### 1.6 Return Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  Order is in "RETURN_DUE" status                                │
│       ↓                                                         │
│  Renter: Submit return request                                  │
│       ↓                                                         │
│  Upload: Item condition photos                                  │
│       ↓                                                         │
│  Submit: /api/renters/orders/:id/ready-to-return                │
│       ↓                                                         │
│  Lister: Confirm receipt & item condition                      │
│       ↓                                                         │
│  Status: "RETURNED" → "COMPLETED"                               │
│       ↓                                                         │
│  Escrow: Funds released to lister                              │
└─────────────────────────────────────────────────────────────────┘
```

**Backend Endpoints:**
- `POST /api/renters/orders/:id/ready-to-return` - Submit return with condition
- `POST /api/renters/orders/:id/return` - Get return details
- `PATCH /api/listers/orders/:id/return/confirm` - Lister confirms return
- `PATCH /api/listers/orders/:id/return/reject` - Lister rejects (damage claims)

### 1.7 Renter Wallet

```
┌─────────────────────────────────────────────────────────────────┐
│  /renters/wallet                                                │
│       ↓                                                         │
│  View: Balance, transactions                                     │
│       ↓                                                         │
│  Add: Bank account                                              │
│       ↓                                                         │
│  Fund: Add money (via bank transfer)                            │
│       ↓                                                         │
│  Withdraw: Request withdrawal                                   │
└─────────────────────────────────────────────────────────────────┘
```

**Key Pages:**
- `/renters/wallet` - Wallet overview
- `/renters/wallet/transactions` - Transaction history

**Backend Endpoints:**
- `GET /api/renters/wallet` - Wallet balance
- `GET /api/renters/wallet/transactions` - Transaction history
- `GET /api/renters/wallet/bank-accounts` - Linked banks
- `POST /api/renters/wallet/withdraw` - Request withdrawal

---

## 2. Lister Flow (Seller/Curator)

The lister is someone who rents out their fashion items to earn money.

### 2.1 Registration & Onboarding

Same as Renter flow through `/auth/create-account`, but select "Lister" role.

**Additional Step:**
- `/listers/profile` - Complete business profile (required before listing)
- Add: Business info, address, emergency contact, bank account
- Upload: ID verification documents (optional but recommended)

### 2.2 Create Listing

```
┌─────────────────────────────────────────────────────────────────┐
│  /listers/listings                                              │
│       ↓                                                         │
│  Click: "Add New Listing"                                       │
│       ↓                                                         │
│  Step 1: Basic Info (name, description, category)               │
│       ↓                                                         │
│  Step 2: Photos & Attachments                                   │
│       ↓                                                         │
│  Step 3: Pricing (daily rate, original value, deposit)         │
│       ↓                                                         │
│  Step 4: Details (color, condition, measurements, care)         │
│       ↓                                                         │
│  Step 5: Review & Submit                                        │
│       ↓                                                         │
│  POST /product                                                  │
│       ↓                                                         │
│  Status: "PENDING" (awaiting admin approval)                   │
└─────────────────────────────────────────────────────────────────┘
```

**Key Pages:**
- `/listers/listings` - Manage listings
- `/listers/listings/new` - Create new listing (if exists)

**Backend Endpoints:**
- `POST /product` - Create new listing
- `GET /product/user-products` - View own listings
- `PATCH /product/:id` - Edit listing

### 2.3 Admin Approval

```
┌─────────────────────────────────────────────────────────────────┐
│  Lister submits listing                                          │
│       ↓                                                         │
│  Status: "PENDING"                                              │
│       ↓                                                         │
│  Admin reviews: /api/admin/products/pending                     │
│       ↓                                                         │
│  Admin action:                                                  │
│    - Approve → Status: "APPROVED" → "AVAILABLE"                │
│    - Reject → Status: "REJECTED" + reason                       │
│       ↓                                                         │
│  Listing visible on /shop (if approved)                        │
└─────────────────────────────────────────────────────────────────┘
```

**Product Status Flow:**
```
PENDING → APPROVED → AVAILABLE
                ↓
              REJECTED
```

### 2.4 Manage Orders

```
┌─────────────────────────────────────────────────────────────────┐
│  /listers/orders                                                │
│       ↓                                                         │
│  View: Incoming rental requests                                 │
│       ↓                                                         │
│  Pending Request: Review details                                │
│       ↓                                                         │
│  Action:                                                        │
│    - Approve → /api/listers/orders/:id/approve                 │
│    - Reject → /api/listers/orders/:id/reject                   │
│       ↓                                                         │
│  Active Orders: Track & manage                                  │
│       ↓                                                         │
│  Returns: Confirm item receipt after rental                     │
└─────────────────────────────────────────────────────────────────┘
```

**Key Pages:**
- `/listers/orders` - Order listing
- `/listers/orders/[id]` - Order details
- `/listers/dashboard` - Overview

**Backend Endpoints:**
- `GET /api/listers/orders` - List all orders
- `GET /api/listers/orders/:id` - Order details
- `POST /api/listers/orders/:id/approve` - Approve rental
- `POST /api/listers/orders/:id/reject` - Reject rental
- `PATCH /api/listers/orders/:id/return/confirm` - Confirm return

### 2.5 Earnings & Wallet

```
┌─────────────────────────────────────────────────────────────────┐
│  /listers/wallet                                                │
│       ↓                                                         │
│  View: Available balance                                         │
│       ↓                                                         │
│  Balance breakdown:                                             │
│    - Available (can withdraw)                                   │
│    - Locked (in active rentals)                                 │
│       ↓                                                         │
│  Transactions: View history                                      │
│       ↓                                                         │
│  Withdraw: Request payout to bank account                       │
└─────────────────────────────────────────────────────────────────┘
```

**Key Pages:**
- `/listers/wallet` - Wallet overview
- `/listers/wallet/transactions` - Transaction history

**Backend Endpoints:**
- `GET /api/listers/wallet` - Wallet balance
- `GET /api/listers/wallet/transactions` - History
- `GET /api/listers/wallet/locked-balances` - Locked funds
- `POST /api/listers/wallet/withdraw` - Request withdrawal

---

## 3. Admin Flow

Admins manage the platform, approve listings, and handle disputes.

### 3.1 Login

```
┌─────────────────────────────────────────────────────────────────┐
│  /auth/sign-in                                                  │
│       ↓                                                         │
│  Submit credentials                                              │
│       ↓                                                         │
│  If admin: MFA verification                                     │
│       ↓                                                         │
│  /auth/verify-admin-mfa                                         │
│       ↓                                                         │
│  Redirect: /admin/k340eol21/orders                              │
└─────────────────────────────────────────────────────────────────┘
```

**Note:** Admin ID is hardcoded as `k340eol21` for routing purposes.

### 3.2 Listings Management

```
┌─────────────────────────────────────────────────────────────────┐
│  /admin/k340eol21/listings                                      │
│       ↓                                                         │
│  Tabs: Pending | Active | Rejected                              │
│       ↓                                                         │
│  View: Product details                                           │
│       ↓                                                         │
│  Action:                                                         │
│    - Approve → PATCH /api/admin/products/:id/approve           │
│    - Reject → PATCH /api/admin/products/:id/reject              │
│    - Disable → PATCH /api/admin/products/:id/availability      │
└─────────────────────────────────────────────────────────────────┘
```

**Backend Endpoints:**
- `GET /api/admin/products/statistics` - Overview stats
- `GET /api/admin/products/pending` - Pending reviews
- `GET /api/admin/products/approved` - Active listings
- `GET /api/admin/products/rejected` - Rejected listings
- `PATCH /api/admin/products/:id/approve` - Approve
- `PATCH /api/admin/products/:id/reject` - Reject

### 3.3 User Management

```
┌─────────────────────────────────────────────────────────────────┐
│  /admin/k340eol21/users                                         │
│       ↓                                                         │
│  View: All users                                                │
│       ↓                                                         │
│  Actions:                                                       │
│    - Suspend → PATCH /api/admin/users/:id/suspend              │
│    - Verify → PATCH /api/admin/users/:id/verify                 │
│    - Delete → DELETE /api/admin/users/:id                       │
│       ↓                                                         │
│  View: User details, rentals, listings, wallet                  │
└─────────────────────────────────────────────────────────────────┘
```

**Backend Endpoints:**
- `GET /api/admin/users` - List users
- `GET /api/admin/users/:id` - User details
- `PATCH /api/admin/users/:id/suspend` - Suspend/unsuspend
- `PATCH /api/admin/users/:id/verify` - Verify user

### 3.4 Order Management

```
┌─────────────────────────────────────────────────────────────────┐
│  /admin/k340eol21/orders                                         │
│       ↓                                                         │
│  View: All orders                                               │
│       ↓                                                         │
│  Filter: By status                                              │
│       ↓                                                         │
│  Actions: Update status, cancel, view activity                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.5 Analytics

```
┌─────────────────────────────────────────────────────────────────┐
│  /admin/k340eol21/analytics                                      │
│       ↓                                                         │
│  View: Revenue, rentals, top items, top curators                │
│       ↓                                                         │
│  Filter: By timeframe (month, year)                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Public Flows

### 4.1 Browse Without Auth

- `/shop` - View all available products
- `/shop/product-details/[id]` - View product details
- `/api/public/products` - Public API (no auth required)

### 4.2 Search

- `/search` or `/api/public/search` - Search products, brands, listers

### 4.3 View Lister Profiles

- `/profile/[userId]` or `/api/public/users/:id` - Public lister profiles
- View their listings, ratings, reviews

### 4.4 Contact

- `/contact-us` - Submit contact form
- `POST /api/public/contact-us`

---

## 5. Payment & Wallet Flow

### 5.1 Renter Adds Funds

```
Bank Transfer → Wallet Credited → Use for Rentals
```

### 5.2 Rental Payment Flow

```
Checkout → Payment moved to ESCROW → Delivered → Still in ESCROW
                          ↓
                    Return Confirmed → ESCROW released to Lister
```

**Key Points:**
- Funds held in escrow during rental period
- Released only after return is confirmed
- Protects both parties

---

## 6. Order Status Flow

```
PROCESSING → CONFIRMED → IN_TRANSIT → DELIVERED → ACTIVE → RETURN_DUE → RETURNED → COMPLETED
     ↑           ↑            ↑           ↑         ↑          ↑            ↑
     │           │            │           │         │          │            │
   Order      Lister       Delivery    Rental    Rental    Due for     Item
  Created    Approved    to Renter   Starts   Period    Return    Returned
```

---

## 7. Key API Endpoints Summary

| Feature | Endpoint | Method |
|---------|----------|--------|
| **Auth** | `/auth/signup` | POST |
| | `/auth/login` | POST |
| | `/auth/verify-otp` | POST |
| **Products** | `/api/public/products` | GET |
| | `/product` | POST |
| | `/product/user-products` | GET |
| **Cart** | `/api/renters/rental-requests` | GET/POST |
| | `/cart-items` | GET/POST/DELETE |
| **Orders** | `/order` | POST |
| | `/api/renters/orders` | GET |
| | `/api/listers/orders` | GET |
| **Admin** | `/api/admin/products/:id/approve` | PATCH |
| | `/api/admin/users/:id/suspend` | PATCH |
| **Wallet** | `/api/renters/wallet` | GET |
| | `/api/listers/wallet` | GET |

---

## 8. User Roles

| Role | Description | Access |
|------|-------------|--------|
| `RENTER` | Customers who rent items | `/renters/*`, `/shop/*` |
| `LISTER` | Sellers who list items | `/listers/*`, `/shop/*` |
| `ADMIN` | Platform administrators | `/admin/*` |

---

*Document generated from codebase analysis*
*Last updated: 2026-03-26*