# Tasklync — Day 8 Implementation Plan
## Worker Profile: Hero · Stats · Availability · Bio · Skills · Verified Badge · Sticky Footer
### Senior React Native Expo | 25 Years | Pure Implementation Plan — Zero Code

> **Day 8 = Trust engineering.**
> The worker profile is the highest-stakes screen in the app.
> User is deciding: "Can I let this stranger into my home?"
> Every component either builds that trust or breaks it.
> Nothing here is decorative. Every pixel earns its place.

---

## Day 8 Philosophy

```
"A worker profile is not a listing page.
 It's a trust trial.
 The user opens it with one silent question:
 'Should I trust this person with my home?'
 
 Your design must answer: YES.
 And it must answer it VISUALLY, not with words.
 
 Users don't read. They scan.
 In 3 seconds they decide:
   → Photo: is this a real, professional person?
   → Verified badge: does the platform vouch for them?
   → Rating (4.9 / 124 reviews): do many others trust them?
   → Available now: can I book today?
 
 If those 4 signals are clear and strong = conversion.
 If even ONE is unclear or missing = hesitation = lost booking.
 
 Day 8 builds the components that deliver those 4 signals.
 Every component has ONE job. It does that job perfectly."

TRUST ARCHITECTURE (serial position matters):
  1st seen: Hero photo         → "This is a real human"
  2nd seen: Verified badge     → "Platform checked this person"
  3rd seen: Stats (4.9, 340)   → "Many others trusted them"
  4th seen: Available now       → "I can get help today"
  5th seen: Bio                 → "They communicate professionally"
  6th seen: Skills              → "They're qualified for MY task"
  Always visible: Sticky footer → "I can act anytime while reading"
```

---

## Day 8 Prerequisites — Complete Inventory

```
FROM DAYS 1–7 (available immediately, do NOT rebuild):

  DESIGN TOKENS:
    ✅ colors.ts — colors.primary, bgCard, bgSection, bgSuccess, etc.
    ✅ typography.ts — fontFamily.poppins, .jakarta, .inter
    ✅ spacing.ts — layout constants, touch targets
    ✅ animations.ts — springConfig.gentle, bouncy, stiff, snappy
    ✅ shadows.ts — shadows.sm, md, lg, xl, 2xl
    ✅ radius.ts — radius.pill, lg, md, circle

  UI PRIMITIVES:
    ✅ Button.tsx — primary, secondary, ghost, danger, text
    ✅ IconButton.tsx — 44×44 Fitts' Law compliant
    ✅ Text.tsx — 17 variants (Poppins/Jakarta/Inter correctly)
    ✅ Screen.tsx — SafeAreaView wrapper
    ✅ StickyFooter.tsx — bottom CTA placement

  FROM DAY 5:
    ✅ Section.tsx — section wrapper with title + action link
    ✅ OnlineBadge.tsx — animated pulse green dot
    ✅ WorkerAvailabilityBadge.tsx — "Available now" status text
    ✅ NearbyWorkersList.tsx — horizontal worker scroll

  FROM DAY 6:
    ✅ BottomSheet.tsx + BottomSheetHandle.tsx — sheet system
    ✅ ActionSheet.tsx — action list modal
    ✅ Chip.tsx — filter/skill/tag chip
    ✅ ChipGroup.tsx — horizontal scrollable chips

  FROM DAY 7:
    ✅ AccordionItem.tsx — expand/collapse with spring animation
    ✅ ServicePriceTag.tsx — consistent price display
    ✅ ServiceBadge.tsx — Popular/New/Deal badge
    ✅ AddToCartButton.tsx — morph animation (local state)
    ✅ SkeletonServiceListItem.tsx — service loading placeholder

  WORKER TYPES:
    ✅ WorkerPublicProfile type — all fields typed (Day 4)
    ✅ WorkerNearby type — lean card data (Day 4)
    ✅ WorkerSkill type — skill with isVerified flag (Day 4)
    ✅ WorkerServiceOffering type — service + custom price (Day 4)

  WORKER API + HOOKS:
    ✅ worker.api.ts — getWorkerProfile, getWorkerServices (Day 4)
    ✅ useWorkerProfile hook — React Query, 5min stale (Day 4)

  VERIFY BEFORE DAY 8 STARTS:
    □ tsc --noEmit: zero errors on ALL Day 7 files
    □ eslint: zero warnings
    □ Category screen: both tabs load correctly
    □ Service detail: renders with correct layout
    □ BottomSheet: opens/closes smoothly
    □ AccordionItem: expand/collapse spring working
    □ AddToCartButton: morph animation working
```

---

## UX Laws — Day 8 Master Application

```
THE STAKES ARE HIGHEST HERE.
Every UX law must be applied with maximum precision.
A mistake on home screen = user doesn't see a category.
A mistake on worker profile = user doesn't book.
Revenue impact: worker profile conversion = direct money.

┌────────────────────────────────────────────────────────────────────────┐
│  UX LAW              COMPONENT            SPECIFIC APPLICATION         │
├────────────────────────────────────────────────────────────────────────┤
│  RECOGNITION         WorkerProfileHeader  Photo FIRST = instant        │
│  OVER RECALL         (photo first)        human recognition            │
│                                           User SEES who this is.       │
│                                           No recall needed.            │
│                                                                        │
│                      VerifiedBadge        Shield ✓ = RECOGNIZED        │
│                                           Platform verification signal  │
│                                           Users know this from Airbnb, │
│                                           LinkedIn, Uber               │
│                                                                        │
│                      WorkerSkillList      Chip format = RECOGNIZED     │
│                                           "These are their skills"     │
│                                           Same as LinkedIn skills,     │
│                                           Fiverr tags, Toptal          │
│                                                                        │
│                      WorkerStats layout   ⭐ 4.9 · 124 reviews =       │
│                                           RECOGNIZED immediately       │
│                                           Amazon/Yelp/Google pattern   │
│                                           Number format = known        │
├────────────────────────────────────────────────────────────────────────┤
│  FITTS' LAW          WorkerProfileSticky  "Book Now" = RIGHT side       │
│                      Footer               (thumb's final resting zone) │
│                      Both buttons         Each = 50% width × 52px      │
│                                           = massive impossible-to-miss  │
│                                           touch targets                │
│                                                                        │
│                      Share button         44×44px minimum, top-right   │
│                      Back button          44×44px minimum, top-left    │
│                      ⋯ more button        44×44px minimum, top-right   │
│                                                                        │
│                      WorkerBio            "Read more" minimum 44px     │
│                      expand link          tall tap area via hitSlop    │
│                                                                        │
│                      Stats cells          Each cell = 1/3 screen       │
│                                           width × 52px height          │
│                                           = large tap area (taps to    │
│                                           scroll to that section)      │
├────────────────────────────────────────────────────────────────────────┤
│  HICK'S LAW          WorkerProfileSticky  Exactly 2 choices: Chat OR   │
│                      Footer               Book Now.                    │
│                                           Not 3. Not 4. Just 2.        │
│                                           Binary decision = fastest    │
│                                                                        │
│                      WorkerBio            Default 4 lines (collapsed)  │
│                                           = less text = faster scan    │
│                                           Full bio = opt-in for       │
│                                           committed readers            │
│                                                                        │
│                      WorkerSkillList      Max 3 rows of skills shown   │
│                                           "Show N more" for rest       │
│                                           = curated not overwhelming   │
│                                                                        │
│                      MoreOptionsMenu      Max 3 options in ⋯ menu      │
│                                           "Report" | "Block" | "Share" │
├────────────────────────────────────────────────────────────────────────┤
│  JAKOB'S LAW         WorkerProfileHeader  Avatar at bottom-left of     │
│                      scroll behavior      hero = Airbnb/LinkedIn/      │
│                                           Urban Company pattern        │
│                                           Users know this layout       │
│                                                                        │
│                      Hero → white         White content sheet rising   │
│                      content sheet        from below hero = Airbnb     │
│                                           listing page pattern         │
│                                                                        │
│                      Stats 3-column       ⭐ / jobs / response time =  │
│                                           TaskRabbit/Urban Company     │
│                                           worker profile standard      │
│                                                                        │
│                      Sticky footer        Chat + Book Now at bottom =  │
│                      Chat + Book Now      every service marketplace    │
│                                           (Airbnb: "Reserve", "Save") │
├────────────────────────────────────────────────────────────────────────┤
│  PEAK-END RULE       WorkerProfileHeader  Avatar morphing from hero    │
│                      scroll animation     to compact header =          │
│                                           THE PEAK of profile entrance │
│                                           Users remember this moment   │
│                                                                        │
│                      WorkerStats          Count-up animation when      │
│                      count-up             scrolled into view:          │
│                                           0 → 340 jobs = PEAK          │
│                                           Satisfying reveal of scale   │
│                                                                        │
│                      "Book Now" press     Scale 0.97→1.02→1.0 +       │
│                                           haptic medium = conversion   │
│                                           PEAK MOMENT of the profile   │
│                                                                        │
│                      END: StickyFooter   Always visible = positive     │
│                      always visible       end state of every scroll    │
│                                           "I can book anytime"         │
├────────────────────────────────────────────────────────────────────────┤
│  GOAL GRADIENT       StickyFooter         Always visible while reading │
│                      ALWAYS visible       = user never loses sight of  │
│                                           the goal (booking)           │
│                                                                        │
│                      WorkerStats          "340 jobs done" visible =    │
│                      job count            goal was achieved 340× for   │
│                                           others = mine is achievable  │
│                                                                        │
│                      AvailabilityCard     "Available now · Until 6PM"  │
│                                           = time pressure = urgency    │
│                                           = goal is immediately        │
│                                           achievable TODAY             │
│                                                                        │
│                      WorkerServicesRow    Price shown = goal clarity   │
│                                           "I know what this costs"     │
│                                           = removes uncertainty        │
│                                           = booking more likely        │
├────────────────────────────────────────────────────────────────────────┤
│  SERIAL POSITION     WorkerProfileHeader  Photo FIRST in view          │
│                      photo position       = most remembered element    │
│                                           = photo drives trust         │
│                                                                        │
│                      Stats row            FIRST data row after name    │
│                                           = rating seen before bio     │
│                                           = quality signal early       │
│                                                                        │
│                      VerifiedBadge        INLINE with name (serial)    │
│                                           = seen immediately after     │
│                                           recognizing the person       │
│                                                                        │
│                      Sticky Footer        LAST element always visible  │
│                                           = most acted-upon element    │
│                                           (Serial Position Effect:     │
│                                           last = most remembered)      │
│                                                                        │
│                      Bio before skills    Bio = "who they are" first   │
│                      Skills before        Skills = "what they do"      │
│                      services             Services = "what it costs"   │
│                                           Emotional before logical     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Typography — Day 8 Complete Rules

```
WORKER PROFILE HEADER (on dark hero background):
  Worker name:             Poppins Bold 22px #FFFFFF (on dark hero)
  City + category:         Plus Jakarta Sans Regular 14px rgba(255,255,255,0.75)

COMPACT HEADER (on scroll, white background):
  Worker name:             Poppins SemiBold 16px textPrimary
  "Book Now" compact:      Poppins SemiBold (Button enforces)

VERIFIED BADGE:
  "✓ Verified Worker":     Plus Jakarta Sans SemiBold 11px colors.textGreen
  (not Poppins — inline badge = Jakarta territory)

WORKER STATS (3-cell row):
  Numbers (4.9 / 340 / ~8): Inter Bold 20px textPrimary (NUMBERS = Inter)
  Labels (Rating / Jobs / Response Time): Plus Jakarta Sans Regular 11px textMuted

AVAILABILITY CARD:
  Status text "Available now":  Plus Jakarta Sans SemiBold 13px colors.online
  "Until 6:00 PM":              Plus Jakarta Sans Regular 12px textMuted

WORKER BIO:
  Bio body text:              Plus Jakarta Sans Regular 15px textSecondary
  "Read more" / "Show less":  Plus Jakarta Sans SemiBold 14px green

WORKER SKILL LIST:
  Skill chip label:           Plus Jakarta Sans Medium 12px (unverified, muted)
  Verified skill label:       Plus Jakarta Sans SemiBold 12px green

PROFILE CONTENT SECTION HEADERS:
  "About", "Skills", "Services": Poppins SemiBold 16px textPrimary

WORKER SERVICES SECTION:
  Service name:           Plus Jakarta Sans SemiBold 14px textPrimary
  Price:                  Inter SemiBold 15px green (NUMBER = Inter)
  Duration:               Inter Regular 12px textMuted (NUMBER = Inter)

STICKY FOOTER BUTTONS:
  "Chat":                 Poppins SemiBold (Button secondary enforces)
  "Book Now":             Poppins SemiBold (Button primary enforces)

SHARE / MORE MENU:
  Action labels:          Plus Jakarta Sans SemiBold 15px textPrimary
  Danger label ("Block"): Plus Jakarta Sans SemiBold 15px colors.danger

SKELETON COMPONENTS:
  No typography — shimmer rectangles only

KEY RULE FOR DAY 8:
  Every number on this screen uses Inter.
  Rating: Inter. Jobs: Inter. Response time: Inter. Price: Inter.
  Users associate Inter with precise, trustworthy data.
  It signals: "this number is real and accurate."
```

---

## Day 8 — Time Breakdown

```
TOTAL: 8 hours

MORNING SESSION (4h):
  Task 8.1  — ProfileHeroGradient component          15 min
  Task 8.2  — WorkerProfileHeader component          75 min  ← most complex
  Task 8.3  — WorkerCompactHeader component          25 min
  Task 8.4  — VerifiedBadge component                15 min
  Task 8.5  — WorkerStats component                  35 min
  Task 8.6  — WorkerAvailabilityCard component       15 min

AFTERNOON SESSION (4h):
  Task 8.7  — WorkerBio component                   25 min
  Task 8.8  — WorkerSkillList component             25 min
  Task 8.9  — WorkerServicesSection component       30 min
  Task 8.10 — WorkerServiceRow component            20 min
  Task 8.11 — WorkerProfileStickyFooter component   20 min
  Task 8.12 — MoreOptionsMenu component             20 min
  Task 8.13 — SkeletonWorkerProfile component       20 min
  Task 8.14 — Worker profile screen top half        30 min
  Task 8.15 — useWorkerProfile hook (expanded)      20 min
  Task 8.16 — Integration test                      15 min
```

---

## MORNING SESSION — 4 Hours

---

## Task 8.1 — ProfileHeroGradient Component
### Duration: 15 minutes
### File: `src/components/worker/ProfileHeroGradient.tsx`

```
PURPOSE:
  The dark hero background behind the worker's avatar + name.
  Separate component because:
  → It can be photo-based (if worker has cover photo)
  → It can be gradient (default when no cover photo)
  → Day 12: MapView-based (showing worker's service area)
  Extract today = easy to swap implementations later.

PROPS:
  imageUrl:    string | null (worker cover photo)
  height:      number DEFAULT 280 (hero height)
  children:    React.ReactNode (avatar, name, buttons on top)
  style:       ViewStyle

VISUAL SPECIFICATION:

  CASE 1 — No cover photo (default for MVP):
    LinearGradient (expo-linear-gradient):
      Colors: ['#0F172A', '#1E293B'] (top → bottom)
      Direction: top to bottom (start: {0,0}, end: {0,1})
      Height: 280px, full width
    WHY DARK GRADIENT (not green):
      Green hero = overpowering, fights with profile content
      Dark = premium, cinematic = Airbnb listing style
      Content on top: white text readable on dark

  CASE 2 — Has cover photo:
    expo-image filling the hero area
    contentFit: 'cover'
    With overlay: LinearGradient on top
      Colors: ['transparent', 'rgba(0,0,0,0.6)']
      Bottom 50% of hero (so text at bottom is readable)
    RECOGNITION: dark overlay + text on photo = every travel/service app

  CASE 3 — Day 12 enhancement (MapView):
    Not built today
    Placeholder for future: comment in code
    "// TODO Day 12: Replace gradient with MapView showing worker area"

CHILDREN POSITIONING:
  Children rendered via absoluteFill-style positioning
  Header buttons: absolute top, spread across header
  Avatar + name: absolute bottom, left-aligned
  Children are passed in and positioned by parent (not this component)
```

---

## Task 8.2 — WorkerProfileHeader Component
### Duration: 75 minutes
### File: `src/components/worker/WorkerProfileHeader.tsx`

```
MOST COMPLEX COMPONENT OF DAY 8.
Gets the most time for good reason:
  → First thing user sees = highest impact
  → Scroll animation = most technical challenge
  → Avatar morph = the PEAK moment of profile entrance
  → Multiple overlapping concerns: layout + animation + gesture

PURPOSE:
  The hero section that transforms as user scrolls.
  Two states: HERO (full hero visible) + COMPACT (scrolled up).
  Manages smooth transition between both states.

PROPS:
  worker:        WorkerPublicProfile (or WorkerNearby for skeleton)
  scrollY:       Animated.SharedValue<number> (from parent ScrollView)
  onBack:        () => void
  onShare:       () => void
  onMore:        () => void (opens MoreOptionsMenu)
  isLoading:     boolean (shows skeleton)
```

---

### Hero Layout Structure

```
OVERALL STRUCTURE:
  Container height: 280px (ProfileHeroGradient fills this)
  Position: relative (children positioned within)

  LAYER 1 — ProfileHeroGradient:
    Fills 280px (dark gradient or cover photo)

  LAYER 2 — Header buttons row (absolute top):
    Top: safeAreaTop + 12px
    Left: Back IconButton
    Right: Share IconButton + ⋯ More IconButton (gap 8px)
    All buttons: white icon color, transparent bg, shadow
    Why white: readable on dark gradient/photo
    Icon size: 20px
    Touch area: 44×44px each

  LAYER 3 — Avatar + Name (absolute bottom of hero):
    Bottom: 0, Left: 0, padding 16px

    AVATAR (80px circle):
      expo-image, border 3px white, shadow-xl
      BG: white (for initial load state)
      Blurhash placeholder
      Reanimated:
        THIS AVATAR IS THE KEY ANIMATION ELEMENT
        See "Scroll Animation" below

    NAME + CITY (right of avatar OR below on small screens):
      Worker name: Poppins Bold 22px white
      City + Category: Plus Jakarta Sans Regular 14px rgba(white 0.75)
      Both: fade out as hero scrolls away (opacity animation)
```

---

### Scroll Animation Architecture

```
THE AVATAR MORPH (the PEAK animation):

  PROBLEM:
    When user scrolls up, the hero disappears.
    But the avatar should "follow" the user upward,
    shrinking and settling into the compact header.
    This creates spatial continuity: "the same person is above me."

  SOLUTION — Two avatar instances:

    Avatar A (in hero):
      Position: hero bottom-left
      Size: 80px
      Visibility: opacity 1 when scrollY < 80 → 0 when scrollY > 120

    Avatar B (in compact header):
      Position: compact header, left of name
      Size: 36px
      Visibility: opacity 0 when scrollY < 80 → 1 when scrollY > 120

    Effect: Avatar appears to "shrink and rise" into header.
    Technically: two avatars crossfading at different scroll positions.
    Visually: one avatar morphing and moving upward.

  SCROLL VALUES:
    scrollY: SharedValue from parent (Animated.ScrollView onScroll)
    
    HERO OPACITY (everything in hero fades):
      interpolate(scrollY, [0, 150, 200], [1, 0.3, 0])
      Starts fading at 150px scroll, fully gone at 200px

    COMPACT HEADER OPACITY (entire compact header appears):
      interpolate(scrollY, [100, 160], [0, 1])
      Starts appearing at 100px scroll, fully visible at 160px

    AVATAR A OPACITY (large avatar in hero):
      interpolate(scrollY, [60, 120], [1, 0])

    AVATAR B OPACITY (small avatar in compact header):
      interpolate(scrollY, [80, 140], [0, 1])

    COMPACT HEADER TRANSLATEY (slides down from above):
      interpolate(scrollY, [80, 140], [-20, 0])
      Compact header rises in from top (spring-like feel)

  ALL animations use useAnimatedStyle + Reanimated 3 worklets.
  ALL on UI thread. Zero JS thread involvement.
```

---

### Content Card Overlap

```
THE WHITE CONTENT CARD BENEATH:
  In app/worker/[id].tsx:
  After ProfileHeroGradient (280px):
    White content card starts at 256px (overlaps hero by 24px)
    marginTop: -24px on content card
    borderTopLeftRadius: 24px
    borderTopRightRadius: 24px
    backgroundColor: colors.bgCard

  VISUAL EFFECT:
    Content card appears to "slide up" beneath the hero
    Hero darkens and shrinks as card rises
    JAKOB'S LAW: Airbnb listing page = exact same pattern
    Users understand: content is below, hero stays on top while scrolling

  WHY -24px OVERLAP:
    Creates seamless visual continuation (hero → card, no gap)
    The rounded top corners of the card sit on top of hero bottom
    Avatar sits at the junction (straddling hero and card)
```

---

## Task 8.3 — WorkerCompactHeader Component
### Duration: 25 minutes
### File: `src/components/worker/WorkerCompactHeader.tsx`

```
PURPOSE:
  The sticky header that appears when user scrolls past the hero.
  Contains: back button, avatar (small), worker name, compact Book Now.
  Separate from WorkerProfileHeader for clean separation of concerns.

PROPS:
  worker:       WorkerPublicProfile
  scrollY:      Animated.SharedValue<number>
  onBack:       () => void
  onBookNow:    () => void
  opacity:      Animated.SharedValue<number> (controlled by parent)

VISUAL SPECIFICATION:

  Container:
    Position: absolute, top: 0, left: 0, right: 0
    z-index: 10 (above everything)
    BG: colors.bgCard (#FFFFFF)
    Height: safeAreaTop + 56px
    paddingTop: safeAreaTop
    Shadow: shadows.sm (subtle bottom shadow)
    Animated opacity: from parent scrollY interpolation

  INNER ROW (56px, flexDirection row, alignItems center):
    Left: ← back IconButton
          Size: 40px visual, 44px touch
          Margin: 8px from left edge

    Center (flex 1, marginH 8px):
      Avatar: 36px circle (expo-image, borderRadius 18)
      Gap: 8px
      Worker name: Poppins SemiBold 16px textPrimary
      Arrangement: row, alignItems center

    Right: "Book" compact button
      Button variant="primary" size="sm" (32px height)
      Label: "Book" (not "Book Now" — space constrained)
      Width: auto (not full-width)
      marginRight: 16px

ANIMATION:
  Entire component: Animated.View with opacity from parent
  When opacity = 0: pointer-events none (not interactive when invisible)
  When opacity = 1: pointer-events auto (interactive)

  WHY NOT JUST USE OPACITY TOGGLE:
    Gradual opacity = smooth fade in, no jarring appearance
    Immediately interactive at opacity > 0.5
    Pure visual transition = premium feel

STATUS BAR BEHAVIOR:
  When compact header visible (scrollY > 160):
    StatusBar: 'dark-content' (dark header needs dark icons)
  When hero visible (scrollY < 100):
    StatusBar: 'light-content' (dark hero bg needs white icons)
  This transition: managed in parent screen using scrollY listener

MICRO-INTENTION:
  compact header appearing = "I'm following you, always available"
  This persistent availability = continuous GOAL GRADIENT signal
  User reading bio, sees "Book" above = never loses sight of goal
```

---

## Task 8.4 — VerifiedBadge Component
### Duration: 15 minutes
### File: `src/components/worker/VerifiedBadge.tsx`

```
PURPOSE:
  Visual trust signal: "This worker has been verified by Tasklync."
  Used: inline with worker name, standalone in profile, on cards.

PROPS:
  size:         'xs' | 'sm' | 'md' DEFAULT 'sm'
  showLabel:    boolean DEFAULT true
                When false: just the shield icon (for card contexts)
  style:        ViewStyle

VISUAL SPECIFICATION:

  SIZE = 'xs' (worker cards, search results):
    Shield-check icon: 12px colors.primary
    Label: none (showLabel: false typical)
    Use: inline dot-size trust signal on compact cards

  SIZE = 'sm' (worker profile inline with name):
    Container: BG colors.bgSuccess (#F0FDF4)
    Border: 1px colors.primaryBorder (#BBF7D0)
    Border radius: radius.pill
    Padding: 3px 8px
    Row: shield-check icon (12px green) + " Verified Worker"
    Text: Plus Jakarta Sans SemiBold 11px colors.textGreen

  SIZE = 'md' (standalone — separate line in profile):
    Same as sm but:
    Padding: 5px 12px
    Icon: 14px
    Text: Plus Jakarta Sans SemiBold 13px

PLACEMENT IN WORKER PROFILE:
  Inline after worker name on content card
  Appears as: "Ahmed Khan  ✓ Verified Worker"
  The badge is on the SAME ROW as the name
  Name: Poppins Bold 22px (but on white background now, not hero dark)
  Badge: right-aligned or below name depending on name length

WHY INLINE NOT SEPARATE SECTION:
  SERIAL POSITION: badge appears WITH name = trust is about the PERSON
  Separate section = trust is about the platform
  Inline = "Ahmed Khan [who is verified]" = personal trust attribution

RECOGNITION TRIGGER:
  Green shield = universal verification symbol (Airbnb, LinkedIn, Uber)
  Users don't need to read "Verified" — the green shield alone = trust
  showLabel=false version: used where space is tight
  showLabel=true version: used where reinforcement matters (profile)
```

---

## Task 8.5 — WorkerStats Component
### Duration: 35 minutes
### File: `src/components/worker/WorkerStats.tsx`

```
PURPOSE:
  3-column stats card: Rating | Jobs Done | Response Time.
  The data credentials row. Quantified trust signals.

  TRUST LANGUAGE OF STATS:
    "4.9" = "Almost everyone rated them 5 stars"
    "340 jobs" = "Platform-verified experience at scale"
    "~8 min" = "They respond quickly = they're professional"
  
  All three = social proof + experience + reliability.
  These are the STRONGEST trust signals after the photo.

PROPS:
  rating:           number (e.g., 4.9)
  totalReviews:     number (e.g., 124)
  totalJobs:        number (e.g., 340)
  avgResponseMins:  number (e.g., 8)
  isLoading:        boolean (shows skeleton)
  onRatingPress:    () => void (scroll to reviews section)
  style:            ViewStyle

VISUAL SPECIFICATION:

  Container:
    flexDirection: row
    BG: colors.bgSection (#F8F9FA)
    Border radius: radius.md (12px)
    Overflow: hidden (so cell BG fills correctly)
    No shadow (part of page flow, not floating)
    Margin: 16px horizontal (sits within content padding)

  THREE CELLS (flex 1 each, equal width):

    CELL 1 — Rating (tappable → scrolls to reviews):
      Center-aligned content
      Number: Inter Bold 20px textPrimary — "4.9"
      Star row: 3 ⭐ (14px each, gold, inline below number)
                Why 3 stars, not 5? Space. And 3 communicates "high"
      Label: "Rating" — Plus Jakarta Sans Regular 11px textMuted
      Border right: 1px colors.border
      Padding: 14px vertical
      Pressable (entire cell): navigates to reviews section

    CELL 2 — Jobs (center-aligned):
      Number: Inter Bold 20px textPrimary — "340"
      Unit: "jobs" — Plus Jakarta Sans Regular 11px textMuted (inline)
      Label: "Completed" — Plus Jakarta Sans Regular 11px textMuted
      Border right: 1px colors.border

    CELL 3 — Response Time (center-aligned):
      Number: Inter Bold 20px textPrimary — "~8"
      Unit: "min" — Plus Jakarta Sans Regular 11px textMuted (inline)
      Label: "Response" — Plus Jakarta Sans Regular 11px textMuted
      No border (last cell)

COUNT-UP ANIMATION — THE PEAK OF STATS SECTION:

  TRIGGER: When WorkerStats scrolls into viewport
  Implementation:
    useRef: hasAnimated = false (prevent re-animation on re-scroll)
    IntersectionObserver equivalent:
      Parent ScrollView onScroll → check if component Y < scrollY + viewportH
      On first true: set hasAnimated = true, start animation

  ANIMATION PER NUMBER:
    Local state: displayValue starts at 0
    setInterval every 20ms:
      increment = finalValue / 60 (reach final in ~1200ms)
      displayValue = Math.min(displayValue + increment, finalValue)
      When reached: clearInterval
    FORMAT: Math.floor(displayValue) — no decimals during count
    At final: show actual value (4.9, 340, 8)

  STAGGER BETWEEN CELLS:
    Rating: starts at 0ms
    Jobs: starts at 200ms delay
    Response: starts at 400ms delay
    Effect: numbers fill left to right = satisfying sequence
    PEAK-END: this staggered count-up = PEAK of data revelation

  WHY COUNT-UP vs STATIC:
    Static: user sees number = processed as data
    Count-up: user WATCHES number grow = emotionally experienced
    The experience of seeing 340 grow = more impactful than reading 340
    "I just witnessed 340 jobs" vs "I read 340 jobs"
    Emotional experience → stronger trust formation

HAPTIC on rating cell tap:
  selectionAsync (light) → user knows tap registered
  Then: scrollTo reviews section (in parent)

SKELETON STATE (isLoading = true):
  Replace component with: SkeletonWorkerStats
  3 cells: each has Skeleton 50×20px (number) + Skeleton 40×10px (label)
  Shimmer running left to right across all 3 cells
  FILE: SkeletonWorkerStats.tsx (part of Task 8.13)
```

---

## Task 8.6 — WorkerAvailabilityCard Component
### Duration: 15 minutes
### File: `src/components/worker/WorkerAvailabilityCard.tsx`

```
PURPOSE:
  Shows worker's current availability status in a prominent card.
  More detailed than WorkerAvailabilityBadge (Day 5 = text only).
  This = a CARD with icon + text + time info.

DISTINCTION:
  WorkerAvailabilityBadge (Day 5): inline text "Available now" (for cards)
  WorkerAvailabilityCard (Day 8): full card with more context (for profile)

PROPS:
  status:         WorkerAvailabilityStatus
  availableUntil: string | null (e.g., "18:00")
  nextAvailable:  string | null (e.g., "Tomorrow 9 AM")
  avgResponseMins: number
  style:          ViewStyle

VISUAL PER STATUS:

  AVAILABLE:
    Container BG: colors.bgSuccess (#F0FDF4)
    Border: 1px colors.primaryBorder (#BBF7D0)
    Border radius: radius.md
    Padding: 12px

    Layout (row):
      Left: OnlineBadge (green pulse, 10px) — from Day 5
      Center (flex 1, marginLeft 10):
        Row 1: "Available now" — Plus Jakarta SemiBold 13px colors.online
        Row 2: "Until 6:00 PM · Responds in ~8 min"
                Plus Jakarta Regular 12px textMuted
      Right: Nothing (clean)

  BUSY (on another job):
    BG: colors.warningLight (#FEF3C7)
    Border: 1px colors.warning
    Center: "On a job · Usually free by 4 PM"
    Dot: OnlineBadge status="busy" (amber, no pulse)

  OFFLINE (outside working hours):
    BG: colors.bgSection
    Border: 1px colors.border
    Center: "Offline · Available tomorrow at 9 AM"
    Dot: OnlineBadge status="offline" (gray, no pulse)

  PAUSED (manually paused):
    BG: colors.bgSection
    Border: 1px colors.border
    Center: "Paused · Accepting bookings from Thursday"

MICRO-INTENTION:
  No animation (availability is a status, not an event)
  OnlineBadge pulse: continuous ambient signal (from Day 5 component)
  The card BG color change between statuses = instant recognition
  Green = good = book now | Amber = wait | Gray = not today
  Color communicates before text is read (Recognition over Recall)
```

---

## AFTERNOON SESSION — 4 Hours

---

## Task 8.7 — WorkerBio Component
### Duration: 25 minutes
### File: `src/components/worker/WorkerBio.tsx`

```
PURPOSE:
  Worker's biographical description with expandable full text.
  Builds trust through personality and communication quality.
  Users read bio to answer: "Does this person seem professional?"

PROPS:
  bio:      string | null
  style:    ViewStyle

VISUAL SPECIFICATION:

  SECTION HEADER:
    "About" — Poppins SemiBold 16px textPrimary
    Margin bottom: 10px

  BIO TEXT (collapsed state):
    numberOfLines: 4 (HICK'S LAW: 4 lines = digestible)
    Plus Jakarta Sans Regular 15px textSecondary
    lineHeight: 24px (comfortable reading)
    Width: 100%

  "Read more →" TOGGLE:
    When bio > 4 lines: show toggle
    Collapsed: "Read more →"
    Expanded: "Show less ↑"
    Font: Plus Jakarta Sans SemiBold 14px colors.primary
    Margin top: 8px
    Pressable (hitSlop: { top: 12, bottom: 12, left: 0, right: 0 })
    FITTS' LAW: hitSlop extends tap area without visual change

  BIO TEXT (expanded state):
    numberOfLines: undefined (full text)
    Same typography as collapsed

EXPAND/COLLAPSE ANIMATION:

  STATE MANAGEMENT:
    isExpanded: boolean (useState, local)
    bioHeight: number (measured height of full text, useRef)

  MEASUREMENT APPROACH:
    Render full text ONCE off-screen (opacity 0) to measure height
    onLayout: capture height → store in bioHeight ref
    Then: animate between 4-line height and bioHeight

  ANIMATION:
    Shared value: currentHeight (starts at 4-line height)
    On expand: withSpring(bioHeight, springConfig.gentle)
    On collapse: withSpring(fourLineHeight, springConfig.stiff)
    Overflow: 'hidden' on container (content clips during animation)
    PEAK-END: spring expand = "content flowing open" = satisfying

  "Read more" TEXT CHANGE:
    Cross-fade: opacity 0→1 for new text (150ms)
    No layout shift (text positioned absolutely OR same width)

  HAPTIC:
    selectionAsync on tap (light acknowledgment)

NULL STATE:
  If bio === null: don't render this section at all
  Worker hasn't added bio yet = section hidden, not "No bio" placeholder
  HICK'S LAW: absence of section = cleaner, not confusing

TYPOGRAPHY DISCIPLINE:
  Bio text: ALWAYS Plus Jakarta Sans Regular
  "This is me speaking" = user's words = neutral Jakarta font
  Section header "About": ALWAYS Poppins SemiBold
  Consistent with all other section headers
```

---

## Task 8.8 — WorkerSkillList Component
### Duration: 25 minutes
### File: `src/components/worker/WorkerSkillList.tsx`

```
PURPOSE:
  Display worker's verified and unverified skills as chip tags.
  Answers: "Is this worker qualified for my specific task?"
  Verified skills = platform confirmed competency.
  Unverified = self-declared (still informative, less authoritative).

PROPS:
  skills:       WorkerSkill[]
  maxVisibleRows: number DEFAULT 3 (Hick's Law)
  style:        ViewStyle

VISUAL SPECIFICATION:

  SECTION HEADER:
    "Skills & Expertise" — Poppins SemiBold 16px textPrimary
    Margin bottom: 10px

  CHIPS (wrapping row, flexWrap: wrap, gap: 8px):

    VERIFIED SKILL CHIP:
      Chip variant="skill" (from Day 6!)
      BG: colors.bgSuccess (#F0FDF4)
      Border: 1px colors.primaryBorder
      Border radius: radius.pill
      Label: Plus Jakarta Sans SemiBold 12px colors.textGreen
      Prefix: "✓ " (checkmark in green)
      Example: "✓ Fan Installation", "✓ 3-Phase Wiring"
      No press (display only, no onPress)

    UNVERIFIED SKILL CHIP:
      Chip variant="tag" (from Day 6)
      BG: colors.bgInput (#F4F5F7)
      Border: none
      Label: Plus Jakarta Sans Medium 12px textMuted
      No prefix checkmark
      Example: "LED Strip Lighting", "Emergency Callouts"

  HEIGHT LIMITING:
    Container has maxHeight when !isExpanded
    maxHeight = maxVisibleRows × (chipHeight + gap) + section header
    Approximation: maxHeight = 3 × (30 + 8) = 114px for 3 rows

  "Show N more" TOGGLE:
    When skills.length creates more than maxVisibleRows:
      Count remaining skills
      "Show 5 more skills" — Plus Jakarta SemiBold 13px green
      Below chip grid, left-aligned
      Pressable (hitSlop: 12px)

  EXPAND/COLLAPSE:
    Same pattern as WorkerBio:
    Shared value: containerHeight
    withSpring on expand (gentle) / collapse (stiff)
    "Show 5 more" → "Show fewer skills" on expand

CHIP ORDER:
  Verified skills FIRST (most trusted = most prominent)
  Unverified skills AFTER (still useful, less authoritative)
  SERIAL POSITION: verified = first = most remembered = most trusted

STAGGER ENTRANCE ANIMATION:
  When WorkerSkillList first renders (after data loads):
  Each chip: opacity 0→1 + scale 0.8→1.0
  Stagger: 30ms × chip index
  spring-default per chip
  Effect: chips "appear one by one" = live, dynamic feel
  PEAK-END: stagger reveal = pleasant visual moment on profile load

EMPTY STATE:
  If skills === []: don't render section
  Worker with no skills: section entirely hidden
  Not "No skills added" — just hidden (cleaner)
```

---

## Task 8.9 — WorkerServicesSection Component
### Duration: 30 minutes
### File: `src/components/worker/WorkerServicesSection.tsx`

```
PURPOSE:
  Shows all services the worker offers with their custom prices.
  Answers: "What exactly can they do and what does it cost?"
  This is where GOAL GRADIENT peaks: price visible = booking decision imminent.

PROPS:
  services:     WorkerServiceOffering[] (from API)
  workerId:     string
  isLoading:    boolean
  style:        ViewStyle

VISUAL SPECIFICATION:

  SECTION HEADER ROW:
    Left: "Services" — Poppins SemiBold 16px textPrimary
    Right: nothing (or service count "12 services" Inter Regular 13px muted)

  SERVICE ROWS (WorkerServiceRow components — Task 8.10):
    One per service offering
    Divider: 1px colors.border between rows
    NO card wrapper (rows are flat, not boxed)
    Padding: none (WorkerServiceRow handles its own padding)

  GROUPING BY CATEGORY (if worker offers multiple categories):
    Group header: category chip (Chip variant="tag" size="sm")
    Then: rows for that category's services
    Groups separated by 8px gap
    Example:
      [Electrician]
      Fan Installation    Rs 600
      Fan Repair          Rs 400
      [Plumbing]          ← second category
      Pipe Repair         Rs 800

  ADD TO CART IN THIS SECTION:
    Each WorkerServiceRow has AddToCartButton (sm size)
    This is the PRIMARY conversion point on the worker profile
    GOAL GRADIENT: every row has a cart button = goal visible × N times

  LOADING STATE:
    isLoading = true: show 3 × SkeletonServiceListItem (Day 7 component)

  EMPTY STATE:
    services === []: don't show section
    Worker hasn't added services: section hidden

ENTRANCE ANIMATION:
  When section scrolls into view:
    Each WorkerServiceRow stagger: 40ms delay × index
    opacity 0→1, translateX -8→0 (slides in from left)
    spring-default per row
  SERIAL POSITION: first row = most booked/cheapest = most acted upon
```

---

## Task 8.10 — WorkerServiceRow Component
### Duration: 20 minutes
### File: `src/components/worker/WorkerServiceRow.tsx`

```
PURPOSE:
  Single service offering row within worker's services section.
  Shows: name, duration, price, Add to Cart button.
  Primary conversion micro-component on the profile.

PROPS:
  service:      WorkerServiceOffering
  workerId:     string
  style:        ViewStyle

VISUAL SPECIFICATION:

  HEIGHT: 60px (comfortable, not cramped)
  Layout: flexDirection row, alignItems center
  Padding: 12px vertical, 0 horizontal (parent handles horizontal padding)

  LEFT GROUP (flex 1):
    Service name (top): Plus Jakarta Sans SemiBold 14px textPrimary
    Duration (bottom): Inter Regular 12px textMuted (NUMBER = Inter)
      e.g., "45–60 min"
    Gap between: 4px

  CENTER: ServicePriceTag (Day 7 component!)
    size: 'sm'
    priceType: service.priceType
    amount: service.customPrice
    showFrom: false (this IS the price, not "from")
    marginRight: 12px

  RIGHT: AddToCartButton (Day 7 component!)
    size: 'sm' (32px height)
    serviceId: service.id (from service.serviceId mapped to service name)
    workerId: workerId
    style: flexShrink: 0 (don't shrink even if name is long)

  DIVIDER (rendered by parent WorkerServicesSection between rows):
    1px colors.border, full width

INTERACTION:
  Tapping row background (not button): navigate to service detail
  Tapping AddToCartButton: triggers cart animation (local state Day 7)
  FITTS' LAW:
    AddToCartButton right-aligned = near thumb position
    Row background tap = fallback for users who tap outside button
  stopPropagation on AddToCartButton press (so row press doesn't trigger)

SPECIAL CASE — "Get Quote" services:
  service.priceType === 'quote':
    Replace AddToCartButton with "Get Quote" button (secondary sm)
    Tap: initiates message flow (Day 18)
    For now: alert or navigate to chat (placeholder)
```

---

## Task 8.11 — WorkerProfileStickyFooter Component
### Duration: 20 minutes
### File: `src/components/worker/WorkerProfileStickyFooter.tsx`

```
PURPOSE:
  ALWAYS VISIBLE bottom action bar on worker profile.
  Contains: Chat button + Book Now button.
  THE most important UI element on the entire screen.
  If this fails → no bookings → no revenue.

PROPS:
  workerId:         string
  workerName:       string
  onChat:           () => void
  onBookNow:        () => void
  isWorkerAvailable: boolean (affects Book Now state)
  style:            ViewStyle

VISUAL SPECIFICATION:

  Container:
    BG: colors.bgCard (#FFFFFF)
    Shadow: top-only — {shadowOffset: {0, -3}, opacity 0.08, radius 12}
    (Creates visual separation from scrolled content below)
    Padding: 14px horizontal
    paddingBottom: safeAreaBottom + 14px (above home indicator)
    paddingTop: 14px
    flexDirection: row
    gap: 12px

  LEFT BUTTON — "Chat":
    Button variant="secondary" (outline green)
    Size: lg (52px height)
    flex: 1 (50% width)
    Left icon: MessageCircle (Lucide 18px)
    Label: "Chat"
    onPress: onChat prop
    MICRO-INTENTION:
      Outline = "secondary option but still accessible"
      Users who aren't ready to book = can ask questions first
      This reduces anxiety = increases eventual conversion

  RIGHT BUTTON — "Book Now":
    Button variant="primary" (filled green)
    Size: lg (52px height)
    flex: 1 (50% width)
    Label: "Book Now"
    onPress: onBookNow prop
    Disabled: !isWorkerAvailable (worker offline/inactive)
    Disabled visual: muted green (#86EFAC), no press animation

  WHEN WORKER UNAVAILABLE:
    "Book Now" → disabled
    Chat remains active (user can still message)
    No tooltip or explanation in footer (modal explains on tap)
    onPress when disabled: show ActionSheet explaining unavailability

ENTRANCE ANIMATION:
  On component mount:
    translateY: 80px → 0 (spring-gentle)
    Delay: 300ms after screen mounts
  PEAK-END: footer sliding up = final "welcome" to the profile
  User: "The action buttons just arrived" = satisfying reveal

PRESS ANIMATIONS (both buttons inherit from Button.tsx):
  Primary: scale 0.97 → 1.02 → 1.0 (spring-bouncy) + haptic medium
  Secondary: scale 0.97 → 1.0 (spring-default) + haptic light

ACCESSIBILITY:
  "Chat": accessibilityLabel="Chat with [workerName]"
  "Book Now": accessibilityLabel="Book [workerName] now"
              accessibilityState={{ disabled: !isWorkerAvailable }}

FITTS' LAW COMPLIANCE:
  Each button: ~171px wide × 52px tall = 8,892 sq px tap area
  Combined: entire bottom of screen = can't miss
  This is intentional: booking = goal of entire app = maximum target size
```

---

## Task 8.12 — MoreOptionsMenu Component
### Duration: 20 minutes
### File: `src/components/worker/MoreOptionsMenu.tsx`

```
PURPOSE:
  The "⋯" more button handler for worker profile.
  Opens ActionSheet with: Report, Block, Share.
  HICK'S LAW: max 3 options. These are the only 3 needed.

PROPS:
  workerId:     string
  workerName:   string
  isVisible:    boolean
  onClose:      () => void
  onReport:     () => void
  onBlock:      () => void
  onShare:      () => void

IMPLEMENTATION:
  Uses ActionSheet component (Day 6!)
  No new UI needed — just wires action callbacks.

  ActionSheet props:
    isVisible: isVisible
    onClose: onClose
    title: "[workerName]"
    actions: [
      {
        label: "Share profile",
        icon: Share2 (Lucide),
        variant: 'default',
        onPress: onShare,
      },
      {
        label: "Report worker",
        icon: Flag (Lucide),
        variant: 'default',
        onPress: onReport,
      },
      {
        label: "Block worker",
        icon: Ban (Lucide),
        variant: 'danger',  ← red text = irreversible
        onPress: onBlock,
      },
    ]

SHARE FUNCTIONALITY:
  onShare: uses React Native Share API
  Share.share({ message: "Book Ahmed Khan on Tasklync: tasklync://worker/{id}" })
  No new implementation needed

BLOCK FLOW (simplified for Day 8):
  onBlock: show confirmation ActionSheet (nested)
  Confirmation: "Block [Name]? They won't appear in your searches."
  Actions: "Block" (danger) | "Cancel"
  On confirm: call user.api.blockWorker(workerId)
  On success: navigate back + show toast "Worker blocked"

REPORT FLOW (simplified):
  onReport: navigate to a report screen (placeholder Day 8)
  Full implementation: Day 19 (dispute/report features)
```

---

## Task 8.13 — Skeleton Components for Worker Profile
### Duration: 20 minutes
### Files (multiple small files):

```
FILE 1: src/components/ui/Skeleton/SkeletonWorkerProfileHero.tsx
  PURPOSE: Placeholder for hero while worker data loads
  HEIGHT: 280px (matches ProfileHeroGradient)
  CONTENTS:
    Full 280px: Skeleton (dark gray shimmer, BG #1E293B-ish)
    Bottom area: circular 80px skeleton (avatar placeholder)
    Right of avatar: 2 text skeletons (name + city)
  No white at bottom: gradient area is dark

FILE 2: src/components/ui/Skeleton/SkeletonWorkerStats.tsx
  PURPOSE: Placeholder for stats row
  HEIGHT: 64px (matches WorkerStats)
  3 cells:
    Each: Skeleton 50×20px (number) + 4px gap + Skeleton 40×10px (label)
    Dividers: 1px between cells
  BG: colors.bgSection (matches real component)

FILE 3: src/components/ui/Skeleton/SkeletonWorkerBio.tsx
  PURPOSE: Placeholder for bio section
  CONTENTS:
    "About" header: Skeleton 60×16px
    4 text lines:
      Line 1: Skeleton 300×14px
      Line 2: Skeleton 280×14px (slightly shorter)
      Line 3: Skeleton 290×14px
      Line 4: Skeleton 200×14px (shorter = implies end of paragraph)
    Gap between lines: 6px

FILE 4: src/components/ui/Skeleton/SkeletonWorkerSkillList.tsx
  PURPOSE: Placeholder for skill chips
  CONTENTS:
    "Skills" header: Skeleton 120×16px
    2 rows of chips:
      Row 1: Skeleton 90×28px pill + 70×28px pill + 100×28px pill
      Row 2: Skeleton 80×28px pill + 110×28px pill
    Gap: 8px between chips, 8px between rows

FILE 5: src/components/ui/Skeleton/SkeletonWorkerServiceRow.tsx
  PURPOSE: Placeholder for single service row (70px height)
  CONTENTS:
    Left: Skeleton 140×14px (name) + Skeleton 80×11px (duration)
    Right: Skeleton 65×14px (price) + Skeleton 72×28px (button)
  Used: 3× in WorkerServicesSection loading state
```

---

## Task 8.14 — Worker Profile Screen (Top Half Assembly)
### Duration: 30 minutes
### File: `app/worker/[id].tsx` (partial — Day 9 adds portfolio + reviews)

```
FILE: app/worker/[id].tsx
NOTE: Day 8 = top half assembled. Day 9 = bottom half + completion.

ROUTE PARAMS:
  id: string (worker ID, from navigation or WorkerSearchCard)

SCREEN BG: colors.bgApp (#FAFAFA)

DATA HOOKS:
  const { worker, isLoading, isError } = useWorkerProfile(id)
  const { currentLocation } = useLocationStore()

SCROLL TRACKING:
  Animated.ScrollView from react-native-reanimated
  scrollY: useSharedValue(0)
  onScroll: useAnimatedScrollHandler to update scrollY
  scrollEventThrottle: 1 (for smooth animation)
  Why Animated.ScrollView: native-thread scroll tracking = smooth animation

LAYOUT STRUCTURE:

  Layer 1 — WorkerCompactHeader:
    Position: absolute top (z-index 10)
    scrollY prop passed
    onBack / onBookNow / opacity derived from scrollY

  Layer 2 — Animated.ScrollView:
    contentContainerStyle: { paddingBottom: 120px }
    (Space for StickyFooter + safe area)

    CONTENT ORDER:

    [1] WorkerProfileHeader (280px hero):
        ProfileHeroGradient inside
        Avatar, name, city on dark bg
        Back/Share/More buttons

    [2] White Content Card (overlaps hero by 24px):
        marginTop: -24px
        borderTopRadius: 24px
        BG: colors.bgCard
        padding: 20px

        [2a] Name + VerifiedBadge row:
             flexDirection: row, alignItems: center, gap: 8px
             Worker name: Poppins Bold 22px textPrimary
             VerifiedBadge size="sm" (if isVerified)

        [2b] City + Category line:
             Plus Jakarta Regular 14px textMuted
             "Electrician · Lahore"

        [2c] WorkerStats (16px margin top)

        [2d] WorkerAvailabilityCard (12px margin top)

        [2e] WorkerBio (20px margin top)

        [2f] WorkerSkillList (20px margin top)

        [2g] WorkerServicesSection (20px margin top)

        [2h] Placeholder: "--- Day 9: Portfolio + Reviews below ---"
             (height: 400px View so scroll works during Day 8)

  Layer 3 — WorkerProfileStickyFooter:
    Outside ScrollView (doesn't scroll)
    Position: absolute bottom (or View at screen bottom)
    onChat: () => router.push(`/booking/${bookingId}/chat`) (placeholder)
    onBookNow: () => router.push('/booking/create') with workerId param

ISLOADING STATE:
  Shows: SkeletonWorkerProfileHero (full-width, 280px)
  Below: SkeletonWorkerStats + SkeletonWorkerBio + SkeletonWorkerSkillList
  WorkerProfileStickyFooter: still shows (buttons = placeholder press)

ISERROR STATE:
  ErrorState component centered
  "Worker profile unavailable"
  [Retry] button

SCROLL TRIGGERED BEHAVIORS:
  scrollY > 160: WorkerCompactHeader appears (opacity 1)
  scrollY > 160: StatusBar → 'dark-content'
  scrollY < 100: StatusBar → 'light-content'
  scrollY > stats.y: WorkerStats count-up starts (managed in WorkerStats)
```

---

## Task 8.15 — useWorkerProfile Hook (Expanded)
### Duration: 20 minutes
### File: `src/hooks/useWorkerProfile.ts` (UPDATE from Day 4)

```
CURRENT STATE (Day 4): basic profile query
ENHANCEMENT NEEDED:

ADD: useWorkerSkills sub-hook
  queryKey: ['worker', workerId, 'skills']
  queryFn: worker.api.getWorkerSkills(workerId)
  staleTime: 300_000 (5 minutes)
  Returns: { skills: WorkerSkill[], isLoading }

ADD: useWorkerServiceOfferings sub-hook
  queryKey: ['worker', workerId, 'services']
  queryFn: worker.api.getWorkerServices(workerId)
  staleTime: 300_000
  Returns: { services: WorkerServiceOffering[], isLoading }

COMBINED useWorkerProfile returns:
  worker: WorkerPublicProfile | undefined
  skills: WorkerSkill[]
  services: WorkerServiceOffering[]
  isLoading: boolean (true if ANY of the 3 queries loading)
  isError: boolean (true if ANY query errored)
  refetch: () => void (refetches all 3)

PARALLEL LOADING:
  All 3 queries fire simultaneously (not sequential)
  WHY: user sees profile data as it arrives, not in one batch
  Stats appear → bio appears → skills appear → services appear
  Progressive disclosure = feels FASTER even if same total time

PREFETCH ON WORKER CARD TAP (from Day 7 prefetch):
  Already implemented: queryClient.prefetchQuery(['worker', id])
  NOW also prefetch: ['worker', id, 'skills'] and ['worker', id, 'services']
  Three prefetch calls on WorkerSearchCard pressIn
  Result: all profile data ready before screen even mounts
  GOAL GRADIENT: instant profile = user feels extremely close to goal

API ADDITIONS NEEDED in worker.api.ts:
  getWorkerSkills(workerId: string):
    GET /workers/:id/skills
    Returns: WorkerSkill[]
    Already in spec from Day 4, verify it exists

  getWorkerServices(workerId: string):
    GET /workers/:id/services
    Returns: WorkerServiceOffering[]
    Already in spec from Day 4, verify it exists
```

---

## Task 8.16 — Integration Test
### Duration: 15 minutes

```
WORKER PROFILE TEST CHECKLIST:

  NAVIGATION:
    □ Category screen workers tab → tap WorkerSearchCard → profile opens
    □ Search results → tap worker card → profile opens
    □ Home nearby workers → tap card → profile opens
    □ ← back button returns to previous screen correctly
    □ Share button: native share sheet opens

  HERO ANIMATION:
    □ Profile loads: hero gradient visible (dark)
    □ Avatar: 80px, white border, positioned bottom-left of hero
    □ Worker name in white text visible on dark hero
    □ Scroll up 160px: WorkerCompactHeader fades in
    □ Avatar in compact header: 36px, appears at correct position
    □ Hero name + city: fades out as compact header fades in
    □ Scroll back down: compact header fades, hero name returns
    □ StatusBar: white-content at top, dark-content when compact header shows

  WHITE CONTENT CARD:
    □ Overlaps hero by 24px (rounded top corners visible)
    □ Name + VerifiedBadge inline (if worker is verified)
    □ City + category below name

  WORKERSTATS:
    □ 3 columns visible with equal width
    □ Numbers: Inter Bold 20px
    □ Count-up animation triggers on scroll into view
    □ Stagger: rating → jobs → response time (200ms each)
    □ Rating cell: tappable (scrolls to reviews placeholder area)

  WORKERAVAILABILITYCARD:
    □ AVAILABLE: green BG, pulsing dot, "Until X:XX PM" shows
    □ BUSY: amber BG, amber dot, "On a job" shows
    □ OFFLINE: gray BG, gray dot, "Next available" shows

  WORKERBIO:
    □ Default: 4 lines shown, "Read more →" visible
    □ Tap "Read more": expands with spring animation
    □ "Show less ↑" visible when expanded
    □ Tap "Show less": collapses with spring-stiff
    □ Haptic on both expand and collapse

  WORKERSKILLLIST:
    □ Verified skills: green chip with ✓ prefix
    □ Unverified skills: gray chip, no prefix
    □ Max 3 rows shown, "Show N more" link below
    □ Expand: more chips appear with spring animation
    □ Stagger entrance: chips appear 30ms apart

  WORKERSERVICESSECTION:
    □ Services listed with name, duration, price
    □ AddToCartButton on each row (Day 7 local state)
    □ AddToCartButton: morph animation on tap (STATE1 → STATE2)
    □ Stagger entrance: rows appear 40ms apart

  WORKERPROFFILESTICKYFOOOTER:
    □ Visible at all scroll positions
    □ Entrance animation: slides up from bottom (spring-gentle)
    □ "Chat" button: secondary style (outline green)
    □ "Book Now" button: primary style (filled green)
    □ Both: 50% width, 52px height
    □ "Book Now" press: scale animation + haptic medium
    □ "Chat" press: scale animation + haptic light
    □ Worker unavailable: "Book Now" disabled (muted color)

  MOREOPTIONSMENU:
    □ ⋯ button tap: ActionSheet opens
    □ 3 options: Share, Report, Block
    □ "Block": danger red text
    □ Share: native share sheet opens

  PERFORMANCE:
    □ Profile loads in < 1.5s on first visit (after day 7 prefetch: < 0.3s)
    □ Hero scroll animation: 60fps on Android emulator
    □ Count-up animation: smooth, no dropped frames
    □ Skill stagger: smooth
    □ All tests on: iPhone SE (375px), iPhone 14 Pro, Android mid-range

  CODE QUALITY:
    □ tsc --noEmit: zero errors
    □ eslint: zero warnings
    □ All numbers: Inter font
    □ All headings/CTAs: Poppins
    □ All body: Plus Jakarta Sans
    □ No hardcoded colors or sizes
```

---

## Day 8 — Complete New File List

```
NEW FILES:
  src/components/worker/ProfileHeroGradient.tsx
  src/components/worker/WorkerProfileHeader.tsx
  src/components/worker/WorkerCompactHeader.tsx
  src/components/worker/VerifiedBadge.tsx
  src/components/worker/WorkerStats.tsx
  src/components/worker/WorkerAvailabilityCard.tsx
  src/components/worker/WorkerBio.tsx
  src/components/worker/WorkerSkillList.tsx
  src/components/worker/WorkerServicesSection.tsx
  src/components/worker/WorkerServiceRow.tsx
  src/components/worker/WorkerProfileStickyFooter.tsx
  src/components/worker/MoreOptionsMenu.tsx
  src/components/ui/Skeleton/SkeletonWorkerProfileHero.tsx
  src/components/ui/Skeleton/SkeletonWorkerStats.tsx
  src/components/ui/Skeleton/SkeletonWorkerBio.tsx
  src/components/ui/Skeleton/SkeletonWorkerSkillList.tsx
  src/components/ui/Skeleton/SkeletonWorkerServiceRow.tsx

UPDATED FILES:
  src/hooks/useWorkerProfile.ts     ← Add skills + services sub-hooks
  src/services/api/worker.api.ts    ← Verify getWorkerSkills, getWorkerServices exist
  src/components/ui/Skeleton/index.ts ← Add 5 new skeleton exports
  src/components/worker/WorkerSearchCard.tsx ← Add 3-query prefetch on pressIn

SCREENS:
  app/worker/[id].tsx               ← Top half ASSEMBLED (Day 9 = bottom half)

TOTAL NEW FILES: 17
TOTAL UPDATED: 4
SCREEN STATUS: Worker profile top half (Day 9 completes it)
```

---

## Day 8 — Micro-Interactions Complete Catalog

```
COMPONENT              INTERACTION              INTENTION               LAW

ProfileHeroGradient    No animation             "Stable backdrop"       —

WorkerProfileHeader    Scroll 0→160px:          "Following you up"      Jakob's
(avatar morph)           Avatar A fades out     "Continuity maintained"  Peak-End
                         Avatar B fades in      "Same person, smaller"
                         Name fades out
                         Compact header fades in

WorkerCompactHeader    translateY -20→0         "Compact header         Serial Pos
(entrance)             + opacity 0→1            arriving from above"

WorkerCompactHeader    "Book" press: scale 0.97  "Responsive, alive"     Peak-End
(button)               → 1.0 + haptic light

VerifiedBadge          No animation             "Permanent, reliable"   Recognition
                       (static = stable trust)

WorkerStats            Scroll into view:         "Numbers being          Peak-End
(count-up)             0→final value over 1s    revealed for you"
                       Stagger: 200ms between   "One by one arrival"    Serial Pos
                       cells
                       Rating cell tap: haptic   "Navigating to reviews" Goal Grad
                       + scroll to reviews

WorkerAvailabilityCard OnlineBadge pulse        "Real-time signal"       Goal Grad
                       (green only, continuous)  "Book NOW is possible"

WorkerBio              Tap "Read more":          "Opening to you"        Peak-End
                       height spring-gentle
                       Tap "Show less":          "Closing decisively"
                       height spring-stiff
                       Haptic both ways          "Acknowledged"           Jakob's

WorkerSkillList        Chip stagger (30ms each)  "Skills arriving"        Peak-End
                       scale 0.8→1.0 + opacity   "Each one revealed"      Serial Pos

WorkerServicesSection  Row stagger (40ms each)   "Services presenting"    Peak-End
                       translateX -8→0 + opacity

WorkerServiceRow       AddToCartButton morph     "Adding to cart"         Peak-End
                       (from Day 7 component)

WorkerProfileSticky    Mount: translateY 80→0    "Buttons arriving"       Peak-End
Footer                 spring-gentle 300ms delay "They're ready for you"
"Chat" press           scale 0.97→1.0 + haptic   "Chat initiated"        Jakob's
"Book Now" press       scale 0.97→1.02→1.0       "Booking initiated"      Peak-End
                       + haptic medium            (THE peak of profile)

MoreOptionsMenu        ⋯ tap: ActionSheet rises  "More options appearing"  Jakob's
(via ActionSheet)      spring-gentle             (Day 6 component)
```

---

## Day 8 — Typography Audit (Quick Reference)

```
VERIFY EVERY TEXT ELEMENT uses correct font:

Inter (Numbers/Data):
  ✅ Stat number "4.9": Inter Bold 20px
  ✅ Stat number "340": Inter Bold 20px
  ✅ Stat number "~8": Inter Bold 20px
  ✅ Service price "Rs 600": Inter SemiBold 15px (via ServicePriceTag)
  ✅ Duration "45–60 min": Inter Regular 12px

Poppins (Headings/Brand/CTAs):
  ✅ Worker name (on hero): Poppins Bold 22px white
  ✅ Worker name (compact header): Poppins SemiBold 16px
  ✅ "About" section header: Poppins SemiBold 16px
  ✅ "Skills & Expertise": Poppins SemiBold 16px
  ✅ "Services" section: Poppins SemiBold 16px
  ✅ "Chat" button label: Poppins SemiBold (Button)
  ✅ "Book Now" button: Poppins SemiBold (Button)

Plus Jakarta Sans (Body/Labels/UI):
  ✅ City + category (hero): Jakarta Regular 14px
  ✅ Verified badge text: Jakarta SemiBold 11px green
  ✅ Stats labels: Jakarta Regular 11px muted
  ✅ Availability "Available now": Jakarta SemiBold 13px green
  ✅ Availability "Until 6 PM": Jakarta Regular 12px muted
  ✅ Bio text: Jakarta Regular 15px
  ✅ "Read more": Jakarta SemiBold 14px green
  ✅ Skill chip labels: Jakarta Medium/SemiBold 12px
  ✅ Service name: Jakarta SemiBold 14px
  ✅ ActionSheet options: Jakarta SemiBold 15px
```

---

## Day 8 — UX Laws Final Audit

```
RECOGNITION OVER RECALL:
  ✅ Hero photo: face = instant human recognition
  ✅ Green shield VerifiedBadge = platform trust (recognized from Airbnb)
  ✅ ⭐ 4.9 pattern = instantly parsed (Amazon/Google/Yelp pattern)
  ✅ Green availability card = "green = good = book now" (traffic light)
  ✅ Skill chip format = LinkedIn/Fiverr pattern = recognized
  ✅ Chat + Book Now footer = Airbnb/TaskRabbit = recognized

FITTS' LAW:
  ✅ "Book Now": 50% screen width × 52px = ~8,000 sq px target
  ✅ "Chat": 50% screen width × 52px = same
  ✅ Stats cells: 33% width × 52px = scrollable tap zones
  ✅ Header buttons: 44×44px minimum with hitSlop
  ✅ "Read more" link: hitSlop extends tap area
  ✅ "Show more skills" link: hitSlop 12px

HICK'S LAW:
  ✅ Footer: exactly 2 choices (Chat | Book Now)
  ✅ More menu: exactly 3 options (Share | Report | Block)
  ✅ Skills: max 3 rows default (expand = opt-in)
  ✅ Bio: 4 lines default (expand = opt-in)
  ✅ Stats: exactly 3 metrics (not 5, not 2)

JAKOB'S LAW:
  ✅ Avatar bottom-left of hero = Airbnb/Urban Company pattern
  ✅ White content card rising from hero = Airbnb listing page
  ✅ 3-column stats = TaskRabbit/Urban Company standard
  ✅ Sticky footer = every service marketplace
  ✅ Compact header on scroll = Instagram/Airbnb behavior
  ✅ ActionSheet = iOS native pattern

PEAK-END RULE:
  ✅ PEAK: avatar morph from hero to compact header (scroll animation)
  ✅ PEAK: stats count-up animation (numbers growing)
  ✅ PEAK: "Book Now" press animation (scale + haptic)
  ✅ PEAK: skills stagger entrance (chips appearing)
  ✅ END: sticky footer always visible = positive constant "end state"

GOAL GRADIENT EFFECT:
  ✅ "Book Now" always visible in sticky footer
  ✅ "Available now · Until 6PM" = time urgency = goal today
  ✅ Price visible on each service = cost clarity = booking confidence
  ✅ AddToCartButton on each service = micro-goal per row
  ✅ Profile prefetch = instant load = user feels near goal before arriving

SERIAL POSITION EFFECT:
  ✅ Photo FIRST: most memorable element
  ✅ Verified badge SECOND: trust signal early
  ✅ Stats THIRD: quantified credibility
  ✅ Availability FOURTH: timing confirmation
  ✅ Bio/Skills/Services: middle (important but not first/last)
  ✅ Sticky footer LAST/ALWAYS: most acted-upon element
  ✅ Verified skills BEFORE unverified: trust hierarchy in chips
```

---

## What Day 9 Gets From Day 8

```
AFTER DAY 8, THE FOLLOWING ARE COMPLETE:

  WORKER PROFILE TOP HALF:
    → Hero with animated scroll behavior
    → Avatar morph from hero to compact header
    → VerifiedBadge (inline trust signal)
    → WorkerStats with count-up animation
    → WorkerAvailabilityCard (all 5 statuses)
    → WorkerBio (expandable, spring animation)
    → WorkerSkillList (verified/unverified, stagger entrance)
    → WorkerServicesSection + WorkerServiceRow
    → WorkerProfileStickyFooter (Chat + Book Now, always visible)
    → MoreOptionsMenu (Share, Report, Block)
    → All skeleton loading states

  DAY 9 WILL BUILD (Worker Profile Bottom Half):
    ReviewSummary (animated rating bars → PEAK of profile)
    ReviewCard (single review display)
    ReviewReplyBubble (worker's reply to review)
    WorkerPortfolioGrid (3-column photo grid)
    ImageViewer (full-screen pinch/zoom photo viewer)
    Worker reviews screen: app/worker/[id]/reviews.tsx
    Worker portfolio screen: app/worker/[id]/portfolio.tsx
    app/worker/[id].tsx COMPLETE (top + bottom combined)

    THE PEAK of Day 9:
    ReviewSummary animated bars (rating breakdown fills on scroll)
    = most impressive animation in the entire worker profile
    = users remember "the bars filled up showing the scores"
    = trust is built through this single animation

    THE END of Day 9:
    Portfolio grid = last thing user sees before booking
    Beautiful work photos = final emotional impression
    = user decides to book based on what they saw last
```

---

*Tasklync — Day 8 Implementation Plan*
*17 new files. 4 updated files. 12+ components.*
*WorkerProfileHeader · WorkerCompactHeader · WorkerStats · WorkerBio ·*
*WorkerSkillList · WorkerServicesSection · WorkerProfileStickyFooter · MoreOptionsMenu*
*Worker profile top half: assembled and production-ready.*
*Avatar morph scroll animation = the peak moment of the entire screen.*
*Every micro-interaction mapped. Every UX law applied with trust-first thinking.*
*Font: Poppins headings/CTAs, Jakarta body/labels, Inter ALL numbers/prices.*
*Ahesta ahesta — 60-day build, Day 8 of 60.*
