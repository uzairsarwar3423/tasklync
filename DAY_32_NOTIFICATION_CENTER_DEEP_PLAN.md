# 🔔 DAY 32 — Notification Center Screen
### Deep Implementation Plan · Principal React Native Engineer Level
> Scope: In-app notification feed for Tasklync User App (Expo SDK 52, Expo Router, Zustand, TanStack Query, Reanimated 3, Gesture Handler)
> This day builds on Day 31's plumbing (`NotificationProvider`, push token, `notification.store.ts`) — this is the **UI + data-list engineering day**: pagination, grouping, swipe gestures, optimistic cache updates, and the badge that ties the whole notification system together app-wide.

---

## 0. Why This Day Is Architected the Way It Is

A notification feed looks simple but is actually **five hard list-engineering problems stacked together**:

1. **Grouping a flat paginated list by date** — the backend returns a flat array; grouping-by-date with sticky headers on an infinite-scroll list is a client-side transform that must stay stable across pagination (page 2 shouldn't create a duplicate "Today" header).
2. **Optimistic mutations on list items inside a paginated cache** — marking one item read/deleted must update that exact item inside a `useInfiniteQuery` cache (an array of pages), not just refetch everything (which would cause visible list flicker/scroll-jump).
3. **Swipeable rows inside a scrollable list** — horizontal pan gestures must not fight FlashList's vertical scroll gesture; this needs `react-native-gesture-handler`'s simultaneous/failure-based gesture composition, not a naive `PanResponder`.
4. **A badge count that's correct everywhere at once** — the tab bar bell, the home header bell, and this screen's own header all show the same unread count; they must all read from one cache-backed source, not three independently-fetched numbers that can drift out of sync.
5. **Real-time freshness without polling waste** — new notifications should reflect in the badge without the user manually pulling to refresh, but this screen must not poll aggressively (battery/network cost) — it should react to the same socket/push event Day 31 already receives.

Everything below is structured around solving these five problems once, cleanly, rather than solving them ad-hoc per component.

---

## 1. Complete File Tree for the Day

```
app/
  └── notifications/
      └── index.tsx                         # SCREEN: Notification Center

src/
  ├── components/
  │   └── notification/
  │       ├── NotificationItem.tsx          # single row UI (presentational)
  │       ├── NotificationGroupHeader.tsx   # sticky date section header
  │       ├── NotificationSwipeRow.tsx      # NEW — gesture wrapper around NotificationItem
  │       ├── NotificationIcon.tsx          # NEW — type→icon/color resolver, small reusable atom
  │       └── NotificationBell.tsx          # (touched) already exists per app structure — wired to real unread count now
  │
  ├── components/feedback/EmptyState/
  │   └── EmptyNotifications.tsx            # empty/all-caught-up state
  │
  ├── hooks/
  │   ├── useNotifications.ts               # useInfiniteQuery feed + mutations
  │   └── useUnreadCount.ts                 # NEW — isolated badge-count hook, used app-wide
  │
  ├── utils/
  │   └── groupByDate.ts                    # NEW — pure function: flat list → grouped sections
  │
  ├── services/api/
  │   └── notification.api.ts               # getNotifications(), markRead(), markAllRead(), getUnreadCount(), deleteNotification()
  │
  └── types/
      └── notification.types.ts             # NEW — Notification, NotificationType, NotificationGroup types
```

**4 files added beyond the original list** — `NotificationSwipeRow.tsx`, `NotificationIcon.tsx`, `useUnreadCount.ts`, `groupByDate.ts` — each exists to isolate one of the five hard problems above so it's independently buildable and testable, rather than baked into the screen file.

---

## 2. `src/types/notification.types.ts` (build first — everything else types against this)

**Responsibility:** Single shared shape for a notification object, matching the backend envelope from `API_ENDPOINTS.md` (`id`, `type`, `title`, `body`, `data`, `isRead`, `createdAt`).

**Why this matters before any component exists:** `NotificationItem`, `groupByDate.ts`, `useNotifications.ts`, and `NotificationIcon.tsx` all need the exact same `type` union (`'booking_accepted' | 'booking_started' | 'new_message' | 'worker_arrived' | 'payment_receipt' | 'review_request' | ...`) — defining this once prevents four files quietly drifting into four slightly different assumptions about what fields exist, which is the single most common source of "works on my screen but breaks on that one" bugs in list-heavy features.

---

## 3. `src/utils/groupByDate.ts`

**Responsibility:** Pure function — takes the flat, already-paginated notification array from the query cache and returns a grouped structure: `[{ title: 'Today', data: [...] }, { title: 'Yesterday', data: [...] }, { title: 'Jan 12', data: [...] }]`.

**Why this is a pure utility and not inline logic in the screen:**
- Fully unit-testable with zero React/query mocking — feed it a fixed array of timestamps, assert the grouping output. This is the kind of logic that silently breaks (e.g. timezone edge case at midnight) if it's buried inside a component render function where it's harder to isolate in a test.
- Must be **re-run on every page fetch**, not computed once — as page 2/3 load in via infinite scroll, new items may belong to an "Older" group that didn't exist yet on page 1. The function must merge correctly rather than each page rendering its own independent "Today" header (this is the specific bug that happens when grouping is done per-page instead of on the full flattened list).

**Design decision — SectionList vs FlashList+grouping:** Section headers with infinite pagination and swipeable rows work more predictably with a flat `FlashList` where **group headers are injected as special row items** (a `type: 'header'` row mixed into the same array) rather than React Native's native `SectionList`, because `SectionList` doesn't support `FlashList`'s recycling performance and doesn't compose as cleanly with per-row swipe gestures. `groupByDate.ts` should output a **flat array with header markers**, not nested sections — this is a deliberate architecture choice worth stating explicitly since it affects every other file.

---

## 4. `src/components/notification/NotificationIcon.tsx`

**Responsibility:** Small, pure presentational atom — takes a `type` string, returns the correct icon + tint color pairing (chat bubble for `new_message`, checkmark for `booking_accepted`, pin for `worker_arrived`, receipt for `payment_receipt`, star for `review_request`).

**Why this is its own file:** This exact type→icon mapping is needed in **three separate places** across the app: this screen's rows, Day 31's `InAppBanner`, and (later) push notification categories. Defining it once here and importing it everywhere prevents three slightly-different icon sets existing across the app, which quietly erodes **Recognition over Recall** — if the chat icon looks different in the banner vs the notification list, the user's learned association breaks.

---

## 5. `src/services/api/notification.api.ts`

**Responsibility:** Thin HTTP layer, consistent with every other `*.api.ts` file in the codebase.

**Functions:**
- `getNotifications({ page, limit })` → `GET /notifications`
- `markRead(id)` → `PATCH /notifications/:id/read`
- `markAllRead()` → `PATCH /notifications/read-all`
- `getUnreadCount()` → `GET /notifications/unread-count`
- `deleteNotification(id)` — **not in the original endpoint list from `ALL_API_ENDPOINTS.md`**; this needs a 5-minute conversation with backend before building the delete swipe action, since the documented API only shows mark-read endpoints, not a delete endpoint. Flagging this explicitly now rather than discovering it mid-build is the actual senior-engineer move here — either backend adds `DELETE /notifications/:id`, or the "Delete" swipe action is redefined as "Dismiss" (client-side hide only, no server call), which is a product decision to make before writing the swipe component, not after.

---

## 6. `src/hooks/useNotifications.ts`

**Responsibility:** The data-layer heart of the screen — owns the paginated query and every mutation that touches it.

**Query side:**
- `useInfiniteQuery` keyed on `['notifications']`, `getNextPageParam` derived from the API's pagination metadata (per the standard envelope documented in `API_ENDPOINTS.md`).
- Exposes a derived, memoized **flattened + grouped** list (via `groupByDate.ts`) so the screen component never touches raw page arrays directly — the screen only ever renders "the list," not "pages of the list."

**Mutation side — this is the part that needs real care:**

- **`markRead(id)`:**
  1. Optimistically updates the item's `isRead: true` **inside the correct page** of the infinite query cache (using `queryClient.setQueryData` with a page-aware updater function — not a full refetch, which would cause a visible scroll-position jump on a long list).
  2. Optimistically decrements the cached unread count (shared with `useUnreadCount.ts`, see below) by 1 — this is what makes the badge and the dot disappear in the same frame, before the server even responds.
  3. On server error: rolls back both the item's `isRead` flag and the count decrement — a failed mark-read must not leave the UI lying about state.

- **`markAllRead()`:**
  1. Optimistically sets every cached item across every loaded page to `isRead: true` in one pass.
  2. Optimistically zeroes the unread count.
  3. On error: rather than a complex per-item rollback, simplest correct behavior is invalidating and refetching the first page + count — a full rollback of a bulk action is rarely worth the complexity versus a single refetch, since bulk-mark-all failures should be rare and a refetch resolves truth cheaply.

- **`deleteNotification(id)`** (pending the backend conversation above):
  1. Optimistically removes the item from its page array.
  2. If it was unread, also decrements the unread count.
  3. Rollback re-inserts the item at its original index on failure (position matters here — re-inserting at the end instead of the original spot would look visually wrong to a user watching it "come back").

**Why all three mutations manipulate the *same* infinite-query cache key rather than each doing their own thing:** This is what keeps the badge, the dot, and the row itself perfectly in sync without three separate network round-trips — one optimistic cache write, read from three places.

---

## 7. `src/hooks/useUnreadCount.ts`

**Responsibility:** A small, isolated hook wrapping `GET /notifications/unread-count`, designed to be imported from **three unrelated places**: the tab bar bell, the home header bell (per `HomeHeader.tsx` from the wider app spec), and this screen's own header.

**Why this needs to be its own hook and not just inlined into `useNotifications.ts`:** The tab bar and home header need the count **without** paying the cost of the full notification list query — importing `useNotifications()` just to read a count would force those unrelated parts of the app to also subscribe to the entire paginated notification cache, which is unnecessary coupling and unnecessary data fetching on screens that have nothing to do with the notification list itself.

**Sync strategy (solving hard problem #5 — freshness without polling):**
- No aggressive interval polling. Instead, this hook's query is **invalidated reactively** in two places: (a) `NotificationProvider` from Day 31, when a push notification is received via the foreground listener — it calls `queryClient.invalidateQueries(['notifications', 'unread-count'])` as a side effect; (b) this same invalidation happens after any of `useNotifications`'s mutations settle. This means the badge updates the instant something relevant happens, with zero polling overhead the rest of the time.

---

## 8. `src/components/notification/NotificationItem.tsx`

**Responsibility:** Pure presentational row. Receives a single notification object + an `onPress` callback. Renders `NotificationIcon`, title, body, relative timestamp, and the unread dot.

**Layout specifics:**
- Row height: 72px minimum — deliberately generous (Fitts's Law: this is a frequently-tapped, one-thumb-reachable target on a screen users often check quickly).
- Unread dot: 8px, positioned top-right of the icon slot — small enough to not compete with the title text for attention, but present enough to be scannable in peripheral vision as the user scrolls.
- Title: Poppins SemiBold when unread, Poppins Regular weight-equivalent (Jakarta Medium, since body copy shouldn't be Poppins per the type system) once read — this is a **microinteraction expressed through typography, not animation**: the read/unread state difference is felt through weight change instantly, no transition needed, which is cheaper and clearer than an animated treatment for a state that isn't a "moment," just a status.
- Body: Plus Jakarta Sans Regular, 2-line clamp with ellipsis — keeps row height fixed and predictable regardless of message length (fixed height rows are what make `FlashList`'s recycling/estimatedItemSize performance guarantee hold).
- Timestamp: Inter Regular ("2 min ago") — per the type system's rule that anything computed/measured (relative time is a calculated value) uses Inter, not Jakarta.

**Explicitly has no gesture logic** — swipe is handled one layer up, in `NotificationSwipeRow.tsx`, keeping this component purely about "what a notification looks like," reusable even in contexts that don't need swipe (e.g. a hypothetical notification preview elsewhere).

---

## 9. `src/components/notification/NotificationSwipeRow.tsx`

**Responsibility:** The gesture wrapper — this is the file that solves hard problem #3 (swipe vs scroll gesture conflict).

**Gesture composition approach:**
- Uses `react-native-gesture-handler`'s `Pan` gesture with an explicit horizontal-only activation threshold (e.g. must move ≥10px horizontally before the gesture engages) combined with `.activeOffsetX([-10, 10])` and `.failOffsetY([-10, 10])` — this is what allows the **same touch** to correctly resolve as either "the user is scrolling the list vertically" or "the user is swiping this specific row horizontally," handing off to whichever gesture wins the race, rather than both trying to respond and producing janky diagonal drag behavior.
- Wraps the row in an `Animated.View` whose `translateX` is driven 1:1 by the pan gesture's `translationX` (functional interaction — no spring easing while dragging, since the row must feel like it's physically attached to the finger, not lagging behind it).
- Reveals two fixed-width action zones behind the row (Mark read / Delete) that fade/scale in as the row translates past a threshold — but the **row itself moves 1:1**, only the *reveal opacity* of the action icons is what's animated, keeping the drag itself perfectly responsive.
- On release: if translation passed a commit threshold (roughly 30% of row width, consistent with the "25% width to reveal, further to commit" spec), the row completes its collapse (spring-stiff, 200ms) and the corresponding mutation from `useNotifications.ts` fires. If released before threshold, the row springs back to `translateX: 0` (spring-default) — a clean cancel with no side effect.

**Why exactly 2 actions and not more (Hick's Law, restated as an implementation constraint):** The swipe distance and the two fixed action-zone widths are calculated together — this component is explicitly built for a 2-action layout, not a generalized N-action swipe system. Building a more "flexible" N-action swipe component here would be premature generalization for a product requirement that is deliberately capped at 2 choices.

---

## 10. `src/components/notification/NotificationGroupHeader.tsx`

**Responsibility:** The sticky section header row ("Today", "Yesterday", a formatted date for older groups).

**Implementation note:** Since the list is a flat `FlashList` with header rows injected by `groupByDate.ts` (see section 3), "stickiness" is achieved via `FlashList`'s `stickyHeaderIndices` prop, computed from the positions of header-type rows in the flattened array — this must be recalculated whenever the grouped data changes (new page loaded, item deleted shifting a group's size), so this index calculation lives alongside the grouping logic, not hardcoded once.

**Typography:** Poppins SemiBold, small size (h5-equivalent per the type scale) — a header needs enough visual weight to separate from body rows without competing with actual notification titles for attention.

---

## 11. `src/components/feedback/EmptyState/EmptyNotifications.tsx`

**Responsibility:** The Peak-End Rule payoff screen — shown only when the query has resolved with zero total items across zero pages (explicitly **not** shown during initial loading or between paginated fetches — this distinction is a query-state check the screen must get right: `isLoading` and `isFetchingNextPage` are different states from "confirmed empty").

**Content:** Illustration + "You're all caught up! 🎉" (Poppins SemiBold) + no CTA button — per the wider app's empty-state rules, this is the one empty state that intentionally has **no call-to-action**, because there's nothing productive to direct the user toward from an empty notification list; forcing a CTA here ("Browse Services") would be a non-sequitur next to a message about being caught up.

---

## 12. `app/notifications/index.tsx` (the screen — assembles everything above)

**Responsibility:** Composition root for the day. This file should be relatively thin — its job is wiring, not logic, since every hard problem has already been solved in the files above.

**Structure:**
- Header: "Notifications" title (Poppins) + "Mark all read" text action, right-aligned — conditionally rendered/disabled when unread count is already 0 (avoids an active-looking button that does nothing).
- Body: `FlashList` rendering the grouped-flattened array from `useNotifications()`, with:
  - `renderItem` switching on row type: header row → `NotificationGroupHeader`, notification row → `NotificationSwipeRow` wrapping `NotificationItem`.
  - `stickyHeaderIndices` from the grouping utility.
  - `estimatedItemSize` set to 72 (matching the fixed row height decision in section 8 — this is what makes `FlashList`'s performance model actually hold; an inaccurate estimate here is a common silent performance regression).
  - `onEndReached` → `fetchNextPage()`.
  - `RefreshControl` wired to a manual refetch of page 1, brand green tint, no custom animation (per the "utilitarian, not celebratory" pull-to-refresh decision).
- Footer/empty: `EmptyNotifications` rendered conditionally per the query-state distinction in section 11.

**Deep link landing behavior:** When arriving here via the bell tap or a Day-31 banner tap, no special handling is needed beyond normal mount — the screen always shows the live, current feed regardless of entry point, which is the correct behavior (no need to scroll-to or highlight a specific notification unless a future requirement asks for it).

---

## 13. `NotificationBell.tsx` Wiring (touched, not newly built)

**Responsibility:** This component already exists structurally elsewhere in the app (home header, tab bar); today's work is wiring it to `useUnreadCount()` instead of any placeholder/static value.

**Microinteraction (the one expressive moment of the day):** Count change triggers scale `1.0 → 1.2 → 1.0` (spring-bouncy). This must be driven by a **value change effect** (comparing previous vs new count), not by every re-render — a naive implementation that re-triggers the bounce on every parent re-render (even when the count hasn't actually changed) is a common bug that makes the badge feel twitchy/broken rather than purposeful.

---

## 14. UX Laws — Implementation-Level Detail

- **Serial Position Effect:** Enforced structurally by `groupByDate.ts`'s output order (Today always first) combined with `NotificationItem`'s typography weight difference for unread items — the combination of *position* (grouping) and *visual weight* (bold-when-unread) is what makes "today's unread items" the most memorable/scannable set on the screen, which is the actual design goal behind citing this law, not just the grouping alone.
- **Hick's Law:** Enforced at the gesture-geometry level in `NotificationSwipeRow.tsx` — the component is physically built for exactly 2 action zones, not configurable to more, which prevents future scope creep from silently violating the principle.
- **Fitts's Law:** Enforced by making the entire `NotificationItem` row (not just the text) the `onPress` target, and by the 72px minimum row height — both are concrete, testable layout constraints, not just a stated intention.
- **Peak-End Rule:** Enforced by the explicit query-state distinction in `EmptyNotifications` (section 11) — this law only pays off if the empty state is shown at the *correct* moment (true end-of-content), not accidentally during a loading flash, which would undercut the intended "resolved" feeling with a confusing blank-then-content flicker.
- **Jakob's Law:** Enforced by matching iOS Mail's exact swipe geometry (reveal threshold, action zone width, colors — blue for a neutral/positive action, red for destructive) rather than inventing new conventions.
- **Recognition over Recall:** Enforced by `NotificationIcon.tsx` being a single shared source used identically across this screen, Day 31's banner, and any future surface — one icon-to-meaning mapping, memorized once by the user, never contradicted elsewhere in the app.

---

## 15. Typography Reference for This Screen

```
Poppins           → Screen title "Notifications", "Mark all read" action label,
                     group headers ("Today"/"Yesterday"), empty-state headline
Plus Jakarta Sans  → Notification body text (2-line clamp), "Mark read"/"Delete"
                     swipe action labels
Inter              → Relative timestamps ("2 min ago"), unread count badge number
```

---

## 16. Edge Cases Checklist

| Edge case | Expected behavior |
|---|---|
| User swipes a row, then scrolls the list before releasing | Gesture composition (`failOffsetY`) ensures the pan hands off cleanly to scroll; row springs back to `translateX: 0` |
| Mark-read fires while `markAllRead` is also in flight | Both mutations target the same cache key; last-write-wins is acceptable here since both converge on the same end state (all/one read) |
| Page 2 loads and contains items that are actually "Today" (clock rolled past midnight during a long scroll session) | `groupByDate.ts` re-runs on the full flattened list on every page change, not per-page, so grouping stays correct |
| User deletes the last item in a date group | Group header for that now-empty group must also disappear — `groupByDate.ts` must drop empty groups, not render a header with zero rows under it |
| Unread count goes negative due to a race (rapid mark-read taps) | Optimistic decrement is clamped at 0 client-side as a safety floor, real value reconciled on next invalidation |
| `deleteNotification` endpoint doesn't actually exist server-side yet | Product/eng decision resolved *before* building the swipe action (section 5) — either backend adds it this sprint, or "Delete" becomes a client-only "Dismiss" |
| Empty state flashes briefly before real data loads on a slow connection | `isLoading` (first load) explicitly excluded from the "show empty state" condition — only a *resolved* zero-length result shows it |

---

## 17. Testing Plan for the Day

| Scenario | Check |
|---|---|
| Cold load with 30+ notifications across 3+ days | Groups render correctly, sticky headers behave, infinite scroll loads page 2/3 without duplicate headers |
| Swipe right-to-left on a row | Both actions reveal at correct threshold, drag feels 1:1, release-before-threshold cancels cleanly |
| Mark single item read | Dot fades, unread count decrements, bell badge bounces exactly once |
| Mark all read | All dots clear, count zeroes, no scroll-position jump |
| Delete a notification | Row collapses smoothly, no layout jump for rows below it |
| Zero notifications (new account) | Empty state shows, no flicker of loading state first |
| Bell tap from another screen → lands here | Feed loads correctly regardless of entry point |
| Push notification arrives while this screen is open | Badge/count updates via invalidation without requiring manual pull-to-refresh |

---

## 18. Build Order for the Day

1. `notification.types.ts` (everything types against this)
2. `groupByDate.ts` (pure, unit-testable in isolation first)
3. `notification.api.ts` (confirm delete-endpoint question with backend here, before building the swipe UI that depends on it)
4. `useNotifications.ts` (query + optimistic mutations)
5. `useUnreadCount.ts` (isolated badge hook)
6. `NotificationIcon.tsx` (small shared atom)
7. `NotificationItem.tsx` (presentational row)
8. `NotificationGroupHeader.tsx`
9. `NotificationSwipeRow.tsx` (gesture layer — build last among components since it wraps everything above)
10. `EmptyNotifications.tsx`
11. `app/notifications/index.tsx` (composition root)
12. `NotificationBell.tsx` wiring (connect existing component to `useUnreadCount`)
13. Manual QA matrix (section 17)

---

*Day 32 — Notification Center Screen — Deep Implementation Plan*
*Tasklync · React Native Expo · Principal Engineering Standard*
