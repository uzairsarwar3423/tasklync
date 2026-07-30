# Tasklync — Day 6 Implementation Plan
## BottomSheet · Chip System · Search Input · Search API · Explore Tab · Filter System
### Senior React Native Expo | 25 Years | Pure Implementation Plan — Zero Code

> **Slow, correct, scalable. 60-day build hai — rush nahi.**
> Day 6 mein zyada components banenge because ye sab reusable hain.
> BottomSheet alone 10+ screens mein use hoga.
> Chip alone 8+ contexts mein use hoga.
> Ek baar properly banao → poore app mein kaam aata hai.

---

## Day 6 Philosophy

```
"Day 6 is infrastructure day for the discovery layer.
 The components built today will be reused on:
   → Search filter sheet
   → Booking date/time picker
   → Cancel booking confirmation
   → Address picker
   → Worker conflict resolution
   → Country selector (phone screen)
   → Sort options drawer
   → 10+ more places

 HICK'S LAW applied to architecture:
 Build ONE BottomSheet. Build ONE Chip.
 Don't build 10 slightly-different modals for 10 screens.
 Build the foundation correctly. Everything else is composition."

THE GOLDEN RULE OF DAY 6:
  Every component built today = a reusable building block.
  No 'throwaway' code. Every file = permanent codebase member.
  Components are small, focused, single-responsibility.
  Screens are just COMPOSITIONS of these components.
```

---

## Prerequisites from Days 1–5

```
MUST BE COMPLETE AND VERIFIED BEFORE STARTING DAY 6:

  FROM DAY 1 (Design Tokens):
    ✅ colors.ts — colors.primary, colors.bgInput, colors.bgCard, etc.
    ✅ typography.ts — fontFamily.poppins, fontFamily.jakarta, fontFamily.inter
    ✅ spacing.ts — layout.primaryButtonH (52), layout.minTouchTarget (44)
    ✅ animations.ts — springConfig.gentle, springConfig.bouncy, springConfig.stiff
    ✅ shadows.ts — shadows.sm, shadows.md, shadows.lg
    ✅ radius.ts — radius.pill, radius.lg, radius.md

  FROM DAY 2 (UI Primitives):
    ✅ Button.tsx — all 5 variants working
    ✅ IconButton.tsx — 44×44 touch target
    ✅ TextInput.tsx — floating label, error, all states
    ✅ Screen.tsx — SafeAreaView wrapper
    ✅ StickyFooter.tsx — bottom CTA placement

  FROM DAY 3 (Auth):
    ✅ AuthProvider — route guard working
    ✅ Token in every API request via Axios interceptor

  FROM DAY 4 (Data Layer):
    ✅ WorkerNearby type — id, name, avatar, rating, distance, etc.
    ✅ worker.api.ts — getNearbyWorkers() working
    ✅ useNearbyWorkers() hook — React Query, stale 30s
    ✅ Section.tsx — reusable section wrapper built

  FROM DAY 5 (Home Screen):
    ✅ WorkerCardHorizontal.tsx — 150px card (horizontal context)
    ✅ WorkerCard.tsx — full-width card (list context)
    ✅ WorkerAvailabilityBadge.tsx
    ✅ OnlineBadge.tsx — animated green pulse
    ✅ ServiceListItem.tsx — 72px row
    ✅ app/(tabs)/explore.tsx — exists as placeholder only

  VERIFY BEFORE PROCEEDING:
    □ expo start → app boots without errors
    □ tsc --noEmit → zero errors
    □ eslint → zero warnings
    □ Home screen → all 5 sections render correctly
    □ Tab bar → 4 tabs navigable
```

---

## Day 6 UX Laws — Applied Per Component

```
┌────────────────────────────────────────────────────────────────────────┐
│  UX LAW              COMPONENT            APPLICATION                  │
├────────────────────────────────────────────────────────────────────────┤
│  RECOGNITION         SearchInput         Clear X appears when value    │
│  OVER RECALL         recent searches     exists → user SEES option     │
│                      ChipGroup           Active chip stays green =      │
│                                          always visible filter state   │
│                      FilterSheet         Active filter count on icon   │
│                                          button → user SEES it's active│
├────────────────────────────────────────────────────────────────────────┤
│  FITTS' LAW          BottomSheet         Backdrop = full screen close  │
│                      Chip                36px height = large tap area  │
│                      SearchInput         48px height full-width        │
│                      FilterApply btn     52px full-width = hardest     │
│                                          to miss button in app        │
│                      WorkerSearchCard    Full 88px × full-width row   │
│                      Recent search row   48px height per row           │
├────────────────────────────────────────────────────────────────────────┤
│  HICK'S LAW          Filter sheet        Max 6 category chips visible  │
│                      Sort options        Exactly 3 options             │
│                      Explore tab         Results OR recent searches    │
│                                          NEVER both simultaneously    │
│                      SearchInput         Debounce: no choices while    │
│                                          typing (system is quiet)      │
├────────────────────────────────────────────────────────────────────────┤
│  JAKOB'S LAW         BottomSheet         Rise from bottom + backdrop   │
│                                          = every major app pattern     │
│                      SearchInput         Keyboard opens immediately    │
│                                          = Google/Apple/WhatsApp       │
│                      Recent searches     Below empty input = Google    │
│                      Chip "active"       Green with checkmark = Airbnb │
│                      Search debounce     Results update while typing   │
│                                          = Google Search               │
├────────────────────────────────────────────────────────────────────────┤
│  PEAK-END RULE       BottomSheet open    Spring-gentle RISE = PEAK    │
│                      Chip select         Color morph + scale = PEAK   │
│                      Search results      Skeleton → cards stagger in   │
│                                          = reveal PEAK                │
│                      WorkerSearchCard    Prefetch: profile loads       │
│                                          INSTANTLY on tap = PEAK END  │
├────────────────────────────────────────────────────────────────────────┤
│  GOAL GRADIENT       Filter button       Active filters badge = "I'm  │
│                                          filtering toward my goal"     │
│                      Apply button        "Apply (8 results)" = user   │
│                                          sees goal is reachable        │
│                      Search results      "Book" visible on each card   │
│                                          = 2 taps from goal always    │
├────────────────────────────────────────────────────────────────────────┤
│  SERIAL POSITION     Explore tab         SearchInput FIRST element     │
│                      Recent searches     Most recent = first shown     │
│                      Filter sheet        Category FIRST filter section │
│                      Sort options        "Nearest" FIRST (default)     │
│                      Search results      Best match first (nearest +   │
│                                          highest rated in that order) │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Typography — Day 6 Specific Rules

```
SEARCH INPUT:
  Typed value:          Plus Jakarta Sans Regular 15px textPrimary
  Placeholder text:     Plus Jakarta Sans Regular 15px textMuted
  Clear X (not text):   —

CHIP:
  Unselected label:     Plus Jakarta Sans Medium 12px (sm) / 13px (md) textMuted
  Selected label:       Plus Jakarta Sans SemiBold 12px (sm) / 13px (md) white

FILTER SHEET:
  "Filters" title:      Poppins Bold 18px textPrimary
  Section headers:      Poppins SemiBold 14px textPrimary
  "Reset" link:         Plus Jakarta Sans SemiBold 14px green
  Category chip labels: Plus Jakarta Sans Medium 12px (chip size sm)
  Sort option labels:   Plus Jakarta Sans Regular 14px textPrimary
  Radio selected:       Plus Jakarta Sans SemiBold 14px textPrimary
  Rating label text:    Plus Jakarta Sans Regular 13px textMuted
  "Apply N workers":    Poppins SemiBold (Button enforces)

EXPLORE TAB:
  "Recent" section hdr: Poppins SemiBold 16px textPrimary
  Recent search term:   Plus Jakarta Sans SemiBold 14px textPrimary
  "Browse by Cat" hdr:  Poppins SemiBold 16px textPrimary
  Result count "N fnd": Inter Medium 13px textMuted (it's a NUMBER)
  Empty state title:    Poppins SemiBold 18px textPrimary
  Empty state sub:      Plus Jakarta Sans Regular 14px textMuted

WORKER SEARCH CARD:
  Worker name:          Poppins SemiBold 15px textPrimary
  Category chip label:  Plus Jakarta Sans Medium 11px textMuted
  Rating "4.9":         Inter SemiBold 13px (NUMBER = Inter)
  Review count "(124)": Plus Jakarta Sans Regular 11px textMuted
  Distance "1.2 km":   Inter Medium 12px textMuted (NUMBER = Inter)
  Price "Rs 500/hr":   Inter SemiBold 14px green (NUMBER = Inter)
  "Available":          Plus Jakarta Sans SemiBold 11px green

BOTTOM SHEET (general):
  No typography — structural component only
  Handle: visual only (no text)
```

---

## Day 6 — Time Breakdown

```
TOTAL: 8 hours (2 developers working in parallel where indicated)

MORNING SESSION (4h):
  Task 6.1  — BottomSheet component              60 min
  Task 6.2  — BottomSheetHandle component        15 min
  Task 6.3  — ActionSheet component              25 min   ← bonus reusable
  Task 6.4  — Chip component                     35 min
  Task 6.5  — ChipGroup component                25 min

AFTERNOON SESSION (4h):
  Task 6.6  — SearchInput component              25 min
  Task 6.7  — SearchHeader component             20 min   ← reusable
  Task 6.8  — RadioGroup component               20 min   ← reusable
  Task 6.9  — StarRatingFilter component         20 min   ← reusable
  Task 6.10 — search.types.ts                    15 min
  Task 6.11 — search.api.ts                      20 min
  Task 6.12 — useSearch hook                     25 min
  Task 6.13 — useRecentSearches hook             15 min
  Task 6.14 — WorkerSearchCard component         25 min
  Task 6.15 — SkeletonWorkerSearchCard           10 min
  Task 6.16 — FilterSheet screen                 20 min
  Task 6.17 — Explore tab screen complete        20 min
  Task 6.18 — Integration test                   15 min
```

---

## MORNING SESSION — 4 Hours

---

## Task 6.1 — BottomSheet Component
### Duration: 60 minutes
### File: `src/components/layout/BottomSheet/BottomSheet.tsx`

---

### Why BottomSheet Is The Most Critical Component of Day 6

```
USAGE COUNT IN FULL APP:
  Search filters         → BottomSheet
  Booking time slots     → BottomSheet
  Booking cancel confirm → BottomSheet
  Address picker         → BottomSheet
  Worker conflict modal  → BottomSheet
  Country code picker    → BottomSheet
  Sort options           → BottomSheet
  Photo options          → BottomSheet (or ActionSheet)
  Review submit          → BottomSheet
  Dispute raise          → BottomSheet
  10+ uses = build it ONCE, build it PERFECTLY.

IF BUILT WRONG TODAY:
  Every BottomSheet-powered screen has the same bug.
  10 screens to fix instead of 1 component to fix.
  Technical debt multiplies by 10.

IF BUILT RIGHT TODAY:
  Every BottomSheet screen works perfectly on first render.
  Developer just: import + use.
```

---

### Component Architecture

```
THREE-LAYER ARCHITECTURE:

  Layer 1 — BACKDROP VIEW (behind sheet):
    Position: absolute, fills entire screen
    Background: rgba(0,0,0,0.45)
    Animated opacity: 0 → 0.45 when opening
    Pressable: closes sheet on tap (Fitts' Law: entire screen = tap target)
    z-index: below sheet

  Layer 2 — SHEET CONTAINER (the white panel):
    Position: absolute, bottom 0, left 0, right 0
    Background: colors.bgCard (#FFFFFF)
    Border radius: TOP only — radius['2xl'] = 24px
      bottomLeft: 0, bottomRight: 0, topLeft: 24, topRight: 24
    Shadow (top edge only):
      iOS:     shadowOffset {0, -3}, opacity 0.08, radius 12, color #000
      Android: elevation 12
    Height: determined by snapPoint (40%, 70%, 95% of screen)
    Animated: translateY (moves up/down)
    z-index: above backdrop

  Layer 3 — SHEET CONTENT:
    Inside sheet container
    Top: BottomSheetHandle component
    Below: children prop (scrollable or fixed)
    KeyboardAvoidingView wrapper (for sheets with inputs)
```

---

### Props Interface

```
PROPS:
  ref (forwarded):     BottomSheetRef type
                       Methods: open(), close(), snapTo(index: number)

  snapPoints:          string[] — e.g., ['40%', '70%', '95%']
                       Each is % of screen height the sheet occupies
                       First snap = default on open

  defaultSnapIndex:    number — DEFAULT 0 (first snapPoint)

  onClose:             () => void — callback when sheet fully closes
                       Use case: clear form state, reset filters, etc.

  closeOnBackdropPress: boolean DEFAULT true
                        Set false for: mandatory action sheets
                        (e.g., "You must accept terms to continue")

  enablePanDownToClose: boolean DEFAULT true
                        Set false for: sheets where user might drag content
                        (e.g., map picker inside sheet)

  children:            React.ReactNode

  contentPadding:      boolean DEFAULT true
                       false for sheets where content needs edge-to-edge
                       (e.g., map, image list)
```

---

### Animation Specification

```
SHARED VALUES (Reanimated 3):
  translateY: SharedValue<number> — controls sheet vertical position
              Initial: screenHeight (off-screen below)
  backdropOpacity: SharedValue<number> — controls backdrop visibility
                   Initial: 0 (invisible)

OPEN SEQUENCE:
  Step 1: Mount component (render sheet, but translateY = screenHeight)
  Step 2: Set translateY → targetY (spring-gentle)
          targetY = screenHeight - (screenHeight × snapPoint%)
  Step 3: Set backdropOpacity → 0.45 (timingConfig.normal 250ms)
  All three happen simultaneously
  spring-gentle: damping 20, stiffness 150 — slow, premium feel
  PEAK-END: the slow rise = the PEAK moment of BottomSheet

CLOSE SEQUENCE:
  Step 1: Set translateY → screenHeight (spring-stiff)
          spring-stiff: damping 30, stiffness 500 — fast, decisive
  Step 2: Set backdropOpacity → 0 (timingConfig.fast 150ms)
  After animation complete: call onClose() callback

DRAG GESTURE:
  PanGestureHandler wrapping handle area + content area
  During drag DOWN:
    translateY follows gesture.translationY + snapPointY
    NO bouncing below screenHeight (clamp at bottom)
  During drag UP:
    translateY follows gesture — can go higher than default snap
    Clamp at (screenHeight * 0.05) — never goes to full height unless snap point

  ON GESTURE END:
    Check velocity: gesture.velocityY

    IF velocity > 600 (fast fling down):
      → Close immediately (spring-stiff)
      → MICRO-INTENTION: "User made a decisive swipe, respect it immediately"

    IF velocity < -400 (fast fling up):
      → Snap to NEXT higher snap point (spring-gentle)

    IF -400 < velocity < 600 (slow drag):
      → Find nearest snap point based on current translateY
      → Spring to that snap point (spring-default)

  HAPTIC on drag start: selectionAsync (light acknowledgment)
  HAPTIC on snap: selectionAsync
  HAPTIC on close: none (already happening, no need to signal)
```

---

### Status Bar Behavior

```
ON OPEN:
  StatusBar.setBarStyle('light-content')
  Why: backdrop is dark, white icons needed on dark bg

ON CLOSE:
  StatusBar.setBarStyle('dark-content')  ← restored to default
  Or: restore to what it was before open (save previous style)

SAVE PREVIOUS STYLE:
  On open: save current StatusBar style
  On close: restore saved style
  Handles: sheets opened from both dark and light screens
```

---

### BottomSheet Ref API

```
TYPE: BottomSheetRef
  open(): void      → opens to defaultSnapIndex
  close(): void     → closes with animation
  snapTo(index: number): void → snaps to snapPoints[index]

USAGE:
  const sheetRef = useRef<BottomSheetRef>(null)
  
  // Open
  sheetRef.current?.open()
  
  // Close
  sheetRef.current?.close()
  
  // Snap to second point (70%)
  sheetRef.current?.snapTo(1)

IMPLEMENTATION:
  useImperativeHandle(ref, () => ({
    open: () => animateOpen(),
    close: () => animateClose(),
    snapTo: (index) => animateToSnap(snapPoints[index]),
  }))
```

---

## Task 6.2 — BottomSheetHandle Component
### Duration: 15 minutes
### File: `src/components/layout/BottomSheet/BottomSheetHandle.tsx`

```
PURPOSE:
  The drag handle bar inside every BottomSheet.
  Visual affordance: "This is draggable."
  Touch affordance: "Press me to initiate drag."

VISUAL SPECIFICATION:
  Width: 40px
  Height: 4px
  Border radius: radius.pill (100px)
  Color: #E2E8F0 (colors.border)
  Alignment: centered horizontally
  Margins: marginTop 10px, marginBottom 8px

PRESS INTERACTION:
  Not a button — it's a drag zone
  But responds to tap with scale:
    scale: 1.0 → 1.2 → 1.0 (spring-snappy, 200ms total)
    MICRO-INTENTION: "I acknowledge you touched me"
    Haptic: selectionAsync

TOUCH AREA:
  Visible handle: 40×4px
  Actual touch area: 40×28px (handle area in BottomSheet)
  The 28px height (handle container) = comfortable drag zone
  Fitts' Law: 28px vertical target = easy to start drag

RECOGNITION OVER RECALL:
  The pill-shaped handle = universal draggable indicator
  Users from iOS (sheet) and Android (bottom nav) both know this
  No label needed. No tooltip needed. Shape communicates function.
```

---

## Task 6.3 — ActionSheet Component
### Duration: 25 minutes
### File: `src/components/layout/ActionSheet/ActionSheet.tsx`

```
PURPOSE:
  Simplified BottomSheet for action lists.
  Used when user needs to pick ONE action from a short list.
  Different from FilterSheet (which has complex selections).

DIFFERENCE FROM BOTTOMSHEET:
  BottomSheet: flexible container for any content
  ActionSheet: fixed layout for action lists only

WHERE IT'S USED:
  Photo picker: "Camera" | "Gallery" | "Cancel"
  Worker ⋯ menu: "Report" | "Block" | "Share"
  Booking ⋯ menu: "Reschedule" | "Cancel" | "Contact"
  Delete confirm: "Delete" | "Cancel"
  Sort options (simple): list of sort choices

PROPS:
  isVisible: boolean
  onClose: () => void
  title: string (optional)
  actions: ActionItem[]
  cancelLabel: string DEFAULT "Cancel"

TYPE:
  ActionItem:
    label: string
    icon: LucideIcon (optional)
    variant: 'default' | 'danger' | 'disabled'
    onPress: () => void

VISUAL SPECIFICATION:
  Container: BottomSheet internally (uses it as base)
  snapPoints: ['auto'] — fits content height
  Max height: 60% of screen

  Content layout:
    Title (if provided):
      Poppins SemiBold 15px textMuted, centered
      paddingV: 12px paddingH: 20px
      Bottom border: 1px colors.border

    Each action row:
      Height: 52px (Fitts' Law — comfortable tap area)
      Icon (if provided): 20px, left side, 16px from left
      Label: Plus Jakarta Sans SemiBold 15px
        default: textPrimary
        danger: colors.danger (#EF4444)
        disabled: textMuted
      Border bottom: 1px colors.border (between rows)
      Press: BG highlights to bgSection (150ms)
      Haptic: light on press (except danger = medium)

    Cancel button:
      Separate from action list (space between)
      Height: 52px
      Label: Plus Jakarta Sans SemiBold 15px textMuted
      BG: slightly different (bgSection)
      Press: haptic light + close

  Backdrop: same as BottomSheet
  Open/Close animation: same as BottomSheet

MICRO-INTENTION:
  Each action: BG highlight = "I'm about to execute this"
  Cancel: muted style = "This is the safe exit"
  Danger action: red text = "This is irreversible, be sure"
  JAKOB'S LAW: iOS action sheet style = every user knows this
```

---

## Task 6.4 — Chip Component
### Duration: 35 minutes
### File: `src/components/ui/Chip/Chip.tsx`

---

### Why Chip Needs Maximum Care

```
CHIP USAGE IN FULL APP:
  Search filter chips    → category selection
  Sort chips             → sort option selection
  Booking time slots     → time selection
  Worker skill tags      → display only (non-interactive)
  Filter active chips    → shows active filter + remove
  BookingStatusChip      → PENDING, ACCEPTED, etc.
  AvailabilityChip       → "Available now", "Today"
  ServiceTagChip         → on worker cards

THAT'S 8 CONTEXTS. ONE COMPONENT.
Each context uses different: size, variant, interactive mode.
Get the props right. Everything else is easy.
```

---

### Props Interface

```
COMPLETE PROPS:
  label:         string (required)

  selected:      boolean DEFAULT false
                 Visual: selected = green BG, unselected = gray BG

  onPress:       (() => void) | undefined
                 If undefined: chip is DISPLAY ONLY (no press, no hover)
                 If provided: chip is INTERACTIVE

  icon:          LucideIcon | React.ReactNode (optional)
                 Rendered LEFT of label
                 Size matches Chip size

  trailingIcon:  LucideIcon | React.ReactNode (optional)
                 Rendered RIGHT of label
                 Use case: × remove icon on active filter chips

  onTrailingPress: () => void (optional)
                 Handler for trailingIcon tap
                 Separate from main chip press (e.g., remove filter vs view filter)

  size:          'xs' | 'sm' | 'md' DEFAULT 'md'
                 xs: 26px height, 8px paddingH, 11px font (status badges)
                 sm: 30px height, 10px paddingH, 12px font (compact contexts)
                 md: 36px height, 14px paddingH, 13px font (filter contexts)

  variant:       'filter' | 'status' | 'skill' | 'tag'
                 filter: selectable, green on select (search/booking chips)
                 status: colored bg based on semantic (booking status)
                         uses statusColors map (green/amber/red/blue)
                 skill:  display only, green-tinted when verified
                 tag:    display only, neutral styling (service tags on cards)

  statusColor:   'success' | 'warning' | 'danger' | 'info' (for status variant)

  showCheckmark: boolean DEFAULT true (for filter variant)
                 Set false: when chip shows icon and checkmark would crowd

  style:         ViewStyle (override)
  textStyle:     TextStyle (label override)
  disabled:      boolean DEFAULT false
```

---

### Visual States

```
FILTER VARIANT (interactive):

  UNSELECTED:
    BG:     colors.bgInput (#F4F5F7)
    Border: none
    Label:  Plus Jakarta Sans Medium, colors.textMuted
    Icon:   colors.textMuted

  SELECTED:
    BG:     colors.primary (#16A34A)
    Border: none
    Label:  Plus Jakarta Sans SemiBold, white
    Icon:   white
    Left:   ✓ checkmark (14px white) — appears with animation

  PRESSED (interactive only):
    scale: 0.95 → 0.96 (spring-stiff)

  RELEASED:
    scale: → 1.03 → 1.0 (spring-bouncy, overshoot)

STATUS VARIANT (display only):
  success:  BG #F0FDF4, text #14532D, border #BBF7D0
  warning:  BG #FEF3C7, text #92400E, border #FCD34D
  danger:   BG #FEF2F2, text #991B1B, border #FCA5A5
  info:     BG #EFF6FF, text #1E40AF, border #BFDBFE

SKILL VARIANT (display only):
  verified:   BG colors.bgSuccess, border colors.primaryBorder, text colors.textGreen
  unverified: BG colors.bgInput, border none, text colors.textMuted

TAG VARIANT (display only):
  BG: colors.bgSection, border none, text colors.textSecondary
```

---

### Animation Specification

```
ON SELECT (filter variant):

  STEP 1 — PressIn (immediate):
    scale: 1.0 → 0.96 (spring-stiff — "received your press")
    Duration: ~60ms

  STEP 2 — Color transition (BG + label color):
    BG: bgInput → primary (interpolateColor, timingConfig.fast 150ms)
    Label: muted → white (timingConfig.fast 150ms)
    SIMULTANEOUS with step 1

  STEP 3 — Checkmark appears (30ms delay after step 2):
    Checkmark scale: 0 → 1.2 → 1.0 (spring-bouncy)
    Opacity: 0 → 1 (simultaneous)
    Width: 0 → 16px (accommodates checkmark without layout jump)

  STEP 4 — Release (PressOut):
    scale: 0.96 → 1.03 → 1.0 (spring-bouncy — "alive, responding")
    The overshoot to 1.03 = PEAK micro-moment
    User feels: "something satisfying just happened"

  HAPTIC: selectionAsync on press (NOT on release)
    Why on press not release: immediate acknowledgment feels faster

ON DESELECT (filter variant):
  Exact reverse sequence
  Checkmark: scale 1→0 + opacity 1→0 (spring-stiff)
  BG: primary → bgInput (timingConfig.fast)
  Scale: 1→0.96 (press) → 1.0 (release, spring-default)

TRAILING ICON TAP:
  Separate PressableArea around trailingIcon
  hitSlop: 12px (Fitts' Law)
  On tap: haptic light + call onTrailingPress
  No chip selection happens (separate action from chip press)
```

---

## Task 6.5 — ChipGroup Component
### Duration: 25 minutes
### File: `src/components/ui/Chip/ChipGroup.tsx`

```
PURPOSE:
  Container for multiple Chips.
  Handles: horizontal scroll, multi/single select logic,
           active chip scroll-into-view, wrapping layout.

PROPS:
  options:       Array<ChipOption>
                 ChipOption: { label, value, icon?, trailingIcon? }

  selected:      string | string[]
                 string = single select mode
                 string[] = multi select mode

  onSelect:      (value: string) => void
                 Called with the value of tapped chip
                 Parent manages selected state

  multiSelect:   boolean DEFAULT false
                 false: tapping chip A deselects chip B
                 true: multiple chips can be selected simultaneously

  scrollable:    boolean DEFAULT true
                 true: horizontal ScrollView (filter contexts)
                 false: flexWrap row (wraps to multiple lines — skill tags)

  chipSize:      'xs' | 'sm' | 'md' DEFAULT 'md'
                 Passed to all child Chips

  chipVariant:   Chip['variant'] DEFAULT 'filter'

  paddingH:      number DEFAULT 16

LAYOUT BEHAVIOR:

  scrollable = true:
    ScrollView horizontal, showsHorizontalScrollIndicator: false
    contentContainerStyle: gap 8px, paddingH from prop
    ALL chips in single horizontal row
    RECOGNITION: peek of next chip signals "more chips exist, scroll"
    Peek achieved: contentContainerPaddingRight: 8px
                   container overflows right edge slightly

  scrollable = false:
    View with flexWrap: 'wrap', flexDirection: 'row'
    gap: 8px horizontal + 8px vertical
    Use case: skill tags on worker profile (all visible, no scroll)

ACTIVE CHIP SCROLL-INTO-VIEW:
  When a chip becomes selected:
    Find its position in the ScrollView
    scrollTo({ x: chipX - 16, animated: true })
    WHY: RECOGNITION — user always sees their selected filter
         If it's off-screen, they forget it's selected

MULTI-SELECT LOGIC:
  onSelect receives value
  Parent decides: toggle in array (multi) or replace (single)
  ChipGroup is stateless (controlled component)

SEPARATOR BETWEEN CHIPS:
  No visible separator — gap handles spacing
  Not a divider/border — chips float independently
```

---

## Task 6.6 — SearchInput Component
### Duration: 25 minutes
### File: `src/components/ui/Input/SearchInput.tsx`

```
NOTE: This is NOT SearchPromptBar (Day 5 — fake, navigates).
This is the REAL input — used ON the search screen.

PURPOSE:
  Real text input with search UX behaviors.
  Focused on task: accept query, show clear, stay focused.

DIFFERENCE FROM TextInput (Day 2):
  TextInput: floating label, error states, form validation
  SearchInput: no label, no error, has clear button, always auto-focused
  They serve different contexts — separate components (Hick's Law)

PROPS:
  value:              string (controlled)
  onChangeText:       (text: string) => void
  onClear:            () => void
  onSubmitEditing:    () => void (optional — tap keyboard search button)
  placeholder:        string DEFAULT "Search services, workers..."
  autoFocus:          boolean DEFAULT true
  editable:           boolean DEFAULT true
  style:              ViewStyle (container override)

VISUAL SPECIFICATION:

  CONTAINER:
    Height: 48px
    Width: 100% (flex 1 when inside row with filter button)
    BG: colors.bgInput (#F4F5F7)
    Border radius: radius.pill (100px — distinctive from regular inputs)
    Border: 1.5px transparent (idle)

  ON FOCUS:
    Border: 1.5px colors.primary (#16A34A)
    Border transition: timingConfig.fast 150ms (scale-x: 0→1 on border reveal)
    MICRO-INTENTION: "I'm ready to accept your search"

  CONTENTS (left to right):
    Left: Search icon (Lucide Search, 18px)
      Idle: colors.textMuted
      Focused: colors.primary (150ms color transition)
      Padding left: 14px
      Padding right: 8px (gap between icon and text)

    Center: RNTextInput
      Font: Plus Jakarta Sans Regular 15px textPrimary
      Placeholder: Plus Jakarta Sans Regular 15px textMuted
      selectionColor: colors.primary
      returnKeyType: 'search'
      keyboardType: 'default'
      autoCorrect: false
      autoCapitalize: 'none'
      clearButtonMode: 'never' (we handle this manually)
      flex: 1

    Right: Clear button (conditional)
      Size: 20×20px circle
      BG: colors.bgSection (#F8F9FA)
      Icon: X (Lucide), 12px, colors.textMuted
      VISIBILITY:
        value.length === 0: opacity 0, scale 0, pointer-events none
        value.length > 0: opacity 1, scale 1 (spring-bouncy)
      hitSlop: 12px (Fitts' Law — small visual, large touch)
      Padding right: 12px from edge
      onPress: call onClear() + keep focus (input stays focused)
        MICRO-INTENTION: "I cleared it but I know you want to keep searching"

FOCUS BEHAVIOR:
  autoFocus: true → keyboard appears immediately on screen mount
  JAKOB'S LAW: every search screen has instant keyboard
  No "tap to activate" — you're here to search, start typing
  FITTS' LAW: keyboard up = no extra tap = zero friction

CLEAR ANIMATION DETAIL:
  X button container animated with Reanimated:
    SharedValue: xOpacity (0 or 1)
    SharedValue: xScale (0 or 1)
  When value changes from '' to text:
    xOpacity: withTiming(1, { duration: 150 })
    xScale: withSpring(1, springConfig.bouncy)
  When value returns to '':
    xOpacity: withTiming(0, { duration: 100 })
    xScale: withSpring(0, springConfig.stiff)
  PEAK-END: the bouncy appearance of X = micro-delight of "I can clear this"
```

---

## Task 6.7 — SearchHeader Component
### Duration: 20 minutes
### File: `src/components/home/SearchHeader.tsx`

```
PURPOSE:
  Reusable sticky header for search/explore context.
  Contains: SearchInput + optional filter button.
  Separate from HomeHeader — different context, different needs.

WHERE USED:
  Explore tab (app/(tabs)/explore.tsx)
  Search results (app/search/index.tsx — Day 7)
  Category screen (app/category/[id].tsx — Day 7)
  Each context uses SearchHeader with slight customization via props

PROPS:
  value:             string (search value)
  onChangeText:      (text: string) => void
  onClear:           () => void
  placeholder:       string (optional override)
  showFilterButton:  boolean DEFAULT true
  activeFilterCount: number DEFAULT 0
  onFilterPress:     () => void (optional)
  showBackButton:    boolean DEFAULT false
  onBackPress:       () => void (optional)

LAYOUT:
  Container:
    Position: relative (not absolute — part of screen flow)
    BG: colors.bgCard (#FFFFFF)
    Padding: safe area top + 10px bottom
    Horizontal padding: 16px
    Shadow: rendered by ScrollView + this header stays at top
            Shadow appears: after user scrolls (conditional shadow)

  INNER ROW (flexDirection row, alignItems center):

    Left (conditional): ← back button
      IconButton: ChevronLeft 20px, size 36px
      Only when showBackButton = true
      Margin right: 8px

    Center: SearchInput (flex 1)

    Right (conditional): Filter button
      Only when showFilterButton = true
      IconButton: sliders-horizontal (Lucide) 20px
      Size: 40px visual, 44×44 touch area
      BG: colors.bgInput
      
      FILTER COUNT BADGE:
        When activeFilterCount > 0:
          Badge: 16px circle, BG colors.primary, white text
          Position: top-right of filter icon (absolute)
          Text: Inter Bold 9px (count number)
          count > 9: shows "9+"
          Appearance: scale 0→1.2→1.0 (spring-bouncy)
          RECOGNITION: badge = "filters are active" = user sees state

SCROLL SHADOW BEHAVIOR:
  The Explore screen's ScrollView triggers onScroll
  Pass scrollY to SearchHeader via prop
  When scrollY > 10: show shadow-sm on header
  When scrollY <= 10: no shadow (at top of screen = no separation needed)
  This is cosmetic — shows content is scrolled under header
```

---

## Task 6.8 — RadioGroup Component
### Duration: 20 minutes
### File: `src/components/ui/Radio/RadioGroup.tsx`

```
PURPOSE:
  Single-select option group.
  Used in: Sort options (Filter sheet), booking questions.
  Reusable across any single-choice context.

WHY NOT USE CHIPS FOR SORT:
  Radio = "pick exactly one from a list" — clear semantic
  Chips = "filter, toggle" — different semantic
  Users understand radio differently from chips
  JAKOB'S LAW: radio group = every form the user has ever seen

PROPS:
  options:     Array<{ label: string, value: string, description?: string }>
  selected:    string (the selected value)
  onChange:    (value: string) => void
  style:       ViewStyle

VISUAL PER OPTION:
  Container: Pressable, 48px height (Fitts' Law), full width
  flexDirection: row, alignItems: center
  Padding: 14px left, 14px right

  Left: Radio circle
    Size: 20×20px outer circle
    Border: 2px colors.border (unselected)
    Border: 2px colors.primary (selected)
    Inside: 10×10px inner circle, BG colors.primary (selected) | transparent
    Animation on select: inner circle scale 0→1 (spring-snappy)
    MICRO-INTENTION: dot growing = selection appearing

  Center (flex 1, marginLeft 12):
    Label: Plus Jakarta Sans SemiBold 14px textPrimary (selected)
           Plus Jakarta Sans Regular 14px textPrimary (unselected)
    Description (if provided):
           Plus Jakarta Sans Regular 12px textMuted (below label)

  Divider (between options): 1px colors.border, no horizontal inset

ANIMATION ON SELECT:
  Previous selected: inner dot scale 1→0 (spring-stiff)
  New selected: inner dot scale 0→1 (spring-snappy)
  Label: font-weight Regular→SemiBold (no animation — instant)
  Haptic: selectionAsync on each select

ACCESSIBILITY:
  accessibilityRole: 'radio' on each option
  accessibilityState: { checked: isSelected }
  Group accessibilityRole: 'radiogroup'
```

---

## Task 6.9 — StarRatingFilter Component
### Duration: 20 minutes
### File: `src/components/ui/Rating/StarRatingFilter.tsx`

```
PURPOSE:
  Interactive star filter for "minimum rating" in filter sheet.
  Different from StarRating (display) and RatingInput (review submission).
  This one specifically means "show me workers rated N stars or above."

WHY SEPARATE FROM EXISTING RATING COMPONENTS:
  StarRating (display): shows a fixed rating value, no interaction
  RatingInput (review): submits your rating, 1-5
  StarRatingFilter (filter): sets minimum threshold, different UX

PROPS:
  value:     number (0 = any rating, 1-5 = minimum)
  onChange:  (value: number) => void
  size:      number DEFAULT 28 (star size)

VISUAL:
  5 stars in a row, gap 10px
  Each star: size × size (28×28px)
  Unfiltered (gold) stars: 1 to value
  Filtered (gray) stars: value+1 to 5

  Star colors:
    Gold: #F59E0B (amber — universal star color)
    Gray: colors.border (#E2E8F0)

  Label below (8px gap):
    value === 0: "Any rating" (Plus Jakarta Regular 13px muted)
    value === 1: "1★ and above" (Plus Jakarta Regular 13px muted)
    value === 2: "2★ and above" (Plus Jakarta Regular 13px muted)
    value === 3: "3★ and above" (Plus Jakarta Regular 13px muted)
    value === 4: "4★ and above" (Plus Jakarta Regular 13px muted)
    value === 5: "5 stars only" (Plus Jakarta Regular 13px muted)
    Label transitions: cross-fade when value changes (opacity 0→1, 150ms)

TAP BEHAVIOR:
  Tap star 3: sets value to 3 (3★ and above)
  Tap star 3 again (already selected): sets value to 0 (any)
  → Toggle: selecting same star = clear filter
  → GOAL GRADIENT: user sees "4★ and above" = confident in quality

ANIMATION ON TAP:
  Stars 1→tapped: fill gold sequentially (30ms stagger)
    Each: opacity 0.5→1 + scale 0.8→1.0 (spring-snappy)
  Stars tapped+1→5: unfill (gray) sequentially (20ms stagger)
  Label: cross-fade to new text (150ms)
  Haptic: selectionAsync per star touched during cascade

PEAK-END:
  The cascade fill animation = mini peak moment
  Even a simple filter interaction feels premium
```

---

## AFTERNOON SESSION — 4 Hours

---

## Task 6.10 — search.types.ts
### Duration: 15 minutes
### File: `src/types/search.types.ts`

```
TYPES TO DEFINE:

  SortOption:
    'distance'   → nearest first (default)
    'rating'     → highest rated first
    'price_low'  → lowest starting price first
    'price_high' → highest starting price first

  FilterState:
    categories: string[]    → selected category IDs (empty = all)
    minRating:  number      → 0 = any, 1-5 = minimum stars
    maxRate:    number      → 0 = unlimited, N = max Rs/hr
    sortBy:     SortOption  → DEFAULT 'distance'
    available:  'any' | 'now' | 'today'

  DEFAULT_FILTERS: FilterState:
    { categories: [], minRating: 0, maxRate: 0, sortBy: 'distance', available: 'any' }
    This constant used to reset filters

  SearchParams:
    q:         string
    category?: string
    minRating?: number
    maxRate?:  number
    radius?:   number
    sortBy?:   SortOption
    available?: string
    page?:     number
    limit?:    number

  SearchResult:
    workers: WorkerNearby[]
    total: number
    page: number
    hasMore: boolean

  RecentSearch:
    query: string
    timestamp: number  → for sorting by recency

  SearchSuggestion:
    type: 'worker' | 'service' | 'category'
    id: string
    label: string
    subLabel?: string
    iconUrl?: string

EXPORT:
  All types as named exports
  DEFAULT_FILTERS as a constant (important for filter reset)
```

---

## Task 6.11 — search.api.ts
### Duration: 20 minutes
### File: `src/services/api/search.api.ts`

```
PURPOSE:
  All HTTP calls for search functionality.
  Returns lean data types (WorkerNearby, not WorkerPublicProfile).

METHODS:

  searchWorkers(params: SearchParams):
    Endpoint: GET /search/workers
    Query params: q, category, minRating, maxRate, radius, sortBy, available, page, limit
    Returns: SearchResult { workers, total, page, hasMore }
    Authorization: Bearer token (all search is authenticated)
    Timeout: 10s (search should be fast)

    CACHING STRATEGY:
      React Query key: ['search', params]
      staleTime: 30_000 (30s)
      Results are location-dependent — use location in cache key
      Different location = different results = different cache entry

  getSuggestions(query: string, lat: number, lng: number):
    Endpoint: GET /search/suggest
    Params: q, lat, lng
    Returns: SearchSuggestion[]
    staleTime: 60_000 (1 min)
    enabled: query.length >= 3 (suggestions need 3+ chars)

  getPopularSearches(lat: number, lng: number):
    Endpoint: GET /search/popular
    Returns: string[] (popular search terms in user's area)
    staleTime: 3600_000 (1 hour — popular terms change slowly)
    Used on: empty search state below SearchInput

ERROR HANDLING:
  Network timeout: return empty results (not error state for search)
  401: let interceptor handle (refresh or redirect)
  500: throw error (parent hook handles with isError state)
  No toast from API layer — hooks handle user feedback
```

---

## Task 6.12 — useSearch Hook
### Duration: 25 minutes
### File: `src/hooks/useSearch.ts`

```
PURPOSE:
  Complete search state management.
  One hook = all search logic (query, debounce, filters, results, pagination).

RETURNED API:
  query:           string (raw query, updates immediately)
  setQuery:        (q: string) => void
  debouncedQuery:  string (400ms delayed — used for API calls)
  filters:         FilterState
  setFilters:      (f: FilterState) => void
  resetFilters:    () => void (resets to DEFAULT_FILTERS)
  activeFilterCount: number (how many non-default filters are active)
  workers:         WorkerNearby[] (all loaded results, paginated)
  total:           number (total count from API)
  isLoading:       boolean (first page loading)
  isLoadingMore:   boolean (subsequent pages loading)
  isError:         boolean
  error:           Error | null
  hasMore:         boolean
  loadMore:        () => void (call on FlashList onEndReached)
  refetch:         () => void (manual refresh)
  clearSearch:     () => void (clears query + filters + results)

INTERNAL LOGIC:

  DEBOUNCE IMPLEMENTATION:
    useRef for timeout ID
    useEffect watching query:
      clearTimeout(timeoutId.current)
      timeoutId.current = setTimeout(() => setDebouncedQuery(query), 400)
    Cleanup: clearTimeout on unmount
    WHY MANUAL debounce not library:
      Full control, no additional dependency
      Simple enough to implement manually

  REACT QUERY SETUP:
    useInfiniteQuery({
      queryKey: ['search', debouncedQuery, filters, location],
      queryFn: ({ pageParam }) => searchApi.searchWorkers({
        q: debouncedQuery,
        ...filtersToParams(filters),
        page: pageParam,
        limit: 20,
      }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) =>
        lastPage.hasMore ? lastPage.page + 1 : undefined,
      enabled: debouncedQuery.length >= 2,
      staleTime: 30_000,
    })

  WORKERS FLATTENING:
    data?.pages.flatMap(page => page.workers) ?? []
    → Converts pages array to single flat workers array

  ACTIVE FILTER COUNT:
    Compare each filter value to DEFAULT_FILTERS
    Count differences = activeFilterCount
    Used by: filter button badge display

  CLEAR SEARCH:
    setQuery('')
    setDebouncedQuery('')
    resetFilters()
    queryClient.removeQueries(['search'])

LOCATION DEPENDENCY:
  Import useLocationStore inside hook
  location.currentLocation available as lat/lng
  Include in queryKey so location change = new search
```

---

## Task 6.13 — useRecentSearches Hook
### Duration: 15 minutes
### File: `src/hooks/useRecentSearches.ts`

```
PURPOSE:
  MMKV-backed storage of recent search queries.
  Shown when SearchInput is empty.

MMKV KEY: 'user:recent_searches'
FORMAT: JSON string of string array, max 8 items
READS: Synchronous (MMKV) — no loading state needed

RETURNED API:
  searches:      string[] (recent queries, most recent first)
  addSearch:     (query: string) => void
  removeSearch:  (query: string) => void
  clearAll:      () => void
  hasSearches:   boolean (searches.length > 0)

LOGIC:

  addSearch(query):
    Trim query, ignore if < 2 chars
    If already in list: remove from current position
    Prepend to front (most recent = first shown)
    Trim to 8 items (oldest removed from back)
    Save to MMKV
    Update local state (useState)

  removeSearch(query):
    Filter out the query
    Save to MMKV
    Update local state

  clearAll():
    MMKV.delete('user:recent_searches')
    Set local state to []

  WHEN TO CALL addSearch:
    Not from this hook
    The Explore screen calls addSearch when:
      User submits search (taps keyboard 'search' button)
      OR user taps a WorkerSearchCard from results
    This saves what users actually intended, not what they typed

PERSISTENCE:
  Survives app kill and relaunch
  Per-user: ideally key includes userId:
    'user:${userId}:recent_searches'
    Prevents searches from one user showing to another (shared device)
```

---

## Task 6.14 — WorkerSearchCard Component
### Duration: 25 minutes
### File: `src/components/worker/WorkerSearchCard.tsx`

```
PURPOSE:
  Worker card specifically for search results and category screens.
  Shows MORE info than WorkerCard compact (list) and
  MORE info than WorkerCardHorizontal (horizontal scroll).
  This is the FULLEST card variant for discovery contexts.

USED IN:
  Explore tab search results
  Category screen workers tab (Day 7)
  Future: Search result screen (app/search/index.tsx)

DIMENSIONS:
  Width: full (100% - 32px margins)
  Height: ~96px (auto, flexible)
  Border radius: radius.lg (16px)
  BG: colors.bgCard (#FFFFFF)
  Shadow: shadows.sm
  Margin bottom: layout.cardGap (10px)

LAYOUT SPECIFICATION:
  Padding: 14px all sides

  LEFT COLUMN:
    Avatar: 52×52px circle
      expo-image, blurhash placeholder, objectFit: cover
      borderRadius: 26 (circle)
    OnlineBadge: 10px, bottom-right of avatar
      green pulse if AVAILABLE
      amber static if BUSY
      gray static if OFFLINE

  CENTER COLUMN (flex: 1, marginLeft: 12, gap: 3):

    ROW 1 — Worker name:
      Poppins SemiBold 15px textPrimary
      numberOfLines: 1 (ellipsis if long name)

    ROW 2 — Category chips (display-only):
      Flex row, flexWrap: wrap
      Each chip: Chip variant="tag" size="xs"
      Max 3 chips (overflow hidden)
      e.g., [Electrician] [AC Repair]

    ROW 3 — Rating + Reviews + Distance row:
      ⭐ = star emoji/icon 14px gold
      Rating: Inter SemiBold 13px textPrimary (NUMBER)
      " (124)" = Plus Jakarta Regular 11px textMuted
      " · " separator
      "1.2 km" = Inter Medium 12px textMuted (NUMBER)
      " · " separator (if response time available)
      "~8 min reply" = Plus Jakarta Regular 11px textMuted

  RIGHT COLUMN:
    Stack (flexDirection column, alignItems flex-end, gap: 4):

    Price:
      "Rs 500" = Inter SemiBold 14px colors.primary (NUMBER)
      "/hr" or "/visit" = Plus Jakarta Regular 11px textMuted
      Combined: "Rs 500/hr"

    Availability badge:
      WorkerAvailabilityBadge (reused from Day 5!)
      size: 'sm'
      Shows: "Available now" / "On a job" / "Offline"

PRESS INTERACTION:
  Entire card is PressCard (entire area tappable — Fitts' Law)
  onPressIn:
    1. Haptic: selectionAsync (immediate acknowledgment)
    2. Prefetch worker profile:
       queryClient.prefetchQuery(['worker', worker.id], ...)
       WHY: profile loads INSTANTLY when user navigates
       GOAL GRADIENT: instant navigation = feeling of being near the goal
  onPress:
    router.push(`/worker/${worker.id}`)
  Animation:
    scale: 1.0 → 0.97 (spring-stiff on pressIn)
    scale: 0.97 → 1.0 (spring-default on release)
    Shadow: sm → none (press) → sm (release)

SKELETON VARIANT:
  FILE: src/components/ui/Skeleton/SkeletonWorkerSearchCard.tsx
  96px height, full width
  Left: 52px circle skeleton
  Center: 3 text row skeletons (name width 140, category 80+60, rating 200)
  Right: 60×14 rectangle + 70×11 rectangle
```

---

## Task 6.15 — SkeletonWorkerSearchCard
### Duration: 10 minutes
### File: `src/components/ui/Skeleton/SkeletonWorkerSearchCard.tsx`

```
MATCHES: WorkerSearchCard exactly (same padding, same layout)

INTERNAL LAYOUT (using Skeleton base component):
  Container: 96px auto height, full width, radius lg, BG bgCard
  Padding: 14px all sides
  flexDirection: row

  Left: Skeleton 52×52px, borderRadius 26 (circle)

  Center (flex 1, marginLeft 12, gap 6):
    Row 1: Skeleton width=140 height=14 radius=4
    Row 2: Skeleton width=100 height=11 radius=4 (category)
    Row 3: Skeleton width=180 height=11 radius=4 (rating+distance)

  Right (alignItems flex-end, gap 6):
    Skeleton width=70 height=14 radius=4 (price)
    Skeleton width=80 height=11 radius=4 (availability)

SHIMMER: Inherited from Skeleton base (left→right, 1200ms loop)
USAGE:
  Show 5 × SkeletonWorkerSearchCard during search loading state
```

---

## Task 6.16 — FilterSheet Content Component
### Duration: 20 minutes
### File: `src/components/search/FilterSheetContent.tsx`

```
PURPOSE:
  The CONTENT inside the filter BottomSheet.
  Separate from app/search/filters.tsx (which is the screen route).
  This component = composable filter UI, usable in multiple places.

NOTE ON ARCHITECTURE:
  FilterSheetContent: the component (reusable)
  app/search/filters.tsx: uses FilterSheetContent (Day 6 route)
  app/category/[id].tsx: also uses FilterSheetContent with different props

WHY SEPARATE:
  Category screen has slightly different filter needs than search
  Extract the UI into a component, pass category-specific props
  HICK'S LAW: one filter component, configured per context

PROPS:
  filters:      FilterState (current values)
  onApply:      (filters: FilterState) => void
  onReset:      () => void
  resultCount:  number | null (for "Apply (N)" button)
  showCategories: boolean DEFAULT true (category screen may hide this)
  showMaxRate:  boolean DEFAULT true (some contexts don't need price filter)

LAYOUT (inside BottomSheet):

  HEADER ROW:
    "Filters" — Poppins Bold 18px textPrimary (left)
    "Reset" — Plus Jakarta Sans SemiBold 14px green (right)
    onPress Reset: call onReset() prop
    Padding: 20px H, 16px top, 12px bottom
    Border bottom: 1px colors.border

  SCROLLVIEW CONTENT (all filter sections):
    Padding: 20px H, 16px V
    Gap between sections: 24px

  SECTION 1 — Sort By:
    "Sort by" — Poppins SemiBold 14px textPrimary
    Margin bottom: 12px
    RadioGroup:
      options: [
        { label: "Nearest first", value: "distance" },
        { label: "Highest rated", value: "rating" },
        { label: "Lowest price", value: "price_low" },
      ]
      selected: filters.sortBy
      onChange: update filters.sortBy

  SECTION 2 — Category (if showCategories):
    "Category" — Poppins SemiBold 14px textPrimary
    Margin bottom: 12px
    ChipGroup:
      scrollable: true
      multiSelect: true
      options: from useCategories() hook
      selected: filters.categories
      onSelect: toggle in/out of filters.categories array
      chipSize: 'sm'

  SECTION 3 — Minimum Rating:
    "Minimum rating" — Poppins SemiBold 14px textPrimary
    Margin bottom: 8px
    StarRatingFilter:
      value: filters.minRating
      onChange: update filters.minRating

  SECTION 4 — Availability:
    "Availability" — Poppins SemiBold 14px textPrimary
    Margin bottom: 12px
    ChipGroup:
      scrollable: false (3 chips only, fits in one row)
      multiSelect: false
      options: [
        { label: "Any time", value: "any" },
        { label: "Available now", value: "now" },
        { label: "Today", value: "today" },
      ]
      selected: filters.available

  SECTION 5 — Max Hourly Rate (if showMaxRate):
    "Max hourly rate" — Poppins SemiBold 14px textPrimary
    Margin bottom: 8px
    → RangeSlider (Day 7) — placeholder today
    Today: skip this section or show static text "Coming soon"
    WHY DEFER: RangeSlider built Day 7 → add to FilterSheet Day 7

  STICKY APPLY BUTTON:
    Position: sticky at bottom of BottomSheet
    "Apply (N workers)" OR "Apply" if no count
    Button variant="primary" size="lg" fullWidth
    onPress: onApply(currentFilters)

    APPLY BUTTON COUNT:
      N = resultCount prop (passed from parent)
      If null: just "Apply Filters"
      If 0: "No workers match these filters" (danger button)
      If 1: "Apply (1 worker)"
      If N: "Apply (N workers)"
      Count updates when filters change (parent re-queries)
      GOAL GRADIENT: seeing "Apply (12 workers)" = goal is reachable

  MICRO-INTERACTIONS:
    Radio select: dot grows + label bolds (spring-snappy + haptic)
    Chip select: color morph + checkmark (chip component handles)
    Star tap: cascade gold fill (star component handles)
    Reset: all controls flash to default state (opacity 0.5→1, 150ms)
    Apply count change: number cross-fades (old out, new in, 100ms)
```

---

## Task 6.17 — Explore Tab Screen (Complete)
### Duration: 20 minutes
### File: `app/(tabs)/explore.tsx`

```
NOTE: This replaces the Day 4 placeholder ("Explore" text only).

SCREEN BG: colors.bgApp (#FAFAFA)

COMPONENT COMPOSITION (this screen = 100% composition of existing components):

  SearchHeader (Task 6.7):
    value: query (from useSearch)
    onChangeText: setQuery
    onClear: clearSearch
    showFilterButton: true
    activeFilterCount: from useSearch hook
    onFilterPress: filterSheet.current?.open()

  Active filters row (conditional):
    condition: filters !== DEFAULT_FILTERS
    ChipGroup (horizontal scroll, removable chips):
      Each active filter → Chip with trailingIcon=X and onTrailingPress
      Removes that specific filter from FilterState

  FlashList (MAIN CONTENT):

    EMPTY QUERY STATE (query.length < 2):

      Section: "Recent Searches" (if searches.length > 0):
        Rendered by: RecentSearchesSection component (see below)

      Section: "Browse by Category":
        Section component + ChipGroup (categories, single-select)
        Tap chip → sets query to category name + sets filter

      Section: "Popular Searches":
        Section header + list of popular terms
        Each: same style as recent search row

    ACTIVE QUERY STATE (query.length >= 2):

      Result count row:
        "24 workers found" — Inter Medium 13px textMuted, paddingH 16
        (or isLoading: hidden/skeleton)

      Sort chips row:
        ChipGroup (horizontal, single-select, no scroll indicator):
          "Nearest" | "Top Rated" | "Lowest Price"
          Maps to: sortBy 'distance' | 'rating' | 'price_low'
          Active chip: green, others: gray

      FlashList data: workers (from useSearch)
        renderItem: WorkerSearchCard
        keyExtractor: worker.id
        estimatedItemSize: 96
        ItemSeparatorComponent: null (card has margin bottom)
        onEndReachedThreshold: 0.8
        onEndReached: loadMore

        LOADING (first page):
          ListEmptyComponent = 5 × SkeletonWorkerSearchCard

        LOADING MORE (additional pages):
          ListFooterComponent = when isLoadingMore: 2 × SkeletonWorkerSearchCard

        EMPTY RESULTS:
          ListEmptyComponent = EmptyState:
            Icon: search with 0
            Title: "No workers found" — Poppins SemiBold 18px
            Sub: "Try different terms or adjust filters"
            CTA: "Clear filters" (if active) | nothing (if no filters)

  FilterBottomSheet:
    BottomSheet ref, snapPoints: ['85%']
    Content: FilterSheetContent component
    onApply: setFilters + close sheet
    onReset: resetFilters + close sheet

WIRING:
  useSearch hook → all search data and actions
  useRecentSearches hook → recent queries display + save
  useCategories hook → category chips in browse section
  filterSheet ref → controls filter BottomSheet

ADDITIONAL COMPONENT FOR RECENT SEARCHES:
  FILE: src/components/search/RecentSearchesSection.tsx
  Purpose: renders the "Recent" section with search term list
  Props: searches[], onSelect(query), onRemove(query), onClearAll()
  Each row:
    Left: search icon 16px textMuted
    Center: term text (Plus Jakarta SemiBold 14px textPrimary, flex 1)
    Right: × button (16px, hitSlop 12px)
    Height: 48px (Fitts' Law)
    Press: onSelect(term) → fills SearchInput + triggers search + adds haptic light
  "Clear all" text link below list: Plus Jakarta Medium 13px muted right-aligned
```

---

## Task 6.18 — Integration Test
### Duration: 15 minutes

```
FUNCTIONAL TEST CHECKLIST:

  BottomSheet:
    □ Opens with spring-gentle animation
    □ Backdrop appears simultaneously with sheet
    □ Backdrop tap closes sheet
    □ Drag down with finger: sheet follows
    □ Fast fling down: closes immediately
    □ Slow drag < 60% height: springs back
    □ Close animation: spring-stiff + backdrop fade

  Chip:
    □ Unselected: gray BG
    □ Tap: green BG + checkmark appears (spring-bouncy)
    □ Tap again: returns to gray (deselects)
    □ Haptic fires on each tap
    □ trailingIcon tappable separately from chip

  ChipGroup:
    □ Single-select mode: tapping B deselects A
    □ Multi-select mode: can select multiple simultaneously
    □ Active chip scrolls into view on select
    □ Horizontal scroll works

  SearchInput:
    □ autoFocus: keyboard opens immediately on screen mount
    □ Clear X: appears when typing, disappears when cleared
    □ Clear X appearance: spring-bouncy scale + opacity
    □ onClear: clears value + keeps focus
    □ Border: green on focus, transitions smoothly

  RadioGroup:
    □ Radio dot fills on select (spring-snappy)
    □ Previous selection clears (spring-stiff)
    □ Haptic on select

  StarRatingFilter:
    □ Tap star 3: stars 1-3 fill gold, 4-5 gray
    □ Tap star 3 again: all clear (toggle off)
    □ Label updates to match selection
    □ Cascade animation: each star 30ms apart

  Explore Tab:
    □ SearchInput auto-focused on tab switch
    □ Empty state: recent searches + categories shown
    □ Type 2+ chars: results appear (after 400ms debounce)
    □ Results: WorkerSearchCard stagger in (50ms each)
    □ Filter button: activeFilterCount badge shows correctly
    □ Filter sheet: opens on filter button tap
    □ Apply filters: results re-fetch with new params
    □ Infinite scroll: new cards load at 80% scroll
    □ Recent search tap: fills input + triggers search

  Performance:
    □ No re-renders on each keystroke (debounce working)
    □ No white flash when switching to Explore tab
    □ Chip animations: 60fps on Android emulator

  Quality:
    □ tsc --noEmit: zero errors
    □ eslint: zero warnings
    □ No console.log statements
    □ No any types
```

---

## Day 6 — Complete New File List

```
MORNING SESSION FILES:
  src/components/layout/BottomSheet/BottomSheet.tsx
  src/components/layout/BottomSheet/BottomSheetHandle.tsx
  src/components/layout/BottomSheet/index.ts
  src/components/layout/ActionSheet/ActionSheet.tsx
  src/components/layout/ActionSheet/index.ts
  src/components/ui/Chip/Chip.tsx
  src/components/ui/Chip/ChipGroup.tsx
  src/components/ui/Chip/index.ts
  src/components/ui/Input/SearchInput.tsx

AFTERNOON SESSION FILES:
  src/components/home/SearchHeader.tsx
  src/components/ui/Radio/RadioGroup.tsx
  src/components/ui/Radio/index.ts
  src/components/ui/Rating/StarRatingFilter.tsx
  src/types/search.types.ts
  src/services/api/search.api.ts
  src/hooks/useSearch.ts
  src/hooks/useRecentSearches.ts
  src/components/worker/WorkerSearchCard.tsx
  src/components/ui/Skeleton/SkeletonWorkerSearchCard.tsx
  src/components/search/FilterSheetContent.tsx
  src/components/search/RecentSearchesSection.tsx
  app/search/filters.tsx  ← route (uses FilterSheetContent)
  app/(tabs)/explore.tsx  ← COMPLETE (replaces Day 4 placeholder)

UPDATED FILES:
  src/components/ui/Skeleton/index.ts  ← add SkeletonWorkerSearchCard export

TOTAL NEW FILES: 24
TOTAL UPDATED: 1

SCREEN SHIPPED: Explore tab (PRODUCTION COMPLETE)
```

---

## Day 6 — Component Reuse Map

```
COMPONENT            USED IN (Day 6 + Future)
───────────────────  ────────────────────────────────────────────
BottomSheet          Filter sheet (Day 6)
                     Booking time picker (Day 11)
                     Address picker (Day 12)
                     Cancel booking (Day 14)
                     Worker conflict (Day 10)
                     Country picker (Day 3 enhancement)
                     Dispute form (Day 18)
                     Share options (Day 9)

ActionSheet          Photo picker (Day 8 worker profile)
                     Worker ⋯ menu (Day 8)
                     Booking ⋯ menu (Day 14)
                     Sort options (Day 7)

Chip                 Filter chips (Day 6)
                     Time slots (Day 11)
                     Booking status chips (Day 14)
                     Worker skill tags (Day 8)
                     Category tags on cards (Day 6)

ChipGroup            All above contexts

SearchInput          Explore tab (Day 6)
                     Category screen (Day 7)
                     Search screen (Day 7)
                     Address search (Day 12)

SearchHeader         Explore tab (Day 6)
                     Category screen (Day 7)

RadioGroup           Sort options (Day 6)
                     Booking type (Day 11)
                     Dispute reason (Day 18)

StarRatingFilter     Filter sheet (Day 6)

WorkerSearchCard     Explore results (Day 6)
                     Category workers tab (Day 7)

FilterSheetContent   Explore filter (Day 6)
                     Category filter (Day 7)
```

---

## Day 6 — Micro-Interactions Summary

```
COMPONENT            MICRO-INTERACTION                     INTENTION

BottomSheet          Spring-gentle rise on open            "New context arriving"
                     Spring-stiff fall on close            "Task complete, gone"
                     Backdrop fade in/out                  "World dimmed for focus"
                     Handle scale on press                 "I'm grabbable"
                     Velocity-aware dismiss                "Respects decisive gestures"

ActionSheet          Same as BottomSheet
                     Action row BG highlight on press      "I see which you're picking"
                     Danger text red                       "This has consequences"

Chip (select)        PressIn scale 0.96                    "Received your tap"
                     BG morphs to green (150ms)            "Changing state"
                     Checkmark springs in (30ms delay)     "Selection confirmed"
                     PressOut scale 1.03→1.0               "Alive, responding"
                     Haptic selection                      "Acknowledged (invisible)"

SearchInput          Border green animates on focus         "Ready for input"
                     Icon color shifts green               "Synchronized focus signal"
                     Clear X spring-bouncy appear          "You can clear this"
                     Clear X disappear on empty            "Nothing to clear"

RadioGroup           Dot fills on select (spring-snappy)   "Your choice is captured"
                     Previous dot clears (spring-stiff)    "Previous choice released"
                     Label boldness change (instant)       "Active is visually heavier"

StarRatingFilter     Cascade gold fill (30ms stagger)      "Stars filling in sequence"
                     Label cross-fades                     "Label updated for your selection"
                     Haptic per star in cascade            "Each star acknowledged"

WorkerSearchCard     Full card scale 0.97 on press         "I'm responding to your tap"
                     Profile prefetch on pressIn           "Preparing your destination"
                     Instant profile load on navigate      "Your goal is immediately reachable"

Search results       Skeleton → stagger in (50ms each)     "Results arriving sequentially"
                     Filter badge appears (spring-bouncy)  "Filters are active, visible"
                     "Apply (N)" count updates             "Your filters have N results"
```

---

## Day 6 — Deliverable Checklist

```
COMPONENTS:
  □ BottomSheet: opens/closes, gesture dismiss, velocity-aware, backdrop
  □ BottomSheetHandle: visual, press scale, haptic
  □ ActionSheet: action list format, danger variant, cancel button
  □ Chip: all 4 variants (filter, status, skill, tag), 3 sizes
  □ Chip: all animations (select, deselect, trailing icon)
  □ ChipGroup: single + multi select, scrollable + wrap modes
  □ SearchInput: auto-focus, clear button animation, focus border
  □ SearchHeader: search + filter button, active filter count badge
  □ RadioGroup: dot fill animation, haptic, accessibility
  □ StarRatingFilter: cascade fill, toggle off, label update
  □ WorkerSearchCard: 6 data points, prefetch on pressIn, press animation
  □ SkeletonWorkerSearchCard: exact dimension match

ARCHITECTURE:
  □ FilterSheetContent: all 4 filter sections wired
  □ RecentSearchesSection: list + remove + clear all
  □ search.types.ts: all types + DEFAULT_FILTERS constant
  □ search.api.ts: searchWorkers + getSuggestions methods
  □ useSearch: debounce, React Query, pagination, activeFilterCount
  □ useRecentSearches: MMKV backed, max 8, move-to-front

SCREEN:
  □ Explore tab: COMPLETE
  □ Empty state: recent searches + categories
  □ Active search: results with stagger + skeleton
  □ Filter sheet: opens, applies, resets correctly
  □ Infinite scroll: triggers at 80%, loads seamlessly
  □ All fonts: Poppins names, Jakarta labels, Inter numbers

QUALITY:
  □ tsc --noEmit: zero errors
  □ eslint: zero warnings
  □ All touch targets: min 44×44px verified
  □ Haptics: correct weight per interaction
  □ Tested iOS simulator: all components
  □ Tested Android emulator: all components
  □ 60fps: Chip animations, BottomSheet, search stagger
```

---

## What Day 7 Gets From Day 6

```
AFTER DAY 6, AVAILABLE FOR IMMEDIATE USE:

  BottomSheet: 10+ future screens use this
  ActionSheet: photo picker, menu sheets Day 8+
  Chip + ChipGroup: time slot picker Day 11, skills Day 8
  SearchInput + SearchHeader: Category screen Day 7
  RadioGroup: sort options Day 7, booking options Day 11
  StarRatingFilter: filter sheet finalization Day 7
  WorkerSearchCard: Category screen workers tab Day 7
  FilterSheetContent: Category screen filter Day 7
  useSearch: Category search Day 7
  useRecentSearches: Category screen Day 7

DAY 7 WILL BUILD:
  RangeSlider (max price/distance filter — adds to FilterSheetContent)
  TabToggle (Workers | Services tab switcher)
  useInfiniteWorkers (paginated worker list for category)
  Category Detail screen [app/category/[id].tsx] COMPLETE
  Service Detail screen [app/service/[id].tsx] basic
  Integration: full path Home → Category → Worker results
```

---

*Tasklync — Day 6 Implementation Plan*
*24 new files. 12 components. 1 complete production screen.*
*BottomSheet, Chip, SearchInput, RadioGroup, StarRatingFilter — all built right, once.*
*Every micro-interaction documented. Every UX law applied precisely.*
*Font discipline: Poppins headings/CTAs, Jakarta body/labels, Inter all numbers.*
*Pure implementation thinking. Zero code. Maximum engineering clarity.*
*Ahesta ahesta — 60-day build, Day 6 of 60.*
