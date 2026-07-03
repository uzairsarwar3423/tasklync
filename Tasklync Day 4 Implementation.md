# Tasklync — Day 4 Implementation Plan
## Data Layer · Tab Navigator Shell · Home Screen (Top Half)
### Senior React Native Expo | 25 Years | Pure Implementation Plan — Zero Code

> **No code in this document.**
> Every file has a purpose. Every decision has a reason.
> Every micro-interaction maps to a UX law.
> This is engineering thinking made visible.

---

## Day 4 Philosophy

```
"Users don't experience your architecture.
 They experience the speed of what it enables."

Day 1: Grammar (design tokens)
Day 2: Vocabulary (primitive components)
Day 3: First sentences (auth screens + auth state)
Day 4: Infrastructure + First Act (data layer + home screen enters)

The user has just logged in for the first time.
They land on the Home screen for the first time.
This is the moment of truth — did they make the right choice
downloading Tasklync?

The Home screen above the fold (what they see WITHOUT scrolling)
must answer 3 questions instantly:
  1. "What can I do here?" (category grid)
  2. "Are there workers near me right now?" (nearby workers)
  3. "Is this app alive and current?" (online dots, live data)

If those 3 questions are answered in under 2 seconds:
user is converted. They'll book.

Day 4 builds the data infrastructure that feeds those 3 answers
and builds the top half of the Home screen that asks them.
```

---

## What Day 3 Gave Us (Non-Negotiable Prerequisites)

```
MUST BE COMPLETE AND VERIFIED:

AUTH SYSTEM:
  ✅ useAuthStore — user, tokens, authState, all actions
  ✅ auth.api.ts — sendOtp, verifyOtp, refreshToken
  ✅ AuthProvider — route guard, token hydration
  ✅ auth flow — welcome → phone → otp → name → location → tabs
  ✅ accessToken auto-attached to every Axios request
  ✅ Token refresh queue (failed requests retry after refresh)

STORES (auth.store.ts from Day 3):
  ✅ useCartStore — items, workerId, addItem, removeItem, total
  ✅ useUIStore — toasts queue, showToast, dismissToast
  ✅ useLocationStore — currentLocation, currentCity, permissionStatus
  ✅ useSocketStore — placeholder (to be implemented Day 7)

INFRASTRUCTURE:
  ✅ queryClient.ts — staleTime 30s, retry 2, offlineFirst
  ✅ @design/* alias — all 6 token files
  ✅ @components/* alias — Text, Button, OTPInput, etc.
  ✅ @store/* alias — all Zustand stores
  ✅ @services/* alias — auth.api.ts
  ✅ @hooks/* alias — useAuth.ts

MISSING BEFORE DAY 4 CAN START:
  These exist as empty placeholders from Day 1 folder creation.
  Day 4 fills them with real implementation.
```

---

## UX Laws Master Reference for Day 4

```
Today applies UX laws at TWO layers simultaneously:
  Layer 1: Data architecture (invisible to users, visible to developers)
  Layer 2: Home screen UI (directly visible to users every session)

Both layers matter for UX. Architecture determines perceived speed.
Speed is the most powerful UX lever in mobile.

┌──────────────────────────────────────────────────────────────────────┐
│  UX LAW              DAY 4 APPLICATION                               │
├──────────────────────────────────────────────────────────────────────┤
│  RECOGNITION         Home screen: Category grid uses ICONS not text  │
│  OVER RECALL         alone. ⚡ = electrician. 🔧 = plumber.          │
│                      User recognizes category from icon in 150ms.    │
│                      Without icon: reads text in 400ms. 2.6× slower. │
│                                                                      │
│                      Location pill: shows CITY NAME ("Lahore")       │
│                      User recognizes their city = "this is local"    │
│                      vs showing coordinates or "Current Location"    │
│                                                                      │
│                      Skeleton screens: same shape as real content    │
│                      User recognizes "loading" without text saying   │
│                      "Loading..." (which induces anxiety)            │
├──────────────────────────────────────────────────────────────────────┤
│  FITTS' LAW          Tab bar: 4 tabs, each 25% of screen width      │
│                      Width × height = massive touch area per tab     │
│                      No user ever misses a tab (unlike small icons)  │
│                                                                      │
│                      Category cards: 106×100px each                 │
│                      3 per row, generous size, close together        │
│                      No precision targeting needed                   │
│                                                                      │
│                      Search bar: full-width, 52px height            │
│                      Not a button — a tap target that navigates      │
│                      Widest possible = most accessible               │
│                                                                      │
│                      "See all →" links: deliberately small          │
│                      Small size = low visual priority = Fitts' law  │
│                      intentionally making secondary CTA harder to   │
│                      find than primary (Book) — by design            │
├──────────────────────────────────────────────────────────────────────┤
│  HICK'S LAW          Home screen shows MAX 6 categories              │
│                      Not 12. Not "all". 6.                          │
│                      6 options = ~2.58 bits of information           │
│                      Decision time: ~1.2 seconds                     │
│                      12 options = ~3.58 bits = ~2.4 seconds          │
│                      For a service app: 1.2s decision = acceptable   │
│                      2.4s decision = user might scroll past          │
│                                                                      │
│                      Tab bar: 4 tabs. Not 5. Not 6.                 │
│                      iOS HIG recommends ≤5. We use 4.               │
│                      4 = fewer than user's fingers = instantly clear │
│                                                                      │
│                      useNearbyWorkers: returns top 8 workers only    │
│                      Not 20. Not "all nearby". 8.                   │
│                      Scrollable list of 8 = manageable choice set   │
├──────────────────────────────────────────────────────────────────────┤
│  JAKOB'S LAW         Tab bar: bottom-positioned, icon+label          │
│                      Every major app: Uber, Airbnb, Instagram        │
│                      Users' thumbs go there without thinking         │
│                                                                      │
│                      Home screen layout: greeting → search → cats   │
│                      → this IS the Urban Company / TaskRabbit layout │
│                      Users who've used ANY service app recognize it  │
│                                                                      │
│                      Category grid: 2 rows × 3 cols                  │
│                      NOT 1 row scroll, not 4 cols                   │
│                      2×3 = every Indian/Pakistani service app        │
│                      (UrbanClap, Housejoy, TaskRabbit all do this)  │
├──────────────────────────────────────────────────────────────────────┤
│  PEAK-END RULE       Home screen's PEAK moment:                      │
│                      Skeleton → real content reveal                  │
│                      When categories load: they don't just appear    │
│                      They stagger in (50ms intervals) with spring    │
│                      6 cards bouncing in = satisfying reveal         │
│                                                                      │
│                      Tab switching PEAK:                             │
│                      Active tab icon scales + fills with color       │
│                      The green fill = affirmation of location        │
│                      Users touch tab → feels immediately correct     │
│                                                                      │
│                      Home screen END moment:                         │
│                      "Welcome, Ali! 👋" toast from Day 3             │
│                      Still visible when Home screen loads            │
│                      User: "The app welcomed me. That's nice."       │
├──────────────────────────────────────────────────────────────────────┤
│  GOAL GRADIENT       Nearby workers section:                         │
│  EFFECT              Shows worker card with "Book" button visible     │
│                      User is 2 taps away from booking               │
│                      (tap worker → tap Book) = feeling of proximity  │
│                      to goal drives booking behavior                 │
│                                                                      │
│                      staleTime 30s on queries:                       │
│                      If user opens app, browses, comes back 25s later│
│                      → Instant (from cache)                         │
│                      → User feels: "I'm so close to booking"        │
│                      No loading = no interruption to goal pursuit    │
│                                                                      │
│                      Category load: shimmer → content               │
│                      Visual progress: even loading communicates      │
│                      "we're almost there, categories are loading"   │
├──────────────────────────────────────────────────────────────────────┤
│  SERIAL POSITION     Home screen top (FIRST seen):                   │
│  EFFECT              HomeHeader (location + greeting + notification) │
│                      FIRST thing visible = most remembered           │
│                      Greeting personalizes: "Good morning, Ali"      │
│                      User: "This app knows me. Trust established."   │
│                                                                      │
│                      Home screen bottom of fold (LAST before scroll):│
│                      Category grid = most acted-upon element         │
│                      Serial position + Fitts' = perfect placement    │
│                                                                      │
│                      Tab bar LAST (always at bottom):                │
│                      Most important navigation = last/bottom         │
│                      Users remember the tab bar above all else       │
│                      They return to it naturally                     │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Typography in Day 4 Components

```
RULE: Applied consistently. No exceptions. No "I'll fix it later."

TAB BAR:
  Tab label:         Plus Jakarta Sans Medium, 10px
                     Why Jakarta not Poppins: labels are UI, not brand
                     Why Medium not Regular: needs to stand at 10px
  Active tab color:  colors.primary (#16A34A)
  Inactive tab color: colors.textMuted (#94A3B8)

HOME HEADER:
  Greeting "Good morning":  Plus Jakarta Sans Regular, 14px, muted
  User name "Ali":          Poppins SemiBold, 14px, primary
  (Combined: "Good morning, Ali" — mixed inline typography)
  Location city name:       Plus Jakarta Sans Medium, 13px, textPrimary
  "+92..." or dial:         Inter Medium (phone-adjacent = data = Inter)

SEARCH BAR (prompt):
  "What do you need?"       Plus Jakarta Sans Regular, 15px, muted
  This is placeholder text, not an active input

SECTION HEADERS:
  "Services"                Poppins SemiBold, 16px (h4), textPrimary
  "Near You"                Poppins SemiBold, 16px (h4), textPrimary
  "See all →"               Plus Jakarta Sans Medium, 13px, green

CATEGORY CARDS:
  Category name:            Plus Jakarta Sans SemiBold, 12px, textPrimary
  (Small card = small text — Jakarta keeps it legible at 12px)

NOTIFICATION BADGE:
  Count number:             Inter Bold, 10px, white
  Why Inter: it's a number, always Inter

API/DATA LAYER (no visible typography):
  These layers have no UI — no typography decisions needed

QUICK REFERENCE FOR DAY 4:
  Brand/Headlines:  Poppins
  UI/Labels/Body:   Plus Jakarta Sans
  Numbers/Data:     Inter
  Never mix within one text element
```

---

## Day 4 — Time Breakdown

```
TOTAL: 8 hours

Morning Session (4h):
  Task 4.1 — Types layer (worker, category, api types)    45 min
  Task 4.2 — Category API service + useCategories hook    30 min
  Task 4.3 — Worker API service + useNearbyWorkers hook   45 min
  Task 4.4 — Location service hook                        30 min
  Task 4.5 — Skeleton components for home screen          30 min

Afternoon Session (4h):
  Task 4.6 — Custom Tab Bar component                     60 min
  Task 4.7 — Tab screen scaffolds (_layout + 4 tabs)      20 min
  Task 4.8 — HomeHeader component                         45 min
  Task 4.9 — SearchPromptBar component                    20 min
  Task 4.10 — CategoryGrid + CategoryCard components      55 min
  Task 4.11 — Home screen assembly (top half)             20 min
  Task 4.12 — Integration test                            25 min
```

---

## Morning Session (4 Hours)

---

## Task 4.1 — TypeScript Type Definitions
### Duration: 45 minutes
### Files:
### `src/types/worker.types.ts`
### `src/types/category.types.ts`
### `src/types/api.types.ts`
### `src/types/location.types.ts`

---

### Why Types Come First Today

```
SERIAL POSITION EFFECT — applied to task ordering:
  Types built FIRST = every subsequent file has perfect intellisense.
  Types built LAST = 3 hours of "any" types, then painful retrofitting.

  When type definitions exist, VS Code autocompletes correctly.
  Developer writes: worker. → sees all valid fields immediately.
  RECOGNITION OVER RECALL: IDE shows options (recognition).
  Without types: developer must remember field names (recall).

JAKOB'S LAW — applied to type naming:
  Types named exactly as they appear in the API response.
  API returns "avgRating" → type field is avgRating.
  NOT rating, NOT averageRating, NOT avg_rating.
  ZERO mental translation between API and type = zero errors.
```

---

### File: `src/types/api.types.ts`

```
PURPOSE:
  Generic API response shapes used across ALL services.
  Write once, import everywhere.

TYPES TO DEFINE:

  ApiResponse<T>:
    success: boolean
    data: T
    meta?: {
      pagination?: PaginationMeta
    }
    error?: ApiError
    → This wraps every API response from the Tasklync backend

  ApiError:
    code: string         → "WORKER_NOT_AVAILABLE", "RATE_LIMITED"
    message: string      → Human-readable explanation
    details?: Record<string, unknown>   → Extra context

  PaginationMeta:
    page: number
    limit: number
    total: number
    hasMore: boolean

  PaginatedResponse<T>:
    items: T[]
    pagination: PaginationMeta
    → Used for: worker reviews, bookings list, notifications

  RequestStatus:
    'idle' | 'loading' | 'success' | 'error'
    → Used by hooks for UI state management

  WHY ApiResponse<T> NOT raw response:
    Every API call returns { success, data, error }
    If we unwrap this in client.ts interceptor (Day 2):
    → Hooks receive T directly (cleaner)
    If we don't unwrap:
    → Hooks must check response.data.data every time
    → Decision: unwrap in Axios interceptor response handler
    → api.ts functions return T (already unwrapped)
    → But keep ApiResponse<T> type for documentation clarity
```

---

### File: `src/types/category.types.ts`

```
PURPOSE:
  Types for service categories and individual services.
  Used by: CategoryGrid, ServiceCard, useCategories hook.

TYPES TO DEFINE:

  Category:
    id: string                → "plumber", "electrician", "ac_repair"
    name: string              → "Plumber"
    nameUr: string | null     → "پلمبر" (Urdu name)
    iconUrl: string | null    → Remote icon URL (fallback to local SVG)
    parentId: string | null   → For subcategories
    isActive: boolean
    sortOrder: number         → Display ordering
    serviceCount?: number     → How many services in this category

  Service:
    id: string                → UUID
    categoryId: string        → References Category.id
    name: string              → "Fan Installation"
    nameUr: string | null     → Urdu name
    description: string | null
    basePrice: number | null  → null = "quote" pricing
    priceType: 'fixed' | 'hourly' | 'quote'
    minDurationMins: number   → Estimated duration
    iconUrl: string | null
    isActive: boolean
    sortOrder: number

  CategoryWithServices:
    Extends Category
    services: Service[]
    → Used by CategoryDetailScreen

  WHY id IS STRING NOT UUID:
    Category IDs are slugs: "plumber", "electrician"
    Service IDs are UUIDs
    TypeScript: both = string (no distinction needed in type layer)
    API enforces uniqueness, not TypeScript

  LOCAL ICON MAP:
    Since backend stores iconUrl, but we ship category icons locally:
    Define: CategoryIconMap: Record<string, React.ComponentType>
    Maps category ID → local SVG component
    Fallback chain: localIcon → iconUrl → defaultIcon
    Why local preferred: no network request, no flash of missing icon
```

---

### File: `src/types/worker.types.ts`

```
PURPOSE:
  Types for worker data at every level of detail.
  Different contexts need different amounts of worker data.

TYPES TO DEFINE:

  WorkerAvailabilityStatus:
    'AVAILABLE' | 'BUSY' | 'OFFLINE' | 'PAUSED' | 'INACTIVE' | 'UNAVAILABLE'
    → Computed server-side from schedule + blocked dates
    → AVAILABLE = in schedule hours + not paused + not blocked
    → BUSY = is_on_job = true
    → OFFLINE = outside schedule hours
    → PAUSED = manually_paused = true
    → INACTIVE = last_seen_at > 7 days ago
    → UNAVAILABLE = blocked date today

  WorkerNearby (lean — used in map, cards, list):
    id: string
    name: string
    avatarUrl: string | null
    avgRating: number           → Inter Bold (it's data)
    totalReviews: number        → Inter Regular
    currency: string            → "PKR"
    distanceMeters: number      → Raw, for sorting
    distanceLabel: string       → "1.2 km" (formatted server-side)
    categories: string[]        → Category IDs ["plumber", "electrician"]
    availabilityStatus: WorkerAvailabilityStatus
    availableUntil: string | null  → "18:00" (for display)
    isOnJob: boolean
    responseTimeMins: number    → Average response time
    startingPrice: number | null → Lowest service price

  WorkerPublicProfile (full profile):
    Extends WorkerNearby (all above fields)
    bio: string | null
    yearsExperience: number
    totalBookings: number
    city: string | null
    verificationStatus: 'VERIFIED' | 'PENDING_REVIEW' | 'UNVERIFIED'
    isVerified: boolean         → Shortcut: verificationStatus === 'VERIFIED'
    skills: WorkerSkill[]
    serviceOfferings: WorkerServiceOffering[]

  WorkerSkill:
    id: string
    categoryId: string
    categoryName: string
    isVerified: boolean         → Admin verified this skill
    yearsExp: number

  WorkerServiceOffering:
    id: string
    serviceName: string
    serviceNameUr: string | null
    customPrice: number
    priceType: 'fixed' | 'hourly' | 'quote'
    isCustom: boolean
    notes: string | null

  WorkerReview:
    id: string
    bookingId: string
    reviewerId: string
    reviewerName: string
    reviewerAvatarUrl: string | null
    rating: number              → 1-5, Inter Bold for display
    punctuality: number | null
    quality: number | null
    communication: number | null
    value: number | null
    comment: string | null
    reply: string | null
    repliedAt: string | null
    createdAt: string

  WHY WorkerNearby AND WorkerPublicProfile SEPARATE:
    HICK'S LAW applied to data fetching:
    Worker list (nearby): needs lean data (fast, low bandwidth)
    Worker profile: needs full data (user is committed to seeing it)
    Fetching full profile for 20 nearby workers = 5× extra data
    Two types = clean API design + faster nearby list
```

---

### File: `src/types/location.types.ts`

```
PURPOSE:
  GPS coordinates and address types used app-wide.

TYPES TO DEFINE:

  Coordinates:
    lat: number    → Latitude: -90 to 90
    lng: number    → Longitude: -180 to 180

  GeoLocation:
    Extends Coordinates
    accuracy: number | null   → GPS accuracy in meters
    heading: number | null    → Direction (0-360 degrees)
    speed: number | null      → Speed in m/s

  UserAddress:
    id: string
    userId: string
    label: string             → "Home", "Office", "Other"
    addressLine: string       → "45 Main Boulevard"
    city: string | null
    state: string | null
    country: string | null
    postalCode: string | null
    location: Coordinates
    isDefault: boolean

  NearbyWorkersParams:
    lat: number
    lng: number
    radius: number            → Meters, default 5000
    category?: string         → Category ID filter
    serviceId?: string        → Specific service filter
    minRating?: number        → 1-5
    maxRate?: number          → Max hourly rate filter
    page?: number             → Default 1
    limit?: number            → Default 20, max 50

  WHY NearbyWorkersParams HERE NOT IN worker.types.ts:
    It contains location data (lat, lng, radius)
    Location types file = home for location-related params
    worker.types.ts = only worker shapes
    Single responsibility at type level
```

---

## Task 4.2 — Category API Service + Hook
### Duration: 30 minutes
### Files:
### `src/services/api/category.api.ts`
### `src/hooks/useCategories.ts`

---

### Category API Service Specification

```
FILE: src/services/api/category.api.ts

PURPOSE:
  All HTTP calls for categories and services.
  Simple, read-only data (categories rarely change).

METHODS:

  getCategories():
    GET /categories
    Returns: Category[]
    Sorted by: sortOrder ASC
    Cached aggressively (data changes once a week at most)

  getCategoryById(id: string):
    GET /categories/:id
    Returns: CategoryWithServices
    Includes: all active services for that category

  getCategoryServices(categoryId: string):
    GET /categories/:id/services
    Returns: Service[]
    Sorted by: sortOrder ASC

  getServiceById(id: string):
    GET /services/:id
    Returns: Service
    Used by: ServiceDetailScreen

CACHING RATIONALE:
  Categories are near-static data.
  "Electrician" doesn't become "Electrical Engineer" overnight.
  staleTime: 3600_000 (1 hour) — much longer than default 30s
  gcTime: 86400_000 (24 hours) — keep in memory all day
  refetchOnMount: false — never refetch just because component mounted
  This means: one API call per app session for categories.
  GOAL GRADIENT: instant categories = instant feeling of progress
```

---

### useCategories Hook Specification

```
FILE: src/hooks/useCategories.ts

PURPOSE:
  Access categories with intelligent caching.
  Components never call category.api.ts directly.

EXPORTS:

  useCategories():
    Returns: {
      categories: Category[],
      isLoading: boolean,
      error: Error | null,
      refetch: () => void
    }
    Query key: ['categories']
    staleTime: 3600_000 (1 hour)
    → The HOME SCREEN calls this hook
    → On first open: fetches categories
    → On every subsequent open (within 1 hour): returns from cache instantly
    → User experience: categories ALWAYS appear instantly (after first load)

  useCategoryById(id: string):
    Returns: {
      category: CategoryWithServices | undefined,
      isLoading: boolean
    }
    Query key: ['category', id]
    staleTime: 3600_000

  useCategoryServices(categoryId: string):
    Returns: {
      services: Service[],
      isLoading: boolean
    }
    Query key: ['services', categoryId]
    staleTime: 3600_000

PREFETCHING STRATEGY:
  On home screen mount:
    queryClient.prefetchQuery(['categories']) if not already cached
  When user hovers (presses) a category card:
    queryClient.prefetchQuery(['category', categoryId]) pre-loads
    So when user navigates to category screen: data is already there
    NO loading screen on category navigation = smooth transition
    GOAL GRADIENT: instant navigation = user feels momentum toward booking
```

---

## Task 4.3 — Worker API Service + Hooks
### Duration: 45 minutes
### Files:
### `src/services/api/worker.api.ts`
### `src/hooks/useNearbyWorkers.ts`
### `src/hooks/useWorkerProfile.ts`

---

### Worker API Service Specification

```
FILE: src/services/api/worker.api.ts

PURPOSE:
  All HTTP calls for worker data discovery.
  Read-only discovery (workers manage their own profile elsewhere).

METHODS:

  getNearbyWorkers(params: NearbyWorkersParams):
    GET /workers/nearby
    Query params: lat, lng, radius, category, minRating, maxRate, page, limit
    Returns: {
      workers: WorkerNearby[],
      total: number,
      page: number,
      hasMore: boolean
    }
    → THIS IS THE MOST CRITICAL API CALL IN THE APP
    → Powers: Home screen nearby section + Live Map
    → Must be fast: location-based PostGIS query
    → Client must handle: loading skeleton, empty state, error state

  getWorkerProfile(workerId: string):
    GET /workers/:id
    Returns: WorkerPublicProfile
    → Full profile for WorkerProfileScreen

  getWorkerReviews(workerId: string, page: number = 1):
    GET /workers/:id/reviews
    Query params: page, limit (20)
    Returns: PaginatedResponse<WorkerReview>

  getWorkerPortfolio(workerId: string):
    GET /workers/:id/portfolio
    Returns: Array<{ id: string, imageUrl: string, caption: string | null }>

  getWorkerServices(workerId: string):
    GET /workers/:id/services
    Returns: WorkerServiceOffering[]

ERROR HANDLING STRATEGY:
  404 (worker not found):
    Worker may have deleted account or been suspended
    Return null, screen shows "Worker not available"
  
  No workers nearby (empty array, 200 OK):
    This is NOT an error — it's a valid state
    Home screen shows EmptyState component
    Map shows "No workers in this area" overlay
```

---

### useNearbyWorkers Hook Specification

```
FILE: src/hooks/useNearbyWorkers.ts

PURPOSE:
  Fetches and caches nearby workers based on current location.
  Used by: Home screen, Live Map, Explore screen.

HOOK SIGNATURE:
  useNearbyWorkers(params: Partial<NearbyWorkersParams>):
    Returns: {
      workers: WorkerNearby[],
      total: number,
      isLoading: boolean,
      isError: boolean,
      error: Error | null,
      refetch: () => void,
      hasMore: boolean
    }

CRITICAL DESIGN DECISIONS:

  Query key: ['workers', 'nearby', params]
    → params includes lat, lng, radius, category, etc.
    → Different location = different cache entry
    → Same location + category = shared cache across screens
    → Home screen (all categories) and Map (filtered) share relevant entries

  enabled: Boolean(params.lat && params.lng)
    → Query ONLY runs when we have location
    → No location = no API call = no wasted request
    → Location loads → query triggers automatically (reactive)

  staleTime: 30_000 (30 seconds)
    → Worker availability changes in real-time
    → 30s is a compromise: fresh enough, not over-fetching
    → Worker goes online → visible on next automatic refetch (30s)

  refetchInterval: 60_000 (60 seconds)
    → Background auto-refresh every 60 seconds while screen is active
    → Workers going online/offline reflected without manual refresh
    → RECOGNITION: user sees "new" workers without action = feels alive

  refetchOnWindowFocus: false
    → Mobile app focus is handled by useAppState, not React Query default

  select: (data) => data.workers
    → Transform: extract just the workers array from full response
    → Components receive workers directly, not response object

  LOCATION DEPENDENCY:
    This hook imports useLocationStore
    If location.store has currentLocation → use it
    If params.lat/lng provided → override (for map screen with different center)
    Priority: explicit params > store location > null (disabled)

PAGINATION (for future infinite scroll):
  useInfiniteNearbyWorkers (separate hook, built Day 9):
    Uses useInfiniteQuery
    loadMore(): fetchNextPage()
    Today: only first page (limit 8 for home screen card row)
```

---

### useWorkerProfile Hook Specification

```
FILE: src/hooks/useWorkerProfile.ts

PURPOSE:
  Fetches and caches a single worker's full profile.
  Used by: WorkerProfileScreen (Day 9).

EXPORTS:

  useWorkerProfile(workerId: string):
    Returns: {
      worker: WorkerPublicProfile | undefined,
      isLoading: boolean,
      isError: boolean,
      refetch: () => void
    }
    Query key: ['worker', workerId]
    staleTime: 300_000 (5 minutes)
    → Worker profile data is relatively stable
    → Bio, skills don't change every 5 minutes

  useWorkerReviews(workerId: string):
    Query key: ['worker', workerId, 'reviews']
    Returns paginated reviews

PREFETCH PATTERN:
  When user taps a WorkerCard (any screen):
    Before navigating: queryClient.prefetchQuery(['worker', workerId])
    Navigation happens: data loading in background
    Worker profile screen mounts: data already there (or partially)
    → PEAK-END: no loading spinner on profile = smooth "peak" moment
    → User: "This app is fast" → trust built

  Implementation location: WorkerCard component
  On pressIn (not onPress): prefetch starts 100ms before navigation
  Even faster: prefetch triggered by card becoming visible in list
  (Advanced — implement Day 9 when building WorkerCard component)
```

---

## Task 4.4 — Location Hook
### Duration: 30 minutes
### File: `src/hooks/useLocation.ts`

---

### Location Hook Specification

```
FILE: src/hooks/useLocation.ts

PURPOSE:
  Manage GPS location access, current position, and city name.
  Used by: HomeHeader (city display), useNearbyWorkers (coords).

EXPORTS:

  useLocation():
    Returns: {
      location: Coordinates | null,
      cityName: string,
      permissionStatus: 'granted' | 'denied' | 'undetermined',
      isLocating: boolean,
      requestLocation: () => Promise<void>,
      refreshLocation: () => Promise<void>
    }

INTERNAL LOGIC:

  On mount:
    1. Read permissionStatus from location.store
    2. If 'granted': call getCurrentPosition()
    3. If 'undetermined': do nothing (wait for explicit request)
    4. If 'denied': do nothing (user chose no)

  getCurrentPosition():
    1. expo-location.getCurrentPositionAsync()
       accuracy: Accuracy.Balanced (not High — faster, less battery)
       timeInterval: 1000ms timeout
       maximumAge: 30000ms (use cached GPS if <30s old)
    2. On success:
       a. location.store.setLocation({ lat, lng })
       b. Call reverseGeocode(lat, lng) → city name
       c. location.store.setCity(cityName)
    3. On failure:
       a. Use last known location from MMKV (if exists)
       b. If no last known: cityName = "Your area"

  reverseGeocode(lat, lng):
    expo-location.reverseGeocodeAsync({ latitude: lat, longitude: lng })
    Returns: [{city, region, country, ...}]
    Extract: city name (or region if city null)
    Format: "DHA, Lahore" or just "Lahore"
    Fallback: "Your area" (non-alarming placeholder)
    Store result in location.store

  refreshLocation():
    Manual trigger (for pull-to-refresh or location pill tap)
    Same flow as getCurrentPosition()
    Shows brief "Locating..." text in location pill

ACCURACY CHOICE RATIONALE:
  Accuracy.Balanced = ~100m accuracy
  Why not Accuracy.High (Best): GPS warm-up takes 5-15 seconds
  Why not Accuracy.Low: too imprecise for 5km radius search
  Balanced: warm up in ~2 seconds, 100m = fine for 5km radius
  Worker 1.2km away: whether they're at 1.17km or 1.23km doesn't matter

BATTERY CONSIDERATION:
  We call location ONCE on home screen mount
  NOT continuous tracking (that's only during active booking tracking)
  maximumAge 30000ms: reuses recently cached GPS = no battery drain
  This is industry standard (Uber only tracks your location when you're in a trip)

CITY NAME DISPLAY:
  Raw geocode: "Defence Housing Authority, Lahore, Punjab, Pakistan"
  We want: "Lahore" or "DHA, Lahore"
  Logic:
    If city available: return city (e.g., "Lahore")
    If sublocality available + city: return "sublocality, city"
    If only region: return region
    Default: "Your area"
```

---

## Task 4.5 — Skeleton Components for Home Screen
### Duration: 30 minutes
### Files:
### `src/components/ui/Skeleton/SkeletonCategoryCard.tsx`
### `src/components/ui/Skeleton/SkeletonCategoryGrid.tsx`
### `src/components/ui/Skeleton/SkeletonHomeHeader.tsx`
### `src/components/ui/Skeleton/index.ts` (update)

---

### Skeleton Design Philosophy

```
JAKOB'S LAW:
  Skeleton screens match the EXACT layout of real content.
  Same width. Same height. Same spacing. Same border radius.
  User sees skeleton → brain processes: "content is loading"
  If skeleton shape differs from content: jarring layout shift on load
  Layout shift = negative micro-interruption (anti-Peak-End)

RECOGNITION OVER RECALL:
  User doesn't read "Loading..." text.
  They see the skeleton shape and RECOGNIZE "these are cards loading"
  Skeleton IS the communication. No text needed.

SERIAL POSITION EFFECT:
  Skeleton items appear in same order as real content.
  If 6 category cards: 6 skeleton cards in same 2×3 grid.
  When content loads: skeleton disappears, content appears in same positions.
  No spatial confusion. User's eye doesn't need to re-scan.

PEAK-END RULE:
  The transition from skeleton → real content is a mini-peak.
  Content doesn't just appear (jarring).
  It FADES IN with slight scale: opacity 0.5→1, scale 0.97→1.0
  This smooth reveal = satisfying micro-moment
  Users don't consciously notice it but feel: "this feels good"
```

---

### SkeletonCategoryCard Specification

```
FILE: src/components/ui/Skeleton/SkeletonCategoryCard.tsx

MATCHES: CategoryCard component (exact dimensions)
SIZE: 106px × 100px (same as real CategoryCard)
BORDER RADIUS: radius.xl (20px) — same as real card

INTERNAL LAYOUT:
  Outer container: 106×100px, BG colors.bgCard, shadow-sm, r-xl
  Icon skeleton: centered, 40×40px, borderRadius 20px (circle)
                 Skeleton base component
  Label skeleton: centered below icon, 60×12px, borderRadius 4px
                 Skeleton base component (narrower than card = realistic)

SHIMMER: Inherited from base Skeleton component (no need to re-implement)

TRANSITION TO REAL CONTENT:
  When real CategoryCard mounts to replace skeleton:
  Real card: opacity animates 0.5 → 1.0 over 300ms
  This is handled in CategoryCard itself (on mount animation)
  NOT in the skeleton (skeleton just disappears)
```

---

### SkeletonCategoryGrid Specification

```
FILE: src/components/ui/Skeleton/SkeletonCategoryGrid.tsx

PURPOSE:
  Renders 6 SkeletonCategoryCards in exact same 2×3 grid layout
  as the real CategoryGrid component.

LAYOUT:
  Flexbox: flexWrap='wrap', flexDirection='row'
  Gap between cards: grid.categoryGap (12px) from spacing tokens
  Horizontal padding: layout.screenPaddingH (16px)
  Renders: 6 SkeletonCategoryCard components
  Entrance: no animation (skeleton appears instantly, no entrance anim)
  Exit: real content fades in (handled in real component)
```

---

### SkeletonHomeHeader Specification

```
FILE: src/components/ui/Skeleton/SkeletonHomeHeader.tsx

PURPOSE:
  Placeholder for HomeHeader while location is being determined.
  Only needed if location detection takes > 500ms.

LAYOUT:
  Height: 72px (same as real HomeHeader content area)
  
  Location pill skeleton:
    Width: 140px, Height: 32px, borderRadius: radius.pill
    BG: Skeleton shimmer
    
  Greeting skeleton:
    Width: 180px, Height: 18px, marginTop: 8px, borderRadius: 4px
    BG: Skeleton shimmer

  Notification bell placeholder:
    40×40px, borderRadius: 20px, absolute right
    BG: Skeleton shimmer (no shimmer inside, just block)

WHY SkeletonHomeHeader IS LOWER PRIORITY:
  Location usually resolves in 1-2s
  User barely sees this skeleton (it flashes briefly)
  BUT it prevents layout shift = worth building
  Layout shift on header = very noticeable = bad first impression
```

---

## Afternoon Session (4 Hours)

---

## Task 4.6 — Custom Tab Bar Component
### Duration: 60 minutes
### File: `src/components/layout/TabBar.tsx`

---

### Why Build a Custom Tab Bar

```
JAKOB'S LAW says: use familiar patterns.
But the DEFAULT Expo Router tab bar is:
  - Not customizable for micro-animations
  - Uses system font (not our design system fonts)
  - Cannot animate icons between stroke and filled
  - Cannot add badge animations
  - Cannot implement the sliding active indicator
  - Cannot match our green color system precisely

Custom tab bar = same familiar pattern + our design system.
Users get: recognition (same UX pattern) + delight (our animations).
Best of both worlds.

FITTS' LAW — The most important design decision:
  Each tab takes exactly 25% of screen width (4 tabs).
  At 375px screen: each tab = 93.75px wide.
  Height: 60px (tabBarH from spacing tokens).
  Touch target: 93.75 × 60 = 5,625 sq px per tab.
  This is enormous. No user ever misses a tab.
  The icon is 24px — the invisible 93×60 area around it = 100% success rate.
```

---

### Component Specification

```
FILE: src/components/layout/TabBar.tsx

PROPS:
  Receives standard Expo Router/React Navigation BottomTabBarProps
  (state, descriptors, navigation from the navigation library)

VISUAL SPECIFICATION:

  Container:
    Position: absolute bottom (native tab behavior)
    Width: screen width
    Height: 60px + safe area bottom
    Background: colors.bgCard (#FFFFFF)
    Border top: 1px colors.border (#E2E8F0)
    Shadow (top direction):
      iOS: shadowOffset {width: 0, height: -2},
           shadowOpacity: 0.06, shadowRadius: 8
      Android: elevation: 8 (renders above content)

  4 Tabs (equal width):
    Layout: flexDirection row
    Each tab: flex: 1 (equal space, Fitts' Law)

  Per Tab Structure:
    Outer Pressable: full flex height (entire touch area, not just icon)
    Inner: flexDirection column, alignItems center, justifyContent center
    Icon (24px): stroke when inactive, filled when active
    Label (10px): text below icon
    Gap between icon and label: 4px

MICRO-INTERACTION DETAIL — TAB SWITCH:

  This is the most-used animation in the entire app.
  Users switch tabs 50-100 times per session.
  It MUST feel right.

  ON ACTIVE TAB:
    Icon color: colors.textMuted → colors.primary (#16A34A)
    Label color: same transition
    Icon variant: outline → filled (where Lucide has filled version)
    Active indicator: green pill behind/under the icon

  ANIMATION ON TAB PRESS:
    1. Icon scale: 1.0 → 0.85 → 1.0 (spring snappy then back)
       → 0.85 = receives the press, bounces back to 1.0
       → PEAK-END: this bounce = micro-peak of every tab switch
    2. Color: interpolates from muted → green (timingConfig.fast 150ms)
    3. Active indicator slides horizontally from previous tab to new tab
       → Shared value: activeIndex changes → indicator translateX
       → Spring gentle: not too fast, shows intentional movement
       → JAKOB'S LAW: sliding indicator = iOS/Material standard pattern

  ACTIVE INDICATOR:
    Height: 3px
    Width: 24px (same as icon)
    Color: colors.primary (#16A34A)
    Border radius: radius.pill
    Position: below icon (above label OR as underline)
    Movement: translateX spring animation between tab positions
    → Each tab center position calculated from screen width
    → Indicator center moves to match active tab center
    → Smooth spring = satisfying visual momentum

  TAB ICONS (Lucide Icons):
    Home:       house (inactive) → house filled (active)
    Explore:    search (same in both states, search has no filled)
    Bookings:   calendar (inactive) → calendar-check (active)
    Profile:    user (inactive) → user-check (active)

    WHERE FILLED VARIANTS DON'T EXIST:
    Use the outline + green color to signal active state
    Icon scale animation carries the animation weight

  HAPTIC FEEDBACK:
    Tab press: Haptics.selectionAsync()
    This is the LIGHTEST haptic — subtle acknowledgment
    Heavy haptic on tab = tiring over 100 tabs/session

NOTIFICATION BADGE ON BOOKING TAB:
  If activeBooking exists (from useActiveBooking hook):
    Show orange dot on Bookings tab
    Size: 8px, BG colors.warning (#F59E0B), position: top-right of icon
    Animation on appear: scale 0→1 (spring bouncy)
    → Goal: user sees booking is active, returns to check
    → SERIAL POSITION: badge catches eye on active tab

CART BADGE ON EXPLORE TAB:
  If cart.itemCount > 0:
    Show green number badge on Explore tab
    Size: 16px diameter, BG colors.primary, text Inter Bold 10px white
    Shows count: 1, 2, 3... (max "9+" for counts > 9)
    Animation on count change: scale 1.0 → 1.3 → 1.0 (bouncy)

ACCESSIBILITY:
  Each tab: accessibilityRole="button"
  Each tab: accessibilityLabel="[Tab name] tab, [N of 4]"
  Active tab: accessibilityState={{ selected: true }}
  Badge: accessibilityLabel includes count ("3 items in cart")
```

---

## Task 4.7 — Tab Screens Scaffold + Layout
### Duration: 20 minutes
### Files:
### `app/(tabs)/_layout.tsx`
### `app/(tabs)/index.tsx` (real home screen starts here)
### `app/(tabs)/explore.tsx` (placeholder)
### `app/(tabs)/bookings.tsx` (placeholder)
### `app/(tabs)/profile.tsx` (placeholder)

---

### Tab Layout Specification

```
FILE: app/(tabs)/_layout.tsx

PURPOSE:
  Configure the Tab navigator.
  Wire our custom TabBar component.
  Set screen options for all 4 tabs.

CONFIGURATION:

  tabBar prop: our custom TabBar component
  screenOptions:
    headerShown: false (all screens manage their own header)

  Per-tab screens:
    index:     title "Home"
    explore:   title "Explore"
    bookings:  title "Bookings"
    profile:   title "Profile"

WHY TITLES EVEN WITH NO HEADER:
  Tab titles are used by TabBar for accessibility labels.
  Screen reader announces: "Home tab, selected"
  Without title: "Tab 1, selected" — meaningless.

ANIMATION BETWEEN TABS:
  No animation (instant switch)
  WHY: Tab navigation is non-hierarchical
  Slide left/right implies hierarchy (going forward/back)
  Instant switch = correct mental model (parallel options, not sequence)
  JAKOB'S LAW: all major tab-bar apps use instant tab switching

GESTURE:
  No swipe between tabs
  WHY: Horizontal content (category scroll, worker cards) conflicts with swipe
  User swiping category scroll gets accidental tab switch = terrible UX
  Better: require explicit tab tap (Hick's Law: one gesture per action)
```

---

### Tab Screen Placeholders

```
app/(tabs)/explore.tsx:
  Returns: <Screen><Text variant="h2">Explore</Text></Screen>
  Note in file: "Day 9 — Search + Filter implementation"

app/(tabs)/bookings.tsx:
  Returns: <Screen><Text variant="h2">My Bookings</Text></Screen>
  Note in file: "Day 14 — Bookings list implementation"

app/(tabs)/profile.tsx:
  Returns: <Screen><Text variant="h2">Profile</Text></Screen>
  Note in file: "Day 17 — Profile screen implementation"

WHY THESE PLACEHOLDERS EXIST:
  Tab navigator requires all 4 tab screens to exist.
  Without them: navigation crashes.
  Placeholder = functional (navigable) without feature complete.
  JAKOB'S LAW: every tab shows something (not blank white) = reassuring.
  Even "Explore" text = user knows tab works.
```

---

## Task 4.8 — HomeHeader Component
### Duration: 45 minutes
### File: `src/components/home/HomeHeader.tsx`

---

### Component Specification

```
FILE: src/components/home/HomeHeader.tsx

PURPOSE:
  The FIRST thing a logged-in user sees every time they open Tasklync.
  Sets the emotional tone of every session.
  Contains: location context, personal greeting, notification access.

IMPORTANCE:
  SERIAL POSITION EFFECT: FIRST element on screen.
  First element = most remembered.
  "Good morning, Ali" = personalization = recognition = trust.
  This header says: "We know you. You belong here."

VISUAL LAYOUT:

  Height: 72px (compact, doesn't steal screen space from content)
  Padding: 16px horizontal, 12px vertical
  BG: colors.bgCard (#FFFFFF) — header is white
      Home screen BG is colors.bgApp (#FAFAFA) — slight contrast

  LEFT SIDE — Location Pill + Greeting:
    Stack (column, top-aligned):

    Row 1 — Location Pill:
      [Map-pin icon 14px green] [City name text] [Chevron-down 12px muted]
      Container: BG colors.bgInput (#F4F5F7), radius pill, height 28px
                 paddingH 10px, inline flex row
      City name: Plus Jakarta Sans Medium, 13px, colors.textPrimary
      Why pill shape: JAKOB'S LAW — location pill = every rideshare app
      Tap action: Opens address selection (Day 10 — AddressPicker)
      Loading state: SkeletonHomeHeader location pill (140×28px shimmer)

    Row 2 — Greeting (8px below location pill):
      "Good morning, " + user name
      "Good morning, ": Plus Jakarta Sans Regular, 14px, muted
      "Ali": Poppins SemiBold, 14px, colors.primary
      → Two inline Text components OR nested Text spans
      → Name in Poppins: brand voice = personal, warm
      → "Good morning" in Jakarta: neutral context
      Time-based greeting logic:
        6-11: "Good morning"
        12-17: "Good afternoon"
        18-22: "Good evening"
        23-5: "Good night" (edge case)

  RIGHT SIDE — Notification Bell:
    Position: absolute right 16px, centered vertically
    Uses NotificationBell component (Task 4.9-adjacent, built here)
    
    NotificationBell visual:
      IconButton: bell icon 22px, BG transparent
      Badge: appears when unreadCount > 0
        8px circle, BG colors.danger, border 2px white
        Position: top-right of icon
        Text: Inter Bold 9px white (count) OR just dot if count=0
        Max display: "9+" for counts > 9
      
      BELL MICRO-ANIMATION (on new notification arrival via socket):
        bell-ring: rotate ±15° × 3 oscillations (ease-in-out, 600ms)
        Badge: scale 0→1.2→1.0 (spring bouncy) on first appear
        Badge count change: scale 1.0→1.3→1.0 (spring bouncy)
        PEAK-END: bell ring = satisfying signal of new information

SCROLL BEHAVIOR:
  As user scrolls down the home screen:
  HomeHeader DOES NOT collapse or scroll away
  It stays fixed at the top
  WHY: Location context + notification bell = always needed
  FITTS' LAW: if header scrolled away, bell tap requires scroll back up
  Fixed header = always accessible = no friction for core navigation

COMPONENT INPUTS:
  No props needed
  Pulls data from: useAuthStore (user.name), useLocation (cityName),
  useNotifications (unreadCount)

LOADING STATE:
  While location loading (isLocating=true):
    Show SkeletonHomeHeader in location pill position
    Greeting still shows (user.name from auth.store = instant)
    "Locating..." text replaces city name
  When location loads:
    City name fades in (opacity 0→1, 200ms)
```

---

## Task 4.9 — SearchPromptBar Component
### Duration: 20 minutes
### File: `src/components/home/SearchPromptBar.tsx`

---

### Component Specification

```
FILE: src/components/home/SearchPromptBar.tsx

PURPOSE:
  Visual search bar that navigates to search screen on tap.
  NOT a real input — it's a tap target that navigates.

WHY NOT A REAL INPUT:
  HICK'S LAW: search on home = distraction from primary flow
  Primary flow: category → service → worker → book
  Search is secondary: "I know what I want but can't find category"
  Making it real input = keyboard pops immediately = disrupts browsing
  Tap target → navigate to dedicated search screen = clean separation

  JAKOB'S LAW: Airbnb, Urban Company both do this.
  Fake search bar on home → real search on separate screen.
  Users recognize the pattern: "I can tap this to search."

VISUAL SPECIFICATION:
  Height: 52px (layout.primaryButtonH — same as all interactive elements)
  Width: 100% (full screen width - 32px margins)
  Background: colors.bgInput (#F4F5F7)
  Border radius: radius.pill (100px) — pill shaped, premium feel
  Border: none in idle state
  
  Left icon:
    Search (Lucide), 18px, colors.textMuted
    Padding left: 16px

  Placeholder text:
    "What do you need help with?"
    Plus Jakarta Sans Regular, 15px, colors.textMuted
    Padding left: 10px from icon

  Right icon (optional): 
    None today (mic for voice search = Day 20+ feature)

MICRO-INTERACTION:
  onPressIn:
    Subtle scale: 1.0 → 0.98 (spring stiff, very quick)
    Border: appear 1.5px colors.primary (instant, 0ms)
    → Signals: "I received your tap, I'm about to act"

  onPressOut + onPress:
    Scale: 0.98 → 1.0 (spring default)
    Navigate: router.push('/search')
    Haptic: light selection
    Transition: SearchInput on search screen auto-focuses = keyboard up
    → User taps bar → keyboard immediately visible on new screen
    → Feels like ONE seamless action (bar → search screen with keyboard)
    → PEAK-END: seamless transition = satisfaction

ACCESSIBILITY:
  accessibilityRole: "search"
  accessibilityLabel: "Search for services or workers"
  accessibilityHint: "Tap to open search"
```

---

## Task 4.10 — CategoryGrid + CategoryCard Components
### Duration: 55 minutes
### Files:
### `src/components/home/CategoryGrid.tsx`
### `src/components/service/ServiceCategoryCard.tsx`

---

### CategoryCard Component Specification

```
FILE: src/components/service/ServiceCategoryCard.tsx
(in service/ domain — categories are service-domain concepts)

PURPOSE:
  Individual category card in the home screen grid.
  The most tapped element on the home screen.
  Gets tapped dozens of times per user session.

DIMENSIONS (from grid constants in spacing tokens):
  Width: grid.categoryCardSize = 106px
  Height: grid.categoryCardH = 100px
  Border radius: radius.xl = 20px

VISUAL SPECIFICATION:

  Container:
    106×100px, BG colors.bgCard (#FFFFFF)
    Border radius: radius.xl (20px)
    Shadow: shadows.sm
    Padding: 12px (all sides)

  Icon area (top 55% of card):
    Container: 48×48px, centered horizontally
    Icon: custom SVG component (from local assets)
    OR: fallback Lucide icon if SVG not ready
    Icon container BG: category-specific tint color
    Border radius: radius.md (12px)

    WHY COLORED ICON CONTAINER:
    RECOGNITION: ⚡ in yellow-orange container = electrical instantly
    Color aids recognition faster than text or icon alone
    Each category = unique color = visual distinctiveness

    ICON CONTAINER COLORS (per category):
      electrician:  BG #FEF3C7 (amber tint), icon #F59E0B
      plumber:      BG #EFF6FF (blue tint), icon #3B82F6
      ac_repair:    BG #F0F9FF (sky tint), icon #0EA5E9
      cleaning:     BG #F0FDF4 (green tint), icon #16A34A
      carpenter:    BG #FFF7ED (orange tint), icon #EA580C
      painter:      BG #FDF4FF (purple tint), icon #A855F7

  Label (bottom 40% of card):
    Plus Jakarta Sans SemiBold, 12px, colors.textPrimary
    Text align: center
    Number of lines: 1 (ellipsis if too long)
    Padding top: 8px from icon area

MICRO-INTERACTION (most important animation on home screen):

  IDLE STATE:
    shadow: shadows.sm
    scale: 1.0
    BG: colors.bgCard (#FFFFFF)

  PRESS IN:
    scale: 1.0 → 0.95 (spring stiff — immediate, decisive)
    shadow: shadows.sm → shadows.none (card "pressed into" surface)
    → Physical metaphor: pressing a real button down
    → PEAK-END: this tactile quality = micro-peak

  PRESS OUT / RELEASE:
    scale: 0.95 → 1.02 → 1.0 (spring bouncy — overshoot = alive)
    shadow: → shadows.sm (returns)
    Haptic: selectionAsync (lightest — appropriate for card tap)
    Navigate: router.push(`/category/${category.id}`)

ENTRANCE ANIMATION (when grid first loads from skeleton):
  Each card enters with stagger:
  Card 0: delay 0ms
  Card 1: delay stagger.normal (50ms)
  Card 2: delay 100ms
  Card 3: delay 150ms
  Card 4: delay 200ms
  Card 5: delay 250ms

  Per card entrance:
    opacity: 0 → 1
    translateY: 12 → 0
    scale: 0.93 → 1.0
    All with spring default

  WHY STAGGER:
    PEAK-END: staggered reveal is MORE satisfying than simultaneous pop
    Sequential = "each one arriving" = micro-delight × 6
    Simultaneous = "content appeared" = one moment, less memorable
    250ms total for all 6 = fast enough, staggered enough

ACCESSIBILITY:
  accessibilityRole: "button"
  accessibilityLabel: "${category.name} services"
  accessibilityHint: "Tap to browse ${category.name} workers"
```

---

### CategoryGrid Component Specification

```
FILE: src/components/home/CategoryGrid.tsx

PURPOSE:
  Renders 6 category cards in 2-row × 3-column grid.
  Handles: loading state, error state, data rendering.

VISUAL SPECIFICATION:

  Section header row:
    Left: Text "Services" — Poppins SemiBold, h4 (16px), textPrimary
    Right: Text "See all →" — Plus Jakarta Sans Medium, 13px, green
           Pressable (hitSlop: 8)
           Action: router.push('/search') with explore flag OR navigate to Explore tab

  Grid container:
    flexDirection: 'row'
    flexWrap: 'wrap'
    gap: grid.categoryGap (12px) between cards
    paddingHorizontal: layout.screenPaddingH (16px)
    paddingTop: 12px (below section header)

  HICK'S LAW — WHY 6 CATEGORIES:
    6 visible = 3 bits of information
    User decides in ~1.3 seconds
    "See all →" = escape valve for power users
    97% of users will use one of the 6 shown
    The 6 shown are sorted by: most popular in user's city first
    → Data-driven selection ensures 6 shown = 6 most relevant

STATES:

  LOADING STATE:
    Show SkeletonCategoryGrid (6 skeleton cards in same layout)
    No flicker: skeleton appears instantly on mount while query runs
    When data arrives: cross-fade from skeleton to real grid

  DATA STATE:
    Slice first 6 from categories array
    Map to ServiceCategoryCard components
    Entrance animation (stagger) triggers when data first loads

  ERROR STATE:
    Show simple error row below section header
    "Services unavailable. " + [Retry] link
    No full-screen error (categories failing ≠ catastrophic)
    User can still use search bar or navigate

  EMPTY STATE (categories = []):
    Shouldn't happen (backend always has categories)
    If happens: show 6 skeleton cards (look like loading)
    WHY: Empty state for categories = app broken feeling
    Better to look "still loading" than "broken"

PREFETCH ON GRID MOUNT:
  When CategoryGrid mounts:
  Loop through visible 6 categories:
    queryClient.prefetchQuery(['category', cat.id])
  Pre-loads category detail data while user looks at the grid
  When user taps: data already cached → instant category screen
  GOAL GRADIENT: instant navigation = user feels closer to their goal
```

---

## Task 4.11 — Home Screen Assembly (Top Half)
### Duration: 20 minutes
### File: `app/(tabs)/index.tsx`

---

### Home Screen (Top Half) Specification

```
FILE: app/(tabs)/index.tsx

TODAY'S SCOPE: Top half of home screen (above fold)
TOMORROW (Day 5): Bottom half (nearby workers, banners, popular services)

WHY SPLIT ACROSS 2 DAYS:
  Top half = what user sees immediately (critical)
  Bottom half = requires scroll (secondary priority)
  Ship top half working = valuable milestone
  Split = smaller, testable units = less risk per session

WHAT "ABOVE FOLD" MEANS ON MOBILE:
  At 375×812px (iPhone 14 screen):
  Status bar: ~44px
  HomeHeader: 72px
  Screen padding + spacing: 16px
  SearchPromptBar: 52px
  Section header "Services": 24px (header) + 12px (padding)
  CategoryGrid: 2 rows × 100px + gap 12px = 212px
  TOTAL: 432px = more than half the screen = user sees all of this
  WITHOUT SCROLLING.

HOME SCREEN BG: colors.bgApp (#FAFAFA)
STATUS BAR: 'dark-content'
NO HEADER COMPONENT: HomeHeader is part of the screen content

LAYOUT STRUCTURE:

  ScrollView (outer container):
    bounces: true (iOS rubber band)
    showsVerticalScrollIndicator: false
    refreshControl: CustomRefreshControl (pull to refresh — Day 5)
    contentContainerStyle: paddingBottom 120px (space for tab bar + content)

  Section 1 — HomeHeader:
    HomeHeader component
    Positioned at top with correct padding

  Section 2 — SearchPromptBar:
    Margin top: 12px
    Margin horizontal: 16px
    SearchPromptBar component

  Section 3 — CategoryGrid:
    Margin top: 24px (section gap from spacing tokens)
    CategoryGrid component

  (Below fold — Day 5 content):
    Placeholder View with height 400px (so scroll works correctly)
    Comment: "// Day 5 — NearbyWorkersList, BannerCarousel, PopularServicesSection"

DATA FETCHING ON THIS SCREEN:
  useCategories() → feeds CategoryGrid
  useLocation() → feeds HomeHeader city name
  useAuthStore() → feeds greeting name + auth state

SCREEN PERFORMANCE:
  All hooks return instantly from cache after first load
  First load: skeleton → data (smooth via stagger animation)
  Subsequent loads: data immediately (30s staleTime)
  Memory: all on main JS thread (no heavy computation)

PULL TO REFRESH PLACEHOLDER:
  refreshControl prop: set but calls refetchAll()
    refetchAll() = useCategories().refetch() + useNearbyWorkers().refetch()
  Full RefreshControl component: Day 5 (needs custom Lottie)
  Today: use default RefreshControl with green tint color
```

---

## Task 4.12 — Integration Test
### Duration: 25 minutes

---

### What to Test

```
COMPLETE FLOW TEST:

  Auth → Home:
    □ Log in with valid OTP
    □ Arrives at Home screen (not white screen)
    □ HomeHeader shows correct name + city
    □ Greeting: time-appropriate ("Good morning" at 9am)
    □ Skeleton shows while categories load
    □ Categories load → stagger animation plays
    □ 6 category cards visible
    □ All 4 tabs navigable
    □ Tab press: icon animates, haptic fires

  CategoryGrid:
    □ 6 cards render with correct icons
    □ Card press: scale animation plays (0.95 → 1.02 → 1.0)
    □ Card press: navigates to /category/[id] (placeholder screen OK)
    □ "See all →": navigates correctly

  Search Bar:
    □ Tap: animates → navigates to /search (placeholder OK)
    □ No keyboard appears on home (it's a fake bar)

  Tab Bar:
    □ Home tab: active (green), house-filled icon
    □ Explore tab: inactive, search icon
    □ Bookings tab: inactive, calendar icon
    □ Profile tab: inactive, user icon
    □ Tab press: slide indicator moves to correct tab
    □ Tab press: haptic fires

  Data Layer:
    □ useCategories: staleTime works (navigate away + back = no refetch)
    □ useLocation: city name appears in header
    □ tsc --noEmit: zero errors on all new files
    □ eslint: zero warnings

DEVICE COVERAGE:
    □ iPhone SE (375px) — smallest supported
    □ iPhone 14 Pro (393px) — current standard
    □ Android emulator (360px) — Android baseline

PERFORMANCE:
    □ Category grid appears within 1.5s of first open
    □ Tab switches: instant (no lag)
    □ Stagger animation: smooth 60fps
    □ No layout shift during data loading
```

---

## Day 4 — Complete File List

```
NEW FILES CREATED TODAY:

  TYPES:
    src/types/api.types.ts            ← ApiResponse<T>, PaginationMeta, ApiError
    src/types/category.types.ts       ← Category, Service, CategoryWithServices
    src/types/worker.types.ts         ← WorkerNearby, WorkerPublicProfile, etc.
    src/types/location.types.ts       ← Coordinates, GeoLocation, NearbyParams

  API SERVICES:
    src/services/api/category.api.ts  ← getCategories, getCategoryById
    src/services/api/worker.api.ts    ← getNearbyWorkers, getWorkerProfile

  HOOKS:
    src/hooks/useCategories.ts        ← useCategories, useCategoryById
    src/hooks/useNearbyWorkers.ts     ← useNearbyWorkers (location-dependent)
    src/hooks/useWorkerProfile.ts     ← useWorkerProfile, useWorkerReviews
    src/hooks/useLocation.ts          ← GPS, reverse geocoding, city name

  SKELETON COMPONENTS:
    src/components/ui/Skeleton/SkeletonCategoryCard.tsx
    src/components/ui/Skeleton/SkeletonCategoryGrid.tsx
    src/components/ui/Skeleton/SkeletonHomeHeader.tsx
    src/components/ui/Skeleton/index.ts      ← Updated barrel export

  TAB NAVIGATION:
    src/components/layout/TabBar.tsx         ← Custom animated tab bar

  SCREEN SCAFFOLDS:
    app/(tabs)/_layout.tsx                   ← Tab navigator config
    app/(tabs)/explore.tsx                   ← Placeholder
    app/(tabs)/bookings.tsx                  ← Placeholder
    app/(tabs)/profile.tsx                   ← Placeholder

  HOME SCREEN COMPONENTS:
    src/components/home/HomeHeader.tsx       ← Location + greeting + bell
    src/components/home/SearchPromptBar.tsx  ← Fake search bar (navigates)
    src/components/home/CategoryGrid.tsx     ← 6-card grid with states
    src/components/service/ServiceCategoryCard.tsx  ← Individual category card

  SCREEN:
    app/(tabs)/index.tsx                     ← Home screen (top half complete)

UPDATED FILES:
    src/components/ui/Skeleton/index.ts      ← Add new skeleton exports

TOTAL NEW FILES: 20
TOTAL COMPONENTS SHIPPED: 5 new components
TOTAL SCREENS: 4 tab screens (1 complete, 3 placeholder)
```

---

## Day 4 — Micro-Interactions Complete Catalog

```
Organized by component. Every one intentional. Every one mapped to a UX law.

TAB BAR:
  ┌────────────────────────────────────────────────────────────────────┐
  │ Interaction              Micro-Intention         UX Law           │
  ├────────────────────────────────────────────────────────────────────┤
  │ Tab press                "I received this tap"   Fitts' + Peak-End │
  │ Icon: scale 0.85→1.0     "I'm responding"        Peak-End          │
  │ Color: muted→green       "This is now active"    Recognition       │
  │ Indicator slides         "Position changed"      Jakob's           │
  │ Haptic: selection        "Confirmed" (invisible)  Peak-End         │
  │ Badge appears on booking "Something needs your   Serial Position   │
  │                           attention"                               │
  └────────────────────────────────────────────────────────────────────┘

HOME HEADER:
  ┌────────────────────────────────────────────────────────────────────┐
  │ Interaction              Micro-Intention         UX Law           │
  ├────────────────────────────────────────────────────────────────────┤
  │ City name loads          Fade in opacity 0→1    Peak-End          │
  │ Bell ring (new notif)    "Something new is here" Serial Position   │
  │ Bell badge appears       Scale 0→1.2→1.0        Peak-End          │
  │ Bell badge count changes Scale 1→1.3→1.0        Goal Gradient     │
  │ Location pill tap        Scale 0.97 (immediate) Fitts' + Recognition│
  └────────────────────────────────────────────────────────────────────┘

SEARCH BAR:
  ┌────────────────────────────────────────────────────────────────────┐
  │ Interaction              Micro-Intention         UX Law           │
  ├────────────────────────────────────────────────────────────────────┤
  │ Press in                 Scale 0.98 + border     Recognition       │
  │ Release                  Scale 1.0 + navigate    Peak-End          │
  │ Haptic light             "Tap registered"         Jakob's           │
  └────────────────────────────────────────────────────────────────────┘

CATEGORY CARD:
  ┌────────────────────────────────────────────────────────────────────┐
  │ Interaction              Micro-Intention         UX Law           │
  ├────────────────────────────────────────────────────────────────────┤
  │ Card stagger entrance    "Content is arriving"   Peak-End (peak)  │
  │ Press in: scale 0.95     "Received, going down"  Jakob's           │
  │ Shadow reduces           "Physical press"         Peak-End         │
  │ Release: scale 1.02→1.0  "Bouncing back alive"   Peak-End (micro) │
  │ Shadow returns           "Releasing"              Peak-End         │
  │ Haptic: selection        "Confirmed"              Jakob's           │
  │ Navigate on release      "Taking you there"       Goal Gradient    │
  └────────────────────────────────────────────────────────────────────┘

SKELETON → CONTENT TRANSITION:
  ┌────────────────────────────────────────────────────────────────────┐
  │ Event                    Effect                  UX Law           │
  ├────────────────────────────────────────────────────────────────────┤
  │ Data arrives             Skeleton fades out       Recognition      │
  │ Content mounts           Stagger animate in       Peak-End (peak)  │
  │ 6 cards cascade          Sequential arrival       Serial Position  │
  │ Complete at 250ms        Page feels alive         Goal Gradient    │
  └────────────────────────────────────────────────────────────────────┘
```

---

## Day 4 — Deliverable Checklist

```
TYPE LAYER:
  □ api.types.ts: ApiResponse<T>, PaginatedResponse<T>, ApiError, PaginationMeta
  □ category.types.ts: Category, Service, CategoryWithServices
  □ worker.types.ts: WorkerNearby, WorkerPublicProfile, WorkerSkill, etc.
  □ location.types.ts: Coordinates, GeoLocation, UserAddress, NearbyWorkersParams
  □ tsc --noEmit on types: zero errors

API SERVICES:
  □ category.api.ts: getCategories, getCategoryById, getCategoryServices
  □ worker.api.ts: getNearbyWorkers, getWorkerProfile, getWorkerReviews
  □ Both files: all methods typed, all return Promises with correct types

HOOKS:
  □ useCategories: returns data from React Query, 1hr staleTime
  □ useCategoryById: returns single category with services
  □ useNearbyWorkers: enabled only when lat+lng available, 30s staleTime
  □ useWorkerProfile: 5min staleTime, prefetch-ready
  □ useLocation: GPS access, reverse geocode, city name in store

SKELETON COMPONENTS:
  □ SkeletonCategoryCard: exact 106×100px match to real card
  □ SkeletonCategoryGrid: 6 cards in 2×3 grid layout
  □ SkeletonHomeHeader: location pill + greeting placeholders
  □ All skeletons: shimmer animation runs smoothly (60fps)

TAB BAR:
  □ TabBar.tsx: 4 tabs, equal width (25% each)
  □ Icon animation: scale 1.0→0.85→1.0 on press
  □ Color: muted→green on active (timingConfig.fast)
  □ Sliding indicator: moves between tabs with spring.gentle
  □ Haptic: selectionAsync on every tab press
  □ Cart badge: shows/hides with scale animation
  □ All 4 tabs navigable

HOME SCREEN COMPONENTS:
  □ HomeHeader: location city + time greeting + notification bell
  □ HomeHeader: bell ring animation on new notification
  □ SearchPromptBar: press animation + navigates to /search
  □ ServiceCategoryCard: correct colors per category type
  □ ServiceCategoryCard: press animation (scale 0.95→1.02→1.0)
  □ CategoryGrid: loading → skeleton → stagger reveal
  □ CategoryGrid: 6 cards in 2×3 grid
  □ CategoryGrid: "See all →" navigates correctly

HOME SCREEN:
  □ app/(tabs)/index.tsx: Header + SearchBar + CategoryGrid assembled
  □ ScrollView with correct bottom padding
  □ 3 placeholder tab screens exist and are navigable
  □ Tab navigation works between all 4 tabs

QUALITY:
  □ tsc --noEmit: zero errors on all 20 new files
  □ eslint: zero warnings
  □ Home screen loads and shows content within 1.5s on first open
  □ Home screen loads INSTANTLY (from cache) on subsequent opens
  □ Tested on iPhone SE (375px) — all content visible above fold
  □ Tested on Android emulator — tab bar elevation correct
  □ All category cards show correct icon + color per category
  □ Location city name shows correctly in header
  □ Greeting is time-appropriate
```

---

## UX Laws Final Audit — Day 4

```
RECOGNITION OVER RECALL:
  ✅ Category icons: visual recognition, not text-only
  ✅ Icon colors per category: electrician=amber, plumber=blue, etc.
  ✅ Skeleton shapes match real content exactly (layout recognition)
  ✅ City name in header: user recognizes their location, confirms relevance
  ✅ Tab icons with labels: dual-coding (icon + text = faster recognition)

FITTS' LAW:
  ✅ Each tab: full 25% screen width × 60px height = massive target
  ✅ Category cards: 106×100px = generous tap area for service cards
  ✅ Search bar: full width × 52px = hard to miss
  ✅ Notification bell: 44×44px via hitSlop even though icon is 22px
  ✅ HomeHeader location pill: 28px height + pill shape = thumb-friendly

HICK'S LAW:
  ✅ 6 categories shown (not all 20+) — ~1.3s decision time
  ✅ 4 tabs (not 5 or 6) — instantly clear hierarchy
  ✅ Home screen: one primary action zone (categories)
  ✅ Search bar: single purpose (navigate to search, not search in place)
  ✅ Tab bar: no overflow menus, no "more" tab — all visible, all decided

JAKOB'S LAW:
  ✅ Bottom tab bar: Uber, Airbnb, Instagram, every major app
  ✅ 2×3 category grid: Urban Company, TaskRabbit, UrbanClap
  ✅ Search bar at top: universal mobile pattern
  ✅ Fake search bar → real search screen: Airbnb, Urban Company
  ✅ Location pill in header: Uber, InDriver, every location app

PEAK-END RULE:
  ✅ Category stagger entrance: 6 cards bouncing in = PEAK of first home view
  ✅ Tab switch animation: scale bounce = micro-peak per tab change
  ✅ Card press release: 1.02 overshoot = satisfying micro-peak per tap
  ✅ Skeleton → content: fade+scale reveal = satisfying transition moment
  ✅ Bell ring on notification: visual + haptic = memorable attention signal

GOAL GRADIENT EFFECT:
  ✅ Category cards prefetch on grid mount → instant category screen
  ✅ 30s staleTime → user never sees loading on return visits
  ✅ HomeHeader: city name loads quickly → user confirmed "I'm in the right place"
  ✅ Category grid: 6 options visible → user can spot goal in 1.3s
  ✅ Tab bar proximity: Bookings tab always visible = booking goal 1 tap away

SERIAL POSITION EFFECT:
  ✅ HomeHeader FIRST on screen: greeting personalizes immediately
  ✅ Search bar SECOND: "what do you need?" sets up next action
  ✅ Categories LAST above fold: most important clickable content = most acted on
  ✅ Tab bar ALWAYS LAST (bottom): navigation = most remembered position
  ✅ Electrician FIRST in category grid (most popular): first = most booked
```

---

## What Day 5 Gets From Day 4

```
AFTER DAY 4, THE FOLLOWING ARE COMPLETE:

COMPLETE DATA LAYER:
  → All type definitions for categories, workers, location
  → Category API + caching hook (1hr staleTime)
  → Worker API + nearby hook (30s staleTime + 60s interval)
  → Location hook with GPS + reverse geocoding

COMPLETE NAVIGATION SHELL:
  → Custom animated tab bar (all 4 tabs working)
  → All 4 tab screens navigable (3 placeholder, 1 real)
  → Route guard working (auth → tabs)

HOME SCREEN TOP HALF:
  → HomeHeader (location, greeting, notification bell)
  → SearchPromptBar (navigation to search)
  → CategoryGrid (6 cards, stagger animation, all states)
  → Above-fold content complete = first impression shipped

DAY 5 WILL BUILD:
  → NearbyWorkersList (horizontal scroll, WorkerCardHorizontal)
  → WorkerCard components (compact + horizontal variants)
  → BannerCarousel (promotional banners, auto-scroll)
  → PopularServicesSection (ServiceListItem components)
  → RecentBookingBanner (active booking reminder, conditional)
  → Pull-to-refresh with Lottie animation
  → Home screen COMPLETE (all sections, full scroll)
  → Section component (reusable header + content slot)
```

---

*Tasklync — Day 4 Implementation Plan*
*20 files. 5 components. Complete data layer.*
*Tab bar, HomeHeader, CategoryGrid — the app's backbone.*
*Every micro-interaction mapped. Every UX law applied.*
*Pure implementation thinking. Zero code.*
