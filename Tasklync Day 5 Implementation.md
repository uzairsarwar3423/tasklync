# Tasklync — Day 5 Implementation Plan
## Home Screen Complete · Below-Fold Sections · Worker Cards · Banner System
### Senior React Native Expo | 25 Years | Pure Implementation Plan — Zero Code

> **This is a thinking document, not a typing document.**
> Every component decision is justified by UX law or engineering principle.
> Read it. Understand it. Then build from it.

---

## Day 5 Philosophy

```
"The first screen is a first date.
 Everything above the fold is the handshake.
 Everything below the fold is the conversation."

Day 4 built the handshake:
  HomeHeader (who we are) → SearchBar (what we do) → CategoryGrid (choose)

Day 5 builds the conversation:
  Nearby Workers (proof we deliver) → Banners (value signals) →
  Popular Services (social proof) → RecentBookingBanner (re-engagement)

THE CONVERSION THEORY:
  User arrives on Home screen → sees categories (Day 4)
  Decision: "I need an electrician" → taps category
  OR
  Decision: "Let me see who's around first" → scrolls down
  Day 5 captures that second user.

  The below-fold section answers: "Should I trust this platform?"
  Nearby workers with ratings + online status = trust proof.
  Popular services with prices = transparency.
  Banners = value (deals, guarantees, new features).

After Day 5: Home screen is production-complete.
Users can arrive, understand, and convert — without opening any other screen.
That's the highest bar in mobile product design.
Achieved in 5 days.
```

---

## What Day 4 Gave Us (Complete & Verified)

```
WORKING FOUNDATION:

  DATA LAYER (fully typed):
    ✅ WorkerNearby type — lean card data (distanceLabel, startingPrice, etc.)
    ✅ Category type — id, name, iconUrl, sortOrder
    ✅ useNearbyWorkers hook — React Query, 30s stale, 60s interval
    ✅ useCategories hook — React Query, 1hr stale, prefetch-ready
    ✅ useLocation hook — GPS, reverse geocode, city name

  TAB NAVIGATION:
    ✅ Custom TabBar — animated, 4 tabs, Fitts' Law compliant
    ✅ app/(tabs)/_layout.tsx — configured
    ✅ All 4 tab screens exist

  HOME SCREEN (top half complete):
    ✅ HomeHeader — location pill, greeting, notification bell
    ✅ SearchPromptBar — fake search bar, navigates to /search
    ✅ CategoryGrid — 6 cards, skeleton, stagger entrance
    ✅ app/(tabs)/index.tsx — ScrollView, top sections mounted

  SKELETON SYSTEM:
    ✅ Skeleton.tsx — base shimmer component
    ✅ SkeletonCategoryCard, SkeletonCategoryGrid, SkeletonHomeHeader

  INFRASTRUCTURE:
    ✅ axios interceptor — Bearer token auto-attached
    ✅ queryClient — staleTime, retry, offlineFirst
    ✅ all design tokens — colors, typography, spacing, shadows, radius, animations

BEFORE DAY 5 STARTS — VERIFY:
  □ Home screen top half renders correctly on iOS + Android
  □ CategoryGrid stagger animation plays smoothly
  □ Tab bar switches work with animations
  □ useNearbyWorkers returns data (or handles no-location gracefully)
  □ tsc --noEmit: zero errors on all Day 4 files
```

---

## UX Laws — Day 5 Application

```
Today applies UX laws at the SCROLL layer.
Scroll = user investment. Below fold = earned attention.
Design must REWARD that investment with information density
that feels effortless to consume.

┌──────────────────────────────────────────────────────────────────────┐
│  UX LAW              DAY 5 APPLICATION                               │
├──────────────────────────────────────────────────────────────────────┤
│  RECOGNITION         WorkerCard: Photo + name + rating visible       │
│  OVER RECALL         simultaneously — user recognizes "trusted       │
│                      worker" from visual pattern, not text           │
│                                                                      │
│                      Online dot (green) = RECOGNIZED as "available"  │
│                      across Uber, Airbnb, every booking app          │
│                      No text needed. User recalls nothing.           │
│                                                                      │
│                      Star rating ⭐ 4.9 = instantly parsed           │
│                      User doesn't calculate — they recognize "high"  │
│                      vs "low" from star count + number pattern       │
│                                                                      │
│                      Distance "1.2 km" = immediate spatial context  │
│                      User doesn't calculate time — they recognize   │
│                      near/far from the distance number pattern       │
│                                                                      │
│                      BannerCarousel: dot indicators = recognized    │
│                      as "there are more slides" — universal pattern  │
├──────────────────────────────────────────────────────────────────────┤
│  FITTS' LAW          WorkerCardHorizontal: 150px wide × full card   │
│                      height as tap target — entire card tappable,   │
│                      not just a button within it                    │
│                                                                      │
│                      "Book" button ON the worker card: 80px wide    │
│                      positioned at BOTTOM-RIGHT of card (thumb zone)│
│                      Not top-right (far from thumb in left-hand use) │
│                                                                      │
│                      "See on map →" link: deliberately small but    │
│                      has hitSlop 12px — still tappable, not primary │
│                                                                      │
│                      ServiceListItem: full 72px height tap area      │
│                      Entire row is tappable — not just the chevron  │
│                                                                      │
│                      RefreshControl: swipe from top edge            │
│                      Natural thumb gesture — maximum ease           │
│                      Fitts': large gesture area at screen edge      │
├──────────────────────────────────────────────────────────────────────┤
│  HICK'S LAW          Nearby workers: show 6-8 workers MAX           │
│                      Not 20. Not "all". Curated count.              │
│                      6-8 workers = ~3 bits = ~1.5s decision time    │
│                      "Which worker should I contact?" answered fast  │
│                                                                      │
│                      Each worker card: 4 data points MAX            │
│                      Name, rating, distance, category               │
│                      Not: skills, reviews count, hourly rate,       │
│                      bio, years experience, etc. (overload)         │
│                      "Is this worker good and close?" = answered    │
│                      in 4 data points. More = decision paralysis.   │
│                                                                      │
│                      Popular Services: show 4 services MAX          │
│                      Enough for recognition, not for overwhelm      │
│                                                                      │
│                      BannerCarousel: 2-3 banners MAX                │
│                      1 = not carousel. 4+ = ignored (banner blindness)│
├──────────────────────────────────────────────────────────────────────┤
│  JAKOB'S LAW         Horizontal card scroll = Netflix, Airbnb,      │
│                      Urban Company — "swipe to see more" is known   │
│                                                                      │
│                      Peek of next card (12px visible) = App Store   │
│                      preview pattern — user sees "more exists here" │
│                                                                      │
│                      Worker card layout = TaskRabbit, Urban Company │
│                      Photo left + name + rating + CTA right         │
│                       Every service app uses this layout            │
│                                                                      │
│                      Banner carousel dot indicators = universal     │
│                      from App Store screenshots to Airbnb promos    │
│                                                                      │
│                      Pull-to-refresh = every mobile app since 2010  │
│                      Most learned gesture in mobile UX history      │
├──────────────────────────────────────────────────────────────────────┤
│  PEAK-END RULE       PEAK of below-fold section:                    │
│                      "See on map" → Live Map opens (Day 10)         │
│                      The anticipation of seeing workers move on map  │
│                      is a peak moment that pulls users toward app   │
│                                                                      │
│                      MICRO-PEAKS throughout scroll:                  │
│                      → Worker cards slide in from right as user     │
│                        scrolls into the section (entrance animation)│
│                      → Banner transitions with crossfade + scale   │
│                      → Each ServiceListItem slightly springs in     │
│                                                                      │
│                      END moment of Home screen visit:               │
│                      Last item visible before user acts:            │
│                      Popular Services → "Book" / tap service        │
│                      The last thing is a SERVICE + PRICE            │
│                      User leaves home screen thinking about PRICE   │
│                      and immediate action — conversion psychology   │
├──────────────────────────────────────────────────────────────────────┤
│  GOAL GRADIENT       Section ordering communicates goal proximity:  │
│  EFFECT              → Categories (choose your need — step 1)       │
│                      → Nearby workers (they're close — step 2)      │
│                      → Popular services (others book this — step 3) │
│                      → [Book] buttons throughout — goal visible     │
│                                                                      │
│                      Worker card "Book" button always visible:      │
│                      User can reach goal without tapping into profile│
│                      "2 taps to book" → near-goal feeling = action  │
│                                                                      │
│                      Distance label "1.2 km away":                  │
│                      Proximity = near goal (worker is close)        │
│                      "Available now" = goal immediately achievable  │
│                      Both signals increase booking motivation       │
│                                                                      │
│                      RecentBookingBanner (if active booking):       │
│                      Shows progress: "Ahmed is on the way"         │
│                      Active goal = highest motivation state         │
│                      User completes check = goal gradient at peak  │
├──────────────────────────────────────────────────────────────────────┤
│  SERIAL POSITION     Section order (scroll position matters):       │
│  EFFECT              FIRST below fold: Nearby Workers               │
│                      → Most important trust signal: "workers exist" │
│                      → Most remembered section after home visit     │
│                                                                      │
│                      LAST before screen bottom: Popular Services    │
│                      → Last seen = most acted upon (conversion)     │
│                      → Price + service name = booking trigger       │
│                                                                      │
│                      Worker card data order (left to right reading):│
│                      Photo → Name → Rating → Distance              │
│                      Who → What → How good → How far               │
│                      Most critical info (who, quality) FIRST        │
│                      "How far" is last — user is already interested  │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Typography in Day 5 Components

```
RULE REMINDER: 3 fonts, 3 roles, zero exceptions.

SECTION COMPONENT (reusable header):
  Section title "Near You":    Poppins SemiBold, 16px (h4), textPrimary
  "See on map →":              Plus Jakarta Sans Medium, 13px, green
  "See all →":                 Plus Jakarta Sans Medium, 13px, green

WORKER CARD HORIZONTAL:
  Worker name:                 Poppins SemiBold, 13px, textPrimary
                               → Brand voice for people = warm, personal
  Category label:              Plus Jakarta Sans Regular, 11px, textMuted
  Rating "⭐ 4.9":             "4.9" = Inter SemiBold, 12px + ⭐ glyph
  Review count "(124)":        Plus Jakarta Sans Regular, 11px, textMuted
  Distance "1.2 km":          Inter Medium, 12px, textMuted
                               → Distance is data = Inter rule
  Available status:            Plus Jakarta Sans Medium, 11px, success green
  "Book" button label:         Poppins SemiBold, 12px (Button enforces)

WORKER CARD COMPACT (for list views):
  Worker name:                 Poppins SemiBold, 15px, textPrimary
  Sub info:                    Plus Jakarta Sans Regular, 13px, textMuted
  Price/rating:                Inter SemiBold, 14px, textPrimary
  Distance:                    Inter Medium, 12px, textMuted

BANNER CAROUSEL:
  Banner headline:             Poppins Bold, 18px (h3), white
  Banner subtitle:             Plus Jakarta Sans Regular, 13px, rgba(white 0.85)
  Banner CTA label:            Poppins SemiBold, 13px, white (Button variant)

SERVICE LIST ITEM:
  Service name:                Plus Jakarta Sans SemiBold, 14px, textPrimary
  Category name:               Plus Jakarta Sans Regular, 12px, textMuted
  Price "From Rs 500":         "Rs 500" = Inter SemiBold, 13px, primary green
                               "From " = Plus Jakarta Sans Regular, 12px, muted

RECENT BOOKING BANNER:
  Worker name:                 Poppins SemiBold, 14px, textPrimary
  Status "In Progress":        Plus Jakarta Sans Medium, 12px, success green
  Distance "2.3 km":          Inter Medium, 12px, textMuted
  "Track" button:              Poppins SemiBold (Button component)
  "Chat" button:               Poppins SemiBold (Button component)

PULL TO REFRESH:
  "Updating..." text:          Plus Jakarta Sans Medium, 13px, primary
  (Only visible if not using Lottie)
```

---

## Day 5 — Time Breakdown

```
TOTAL: 8 hours

Morning Session (4h):
  Task 5.1  — Section layout component               25 min
  Task 5.2  — WorkerCardHorizontal component         55 min
  Task 5.3  — WorkerCard (compact/list variant)      35 min
  Task 5.4  — OnlineBadge + WorkerAvailabilityBadge  20 min
  Task 5.5  — NearbyWorkersList component            35 min
  Task 5.6  — Skeleton for NearbyWorkersList         10 min

Afternoon Session (4h):
  Task 5.7  — BannerCarousel component               50 min
  Task 5.8  — ServiceListItem component              30 min
  Task 5.9  — PopularServicesSection component       25 min
  Task 5.10 — RecentBookingBanner component          35 min
  Task 5.11 — Pull-to-Refresh (RefreshControl)       20 min
  Task 5.12 — Home screen assembly (complete)        30 min
  Task 5.13 — Integration test + performance check   15 min
```

---

## Morning Session (4 Hours)

---

## Task 5.1 — Section Layout Component
### Duration: 25 minutes
### File: `src/components/layout/Section.tsx`

---

### Why Section Component Exists

```
RECOGNITION OVER RECALL + DRY PRINCIPLE:
  Home screen has 4+ sections:
    "Near You" + [See on map →]
    "Popular Services" + [See all →]
    "Services" + [See all →]  (Day 4 — in CategoryGrid)

  Without Section component:
    Each section duplicates: View + Text "title" + Pressable "See all"
    3 sections = 3 implementations = 3 places to fix bugs
    When "See all" needs a new color? 3 places to change.

  With Section component:
    ONE definition. Imported everywhere.
    Change label size once → updates everywhere.
    RECOGNITION: developer writes <Section title="Near You" actionLabel="See on map">
    Instantly understood. Zero recall needed.

SERIAL POSITION EFFECT in layout:
  Section component enforces:
    Title: prominent, left-aligned (first thing eye hits)
    Action link: right-aligned, smaller (secondary, last element)
  This visual hierarchy is CONSISTENT across all sections.
  User learns the pattern once → applies it everywhere (Jakob's Law).
```

---

### Component Specification

```
FILE: src/components/layout/Section.tsx

PROPS:
  title          → string (required) — section name
  actionLabel    → string (optional) — right-side link text
  onAction       → () => void (optional) — tap handler for action link
  children       → React.ReactNode (required) — section content
  paddingTop     → number DEFAULT: 24 (spacing.xl)
  showDivider    → boolean DEFAULT: false — top hairline divider

HEADER ROW SPECIFICATION:
  Container:
    flexDirection: 'row'
    justifyContent: 'space-between'
    alignItems: 'center'
    paddingHorizontal: 16 (layout.screenPaddingH)
    paddingBottom: 12px (space before content)
    paddingTop: determined by paddingTop prop

  Left — Title:
    Poppins SemiBold, 16px (textStyles.h4)
    color: colors.textPrimary

  Right — Action link (only if actionLabel provided):
    Pressable with hitSlop: 12 (Fitts' Law — small text needs touch extension)
    "See on map →" format: Plus Jakarta Sans Medium, 13px, colors.primary
    The "→" is part of the label string, not a separate icon
    Why text arrow not Lucide icon: lighter rendering, inline flow
    tap: onAction callback

CONTENT SLOT:
  Renders children directly below header row
  No padding (children manage their own padding)
  WHY no default content padding:
    WorkerCards need edge-to-edge horizontal scroll
    ServiceListItems need screen-edge horizontal padding
    PopularServicesSection has its own padding needs
    Section controls HEADER padding, children control CONTENT padding

DIVIDER (optional):
  1px height, colors.border, width: 100%
  Shows above the section header when showDivider=true
  Used between sections that follow each other closely

REUSE COUNT:
  Section used in: CategoryGrid, NearbyWorkersList, PopularServicesSection,
  BannerCarousel section wrapper, NotificationScreen, SearchResults
  Minimum 6 uses in the app — worth building properly Day 5
```

---

## Task 5.2 — WorkerCardHorizontal Component
### Duration: 55 minutes
### File: `src/components/worker/WorkerCardHorizontal.tsx`

---

### Why This Component Is The Day's Most Important

```
THE BUSINESS CASE:
  WorkerCardHorizontal appears in the NearbyWorkersList.
  NearbyWorkersList is the HIGHEST CONVERSION section.
  Of all home screen sections, this section has the most
  direct path to a booking.

  User sees worker → taps "Book" → starts booking flow.
  2 taps. No profile visit needed. Fastest path to revenue.

  This component must be:
  - BEAUTIFUL (first impression of workers = impression of platform quality)
  - INFORMATIVE (enough to trust without too much to overwhelm)
  - ACTIONABLE (book button immediately visible, no scroll needed)

UX ANALYSIS — WHAT MATTERS ON A WORKER CARD:

  DECISION FACTORS for choosing a worker:
  1. Is this person qualified?    → Category label + verified badge
  2. Do others trust them?        → Rating + review count
  3. Are they nearby?             → Distance label
  4. Are they available NOW?      → Online status badge
  5. What's the cost?             → Starting price
  6. What do they look like?      → Photo (trust, recognition)

  HICK'S LAW: Show all 6. In the card. Simultaneously.
  Not sequentially. Not on a separate profile page.
  Decision happens on the card. Profile = confirmation only.
  6 data points on 150px card = achievable with careful layout.

SERIAL POSITION on the card:
  TOP: Photo (first — who is this person?)
  MIDDLE: Name + rating + distance (what's most important about them)
  BOTTOM: "Book" button (action — last thing, most acted upon)
  This top-to-bottom order = trust → facts → action
```

---

### Component Specification

```
FILE: src/components/worker/WorkerCardHorizontal.tsx
Used by: NearbyWorkersList (horizontal scroll)

DIMENSIONS:
  Width: 150px (fixed, horizontal scroll context)
  Height: 190px (auto, or fixed at 190px for uniform row height)
  Border radius: radius.lg (16px)
  Background: colors.bgCard (#FFFFFF)
  Shadow: shadows.sm

LAYOUT (top to bottom, inside 150px width):

  TOP — Avatar Section (height ~90px):
    expo-image: 150px wide × 80px tall (full-width cover photo style)
    OR: expo-image circular avatar 56px centered in 150px
    Border radius on image: radius.md (12px) at top corners only
    (matches card radius — nesting rule: 16 - 4 = 12)

    AVATAR APPROACH (preferred):
      56px circular avatar centered in 80px tall area
      BG of area: colors.bgSection (light gray) — subtle backdrop
      → Photo loads into circle with blurhash placeholder
      → If no photo: initials fallback (deterministic color)

    Online status dot (from OnlineBadge component):
      Overlaid bottom-right of avatar circle
      10px diameter, green for AVAILABLE, amber for BUSY, gray for OFFLINE
      Border: 2px white (creates visible separation from avatar)
      → RECOGNITION: green dot = available = every booking app

    Verified badge (if isVerified):
      Small shield-check 14px, positioned top-right of card
      BG: white circle 20px diameter
      Icon: colors.primary green
      → RECOGNITION: verification badge = trust signal = standard pattern

  CONTENT AREA — padding 10px horizontal, 8px top:

    Row 1 — Worker Name:
      Poppins SemiBold, 13px, textPrimary
      numberOfLines: 1 (ellipsis if long name)
      Why Poppins for name: people names = brand warmth
      "Ahmed Khan" in Poppins feels personal, not clinical

    Row 2 — Category (4px below name):
      Plus Jakarta Sans Regular, 11px, textMuted
      "Electrician" or "Plumber + 1 more"
      numberOfLines: 1

    Row 3 — Rating + Distance (6px below):
      LEFT: "⭐ " + Inter SemiBold 12px rating value + " " +
            Plus Jakarta Sans Regular 11px "(124)" review count
      RIGHT: Inter Medium 12px distance label "1.2 km"
      Two items same row, space-between layout

    Row 4 — Available status (4px below):
      OnlineBadge or WorkerAvailabilityBadge component (Task 5.4)
      "Available now" in green or "On a job" in amber
      Plus Jakarta Sans Medium, 11px

    Row 5 — Starting price (4px below, near bottom):
      "From " Plus Jakarta Sans Regular 11px muted +
      "Rs 500" Inter SemiBold 13px primary green
      Shows lowest service price (startingPrice from API)
      If null (quote only): "Price on request" in muted

  BOTTOM — Book Button (8px above card bottom):
    Button variant="primary" size="sm" (36px) fullWidth
    label: "Book"
    Poppins SemiBold, 12px
    Margin horizontal: 10px (button narrower than card for visual breathing)
    onPress: initiates booking flow (navigates to worker profile OR
             directly to booking/create with this workerId pre-selected)

PRESS INTERACTION ON CARD (not on Book button):
  Card is PressCard — entire 150×190px is tappable
  onPress: navigate to worker/[id] profile
  PressCard animation: scale 0.97 → 1.0 (spring default)
  Shadow: sm → none → sm
  Haptic: selectionAsync

  DISTINCTION from Book button:
  Tap card body: → worker profile (learn more)
  Tap "Book" specifically: → start booking (conversion)
  Both actions valid — different user intents served

LOADING STATE:
  Entire card replaced by SkeletonWorkerCard (horizontal variant)
  Skeleton: same 150×190px, same radii, shimmer animation

SKELETON SPECIFICATION (inline with this task):
  FILE: src/components/ui/Skeleton/SkeletonWorkerCardHorizontal.tsx
  Contents:
    Top: 150×80 rectangle (avatar area) — Skeleton component
    Name: 100×13 rectangle — Skeleton component
    Sub: 70×11 rectangle — Skeleton component
    Rating row: two small rectangles side by side
    Button: 130×30 rectangle — Skeleton component
  All shimmer running left → right
```

---

## Task 5.3 — WorkerCard Compact Component
### Duration: 35 minutes
### File: `src/components/worker/WorkerCard.tsx`

---

### Component Specification

```
FILE: src/components/worker/WorkerCard.tsx
Used by: SearchResults, CategoryScreen worker section, Explore tab

WHY SEPARATE FROM HORIZONTAL:
  HICK'S LAW: one component per context.
  Horizontal card: 150px wide (scroll context, less info)
  Compact card: full-width (list context, more info visible)
  Different context = different optimal layout = separate components
  Trying to make one card work in both contexts = compromised design

DIMENSIONS:
  Width: 100% (full screen width - 32px margins)
  Height: 80px (list item standard height)
  Border radius: radius.lg (16px)
  Background: colors.bgCard (#FFFFFF)
  Shadow: shadows.sm
  Margin bottom: layout.cardGap (10px between cards)

LAYOUT (horizontal, left to right):
  Padding: 14px vertical, 16px horizontal

  LEFT — Avatar (56px circle):
    expo-image with blurhash placeholder
    Border: none (list context, no ring needed)
    OnlineBadge: 10px dot, bottom-right position

  CENTER (flex: 1, marginLeft: 12):
    Row 1: Worker name — Poppins SemiBold, 15px, textPrimary
    Row 2: Category — Plus Jakarta Sans Regular, 13px, textMuted
            "+ N more" if multiple categories
    Row 3: ⭐ Inter SemiBold 13px rating + " · " + Inter Medium 12px distance

  RIGHT — Price + Chevron:
    "Rs 500/hr" — Inter SemiBold, 13px, textPrimary
    Below: "Available" — Plus Jakarta Sans Medium, 11px, green
    ChevronRight: 14px, textMuted (indicates navigable row)

INTERACTION:
  Full card tappable (not just chevron — Fitts' Law)
  onPress: navigate to worker/[id]
  Press animation: scale 0.97 → 1.0 (spring default)
  Shadow: sm → none (press) → sm (release)
  Haptic: selectionAsync

FILE: src/components/ui/Skeleton/SkeletonWorkerCard.tsx
(Already referenced in Day 4, finalize here for list context)
  HEIGHT: 80px (matches compact card)
  Layout: 56px circle + 3 text rows + right price block
```

---

## Task 5.4 — Online Badge + Availability Badge Components
### Duration: 20 minutes
### Files:
### `src/components/ui/Badge/OnlineBadge.tsx`
### `src/components/worker/WorkerAvailabilityBadge.tsx`

---

### OnlineBadge Specification

```
FILE: src/components/ui/Badge/OnlineBadge.tsx

PURPOSE:
  The animated green dot that signals a worker is available.
  Used inside Avatar component AND standalone.

PROPS:
  status: 'online' | 'busy' | 'offline'
  size: number DEFAULT: 10

VISUAL:
  Solid dot (size × size, circle)
  Color per status:
    online:  colors.online (#22C55E)
    busy:    colors.busy (#F59E0B)
    offline: colors.offline (#94A3B8)

  Border: 2px white (separates from any background)

PULSE ANIMATION (online status ONLY):
  Reanimated SharedValue: pulseScale (initial 1.0)
  Reanimated SharedValue: pulseOpacity (initial 0.6)

  Animation:
    pulseScale: withRepeat(withTiming(1.8, {duration: 1500}), -1, false)
    pulseOpacity: withRepeat(
      withSequence(
        withTiming(0.5, {duration: 750}),
        withTiming(0, {duration: 750})
      ), -1, false
    )

  A second, larger AnimatedView sits behind the solid dot:
    Same size as dot initially, same color at 30% opacity
    It scales OUT and fades OUT while the solid dot stays still
    Creates: breathing/pulsing ring around the dot

  WHY PULSE ONLY FOR ONLINE:
    Busy/offline = stable states, no urgency signal needed
    Online = "available NOW" = time-sensitive = pulse creates urgency
    GOAL GRADIENT: pulsing online dot = "act now while available"
    Users subconsciously feel: "this worker is ready, I should book"
    This is intentional behavioral UX — not decorative animation

WHEN TO NOT ANIMATE:
  If device has reduceMotion accessibility setting: no pulse
  Show static green dot only
```

---

### WorkerAvailabilityBadge Specification

```
FILE: src/components/worker/WorkerAvailabilityBadge.tsx

PURPOSE:
  Text badge showing worker status with semantic color.
  Used in WorkerCard content area and WorkerProfile screen.

PROPS:
  status: WorkerAvailabilityStatus (from worker.types.ts)
  availableUntil?: string ("18:00" — shown for AVAILABLE status)
  size: 'sm' | 'md' DEFAULT: 'sm'

STATUS → VISUAL MAPPING:

  AVAILABLE:
    Dot: OnlineBadge status="online" size=6 (inline)
    Text: "Available now" + (availableUntil ? " · Until " + availableUntil : "")
    Text color: colors.online (#22C55E)
    Font: Plus Jakarta Sans Medium, 11px (sm) | 13px (md)

  BUSY:
    Dot: OnlineBadge status="busy" size=6
    Text: "On a job"
    Text color: colors.busy (#F59E0B)

  PAUSED:
    Dot: OnlineBadge status="offline" size=6
    Text: "Paused"
    Text color: colors.textMuted

  OFFLINE:
    Dot: OnlineBadge status="offline" size=6
    Text: "Offline" (or "Available tomorrow" if known)
    Text color: colors.textMuted

  INACTIVE:
    (No dot — inactive is a state, not momentary)
    Text: "Inactive" or nothing (depend on context)
    Text color: colors.textMuted

  UNAVAILABLE:
    Text: "Unavailable today"
    Text color: colors.textMuted

LAYOUT:
  flexDirection: row, alignItems: center, gap: 4
  Dot and text inline on same line
```

---

## Task 5.5 — NearbyWorkersList Component
### Duration: 35 minutes
### File: `src/components/home/NearbyWorkersList.tsx`

---

### Why This Section Is the Trust Engine

```
UX RESEARCH INSIGHT:
  First-time users of any service marketplace have ONE core fear:
  "Will there actually be a worker available when I need one?"

  The NearbyWorkersList destroys that fear visually.
  User sees: 6 photos of real people, online NOW, 1-3km away.
  Fear is replaced by confidence. Confidence drives booking.

  This is not just a list. This is the app's primary trust mechanism.

  RECOGNITION OVER RECALL in its most powerful form:
  User doesn't need to read "we have workers available."
  They SEE workers. Photos. Names. Distances.
  Seeing is believing. This section is designed to be believed.
```

---

### Component Specification

```
FILE: src/components/home/NearbyWorkersList.tsx

WRAPPER: Section component (Task 5.1)
  title: "Near You"
  actionLabel: "See on map →"
  onAction: () => router.push('/(map)/live-map')

DATA SOURCE:
  useNearbyWorkers hook (from Day 4)
  Limit: first 8 workers (enough to show variety, not overwhelm)
  Sorted by: distance ASC (nearest first — GOAL GRADIENT: closest to goal)

HORIZONTAL SCROLL CONTAINER:
  FlashList (from @shopify/flash-list, not FlatList)
  horizontal: true
  showsHorizontalScrollIndicator: false
  estimatedItemSize: 150 (WorkerCardHorizontal width)
  
  Padding:
    contentContainerStyle: paddingHorizontal: 16, paddingVertical: 8
    Gap between cards: 12px (contentInsetAdjustmentBehavior or itemSeparator)
  
  PEEK EFFECT (Jakob's Law: implies more content):
    Right edge of list: 12px of next card visible
    Achieved by: contentContainerStyle paddingRight: 4px
    AND: container width: screenWidth (not screenWidth - 32)
    → User SEES the next card peeking = knows to scroll
    → This reduces "is there more?" uncertainty

STATES:

  LOADING STATE:
    useNearbyWorkers.isLoading === true
    Show: horizontal row of 4 SkeletonWorkerCardHorizontal components
    (4 skeletons = implies list will be long, sets expectation)

  EMPTY STATE (no workers nearby):
    Show: EmptyState component (from Day 2 feedback folder)
    Illustration: placeholder or Lottie empty map
    Title: "No workers nearby"
    Subtitle: "Try expanding your search radius or check back later"
    CTA: "Search all workers" → router.push('/search')
    Height: same as list would be (prevents layout jump)
    NOTE: Empty state is NOT an error. Workers may simply not be nearby.
    Tone must be helpful, not alarming.

  ERROR STATE:
    Discrete error in section (not full-screen takeover):
    Small text row: "Couldn't load nearby workers. " + [Retry] link
    Error state = section degraded, not app broken
    User can still use search bar

  DATA STATE:
    FlashList renders WorkerCardHorizontal per worker
    First render: no entrance animation (data arrives during skeleton)
    If data arrives while skeleton showing:
      Cross-fade: skeleton fades out (200ms), list fades in (200ms, delay 100ms)
      Simultaneous transition = smooth (not jarring snap)
    If data arrives after user has scrolled:
      No animation — replace in-place (user is past this section)

SCROLL BEHAVIOR:
  Bounces: true (iOS elastic scroll at ends — Jakob's Law)
  Decelerates: fast (contentOffset snapping not enabled — free scroll)
  No momentum snap (each card doesn't snap — smooth continuous scroll)

PERFORMANCE:
  FlashList recycling: handles 20+ workers efficiently if needed
  Only 8 shown → minimal render overhead
  Images: expo-image with cachePolicy="memory-disk" (cached on first load)
```

---

## Task 5.6 — Skeleton for NearbyWorkersList
### Duration: 10 minutes
### File: `src/components/ui/Skeleton/SkeletonWorkerCardHorizontal.tsx`

---

### Specification

```
FILE: src/components/ui/Skeleton/SkeletonWorkerCardHorizontal.tsx

MATCHES: WorkerCardHorizontal exactly (150×190px, r-lg)

INTERNAL STRUCTURE:
  Top block: 150×80px Skeleton (avatar area)
  Padding 10px H:
    Name: 100×13px Skeleton, marginBottom 4
    Category: 70×11px Skeleton, marginBottom 6
    Rating row: two 60×12px side by side (rating left, distance right)
    Status: 80×11px Skeleton, marginBottom 4
    Price: 60×13px Skeleton
  Bottom: 130×30px Skeleton (button area)

All shimmer animations synchronized (same timing from Day 2 Skeleton base)

RENDER COUNT IN LIST: 4 horizontally (shows breadth of expected content)
```

---

## Afternoon Session (4 Hours)

---

## Task 5.7 — BannerCarousel Component
### Duration: 50 minutes
### File: `src/components/home/BannerCarousel.tsx`

---

### Why Banners Matter (And Why They Can Fail)

```
BANNER BLINDNESS WARNING:
  Research shows 86% of users have developed "banner blindness"
  — automatically ignoring anything that looks like an ad.

  HOW TO BEAT BANNER BLINDNESS:
  1. Make banners look like CONTENT, not ads
     → Green brand gradient, not random colors
     → Product information (deals, features) not generic promo
  2. Keep banner count low (2-3 max — Hick's Law)
  3. Auto-scroll but PAUSE on touch (respects user intent)
  4. Meaningful content: "Free service if worker is late" = useful
  5. No animation that screams "advertisement" (flashing, colors cycling)

  OUR BANNER STRATEGY:
  Banner 1: Value guarantee — "100% refund if not satisfied"
             → Removes buyer anxiety → conversion booster
  Banner 2: Referral / promo — "Invite friends, get Rs 200 off"
             → Growth mechanism + value for user
  Banner 3: New feature — "Workers now accept instant bookings"
             → Platform update = content, not ad

  SERIAL POSITION: Banner is LAST thing user sees before Popular Services.
  Its message carries emotional weight into the booking decision.
```

---

### Component Specification

```
FILE: src/components/home/BannerCarousel.tsx

DATA:
  banners: array passed as prop (or from a query hook)
  For Day 5: static array in the component (API integration Day 10)
  Array of:
    id: string
    title: string
    subtitle: string
    ctaLabel: string | null
    ctaAction: () => void | null
    gradient: [string, string] (start and end gradient colors)
    imageUrl: string | null

DEFAULT BANNERS (static for now):
  Banner 1:
    title: "100% Satisfaction Guarantee"
    subtitle: "Not happy? Get a full refund, no questions asked."
    gradient: ['#16A34A', '#15803D'] (primary green gradient)
    ctaLabel: "Learn more"

  Banner 2:
    title: "Refer a Friend"
    subtitle: "Share Tasklync, both get Rs 200 off next booking."
    gradient: ['#0EA5E9', '#0284C7'] (sky blue)
    ctaLabel: "Invite friends"

VISUAL SPECIFICATION:

  Container:
    Height: 140px
    Margin horizontal: 16px
    Border radius: radius.xl (20px)
    Shadow: shadows.md

  Per Banner:
    Width: 100% of container (full banner width)
    Height: 140px
    Border radius: radius.xl
    Background: LinearGradient with banner.gradient colors
    start: {x:0, y:0} → end: {x:1, y:0} (horizontal gradient)

  Banner content:
    Padding: 20px all sides
    
    Title (top area):
      Poppins Bold, 18px (h3), white
      numberOfLines: 2

    Subtitle (below title, 6px gap):
      Plus Jakarta Sans Regular, 13px, rgba(255,255,255,0.85)
      numberOfLines: 2

    CTA button (bottom, if ctaLabel):
      Variant: ghost-like but on dark bg
      BG: rgba(white, 0.2), label: white 12px
      Height: 32px, radius: pill
      Position: bottom-left or bottom-right

    Optional decorative element:
      Abstract shape or icon in top-right at 30% opacity
      Adds visual richness without competing for attention

  Page Dot Indicators:
    Position: centered below carousel (not overlaid)
    Gap below banner: 10px, gap below dots: 0px (Section handles spacing)
    Style: same as Welcome screen dots (Day 3)
      Inactive: 6px circle, green 30% opacity
      Active: 20px pill, green 100% opacity
      Transition: width interpolation with scrollX shared value

AUTO-SCROLL:
  Timer: every 4000ms (4 seconds) advance to next banner
  Implementation: setInterval in useEffect
  Pause: when user touches/presses the banner (onTouchStart → clearInterval)
  Resume: onTouchEnd → restart interval
  WHY PAUSE ON TOUCH: respects user intent to read
  Jakob's Law: Airbnb, every carousel pauses on touch

SCROLL MECHANISM:
  FlatList with horizontal + pagingEnabled
  scrollEventThrottle: 16 (smooth dot animation)
  scrollX shared value → dot widths interpolated
  Same pattern as Welcome screen (Day 3 code reference)

MICRO-INTERACTION — BANNER TRANSITION:
  Auto-advance: scrollTo with animated:true (smooth slide)
  Manual swipe: FlatList handles natively (spring physics)
  Dot update: immediate (no delay — user expects instant feedback)

PERFORMANCE:
  Only 2-3 banners → no virtualization needed
  LinearGradient renders once per banner
  Auto-scroll timer cleaned up on unmount (useEffect cleanup)
```

---

## Task 5.8 — ServiceListItem Component
### Duration: 30 minutes
### File: `src/components/service/ServiceListItem.tsx`

---

### Component Specification

```
FILE: src/components/service/ServiceListItem.tsx
Used by: PopularServicesSection, CategoryScreen service list

PURPOSE:
  Display a single service in a list row format.
  The primary discovery unit for service-first browsing.

DIMENSIONS:
  Height: 72px (list item height — compact but not cramped)
  Full width
  Border radius: radius.lg (16px)
  Background: colors.bgCard (#FFFFFF)
  Shadow: shadows.sm
  Margin bottom: 10px

VISUAL LAYOUT (horizontal, left to right):

  LEFT — Service Icon Area (56×56px):
    Rounded square (radius.md = 12px) container
    Background: category-specific tint (same as CategoryCard colors)
    Icon: category SVG or Lucide fallback, 24px
    Position: vertically centered, 14px from card left edge
    WHY ICON: RECOGNITION — visual instantly categorizes the service
              User scans icon → category → decides in 200ms without reading

  CENTER (flex: 1, marginLeft: 12):
    Row 1 — Service name:
      Plus Jakarta Sans SemiBold, 14px, textPrimary
      numberOfLines: 1 (ellipsis if too long)

    Row 2 — Category + Duration (6px below):
      Category: Plus Jakarta Sans Regular, 12px, textMuted
      " · " separator
      Duration: Inter Regular, 12px, textMuted (duration is data = Inter)
      e.g., "Electrician · 45-60 min"

    Row 3 — Price (4px below):
      "From " Plus Jakarta Sans Regular, 12px, textMuted
      price value: Inter SemiBold, 13px, colors.primary
      e.g., "From Rs 500"

  RIGHT — Chevron + Add (vertical stack):
    ChevronRight: 16px, textMuted
    OR: AddToCartButton sm size (if in category-browse context)
    In home Popular Services: chevron only (navigates to service detail)

INTERACTION:
  onPress: navigate to service/[id] detail screen
  Full row tappable (Fitts' Law — not just chevron)
  Press animation: scale 0.98 → 1.0 (spring stiff then default)
  Background: bgCard → bgSection on press (subtle highlight)
  Haptic: selectionAsync

WHY NO "BOOK" BUTTON ON SERVICE LIST ITEM:
  HICK'S LAW: Service list context = browsing, not booking
  "Book" button implies worker selected — service has multiple workers
  Correct flow: tap service → see workers who offer it → book specific worker
  Adding Book here = wrong conversion path = broken UX

SKELETON:
  FILE: (add to SkeletonWorkerCard or new SkeletonServiceListItem)
  72px height, icon area (56×56 block) + 3 text rows + right chevron block
```

---

## Task 5.9 — PopularServicesSection Component
### Duration: 25 minutes
### File: `src/components/home/PopularServicesSection.tsx`

---

### Component Specification

```
FILE: src/components/home/PopularServicesSection.tsx

PURPOSE:
  Show 4 most-booked services to help users discover via social proof.
  "Popular" = others are booking this = safe choice signal.

  JAKOB'S LAW: "Popular" labeling = Amazon's "Best Seller", Airbnb's
  "Guest Favorite" — users trust what others have validated.

DATA SOURCE:
  usePopularServices hook (NEW — specify today, implement same session):

  FILE: src/hooks/usePopularServices.ts
    Queries: GET /categories?popular=true OR specific endpoint
    Returns: top 4 most-booked services
    staleTime: 3600_000 (1 hour — popularity rank doesn't change rapidly)
    Fallback: if API doesn't support popularity: use hardcoded list from
              categories data (services sorted by sortOrder)
    For Day 5: Use static array while API is in development
    (Mock with MSW pattern or static data, replace with API Day 8)

WRAPPER: Section component
  title: "Popular Services"
  actionLabel: "See all →"
  onAction: () => router.push('/search') with popular filter

CONTENT:
  4 ServiceListItem components, vertically stacked
  Padding horizontal: 16px
  No dividers between items (shadow on each card provides separation)

STATES:
  Loading: 4 SkeletonServiceListItem components
  Error: "Services unavailable" inline text (non-blocking)
  Empty: handled at static data level (should always have 4)

SERIAL POSITION APPLICATION:
  Item 1 (FIRST): Most popular service — e.g., "Fan Installation"
  Item 4 (LAST): Often the highest-value service — e.g., "AC Installation"
  
  WHY:
    First item = most remembered = show what MOST people want
    Last item = most acted upon = show a high-value conversion opportunity
    This ordering maximizes both discovery AND revenue per section
```

---

## Task 5.10 — RecentBookingBanner Component
### Duration: 35 minutes
### File: `src/components/home/RecentBookingBanner.tsx`

---

### Why This Is A Critical Retention Component

```
THE USER PSYCHOLOGY:
  If a user has an active or recent booking, that is the MOST
  IMPORTANT thing to them right now. Everything else is secondary.

  Without this banner: user must navigate to Bookings tab to check.
  Multiple taps. Anxiety: "Where is Ahmed? Is he coming?"

  With this banner: instant visibility on the most-used screen.
  "Ahmed is on the way — 1.2km" = immediate reassurance.
  ONE glance. Zero navigation. Maximum trust.

  GOAL GRADIENT:
  Active booking = user's current goal is IN PROGRESS.
  Banner shows goal progress: "2.3 km away · ETA 12 min"
  Progress visible = motivation maintained = user stays in app = trusts platform.

SERIAL POSITION: Banner appears SECOND on home screen
  (immediately below HomeHeader, BEFORE SearchBar when active)
  Why second: active booking = the user's current highest priority
  FIRST thing they need to know after opening the app
  Above everything else when booking is active
```

---

### Component Specification

```
FILE: src/components/home/RecentBookingBanner.tsx

CONDITION: Only renders if activeBooking exists
useActiveBooking hook (specify below):

FILE: src/hooks/useActiveBooking.ts
  Queries bookings with status filter: ['PENDING','ACCEPTED','IN_PROGRESS']
  Returns: first active booking OR null
  staleTime: 10_000 (10 seconds — booking status changes rapidly)
  refetchInterval: 30_000 (check for updates every 30s)
  This hook powers: tab bar Bookings badge AND this banner

IF NO ACTIVE BOOKING:
  Component returns null (renders nothing)
  ScrollView has no layout shift (null returns take zero space)

BANNER VISUAL SPECIFICATION:

  Container:
    Margin: 12px top, 16px horizontal
    Border: 1.5px colors.primaryBorder (#BBF7D0 — soft green)
    BG: colors.bgSuccess (#F0FDF4 — mint haze)
    Border radius: radius.lg (16px)
    Padding: 14px horizontal, 12px vertical
    Shadow: shadows.xs (subtle float)

  LAYOUT — flexDirection row:

    LEFT — Status indicator + Worker info:
      Top row:
        Pulsing dot: 8px, green for IN_PROGRESS, amber for PENDING/ACCEPTED
        Status text: Plus Jakarta Sans SemiBold, 13px, status-appropriate color
        "In Progress" / "Worker Accepted" / "Worker Coming"

      Bottom row (6px below):
        Worker name: Poppins SemiBold, 14px, textPrimary
        " · " + distance if available: Inter Medium, 13px, textMuted

    RIGHT — Action buttons:
      Stack (column, top to bottom, gap 6px):

      "Track" button:
        Button variant="primary" size="sm" (36px)
        Label: "Track"
        Poppins SemiBold, 12px
        Width: 72px (fixed, not fullWidth)
        onPress: router.push(`/booking/${activeBooking.id}/track`)

      "Chat" button:
        Button variant="secondary" size="sm" (36px)
        Label: "Chat"
        Width: 72px (fixed)
        onPress: router.push(`/booking/${activeBooking.id}/chat`)

STATUS-SPECIFIC CONTENT:

  PENDING (worker hasn't accepted yet):
    Dot: amber pulsing (busy color = waiting)
    Text: "Waiting for worker"
    Sub: Worker name + " · Expires in MM:SS" (countdown)
    Right: [Cancel] button only (can cancel before acceptance)

  ACCEPTED (worker accepted, not started):
    Dot: blue (info color = acknowledged)
    Text: "Booking Confirmed"
    Sub: Worker name + " · " + scheduled time

  IN_PROGRESS (worker is working):
    Dot: green pulsing (online = active)
    Text: "In Progress"
    Sub: Worker name + " · Started " + relative time
    Right: [Track] [Chat]

ENTRANCE ANIMATION:
  When this banner appears (active booking exists):
    translateY: -20 → 0, opacity: 0 → 1 (spring gentle)
    Delays: 200ms after home screen mounts
    → Banner slides down from above = catches attention without jarring

  When booking completes and banner disappears:
    translateY: 0 → -20, opacity: 1 → 0 (spring stiff, 200ms)
    → Smooth exit, not instant disappear

HOME SCREEN INTEGRATION:
  Banner renders BEFORE SearchPromptBar in the ScrollView
  Conditional: {activeBooking && <RecentBookingBanner booking={activeBooking} />}
  When banner present: SearchBar and categories shift down naturally
  ScrollView handles reflow
```

---

## Task 5.11 — Pull-to-Refresh System
### Duration: 20 minutes
### File: `src/components/feedback/CustomRefreshControl.tsx`

---

### Specification

```
FILE: src/components/feedback/CustomRefreshControl.tsx

PURPOSE:
  Branded pull-to-refresh indicator instead of default system spinner.

WHY CUSTOM:
  PEAK-END RULE: the pull-to-refresh gesture is a micro-peak.
  Default iOS gray spinner: forgettable, no brand signal.
  Custom green indicator: reinforces brand at a moment of user action.
  Every refresh = brand reinforcement = memorable micro-peak.

IMPLEMENTATION APPROACH — Two Options (choose based on complexity):

  OPTION A (simpler, Day 5 appropriate):
    Use standard RefreshControl from React Native
    tintColor: colors.primary (#16A34A)
    colors: [colors.primary] (Android)
    progressBackgroundColor: colors.bgCard (Android)
    This gives: green spinner = branded, simple, correct

  OPTION B (premium — requires Lottie):
    RefreshControl with custom Lottie during pull
    Not practical without Lottie asset ready
    DEFER to Day 20 if Lottie assets ready then

  DAY 5 DECISION: Option A (green RefreshControl)
    Ship the branded color, defer custom Lottie
    HICK'S LAW applied to build decisions: simpler = faster to ship
    Green spinner = 90% of the brand benefit of custom Lottie
    Custom Lottie = 10% extra delight at 3× the build time

REFETCH LOGIC ON PULL:
  In app/(tabs)/index.tsx:
  onRefresh handler calls:
    useCategories().refetch()
    useNearbyWorkers().refetch()
    usePopularServices().refetch()
    useActiveBooking().refetch()

  All 4 queries refetch in parallel (Promise.all pattern)
  isRefreshing state: true while ANY query is still loading
  When all done: isRefreshing = false (spinner stops)

USER FEEDBACK:
  Pull → green spinner appears
  Data refreshes (all 4 queries)
  Spinner disappears
  Content updates in place (FlashList updates)
  Toast (optional): "Updated" with ✓ (subtle, 1.5s auto-dismiss)
```

---

## Task 5.12 — Home Screen Complete Assembly
### Duration: 30 minutes
### File: `app/(tabs)/index.tsx` (complete)

---

### Complete Home Screen Specification

```
FILE: app/(tabs)/index.tsx (updates to Day 4's partial implementation)

FULL SECTION ORDER (top to bottom in scroll):

  ALWAYS FIRST:
    HomeHeader (sticky-feeling, fixed at top)
    → Location + greeting + notification bell

  CONDITIONAL (only when active booking exists):
    RecentBookingBanner
    → Slides in from top, takes priority

  ALWAYS PRESENT:
    SearchPromptBar (below header or banner)
    → 12px margin top, 16px H margin

  ALWAYS PRESENT:
    CategoryGrid via Section wrapper
    → Section: "Services" / "See all →"
    → 2×3 grid of ServiceCategoryCard

  ALWAYS PRESENT:
    NearbyWorkersList via Section wrapper
    → Section: "Near You" / "See on map →"
    → Horizontal FlashList of WorkerCardHorizontal

  ALWAYS PRESENT:
    BannerCarousel via Section wrapper
    → No section header needed (carousel is self-explanatory)
    → 140px carousel + dot indicators

  ALWAYS PRESENT:
    PopularServicesSection via Section wrapper
    → Section: "Popular Services" / "See all →"
    → 4 ServiceListItem components

SCROLL CONTAINER:
  ScrollView (not FlatList — content is heterogeneous sections)
  
  Props:
    showsVerticalScrollIndicator: false
    bounces: true (iOS)
    overScrollMode: 'auto' (Android)
    refreshControl: CustomRefreshControl (green tintColor, Day 5 Option A)
    contentContainerStyle:
      paddingBottom: 120px (tab bar 60px + extra breathing room)
      paddingTop: 0 (HomeHeader is first child, manages its own padding)

ANIMATED HEADER BEHAVIOR:
  As user scrolls DOWN:
    HomeHeader remains in position (not sticky-positioned, just first in flow)
    WHY: HomeHeader is 72px — sacrificing 72px of scroll-away space
         is not worth the engineering complexity of animating it
    Future enhancement (Day 30): animated collapse of header on scroll

SECTION SPACING:
  Between HomeHeader and SearchBar: 12px (spacing.md)
  Between SearchBar and CategoryGrid: 24px (spacing.xl = sectionGap)
  Between CategoryGrid and NearbyWorkersList: 24px
  Between NearbyWorkersList and BannerCarousel: 24px
  Between BannerCarousel and PopularServicesSection: 24px

HOME SCREEN DATA WATERFALL:

  INSTANT (from MMKV cache):
    user.name → greeting renders immediately
    currentCity → location pill renders immediately

  FAST (< 200ms, from React Query cache after first load):
    categories → CategoryGrid renders
    nearbyWorkers → NearbyWorkersList renders
    activeBooking → RecentBookingBanner renders (if any)

  FIRST LOAD ONLY (network request, ~500ms):
    All above queries run against API
    Skeletons shown during this time:
      SkeletonHomeHeader → HomeHeader
      SkeletonCategoryGrid → CategoryGrid
      SkeletonWorkerCardHorizontal × 4 → NearbyWorkersList
      ServiceListItem skeletons × 4 → PopularServicesSection

  SKELETON → CONTENT TRANSITIONS:
    Each section transitions independently
    Categories may load before workers → categories reveal first
    Staggered natural loading = feels alive (not all-at-once)
    PEAK-END: gradual revealing = multiple micro-peaks
```

---

## Task 5.13 — Integration Test + Performance Check
### Duration: 15 minutes

---

### Test Protocol

```
FUNCTIONAL TESTS:

  Complete Home Screen:
    □ All 5 sections visible in correct order
    □ HomeHeader: city + greeting + bell rendered
    □ SearchPromptBar: visible, tap → navigates
    □ CategoryGrid: 6 cards with icons
    □ NearbyWorkersList: horizontal scroll, cards visible
    □ BannerCarousel: banner visible, dots show
    □ PopularServicesSection: 4 services visible

  Conditional Banner:
    □ No active booking: banner NOT rendered
    □ Mock active booking in store: banner renders above search
    □ Track button: navigates to tracking screen (placeholder OK)
    □ Chat button: navigates to chat screen (placeholder OK)

  Scroll Behavior:
    □ All sections visible on scroll
    □ Pull-to-refresh: green spinner appears, data refetches
    □ Bottom padding: no content hidden behind tab bar

  Interactions:
    □ CategoryCard tap: navigates to category/[id]
    □ WorkerCardHorizontal tap (card): navigates to worker/[id]
    □ WorkerCardHorizontal "Book" button: starts flow
    □ ServiceListItem tap: navigates to service/[id]
    □ Banner CTA tap: navigates/acts correctly
    □ "See on map →": navigates to (map)/live-map (placeholder OK)
    □ "See all →" (popular): navigates to /search

  States:
    □ Loading: correct skeleton for each section
    □ Workers empty: EmptyState in NearbyWorkersList
    □ Error on workers: inline error + retry link

PERFORMANCE CHECK:

  □ Time-to-interactive: < 1.5s on first open (wifi network)
  □ Time-to-interactive: < 0.5s on return visit (cache)
  □ Category stagger: 60fps on mid-range Android emulator
  □ WorkerCard horizontal scroll: no dropped frames while scrolling
  □ Banner auto-scroll: smooth, no jank
  □ Pull-to-refresh: spinner appears immediately on pull gesture
  □ Memory: no visible leaks after 5 minutes of scrolling/tapping

DEVICE COVERAGE:
  □ iPhone SE (375×667) — smallest screen, all content visible
  □ iPhone 14 (390×844) — current standard
  □ Android API 31 (360×800) — baseline Android
```

---

## Day 5 — Complete File List

```
NEW FILES CREATED TODAY:

  LAYOUT:
    src/components/layout/Section.tsx              ← Reusable section wrapper

  WORKER COMPONENTS:
    src/components/worker/WorkerCardHorizontal.tsx  ← 150px horizontal card
    src/components/worker/WorkerCard.tsx            ← Full-width list card
    src/components/worker/WorkerAvailabilityBadge.tsx ← Status text badge

  BADGE:
    src/components/ui/Badge/OnlineBadge.tsx         ← Animated green pulse dot

  SKELETON (additional):
    src/components/ui/Skeleton/SkeletonWorkerCardHorizontal.tsx
    src/components/ui/Skeleton/index.ts             ← Updated exports

  HOME COMPONENTS:
    src/components/home/NearbyWorkersList.tsx       ← Horizontal worker scroll
    src/components/home/BannerCarousel.tsx          ← Auto-scroll banner
    src/components/home/RecentBookingBanner.tsx     ← Active booking reminder

  SERVICE COMPONENTS:
    src/components/service/ServiceListItem.tsx      ← Service row in list
    src/components/home/PopularServicesSection.tsx  ← 4 popular services

  HOOKS:
    src/hooks/useActiveBooking.ts                  ← Current active booking
    src/hooks/usePopularServices.ts                ← Top booked services

  FEEDBACK:
    src/components/feedback/CustomRefreshControl.tsx ← Green pull-to-refresh

MODIFIED FILES:
    app/(tabs)/index.tsx                           ← Home screen COMPLETE
    src/components/ui/Skeleton/index.ts            ← New skeleton exports

TOTAL NEW FILES: 15
TOTAL COMPONENTS SHIPPED: 10 new components
HOME SCREEN STATUS: ✅ PRODUCTION COMPLETE
```

---

## Day 5 — Micro-Interactions Complete Catalog

```
Every named. Every intentional. Every mapped to UX law.

SECTION HEADER:
  ┌──────────────────────────────────────────────────────────────────┐
  │ Element               Micro-Intention          UX Law           │
  ├──────────────────────────────────────────────────────────────────┤
  │ "See on map →" tap    Scale 0.98 → 1.0          Fitts' (hitSlop)│
  │ Haptic selection      "Noted"                   Jakob's          │
  │ Navigate to map       Goal is achievable        Goal Gradient    │
  └──────────────────────────────────────────────────────────────────┘

ONLINE BADGE (AVAILABLE):
  ┌──────────────────────────────────────────────────────────────────┐
  │ Element               Micro-Intention          UX Law           │
  ├──────────────────────────────────────────────────────────────────┤
  │ Pulse ring: scale 1→1.8, opacity 1→0 (1.5s loop)               │
  │                       "This person is LIVE now"  Goal Gradient  │
  │ Pulse continuous      "Worker is staying online"  Recognition   │
  │ No pulse for busy/offline  "Not available, stable" Hick's       │
  └──────────────────────────────────────────────────────────────────┘

WORKER CARD HORIZONTAL:
  ┌──────────────────────────────────────────────────────────────────┐
  │ Element               Micro-Intention          UX Law           │
  ├──────────────────────────────────────────────────────────────────┤
  │ Card press: scale 0.97  "Acknowledged"          Jakob's          │
  │ Shadow reduces          "Physical press feel"   Peak-End        │
  │ Release: scale 1.0     "Returning to ready"     Peak-End        │
  │ Haptic: selection      "Confirmed"              Recognition     │
  │ Navigate to profile    "Goal in reach"          Goal Gradient   │
  │ "Book" press: scale    "I'm acting on booking"  Peak-End        │
  └──────────────────────────────────────────────────────────────────┘

BANNER CAROUSEL:
  ┌──────────────────────────────────────────────────────────────────┐
  │ Element               Micro-Intention          UX Law           │
  ├──────────────────────────────────────────────────────────────────┤
  │ Auto-scroll (4s)      "There's more, explore"  Goal Gradient    │
  │ Dot expands (active)  "You're on this banner"  Recognition      │
  │ Pause on touch        "I respect your reading"  Jakob's         │
  │ Slide transition      "Moving to next value"    Serial Position │
  │ Resume on release     "Continuing journey"      Goal Gradient   │
  └──────────────────────────────────────────────────────────────────┘

SERVICE LIST ITEM:
  ┌──────────────────────────────────────────────────────────────────┐
  │ Element               Micro-Intention          UX Law           │
  ├──────────────────────────────────────────────────────────────────┤
  │ Press: scale 0.98      "Received"               Jakob's          │
  │ BG: bgCard→bgSection   "Highlighting for you"   Recognition     │
  │ Release: scale 1.0     "Done, navigating"       Peak-End        │
  │ Haptic selection       "Confirmed"              Jakob's          │
  └──────────────────────────────────────────────────────────────────┘

RECENT BOOKING BANNER:
  ┌──────────────────────────────────────────────────────────────────┐
  │ Element               Micro-Intention          UX Law           │
  ├──────────────────────────────────────────────────────────────────┤
  │ Slide-in from top     "Priority info arriving"  Serial Position │
  │ Status dot pulsing    "Your job is LIVE"        Goal Gradient   │
  │ ETA text (live)       "Getting closer to done"  Goal Gradient   │
  │ "Track" press         Scale + haptic medium     Fitts'          │
  │ Slide-out when done   "Clean completion"        Peak-End        │
  └──────────────────────────────────────────────────────────────────┘

PULL TO REFRESH:
  ┌──────────────────────────────────────────────────────────────────┐
  │ Element               Micro-Intention          UX Law           │
  ├──────────────────────────────────────────────────────────────────┤
  │ Pull down gesture     "I control this"         Jakob's          │
  │ Green spinner         "Platform is branded"     Recognition     │
  │ Spinner → disappears  "All done"                Peak-End (end)  │
  └──────────────────────────────────────────────────────────────────┘

SKELETON → CONTENT:
  ┌──────────────────────────────────────────────────────────────────┐
  │ Element               Micro-Intention          UX Law           │
  ├──────────────────────────────────────────────────────────────────┤
  │ Skeleton shows        "Content is coming soon"  Recognition     │
  │ Cross-fade: 200ms     "Smooth arrival"          Peak-End        │
  │ Cards stagger in      "Each one arriving"       Serial Position │
  │ Final card settles    "All ready for you"       Peak-End (peak) │
  └──────────────────────────────────────────────────────────────────┘
```

---

## Day 5 — Deliverable Checklist

```
LAYOUT COMPONENTS:
  □ Section.tsx: title left, action link right, paddingTop prop
  □ Section: hitSlop on action link (Fitts' Law)
  □ Section: children render below header with no default padding

WORKER CARDS:
  □ WorkerCardHorizontal: 150×190px, all 6 data points visible
  □ WorkerCardHorizontal: press animation (scale 0.97→1.02→1.0)
  □ WorkerCardHorizontal: "Book" button bottom-right, 36px height
  □ WorkerCardHorizontal: skeleton variant 150×190px
  □ WorkerCard: 80px height, full-width list format
  □ WorkerCard: press animation + haptic
  □ Both cards: expo-image with blurhash placeholder
  □ Both cards: Poppins for name, Jakarta for labels, Inter for data

BADGES:
  □ OnlineBadge: pulse animation for 'online' status ONLY
  □ OnlineBadge: no pulse for 'busy' or 'offline'
  □ OnlineBadge: reduceMotion: no pulse (static dot instead)
  □ WorkerAvailabilityBadge: all 6 statuses covered
  □ WorkerAvailabilityBadge: correct font per text type

NEARBY WORKERS:
  □ NearbyWorkersList: horizontal FlashList, estimatedItemSize 150
  □ NearbyWorkersList: peek effect (12px of next card visible)
  □ NearbyWorkersList: 4 skeleton cards while loading
  □ NearbyWorkersList: EmptyState component for zero workers
  □ NearbyWorkersList: inline error + retry for API error
  □ NearbyWorkersList: cross-fade skeleton → content transition

BANNER CAROUSEL:
  □ BannerCarousel: LinearGradient background per banner
  □ BannerCarousel: auto-scroll every 4s
  □ BannerCarousel: pauses on touch, resumes on release
  □ BannerCarousel: animated dot indicators (width interpolation)
  □ BannerCarousel: interval cleanup on unmount

POPULAR SERVICES:
  □ ServiceListItem: icon area with category tint color
  □ ServiceListItem: name, category, duration, price — all rendered
  □ ServiceListItem: Jakarta for text, Inter for price + duration
  □ ServiceListItem: full row tappable (Fitts' Law)
  □ PopularServicesSection: 4 items, correct Section wrapper

RECENT BOOKING BANNER:
  □ RecentBookingBanner: ONLY renders when activeBooking exists
  □ RecentBookingBanner: appears above SearchBar when active
  □ RecentBookingBanner: status-appropriate content per state
  □ RecentBookingBanner: slide-in entrance animation
  □ Track + Chat buttons: correct navigation targets
  □ useActiveBooking hook: queries correct statuses, 30s refetch

PULL-TO-REFRESH:
  □ Green tintColor on RefreshControl
  □ Triggers refetch on all 4 data sources
  □ isRefreshing: true until ALL queries complete

HOME SCREEN ASSEMBLY:
  □ All 5 sections in correct order
  □ Conditional RecentBookingBanner (above search when active)
  □ Section spacing: 24px between sections
  □ Bottom padding: 120px (tab bar + breathing room)
  □ Tested with and without active booking

QUALITY:
  □ tsc --noEmit: zero errors across all 15 new files
  □ eslint: zero warnings
  □ Home screen renders < 1.5s first open
  □ Home screen renders < 0.5s return visit (cache)
  □ 60fps scroll on Android emulator (test critical path)
  □ All fonts correct: Poppins names, Jakarta labels, Inter data
  □ iPhone SE: no overflow, all content accessible
  □ Pull-to-refresh works (green spinner, data updates)
```

---

## UX Laws Final Audit — Day 5

```
RECOGNITION OVER RECALL:
  ✅ Worker photo + name = instant identity recognition (no recall)
  ✅ Online dot = universal "available" signal (no reading)
  ✅ Star + number = quality recognized (not calculated)
  ✅ Distance "1.2 km" = spatial sense (not recalled from geocoords)
  ✅ Service icon = category recognized (not read) — 200ms vs 400ms
  ✅ "Popular Services" label = social proof recognized (not explained)
  ✅ Banner dot indicators = "more banners exist" (no text needed)

FITTS' LAW:
  ✅ WorkerCard entire body (150×190) = single tap target
  ✅ ServiceListItem full 72px height = no precision needed
  ✅ "Book" button: 80px wide × 36px = adequate for inline action
  ✅ "See on map →" hitSlop 12px = extends touch area on small text
  ✅ Pull-to-refresh: edge gesture = natural and large
  ✅ Tab bar: 25% width × 60px = never missed

HICK'S LAW:
  ✅ Nearby workers: max 8 shown (not all available)
  ✅ Worker card: 6 data points only (not bio, not full review history)
  ✅ Popular services: 4 only (not category's full list)
  ✅ Banners: 2-3 max (not 6 promotional messages)
  ✅ Home screen sections: 5 sections (categories, workers, banner, popular, banner)
  ✅ Each section: single purpose, clear information

JAKOB'S LAW:
  ✅ Horizontal worker scroll = Netflix/Airbnb browse pattern
  ✅ Card peek (12px) = App Store preview pattern
  ✅ Worker card layout = TaskRabbit/Urban Company template
  ✅ Pull-to-refresh = learned gesture since 2010 (Tweetie)
  ✅ Banner dots = universal carousel indicator pattern
  ✅ Online dot = real-time availability (Airbnb, Fiverr, Upwork)

PEAK-END RULE:
  ✅ Skeleton → content cross-fade = satisfying loading end-peak
  ✅ Worker card bounce on release = micro-peak per tap
  ✅ Banner slide transition = visual momentum peak
  ✅ Active booking banner entrance = information delivery peak
  ✅ RefreshControl disappear after data loads = satisfying end
  ✅ Online badge pulse = continuous ambient delight

GOAL GRADIENT EFFECT:
  ✅ "2 taps to book" via worker card Book button = near-goal feeling
  ✅ "Available now · Until 6:00 PM" = limited window = urgency
  ✅ Distance "1.2 km" = proximity = goal achievable (worker is close)
  ✅ Active booking ETA counter = progress toward goal completion
  ✅ "See on map →" = one tap from seeing all workers = near goal
  ✅ staleTime 30s = near-instant data on return = no friction to goal

SERIAL POSITION EFFECT:
  ✅ HomeHeader FIRST: "Who I am" greeting = most remembered
  ✅ NearbyWorkers FIRST below fold: trust proof (most important below fold)
  ✅ PopularServices LAST before scroll end: price + action = most acted on
  ✅ Worker card: photo → name → rating → distance (importance order)
  ✅ Service item: name → category → duration → price (decision order)
  ✅ Banner 1: guarantee (most important message = first seen = remembered)
```

---

## What Day 6 Gets From Day 5

```
AFTER DAY 5, THE FOLLOWING ARE COMPLETE:

HOME SCREEN — PRODUCTION COMPLETE:
  → All 5 sections rendering with real data
  → Correct loading, error, and empty states per section
  → Pull-to-refresh working
  → Active booking banner conditional rendering
  → ALL 7 UX laws visible and functional

WORKER COMPONENTS (reusable):
  → WorkerCardHorizontal: for map, search results, recommendations
  → WorkerCard: for search list, category workers section
  → WorkerAvailabilityBadge: for profile headers, search results
  → OnlineBadge: for any avatar that needs status

SERVICE COMPONENTS (reusable):
  → ServiceListItem: for CategoryScreen, SearchResults, Worker profile services

HOOKS AVAILABLE:
  → useActiveBooking: powers banner + tab badge + tracking logic
  → usePopularServices: for search suggestions, category defaults

DAY 6 WILL BUILD:
  → SearchInput (real input, auto-focused)
  → Search results screen with infinite scroll
  → Filter bottom sheet (BottomSheet component needed — Day 6)
  → Chip/ChipGroup components for filter UI
  → Category Detail screen (all workers offering a category)
  → Worker services section within search results
  → The EXPLORE tab becomes functional
```

---

*Tasklync — Day 5 Implementation Plan*
*15 files. 10 components. Home screen production-complete.*
*Below-fold: NearbyWorkers, BannerCarousel, PopularServices, BookingBanner.*
*Every micro-interaction named. Every UX law applied with precision.*
*Pure thinking. Zero code. Maximum clarity.*
