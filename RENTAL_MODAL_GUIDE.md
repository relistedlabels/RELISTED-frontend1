# Shopping Cart & Rental Modal Setup Guide

## 📋 Overview

This guide covers the implementation of:

1. **LoginModal** - Modal-based login for non-authenticated users
2. **RentalDurationSelector** - Updated with auth checks and loading states
3. **Error Handling** - Proper error boundaries and error alerts
4. **Skeleton Loaders** - Loading states while checking authentication

---

## 🔑 Key Features Implemented

### 1. Login Modal Component

**Location:** `src/common/modals/LoginModal.tsx`

**Features:**

- Modal dialog (not page redirect)
- Email/password login form with validation
- "Sign Up" toggle for new users
- Password visibility toggle
- Error message display
- Loading state during submission
- Smooth animations with Framer Motion

**Usage:**

```tsx
<LoginModal
  isOpen={isLoginModalOpen}
  onClose={() => setIsLoginModalOpen(false)}
  onLoginSuccess={handleLoginSuccess}
/>
```

### 2. Auth-Protected Rental Flow

**Location:** `src/app/shop/product-details/components/RentalDurationSelector.tsx`

**Flow:**

1. User selects rental duration
2. Clicks "Check Availability"
3. System checks if user is authenticated via `useMe()` query
4. If NOT authenticated:
   - Show LoginModal
   - After successful login, automatically proceed with availability check
5. If authenticated:
   - Submit availability request to backend
   - Show loading state with spinner

**Key Queries:**

- `useMe()` - Checks current authentication status
- `useUserStore()` - Zustand store for user token/id

### 3. Skeleton Loaders for Auth

**Location:** `src/common/ui/SkeletonAuth.tsx`

**Available Loaders:**

- `AuthCheckSkeleton` - Simple loading skeleton
- `LoginModalSkeleton` - Full modal loading state
- `RentalCheckSkeleton` - Rental form loading state

**Usage:**

```tsx
if (isCheckingAuth) {
  return <RentalCheckSkeleton />;
}
```

### 4. Error Handling

**Location:** `src/common/components/RentalErrorBoundary.tsx`

**Components:**

- `RentalErrorBoundary` - React Error Boundary class
- `ErrorAlert` - Toast-like error display
- `useRentalError()` - Hook for managing error state

**Usage:**

```tsx
const { error, triggerError, clearError } = useRentalError();

try {
  // operation
} catch (error) {
  triggerError(error);
}
```

---

## 🔧 Common Console Errors & Solutions

### Error: "User not authenticated"

**Cause:** User tries to check availability without login

**Solution:** Already handled! Modal shows automatically

**Console Log:**

```
User not authenticated, showing login modal
```

### Error: "useMe() query failed"

**Cause:** Auth check request failed

**Visual Feedback:**

- Yellow warning alert: "Having trouble verifying your session"
- "Check Availability" button disabled
- Skeleton loader shown initially

**Solution:** User should refresh page to retry auth check

### Error: "Failed to check availability"

**Cause:** `/api/renters/rental-requests` endpoint failed

**Visual Feedback:**

- Red error alert with message
- Error can be dismissed with ✕ button
- User can retry

**Console Log:**

```
Error checking availability: [error details]
```

### Error: "Login failed"

**Cause:** Invalid credentials or network error

**Visual Feedback:**

- Red error box in modal
- "Sign In" button shows actual error message
- User can retry immediately

**Console Log:**

```
Login error: [error details]
```

---

## 🛠️ API Integration Checklist

### RentalDurationSelector - handleCheckAvailability()

When backend `/api/renters/rental-requests` is ready, uncomment and replace:

```tsx
// Replace this placeholder:
await new Promise((resolve) => setTimeout(resolve, 1000));

// With this:
const response = await submitAvailabilityRequest({
  productId: "prod_001", // from URL params
  listerId: "user_123", // from product details
  rentalStartDate: "2026-02-20", // from calendar selection
  rentalEndDate: "2026-02-23", // from calendar selection
  rentalDays: selectedDuration, // 3, 6, 9, or custom
  estimatedRentalPrice: 165000, // from product details
  autoPay: true, // from toggle switch (if added)
  currency: "NGN",
});
```

### Expected Response:

```json
{
  "success": true,
  "data": {
    "requestId": "req_001",
    "cartItemId": "cart_item_001",
    "expiresAt": "2026-02-08T14:45:00Z",
    "timeRemainingSeconds": 840
  }
}
```

---

## 📱 User Experience Flow

### Scenario 1: User is already logged in

```
User Opens Product Page
    ↓
Clicks "Check Availability"
    ↓
(Skeleton shows briefly while checking auth)
    ↓
useMe() query returns user data
    ↓
Button shows "Checking Availability..." with spinner
    ↓
API call submitted
    ↓
Response: Success or Error
```

### Scenario 2: User is NOT logged in

```
User Opens Product Page
    ↓
Clicks "Check Availability"
    ↓
(Skeleton shows briefly)
    ↓
useMe() returns no user
    ↓
LoginModal appears
    ↓
User enters email/password and submits
    ↓
Login successful
    ↓
onLoginSuccess callback fires
    ↓
Modal closes automatically
    ↓
"Check Availability" proceeds automatically
    ↓
Availability request submitted
    ↓
Response: Success or Error
```

---

## 🎯 Testing Checklist

- [ ] Open product page as guest
- [ ] Click "Check Availability" → LoginModal appears
- [ ] Close modal → Modal disappears
- [ ] Submit bad credentials → Error shows in modal
- [ ] Submit correct credentials → Modal closes
- [ ] After login, availability check proceeds automatically
- [ ] Logged-in user clicks "Check Availability" → No modal, direct API call
- [ ] Check browser console → No JavaScript errors
- [ ] Check browser console → See logs for each step

---

## 📝 Debugging Tips

### Enable Detailed Logging

Add to RentalDurationSelector:

```tsx
useEffect(() => {
  console.log("Auth state:", { token: user.token, userId: user.userId });
  console.log("Checking auth:", isCheckingAuth);
  console.log("Auth error:", authError);
}, [isCheckingAuth, authError, user]);
```

### Monitor useMe() Query

```tsx
const authQuery = useMe();

useEffect(() => {
  console.log("useMe() query state:", {
    data: authQuery.data,
    isLoading: authQuery.isLoading,
    isError: authQuery.isError,
    error: authQuery.error,
  });
}, [authQuery]);
```

### Check Network Requests

1. Open DevTools → Network tab
2. Click "Check Availability"
3. Look for requests:
   - `GET /api/auth/me` - Auth check
   - `POST /api/renters/rental-requests` - Availability check

### Console Error Messages to Look For

**Normal flow (no errors):**

```
User not authenticated, showing login modal
Login successful, proceeding with availability check
Checking availability for duration: 3
Availability check successful
```

**Error flow (needs fixing):**

```
Error checking availability: [message]
Availability check mutation error: [message]
```

---

## 🚀 Next Steps

1. **Implement Product ID in URL**: Extract from dynamic route parameters
2. **Fetch Product Details**: Load lister ID, pricing, availability calendar
3. **Connect Calendar Selection**: Wire up date picker to actual date selection
4. **Wire Address Selection**: Add delivery address selection before checkout
5. **Add Auto-Pay Toggle**: Implement auto-pay option in pricing section
6. **Implement Checkout**: Handle pending requests with timer

---

## 📞 Support

For console errors or issues:

1. Check the **Debugging Tips** section above
2. Search for error message in this guide
3. Review the **Common Console Errors** section
4. Check browser console for actual error messages (not just logs)
5. Verify all components are properly imported
