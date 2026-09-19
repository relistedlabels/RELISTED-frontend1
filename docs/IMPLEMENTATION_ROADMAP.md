# New Rental Flow: Implementation Roadmap

Phased delivery plan for the optimizations in `CUSTOMER_JOURNEY_ANALYSIS.md` and `CURRENT RELISTED → NEW RENTAL FLOW.ini`.

**Repos:** `RELISTED-frontend1` (Next.js) + `relisted-backend` (NestJS)

---

## Progress snapshot (Sep 2026)

| Phase | Frontend | Backend | Notes |
|-------|----------|---------|-------|
| **1 + 1b** Discovery & shop revamp | **On staging** | — | Core browse/findability shipped |
| **2** Rental flow UX | **On staging** | **On staging** | Guest availability, checking/available screens, cart cleanup, dispatch-window rules |
| **2 ext** Rental UX polish | In flight (`feat/shop-buy-mode-pdp-default`, +13 commits ahead of staging) | In flight (`fix/order-confirmation-email-subjects`, +7 commits ahead of staging) | Checkout review UI, PWA, buy-mode PDP on FE; BE admin alerts + 2h dispatch + email copy not on staging yet |
| **3** WhatsApp | Not started (scaffold only) | Not started (scaffold only) | `WhatsAppService` exists; no webhook or outbound wiring |
| **4** Lister dashboard | Not started | — | — |
| **5** Unified account | Not started | Not started | — |
| **6** Lister trust, AR transparency & help | Not started | Not started | AR response metric, lister suspend, help chatbot |

**Not in prod yet:** phases 1–2 and adjacent work are on **staging**, not `main`.

**Top remaining gaps (all phases):**

- Wallet/onboarding still say **Locked Balance** (PDP + checkout use "Refundable security deposit")
- PDP header block still hardcodes **"1-day rental"** (duration UI below is dynamic)
- Dead shop hero files not deleted (`src/app/shop/sections/EndlessStyleHero*.tsx`)
- SearchModal has no "View all on shop" link
- Phase 2 extension branch `feat/new-rental-flow/phase-2-rental-flow` (commit `788ff42`) not merged: lister order status labels, mobile auth sheet polish

---

## Branch map

| Phase | Frontend branch | Backend branch | Ships independently? |
|-------|-----------------|----------------|----------------------|
| **1** Discovery & nav + shop revamp | `feat/new-rental-flow/phase-1-discovery` | — | Yes |
| **2** Rental flow UX | `feat/new-rental-flow/phase-2-rental-flow` | `feat/new-rental-flow/phase-2-rental-flow` | Yes (needs both) |
| **3** WhatsApp + async notify | `feat/new-rental-flow/phase-3-whatsapp` | `feat/new-rental-flow/phase-3-whatsapp` | Needs Meta credentials |
| **4** Lister dashboard | `feat/new-rental-flow/phase-4-lister-dashboard` | — (uses phase 3 APIs) | Yes |
| **5** Unified account | `feat/new-rental-flow/phase-5-unified-account` | `feat/new-rental-flow/phase-5-unified-account` | Later (role model) |
| **6** Lister trust, AR transparency & help | `feat/new-rental-flow/phase-6-lister-trust` | `feat/new-rental-flow/phase-6-lister-trust` | Yes (needs both for metric + suspend) |

Merge order: **1 (incl. 1b shop revamp) → 2 → 2 ext (adjacent) → 3 → 4 → 5 → 6**

---

## Phase 1: Discovery & navigation (frontend only)

**Goal:** First screen answers "How do I want to shop?" Rent and Buy are first-class modes.

**Status (Sep 2026):** **Shipped on staging.** Remaining gaps: wallet/onboarding "Locked Balance" copy, dynamic N-day price in the PDP header block, and buy-mode PDP default (on `feat/shop-buy-mode-pdp-default`, not staging yet).

### Build list

- [x] Homepage hero: `RENT` / `SHOP RESALE` CTAs (replace equal-weight "Find Your Next Fit" + "List Items")
- [x] Homepage sections: New In → Popular Categories (occasion tiles) → Most Rented → List Your Wardrobe (`BecomeCurator`, lower). Brand carousel + featured sale sit between New In and categories.
- [x] Mobile sticky bottom nav: Home / Rent / Buy / Orders / Cart *(original spec had Account/Saved; guests get auth sheet on Orders and Cart)*
- [~] Copy: "Refundable security deposit" *(PDP + checkout use it; wallet dashboard and onboarding still say "Locked Balance")*
- [~] Pricing: "Rent for ₦X — N-day rental" *(PDP shows "Rent for" + total; duration line is still "1-day rental" in the header block; N-day copy appears in duration/logistics UI below)*
- [x] Nav routes: `/shop?listingType=RENTAL,RENT_OR_RESALE` (Rent), `/shop?listingType=RESALE,RENT_OR_RESALE` (Buy)
- [~] Buy-mode PDP default: `?mode=buy` from shop opens Resale tab first *(on `feat/shop-buy-mode-pdp-default`, ahead of staging)*

**Also shipped (Phase 1 adjacent):**

- [x] Style Spotlight removed from main nav; home "Browse All" → `/shop`
- [x] Sales nav link with tag icon (desktop + mobile)
- [x] Closet shop UI gated behind admin **Closet Feature** toggle (`headerClosetsShopNavEnabled`)

### Key files

- `src/app/home/sections/EndlessStyleHero.tsx`
- `src/app/page.tsx`
- `src/common/layer/MobileBottomNav.tsx`
- `src/app/layout.tsx`, `src/lib/navbarRoutes.ts`, `src/lib/nav/shopNavMatch.ts`
- `src/app/shop/product-details/components/RentalDetailsCard.tsx`
- Checkout/wallet copy in `FinalOrderSummaryCard.tsx`, `UserWalletDashboard.tsx`
- `src/lib/site/closetShopFeature.ts`, `src/common/layer/SalesNavLink.tsx`

### Acceptance

- [x] Mobile user can switch Rent/Buy/Orders/Cart without opening hamburger
- [x] Homepage shows product preview below hero within one scroll
- [~] Product page shows total rental price for selected duration *(total updates in rental flow; top "Rent for" block still defaults to 1-day label)*

### Phase 1b: Shop browse & findability (frontend only)

**Goal:** Shop answers "what am I looking for?" without an extra click. Curated shortcuts sit above the grid; the full catalog is visible on the same page within one scroll.

Same branch as Phase 1: `feat/new-rental-flow/phase-1-discovery`.

**Status (Sep 2026):** Core browse/findability **shipped on staging**. P2 polish items below are deferred or intentionally skipped.

#### Two page modes (one route: `/shop`)

| Mode | When | What the user sees |
|------|------|-------------------|
| **Browse** | Default `/shop` (no category, tag, search, brand, or sale param) | Sticky heading + Rent/Buy toggle, search + sort/filter icons, category chips, occasion tiles, **New In** rail, then **All listings** grid |
| **Filtered** | Any active filter param (from nav, chips, rails, or search) | Same sticky header; active filter chips; result count above grid; sort; grid. Hide curated rails |

No gate screen. Product cards are always reachable without tapping "Show products" first.

#### Layout (browse mode, as shipped)

```
SHOP                          Rent | Buy   ← sticky header
[ Search........................ ] [↕] [⚙]
All · Dresses · Tops · Bags · Shoes · …  ← category chips (horizontal scroll)

Shop by occasion
[ Night Out ] [ Wedding Guest ] [ Brunch ] [ Work ] …

New In                          View all →
[card] [card] [card] [card] →            ← horizontal rail (~8 items)

── All listings (N items for rent) ──
[card] [card] [card] [card] [card]       ← full grid, same page
Pagination
```

- **Most Rented rail on `/shop` was removed** (still on homepage). Sort by popular via toolbar if needed.
- **Rails are shortcuts**, not the only path to inventory. Tapping a card goes to PDP; "View all" applies that rail's filter and switches to filtered mode (scroll to grid).
- **Occasion tiles** apply a tag filter; grid below updates.
- Old text-only shop hero replaced by `ShopBrowseSection` + sticky toolbar.

#### Rent / Buy toggle

- Single page at `/shop`; toggle sets `listingType` in the URL (same params as Phase 1 nav routes).
- Mobile bottom nav **Rent** / **Buy** opens `/shop` with the correct mode pre-selected.
- **Preserve other filters** when switching Rent ↔ Buy (category, size, search, etc.). Do not wipe the query string.
- Reuse active-state logic from `shopNavMatch.ts`.

#### Build list

**P0 — Fix broken findability**

- [x] Category nav links: pass category **IDs** in `ShopDropdown`, `ShopDropdownMobile`, and `ShopCategoryChips`
- [~] Home occasion cards (`categoryData.tsx`) use **tags**, not category IDs *(intentional for occasion tiles)*
- [x] Wire `sort` URL param in `useProductsQuery` → API (`newest`, `popular`, `price_low`, `price_high`)
- [x] Inline search bar on shop (always visible; sets `?search=` on submit)
- [x] Result count above grid ("47 items", "12 items for rent")
- [x] Active filter chips (removable; clearing last chip returns to browse mode). Comma-separated color/size/tags supported.
- [x] Sort in shop toolbar (icon trigger + dropdown; not only inside filter panel)
- [x] Filter active count on shop toolbar (badge on filter icon)

**P1 — Browse structure**

- [x] `ShopRentBuyToggle` — sticky on shop page (title left, toggle right)
- [x] `ShopCategoryChips` — horizontal category filter bar (instant filter, no slide-over)
- [x] `ShopOccasionTiles` — shop by occasion row (reuse tag data from home / `categoryData`)
- [x] Reuse `HomeProductRail` on shop for **New In** (browse mode only, default sort)
- [x] ~~Most Rented rail on shop~~ — **removed**; homepage rail kept
- [x] `ShopBrowseSection` wrapper: browse vs filtered mode switch
- [x] Filtered mode: hide rails; show grid-first with chips + count
- [x] "All listings" / "Results" section heading + count when grid renders
- [x] Stable shop dropdown categories (all categories alphabetical, not 3 random per load)
- [x] Campaign/sale pages: stack category filters without duplicate chips or broken headings

**P2 — Polish**

- [ ] Brand logo / pill strip on shop (browse mode) — **deferred**
- [~] Vault Closet Drops — **gated** via admin Closet Feature toggle + `ShopClosetParamsGuard`; main shop still excludes closet inventory (`ONLY_WITH_CLOSET = false`)
- [ ] SearchModal: optional "View all results on shop" → `/shop?search=…`
- [x] Preserve `listingType`, `closetId`, `onlyWithCloset`, `sort`, `title`, `description`, `sale` in filter merge helpers
- [~] Rent/Resale on `ProductCard` — **deferred**; cards use Rent/Buy price rows with `priceFocus` instead of badge pills
- [ ] Remove dead shop hero files: `src/app/shop/sections/EndlessStyleHero.tsx`, `EndlessStyleHero copy.tsx`

**Out of scope (Phase 1b)**

- Separate `/shop/rent` and `/shop/buy` routes (toggle only)
- Infinite scroll (keep pagination for v1)
- Size-aware pre-filter from profile
- Availability-by-date filter ("Available this weekend")

#### Key files

- `src/app/shop/page.tsx` → `ShopBrowseSection`
- `src/app/shop/sections/NewListingsSection.tsx`
- `src/app/shop/components/ShopRentBuyToggle.tsx`
- `src/app/shop/components/ShopCategoryChips.tsx`
- `src/app/shop/components/ShopOccasionTiles.tsx`
- `src/app/shop/components/ShopBrowseSection.tsx`
- `src/app/shop/components/ShopToolbar.tsx` (search, sort icon, filter icon, chips)
- `src/app/shop/components/ListingFilterPanel.tsx`, `ShopClosetParamsGuard.tsx`
- `src/app/home/sections/HomeProductRail.tsx` (reuse)
- `src/lib/shop/shopBrowse.ts`, `src/lib/shop/listingFilters.ts`, `src/lib/nav/shopCategoryNav.ts`
- `src/lib/queries/product/useProductsQuery.ts`
- `src/common/layer/ShopDropdown.tsx`, `ShopDropdownMobile.tsx`
- `src/common/layer/MobileBottomNav.tsx`, `src/lib/nav/shopNavMatch.ts`
- `src/common/ui/SelectDropdown.tsx`, `ProductCard.tsx`
- Tests: `src/lib/shop/shopBrowse.spec.ts`, `shopCategoryNav.spec.ts`, `closetShopFeature.spec.ts`

#### Acceptance

- [x] User landing on `/shop` sees product cards within one mobile scroll (no extra button)
- [x] User can switch Rent/Buy without losing category or search filters
- [x] Category links from nav return results (ID-based filters)
- [x] Sort changes product order on shop *(confirm `popular` sort deployed on backend in prod)*
- [x] Active filters visible as chips; clearing all returns browse mode with rails
- [x] Filtered deep links (`/shop?tags=Night+Out`, brand, sale) show grid-first, no redundant rails
- [x] Bottom nav Rent/Buy matches shop toggle state

---

## Phase 2: Rental flow UX (frontend + backend)

**Goal:** Lightweight availability check; customer can leave; no cart-as-approval-hub.

**Status (Sep 2026):** **Core phase 2 shipped on staging** (FE + BE). Dispatch-window sub-phases 1–3 complete. Checkout polish, notifications, and PWA landed as adjacent work (see below). One open FE branch (`788ff42`) has lister order-status and mobile auth polish not yet merged.

### Build list

**Frontend**

- [x] Guest contact modal (first name, email, WhatsApp) when not logged in
- [x] Allow date/duration selection before sign-in (calendar preview for guests; live blocked dates still deferred)
- [x] Remove profile + address from availability check (delivery **windows stay** on request so listers can confirm timing)
- [x] New screens:
  - `/shop/availability/checking?requestId=…` — "We're checking with the lister"
  - `/shop/availability/available?requestId=…` — "It's available!" → Complete Rental
- [x] Remove pending/expired approval UI from cart; cart = checkout-ready items only
- [x] Progressive checkout stepper (Address → Delivery → Payment → Confirm)
- [x] Defer delivery address to checkout (post-confirmation)

**Backend**

- [~] `deliveryAddressId` already optional — checkout collects delivery via profile address (not `deliveryAddressId` FK)
- [x] Guest availability endpoint: `POST /api/public/availability-requests`
  - Creates guest user stub OR stores guest contact on request
  - Returns `requestId` + tracking token
- [x] Public status endpoint: `GET /api/public/availability-requests/:id?token=…` (includes `completeRentalUrl` when available)
- [x] Lister magic-link approve/reject (interim before WhatsApp):
  - `GET /api/public/lister-response/:token?action=accept|reject`
- [~] Notification copy: hide "approval" language; use "checking availability" (core emails updated; some API labels remain)

### Key files

**Frontend:** `RentalPeriods.tsx`, `shop/cart/*`, new `shop/availability/*`

**Backend:** `renters.service.ts`, new `public/availability-requests.controller.ts`

### Acceptance

- [x] Guest can check availability with 3 fields, no full account
- [x] After submit, user lands on "checking" screen and can browse away
- [x] When lister accepts, user gets email with link to "available" → checkout
- [x] Cart no longer shows pending timers

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

- [x] On approve: reject if renter's outbound window has already ended (`isWindowExpired`).
- [x] Remove silent window refresh on approve when outbound is stale (`dispatchWindowDataForAvailabilityApproval` only applies while windows are still valid).
- [x] New lister action: **Notify renter item is available** (when approve is blocked).
- [x] Email renter: product name, listing URL, short line to request again with a new delivery time. No checkout magic link on this path.

**Frontend**

- [x] Lister approve UI: if outbound window passed → show **Notify renter**, not **Approve**.

**Acceptance**

- Lister cannot approve a request whose outbound window has ended.
- Renter gets email with listing URL and can submit a fresh availability request.

#### Phase 2 — Checkout auto-refresh & date bundle

**Backend**

- [x] At checkout summary load: if approved outbound window ended, roll outbound to next valid slot (do not mark request EXPIRED).
- [x] Shift `startDate` / `endDate` with fixed `rentalDays`; rebuild return window from new start.
- [x] Recalc `totalPrice` from `dailyPrice × rentalDays`; persist on availability request + cart line before summary returns.

**Frontend**

- [x] Compact banner when dates/windows changed: *"Your delivery time has passed. New earliest slot: 5:00–6:00 PM. Confirm below or pick another."*
- [x] Show updated dates in checkout; optional *"Price unchanged"* when `rentalDays` did not change.
- [x] Renter confirms or changes windows via existing `DispatchWindowsScheduler` (no extra modal).
- [~] If renter changes outbound day on scheduler, re-run date bundle + price recalc (read-only scheduler at checkout today)

**Acceptance**

- Renter who opens checkout after a valid approval is not forced to re-request.
- 1-day rentals: return always moves with outbound; no return-before-wear edge case.
- Order summary reflects shifted dates and correct price.

#### Phase 3 — Approval email times & product copy

**Backend**

- [x] On normal approve (window still valid): add outbound (+ return if rental) formatted times to `rental-response.hbs`. One line each, no extra paragraphs.

**Frontend**

- [x] Product page outbound picker helper (one place only): **"Delivery depends on lister availability."**

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

**Also shipped (dispatch defaults):**

- [x] Default delivery/return dispatch slots are **2 hours** *(FE on staging; BE on `fix/order-confirmation-email-subjects`, not staging yet)*

---

## Adjacent work (post Phase 2, not in original plan)

Shipped on staging unless noted. These improve the rental/resale experience but were not in the original phase breakdown.

### PWA (frontend)

- [x] Web app manifest (`src/app/manifest.ts`)
- [x] Service worker with precache (`src/app/sw.ts`, Serwist)
- [x] Relisted R logo app icons

### In-app notifications (frontend + backend)

- [x] Polled notification inbox for renters, listers, and admins
- [x] Unread count API + nav bell (`NavbarNotificationBell`) on desktop and mobile site nav
- [x] Inbox pages: `/renters/notifications`, `/listers/notifications`, `/admin/[id]/notifications`

### Admin alerts (frontend + backend)

- [x] Email + in-app alert when a new order is placed *(FE on staging; BE on `fix/order-confirmation-email-subjects`, not staging yet)*
- [x] Email + in-app alert for inhouse lister rental/purchase enquiries *(same split)*

### Checkout & cart polish (frontend)

- [x] Lister and item details on checkout steps (`feat/checkout-order-items-display`)
- [x] Delivery review grouped by shipment with item context
- [x] Return review with items on steps 2 and 4 (rental lines only; hidden for purchase-only carts)
- [x] Guest cart auth gate: Cart nav opens login/auth sheet when not signed in (desktop + mobile)
- [x] Logged-in users can follow approval checkout magic links without re-auth loop
- [x] Mobile nav Rent/Buy highlight only on shop browse routes (not PDP/cart)

### Email polish (backend, in flight)

- [~] Order confirmation email subject lines aligned with template copy *(on `fix/order-confirmation-email-subjects`, ahead of staging)*
- [~] Purchase delivery window shown when merged with rental bucket in confirmation email *(same branch)*

### Key files

- FE: `src/app/manifest.ts`, `src/app/sw.ts`, `src/components/notifications/*`, `src/app/shop/cart/checkout/components/*`, `src/common/layer/DesktopNavbar.tsx`, `src/common/layer/MobileBottomNav.tsx`
- BE: `src/module/notifications/*`, `src/module/renters/notify-admins-inhouse-rental-request.util.ts`, `src/utils/dispatch-windows.ts`

---

## Phase 3: WhatsApp integration (frontend + backend)

**Goal:** Listers confirm YES/NO from WhatsApp; renters notified via WhatsApp/email.

**Prerequisite:** Meta WhatsApp Business API credentials (`WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN`, webhook verify token).

**Status (Sep 2026):** **Scaffold only.** `WhatsAppService.sendListerAvailabilityRequest` exists but is not wired into the availability flow; no webhook controller.

### Build list

- [~] `WhatsAppService` — send template/interactive messages *(scaffold in `src/services/whatsapp/whatsapp.service.ts`; falls back to email when env vars missing)*
- [ ] Wire `WhatsAppService` into availability request creation (lister outbound)
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

**Status (Sep 2026):** Not started.

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

**Status (Sep 2026):** Not started.

### Build list

- [ ] Remove `AccountRoleSelector` at signup
- [ ] Default role `RENTER`; upgrade to lister via "List Your Wardrobe" when ready
- [ ] Backend: relax role gates where lister features are additive
- [ ] Onboarding: optional popup instead of forced 6-step intercept

### Deferred rationale

Touches auth, onboarding guards, and role checks across both repos. Safe to ship after phases 1–4.

---

## Phase 6: Lister trust, AR transparency & help (frontend + backend)

**Goal:** Set renter expectations during availability checks (AR), give admins tools to manage slow or problematic listers, and add self-serve help so customers know what happens next without contacting support.

**Status (Sep 2026):** Not started. Builds on Phase 2 AR flow and Phase 3 WhatsApp (when wired). `User.isSuspended` and `PATCH /api/admin/users/:id/suspend` exist today but only block login; they do not hide a lister's shop inventory.

**Problem:** Renters submit an availability request and wait with little context about how long listers typically take. Slow or inactive listers erode trust. Admins can suspend accounts or deactivate individual listings, but there is no account-level "pause this lister's entire wardrobe" action tied to shop visibility.

### Phase 6a — Lister AR response time metric

Track how long each lister takes to respond to availability requests, surface it to renters, and give admins visibility.

**Metric definition**

- **Response time** = `respondedAt - createdAt` for each closed AR where the lister acted (ACCEPTED or REJECTED).
- **Lister metric** = median (p50) response time over the last N completed ARs (default N = 20; minimum 3 responses before showing publicly).
- Persist `respondedAt` on `AvailabilityRequest` when status moves to ACCEPTED or REJECTED (reuse `approvedAt` for accepts; add or backfill for rejects).
- Optional rollup on lister profile: `medianArResponseMinutes`, `arResponseSampleSize`, `arResponseUpdatedAt` (computed by cron or on each lister action).

**Backend**

- [ ] Add `respondedAt` to `AvailabilityRequest` (migration + backfill from `approvedAt` / reject timestamps).
- [ ] Set `respondedAt` in all lister response paths (magic link, dashboard, WhatsApp webhook when Phase 3 ships).
- [ ] Cron or event handler: recompute per-lister median from recent completed ARs.
- [ ] Expose on public lister profile API: `medianArResponseMinutes`, `arResponseLabel` (e.g. "Usually responds within 2 hours"), `hasEnoughArData`.
- [ ] Expose on product/public curator payload when PDP loads lister context.
- [ ] Admin API: lister AR stats (median, p90, expired rate, pending count, last response date).

**Frontend**

- [ ] **PDP:** One line near rental CTA, e.g. *"This lister usually responds within 2 hours"* (hide until minimum sample size).
- [ ] **Lister profile** (`/lister-profile/[id]`): Same stat in profile header alongside rating.
- [ ] **Checking screen** (`/shop/availability/checking`): Soft expectation copy using the metric when available; generic fallback when not (*"We're checking with the lister. You'll get an email when they respond."*).
- [ ] **Admin dashboard:** Sortable column on listers table; filter "slow responders" (e.g. median > 4h); detail panel with AR history sparkline or recent requests.

**Copy rules (renter-facing)**

- Never show internal SLA, cron, or "median" jargon. Use plain language: "Usually responds within X hours" or "Typically responds same day."
- Do not show live pending timers or request IDs on customer screens (unchanged from Phase 2).

**Acceptance**

- After a lister accepts or rejects, response time is recorded and rollup updates within 24h (or immediately on event).
- PDP and lister profile show the stat only when the lister has enough history.
- Admin can see which listers are consistently slow before suspending.

### Phase 6b — Admin lister suspend / deactivate

Let admins pause an entire lister account so **all** their listings disappear from shop, search, and PDP until reactivated. Distinct from per-listing deactivate (already on admin listings) and from login-only `isSuspended`.

**Backend**

- [ ] Extend suspend semantics: when `User.isSuspended` (or new `listerDeactivatedAt` flag if login block should stay separate), exclude that curator's products from public product queries, search, rails, and lister profile inventory.
- [ ] Block new availability requests against suspended listers (clear renter-facing error: *"This lister is temporarily unavailable."*).
- [ ] Honor in-flight accepted ARs and active rentals (do not cancel open orders).
- [ ] Admin endpoints: suspend / unsuspend lister with optional reason + audit log entry.
- [ ] Optional: auto-suggest suspend when median AR response exceeds threshold and expired rate is high (admin confirms).

**Frontend**

- [ ] Admin lister detail: **Suspend lister** / **Reactivate lister** with confirmation modal (shows active listing count).
- [ ] Admin listers table: status badge (Active / Suspended).
- [ ] Suspended lister's public profile: show "Temporarily unavailable" instead of product grid; PDP for direct links returns 404 or unavailable state.

**Acceptance**

- Suspending a lister removes all their listings from `/shop` and search within cache TTL.
- Reactivating restores listings without manual per-product toggles.
- Renters cannot start new ARs against a suspended lister.

### Phase 6c — Help chatbot

Floating help widget so renters and listers can ask questions and get accurate, link-rich answers about Relisted (rental flow, deposits, returns, listing, orders).

**Scope (v1)**

- [ ] Site-wide help button (bottom corner; respects mobile bottom nav safe area).
- [ ] Chat UI: user message in, assistant reply with optional deep links (e.g. "Track your order" → `/renters/orders`, "Check availability" → current PDP rental flow).
- [ ] Knowledge base: curated FAQ + key docs (`CUSTOMER_JOURNEY_ANALYSIS.md` facts, not raw internal roadmap). No hallucinated policy; grounded answers only.
- [ ] Backend: lightweight Q&A endpoint (LLM + retrieved snippets) or rules-based matcher for top 20 intents first, LLM second.
- [ ] Log unanswered questions for admin review; no PII in prompts.
- [ ] Guest-friendly (no login required for general help).

**Out of scope (v1)**

- Human handoff to support inbox
- Order-specific account lookups (user must go to Orders)
- Lister dashboard actions via chat

**Acceptance**

- User can ask "What is the security deposit?" and get a correct answer with link to wallet/FAQ if relevant.
- User can ask "How do I rent this dress?" and get steps pointing to shop/PDP flow.
- Bot refuses gracefully when it does not know; suggests contact or Orders page.

### Key files

**Backend:** `prisma/schema.prisma` (`AvailabilityRequest.respondedAt`, lister rollup fields), `listers.service.ts`, `renters.service.ts`, `admin.service.ts`, public product/search queries (curator filter), new `help-chat` or `support-bot` module

**Frontend:** `src/app/shop/product-details/components/RentalDetailsCard.tsx`, `src/app/lister-profile/components/CuratorProfileCardProps.tsx`, `src/app/shop/availability/checking/page.tsx`, `src/app/admin/[id]/users/*`, `src/app/admin/[id]/listers/*`, new `src/components/help/HelpChatWidget.tsx`

### Build order

**6a (metric + display) → 6b (lister suspend) → 6c (help chatbot)**

6a reduces confusion immediately; 6b gives admins a lever when metrics flag problems; 6c catches remaining questions.

---

## WhatsApp: where it lives

```
Customer checks availability
        ↓
Backend creates AvailabilityRequest (PENDING)
        ↓
┌────────────────────────────────────────────────────────┐
│ Today (staging): email + magic link (+ in-app inbox)   │
│ Phase 3 (next): WhatsApp interactive message + webhook │
│ WhatsAppService scaffold exists; not wired yet         │
└────────────────────────────────────────────────────────┘
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

**Phase 6 (customer-facing + admin):** median lister AR response time (p50, last 20 requests), expired AR rate per lister, AR response sample size. Display on PDP, lister profile, and admin lister dashboard (see Phase 6a).
