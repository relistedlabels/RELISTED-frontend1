# RELISTED: End-to-end customer journey analysis

Step-by-step paths through the product as a new visitor. Each step names the screen, the exact control the user clicks or taps, and what happens next. URL paths are included in backticks where they help locate the screen.

---

## Roles and terms


| Term                     | Meaning                                                                                 |
| ------------------------ | --------------------------------------------------------------------------------------- |
| **Shopper / renter**     | Default customer account. Rents items, or buys resale items. Same account for both.     |
| **Buyer**                | Resale purchase on the same account (`Buy` tab on a listing, not a separate role).      |
| **Lister / curator**     | Person who lists items for rent and/or resale.                                          |
| **Availability request** | Shopper asks if dates/item are available; lister must approve before payment.           |
| **Wallet**               | In-app balance funded via Wema Bank virtual account (bank transfer).                    |
| **Deposit / collateral** | Locked during rental; returns to available wallet balance after lister confirms return. |


---



## Part 1: Shopper journey (rent and buy)



### 1. Landing and reaching listings



#### Step 1.1 — Landing page

`/`

1. User opens the site.
2. **First screen is a full-height hero video**, not a product grid.
3. They see:
  - Headline: **Endless Style**
  - Subtext: **short plans, long compliments**
  - Primary button: **Find Your Next Fit** (links to `/shop`)
  - Secondary button: **List Items** (lister path; sends logged-out users to create account)
4. Top navigation (always visible): **Shop**, **Style Spotlight**, **How it works**, favorites icon, cart icon, **Sign In**, **Sign Up**.

There are no rent/buy product cards in the initial viewport. The user cannot pick an item to rent or buy without scrolling or leaving the hero.

**Friction:** Extra click required before any shoppable inventory. Many users will not discover that **Find Your Next Fit** is the main path to listings.

---



#### Step 1.2 — Paths from landing to shoppable listings

**Path A — Hero CTA (primary intended path)**

1. User clicks **Find Your Next Fit**.
2. Browser goes to **Shop** (`/shop`).
3. Page heading: **Shop amazing** / **Style Brands**.
4. **Available Listings** grid loads (filters + paginated product cards).

**Path B — Top navigation**

1. User clicks **Shop** in the header (opens dropdown on desktop with brand/category links; mobile opens shop menu).
2. User selects a shop link (e.g. browse all collections) or lands on `/shop` with query params for title/description/filters.

**Path C — Scroll the landing page**

1. User scrolls past the hero.
2. They may see **Popular Categories** (e.g. Night Out, Brunch Outfits) → each card links to filtered `/shop?...` URLs.
3. They may see **Vacation Outfits** / **Black Tie Outfits** sections with product tiles (clickable cards; click navigates to product detail).
4. Footer **Browse all** also goes to `/shop`.

**Path D — How it works**

1. User opens **How it works** (`/how-it-works`).
2. CTAs there include **Explore**, **Start Shopping** → `/shop`.

**Friction:** Three different mental models (hero button vs nav **Shop** vs scroll categories). Product cards on the home page below the fold are easy to miss because the hero dominates.

---



#### Step 1.3 — Shop page

`/shop`

1. User sees **Shop amazing** (or filtered title from URL params) and **Style Brands** subtitle.
2. **Filters** button opens filter UI (category, brand, rent vs buy, etc.).
3. Product grid shows cards with image, brand, name, size, **Rent from ₦…** and/or **Buy ₦…**, RRP.
4. Cards may show **RENTED** or **Sold** badges; those items are dimmed.
5. User **clicks a product card** (whole card is clickable; there is no separate “view product” link).
6. Browser goes to **Product detail** (`/shop/product-details/[id]`).

**Pagination:** Numbered pages at bottom (1, 2, 3…).

---



### 2. Product detail (before account)



#### Step 2.1 — Product detail page

`/shop/product-details/[id]`

1. User sees breadcrumbs: **Home → Shop → Product detail**.
2. Left: image gallery. Right: title, rating, colour, size, condition, **Size Guide**.
3. **Rent / Buy** toggle:
  - **Rent** — daily rental price, security deposit (refundable), **Rental Duration** section.
  - **Buy** — resale price; **Add to Cart** for purchase request path.
4. Copy explains deposit is held as **Locked Balance** until return is approved.
5. Tabs/sections: **Product details**, **Reviews**, **Delivery & return**.
6. Lister block: name, rating, **View profile**.

**Rent path (logged out):**

1. Under **Rental Duration**, user sees black button **Rent now**.
2. User clicks **Rent now**.
3. **No rental calendar opens.** User is sent to **Sign in** (`/auth/sign-in?redirect=…`) with return URL back to this product.

**Buy path (logged out):**

1. User switches to **Buy** tab.
2. User clicks **Add to Cart** → auth required before request is sent.

**Friction:** Guest cannot explore dates or availability without signing in first. **Rent now** looks like the next step but is an auth wall.

**If item is RENTED or sold out on rent:** User sees **Currently out on rental** and **Notify Me When Available** instead of **Rent now**.

---



### 3. Sign-in and first session



#### Step 3.1 — Sign in

`/auth/sign-in`

1. User sees **Welcome Back** and fields **Email Address**, **Password**.
2. User clicks **Sign in**.
3. Header switches from **Sign In / Sign Up** to account menu and cart count.

After sign-in, the app may send the user to onboarding, a saved redirect, home, or the product they came from.

---



#### Step 3.2 — Onboarding intercept

`/onboarding/renter`

1. After first login, user is often sent here before anything else.
2. Screen: **Skip tour**, **STEP 1 OF 6**, **Welcome to RELISTED**, **Continue**.
3. User clicks **Skip tour** or walks six steps (verifications, wallet, etc.).

**Friction:** Login rarely returns straight to the product; onboarding runs first unless skipped.

---



#### Step 3.3 — Create account (new users)

`/auth/create-account`

1. **Who are you joining as?**
2. **Continue as a Renter or Buyer** or **Continue as a Lister** → sign-up → email verification → sign in again.

**Friction:** Email verification and a second sign-in break momentum before the user returns to the product.

---



### 4. Rental request (logged in)



#### Step 4.1 — Product detail (authenticated)

1. Same layout as guest; header shows account menu and cart count.
2. User clicks **Rent now**.
3. Side panel opens: **CHOOSE RENTAL PERIOD**.

---



#### Step 4.2 — Choose rental period panel

1. **RENTAL DURATION** chips: **1 Day**, **2 Days**, **3 Days**, **Custom** (prices on each).
2. Calendar month grid with **Selected range** / **Unavailable**.
3. **Book drop-off & pickup:**
  - **DELIVERY TO YOU** — date + WAT window (**Earliest delivery**)
  - **PICKUP FROM YOU** — return window
  - **CHANGE THEM ANYTIME BEFORE CHECKOUT**
4. **Check Availability** (body) and footer **Shop More** | **Send request**.

**Friction:** Duration, calendar, and both dispatch windows are required before the lister sees the request.

---



#### Step 4.3 — After Check Availability

1. User clicks **Check Availability** or **Send request**.
2. Cart count increases; request is **pending** until lister approves (about 15 minutes).
3. Toast confirms the request was sent.

---



#### Step 4.4 — Lister approval (parallel)

`/listers/orders`

1. Lister gets email and in-app notification.
2. **15 minutes** to **Approve** or **Reject**.
3. If approved → shopper can checkout. If expired → shopper must re-request from cart.

---



#### Step 4.5 — Your cart

`/shop/cart`

**Left — YOUR CART:** rows with status **Approved** or **Approval expired** + **Request approval again**.

**Right — CHECKOUT SUMMARY:** approved lines only, **Proceed to Checkout**.

**Guest empty state:** **No approved items yet** on the right; pending rows on the left.

**Friction:** Expired lines stay beside approved ones; the split between table and summary is confusing.

---



### 5. Wallet and identity (before payment)



#### Step 5.1 — Verifications

`/renters/account` → Verifications tab

1. ID upload and number.
2. BVN (required today for wallet funding; planned removal for renters).



#### Step 5.2 — Fund wallet

`/renters/wallet`

1. **Fund wallet** → Wema **virtual account** details.
2. User transfers from bank app; balance updates when credited.
3. **Available balance** vs **Locked balance** (deposit during active rentals).

Checkout requires sufficient **available** balance for the full total including deposit.

---



### 6. Checkout and payment



#### Step 6.1 — Checkout

`/shop/cart/checkout`

1. **These items are reserved for ~15:00** countdown banner.
2. **CONTACT**, **DELIVERY ADDRESS** (**Update**), **DELIVERY SHIPPING** (multiple carriers with **Shipping ₦…**).
3. **RETURN PICKUP** — **Use delivery address** / **Custom pickup spot**.
4. **RETURN SHIPPING** — second carrier pick list.
5. **DISPATCH WINDOWS** — **RENTAL DELIVERY** and **RETURN PICKUP** per lister.
6. **PAYMENT** — **Available Balance**, **Fund Wallet**.
7. **ORDER SUMMARY** — rental, **Security Deposit**, **Cleaning Fees**, fees, VAT, **Grand Total**.
8. User accepts **Terms of Service Agreement**.
9. User clicks **Complete Order** → **Processing…** → wallet debit.

**Friction:** Long single page with many sections. **Complete Order** stays disabled until terms are accepted.

---



#### Step 6.2 — Order confirmed

`/shop/cart/checkout/success`

1. **Order confirmed**; shipments scheduled; deposit locked for rentals.

---



### 7. Orders and delivery



#### Step 7.1 — My orders

`/renters/orders`

Tabs **Ongoing | Completed**. Rows: order id, status, **View details**. Sidebar: **Wallet**, **My Account**, etc.

---



#### Step 7.2 — Order detail panel

`/renters/orders?orderId=ORD-…`

**View details** opens **ORDER DETAILS** panel on the orders page (not a separate route).

Progress for rentals: **Delivery booked** → **On the way to you** → **With you** → **Return** → **Returned**.

Panel also shows **Track shipment**, **Return window**, **Total paid**, **Contact support**.

**After outbound delivery:** **Confirm delivery** (rent) starts the rental period; rental fee goes to lister; deposit stays locked.

**Buy orders:** **Confirm receipt** after delivery completes the order and pays the lister.

---



### 8. Return flow (rent only)



#### Step 8.1 — Ready to return

`/renters/orders?orderId=ORD-…`

1. After outbound delivery, **Ready to return?** appears on the order detail panel.
2. User clicks **Ready to return** → modal: confirm → **photos** → **Good/Fair/Poor** → **pickup window** → submit.
3. Return pickup is booked; lister is notified.



#### Step 8.2 — Return in progress

Order detail shows **Return submitted** and **Return pending pickup**. Tracking updates; email and in-app notifications follow.

#### Step 8.3 — Lister confirms return

`/listers/orders/[orderId]` → **Inspect returned item** → **Confirm return receipt**

1. **Good/Fair** → deposit to shopper **Available Balance**; lister paid; item relisted.
2. **Poor** → dispute opened; deposit held.



#### Step 8.4 — After return

Shopper sees deposit released in **Wallet**; optional review; optional withdraw to bank.

#### Step 8.5 — Disputes (exception)

`/renters/dispute`, `/listers/dispute`

Messaging with admin if condition is disputed.

---



### 9. Shopper journey summary

```
Landing → Find Your Next Fit → Shop → click product card
  → Product detail → Rent now
  → [Guest: Sign in] → [Onboarding: Skip tour]
  → Choose rental period → Check Availability
  → [Lister approve]
  → Your cart → Proceed to Checkout
  → Fund wallet (if needed) → Complete Order
  → My Orders → View details → Confirm delivery
  → Ready to return → photos → pickup → lister confirm → deposit released
```

**Buy path (shorter):** Product detail → **Buy** tab → **Add to Cart** → same approval → checkout → **Confirm receipt**.

---



## Part 2: Lister journey (summary)


| Step       | Screen         | Action                                      |
| ---------- | -------------- | ------------------------------------------- |
| Sign up    | Create account | **Continue as a Lister**                    |
| Onboarding | Lister tour    | Profile, BVN/ID, first listing, payout bank |
| List item  | Product upload | Submit → admin approval → live on shop      |
| Requests   | Lister orders  | Approve / reject within 15 min              |
| Fulfill    | Order detail   | Dispatch per windows                        |
| Return     | Order detail   | **Confirm return receipt**                  |
| Payout     | Lister wallet  | Withdraw                                    |


---



## Part 3: Friction register


| Stage                 | Severity     | Issue                                                                    |
| --------------------- | ------------ | ------------------------------------------------------------------------ |
| Landing hero          | **Critical** | No listings on first screen; must click **Find Your Next Fit** or scroll |
| Path to shop          | High         | Hero vs nav **Shop** vs category scroll                                  |
| **Rent now** (guest)  | **Critical** | Redirects to sign-in; no preview of dates or price steps                 |
| Email verify          | High         | Breaks momentum after sign-up                                            |
| Onboarding intercept  | **Critical** | Forced tour right after sign-in                                          |
| Rental panel          | High         | Duration, calendar, and two windows before request                       |
| Cart clutter          | High         | Expired and approved lines shown together                                |
| Checkout              | **Critical** | Six or more sections; terms required before **Complete Order**           |
| 15 min lister SLA     | Critical     | Expired requests; **Request approval again**                             |
| BVN / wallet          | Critical     | Required before fund wallet today                                        |
| Lister return confirm | Critical     | Deposit held until lister confirms                                       |


---



## Part 4: Metrics

**Available today:** availability request counts; orders, revenue, delivery time.

**To build:** request → accepted → paid → delivery confirmed → return complete → deposit released; median lister response time; expired rate; repeat order rate.

---



## Part 5: Optimization roadmap

**Phase A — Discovery and first intent**

1. Show shoppable preview on landing (or pair **Find Your Next Fit** with sample listings).
2. Align nav **Shop** and hero CTA messaging.
3. Guest: show rental calendar preview before sign-in, or sign-in modal instead of hard redirect from **Rent now**.
4. Remove BVN for renter wallet; remove auto-pay UI; optional onboarding popup.

**Phase B — Lister reliability**

1. Response-time on product/profile; WhatsApp for requests and returns; admin suspend.

**Phase C — Checkout and measurement**

1. Progressive checkout; funnel dashboard; revisit 15-minute window with data.

---



## Part 6: Payment model

Wema virtual accounts → wallet → checkout debit → escrow → deposit locked → internal release on return confirm (not card refund).