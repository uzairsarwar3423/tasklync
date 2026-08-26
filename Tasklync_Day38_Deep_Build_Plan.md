# Tasklync — Day 38 Deep Build Plan
## Booking History + Blocked Workers + Delete Account
> React Native + Expo Router · Reanimated 3 · Zustand · React Query
> Fonts: **Poppins** (identity) · **Plus Jakarta Sans** (UI/body) · **Inter** (numbers/data)
> Senior RN/Expo build spec — file-level, component-level, interaction-level. No code, plan only.

---

## 0. Why This Day Matters (Design Rationale)

Day 38 closes out every remaining **account control** surface. Three distinct emotional registers live on this single day, and each demands its own design treatment:

1. **Booking History** — a *scanning* task. The user is looking something up, not deciding anything. Speed and clarity win.
2. **Blocked Workers** — a *low-stakes control* task. Reversible, private, should feel light and unbothered.
3. **Delete Account** — a *high-regret, irreversible* task. This is the one place in the entire app where the design goal flips: **friction is the correct answer.**

Holding these three registers correctly in the same day is the actual skill test here — treating all three with the same weight of animation or confirmation would be wrong in both directions.

---

## 1. Full File & Folder Manifest

```
app/profile/
├── booking-history.tsx                  # SCREEN 1 — Full paginated history
└── blocked-workers.tsx                  # SCREEN 2 — Manage blocked workers

src/components/booking/
├── BookingHistoryCard.tsx               # Compact past-booking row
└── BookingHistoryCardSkeleton.tsx       # Loading placeholder

src/components/worker/
├── BlockedWorkerRow.tsx                 # Avatar + name + "Unblock" button
├── BlockWorkerSheet.tsx                 # Bottom sheet: reason list + [Block] CTA
│                                         #   (entry point lives in worker/[id].tsx ⋮ menu,
│                                         #    but component + logic built today)
└── UnblockConfirmPopover.tsx            # Small anchored confirm on "Unblock" tap

src/components/feedback/
├── DeleteAccountSheet.tsx               # Type-to-confirm destructive flow
├── DeleteAccountReasonStep.tsx          # Optional "why are you leaving" step (step 1 of 2)
└── DeleteAccountConfirmStep.tsx         # Type "DELETE" step (step 2 of 2)

src/components/ui/
├── YearCategoryFilterBar.tsx            # Compact filter row above history list
├── StatusDot.tsx                        # Reusable color-coded status indicator
└── ToastUndo.tsx                        # Toast with inline "Undo" action (used for unblock)

src/hooks/
├── useBookingHistory.ts                 # Infinite query, filter by year/category
├── useBlockedWorkers.ts                 # list / unblock
├── useBlockWorker.ts                    # block mutation + cache invalidation
└── useDeleteAccount.ts                  # mutation + logout cascade

src/types/
└── moderation.types.ts                  # BlockedWorker, BlockReason, DeleteAccountPayload

src/utils/
└── bookingStatus.ts                     # statusToColor(), statusToLabel() mapping helpers
```

**Total: 2 screens · 10 components · 4 hooks · 1 types file · 1 util file**

---

## 2. Screen 1 — Booking History (`booking-history.tsx`)

### 2.1 Layout Anatomy (top to bottom)

| Zone | Component | Behavior |
|---|---|---|
| Header | "Booking History" + back | Static |
| Filter bar | `YearCategoryFilterBar` | Collapsed by default (single row: "2025 ▾" + "All Categories ▾"), expands to a small sheet on tap |
| Body | `FlashList<Booking>` (infinite scroll, 20/page) of `BookingHistoryCard` | `estimatedItemSize` 84px |
| Empty | `EmptyState` (shared component from design system) | Illustration + "Book your first service" CTA |

### 2.2 `YearCategoryFilterBar.tsx` — Component Spec
- Two compact pill selectors: **Year** (dropdown of years with booking activity, most recent first) and **Category** (multi-select chips in a small sheet, "All Categories" default)
- Selecting a filter re-triggers `useBookingHistory` with new params — list resets to page 1, brief 150ms cross-fade on the list content (not a hard flash) to signal "results changed" without a jarring reload
- Filter bar is **sticky** under the header while scrolling — always available, never requires scrolling back to top to change filters

### 2.3 `BookingHistoryCard.tsx` — Component Spec
- **Left**: `StatusDot` (6-8px, color-coded per `bookingStatus.ts` mapping) + worker's category icon (small, tinted per category color system)
- **Middle**: worker name (line 1), category + service type (line 2, muted)
- **Right**: amount (top, bold), date (bottom, muted)
- **Press**: entire card navigates to `booking/[id]/detail`
- **Accessibility label**: combines worker name, status, amount, and date into one coherent announcement

### 2.4 `BookingHistoryCardSkeleton.tsx`
- Matches card layout exactly; rendered 6× on initial load only (not on subsequent infinite-scroll pages — those use a small inline spinner at list-end instead of full skeletons, since the user already has context by that point)

### 2.5 `StatusDot.tsx` — Reusable Component
- Single source of truth for status color across the entire app (history, active bookings, admin views eventually) — built once here, reused everywhere status needs a visual dot
- Colors follow the existing design system's booking-status palette (PENDING amber, ACCEPTED blue, IN_PROGRESS green pulse — though history is past-tense so pulse is disabled here, COMPLETED gray, CANCELLED light red, DISPUTED red)

### 2.6 Data Layer — `useBookingHistory.ts`
- `useInfiniteQuery` keyed by `[year, categoryFilter]`, page size 20
- `staleTime: 5min` — history data changes rarely once a booking is closed out
- Pagination cursor is the booking `createdAt` timestamp, not offset-based, to avoid duplicate/skipped rows if new bookings complete while the user is scrolling

---

## 3. Screen 2 — Blocked Workers (`blocked-workers.tsx`)

### 3.1 Layout Anatomy (top to bottom)

| Zone | Component | Behavior |
|---|---|---|
| Header | "Blocked Workers" + back | Static |
| Body | `FlashList<BlockedWorker>` of `BlockedWorkerRow` | `estimatedItemSize` 68px |
| Empty | Plain text empty state (no illustration) | "You haven't blocked anyone" — deliberately lightweight, this is a low-traffic, low-emotion screen |

### 3.2 `BlockedWorkerRow.tsx` — Component Spec
- **Left**: 40px circular avatar (muted/desaturated slightly — visually signals "this person is set aside," a subtle but intentional treatment distinct from an active worker avatar elsewhere in the app)
- **Middle**: worker name (line 1), "Blocked on Jan 12, 2025" (line 2, muted, Jakarta)
- **Right**: `[Unblock]` button — **explicit button, not an icon** — sized 36px minimum height, generous horizontal padding, never a tiny "x" icon (per Fitts's Law reasoning in Section 5)

### 3.3 `UnblockConfirmPopover.tsx` — Component Spec
- Tapping `[Unblock]` does **not** immediately unblock — it opens a small anchored popover directly above/below the button (not a full-screen sheet, not a modal) reading: "Unblock [Name]?" with `[Cancel]` / `[Unblock]` inline
- Popover scales in from the exact origin point of the button tap (spring-default, ~150ms) — spatially ties the confirmation to the action that triggered it, so the user's eye never has to travel
- On confirm: row is removed from the list with a height-collapse animation, and a `ToastUndo` appears at the bottom ("Worker unblocked" + "Undo" inline link, 4s auto-dismiss) — because unblocking is genuinely low-stakes and easily reversible, giving a fast undo window is more respectful than a heavier confirm-only pattern

### 3.4 Block Worker Flow — `BlockWorkerSheet.tsx` (built today, entry point lives in Worker Profile)
- Triggered from the `⋮` menu on `worker/[id].tsx` (that screen was built earlier in the roadmap; today we build the sheet component and wire its logic)
- Bottom sheet, 45% snap point:
  1. Title: "Block [Worker Name]?"
  2. Optional short reason list (single-select, non-mandatory): "Unprofessional," "Made me uncomfortable," "Poor quality work," "Other"
  3. Explanatory line: "They won't be able to see your profile or contact you. This won't notify them."
  4. `[Block Worker]` destructive-red button, `[Cancel]` secondary
- On confirm: `POST /users/me/blocks/:workerId` fires, sheet dismisses, `notificationAsync(Success)` haptic + quiet toast "Worker blocked" (no takeover modal — this is a private, low-drama action from the user's perspective, even though it's meaningful)
- **Critical technical requirement**: on success, the mutation must invalidate/patch every relevant React Query cache entry that could still show this worker — nearby-workers list, search results, and any prefetched worker-profile cache — so the blocked worker disappears from discovery **immediately**, not on next app launch

---

## 4. Delete Account Flow (`DeleteAccountSheet.tsx` + steps)

Entry point: `profile.tsx` → Danger Zone → "Delete Account." This is the single most consequential UI flow in the entire settings surface, and it is built as a deliberate **two-step sheet**, not a single screen, to slow the user down appropriately without being punitive.

### 4.1 Step 1 — `DeleteAccountReasonStep.tsx`
- Title: "We're sorry to see you go"
- Optional single-select reason list: "Found a better app," "Too expensive," "Didn't need it anymore," "Privacy concerns," "Other" (skippable — this step exists for product feedback, not to gate the user, so a visible "Skip" link is always present)
- `[Continue]` button advances to Step 2 regardless of whether a reason was picked

### 4.2 Step 2 — `DeleteAccountConfirmStep.tsx`
- Clear, plain-language explanation of consequences: booking history is retained per policy (for legal/dispute purposes) but the account and personal profile are deactivated; this **cannot be undone**
- A text input with placeholder instruction: "Type DELETE to confirm"
- The `[Delete My Account]` button is **disabled** and visually muted until the input exactly matches `"DELETE"` (case-sensitive, no trimming leniency beyond surrounding whitespace)
- If the user taps the (disabled-looking but still tappable for feedback purposes) button before typing correctly: input field does the standard error shake (300ms) + `notificationAsync(Error)` haptic — a clear, deliberately *not gentle* signal that matches the gravity of the action
- On correct match + confirm tap: `useDeleteAccount()` fires the soft-delete API call, then executes the same session-teardown cascade as `useLogout()` from Day 37 (clear React Query cache, Zustand stores, secure-store tokens, MMKV cache), then navigates via `router.replace()` to `(auth)/welcome`
- Final screen the user sees before leaving: a brief, calm full-screen confirmation ("Your account has been deleted. We're sorry to see you go.") shown for ~2 seconds before the redirect completes — this is the **Peak-End Rule** moment: even though the user is leaving, the platform's last impression should be respectful and calm, not an instant, cold app-kill

---

## 5. UX Laws — Full Rationale Table

| Law | Applied Where | Concrete Reasoning |
|---|---|---|
| **Serial Position Effect** | Booking history sorted strictly newest-first | Users overwhelmingly look up *recent* activity ("did that last booking get charged correctly?") — recency is the dominant recall pattern for a transactional history list |
| **Fitts's Law** | `[Unblock]` is a full labeled button (36px+ height, generous width), never a tiny icon-only "x" | A mis-tap here has real consequence (re-exposing a worker the user deliberately blocked) — the target must be large and unambiguous, not optimized for visual minimalism at the cost of accuracy |
| **Recognition over Recall** | `StatusDot` color-coding on history cards instead of requiring the user to read a status word | A user scanning 50+ past bookings recognizes "green = completed fine, red = disputed" instantly by color before their eyes even reach the text |
| **Peak-End Rule** | Delete-account flow closes with a calm, respectful full-screen goodbye message before redirect, rather than an instant silent kill | The very last thing a departing user experiences shapes their lasting impression of the brand — even in an exit flow, this moment is worth designing deliberately |
| **Intentional Friction (deliberate anti-Hick's-Law choice)** | Type-to-confirm "DELETE" gate | This is the **one screen** in the entire app where the standard "reduce choices, reduce friction" instinct is wrong — an irreversible, high-regret action should be *harder* to complete by accident, not easier |
| **Jakob's Law** | Unblock confirmation via a small anchored popover mirrors the same lightweight confirm pattern used for "delete a non-default address" (Day 36) and "delete a non-default card" (Day 37) | Consistent weight-of-confirmation logic across the app: low-stakes reversible actions always get a light popover-style confirm, never a heavy full-screen modal |
| **Goal-Gradient Effect** | Delete Account is deliberately split into 2 steps (reason → confirm) rather than 1 | Each step completed feels like forward progress even in a flow the user is emotionally resistant to — and the two-step structure naturally creates a moment of pause before the truly irreversible action |

---

## 6. Microinteractions & Haptics — Complete Map (Minimal, Justified Set Only)

| Interaction | Motion Spec | Haptic | Why It Exists |
|---|---|---|---|
| History card list entrance | Stagger fade + slide-up 8px, 40ms/item, max 8 items staggered | none | A scanning task — motion should orient, not entertain; no haptic needed for passive list render |
| Filter change (year/category) | 150ms cross-fade on list content | `selectionAsync` | Confirms the filter registered; cross-fade avoids a jarring hard-reload feel |
| Unblock button tap | `UnblockConfirmPopover` scale-in from tap origin, spring-default | `impactAsync(Light)` | Light tap acknowledgment — the real decision moment is the popover's confirm button, not this initial tap |
| Unblock confirm | Row height-collapses to 0, spring-gentle; `ToastUndo` slides up from bottom | `notificationAsync(Success)` | Confirms a real (if reversible) state change occurred |
| Undo tap (within 4s toast window) | Row re-inserts with a reverse height-expand, spring-gentle | `impactAsync(Light)` | Rewarding the correction — should feel just as easy as the original action |
| Block Worker sheet open | spring-gentle rise | none | Passive/expected sheet transition |
| Block Worker confirm | Sheet dismisses, quiet toast appears | `notificationAsync(Success)` | Meaningful but private action — no takeover modal, no loud celebration |
| Delete Account Step 1 → Step 2 | Standard sheet-internal horizontal slide (250ms) | `selectionAsync` | Signals forward progress through the flow |
| Delete confirm tapped with invalid text | Input field shake (standard 300ms error shake) | `notificationAsync(Error)` | Deliberately firm feedback — this is the one place a stronger, less gentle signal is correct |
| Delete confirm success | Full-screen calm goodbye message, no bounce, simple 300ms fade-in | `notificationAsync(Success)` (fired once, not repeated) | Marks genuine completion of an irreversible action — a single clear haptic, not a celebratory pattern |

**No expressive/celebratory motion appears anywhere on this day** — even the "success" haptics here confirm completion of consequential actions (blocking, unblocking, deleting), not achievements to be celebrated.

---

## 7. State Design

### Loading
- Booking history: `BookingHistoryCardSkeleton` × 6 on first load only; subsequent infinite-scroll pages show a small inline spinner at list-end, not full skeletons
- Blocked workers: near-instant typically (small list); skeleton only if fetch exceeds 300ms, matching the guarded-delay pattern from Day 36/37

### Empty
- Booking history: illustrated empty state + "Book your first service" CTA (this is a genuinely encouraging moment — a new user with no history yet)
- Blocked workers: plain text only, no illustration — over-designing a "you haven't blocked anyone" state would give this minor screen more visual weight than it deserves

### Error
- History fetch failure: inline retry row; filters remain usable
- Unblock failure: popover confirm shows an inline error state ("Couldn't unblock — try again") rather than dismissing silently; row is **not** optimistically removed until the server confirms (unlike most other optimistic patterns in this app, unblocking is deliberately confirmed-first, because leaving a worker blocked when the user believed they unblocked them is a worse failure mode than a slightly slower UI)
- Block worker failure: sheet stays open, inline error text appears above the button, user can retry without re-selecting their reason
- Delete account failure: sheet stays open on Step 2, the typed "DELETE" text is preserved, a clear error message appears ("Something went wrong — your account has not been deleted"), and no local state is cleared until the server confirms success (this is the one place where an optimistic "clear everything and hope it works" pattern would be actively dangerous)

---

## 8. Typography & Color Map (Full)

| Element | Font | Size/Weight | Color Token |
|---|---|---|---|
| Screen titles ("Booking History", "Blocked Workers") | Poppins | SemiBold 22px | `textPrimary` |
| Booking amount | Inter | SemiBold 14px | `textPrimary` |
| Booking date | Inter | Regular 12px | `textMuted` |
| Worker/category name (history card) | Jakarta | Medium 14px | `textPrimary` |
| Service type / subtitle | Jakarta | Regular 12px | `textSecondary` |
| Blocked worker name | Jakarta | Medium 15px | `textPrimary` |
| "Blocked on [date]" | Jakarta | Regular 12px | `textMuted` |
| `[Unblock]` button label | Jakarta | SemiBold 13px | `textDanger` on outline button |
| Filter bar labels | Jakarta | Medium 13px | `textPrimary` |
| Block Worker sheet title | Poppins | SemiBold 18px | `textPrimary` |
| Block reason list items | Jakarta | Regular 14px | `textPrimary` |
| Delete Account warning body | Jakarta | Regular 14px | `textDangerDark` on `#FEF2F2` background |
| Delete Account input placeholder | Jakarta | Regular 15px | `textMuted` |
| `[Delete My Account]` button label | Poppins | SemiBold 16px | `textOnGreen`-equivalent but on danger-red background (`#FFFFFF` on `#EF4444`) |
| Final goodbye message | Poppins | SemiBold 18px | `textPrimary` |

---

## 9. Spacing, Sizing & Touch Target Reference

| Element | Value |
|---|---|
| Screen horizontal padding | 16px |
| `BookingHistoryCard` height | 84px |
| Card gap in list | 10px |
| `YearCategoryFilterBar` height | 44px, sticky |
| `BlockedWorkerRow` height | 68px |
| `[Unblock]` button | 36px height minimum, 16px horizontal padding, radius-pill |
| `UnblockConfirmPopover` width | ~220px, anchored with 8px offset from trigger |
| `BlockWorkerSheet` snap point | 45% |
| `DeleteAccountSheet` snap point | 70% (both steps share this height, content swaps internally) |
| Delete confirm input height | 52px, radius-md |
| `[Delete My Account]` button height | 52px, full-width minus 32px margin, radius-pill |

---

## 10. Accessibility Requirements (Specific to This Day)

- `BookingHistoryCard`: combined `accessibilityLabel` announcing worker, status, amount, and date together, not four separate reads
- `StatusDot`: never color-only — always paired with a text status label somewhere in the accessible reading order (color blindness safety; the dot is a *scan aid* for sighted users, not the sole signal)
- `[Unblock]` button: `accessibilityLabel="Unblock [Worker Name]"`, `accessibilityHint="Opens a confirmation"`
- `UnblockConfirmPopover`: traps focus while open, returns focus to the triggering button on dismiss
- `BlockWorkerSheet`: reason list uses `accessibilityRole="radio"` per item
- `DeleteAccountConfirmStep`: the disabled state of `[Delete My Account]` is announced via `accessibilityState={{disabled: true}}`; once enabled, the state change is announced so screen-reader users know the moment the action becomes available
- Final goodbye screen: uses `accessibilityLiveRegion="polite"` so screen readers announce the completion message automatically without requiring focus navigation
- All text respects `maxFontSizeMultiplier={1.3}`

---

## 11. Edge Cases to Explicitly Handle

- User has 100+ historical bookings across multiple years → year filter must not render 100 individual year options poorly; use a compact native picker or scrollable sheet, and default to "All Time" if the user has fewer than ~10 total bookings (skip the filter complexity entirely for light users)
- User blocks a worker they currently have an **active** (non-completed) booking with → block should still succeed for future discovery purposes, but must **not** silently cancel or hide the currently active booking; show a clear inline note in the block sheet: "You still have an active booking with this worker — blocking won't affect it"
- User attempts to unblock, but the block-list cache is stale and the worker was already unblocked from another device → server returns a graceful "already unblocked" response, client treats this as success (idempotent unblock), no error shown
- Rapid double-tap on `[Delete My Account]` right as it becomes enabled → button must lock into a loading state on first tap to prevent a duplicate delete-account mutation firing twice
- User backgrounds the app mid-Delete-Account-Step-2 (typed "DEL" so far) → typed text should persist if they return within the session (don't reset the field on app foreground/background cycling)
- Network drops exactly between the delete-account API success and the local session-teardown cascade → design the mutation so the teardown is a `.then()` continuation of a confirmed server success, never assumed client-side, so a partial-failure state (server deleted, client still thinks it's logged in) cannot occur

---

## 12. Definition of Done — Day 38 Ship Gate

- [ ] Booking history pagination tested past 100+ bookings — no jank, no duplicate keys, cursor-based pagination confirmed correct across page boundaries
- [ ] Year/category filters correctly reset pagination to page 1 and reflect in the query key
- [ ] Blocked workers never resurface in nearby search results or worker-profile prefetch cache — verified by blocking a worker, then immediately re-running a nearby search and confirming their absence without an app restart
- [ ] Unblock uses confirmed-first (non-optimistic) update pattern, with working `ToastUndo` within its 4-second window
- [ ] Block Worker sheet correctly shows the "active booking" warning note when applicable
- [ ] Delete Account requires an exact, case-sensitive "DELETE" match before the confirm button enables
- [ ] Delete Account error path preserves typed input and does not clear any local session state until server confirms success
- [ ] Full session-teardown cascade on successful delete matches the Day 37 logout cascade exactly (React Query cache, all Zustand stores, secure-store tokens, MMKV)
- [ ] Final goodbye screen displays for a consistent ~2 seconds before redirect, tested on both iOS and Android
- [ ] All destructive actions (block, unblock, delete account) fire the correct haptic + either a toast or full-screen confirmation as specified
- [ ] Typography audit: Inter used only for amounts/dates on history cards; every other text element uses Jakarta or Poppins per the map in Section 8
- [ ] VoiceOver / TalkBack pass completed on both screens plus the Block Worker sheet and both Delete Account steps

---

*Tasklync — Day 38 Deep Build Plan*
*Three registers, one day: scan quickly, control quietly, leave with dignity.*
