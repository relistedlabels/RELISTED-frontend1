# Staged Files - Commit Groups

## Total Staged Files: 38
**Changes:** +1418 insertions, -595 deletions

---

## Suggested Commit Groups: 4

### Commit 1: Lister Order Management UI
**Description:** Update lister order management components and related API
**Commit message:** feat: update lister order management UI and related API

**Files (10):**
- src/app/listers/components/InventoryList.tsx
- src/app/listers/components/OrderDetailsCard.tsx
- src/app/listers/components/OrderItemList.tsx
- src/app/listers/components/OrderPreview.tsx
- src/app/listers/components/OrderProgress.tsx
- src/app/listers/components/OrderSummaryCards.tsx
- src/app/listers/components/OrderSummaryEscrow.tsx
- src/app/listers/components/OrdersManagement.tsx
- src/lib/listers/listerOrderRow.ts
- src/lib/api/listers.ts

**Git add command:**
```bash
git add src/app/listers/components/InventoryList.tsx src/app/listers/components/OrderDetailsCard.tsx src/app/listers/components/OrderItemList.tsx src/app/listers/components/OrderPreview.tsx src/app/listers/components/OrderProgress.tsx src/app/listers/components/OrderSummaryCards.tsx src/app/listers/components/OrderSummaryEscrow.tsx src/app/listers/components/OrdersManagement.tsx src/lib/listers/listerOrderRow.ts src/lib/api/listers.ts
```

---

### Commit 2: Shop Cart & Checkout Flow
**Description:** Enhance shopping cart, checkout components, and cart-related logic
**Commit message:** feat: enhance shop cart and checkout flow

**Files (9):**
- src/app/shop/cart/checkout/components/FinalOrderSummaryCard.tsx
- src/app/shop/cart/checkout/page.tsx
- src/app/shop/cart/components/CheckoutProductList.tsx
- src/app/shop/cart/components/FinalOrderSummaryCard.tsx
- src/app/shop/cart/components/RentalCartSummary.tsx
- src/app/shop/cart/page.tsx
- src/app/shop/cart/types.ts
- src/lib/api/cart.ts
- src/lib/cart/mergeCartLineRental.ts
- src/lib/mutations/cart/useReRequestAvailability.ts

**Git add command:**
```bash
git add src/app/shop/cart/checkout/components/FinalOrderSummaryCard.tsx src/app/shop/cart/checkout/page.tsx src/app/shop/cart/components/CheckoutProductList.tsx src/app/shop/cart/components/FinalOrderSummaryCard.tsx src/app/shop/cart/components/RentalCartSummary.tsx src/app/shop/cart/page.tsx src/app/shop/cart/types.ts src/lib/api/cart.ts src/lib/cart/mergeCartLineRental.ts src/lib/mutations/cart/useReRequestAvailability.ts
```

---

### Commit 3: Product Details & Rental/Resale Features
**Description:** Update product details UI with rental/resale information and related APIs
**Commit message:** feat: update product details with rental/resale features

**Files (9):**
- src/app/shop/product-details/components/ProductDetailsTabsClient.tsx
- src/app/shop/product-details/components/RentalDetailsCard.tsx
- src/app/shop/product-details/components/RentalPeriods.tsx
- src/app/shop/product-details/components/ResaleDetailsCard.tsx
- src/lib/api/product.ts
- src/lib/api/renters.ts
- src/lib/mutations/renters/useRentalRequestMutations.ts
- src/lib/queries/product/useGetProductById.ts

**Git add command:**
```bash
git add src/app/shop/product-details/components/ProductDetailsTabsClient.tsx src/app/shop/product-details/components/RentalDetailsCard.tsx src/app/shop/product-details/components/RentalPeriods.tsx src/app/shop/product-details/components/ResaleDetailsCard.tsx src/lib/api/product.ts src/lib/api/renters.ts src/lib/mutations/renters/useRentalRequestMutations.ts src/lib/queries/product/useGetProductById.ts
```

---

### Commit 4: Listing Type & Resale Price Fixes
**Description:** Fix listing type handling and resale price display across the application
**Commit message:** fix: handle listing type and resale price correctly across product components

**Files (10):**
- src/store/useProductDraftStore.ts
- src/app/renters/components/Favorites.tsx
- src/app/shop/sections/NewListingsSection.tsx
- src/app/lister-profile/components/NewListingsSection.tsx
- src/app/home/sections/TopListingSection1.tsx
- src/app/home/sections/TopListingSection2.tsx
- src/app/shop/product-details/components/TopListingSection.tsx
- src/app/listers/components/InventoryList.tsx
- src/app/listers/inventory/product-edit/[id]/page.tsx
- src/app/listers/components/InventoryItemDetailsHeader.tsx

**Git add command:**
```bash
git add src/store/useProductDraftStore.ts src/app/renters/components/Favorites.tsx src/app/shop/sections/NewListingsSection.tsx src/app/lister-profile/components/NewListingsSection.tsx src/app/home/sections/TopListingSection1.tsx src/app/home/sections/TopListingSection2.tsx src/app/shop/product-details/components/TopListingSection.tsx src/app/listers/components/InventoryList.tsx src/app/listers/inventory/product-edit/[id]/page.tsx src/app/listers/components/InventoryItemDetailsHeader.tsx
```

---

## Usage Instructions

1. **Unstage all files:**
   ```bash
   git reset
   ```

2. **Commit each group:**
   ```bash
   # Commit 1
   git add [files from group 1]
   git commit -m "feat: update lister order management UI and related API"

   # Commit 2
   git add [files from group 2]
   git commit -m "feat: enhance shop cart and checkout flow"

   # Commit 3
   git add [files from group 3]
   git commit -m "feat: update product details with rental/resale features"

   # Commit 4
   git add [files from group 4]
   git commit -m "fix: handle listing type and resale price correctly across product components"
   ```

3. **Verify commits:**
   ```bash
   git log --oneline -4
   ```
