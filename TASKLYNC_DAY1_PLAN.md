# Tasklync — Day 1 Implementation Plan
## Project Scaffold · Architecture · Design Foundation
### Senior React Native Expo | 25 Years Experience | Production Grade

> **Rule:** Implementation plan only — no code, no syntax, pure engineering + UX thinking.
> Every decision justified. Every file purposed. Every UX law applied consciously.

---

## Day 1 Philosophy

```
"The foundation you lay in Day 1 determines how fast
 you move in Day 60."

Every shortcut = 10× technical debt.
Every unclear folder = 10× confusion later.
Every missing token = 10× inconsistency in the UI.

Day 1 is not about building features.
Day 1 is about building the machine that builds features.
```

---

## UX Laws Applied on Day 1

```
Before writing a single file, understand WHY each law
applies to architecture and foundation work.

┌─────────────────────────────────────────────────────────────────┐
│  UX LAW              HOW IT APPLIES ON DAY 1                    │
├─────────────────────────────────────────────────────────────────┤
│  RECOGNITION         Folder names = instant understanding       │
│  OVER RECALL         No developer should guess where            │
│                      anything lives. Name → location is         │
│                      always obvious. Zero mental mapping.        │
│                      Example: auth/login.tsx not pages/p1.tsx   │
├─────────────────────────────────────────────────────────────────┤
│  FITTS' LAW          Touch target constants in spacing.ts        │
│                      Defined today = enforced in every          │
│                      component for the next 59 days.            │
│                      44px iOS min / 48px Android min            │
│                      Button heights locked: 52 / 44 / 36        │
├─────────────────────────────────────────────────────────────────┤
│  HICK'S LAW          ONE library per category of need.          │
│                      Fewer dependencies = fewer decisions        │
│                      every day. The package selection           │
│                      happening TODAY is a permanent decision.   │
│                      State: Zustand only.                       │
│                      Animation: Reanimated 3 only.              │
│                      Forms: react-hook-form only.               │
├─────────────────────────────────────────────────────────────────┤
│  JAKOB'S LAW         Folder structure matches industry norm.    │
│                      Every senior dev who joins the team         │
│                      recognizes it immediately.                 │
│                      Feature-based, not type-based.             │
│                      Domain folders, not technical folders.     │
├─────────────────────────────────────────────────────────────────┤
│  PEAK-END RULE       animation.ts is written today.             │
│                      Spring configs defined = every future      │
│                      interaction will feel premium.             │
│                      The "peaks" of the app (booking           │
│                      success, OTP verified) depend on           │
│                      the configs set here.                      │
├─────────────────────────────────────────────────────────────────┤
│  GOAL GRADIENT       Design token system = the first step       │
│  EFFECT              toward a complete design system.           │
│                      Completing each token file feels like      │
│                      progress toward the goal.                  │
│                      Colors → Typography → Spacing →            │
│                      Shadows → Radius → Animations              │
│                      Each completed = visible progress.         │
├─────────────────────────────────────────────────────────────────┤
│  SERIAL POSITION     Token files ordered by importance:         │
│  EFFECT              colors.ts FIRST (most critical)            │
│                      typography.ts SECOND                       │
│                      spacing.ts THIRD                           │
│                      shadows.ts, radius.ts, animations.ts       │
│                      Developers read top → bottom.              │
│                      Put the most important tokens first.       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Day 1 — Time Breakdown

```
TOTAL: 8 hours

Morning Session  (4h):
  Task 1.1  — Expo project initialization          45 min
  Task 1.2  — All dependencies installation        45 min
  Task 1.3  — App configuration files             45 min
  Task 1.4  — Linting, formatting, git hooks       45 min

Afternoon Session (4h):
  Task 1.5  — Complete folder architecture         90 min
  Task 1.6  — Design token system (6 files)        90 min
```

---

## Morning Session (4 Hours)

---

## Task 1.1 — Expo Project Initialization
### Duration: 45 minutes
### Responsible: Lead developer

---

### What Happens in This Task

```
PURPOSE:
  Create the Expo project with the correct template.
  Expo Router template is chosen (not blank) because:
  - File-based routing = faster screen creation from Day 2
  - Type-safe routes built in
  - No manual navigation setup needed
  - Industry standard for new Expo projects (Jakob's Law)

TEMPLATE CHOICE DECISION:
  expo-template-blank-typescript → chosen
  Why not expo-template-default: too opinionated
  Why not bare workflow: we need Expo Go for rapid testing
  Why TypeScript template: strict mode from day 1, never migrate later
```

---

### Files Created in Task 1.1

```
PROJECT ROOT LEVEL:

  tsconfig.json
  ─────────────
  PURPOSE: TypeScript configuration
  CRITICAL SETTINGS:
    strict: true            → catches bugs at compile time, not runtime
    noImplicitAny: true     → forces typed code everywhere
    strictNullChecks: true  → prevents null pointer runtime crashes
    noUnusedLocals: true    → keeps codebase clean automatically
    exactOptionalPropertyTypes → prevents accidental undefined passing
    paths: {...}            → alias map for clean imports (@/* → src/*)

  WHY ALIASES MATTER (UX of Developer Experience):
    WITHOUT aliases: import { Button } from '../../../components/ui/Button'
    WITH aliases:    import { Button } from '@components/ui/Button'
    Recognition over Recall for developers — they know the alias,
    not the relative path depth.

  Aliases to configure:
    @/*           → src/*
    @design/*     → src/design/*
    @components/* → src/components/*
    @hooks/*      → src/hooks/*
    @store/*      → src/store/*
    @services/*   → src/services/*
    @utils/*      → src/utils/*
    @types/*      → src/types/*
    @config/*     → src/config/*
    @providers/*  → src/providers/*
    @features/*   → src/features/*

  WHY THESE SPECIFIC ALIASES:
    Domain-based, not technical-based.
    A developer reads '@components/worker/WorkerCard'
    and instantly knows: this is a UI component for the worker domain.
    No mental mapping required. (Recognition over Recall)
```

---

### Verification Checkpoint 1.1

```
BEFORE MOVING TO TASK 1.2, VERIFY:
  □ expo start launches successfully on iOS simulator
  □ expo start launches successfully on Android emulator
  □ tsconfig.json compiles with tsc --noEmit (zero errors)
  □ Expo SDK version is 52.x (not lower)
  □ Expo Router is initialized (app/ folder exists)

IF ANY CHECK FAILS: fix before proceeding.
Never build on a broken foundation.
```

---

## Task 1.2 — All Dependencies Installation
### Duration: 45 minutes
### Responsible: Lead developer

---

### What Happens in This Task

```
PURPOSE:
  Install ALL 40+ packages in one session.
  Why all at once: resolving dependency conflicts is easier
  when you have the full picture. Installing one-by-one
  leads to version mismatches discovered days later.

HICK'S LAW APPLICATION:
  For every category of need, EXACTLY ONE library chosen.
  Decision is made today. Never revisited.
  This reduces decision fatigue for the entire 60 days.

  ┌─────────────────────────────────────────────────────┐
  │  CATEGORY         CHOSEN LIBRARY    WHY             │
  ├─────────────────────────────────────────────────────┤
  │  Navigation       expo-router       File-based,     │
  │                                     type-safe       │
  │  State (client)   zustand           Simple, fast,   │
  │                                     minimal API     │
  │  State (server)   @tanstack/query   Industry std,   │
  │                                     caching built-in│
  │  HTTP             axios             Interceptors,   │
  │                                     consistent API  │
  │  Animation        reanimated 3      UI thread,      │
  │                                     60fps always    │
  │  Gestures         gesture-handler   Required by     │
  │                                     reanimated      │
  │  Lists            @shopify/flashlist10× faster than │
  │                                     FlatList        │
  │  Forms            react-hook-form   Performance,    │
  │                                     zod integration │
  │  Validation       zod               Type-safe,      │
  │                                     runtime safety  │
  │  Storage (secure) expo-secure-store Tokens, secrets │
  │  Storage (fast)   react-native-mmkv Cache, prefs   │
  │  Images           expo-image        Caching, perf   │
  │  Maps             react-native-maps Both platforms  │
  │  Notifications    expo-notifications FCM + APNs     │
  │  Payments         stripe-react-native Production   │
  │  Real-time        socket.io-client  WebSocket       │
  │  Lottie           lottie-react-native Animations   │
  │  Haptics          expo-haptics      Touch feedback  │
  │  Location         expo-location     GPS             │
  └─────────────────────────────────────────────────────┘
```

---

### Installation Order (Critical)

```
INSTALLATION SEQUENCE MATTERS:

Step 1: Core Expo packages via expo install
  Why expo install: ensures version compatibility with Expo SDK 52
  Never use npm install for Expo-specific packages

Step 2: Non-Expo packages via npm install

Step 3: Dev tools last
  Husky, lint-staged, commitlint
  These should not affect app bundle

Step 4: Configure reanimated babel plugin
  CRITICAL: reanimated plugin MUST be the LAST babel plugin
  If it's not last → app crashes on first animation
  This is a known gotcha that wastes hours if missed
```

---

### Packages Organized by Domain

```
NAVIGATION:
  expo-router          → File-based routing
  expo-linking         → Deep linking support
  expo-constants       → App config access
  expo-status-bar      → Status bar control

UI ESSENTIALS:
  expo-image           → Better than RN Image (caching, performance)
  expo-haptics         → Haptic feedback on iOS + Android
  expo-font            → Custom font loading

LOCATION & MAPS:
  expo-location        → GPS, geocoding permissions
  react-native-maps    → Map rendering (Google Maps / Apple Maps)

MEDIA:
  expo-camera          → Camera access for profile photos
  expo-image-picker    → Gallery access
  expo-image-manipulator → Image compression before upload

STORAGE:
  expo-secure-store    → Encrypted storage (tokens, sensitive data)
  react-native-mmkv    → Ultra-fast key-value (10-30x AsyncStorage)

NOTIFICATIONS:
  expo-notifications   → Push notifications (FCM + APNs)

STATE & DATA:
  zustand              → Client state management
  @tanstack/react-query → Server state + caching
  axios                → HTTP client with interceptors

ANIMATION:
  react-native-reanimated → UI thread animations (60fps)
  react-native-gesture-handler → Gesture recognition
  moti                 → Declarative animation API on Reanimated

LISTS:
  @shopify/flash-list  → High-performance replacement for FlatList

FORMS:
  react-hook-form      → Performant forms
  zod                  → Schema validation
  @hookform/resolvers  → Connects zod to react-hook-form

REAL-TIME:
  socket.io-client     → WebSocket for chat + live tracking

PAYMENTS:
  @stripe/stripe-react-native → Payment processing

ANIMATIONS:
  lottie-react-native  → JSON-based animations (success, loading, empty)

UTILITIES:
  date-fns             → Date formatting (lighter than moment.js)
  babel-plugin-module-resolver → Path alias support

DEV TOOLS:
  @commitlint/cli      → Enforce commit message format
  @commitlint/config-conventional → Conventional commits config
  husky                → Git hooks runner
  lint-staged          → Run linters only on staged files
  @typescript-eslint/* → TypeScript-specific ESLint rules
```

---

### Verification Checkpoint 1.2

```
BEFORE MOVING TO TASK 1.3, VERIFY:
  □ npm install completes with zero errors
  □ No peer dependency warnings for critical packages
  □ node_modules exists and is populated
  □ package.json shows all packages with correct versions
  □ expo start still works after installation
  □ No package conflicts (especially reanimated version)

COMMON ISSUES:
  react-native-maps: requires separate iOS/Android setup
  @stripe/stripe-react-native: requires Xcode build settings
  reanimated: babel plugin position must be verified
```

---

## Task 1.3 — App Configuration Files
### Duration: 45 minutes
### Responsible: Lead developer

---

### What Happens in This Task

```
PURPOSE:
  Create all configuration files that define how the app
  behaves on both iOS and Android platforms.
  These files are infrastructure — set wrong now,
  broken for the next 59 days.
```

---

### Files Created in Task 1.3

```
app.config.ts
─────────────
PURPOSE: Single source of truth for Expo app configuration

WHAT IT DEFINES:
  App identity:
    name: 'Tasklync'
    slug: 'tasklync-user'
    version: '1.0.0'
    scheme: 'tasklync'           → Deep link scheme (tasklync://)
    orientation: 'portrait'      → No landscape (service app UX)

  Visual identity:
    icon path                    → App icon (1024×1024)
    splash backgroundColor: '#16A34A'  → Green splash (brand)
    splash resizeMode: 'contain'  → Safe for all screen sizes
    userInterfaceStyle: 'automatic' → Respects system dark/light

  iOS specific:
    bundleIdentifier: 'com.tasklync.user'
    supportsTablet: false        → Phone-only (service app)
    infoPlist permissions:
      NSLocationWhenInUseUsageDescription
      NSLocationAlwaysAndWhenInUseUsageDescription
      NSCameraUsageDescription
      NSPhotoLibraryUsageDescription
      NSPhotoLibraryAddUsageDescription

    WHY EXACT PERMISSION STRINGS MATTER:
      Apple reviews reject vague permission descriptions.
      Strings must explain exactly why the permission is needed.
      Example: "Tasklync uses your location to find nearby
      service workers" — not just "To find services near you"

  Android specific:
    package: 'com.tasklync.user'
    versionCode: 1
    permissions list (granular Android permissions)
    adaptiveIcon with green background

  Plugins (order matters):
    expo-router       → Must be first (routing initialization)
    expo-font         → Font loading plugin
    expo-location     → Location permission handling
    expo-camera       → Camera permission handling
    stripe-react-native → Merchant ID + Google Pay
    expo-notifications → Push notification setup

  Experiments:
    typedRoutes: true → Expo Router type-safe routes

  Extra (environment variables passed to app):
    apiBaseUrl         → Backend API endpoint
    googleMapsKey      → Google Maps API key
    stripePublishableKey → Stripe public key
    eas.projectId      → EAS build project reference

WHY app.config.ts NOT app.json:
  TypeScript config allows process.env access
  Environment-specific configuration (dev vs prod)
  Type checking on config values
  More flexibility for conditional logic

──────────────────────────────────────────────

.env
────
PURPOSE: Local development environment variables

CONTAINS:
  API_BASE_URL=http://localhost:3000/api/v1
  GOOGLE_MAPS_KEY=your_key_here
  STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
  EAS_PROJECT_ID=your_project_id

SECURITY RULE:
  .env is in .gitignore from day 1
  Never commit real keys to git
  .env.example committed (shows shape without values)

──────────────────────────────────────────────

.env.example
────────────
PURPOSE: Document all required env vars for other developers

CONTAINS: Same keys as .env but with empty values or placeholders
COMMITTED TO GIT: Yes (no real values)
JAKOB'S LAW: Every developer knows this pattern from every project

──────────────────────────────────────────────

eas.json
────────
PURPOSE: EAS Build and Submit configuration

PROFILES:
  development:
    distribution: internal
    android.buildType: apk
    → For team internal testing, fast builds

  staging:
    distribution: internal
    ios.simulator: false
    → TestFlight + Play Store internal testing track
    → What QA tests

  production:
    ios: store build
    android.buildType: app-bundle
    → App Store + Play Store submissions

WHY STAGING PROFILE:
  Staging ≠ Development ≠ Production
  Testing on staging prevents production config surprises
  Always test store-equivalent build before submitting
```

---

### Verification Checkpoint 1.3

```
BEFORE MOVING TO TASK 1.4, VERIFY:
  □ app.config.ts has zero TypeScript errors
  □ .env file is in .gitignore
  □ .env.example committed to git
  □ expo start reads environment variables correctly
  □ App name shows as 'Tasklync' in simulator
  □ Splash screen shows green background
```

---

## Task 1.4 — Linting, Formatting & Git Hooks
### Duration: 45 minutes
### Responsible: Lead developer

---

### What Happens in This Task

```
PURPOSE:
  Code quality automation. The team should never argue
  about code style. Machines enforce it automatically.

JAKOB'S LAW APPLICATION:
  Every senior developer expects these tools.
  Their presence signals: "this is a professional codebase."
  Their absence signals: "shortcuts were taken here."

RECOGNITION OVER RECALL:
  Developers remember "the code auto-formats on save"
  They don't need to recall: "was it 2 or 4 spaces?
  Was it single or double quotes? Trailing comma or not?"
  Rules are automated = zero mental overhead.
```

---

### Files Created in Task 1.4

```
.eslintrc.js
────────────
PURPOSE: Code quality rules enforced at commit time

KEY RULES:
  @typescript-eslint/no-explicit-any: 'error'
  → 'any' is never allowed. Types everywhere.
  → Discovered today = never becomes a habit

  @typescript-eslint/no-unused-vars: 'error'
  → Dead code is removed automatically

  react-hooks/rules-of-hooks: 'error'
  → Hooks called conditionally → caught before they become bugs

  react-hooks/exhaustive-deps: 'warn'
  → Missing dependencies in useEffect → warned immediately

  no-console: ['warn', { allow: ['warn', 'error'] }]
  → console.log is removed (production apps don't log)
  → console.warn and console.error kept for real errors

  prefer-const: 'error'
  → Variables that could be const must be const
  → Signals immutability intent clearly

──────────────────────────────────────────────

.prettierrc
───────────
PURPOSE: Automatic code formatting — zero style debates

KEY SETTINGS:
  semi: true              → Semicolons always
  singleQuote: true       → Single quotes for strings
  tabWidth: 2             → 2 space indentation
  trailingComma: 'all'    → Trailing commas everywhere valid
  printWidth: 100         → Lines ≤ 100 chars (readable on any screen)
  bracketSpacing: true    → { key: value } not {key: value}
  arrowParens: 'always'   → (x) => x not x => x (consistent)

WHY THESE SPECIFIC SETTINGS:
  single quotes = less visual noise than double quotes
  100 char limit = readable on laptop without horizontal scroll
  trailing commas = cleaner git diffs (adding last item doesn't
  change previous line)

──────────────────────────────────────────────

.husky/pre-commit
─────────────────
PURPOSE: Runs checks BEFORE every git commit

WHAT IT RUNS:
  npx lint-staged
  → Runs ESLint + Prettier only on staged files
  → Fast (not the whole project, just changed files)
  → Prevents bad code from entering git history

WHY PRE-COMMIT NOT PRE-PUSH:
  Pre-commit: catches issues before they're in git
  Pre-push: too late, commit already happened
  Earlier feedback = faster fixes (Fitts' Law for developer UX)

──────────────────────────────────────────────

.commitlintrc / commitlint config in package.json
──────────────────────────────────────────────────
PURPOSE: Enforce meaningful commit messages

FORMAT: type(scope): description
TYPES ALLOWED:
  feat     → new feature
  fix      → bug fix
  chore    → tooling, config, dependencies
  refactor → code change, no feature/fix
  style    → formatting only
  test     → tests
  docs     → documentation

EXAMPLES:
  ✅ feat(auth): add OTP verification screen
  ✅ fix(button): resolve press animation on Android
  ✅ chore(deps): update expo to 52.0.1
  ❌ "fixed stuff"
  ❌ "WIP"
  ❌ "changes"

WHY THIS MATTERS:
  Clean commit history = instant context for any change
  Recognition over Recall: read commit → know what changed
  Automated changelogs possible
  PR reviews faster (commits are meaningful)

──────────────────────────────────────────────

package.json scripts additions
──────────────────────────────
SCRIPTS TO ADD:
  "lint": "eslint . --ext .ts,.tsx"
  → Run linter manually

  "type-check": "tsc --noEmit"
  → TypeScript check without building

  "format": "prettier --write \"src/**/*.{ts,tsx}\""
  → Format all src files manually

  "lint-staged config" (in package.json):
    *.{ts,tsx}: ["eslint --fix", "prettier --write"]
    → On commit: auto-fix lint + format changed files
```

---

### Verification Checkpoint 1.4

```
BEFORE MOVING TO AFTERNOON SESSION, VERIFY:
  □ eslint . --ext .ts,.tsx runs with zero errors
  □ prettier --check . passes
  □ git commit with bad message → commitlint rejects it
  □ git commit with staged .tsx file → ESLint runs
  □ husky hooks are executable (check .husky/ permissions)
  □ tsc --noEmit completes with zero errors
```

---

## Afternoon Session (4 Hours)

---

## Task 1.5 — Complete Folder Architecture
### Duration: 90 minutes
### Responsible: Lead developer + Team review

---

### What Happens in This Task

```
PURPOSE:
  Create the entire src/ and app/ folder skeleton.
  Every folder that will ever exist in this project
  is created today — even empty.

WHY CREATE EMPTY FOLDERS:
  Recognition over Recall — developers see the complete map
  They know where to put new files before they create them
  No "where does this go?" questions for 60 days

JAKOB'S LAW:
  Feature-based structure matches what senior developers expect.
  Type-based (components/, hooks/, utils/ only) is rejected.
  Domain-based (auth/, worker/, booking/) is chosen.
  Both approaches are used — domain folders CONTAIN type folders.
```

---

### The Complete Folder Map

```
ROOT LEVEL:
  app/                → Expo Router screens (all routes here)
  src/                → All application source code
  assets/             → Images, fonts, animations, icons
  .husky/             → Git hook scripts
  .expo/              → Auto-generated (never edit)

──────────────────────────────────────────────

app/ — EXPO ROUTER STRUCTURE
  (auth)/
    _layout.tsx       → Auth stack navigator configuration
    welcome.tsx       → Onboarding carousel screen
    phone.tsx         → Phone number entry screen
    otp.tsx           → OTP verification screen
    name.tsx          → Name entry screen (new users)
    location-permission.tsx → Location permission request

  (tabs)/
    _layout.tsx       → Tab navigator with custom tab bar
    index.tsx         → Home / Discovery tab
    explore.tsx       → Search / Browse tab
    bookings.tsx      → My Bookings tab
    profile.tsx       → Profile / Account tab

  (map)/
    _layout.tsx       → Map screen layout (no tab bar)
    live-map.tsx      → Full-screen live workers map

  category/
    [id].tsx          → Category services list

  worker/
    [id].tsx          → Worker public profile
    [id]/
      reviews.tsx     → Worker reviews list
      portfolio.tsx   → Worker portfolio grid

  service/
    [id].tsx          → Single service detail

  booking/
    create.tsx        → Step 1: Service + worker confirmation
    schedule.tsx      → Step 2: Date and time selection
    address.tsx       → Step 3: Address selection
    summary.tsx       → Step 4: Review and confirm
    payment.tsx       → Payment checkout
    success.tsx       → Booking confirmed celebration
    [id]/
      detail.tsx      → Booking detail and status
      track.tsx       → Live worker tracking map
      chat.tsx        → In-booking real-time chat
      review.tsx      → Post-job review submission
      invoice.tsx     → Invoice / receipt view
      dispute.tsx     → Raise a dispute

  cart/
    index.tsx         → Shopping cart review

  search/
    index.tsx         → Search results
    filters.tsx       → Filter options (bottom sheet)

  notifications/
    index.tsx         → Notification center feed

  profile/
    edit.tsx          → Edit user profile
    addresses.tsx     → Saved addresses list
    addresses/
      add.tsx         → Add address via map picker
    payment-methods.tsx → Saved payment cards
    booking-history.tsx → Full booking history
    support.tsx       → Help and support
    settings.tsx      → App preferences
    blocked-workers.tsx → Blocked workers management

  _layout.tsx         → Root layout (providers + font loading)
  index.tsx           → Entry redirect (auth check)
  +not-found.tsx      → 404 screen

──────────────────────────────────────────────

src/ — SOURCE CODE STRUCTURE

  design/
    colors.ts         → Color tokens (primary, semantic, status)
    typography.ts     → Font families, sizes, styles
    spacing.ts        → Spacing scale, layout constants
    shadows.ts        → Platform-aware shadow system
    radius.ts         → Border radius tokens
    animations.ts     → Spring configs, timing, stagger
    index.ts          → Re-exports everything

  components/
    ui/               → Primitive UI components
      Text/
        Text.tsx      → Typed text with font variants
        index.ts
      Button/
        Button.tsx    → Primary, secondary, ghost, danger, text
        IconButton.tsx → Circle icon button
        FAB.tsx       → Floating action button
        index.ts
      Input/
        TextInput.tsx → Floating label text input
        PhoneInput.tsx → Country code + number input
        OTPInput.tsx  → 6-box OTP input
        SearchInput.tsx → Search bar with clear button
        index.ts
      Badge/
        Badge.tsx     → Status, count, label badges
        OnlineBadge.tsx → Animated online indicator dot
        index.ts
      Avatar/
        Avatar.tsx    → Image + fallback initials + status dot
        AvatarGroup.tsx → Stacked avatars
        index.ts
      Chip/
        Chip.tsx      → Filter chip, selectable
        ChipGroup.tsx → Horizontal scrollable chip row
        index.ts
      Card/
        Card.tsx      → Base card container
        PressCard.tsx → Pressable card with press animation
        index.ts
      Rating/
        StarRating.tsx → Display-only star rating
        RatingInput.tsx → Interactive tap/drag rating
        index.ts
      Skeleton/
        Skeleton.tsx  → Base shimmer skeleton
        SkeletonWorkerCard.tsx
        SkeletonCategoryCard.tsx
        SkeletonBookingCard.tsx
        index.ts
      Switch/
        Switch.tsx    → Animated toggle switch
      Checkbox/
        Checkbox.tsx
      Divider/
        Divider.tsx
      Tag/
        Tag.tsx       → Service tags, skill tags
      ProgressBar/
        ProgressBar.tsx
        StepProgress.tsx → Booking flow step indicator
      Spinner/
        Spinner.tsx

    layout/
      Screen.tsx      → Safe area screen wrapper
      ScrollScreen.tsx → Scrollable screen wrapper
      Header.tsx      → App header variants
      TabBar.tsx      → Custom animated tab bar
      StickyFooter.tsx → Fixed bottom CTA area
      Section.tsx     → Section with header + content slot
      KeyboardAware.tsx → Keyboard avoiding wrapper
      BottomSheet/
        BottomSheet.tsx → Reanimated gesture bottom sheet
        BottomSheetHandle.tsx → Drag handle component
        index.ts
      Modal/
        Modal.tsx     → Full overlay modal
        ActionSheet.tsx → iOS-style action sheet
        index.ts

    feedback/
      Toast/
        Toast.tsx     → Slide-in toast notification
        ToastProvider.tsx → Toast queue manager
        index.ts
      EmptyState/
        EmptyState.tsx → Base empty state
        EmptyBookings.tsx
        EmptySearch.tsx
        EmptyCart.tsx
        EmptyNotifications.tsx
        index.ts
      ErrorState/
        ErrorState.tsx → Error with retry
        NetworkError.tsx → No connection error
      SuccessAnimation/
        SuccessLottie.tsx → Lottie success checkmark

    map/
      MapView.tsx
      WorkerMarker.tsx
      UserMarker.tsx
      JobSiteMarker.tsx
      RadiusCircle.tsx
      MapSearchBar.tsx
      MapBottomPanel.tsx
      MapWorkerCard.tsx
      LiveTrackPolyline.tsx

    worker/
      WorkerCard.tsx
      WorkerCardLarge.tsx
      WorkerCardHorizontal.tsx
      WorkerProfileHeader.tsx
      WorkerStats.tsx
      WorkerAvailabilityBadge.tsx
      WorkerSkillList.tsx
      WorkerServicesSection.tsx
      WorkerReviewCard.tsx
      WorkerReviewSummary.tsx
      WorkerPortfolioGrid.tsx

    booking/
      BookingCard.tsx
      BookingStatusBadge.tsx
      BookingStatusTimeline.tsx
      BookingPriceSummary.tsx
      BookingWorkerRow.tsx
      BookingActions.tsx
      BookingCountdown.tsx
      BookingCancelModal.tsx

    cart/
      CartItem.tsx
      CartSummary.tsx
      CartBadge.tsx
      AddToCartButton.tsx

    service/
      ServiceCard.tsx
      ServiceListItem.tsx
      ServicePriceTag.tsx
      ServiceCategoryCard.tsx
      ServiceBadge.tsx

    chat/
      MessageBubble.tsx
      ImageMessage.tsx
      SystemMessage.tsx
      TypingIndicator.tsx
      ChatInput.tsx
      ChatHeader.tsx
      MessageTimestamp.tsx
      MediaPicker.tsx

    home/
      HomeHeader.tsx
      CategoryGrid.tsx
      CategoryRow.tsx
      BannerCarousel.tsx
      NearbyWorkersList.tsx
      PopularServicesSection.tsx
      RecentBookingBanner.tsx
      SearchPromptBar.tsx
      LocationPill.tsx

    payment/
      PaymentMethodCard.tsx
      PaymentMethodPicker.tsx
      PriceSummaryCard.tsx
      StripeCardForm.tsx
      PaymentStatusBadge.tsx

    notification/
      NotificationItem.tsx
      NotificationBell.tsx

    address/
      AddressCard.tsx
      AddressPickerMap.tsx
      AddressSearchInput.tsx
      DefaultAddressBadge.tsx

    review/
      ReviewForm.tsx
      ReviewCard.tsx
      CategoryRatingRow.tsx
      ReviewReplyBubble.tsx

  hooks/
    useLocation.ts
    useNearbyWorkers.ts
    useWorkerProfile.ts
    useBookings.ts
    useActiveBooking.ts
    useBookingDetail.ts
    useChat.ts
    useSocket.ts
    useCart.ts
    useSearch.ts
    useCategories.ts
    useWorkerTracking.ts
    useNotifications.ts
    useInfiniteList.ts
    useHaptic.ts
    useKeyboard.ts
    useDebounce.ts
    useAppState.ts
    usePermissions.ts
    useAuth.ts

  store/
    auth.store.ts
    cart.store.ts
    location.store.ts
    ui.store.ts
    socket.store.ts
    index.ts

  services/
    api/
      client.ts       → Axios instance + interceptors
      auth.api.ts
      user.api.ts
      worker.api.ts
      booking.api.ts
      payment.api.ts
      chat.api.ts
      review.api.ts
      notification.api.ts
      search.api.ts
      category.api.ts
      location.api.ts
    socket/
      socket.service.ts
      chat.socket.ts
      location.socket.ts
    storage/
      secure.storage.ts
      local.storage.ts
    notifications/
      push.service.ts
    maps/
      geocoding.service.ts
      places.service.ts

  utils/
    distance.ts
    currency.ts
    date.ts
    validation.ts
    geohash.ts
    phone.ts
    avatar.ts
    booking.ts
    analytics.ts
    logger.ts

  types/
    user.types.ts
    worker.types.ts
    booking.types.ts
    service.types.ts
    chat.types.ts
    payment.types.ts
    notification.types.ts
    location.types.ts
    review.types.ts
    api.types.ts
    navigation.types.ts

  config/
    env.ts
    queryClient.ts
    stripe.ts
    maps.ts
    fonts.ts

  providers/
    AppProviders.tsx
    AuthProvider.tsx
    LocationProvider.tsx
    SocketProvider.tsx
    NotificationProvider.tsx

  features/
    (empty for now — feature slices added from Day 10+)

──────────────────────────────────────────────

assets/
  images/
    icon.png
    adaptive-icon.png
    splash.png
    logo.png
    onboarding-1.png
    onboarding-2.png
    onboarding-3.png
    empty-bookings.png
    empty-search.png
    empty-cart.png

  animations/
    success.json        → Lottie green checkmark
    loading.json        → Lottie spinner
    location-pulse.json → Lottie searching animation
    payment-success.json → Lottie payment confirmed
    confetti.json       → Lottie celebration particles

  icons/
    categories/
      electrician.svg
      plumber.svg
      ac-repair.svg
      cleaning.svg
      carpenter.svg
      painter.svg
    app/
      icon.png
      adaptive-icon.png

  fonts/
    Poppins-Regular.ttf
    Poppins-Medium.ttf
    Poppins-SemiBold.ttf
    Poppins-Bold.ttf
    Poppins-ExtraBold.ttf
    PlusJakartaSans-Regular.ttf
    PlusJakartaSans-Medium.ttf
    PlusJakartaSans-SemiBold.ttf
    PlusJakartaSans-Bold.ttf
    Inter-Regular.ttf
    Inter-Medium.ttf
    Inter-SemiBold.ttf
    Inter-Bold.ttf
    Inter-ExtraBold.ttf
```

---

### Barrel Export Strategy (index.ts Files)

```
PURPOSE OF BARREL EXPORTS:
  Every component folder has an index.ts
  This enables clean imports throughout the app

WITHOUT barrel export:
  import { Button } from '@components/ui/Button/Button'
  import { IconButton } from '@components/ui/Button/IconButton'

WITH barrel export (index.ts re-exports both):
  import { Button, IconButton } from '@components/ui/Button'

RECOGNITION OVER RECALL:
  Developer doesn't need to remember the exact file name.
  They import from the domain: '@components/ui/Button'
  The barrel handles the internal file mapping.

BARREL EXPORT RULE:
  Only create barrel exports where imports will be shared.
  Don't over-abstract. One level of barrel is enough.
  ui/index.ts → dangerous (too broad)
  ui/Button/index.ts → correct (component-level)
```

---

### Verification Checkpoint 1.5

```
BEFORE MOVING TO TASK 1.6, VERIFY:
  □ Every folder listed above exists
  □ Every index.ts barrel file is created (empty exports for now)
  □ tree src/ shows the complete structure
  □ tree app/ shows all route files (empty but existing)
  □ No folder is missing from the plan above
  □ All component files created as empty exports
    (e.g., export const Button = () => null; for now)
    This prevents import errors from Day 2 onward
```

---

## Task 1.6 — Design Token System
### Duration: 90 minutes
### Responsible: Lead developer (UI-focused)

---

### What Happens in This Task

```
PURPOSE:
  Build the complete design token system in 6 files.
  These files are the DNA of the entire visual system.
  Every color, font, size, shadow, radius, and animation
  in the app comes from these tokens — never hardcoded.

GOAL GRADIENT EFFECT:
  6 files to complete. Each one finished = visible progress.
  Order: most important first (Serial Position Effect).
  1. colors.ts    → Emotional foundation
  2. typography.ts → Readability foundation
  3. spacing.ts   → Layout foundation
  4. shadows.ts   → Depth foundation
  5. radius.ts    → Form foundation
  6. animations.ts → Motion foundation

THE CARDINAL RULE:
  No color, font size, shadow, or radius is ever hardcoded
  in any component file.
  Everything comes from design tokens.

  BAD: backgroundColor: '#16A34A'
  GOOD: backgroundColor: colors.primary

  BAD: fontSize: 28
  GOOD: fontSize: fontSize.h1

  BAD: borderRadius: 16
  GOOD: borderRadius: radius.lg
```

---

### File 1: `src/design/colors.ts`

```
PURPOSE:
  Complete color system with semantic naming.
  Every color has a PURPOSE, not just a value.

THREE LEVELS OF COLOR:

  LEVEL 1 — Palette (raw values):
    Defines all available colors in the system.
    Organized by hue + scale.
    Never used directly in components.

    Green scale: green50 through green900
    Neutral scale: white, zenWhite, lowGray, iceGray, mintHaze,
                   softGray, gray50 through gray900
    Semantic raw: warning, warningLight, warningDark,
                  danger, dangerLight, dangerDark,
                  info, infoLight, infoDark

  LEVEL 2 — Semantic colors (named by PURPOSE):
    Components use these — never the raw palette.

    Brand:
      primary         → All CTAs, active states, key icons
      primaryDark     → Press states of primary
      primaryLight    → Online indicators, success signals
      primaryTint     → Background tints, chip backgrounds
      primaryBorder   → Subtle green borders

    Backgrounds (context-specific):
      bgApp           → #FAFAFA — base screen background
      bgCard          → #FFFFFF — cards, input fields
      bgInput         → #F4F5F7 — text input backgrounds
      bgSection       → #F8F9FA — grouped sections
      bgSuccess       → #F0FDF4 — success/verified containers
      bgSkeleton      → #EFF0F3 — skeleton shimmer base

    WHY THESE SPECIFIC BGs:
      bgApp (#FAFAFA not #FFFFFF): Pure white shows dirty on OLED.
      Slightly warm gray feels premium, reduces eye strain.
      bgCard (#FFFFFF): Cards pop against bgApp with shadow.
      bgInput (#F4F5F7): Inputs clearly distinguished from bg.
      bgSuccess (#F0FDF4): Green tint signals positive context
      without using full green (would overpower).

    Text:
      textPrimary    → #0F172A — main headings, important info
      textSecondary  → #475569 — body text, descriptions
      textMuted      → #94A3B8 — timestamps, metadata
      textDisabled   → #CBD5E1 — disabled fields and labels
      textOnGreen    → #FFFFFF — text on green backgrounds
      textGreen      → #15803D — green text (links, labels)
      textDanger     → #EF4444 — error messages
      textWarning    → #92400E — warning messages

    Borders:
      border         → #E2E8F0 — default borders, dividers
      borderFocus    → #16A34A — focused input border
      borderError    → #EF4444 — error state border
      borderSuccess  → #22C55E — success/verified border

    Status indicators:
      online         → #22C55E — worker online dot
      offline        → #94A3B8 — worker offline
      busy           → #F59E0B — worker on another job

  LEVEL 3 — Booking status color map:
    Maps each booking status to a complete color set.

    PENDING:
      bg:     #FEF3C7  (amber light)
      border: #F59E0B  (amber)
      text:   #92400E  (amber dark)
      dot:    #F59E0B  (amber)

    ACCEPTED:
      bg:     #EFF6FF  (blue light)
      border: #3B82F6  (blue)
      text:   #1E40AF  (blue dark)
      dot:    #3B82F6  (blue)

    IN_PROGRESS:
      bg:     #F0FDF4  (green light)
      border: #22C55E  (green)
      text:   #14532D  (green dark)
      dot:    #22C55E  (green, pulsing)

    COMPLETED:
      bg:     #F8FAFC  (cool gray)
      border: #CBD5E1
      text:   #475569
      dot:    #94A3B8

    CANCELLED:
      bg:     #FEF2F2  (red light)
      border: #EF4444
      text:   #991B1B  (red dark)
      dot:    #EF4444

  EXPORT: ColorKey type for typed color references
```

---

### File 2: `src/design/typography.ts`

```
PURPOSE:
  Three-font system with clear role assignment.
  Type scale with pre-composed styles.

THREE FONTS, THREE ROLES:

  POPPINS — Brand / Display / CTAs
  ─────────────────────────────────
  CHARACTER: Geometric, warm, confident, friendly
  USE IT FOR: Screen titles, section headers, button labels,
              onboarding headlines, marketing-adjacent text

  WHY POPPINS FOR BRAND:
    Rounded geometry = approachable (service app should feel warm)
    High personality = memorable brand voice
    Strong at large sizes = commands attention in hero text
    Used by: Canva, Notion — familiar premium association

  WEIGHTS NEEDED:
    Regular (400), Medium (500), SemiBold (600),
    Bold (700), ExtraBold (800)

  PLUS JAKARTA SANS — Body / UI
  ──────────────────────────────
  CHARACTER: Modern, clean, neutral, professional
  USE IT FOR: Body text, descriptions, card content, reviews,
              list items, form labels, any UI text

  WHY JAKARTA SANS FOR BODY:
    Neutral = doesn't compete with Poppins branding
    Clean at small sizes = readable at 12px (caption)
    Modern feel without personality (lets content speak)
    Excellent legibility = reduces reading friction

  WEIGHTS NEEDED:
    Regular (400), Medium (500), SemiBold (600), Bold (700)

  INTER — Data / Numbers
  ──────────────────────
  CHARACTER: Humanist, precise, technical, trustworthy
  USE IT FOR: Prices, ratings, distances, countdown timers,
              OTP digits, booking IDs, invoice numbers

  WHY INTER FOR DATA:
    JAKOB'S LAW: Inter is what Stripe, Uber, Airbnb use for numbers
    Users associate Inter with trustworthy financial data
    Tabular numbers: digits same width = aligned number columns
    Excellent at small sizes (11px still perfectly readable)

  WEIGHTS NEEDED:
    Regular (400), Medium (500), SemiBold (600),
    Bold (700), ExtraBold (800)

TYPE SCALE:
  Token      Size   Font           Role
  display    36px   Poppins Bold   Hero numbers, large stats
  h1         28px   Poppins Bold   Screen titles
  h2         22px   Poppins Bold   Section headers
  h3         18px   Poppins SB     Card titles, drawer headers
  h4         16px   Poppins SB     Sub-headings
  body1      16px   Jakarta Reg    Primary body text
  body2      14px   Jakarta Reg    Secondary text, descriptions
  label      14px   Jakarta Med    Button labels, tab labels
  caption    12px   Jakarta Reg    Metadata, timestamps, hints
  micro      11px   Jakarta Med    Badges, chip labels
  nano       10px   Jakarta SB     Nano status tags
  dataXL     28px   Inter Bold     Large prices, display numbers
  dataLG     20px   Inter Bold     Section prices, key stats
  dataMD     16px   Inter SB       Inline prices, ratings
  dataSM     13px   Inter Med      Small prices, distances
  dataXS     11px   Inter Reg      Receipt numbers, booking IDs

PRE-COMPOSED textStyles OBJECT:
  Each token becomes a ready-to-use style object.
  Component writes: style={textStyles.h1}
  Not: fontFamily: 'Poppins-Bold', fontSize: 28, lineHeight: 36
  Recognition over Recall — developer applies the token, not the values.

LINE HEIGHTS (all 1.4× minimum):
  display: 44px   h1: 36px    h2: 30px    h3: 26px
  body1: 24px     body2: 20px  label: 20px  caption: 18px

LETTER SPACING:
  tight:   -0.5px  → Poppins display (large text tighten slightly)
  normal:   0px    → Standard body text
  wide:     0.2px  → Caption text (improves small size readability)
  wider:    0.5px  → Micro badges
  widest:   1.0px  → Uppercase labels (if used)
```

---

### File 3: `src/design/spacing.ts`

```
PURPOSE:
  8pt grid system for all spacing decisions.
  Touch target constants for Fitts' Law compliance.

8-POINT GRID:
  ALL values are divisible by 4.
  NEVER use 5, 7, 9, 11, 13, 15.
  Why: Pixel-perfect rendering, consistent visual rhythm,
       consistent with design tools (Figma defaults to 8pt)

BASE TOKENS:
  none: 0
  xs:   4px   → Icon internal padding, tiny gaps
  sm:   8px   → Between related items, icon-text gaps
  md:   12px  → Small internal padding
  base: 16px  → Standard padding, screen margins
  lg:   20px  → Comfortable section padding
  xl:   24px  → Section gaps, comfortable spacing
  2xl:  28px  → Large section padding
  3xl:  32px  → Major section separators
  4xl:  40px  → Hero sections
  5xl:  48px  → Extra large gaps
  6xl:  64px  → Illustration spacing
  7xl:  80px  → Very large structural spacing
  8xl:  96px  → Maximum structural spacing

LAYOUT CONSTANTS (FITTS' LAW COMPLIANCE):

  Screen margins:
    screenPaddingH: 16px  → Always 16px horizontal (Recognition)
    screenPaddingV: 20px  → Top/bottom screen padding

  Card spacing:
    cardPaddingH: 16px    → Inside cards
    cardPaddingV: 14px    → Inside cards
    cardGap: 10px         → Between cards in list

  Section spacing:
    sectionGap: 24px      → Between major screen sections

  Touch targets (FITTS' LAW):
    minTouchTarget: 44px  → iOS HIG minimum (never go below)
    minTouchAndroid: 48px → Material Design minimum

    EXPLANATION:
      Fitts' Law: time to hit target ∝ 1/size + distance
      44px minimum = research-validated tap accuracy threshold
      Going below = frustrated users who miss targets

  Button heights (critical for CTA hierarchy):
    primaryButtonH: 52px  → Main CTAs (Book, Pay, Confirm)
    secondaryButtonH: 44px → Secondary actions
    compactButtonH: 36px  → Inline compact actions

    EXPLANATION:
      52px primary = generous target for the most important action
      44px secondary = still comfortable, clearly subordinate
      36px compact = acceptable for low-priority inline actions
      Height difference communicates visual hierarchy instantly

  Input field:
    inputH: 52px          → Same as primary button (visual rhythm)
    inputPaddingH: 16px
    inputBorderRadius: 12px
    inputLabelGap: 6px    → Between floating label and field border

  Bottom sheet:
    handleH: 4px          → The drag handle bar
    handleW: 40px         → Jakob's Law: this is universal
    paddingH: 20px        → Inside the sheet
    paddingV: 20px

  Tab bar:
    tabBarH: 60px         → Height of custom tab bar
    paddingBottom: 8px    → Extra for home indicator area

GRID CONSTANTS:
  categoryCardSize: 106px  → (375 - 32 - 24) / 3 = 3 cols
  categoryCardH: 100px     → Height of category card
  categoryGap: 12px        → Gap between category cards
  portfolioColGap: 4px     → Tight grid for portfolio images
  searchResultGap: 10px    → Between search result cards
```

---

### File 4: `src/design/shadows.ts`

```
PURPOSE:
  Platform-aware shadow system.
  iOS: shadowColor, shadowOffset, shadowRadius, shadowOpacity
  Android: elevation (integer 0-24)

WHY SHADOWS MATTER FOR UX:
  PEAK-END RULE: The tactile sensation of pressing a card
  (shadow reduces → element feels physically pressed)
  creates a tiny but memorable micro-moment.
  This is the "peak" of every card tap interaction.

SHADOW LEVELS:

  none     → Flat elements, list items without depth
  xs       → Input field focus glow, subtle rings
  sm       → Cards at rest (standard cards)
  md       → Cards on hover/selected state
  lg       → Bottom sheets, floating elements
  xl       → Map overlay cards, dropdown menus
  2xl      → Full modals, critical alerts
  pressed  → Press state (near-flat, element "pushed in")
  mapCard  → Special: must float visibly above map layer

THE PRESSING METAPHOR:
  Card at rest: shadow-sm (floating slightly)
  Card pressed: shadow near-none (pressed INTO surface)
  Card released: spring back to shadow-sm
  This physical metaphor feels natural to users.
  It's the invisible layer of UX that builds trust.

PLATFORM DETECTION:
  Platform.OS === 'android' → return { elevation: N }
  Platform.OS === 'ios'     → return { shadowColor, shadowOffset, ... }
  This must be resolved at RUNTIME not compile time.
  createShadow helper function handles this automatically.

ANDROID ELEVATION EQUIVALENTS:
  sm:  elevation 2
  md:  elevation 4
  lg:  elevation 8
  xl:  elevation 12
  2xl: elevation 16
```

---

### File 5: `src/design/radius.ts`

```
PURPOSE:
  Border radius tokens for consistent corner rounding.

JAKOB'S LAW APPLICATION:
  Rounded corners are expected in modern mobile apps.
  Uber, Airbnb, Instagram, WhatsApp — all heavily rounded.
  Sharp corners feel aggressive, old, or broken.
  Our radius system ensures professional, modern feel.

RADIUS SCALE:
  none:    0px   → Full-bleed images, edge-to-edge maps
  xs:      6px   → Micro badges, nano tags
  sm:      8px   → Input addons, secondary chips
  md:      12px  → Input fields, image thumbnails, small cards
  lg:      16px  → Standard cards (MOST USED)
  xl:      20px  → Large cards, profile sections
  2xl:     24px  → Banner cards, bottom sheet top corners
  3xl:     32px  → Hero sections, very large containers
  pill:    100px → Buttons, status pills, chip filters (SECOND MOST USED)
  circle:  9999  → Avatars, map markers, icon buttons

THE NESTING RULE (Critical for visual harmony):
  Inner element radius = Outer element radius - 4px

  Example:
    Worker card: radius.lg (16px)
    Worker avatar inside card: radius.circle (avatars always circle)
    Service image inside card: radius.md (12px) = 16 - 4
    Price badge on service image: radius.pill

  WHY:
    If inner element has SAME radius as outer: looks disconnected
    If inner has LARGER radius: looks wrong
    Inner minus 4px = visual harmony

MOST USED:
  radius.lg (16px)  → All cards throughout the app
  radius.pill       → All buttons, chips, badges
  radius.md (12px)  → All input fields
  radius.circle     → All avatars, dots, icon buttons
```

---

### File 6: `src/design/animations.ts`

```
PURPOSE:
  Animation configuration system.
  Every animation in the app uses these configs.
  Consistent motion language across 60 days of development.

WHY ANIMATIONS NEED A DESIGN SYSTEM:
  Without this file:
    Dev 1 uses { damping: 15, stiffness: 200 }
    Dev 2 uses { damping: 20, stiffness: 150 }
    Result: inconsistent, janky feel across screens

  With this file:
    Both devs use springConfig.bouncy
    Result: identical feel everywhere

SPRING CONFIGS:

  gentle:
    damping: 20, stiffness: 150
    Feel: Slow, soft, elegant
    Use: Page transitions, bottom sheets, large-area motions
    Example: Bottom sheet sliding up from bottom

  default:
    damping: 18, stiffness: 220
    Feel: Standard, clean, professional
    Use: Most UI element movement, cards, list items
    Example: Worker card entering list

  snappy:
    damping: 22, stiffness: 350
    Feel: Quick, decisive, responsive
    Use: Buttons, toggles, fast feedback
    Example: Filter chip selection

  bouncy:
    damping: 10, stiffness: 280
    Feel: Playful, alive, energetic (slight overshoot)
    Use: Cart add, badges, positive feedback, success moments
    PEAK-END RULE: This overshoot IS the peak of micro-interactions.
    The slight overshoot makes the animation feel human and alive.
    Example: Number badge appearing when item added to cart

  stiff:
    damping: 30, stiffness: 500
    Feel: Instant, firm, authoritative
    Use: Dismiss, close, error shake
    Example: Modal closing on tap outside

TIMING CONFIGS (for non-spring animations):
  instant:    100ms → Color switches, opacity flips
  fast:       150ms → Border colors, background changes
  normal:     250ms → Standard state transitions
  slow:       400ms → Large visual changes
  deliberate: 600ms → Onboarding moments, first-use experiences

STAGGER VALUES:
  tight:  30ms → List items staggering in (fast enough to not feel slow)
  normal: 50ms → Category cards, notification items
  loose:  80ms → Onboarding steps, review sub-categories
  slow:   120ms → Hero content reveals

SHAKE SEQUENCE:
  Pattern: [-8, 8, -6, 6, -4, 4, 0] pixels, 45ms each
  Total: ~315ms
  Use: Form errors (input shakes = "error is HERE in this field")
  JAKOB'S LAW: This shake pattern matches every app users know.
  They instantly associate shake = error = check this field.

MICRO-INTENTION PHILOSOPHY:
  Every animation must INTEND something. If it has no intention,
  it should be removed.

  ✅ INTENTIONAL:
     Button scale down = "I received your tap"
     Button scale up (bouncy) = "I responded with energy"
     Input shake = "Something is wrong HERE"
     Progress bar fill = "You're making progress toward your goal"

  ❌ NOT INTENTIONAL:
     Random fade on component mount (no communicative purpose)
     Parallax effect that doesn't add context
     Animation that plays after the event it should signal

INDEX.ts:
  Re-exports all 6 files as named exports.
  One import gets everything: import { colors, spacing } from '@design'
```

---

### Verification Checkpoint 1.6

```
BEFORE ENDING DAY 1, VERIFY:
  □ src/design/colors.ts — all 3 levels (palette, semantic, status)
  □ src/design/typography.ts — 3 font families, 15 tokens, textStyles
  □ src/design/spacing.ts — 8pt grid, layout constants, Fitts' targets
  □ src/design/shadows.ts — 8 levels, platform-aware, createShadow helper
  □ src/design/radius.ts — 10 tokens, nesting rule documented
  □ src/design/animations.ts — 5 spring configs, timing, stagger, shake
  □ src/design/index.ts — re-exports all 6 files
  □ tsc --noEmit runs clean on all design files
  □ Import from '@design/colors' works (alias resolves)
  □ Import from '@design' works (index.ts barrel works)

NO COLOR OR SIZE IS HARDCODED ANYWHERE ELSE.
If found: fix it. This is the first technical debt of Day 1.
```

---

## Day 1 — Complete Deliverable Checklist

```
MORNING SESSION:
  □ Expo project initialized with expo-router TypeScript template
  □ tsconfig.json: strict mode + 10 path aliases
  □ .eslintrc.js: 6 key rules including no-any and no-console
  □ .prettierrc: 7 formatting rules
  □ babel.config.js: module-resolver + reanimated plugin (LAST)
  □ All 40+ packages installed with zero peer dependency errors
  □ app.config.ts: iOS + Android permissions, plugins, env vars
  □ .env file created with 4 environment variables
  □ .env.example committed with empty values
  □ eas.json: development, staging, production profiles
  □ Husky pre-commit hook active
  □ commitlint rejects bad commit messages
  □ lint-staged runs eslint + prettier on staged files
  □ package.json scripts: start, ios, android, lint, type-check, format

AFTERNOON SESSION:
  □ 80+ folders created in src/ and app/
  □ All Expo Router routes scaffolded in app/
  □ Every component file created as empty placeholder export
  □ Every index.ts barrel file created in component folders
  □ 14 font files downloaded into assets/fonts/
  □ src/design/colors.ts — 3 levels, typed
  □ src/design/typography.ts — 3 font families, 15 scale tokens,
    pre-composed textStyles, Poppins/Jakarta/Inter roles documented
  □ src/design/spacing.ts — 8pt grid, layout constants,
    Fitts' Law touch targets, component-specific spacing
  □ src/design/shadows.ts — 8 levels, platform-aware createShadow,
    pressed state, mapCard special case
  □ src/design/radius.ts — 10 tokens, nesting rule documented
  □ src/design/animations.ts — 5 spring configs, timing, stagger,
    shake sequence, micro-intention philosophy documented
  □ src/design/index.ts — barrel export for all 6 tokens

QUALITY GATES:
  □ expo start → app loads on iOS simulator
  □ expo start → app loads on Android emulator
  □ tsc --noEmit → zero errors
  □ eslint . → zero warnings
  □ All imports using @design/* alias resolve correctly
  □ No hardcoded colors, sizes, or radii anywhere outside design/
```

---

## Day 1 — UX Laws Final Audit

```
Check each law was applied on Day 1:

RECOGNITION OVER RECALL:
  ✅ Path aliases: @components not ../../components
  ✅ Folder names are self-documenting domains
  ✅ Token names describe PURPOSE not value (primary not green600)
  ✅ Component files named by what they ARE (WorkerCard not Card)

FITTS' LAW:
  ✅ Touch target constants in spacing.ts (44px min, 48px Android)
  ✅ Button height hierarchy defined (52 / 44 / 36px)
  ✅ Screen padding constants prevent edge placement
  ✅ Bottom CTA position strategy documented

HICK'S LAW:
  ✅ One library per category — decision table documented
  ✅ One animation library (Reanimated 3 only)
  ✅ One state library (Zustand only)
  ✅ One HTTP library (Axios only)
  ✅ Color system: semantic names reduce color choice from 50+ to ~15

JAKOB'S LAW:
  ✅ Feature-based folder structure (industry standard)
  ✅ Conventional commits (industry standard)
  ✅ ESLint + Prettier (industry standard)
  ✅ TypeScript strict (industry standard)
  ✅ Husky git hooks (industry standard)

PEAK-END RULE:
  ✅ animations.ts: bouncy spring is the "peak" of micro-interactions
  ✅ animations.ts: peak moments documented (OTP, booking, cart add)
  ✅ shadows.ts: pressed state creates physical "peak" on tap

GOAL GRADIENT EFFECT:
  ✅ 6 design token files = 6 visible milestones in afternoon
  ✅ Each file completed = dopamine of visible progress
  ✅ Checklist format = visible completion state

SERIAL POSITION EFFECT:
  ✅ design/index.ts exports in importance order (colors first)
  ✅ Token scales list most-used values first
  ✅ Type scale: display → h1 → h2 → h3 → body → caption
  ✅ Spring configs: gentle → default → snappy → bouncy → stiff
  ✅ Spacing: most common gaps defined before rare ones
```

---

## Day 1 — What's Ready for Day 2

```
After Day 1, the following are ready for immediate use:

FOUNDATION:
  → Any developer can clone the repo and run in 5 minutes
  → All imports work via aliases (@components/*, @design/*)
  → TypeScript strict mode catches all type errors
  → Linting enforces code quality automatically
  → Commit messages are standardized

DESIGN SYSTEM:
  → Any component can use: colors.primary, textStyles.h1
  → Any component can use: spacing.base, radius.lg, shadows.sm
  → Any animation can use: springConfig.bouncy, timingConfig.fast
  → Any button can reference: layout.primaryButtonH (52px)

STRUCTURE:
  → Any screen file can be created in its correct location
  → Any component import resolves to correct empty placeholder
  → Every domain has its folder: auth/, worker/, booking/, etc.

TOMORROW (Day 2):
  → Build Text, Button, TextInput, OTPInput components
  → Build app/_layout.tsx (root layout with font loading)
  → These components use the tokens built today
  → They depend on the aliases set up today
  → Everything built today enables Day 2 to move fast
```

---

## Typography Usage Examples (Quick Reference for Day 2+)

```
SCREEN TITLES (Poppins Bold):
  "Find Trusted Help"
  "Enter your phone number"
  "Booking Confirmed!"

SECTION HEADERS (Poppins SemiBold):
  "Services Near You"
  "Upcoming Bookings"

BODY TEXT (Jakarta Sans Regular):
  "Experienced electrician with 8+ years..."
  "Your worker is on the way"

BUTTON LABELS (Poppins SemiBold):
  "Book Now"
  "Get Started"
  "Continue"

PRICES (Inter Bold):
  "Rs 1,200"
  "From Rs 500"
  "Rs 1,840 total"

RATINGS (Inter SemiBold):
  "4.9"
  "4.8 ⭐"

OTP DIGITS (Inter Bold, large):
  "8  4  2  1  9  6"

DISTANCES (Inter Medium):
  "1.2 km"
  "450 m away"

TIMESTAMPS/METADATA (Jakarta Regular, muted):
  "2 min ago"
  "Jan 16 · 10:00 AM"

BOOKING IDs (Inter Regular, muted):
  "#TL-20451"
```

---

*Tasklync — Day 1 Implementation Plan*
*No code. Pure engineering + UX thinking.*
*25 years of experience distilled into one day's plan.*
*Foundation that holds for 60 days and beyond.*
