# Tasklync — Day 2 Implementation Plan
## Core UI Primitive Components · App Shell · Font System
### Senior React Native Expo | 25 Years Experience | Pure Implementation Plan

> **Zero code in this document.**
> Every decision is justified. Every micro-interaction is intentional.
> Every UX law is applied with specific reasoning — not decoratively.

---

## Day 2 Philosophy

```
"Components are the vocabulary of your product.
 A confused vocabulary = a confused product.
 A precise vocabulary = a precise experience."

Day 1 built the grammar (design tokens).
Day 2 builds the vocabulary (primitive components).

These 5 core files will be used 500+ times
across the next 58 days. Every pixel of care
invested today = 500× return in consistency.

RULE OF DAY 2:
  Every component must:
  1. Work in ALL states (idle, hover, pressed, loading, disabled, error)
  2. Be fully typed — zero 'any', zero optional shortcuts
  3. Consume ONLY design tokens — never hardcoded values
  4. Have haptic feedback where appropriate
  5. Run animations on UI thread (Reanimated 3 worklets)
  6. Be accessible (accessibilityLabel, accessibilityRole, accessibilityState)
```

---

## What Day 1 Gave Us (Prerequisites)

```
Day 2 depends entirely on Day 1 being complete.
Before starting any task today, verify:

FROM DAY 1 — MUST BE WORKING:
  ✅ @design/* alias resolves (colors, typography, spacing, etc.)
  ✅ @components/* alias resolves
  ✅ TypeScript strict mode — zero errors
  ✅ ESLint — zero warnings
  ✅ All font .ttf files in assets/fonts/ (14 files)
  ✅ All springConfig, timingConfig, shakeSequence exported
  ✅ All color tokens (colors.primary, colors.bgCard, etc.)
  ✅ All text style tokens (textStyles.h1, textStyles.body1, etc.)
  ✅ All layout constants (layout.primaryButtonH = 52, etc.)
  ✅ All radius tokens (radius.lg, radius.pill, radius.md, etc.)
  ✅ All shadow helpers (shadows.sm, shadows.md, etc.)

IF ANY ABOVE IS MISSING:
  Complete Day 1 first. Do not start Day 2.
  Building components on a broken token system
  creates debt that compounds across every screen.
```

---

## UX Laws Applied on Day 2

```
Today we build interaction primitives.
These are the components users touch hundreds of times.
Every UX law is directly, physically applied here.

┌─────────────────────────────────────────────────────────────────────┐
│  UX LAW              DAY 2 APPLICATION                              │
├─────────────────────────────────────────────────────────────────────┤
│  RECOGNITION         Text component: variant prop describes WHAT    │
│  OVER RECALL         the text IS, not HOW it looks.                 │
│                      Developer writes variant="h1"                  │
│                      Not: fontFamily="Poppins-Bold" fontSize={28}   │
│                                                                     │
│                      Button: variant="primary" not                  │
│                      bg="#16A34A" borderRadius={100}                │
│                                                                     │
│                      Floating label on input: label stays           │
│                      visible while typing = user never              │
│                      forgets what field they're filling.            │
├─────────────────────────────────────────────────────────────────────┤
│  FITTS' LAW          Button heights enforced at component level:     │
│                      size="lg" → exactly 52px (not negotiable)      │
│                      size="md" → exactly 44px                       │
│                      size="sm" → exactly 36px                       │
│                                                                     │
│                      IconButton: visual circle = 36px               │
│                      Touch target = min 44px always                 │
│                      The invisible padding extends the tap zone.    │
│                                                                     │
│                      Input field: 52px height = generous tap area   │
│                      Same height as primary button = visual rhythm  │
│                      Users hit it first try, every time.            │
├─────────────────────────────────────────────────────────────────────┤
│  HICK'S LAW          Button has 5 variants — all distinct,          │
│                      no overlap in use case.                        │
│                      Developer doesn't agonize which to use:        │
│                      primary = main CTA (one per screen)            │
│                      secondary = supporting action                  │
│                      ghost = low-emphasis action                    │
│                      danger = destructive action (red)              │
│                      text = link-style action                       │
│                                                                     │
│                      Each button size maps to one hierarchy:        │
│                      lg → primary CTAs only                         │
│                      md → secondary actions                         │
│                      sm → inline compact actions                    │
│                                                                     │
│                      Input type chosen per context — no decision:   │
│                      TextInput → general text fields                │
│                      PhoneInput → phone numbers only                │
│                      OTPInput → verification codes only             │
│                      SearchInput → search bars only                 │
├─────────────────────────────────────────────────────────────────────┤
│  JAKOB'S LAW         Button press animation = universal pattern      │
│                      Scale down (0.97) = every native app does this │
│                      Users expect it, they feel "wrong" without it  │
│                                                                     │
│                      OTP boxes = 6 separate boxes is universal      │
│                      WhatsApp, Google, every bank, every app        │
│                      Users have zero learning curve                 │
│                                                                     │
│                      Floating label = Material Design + iOS pattern │
│                      Users from Android AND iOS both know this      │
│                      Label floats up on focus = universal signal    │
│                                                                     │
│                      Input error = shake animation = universal      │
│                      Every major app shakes the field on error      │
│                      Users: "I know exactly what this means"        │
├─────────────────────────────────────────────────────────────────────┤
│  PEAK-END RULE       The Button release animation IS the peak of    │
│                      every micro-interaction in the app.            │
│                      scale 0.97 → 1.02 → 1.0 (bouncy spring)      │
│                      That overshoot is the "peak moment."           │
│                      Without it: functional but forgettable.        │
│                      With it: users say "this app feels premium."   │
│                                                                     │
│                      OTP success cascade = PEAK of auth flow        │
│                      Each box turns green + bounces sequentially    │
│                      40ms stagger between boxes = visual delight    │
│                      This peak = users remember the auth positively │
│                                                                     │
│                      Font loading complete → splash screen hides:   │
│                      That moment of "app appearing" is the          │
│                      first END moment user experiences              │
│                      It must feel instant — not jarring.            │
├─────────────────────────────────────────────────────────────────────┤
│  GOAL GRADIENT       Button loading state: user submitted form.     │
│  EFFECT              They're "almost at the goal."                  │
│                      Spinner shows: "system is working toward       │
│                      your goal too." Motivation stays high.         │
│                      Width stays constant: no reflow jarring.       │
│                                                                     │
│                      OTP 6 boxes: each digit filled = 1/6 closer   │
│                      Visual progress toward "get access" goal.      │
│                      That's why users complete OTP eagerly.         │
│                                                                     │
│                      Button "Continue" only enables when valid:     │
│                      Gray disabled → Green enabled = visual signal  │
│                      "You've made progress, you can proceed now"    │
├─────────────────────────────────────────────────────────────────────┤
│  SERIAL POSITION     Text variants ordered by visual weight:        │
│  EFFECT              display (heaviest) → h1 → h2 → ... → nano     │
│                      Most important text = first in developer's     │
│                      mental model. Same order in textStyles map.    │
│                                                                     │
│                      Button variants ordered by priority:           │
│                      primary (first) → secondary → ghost → danger → text
│                      Most used first in variant type definition.    │
│                                                                     │
│                      Input: label always shown ABOVE content        │
│                      First thing eye sees = "what this field is"    │
│                      Then value. Serial position: label then data.  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Typography in Components — Day 2 Reference

```
RULE: Each component maps to EXACTLY one font per text element.
No exceptions. No "I'll figure it out later."

COMPONENT → FONT MAPPING:

Button label:
  Poppins SemiBold — CTAs use brand voice
  "Book Now" in Poppins feels confident and warm
  "Book Now" in Jakarta feels generic and weak

Text variant="h1":
  Poppins Bold — screen titles demand brand presence

Text variant="body1", "body2":
  Plus Jakarta Sans Regular — readable, neutral body

Text variant="caption", "micro":
  Plus Jakarta Sans Regular/Medium — small but clear

TextInput value (what user types):
  Plus Jakarta Sans Regular — user's own text is neutral

TextInput label (floating label):
  Plus Jakarta Sans Medium — slightly heavier than body

OTPInput each digit:
  Inter Bold — digits are DATA. Financial-grade precision.
  22px Inter Bold = clear, unambiguous, matches bank OTP feel

Input error text:
  Plus Jakarta Sans Regular — gentle, not alarming font
  Red color carries the urgency, not the font weight

IconButton (no text)
  N/A — icon only, no font

Screen.tsx / StickyFooter.tsx:
  No text rendering — structural components only
```

---

## Day 2 — Time Breakdown

```
TOTAL: 8 hours

Morning Session (4h):
  Task 2.1 — Font loading system + Root Layout       60 min
  Task 2.2 — Text component (all variants)           45 min
  Task 2.3 — Button component (5 variants, 3 sizes)  75 min

Afternoon Session (4h):
  Task 2.4 — IconButton component                    30 min
  Task 2.5 — TextInput component (floating label)    75 min
  Task 2.6 — OTPInput component                      60 min
  Task 2.7 — Screen + StickyFooter layout shells     30 min
  Task 2.8 — Integration test + review               25 min
```

---

## Morning Session (4 Hours)

---

## Task 2.1 — Font Loading System + Root Layout
### Duration: 60 minutes
### Priority: CRITICAL — Nothing else works without fonts

---

### Why This Task Runs First

```
SERIAL POSITION EFFECT applied to task ordering:
  The FIRST task of Day 2 must be the most critical.
  Font loading is the prerequisite for every visual element.
  Text component built in Task 2.2 = useless without fonts.
  Button component = wrong typography without fonts.
  Everything downstream depends on fonts loading correctly.

PEAK-END RULE:
  The app's FIRST moment visible to the user after splash
  is the root layout rendering.
  If fonts flash in AFTER content = jarring, unprofessional.
  Fonts must be loaded BEFORE splash screen hides.
  That first moment must feel premium = users remember it.
```

---

### File 1: `src/config/fonts.ts`

```
PURPOSE:
  Central registry of all font assets.
  Maps font name strings → asset require() paths.
  Single source of truth for all 14 font files.

WHAT THIS FILE CONTAINS:

  fontAssets object with 14 entries:

  POPPINS (5 weights):
    'Poppins-Regular'    → assets/fonts/Poppins-Regular.ttf
    'Poppins-Medium'     → assets/fonts/Poppins-Medium.ttf
    'Poppins-SemiBold'   → assets/fonts/Poppins-SemiBold.ttf
    'Poppins-Bold'       → assets/fonts/Poppins-Bold.ttf
    'Poppins-ExtraBold'  → assets/fonts/Poppins-ExtraBold.ttf

  PLUS JAKARTA SANS (4 weights):
    'JakartaPlusSans-Regular'   → assets/fonts/PlusJakartaSans-Regular.ttf
    'JakartaPlusSans-Medium'    → assets/fonts/PlusJakartaSans-Medium.ttf
    'JakartaPlusSans-SemiBold'  → assets/fonts/PlusJakartaSans-SemiBold.ttf
    'JakartaPlusSans-Bold'      → assets/fonts/PlusJakartaSans-Bold.ttf

  INTER (5 weights):
    'Inter-Regular'    → assets/fonts/Inter-Regular.ttf
    'Inter-Medium'     → assets/fonts/Inter-Medium.ttf
    'Inter-SemiBold'   → assets/fonts/Inter-SemiBold.ttf
    'Inter-Bold'       → assets/fonts/Inter-Bold.ttf
    'Inter-ExtraBold'  → assets/fonts/Inter-ExtraBold.ttf

WHY CENTRALIZED:
  RECOGNITION OVER RECALL:
  Any developer adding a new component asks:
  "What's the exact string for Poppins Bold?"
  Answer: import { fontAssets } from '@config/fonts'
  and look at fontAssets['Poppins-Bold'].
  They don't need to remember 'Poppins-Bold' vs 'poppins-bold'
  vs 'PoppinsBold'. One source. Always correct.

TYPESCRIPT TYPE:
  Object typed as Record<string, any> — expo-font requires this.
  The key strings match exactly what typography.ts fontFamily references.
  Mismatch = font loads but doesn't apply = silent bug.
  Names must be identical between fonts.ts and typography.ts.

VERIFICATION RULE:
  Count of keys in fontAssets: must equal 14.
  Poppins: 5, Jakarta: 4, Inter: 5 = 14 total.
  If fewer: missing font = broken component somewhere.
```

---

### File 2: `app/_layout.tsx` (Root Layout)

```
PURPOSE:
  Root of the entire Expo Router app.
  Controls: font loading, provider wrapping, splash screen,
            navigation shell, status bar, screen options.
  Every screen in the app renders inside this file.

WHAT THIS FILE DOES — IN ORDER:

  STEP 1: Font loading
    useFonts(fontAssets) from expo-font
    Loads all 14 font files before rendering children
    Returns: [fontsLoaded: boolean, fontError: Error | null]

  STEP 2: Splash screen control
    SplashScreen.preventAutoHideAsync() called at module level
    (Before component renders — prevents flash)
    When fontsLoaded OR fontError: SplashScreen.hideAsync()

    PEAK-END RULE:
    The transition from splash to app = first memorable moment.
    If fonts not loaded: text renders with system font first,
    then re-renders with Poppins = visible flash = bad first impression.
    SplashScreen stays visible until fonts ready = perfect first moment.

  STEP 3: Loading state
    While fonts loading and no error: return null
    (Splash screen is showing, user sees that, not blank white)

  STEP 4: Provider wrapping (order is critical)
    Providers wrap each other in this exact order (outer → inner):
    GestureHandlerRootView  → Must be absolute outermost
    SafeAreaProvider        → Must wrap everything for insets
    QueryClientProvider     → React Query for server state
    AppProviders            → All custom providers

    WHY ORDER MATTERS:
    GestureHandlerRootView outermost = gestures work globally
    SafeAreaProvider next = insets available to all children
    QueryClient then custom = custom providers can use RQ internally

  STEP 5: Stack navigator configuration
    Stack with these specific screen options:
    headerShown: false (all screens use custom headers)
    animation per route:

    (auth) screens:
      animation: 'fade' — onboarding slides in gently
      No slide from right (there's no "back" concept in auth)

    (tabs) screens:
      animation: 'fade' — tab switch feels instant, not directional
      gestureEnabled: false — tabs don't slide away

    (map)/live-map:
      animation: 'slide_from_bottom' — map rises from bottom
      gestureEnabled: true — swipe down to dismiss map

    worker/[id]:
      animation: 'slide_from_right' — standard push navigation

    booking/[id]/chat:
      animation: 'slide_from_right' — consistent with worker push

    booking/success:
      animation: 'slide_from_bottom' — celebration rising up
      gestureEnabled: false — user cannot swipe away success

    booking/[id]/track:
      animation: 'slide_from_bottom' — map rises like live-map

    WHY THESE ANIMATIONS:
    JAKOB'S LAW: slide_from_right = go deeper in hierarchy
    slide_from_bottom = new context, not hierarchy
    fade = same-level switch (tabs)
    Users read these animations like spatial cues.
    Correct animation = user knows where they are without thinking.

FILE STRUCTURE BREAKDOWN:

  Imports needed:
    useEffect from react
    useFonts from expo-font
    Stack from expo-router
    SplashScreen from expo-splash-screen
    GestureHandlerRootView from react-native-gesture-handler
    SafeAreaProvider from react-native-safe-area-context
    QueryClientProvider from @tanstack/react-query
    fontAssets from @config/fonts
    queryClient from @config/queryClient
    AppProviders from @providers/AppProviders

  Module-level call:
    SplashScreen.preventAutoHideAsync()
    Must run at module level, not inside component
    If inside component: might run after first render = flash

  Component logic:
    useFonts hook
    useEffect watching [fontsLoaded, fontError]
    Early return null while loading
    Full JSX tree when ready

  Status bar:
    Each screen manages its own StatusBar
    Root layout does NOT set a global status bar style
    Why: some screens need light content (map, dark hero)
         some need dark content (white card screens)
```

---

### File 3: `src/config/queryClient.ts`

```
PURPOSE:
  React Query client configuration.
  Used by QueryClientProvider in root layout.

WHAT IT CONFIGURES:

  Default query options:
    staleTime: 30_000 (30 seconds)
    → Data is considered fresh for 30s
    → No redundant refetches if navigating back quickly
    → User goes Home → Worker Profile → Home: no refetch

    gcTime: 300_000 (5 minutes)
    → Cache kept in memory for 5 min after component unmounts
    → User navigates away and back: instant from cache
    → Balances memory usage vs speed

    retry: 2
    → Failed queries retry twice before showing error
    → 1st retry: covers transient network hiccup
    → 2nd retry: covers slow backend startup
    → 3rd fail: show error (user should know something's wrong)

    retryDelay: exponential backoff (1s, 2s, max 10s)
    → Don't hammer a struggling server
    → User sees loading for a moment, then either data or error

    networkMode: 'offlineFirst'
    → Cached data shown immediately even offline
    → Query marked stale but not errored while offline
    → When network returns: background refetch
    → User experience: app feels fast even on poor connection

    refetchOnWindowFocus: false
    → Mobile doesn't have "window focus" concept
    → App coming to foreground is handled separately via useAppState hook
    → Default true would cause confusing refetches on mobile

  Default mutation options:
    retry: 0
    → Mutations never auto-retry (user actions are explicit)
    → A failed booking creation should NOT silently retry
    → User must explicitly trigger retry (prevents double bookings)

    networkMode: 'offlineFirst'
    → Allow mutation queueing when offline
    → With optimistic updates: feels instant regardless

WHY THIS MATTERS FOR UX:
  staleTime 30s = no loading spinners when navigating between screens
  gcTime 5min = no loading on back navigation
  networkMode offlineFirst = Pakistan mobile network conditions handled
  These configs make the app FEEL fast without changing any screen code.
```

---

### File 4: `src/providers/AppProviders.tsx`

```
PURPOSE:
  Composes all custom providers into one wrapper.
  Root layout imports AppProviders, not individual providers.
  Single import = simpler root layout = cleaner architecture.

HICK'S LAW:
  Root layout should make zero decisions about providers.
  Decision is made here, once, definitionally.
  New provider added: only AppProviders.tsx changes.
  Root layout stays untouched.

PROVIDERS INCLUDED (in order, outer to inner):
  AuthProvider
  → Must be outermost custom provider
  → Route guard runs here (redirect logic)
  → All screens need auth state to render correctly

  SocketProvider
  → Inside AuthProvider (needs auth token to connect socket)
  → Outside all feature providers (chat, tracking need socket)

  NotificationProvider
  → Inside AuthProvider (needs user ID for FCM registration)
  → Manages push notification listeners

  ToastProvider
  → Innermost provider — renders the Toast component
  → Must be inside all others so toasts can overlay everything
  → Shows above modals, bottom sheets, everything

WHAT EACH PROVIDER DOES (high-level, not implementation):

  AuthProvider:
    On mount: reads tokens from MMKV/SecureStore
    Hydrates auth.store with persisted tokens
    Sets up route guard logic (isAuthenticated → redirect)
    Does NOT make API calls (auth.store handles that)

  SocketProvider:
    Creates Socket.IO connection using auth token
    Manages connection lifecycle (connect, disconnect, reconnect)
    Reconnects on app foreground (via useAppState)
    Provides socket instance via React context
    Cleans up on logout

  NotificationProvider:
    Requests notification permission (on first launch)
    Registers FCM token with backend
    Sets up foreground notification handler
    Sets up background notification handler
    Deep link routing from notification taps

  ToastProvider:
    Consumes ui.store.toasts array
    Renders one Toast at a time (Hick's Law: one message at a time)
    Manages enter/exit animations for toasts
    Queues multiple toasts (shows next after current dismisses)
```

---

## Task 2.2 — Text Component
### Duration: 45 minutes
### File: `src/components/ui/Text/Text.tsx`

---

### Why a Custom Text Component

```
RECOGNITION OVER RECALL:
  Without custom Text:
    <RNText style={{ fontFamily: 'Poppins-Bold', fontSize: 28,
    lineHeight: 36, letterSpacing: -0.5, color: '#0F172A' }}>
    → Developer must remember ALL values. Error-prone. Inconsistent.

  With custom Text:
    <Text variant="h1">Title</Text>
    → Zero values to remember. Variant name = intent.
    → Guaranteed consistency across all 37 screens.

SERIAL POSITION EFFECT:
  The variant prop list ordered by visual weight:
  display → h1 → h2 → h3 → h4 → body1 → body2 →
  label → caption → micro → nano → dataXL → ... → dataXS
  Most visually impactful first. Most commonly used near top.

JAKOB'S LAW:
  variant prop = industry standard (Material UI, Chakra, etc.)
  Every senior developer recognizes this pattern.
  No learning curve.
```

---

### Component Specification

```
COMPONENT NAME: Text
FILE: src/components/ui/Text/Text.tsx
EXPORTS: named export Text, re-exported from index.ts

PROPS INTERFACE:
  variant         → 'display' | 'h1' | 'h2' | 'h3' | 'h4' |
                    'body1' | 'body2' | 'label' | 'caption' |
                    'micro' | 'nano' |
                    'dataXL' | 'dataLG' | 'dataMD' | 'dataSM' | 'dataXS'
                    DEFAULT: 'body1'

  color           → Semantic color key OR hex string
                    Options: 'primary' | 'secondary' | 'muted' |
                    'disabled' | 'onGreen' | 'green' | 'danger' | 'warning'
                    DEFAULT: context-appropriate (body2 → secondary)

  align           → 'left' | 'center' | 'right'
                    DEFAULT: 'left'

  numberOfLines   → number (for truncation)
                    DEFAULT: undefined (unlimited)

  style           → ViewStyle override (use sparingly — tokens cover 95%)

  children        → React.ReactNode (required)

  ALL RNTextProps except style → spread to underlying RNText

INTERNAL LOGIC:

  Color resolution:
    Input: 'primary' → resolve → colors.textPrimary (#0F172A)
    Input: 'secondary' → resolve → colors.textSecondary (#475569)
    Input: 'muted' → resolve → colors.textMuted (#94A3B8)
    Input: 'disabled' → resolve → colors.textDisabled (#CBD5E1)
    Input: 'onGreen' → resolve → colors.textOnGreen (#FFFFFF)
    Input: 'green' → resolve → colors.textGreen (#15803D)
    Input: 'danger' → resolve → colors.textDanger (#EF4444)
    Input: 'warning' → resolve → colors.textWarning (#92400E)
    Input: any hex string → used directly (escape hatch)

  Style composition:
    1. textStyles[variant] (base style from design tokens)
    2. { color: resolvedColor } (overrides token color)
    3. align ? { textAlign: align } : undefined
    4. style prop (user override, applied last)
    Applied with StyleSheet.flatten or array spread

  Font size multiplier:
    maxFontSizeMultiplier: 1.3
    Why: Allows accessibility scaling up to 30% above normal
    Without limit: large font users break every layout
    With 1.3: readable at accessibility sizes, layouts stay intact

MICRO-INTENTION:
  This component has NO animation, NO interaction.
  Its "micro-intention" is SILENCE — it never draws attention to itself.
  Text that animates when not needed = cognitive noise.
  Text purpose: carry information to the eye as efficiently as possible.

TYPOGRAPHY ASSIGNMENTS PER VARIANT:

  display  → Poppins Bold, 36px, lineHeight 44, letterSpacing -0.5
             Use: hero numbers on success screens, large stats
             Example: "12" on "You have 12 bookings" hero card

  h1       → Poppins Bold, 28px, lineHeight 36, letterSpacing -0.4
             Use: screen title (one per screen)
             Example: "Enter your phone number"

  h2       → Poppins Bold, 22px, lineHeight 30, letterSpacing -0.3
             Use: section headers, bottom sheet titles
             Example: "Services Near You", "Filter Workers"

  h3       → Poppins SemiBold, 18px, lineHeight 26, letterSpacing -0.2
             Use: card titles, drawer section headers
             Example: "Ahmed Khan", "Fan Installation"

  h4       → Poppins SemiBold, 16px, lineHeight 22, letterSpacing -0.1
             Use: sub-headings within sections
             Example: "Available Now", "Booking Summary"

  body1    → Jakarta Regular, 16px, lineHeight 24
             Use: primary body text, main descriptions
             Example: Worker bio, service description

  body2    → Jakarta Regular, 14px, lineHeight 20
             Use: secondary descriptions, card meta
             Example: "Experienced electrician with 8+ years"

  label    → Jakarta Medium, 14px, lineHeight 20
             Use: form field labels, tab labels, menu items
             Example: "Phone Number", "Home", "Bookings"

  caption  → Jakarta Regular, 12px, lineHeight 18
             Use: timestamps, metadata, helper text
             Example: "2 min ago", "Jan 16 · 10:00 AM"

  micro    → Jakarta Medium, 11px, lineHeight 16, letterSpacing 0.2
             Use: chip labels, badge text, tag labels
             Example: "VERIFIED", "Plumber", "NEW"

  nano     → Jakarta SemiBold, 10px, lineHeight 14, letterSpacing 0.5
             Use: status dots labels, smallest possible text
             Example: status abbreviations

  dataXL   → Inter Bold, 28px, lineHeight 36
             Use: large prices, key stat numbers
             Example: "Rs 1,840", "4.9" (large rating display)

  dataLG   → Inter Bold, 20px, lineHeight 28
             Use: section prices, key metrics
             Example: "Rs 500/hr", "340 jobs"

  dataMD   → Inter SemiBold, 16px, lineHeight 22
             Use: inline prices, ratings in cards
             Example: "Rs 600", "4.8"

  dataSM   → Inter Medium, 13px, lineHeight 18
             Use: small prices, distances, ETAs
             Example: "1.2 km", "~8 min", "Rs 400"

  dataXS   → Inter Regular, 11px, lineHeight 16
             Use: receipt numbers, booking IDs, fine print numbers
             Example: "#TL-20451", "01/25"

WHAT TO WATCH FOR:
  Data variants (dataXL, dataLG, etc.) use Inter
  All other variants split between Poppins and Jakarta
  NEVER mix: don't put a price in body1 (Jakarta font looks wrong)
  NEVER mix: don't put a heading in dataMD (Inter for non-numbers is off)
```

---

### File: `src/components/ui/Text/index.ts`

```
PURPOSE: Barrel export
EXPORTS: { Text }
ALLOWS: import { Text } from '@components/ui/Text'
```

---

## Task 2.3 — Button Component
### Duration: 75 minutes
### File: `src/components/ui/Button/Button.tsx`

---

### Why Button is the Most Critical Component

```
PEAK-END RULE:
  Every primary user action ends with a button tap.
  Booking, Payment, OTP verify, Log In, Submit.
  The button tap = END moment of every user flow.
  If the button tap feels wrong, EVERY flow feels wrong.
  If it feels premium, every flow feels premium.

  The press animation is the most important animation
  in the entire app. More important than the success screen.
  Because users press buttons 100× more than they see success screens.

FITTS' LAW:
  Button is where Fitts' Law has the highest ROI.
  Size matters here more than anywhere else.
  52px primary button = maximum tap success rate.
  Users press it right every single time.
  They may not notice the size. But they notice when it fails.
```

---

### Component Specification

```
COMPONENT NAME: Button
FILE: src/components/ui/Button/Button.tsx
EXPORTS: named export Button

VISUAL STATES (must all be designed, all be distinct):
  idle        → Normal appearance, ready to press
  hovered     → (iOS: long press start) — subtle bg shift
  pressed     → scale 0.97 + shadow reduces + bg darkens
  releasing   → scale 0.97 → 1.02 → 1.0 (bouncy spring)
  loading     → Label hidden, spinner visible, width locked
  disabled    → Reduced opacity, no press animation
  success     → Spinner → checkmark, brief hold then navigate

PROPS INTERFACE:
  label          → string (required)
  onPress        → () => void (required)
  variant        → 'primary' | 'secondary' | 'ghost' | 'danger' | 'text'
                   DEFAULT: 'primary'
  size           → 'lg' | 'md' | 'sm'
                   DEFAULT: 'lg'
  disabled       → boolean DEFAULT: false
  loading        → boolean DEFAULT: false
  icon           → LucideIcon component (optional)
  iconPosition   → 'left' | 'right' DEFAULT: 'left'
  fullWidth      → boolean DEFAULT: true
  style          → ViewStyle (override, use sparingly)
  haptic         → 'light' | 'medium' | 'heavy' | 'none' DEFAULT: 'medium'

VARIANT VISUAL SPECIFICATIONS:

  primary:
    Idle:      BG #16A34A, label white, shadow-sm
    Pressed:   BG #15803D, shadow near-flat
    Released:  BG returns to #16A34A, shadow-sm returns
    Disabled:  BG #86EFAC (green-300), label #14532D at 50% opacity
    Loading:   BG #16A34A, spinner white
    Font:      Poppins SemiBold (brand voice for CTAs)
    Use:       ONE per screen. The main conversion action.
    Examples:  "Book Now", "Confirm Booking", "Pay Rs 1,840"

  secondary:
    Idle:      BG transparent, border 1.5px #16A34A, label green
    Pressed:   BG #F0FDF4 (green tint), border stays
    Released:  BG transparent returns
    Disabled:  border #86EFAC, label #86EFAC
    Loading:   spinner green
    Font:      Poppins SemiBold
    Use:       Supporting action alongside primary
    Examples:  "Chat with Worker", "View Details", "Save Address"

  ghost:
    Idle:      BG #F4F5F7, no border, label #0F172A
    Pressed:   BG #E9EAEC
    Released:  BG #F4F5F7 returns
    Disabled:  Opacity 0.5
    Font:      Plus Jakarta Sans Medium
    Use:       Low-emphasis actions, filter toggles
    Examples:  "Cancel", "Skip", "Not Now"

  danger:
    Idle:      BG #EF4444, label white, shadow-sm
    Pressed:   BG #DC2626
    Released:  BG #EF4444 returns
    Disabled:  BG #FCA5A5
    Font:      Poppins SemiBold
    Use:       Destructive actions only
    Examples:  "Cancel Booking", "Delete Account", "Remove Card"
    RULE: Only one danger button per flow. Never paired with primary.

  text:
    Idle:      BG transparent, no border, label green
    Pressed:   Label darkens slightly (opacity 0.7)
    Disabled:  Opacity 0.4
    Font:      Plus Jakarta Sans Medium
    Use:       Link-style inline actions, secondary footer links
    Examples:  "Back to Home", "Skip for now", "Forgot password?"

SIZE SPECIFICATIONS (Fitts' Law enforced):

  lg (large):
    Height:          52px (layout.primaryButtonH from tokens)
    Padding H:       20px
    Font size:       16px
    Icon size:       18px
    Icon-text gap:   8px
    Border radius:   radius.pill (100px)
    Use:             Primary CTAs in StickyFooter
    Touch target:    Full width (44px minimum always met)

  md (medium):
    Height:          44px (layout.secondaryButtonH)
    Padding H:       18px
    Font size:       14px
    Icon size:       16px
    Icon-text gap:   6px
    Border radius:   radius.pill
    Use:             Secondary actions, card buttons
    Touch target:    Must verify min 44px height is maintained

  sm (small):
    Height:          36px (layout.compactButtonH)
    Padding H:       14px
    Font size:       13px
    Icon size:       14px
    Icon-text gap:   5px
    Border radius:   radius.pill
    Use:             ONLY for inline compact actions
    Touch target:    36px visual, extends to 44px tap area via hitSlop

ANIMATION SPECIFICATION:

  Press animation (Reanimated 3 — UI thread only):
    Shared value: scale (initial: 1.0)
    Shared value: (background handled via animated style)

    onPressIn:
      scale → withSpring(0.97, springConfig.stiff)
      → stiff spring = instant response = "I got your tap"
      → Feels like pressing a physical button

    onPressOut:
      scale → withSpring(1.0, springConfig.bouncy)
      → bouncy spring = overshoot to 1.02 then settle at 1.0
      → This overshoot = THE PEAK MOMENT (Peak-End Rule)
      → Users feel it more than they consciously see it

    Loading transition:
      Label → opacity withTiming(0, { duration: 150ms })
      Spinner → opacity withTiming(1, { duration: 150ms })
      Width: LOCKED (no layout shift) — width: locked before loading
      Why: Width changing during load is deeply jarring
      Button must appear same size in all states

    Disabled state:
      NO animation on pressIn/pressOut
      Opacity: 1.0 but bg is muted (not opacity of whole button)
      Why opacity of bg not button:
        If whole button is 0.5 opacity → shadow also fades
        Looks broken/incomplete
        Individual color muting looks intentional and designed

HAPTIC FEEDBACK PLAN:

  primary button onPress: medium impact
    → Most important action = most noticeable feedback
    → "This was significant, the system registered it"

  secondary button onPress: light impact
    → Supporting action = lighter confirmation
    → "Noted, but secondary in importance"

  ghost button onPress: light impact
    → Same as secondary

  danger button onPress: medium impact
    → Destructive = user should feel the weight of the action

  text button onPress: selection (lightest)
    → Link-style = minimal feedback

  disabled state: NO haptic
    → Pressing disabled button = nothing happened = silence
    → Haptic would mislead: "something registered" = wrong signal

  loading state: NO haptic
    → Tap already triggered haptic before loading started

LOADING STATE DETAILS:

  Trigger: loading prop = true
  Label: fades out (150ms opacity transition)
  Spinner: fades in (150ms, delayed 50ms after label fades)
  Why delay: visual cross-fade feels smoother than simultaneous swap
  Spinner: ActivityIndicator, matches label color
  Width: button width captured and locked with fixed width
  Why: FlatList re-render during loading could resize button
  The lock prevents jarring layout shift

ICON HANDLING:

  Icon is optional LucideIcon (or any icon component)
  iconPosition: 'left' → icon | gap | label
  iconPosition: 'right' → label | gap | icon
  Icon size = function of button size (18 / 16 / 14px)
  Icon color = matches label color (inherits from variant)

  When loading = true:
    Both icon AND label hidden
    Only spinner shown
    Icon does not appear alongside spinner (too busy)

ACCESSIBILITY:

  accessibilityRole: 'button'
  accessibilityLabel: label prop value
  accessibilityState: { disabled: isDisabled, busy: loading }
  Why 'busy' not 'disabled' for loading:
    busy = "working on your request"
    disabled = "cannot perform action"
    Semantically different — screen readers speak these differently

CRITICAL GOTCHA:
  Animated.createAnimatedComponent(Pressable) must be used.
  NOT Animated.View wrapping a Pressable.
  If Animated.View wraps Pressable: the animation plays but
  the touch area does not scale with the view.
  Result: press registering outside visual button area.
  Use AnimatedPressable (Animated.createAnimatedComponent result).
```

---

### File: `src/components/ui/Button/index.ts`

```
PURPOSE: Barrel export
EXPORTS: { Button, IconButton, FAB }
FAB: placeholder export (to be built Day 7 when Home screen needs it)
ALLOWS: import { Button } from '@components/ui/Button'
```

---

## Task 2.4 — IconButton Component
### Duration: 30 minutes
### File: `src/components/ui/Button/IconButton.tsx`

---

### Component Specification

```
COMPONENT NAME: IconButton
PURPOSE: Circle icon button for header actions, quick actions
EXAMPLES: Back arrow, share, more (⋯), notification bell, close (×)

FITTS' LAW — THE CORE REASON THIS COMPONENT EXISTS:
  Without IconButton:
    <Pressable>
      <Icon size={20} />
    </Pressable>
    Touch target = exactly 20px = terrible = misses constantly

  With IconButton:
    <IconButton icon={ChevronLeft} size={36} />
    Visual circle = 36px
    Touch target = min 44px (invisible padding extends it)
    Users hit it every time

PROPS INTERFACE:
  icon             → LucideIcon component (required)
  onPress          → () => void (required)
  size             → number DEFAULT: 40 (visual circle diameter)
  iconSize         → number DEFAULT: 20
  color            → string DEFAULT: colors.textSecondary
  bg               → string DEFAULT: colors.bgInput
  bgPressed        → string DEFAULT: '#E9EAEC'
  style            → ViewStyle (optional override)
  accessibilityLabel → string (REQUIRED — no icon has inherent meaning)
  disabled         → boolean DEFAULT: false

SIZE LOGIC:
  Touch area = max(44, size) × max(44, size)
  Visual circle = size × size
  Visual circle centered inside touch area
  RESULT: Even a 32px visual button has 44px touch area

VISUAL SPECIFICATION:
  Idle:    Circle bg = colors.bgInput (#F4F5F7)
  Pressed: Circle bg = bgPressed (#E9EAEC)
  Scale:   1.0 → 0.90 on pressIn (springConfig.stiff)
  Scale:   0.90 → 1.05 → 1.0 on pressOut (springConfig.bouncy)
  Haptic:  light impact on press

ANIMATION APPROACH:
  Shared value: scale
  Shared value: backgroundColor (interpolated between idle/pressed)
  Both animated in Reanimated worklet (UI thread only)
  Background color interpolation = smooth press feedback
  Scale = tactile press feel

VARIANTS NOT NEEDED:
  IconButton has one purpose: icon in circle
  No size variants needed (size prop handles all cases)
  No color variants needed (color + bg props handle all cases)
  HICK'S LAW: fewer props = faster decision per usage

COMMON USAGE PATTERNS:
  Back button:
    icon={ChevronLeft}, size=40, bg=colors.bgCard
    accessibilityLabel="Go back"

  Close button:
    icon={X}, size=36, bg=colors.bgInput
    accessibilityLabel="Close"

  Share button:
    icon={Share2}, size=40, bg=colors.bgInput
    accessibilityLabel="Share worker profile"

  More options:
    icon={MoreHorizontal}, size=40, bg=colors.bgInput
    accessibilityLabel="More options"

  Notification bell (special — has badge):
    Built as NotificationBell.tsx (not IconButton)
    Uses IconButton internally but adds badge on top
```

---

## Afternoon Session (4 Hours)

---

## Task 2.5 — TextInput Component
### Duration: 75 minutes
### File: `src/components/ui/Input/TextInput.tsx`

---

### Why TextInput Is the Day's Most Complex Component

```
TextInput has MORE states than any other primitive:
  idle (empty, unfocused)
  focused (empty, keyboard visible)
  focused + filled (typing in progress)
  filled (unfocused, has value)
  error (validation failed)
  disabled (cannot edit)
  success (validation passed — optional green)

RECOGNITION OVER RECALL (floating label):
  Problem: User focuses field. Placeholder disappears.
  User: "What was this field for again?"
  Visible: empty input, no context.

  Solution: Floating label
  When field focused OR has value:
    Label MOVES from inside field to ABOVE field
    The placeholder becomes a persistent label
  Result: User ALWAYS sees what field they're filling
  → Recognition (label visible) replaces Recall (remember placeholder)

  This pattern is from Material Design (Google's HIG).
  Jakob's Law: Android users expect this. iOS users find it intuitive.
  Cross-platform comfort = zero learning curve.

MICRO-INTENTIONS IN FORM FIELDS:
  Each state change carries intention:

  Focus = "Welcome, I'm ready for your input"
    Border animates: gray → green (1.5px, 200ms)
    Label floats: translateY 0 → -22px (spring snappy)
    Background: #F4F5F7 → #FFFFFF (200ms)
    Haptic: none (would feel intrusive on every focus)

  Error = "Something is wrong HERE, specifically"
    Border: → red (immediate)
    Input shakes: horizontal shake sequence (Reanimated)
    Error text slides down (height 0 → auto, 200ms)
    Haptic: error notification
    Why shake: JAKOB'S LAW — users know shake = error
    Why on the specific input: FITTS' LAW — error must point to location

  Success = "This looks correct"
    Border: → green (200ms)
    Checkmark icon fades in (right side)
    No haptic (would be too many signals)

  Blur + Filled = "I have your input safely"
    Border: gray (lighter than focus)
    Label stays floating (value present = label stays up)
    Background: #FFFFFF (stays white, was typing recently)

  Disable = "I'm here but not accepting input"
    Opacity of text/border: 0.5
    Background: stays #F4F5F7
    Cursor: not shown
    No animations respond to press
```

---

### Component Specification

```
COMPONENT NAME: TextInput
UNDERLYING: RNTextInput from react-native

PROPS INTERFACE:
  label            → string (optional — floats on focus/fill)
  error            → string (optional — shows below on error)
  hint             → string (optional — shows below when no error)
  leftIcon         → LucideIcon (optional — left of input)
  rightIcon        → LucideIcon (optional — right of input)
  onRightIconPress → () => void (optional — right icon tap handler)
  containerStyle   → ViewStyle (outer container override)
  inputStyle       → ViewStyle (inner RNTextInput override)
  value            → string (required for controlled)
  onChangeText     → (text: string) => void
  ...all RNTextInputProps spread through

ALL STANDARD RNTextInput PROPS SUPPORTED:
  keyboardType, returnKeyType, placeholder, secureTextEntry,
  autoCapitalize, autoCorrect, editable, multiline, etc.

ANIMATION COMPONENTS:
  Animated label text (translateY + scale)
  Animated container (borderColor + backgroundColor)
  Animated shake (translateX for error)
  All via Reanimated 3 useAnimatedStyle / useSharedValue

FLOATING LABEL ANIMATION DETAIL:

  Shared value: labelProgress (0 = inside, 1 = floated)
  Shared value: borderProgress (0 = idle, 1 = focused)
  Shared value: shakeX (0 normally, runs shake sequence on error)

  Label float:
    translateY: 0 → -22px (interpolated from labelProgress)
    scale: 1.0 → 0.85 (makes label smaller when floated)
    color: muted → green (interpolated based on focused state)
    transformOrigin: 'left center' (scales from left edge, not center)
    Why: Scale from center would move label horizontally while scaling
    Left-origin scale = stays aligned with field left edge

  isFloated condition:
    isFocused === true
    OR value?.length > 0
    = Label stays up when field has content, even unfocused

  Border animation:
    interpolateColor(borderProgress.value, [0,1], [idle, focused])
    Error overrides: borderProgress animation stops, border goes red
    The animated border reveals focus state without requiring attention

ICON HANDLING:
  leftIcon: shown always (permanent context like phone icon in phone field)
  rightIcon: shown always OR conditionally
    Common conditional: clear button (only when value exists)
    SearchInput uses this: rightIcon={X} only when query typed

  Icon colors match border:
    idle: colors.textMuted
    focused: colors.primary
    error: colors.danger
    disabled: colors.textDisabled

ERROR STATE DETAIL:
  Error prop: string | undefined
  When error appears:
    1. Border goes red (interpolateColor)
    2. shakeX triggers: withSequence(...shakeConfig)
    3. Error text slides down: AnimatedView height 0 → auto
    4. Haptic: notificationAsync(Error)
    5. Label color → danger

  Error text below field:
    12px Jakarta Regular, colors.danger
    Slides down with spring (not instant — too jarring if instant)
    When error clears: slides back up (spring reverse)

  Why shake happens on specific input not whole form:
    FITTS' LAW applied to feedback:
    The further feedback is from the source of error,
    the more effort user needs to connect them.
    Shake on the input = error is immediately, spatially located.

KEYBOARD BEHAVIOR:
  Component does NOT manage KeyboardAvoidingView
  That's Screen or KeyboardAware layout responsibility
  TextInput focuses on its own visual state only
  HICK'S LAW: single responsibility = single job

ACCESSIBILITY:
  accessibilityLabel: label prop or placeholder prop
  accessibilityHint: hint prop (what user should type)
  accessibilityState: { disabled: editable === false }
  ref: forwarded (allows parent to call .focus(), .blur())
```

---

## Task 2.6 — OTPInput Component
### Duration: 60 minutes
### File: `src/components/ui/Input/OTPInput.tsx`

---

### Why OTPInput Is a Separate Component

```
JAKOB'S LAW — The most important decision made here:
  6 separate boxes = universal OTP pattern
  Every bank app, every messaging app, every 2FA screen
  uses this exact visual pattern.

  Alternative: Single input field with large text
  → Technically works
  → Feels completely wrong to users
  → Users expect 6 boxes → anything else feels broken
  → Zero reason to deviate from the universal pattern

HICK'S LAW:
  User opens OTP screen, sees 6 boxes.
  Decision: zero. They know exactly what to do.
  They've done this on WhatsApp, Gmail, every bank.
  Cognitive load = 0. (Recall replaced by Recognition)
```

---

### Component Specification

```
COMPONENT NAME: OTPInput
FILE: src/components/ui/Input/OTPInput.tsx

PROPS INTERFACE:
  value       → string (controlled — up to 6 digits)
  onChange    → (value: string) => void
  onComplete  → (value: string) => void (fires when all 6 filled)
  error       → boolean DEFAULT: false
  success     → boolean DEFAULT: false
  disabled    → boolean DEFAULT: false
  length      → number DEFAULT: 6 (configurable but 6 is standard)

INTERNAL STRUCTURE:
  6 individual RNTextInput components (refs array)
  6 AnimatedView containers (one per box)
  One shared style logic, applied per box with state variants

PER-BOX STATE:
  empty + inactive: BG #F4F5F7, border transparent (2px)
  empty + active: BG #FFFFFF, border green (2px), scale 1.06
  filled + active: BG #FFFFFF, border green (2px), scale 1.0
  filled + inactive: BG #FFFFFF, border #E2E8F0 (2px)
  error: BG #FFFFFF, border red (2px) — ALL boxes turn red simultaneously
  success: BG #F0FDF4, border green (2px) — ALL boxes turn green

BOX DIMENSIONS:
  Width: 50px (or (screenWidth - 32 - 50) / 6 for dynamic)
  Height: 58px
  BorderRadius: radius.md (12px)
  Gap between boxes: 10px
  Total width at 375px: 6×50 + 5×10 = 350px (fits with 16px margins)

FONT SPECIFICATION:
  Inter Bold, 22px, textAlign: 'center'
  Why Inter: Digits are DATA. Inter at 22px bold = perfectly clear.
  Why 22px: Large enough to see immediately, small enough to fit

CURSOR:
  caretHidden: true
  Why: Individual box inputs look cleanest without visible cursors
  The active box's border/scale change IS the cursor signal

INTERACTION FLOW:

  STEP 1 — Mount:
    Focus ref[0] automatically (first box)
    Delay 100ms: prevents race with keyboard animation

  STEP 2 — User types digit in box N:
    Sanitize: only digits (0-9), max 1 character
    Store digit in box N
    Scale animation on box N: 1.0 → 1.06 → 1.0 (bouncy)
    Haptic: selectionAsync
    Auto-advance: focus ref[N+1]
    If N was box 5 (last): call onComplete

  STEP 3 — User types backspace in box N:
    If box N has digit: clear box N only, stay on N
    If box N is empty: clear box N-1, focus ref[N-1]
    Haptic: selectionAsync

  STEP 4 — User pastes full OTP:
    Detect: text.length > 1 on any box
    Extract: first 6 digits from pasted string
    Fill all boxes
    Haptic: successAsync (paste = meaningful action)
    If 6 digits complete: call onComplete

  STEP 5 — Error state (error=true):
    All 6 boxes: border → red simultaneously
    All 6 boxes: shake animation (synchronized)
    Why synchronized: they shake as ONE UNIT
    Individual box shake = confusing (which one is wrong?)
    Group shake = "the whole code is wrong, try again"
    Haptic: notificationAsync(Error)
    Clear all boxes after 600ms
    Re-focus box 0

  STEP 6 — Success state (success=true):
    All 6 boxes turn green
    Sequential bounce: box 0, then 1, then 2, then 3, then 4, then 5
    Stagger: 40ms between each box
    Each box: scale 1.0 → 1.08 → 1.0 (bouncy spring)
    WHY THIS IS THE PEAK MOMENT (Peak-End Rule):
    The sequential cascade across 6 boxes = visual delight
    It's fast (240ms total) but deeply satisfying
    Users subconsciously enjoy this = positive auth memory
    Haptic: notificationAsync(Success)
    After 300ms: caller handles navigation

FOCUS MANAGEMENT:
  refs = Array of 6 RNTextInput refs
  Active box = refs[currentIndex].focus()
  currentIndex = Math.min(value.length, length - 1)
  When error clears and value resets: refs[0].focus()

SHAKE ANIMATION DETAIL:
  Uses shakeSequence from animations.ts: [-8, 8, -6, 6, -4, 4, 0]
  withSequence(...shakeSequence.map(x => withTiming(x, {duration: 45})))
  ALL 6 shakeX shared values receive same animation at same time
  Result: unit-level shake, not individual box chaos

PASTE DETECTION:
  RNTextInput onChangeText fires with full pasted string
  Detect: text.replace(/[^0-9]/g, '').length > 1
  Extract: sanitized.slice(0, length)
  Distribute: each character to each box ref

ACCESSIBILITY:
  accessibilityLabel: "One-time password digit N of 6"
  keyboardType: 'number-pad'
  textContentType: 'oneTimeCode' (iOS: auto-suggests OTP from SMS)
  autoComplete: 'sms-otp' (Android: auto-suggests from SMS)
  WHY textContentType AND autoComplete:
    iOS: reads SMS, suggests OTP above keyboard
    Android: same via autoComplete
    User doesn't need to switch apps = PEAK MOMENT eliminated friction
    Booking Confirmed appears faster because auth was seamless
```

---

## Task 2.7 — Screen + StickyFooter Layout Shells
### Duration: 30 minutes
### Files:
### `src/components/layout/Screen.tsx`
### `src/components/layout/StickyFooter.tsx`

---

### Screen Component Specification

```
COMPONENT NAME: Screen
PURPOSE: Base wrapper for EVERY screen in the app
         Ensures safe area, status bar, and background consistency

PROPS INTERFACE:
  children        → React.ReactNode (required)
  bg              → string DEFAULT: colors.bgApp (#FAFAFA)
  statusBarStyle  → 'light-content' | 'dark-content' | 'auto'
                    DEFAULT: 'dark-content'
  edges           → Array from useSafeAreaInsets
                    DEFAULT: ['top', 'bottom', 'left', 'right']
  style           → ViewStyle (override)

INTERNAL STRUCTURE:
  SafeAreaView from react-native-safe-area-context
  Inside: StatusBar component
  Inside: {children}

WHY SafeAreaView from react-native-safe-area-context (not built-in):
  The built-in SafeAreaView from React Native has inconsistencies
  The package version gives better control over which edges are inset
  Map screen: edges=['left','right'] only (map fills status bar area)
  Chat screen: all edges (normal screen)
  edges prop = different screens get correct inset handling

BACKGROUND COLOR STRATEGY:
  DEFAULT: #FAFAFA (Zen White)
  Map screens: transparent (map shows through)
  Auth screens: #FFFFFF (pure white = trust signal)
  Success screens: #FFFFFF (celebration on pure white)
  Why #FAFAFA as default: Pure white (#FFFFFF) shows dirt on OLED
  Slightly warm off-white = premium, less eye-fatiguing

STATUS BAR STRATEGY:
  statusBarStyle: 'dark-content' for most screens (dark icons on white)
  statusBarStyle: 'light-content' for: map, booking success, profile header
  Each screen sets its own status bar style via this prop
  No global status bar setting — context-appropriate per screen

MICRO-INTENTION:
  Screen has zero visible animation.
  It's purely structural — transparent to the user.
  Its "intention" is stability:
  "Every screen starts from the same solid foundation."
```

---

### StickyFooter Component Specification

```
COMPONENT NAME: StickyFooter
PURPOSE: Fixed bottom CTA area — present on booking, payment, cart, 
         worker profile, and all screens with primary actions

FITTS' LAW — THE CORE REASON THIS COMPONENT EXISTS:
  Primary CTAs at the BOTTOM = closest to user's thumb.
  Research: 80% of mobile users hold with right hand, use right thumb.
  Thumb's natural resting zone = lower portion of screen.
  StickyFooter places the most important button exactly there.
  EVERY time.

  Without StickyFooter:
    CTA placed wherever it flows in the ScrollView
    User: scrolls to find button
    Friction = reduced conversion

  With StickyFooter:
    CTA always at bottom, always visible, always accessible
    User: thumb instinctively goes there
    Zero friction = maximum conversion

SERIAL POSITION EFFECT:
  StickyFooter = last thing user sees on any screen.
  Last thing = most remembered (end moment in Peak-End Rule).
  The CTA label and button color at the bottom STAYS in memory.
  "I need to tap the green button" = clear and memorable.

PROPS INTERFACE:
  children        → React.ReactNode (required)
  noBorder        → boolean DEFAULT: false (top border separates from content)
  bg              → string DEFAULT: colors.bgCard (#FFFFFF)
  style           → ViewStyle (override)

INTERNAL STRUCTURE:
  View with:
    backgroundColor: bg
    paddingHorizontal: 16
    paddingTop: 14
    paddingBottom: max(insets.bottom, 16)
    borderTopWidth: noBorder ? 0 : 1
    borderTopColor: colors.border
    shadow: top-only shadow (box-shadow: 0 -4px 12px rgba(0,0,0,0.06))

  WHY TOP-ONLY SHADOW:
    Normal shadow goes DOWN from element.
    StickyFooter is at BOTTOM → shadow needs to go UP.
    Creates the visual separation from scroll content below.
    Signals to user: "this area is separate, always present"

  WHY insets.bottom:
    iPhone SE: 0px home indicator → paddingBottom: 16px
    iPhone 14 Pro: 34px home indicator → paddingBottom: 34px
    This calculation: max(insets.bottom, 16) = correct for all devices

LAYOUT PATTERNS IT SUPPORTS:

  Single primary button:
    <StickyFooter>
      <Button label="Book Now" ... fullWidth />
    </StickyFooter>

  Two buttons (primary + secondary):
    <StickyFooter>
      <Button label="Book Now" variant="primary" ... />
      <Button label="Cancel" variant="secondary" ... style={{marginTop: 10}} />
    </StickyFooter>

  Two equal buttons side by side (Chat + Book):
    <StickyFooter>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Button label="Chat" variant="secondary" style={{ flex: 1 }} />
        <Button label="Book Now" variant="primary" style={{ flex: 1 }} />
      </View>
    </StickyFooter>

  Text link below button:
    <StickyFooter>
      <Button label="Get Started" ... />
      <Button label="Already have account? Log In" variant="text" ... />
    </StickyFooter>

NESTING WITH Screen:
  Screen wraps the scrollable content area
  StickyFooter is OUTSIDE the ScrollView
  Inside Screen: [ScrollView + content] + [StickyFooter]
  ScrollView has contentContainerPaddingBottom = StickyFooter height
  So content doesn't hide behind StickyFooter when scrolled to bottom
```

---

## Task 2.8 — Integration Test + Review
### Duration: 25 minutes

---

### What This Task Verifies

```
PURPOSE:
  Verify all Day 2 components work together correctly.
  Catch type errors, import errors, and visual regressions
  BEFORE they become blockers in Day 3.

SERIAL POSITION EFFECT applied to task ordering:
  This is the LAST task of Day 2.
  Last tasks are most remembered.
  Ending with a green ✅ verification = positive end moment.
  Ending with broken imports = negative end moment that
  colors perception of the next working session.

STEP 1 — TypeScript Verification:
  Run: tsc --noEmit
  Expected: zero errors
  Common failures:
    - fontAssets keys don't match typography.ts fontFamily strings
    - Reanimated useAnimatedStyle used outside worklet
    - Missing prop in interface (TypeScript strict catches this)

STEP 2 — ESLint Verification:
  Run: eslint src/ --ext .ts,.tsx
  Expected: zero errors, zero warnings
  Common failures:
    - Missing useCallback around press handlers
    - react-hooks/exhaustive-deps missing animation deps
    - no-explicit-any in shared value types

STEP 3 — Visual Testing on iOS Simulator:
  Create a temporary test screen at app/test.tsx
  Render every component with every variant
  Verify:
    □ Text: all 17 variants render correct font + size
    □ Button primary: idle, disabled, loading states visible
    □ Button secondary: border visible, correct green color
    □ Button ghost, danger, text: all distinct from each other
    □ IconButton: circle visible, tap area 44×44
    □ TextInput: floating label animates on focus
    □ TextInput: error shake triggers visually
    □ OTPInput: 6 boxes render, cursor advances on type
    □ Screen: background correct, safe area respected
    □ StickyFooter: sticks to bottom, top border visible

STEP 4 — Visual Testing on Android Emulator:
  Same test screen.
  Specific Android checks:
    □ Shadows: elevation works (no CSS shadow on Android)
    □ Fonts: all 3 font families load (check no system font fallback)
    □ Haptics: suppressed gracefully if no haptic engine
    □ OTPInput: autoComplete='sms-otp' attribute present

STEP 5 — Accessibility Check:
  Enable VoiceOver on iOS simulator
  Navigate to test screen
  Verify:
    □ Text components: readable with correct content
    □ Button: announces label + role + state (disabled/loading)
    □ OTPInput: each box announces "digit N of 6"
    □ TextInput: announces label + hint

STEP 6 — Delete test screen:
  git rm app/test.tsx
  Commit: "test: remove Day 2 component verification screen"
  Clean codebase = professional signal
```

---

## Day 2 — Complete File List

```
NEW FILES CREATED TODAY:

  src/config/fonts.ts
  src/config/queryClient.ts
  src/providers/AppProviders.tsx

  app/_layout.tsx

  src/components/ui/Text/Text.tsx
  src/components/ui/Text/index.ts

  src/components/ui/Button/Button.tsx
  src/components/ui/Button/IconButton.tsx
  src/components/ui/Button/index.ts

  src/components/ui/Input/TextInput.tsx
  src/components/ui/Input/OTPInput.tsx
  src/components/ui/Input/index.ts

  src/components/layout/Screen.tsx
  src/components/layout/StickyFooter.tsx
  src/components/layout/index.ts

MODIFIED FROM DAY 1 (placeholder → real):
  app/index.tsx  → Redirect logic (auth check → route)

TOTAL NEW FILES: 15
TOTAL COMPONENTS BUILT: 7 (Text, Button, IconButton,
  TextInput, OTPInput, Screen, StickyFooter)
```

---

## Day 2 — Deliverable Checklist

```
FONT SYSTEM:
  □ src/config/fonts.ts: 14 font entries, all keys matching typography.ts
  □ app/_layout.tsx: useFonts with all 14 fonts
  □ SplashScreen stays visible until fonts loaded
  □ After fonts: SplashScreen hides on next frame (not jarring)
  □ Font error handled (app still renders with system fonts as fallback)
  □ Stack screen animations configured per-route

PROVIDERS:
  □ src/config/queryClient.ts: staleTime 30s, retry 2, offlineFirst
  □ src/providers/AppProviders.tsx: 4 providers in correct order
  □ AuthProvider, SocketProvider (placeholders OK), NotificationProvider,
    ToastProvider all created

TEXT COMPONENT:
  □ Text.tsx: 17 variants all working
  □ Poppins: display, h1, h2, h3, h4
  □ Jakarta: body1, body2, label, caption, micro, nano
  □ Inter: dataXL, dataLG, dataMD, dataSM, dataXS
  □ Color prop: 8 semantic keys + hex override
  □ maxFontSizeMultiplier: 1.3 on all instances
  □ No hardcoded font values anywhere in the component

BUTTON COMPONENT:
  □ Button.tsx: 5 variants all working (primary, secondary, ghost, danger, text)
  □ Button.tsx: 3 sizes all working (lg=52px, md=44px, sm=36px)
  □ Press animation: scale 0.97 (pressIn) → 1.02 → 1.0 (pressOut, bouncy)
  □ Loading state: spinner replaces label, width locked
  □ Disabled state: correct muted colors, zero animation
  □ Haptic: correct level per variant
  □ All animations on UI thread (Reanimated 3 worklets)
  □ AnimatedPressable used (not Animated.View wrapping Pressable)
  □ Poppins SemiBold for primary/secondary/danger labels
  □ Jakarta Medium for ghost/text labels

ICONBUTTON COMPONENT:
  □ Touch area: always min 44×44 regardless of size prop
  □ Visual circle: size prop value
  □ Scale: 1.0 → 0.90 → 1.05 → 1.0 (stiff in, bouncy out)
  □ Background: animates between idle/pressed colors
  □ accessibilityLabel: required prop enforced by TypeScript

TEXTINPUT COMPONENT:
  □ Floating label: animates up on focus or when has value
  □ Floating label: stays up when value exists (not just while focused)
  □ Border: gray → green on focus (animated)
  □ Border: gray → red on error (animated)
  □ Shake: triggers on error prop change (Reanimated withSequence)
  □ Error text: slides down with spring animation
  □ Left/right icon: correct colors per state
  □ All standard RNTextInput props pass-through work

OTPINPUT COMPONENT:
  □ 6 boxes render correctly
  □ Auto-advance: typing digit moves to next box
  □ Backspace: clears current, moves to previous
  □ Paste: fills all boxes from pasted string
  □ Active box: scale 1.06 + green border
  □ Error: all boxes shake simultaneously + turn red
  □ Success: cascade bounce left→right (40ms stagger)
  □ textContentType: 'oneTimeCode' (iOS SMS autofill)
  □ autoComplete: 'sms-otp' (Android SMS autofill)
  □ Inter Bold 22px for digits

LAYOUT COMPONENTS:
  □ Screen.tsx: SafeAreaView wrapper, bg prop, statusBarStyle prop
  □ Screen.tsx: edges prop for selective inset application
  □ StickyFooter.tsx: sticks to bottom above home indicator
  □ StickyFooter.tsx: top shadow separates from content
  □ StickyFooter.tsx: insets.bottom + 16px minimum padding

QUALITY GATES:
  □ tsc --noEmit: zero errors
  □ eslint: zero errors, zero warnings
  □ All components: zero 'any' types used
  □ All components: zero hardcoded color/size values
  □ All tests run on iOS simulator ✅
  □ All tests run on Android emulator ✅
  □ VoiceOver navigation: all interactive elements announced correctly
```

---

## UX Laws Final Audit — Day 2

```
RECOGNITION OVER RECALL:
  ✅ Text: variant="h1" not fontFamily="Poppins-Bold" fontSize={28}
  ✅ Button: variant="primary" not bg="#16A34A" borderRadius={100}
  ✅ Floating label: always visible (recognition, not recall)
  ✅ OTP: 6 boxes = instantly recognized pattern
  ✅ Font roles: Poppins=brand, Jakarta=body, Inter=data — never confused

FITTS' LAW:
  ✅ Button lg: exactly 52px height
  ✅ Button md: exactly 44px height
  ✅ Button sm: 36px visual, 44px touch area
  ✅ IconButton: always 44×44 touch area minimum
  ✅ TextInput: 52px height = generous tap area
  ✅ OTPInput: each box 50×58px = easily tapped
  ✅ StickyFooter: CTA at thumb-zone bottom position

HICK'S LAW:
  ✅ Button: 5 variants — each has distinct, non-overlapping use case
  ✅ Button: 3 sizes — each maps to one level of hierarchy
  ✅ Input: 4 types — each for exactly one context
  ✅ Text: 17 variants but organized by role (brand/body/data)
  ✅ Color prop: 8 semantic options — no color picking from palette

JAKOB'S LAW:
  ✅ Button press animation: universal scale down/up pattern
  ✅ OTP: 6-box pattern = universal, zero learning curve
  ✅ Floating label: Material Design pattern = familiar
  ✅ Error shake: universal error pattern = instant understanding
  ✅ StickyFooter: bottom CTA = Uber, Airbnb, every major app

PEAK-END RULE:
  ✅ Button release: scale 1.02 overshoot = micro-peak per tap
  ✅ OTP success: cascade bounce = peak of auth flow
  ✅ Font loading → splash hide: clean first moment (end of loading)
  ✅ Error shake: memorable moment (so user doesn't repeat mistake)

GOAL GRADIENT EFFECT:
  ✅ Button loading: spinner shows "working toward your goal"
  ✅ Button enabled only when valid: visual progress signal
  ✅ OTP boxes: each digit = visual step toward access goal
  ✅ 7 components built: clear milestones throughout the day

SERIAL POSITION EFFECT:
  ✅ Text variants: most important (display, h1) defined first
  ✅ Button variants: primary defined first (most used)
  ✅ Input: label renders above value (label seen first = recognized first)
  ✅ StickyFooter: CTA last in screen flow = most remembered
  ✅ Day 2 tasks ordered: most critical (fonts) first
```

---

## What Day 3 Gets From Day 2

```
AFTER DAY 2, THE FOLLOWING ARE AVAILABLE:

  BUILDING BLOCKS FOR AUTH SCREENS:
  → Text component: h1 for screen titles (Poppins Bold)
  → Button primary: "Get Started", "Continue", "Verify" CTAs
  → TextInput: Phone number field with floating label
  → OTPInput: 6-box verification with auto-advance
  → Screen: Safe area wrapper for all auth screens
  → StickyFooter: Bottom-fixed CTA position
  → IconButton: Back arrow for auth navigation headers

  DAY 3 WILL BUILD:
  → Welcome screen (carousel with slides)
  → Phone entry screen
  → OTP verification screen
  → Name entry screen (new users)
  → Location permission screen
  → These screens ONLY compose components built today
  → No new primitive components needed on Day 3

  THE SPEED OF DAY 3:
  Because Day 2 built perfect primitives,
  Day 3 screens are assembly, not construction.
  A screen becomes: layout + components + business logic.
  Each element clicks in like LEGO blocks.
  5 screens in one day becomes achievable.
```

---

*Tasklync — Day 2 Implementation Plan*
*No code. Pure engineering + UX thinking.*
*7 components. 15 files. 8 hours. Foundation for 37 screens.*
*Every micro-interaction justified. Every UX law applied precisely.*
