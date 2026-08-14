# 📋 Tasklync — Day 25 (Expanded) — My Bookings Screen
### Status-Machine UI · Fully Componentized · Smooth-Not-Animated · Zero Code, Full Implementation Spec

> Senior engineering principle applied here: **one component = one responsibility** — and today, additionally: **restraint is a design decision, not a missing feature.**
> This screen is scanned repeatedly, often several times a day, by users checking "what needs my attention." A list screen that's visited constantly is exactly the wrong place to spend animation budget — motion here should exist only where it communicates something functional (live status, urgency), never for decoration. "Smooth" on this screen means: 60fps scrolling, zero layout jank, instant status recognition — **not** springs, bounces, or staggered flourishes on every glance.

**Fonts (locked, no exceptions):**
- **Poppins** → "My Bookings" header title, worker name on each card
- **Plus Jakarta Sans** → service name, tab labels (Active/Past/Cancelled), status label text, action button labels
- **Inter** → price, countdown timer digits, date/time on each card

---

## 1. Objective

Ship `(tabs)/bookings` as **18 small composable files**, where every status (6 possible: PENDING/ACCEPTED/IN_PROGRESS/COMPLETED_BY_WORKER/COMPLETED/CANCELLED) is recognized by color alone within a fraction of a second, and the screen performs at a locked 60fps while scrolling — with the animation budget spent on almost nothing, deliberately.

---

## 2. Reduced-Motion Philosophy for This Screen (read before building)

Every prior day (20–24) had a "peak moment" or a decision-commitment moment that justified spring/bounce motion. **This screen has neither.** It is a *reference* surface — the equivalent of checking a dashboard, not making a choice. The correct design response is:

- **No bounce, no bouncy springs, anywhere on this screen.** Bounce communicates "something good just happened" — nothing "happens" on a list you're re-checking for the fifth time today.
- **Only 3 things are allowed to move at all:** the tab-underline sliding on tab switch, the countdown digits ticking down, and the `IN_PROGRESS` pulse dot. Everything else is static or uses a plain opacity/color fade at most.
- **"Smooth" is a performance target, not a motion-design target** — it means: FlashList tuned correctly, no dropped frames, no re-render cascades from the live countdown, and content that never visibly "pops" into place after data loads.

---

## 3. Full File/Folder Breakdown

```
app/
  (tabs)/
    bookings.tsx                              — COMPOSITION ONLY: assembles everything below

src/components/booking/
  ├── BookingsHeader.tsx                       — "My Bookings" title + notification bell (existing bell, Day 8)
  ├── BookingsTabBar.tsx                       — Active/Past/Cancelled labels, owns tap handling only
  ├── BookingsTabIndicator.tsx                 — the sliding underline, split out on purpose (see below)
  ├── BookingList.tsx                          — FlashList wrapper for one tab's data, owns entrance-stagger gate
  ├── BookingCard.tsx                          — the row shell: composes the pieces below, no logic of its own
  ├── BookingStatusBadge.tsx                   — color+icon+label pill, reads from the locked status map
  ├── BookingStatusDot.tsx                     — the small colored dot inside the badge (pulse only if IN_PROGRESS)
  ├── BookingWorkerRow.tsx                     — avatar (44px) + worker name + category, inside the card
  ├── BookingServiceMeta.tsx                   — service name + scheduled date/time line
  ├── BookingPriceTag.tsx                      — Inter price display, right-aligned on the card
  ├── BookingCountdown.tsx                     — "Expires in 12:43" live timer, PENDING-only
  ├── BookingActions.tsx                       — renders the correct button set from the actions lookup
  └── BookingCardSkeleton.tsx                  — shimmer placeholder matching BookingCard exact shape

src/components/feedback/EmptyState/
  ├── EmptyBookingsActive.tsx                  — "No active bookings" + Browse Services CTA
  ├── EmptyBookingsPast.tsx                    — "No past bookings yet" — no CTA needed
  └── EmptyBookingsCancelled.tsx                — "No cancelled bookings" — no CTA needed

src/hooks/
  ├── useBookingsList.ts                       — NEW: fetches bookings filtered by the active tab's status group
  └── useBookingCountdown.ts                   — NEW: shared-value tick logic, extracted out of the component

src/utils/
  ├── bookingStatusMap.ts                      — NEW: the single locked lookup — status → {color, icon, label}
  └── bookingActionsMap.ts                     — NEW: the single locked lookup — status → [action, action]
```

**Why this split matters (senior reasoning, not busywork):**
- `bookingStatusMap.ts` and `bookingActionsMap.ts` are **plain config files, not components** — this is the single most important architectural decision on this screen. Every status's color/icon/label and every status's available actions are defined **exactly once**, in one place each. `BookingStatusBadge`, `BookingCard`, and later the Booking Detail screen (already built Day 17-era work) all read from these same two files — meaning it is *structurally impossible* for the bookings list and the detail screen to ever disagree about what a status looks like or what actions it offers, because there's only one source of truth to disagree with.
- `BookingsTabIndicator` is split from `BookingsTabBar` because the indicator is the *only* animated element in the entire tab system — isolating it means the tab-label rendering logic (static) never has any reason to be near animation code.
- `useBookingCountdown` is a **hook**, not logic inline inside `BookingCountdown.tsx`, specifically so the tick mechanism (Reanimated shared value, updated outside the React render cycle) can be reasoned about and tested independently of how the countdown is displayed.
- `EmptyBookingsActive`, `EmptyBookingsPast`, and `EmptyBookingsCancelled` are three separate files rather than one parameterized component, because each has genuinely different copy and a different CTA-presence rule (Active gets a CTA, Past/Cancelled don't) — three small dumb files are clearer than one file with branching copy logic inside it.
- `BookingCard` is intentionally a **thin composition shell** — it renders `BookingStatusBadge` + `BookingWorkerRow` + `BookingServiceMeta` + `BookingPriceTag` + `BookingCountdown` (conditionally) + `BookingActions`, and owns none of their internal logic. This is what makes the whole card reusable in Booking Detail's card-preview contexts later without duplicating a single piece.

---

## 4. Component-by-Component Detail

### 4.1 `app/(tabs)/bookings.tsx` — Composition Root
**Responsibility:** Renders `BookingsHeader` → `BookingsTabBar` (+`BookingsTabIndicator`) → `BookingList` (fed by `useBookingsList` for the active tab) → the correct `EmptyBookings*` variant when the list is empty. Owns only the "which tab is active" state — everything else is delegated.

### 4.2 `BookingsHeader.tsx`
**Responsibility:** "My Bookings" title (Poppins) + the existing notification bell component (built Day 8). Static.

### 4.3 `BookingsTabBar.tsx`
**Responsibility:** Renders the three tab labels (Jakarta) and reports taps upward. Owns **no** animation — it is purely a row of pressable text labels.
- **UX Law — Jakob's Law:** underline-style tabs, not chip-style — this matches the platform-native convention users already know from browser tabs and app-store category tabs, so no learning curve is introduced.
- **UX Law — Hick's Law:** exactly 3 tabs (Active/Past/Cancelled), never more — any finer status nuance (PENDING vs ACCEPTED vs IN_PROGRESS) is communicated *within* the Active tab via badges, not by adding more top-level tabs, which would slow down the primary "what needs my attention" scan.

### 4.4 `BookingsTabIndicator.tsx`
**Responsibility:** The thin underline beneath the active tab label — the **only** horizontal motion permitted anywhere on this screen.
- **Microinteraction:** slides to the new tab's position on switch, `spring-gentle` (the calmest spring in the whole app's vocabulary — never snappy, never bouncy, since this is a purely navigational cue, not a celebratory one).
- **UX Law — Spatial Honesty:** the underline moving is the *only* thing allowed to imply "direction" on this screen — the content beneath it, deliberately, does **not** slide (see `BookingList` below), because Active/Past/Cancelled are parallel categories, not a sequence.

### 4.5 `BookingList.tsx`
**Responsibility:** A `FlashList` wrapper for one tab's booking data, receiving items from `useBookingsList`.
- **Content transition on tab switch:** a **plain opacity cross-fade** (~150–200ms timing, no spring) — never a horizontal slide. This is a deliberate reduction from what a more expressive app might do, matching the "smooth not animated" instruction: the fastest, calmest way to communicate "this is different content" without implying hierarchy or sequence.
- **Entrance stagger:** applied **once**, only on first mount or an explicit pull-to-refresh — never re-triggered on background refetches. Even this entrance stagger is kept minimal: opacity fade only (no translateY, no spring), 30ms apart, capped at the first 6 visible cards (staggering an entire long list adds perceived load time with zero benefit past what's visible on first paint).
- **Performance discipline:** `estimatedItemSize` set precisely to `BookingCard`'s real measured height; `keyExtractor` uses booking ID, never array index — this is what "smooth" actually depends on far more than any animation choice.

### 4.6 `BookingCard.tsx`
**Responsibility:** Thin composition shell only — arranges `BookingStatusBadge`, `BookingWorkerRow`, `BookingServiceMeta`, `BookingPriceTag`, `BookingCountdown` (if status is PENDING), and `BookingActions` inside a single pressable card. On tap, routes to `booking/[id]/detail`.
- **Microinteraction:** a card press gets the smallest possible acknowledgment — a brief opacity dip (`1→0.85→1`, plain timing ~100ms, no scale, no spring) — deliberately more restrained than every prior "browse" card in the app (Home's `WorkerCardHorizontal`, Day 20's `MapWorkerCard`), because this card is tapped far more frequently in a single session and a heavier press-animation here would start to feel fatiguing rather than delightful over repeated use.

### 4.7 `BookingStatusBadge.tsx`
**Responsibility:** A small pill reading its color, icon, and label directly from `bookingStatusMap.ts` for the given status — contains no conditional logic of its own beyond a lookup.
- **UX Law — Recognition over Recall (the core payoff of the entire screen):** status colors are semantically **locked** and used nowhere else in the app for any other meaning (amber=pending, blue=accepted, green-pulse=in-progress, gray=completed, red=cancelled/disputed). After seeing this mapping twice, a user stops reading the status *text* and simply reads the *color* — this converts a reading task into a glance, which is the entire point of a consistent design system.
- **Microinteraction:** **none.** The badge itself never animates — its whole job is instant, calm recognition, and animating something meant to be scanned rapidly across many cards would actively work against that goal.

### 4.8 `BookingStatusDot.tsx`
**Responsibility:** The small colored dot inside the badge. Static for every status **except** `IN_PROGRESS`.
- **Microinteraction:** a subtle pulse, **only** on `IN_PROGRESS` — the same visual language as Day 10's online-status dot and Day 22's active-step-dot. This is the **one** piece of genuinely reused animated meaning across the entire app: "pulsing dot = this is happening right now," and it holds true everywhere it appears, including here. Every other status renders this dot fully static.

### 4.9 `BookingWorkerRow.tsx`
**Responsibility:** Avatar (44px) + worker name (Poppins) + category (Jakarta, muted). Static — no animation warranted for identity information that's simply being displayed, not decided upon.

### 4.10 `BookingServiceMeta.tsx`
**Responsibility:** Service name + scheduled date/time line (Inter for the date/time values, since they're data). Static.

### 4.11 `BookingPriceTag.tsx`
**Responsibility:** Right-aligned price (Inter), reused visual weight consistent with every other price shown across the app (Cart, Summary, Payment) — but **deliberately smaller/quieter here** than on those screens, because this is a reference list, not a decision-commitment moment; the price doesn't need to dominate the card the way a Cart/Summary total does.

### 4.12 `BookingCountdown.tsx`
**Responsibility:** "Expires in 12:43" — rendered only for `PENDING` bookings.
- **Microinteraction:** digits tick down every second, driven by `useBookingCountdown`'s Reanimated shared value — updates happen **without triggering a full component re-render**, which is the actual mechanism that keeps a scrolling list smooth even with several live countdowns visible at once.
- **Visual treatment:** amber color, **no bounce, no pulse, no scale** — a countdown should feel mechanically precise, not playful. This is explicitly a low-stakes utility number, not a celebratory one — the Peak-End Rule budget spent on Day 24's Success screen has no place here.
- **Stops immediately** the moment the booking transitions out of PENDING (no lingering animation, no fade-out flourish — it simply stops updating and the component unmounts).

### 4.13 `BookingActions.tsx`
**Responsibility:** Reads `bookingActionsMap.ts` for the card's current status and renders exactly the buttons that map returns — no conditional branching written by hand inside this component.
- **UX Law — consistency (design-system principle):** because this component and the (already-built) Booking Detail screen's action buttons both read the *same* `bookingActionsMap.ts`, it is structurally guaranteed that a `PENDING` booking always shows the same two actions everywhere in the app — there is no code path where these two surfaces could drift apart.
- **Microinteraction:** standard button press-state only (brief opacity dip, matching `BookingCard`'s restrained press feel) — no spring, no bounce, consistent with this screen's overall reduced-motion posture.

### 4.14 `BookingCardSkeleton.tsx`
**Responsibility:** Shimmer placeholder pixel-matched to `BookingCard`'s real measured shape. Sibling-file skeleton discipline, unchanged from every prior day (Map → Cart → Schedule → Address → Payment → now Bookings).

### 4.15–4.17 `EmptyBookingsActive.tsx` / `EmptyBookingsPast.tsx` / `EmptyBookingsCancelled.tsx`
**Responsibility:** Three small, independent empty-state files.
- `EmptyBookingsActive`: "No active bookings" + a **secondary** (never primary green) "Browse Services" CTA — Hick's Law reasoning carried over from every prior empty state in the app (Day 21's `EmptyCart`): an empty state is informational, not a conversion moment.
- `EmptyBookingsPast` / `EmptyBookingsCancelled`: purely informational copy, **no CTA at all** — there's nothing constructive to prompt here, and an empty state shouldn't manufacture an action just to have one.
- **Microinteraction:** a single plain opacity fade-in on first render, no motion beyond that.

### 4.18 `useBookingsList.ts` (hook)
**Responsibility:** Given the active tab, fetches the correctly status-filtered set of bookings (Active = PENDING/ACCEPTED/IN_PROGRESS/COMPLETED_BY_WORKER; Past = COMPLETED; Cancelled = CANCELLED). Exposes `{ bookings, isLoading, refetch }`. `BookingList` and the composition root both consume this — no fetch logic duplicated anywhere else.

### 4.19 `useBookingCountdown.ts` (hook)
**Responsibility:** Pure logic — given an `expiresAt` timestamp, returns a live-ticking `{ minutes, seconds, isExpired }` backed by a Reanimated shared value updated on an interval outside the normal render cycle. No JSX. This isolation is what makes it possible to have multiple `BookingCountdown` instances visible in a scrolling list simultaneously without any of them causing the list itself to jank.

### 4.20 `bookingStatusMap.ts` (config, not component)
**Responsibility:** The one and only lookup table: `status → { color, icon, label }` for all 6 statuses. No logic, no JSX — a plain typed object.

### 4.21 `bookingActionsMap.ts` (config, not component)
**Responsibility:** The one and only lookup table: `status → [{ label, action }, { label, action }]` for all 6 statuses. Same discipline as above.

---

## 5. UX Laws Applied — Full Detail (Day 25)

| Law | Where on this screen | Why it's the correct tool here |
|---|---|---|
| **Recognition over Recall** | `BookingStatusBadge` reading a locked color/icon/label map | After two exposures, the user reads color instead of text — a scan-heavy screen depends entirely on this shortcut existing and never being violated elsewhere in the app. |
| **Hick's Law** | `BookingsTabBar` limited to exactly 3 tabs; `EmptyBookingsActive`'s single secondary CTA | Fewer top-level categories keep the primary "what needs attention" scan fast; status nuance lives inside badges, not in an ever-growing tab row. |
| **Goal-Gradient Effect (inverted → urgency)** | `BookingCountdown` on PENDING bookings | The same psychological mechanism that motivates progress-toward-a-goal works in reverse here to motivate "acting before this expires." |
| **Jakob's Law** | Underline-style tabs (not chips); standard native-tinted `RefreshControl` for pull-to-refresh | Both match conventions users already carry from elsewhere on their device — zero new gesture or visual vocabulary introduced. |
| **Spatial Honesty** | Tab content **cross-fades**, never slides horizontally | Active/Past/Cancelled are parallel categories of the same list, not a sequence or hierarchy — a horizontal slide would incorrectly imply "before/after" or "deeper," which isn't true of these tabs' relationship. |
| **Consistency (design-system principle)** | `bookingStatusMap.ts` and `bookingActionsMap.ts` as single sources of truth, shared with the existing Booking Detail screen | A status must mean the same thing, and offer the same actions, everywhere it's shown — structurally guaranteed by having exactly one lookup table each, not by convention or code review vigilance. |

---

## 6. Microinteraction Summary Table (deliberately minimal)

| Element | Trigger | Motion | Duration/Config | Haptic |
|---|---|---|---|---|
| BookingsTabIndicator | tab switch | slide to new position | spring-gentle (calmest spring in the app) | light |
| BookingList content | tab switch | opacity cross-fade | timing, ~150–200ms | none |
| BookingList entrance | first mount / pull-to-refresh only | opacity fade, first ~6 cards, 30ms apart | timing, no spring | none |
| BookingCard press | tap | opacity 1→0.85→1 | timing, ~100ms, no scale | none |
| BookingStatusBadge | — | **none** | — | — |
| BookingStatusDot (IN_PROGRESS only) | continuous | subtle pulse | 1.5–2s loop | none |
| BookingCountdown digits | every second | text update only, no scale/bounce | shared-value tick, no React re-render | none |
| BookingActions buttons | tap | standard opacity press-state | timing, ~100ms | light |
| EmptyBookings* variants | tab has zero results | plain opacity fade-in | timing, ~200ms | none |
| Pull-to-refresh | manual pull | native RefreshControl, #16A34A tint | native | none |

---

## 7. Definition of Done (Day 25)

- [ ] `app/(tabs)/bookings.tsx` contains composition/layout only — no status-color logic, no action-button logic, no countdown-math inline.
- [ ] `bookingStatusMap.ts` and `bookingActionsMap.ts` exist as the *only* two places status→appearance and status→actions are defined; `BookingStatusBadge`, `BookingActions`, and the existing Booking Detail screen all read from these same two files (verified by confirming no duplicate lookup tables exist anywhere else in the codebase).
- [ ] All 3 tabs render correctly filtered data from `useBookingsList`; tab switch is a plain opacity cross-fade, never a horizontal slide.
- [ ] `BookingCountdown` ticks live every second on PENDING bookings without causing the surrounding `FlashList` to drop frames, and stops immediately (no animation) the instant a booking leaves PENDING.
- [ ] `BookingStatusDot` pulses only for `IN_PROGRESS`; every other status renders it fully static.
- [ ] `BookingActions` renders the correct button pair for all 6 statuses with zero hand-written conditional branching inside the component itself.
- [ ] Tapping any card routes to the correct `booking/[id]/detail`.
- [ ] Pull-to-refresh updates the list with the native tinted `RefreshControl` and no full-screen loading flash.
- [ ] `BookingCardSkeleton` is pixel-matched to `BookingCard` — zero layout shift when real data arrives.
- [ ] Scroll performance verified at 60fps with 30+ mixed-status cards on a mid-range Android device, including with 3+ simultaneous live countdowns visible on screen.
- [ ] Fonts verified: Poppins on header title/worker name, Inter on price/countdown/date-time, Jakarta on tab labels/service names/action labels — no mixing.
- [ ] Manual motion audit: confirm no spring/bounce animation exists anywhere on this screen except `BookingsTabIndicator`'s spring-gentle slide — every other element uses plain opacity/color timing or nothing at all.

---

## 8. Why this breakdown — and this restraint — is the "industry-level" choice

A junior implementation would either (a) hand-write status-color `if/else` chains directly inside `BookingCard`, guaranteeing eventual drift from the Detail screen's own copy of the same logic, or (b) over-animate this screen the same way earlier "peak" screens were animated, because "more motion = more polish" is an easy but wrong instinct to follow uniformly. The breakdown above guarantees:

1. **One status truth, everywhere** — `bookingStatusMap.ts`/`bookingActionsMap.ts` make drift between this list and the Booking Detail screen structurally impossible, not just unlikely.
2. **Performance is treated as the actual "smoothness" lever** — `useBookingCountdown`'s shared-value approach and `BookingList`'s tuned `FlashList` config are what make this screen feel good under real, repeated daily use; motion design was never going to be the thing that mattered most here.
3. **Correct restraint compounds trust** — by *not* spending animation budget on a screen the user checks constantly, the app implicitly signals "this is a calm, reliable dashboard," which makes the rare ceremonial moments (Day 24's Success screen) land even harder by contrast.
4. **Reusable primitives, once more** — `BookingCardSkeleton`, the cross-fade tab pattern, and the config-driven status/action lookups are now permanent, low-cost tools available to every future status-driven list the app ever needs.
