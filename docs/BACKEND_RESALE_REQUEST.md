# Backend Request: Resale Feature Implementation

**Date:** April 15, 2026  
**Purpose:** Request confirmation of data structures, endpoints, payloads, and workflows for the resale feature

---

## Overview

The resale feature implementation appears mostly complete on the lister and renter sides. We need to ensure all backend data structures, endpoints, and workflows are aligned and correctly implemented.

---

## Data Structures Request

### Product Model
- `saleType`: `"resale" | "rent" | "rent-resale"` - Indicates how the item can be listed
- `resalePrice`: number - The purchase price for resale (if applicable)
- `originalValue`: number - Retail value of the item

### Order/OrderItem Model
- `listingType`: `"RENTAL" | "RESALE" | "RENT_OR_RESALE"` - Order-level classification
- `isResale`: boolean - Item-level flag (derived from `days === 0`)
- `purchasePrice`: number - Purchase price for resale items
- `days`: number - 0 for resale items, >0 for rentals
- `rentalDays`: number - Alternative field for rental duration

### Escrow Model
- `purchasePrice`: number - For resale escrow calculations
- Escrow release condition: "delivery confirmation" for resale vs "return approval" for rental

---

## Endpoints Request

### Product Endpoints
- **POST /api/listers/inventory** - Include `saleType`, `resalePrice` fields
- **PUT /api/listers/inventory/:productId** - Support updating `saleType` and `resalePrice`
- **GET /api/public/products/:id** - Return `saleType` and `resalePrice`

### Cart Endpoints
- **POST /api/cart/items** - Support `days: 0` for resale items
- **GET /api/cart/items** - Return `isResale` flag on each item

### Order Endpoints
- **POST /api/orders** - Handle mixed orders (rental + resale items)
- **GET /api/listers/orders** - Return `listingType`, `purchasePrice` on items
- **GET /api/listers/orders/:orderId** - Include full order context for resale vs rental
- **GET /api/listers/orders/:orderId/progress** - Return appropriate steps based on `listingType`

### Order Summary Endpoint
- **GET /api/cart/summary** - Return breakdown distinguishing rental vs resale items:
  - `rentalTotal` vs `itemTotal`
  - `collateralTotal` (only for rentals)
  - `cleaningTotal` (only for rentals)

---

## Payload Examples Request

### Product Creation Payload
```json
{
  "name": "FENDI ARCO BOOTS",
  "saleType": "rent-resale",
  "resalePrice": 450000,
  "dailyPrice": 35000,
  "originalValue": 850000,
  // ... other fields
}
```

### Cart Item Payload (Resale)
```json
{
  "productId": "prod_001",
  "days": 0,
  "isResale": true
}
```

### Order Item Response
```json
{
  "id": "item_001",
  "listingType": "RESALE",
  "purchasePrice": 450000,
  "days": 0,
  "isResale": true
}
```

### Order Summary Response
```json
{
  "summary": {
    "rentalTotal": 150000,
    "collateralTotal": 50000,
    "cleaningTotal": 10000,
    "pickupTotal": 5000,
    "shippingTotal": 3000,
    "serviceCharge": 0,
    "vatAmount": 0
  },
  "listerBreakdowns": [
    {
      "listerId": "lister_001",
      "rentalTotal": 450000,
      "collateralTotal": 0,
      "cleaningTotal": 0,
      "pickupCost": 5000,
      "shippingCost": 3000,
      "itemsCount": 1
    }
  ]
}
```

---

## Workflows Request

### Lister Workflow
1. **Product Upload**: Listers select `saleType` (Resale/Rent/Rent & Resale)
2. **Pricing**: 
   - If `saleType === "resale"` or `"rent-resale"`: Require `resalePrice`
   - If `saleType === "rent"` or `"rent-resale"`: Require `dailyPrice`
3. **Inventory Management**: Display items with appropriate sale type badges

### Renter Workflow
1. **Product Discovery**: Show resale price when product supports resale
2. **Add to Cart**: Send `days: 0` for resale items
3. **Checkout**: 
   - No security deposit for resale items
   - No cleaning fee for resale items
   - Display "Item Total" instead of "Rental Total"
4. **Order Placement**: Create order with `listingType` based on items

### Order Management Workflow
1. **Order Progress**: 
   - Resale: Pending → Approved → In Transit → Delivered → Completed
   - Rental: Pending → Approved → In Transit → Delivered → Return Due → Return Transit → Completed
2. **Escrow Release**: 
   - Resale: Release on delivery confirmation
   - Rental: Release on return approval
3. **Lister View**: Display `purchasePrice` for resale items, `rentalFee` for rentals

---

## Questions for Backend Team

1. **Data Structure Validation**: Are the fields (`saleType`, `resalePrice`, `listingType`, `purchasePrice`) correctly defined in the database schema?

2. **Endpoint Availability**: Are all the endpoints listed above implemented and returning the expected fields?

3. **Mixed Orders**: Can a single order contain both rental and resale items? How should `listingType` be set in this case?

4. **Escrow Logic**: Is the escrow release condition correctly differentiated between resale (delivery confirmation) and rental (return approval)?

5. **Order Progress**: Does the progress endpoint return the correct step sequence based on `listingType`?

6. **Order Summary**: Does the summary endpoint correctly calculate totals, excluding `collateralTotal` and `cleaningTotal` for resale items?

7. **Cart Logic**: Does the cart correctly handle items with `days: 0` and set `isResale: true`?

8. **Inventory Status**: How does the inventory status work for resale items? Do they move to "SOLD" instead of "RENTED"?

---

## Priority Items

Please confirm the following are correctly implemented:

- [ ] Product model includes `saleType` and `resalePrice`
- [ ] Order/OrderItem model includes `listingType`, `purchasePrice`, `isResale`
- [ ] Cart endpoint supports `days: 0` for resale
- [ ] Order summary excludes deposit/cleaning fees for resale items
- [ ] Order progress returns correct steps for resale vs rental
- [ ] Escrow release condition is differentiated
- [ ] Mixed orders (rental + resale) are supported

---

**Next Steps:** Please review and confirm the above, or provide corrections/adjustments as needed. We want to ensure the frontend and backend are fully aligned before proceeding with testing.
