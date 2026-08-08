# 🗺️ Tasklync — Day 20 (Expanded) — Live Map Screen
### InDriver/Uber-style Discovery · Fully Componentized · Zero Code, Full Implementation Spec

> Senior engineering principle applied here: **one component = one responsibility.**
> The screen file (`live-map.tsx`) should end up being mostly *composition* — importing and arranging components — not logic, not markup soup, not animation code inline. If a piece of UI has its own state, its own animation, or its own visual identity, it gets its own file. This is what makes the screen scalable, testable, and reusable later (e.g. the same `MapWorkerCard` can be reused inside search results, the same `RecenterButton` inside the tracking screen from Day 19).

**Fonts (locked, no exceptions):**
- **Poppins** → worker name on `MapWorkerCard`, "N workers nearby" panel heading, screen-level labels
- **Plus Jakarta Sans** → category chip labels, "Book" button label, helper/empty-state text
- **Inter** → rating number, distance ("1.2 km"), ETA/response time — anything that is a measured value

---

## 1. Objective

Full-screen live map, InDriver/Uber pattern: pulsing user location, animated worker pins, a draggable bottom panel with horizontal worker cards, category filtering — everything bidirectionally synced (pin ↔ card) — built as **12+ small composable components** instead of a handful of large files.

---

## 2. Full File/Folder Breakdown

```
app/
  (map)/
    live-map.tsx                          — COMPOSITION ONLY: assembles everything below

src/components/map/
  ├── MapCanvas.tsx                       — wraps <MapView>, holds camera ref, region state
  ├── UserMarker.tsx                      — pulsing blue dot (current location)
  ├── WorkerMarker.tsx                    — the pin itself (avatar + status ring + selected state)
  ├── WorkerMarkerBadge.tsx               — small category-icon badge, bottom-right of marker
  ├── RadiusCircle.tsx                    — 5km translucent search-radius overlay
  ├── MapControls.tsx                     — small wrapper grouping zoom + recenter (right-edge stack)
  ├── ZoomControl.tsx                     — [+] [-] stacked buttons
  ├── RecenterButton.tsx                  — single floating button, returns camera to user
  ├── MapTopBar.tsx                       — floating container that holds Back + CategoryFilterChips
  ├── CategoryFilterChips.tsx             — horizontal scroll chip row (reuses Chip/ChipGroup primitives)
  ├── MapSearchBar.tsx                    — floating rounded search trigger (non-interactive input look)
  ├── MapBottomPanel.tsx                  — the sheet shell: handle + drag + snap points only
  ├── MapPanelHeader.tsx                  — "12 workers nearby" count label, lives INSIDE the panel
  ├── MapWorkerList.tsx                   — horizontal FlashList of cards, owns scroll/selection sync
  ├── MapWorkerCard.tsx                   — single card: avatar, name, rating, distance, category tag, Book
  ├── MapEmptyState.tsx                   — "No workers found nearby" — shown when list is empty
  └── MapSkeletonCard.tsx                 — shimmer placeholder matching MapWorkerCard exact shape

src/hooks/
  ├── useNearbyWorkers.ts                 — (existing, Day 8/11) reused, called with map bounds
  ├── useMapCamera.ts                     — NEW: exposes flyTo(worker), recenter(), current region
  └── useMarkerSelection.ts               — NEW: single source of truth for "which marker/card is selected"

src/store/
  └── mapFilter.store.ts                  — NEW: selected category, persists while screen is open (zustand, not persisted to disk — session only)
```

**Why this split matters (senior reasoning, not busywork):**
- `MapCanvas` never knows about workers, filters, or panels — it only knows how to render a map and expose a camera ref. This means if you ever swap `react-native-maps` for another provider, only this one file changes.
- `useMarkerSelection` is the **single source of truth** for "what's selected" — both `WorkerMarker` (via prop from parent) and `MapWorkerCard` read from the same hook, so pin↔card sync can never drift out of sync (a very common bug when selection state is duplicated in two components).
- `MapBottomPanel` (the sheet mechanics: drag, snap, handle) is completely separate from `MapWorkerList` (the data/content inside it) — this means the same sheet shell could later hold something totally different (e.g., a filters sheet) without rewriting drag physics.
- `MapWorkerCard` and `MapSkeletonCard` are sibling files on purpose — the skeleton must pixel-match the real card exactly, and keeping them side-by-side as separate files makes that drift immediately visible in code review.

---

## 3. Component-by-Component Detail

### 3.1 `app/(map)/live-map.tsx` — Composition Root
**Responsibility:** Layout only. Renders `MapCanvas` full-screen, then layers `MapTopBar`, `MapControls`, and `MapBottomPanel` on top via absolute positioning. Wires `useNearbyWorkers`, `useMapCamera`, `useMarkerSelection`, and `mapFilter.store` together and passes data down — contains no animation code, no styling logic beyond a `StyleSheet.absoluteFill` layer stack.

### 3.2 `MapCanvas.tsx`
**Responsibility:** Owns the `<MapView>` instance, custom light map style (no POI clutter), initial region, and forwards a ref up so `useMapCamera` can call `animateToRegion`. Renders `UserMarker` + one `WorkerMarker` per result (received as children/props) + `RadiusCircle`.

### 3.3 `UserMarker.tsx`
**Responsibility:** The current-location dot only.
- **Microinteraction:** pulse ring `scale 1→2, opacity 0.4→0`, 2s linear loop, continuous restart.
- **Why:** communicates "this is live," distinct from every static pin around it.

### 3.4 `WorkerMarker.tsx`
**Responsibility:** Renders the avatar circle + white border + online/busy ring color. Reads `isSelected` from `useMarkerSelection` (does not manage its own selection state).
- **Entrance:** `scale 0→1.15→1` spring-bouncy, staggered 40ms per marker on first data load.
- **Idle float:** `translateY 0→-4→0`, 2s loop, subtle.
- **Selected state:** `scale→1.25 + shadow→xl`, spring-snappy 200ms, no bounce (state change, not celebration).
- **UX Law — Recognition over Recall:** real avatar photo in the pin, not a generic numbered dot — user recognizes faces while scanning, faster than reading names.
- **UX Law — Von Restorff Effect:** the selected marker is the *only* one that scales/shadows this way — it must visually separate from 15–20 siblings or selection is invisible.

### 3.5 `WorkerMarkerBadge.tsx`
**Responsibility:** Tiny 16px category-icon badge, bottom-right corner of the marker (e.g., a wrench icon for plumber). Split out from `WorkerMarker` because this badge's icon/color logic (category → icon/color map) is reused later on `MapWorkerCard`'s category tag — one lookup table, two render sites, one file each consuming it.

### 3.6 `RadiusCircle.tsx`
**Responsibility:** Translucent green-tinted circle overlay showing the active search radius (default 5km). Static, no animation — a radius indicator that pulsed or moved would compete with the markers for attention.

### 3.7 `MapControls.tsx`, `ZoomControl.tsx`, `RecenterButton.tsx`
**Responsibility:** `MapControls` is a thin positioning wrapper (right-edge vertical stack). `ZoomControl` and `RecenterButton` are separate because they have independent visibility rules: zoom is always visible, recenter only fades in once the user manually pans away from their own location.
- **UX Law — Fitts's Law:** both buttons ≥44px including `hitSlop`, generously sized *specifically* because map contexts have more accidental mis-taps (fingers already busy dragging/pinching the map) than static list screens.
- **Microinteraction:** `RecenterButton` fades/scales in (`opacity 0→1, scale 0.8→1`, spring-default, ~200ms) only after manual pan is detected; tapping it calls `useMapCamera.recenter()` and the button fades back out once the camera settles.

### 3.8 `MapTopBar.tsx`
**Responsibility:** Floating translucent container anchored top, holding the back button + `CategoryFilterChips`. Pure layout/positioning — no filtering logic lives here.

### 3.9 `CategoryFilterChips.tsx`
**Responsibility:** Horizontal scroll chip row (built on existing `Chip`/`ChipGroup` primitives from Day 3/10). Reads/writes `mapFilter.store`.
- **UX Law — Hick's Law:** max ~6 chips visible before scroll, letting users compare options at a glance instead of opening/closing a category dropdown to decide.
- **Microinteraction:** selected chip background fades gray→green (150ms **color timing**, never spring) + light haptic. On selection change, markers on the map cross-fade out/in (150ms) rather than popping — a filter change should never feel like a hard reset.

### 3.10 `MapSearchBar.tsx`
**Responsibility:** Floating rounded bar, visually identical to a search input but is a **navigation trigger** (tap → pushes full `/search` screen), not an editable field on this screen.
- **Microinteraction:** none beyond standard button press-scale — deliberately the calmest element on screen, since markers/panel already carry the motion budget.
- **UX Law — Jakob's Law:** looks exactly like every map search bar users already know from Google Maps/Uber; no reason to redesign this shape.

### 3.11 `MapBottomPanel.tsx`
**Responsibility:** The sheet **shell only** — drag handle, snap points (collapsed ~200px / expanded), gesture-driven drag physics. Renders whatever is passed as children (in this case `MapPanelHeader` + `MapWorkerList`).
- **Microinteraction:** slides up `0→200px` on mount (spring-gentle); handle drag supports manual expand/collapse (spring-gentle both directions) — mirrors the native `BottomSheet` feel already established Day 4, reused here rather than reinvented.

### 3.12 `MapPanelHeader.tsx`
**Responsibility:** Just the "12 workers nearby" count text (Poppins SemiBold) sitting above the horizontal card list. Split from `MapBottomPanel` because this text is *content*, not sheet mechanics — the sheet shell shouldn't know or care what's inside it.

### 3.13 `MapWorkerList.tsx`
**Responsibility:** Horizontal `FlashList` of `MapWorkerCard`s. Owns the `scrollToIndex` logic that runs when a marker is tapped, and calls `useMarkerSelection.select(workerId)` when a card is tapped. This is the **sync bridge** — neither the map nor the individual card knows about the other directly; both talk through this list + the shared selection hook.
- **Definition of correctness:** tapping a marker must scroll this list to the matching card (`animated: true`); tapping a card must trigger `useMapCamera.flyTo(worker)` — both directions go through this one file, so there is exactly one place bidirectional sync logic can break, not two.

### 3.14 `MapWorkerCard.tsx`
**Responsibility:** Single compact card — avatar, name (Poppins), rating + distance (Inter), category tag (uses the same category→color lookup as `WorkerMarkerBadge`), "Book" button.
- **UX Law — Fitts's Law:** "Book" button inside this 150px-wide card is still ≥44px tap height — never shrink a CTA just because its container is compact.
- **Selected state:** `border→2px green`, spring-in ~200ms — visually confirms this card matches the currently-selected marker.
- **Press feedback:** standard card press-scale (0.97 in / spring-default out) + selection haptic (light).

### 3.15 `MapEmptyState.tsx`
**Responsibility:** Shown inside `MapBottomPanel` when `useNearbyWorkers` returns zero results for the active filter/radius — "No workers found nearby, try widening your search" + a "Reset filters" secondary action. Never a primary green CTA here (an empty result is informational, not a conversion moment — Hick's Law: keep it low-stakes).

### 3.16 `MapSkeletonCard.tsx`
**Responsibility:** Shimmer placeholder shown in `MapWorkerList` while `useNearbyWorkers` is loading — must be pixel-identical in shape/size to `MapWorkerCard` (avatar circle, two text lines, button-shaped block) so there is zero layout jump when real data arrives (**Doherty Threshold** + Recognition over Recall applied to loading states — the user recognizes "that's where the card will be" before data even lands).

### 3.17 `useMapCamera.ts` (hook)
**Responsibility:** Wraps native `animateToRegion` calls behind two clean methods: `flyTo(worker)` and `recenter()`. No component should call the raw map ref directly — everything routes through this hook so camera behavior is consistent and testable in one place.

### 3.18 `useMarkerSelection.ts` (hook)
**Responsibility:** The single source of truth mentioned above — `{ selectedId, select(id) }`. Both `WorkerMarker` and `MapWorkerCard` subscribe to this; `MapWorkerList` is the only place that calls `select()`.

### 3.19 `mapFilter.store.ts` (zustand, session-only)
**Responsibility:** `{ selectedCategory, setCategory }` — read by `CategoryFilterChips` (write) and by the `useNearbyWorkers` call in `live-map.tsx` (read, to re-query).

---

## 4. UX Laws Applied — Full Detail (Day 20)

| Law | Where on this screen | Why it's the correct tool here |
|---|---|---|
| **Jakob's Law** | Pin↔card sync pattern, `MapSearchBar` shape, `MapBottomPanel` drag behavior | Uber/InDriver already trained millions of users on this exact interaction language. Copying it removes a learning curve; inventing a new one adds friction for zero benefit. |
| **Recognition over Recall** | `WorkerMarker` avatar photos, `MapSkeletonCard` shape-matching | Users scan faces faster than they recall names from memory; a skeleton that already "looks like" the real card lets users recognize layout before data loads. |
| **Von Restorff Effect** | Selected marker's scale+shadow, selected card's green border | In a field of 15–20 near-identical pins/cards, the one thing that must be found instantly needs to be *visually different*, not just labeled different. |
| **Hick's Law** | `CategoryFilterChips` (chips not dropdown), `MapEmptyState` (one secondary action, not three) | Fewer, directly comparable options = faster decisions. A dropdown hides options behind a tap; chips show them all at once. |
| **Fitts's Law** | `RecenterButton`, `ZoomControl`, "Book" button inside the compact `MapWorkerCard` | Map contexts have more accidental mis-taps because fingers are already busy dragging/pinching — every actionable target gets generous size + hitSlop, no exceptions even inside a small card. |
| **Doherty Threshold** | `MapSkeletonCard` while loading, cross-fade (not pop) when filters change | Feedback must appear within ~1 frame of any action; a shimmer that matches the real shape, or a soft cross-fade instead of a hard re-render, both keep the screen feeling responsive rather than broken. |

---

## 5. Microinteraction Summary Table

| Element | Trigger | Motion | Duration/Config | Haptic |
|---|---|---|---|---|
| UserMarker ring | continuous | scale 1→2, opacity 0.4→0 | 2s linear loop | none |
| WorkerMarker entrance | data loads | scale 0→1.15→1 | spring-bouncy, 40ms stagger | none |
| WorkerMarker idle | continuous | translateY 0→-4→0 | 2s loop | none |
| WorkerMarker selected | tap pin/card | scale→1.25, shadow→xl | spring-snappy, ~200ms | light |
| RecenterButton appear | manual pan detected | opacity 0→1, scale 0.8→1 | spring-default, ~200ms | none |
| RecenterButton tap | tap | camera animateToRegion | native, 300ms ease | light |
| CategoryChip select | tap | bg gray→green | color timing, 150ms | light |
| Map markers on filter change | filter changes | cross-fade out/in | timing, 150ms | none |
| MapBottomPanel open | mount | translateY 0→200px | spring-gentle | none |
| MapBottomPanel drag | gesture | 1:1 follow + snap | spring-gentle | none |
| MapWorkerCard press | tap | scale 0.97→1 | spring-stiff in / spring-default out | light |
| MapWorkerCard selected | selection sync | border→2px green | spring-in, ~200ms | none |
| Card tap → camera fly | tap card | animateToRegion | native, 300ms ease | none |
| Pin tap → list scroll | tap marker | scrollToIndex(animated) | native FlashList animation | none |

---

## 6. Definition of Done (Day 20)

- [ ] `live-map.tsx` contains composition/layout only — no inline animation code, no inline API logic.
- [ ] Every listed component exists as its own file with a single clear responsibility (no component silently doing two jobs).
- [ ] `useMarkerSelection` is the only place selection state lives — verified by confirming neither `WorkerMarker` nor `MapWorkerCard` holds its own local `isSelected` state.
- [ ] Tapping any marker scrolls the panel to the correct card; tapping any card flies the camera to the correct marker — both directions verified manually.
- [ ] `CategoryFilterChips` selection re-queries `useNearbyWorkers` and markers cross-fade rather than pop.
- [ ] `MapSkeletonCard` and `MapWorkerCard` are pixel-matched (measured side by side, zero layout shift on data arrival).
- [ ] `MapEmptyState` renders correctly when a filter returns zero results.
- [ ] `RecenterButton` appears only after manual pan and reliably returns camera to the user's live location.
- [ ] Fonts verified: Poppins on names/headers, Inter on rating/distance, Jakarta on chip/button/helper text — no mixing.
- [ ] 60fps maintained while panning with 20+ markers rendered, tested on a mid-range Android device.

---

## 7. Why this breakdown is the "industry-level" choice

A junior implementation would put the map, markers, panel, and cards all inside `live-map.tsx` — it would work, but every future change (new marker style, new filter type, reusing the card elsewhere) would require touching one giant file with tangled state. The breakdown above guarantees:

1. **Reusability** — `MapWorkerCard`, `RecenterButton`, `CategoryFilterChips`, and the skeleton pattern are all directly reusable on other screens (Search results, Live Tracking from Day 19) without modification.
2. **Testability** — `useMapCamera` and `useMarkerSelection` are pure logic hooks, testable without rendering a map at all.
3. **Parallel work** — on a 2-developer team, one dev can build `MapBottomPanel` + `MapWorkerList` while the other builds `MapCanvas` + markers, with `useMarkerSelection` as the agreed contract between them — zero merge conflicts on the same file.
4. **Design-system compounding** — every primitive built today (chips, skeleton, recenter button) reduces the component-building work needed on every later screen that needs the same pattern.
