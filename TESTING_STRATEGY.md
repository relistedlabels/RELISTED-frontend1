# Testing Strategy

## Overview
E2E tests using Playwright against a real backend. Tests run locally against `localhost:3000` + `localhost:4000` (backend), and in CI against staging.

## Test Priority Order

### P0 - Critical (Must have before any release)
1. **Authentication**
   - User can sign up
   - User can log in
   - User can log out
   - Protected routes redirect to login

2. **Shop/Products**
   - Products display on shop page
   - Approved products are visible
   - Pending products are NOT visible

3. **Cart**
   - Add item to cart
   - Remove item from cart
   - Cart persists across sessions

### P1 - High (Must have before feature freeze)
4. **Product Listing (Lister)**
   - Create new listing
   - Edit own listing
   - View own listings

5. **Checkout/Orders**
   - Complete checkout flow
   - Order confirmation shown

### P2 - Medium (Should have before launch)
6. **Admin Functions**
   - Approve/reject products
   - View pending products

7. **User Profile**
   - View profile
   - Edit profile

### P3 - Nice to have
8. **Search**
   - Search products
   - Filter products

9. **Favorites**
   - Add to favorites
   - Remove from favorites

## Running Tests

### Local (requires backend running)
```bash
# Start backend on port 4000
npm run e2e
# or
npx playwright test
```

### CI/Staging
```bash
E2E_BASE_URL=https://staging.example.com npx playwright test
```

## Test Structure
```
e2e/
├── shop.spec.ts        # Shop page tests
├── auth.spec.ts        # Authentication tests
├── cart.spec.ts        # Cart functionality
├── products.spec.ts    # Product listing/management
├── checkout.spec.ts   # Checkout flow
├── admin.spec.ts      # Admin functions
└── utils/
    └── test-users.ts  # Test data fixtures
```

## Prerequisites for Running
1. Backend running on `http://localhost:4000` (or set `NEXT_PUBLIC_API_BASE_URL`)
2. Test user accounts created in database
3. Some approved products in database

## CI Configuration
Tests run on PR and push to main. Set `E2E_BASE_URL` to staging in CI pipeline.
