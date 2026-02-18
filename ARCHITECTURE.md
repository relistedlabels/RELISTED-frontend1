## 🎬 Shopping Cart Modal Login - Architecture Diagram

### Complete User Flow

```
START: User on Product Details Page
│
├─────────────────────────────────────┐
│  User clicks "Check Availability"   │
└─────────────────────┬───────────────┘
                      │
                      ▼
        ┌─────────────────────────────┐
        │ RentalDurationSelector      │
        │ .handleCheckAvailability()  │
        └──────────┬──────────────────┘
                   │
                   ▼
        ┌─────────────────────────┐
        │ Clear previous errors    │
        │ clearError()            │
        └──────────┬──────────────┘
                   │
                   ▼
        ┌──────────────────────────────┐
        │ Check authentication status   │
        │ user.token exists?            │
        └──────────┬────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
    ┌─────────────┐   ┌──────────────────┐
    │ NOT AUTH    │   │ AUTHENTICATED    │
    │ user.token  │   │ user.token       │
    │ is null     │   │ exists           │
    └──────┬──────┘   └────────┬─────────┘
           │                   │
           ▼                   ▼
    ┌──────────────────┐   ┌──────────────────────┐
    │ Show LoginModal   │   │ submitAvailability   │
    │ setLoginModalOpen │   │ Request              │
    │ (true)           │   │ setPendingAction(T)  │
    └────────┬─────────┘   └────────┬─────────────┘
             │                       │
             ▼                       ▼
    ┌──────────────────────┐    ┌────────────────┐
    │ User sees modal form │    │ Show spinner   │
    │ - Email input        │    │ "Checking..."  │
    │ - Password input     │    │                │
    │ - Login button       │    │ API call:      │
    │ - Error alert space  │    │ POST /api/     │
    └────────┬─────────────┘    │ renters/       │
             │                  │ rental-        │
             │                  │ requests       │
             ▼                  └────────┬───────┘
    ┌──────────────────────┐            │
    │ User submits form    │            ▼
    │ email + password     │    ┌──────────────────┐
    └────────┬─────────────┘    │ Response?        │
             │                  └─────┬────────┬──┘
             │                        │        │
             ▼                        ▼        ▼
    ┌──────────────────────┐    ┌─────────┐ ┌────────┐
    │ API call:            │    │ Success │ │ Error  │
    │ POST /api/auth/      │    └────┬────┘ └───┬────┘
    │ sign-in              │         │           │
    │ - email              │         ▼           ▼
    │ - password           │   ┌──────────┐ ┌──────────────┐
    └────────┬─────────────┘   │ (Success │ │ Show error   │
             │                 │ flows    │ │ in modal     │
             ▼                 │ below)   │ │ triggerError │
    ┌──────────────────────┐   └──────────┘ └──────┬───────┘
    │ Response?            │                       │
    └─────┬────────────────┘                       ▼
          │                              ┌────────────────┐
          ▼                              │ User can retry │
    ┌──────────────────────┐            │ Modify inputs  │
    │ Success: Token       │            │ Submit again   │
    │ received             │            └────────────────┘
    └────────┬─────────────┘
             │
             ▼
    ┌──────────────────────┐
    │ useUserStore.setAuth │
    │ - token              │
    │ - userId             │
    │ - email              │
    │ - role               │
    │ - name               │
    └────────┬─────────────┘
             │
             ▼
    ┌──────────────────────┐
    │ onLoginSuccess()     │
    │ callback fires       │
    └────────┬─────────────┘
             │
             ▼
    ┌──────────────────────┐
    │ Modal closes         │
    │ setLoginModalOpen    │
    │ (false)              │
    └────────┬─────────────┘
             │
             ▼
    ┌──────────────────────┐
    │ Auto-trigger:        │
    │ handleCheckAvail.()  │
    │ (setTimeout 500ms)   │
    └────────┬─────────────┘
             │
             ▼
    ┌──────────────────────┐
    │ Now WITH valid token │
    │ Call:                │
    │ submitAvailability() │
    └────────┬─────────────┘
             │
             ▼
    ┌──────────────────────┐
    │ Show spinner         │
    │ "Checking Avail..."  │
    └────────┬─────────────┘
             │
             ▼
    ┌──────────────────────┐
    │ POST /api/renters/   │
    │ rental-requests:     │
    │ - productId          │
    │ - listerId           │
    │ - startDate          │
    │ - endDate            │
    │ - rentalDays         │
    │ - price              │
    │ - autoPay            │
    └────────┬─────────────┘
             │
             ▼
    ┌──────────────────────┐
    │ Response received    │
    └────────┬─────────────┘
             │
        ┌────┴────┐
        │          │
        ▼          ▼
    ┌──────┐  ┌─────────┐
    │ ✅   │  │ ❌      │
    │SUCCESS│  │ ERROR   │
    └───┬──┘  └────┬────┘
        │          │
        ▼          ▼
    ┌──────────┐ ┌──────────────┐
    │ Add to   │ │ Show error   │
    │ cart     │ │ alert (red)  │
    │ Show     │ │ triggerError │
    │ timers   │ │ User can:    │
    │ 15 mins  │ │ - Retry      │
    │          │ │ - Close      │
    └──────────┘ │ - Back to    │
                 │   product    │
                 └──────────────┘

                 ▼
              SUCCESS!
```

---

## 🗂️ Component Hierarchy

```
App
└── RentalPeriods (src/app/shop/product-details/components/RentalPeriods.tsx)
    │
    ├── Button: "Rent Now"
    │   └── Opens panel on click
    │
    └── RentalPeriodsPanel (Slide-in modal)
        │
        ├── Header
        │   ├── Back button (mobile)
        │   ├── Title: "CHOOSE RENTAL PERIOD"
        │   └── Close button (desktop)
        │
        ├── Content
        │   └── RentalDurationSelector ✨ 👈 [UPDATED]
        │       │
        │       ├── Title: "RENTAL DURATION"
        │       ├── Error Alerts (if any)
        │       │   ├── Auth error (yellow)
        │       │   └── Request error (red)
        │       │
        │       ├── Duration Buttons
        │       │   ├── 3 Days
        │       │   ├── 6 Days
        │       │   ├── 9 Days
        │       │   └── Custom
        │       │
        │       ├── Calendar
        │       │   ├── Month navigation
        │       │   └── Date grid
        │       │
        │       ├── Legend
        │       │   ├── Selected range
        │       │   └── Unavailable
        │       │
        │       └── Check Availability Button
        │           └── Shows spinner while loading
        │
        ├── Footer
        │   ├── "Cancel" button
        │   └── RentalCartView (Proceed button)
        │
        └── LoginModal ✨ [NEW - Overlays entire panel]
            │
            ├── Header
            │   ├── Title
            │   └── Close button
            │
            ├── Content
            │   │
            │   ├── IF Auth form:
            │   │   ├── Email input
            │   │   ├── Password input
            │   │   ├── "Forgot password?" link
            │   │   ├── "Sign In" button
            │   │   └── "Sign up" toggle
            │   │
            │   └── IF Error:
            │       └── Red alert with message
            │
            └── Background overlay (click closes)
```

---

## 📊 State Management

### RentalDurationSelector State

```tsx
{
  selectedDuration: 3 | 6 | 9 | "custom",     // Which duration selected
  isLoginModalOpen: boolean,                  // Show/hide LoginModal
  pendingAction: boolean,                     // API call in progress
  error: Error | null,                        // Error from useRentalError()
  user: { token, userId },                    // From useUserStore()
  isCheckingAuth: boolean,                    // From useMe() query
  authError: boolean                          // From useMe() query
}
```

### LoginModal State

```tsx
{
  showPassword: boolean,                      // Show/hide password
  showSignUp: boolean,                        // Toggle login/signup form
  isSubmitting: boolean,                      // Form submission
  loginMutation: {                           // From useLogin()
    isPending: boolean,
    isError: boolean,
    error: Error | null
  }
}
```

### useRentalError() Hook State

```tsx
{
  error: Error | null,                        // Current error
  triggerError(msg): void,                   // Set error + log
  clearError(): void                          // Clear error
}
```

---

## 🔄 Data Flow (Redux-like)

1. **User clicks button**
   - Component state updates: `isLoginModalOpen = true` OR `pendingAction = true`

2. **Auth check runs** (useMe query)
   - Query state updates: `isCheckingAuth`, `isError`, `data`

3. **User authenticates** (useLogin mutation)
   - Mutation state updates: `isPending`, `isError`, `error`
   - On success: useUserStore updates with token

4. **Availability check runs** (useSubmitAvailabilityCheck mutation)
   - Mutation state updates: `isPending`, `isError`
   - On success: Item added to cart

5. **Error at any step**
   - Component error state updates via useRentalError()
   - Red alert displays to user
   - Options: dismiss, retry, go back

---

## 🚦 State Transitions

```
Initial:
  selectedDuration: 3
  isLoginModalOpen: false
  pendingAction: false
  error: null

User clicks "Check Availability":
  error: null (cleared)
  isCheckingAuth: true (spinner shows)

Auth check completes:
  isCheckingAuth: false

Auth result:
  NOT AUTH → isLoginModalOpen: true (modal shows)
  AUTH → pendingAction: true (spinner shows, API call)

User logs in (modal):
  isPending: true (login spinner in modal)

Login success:
  user.token: "jwt_token"
  isLoginModalOpen: false (modal closes)
  handleCheckAvailability() called again

Availability check:
  pendingAction: true (spinner shows)

Success:
  pendingAction: false
  Item added to cart ✅

Error:
  error: Error("message")
  pendingAction: false
  Red alert shows
  User can dismiss and retry
```

---

## 🎨 Visual States

### Button States

```
DEFAULT (can click):
  bg-black text-white hover:bg-gray-900 active:scale-95

LOADING (cannot click):
  bg-gray-400 text-white opacity-70 cursor-not-allowed
  + Spinner icon

ERROR (cannot click):
  bg-gray-400 text-white opacity-70 cursor-not-allowed
  + Alert shown above
```

### Modal States

```
HIDDEN:
  opacity: 0
  translate: scale(0.95)
  pointerEvents: none

VISIBLE:
  opacity: 1
  translate: scale(1)
  pointerEvents: auto

CLOSING:
  Reverse of VISIBLE
  Exit animation
```

### Alert States

```
NONE:
  display: none

AUTH ERROR (Yellow):
  bg-yellow-50 border-yellow-200
  Icon: ⚠ yellow
  Message: "trouble verifying session"

REQUEST ERROR (Red):
  bg-red-50 border-red-200
  Icon: ⚠ red
  Message: [specific error]
  Dismiss: ✕ button
```

---

## ♻️ Lifecycle

```
Component Mount:
  ├─ useMe() query starts → check auth
  └─ useRentalError() hook initialized

User Interaction (click button):
  ├─ handleCheckAvailability() called
  ├─ clearError() → reset error state
  ├─ Check user.token
  ├─ Show modal OR proceed with API
  └─ Show spinner

User Submits Login:
  ├─ Formik validation
  ├─ useLogin mutation fires
  ├─ API request sent
  ├─ On success:
  │  ├─ useUserStore updates
  │  ├─ onLoginSuccess callback
  │  ├─ Modal closes
  │  └─ Auto-retry availability check
  └─ On error:
     ├─ Error state updates
     └─ Red alert shows in modal

API Response (Availability):
  ├─ setPendingAction(false) → remove spinner
  ├─ On success:
  │  ├─ Add to cart
  │  ├─ Show timers
  │  └─ Success state
  └─ On error:
     ├─ triggerError() → show red alert
     └─ User can retry or go back

Component Uses:
  └─ useRentalError() effects cleanup on unmount
```

---

## 🧪 Testing Points

### Auth Flow:

- [ ] useMe() returns null → modal shows
- [ ] useMe() returns user → no modal
- [ ] useMe() has error → yellow alert
- [ ] Login succeeds → modal closes
- [ ] Login fails → error in modal
- [ ] After login, check proceeds automatically

### UI States:

- [ ] Skeleton shows while checking auth
- [ ] Spinner shows while checking availability
- [ ] Button disabled while loading
- [ ] Error alert shows/hides correctly
- [ ] Modal can be closed with X button

### Console:

- [ ] No JavaScript errors
- [ ] Proper log messages appear
- [ ] Error details logged on failure
