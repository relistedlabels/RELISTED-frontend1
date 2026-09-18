# New Rental Flow: Implementation Roadmap

Phased delivery plan for the optimizations in `CUSTOMER_JOURNEY_ANALYSIS.md` and `CURRENT RELISTED → NEW RENTAL FLOW.ini`.

**Repos:** `RELISTED-frontend1` (Next.js) + `relisted-backend` (NestJS)

---

## Branch map

| Phase | Frontend branch | Backend branch | Ships independently? |
|-------|-----------------|----------------|----------------------|
| **1** Discovery & nav | `feat/new-rental-flow/phase-1-discovery` | — | Yes |
| **2** Rental flow UX | `feat/new-rental-flow/phase-2-rental-flow` | `feat/new-rental-flow/phase-2-rental-flow` | Yes (needs both) |
| **3** WhatsApp + async notify | `feat/new-rental-flow/phase-3-whatsapp` | `feat/new-rental-flow/phase-3-whatsapp` | Needs Meta credentials |
| **4** Lister dashboard | `feat/new-rental-flow/phase-4-lister-dashboard` | — (uses phase 3 APIs) | Yes |
| **5** Unified account | `feat/new-rental-flow/phase-5-unified-account` | `feat/new-rental-flow/phase-5-unified-account` | Later (role model) |

Merge order: **1 → 2 → 3 → 4 → 5**

---

## Phase 1: Discovery & navigation (frontend only)

**Goal:** First screen answers "How do I want to shop?" Rent and Buy are first-class modes.

### Build list

- [ ] Homepage hero: `RENT` / `SHOP RESALE` CTAs (replace equal-weight "Find Your Next Fit" + "List Items")
- [ ] Homepage sections: New In → Shop by Occasion → Most Rented → List Your Wardrobe (lower)
- [ ] Mobile sticky bottom nav: Home / Rent / Buy / Saved / Account
- [ ] Copy: "Refundable security deposit" (remove customer-facing "Locked Balance")
- [ ] Pricing: "Rent for ₦X — N-day rental" instead of daily-only display
- [ ] Nav routes: `/shop?listingType=RENTAL,RENT_OR_RESALE` (Rent), `/shop?listingType=RESALE,RENT_OR_RESALE` (Buy)

### Key files

- `src/app/home/sections/EndlessStyleHero.tsx`
- `src/app/page.tsx`
- `src/common/layer/MobileBottomNav.tsx` (new)
- `src/app/layout.tsx`, `src/lib/navbarRoutes.ts`
- `src/app/shop/product-details/components/RentalDetailsCard.tsx`
- Checkout/wallet copy in `FinalOrderSummaryCard.tsx`, `UserWalletDashboard.tsx`

### Acceptance

- Mobile user can switch Rent/Buy/Saved/Account without opening hamburger
- Homepage shows product preview below hero within one scroll
- Product page shows total rental price for selected duration

---

## Phase 2: Rental flow UX (frontend + backend)

**Goal:** Lightweight availability check; customer can leave; no cart-as-approval-hub.

### Build list

**Frontend**

- [ ] Guest contact modal (first name, email, WhatsApp) when not logged in
- [ ] Allow date/duration selection before sign-in (calendar preview for guests)
- [ ] Remove profile + address + dispatch windows from availability check
- [ ] New screens:
  - `/shop/availability/checking?requestId=…` — "We're checking with the lister"
  - `/shop/availability/available?requestId=…` — "It's available!" → Complete Rental
- [ ] Remove pending/expired approval UI from cart; cart = checkout-ready items only
- [ ] Progressive checkout stepper (Delivery → Payment → Confirm)
- [ ] Defer delivery address to checkout (post-confirmation)

**Backend**

- [ ] `deliveryAddressId` already optional — confirm checkout collects it
- [ ] Guest availability endpoint: `POST /api/public/availability-requests`
  - Creates guest user stub OR stores guest contact on request
  - Returns `requestId` + tracking token
- [ ] Public status endpoint: `GET /api/public/availability-requests/:id?token=…`
- [ ] Lister magic-link approve/reject (interim before WhatsApp):
  - `GET /api/public/lister-response/:token?action=accept|reject`
- [ ] Notification copy: hide "approval" language; use "checking availability"

### Key files

**Frontend:** `RentalPeriods.tsx`, `shop/cart/*`, new `shop/availability/*`

**Backend:** `renters.service.ts`, new `public/availability-requests.controller.ts`

### Acceptance

- Guest can check availability with 3 fields, no full account
- After submit, user lands on "checking" screen and can browse away
- When lister accepts, user gets email with link to "available" → checkout
- Cart no longer shows pending timers

### Dispatch windows & late approval

Extends Phase 2 rental flow. Same branches: `feat/new-rental-flow/phase-2-rental-flow` (FE + BE).

**Problem:** A renter can pick an immediate delivery window, but the lister may respond after that window has passed. "Immediate" and late approval cannot both be honored. Request status, SLAs, and timers stay internal; renters never see expired/pending request UI.

**Principles**

- If the renter's chosen outbound window has ended, the lister cannot approve the existing request.
- If the lister approved in time but the renter is slow at checkout, roll windows forward instead of hard-expiring.
- Shift rental dates as a bundle: outbound, `startDate`, `endDate`, and return always move together.
- Keep `rentalDays` fixed; price stays `dailyPrice × rentalDays` (recalc from current product price, do not drop a day when dates shift).
- One line of honest copy on the product page only; do not over-explain elsewhere.

**Date bundle rule (1-day and multi-day)**

| Field | On refresh |
|-------|------------|
| Outbound window | Next valid slot |
| `startDate` | Lagos calendar day of new outbound (first wear day) |
| `endDate` | `startDate + (rentalDays - 1)` |
| Return window | `startDate + rentalDays` (via `ensureRentalReturnDispatchWindow`) |
| `totalPrice` | `dailyPrice × rentalDays` (unchanged day count) |

Example (1-day): wear Fri → return Sat. Outbound slips to Sat → wear Sat, return Sun, still 1 day, same price.

#### Phase 1 — Block late lister approval + notify renter

**Backend**

- [ ] On approve: reject if renter's outbound window has already ended (`isWindowExpired`).
- [ ] Remove silent window refresh on approve when outbound is stale (`dispatchWindowDataForAvailabilityApproval` only applies while windows are still valid).
- [ ] New lister action: **Notify renter item is available** (when approve is blocked).
- [ ] Email renter: product name, listing URL, short line to request again with a new delivery time. No checkout magic link on this path.

**Frontend**

- [ ] Lister approve UI: if outbound window passed → show **Notify renter**, not **Approve**.

**Acceptance**

- Lister cannot approve a request whose outbound window has ended.
- Renter gets email with listing URL and can submit a fresh availability request.

#### Phase 2 — Checkout auto-refresh & date bundle

**Backend**

- [ ] At checkout summary load: if approved outbound window ended, roll outbound to next valid slot (do not mark request EXPIRED).
- [ ] Shift `startDate` / `endDate` with fixed `rentalDays`; rebuild return window from new start.
- [ ] Recalc `totalPrice` from `dailyPrice × rentalDays`; persist on availability request + cart line before summary returns.

**Frontend**

- [ ] Compact banner when dates/windows changed: *"Your delivery time has passed. New earliest slot: 5:00–6:00 PM. Confirm below or pick another."*
- [ ] Show updated dates in checkout; optional *"Price unchanged"* when `rentalDays` did not change.
- [ ] Renter confirms or changes windows via existing `DispatchWindowsScheduler` (no extra modal).
- [ ] If renter changes outbound day on scheduler, re-run date bundle + price recalc.

**Acceptance**

- Renter who opens checkout after a valid approval is not forced to re-request.
- 1-day rentals: return always moves with outbound; no return-before-wear edge case.
- Order summary reflects shifted dates and correct price.

#### Phase 3 — Approval email times & product copy

**Backend**

- [ ] On normal approve (window still valid): add outbound (+ return if rental) formatted times to `rental-response.hbs`. One line each, no extra paragraphs.

**Frontend**

- [ ] Product page outbound picker helper (one place only): **"Delivery depends on lister availability."**

**Acceptance**

- Approval email shows the delivery/return times the renter will get at checkout.
- Product page has a single short delivery disclaimer.

**Out of scope**

- Renter-facing request status, timers, or expired badges
- Tighter immediate SLA / lister-online rules
- Extra copy on available page, cart, or multiple email templates
- Price reduction when an event-day slip makes the original intent impossible (v1: same `rentalDays`, same price)

**Key files**

- BE: `listers.service.ts`, `availability-request-expiry.util.ts`, `order.service.ts`, `rental-response.hbs`, new notify email template
- FE: lister approve UI, `checkout/page.tsx`, `DispatchWindowsScheduler.tsx`, `FinalOrderSummaryCard.tsx`, `RentalDispatchWindowPicker.tsx`

**Build order:** Phase 1 → Phase 2 → Phase 3

---

## Phase 3: WhatsApp integration (frontend + backend)

**Goal:** Listers confirm YES/NO from WhatsApp; renters notified via WhatsApp/email.

**Prerequisite:** Meta WhatsApp Business API credentials (`WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN`, webhook verify token).

### Build list

- [ ] `WhatsAppService` — send template/interactive messages
- [ ] Webhook controller: `POST /webhook/whatsapp`
  - Parse button replies: "Yes, available" / "No, not available"
  - Update `AvailabilityRequest` status
  - Notify renter (WhatsApp + email)
- [ ] Outbound messages:
  - **To lister:** new request with YES/NO buttons
  - **To renter:** availability confirmed → Complete Rental link
  - **To renter:** final booking confirmation
- [ ] Fallback: magic link in WhatsApp message if buttons fail
- [ ] Store `whatsappPhone` on user profile / guest enquiry

### Key files

**Backend:** `src/services/whatsapp/`, `src/services/webhook/whatsapp-webhook.controller.ts`

**Frontend:** minimal (links in notifications point to phase 2 screens)

### Acceptance

- Lister receives WhatsApp with item, dates, YES/NO buttons
- Tapping YES updates request to ACCEPTED and notifies renter
- No dashboard login required for lister response

---

## Phase 4: Lister dashboard simplification (frontend)

**Goal:** Consumer app feel, not admin CRM.

### Build list

- [ ] Bottom tab nav: Home / Listings / Requests / Wallet / Account
- [ ] Priority banner: "N new rental requests — Respond now"
- [ ] Stats: Active Listings, Upcoming Rentals, Total Earnings (drop Pending Approval / Disputes from home)
- [ ] Recent activity feed
- [ ] Move Disputes, Settings, Help under Account tab

### Key files

- `src/app/listers/components/DashboardLayout.tsx`
- `src/app/listers/dashboard/page.tsx`
- New `ListerBottomNav.tsx`

---

## Phase 5: Unified account (frontend + backend)

**Goal:** One Relisted account; rent, buy, and list from same profile.

### Build list

- [ ] Remove `AccountRoleSelector` at signup
- [ ] Default role `RENTER`; upgrade to lister via "List Your Wardrobe" when ready
- [ ] Backend: relax role gates where lister features are additive
- [ ] Onboarding: optional popup instead of forced 6-step intercept

### Deferred rationale

Touches auth, onboarding guards, and role checks across both repos. Safe to ship after phases 1–4.

---

## WhatsApp: where it lives

```
Customer checks availability
        ↓
Backend creates AvailabilityRequest (PENDING)
        ↓
┌───────────────────────────────────────┐
│ Phase 2 (interim): email + magic link │
│ Phase 3: WhatsApp interactive message │
└───────────────────────────────────────┘
        ↓
Lister taps YES → status ACCEPTED
        ↓
Renter notified (WhatsApp/email) → /availability/available
        ↓
Checkout (delivery + payment) → CONFIRMED
```

---

## Env vars (Phase 3)

```env
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_WEBHOOK_VERIFY_TOKEN=
WHATSAPP_BUSINESS_ACCOUNT_ID=
```

---

## Metrics to add (Phase 2+)

Track funnel: `availability_requested → lister_responded → checkout_started → paid → delivery_confirmed → return_complete → deposit_released`

Median lister response time and expired request rate.
