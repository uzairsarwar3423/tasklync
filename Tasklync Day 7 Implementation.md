# Tasklync — Day 7 Implementation Plan
## RangeSlider · TabToggle · StickyListHeader · ServiceCard · ServiceBadge ·
## ServicePriceTag · AccordionItem · CategoryRow · AddToCartButton (stub) ·
## useInfiniteWorkers · Category Screen Complete · Service Detail Screen
### Senior React Native Expo | 25 Years | Pure Implementation Plan — Zero Code

> **Day 7 = Discovery pipeline complete.**
> User can: Home → tap category → see all workers → see all services →
> tap a service → see service detail → see workers offering it.
> By end of Day 7: the entire discovery funnel is live.
> Components zyada hain — sab alag alag, sab reusable, sab scalable.

---

## Day 7 Philosophy

```
"Day 7 is about COMPONENTS FIRST, screens second.
 The category screen alone needs 12+ components.
 The service detail needs 6+ more.
 Every component built today will be reused:

 RangeSlider         → Filter sheet (Day 6 retroactive + Day 7)
 TabToggle           → Category screen + Bookings screen (Day 14)
 StickyListHeader    → Category screen + Search results + Bookings
 ServiceCard         → Category screen services grid
 ServiceBadge        → ServiceCard + ServiceListItem + Service detail
 ServicePriceTag     → ServiceCard + ServiceListItem + Service detail
 AccordionItem       → Category screen service expand + FAQ (Day 20)
 CategoryRow         → Future: subcategory browsing
 AddToCartButton     → Service rows + Service detail (Day 10 full impl)

 Build every component in its own file.
 Name it what it IS, not where it's used.
 A component named 'ServiceCard' works everywhere.
 A component named 'CategoryScreenServiceRow' works nowhere else."
```

---

## Day 7 Prerequisites from Day 6

```
MUST BE COMPLETE BEFORE STARTING:

  FROM DAY 6 (verified working):
    ✅ BottomSheet.tsx — gesture, backdrop, snap points
    ✅ BottomSheetHandle.tsx
    ✅ ActionSheet.tsx
    ✅ Chip.tsx — all variants, all animations
    ✅ ChipGroup.tsx — single/multi, scrollable/wrap
    ✅ SearchInput.tsx — auto-focus, clear X animation
    ✅ SearchHeader.tsx — search + filter button + badge
    ✅ RadioGroup.tsx — dot fill animation
    ✅ StarRatingFilter.tsx — cascade fill
    ✅ WorkerSearchCard.tsx — full-width search result card
    ✅ SkeletonWorkerSearchCard.tsx
    ✅ FilterSheetContent.tsx — all 4 sections
    ✅ RecentSearchesSection.tsx
    ✅ search.types.ts — all types + DEFAULT_FILTERS
    ✅ search.api.ts — searchWorkers + getSuggestions
    ✅ useSearch.ts — debounce, React Query infinite
    ✅ useRecentSearches.ts — MMKV backed
    ✅ app/(tabs)/explore.tsx — PRODUCTION COMPLETE

  FROM EARLIER DAYS:
    ✅ Section.tsx — reusable section wrapper (Day 5)
    ✅ ServiceListItem.tsx — 72px service row (Day 5)
    ✅ ServiceCategoryCard.tsx — 106×100 grid card (Day 4)
    ✅ WorkerCard.tsx — full-width list card (Day 5)
    ✅ WorkerCardHorizontal.tsx — 150px horizontal card (Day 5)
    ✅ OnlineBadge.tsx — pulse animation (Day 5)
    ✅ WorkerAvailabilityBadge.tsx — status text (Day 5)
    ✅ Skeleton.tsx — base shimmer (Day 4)
    ✅ StickyFooter.tsx — bottom CTA (Day 2)
    ✅ Button.tsx — all variants (Day 2)
    ✅ IconButton.tsx — Fitts' Law compliant (Day 2)

  VERIFY BEFORE PROCEEDING:
    □ Explore tab: search works end-to-end
    □ BottomSheet: opens/closes via gesture + backdrop
    □ Chip: select/deselect animation correct
    □ tsc --noEmit: zero errors on all Day 6 files
    □ eslint: zero warnings
```

---

## UX Laws — Day 7 Master Application

```
┌────────────────────────────────────────────────────────────────────────┐
│  UX LAW              COMPONENT/SCREEN         APPLICATION              │
├────────────────────────────────────────────────────────────────────────┤
│  RECOGNITION         ServiceBadge             "Popular" chip = SEEN    │
│  OVER RECALL         ServiceCard icon         Icon = instant category  │
│                      ServicePriceTag          "From Rs 500" = SEEN     │
│                      TabToggle state          Active tab clearly lit   │
│                      StickyListHeader         Section label always     │
│                                               visible while scrolling  │
│                      Category filter chips    Active chip = visible    │
│                      Service accordion        Open = content visible   │
│                                               Closed = preview only   │
├────────────────────────────────────────────────────────────────────────┤
│  FITTS' LAW          TabToggle tabs           Each tab = 50% width    │
│                      ServiceCard              Full card tappable       │
│                      AddToCartButton          36px height, pill shape  │
│                      Category filter row      36px chip height        │
│                      Service accordion        Full row tappable (52px) │
│                      "View Profile" CTA       Full 48px width button  │
│                      Service detail footer    52px full-width CTA      │
│                      RangeSlider thumbs       24px visual, 44px touch  │
├────────────────────────────────────────────────────────────────────────┤
│  HICK'S LAW          Category screen tabs     2 tabs only (Workers,   │
│                                               Services) = 1 bit info  │
│                      Service accordion        Default: 1 line preview  │
│                                               Tap: full description   │
│                                               Progressive disclosure  │
│                      Category filter chips    Max 4 quick filters      │
│                      Service detail footer    1 primary action only    │
│                      RangeSlider              1 control per dimension  │
├────────────────────────────────────────────────────────────────────────┤
│  JAKOB'S LAW         TabToggle                iOS segmented control   │
│                      Service accordion        Apps like Amazon, Airbnb │
│                                               use expand/collapse     │
│                      RangeSlider              Airbnb/Booking.com      │
│                                               price range pattern     │
│                      Infinite scroll          Every list-heavy app    │
│                      "Add to cart" button     e-commerce universal    │
│                      StickyListHeader         Every native list (iOS) │
├────────────────────────────────────────────────────────────────────────┤
│  PEAK-END RULE       RangeSlider drag         Haptic per step = PEAK  │
│                      TabToggle switch         Slide animation = PEAK  │
│                      Service accordion open   Height spring = PEAK    │
│                      AddToCart morph          BG morph = PEAK         │
│                      Category screen load     Worker stagger = PEAK   │
│                      Service detail            Workers scroll in = PEAK │
│                      END: "Add to cart" btn   Last interaction =      │
│                                               starts booking journey  │
├────────────────────────────────────────────────────────────────────────┤
│  GOAL GRADIENT       Workers tab: "Book"      Always visible = near   │
│                      visible on each card     goal feeling           │
│                      AddToCart count badge    "1 service added" =     │
│                                               visible progress       │
│                      Services tab: price      "From Rs 500" visible  │
│                                               = affordability confirmed│
│                      Service detail: CTA      "Add to Cart" = 1 tap  │
│                                               from adding to cart    │
│                      Infinite scroll auto     More workers loading =  │
│                                               options expanding      │
├────────────────────────────────────────────────────────────────────────┤
│  SERIAL POSITION     Category workers tab     Most available/closest  │
│                      first result = first     FIRST = most likely     │
│                                               booked                 │
│                      Services tab             Cheapest or most popular │
│                      first item = first       first = first booked   │
│                      Service detail           Price shown FIRST in   │
│                      price position           hero area              │
│                      Service accordion        Name FIRST, price LAST  │
│                                               (name draws in, price  │
│                                               triggers decision)     │
│                      Category filter chips    "All" FIRST chip        │
│                      StickyListHeader         Section title FIRST     │
│                                               thing seen at scroll   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Typography — Day 7 Specific Rules

```
RANGESLIDLER:
  Value labels "Rs 500":   Inter Bold 14px textPrimary (number = Inter)
  Track label "Max Price": Poppins SemiBold 13px textSecondary

TABTOGGLE:
  Active tab label:        Poppins SemiBold 14px textPrimary
  Inactive tab label:      Plus Jakarta Sans Medium 14px textMuted

STICKY LIST HEADER:
  Section title:           Poppins SemiBold 14px textPrimary
  Item count "(12)":       Inter Regular 13px textMuted

SERVICE CARD (grid):
  Service name:            Plus Jakarta Sans SemiBold 13px textPrimary
  Category:                Plus Jakarta Sans Regular 11px textMuted
  Price:                   Inter SemiBold 14px green (NUMBER)

SERVICE BADGE:
  "Popular":               Plus Jakarta Sans SemiBold 10px white
  "New":                   Plus Jakarta Sans SemiBold 10px white
  "Deal":                  Plus Jakarta Sans SemiBold 10px white

SERVICE PRICE TAG:
  "From":                  Plus Jakarta Sans Regular 12px textMuted
  Price value "Rs 500":    Inter SemiBold 14px green (NUMBER)
  "/hr" or "/visit":       Plus Jakarta Sans Regular 11px textMuted

SERVICE LIST ITEM (enhanced):
  Name:                    Plus Jakarta Sans SemiBold 14px textPrimary
  Duration "45–60 min":    Inter Regular 12px textMuted (NUMBER)
  Price:                   via ServicePriceTag component

ACCORDION ITEM:
  Title (collapsed):       Plus Jakarta Sans SemiBold 14px textPrimary
  Title (expanded):        Poppins SemiBold 14px textPrimary (bolds)
  Body text:               Plus Jakarta Sans Regular 14px textSecondary
  Chevron icon:            muted → primary on expand

CATEGORY SCREEN:
  Header title (category): Poppins Bold 20px textPrimary
  Worker count "12 near":  Inter Medium 13px textMuted
  Section header "Near":   Poppins SemiBold 16px (via Section component)
  Filter count "(3)":      Inter Medium 12px textMuted

SERVICE DETAIL:
  Service name:            Poppins Bold 24px textPrimary
  Category breadcrumb:     Plus Jakarta Sans Regular 14px textMuted
  Price headline:          Inter Bold 28px green (NUMBER - display size)
  Price type "/hr":        Plus Jakarta Sans Regular 15px textMuted
  Description:             Plus Jakarta Sans Regular 15px textSecondary
  Section headers:         Poppins SemiBold 16px textPrimary

ADD TO CART BUTTON:
  "Add" label:             Poppins SemiBold 13px green
  Count "1":               Inter Bold 15px white (NUMBER = Inter)
  "−" / "+":               Poppins Bold 16px white (operators = Poppins)
```

---

## Day 7 — Time Breakdown

```
TOTAL: 8 hours

MORNING SESSION (4h):
  Task 7.1  — RangeSlider component              55 min
  Task 7.2  — TabToggle component                30 min
  Task 7.3  — StickyListHeader component         20 min
  Task 7.4  — ServiceBadge component             15 min
  Task 7.5  — ServicePriceTag component          15 min
  Task 7.6  — ServiceCard component              25 min

AFTERNOON SESSION (4h):
  Task 7.7  — AccordionItem component            30 min
  Task 7.8  — CategoryRow component              20 min
  Task 7.9  — AddToCartButton (stub)             30 min
  Task 7.10 — useInfiniteWorkers hook            25 min
  Task 7.11 — CategoryWorkersList component      25 min
  Task 7.12 — CategoryServicesList component     20 min
  Task 7.13 — Category screen complete           35 min
  Task 7.14 — Service Detail screen              35 min
  Task 7.15 — Integration test                   15 min
```

---

## MORNING SESSION — 4 Hours

---

## Task 7.1 — RangeSlider Component
### Duration: 55 minutes
### File: `src/components/ui/Slider/RangeSlider.tsx`

---

### Why RangeSlider Gets 55 Minutes

```
COMPLEXITY REASONING:
  RangeSlider has TWO gesture handlers (two thumbs) that:
  → Must not conflict with each other
  → Must not conflict with parent ScrollView
  → Must clamp to track boundaries
  → Must clamp to each other (min can't exceed max)
  → Must snap to step increments
  → Must give haptic feedback per step
  → Must update live labels in real-time

  This is the most gesture-complex component of Day 7.
  Get it right here = no bugs in filter sheet or any future usage.

USAGE IN APP:
  Filter sheet: price range "Rs 0 – Rs 5,000"
  Future: distance radius filter "1 km – 20 km"
  Future: duration filter "30 min – 4 hours"
  One component, configured per use case.
```

---

### Visual Architecture

```
LAYOUT (horizontal, fills container width):

  LABEL ROW (above track):
    Left label: current min value — Inter Bold 14px textPrimary
    Right label: current max value — Inter Bold 14px textPrimary
    Both update LIVE while dragging (no lag)

  TRACK ROW:
    Container: height 32px (vertical centering + touch zone)
    Track base: height 4px, BG colors.border (#E2E8F0), full width
                Border radius: radius.pill
    Track fill: height 4px, BG colors.primary (#16A34A)
                Position: from minThumbX to maxThumbX
                Reanimated: width + left position both animated

    MIN THUMB:
      Visual: 24×24px circle
      BG: colors.bgCard (#FFFFFF)
      Border: 2px colors.primary (#16A34A)
      Shadow: shadows.md (visible ring)
      Center on track at min position
      Touch area: hitSlop 12px all sides (total 48px = Fitts' Law)

    MAX THUMB:
      Same visual as min thumb
      Center on track at max position
      Separate gesture handler

    WHEN THUMBS OVERLAP (min === max):
      Both at same position
      Min thumb: slightly left (z-index below)
      Max thumb: slightly right (z-index above)
      Both still draggable in their directions

VISUAL CONTEXT IN FILTER SHEET:
  Section: "Hourly rate" label above slider
  Below slider: "Up to Rs 2,000" — contextual label
  (Updates: "Rs 500 – Rs 5,000" when min > 0)
```

---

### Props Interface

```
PROPS:
  min:          number — absolute minimum (e.g., 0)
  max:          number — absolute maximum (e.g., 5000)
  step:         number DEFAULT 50 — snap increment
  value:        [number, number] — [currentMin, currentMax]
  onChange:     (range: [number, number]) => void
  prefix:       string DEFAULT "Rs " — shown before value
  suffix:       string DEFAULT "" — shown after value (e.g., " km")
  trackColor:   string DEFAULT colors.primary
  disabled:     boolean DEFAULT false
  style:        ViewStyle (container override)
```

---

### Gesture Specification

```
EACH THUMB — PanGestureHandler:

  State: Reanimated SharedValue for X position
    minX: SharedValue<number> — position of min thumb
    maxX: SharedValue<number> — position of max thumb
    Both initialized from value prop

  DRAG START:
    Thumb scale: 1.0 → 1.3 (spring-snappy)
    MICRO-INTENTION: "I'm grabbed, I'm ready to move"
    Shadow increases: shadows.md → shadows.lg
    Haptic: impactAsync(Light) — "picked up"

  DURING DRAG (worklet — UI thread only):
    Position = gestureX + startX (gesture translates from start)
    CLAMP RULES:
      minX cannot exceed: maxX - stepPixelSize (can't pass max thumb)
      maxX cannot be less than: minX + stepPixelSize (can't pass min thumb)
      Both cannot go below: 0 (track left edge)
      Both cannot exceed: trackWidth (track right edge)

    SNAP TO STEP:
      value = min + Math.round((positionX / trackWidth) * (max - min) / step) * step
      Position snaps to nearest step pixel position
      This gives clean snap feel vs smooth continuous

    HAPTIC PER STEP CROSSING:
      Track which step value was last at
      When step changes: Haptics.impactAsync(ImpactFeedbackStyle.Light)
      This creates "detent" feel = physical slider on hardware
      PEAK-END: each tick = micro-reward for precise adjustment

    LIVE LABEL UPDATE:
      Label text updates every frame (no lag)
      Inter Bold 14px — large, clear numbers = readable while dragging

  DRAG END:
    Thumb scale: 1.3 → 1.0 (spring-default)
    Shadow returns: shadows.lg → shadows.md
    Call onChange([minValue, maxValue])
    No haptic on release (too much noise after ticks)

GESTURE CONFLICT RESOLUTION:
  Min thumb handler: PanGestureHandler id="min-thumb"
  Max thumb handler: PanGestureHandler id="max-thumb"
  simultaneousHandlers: [] (not simultaneous — one at a time)
  Parent ScrollView: activeOffsetX: ±10 — respects horizontal drag
  This prevents: scroll while dragging thumb + drag while scrolling
```

---

### Track Fill Animation

```
Track fill = Animated.View between two thumbs:

  LEFT edge of fill = minX position (Reanimated derived value)
  WIDTH of fill = maxX - minX (derived value)

  Both derived values update every frame via useAnimatedStyle
  NO spring for fill (would lag behind thumb)
  Direct position mapping = fill stays exactly with thumbs

  WHY NOT SPRING FOR FILL:
    Spring would create visual "lag" between thumb and fill
    Fill must feel physically connected to thumbs
    Direct position = thumbs ARE the fill edges = correct physics
```

---

### Integration with FilterSheetContent (Day 6 retroactive)

```
Day 6's FilterSheetContent has a placeholder section:
  "Section 5 — Max Hourly Rate: Coming Day 7"

After building RangeSlider today:
  UPDATE FilterSheetContent.tsx:
    Remove placeholder
    Add Section 5 with RangeSlider:
      min: 0, max: 5000, step: 50
      value: [0, filters.maxRate || 5000]
      onChange: update filters.maxRate
      prefix: "Rs "

  This retroactive update = FilterSheetContent is now complete.
```

---

## Task 7.2 — TabToggle Component
### Duration: 30 minutes
### File: `src/components/ui/Toggle/TabToggle.tsx`

```
PURPOSE:
  Sliding tab switcher for 2-option contexts.
  Visual: pill indicator slides between options.
  Used on: Category screen (Workers | Services)
  Future use: Bookings (Active | Past), Profile stats, etc.

WHY NOT USE REGULAR CHIPS:
  Chips = independent selections (can be deselected)
  TabToggle = always exactly ONE active (exclusive)
  Different semantic → different visual treatment
  JAKOB'S LAW: iOS segmented control = this pattern
  Every user recognizes: one of these is always active

PROPS:
  options:       Array<{ label: string, value: string }>
                 MAX 3 options (more = doesn't fit — Hick's Law)
  activeValue:   string
  onChange:      (value: string) => void
  style:         ViewStyle (container override)

VISUAL SPECIFICATION:
  Container:
    Height: 38px
    BG: colors.bgSection (#F8F9FA) — track background
    Border radius: radius.pill (100px)
    Padding: 3px all sides (creates inset feel)

  Sliding Indicator (Animated.View):
    Height: 32px (container 38px - 3px padding × 2)
    Width: calculated (50% for 2 options, 33% for 3 options)
    BG: colors.bgCard (#FFFFFF)
    Border radius: radius.pill (100px)
    Shadow: shadows.sm (indicator floats above container)
    Position: absolute, left position animated

  Labels (Pressable per option):
    Layout: flex row, each option flex 1
    Active label: Poppins SemiBold 14px textPrimary
    Inactive label: Plus Jakarta Sans Medium 14px textMuted
    Text transition: color change 150ms (timingConfig.fast)
    Centered in their slot

ANIMATION SPECIFICATION:

  INDICATOR SLIDE:
    Shared Value: indicatorX (left position of indicator)
    On option change: indicatorX animates to new position
    Animation: withSpring(newX, springConfig.gentle)
    WHY spring-gentle: slow, smooth slide = premium feel
    Fast spring = feels cheap (like a toggle)
    Slow spring = feels like glass sliding = premium

  LABEL COLOR CHANGE:
    Previous active: Poppins → Jakarta, textPrimary → textMuted (150ms)
    New active: Jakarta → Poppins, textMuted → textPrimary (150ms)
    WHY FONT CHANGE TOO: Poppins vs Jakarta = visible difference
    Active = heavier brand font = importance signal

  PRESS INTERACTION:
    PressIn on option: very subtle scale 0.98 (spring-stiff)
    PressOut: scale returns + trigger indicator slide
    Haptic: selectionAsync on press

INITIAL RENDER:
  indicatorX starts at correct position for activeValue
  No entrance animation (tab is part of screen, not modal)
  Just shows at correct position immediately

USAGE ON CATEGORY SCREEN:
  <TabToggle
    options={[{label: 'Workers', value: 'workers'}, {label: 'Services', value: 'services'}]}
    activeValue={activeTab}
    onChange={setActiveTab}
  />
```

---

## Task 7.3 — StickyListHeader Component
### Duration: 20 minutes
### File: `src/components/ui/List/StickyListHeader.tsx`

```
PURPOSE:
  Sticky section header for list views.
  Stays visible at top of ScrollView as user scrolls.
  Used when list has sections (e.g., "Electricians near you (12)")

DISTINCTION FROM Section.tsx (Day 5):
  Section.tsx: general section wrapper with title + action link
               Used for home screen sections (CategoryGrid, etc.)
  StickyListHeader: specifically for LISTS, stays sticky
                    Shows section label + count
                    BG matches screen BG (transparent-ish)
                    No action link needed

WHERE USED:
  Category screen: "Workers (12 near you)" sticky as workers list scrolls
  Category screen: "Services (24 available)" sticky as services scroll
  Search results: "24 workers found · Sorted by distance"
  Bookings screen (Day 14): "Active (2)" | "Past (15)"

PROPS:
  title:        string (section name)
  count:        number | null (item count, null hides it)
  subtitle:     string | null (optional second line)
  rightContent: React.ReactNode | null (optional right side)
  style:        ViewStyle (override)
  bgColor:      string DEFAULT colors.bgApp (matches screen BG)

VISUAL SPECIFICATION:
  Container:
    BG: bgColor prop (so it blends with page when sticky)
    Padding: 12px top, 8px bottom, 16px horizontal
    No bottom border (clean look)

  Title row:
    Left: title — Poppins SemiBold 14px textPrimary
    Count (if provided):
      " (12)" — Inter Regular 13px textMuted
      Displayed INLINE after title: "Workers (12)"
      WHY INLINE: saves vertical space on mobile
    Right: rightContent slot (e.g., sort dropdown trigger)

  Subtitle (if provided):
    Below title, small text
    Plus Jakarta Sans Regular 12px textMuted

STICKY BEHAVIOR:
  Used with FlashList: stickyHeaderIndices prop
  OR: SectionList with renderSectionHeader
  The component itself doesn't control stickiness —
  the list's stickyHeaderIndices prop handles it
  This component just provides the visual

ENTRY ANIMATION (when section first appears):
  No entrance animation on sticky header
  WHY: sticky headers can appear/disappear rapidly on fast scroll
  Animation on each appearance = jarring
  Clean instant appearance = clean UX
```

---

## Task 7.4 — ServiceBadge Component
### Duration: 15 minutes
### File: `src/components/service/ServiceBadge.tsx`

```
PURPOSE:
  Small visual badge on service cards/rows.
  Signals: "Popular", "New", "Deal", "Limited"
  Used on: ServiceCard, ServiceListItem, Service detail hero

WHERE IT APPEARS:
  ServiceCard top-right corner: absolute positioned badge
  ServiceListItem: inline after service name
  Service detail hero: below service name

PROPS:
  type:    'popular' | 'new' | 'deal' | 'limited'
  size:    'xs' | 'sm' DEFAULT 'xs'
  style:   ViewStyle (override)

VISUAL PER TYPE:
  popular:
    BG: colors.warning (#F59E0B)
    Text: "Popular" — Plus Jakarta Sans SemiBold 10px white
    Icon: fire (Lucide, 10px) left of text
    Border radius: radius.xs (6px)

  new:
    BG: colors.info (#3B82F6)
    Text: "New" — Plus Jakarta Sans SemiBold 10px white
    Icon: sparkles (Lucide, 10px)
    Border radius: radius.xs

  deal:
    BG: colors.danger (#EF4444)
    Text: "Deal" — Plus Jakarta Sans SemiBold 10px white
    Icon: tag (Lucide, 10px)
    Border radius: radius.xs

  limited:
    BG: colors.textPrimary (#0F172A)
    Text: "Limited" — Plus Jakarta Sans SemiBold 10px white
    No icon
    Border radius: radius.xs

SIZE VARIANTS:
  xs: height 18px, paddingH 5px, fontSize 10px (card corner use)
  sm: height 22px, paddingH 8px, fontSize 11px (list inline use)

ENTRANCE ANIMATION (when badge first appears):
  scale: 0 → 1.1 → 1.0 (spring-bouncy)
  Delay: 200ms after parent card appears
  PEAK-END: badge popping in = attention-capturing micro-moment
  WHY DELAYED: card appears first, then badge draws additional attention

PLACEMENT ON SERVICECARD:
  Position: absolute
  Top: 8px, Right: 8px
  Above image overlay
```

---

## Task 7.5 — ServicePriceTag Component
### Duration: 15 minutes
### File: `src/components/service/ServicePriceTag.tsx`

```
PURPOSE:
  Consistent price display across all service contexts.
  Handles: fixed price, hourly rate, custom quote.
  Reused in: ServiceCard, ServiceListItem, Service detail, Cart.

WHY A DEDICATED COMPONENT:
  Price formatting appears in 8+ places.
  Without component: 8 places to update if format changes.
  With component: 1 place to update.
  HICK'S LAW: developer has ONE way to show prices, not 8.

PROPS:
  amount:       number | null (null = custom quote)
  priceType:    'fixed' | 'hourly' | 'visit' | 'quote'
  showFrom:     boolean DEFAULT false (show "From" prefix)
  size:         'sm' | 'md' | 'lg'
  style:        ViewStyle

RENDERING LOGIC:

  priceType === 'quote' OR amount === null:
    "Get Quote" — Plus Jakarta Sans SemiBold in green
    No amount shown

  showFrom === true:
    "From " + amount + priceUnit
    "From" = Plus Jakarta Sans Regular 12px textMuted
    Amount = Inter SemiBold (size varies) green

  showFrom === false:
    Just amount + priceUnit

SIZE SPECS:
  sm: amount Inter SemiBold 13px, "From" 11px, "/hr" 11px
  md: amount Inter SemiBold 15px, "From" 12px, "/hr" 12px
  lg: amount Inter Bold 20px, "From" 14px, "/hr" 14px (service detail)

PRICE TYPE UNITS:
  fixed:   "Rs [amount]" (no unit suffix)
  hourly:  "Rs [amount]/hr"
  visit:   "Rs [amount]/visit"
  quote:   "Get Quote" (no amount)

NUMBER FORMATTING:
  formatPrice(amount): utility function
    1200 → "1,200" (thousands separator)
    500 → "500"
    1500 → "1,500"
  Uses: Inter font (always — prices are data)

COLOR:
  All amounts: colors.primary (#16A34A)
  "From" / "per" / "Get Quote" text: colors.textMuted
  WHY GREEN AMOUNTS: price in green = inviting, not intimidating
  Urban Company pattern: green prices feel affordable
```

---

## Task 7.6 — ServiceCard Component
### Duration: 25 minutes
### File: `src/components/service/ServiceCard.tsx`

```
PURPOSE:
  Grid-format service card for category screen's services view.
  Used in: 2-column grid in category screen services tab.
  Future: recommended services sections.

DISTINCTION FROM ServiceListItem (Day 5):
  ServiceListItem: horizontal row (72px, full-width list)
  ServiceCard: square-ish grid card (for 2-col grid)
  Different contexts, different layout, same content.

DIMENSIONS:
  Width: calculated = (screenWidth - 32 - 12) / 2 = ~165px (375px screen)
  The formula: (screen - paddingH×2 - gap) / columns
  Height: ~180px (auto, or fixed for uniform grid)
  Border radius: radius.lg (16px)
  BG: colors.bgCard (#FFFFFF)
  Shadow: shadows.sm

LAYOUT (top to bottom):

  SERVICE ICON AREA (top, ~80px height):
    BG: category-tint color (same as ServiceCategoryCard from Day 4)
    Width: full card width
    Icon: Lucide or custom SVG, 36px, category color
    Center-aligned
    Border radius: top corners only (radius.lg = 16px)
    ServiceBadge: absolute top-right (if service is popular/new/deal)

  CONTENT AREA (below icon, ~100px height):
    Padding: 10px

    Service name:
      Plus Jakarta Sans SemiBold 13px textPrimary
      numberOfLines: 2 (can be 2 lines on cards)
      marginBottom: 4px

    Category label:
      Plus Jakarta Sans Regular 11px textMuted
      marginBottom: 8px

    ServicePriceTag:
      size: 'sm'
      showFrom: true
      priceType from service data

    AddToCartButton (Task 7.9, stub for now):
      Size: sm (30px height)
      Full-width within card content
      Position: below price, absolute to card bottom

PRESS INTERACTION:
  Entire card tappable → navigate to service/[id] detail screen
  PressIn: scale 0.97 + shadow-sm → flat (spring-stiff)
  PressOut: scale 1.0 + shadow-sm returns (spring-bouncy)
  Haptic: selectionAsync

  DISTINCTION: pressing card = navigate to detail
  Pressing AddToCartButton = add to cart (separate action)
  Two separate touch handlers within same card
  AddToCartButton uses stopPropagation (doesn't trigger card press)

SKELETON VARIANT:
  FILE: src/components/ui/Skeleton/SkeletonServiceCard.tsx
  Same 165×180px dimensions
  Icon area: full-width 80px rectangle (skeleton)
  Name: 2 rows of text skeleton (120×12, 90×12)
  Price: 60×13 rectangle
  Button: 140×30 rectangle
```

---

## AFTERNOON SESSION — 4 Hours

---

## Task 7.7 — AccordionItem Component
### Duration: 30 minutes
### File: `src/components/ui/Accordion/AccordionItem.tsx`

```
PURPOSE:
  Expandable/collapsible content row.
  Used on: Category screen services (expand to see description)
  Future: FAQ screen, Worker bio expand (alternative to "Read more")

WHY ACCORDION ON CATEGORY SCREEN:
  Services list can have long descriptions.
  Default = collapsed (just name + price) = Hick's Law
  Tap = expand description inline
  JAKOB'S LAW: accordion = every app with expandable lists (Airbnb FAQs)
  HICK'S LAW: collapse = fewer choices visible at once

PROPS:
  title:          React.ReactNode (main content when collapsed/expanded)
  children:       React.ReactNode (expanded content only)
  initialOpen:    boolean DEFAULT false
  onToggle:       (isOpen: boolean) => void (optional callback)
  disabled:       boolean DEFAULT false
  style:          ViewStyle (container override)
  headerStyle:    ViewStyle (header row override)

VISUAL SPECIFICATION:

  HEADER ROW (always visible, tappable):
    Height: 52px (Fitts' Law — comfortable tap target)
    Padding: 14px horizontal
    flexDirection: row, alignItems: center

    Left: title content (usually Text component)
          Takes flex: 1

    Right: ChevronDown icon
      Size: 18px
      Color: colors.textMuted (collapsed) → colors.primary (expanded)
      Rotation: 0deg (collapsed) → 180deg (expanded)
      Animation: rotate spring (spring-gentle)
      MICRO-INTENTION: "Arrow points down = more below"
                       "Arrow flips = content revealed"

  BODY (expanded content):
    Animated height: 0 → auto
    Opacity: 0 → 1
    padding: 0 horizontal padding, 12px top (below header), 14px bottom
    border-top: 1px colors.border (separates from header when expanded)

  CONTAINER:
    BG: colors.bgCard
    Border radius: radius.lg (16px)
    Shadow: shadows.sm
    Overflow: hidden (required for height animation)
    Border: 1px colors.border (expanded) → 1px transparent (collapsed)

ANIMATION SPECIFICATION:

  EXPAND:
    1. Body height: 0 → measuredHeight (Reanimated LayoutAnimation)
       OR: useSharedValue(0) → withSpring(measuredHeight, springConfig.gentle)
    2. Body opacity: 0 → 1 (timingConfig.fast 150ms, delayed 50ms)
    3. Chevron rotation: 0 → 180deg (spring-gentle)
    4. Border-top: appears (timingConfig.fast)
    5. Container border: transparent → colors.border (150ms)
    Haptic: selectionAsync on tap

  COLLAPSE:
    Reverse sequence:
    1. Body opacity: 1 → 0 (timingConfig.fast 100ms)
    2. Body height: measuredHeight → 0 (spring-stiff)
    3. Chevron rotation: 180 → 0 (spring-gentle)
    Haptic: selectionAsync on tap

  PEAK-END:
    The expand animation = satisfying reveal of hidden content
    Spring-gentle height = content "grows" naturally
    Not instant snap = feels physical, like opening a drawer

MEASURING BODY HEIGHT:
  onLayout on body container: captures natural height
  First render: body renders off-screen (opacity 0, height 0)
  After measure: animate to measured height
  This avoids: hardcoded heights that break with dynamic content

MULTIPLE ACCORDIONS IN LIST:
  Accordion state: local useState (each manages its own state)
  No global accordion manager needed (simpler)
  Multiple can be open simultaneously (user controls each)
  OR: pass onToggle to parent for "only one open at a time" logic
```

---

## Task 7.8 — CategoryRow Component
### Duration: 20 minutes
### File: `src/components/home/CategoryRow.tsx`

```
PURPOSE:
  Horizontal scrollable row of category chips.
  Used in: Category screen top (filter by sub-category)
  Also useful: Search results top row
  Future: subcategory filter row on category screen

NOTE: DIFFERENT from CategoryGrid (Day 4)
  CategoryGrid: 2×3 fixed grid on home screen
  CategoryRow: horizontal scroll, chips/pills, for filtering

PROPS:
  categories:     Category[]
  selectedId:     string | null (active category)
  onSelect:       (category: Category | null) => void
  includeAll:     boolean DEFAULT true (shows "All" chip first)
  style:          ViewStyle

VISUAL:
  ScrollView horizontal
  showsHorizontalScrollIndicator: false
  contentContainerStyle:
    paddingHorizontal: 16px
    gap: 8px
    paddingVertical: 8px

  "All" chip (first, if includeAll):
    Chip variant="filter" size="md"
    selected: selectedId === null
    onPress: onSelect(null) — clears filter

  Each category chip:
    Chip variant="filter" size="md"
    selected: category.id === selectedId
    icon: category icon (small, 14px, left of label)
    label: category.name
    onPress: onSelect(category)

AUTO-SCROLL ON SELECT:
  When a chip is selected, scroll to make it visible
  Same as ChipGroup behavior (using ScrollView.scrollTo)
  RECOGNITION: active chip always visible = user sees active filter

INITIAL POSITION:
  "All" chip first (Serial Position — most used option first)
  Active category scrolls into view on mount
  Smooth scroll (animated: true)
```

---

## Task 7.9 — AddToCartButton (Stub)
### Duration: 30 minutes
### File: `src/components/cart/AddToCartButton.tsx`

```
PURPOSE:
  The cart add interaction — morph from "Add" to "[− 1 +]".
  Day 7: Build the component with FULL animation.
  Day 10: Wire to cart.store.ts when cart system is complete.

WHY BUILD FULL UI NOW:
  Category screen needs AddToCartButton on service cards/rows.
  Service detail needs it in footer.
  Can't skip — it's visually present on today's screens.
  Wire to store on Day 10 (when cart.store is finalized).
  Today: local state (count in component state, not global cart).

IMPORTANT NOTE:
  This is NOT a stub in terms of UI — full animation built today.
  It IS a stub in terms of behavior — local state, not cart.store.
  Day 10 enhancement: replace local state with useCart() hook.

PROPS:
  serviceId:    string (for future cart.store wiring)
  serviceName:  string
  price:        number
  workerId:     string | null (null = no worker selected yet)
  size:         'sm' | 'md' DEFAULT 'sm'
  onAdd:        () => void (optional callback for parent notification)
  onRemove:     () => void (optional callback)
  style:        ViewStyle

STATE (local for now, replaced Day 10):
  count: number DEFAULT 0
  isAnimating: boolean DEFAULT false

THREE VISUAL STATES:

  STATE 1 — IDLE (count === 0):
    Appearance: [+ Add]
    Width: 80px (sm) / 90px (md)
    Height: 32px (sm) / 38px (md)
    BG: transparent
    Border: 1.5px colors.primary
    Border radius: radius.pill

    LEFT: "+" — Poppins Bold 14px (sm) / 16px (md) colors.primary
    RIGHT: "Add" — Poppins SemiBold 13px (sm) / 14px (md) colors.primary

  STATE 2 — IN CART (count > 0):
    Width: 108px (sm) / 120px (md)
    Height: 32px (sm) / 38px (md)
    BG: colors.primary (#16A34A)
    Border: none
    Border radius: radius.pill

    LEFT ZONE (44px): "−" — Poppins Bold 16px white
    CENTER: count number — Inter Bold 15px white
    RIGHT ZONE (44px): "+" — Poppins Bold 16px white

IDLE → IN CART TRANSITION:
  Trigger: "+" or "Add" tapped (from STATE 1)
  Haptic: medium impact (significant action)

  ANIMATION SEQUENCE (all run in parallel):
    1. BG: transparent → primary (timingConfig.fast 150ms)
    2. Border width: 1.5px → 0 (150ms)
    3. "Add" text: opacity 1 → 0 (100ms)
    4. Count "1": opacity 0 → 1 (100ms, 50ms delay)
       Count "1": scale 0 → 1.2 → 1.0 (spring-bouncy)
    5. Width: 80 → 108 (spring-gentle 300ms)
    6. Scale: 0.97 → 1.05 → 1.0 (spring-bouncy, after press)

  PEAK-END:
    This transition = THE most satisfying micro-interaction in discovery.
    Width morphs + BG fills + count pops = 3 things happening = rich.
    User: "This feels premium."

IN CART → IDLE TRANSITION:
  Trigger: "−" tapped when count === 1 (going to 0)
  Reverse of above:
    Count: opacity 1 → 0 (100ms)
    "Add" text: opacity 0 → 1 (100ms, 50ms delay)
    Width: 108 → 80 (spring-gentle)
    BG: primary → transparent (150ms)
    Border: 0 → 1.5px (150ms)
    Scale: 1.0 (no extra bounce on remove)

COUNT INCREMENT/DECREMENT (within STATE 2):
  TAP "+":
    count + 1
    Count number: cross-fade (old out, new in, 80ms each)
      Old: translateY 0 → -8, opacity 1 → 0
      New: translateY +8 → 0, opacity 0 → 1 (offset: 40ms delay)
    Haptic: light

  TAP "−":
    count - 1
    Number cross-fade: reverse direction
      Old: translateY 0 → +8, opacity 1 → 0
      New: translateY -8 → 0, opacity 0 → 1
    Haptic: light
    If count → 0: trigger IN CART → IDLE transition

SEPARATE TAP ZONES (STATE 2):
  "−" zone: left 44px of button (stopPropagation from card)
  "+" zone: right 44px of button (stopPropagation from card)
  Center zone: tapping count = no action (visual only)
  FITTS' LAW: 44px per zone = comfortable precision

ACCESSIBILITY:
  STATE 1: accessibilityLabel="Add [serviceName] to cart"
  STATE 2: accessibilityLabel="[count] [serviceName] in cart. Tap to change"
  accessibilityRole="button"
```

---

## Task 7.10 — useInfiniteWorkers Hook
### Duration: 25 minutes
### File: `src/hooks/useInfiniteWorkers.ts`

```
PURPOSE:
  Infinite-scroll paginated worker list.
  Used on: Category screen workers tab, future search results.
  Different from useNearbyWorkers (which loads ALL nearby at once).
  This supports pagination for large result sets.

PROPS (hook parameters):
  params: NearbyWorkersParams (from location.types.ts)
    lat, lng: required
    category: string | undefined (filter by category)
    radius: number DEFAULT 5000
    minRating: number DEFAULT 0
    maxRate: number DEFAULT 0
    sortBy: SortOption DEFAULT 'distance'
    limit: number DEFAULT 20

RETURNED API:
  workers:          WorkerNearby[] (flattened from all pages)
  total:            number (from first page response)
  isLoading:        boolean (initial load, no data yet)
  isLoadingMore:    boolean (loading next pages, has existing data)
  isError:          boolean
  error:            Error | null
  hasNextPage:      boolean
  loadMore:         () => void (call on list end reached)
  refetch:          () => void
  isEmpty:          boolean (workers.length === 0 AND !isLoading)

INTERNALS:
  useInfiniteQuery({
    queryKey: ['workers', 'infinite', params],
    queryFn: ({ pageParam }) =>
      workerApi.getNearbyWorkers({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
    enabled: Boolean(params.lat && params.lng),
    staleTime: 30_000,
  })

  workers: data?.pages.flatMap(p => p.workers) ?? []
  total: data?.pages[0]?.total ?? 0
  hasNextPage: from useInfiniteQuery
  isLoadingMore: isFetchingNextPage

PREFETCH STRATEGY:
  On hook mount (when data first loads):
    Top 5 worker IDs: prefetch full profiles
    queryClient.prefetchQuery(['worker', id]) for first 5
    WHY: user likely to tap one of first 5
    GOAL GRADIENT: instant profile = near-goal feeling

CATEGORY SCREEN INTEGRATION:
  params.category = route param from app/category/[id].tsx
  params.lat/lng = from useLocationStore
  Hook automatically re-fetches when params change
```

---

## Task 7.11 — CategoryWorkersList Component
### Duration: 25 minutes
### File: `src/components/category/CategoryWorkersList.tsx`

```
PURPOSE:
  Workers list for the category screen's "Workers" tab.
  Uses FlashList for performance + useInfiniteWorkers for pagination.

PROPS:
  categoryId:   string
  sortBy:       SortOption
  onSortChange: (sort: SortOption) => void

LAYOUT:

  TOP: StickyListHeader
    title: "Workers"
    count: total from hook
    rightContent: SortDropdown (small "Sort: Distance ▾" trigger)

  SORT CHIPS ROW:
    ChipGroup (horizontal, single-select, not scrollable — 3 fit):
      "Nearest" | "Top Rated" | "Lowest Price"
      chipSize: 'sm'
      Active chip: green
      Tap: call onSortChange

  FLASHLIST:
    data: workers (from useInfiniteWorkers)
    renderItem: WorkerSearchCard (reusing Day 6 component!)
    keyExtractor: worker.id
    estimatedItemSize: 96
    onEndReachedThreshold: 0.6
    onEndReached: loadMore

    ListEmptyComponent:
      LOADING (isLoading): 4 × SkeletonWorkerSearchCard
      NO WORKERS (isEmpty): EmptyState
        Title: "No workers for this category near you"
        Sub: "Try expanding your search area"

    ListFooterComponent:
      isLoadingMore: 2 × SkeletonWorkerSearchCard
      !hasNextPage && workers.length > 0:
        "All {total} workers shown" — Plus Jakarta Regular 13px muted centered

  ENTRANCE STAGGER:
    When workers first load:
    Each WorkerSearchCard: opacity 0→1, translateY 20→0
    delay: index × 50ms (50ms per card)
    spring-default
    PEAK-END: staggered reveal = satisfying "workers arriving"
```

---

## Task 7.12 — CategoryServicesList Component
### Duration: 20 minutes
### File: `src/components/category/CategoryServicesList.tsx`

```
PURPOSE:
  Services list for the category screen's "Services" tab.
  Shows all services in category with expand-to-see-description.

PROPS:
  categoryId:   string
  services:     Service[] (from useCategoryById hook)
  isLoading:    boolean
  workerId:     string | null (if navigated from worker profile)

LAYOUT:

  StickyListHeader:
    title: "Services"
    count: services.length

  FlatList (or FlashList) of ServiceListItem enhanced:
    Each item: ServiceListItem WRAPPED in AccordionItem
    AccordionItem:
      title: ServiceListItem (the standard row visual)
      children: ServiceDescription component

    NESTED STRUCTURE:
      AccordionItem (collapsed): shows ServiceListItem header row
      AccordionItem (expanded): shows ServiceListItem + description below

  ACCORDION BEHAVIOR:
    Default: ALL collapsed (Hick's Law — less visible = less overwhelm)
    Tap service row: that accordion expands
    Other accordions: remain as-is (multiple can be open)

  ServiceDescription (shown in expanded accordion):
    FILE: src/components/service/ServiceDescription.tsx (new, small component)
    Description text: Plus Jakarta Sans Regular 14px textSecondary
    Duration: "Typically 45–90 minutes" — Plus Jakarta Regular 13px muted
    Includes: Plus Jakarta Regular 13px textSecondary (what's included)
    AddToCartButton: sm size, right-aligned within description

  LOADING STATE:
    4 × SkeletonServiceCard (grid) OR 6 × SkeletonServiceListItem
    For list context: SkeletonServiceListItem
    FILE: src/components/ui/Skeleton/SkeletonServiceListItem.tsx
    72px height, full width, matches ServiceListItem layout

  EMPTY STATE:
    "No services listed for this category yet"
    EmptyState with neutral illustration
```

---

## Task 7.13 — Category Screen Complete
### Duration: 35 minutes
### File: `app/category/[id].tsx`

---

### Screen Architecture

```
FILE: app/category/[id].tsx
ROUTE PARAM: id (category slug: "electrician", "plumber", etc.)

DATA NEEDED:
  Route: id from useLocalSearchParams
  Category info: useCategoryById(id) — name, icon, services
  Workers: useInfiniteWorkers({ lat, lng, category: id })
  Location: useLocationStore().currentLocation

SCREEN BG: colors.bgApp (#FAFAFA)
STATUS BAR: dark-content

PHILOSOPHY:
  User tapped "Electrician" on home screen.
  They know what TYPE of service they want.
  They don't know WHICH worker or WHICH specific service.
  Screen must help them decide: browse workers OR browse services.
  HICK'S LAW: show ONE content set at a time (Workers OR Services).
```

---

### Screen Layout Structure

```
LAYER 1 — HEADER (sticky, does not scroll):
  BG: colors.bgCard, shadow-sm when scrolled (Animated based on scrollY)
  Height: 56px + safe area

  Left: ← IconButton (back, 44×44px)
  Center: Category name — Poppins Bold 20px textPrimary
  Right: 🔍 IconButton (opens search/filter within category)

  WHY CUSTOM HEADER NOT DEFAULT:
    Default Expo Router header: uses system font, no haptic, no custom icons
    Custom: our design system, haptic on back, custom icons

LAYER 2 — SUB-HEADER (sticky, below main header):
  CategoryRow: horizontal chips (all categories, for switching categories)
    WHY: User might want to switch from Electrician → Plumber quickly
    Tap another category chip → navigate to that category
    Active chip: current category (highlighted)

  TabToggle (Workers | Services):
    Below CategoryRow
    padding: 12px horizontal, 8px vertical
    HICK'S LAW: two tabs = 1 bit of information = instant decision

LAYER 3 — SCROLL CONTENT (conditional on active tab):
  When activeTab === 'workers':
    CategoryWorkersList component
    Manages: sort chips, FlashList, infinite scroll, loading/empty states

  When activeTab === 'services':
    CategoryServicesList component
    Manages: accordion items, loading, empty states

LAYER 4 — NO STICKY FOOTER:
  Category screen has no primary CTA
  WHY: CTA is on each worker card ("Book") and each service row ("Add")
  HICK'S LAW: no global CTA = user focuses on specific items
```

---

### Tab Switching Behavior

```
TAB SWITCH (Workers → Services OR vice versa):
  Content area:
    Old content: opacity 1 → 0 (timingConfig.fast 150ms)
    New content: opacity 0 → 1 (timingConfig.fast 150ms, 100ms delay)
    WHY opacity NOT slide: tabs are parallel (not hierarchical)
    Sliding would imply directionality = wrong mental model

  Scroll position:
    Each tab maintains its own scroll position
    Stored in ref: workersScrollPosition, servicesScrollPosition
    On tab switch: restore position (or start at 0 if first visit)

  Data:
    Workers: loaded on component mount (parallel with services)
    Services: loaded on component mount (via useCategoryById)
    Both load at same time → no wait on tab switch
    GOAL GRADIENT: instant tab switch = no friction = near-goal

SCROLL OPTIMIZATION:
  Workers tab (FlashList):
    estimatedItemSize: 96 (WorkerSearchCard height)
    keyExtractor: worker.id

  Services tab (FlatList):
    Items are accordions with dynamic height
    keyExtractor: service.id
    Cannot use FlashList for dynamic height items easily
    Regular FlatList with getItemLayout possible if heights fixed
    Day 7 decision: FlatList (simpler, handles dynamic accordion height)
```

---

### Filter System on Category Screen

```
FILTER BUTTON (top right header):
  Tap → BottomSheet opens with FilterSheetContent
  FilterSheetContent props:
    showCategories: false (already on a category — no need to filter by category)
    showMaxRate: true
    filters: localFilters state
    onApply: update localFilters + close sheet
    onReset: reset to DEFAULT_FILTERS

LOCAL FILTERS STATE:
  Each category screen has its OWN filter state
  NOT global search filters
  WHY: browsing electricians might have different sort than plumbers
  useState for filters (not Zustand)
  Filters reset on navigate-to-category

FILTER APPLICATION:
  Filters passed to: useInfiniteWorkers(params)
  When filters change: query re-fetches automatically (React Query)
  Workers list updates: cross-fade to new results

ACTIVE FILTERS DISPLAY:
  When filters !== DEFAULT_FILTERS:
    Show ChipGroup of active filters below TabToggle
    Each chip: filter value + × to remove
    Same pattern as Explore tab (Day 6)
```

---

## Task 7.14 — Service Detail Screen
### Duration: 35 minutes
### File: `app/service/[id].tsx`

```
FILE: app/service/[id].tsx
ROUTE PARAM: id (service UUID)

PHILOSOPHY:
  User tapped a service (Fan Installation, Pipe Repair, etc.)
  They want to know:
  1. What exactly does this service include?
  2. How much does it cost?
  3. How long does it take?
  4. Who offers it near me?
  5. How do I book it?

  HICK'S LAW: answer these 5 questions in one scroll.
  SERIAL POSITION: Price shown prominently EARLY (not hidden at bottom).
  GOAL GRADIENT: "Add to Cart" in sticky footer always visible.

DATA NEEDED:
  service: useServiceById(id)
  workers offering this: useNearbyWorkers({ serviceId: id })
    NOTE: useNearbyWorkers already supports service filter (from types)
```

---

### Screen Layout

```
SCREEN BG: colors.bgApp (#FAFAFA)

HEADER:
  ← back button (IconButton)
  Title: "Service Details" OR empty (service name in hero)
  BG: transparent (hero is below header)
  On scroll > hero height: BG becomes white + service name in header

HERO SECTION (240px height):
  BG: category-tint color (same as ServiceCategoryCard)
  Category icon: 72px, centered, slightly above center
  ServiceBadge: absolute top-right (if popular/deal/new)

WHITE CONTENT CARD (below hero, borderTopRadius 24px, overlaps hero):
  Padding: 20px horizontal, 20px top

  SERVICE NAME:
    Poppins Bold 24px textPrimary
    marginBottom: 4px

  CATEGORY BREADCRUMB:
    Plus Jakarta Sans Regular 14px textMuted
    "Electrician > Installation" format
    marginBottom: 16px

  PRICE ROW:
    ServicePriceTag size="lg" (Inter Bold 28px green price)
    + "/hr" or "/visit" inline
    + duration chip: Chip variant="tag" size="sm" "~60 min"
    flexDirection row, alignItems center, gap 12px
    SERIAL POSITION: price early = user confirms budget immediately

  DIVIDER (1px, colors.border, marginV 20px)

  DESCRIPTION SECTION:
    Section header: "About this service" — Poppins SemiBold 16px
    Description body: Plus Jakarta Sans Regular 15px textSecondary
    LineHeight: 24px
    Max 6 lines initially, "Read more" expand (same as WorkerBio)
    "Read more": Plus Jakarta SemiBold 14px green

  WHAT'S INCLUDED SECTION:
    "What's included" — Poppins SemiBold 16px
    List of bullet points:
      Each: [✓ circle 16px green] + text [Plus Jakarta Regular 14px]
      e.g., "✓ All labor costs included"
           "✓ Up to 2 fans per visit"
           "✓ Basic materials included"
    Stagger entrance: each bullet 60ms delay

  WHAT'S NOT INCLUDED (if any):
    "What's NOT included" — Poppins SemiBold 16px
    List with [× circle 16px danger] + text
    e.g., "× Premium materials (quoted separately)"

  DIVIDER

  WORKERS NEAR YOU SECTION:
    Section component: title "Workers offering this" + "See all →"
    NearbyWorkersList horizontal (reusing Day 5 component!)
      filtered by serviceId
      useNearbyWorkers({ serviceId: id })
    OR: WorkerCard list (vertical) if better for detail context
    Day 7 decision: horizontal (matches home screen = familiarity)

  BOTTOM SPACING: 100px (for sticky footer clearance)

STICKY FOOTER:
  BG: colors.bgCard, shadow top
  Height: 80px + safe area

  LEFT (if worker context exists):
    Worker mini card: avatar 36px + name
    "Change worker" link below

  RIGHT OR FULL-WIDTH:
    AddToCartButton size="md" (38px height, full-width if no worker context)
    "Select a worker to add" if no worker context (disabled state)

  SELECTION FLOW (no worker context = came directly to service):
    "Select Worker" button (secondary) — opens worker list BottomSheet
    OR: "Find a Worker" — navigates to category screen for this service
```

---

### New Hook for Service Detail

```
FILE: src/hooks/useServiceById.ts
PURPOSE: Fetches single service detail

RETURNS:
  service: Service | undefined
  isLoading: boolean
  isError: boolean

QUERY:
  queryKey: ['service', id]
  queryFn: categoryApi.getServiceById(id)
  staleTime: 3600_000 (1 hour — services change rarely)

useNearbyWorkers already supports serviceId filter
So no new hook needed for "workers offering this service"
Just call: useNearbyWorkers({ serviceId: id, lat, lng })
```

---

## Task 7.15 — Integration Test
### Duration: 15 minutes

```
FUNCTIONAL TEST CHECKLIST:

  RangeSlider:
    □ Two thumbs drag independently
    □ Min thumb cannot pass max thumb
    □ Max thumb cannot pass min thumb
    □ Both clamp at track edges
    □ Snap to step increments (50 Rs steps)
    □ Haptic fires on each step change
    □ Labels update live during drag
    □ Thumb scale 1.0→1.3 on drag start
    □ FilterSheetContent: RangeSlider now shows (Day 6 update)

  TabToggle:
    □ Indicator slides to correct tab on tap
    □ spring-gentle animation (not instant)
    □ Active label: Poppins SemiBold (heavier font)
    □ Inactive label: Jakarta Medium (lighter font)
    □ Haptic on tab switch

  ServiceBadge:
    □ 4 variants show correct color + icon
    □ Entrance animation: scale 0→1.1→1.0 (spring-bouncy)

  ServicePriceTag:
    □ 3 priceTypes render correctly
    □ "Get Quote" shown when amount is null
    □ "From" prefix shown when showFrom=true
    □ Numbers use Inter font (verify in simulator)

  ServiceCard (grid):
    □ 165×180px dimensions
    □ Icon area with category tint color
    □ ServiceBadge positioned top-right
    □ AddToCartButton at bottom
    □ Press: scale animation + navigate to service/[id]
    □ AddToCartButton: stopPropagation (doesn't navigate)

  AccordionItem:
    □ Default: collapsed (title only visible)
    □ Tap: content expands with spring animation
    □ Chevron rotates 0→180deg on expand
    □ Tap again: collapses (spring-stiff)
    □ Multiple accordions: can be open simultaneously

  AddToCartButton:
    □ STATE 1: transparent border + "Add" visible
    □ Tap: morphs to STATE 2 (BG fills, count appears)
    □ Morph animation: width + BG + count = smooth parallel
    □ STATE 2: "−" "1" "+" visible
    □ "+" tap: count increments with roll-up animation
    □ "−" tap: count decrements with roll-down animation
    □ "−" at 1: morphs back to STATE 1
    □ Haptic: medium on add, light on increment/decrement

  Category Screen [id]:
    □ Correct category name in header
    □ TabToggle: Workers and Services tabs work
    □ Workers tab: WorkerSearchCard list loads
    □ Workers tab: infinite scroll loads more
    □ Services tab: ServiceListItem + AccordionItem list loads
    □ Services tab: accordion expand/collapse works
    □ Filter sheet opens on filter button
    □ Filter applied: workers list updates
    □ CategoryRow: tapping different category navigates correctly

  Service Detail [id]:
    □ Hero shows correct icon + category color
    □ Price displayed prominently (Inter Bold 28px green)
    □ Description: 6-line truncate + "Read more" expand
    □ What's included: bullet list with stagger
    □ Nearby workers section loads
    □ Sticky footer always visible
    □ AddToCartButton in footer works

  NAVIGATION TEST:
    □ Home → tap category card → category screen ✓
    □ Category workers tab → tap worker → worker profile (placeholder) ✓
    □ Category services tab → tap service → service detail ✓
    □ Service detail → "See all" workers → category screen ✓
    □ Full funnel: Home → Category → Service detail → workers

  PERFORMANCE:
    □ Category screen workers: 60fps on Android emulator
    □ Accordion expand: smooth 60fps
    □ TabToggle switch: instant content change + smooth indicator
    □ RangeSlider drag: no dropped frames

  QUALITY:
    □ tsc --noEmit: zero errors across all Day 7 files
    □ eslint: zero warnings
    □ All fonts: Poppins headings/CTAs, Jakarta body, Inter numbers
    □ All touch targets: min 44×44px
```

---

---

## Missing Component Specs — Completing Day 7

---

## ServiceDescription Component
### File: `src/components/service/ServiceDescription.tsx`

```
PURPOSE:
  Shown INSIDE an AccordionItem's expanded area on CategoryServicesList.
  Displays: description, duration, what's included, AddToCartButton.
  Separate component = reusable in service detail, worker profile services.

PROPS:
  service:     Service (full service object)
  workerId:    string | null (if a worker is pre-selected)
  onAdd:       () => void (callback when added)

VISUAL LAYOUT (inside accordion body):
  Padding: 0 top (AccordionItem handles top border), 14px horizontal, 14px bottom

  DESCRIPTION TEXT:
    Plus Jakarta Sans Regular 14px textSecondary
    lineHeight: 22px
    numberOfLines: 4 initially
    "Read more" if longer (Plus Jakarta SemiBold 13px green)

  DURATION ROW (8px below description):
    Clock icon 14px textMuted (left)
    "Typically 45–90 min" — Plus Jakarta Sans Regular 13px textMuted

  WHAT'S INCLUDED (if service.includes exists, 12px below):
    "Includes:" — Poppins SemiBold 12px textPrimary
    Items: each on own row
      ✓ check icon 12px green + Plus Jakarta Regular 13px textPrimary
      stagger: 40ms delay per item

  ADDTOCARTBUTTON ROW (12px below, right-aligned):
    AddToCartButton component (Task 7.9)
    size: 'sm'
    serviceId: service.id
    workerId: workerId prop
    flexDirection: row, justifyContent: flex-end

  DIVIDER from next accordion: handled by AccordionItem's container border
```

---

## SkeletonServiceListItem Component
### File: `src/components/ui/Skeleton/SkeletonServiceListItem.tsx`

```
PURPOSE:
  Skeleton placeholder matching ServiceListItem layout (72px height).
  Used in CategoryServicesList loading state.

DIMENSIONS: Full-width × 72px height (matches ServiceListItem)

INTERNAL LAYOUT:
  Container:
    flexDirection: row
    alignItems: center
    padding: 14px
    BG: colors.bgCard, radius lg, shadow xs

  LEFT: Skeleton 56×56px, borderRadius 12 (square icon area)

  CENTER (flex 1, marginH 12, gap 6):
    Row 1: Skeleton width=140 height=14 radius=4 (service name)
    Row 2: Skeleton width=100 height=11 radius=4 (category + duration)

  RIGHT (alignItems flex-end, gap 6):
    Skeleton width=70 height=14 radius=4 (price)
    Skeleton width=60 height=28 radius=pill (add button placeholder)

SHIMMER: Inherited from Skeleton base component
RENDER: 5 × SkeletonServiceListItem in CategoryServicesList loading state
```

---

## useServiceById Hook
### File: `src/hooks/useServiceById.ts`

```
PURPOSE:
  Fetches single service detail for service/[id].tsx screen.

SIGNATURE:
  useServiceById(serviceId: string)
  Returns: {
    service: Service | undefined
    isLoading: boolean
    isError: boolean
    refetch: () => void
  }

INTERNALS:
  useQuery({
    queryKey: ['service', serviceId],
    queryFn: () => categoryApi.getServiceById(serviceId),
    staleTime: 3600_000, (1 hour — service data changes rarely)
    enabled: Boolean(serviceId),
  })

API CALL:
  categoryApi.getServiceById(id)
  Already spec'd in Day 4's category.api.ts
  Returns: Service (full object with description, includes, excludes)

ERROR HANDLING:
  404: service not found → show "Service unavailable" screen
  Network: isError = true → ErrorState with retry button
  Loading: isLoading = true → skeleton layout on service detail
```

---

## SortDropdown Component (Inline Sort Trigger)
### File: `src/components/ui/SortDropdown/SortDropdown.tsx`

```
PURPOSE:
  Small "Sort: Distance ▾" trigger button used in StickyListHeader's rightContent.
  Tap → opens ActionSheet with sort options (using Day 6 ActionSheet component).

PROPS:
  currentSort:   SortOption
  onSortChange:  (sort: SortOption) => void
  style:         ViewStyle

VISUAL:
  Pressable row:
    "Sort: " — Plus Jakarta Sans Regular 12px textMuted
    sort label (e.g., "Distance") — Plus Jakarta SemiBold 12px green
    ChevronDown icon 12px green
    All inline, gap 2px
  Height: 28px (compact, doesn't compete with main header)
  No border, no background (transparent inline element)

ON PRESS:
  Opens ActionSheet (Day 6 component):
    title: "Sort workers by"
    actions: [
      { label: "Nearest first", value: "distance" },
      { label: "Highest rated", value: "rating" },
      { label: "Lowest price", value: "price_low" },
    ]
    Current active: shown with ✓ checkmark
  On action select: call onSortChange(value)
  Haptic: selectionAsync
  ActionSheet closes automatically

USAGE IN StickyListHeader:
  <StickyListHeader
    title="Workers"
    count={12}
    rightContent={
      <SortDropdown
        currentSort={sortBy}
        onSortChange={setSortBy}
      />
    }
  />

MICRO-INTENTION:
  Small and unobtrusive when not needed
  But always accessible (serial position: right side = consistent)
  Tap → ActionSheet rises = sort options visible = goal-directed
```

---

## CategoryFilterBar Component
### File: `src/components/category/CategoryFilterBar.tsx`

```
PURPOSE:
  Combined bar of sort chips + active filter chips for category screen.
  Rendered below TabToggle when filters are active OR as permanent sort strip.

PROPS:
  sortBy:            SortOption
  onSortChange:      (sort: SortOption) => void
  activeFilters:     FilterState
  onRemoveFilter:    (key: keyof FilterState) => void
  onOpenFilters:     () => void
  style:             ViewStyle

VISUAL:
  ScrollView horizontal (contains everything in one scrollable row)
  showsHorizontalScrollIndicator: false
  paddingH: 16px, gap: 8px, paddingV: 8px

  ALWAYS SHOWN — Sort chips (first 3 chips):
    Chip "Nearest" (variant filter, size sm): sortBy === 'distance'
    Chip "Top Rated" (variant filter, size sm): sortBy === 'rating'
    Chip "Lowest Price" (variant filter, size sm): sortBy === 'price_low'
    Single-select: tap chip = update sortBy

  SEPARATOR (if active filters):
    1px vertical line, 20px height, textMuted, opacity 0.3
    Visually separates sort chips from active filter chips

  ACTIVE FILTER CHIPS (conditional, only if filters ≠ DEFAULT):
    Each active filter: Chip with × trailing icon
    Examples: "Min 4★ ×", "Under Rs 1,500 ×", "Available Now ×"
    trailingIcon: X (Lucide 12px)
    onTrailingPress: onRemoveFilter(filterKey)

  FILTER BUTTON (last item):
    [sliders-horizontal icon 14px] "Filters"
    Chip variant="ghost" OR small IconButton
    Always visible at the end
    onPress: onOpenFilters()
    If any filters active: show count badge on this chip

WHEN TO SHOW CategoryFilterBar:
  ALWAYS (not conditional)
  Sort chips are always useful
  Filter button always accessible
  Active filter chips appear/disappear smoothly

ANIMATIONS:
  Active filter chip appearance: slide in from right (translateX 20→0, opacity 0→1)
  Active filter chip removal: slide out to right + width collapses (spring-stiff)
  Sort chip select: same as Chip component animation
```

---

## SkeletonServiceCard Component
### File: `src/components/ui/Skeleton/SkeletonServiceCard.tsx`

```
PURPOSE:
  Grid skeleton matching ServiceCard (165×180px).
  Used in CategoryServicesList grid view loading state.

DIMENSIONS: 165×180px (same as ServiceCard)

INTERNAL LAYOUT:
  TOP ICON AREA (165×80px):
    Skeleton full-width 80px rectangle (no borderRadius override — inherits)

  CONTENT AREA (below, 100px, padding 10px):
    Row 1: Skeleton width=130 height=13 radius=4 (service name line 1)
    Row 2: Skeleton width=100 height=13 radius=4 (service name line 2), gap 4
    Row 3: Skeleton width=70 height=11 radius=4 (category), gap 8
    Row 4: Skeleton width=65 height=14 radius=4 (price), gap 8
    Row 5: Skeleton full-width (145px) height=30 radius=pill (add button), marginTop auto

RENDER:
  In grid: renders 2 per row (same as ServiceCard)
  Show: 6 total (3 rows of 2 = implies medium-length list)
```

---

## Day 7 — Final Missing Hooks + API Additions

```
ADDITIONS TO category.api.ts (Day 4 file):

  getServiceById(id: string):
    Already mentioned in Day 4 spec.
    Day 7: VERIFY this exists. If missing, add:
    Endpoint: GET /services/:id
    Returns: Service (full object with description, includes fields)
    Used by: useServiceById hook + service/[id].tsx screen

ADDITIONS TO worker.api.ts (Day 4 file):

  getWorkersByService(serviceId: string, params: NearbyWorkersParams):
    Used by: service/[id].tsx "Workers offering this" section
    Endpoint: GET /workers/nearby?serviceId={id}&lat={lat}&lng={lng}
    Same as getNearbyWorkers but with serviceId filter
    useNearbyWorkers hook already supports this via params.serviceId
    No new API method needed — existing hook + params handles it

ADDITIONS TO src/types/category.types.ts (Day 4 file):

  Service type additions (if not already present):
    description: string | null
    includes: string[] (list of what's included)
    excludes: string[] (list of what's NOT included)
    imageUrl: string | null
    isPopular: boolean
    isNew: boolean
    dealPrice: number | null (if deal, show this price)
    dealLabel: string | null (e.g., "20% off today")

  ServiceCategory type (for breadcrumb):
    Already in Category type → no new type needed
    Breadcrumb: category.name from service.categoryId lookup
```

---

## Day 7 — Animation Timing Reference Card

```
QUICK REFERENCE — All animations used in Day 7:

RANGESLIDLER:
  Thumb grab:          spring-snappy (damping 22, stiffness 350) → scale 1.0→1.3
  Thumb release:       spring-default (damping 18, stiffness 220) → scale 1.3→1.0
  Fill position:       Direct (no spring) → frame-perfect sync with thumb
  Label update:        Direct (no animation) → instant number update

TABTOGGLE:
  Indicator slide:     spring-gentle (damping 20, stiffness 150) → translateX
  Label color:         timingConfig.fast (150ms) → textMuted↔textPrimary
  Font weight:         instant (no transition for font weight)
  Tap scale:           spring-stiff (damping 30, stiffness 500) → 0.98→1.0

SERVICEBADGE:
  Initial appear:      spring-bouncy (damping 10, stiffness 280) → scale 0→1.1→1.0
  Delay:               200ms (after parent card renders)

SERVICECARD:
  Press in:            spring-stiff → scale 0.97 + shadow flat
  Press out:           spring-bouncy → scale 1.0 (slight overshoot to 1.01)
  Shadow return:       timingConfig.fast (150ms)

ACCORDIONITEM:
  Expand height:       spring-gentle (damping 20, stiffness 150) → 0→measured
  Body opacity in:     timingConfig.fast (150ms), delay 50ms
  Chevron rotate:      spring-gentle → 0→180deg
  Collapse height:     spring-stiff (damping 30, stiffness 500) → fast
  Body opacity out:    timingConfig.fast (100ms) → first before height
  Collapse chevron:    spring-gentle → 180→0deg

ADDTOCARTBUTTON:
  Add (BG morph):      timingConfig.fast (150ms) → transparent→green
  Add (width):         spring-gentle (300ms) → 80→108px
  Count appear:        spring-bouncy → scale 0→1.2→1.0
  Count roll up (+):   timingConfig (80ms out) + timingConfig (80ms in, 40ms delay)
  Count roll down (-): Same but reversed translateY direction
  Remove (reverse):    spring-gentle width + timingConfig.fast BG

CATEGORY SCREEN:
  Workers stagger:     spring-default per card, 50ms × index delay
  Tab content switch:  timingConfig.fast opacity cross-fade
  Filter chip appear:  spring-bouncy → translateX 20→0 + opacity

SERVICE DETAIL:
  Bullet stagger:      spring-default per bullet, 60ms × index delay
  Read more expand:    spring-gentle height
  Sticky footer enter: spring-gentle translateY 80→0, 200ms mount delay
```

---

## Day 7 — Screen Flow Diagrams

```
CATEGORY SCREEN FLOW:

  ENTRY POINTS:
    Home screen → tap ServiceCategoryCard → app/category/[id]
    Explore tab → tap category chip → app/category/[id]
    Service detail → "See all workers" → app/category/[id]

  USER PATHS ON CATEGORY SCREEN:
    Workers tab:
      Browse → tap worker card → app/worker/[id] (Day 8)
      Browse → tap "Book" button → booking flow (Day 11)

    Services tab:
      Browse → tap service row (accordion expands)
      Expanded → tap "Add to Cart" → AddToCartButton morphs
      Tap service name → app/service/[id]

  EXIT POINTS:
    ← Back → Home (or wherever they came from)
    Worker card → Worker profile (Day 8)
    Service row → Service detail (same day)
    Cart badge (if showing) → Cart screen (Day 10)

SERVICE DETAIL FLOW:

  ENTRY POINTS:
    Category services tab → tap service name
    ServiceCard tap → service/[id]
    Home popular services → tap → service/[id]

  USER PATHS:
    Read description → view workers → tap worker → profile (Day 8)
    Read → "Add to Cart" (with pre-selected worker context)
    Read → "Select Worker" → category screen filtered

  EXIT POINTS:
    ← Back → wherever came from
    Worker tap → worker profile (Day 8)
    "Add to Cart" → cart (Day 10)
```

---

## Day 7 — Accessibility Checklist

```
EVERY COMPONENT must pass this before Day 7 is done:

RANGESLIDLER:
  □ accessibilityRole: "adjustable" on each thumb
  □ accessibilityLabel: "Minimum price slider" / "Maximum price slider"
  □ accessibilityValue: { min, max, now } — screen reader announces current value
  □ accessibilityActions: [{ name: 'increment' }, { name: 'decrement' }]
  □ On action: change by 1 step increment

TABTOGGLE:
  □ Each option: accessibilityRole="tab"
  □ Active option: accessibilityState={{ selected: true }}
  □ Container: accessibilityRole="tablist"

ACCORDIONITEM:
  □ Header Pressable: accessibilityRole="button"
  □ accessibilityLabel: "Expand [service name] details" (collapsed)
                        "Collapse [service name] details" (expanded)
  □ accessibilityState: { expanded: isOpen }

ADDTOCARTBUTTON:
  □ STATE 1: accessibilityLabel="Add [serviceName] to cart"
  □ STATE 2: accessibilityLabel="[count] [serviceName] in cart"
  □ "−" zone: accessibilityLabel="Remove one [serviceName]"
  □ "+" zone: accessibilityLabel="Add another [serviceName]"

SERVICECARD:
  □ accessibilityRole="button"
  □ accessibilityLabel="[serviceName], [price], tap for details"

CATEGORYSCREEN:
  □ TabToggle: screen reader reads active tab on switch
  □ FilterBar: screen reader announces active filter count
  □ Workers list: each WorkerSearchCard has descriptive label
  □ StickyListHeader count: accessibilityLiveRegion="polite"

FONT SCALING (maxFontSizeMultiplier):
  All Text components: maxFontSizeMultiplier: 1.3
  Ensures: accessibility font sizes don't break layouts
  Test: Largest Text Size in iOS Simulator → verify no clipping
```

---

## Day 7 — Performance Notes

```
CRITICAL PERFORMANCE DECISIONS:

FLASHLIST vs FLATLIST on Category Screen:
  Workers tab: FlashList ✅ (WorkerSearchCard = fixed height 96px)
  Services tab: FlatList ⚠️ (AccordionItem = dynamic height)
  WHY: FlashList requires estimatedItemSize + consistent heights
       Accordion items expand/collapse → heights vary
       FlatList handles dynamic heights correctly
  OPTIMIZATION for Services tab:
    getItemLayout NOT possible (dynamic)
    removeClippedSubviews: true
    windowSize: 10 (render 10 items worth in each direction)

RANGESLIDLER PERFORMANCE:
  All gesture calculations in Reanimated worklet (UI thread)
  NO JS thread involvement during drag
  runOnJS() only for: onChange callback (fires after drag ends)
  WHY: JS thread drag = 30fps on Android → unacceptable
  UI thread drag = 60fps guaranteed

ACCORDION PERFORMANCE:
  Height measurement: onLayout fires once on first expand
  Store measured height in useRef (not state) to avoid re-render
  Subsequent expand/collapse: use stored height value
  WHY state: causes re-render = jank during animation

ADDTOCARTBUTTON PERFORMANCE:
  Width animation: useAnimatedStyle → UI thread only
  BG color: interpolateColor in worklet → UI thread only
  Count state: useState (JS thread) — acceptable (count changes rarely)
  The morph animation = fully on UI thread = smooth always

CATEGORYSCREENWORKERS PREFETCH:
  On mount: top 5 worker profiles prefetched
  queryClient.prefetchQuery(['worker', id]) × 5
  Priority: these are background queries (won't block main fetch)
  Result: tapping any of first 5 workers = instant profile load

IMAGE LOADING (expo-image):
  ServiceCard icon area: NOT expo-image (it's an SVG/icon, not photo)
  Worker avatars in WorkerSearchCard: expo-image with blurhash
  Set priority="normal" for off-screen cards (default)
  Set priority="high" for first 3 visible cards
```

---

## Day 7 — Final Quality Gates

```
BEFORE CLOSING DAY 7, VERIFY ALL:

CODE QUALITY:
  □ tsc --noEmit: zero errors on all 22 new files + 3 updated
  □ eslint: zero warnings, zero errors
  □ No console.log statements
  □ No 'any' types (use proper type inference)
  □ No hardcoded colors (use design tokens)
  □ No hardcoded font names (use fontFamily.poppins.semiBold, etc.)
  □ No hardcoded spacing values (use spacing.base, layout.screenPaddingH)
  □ All new hooks have proper cleanup (clearInterval, clearTimeout, etc.)

FONT DISCIPLINE AUDIT:
  □ ALL numbers: Inter (prices, ratings, counts, durations, distances)
  □ ALL headings/CTAs: Poppins (category name, button labels, screen titles)
  □ ALL body/descriptions: Plus Jakarta Sans
  □ Open simulator: check every new screen visually for font violations

ANIMATION AUDIT:
  □ RangeSlider: 60fps during drag (Reanimated worklet confirmed)
  □ TabToggle: smooth slide (spring-gentle, not instant)
  □ Accordion: height spring (not instant snap)
  □ AddToCartButton morph: width + BG + count all simultaneous
  □ Workers stagger: 50ms intervals, first 8 cards stagger
  □ Category screen filter apply: cross-fade (not flash)
  □ Test on Android emulator (slower than iOS — 60fps must hold here too)

NAVIGATION AUDIT:
  □ Home → tap ServiceCategoryCard → /category/electrician → loads
  □ Category → Workers tab → WorkerSearchCard → /worker/[id] (placeholder OK)
  □ Category → Services tab → AccordionItem → taps → expands
  □ Category → service name tap → /service/[id] → loads
  □ Service detail → ← back → returns to category screen
  □ Service detail → worker card tap → /worker/[id]
  □ Filter sheet → apply → category screen refreshes with filters
  □ CategoryRow → tap different category → navigates to new category

TOUCH TARGET AUDIT:
  □ TabToggle each tab: ≥ 50% screen width × 38px = massive ✓
  □ RangeSlider thumbs: 24px + 12px hitSlop = 48px effective ✓
  □ AccordionItem header: 52px full-width ✓
  □ AddToCartButton "−" "+" zones: each 44px ✓
  □ Filter button (category): 44×44px ✓
  □ "See all →" links: hitSlop 12px ✓
  □ Category chip row: 36px height chips ✓

STATE MANAGEMENT AUDIT:
  □ Category screen tab state: local (useState) — correct
  □ Category filters: local (useState per screen) — correct
  □ Sort preference: local (useState per screen) — correct
  □ AddToCartButton count: local today (cart.store Day 10) — correct
  □ useInfiniteWorkers: React Query (server state) — correct
  □ useServiceById: React Query (server state) — correct
  □ Recent searches: MMKV via useRecentSearches — correct

LOADING/EMPTY/ERROR STATES AUDIT:
  □ Category workers tab:
    Loading: 4 SkeletonWorkerSearchCard ✓
    Empty: EmptyState with helpful message ✓
    Error: ErrorState with retry ✓
    Loading more: 2 SkeletonWorkerSearchCard at bottom ✓
  □ Category services tab:
    Loading: 5 SkeletonServiceListItem ✓
    Empty: EmptyState ✓
    Error: simple retry row ✓
  □ Service detail:
    Loading: skeleton layout ✓
    Error: ErrorState with retry ✓
    404 (service not found): "Service unavailable" message ✓
```

---

## Day 7 — Complete New File List

```
MORNING SESSION FILES:
  src/components/ui/Slider/RangeSlider.tsx          ← main complex component
  src/components/ui/Slider/index.ts
  src/components/ui/Toggle/TabToggle.tsx
  src/components/ui/Toggle/index.ts
  src/components/ui/List/StickyListHeader.tsx
  src/components/ui/List/index.ts
  src/components/service/ServiceBadge.tsx
  src/components/service/ServicePriceTag.tsx
  src/components/service/ServiceCard.tsx
  src/components/ui/Skeleton/SkeletonServiceCard.tsx

AFTERNOON SESSION FILES:
  src/components/ui/Accordion/AccordionItem.tsx
  src/components/ui/Accordion/index.ts
  src/components/home/CategoryRow.tsx
  src/components/cart/AddToCartButton.tsx           ← UI complete, store pending
  src/hooks/useInfiniteWorkers.ts
  src/hooks/useServiceById.ts
  src/components/category/CategoryWorkersList.tsx
  src/components/category/CategoryServicesList.tsx
  src/components/service/ServiceDescription.tsx
  src/components/ui/Skeleton/SkeletonServiceListItem.tsx

SCREENS:
  app/category/[id].tsx                             ← COMPLETE
  app/service/[id].tsx                              ← basic complete

UPDATED FILES (retroactive):
  src/components/search/FilterSheetContent.tsx      ← Add RangeSlider section
  src/components/ui/Skeleton/index.ts               ← Add new skeleton exports
  src/components/service/index.ts                   ← Add ServiceCard, ServiceBadge, ServicePriceTag

TOTAL NEW FILES: 22
TOTAL UPDATED: 3

SCREENS SHIPPED:
  app/category/[id].tsx  ← PRODUCTION COMPLETE
  app/service/[id].tsx   ← PRODUCTION COMPLETE (basic, Day 10 adds cart wiring)
```

---

## Day 7 — Component Reuse Map

```
COMPONENT                   USED TODAY          FUTURE USE
──────────────────────────  ──────────────────  ─────────────────────────
RangeSlider                 FilterSheetContent  Distance filter (search)
                                                Duration filter
                                                Price filter (search)

TabToggle                   Category screen     Bookings (Active/Past)
                                                Profile stats view
                                                Future settings toggles

StickyListHeader            CategoryWorkers     Search results header
                            CategoryServices    Bookings list header
                                                Notifications list

ServiceBadge                ServiceCard         Service detail hero
                            ServiceListItem     Search result inline badge

ServicePriceTag             ServiceCard         Service detail hero
                            ServiceListItem     Worker services section
                            Service detail      Cart item price
                            (Day 10)

ServiceCard                 Category services   Recommended services
                            grid                Promoted services

AccordionItem               Category services   Worker profile bio
                            Service FAQs        Support FAQ screen
                                                Booking detail breakdown

CategoryRow                 Category screen     Sub-category navigation
                            top chips           Future category browsing

AddToCartButton             ServiceCard         ServiceListItem (enhanced)
                            Service detail      Worker service offerings
                            footer

useInfiniteWorkers          Category screen     Search results (Day 6 refactor)
                            workers tab         Map screen nearby workers
                                                Service detail workers
```

---

## Day 7 — Micro-Interactions Catalog

```
RANGESLIDLER:
  Drag start:    Thumb scale 1.0→1.3 (spring-snappy) — "I'm grabbed"
  During drag:   Fill updates in real-time — "Instant response"
  Step tick:     Haptic light each step — "Physical detent feel"
  Drag end:      Thumb scale 1.3→1.0 (spring-default) — "Released"

TABTOGGLE:
  Tap:           Haptic selectionAsync — "Acknowledged"
  Indicator:     Slides with spring-gentle — "Glass sliding"
  Label change:  Poppins↔Jakarta cross-fade — "Weight shifts"
  Content:       Opacity cross-fade (old out, new in) — "Content exchanges"

SERVICE BADGE:
  Appear:        scale 0→1.1→1.0 (spring-bouncy, 200ms delay) — "Look at this"

SERVICE CARD:
  PressIn:       scale 0.97 + shadow flat — "Pressed in"
  PressOut:      scale 1.0 + shadow returns — "Released"
  Haptic:        selectionAsync

ACCORDION:
  Tap:           Haptic selectionAsync — "Opening"
  Expand:        Height spring-gentle — "Drawer opening"
  Chevron:       Rotate 0→180deg spring-gentle — "Direction reversed"
  Collapse:      Height spring-stiff (faster) — "Closing decisively"
  Border:        Appears on expand — "Contained, distinguished"

ADDTOCARTBUTTON (THE PEAK OF DAY 7):
  Tap STATE 1:   Haptic medium — "Significant action"
  BG morph:      transparent→green 150ms — "Identity changing"
  Width morph:   80→108 spring-gentle — "Growing to accommodate"
  Count appear:  scale 0→1.2→1.0 spring-bouncy — "Popping into existence"
  Count +/-:     Roll up/down cross-fade — "Number rolling"
  Back to idle:  Reverse — "Returning, nothing lost"

CATEGORY SCREEN ENTRANCE:
  Workers stagger: 50ms per card — "Arriving one by one"
  Services fade:  Cross-fade on tab switch — "Content exchanging"
  Filter applied: Workers cross-fade to new results — "Refining"

SERVICE DETAIL:
  Hero icon:     No animation (immediate = confident)
  Bullets:       60ms stagger (Plus Jakarta Regular) — "Items listing"
  "Read more":   Height spring — "Content flowing"
  Workers:       Horizontal scroll entrance stagger
```

---

## Day 7 — UX Laws Final Audit

```
RECOGNITION OVER RECALL:
  ✅ ServiceBadge: "Popular" text on card = seen, not remembered
  ✅ ServicePriceTag: consistent price format = recognized across screens
  ✅ TabToggle: active state visually distinct = tab recognized
  ✅ StickyListHeader: section label always visible while scrolling
  ✅ Accordion default closed: only names visible = scan without recall
  ✅ CategoryRow chips: category always visible at top of screen

FITTS' LAW:
  ✅ TabToggle: each tab = 50% screen width = massive target
  ✅ Accordion: 52px row = comfortable tap target
  ✅ AddToCartButton: "−" and "+" each = 44px zone
  ✅ Category screen filter button: 44×44 hitSlop
  ✅ RangeSlider thumbs: 24px visual + 12px hitSlop = 48px effective
  ✅ Service detail footer CTA: 52px full-width

HICK'S LAW:
  ✅ TabToggle: 2 tabs only = 1 bit of information
  ✅ Category filter: 3 sort options
  ✅ Accordion default closed: reduces visible items
  ✅ Service detail: 1 primary CTA (Add to Cart)
  ✅ CategoryRow: categories chip = max 5 visible before scroll

JAKOB'S LAW:
  ✅ RangeSlider: Airbnb/Booking.com price range pattern
  ✅ TabToggle: iOS segmented control = universal pattern
  ✅ Accordion: expand/collapse = Amazon FAQ, Airbnb details
  ✅ Infinite scroll: every list-heavy app pattern
  ✅ AddToCartButton: e-commerce "Add" → "Quantity" pattern
  ✅ StickyListHeader: iOS native list section header behavior

PEAK-END RULE:
  ✅ AddToCartButton morph = PEAK of category screen (cart action)
  ✅ RangeSlider haptic per step = continuous micro-peaks during filter
  ✅ Accordion expand spring = PEAK of service discovery
  ✅ Workers stagger entrance = PEAK of category screen load
  ✅ Service detail END: sticky "Add to Cart" button = final action

GOAL GRADIENT EFFECT:
  ✅ AddToCartButton count badge: "1 added" = visible progress
  ✅ Workers tab "Book": visible on each card = 2 taps from goal
  ✅ Service detail price + CTA: cost confirmed + action = near goal
  ✅ Infinite scroll: loading more workers = expanding options
  ✅ Filter "Apply (8 workers)": result count = goal reachable

SERIAL POSITION EFFECT:
  ✅ Category workers: nearest first = best match first = most booked
  ✅ Service detail: price shown EARLY (not buried at bottom)
  ✅ Accordion: service name first = decision trigger before expanding
  ✅ Category filter chips: "All" first = escape hatch most visible
  ✅ Bullet list "What's included": most important benefit first
```

---

## What Day 8 Gets From Day 7

```
AFTER DAY 7, THE FOLLOWING ARE COMPLETE:

  COMPLETE DISCOVERY PIPELINE:
    Home screen → Category screen → Service detail
    All screens production-ready

  COMPONENTS AVAILABLE FOR DAY 8 (Worker Profile):
    AccordionItem → worker bio expand (alternative to "Read more")
    ServicePriceTag → worker services section pricing
    ServiceBadge → worker's "Popular service" badges
    RangeSlider → filter sheet (already integrated)
    TabToggle → future use in profile if needed
    CategoryRow → future: worker categories display

  ALSO BUILT AND REUSABLE:
    AddToCartButton → appears in worker profile services section (Day 8)
    useInfiniteWorkers → worker profile "others in this category" section
    SkeletonServiceCard → worker services loading state
    SkeletonServiceListItem → worker services loading state

  DAY 8 WILL BUILD (Worker Profile — Top Half):
    WorkerProfileHeader (hero + scroll animation)
    VerifiedBadge
    WorkerStats (count-up animation)
    WorkerAvailabilityCard
    WorkerSkillList (uses Chip from Day 6!)
    WorkerBio (uses AccordionItem idea from Day 7!)
    WorkerProfileStickyFooter (Chat + Book Now)
    app/worker/[id].tsx top half assembled

    DAY 8 uses 8+ components built in Days 5, 6, 7.
    Every day we build, Day 8 gets faster.
    This is compound interest of proper component architecture.
```

---

*Tasklync — Day 7 Implementation Plan*
*22 new files. 3 updated files. 15+ components.*
*RangeSlider · TabToggle · ServiceCard · ServiceBadge · ServicePriceTag ·*
*AccordionItem · CategoryRow · AddToCartButton · StickyListHeader*
*Category screen COMPLETE. Service detail COMPLETE.*
*Every micro-interaction named. Every UX law applied per component.*
*Font discipline: Poppins headings/CTAs, Jakarta body/labels, Inter ALL numbers.*
*Ahesta ahesta — 60-day build, Day 7 of 60.*
