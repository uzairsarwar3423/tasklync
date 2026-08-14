# 📅 Tasklync — Day 22 (Expanded) — StepProgress + Schedule Screen
### Goal-Gradient Core · Fully Componentized · Zero Code, Full Implementation Spec

> Senior engineering principle applied here: **one component = one responsibility.**
> `StepProgress` and `app/booking/schedule.tsx` are the two most-reused/most-seen surfaces in the entire booking funnel (StepProgress renders on 3 more screens across Days 23–24). If either is built as one big file, every later step (Address, Summary) inherits that tangle. Today we build both as small, composable pieces so `StepProgress` becomes a true **shared primitive**, and `schedule.tsx` becomes pure composition.

**Fonts (locked, no except
ions):**
- **Poppins** → step labels ("Services," "Schedule," "Address," "Review"), screen title "When should we come?"
- **Plus Jakarta Sans** → weekday header row (Su/Mo/Tu…), "Urgent" toggle label, helper sub-labels, chip text
- **Inter** → step numbers inside dots, day numbers in the calendar grid, time slot labels ("9:00 AM"), the "+30%" price badge value

---

## 1. Objective

Ship a **reusable** `StepProgress` component (used again Days 23–24 unchanged) and a fully componentized Schedule screen — calendar, time slots, urgent toggle — built from **17 small files**, so no single file mixes calendar-math, animation, and layout together.

---

## 2. Full File/Folder Breakdown

```
src/components/bo
oking/
  ├── StepProgress.tsx                        — container: lays out N StepDots + connector lines
  ├── StepDot.tsx                              — single dot: number / checkmark / active-pulse states
  ├── StepConnectorLine.tsx                    — single fillable line segment between two dots
  ├── StepLabel.tsx                            — small text label under a dot (Poppins)
  └── ScheduleContinueFooter.tsx               — sticky "Next: Address →" footer (schedule-specific)

app/
  booking/
    schedule.tsx                              — COMPOSITION ONLY: assembles everything below

src/components/booking/schedule/
  ├── ScheduleHeader.tsx                       — screen title + back button (owns nothing else)
  ├── CalendarHeader.tsx                       — "← Jan 2025 →" month label + nav arrows
  ├── CalendarWeekdayRow.tsx                   — static Su/Mo/Tu/.../Sa header row
  ├── CalendarGrid.tsx                         — lays out CalendarDayCell in a 7-col grid, owns swipe/slide
  ├── CalendarDayCell.tsx                      — single day cell: idle/today/selected/unavailable states
  ├── TimeSlotGrid.tsx                         — wraps TimeSlotChip list in a 3-per-row grid
  ├── TimeSlotChip.tsx                         — single time chip: available/selected/unavailable
  ├── TimeSlotSkeleton.tsx                     — shimmer chip, shown while useWorkerSlots is loading
  ├── UrgentToggleRow.tsx                      — switch + "Urgent (within 2 hrs)" label
  └── UrgentPriceBadge.tsx                     — the "+30%" badge that springs in beside the toggle

src/hooks/
  ├── useWorkerSlots.ts                        — (existing, per spec) fetch slots per date+workerId
  └── useCalendarMonth.ts                      — NEW: owns visible month state, day-array generation, nav

src/store/
  └── bookingDraft.store.ts                   — existing, confirm schedule fields (date/time/isUrgent) persist here
```

**Why this split matters (senior reasoning, not busywork):**
- `StepProgress` is split into `StepDot` + `StepConnectorLine` + `StepLabel` because these three pieces have **independent animation lifecycles** — a dot flips to checkmark on its own timeline, the connector fills on its own, and the label never animates at all. Merging them into one component means every future tweak (e.g., changing how the pulse looks) requires re-reading logic for parts that have nothing to do with the change.
- `useCalendarMonth` is pulled out as its own hook specifically because calendar-day-array generation (leap years, month lengths, which weekday the 1st falls on) is **pure date math with zero UI** — it should be unit-testable without ever mounting `CalendarGrid`.
- `CalendarGrid` owns the horizontal slide-on-month-change animation; `CalendarDayCell` only knows its own four visual states (idle/today/selected/unavailable) and has no idea a month transition is even happening — this separation means the slide animation can be swapped or removed later without touching a single cell's logic.
- `TimeSlotSkeleton` is a sibling of `TimeSlotChip` (like the `CartSkeletonItem`/`CartItem` pairing from Day 21) so shape drift between loading and loaded states is caught immediately in review.
- `ScheduleContinueFooter` is kept **screen-specific** (not the generic `ProceedFooter` from Cart) because its enabled-condition is different (requires date + time both selected, not "cart has items") — reusing a generic footer here would force awkward prop overloading; a small dedicated file is cheaper than that complexity.

---

## 3. Component-by-Component Detail

### 3.1 `StepProgress.tsx` — Reusable Booking-Funnel Primitive
**Responsibility:** Accepts `steps: string[]` and `activeIndex: number`. Renders `StepDot` for each step with a `StepConnectorLine` between consecutive dots and a `StepLabel` under each dot. Contains no date logic, no booking-specific knowledge — pure props-in, layout-out. **This exact component is reused unmodified on Days 23 and 24** (Address = step 3 active, Summary = step 4 active) — this is the entire point of building it correctly once, today.
- **UX Law — Goal-Gradient Effect (the reason this component exists at all):** motivation to finish increases as the *perceived remaining distance* shrinks. Showing a visibly filling line does two things at once — tells the user exactly how much work remains (reduces open-ended-process anxiety) and exploits the same psychological pull that makes people speed up near a finish line. Abandonment measurably drops once "step 2 of 4" is shown as visibly half-done rather than an unbounded form.

### 3.2 `StepDot.tsx`
**Responsibility:** A single circular indicator with exactly three visual states — `complete` (green fill + checkmark), `active` (green fill + step number + pulse ring), `future` (gray outline + step number).
- **Microinteraction:** on transitioning `active→complete`, the dot does `scale 1→1.15→1` (spring-snappy) while its content cross-fades from number to checkmark (150ms timing — content swap is a color/opacity change, not a transform, so timing is correct here per the established rule).
- **Active-step pulse:** a subtle ring pulse identical in visual language to the Day-10 online-status dot and Day-20 live-marker pulse — **deliberate cross-app consistency**: users learn once that "pulsing = happening right now" and that meaning holds everywhere, including here.

### 3.3 `StepConnectorLine.tsx`
**Responsibility:** A single line segment between two adjacent dots. Fills `width 0%→100%` (timing, ~300ms ease-out — a fill is a *state confirmation*, not a physical object, so timing is correct, never spring) the moment the step before it completes.

### 3.4 `StepLabel.tsx`
**Responsibility:** The small Poppins text under each dot ("Services," "Schedule," etc.). Static, no animation — labels exist for orientation/recall-support, not for drawing attention; animating them would compete with the dot/line motion that's actually carrying the meaning.

### 3.5 `app/booking/schedule.tsx` — Composition Root
**Responsibility:** Layout only. Renders `ScheduleHeader` → `StepProgress` (activeIndex=1) → `CalendarHeader` + `CalendarWeekdayRow` + `CalendarGrid` → `TimeSlotGrid` (or `TimeSlotSkeleton` × N while loading) → `UrgentToggleRow` → `ScheduleContinueFooter`. Wires `useCalendarMonth`, `useWorkerSlots`, and `bookingDraft.store` together; contains no calendar math, no slide-animation code.

### 3.6 `ScheduleHeader.tsx`
**Responsibility:** Screen title "When should we come?" (Poppins) + back button. Nothing else — deliberately dumb.

### 3.7 `CalendarHeader.tsx`
**Responsibility:** "← Jan 2025 →" — month label (Poppins) + two arrow buttons. Calls `useCalendarMonth`'s `nextMonth()`/`prevMonth()`, has no knowledge of how the grid itself animates.
- **UX Law — Fitts's Law:** both arrows get `hitSlop` pushing them to a full 44px tap target even though the visual chevron icon is small — these are frequently-tapped navigation controls and deserve generous forgiveness for slightly-off taps.

### 3.8 `CalendarWeekdayRow.tsx`
**Responsibility:** Static "Su Mo Tu We Th Fr Sa" header. Never re-renders, never animates — pure reference row so day-of-week alignment in the grid below is unambiguous at a glance (**Recognition over Recall**: the user doesn't have to count columns to know which weekday a date falls on).

### 3.9 `CalendarGrid.tsx`
**Responsibility:** Renders the 5–6 row grid of `CalendarDayCell`s for the current visible month (from `useCalendarMonth`), and owns the **month-transition animation** — the entire grid slides horizontally (`translateX`, spring-default, ~250ms) in the direction of navigation travel.
- **UX Law — Spatial Honesty:** next-month slides content **left** (new content enters from the right), prev-month slides **right** (new content enters from the left) — the direction of motion must always match the direction of navigational intent, or it subconsciously reads as "wrong" even if the user can't articulate why.

### 3.10 `CalendarDayCell.tsx`
**Responsibility:** A single day cell with exactly four states: `idle`, `today` (distinct underline), `selected` (filled green), `unavailable` (dimmed, non-pressable).
- **UX Law — Hick's Law:** unavailable dates are greyed **and non-pressable** — never pressable-then-erroring. Removing an invalid option outright is always better than letting the user choose it and then punishing the click with an error.
- **UX Law — Recognition over Recall:** "today" gets a visually distinct underline so the user never has to mentally calculate which cell corresponds to today relative to the grid.
- **UX Law — Fitts's Law:** cells are 40×40px minimum visual size, with padding/hitSlop pushing the effective tap target comfortably above 44px — dense grids are the single highest-risk surface for mis-taps on adjacent items, so this cell gets extra tap-target generosity by design, not as an afterthought.
- **UX Law — Von Restorff Effect:** the selected cell is the *only* filled-green, white-text, bounce-scaled cell in a 30+ cell grid — it must be found by the eye in under a second, which requires it to look categorically different, not just "a bit darker."
- **Microinteraction:** on selection, `scale 1→1.15→1` (spring-bouncy) while background fills green and text flips white — bounce is appropriate here because selecting a date **is** a small decision-commitment moment (unlike, say, a neutral quantity stepper from Day 21, which intentionally has no bounce).

### 3.11 `TimeSlotGrid.tsx`
**Responsibility:** Lays out `TimeSlotChip` (or `TimeSlotSkeleton`) in a 3-per-row wrap grid. Reads the slot list from `useWorkerSlots` (re-queried automatically whenever `useCalendarMonth`'s selected date changes) and has no chip-level state of its own.

### 3.12 `TimeSlotChip.tsx`
**Responsibility:** A single time chip with three states: `available` (selectable), `selected` (green fill), `unavailable` (gray, non-pressable).
- **Microinteraction:** available→selected is a background color fade (150ms timing) + light haptic; unavailable chips have **zero** press feedback — silence is the correct signal here, consistent with the Day-3/Day-21 disabled-element rule: absence of feedback *is* the feedback ("this can't be tapped").

### 3.13 `TimeSlotSkeleton.tsx`
**Responsibility:** Shimmer placeholder, pixel-matched to `TimeSlotChip`'s exact pill shape/size — shown while `useWorkerSlots` is fetching for a newly-selected date. Its presence as a sibling file to the real chip is deliberate (same reasoning as `CartSkeletonItem`/`CartItem` on Day 21) — any layout drift between loading and loaded states becomes visible in review immediately.

### 3.14 `UrgentToggleRow.tsx`
**Responsibility:** A native platform `Switch` + "Urgent (within 2 hrs)" label (Jakarta) + a slot for `UrgentPriceBadge`. No custom switch-animation is built — the native switch's built-in flip is used as-is (**Jakob's Law**: reinventing a toggle's physical motion offers no benefit and only risks feeling "off" compared to every other switch on the device).

### 3.15 `UrgentPriceBadge.tsx`
**Responsibility:** The small "+30%" pill that appears the instant the urgent toggle activates.
- **Microinteraction:** springs in `scale 0→1.1→1` (spring-bouncy, ~200ms) the moment the toggle flips on, and disappears (reverse of the same spring, faster — spring-stiff) if toggled off. This badge appearing **is** the feedback that the price estimate actually changed — it must feel immediate and directly tied to the toggle's position, not delayed or arriving from an unrelated part of the screen.

### 3.16 `ScheduleContinueFooter.tsx`
**Responsibility:** Sticky "Next: Address →" CTA, screen-specific (not the generic Cart `ProceedFooter`) because its enabled condition is "a date AND a time slot are both selected in `bookingDraft.store`," which is a different shape of validation than Cart's "item count > 0."
- **Microinteraction:** identical press-spec to every other primary CTA in the app (scale 0.97 in / 1.02→1.0 spring-bouncy out + medium haptic) when enabled; muted + zero feedback when disabled — consistency across every sticky footer in the app matters more than screen-specific novelty here.

### 3.17 `useCalendarMonth.ts` (hook)
**Responsibility:** Pure logic — owns `{ visibleMonth, selectedDate, daysArray, nextMonth(), prevMonth(), selectDate() }`. No JSX. `CalendarHeader`, `CalendarWeekdayRow`, `CalendarGrid`, and `CalendarDayCell` all consume this single source of truth so there is exactly one place month/day logic can ever be wrong, not scattered across four components.

---

## 4. UX Laws Applied — Full Detail (Day 22)

| Law | Where on this screen | Why it's the correct tool here |
|---|---|---|
| **Goal-Gradient Effect** | `StepProgress` (the entire reason it exists), `ScheduleContinueFooter`'s "Next: Address →" label naming the immediate next milestone | Visibly shrinking remaining-distance increases motivation to finish; naming the very next step (not just "Continue") reinforces the same effect at the CTA level. |
| **Hick's Law** | `CalendarDayCell` unavailable dates removed from interaction entirely; `TimeSlotChip` unavailable states silent | Never let a user choose an option already known to be invalid — remove it outright rather than punishing the click afterward with an error. |
| **Recognition over Recall** | `CalendarWeekdayRow` (always-visible header row), `CalendarDayCell` "today" underline | Remove any need for the user to mentally calculate weekday alignment or "which cell is today" — show it directly. |
| **Fitts's Law** | `CalendarDayCell` (40×40px + generous hitSlop), `CalendarHeader` nav arrows | Dense grids and small nav icons are the highest-risk surfaces for mis-taps; both get deliberately generous effective tap targets. |
| **Von Restorff Effect** | Selected `CalendarDayCell` (only filled-green/bounced cell in 30+), `UrgentPriceBadge` (only badge that pops in) | In a dense grid or beside a plain toggle, the one meaningful change must be visually unmistakable, not just "slightly different." |
| **Spatial Honesty** | `CalendarGrid` slide direction matching navigation intent | Motion direction is a silent promise about "where you are" — breaking that promise (sliding the wrong way) reads as subtly wrong even to users who can't explain why. |

---

## 5. Microinteraction Summary Table

| Element | Trigger | Motion | Duration/Config | Haptic |
|---|---|---|---|---|
| StepDot active→complete | step completes | scale 1→1.15→1, content cross-fade | spring-snappy / 150ms timing | none |
| StepDot active pulse | continuous while active | ring pulse | 1.5–2s loop | none |
| StepConnectorLine fill | step completes | width 0%→100% | timing ease-out, ~300ms | none |
| CalendarGrid month change | nav arrow tap | translateX slide (direction-matched) | spring-default, ~250ms | none |
| CalendarDayCell select | tap available date | scale 1→1.15→1, bg→green, text→white | spring-bouncy | light |
| CalendarDayCell unavailable tap | n/a (blocked) | none | — | none |
| TimeSlotChip select | tap available slot | bg fade gray→green | timing, 150ms | light |
| TimeSlotChip unavailable tap | n/a (blocked) | none | — | none |
| UrgentToggleRow flip | tap switch | native switch animation | native default | light |
| UrgentPriceBadge appear | toggle on | scale 0→1.1→1 | spring-bouncy, ~200ms | none |
| UrgentPriceBadge disappear | toggle off | reverse scale | spring-stiff (faster) | none |
| ScheduleContinueFooter (enabled) | tap | scale 0.97 in / 1.02→1.0 out | spring-stiff in / spring-bouncy out | medium |
| ScheduleContinueFooter (disabled) | tap | none | — | none |

---

## 6. Definition of Done (Day 22)

- [ ] `StepProgress` accepts `steps[]` + `activeIndex` as props only — zero booking-specific logic inside it — and is verified reusable by rendering it standalone with different `activeIndex` values (2, 3, 4) without modification.
- [ ] `StepDot`, `StepConnectorLine`, and `StepLabel` are each independently swappable/testable without touching the other two.
- [ ] `useCalendarMonth` correctly generates day arrays across month boundaries (28/29/30/31-day months) and leap years, unit-tested with plain date inputs (no rendering required).
- [ ] `CalendarGrid` slides in the direction matching nav-arrow intent every time, with no layout glitch at month boundaries.
- [ ] `CalendarDayCell` unavailable dates are fully non-interactive (no press feedback, no state change on tap).
- [ ] `TimeSlotGrid` re-queries `useWorkerSlots` automatically when the selected date changes, showing `TimeSlotSkeleton` during the fetch with zero layout shift once real chips arrive.
- [ ] `UrgentPriceBadge` appears/disappears in sync with the toggle state with no visible delay.
- [ ] All selections (date, time, isUrgent) persist correctly in `bookingDraft.store`, verified by killing and reopening the app mid-flow.
- [ ] `ScheduleContinueFooter` is disabled until both a date and a time slot are selected.
- [ ] Fonts verified: Poppins on step labels/screen title, Inter on all numbers (day numbers, time labels, price badge, step-dot numbers), Jakarta on everything else — no mixing.

---

## 7. Why this breakdown is the "industry-level" choice

A junior implementation would build `StepProgress` as one file with inline step-state logic, and `schedule.tsx` as one file containing the calendar grid, time chips, and toggle all together. That would work for Day 22 alone — but `StepProgress` is reused, unmodified, on **two more screens** in the next two days. If it isn't a clean, self-contained, props-driven primitive today, Days 23–24 either duplicate the logic (drift risk) or require refactoring under time pressure. The breakdown above guarantees:

1. **True reusability** — `StepProgress` drops into Address (Day 23) and Summary (Day 24) with a single prop change (`activeIndex`), zero duplication.
2. **Isolated calendar math** — `useCalendarMonth` is pure logic, testable against known date-math edge cases (month lengths, leap years) without ever rendering UI.
3. **Independent animation ownership** — the month-slide (grid-level), the date-bounce (cell-level), and the step-fill (StepProgress-level) each live exactly where their state lives, so none of them can accidentally interfere with or block another.
4. **Consistent skeleton discipline** — `TimeSlotSkeleton` sitting beside `TimeSlotChip` extends the same loading-state discipline established in Cart (Day 21) and Live Map (Day 20), compounding into a system-wide pattern rather than a one-off.
