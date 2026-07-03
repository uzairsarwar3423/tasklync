# Tasklync — Day 3 Implementation Plan
## Auth Flow: 5 Screens + Zustand Auth Store + API Service Layer
### Senior React Native Expo | 25 Years | Pure Implementation Plan — Zero Code

> **This document is a thinking tool, not a typing tool.**
> Every decision is reasoned. Every micro-interaction is justified.
> Every UX law maps to a specific, named element on a specific screen.

---

## Day 3 Philosophy

```
"Screens are not where features live.
 Screens are where journeys begin and end."

Day 1: Built the foundation (tokens, architecture)
Day 2: Built the vocabulary (primitive components)
Day 3: Writes the first sentences (screens, flows, state)

The auth flow is the FIRST user journey.
Every first impression of Tasklync happens here.
The entire emotional contract between user and product
is set in these 5 screens.

If auth feels broken → user doesn't trust Tasklync with their home.
If auth feels polished → user thinks "this company is competent."
If auth feels delightful → user tells someone about the app.

Day 3 goal: delightful.
```

---

## What Day 2 Gave Us (Non-Negotiable Prerequisites)

```
Before opening any file today, verify:

COMPONENTS FROM DAY 2:
  ✅ Text         — all 17 variants, 3 font families
  ✅ Button       — 5 variants, 3 sizes, press animation, haptics
  ✅ IconButton   — Fitts' Law compliant, 44×44 min touch
  ✅ TextInput    — floating label, error shake, focus animation
  ✅ OTPInput     — 6-box, auto-advance, paste, error/success cascade
  ✅ Screen       — SafeAreaView, statusBarStyle, bg prop
  ✅ StickyFooter — bottom CTA, home indicator aware

INFRASTRUCTURE FROM DAY 1-2:
  ✅ @design/* alias → colors, typography, spacing, shadows, radius, animations
  ✅ @components/* alias → all components importable cleanly
  ✅ @store/* alias → Zustand stores
  ✅ @services/* alias → API services
  ✅ @hooks/* alias → custom hooks
  ✅ app/_layout.tsx → fonts loaded, providers mounted, routes configured

IF ANYTHING ABOVE IS MISSING: Fix it first.
Day 3 screens are only as good as Day 2 components.
A broken Button in auth = users never reach the app.
```

---

## UX Laws Master Reference for Day 3

```
Today's UX laws are applied AT THE SCREEN LEVEL.
Day 1: laws at architecture level.
Day 2: laws at component level.
Day 3: laws at user journey level.

The stakes are highest here — user is judging whether to continue.

┌──────────────────────────────────────────────────────────────────────┐
│  UX LAW              HOW IT SHAPES THE AUTH FLOW                     │
├──────────────────────────────────────────────────────────────────────┤
│  RECOGNITION         Welcome: Show app features visually (images/    │
│  OVER RECALL         lottie) — don't ask users to imagine.           │
│                      OTP: Show masked phone number — user recognizes  │
│                      "that's my number" without recalling it.        │
│                      Name: Auto-focus so user sees cursor = knows     │
│                      what to do without reading instructions.        │
│                      Location: Show a map animation — user           │
│                      SEES how location helps, doesn't read an        │
│                      explanation and have to imagine it.             │
├──────────────────────────────────────────────────────────────────────┤
│  FITTS' LAW          Welcome: "Get Started" = full-width 52px,       │
│                      bottom of screen, widest possible target.       │
│                      Phone: "Continue" disabled until valid number.  │
│                      When valid → becomes 52px green full-width.     │
│                      OTP: No explicit submit button. Auto-verify     │
│                      on 6th digit. Zero tap needed = zero miss.      │
│                      Name: Single large input, auto-focused,         │
│                      "Let's go" button below — direct path.         │
│                      Location: "Allow Location" 52px full-width.    │
│                      "Not now" text link (small = less tempting).    │
├──────────────────────────────────────────────────────────────────────┤
│  HICK'S LAW          Welcome: One decision per slide. Slide 1-2:    │
│                      zero decision (just watch/swipe).               │
│                      Slide 3: one decision — Get Started vs Log In.  │
│                      Phone: One field. One button.                   │
│                      OTP: Zero decisions — auto-advance is automatic │
│                      Name: One field. One button.                    │
│                      Location: Two choices max: Allow vs Not Now.    │
│                                                                      │
│                      RULE: Every auth screen has ≤ 2 decision points │
│                      Most have 1. OTP has 0 (it's automatic).       │
├──────────────────────────────────────────────────────────────────────┤
│  JAKOB'S LAW         Phone screen: flag + dial code + number =       │
│                      every messaging app, bank app, taxi app.        │
│                      Users have done this 100 times.                 │
│                      OTP screen: 6 boxes, countdown, resend =        │
│                      universal. Users complete it on autopilot.      │
│                      Welcome carousel: swipe between slides =        │
│                      Instagram stories, App Store previews, Uber.   │
│                      Location permission: full-page explain before   │
│                      system prompt = Airbnb, every top app does this │
├──────────────────────────────────────────────────────────────────────┤
│  PEAK-END RULE       PEAK of auth flow: OTP success cascade          │
│                      6 boxes turn green sequentially (40ms stagger)  │
│                      Confetti-adjacent animation + success haptic    │
│                      Users will remember: "the boxes turned green"   │
│                                                                      │
│                      END of auth flow: Name screen → app opens       │
│                      The transition INTO the main tabs must be       │
│                      satisfying. Fade transition + welcome toast.    │
│                      "Welcome, [Name]! 👋" toast = perfect end.      │
│                                                                      │
│                      SECONDARY PEAKS:                                │
│                      Welcome slide 3: CTA reveals with spring bounce │
│                      Phone: button springs green on valid number     │
│                      These micro-peaks keep engagement alive         │
│                      during the functional parts of auth.            │
├──────────────────────────────────────────────────────────────────────┤
│  GOAL GRADIENT       Welcome dots: 3 dots show "I'm 1/3 done"       │
│  EFFECT              Active dot expands: visual proximity to goal    │
│                      Motivates swiping to slide 3 to complete.      │
│                                                                      │
│                      OTP countdown: "0:47 left to enter code"       │
│                      Time pressure = urgency = faster completion     │
│                      (Urgency drives goal-directed behavior)         │
│                                                                      │
│                      OTP boxes: each digit filled = 1 step closer   │
│                      The partially filled boxes PULL the user forward│
│                      "I've done 4 of 6, might as well finish"        │
│                                                                      │
│                      Name: "Let's go →" appears ONLY after 2 chars  │
│                      Threshold creates micro-goal → user types more │
├──────────────────────────────────────────────────────────────────────┤
│  SERIAL POSITION     Welcome: FIRST slide = most remembered content  │
│  EFFECT              Show the MOST IMPORTANT benefit first:          │
│                      "Verified Workers You Can Trust" (SAFETY)       │
│                      Safety is #1 concern for home service.          │
│                      Users remember the first thing they saw.        │
│                                                                      │
│                      LAST slide = most remembered decision point     │
│                      CTA on slide 3 = most likely to be acted on    │
│                                                                      │
│                      Phone screen: Country code FIRST (left side)   │
│                      then number field. Eye reads left to right.     │
│                      Code visible first = context before input.      │
│                                                                      │
│                      OTP screen: Masked number shown prominently     │
│                      BEFORE boxes. "This is what I verified" = first │
│                      then "here's where I type" = second.           │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Typography in Auth Flow — Day 3 Specifics

```
WELCOME SCREEN:
  Slide headline:     Poppins Bold, h1 (28px)
                      "Verified Workers You Can Trust"
  Slide subtitle:     Plus Jakarta Sans Regular, body1 (16px)
  Page dot active:    —  (shape, not text)
  "Skip":             Plus Jakarta Sans Medium, label (14px), muted
  "Get Started":      Poppins SemiBold inside Button (enforced by Button)
  "Log In":           Plus Jakarta Sans Medium, 14px, green

PHONE SCREEN:
  Screen title:       Poppins Bold, h1 (28px)
                      "Enter your phone number"
  Subtitle:           Plus Jakarta Sans Regular, body1 (16px), muted
  Country code:       Inter SemiBold, 16px (it's a NUMBER — Inter rule)
  "Continue":         Poppins SemiBold inside Button
  Legal text:         Plus Jakarta Sans Regular, caption (12px), muted

OTP SCREEN:
  Screen title:       Poppins Bold, h1 (28px)
  Masked phone:       Inter Medium, 15px (it's a data string)
                      "+92 3XX XXX**56" — Inter for number-like strings
  Countdown:          Inter Bold, dataMD (16px), primary green
                      "0:47" — countdown is data = Inter
  "Resend code":      Plus Jakarta Sans SemiBold, 14px, green
  "Wrong number?":    Plus Jakarta Sans Regular, 13px, muted

NAME SCREEN:
  "What's your name?": Poppins Bold, h1 (28px)
  Subtitle:           Plus Jakarta Sans Regular, body1 (16px), muted
  Input field value:  Plus Jakarta Sans Regular (user's own text = neutral)
  Char count:         Inter Regular, dataXS (11px), muted
  "Let's go →":       Poppins SemiBold inside Button

LOCATION PERMISSION SCREEN:
  Title:              Poppins Bold, h1 (28px)
  Subtitle:           Plus Jakarta Sans Regular, body1 (16px), muted
  Feature list items: Plus Jakarta Sans Regular, body2 (14px)
  "Allow Location":   Poppins SemiBold inside Button
  "Not now":          Plus Jakarta Sans Medium, label (14px), muted

FONT DISCIPLINE CHECK:
  ✅ All CTAs use Poppins (brand confidence in every action)
  ✅ All data (phone, timer, char count) use Inter
  ✅ All body/descriptions use Plus Jakarta Sans
  ✅ No mixing within the same element
```

---

## Day 3 — Time Breakdown

```
TOTAL: 8 hours

Morning Session (4h):
  Task 3.1  — Auth Zustand store                     30 min
  Task 3.2  — Auth API service + Zod validation      45 min
  Task 3.3  — Additional input (PhoneInput)           30 min
  Task 3.4  — Welcome / Onboarding screen            75 min

Afternoon Session (4h):
  Task 3.5  — Phone entry screen                     45 min
  Task 3.6  — OTP verification screen                60 min
  Task 3.7  — Name entry screen                      30 min
  Task 3.8  — Location permission screen             30 min
  Task 3.9  — Auth flow wire-up + routing logic      25 min
  Task 3.10 — Auth navigation guard + integration    30 min
```

---

## Morning Session (4 Hours)

---

## Task 3.1 — Auth Zustand Store
### Duration: 30 minutes
### File: `src/store/auth.store.ts`

---

### Why Store Comes Before Screens

```
SERIAL POSITION EFFECT — applied to task ordering:
  State management built FIRST = screens built on solid ground.
  State built AFTER screens = retrofitting = messy = Tech debt.
  The store is the nervous system. Build it before the body.

RECOGNITION OVER RECALL — applied to state design:
  State variable names describe WHAT they are, not implementation:
  isAuthenticated not tokenExists
  user not userData
  authState not flag
  When a screen imports the store, the intent is immediately clear.
```

---

### Store Design Specification

```
FILE: src/store/auth.store.ts

STATE SHAPE:

  user: User | null
    → Full user object after authentication
    → null = not logged in or not yet loaded

  accessToken: string | null
    → JWT access token (15 min expiry)
    → Used by Axios interceptor on every API call
    → null = not authenticated

  refreshToken: string | null
    → JWT refresh token (30 days)
    → Used to get new access token when expired
    → Stored in MMKV (survives app kill)

  authState: 'idle' | 'loading' | 'authenticated' | 'unauthenticated'
    → 'idle': app just launched, checking stored tokens
    → 'loading': token validation in progress
    → 'authenticated': user is logged in, has valid tokens
    → 'unauthenticated': no valid tokens, go to auth screens

  isNewUser: boolean
    → true = just registered, skip to name screen
    → false = returning user, go directly to main tabs

COMPUTED PROPERTIES (getters):
  isAuthenticated: authState === 'authenticated'
  isLoading: authState === 'loading' || authState === 'idle'

ACTIONS:

  setTokens(accessToken, refreshToken):
    → Called after successful OTP verify
    → Sets both tokens
    → Sets authState: 'authenticated'
    → Persists refreshToken to MMKV immediately
    → Persists accessToken to MMKV (for startup hydration)

  setUser(user):
    → Called after setTokens, with user object from API response
    → Merges user data into state
    → Persists user to MMKV

  setIsNewUser(isNewUser):
    → Called with API response isNewUser flag
    → Determines routing after OTP success

  hydrate():
    → Called on app startup (in AuthProvider)
    → Reads tokens from MMKV
    → If found: sets authState 'loading', calls validateToken()
    → validateToken fails: logout(), authState → 'unauthenticated'
    → validateToken succeeds: authState → 'authenticated'
    → If not found: authState → 'unauthenticated'

  logout():
    → Clears all state (user, tokens, isNewUser)
    → Deletes from MMKV
    → Socket disconnection triggered
    → authState → 'unauthenticated'

PERSISTENCE STRATEGY:
  MMKV (not SecureStore) for performance
  Why: hydrate() runs on EVERY app launch
  SecureStore is async + slower (keychain access)
  MMKV is synchronous (in-memory with disk backup)
  Launch time: MMKV reads in <1ms, SecureStore 50-150ms
  Tokens themselves are not hardware-secured BUT:
  → Are short-lived (15 min access, 30 day refresh)
  → Refreshed constantly
  → If device compromised: tokens are least of problems
  → Trade: 100ms startup penalty vs slightly lower security
  → Decision: speed wins for consumer mobile app

  IF SECURITY IS CRITICAL:
  Use expo-secure-store for tokens (accepted 150ms cost)
  This can be changed without breaking any screen code
  (Auth store is the only consumer of storage layer)

WHAT STORE DOES NOT DO:
  Does not make API calls (that's hooks/services)
  Does not handle routing (that's AuthProvider)
  Does not validate tokens (that's auth.api.ts)
  Single responsibility: hold and update auth state
```

---

### File: `src/store/index.ts`

```
PURPOSE:
  Central export point for all stores.
  Prevents scattered store imports throughout the app.

EXPORTS:
  useAuthStore      from './auth.store'
  useCartStore      from './cart.store'
  useUIStore        from './ui.store'
  useLocationStore  from './location.store'
  useSocketStore    from './socket.store'

HICK'S LAW:
  Single import location = zero decision about which file to import.
  Developer writes: import { useAuthStore } from '@store'
  Not: import { useAuthStore } from '@store/auth.store'
  When there are 5+ stores, one entry point = clarity.
```

---

## Task 3.2 — Auth API Service + Zod Validation
### Duration: 45 minutes
### Files:
### `src/services/api/auth.api.ts`
### `src/utils/validation.ts` (auth schemas only)
### `src/hooks/useAuth.ts`

---

### Auth API Service Specification

```
FILE: src/services/api/auth.api.ts

PURPOSE:
  All HTTP calls related to authentication.
  Every method returns a typed Promise.
  No business logic here — only HTTP calls + response typing.
  HICK'S LAW: auth logic is here and ONLY here.

METHODS:

  sendOtp(phone: string):
    POST /auth/otp/send
    Body: { phone } (E.164 format: "+923001234567")
    Returns: { success: boolean, expiresIn: number }
    expiresIn: seconds until OTP expires (typically 300 = 5 min)
    Error cases:
      429: Too many requests (rate limited — 5/hour per phone)
      422: Invalid phone number format

  verifyOtp(phone: string, otp: string, role: 'user' | 'worker' = 'user'):
    POST /auth/otp/verify
    Body: { phone, otp, role }
    Returns: {
      accessToken: string,
      refreshToken: string,
      user: {
        id: string,
        phone: string,
        name: string | null,   → null = new user, needs name setup
        role: 'user' | 'worker',
        avatarUrl: string | null
      },
      isNewUser: boolean
    }
    Error cases:
      401: Invalid OTP
      410: OTP expired
      429: Too many attempts

  refreshToken(refreshToken: string):
    POST /auth/token/refresh
    Body: { refreshToken }
    Returns: { accessToken: string }
    Error cases:
      401: Refresh token expired → force logout

  logout():
    POST /auth/logout (with Bearer token)
    Returns: void (204 No Content)
    Always succeeds on client side even if server fails
    (Client-side logout happens regardless)

  getMe():
    GET /auth/me (with Bearer token)
    Returns: current auth session + user object
    Used by: hydrate() to validate stored token on startup

TYPING:

  SendOtpResponse interface:
    success: boolean
    expiresIn: number

  VerifyOtpResponse interface:
    accessToken: string
    refreshToken: string
    user: AuthUser
    isNewUser: boolean

  AuthUser interface:
    id: string
    phone: string
    name: string | null
    role: 'user' | 'worker'
    avatarUrl: string | null

  All interfaces exported from this file and re-exported
  from src/types/user.types.ts for broader use

ERROR HANDLING STRATEGY:
  All methods: let errors bubble up to the hook layer
  auth.api.ts does NOT show toasts or navigate
  The HOOK that calls auth.api.ts handles errors
  Why: API service doesn't know the UI context
       Hook knows the screen context → appropriate response
```

---

### Zod Validation Schemas

```
FILE: src/utils/validation.ts (auth section, expanded later)

PURPOSE:
  Runtime type safety for all form data.
  Catches bad data before it reaches the API.
  Shows specific, helpful error messages (not generic "invalid").

WHY ZOD:
  Type-safe schemas that produce TypeScript types automatically
  React Hook Form integration via @hookform/resolvers
  Clear, chainable API
  HICK'S LAW: one validation library for entire app

SCHEMAS TO DEFINE:

  phoneSchema:
    Type: string
    Transforms: strip whitespace, spaces, hyphens
    Validation:
      Must be digits only after stripping
      Length: 10 digits (Pakistani mobile: 3XX XXXXXXX without leading 0)
      OR 11 digits (with leading 0: 03XX XXXXXXX)
      Regex: /^(03|3)[0-9]{9}$/ (Pakistani mobile format)
    Error messages:
      "Phone number is required" (empty)
      "Please enter a valid Pakistani mobile number" (format)
      → RECOGNITION: tells user WHAT format is expected
      → Not "Invalid" (what does that mean?)

  otpSchema:
    Type: string
    Length: exactly 6 characters
    Regex: /^[0-9]{6}$/
    Error: "Please enter all 6 digits"

  nameSchema:
    Type: string
    Min: 2 chars ("Ali" is 3, "Ed" is 2 — short names are valid)
    Max: 50 chars (database column constraint)
    Transform: trim() — remove leading/trailing spaces
    Error messages:
      "Name must be at least 2 characters"
      "Name must be 50 characters or less"
      "Please enter your name"

  WHAT VALIDATION DOES NOT DO:
    Does not show error messages (that's the component's job)
    Does not make API calls (that's api service)
    Returns either: true (valid) or ZodError (with messages)
    Single responsibility: validate shape and content of data
```

---

### useAuth Hook

```
FILE: src/hooks/useAuth.ts

PURPOSE:
  All authentication operations as React hooks.
  Connects screens → auth.api.ts → auth.store.ts.
  Screens call hooks. Hooks call services. Services call HTTP.

WHY A HOOK LAYER:
  Screens are dumb: they show UI and call hooks.
  Hooks are smart: they orchestrate API + state + navigation + error.
  Services are pure: they just make HTTP calls.
  This separation = each layer testable independently.

HOOKS EXPORTED:

  useSendOtp():
    Returns: {
      sendOtp: (phone: string) => Promise<void>,
      isLoading: boolean,
      error: string | null
    }
    On call:
      1. Validate phone with phoneSchema
      2. If invalid: set error = validation message, return
      3. If valid: call auth.api.sendOtp(formatted phone)
      4. On success: navigate to OTP screen with phone param
      5. On 429: "Too many attempts. Try again in [time]"
      6. On error: "Could not send code. Please try again."
    Haptic on success: light (code was sent)
    Haptic on error: none (toast handles it)

  useVerifyOtp():
    Returns: {
      verifyOtp: (phone: string, otp: string) => Promise<void>,
      isLoading: boolean,
      error: string | null,
      otpError: boolean  ← triggers OTPInput shake
    }
    On call:
      1. Call auth.api.verifyOtp(phone, otp, 'user')
      2. On success:
         a. auth.store.setTokens(accessToken, refreshToken)
         b. auth.store.setUser(user)
         c. auth.store.setIsNewUser(isNewUser)
         d. If isNewUser: navigate to /name screen
         e. If !isNewUser: navigate to /(tabs)/ (replace, no back)
         f. Haptic: success notification (Peak-End Rule: satisfying end)
      3. On 401 (wrong OTP):
         a. Set otpError: true (triggers shake)
         b. Set error: "Wrong code. Please check your SMS."
         c. Haptic: error notification
         d. otpError resets after 600ms (after shake completes)
      4. On 410 (expired):
         a. Set error: "Code expired. Please request a new one."
      5. On 429 (too many):
         a. Set error: "Too many attempts. Please try later."

  useUpdateName():
    Returns: {
      updateName: (name: string) => Promise<void>,
      isLoading: boolean,
      error: string | null
    }
    On call:
      1. Validate name with nameSchema
      2. Call user.api.updateProfile({ name })
      3. On success:
         a. auth.store.setUser({ ...user, name })
         b. Navigate to location-permission screen
         c. Haptic: medium (progress made)
      4. On error: Show error toast, don't block user

  useLogout():
    Returns: { logout: () => void }
    On call:
      1. Call auth.api.logout() (fire and forget)
      2. auth.store.logout() (immediate, synchronous)
      3. useUIStore.showToast({ type: 'info', title: 'Logged out' })
      4. Navigation handled by AuthProvider route guard automatically
         (authState → 'unauthenticated' → guard redirects to welcome)

  useCurrentUser():
    Returns: { user: User | null, isLoading: boolean }
    React Query query on /auth/me
    staleTime: 5 minutes
    Used by: Profile screen, Header components
    NOT used by: Auth screens (they use auth.store directly)
```

---

## Task 3.3 — PhoneInput Component
### Duration: 30 minutes
### File: `src/components/ui/Input/PhoneInput.tsx`

---

### Why PhoneInput Is a Separate Component

```
JAKOB'S LAW — the decision driver:
  Country flag + dial code + number = universal phone input pattern
  WhatsApp, Uber, every bank app, every ride-hailing app
  Users perform this action with zero conscious thought.
  They recognize the pattern immediately.
  A different pattern breaks that recognition.

HICK'S LAW:
  PhoneInput removes the decision "which country am I in?"
  by defaulting to Pakistan (+92) via device locale detection.
  User doesn't choose — it's chosen for them correctly.
  Only edge case: international users can tap to change.

RECOGNITION OVER RECALL:
  The flag emoji + "+92" = immediate recognition of country context.
  User doesn't need to remember their country code.
  It's shown. They recognize it. Done.
  If wrong country: flag shows wrongness before they even type.
```

---

### Component Specification

```
COMPONENT NAME: PhoneInput
FILE: src/components/ui/Input/PhoneInput.tsx

VISUAL LAYOUT (left → right):
  [Flag emoji]  [+92]  [|vertical divider]  [number input field]

PROPS INTERFACE:
  value              → string (just the number part, no country code)
  onChangeText       → (value: string) => void
  error              → string | undefined
  countryCode        → string DEFAULT: '+92'
  countryFlag        → string DEFAULT: '🇵🇰'
  onCountryPress     → () => void (optional — opens country picker)
  autoFocus          → boolean DEFAULT: true (phone screen = immediate focus)

LEFT SECTION (country selector):
  Width: auto (fits flag + space + code)
  Height: 52px (matches input height — Fitts' Law: easy to tap)
  Contents:
    Flag emoji: 20px (Text component, no variant override)
    Space: 6px
    Dial code: Inter SemiBold 16px (it IS a number)
    Chevron-down: 14px, muted color (indicates tappable)
  Background: colors.bgInput (#F4F5F7)
  Border radius: radius.md (12px) on LEFT SIDE only
  → Left corners rounded, right corners squared (flush with divider)

DIVIDER:
  Width: 1px, height: 60% of input height (centered vertically)
  Color: colors.border (#E2E8F0)
  Not full height: creates visual breathing room

RIGHT SECTION (number input):
  Built on TextInput component (from Day 2)
  keyboardType: 'phone-pad' (numeric keyboard, no letters)
  placeholder: "3XX XXXXXXX" (format hint — Recognition over Recall)
  maxLength: 10 (10 digits for Pakistani number without 0)
  autoFocus: true (immediate keyboard on screen mount)
  leftIcon: none (country section serves this role)
  label: none (context provided by country section + placeholder)
  Border radius: radius.md on RIGHT SIDE only (flush with divider)

COMBINED CONTAINER:
  flexDirection: 'row'
  BG: colors.bgInput
  Border radius: radius.md (both full corners)
  Border: 1.5px transparent (idle) → 1.5px green (focused)
  Height: 52px
  Focus state managed at CONTAINER level (not individual sections)
  → When number input focused: WHOLE container border = green
  → Consistent with user expectation (single entity)

FORMAT MASKING:
  NOT implemented (keep simple for Pakistani market)
  Why: format masks confuse users more than they help on phone-pad
  Alternative: placeholder "3XX XXXXXXX" = sufficient format guide
  Pakistani users: familiar with entering without spaces/dashes

ERROR STATE:
  Error string shown below the container (same as TextInput)
  Container border: green → red when error prop present
  Shake: container shakes (not just one section)
  Shows below: Plus Jakarta Sans Regular, 12px, danger red

COUNTRY PICKER (deferred — tapped from flag/code area):
  For Day 3: press on country section → Alert or console.log placeholder
  Full country picker BottomSheet: built Day 5 with BottomSheet component
  Why defer: country picker needs BottomSheet (built Day 5)
  Don't block phone screen on Day 3 for rarely-used feature
  Pakistan default = 95%+ of users never touch country picker
```

---

## Task 3.4 — Welcome / Onboarding Screen
### Duration: 75 minutes
### File: `app/(auth)/welcome.tsx`

---

### Screen Architecture Decision

```
THIS IS THE MOST IMPORTANT SCREEN IN THE APP.

Users see this FIRST. Before booking. Before the app.
This screen decides: does the user continue or abandon?

CONVERSION OPTIMIZATION ANALYSIS:
  Most onboarding failures happen because:
  1. Too much text (users don't read — they scan)
  2. Too many decisions (Hick's Law violated)
  3. CTA buried or small (Fitts' Law violated)
  4. Features explained, not shown (Recognition denied)
  5. No momentum (Goal Gradient not triggered)

TASKLYNC SOLUTION:
  Show, don't tell (illustrations/lottie over text)
  One thing per slide (Hick's Law)
  CTA only on last slide (Serial Position: last = remembered)
  Full-width bottom CTA (Fitts' Law)
  3 dots showing progress (Goal Gradient)
  Most important benefit first (Serial Position: first remembered)
```

---

### Screen Specification

```
FILE: app/(auth)/welcome.tsx

SCREEN BG: colors.bgCard (#FFFFFF)
  → Pure white = premium, clean, first impression trust
STATUS BAR: 'dark-content' (dark icons on white background)
NAVIGATION: No header, no back button (start of journey)

LAYOUT STRUCTURE (top to bottom):

  [Skip button] — top right, absolute position
  [FlatList — slides]
  [Dot indicators]
  [StickyFooter — CTA appears on slide 3 only]

SLIDE DATA:

  Slide 1 — TRUST (Serial Position: first = most remembered)
    Illustration: Workers with shield/verification badges
                  (Lottie animation preferred over static image)
    Headline: "Verified Workers You Can Trust"
              → Poppins Bold, h1, color primary (#0F172A)
              → 2 lines max at 375px width
    Subtitle: "Every worker is background-checked, ID-verified,
               and reviewed by real customers near you."
              → Plus Jakarta Sans Regular, body1, muted color
              → Max 3 lines, line height 26

  Slide 2 — SPEED/CONVENIENCE (middle — least remembered, sets context)
    Illustration: Phone with quick booking animation
    Headline: "Book in Under 60 Seconds"
              → Same Poppins Bold h1 style
    Subtitle: "Find nearby electricians, plumbers, and cleaners.
               Schedule instantly or get help right now."
              → Same Jakarta body1 muted style

  Slide 3 — LIVE TRACKING (last = action trigger, Peak-End moment)
    Illustration: Map with moving worker pin
    Headline: "Track Every Step, Live"
              → Same Poppins Bold h1 style
    Subtitle: "Watch your worker travel to you in real-time.
               Chat, call, or reschedule — all in one place."
    → After this slide: CTA springs into view

HORIZONTAL SLIDE MECHANISM:
  FlatList with:
    horizontal: true
    pagingEnabled: true (snaps to each slide)
    showsHorizontalScrollIndicator: false
    bounces: false (no elastic bounce at edges)
    scrollEventThrottle: 16 (for smooth dot animation)

  Gesture: swipe left/right (Jakob's Law: universal carousel)
  NO programmatic auto-scroll (users control their pace — Hick's Law)
  Users who rush: skip to slide 3 via swipe
  Users who explore: swipe through all 3

SLIDE CONTENT ANIMATIONS:

  Per-slide content entrance:
    When slide becomes active (via scroll position):
    Illustration: scale 0.8 → 1.0 (springConfig.bouncy)
    Headline: translateY 20 → 0, opacity 0 → 1 (spring default)
    Subtitle: translateY 20 → 0, opacity 0 → 1 (spring, 80ms delay)
    → Stagger creates sense of content "arriving"
    → Jakob's Law: matches every good onboarding (Airbnb, Duolingo)

  Parallax effect on illustrations:
    As slide scrolls, illustration moves at 80% of scroll speed
    → Creates depth illusion (background moves slower)
    → Achieved via interpolate on scrollX shared value
    → Purely visual, no functional purpose — pure delight
    → PEAK-END: this is micro-delight that elevates "good" to "premium"

DOT INDICATORS:

  Position: above StickyFooter, horizontally centered
  Count: 3 dots
  Layout: flexDirection row, gap 6px, alignSelf center

  Per-dot animation (connected to scrollX):
    Inactive: width 6px, height 6px, borderRadius 3px, color green at 30%
    Active: width 20px (pill), height 6px, borderRadius 3px, color green 100%
    Transition: width interpolates continuously as user scrolls
    → As user approaches next slide, that dot begins widening
    → GOAL GRADIENT EFFECT: expanding dot visually signals proximity to goal
    → User subconsciously feels: "I'm almost at the CTA"
    → More likely to complete the swipe

  Implementation: scrollX shared value → interpolate per dot
    Dot 0 active when scrollX: 0 (width 20), 0→375: narrowing to 6
    Dot 1 active when scrollX: 375 (width 20), 375±375: narrowing
    Dot 2 active when scrollX: 750 (width 20)

SKIP BUTTON:
  Position: absolute, top 16px, right 20px
  Visible: only on slides 1 and 2
  Hidden: slide 3 (CTA is already visible — no need to skip)
  Label: "Skip" — Plus Jakarta Sans Medium, 14px, muted
  Action: scrollTo slide 3 (animated)
  Touch target: 44×44 minimum (hitSlop: 12)
  HICK'S LAW: Skip exists for returning users exploring
  Its small size signals: "this isn't the primary path"

CTA SECTION (StickyFooter):

  WHEN VISIBLE:
    Only on slide 3 (scrollX >= 600 at 375px screen)
    Animates IN: opacity 0 → 1 (250ms), translateY 20 → 0 (spring bouncy)
    → PEAK-END: CTA appearing with spring = micro-peak
    → User: "Oh, there's the button!" → excitement not confusion

  WHEN HIDDEN (slides 1, 2):
    Invisible container holds same height as CTA content
    → Footer height stays constant
    → Slides don't shift when CTA appears/disappears

  CONTENTS:
    Primary CTA:
      Button variant="primary" size="lg" fullWidth
      Label: "Get Started"
      Poppins SemiBold (Button enforces this)
      52px height (layout.primaryButtonH)

    Secondary link below (16px margin top):
      "Already have an account? Log In"
      Plus Jakarta Sans Regular 14px, muted
      "Log In" portion: Plus Jakarta Sans SemiBold, green color
      → Two Pressable spans or Text with nested colored Text
      → 44px touch area (hitSlop)
      → Action: same as "Get Started" (phone screen)
      → NO separate log-in flow (OTP works for both new + returning)

  FITTS' LAW COMPLIANCE:
    "Get Started": 52px × full-width = largest possible target
    "Log In": slightly smaller → signals it's the secondary path
    But still 44px minimum (hitSlop applied)

NAVIGATION ACTIONS:

  "Get Started" onPress:
    Haptic: medium (significant action)
    Navigate: router.push('/(auth)/phone')

  "Log In" onPress:
    Haptic: light (lighter action, same destination)
    Navigate: router.push('/(auth)/phone')
    → Same destination — auth handles isNewUser routing afterward

  Skip button onPress:
    Haptic: selection
    flatList.scrollToIndex({ index: 2, animated: true })

ACCESSIBILITY:
  Slides: accessibilityRole="none" (decorative — FlatList handles)
  Dots: accessibilityLabel="Slide N of 3" on each dot
  Skip: accessibilityLabel="Skip onboarding"
  CTA: accessibilityLabel="Get started with Tasklync"
  Log In: accessibilityLabel="Already have an account, log in"
```

---

## Afternoon Session (4 Hours)

---

## Task 3.5 — Phone Entry Screen
### Duration: 45 minutes
### File: `app/(auth)/phone.tsx`

---

### Screen Specification

```
FILE: app/(auth)/phone.tsx

PHILOSOPHY:
  This screen has ONE job: collect a phone number.
  Every element either helps that job or is removed.
  "Get Started" → "Enter phone" → "Continue"
  Three steps. All momentum. No friction.

SCREEN BG: colors.bgCard (#FFFFFF)
STATUS BAR: 'dark-content'

LAYOUT STRUCTURE:
  [Header: IconButton back arrow]
  [Content area: icon + title + subtitle + PhoneInput + legal]
  [StickyFooter: Continue button]

HEADER:
  IconButton: ChevronLeft icon, left side
  accessibilityLabel: "Go back to welcome screen"
  Size: 40 visual, 44 touch
  BG: transparent (no visible circle on auth screens)
  onPress: router.back()

CONTENT AREA (paddingH 20, paddingTop 28):

  Lock / Phone Icon:
    View: 64×64px, borderRadius 20, BG colors.primaryTint (#F0FDF4)
    Icon: Phone (Lucide), 28px, colors.primary
    Margin bottom: 28px
    WHY THIS ICON:
      RECOGNITION: phone icon = "this is about a phone number"
      Green tint background = brand consistency without heavy green
      Rounded square (not circle) = different from avatar shapes

  Title:
    Text variant="h1" color="primary"
    "Enter your\nphone number"
    2 lines (intentional — makes the screen feel spacious)
    Poppins Bold, 28px

  Subtitle (8px below title):
    Text variant="body1" color="muted"
    "We'll send a verification code to confirm it's you"
    Plus Jakarta Sans Regular, 16px
    Conveys WHY we need the phone = trust signal

  PhoneInput (28px below subtitle):
    PhoneInput component (built Task 3.3)
    autoFocus: true (keyboard appears on screen mount)
    value: controlled from local state
    onChangeText: updates state, clears error
    error: validation error string or undefined

  Legal text (20px below input):
    "By continuing, you agree to our "
    "Terms of Service" (tappable, green)
    " and "
    "Privacy Policy" (tappable, green)
    Plus Jakarta Sans Regular, caption (12px), muted
    Links: router.push('/legal/terms') etc. (placeholder)
    WHY LEGAL TEXT HERE:
    SERIAL POSITION: After the CTA focus, at the bottom of content
    Small, muted = doesn't compete with the input
    Present = trust signal (we're transparent about terms)
    Absent = suspicion (what are we hiding?)

STICKY FOOTER:

  Continue Button:
    variant="primary" size="lg" fullWidth
    disabled: when phone number is invalid (not yet 10 digits)
    loading: while sendOtp API call is in flight
    onPress: calls useSendOtp().sendOtp('+92' + phone)

  BUTTON STATE TRANSITION MICRO-INTENTION:
    When user starts typing:
      Button is disabled (muted green bg #86EFAC)
      Communicates: "not yet, keep typing"
      GOAL GRADIENT: disabled state creates tension

    When 10th digit is entered:
      Validate immediately (run phoneSchema.safeParse)
      If valid: button springs to active green (#16A34A)
      → PEAK-END: this spring = micro-peak reward for completing input
      → withSpring scale 0.97 → 1.03 → 1.0 (bouncy)
      → backgroundColor transitions 200ms (timingConfig.fast)
      → Haptic: selection (lightest — just a subtle acknowledgment)
      → User: "Oh, I can tap now!" → positive micro-moment

    When invalid after 10 digits (unlikely but possible):
      Keep disabled state
      Don't show error yet (user might still be typing)
      Error shown ONLY after Continue is explicitly tapped

FORM HANDLING:
  NOT using react-hook-form here (overkill for single field)
  Simple useState for phone value + error string
  Zod validation called on: tap Continue, not on every keystroke
  → JAKOB'S LAW: error on Submit matches every app user knows
  → Error on keystroke = anxiety-inducing
  → Error on Submit = expected, recoverable

LOADING STATE:
  Continue Button shows spinner
  PhoneInput: editable={false} (prevent typing during submit)
  Skip button: disabled
  No overlay/blocking modal (that pattern is jarring)

ERROR STATE (after API error):
  Show toast notification via useUIStore.showToast
  Toast type: 'error'
  Message: "Could not send code. Please try again."
  PhoneInput NOT shaken (shake = local validation error, not API error)
  Toast = remote error notification (different visual channel)

SUCCESS PATH:
  useSendOtp.sendOtp succeeds
  Store OTP expiry in local state (from API response.expiresIn)
  Navigate: router.push({ pathname: '/(auth)/otp', params: { phone: '+92' + phone } })
  Pass phone as param (OTP screen needs to display it + send it)

KEYBOARD BEHAVIOR:
  keyboardType: 'phone-pad' on PhoneInput
  returnKeyType: 'done'
  onSubmitEditing: same as Continue button onPress
  WHY: User on phone keyboard can tap "done" instead of moving to button
  FITTS' LAW: "done" key in keyboard is thumb-accessible
```

---

## Task 3.6 — OTP Verification Screen
### Duration: 60 minutes
### File: `app/(auth)/otp.tsx`

---

### Screen Specification

```
FILE: app/(auth)/otp.tsx

PHILOSOPHY:
  This screen has ZERO decisions.
  User doesn't choose anything. They just type 6 digits.
  The screen does the rest: auto-advances, auto-verifies.
  HICK'S LAW at its purest: zero choices = zero decision time.
  JAKOB'S LAW at its most elegant: user completes on autopilot.

PARAMS RECEIVED:
  phone: string (from phone screen navigation)
  Example: "+923001234567"

SCREEN BG: colors.bgCard (#FFFFFF)
STATUS BAR: 'dark-content'

LAYOUT STRUCTURE:
  [Header: IconButton back arrow]
  [Content: icon + title + masked phone + OTPInput + countdown + links]
  (No StickyFooter — OTP auto-verifies on 6th digit)

HEADER:
  IconButton: ChevronLeft
  accessibilityLabel: "Go back and change phone number"
  onPress: router.back() (user can change number)

CONTENT AREA:

  Message / Chat Icon:
    View: 64×64px, borderRadius 20, BG colors.primaryTint
    Icon: MessageSquare (Lucide), 28px, colors.primary
    WHY MESSAGE ICON: RECOGNITION — message = SMS = code
    Margin bottom: 28px

  Title:
    Text variant="h1" color="primary"
    "Verify your number"
    Poppins Bold, 28px

  Masked phone (8px below title):
    "Code sent to +92 3XX XXX••56"
    WHY MASK:
      RECOGNITION: user sees their OWN number (partial) = recognition
      Not revealed fully = security (screen shoulder surfing)
      Shows the last 2 digits = enough to confirm it's the right number
    TYPOGRAPHY:
      "Code sent to " → Plus Jakarta Sans Regular, 15px, muted
      "+92 3XX XXX••56" → Inter Medium, 15px, primary color
      Why Inter for the number: it IS a number, follow the rule
    MASKING LOGIC:
      phone = "+923451234567"
      display = "+92 3XX XXX" + "•" * (phone.length - 12) + phone.slice(-2)
      Simple: "+92 3XX XXX••56" for 10-digit numbers

  OTPInput component (32px below masked phone):
    value: controlled state
    onChange: updates value state
    onComplete: calls useVerifyOtp().verifyOtp(phone, otp)
    error: otpError boolean from useVerifyOtp hook
    success: successState boolean (set after successful verify)
    disabled: isLoading || success

  Countdown section (24px below OTPInput):
    Two states:

    STATE A — Counting down (canResend === false):
      "Resend code in " — Plus Jakarta Sans Regular, 14px, muted
      "0:47" — Inter Bold, 16px, colors.primary
      → Live countdown every second
      → GOAL GRADIENT: decreasing time = increasing urgency
      → "I should hurry up and find my SMS"

    STATE B — Resend available (canResend === true, countdown = 0):
      "Resend code" — Plus Jakarta Sans SemiBold, 14px, green
      Pressable (hitSlop: 12)
      onPress: calls useSendOtp().sendOtp(phone) again
               resets countdown to 60 seconds
               resets canResend to false
      Haptic: light

    TRANSITION between A and B:
      When countdown hits 0: opacity A → 0, opacity B → 1 (250ms)
      Smooth, not jarring

  "Wrong number?" link (16px below countdown):
    "Wrong number? Change it"
    "Wrong number? " → Plus Jakarta Sans Regular, 13px, muted
    "Change it" → Plus Jakarta Sans SemiBold, 13px, green
    Pressable (hitSlop: 8)
    onPress: router.back()
    HICK'S LAW: this is a safety valve, not a primary action
    Small font + combined with text = low visual priority

COUNTDOWN TIMER IMPLEMENTATION:
  Local state: timeLeft = 60 (seconds received from sendOtp response)
  useEffect with setInterval:
    Every 1 second: timeLeft - 1
    When 0: clearInterval, setCanResend(true)
  Display: "0:47" format
    Math.floor(timeLeft / 60) + ":" + String(timeLeft % 60).padStart(2, '0')
    For times > 60s: "1:23" format

VERIFICATION FLOW:

  onComplete fires (6th digit entered):
    1. Set isLoading: true (OTPInput disabled)
    2. Call useVerifyOtp().verifyOtp(phone, otp)
    3. Haptic on completion: selection (light acknowledgment of input done)

  SUCCESS path:
    a. OTPInput receives success=true prop
    b. Cascade green animation plays (6 boxes, 40ms stagger)
       → THIS IS THE PEAK MOMENT (Peak-End Rule)
    c. Haptic: success notification
    d. 800ms delay (let user enjoy the peak)
    e. Navigate based on isNewUser:
       isNewUser=true  → router.replace('/(auth)/name')
       isNewUser=false → router.replace('/(tabs)/')
    f. WHY replace not push:
       User cannot go BACK to OTP screen after auth
       replace = removes OTP from stack
       Prevents "back → broken state"

  ERROR path (wrong OTP):
    a. OTPInput receives error=true prop
    b. All 6 boxes shake simultaneously (Reanimated withSequence)
    c. All 6 boxes turn red
    d. Haptic: error notification
    e. Value clears after 600ms (shake duration)
    f. error resets after 600ms (allows re-entry)
    g. Focus: ref[0] (back to first box)
    h. No toast — shake IS the error feedback (enough signal)

  ERROR path (expired OTP):
    a. Set error message: "Code expired. Tap Resend."
    b. Show toast
    c. Highlight "Resend code" link (slight scale animation)

  LOADING during verification:
    OTPInput: disabled=true (no further input)
    Countdown: continues (still running)
    No visible spinner (OTPInput shows loading via opacity)

ACCESSIBILITY:
  OTPInput box 1: accessibilityLabel="Enter OTP digit 1 of 6"
  Countdown: accessibilityLiveRegion="polite"
    → Screen reader announces time changes without interrupting
  "Resend code": accessibilityRole="button"
  "Change it": accessibilityRole="link"
```

---

## Task 3.7 — Name Entry Screen
### Duration: 30 minutes
### File: `app/(auth)/name.tsx`

---

### Screen Specification

```
FILE: app/(auth)/name.tsx

CONDITION: Only shown when isNewUser=true (from OTP response)
           Returning users skip this entirely

PHILOSOPHY:
  This screen asks one question: "What should we call you?"
  The warmth of this question = the warmth of the brand.
  "What's your name?" = human, warm (Poppins delivers this)
  After OTP's technical feel, this screen = emotional transition
  The user stops doing authentication and starts being a customer.

SCREEN BG: colors.bgCard (#FFFFFF)
STATUS BAR: 'dark-content'
NO BACK BUTTON: user cannot go back to OTP after success

LAYOUT STRUCTURE:
  [Content area: emoji + title + subtitle + TextInput + char count]
  [StickyFooter: "Let's go" button]

CONTENT AREA (paddingH 20, paddingTop 40):

  Wave emoji illustration:
    Text: "👋" at 48px fontSize
    Or: small Lottie wave animation (if available in assets)
    Margin bottom: 24px
    WHY EMOJI NOT ICON:
      Human, informal, friendly contrast to the technical OTP flow
      Signals: "the hard part is done, let's have fun"
      PEAK-END: this is the positive END moment of auth frustration

  Title:
    Text variant="h1" color="primary"
    "What's your name?"
    Poppins Bold, 28px
    WHY QUESTION FORMAT:
      Conversational = human = warm
      "Enter name" = form-ish = cold
      A question invites. A command demands.

  Subtitle (8px below):
    Text variant="body1" color="muted"
    "So workers know who they're meeting"
    Plus Jakarta Sans Regular, 16px
    WHY THIS SPECIFIC COPY:
      Gives USER BENEFIT context, not just "we need your name"
      "Workers know who they're meeting" = makes user feel seen
      Empathy-first copy = trust building

  TextInput (28px below subtitle):
    label: "Your name"
    placeholder: "Enter your name"
    value: controlled
    autoFocus: true (immediate keyboard — FITTS' LAW: no tap to focus)
    returnKeyType: 'done'
    autoCapitalize: 'words' (name capitalization)
    maxLength: 50 (nameSchema constraint)
    onSubmitEditing: same as "Let's go" button press
    error: validation error from nameSchema

  Character count (8px below input, right-aligned):
    Visible: only when name.length > 30 (warning zone)
    Text: "{name.length} / 50"
    Inter Regular, dataXS (11px), muted when < 45, warning when ≥ 45
    WHY ONLY AFTER 30:
      Showing counter from 0 = pressure, unnecessary
      Showing from 30 = helpful warning without early anxiety

STICKY FOOTER:

  "Let's go →" button:
    variant="primary" size="lg" fullWidth
    label: "Let's go →" (arrow adds momentum)
    disabled: name.trim().length < 2 (nameSchema minimum)
    loading: while updateProfile API call in flight

    BUTTON APPEARANCE TRANSITION:
      When name.length < 2: disabled green (muted)
      When name.length >= 2: 
        Button springs to active:
        scale 0.98 → 1.02 → 1.0 (spring bouncy)
        GOAL GRADIENT: this transition = "you've crossed the threshold"
        "I can proceed now" = positive micro-peak
      Haptic: selection on threshold crossing

VALIDATION TRIGGER:
  On button press: run nameSchema.safeParse(name.trim())
  If invalid: set error string, TextInput shows error shake
  If valid: call useUpdateName().updateName(name.trim())
  
  NOTE: trim() before validation AND before API call
  "  Ali  " → "Ali" (correct) vs "  Ali  " (whitespace stored in DB)

SUCCESS PATH:
  router.replace('/(auth)/location-permission')
  WHY REPLACE: auth flow is linear, no back navigation after name

ERROR STATE:
  API error: toast "Something went wrong. Your name wasn't saved.
             Tap 'Let's go' to try again."
  Note: Name save failure is NOT blocking — user can still proceed
  WHY: Name can be set later in profile settings
  Blocking auth on a profile field = conversion killer

ACCESSIBILITY:
  TextInput: accessibilityLabel="Enter your name"
  accessibilityHint: "We'll use this to introduce you to workers"
  Button: accessibilityLabel="Continue to the app"
  No back button: accessibilityLabel not needed for non-existent element
```

---

## Task 3.8 — Location Permission Screen
### Duration: 30 minutes
### File: `app/(auth)/location-permission.tsx`

---

### Screen Specification

```
FILE: app/(auth)/location-permission.tsx

PHILOSOPHY:
  This is a SALES screen, not a permission screen.
  The actual permission dialog comes AFTER this screen.
  This screen's job: convince user to tap "Allow" on the system dialog.
  
  Industry research: 70% of users allow location when shown
  a well-designed pre-permission screen explaining WHY.
  Without pre-permission: 45% allow.
  25% difference = enough to justify this screen.

  JAKOB'S LAW: Airbnb, Uber, Instacart all do this.
  Users know this pattern: "explain → system dialog → app continues"

SCREEN BG: colors.bgApp (#FAFAFA)
  Slightly off-white vs auth screens (visual transition signal)
STATUS BAR: 'dark-content'

LAYOUT STRUCTURE:
  [Content: map animation + title + subtitle + feature list]
  [StickyFooter: Allow + Not Now]

CONTENT AREA:

  Map animation:
    Lottie animation: pulsing map with location pins
    Size: 240×240px, centered
    Duration: loops until user acts
    → RECOGNITION: animated map = "location feature" instantly clear
    → No text needed to explain — user SEES what location enables
    → This is Recognition over Recall at its most powerful

    If Lottie not ready Day 3:
    Placeholder: View 240×240, borderRadius 120, BG colors.primaryTint
    + MapPin icon 80px, colors.primary, centered
    → Still communicates location context

  Title (24px below animation):
    Text variant="h1" color="primary" align="center"
    "Enable location\naccess"
    Poppins Bold, 28px, 2 lines

  Subtitle (8px below title):
    Text variant="body1" color="muted" align="center"
    "We use your location to find the best workers near you"
    Plus Jakarta Sans Regular, 16px, centered

  Feature list (28px below subtitle):
    3 items, each row:
    [Green check circle 20px] [Feature text]
    Gap between icon and text: 12px
    Gap between rows: 12px
    Container: rounded card, BG colors.bgCard, padding 16px, shadow-sm

    Row 1: "Find verified workers closest to you"
    Row 2: "Track workers in real-time as they travel"
    Row 3: "Get accurate arrival time estimates"

    WHY FEATURE LIST FORMAT:
      SERIAL POSITION: First item = most impactful
      "Find workers closest to you" = most compelling benefit
      Green check icons = visual confirmation (all positive)
      RECOGNITION: bullet-with-checkmarks = "benefits" pattern
      Users recognize this from App Store screenshots

    Typography per row:
      Icon: green check circle (not Lucide, use colored View + checkmark)
      Feature text: Plus Jakarta Sans Regular, body2 (14px), textPrimary

STICKY FOOTER:

  "Allow Location" button:
    variant="primary" size="lg" fullWidth
    label: "Allow Location"
    onPress:
      1. Call expo-location requestPermissionsAsync()
      2. System dialog appears on top of app
      3. If granted:
         a. Get current position
         b. Reverse geocode → city name
         c. Store in location.store
         d. Navigate: router.replace('/(tabs)/') — FINAL DESTINATION
         e. Show welcome toast: "Welcome, [name]! 👋"
            useUIStore.showToast({ type:'success', title:'Welcome, Ali!' })
            → THIS IS THE END MOMENT (Peak-End Rule)
            → User enters the app feeling welcomed
      4. If denied:
         a. Navigate to /(tabs)/ anyway (location optional, not required)
         b. location.store.setPermission('denied')
         c. Home screen will prompt again contextually later

    WHY NAVIGATE EVEN IF DENIED:
      Not granting location ≠ leaving the app
      Location access can be requested again contextually
      "We need location to show Map" = better timing = higher allow rate
      Blocking access to app on location refusal = conversion disaster

  "Not now" text button:
    variant="text" size="sm" fullWidth (but appears smaller)
    label: "Not now"
    BG: transparent
    Text: Plus Jakarta Sans Medium, 14px, muted (NOT green)
    WHY MUTED NOT GREEN:
      Muted = low visual priority = user less likely to choose it
      This is intentional UX hierarchy: "Allow" wins visually
    Margin top: 10px below Allow button
    onPress: router.replace('/(tabs)/') (skip location, enter app)

PERMISSION HANDLING:

  usePermissions hook (from @hooks/usePermissions):
    requestLocationPermission(): Promise<'granted' | 'denied' | 'undetermined'>
    
    Returns 'granted':
      Set location.store.permissionStatus = 'granted'
      Call getCurrentPositionAsync()
      Reverse geocode → store city
      Navigate to tabs

    Returns 'denied' (user tapped "Don't Allow" on system dialog):
      Set location.store.permissionStatus = 'denied'
      Navigate to tabs
      Don't show error toast (user made a choice)
      LocationProvider will handle gracefully

    Returns 'undetermined' (iOS: user dismissed without choice):
      Stay on screen (rare case)
      Re-enable Allow button

ACCESSIBILITY:
  Animation: accessibilityLabel="Animated map showing location feature"
  Feature list items: accessibilityRole="text" (not interactive)
  Allow button: accessibilityLabel="Allow Tasklync to access your location"
  Not now: accessibilityLabel="Skip location access for now"
```

---

## Task 3.9 — Auth Provider + Route Guard
### Duration: 25 minutes
### File: `src/providers/AuthProvider.tsx`

---

### Route Guard Specification

```
FILE: src/providers/AuthProvider.tsx

PURPOSE:
  Global route protection.
  Ensures unauthenticated users go to welcome.
  Ensures authenticated users never see auth screens.
  No screen-level auth checking needed — centralized here.

HICK'S LAW applied to architecture:
  One guard for all routes.
  No per-screen auth checking.
  Screens don't need to know about authentication.
  AuthProvider knows. Screens are innocent.

HOW IT WORKS:

  On mount:
    1. Call auth.store.hydrate()
    2. hydrate() reads MMKV for tokens
    3. If tokens found: validate with /auth/me API call
    4. If valid: set authState = 'authenticated'
    5. If invalid/expired: auth.store.logout()
    6. If no tokens: set authState = 'unauthenticated'
    7. authState transitions from 'idle' → 'authenticated'|'unauthenticated'

  Continuous watching (useEffect on [authState, segments]):
    authState === 'idle' OR 'loading': do nothing (splash still showing)
    authState === 'authenticated' AND in (auth)/*:
      router.replace('/(tabs)/')
      → Logged in user opened app to auth screen = push to tabs
    authState === 'unauthenticated' AND NOT in (auth)/*:
      router.replace('/(auth)/welcome')
      → Session expired while using app = push to auth

  segments: array from useSegments() hook
  segments[0] tells us the route group we're in: (auth), (tabs), etc.

WHAT IT RENDERS:
  {children} always (no loading screen here)
  Splash screen handles the loading visual (Day 2 _layout.tsx)
  AuthProvider is invisible, purely behavioral

EDGE CASES HANDLED:

  Token refresh failure during session:
    auth.api.ts interceptor calls refresh → fails
    auth.store.logout() called in interceptor
    authState → 'unauthenticated'
    AuthProvider watches authState → redirect to welcome
    User sees: "Logged out" toast (from logout action)

  App opened after long time (token expired):
    hydrate() calls /auth/me → 401
    Interceptor: refresh token → also expired → logout
    authState → 'unauthenticated'
    AuthProvider → welcome screen

  Multiple tabs / navigation race:
    segments check prevents double redirect
    replace() is idempotent (no harm if called twice)
```

---

## Task 3.10 — Auth _layout.tsx + Wire-up
### Duration: 30 minutes
### File: `app/(auth)/_layout.tsx`

---

### Auth Stack Layout Specification

```
FILE: app/(auth)/_layout.tsx

PURPOSE:
  Configure the Stack navigator for all auth screens.
  All auth screens share: no header, fade animation between them.

CONFIGURATION:

  Stack.Screen for each auth route:
    welcome:              animation 'none' (first screen, no enter animation)
    phone:                animation 'slide_from_right' (going deeper)
    otp:                  animation 'slide_from_right' (going deeper)
    name:                 animation 'fade' (post-auth emotional shift)
    location-permission:  animation 'fade' (continuation, not hierarchy)

  WHY DIFFERENT ANIMATIONS:
    welcome: no animation (first screen = no "from" context)
    phone/otp: slide_from_right = going forward in linear flow
    name/location: fade = changing emotional register
    (from functional → personal → spatial)

  WHY NOT slide_from_bottom FOR AUTH:
    slide_from_bottom = "new context" (modal-like)
    Auth screens are a LINEAR flow, not modal context
    slide_from_right = correct spatial metaphor for linear progress

  gestureEnabled: true for phone + otp (can go back)
  gestureEnabled: false for name + location (cannot go back, auth committed)
  gestureEnabled: false for welcome (no screen to go back to)

  All screens: headerShown: false (custom headers per screen)

INDEX FILE (app/(auth)/index.tsx):
  Redirects to welcome screen
  Purpose: Navigating to /(auth)/ works (redirects to /welcome)
```

---

## Day 3 — Complete File List

```
NEW FILES CREATED TODAY:

  STATE:
    src/store/auth.store.ts          ← Zustand auth store with persistence
    src/store/index.ts               ← Barrel export for all stores

  API + HOOKS:
    src/services/api/auth.api.ts     ← Auth HTTP methods (sendOtp, verifyOtp)
    src/utils/validation.ts          ← Zod schemas (phone, otp, name)
    src/hooks/useAuth.ts             ← useSendOtp, useVerifyOtp, useLogout

  COMPONENTS:
    src/components/ui/Input/PhoneInput.tsx   ← Country flag + number input

  SCREENS:
    app/(auth)/_layout.tsx           ← Auth stack config
    app/(auth)/index.tsx             ← Redirect to welcome
    app/(auth)/welcome.tsx           ← 3-slide onboarding carousel
    app/(auth)/phone.tsx             ← Phone number entry
    app/(auth)/otp.tsx               ← OTP verification
    app/(auth)/name.tsx              ← Name entry (new users)
    app/(auth)/location-permission.tsx ← Location permission request

  PROVIDERS:
    src/providers/AuthProvider.tsx   ← Route guard + token hydration

MODIFIED FROM DAY 2:
    app/_layout.tsx                  ← Add AuthProvider to provider chain
    src/providers/AppProviders.tsx   ← Import + add AuthProvider
    src/store/index.ts               ← Add auth.store.ts export

TOTAL NEW FILES: 13
TOTAL SCREENS SHIPPED: 5 complete auth screens
AUTH FLOW: End-to-end functional (Welcome → Phone → OTP → Name → App)
```

---

## Day 3 — Micro-Interactions Complete Catalog

```
Organized by screen and moment. Every intentional.

WELCOME SCREEN:
  ┌────────────────────────────────────────────────────────────────┐
  │ Interaction              Micro-Intention                       │
  ├────────────────────────────────────────────────────────────────┤
  │ Slide content enters     "This content is arriving for you"    │
  │ Illustration parallax    "There's depth here, this is alive"  │
  │ Progress dot expands     "You're approaching the next stage"   │
  │ CTA spring-reveals       "You've reached the point of action"  │
  │ Skip button tap          Haptic: selection                     │
  │ Get Started tap          Haptic: medium + navigates            │
  └────────────────────────────────────────────────────────────────┘

PHONE SCREEN:
  ┌────────────────────────────────────────────────────────────────┐
  │ Screen opens             Auto-focus → keyboard up (no tap)     │
  │ Input focused            Border: gray→green (200ms)            │
  │ 10 digits entered        Button springs green (bouncy)         │
  │                          Haptic: selection (micro-reward)      │
  │ Continue tap             Haptic: medium, spinner appears       │
  │ API success              Navigate to OTP                       │
  │ API error                Toast slides from top                 │
  └────────────────────────────────────────────────────────────────┘

OTP SCREEN:
  ┌────────────────────────────────────────────────────────────────┐
  │ Screen opens             Auto-focus box 1                      │
  │ Digit entered            Haptic: selection per digit           │
  │                          Box bounces, cursor advances          │
  │ Countdown running        Timer: "I'm approaching urgency"      │
  │ Timer reaches 0          "Resend code" appears (opacity fade)  │
  │ Wrong OTP (error)        All boxes shake simultaneously        │
  │                          Haptic: error notification            │
  │                          All boxes → red                       │
  │                          Boxes clear after 600ms               │
  │ Correct OTP (success)    Cascade: box 0→1→2→3→4→5 green       │
  │                          Each box bounces 40ms stagger         │
  │                          Haptic: success notification (PEAK)   │
  │                          800ms hold → navigate                 │
  └────────────────────────────────────────────────────────────────┘

NAME SCREEN:
  ┌────────────────────────────────────────────────────────────────┐
  │ Screen opens             Auto-focus TextInput                  │
  │ First 2 chars typed      CTA springs from disabled→enabled     │
  │                          Haptic: selection (threshold reward)   │
  │ Char 30+ reached         Counter appears below input           │
  │ Char 45+ reached         Counter color → warning amber         │
  │ "Let's go" tap           Haptic: medium + loading spinner      │
  │ API success              Navigate → location screen            │
  └────────────────────────────────────────────────────────────────┘

LOCATION SCREEN:
  ┌────────────────────────────────────────────────────────────────┐
  │ Lottie animation         Plays on loop (alive, dynamic)        │
  │ "Allow Location" tap     Haptic: medium                        │
  │                          System permission dialog appears      │
  │ Permission granted       Success haptic                        │
  │                          Navigate → tabs with welcome toast    │
  │                          "Welcome, Ali! 👋" (PEAK-END END)     │
  │ Permission denied        Navigate → tabs (no punishment)       │
  │ "Not now" tap            Haptic: light + navigate              │
  └────────────────────────────────────────────────────────────────┘
```

---

## Day 3 — Deliverable Checklist

```
STATE & SERVICES:
  □ auth.store.ts: all actions, computed props, MMKV persistence
  □ store/index.ts: barrel export for all 5 stores
  □ auth.api.ts: sendOtp, verifyOtp, refreshToken, logout, getMe
  □ validation.ts: phoneSchema, otpSchema, nameSchema with Zod
  □ useAuth.ts: useSendOtp, useVerifyOtp, useUpdateName, useLogout

COMPONENTS:
  □ PhoneInput.tsx: flag + code + number, 52px, combined focus border
  □ PhoneInput: error state matches TextInput error pattern

SCREENS:
  □ welcome.tsx: 3-slide FlatList, pagingEnabled, parallax
  □ welcome.tsx: animated progress dots (scrollX → width interpolation)
  □ welcome.tsx: CTA appears with spring on slide 3 ONLY
  □ welcome.tsx: content stagger animation per slide
  □ welcome.tsx: Skip button hides on slide 3
  □ phone.tsx: PhoneInput + auto-focus + validation
  □ phone.tsx: Continue button enables with spring on valid number
  □ phone.tsx: Loading state + error toast
  □ otp.tsx: OTPInput with all states wired to useVerifyOtp
  □ otp.tsx: Live countdown timer (60s)
  □ otp.tsx: Resend code appears when countdown = 0
  □ otp.tsx: Masked phone number displayed (Inter font)
  □ otp.tsx: Success → cascade animation → delayed navigation
  □ otp.tsx: Error → shake → clear → re-focus box 0
  □ name.tsx: TextInput + auto-focus + nameSchema validation
  □ name.tsx: CTA springs green after 2 chars
  □ name.tsx: Character count appears after 30 chars
  □ location-permission.tsx: Lottie/placeholder animation
  □ location-permission.tsx: Feature list (3 items)
  □ location-permission.tsx: Permission request + handling
  □ location-permission.tsx: Navigate to tabs regardless of permission

NAVIGATION:
  □ (auth)/_layout.tsx: per-screen animations configured
  □ AuthProvider.tsx: hydrate() on mount
  □ AuthProvider.tsx: route guard watching authState + segments
  □ Token refresh failure → auto-logout → auth screens

QUALITY:
  □ tsc --noEmit: zero errors
  □ eslint: zero errors, zero warnings
  □ All 5 screens tested on iOS simulator (all states)
  □ All 5 screens tested on Android emulator
  □ Back navigation: phone → welcome ✅
  □ Back navigation: otp → phone ✅
  □ Back navigation: name → BLOCKED (no back) ✅
  □ Back navigation: location → BLOCKED (no back) ✅
  □ Returning user (isNewUser=false): OTP → directly to tabs ✅
  □ New user: OTP → name → location → tabs ✅
  □ Token stored in MMKV: app kill + relaunch = stays logged in ✅
  □ Expired token: redirected to welcome automatically ✅
  □ Font rendering: Poppins for all titles, Inter for all numbers ✅
  □ All touch targets: minimum 44×44px verified ✅
  □ Haptics: correct for each interaction ✅
```

---

## UX Laws Final Audit — Day 3

```
RECOGNITION OVER RECALL:
  ✅ Welcome: illustrations show features (don't tell)
  ✅ OTP: masked phone confirms "this is MY number" without revealing all
  ✅ PhoneInput: flag + code = country recognition, not recall of code
  ✅ Location: animated map shows what feature does before enabling it
  ✅ Feature list: visual format = immediately recognized as "benefits"

FITTS' LAW:
  ✅ "Get Started": 52px × full-width = largest possible tap target
  ✅ OTP auto-verifies: removes need to tap any button at all
  ✅ "Allow Location": 52px full-width at bottom
  ✅ "Not now": smaller text, intentionally less tappable
  ✅ All back buttons: 44×44 touch target via hitSlop
  ✅ Name TextInput: auto-focus = no tap to begin typing

HICK'S LAW:
  ✅ Welcome: 0 decisions on slides 1-2, 1 decision on slide 3
  ✅ Phone: 1 field, 1 button
  ✅ OTP: ZERO decisions (auto-advance, auto-verify)
  ✅ Name: 1 field, 1 button
  ✅ Location: 2 options max (Allow / Not Now)
  ✅ Auth flow: 5 screens but each = 1 piece of information only

JAKOB'S LAW:
  ✅ Carousel swipe = App Store, Instagram, Uber pattern
  ✅ Phone: flag + code + number = universal telephony pattern
  ✅ OTP: 6 boxes, countdown, resend = universal 2FA pattern
  ✅ Pre-permission screen = Airbnb, Uber, every top app
  ✅ Route guard behavior = all consumer apps

PEAK-END RULE:
  ✅ PEAK: OTP success cascade (6 green bouncing boxes, 40ms stagger)
  ✅ END: Welcome toast "Welcome, [name]!" on entering main app
  ✅ MICRO-PEAKS: button springs green, CTA appears on slide 3
  ✅ END of auth: location → tabs = clean, fast, positive moment

GOAL GRADIENT:
  ✅ 3 progress dots show journey through onboarding
  ✅ Dots widen as user approaches next slide
  ✅ OTP countdown creates urgency (time = goal pressure)
  ✅ OTP boxes: 6 visible slots pull user to complete all 6
  ✅ Name: button enables at 2 chars = threshold achievement reward
  ✅ Auth flow: 5 clear steps = user can track position in journey

SERIAL POSITION:
  ✅ Slide 1 = TRUST message (most important = first = remembered)
  ✅ Slide 3 = CTA (last = most acted upon)
  ✅ Phone: country context BEFORE number field (left → right)
  ✅ OTP: masked number BEFORE input boxes (context before action)
  ✅ Location feature list: "find workers near you" = FIRST item
```

---

## What Day 4 Gets From Day 3

```
AFTER DAY 3, THE FOLLOWING ARE COMPLETE:

COMPLETE AUTHENTICATION:
  → User can register (new) or log in (returning) end-to-end
  → Tokens stored and persist across app restarts
  → Route guard protects all non-auth screens
  → Token refresh handles session expiry automatically
  → Auth flow is indistinguishable from a shipped product

AVAILABLE FOR DAY 4:
  → useAuthStore accessible from any screen
  → user.name, user.phone, user.id available everywhere
  → isAuthenticated available for conditional rendering
  → accessToken automatically attached to all API calls
  → Zustand stores for cart, UI, location ready to use

DAY 4 WILL BUILD:
  → Zustand stores finalization (cart, ui, location in detail)
  → API service layer (worker, category, booking services)
  → React Query hooks for server data
  → Home screen begins (top half: header + category grid)
  → The user's FIRST view after logging in
```

---

*Tasklync — Day 3 Implementation Plan*
*5 screens. 13 files. Complete auth flow.*
*Every UX law. Every micro-interaction. Zero code written here.*
*Pure thinking. Maximum clarity.*
