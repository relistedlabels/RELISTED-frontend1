# Cart Items Not Clearing After Order - Handoff Document

## Problem
After placing an order at checkout, the item remains visible in the cart page instead of being removed or hidden.

## Current Flow

1. User approves item → goes to cart as "APPROVED" status
2. User completes checkout → clicks "Complete Order"
3. Backend creates order, changes item status to "ORDERED" (or similar)
4. Frontend shows success page
5. User goes back to cart → item still shows!

## What's Expected
- Item should disappear from cart after order is placed
- Status filter should exclude "ORDERED" items from display

## What's Actually Happening
- Frontend invalidates cart queries on checkout success (correct)
- But the cart query still returns the item because filter function `isCartRentalMainListRow` doesn't recognize the new status

## Current Filter Code (src/lib/cart/mergeCartLineRental.ts)

```js
export function isCartRentalMainListRow(status?: string, expiresAt?: string): boolean {
  const u = (status ?? "").trim().toUpperCase();
  if (
    u === "REJECTED" ||
    u === "DECLINED" ||
    u === "CANCELLED" ||
    u === "COMPLETED"
  ) {
    return false;  // Don't show
  }
  if (u === "APPROVED" || u === "ACCEPTED") {
    return true;  // Show
  }
  return isActivePendingCartRental(status, expiresAt);
}
```

**Missing statuses:** "ORDERED", "PROCESSING" (or whatever status backend sets after checkout)

## Questions for Backend

1. **What status does the backend set on cart items after checkout?** 
   - Is it "ORDERED"? "PROCESSING"? Something else?

2. **Should the cart item be deleted or just status-changed?**
   - If deleted, frontend doesn't need filter change
   - If status-changed, we need to know the exact status name

3. **Is there an order status we should exclude?**
   - e.g., "PENDING_REMOVAL", "DELETED", etc.

## What We Tried (Frontend Fixes)

Added "ORDERED" and "PROCESSING" to filter - but this is a guess:

```js
if (u === "ORDERED" || u === "PROCESSING") {
  return false;
}
```

**Need backend confirmation on the actual status value.**

## Alternative Solution

If backend could include a flag or delete the cart item after order, that would be cleaner than relying on status filtering.

---

**TL;DR:** What exact status does backend set on cart items after successful checkout? We need to add it to the filter, or the backend should delete/remove the cart item.