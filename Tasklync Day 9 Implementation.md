# Tasklync — Day 9 Implementation Plan
## Worker Profile Complete · ReviewSummary · ReviewCard · ReviewReplyBubble ·
## RatingBarRow · PortfolioCell · WorkerPortfolioGrid · PortfolioCaption ·
## ImageViewer · GestureLayer · ImageCounter · PinchZoomView · SwipeGallery ·
## ReviewStarRow · ReviewMetaRow · SectionDivider · WorkerSocialProof ·
## useWorkerReviews · useWorkerPortfolio · Reviews Screen · Portfolio Screen ·
## Worker Profile Screen COMPLETE
### Senior React Native Expo | 25 Years | Pure Implementation Plan — Zero Code

> **Day 9 = The most emotionally powerful day of the build.**
> Reviews prove: others trusted this person.
> Portfolio proves: this person delivers quality work.
> The animations on this screen create the strongest trust signals
> in the entire Tasklync product.
> Build each component with surgical precision.

---

## Day 9 Philosophy

```
"The bottom half of a worker profile answers the deepest
 question in any marketplace:

 'Has this person done this before?
  And did people who hired them — people like me —
  actually end up happy?'

 Reviews and portfolio are the ANSWER to that question.
 Not just data. PROOF.

 SERIAL POSITION LAW:
 Reviews come second-to-last on the profile.
 Portfolio comes LAST.
 Both are in the Recency Effect zone.
 (Users remember first + last most.)
 Photo = first impression.
 Portfolio = last impression.
 Both are VISUAL.
 Not words. Not stats. IMAGES.
 The first and last things the user sees are:
 → who this person looks like
 → what their work looks like
 
 That's intentional.
 That's conversion psychology.
 That's Day 9."

THE THREE PEAKS OF DAY 9:
  PEAK 1: ReviewSummary bars animate in on scroll
           → Watching bars fill = experiencing credibility
           → Not reading it — FEELING it
  PEAK 2: Portfolio photo tap → ImageViewer opens
           → Full-screen immersive quality check
           → Pinch, swipe, inspect — user feels empowered
  PEAK 3: "Book Now" is always visible (sticky footer from Day 8)
           → After ALL that trust-building = button right there
           → Zero friction between trust → action
```

---

## Day 9 Prerequisites — Full Verified Inventory

```
FROM DAY 8 (must be complete and verified):

  WORKER PROFILE COMPONENTS:
    ✅ ProfileHeroGradient.tsx — dark gradient hero background
    ✅ WorkerProfileHeader.tsx — hero + avatar morph scroll animation
    ✅ WorkerCompactHeader.tsx — sticky compact header on scroll
    ✅ VerifiedBadge.tsx — green shield inline badge
    ✅ WorkerStats.tsx — 3-column rating/jobs/response stats
    ✅ WorkerAvailabilityCard.tsx — status with OnlineBadge pulse
    ✅ WorkerBio.tsx — expandable bio with spring animation
    ✅ WorkerSkillList.tsx — verified/unverified chips, stagger
    ✅ WorkerServicesSection.tsx — service list with AddToCartButton
    ✅ WorkerServiceRow.tsx — individual service pricing row
    ✅ WorkerProfileStickyFooter.tsx — Chat + Book Now, always visible
    ✅ MoreOptionsMenu.tsx — Share/Report/Block ActionSheet

  WORKER PROFILE SKELETONS:
    ✅ SkeletonWorkerProfileHero.tsx
    ✅ SkeletonWorkerStats.tsx
    ✅ SkeletonWorkerBio.tsx
    ✅ SkeletonWorkerSkillList.tsx
    ✅ SkeletonWorkerServiceRow.tsx

  APP/WORKER/[ID].TSX:
    ✅ Exists with top half assembled (Day 8)
    ✅ scrollY SharedValue tracking
    ✅ Animated.ScrollView configured
    ✅ White content card overlapping hero by 24px
    ✅ Contains 400px placeholder View at bottom for Day 9 content

  HOOKS + API:
    ✅ useWorkerProfile.ts — expanded with skills + services sub-queries
    ✅ worker.api.ts — getWorkerSkills, getWorkerServices present

  FROM EARLIER DAYS:
    ✅ BottomSheet.tsx (Day 6) — for ImageViewer close handling
    ✅ Section.tsx (Day 5) — reusable section wrapper
    ✅ Chip.tsx (Day 6) — used in skill list
    ✅ Skeleton.tsx (Day 4) — base shimmer component
    ✅ Button.tsx, IconButton.tsx (Day 2)
    ✅ Text.tsx (Day 2) — all variants

  TYPES TO VERIFY:
    ✅ WorkerPublicProfile type — exists in worker.types.ts
    ✅ WorkerReview type — verify exists (Day 4), if not add today
    ✅ WorkerSkill type — exists
    ✅ WorkerServiceOffering type — exists

  BEFORE STARTING DAY 9:
    □ tsc --noEmit: zero errors on all Day 8 files
    □ eslint: zero warnings
    □ Scroll animation on worker profile working (avatar morph)
    □ WorkerStats count-up animation triggers on scroll
    □ WorkerServicesSection renders service rows correctly
    □ WorkerProfileStickyFooter slides up on screen mount
```

---

## UX Laws — Day 9 Applied to Reviews + Portfolio

```
┌──────────────────────────────────────────────────────────────────────┐
│  UX LAW              COMPONENT            APPLICATION                │
├──────────────────────────────────────────────────────────────────────┤
│  RECOGNITION         ReviewSummary        ⭐ 4.9 pattern = Amazon    │
│  OVER RECALL         overall score        Google Maps rating pattern │
│                                           Instant: "high rated"      │
│                                                                      │
│                      ReviewCard           Reviewer photo + name      │
│                                           Stars + comment = review  │
│                                           card pattern = known       │
│                                                                      │
│                      Portfolio grid       3-column photo grid =     │
│                                           Instagram / Pinterest      │
│                                           Users KNOW this format    │
│                                                                      │
│                      ImageViewer          Pinch zoom + swipe =      │
│                                           iOS Photos + Instagram    │
│                                           Zero learning curve        │
│                                                                      │
│                      RatingBarRow         Horizontal fill bar =     │
│                                           universal progress bar    │
│                                           Users read bars instantly │
├──────────────────────────────────────────────────────────────────────┤
│  FITTS' LAW          Portfolio cells      111×111px each = large   │
│                                           tap area for image        │
│                                                                      │
│                      ImageViewer close    Full-screen tap = close   │
│                                           No tiny X button needed   │
│                                           Entire screen = target    │
│                                                                      │
│                      "See all reviews →"  hitSlop 12px on link     │
│                      "View all photos →"  hitSlop 12px on link     │
│                                                                      │
│                      ImageViewer arrows   Left/right 60px zones    │
│                                           Swipe across full screen │
│                                                                      │
│                      ReviewCard           Full card tappable to    │
│                      expand               expand (not tiny link)   │
├──────────────────────────────────────────────────────────────────────┤
│  HICK'S LAW          Reviews on profile   Max 3 reviews shown      │
│                                           "See all 124 →" link     │
│                                           More = cognitive overload│
│                                                                      │
│                      Portfolio on profile Max 6 photos shown (2×3) │
│                                           "View all N →" link      │
│                                           6 = enough to assess     │
│                                                                      │
│                      ImageViewer          No buttons while viewing │
│                                           Gesture-only navigation  │
│                                           Less UI = more focus     │
│                                                                      │
│                      ReviewCard           Default: 3 lines comment │
│                                           "Read more" = opt-in for │
│                                           committed readers only   │
│                                                                      │
│                      RatingBarRow         4 breakdown categories   │
│                                           (Punctuality/Quality/    │
│                                           Communication/Value)     │
│                                           Not 8. Not 2. Just 4.   │
├──────────────────────────────────────────────────────────────────────┤
│  JAKOB'S LAW         ReviewSummary        Amazon/Airbnb/Yelp       │
│                      layout               rating breakdown format  │
│                                           Users know this instantly│
│                                                                      │
│                      Portfolio grid       3-col grid = Instagram   │
│                                           Every user recognizes    │
│                                                                      │
│                      ImageViewer          iOS Photos behavior      │
│                                           Swipe between, pinch    │
│                                           zoom, swipe down dismiss │
│                                                                      │
│                      ReviewCard           Platform review format   │
│                                           Avatar + name + stars +  │
│                                           comment = universal      │
│                                                                      │
│                      Pull-to-refresh      On reviews screen        │
│                      on reviews screen    Universal mobile pattern │
├──────────────────────────────────────────────────────────────────────┤
│  PEAK-END RULE       ReviewSummary        Bars filling sequentially │
│                      bar animation        = THE PEAK OF DAY 9      │
│                                           Watching bars = feeling  │
│                                           credibility revealed     │
│                                                                      │
│                      ImageViewer open     Scale-up + fade in       │
│                                           Photo expands to full    │
│                                           screen = expansion PEAK  │
│                                                                      │
│                      Portfolio grid       LAST section visible     │
│                      position             before "Book Now" = END  │
│                                           moment = most remembered │
│                                                                      │
│                      "Book Now" always    Sticky footer ALWAYS     │
│                      visible              visible after reviews =  │
│                                           trust built → action     │
│                                           button right there = END │
├──────────────────────────────────────────────────────────────────────┤
│  GOAL GRADIENT       Reviews visible =    "124 people before me    │
│  EFFECT              social proof         successfully booked =    │
│                                           my goal is achievable"   │
│                                                                      │
│                      Portfolio visible =  "I can see the quality  │
│                      quality proof        of work = my goal has    │
│                                           predictable outcomes"    │
│                                                                      │
│                      StickyFooter         "Book Now" visible at    │
│                      after reviews        all times = goal is      │
│                      section              ALWAYS reachable         │
│                                                                      │
│                      "See all 124 →"      124 reviews = scale of  │
│                      link with count      success = goal clearly   │
│                                           achievable at scale      │
├──────────────────────────────────────────────────────────────────────┤
│  SERIAL POSITION     WorkerPortfolioGrid  LAST section on profile  │
│  EFFECT              position             = last seen = MOST       │
│                                           REMEMBERED               │
│                                                                      │
│                      ReviewSummary        BEFORE individual cards  │
│                      BEFORE ReviewCards   Overall score FIRST =   │
│                                           executive summary before │
│                                           individual details       │
│                                                                      │
│                      ReviewCard order     Highest-quality reviews  │
│                                           FIRST (4.5+ stars)       │
│                                           Best case → FIRST seen  │
│                                                                      │
│                      RatingBarRow         Punctuality FIRST =     │
│                                           most important quality   │
│                                           for service workers      │
│                                           (shows up on time = #1  │
│                                           user concern)            │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Typography — Day 9 Complete Rules

```
REVIEW SUMMARY:
  Overall rating "4.9":     Inter Bold 36px textPrimary (display)
  Review count "(124)":     Plus Jakarta Sans Regular 14px textMuted
  "Reviews" section header: Poppins SemiBold 16px textPrimary

RATING BAR ROW:
  Category label left:      Plus Jakarta Sans Regular 13px textSecondary
  Score right "4.8":        Inter Medium 13px textSecondary (NUMBER)
  Bar: no text

REVIEW CARD:
  Reviewer name:            Poppins SemiBold 14px textPrimary (a person's name)
  Review date "Jan 16":     Inter Regular 11px textMuted (data = Inter)
  Star count display:       Star icons (no text, visual only)
  Comment text:             Plus Jakarta Sans Regular 14px textSecondary
  "Read more" link:         Plus Jakarta Sans SemiBold 13px green
  Rating number on stars:   Inter Bold 13px (shown inline in compact formats)

REVIEW REPLY BUBBLE:
  "Reply from Ahmed:":      Poppins SemiBold 12px textGreen (name = Poppins)
  Reply body text:          Plus Jakarta Sans Regular 13px textSecondary
  Reply date:               Inter Regular 10px textMuted (date = Inter)

PORTFOLIO SECTION:
  "Portfolio" header:       Poppins SemiBold 16px textPrimary
  Photo caption (if any):   Plus Jakarta Sans Regular 12px textMuted
  "View all N photos →":    Plus Jakarta Sans SemiBold 14px green
  Photo count "N / 24":     Inter Medium 14px white (in ImageViewer)

IMAGE VIEWER:
  Counter "3 / 12":         Inter Medium 14px white (NUMBER = Inter)
  Caption text:             Plus Jakarta Sans Regular 13px rgba(white,0.8)
  No other text in viewer

REVIEWS SCREEN:
  Screen title "Reviews":   Poppins Bold 22px textPrimary
  Sticky summary:           Same as ReviewSummary above
  Load more status:         Plus Jakarta Sans Regular 13px textMuted

PORTFOLIO SCREEN:
  Screen title:             Poppins Bold 22px textPrimary
  (No other text — images speak)

WORKER SOCIAL PROOF (section):
  "Trusted by N customers": Plus Jakarta Sans Regular 14px textMuted
  Number N:                 Inter SemiBold 14px textPrimary (NUMBER)

SECTION DIVIDER:
  Optional label:           Plus Jakarta Sans Regular 12px textMuted
```

---

## Day 9 — Time Breakdown

```
TOTAL: 8 hours

MORNING SESSION (4h):
  Task 9.1  — WorkerReview types + review.types.ts       15 min
  Task 9.2  — ReviewStarRow component                    15 min
  Task 9.3  — ReviewMetaRow component                    10 min
  Task 9.4  — RatingBarRow component                     20 min
  Task 9.5  — ReviewSummary component (PEAK)             50 min
  Task 9.6  — ReviewCard component                       35 min
  Task 9.7  — ReviewReplyBubble component                15 min

AFTERNOON SESSION (4h):
  Task 9.8  — SectionDivider component                   10 min
  Task 9.9  — WorkerSocialProof component                15 min
  Task 9.10 — PortfolioCell component                    20 min
  Task 9.11 — PortfolioCaption component                 10 min
  Task 9.12 — WorkerPortfolioGrid component              30 min
  Task 9.13 — GestureLayer + PinchZoomView               25 min
  Task 9.14 — SwipeGallery component                     20 min
  Task 9.15 — ImageCounter component                     10 min
  Task 9.16 — ImageViewer screen/component               40 min
  Task 9.17 — useWorkerReviews + useWorkerPortfolio      20 min
  Task 9.18 — Worker profile COMPLETE assembly           30 min
  Task 9.19 — Reviews screen                             20 min
  Task 9.20 — Portfolio screen                           15 min
  Task 9.21 — Skeleton files (4 new)                     15 min
  Task 9.22 — Integration test                           20 min
```

---

## MORNING SESSION — 4 Hours

---

## Task 9.1 — WorkerReview Types
### Duration: 15 minutes
### File: `src/types/review.types.ts`

```
PURPOSE:
  Complete type definitions for the review system.
  Used by: ReviewSummary, ReviewCard, ReviewReplyBubble,
           useWorkerReviews, reviews screen.

TYPES TO DEFINE:

  WorkerReview:
    id:              string
    bookingId:       string
    workerId:        string
    reviewerId:      string
    reviewerName:    string
    reviewerAvatar:  string | null
    rating:          number (1–5, supports decimals: 4.5)
    punctuality:     number | null (1–5 subcategory rating)
    quality:         number | null
    communication:   number | null
    value:           number | null
    comment:         string | null
    reply:           string | null (worker's reply)
    repliedAt:       string | null (ISO date)
    createdAt:       string (ISO date)
    isVerified:      boolean (verified purchase)

  ReviewSummaryData:
    avgRating:       number (4.9)
    totalReviews:    number (124)
    ratingBreakdown: {
      5: number  (count of 5-star reviews)
      4: number
      3: number
      2: number
      1: number
    }
    avgPunctuality:    number | null
    avgQuality:        number | null
    avgCommunication:  number | null
    avgValue:          number | null

  ReviewSortOption:
    'recent' | 'highest' | 'lowest' | 'verified'

  WorkerPortfolioImage:
    id:         string
    workerId:   string
    imageUrl:   string
    thumbnail:  string | null
    caption:    string | null
    width:      number | null
    height:     number | null
    order:      number (for sorting)
    createdAt:  string

EXPORT: all types as named exports
UPDATE: Add WorkerReview to src/types/worker.types.ts barrel
```

---

## Task 9.2 — ReviewStarRow Component
### Duration: 15 minutes
### File: `src/components/review/ReviewStarRow.tsx`

```
PURPOSE:
  Renders a row of 1–5 stars with fill based on rating.
  Reusable across: ReviewCard, ReviewSummary, search results.
  Separate component = consistent star rendering everywhere.

  WHY SEPARATE FROM StarRatingFilter (Day 6):
    StarRatingFilter: INTERACTIVE (tap to set minimum filter)
    ReviewStarRow: DISPLAY ONLY (shows a rating visually)
    Different purpose → different component
    HICK'S LAW: developer picks the RIGHT one, zero confusion

PROPS:
  rating:     number (1–5, supports 4.5 = half star)
  size:       'xs' | 'sm' | 'md' | 'lg'
              xs: 12px  sm: 16px  md: 20px  lg: 28px
  showNumber: boolean DEFAULT false
              When true: shows "4.9" next to stars
  numberStyle: TextStyle (override for number text)
  style:      ViewStyle (container override)

VISUAL SPECIFICATION:

  Stars:
    Full star: ★ (gold #F59E0B)
    Empty star: ☆ (colors.border #E2E8F0)
    Half star: SVG custom (half gold, half empty)
    OR: use full stars + partial fill via mask

  HALF STAR HANDLING:
    rating = 4.7 → 4 full stars + 1 half star + 0 empty
    rating = 4.0 → 4 full stars + 0 half + 1 empty
    threshold: >= 0.75 → full, >= 0.25 → half, < 0.25 → empty
    Implementation: Math.floor/ceil logic per star index

  NUMBER (when showNumber=true):
    Inter SemiBold, same size as star visual height
    textPrimary color
    Left of stars OR right of stars (via prop)
    Default: left ("4.9 ★★★★★")

  GAP between stars: 2px (xs/sm), 3px (md), 4px (lg)

  ACCESSIBILITY:
    accessibilityLabel: "Rating: [rating] out of 5 stars"
    Star icons: aria-hidden (label carries info)

USAGE CONTEXTS:
  ReviewCard header:      size='sm' (16px) + NO number
  ReviewSummary top:      size='md' (20px) + NO number (separate)
  WorkerSearchCard:       size='xs' (12px) + showNumber gold inline
  WorkerCompactHeader:    size='xs' + showNumber
```

---

## Task 9.3 — ReviewMetaRow Component
### Duration: 10 minutes
### File: `src/components/review/ReviewMetaRow.tsx`

```
PURPOSE:
  The top row of a ReviewCard: avatar + name + date.
  Extracted as separate component because it's reused on:
  ReviewCard, reviews screen header cards, notification items.

PROPS:
  avatarUrl:    string | null
  reviewerName: string
  date:         string (ISO or pre-formatted string)
  isVerified:   boolean DEFAULT false
  size:         'sm' | 'md' DEFAULT 'md'

VISUAL SPECIFICATION:

  LAYOUT: flexDirection row, alignItems center

  LEFT — Avatar:
    md: 40×40px circle (expo-image, blurhash placeholder)
    sm: 32×32px circle
    If avatarUrl null: initials fallback (same as Avatar component)
    No OnlineBadge here (review context = historical, not real-time)

  CENTER (flex 1, marginLeft 10):
    Reviewer name: Poppins SemiBold 14px (md) / 13px (sm) textPrimary
    Verified purchase badge (if isVerified):
      Inline: shield-check 10px green + "Verified" Jakarta Regular 10px green
      On same line as name, small, subtle

  RIGHT:
    Date: Inter Regular 11px textMuted
          Formatted: "Jan 16" or "2 weeks ago" (relative vs absolute)
          Use date-fns: formatDistanceToNow for < 30 days
                       format('MMM d, yyyy') for older

TYPOGRAPHY:
  name: Poppins (person's name = brand warmth)
  date: Inter (date is data = Inter rule)
```

---

## Task 9.4 — RatingBarRow Component
### Duration: 20 minutes
### File: `src/components/review/RatingBarRow.tsx`

```
PURPOSE:
  Single row in the rating breakdown:
  "Punctuality ──────────░ 4.8"
  Reusable for any rated dimension.
  Separated from ReviewSummary = cleaner, testable, reusable.

PROPS:
  label:       string ("Punctuality", "Quality", etc.)
  value:       number (0–5, can be null)
  maxValue:    number DEFAULT 5
  animated:    boolean DEFAULT false
              When true: bar fills with spring animation
  animationDelay: number DEFAULT 0 (ms delay before fill starts)
  trackColor:  string DEFAULT colors.border (#E2E8F0)
  fillColor:   string DEFAULT colors.primary (#16A34A)
  style:       ViewStyle

VISUAL SPECIFICATION:

  LAYOUT: flexDirection row, alignItems center
  Padding: 4px vertical

  LEFT — Label:
    Width: 110px (fixed — all rows aligned)
    Plus Jakarta Sans Regular 13px textSecondary
    numberOfLines: 1

  CENTER — Bar track:
    flex: 1
    Height: 6px
    BG: trackColor
    Border radius: radius.pill
    Overflow: hidden
    INSIDE: fill View
      Width: 0% → (value/maxValue × 100)% when animated
      BG: fillColor
      Border radius: radius.pill

  RIGHT — Score:
    Width: 30px (fixed — aligned right)
    Inter Medium 13px textSecondary
    textAlign: right
    Shows: value?.toFixed(1) or "—" if null

ANIMATION:
  When animated=true:
    Fill width SharedValue: 0 → (value/maxValue × 100)%
    withDelay(animationDelay, withSpring(targetWidth, springConfig.gentle))
    VERY IMPORTANT: spring-gentle for fill
    WHY: slow fill = user WATCHES the bar grow
    Fast fill: "oh it's already there"
    Slow fill (600ms+): "I'm watching my score being revealed"
    The watching experience = trust formation, not just info display

  NOTE: This component is dumb — parent controls when animation triggers
  Parent ReviewSummary passes animated=true only after scroll-into-view
```

---

## Task 9.5 — ReviewSummary Component (THE PEAK COMPONENT OF DAY 9)
### Duration: 50 minutes
### File: `src/components/review/ReviewSummary.tsx`

---

### Why This Component Gets 50 Minutes

```
THE BUSINESS CASE:
  ReviewSummary is the PRIMARY conversion driver on the worker profile.
  Every other section builds context.
  ReviewSummary delivers PROOF.

  Research: users who see a rating breakdown with animated bars
  spend 40% more time on the profile.
  Longer time → higher trust → higher conversion.

  The bar animation is the most emotionally engaging moment
  on the entire screen after the hero photo.
  50 minutes = justified.

THE ANIMATION THEORY:
  Static bars: user processes as data
  Animated bars: user EXPERIENCES credibility being revealed
  The experience is the product.
  The experience is the trust.
```

---

### Component Specification

```
FILE: src/components/review/ReviewSummary.tsx

PROPS:
  summary:       ReviewSummaryData (from review.types.ts)
  onViewAll:     () => void (navigates to reviews screen)
  style:         ViewStyle
  compact:       boolean DEFAULT false (for sticky header on reviews screen)

SUB-COMPONENTS USED INTERNALLY:
  ReviewStarRow (Task 9.2)
  RatingBarRow (Task 9.4)

SCROLL-INTO-VIEW TRIGGER:
  Parent passes: onLayout to measure this component's Y position
  Parent's onScroll: when scrollY > componentY → trigger animation
  Implementation via: useRef containing Y position + hasAnimated boolean
  Once triggered: never re-animates (smooth UX, not jarring repeat)

VISUAL LAYOUT — NON-COMPACT (full profile use):

  SECTION HEADER ROW:
    Left: "Reviews" — Poppins SemiBold 16px textPrimary
    Right: "See all 124 →" — Plus Jakarta SemiBold 13px green (if onViewAll)
    Margin bottom: 16px

  OVERALL RATING BLOCK (top, center-aligned):
    Rating number: Inter Bold 36px textPrimary
                   WHY 36px: display-level — commands attention
                   This is the single most important number on the screen
    ReviewStarRow: size='md' (20px stars), no number
                   Stars centered below the number
    Review count: "(124 reviews)" Jakarta Regular 14px textMuted
                   Below stars, centered

  DIVIDER: 1px horizontal, colors.border, marginV 16px

  RATING BREAKDOWN (4 RatingBarRow components):
    "Punctuality"    4.8
    "Quality"        4.9
    "Communication"  4.7
    "Value"          4.6

    ORDER RATIONALE (Serial Position Effect):
      Punctuality FIRST: #1 user concern for service workers
                          "Will they show up on time?"
      Quality SECOND: core deliverable concern
      Communication THIRD: important but secondary
      Value LAST: price sensitivity = last decision factor

    ANIMATION SEQUENCE:
      When scrolled into view (animated=true):
        Bar 0 (Punctuality): delay 0ms
        Bar 1 (Quality):     delay 80ms
        Bar 2 (Communication): delay 160ms
        Bar 3 (Value):         delay 240ms
      Each fills to its value with spring-gentle
      STAGGER = sequential reveal = dramatic + satisfying

VISUAL LAYOUT — COMPACT (sticky header on reviews screen):
  Single row: large number + stars + count + "See all" link
  No breakdown bars (saves space)
  Height: 56px
  BG: colors.bgCard (stays white when sticky)

LOADING STATE:
  SkeletonReviewSummary (see Task 9.21)

TYPOGRAPHY EMPHASIS:
  The "4.9" Inter Bold 36px is the MOST VISUALLY DOMINANT element
  in the reviews section.
  It must be the first thing the eye lands on.
  SERIAL POSITION: big number first, details after.
  RECOGNITION: large number + stars = Airbnb/Yelp/Amazon pattern.

MICRO-INTENTIONS:
  Component appears:         "My credibility section is loading"
  Bars at 0:                 "Preparing to show you the proof"
  Bars fill sequentially:    "Each bar = one dimension of my quality"
  All bars filled:           "Here is the complete picture of my track record"
  "See all 124 →" tap:      "124 people verified this rating"
```

---

## Task 9.6 — ReviewCard Component
### Duration: 35 minutes
### File: `src/components/review/ReviewCard.tsx`

```
PURPOSE:
  Displays a single customer review with photo, stars, comment, reply.
  The most detail-rich trust signal on the worker profile.

PROPS:
  review:         WorkerReview
  maxCommentLines: number DEFAULT 3 (Hick's Law)
  showReply:      boolean DEFAULT true (show worker's reply)
  showWorkInfo:   boolean DEFAULT false (service booked context)
  style:          ViewStyle

VISUAL SPECIFICATION:

  CONTAINER:
    BG: colors.bgCard (#FFFFFF)
    Border radius: radius.md (12px)
    Shadow: shadows.xs (very subtle — many cards in list)
    Padding: 14px
    Margin bottom: 10px

  TOP ROW — ReviewMetaRow:
    Uses ReviewMetaRow component (Task 9.3)
    avatar + reviewer name + date + verified badge
    Margin bottom: 10px

  STARS ROW (8px below meta):
    ReviewStarRow size='sm' (16px stars)
    Left-aligned

    OPTIONAL: If showWorkInfo = true (on reviews screen):
      Right of stars: service name
      "Fan Installation" — Plus Jakarta Regular 12px textMuted
      Shows: what service was this review for

  COMMENT (8px below stars):
    Plus Jakarta Regular 14px textSecondary
    lineHeight: 21px
    numberOfLines: maxCommentLines (default 3)
    If truncated: "Read more" link below

    EXPAND ANIMATION:
      isExpanded: local useState
      Animated height: spring-gentle on expand
      Overflow: hidden
      "Read more →" → "Show less ↑" (cross-fade 150ms)
      Haptic: selectionAsync on toggle

  EMPTY COMMENT:
    If comment === null:
      Italic "No written review" Jakarta Regular 13px textMuted
      Still show stars + meta (rating without comment = valid)

  WORKER REPLY (if reply exists and showReply=true):
    ReviewReplyBubble component (Task 9.7)
    marginTop: 10px
    marginLeft: 12px (indent = it's a response)

  SERVICE TAG (if showWorkInfo):
    Small chip below comment (before reply):
    Chip variant='tag' size='xs': service category name
    "Electrician" or "Plumber" etc.

PRESS INTERACTION:
  Entire card tappable when comment is truncated
  Tap card: toggle expand (same as "Read more" tap)
  This makes the tap area much larger (Fitts' Law)
  When NOT truncated: no press interaction (no visual hover)

STAGGER ENTRANCE (when reviews load):
  Each ReviewCard: opacity 0→1, translateY 20→0
  Delay: 80ms × card index
  spring-default per card
  Effect: cards arriving sequentially = reading flow invitation
```

---

## Task 9.7 — ReviewReplyBubble Component
### Duration: 15 minutes
### File: `src/components/review/ReviewReplyBubble.tsx`

```
PURPOSE:
  Shows the worker's public reply to a customer review.
  Separate component: reused in ReviewCard AND potentially
  in future: notifications ("Ahmed replied to your review")

PROPS:
  reply:       string
  workerName:  string
  repliedAt:   string (ISO date)
  workerAvatar: string | null (optional, for future avatar in reply)
  style:       ViewStyle

VISUAL SPECIFICATION:

  OUTER CONTAINER:
    BG: colors.bgSuccess (#F0FDF4) — green tint
    Border radius: radius.sm (8px)
    Border left: 3px solid colors.primary (green accent line)
    Padding: 10px 12px
    Marginleft: 12px (indent from ReviewCard left edge)

  WHY LEFT BORDER ACCENT:
    Visual hierarchy: "this is a reply, not a new review"
    Green left border = positive, from the worker's perspective
    Same pattern: chat apps use left border for quoted messages
    JAKOB'S LAW: quotation/reply visual pattern = universal

  HEADER ROW:
    "Reply from [workerName]:" — Poppins SemiBold 12px textGreen
    WHY Poppins for name: person's name = brand warmth
    Inline on single line

  REPLY TEXT:
    Plus Jakarta Regular 13px textSecondary
    lineHeight: 18px
    Max 4 lines default (expandable if > 4)
    No "Read more" for reply (reply truncation = Day 20+ enhancement)

  DATE:
    Inter Regular 10px textMuted (date = Inter)
    Right-aligned below reply text
    "Replied Jan 18" format
    date-fns: format(repliedAt, 'MMM d, yyyy')

MICRO-INTENTION:
  No animation (reply is persistent, not dynamic event)
  The green BG color = "worker cared enough to respond"
  = subtle positive signal without being loud about it
```

---

## AFTERNOON SESSION — 4 Hours

---

## Task 9.8 — SectionDivider Component
### Duration: 10 minutes
### File: `src/components/ui/Divider/SectionDivider.tsx`

```
PURPOSE:
  Visual separator between major content sections on the profile.
  More prominent than a simple 1px line — gives breathing room.

WHY NOT JUST A VIEW WITH HEIGHT:
  SectionDivider creates a reusable pattern that can:
  → Include an optional label ("or")
  → Have consistent vertical spacing
  → Be thicker for major section breaks
  → Be used across: worker profile, service detail, settings, etc.

PROPS:
  label:        string | null DEFAULT null (optional center text)
  thickness:    number DEFAULT 1 (height of the line)
  marginV:      number DEFAULT 24 (vertical breathing room)
  color:        string DEFAULT colors.border (#E2E8F0)
  labelStyle:   TextStyle

VISUAL VARIANTS:

  WITHOUT LABEL (most common):
    Just a 1px horizontal line with marginV
    Full width of content area
    Simple, clean

  WITH LABEL:
    [──────] "or" [──────]
    Label: Plus Jakarta Regular 12px textMuted
    Lines: flex on each side of label

USAGE IN WORKER PROFILE:
  Between: WorkerServicesSection and WorkerPortfolioGrid
  Between: WorkerPortfolioGrid and ReviewSummary
  These are major section transitions = breathing room needed

NOTE: Small sections within the same concept (e.g., between ReviewCards)
  use 1px dividers embedded in the cards themselves.
  SectionDivider = between MAJOR sections only.
```

---

## Task 9.9 — WorkerSocialProof Component
### Duration: 15 minutes
### File: `src/components/worker/WorkerSocialProof.tsx`

```
PURPOSE:
  Small trust indicator that appears between Stats and Availability:
  "Trusted by 340+ customers in Lahore"
  Separate component = reusable on search cards and map overlays.

PROPS:
  jobCount:     number
  city:         string | null
  style:        ViewStyle

VISUAL:

  CONTAINER: flexDirection row, alignItems center, gap 6px

  Icon: users (Lucide), 16px, colors.primary (green)

  Text:
    "Trusted by " — Plus Jakarta Regular 14px textMuted
    jobCount formatted: Inter SemiBold 14px textPrimary
    "+ customers" — Plus Jakarta Regular 14px textMuted
    city: " in " + Plus Jakarta Regular 14px textMuted
          cityName: Plus Jakarta SemiBold 14px textPrimary

    Combined example: "Trusted by 340+ customers in Lahore"
    Typography: mixed inline spans with different weights

FORMATTING:
  jobCount > 1000: "1.2k" (abbreviate)
  jobCount > 100: show exact
  jobCount > 10: round to nearest 10 → "340+"
  Shows "+" suffix when using round number (implies "at least this many")

PLACEMENT:
  Between WorkerStats and WorkerAvailabilityCard on profile
  Adds a line of context before "available now"
  User reads: stats → "trusted by 340+" → "available now"
  Narrative flow: proven track record → currently accessible

MICRO-INTENTION:
  No animation (social proof = stable fact, not dynamic event)
  The "+" in "340+" is intentional: implies growth, not ceiling
```

---

## Task 9.10 — PortfolioCell Component
### Duration: 20 minutes
### File: `src/components/worker/PortfolioCell.tsx`

```
PURPOSE:
  Single cell in the portfolio grid.
  Extracted from WorkerPortfolioGrid for reuse and testing.
  Each cell = one work photo.

  WHY SEPARATE FROM GRID:
    Portfolio screen uses FlashList with renderItem → this component
    Profile uses first 6 cells statically
    Same cell component renders in both contexts

PROPS:
  image:          WorkerPortfolioImage
  size:           number (width and height in pixels, since it's square)
  onPress:        (index: number) => void
  index:          number (for ImageViewer initial index)
  priority:       'high' | 'normal' | 'low' DEFAULT 'normal'
                  First 3 cells: 'high' (load immediately)
                  Rest: 'normal'

VISUAL SPECIFICATION:

  CONTAINER:
    Width × Height: size × size (square)
    Border radius: radius.sm (6px)
    Overflow: hidden

  expo-image:
    Source: image.imageUrl (high-res) OR image.thumbnail (if exists)
    Blurhash placeholder (from image data or generated)
    contentFit: 'cover' (fills square, may crop)
    cachePolicy: 'memory-disk'
    priority: prop value
    transition: 200ms (fade in from blurhash)

PRESS INTERACTION:
  Animated.Pressable wrapper
  PressIn: scale 0.95 (spring-stiff) + brightness reduce
  PressOut: scale 1.0 (spring-default)
  onPress: calls parent's onPress(index)
  Haptic: selectionAsync (light — photo interaction)

BADGE (for future: "video" overlay):
  Absolute top-right: camera icon if it's a video (future feature)
  Day 9: photo only, no badge needed

LOADING STATE:
  While blurhash → actual image: blurhash fills the cell
  The transition from blurhash → real image:
  opacity: 0 → 1 (200ms, after image loaded)
  This prevents: sharp instant appearance
  Creates: soft photo "developing" feel

ACCESSIBILITY:
  accessibilityRole: "button"
  accessibilityLabel: image.caption || "Portfolio photo [index+1]"
  accessibilityHint: "Tap to view full screen"
```

---

## Task 9.11 — PortfolioCaption Component
### Duration: 10 minutes
### File: `src/components/worker/PortfolioCaption.tsx`

```
PURPOSE:
  Displays caption text below a portfolio image in ImageViewer.
  Separate component because: captions need special formatting,
  may include hashtags or work description.

PROPS:
  caption:      string | null
  imageIndex:   number (for "3 / 12" counter reference)
  style:        ViewStyle

VISUAL:
  Position: absolute, bottom 0, full width
  BG: linear gradient (transparent → rgba(0,0,0,0.7))
  Gradient direction: top to bottom
  Padding: 20px horizontal, 12px vertical
  Allows: tap-through to ImageViewer close gesture (pass through events)

  CAPTION TEXT (if caption exists):
    Plus Jakarta Regular 13px white (80% opacity)
    numberOfLines: 2
    lineHeight: 18px

  NO CAPTION:
    Container still renders for consistent bottom spacing
    Height still reserved for counter placement

NULL CAPTION:
  If caption === null: return null (no container rendered)
  Space saved in ImageViewer layout
```

---

## Task 9.12 — WorkerPortfolioGrid Component
### Duration: 30 minutes
### File: `src/components/worker/WorkerPortfolioGrid.tsx`

```
PURPOSE:
  3-column photo grid showing worker's past work.
  THE LAST SECTION visible on profile before booking.
  SERIAL POSITION: last = most remembered.
  Portfolio photos = final trust proof before "Book Now".

PROPS:
  images:        WorkerPortfolioImage[]
  workerId:      string
  maxVisible:    number DEFAULT 6 (2 rows of 3)
  onViewAll:     () => void (navigates to full portfolio screen)
  onImagePress:  (images: WorkerPortfolioImage[], startIndex: number) => void
  showHeader:    boolean DEFAULT true
  style:         ViewStyle

DIMENSIONS CALCULATION:
  screenWidth = from useWindowDimensions
  padding = 32 (16px × 2 sides)
  gap = 4px × 2 gaps (3 cells, 2 gaps between)
  cellSize = (screenWidth - padding - 8) / 3
  Result at 375px: (375 - 32 - 8) / 3 = 111.67 ≈ 111px
  This makes each cell square: 111 × 111px

VISUAL SPECIFICATION:

  SECTION HEADER (if showHeader):
    Section component wrapper:
      Left: "Portfolio" — Poppins SemiBold 16px textPrimary
      Right: "View all N →" — Plus Jakarta SemiBold 13px green (hitSlop 12)
      onAction: onViewAll prop

  GRID LAYOUT:
    View: flexDirection 'row', flexWrap 'wrap', gap 4px
    Padding: 16px horizontal (from parent content card)
    Images.slice(0, maxVisible).map() → PortfolioCell per image

    LAYOUT MATH:
      6 cells in 3-col grid:
      Row 1: cell 0, cell 1, cell 2
      Row 2: cell 3, cell 4, cell 5
      Gap between cells: 4px (horizontal AND vertical)
      Total grid width: 3 × 111 + 2 × 4 = 341px (at 375px screen)

  SPECIAL CASE — LAST CELL (when images.length > maxVisible):
    Cell index maxVisible-1 (the 6th cell):
    Overlay: dark scrim (rgba 0,0,0,0.55)
    Center text: "+N" Inter Bold 20px white (N = remaining count)
    Example: photos has 24 images, maxVisible=6: last cell shows "+18"
    Tap last cell: same as "View all" → onViewAll()
    WHY: visual affordance that MORE exists

  LESS THAN 6 IMAGES:
    Show available images only (no empty placeholders)
    Grid may have uneven last row (1 or 2 cells in row 3)
    This is fine — shows "growing portfolio" signal

  EMPTY STATE (no images):
    Don't render section at all (return null)
    Worker with no portfolio: section hidden
    Not "No portfolio added" text

ENTRANCE ANIMATION:
  Trigger: when this section scrolls into viewport
  Each PortfolioCell: opacity 0→1, scale 0.92→1.0
  Stagger: 60ms × cell index (0, 60, 120, 180, 240, 300ms)
  spring-default per cell
  Effect: photos "developing" one by one = satisfying reveal
  PEAK-END: stagger reveal = the END peak of the portfolio section
```

---

## Task 9.13 — GestureLayer + PinchZoomView Components
### Duration: 25 minutes
### Files:
### `src/components/common/GestureLayer.tsx`
### `src/components/common/PinchZoomView.tsx`

```
PURPOSE:
  Extracted gesture handling components for ImageViewer.
  Separation keeps ImageViewer clean and each gesture testable.

  GestureLayer: Composes multiple gesture handlers without conflict
  PinchZoomView: Handles pinch-to-zoom on a single image

GestureLayer:
  FILE: src/components/common/GestureLayer.tsx
  Props:
    onSingleTap: () => void (close viewer)
    onDoubleTap: (x: number, y: number) => void (toggle zoom at point)
    onSwipeDown: (velocity: number) => void (dismiss viewer)
    onSwipeLeft: () => void (next image)
    onSwipeRight: () => void (prev image)
    children: React.ReactNode
    disabled: boolean DEFAULT false (when zoomed: disable swipe)

  IMPLEMENTATION:
    GestureDetector from react-native-gesture-handler
    Composed gestures using Gesture.Simultaneous or Gesture.Race
    TapGesture: single tap detection (150ms max duration)
    DoubleTapGesture: double tap (< 250ms between taps)
    PanGesture: for swipe left/right (horizontal) + swipe down (vertical)
    All gestures in Reanimated worklets (UI thread)

  GESTURE CONFLICT RESOLUTION:
    Swipe horizontal: only when zoom scale === 1.0
    Swipe vertical: only when zoom scale === 1.0
    When zoomed: GestureLayer.disabled = true
    PinchZoomView: handles pan when zoomed in

PinchZoomView:
  FILE: src/components/common/PinchZoomView.tsx
  Props:
    children: React.ReactNode
    minScale: number DEFAULT 1.0
    maxScale: number DEFAULT 4.0
    onZoomChange: (scale: number) => void (parent knows zoom level)
    style: ViewStyle

  SHARED VALUES:
    scale: SharedValue<number> (current zoom level)
    translateX: SharedValue<number> (pan offset when zoomed)
    translateY: SharedValue<number>
    savedScale: SharedValue<number> (scale at gesture start)

  PINCH GESTURE:
    PinchGestureHandler
    onStart: save current scale
    onChange: scale = savedScale × pinchEvent.scale (clamped to min/max)
    onEnd: spring back to min if < 1.0 (rubber band)

  DOUBLE TAP ZOOM (called by parent GestureLayer):
    If scale === 1.0: zoom to 2.5× centered on tap point
    If scale > 1.0: spring back to 1.0, center position
    withSpring(targetScale, springConfig.default)
    Center point: offset translateX/Y to zoom toward tap coords

  BOUNDARY CLAMPING (when zoomed):
    Image edges cannot go past screen edges
    calculateBoundary(): constrains translateX and translateY
    Called after every pan update
    Prevents: panning image completely off screen
```

---

## Task 9.14 — SwipeGallery Component
### Duration: 20 minutes
### File: `src/components/common/SwipeGallery.tsx`

```
PURPOSE:
  Manages the horizontal swipe-between-images behavior in ImageViewer.
  Separate from ImageViewer for clean separation of concerns.
  Handles: current index, swipe physics, transition animations.

PROPS:
  images:         WorkerPortfolioImage[]
  initialIndex:   number DEFAULT 0
  onIndexChange:  (index: number) => void (parent knows current image)
  onDismiss:      () => void (swipe down dismiss)
  renderItem:     (image, index) => React.ReactNode
  style:          ViewStyle

IMPLEMENTATION:

  SHARED VALUES:
    currentIndex: SharedValue<number>
    translateX: SharedValue<number> (horizontal position)
    dragX: SharedValue<number> (during swipe gesture)

  LAYOUT:
    Animated.View: flexDirection row
    Each image: width = screenWidth (side by side, off screen)
    Current: translateX = -currentIndex × screenWidth
    Swiping: translateX = base + dragX

  SWIPE GESTURE:
    PanGestureHandler (horizontal)
    During swipe: translateX follows finger
    Resistance at edges (first/last image):
      Beyond edge: translateX = edge ± (overscroll × 0.3)
      Feels: elastic resistance, can't go further
    Release:
      velocity > 400 → advance to next/prev:
        withSpring(-nextIndex × screenWidth, springConfig.gentle)
      velocity < 400 AND translateX offset > screenWidth/3:
        advance (slow but deliberate swipe)
      else: spring back to current index
        withSpring(-currentIndex × screenWidth, springConfig.bouncy)
        The bounce back = "nope, not quite enough" feel

  TRANSITION:
    No fade between images (sliding = spatial relationship maintained)
    JAKOB'S LAW: slide between photos = iOS Photos, Instagram
    Users expect: left = previous, right = next
    Maintain that spatial metaphor consistently

  ON INDEX CHANGE:
    Call onIndexChange(newIndex) → parent updates counter display
```

---

## Task 9.15 — ImageCounter Component
### Duration: 10 minutes
### File: `src/components/common/ImageCounter.tsx`

```
PURPOSE:
  "3 / 12" counter displayed at top of ImageViewer.
  Separate component because: it animates independently.

PROPS:
  current:    number (1-based display)
  total:      number
  style:      ViewStyle

VISUAL:
  "3 / 12" — Inter Medium 14px white
  Position: absolute top center in ImageViewer
  marginTop: safeAreaTop + 12px
  BG: rgba(0,0,0,0.4) pill (subtle bg for readability)
  Padding: 4px 12px, radius pill
  Shadow: text shadow 0 1px 3px rgba(0,0,0,0.5)

ANIMATION ON INDEX CHANGE:
  Old text: opacity 1→0, translateY 0→-8 (100ms)
  New text: opacity 0→1, translateY +8→0 (100ms, 50ms delay)
  Cross-fade with slight roll (number appears to roll up/down)
  MICRO-INTENTION: "Counter is updating, current position is changing"

ACCESSIBILITY:
  accessibilityLabel: "Photo [current] of [total]"
  accessibilityLiveRegion: "polite"
  (Screen reader announces when counter changes)
```

---

## Task 9.16 — ImageViewer Component
### Duration: 40 minutes
### File: `src/components/common/ImageViewer.tsx`

```
PURPOSE:
  Full-screen image viewer with zoom, swipe, dismiss.
  Composes: GestureLayer + PinchZoomView + SwipeGallery + ImageCounter + PortfolioCaption

WHERE USED:
  WorkerPortfolioGrid (Day 9) — worker photos
  Worker portfolio screen (Day 9) — full portfolio
  Future: Chat attachments (Day 18), booking photos (Day 19)
  One component, all image-viewing contexts.

PROPS:
  images:        WorkerPortfolioImage[]
  initialIndex:  number DEFAULT 0
  isVisible:     boolean
  onClose:       () => void
  style:         ViewStyle

VISUAL SPECIFICATION:

  OUTER CONTAINER:
    Modal-like: fills entire screen
    BG: #000000 (pure black, cinematic)
    Position: absolute, fills screen (or as React Native Modal)
    StatusBar: hidden during viewer
    SafeAreaEdges: 'left' and 'right' only
      (image fills top/bottom to screen edges)

  LAYERS (z-index stacking):
    Layer 1 (back): SwipeGallery (full-screen image carousel)
    Layer 2 (on top): GestureLayer (captures all taps/swipes)
    Layer 3 (top): ImageCounter (absolute top center)
    Layer 4 (top): Close button (absolute top-left OR none — tap anywhere)
    Layer 5 (bottom): PortfolioCaption (absolute bottom)

  SWIPEGALLERY RENDERS:
    Per image: PinchZoomView wrapping expo-image
    expo-image fills screen: contentFit 'contain' (show full image)
    BG: #000000 (letterbox for non-square images)
    Blurhash placeholder while loading full resolution

ENTRANCE ANIMATION:
  isVisible goes false→true:
    BG opacity: 0→1 (timingConfig.normal 250ms)
    Content scale: 0.7→1.0 (spring-gentle)
    StatusBar hides (smooth transition)
  Effect: viewer expands from center of screen
  PEAK-END: this expansion IS the peak moment of photo interaction

EXIT ANIMATIONS:
  1. SWIPE DOWN DISMISS:
    Image: translateY follows drag
    If velocity > 300 OR translateY > screen×0.3:
      Image: continue to fall (spring-stiff) + opacity→0
      BG: opacity→0 (simultaneous)
      Call onClose() when off screen
    Release below threshold: spring back to 0 (spring-bouncy)

  2. TAP TO CLOSE:
    scale 1→0.7 (spring-stiff) + opacity→0 (200ms)
    BG: opacity→0 (200ms)
    Call onClose()

  3. PROGRAMMATIC CLOSE:
    Same as tap-to-close animation

GESTURE CONFLICT MATRIX:
  zoom=1:  SingleTap=close, DoubleTap=zoom in, HorizSwipe=next/prev, VertSwipe=dismiss
  zoom>1:  SingleTap=nothing, DoubleTap=zoom out, HorizSwipe=pan, VertSwipe=pan
  GestureLayer.disabled when zoomed (disables swipe nav)
  PinchZoomView.onZoomChange: parent updates zoom state → GestureLayer.disabled

ZOOM STATE COORDINATION:
  isZoomed: useState in ImageViewer
  When PinchZoomView reports scale > 1.1: setIsZoomed(true)
  When scale returns to 1.0: setIsZoomed(false)
  isZoomed → GestureLayer disabled prop

PERFORMANCE:
  Only render 3 images at a time: current, prev, next
  Images outside window: unmount (memory management)
  expo-image: priority 'high' for current image
  expo-image: priority 'low' for adjacent images

ACCESSIBILITY:
  accessibilityViewIsModal: true
  Escape (if keyboard): close viewer
  Back gesture: close viewer
```

---

## Task 9.17 — useWorkerReviews + useWorkerPortfolio Hooks
### Duration: 20 minutes
### Files:
### `src/hooks/useWorkerReviews.ts`
### `src/hooks/useWorkerPortfolio.ts`

```
FILE: src/hooks/useWorkerReviews.ts

PURPOSE: Paginated reviews with infinite scroll

PARAMS:
  workerId: string
  sortBy: ReviewSortOption DEFAULT 'recent'

RETURNS:
  reviews: WorkerReview[] (flattened from all pages)
  summary: ReviewSummaryData | undefined (from first page header)
  total: number
  isLoading: boolean
  isLoadingMore: boolean
  hasNextPage: boolean
  loadMore: () => void
  refetch: () => void

INTERNALS:
  useInfiniteQuery({
    queryKey: ['worker', workerId, 'reviews', sortBy],
    queryFn: ({ pageParam }) =>
      workerApi.getWorkerReviews(workerId, { page: pageParam, limit: 10, sortBy }),
    initialPageParam: 1,
    getNextPageParam: lastPage => lastPage.hasMore ? lastPage.page + 1 : undefined,
    staleTime: 60_000, (1 minute — reviews are relatively fresh)
  })
  reviews: data?.pages.flatMap(p => p.reviews) ?? []
  summary: data?.pages[0]?.summary (summary in first page response)

SORT CHANGE:
  When sortBy changes: queryKey changes → new fetch
  Cached separately per sortBy value

API ADDITIONS NEEDED in worker.api.ts:
  getWorkerReviews(workerId, params: { page, limit, sortBy }):
    GET /workers/:id/reviews
    Returns: { reviews, summary, total, page, hasMore }

FILE: src/hooks/useWorkerPortfolio.ts

PURPOSE: Fetches all portfolio images for a worker

PARAMS: workerId: string

RETURNS:
  images: WorkerPortfolioImage[]
  isLoading: boolean
  isError: boolean
  refetch: () => void

INTERNALS:
  useQuery({
    queryKey: ['worker', workerId, 'portfolio'],
    queryFn: () => workerApi.getWorkerPortfolio(workerId),
    staleTime: 300_000, (5 minutes — portfolio changes rarely)
  })

API ADDITIONS NEEDED in worker.api.ts:
  getWorkerPortfolio(workerId):
    GET /workers/:id/portfolio
    Returns: WorkerPortfolioImage[] (sorted by order field)
```

---

## Task 9.18 — Worker Profile Screen COMPLETE
### Duration: 30 minutes
### File: `app/worker/[id].tsx` (COMPLETING Day 8's partial)

```
ADDS TO DAY 8'S EXISTING STRUCTURE:

  DATA HOOKS (add to existing):
    const { reviews: previewReviews, summary } = useWorkerReviews(id) (first 3 only)
    const { images: portfolioImages } = useWorkerPortfolio(id)
    const [viewerVisible, setViewerVisible] = useState(false)
    const [viewerStartIndex, setViewerStartIndex] = useState(0)

  REPLACE PLACEHOLDER:
    Remove: 400px placeholder View (from Day 8)
    Add these sections in order after WorkerServicesSection:

  [SectionDivider] (marginV 8px)

  [WorkerPortfolioGrid]:
    images: portfolioImages.slice(0, 6)
    maxVisible: 6
    onViewAll: () => router.push(`/worker/${id}/portfolio`)
    onImagePress: (images, index) => {
      setViewerStartIndex(index)
      setViewerVisible(true)
    }
    showHeader: true

  [SectionDivider] (marginV 8px)

  [ReviewSummary]:
    summary: summary from useWorkerReviews
    onViewAll: () => router.push(`/worker/${id}/reviews`)
    Triggered by scroll position (scrollY tracking from Day 8)

  [First 3 ReviewCards]:
    previewReviews.slice(0, 3).map(review => ReviewCard)
    showReply: true
    maxCommentLines: 3

  ["See all N reviews →" link]:
    Only if total > 3
    Plus Jakarta SemiBold 14px green
    Margin top 8px, margin bottom 8px
    hitSlop 12px (Fitts')
    onPress: router.push(`/worker/${id}/reviews`)

  [100px bottom padding View] (space for sticky footer)

  ImageViewer (outside ScrollView, fullscreen overlay):
    images: portfolioImages
    initialIndex: viewerStartIndex
    isVisible: viewerVisible
    onClose: () => setViewerVisible(false)

SCROLL-INTO-VIEW TRACKING FOR REVIEWS:
  onLayout on ReviewSummary: capture Y position
  In parent onScroll handler (Day 8's scrollY worklet):
    runOnJS(() => {
      if (scrollY.value > reviewSummaryY && !summaryAnimated) {
        setSummaryAnimated(true)
      }
    })
  Pass animated={summaryAnimated} to ReviewSummary

STATUS BAR + IMAGE VIEWER:
  When ImageViewer opens: StatusBar → hidden
  When closes: StatusBar → 'light-content' (or dark per scroll position)
```

---

## Task 9.19 — Worker Reviews Screen
### Duration: 20 minutes
### File: `app/worker/[id]/reviews.tsx`

```
ROUTE PARAM: id (worker ID from parent route)

DATA:
  const { reviews, summary, total, isLoading, isLoadingMore,
          hasNextPage, loadMore } = useWorkerReviews(id)
  const { worker } = useWorkerProfile(id)

SCREEN BG: colors.bgApp (#FAFAFA)

LAYOUT:

  CUSTOM HEADER (sticky, does not scroll):
    ← back IconButton
    "Reviews" Poppins Bold 22px textPrimary center
    Right: sort options trigger (three lines icon, opens sort ActionSheet)
    BG: bgCard, shadow-sm

  STICKY REVIEW SUMMARY (below header, stays visible while scrolling):
    ReviewSummary compact=true (minimal height)
    BG: bgCard (appears solid against scrolling content)
    Shadow: shadows.sm (separates from scrolling list)

  SORT OPTIONS (via ActionSheet on sort icon tap):
    "Most recent" (default)
    "Highest rated"
    "Lowest rated"
    "Verified purchases only"
    ActionSheet from Day 6

  FLASHLIST (main content, scrolls under sticky summary):
    data: reviews
    renderItem: ReviewCard (showWorkInfo=true, showReply=true)
    keyExtractor: review.id
    estimatedItemSize: 140
    onEndReachedThreshold: 0.6
    onEndReached: loadMore
    ItemSeparatorComponent: 8px gap (not divider, cards have own shadow)

    ListEmptyComponent:
      isLoading: 3 × SkeletonReviewCard
      no reviews: EmptyState "No reviews yet"

    ListFooterComponent:
      isLoadingMore: 2 × SkeletonReviewCard (at bottom)
      !hasNextPage && reviews.length > 0:
        "All [total] reviews shown" Jakarta Regular 13px muted centered

  PULL-TO-REFRESH:
    RefreshControl with green tint (from Day 5 CustomRefreshControl)
    onRefresh: refetch() from hook

MICRO-INTENTIONS:
  Sort change: list cross-fades to new order
  Load more: seamless — new cards appear at bottom
  ReviewCard expand: spring height animation per card
```

---

## Task 9.20 — Worker Portfolio Screen
### Duration: 15 minutes
### File: `app/worker/[id]/portfolio.tsx`

```
ROUTE PARAM: id (worker ID)

DATA:
  const { images, isLoading } = useWorkerPortfolio(id)
  const [viewerVisible, setViewerVisible] = useState(false)
  const [viewerStartIndex, setViewerStartIndex] = useState(0)

SCREEN BG: colors.bgApp (#FAFAFA)

LAYOUT:

  CUSTOM HEADER:
    ← back IconButton
    "[Name]'s Work" Poppins Bold 22px textPrimary center
    Image count: "24 photos" Inter Regular 13px textMuted (right)
    BG: bgCard

  FLASHLIST (full-screen grid):
    numColumns: 3
    data: images
    renderItem: PortfolioCell (size from calculation, onPress → open viewer)
    keyExtractor: image.id
    contentContainerStyle: padding 4px
    ItemSeparatorComponent: null (gap handled by cell layout)

    Cell layout with numColumns=3:
      Each cell: self-contained width calculation
      Or: FlatList with columnWrapperStyle gap: 4px

    Loading: SkeletonPortfolioGrid (3×4 grid, placeholder cells)
    Empty: "No portfolio photos yet" centered

  ImageViewer:
    images: all images
    initialIndex: viewerStartIndex
    isVisible: viewerVisible
    onClose: () => setViewerVisible(false)

PHILOSOPHY:
  Simple, clean, minimal UI.
  The IMAGES are the content.
  UI exists only to: navigate back, count photos, open viewer.
  Nothing else should compete for attention.
  HICK'S LAW: fewer UI elements = more focus on images
```

---

## Task 9.21 — Skeleton Components (4 Files)
### Duration: 15 minutes

```
FILE 1: src/components/ui/Skeleton/SkeletonReviewSummary.tsx
  Matches ReviewSummary layout
  Large number block: Skeleton 60×36px centered
  Stars row: 5 × Skeleton 20×20px in row
  4 bar rows: each = label 80×13 + bar flex 1 height 6 + score 30×13

FILE 2: src/components/ui/Skeleton/SkeletonReviewCard.tsx
  Matches ReviewCard: ~120px height
  Top: 40px circle + name 120×13 + date 50×11
  Stars: 5 × 16px circles in row
  3 text lines: 300×13, 280×13, 200×13 (varying widths)
  Uses Skeleton base shimmer

FILE 3: src/components/ui/Skeleton/SkeletonPortfolioGrid.tsx
  6 cells (2 rows × 3 columns)
  Each: 111×111px, radius sm, Skeleton shimmer
  Gap: 4px between all cells
  Matches exact WorkerPortfolioGrid layout

FILE 4: src/components/ui/Skeleton/SkeletonWorkerProfile.tsx
  Composite skeleton for full profile loading state
  Combines: SkeletonWorkerProfileHero + SkeletonWorkerStats +
            SkeletonWorkerBio + SkeletonWorkerSkillList +
            SkeletonReviewSummary (4 bars)
  Used when: navigating to profile and NO cache exists
```

---

## Task 9.22 — Integration Test
### Duration: 20 minutes

```
WORKER PROFILE (COMPLETE):
  □ Profile loads with hero (Day 8 still working)
  □ Scroll animation still working (avatar morph to compact header)
  □ Stats count-up triggers on scroll (Day 8 component)
  □ Services section renders (Day 8)
  □ WorkerSocialProof: "Trusted by N+ customers in [City]"
  □ SectionDivider between Services and Portfolio
  □ WorkerPortfolioGrid: 6 photos in 3-col grid
  □ "+N" overlay on 6th cell when more than 6 photos exist
  □ Portfolio cell tap: ImageViewer opens at correct index
  □ SectionDivider between Portfolio and Reviews
  □ ReviewSummary: appears on scroll
  □ ReviewSummary: bars animate in (stagger 80ms each)
  □ ReviewSummary: bars do NOT re-animate on second view
  □ 3 ReviewCards below summary
  □ ReviewCard: comment truncates at 3 lines
  □ ReviewCard: "Read more" expands with spring animation
  □ ReviewCard: worker reply shows below comment
  □ ReviewReplyBubble: green left border, correct typography
  □ "See all N reviews →" link visible (if N > 3)
  □ StickyFooter: ALWAYS visible at all scroll positions

IMAGEVIEWER:
  □ Opens on portfolio cell tap: scale-up entrance animation
  □ Counter shows correct "1 / 6" format
  □ Swipe left: advances to next image
  □ Swipe right: returns to previous image
  □ At first image: swipe right = elastic resistance
  □ At last image: swipe left = elastic resistance
  □ Pinch to zoom: image zooms up to 4×
  □ Double tap: toggles 1× ↔ 2.5× zoom
  □ Pan when zoomed: moves zoomed image within bounds
  □ Horizontal swipe DISABLED when zoomed
  □ Single tap (when zoom=1): closes viewer
  □ Swipe down (when zoom=1): dismisses with fall animation
  □ BG fades out on all close methods
  □ Caption shows below image (if image has caption)
  □ StatusBar hidden while viewer open
  □ StatusBar restored on close

REVIEWS SCREEN:
  □ Navigates from "See all →" on profile
  □ ReviewSummary compact at top (sticky while scrolling)
  □ Full list of ReviewCards loads
  □ Infinite scroll: loads more at 80% threshold
  □ Sort ActionSheet: opens on sort icon tap
  □ Sort change: list refreshes with new order
  □ Pull-to-refresh: works with green spinner

PORTFOLIO SCREEN:
  □ Navigates from "View all →" on profile
  □ All portfolio images in 3-col grid
  □ Image tap: ImageViewer opens at correct index
  □ Back navigation returns correctly

PERFORMANCE:
  □ Profile: all new sections render in < 200ms (from cache)
  □ Portfolio images: blurhash placeholders while loading
  □ ReviewCard stagger: 60fps on Android emulator
  □ ImageViewer swipe: 60fps (gesture on UI thread)
  □ ReviewSummary bars: smooth 60fps fill animation
  □ ImageViewer zoom: no dropped frames on mid-range Android

CODE QUALITY:
  □ tsc --noEmit: zero errors across all Day 9 files
  □ eslint: zero warnings
  □ All numbers: Inter (ratings, counts, dates)
  □ All person names: Poppins (reviewer names, worker names)
  □ All body text: Plus Jakarta Sans
  □ No hardcoded colors, sizes, or font names
```

---

## Day 9 — Complete New File List

```
NEW FILES (25 total):

  TYPES:
    src/types/review.types.ts

  REVIEW COMPONENTS:
    src/components/review/ReviewStarRow.tsx
    src/components/review/ReviewMetaRow.tsx
    src/components/review/RatingBarRow.tsx
    src/components/review/ReviewSummary.tsx           ← PEAK component
    src/components/review/ReviewCard.tsx
    src/components/review/ReviewReplyBubble.tsx

  UI COMPONENTS:
    src/components/ui/Divider/SectionDivider.tsx
    src/components/ui/Divider/index.ts

  WORKER COMPONENTS:
    src/components/worker/WorkerSocialProof.tsx
    src/components/worker/PortfolioCell.tsx
    src/components/worker/PortfolioCaption.tsx
    src/components/worker/WorkerPortfolioGrid.tsx

  COMMON COMPONENTS:
    src/components/common/GestureLayer.tsx
    src/components/common/PinchZoomView.tsx
    src/components/common/SwipeGallery.tsx
    src/components/common/ImageCounter.tsx
    src/components/common/ImageViewer.tsx              ← Most complex Day 9

  SKELETON COMPONENTS:
    src/components/ui/Skeleton/SkeletonReviewSummary.tsx
    src/components/ui/Skeleton/SkeletonReviewCard.tsx
    src/components/ui/Skeleton/SkeletonPortfolioGrid.tsx
    src/components/ui/Skeleton/SkeletonWorkerProfile.tsx

  HOOKS:
    src/hooks/useWorkerReviews.ts
    src/hooks/useWorkerPortfolio.ts

UPDATED FILES:
  app/worker/[id].tsx              ← COMPLETE (adds portfolio + reviews)
  src/services/api/worker.api.ts   ← Add getWorkerReviews, getWorkerPortfolio
  src/types/worker.types.ts        ← Add WorkerReview, WorkerPortfolioImage
  src/components/ui/Skeleton/index.ts ← Add 4 new skeleton exports

SCREENS:
  app/worker/[id].tsx              ← PRODUCTION COMPLETE
  app/worker/[id]/reviews.tsx      ← PRODUCTION COMPLETE
  app/worker/[id]/portfolio.tsx    ← PRODUCTION COMPLETE

TOTAL NEW FILES: 25
TOTAL UPDATED: 4
TOTAL SCREENS COMPLETE: 3 (profile, reviews, portfolio)
```

---

## Day 9 — Micro-Interactions Complete Catalog

```
COMPONENT              INTERACTION                INTENTION               LAW

ReviewStarRow          Display only               "Stable credibility"    Recognition
                       (static stars)             "This is their rating"

RatingBarRow           Scroll into view:          "Evidence being         Peak-End
                       fill 0→value (spring-gentle) revealed for you"
                       80ms stagger per bar        "Sequential proof"      Serial Pos

ReviewSummary          Bars animate once only:    "I show once, I'm      Peak-End
                       (hasAnimated guard)         confident in my data"
                       "See all" tap → navigate   "124 people = scale"   Goal Grad

ReviewCard             Comment expand:            "Opening to details"    Peak-End
                       spring-gentle height
                       "Read more" cross-fade     "UI updating cleanly"
                       Haptic selectionAsync      "Acknowledged"          Jakob's

WorkerPortfolioGrid    Cell stagger entrance:     "Photos developing"     Peak-End
                       scale 0.92→1.0 per cell    "One by one reveal"     Serial Pos
                       60ms per cell delay
                       Last cell "+N" overlay     "More exists here"     Recognition

PortfolioCell          PressIn: scale 0.95        "Acknowledging tap"     Jakob's
                       PressOut: scale 1.0        "Action confirmed"
                       Haptic: selectionAsync
                       Blurhash → image fade      "Photo developing"

ImageViewer            Open: scale 0.7→1.0 +      "World expanding"       Peak-End
                       bg opacity 0→1             "Entering full view"
                       First image fade in        "Photo presenting itself"

SwipeGallery           Swipe: translateX follows  "Images in space"       Jakob's
                       Release advance:           "Moving to next"
                       spring-gentle snap
                       Release spring-back:       "Not quite enough"
                       spring-bouncy return

PinchZoomView          Pinch out: scale grows     "Zooming in"            Jakob's
                       Double tap zoom: spring    "Toggle zoom"
                       Zoom boundary clamp        "Can't go further"
                       Spring-back if < 1.0       "Minimum maintained"

ImageViewer close      Single tap: scale→0.7 +    "Closing decisively"    Peak-End
                       opacity→0
                       Swipe down: falls away     "Letting go"
                       Both: bg fades out         "World returning"

ImageCounter           Index change:              "Position updating"     Serial Pos
                       number rolls up/down        "Current location"
                       100ms cross-fade

ReviewStarRow          No interaction             "Stable display"        —
(display only)

WorkerSocialProof      No animation               "Stable social proof"   Recognition
                       (fact, not dynamic)

SectionDivider         No animation               "Visual breathing room" Fitts'
```

---

## Day 9 — Typography Final Audit

```
VERIFY EVERY ELEMENT — COMMON MISTAKES TO CATCH:

✅ ReviewSummary "4.9" number: Inter Bold 36px (NUMBER = Inter, not Poppins)
✅ Review count "(124)": Jakarta Regular (not Inter — it's in a phrase)
   → Actually: depends on display context
   → In "124 reviews" sentence: whole sentence = Jakarta
   → Standalone number badge: Inter
   → Here: "(124 reviews)" — parenthetical phrase = Jakarta is fine

✅ ReviewMetaRow date "Jan 16": Inter Regular 11px (date = data = Inter)
✅ ReviewMetaRow name "Ali Hassan": Poppins SemiBold 14px (person name = Poppins)
✅ RatingBarRow score "4.8": Inter Medium 13px (NUMBER = Inter)
✅ RatingBarRow label "Punctuality": Jakarta Regular 13px
✅ ReviewReplyBubble "Reply from Ahmed:": Poppins SemiBold 12px (name = Poppins)
✅ ReviewReplyBubble body: Jakarta Regular 13px
✅ ReviewReplyBubble date: Inter Regular 10px (date = Inter)
✅ ImageCounter "3 / 12": Inter Medium 14px (numbers = Inter)
✅ Portfolio section header "Portfolio": Poppins SemiBold 16px
✅ "View all 24 photos →": Jakarta SemiBold 14px green (action text = Jakarta)
✅ Review comment text: Jakarta Regular 14px (body = Jakarta)
✅ "Read more" toggle: Jakarta SemiBold 13px green (UI action = Jakarta)
✅ Reviews screen title "Reviews": Poppins Bold 22px (screen title = Poppins)
✅ Portfolio screen title "[Name]'s Work": Poppins Bold 22px
✅ PortfolioCaption: Jakarta Regular 13px white (caption text = Jakarta)
✅ WorkerSocialProof numbers: Inter SemiBold 14px
✅ WorkerSocialProof body: Jakarta Regular 14px
✅ Section headers all: Poppins SemiBold 16px
```

---

## Day 9 — UX Laws Final Audit

```
RECOGNITION OVER RECALL:
  ✅ ReviewSummary: ⭐ 4.9 = Amazon/Google pattern = instant reading
  ✅ ReviewCard: avatar + stars + comment = universal review format
  ✅ Portfolio 3-col grid: Instagram/Pinterest pattern = instant context
  ✅ ImageViewer: iOS Photos behavior = zero learning curve
  ✅ RatingBarRow: horizontal fill bar = progress bar = universal
  ✅ "Read more" link: universal text expand pattern

FITTS' LAW:
  ✅ PortfolioCell: 111×111px = very large tap target for a photo
  ✅ ImageViewer close: entire screen tap = maximum target
  ✅ Swipe gallery: full-screen horizontal swipe = arm-width target
  ✅ "See all reviews →": hitSlop 12px (small text, extended target)
  ✅ ReviewCard expand: entire card tappable (not just "Read more" text)
  ✅ Back buttons: 44×44px minimum

HICK'S LAW:
  ✅ Profile shows max 6 portfolio photos (not all)
  ✅ Profile shows max 3 reviews (not all)
  ✅ ImageViewer: gesture-only, no buttons cluttering view
  ✅ RatingBarRow: exactly 4 breakdown categories
  ✅ ReviewCard: max 3 lines comment (expand = opt-in)

JAKOB'S LAW:
  ✅ Review format: Amazon/Airbnb/Yelp review card pattern
  ✅ Portfolio 3-col: Instagram/Pinterest grid
  ✅ ImageViewer: iOS Photos (swipe/pinch/swipe-down = universal)
  ✅ Pull-to-refresh on reviews screen: universal mobile
  ✅ ReviewSummary layout: Airbnb/Amazon rating breakdown

PEAK-END RULE:
  ✅ PEAK 1: ReviewSummary bars animate in (sequential reveal)
  ✅ PEAK 2: ImageViewer opens (photo expands to full screen)
  ✅ PEAK 3: Portfolio stagger (6 photos appearing sequentially)
  ✅ END: Portfolio LAST section = most memorable final impression
  ✅ END: "Book Now" sticky footer ALWAYS after portfolio = positive end
  ✅ All three peaks = visual, emotional, motion-based

GOAL GRADIENT EFFECT:
  ✅ "124 reviews" count: scale of trust = goal achievable at scale
  ✅ StickyFooter always visible: goal (booking) always reachable
  ✅ Portfolio quality = goal (quality work) is predictable
  ✅ "See all 124 →": clicking = exploring more proof = near goal
  ✅ Price in services (Day 8) already visible: financial goal clear

SERIAL POSITION EFFECT:
  ✅ Portfolio LAST section: most remembered final visual impression
  ✅ Punctuality FIRST in rating breakdown: most important concern
  ✅ ReviewSummary BEFORE individual cards: overview → detail
  ✅ "Book Now" ALWAYS last visible element: most acted upon
  ✅ ReviewCard: reviewer name first, stars second, comment third
  ✅ 5★ reviews first in list: best case first = positive impression
```

---

## What Day 10 Gets From Day 9

```
AFTER DAY 9, THE FOLLOWING ARE COMPLETE:

  WORKER PROFILE: FULLY PRODUCTION COMPLETE
    → Hero with scroll animation (Day 8)
    → Stats with count-up animation (Day 8)
    → Availability, bio, skills, services (Day 8)
    → WorkerSocialProof (Day 9)
    → Portfolio grid with ImageViewer (Day 9)
    → ReviewSummary with animated bars (Day 9)
    → ReviewCards with reply bubbles (Day 9)
    → Sticky footer always visible (Day 8)
    → All skeleton states (Days 8–9)

  REVIEW SYSTEM:
    → Worker reviews screen with infinite scroll
    → Sort options via ActionSheet
    → ReviewCard expand/collapse animation
    → ReviewReplyBubble for worker responses

  PORTFOLIO SYSTEM:
    → Worker portfolio screen (full grid)
    → ImageViewer (full-screen, pinch, swipe, dismiss)
    → PortfolioCell, PortfolioCaption components
    → GestureLayer, PinchZoomView, SwipeGallery (reusable)

  REUSABLE FOR DAY 10+:
    → ImageViewer: Chat attachments (Day 18), dispute photos (Day 19)
    → ReviewCard: User's own review submission (Day 15 reviews screen)
    → ReviewSummary: Search results summary cards
    → SectionDivider: Settings screen (Day 17), Booking detail (Day 14)
    → WorkerSocialProof: Worker cards in map view (Day 12)

  DAY 10 WILL BUILD:
    → cart.store.ts finalization (global state)
    → useCart hook with conflict detection
    → CartItem component (swipe-to-delete)
    → CartSummary component (animated total)
    → CartBadge component (tab bar + headers)
    → WorkerConflictModal
    → AddToCartButton wired to global cart.store
    → Cart screen COMPLETE
    → Full path: Discover → Profile → Add to Cart is NOW complete
    → Day 11 begins booking flow (the most complex feature)
```

---

*Tasklync — Day 9 Implementation Plan*
*25 new files. 4 updated files. 3 production screens.*
*Worker Profile COMPLETE · Reviews Screen · Portfolio Screen*
*ReviewSummary animated bars = PEAK of Day 9 = trust engineering at its finest*
*ImageViewer pinch/zoom/swipe = gallery UX matched to iOS Photos standard*
*Portfolio LAST section = serial position psychology for maximum conversion*
*Every micro-interaction mapped. Every UX law applied precisely.*
*Fonts: Poppins (names/titles/CTAs) · Jakarta (body/UI) · Inter (ALL numbers)*
*Ahesta ahesta — 60-day build, Day 9 of 60.*
