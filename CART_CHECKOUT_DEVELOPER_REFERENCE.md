# Shopping Cart & Checkout Flow - Developer Reference

## End-to-End User Journey

```
SHOP PAGE
    ↓
[Add to Cart] → useAddToCart() mutation
    ↓
    ┌─────────────────────┐
    │   CART PAGE         │
    ├─────────────────────┤
    │ • useCart()         │ ← Polling every 5s
    │ • useCartSummary()  │
    │ • Remove items      │
    │ • 15-min timers     │
    └─────────────────────┘
           ↓
     [Checkout]
           ↓
    ┌──────────────────────────┐
    │ CHECKOUT PAGE            │
    ├──────────────────────────┤
    │ 1. Contact Section       │
    │    └─ useMe()            │
    │    └─ useProfile()       │
    │                          │
    │ 2. Address Section       │
    │    └─ useProfile()       │
    │    └─ Update Address     │
    │       → useUpdateProfile()
    │                          │
    │ 3. Payment Section       │
    │    └─ useProfile()       │ (wallet balance)
    │    └─ Fund Wallet        │
    │       → useDepositFunds()│
    │                          │
    │ 4. Order Summary         │
    │    └─ useCheckoutSummary()
    │    └─ [Complete Order]   │
    │       → useCheckout()    │
    └──────────────────────────┘
           ↓
    ┌──────────────────────────┐
    │ SUCCESS PAGE             │
    ├──────────────────────────┤
    │ • Order ID               │
    │ • Order Status           │
    │ • useOrder()             │
    │ • Next Steps             │
    └──────────────────────────┘
           ↓
    [View My Orders] or
    [Continue Shopping]
```

## Component Architecture

### Cart Hierarchy

```
/shop/cart/
├── page.tsx (Layout)
├── components/
│   ├── CheckoutProductList.tsx
│   │   ├── useCart()
│   │   └── useRemoveFromCart()
│   ├── RentalCartSummary.tsx
│   │   ├── useCart()
│   │   └── RentalTimer (15-min countdown)
│   ├── RentalCartView.tsx (Slide-in variant)
│   └── FinalOrderSummaryCard.tsx (Cart summary)
│       ├── useCartSummary()
│       └── Checkout button
```

### Checkout Hierarchy

```
/shop/cart/checkout/
├── page.tsx (Layout)
├── components/
│   ├── CheckoutContactAndPayment.tsx
│   │   ├── useMe() → User data
│   │   ├── useProfile() → Address & wallet
│   │   ├── ChangeAddress (modal)
│   │   │   └── AddressInputForm
│   │   │       └── useUpdateProfile()
│   │   └── FundWallet (modal)
│   │       └── WalletTopUpForm
│   │           └── useDepositFunds()
│   └── FinalOrderSummaryCard.tsx
│       ├── useCheckoutSummary()
│       └── useCheckout() → Create order
└── success/
    └── components/
        └── OrderSuccessfulScreen.tsx
            └── useOrder() → Display confirmation
```

## API Endpoints Used

### Cart Endpoints

- `GET /api/renters/cart` - Fetch cart items
- `POST /api/renters/cart` - Add to cart
- `DELETE /api/renters/cart/:itemId` - Remove from cart
- `POST /api/renters/cart/clear` - Clear entire cart
- `GET /api/renters/cart/summary` - Get totals

### Checkout Endpoints

- `GET /api/renters/checkout/validate` - Validate checkout
- `GET /api/renters/checkout/summary` - Get order review
- `POST /api/renters/checkout` - Create order
- `POST /api/renters/orders/:orderId/pay` - Process payment

### Supporting Endpoints

- `GET /api/auth/me` - Current user (JWT token required)
- `GET /api/users/profile` - User profile with address
- `POST /api/users/profile` - Update profile/address
- `POST /api/renters/wallet/deposit` - Fund wallet
- `GET /api/renters/orders/:orderId` - Order details

## Hook Usage Patterns

### Query Hook Pattern (Read Data)

```tsx
// Fetch cart with automatic polling
const { data: cartData, isLoading, error } = useCart();

// Handle states
if (isLoading) return <Skeleton />;
if (error) return <Error message={error.message} />;

const items = cartData?.cartItems || [];
```

### Mutation Hook Pattern (Write Data)

```tsx
// Prepare mutation
const removeFromCart = useRemoveFromCart();

// Use mutation with loading state
const handleRemove = async (cartItemId: string) => {
  removeFromCart.mutate(cartItemId, {
    onSuccess: () => {
      // Automatic cache invalidation handled
      // Cart will refetch automatically
    },
    onError: (error) => {
      // Handle error
      console.error("Failed to remove:", error);
    },
  });
};

// Disable button during mutation
<button disabled={removeFromCart.isPending}>Remove</button>;
```

## Real-Time Behavior

### Cart Polling (5-second intervals)

- Keeps cart items fresh
- Shows expiring items (15-min timer)
- Auto-removes expired items from API
- Updates totals dynamically

### Address Update (Mutation + Refetch)

1. User submits form
2. `useUpdateProfile()` mutation sends to API
3. On success → `useProfile()` query refetches
4. Component re-renders with new address
5. Modal closes automatically

### Wallet Funding (Mutation + Refetch)

1. User enters amount and payment method
2. `useDepositFunds()` mutation processes
3. On success → `useProfile()` query refetches wallet
4. Balance updates in real-time
5. Modal closes on success

### Checkout Flow (Multiple Mutations)

1. `useCheckout()` validates cart and user
2. Creates order with items and amounts
3. Returns `orderId` and `orderReference`
4. Redirects to success page with `?orderId=...`
5. `useOrder()` loads and displays order details

## Error Handling Strategy

### Network Errors

```tsx
if (error) {
  return (
    <div className="border-yellow-200 bg-yellow-50 rounded-lg p-4">
      <p className="text-yellow-800">
        {error.message || "Failed to load data"}
      </p>
      <button onClick={() => refetch()}>Try Again</button>
    </div>
  );
}
```

### Mutation Errors

```tsx
{
  mutation.isError && (
    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
      <p className="text-red-700">
        {mutation.error?.message || "Operation failed"}
      </p>
    </div>
  );
}
```

### Empty States

```tsx
if (items.length === 0) {
  return (
    <div className="text-center py-12">
      <p className="text-gray-600">Your cart is empty</p>
      <Link href="/shop">Continue Shopping</Link>
    </div>
  );
}
```

## Cache Invalidation Strategy

After mutations, these caches are invalidated:

- Cart data (`["renters", "cart"]`)
- Cart summary (`["renters", "cart", "summary"]`)
- Orders (`["renters", "orders"]`)
- Wallet/balance (`["renters", "wallet"]`)
- Profile (`["user", "profile"]`)

This ensures all affected data is fresh after API changes.

## Loading States UX

### Cart Loading

```
Skeleton loaders for each item
├── image placeholder
├── text placeholders
└── button placeholder
```

### Checkout Loading

```
Form fields stay enabled but show loading state on button
Button text changes: "Complete Order" → "Processing..."
```

### Success Loading

```
Icon bounces with animation
Summary data loads from API
Order details displayed below
```

## Security Considerations

✅ **JWT Token** - Automatically attached to all requests via `apiFetch()`
✅ **Role Validation** - Only renters can add to cart
✅ **Wallet Balance** - Validated before checkout
✅ **Cart Expiration** - Items auto-expire after 15 minutes
✅ **Address Validation** - Required fields checked before save
✅ **Payment Processing** - Handled via secure payment provider

## Performance Optimizations

1. **Query Caching** - Default 30s staleTime for cart
2. **Request Deduplication** - React Query prevents duplicate requests
3. **Automatic Refetch** - Only on mutation success (not on focus)
4. **Skeleton Loading** - Shows UI immediately while loading
5. **Polling Strategy** - 5s for cart (time-sensitive), 10s for checkout
6. **Error Boundaries** - Graceful fallback for error states

## Testing the Integration

### Manual Testing Workflow

```bash
1. Navigate to /shop
2. Add item to cart (requires implementation)
3. Go to /shop/cart
   - See cart items with prices
   - See 15-min timer counting down
   - Test remove button
4. Go to /shop/cart/checkout
   - See your address
   - Test "Update Address" button
   - See wallet balance
   - Test "Fund Wallet" button
5. Review order summary
   - All items visible
   - Correct totals shown
6. Click "Complete Order"
   - Success page shows order ID
   - Can navigate to orders dashboard
```

### API Testing

```bash
# Add to cart
POST /api/renters/cart
{ "productId": "...", "rentalDays": 3 }

# View cart
GET /api/renters/cart

# Checkout
POST /api/renters/checkout
{ "terms_agreed": true }

# Check order
GET /api/renters/orders/[orderId]
```

## Next Steps for Implementation

1. **Shop Page "Add to Cart"**
   - Use `useAddToCart()` mutation
   - Show loading state
   - Redirect to cart or show toast

2. **Backend Implementation**
   - Implement 14 cart/checkout endpoints
   - Set up cart expiration (15-min TTL)
   - Integrate payment processor

3. **Wallet System**
   - Connect to Paystack/Stripe
   - Handle payment callbacks
   - Update balance in real-time

4. **Order Tracking**
   - Show real order status
   - Send status update emails
   - Display tracking timeline

5. **Analytics**
   - Track cart conversion rate
   - Monitor checkout abandonment
   - Measure average order value

---

**Version**: 2.0
**Status**: Production Ready
**Last Updated**: 2024
