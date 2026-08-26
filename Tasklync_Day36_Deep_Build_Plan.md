# Tasklync — Day 36 Deep Build Plan
## Saved Addresses + Map-Based Address Picker
> React Native + Expo Router · Reanimated 3 · Zustand · React Query · Google Places
> Fonts: **Poppins** (identity) · **Plus Jakarta Sans** (UI/body) · **Inter** (numbers/data)
> Senior RN/Expo build spec — file-level, component-level, interaction-level. No code, plan only.

---

## 0. Why This Day Matters (Design Rationale)

Address entry is the single highest-regret point of failure in a home-services app. If the pin is wrong by 30 meters, the worker goes to the wrong gate, the user gets angry, and the platform eats the support cost. Every decision on this day optimizes for **one thing**: eliminating ambiguity about a physical location, as fast as possible, with the least typing possible.

Three screens are in scope today:
1. **Saved Addresses List** (`addresses.tsx`)
2. **Add/Edit Address — Map Picker** (`addresses/add.tsx`)
3. **Edit Existing Address** (reuses Add screen in edit mode — same file, different entry params)

---

## 1. Full File & Folder Manifest

```
app/profile/
├── addresses.tsx                        # SCREEN 1 — Saved Addresses List
└── addresses/
    └── add.tsx                          # SCREEN 2 — Add / Edit Address (map picker)
                                          #   route params: { mode: 'add' | 'edit', addressId?: string }

src/components/address/
├── AddressCard.tsx                      # List row component
├── AddressCardSkeleton.tsx              # Loading placeholder (shimmer)
├── AddressPickerMap.tsx                 # Full-screen MapView + fixed center pin
├── AddressSearchInput.tsx               # Google Places autocomplete input
├── AddressSearchResultsList.tsx         # Dropdown suggestion list under search input
├── AddressLabelChips.tsx                # Home / Office / Other quick-select row
├── AddressNotesInput.tsx                # Optional "Flat 3B, blue gate" field
├── AddressConfirmSheet.tsx              # Bottom sheet wrapping label + notes + save CTA
├── DefaultAddressBadge.tsx              # Small pill: "Default"
├── AddressSwipeActions.tsx              # Edit | Delete swipe-reveal panel
├── AddressEmptyState.tsx                # Empty list illustration + CTA
└── UseMyLocationButton.tsx              # Floating GPS recenter button

src/services/maps/
├── geocoding.service.ts                 # reverseGeocode(lat, lng) → AddressResult
└── places.service.ts                    # autocomplete(query, sessionToken), getPlaceDetails(placeId)

src/hooks/
├── useAddresses.ts                      # React Query: list / add / update / delete / setDefault
├── useReverseGeocode.ts                 # Debounced reverse geocode on map region change
├── usePlacesAutocomplete.ts             # Debounced search-as-you-type + session token mgmt
└── useCurrentLocation.ts                # expo-location wrapper, permission-aware

src/store/
└── location.store.ts                    # (extend) lastPickedCoords, recentSearches cache

src/types/
└── address.types.ts                     # Address, AddressLabel, PlaceResult, GeoPoint types

src/utils/
└── address.ts                           # formatAddressLine(), labelToIcon(), distanceLabel()
```

**Total: 2 screens · 12 components · 2 services · 4 hooks · 1 store extension · 1 types file · 1 util file**

---

## 2. Screen 1 — Saved Addresses List (`addresses.tsx`)

### 2.1 Layout Anatomy (top to bottom)

| Zone | Component | Behavior |
|---|---|---|
| Header | Native `Header` (back arrow + "Saved Addresses" title) | Static, no scroll transform needed — list is short by nature (rarely >10 addresses) |
| Body | `FlashList<Address>` rendering `AddressCard` | `estimatedItemSize` measured at 76px; `keyExtractor` = address.id |
| Per-row | `AddressCard` wrapped by `AddressSwipeActions` | Swipe-left reveals Edit (blue) + Delete (red) actions |
| Footer (sticky) | Secondary button: "+ Add New Address" | Fixed above safe-area bottom inset, always reachable |

### 2.2 `AddressCard.tsx` — Component Spec
- **Left**: 40px icon container, tinted background (`labelToIcon()` maps label → Lucide icon: Home, Building2, MapPin)
- **Middle**: label (bold) on line 1, truncated `address_line, city` on line 2 (single line, ellipsis)
- **Right**: `DefaultAddressBadge` (only rendered if `is_default === true`) — otherwise empty space reserved (no layout shift when badge toggles)
- **Press**: entire row is pressable → navigates to `addresses/add?mode=edit&addressId={id}`
- **Accessibility**: `accessibilityLabel="Home, 45 Main Boulevard, DHA Phase 6, Default address"`

### 2.3 `AddressSwipeActions.tsx` — Component Spec
- Wraps `AddressCard` using `react-native-gesture-handler` `Swipeable` (or Reanimated pan gesture if custom-built)
- **Reveal width**: 140px total (2 × 70px action buttons)
- **Edit action**: blue background, pencil icon, label "Edit"
- **Delete action**: red background, trash icon, label "Delete" → opens a small inline confirm (not a full modal — deleting a saved address is low-stakes and reversible by re-adding)
- **Accessibility fallback**: long-press on the row opens the same Edit/Delete as an `ActionSheet` — swipe is never the *only* path (WCAG motor-accessibility requirement)

### 2.4 `AddressEmptyState.tsx` — Component Spec
- Illustration (160×160px, on-brand, address/map themed)
- Title: "No saved addresses yet"
- Subtitle: "Add an address to book services faster"
- CTA: secondary button "Add Address" → same route as footer button
- Entrance: opacity 0→1 stagger across illustration → title → subtitle → CTA (100ms apart) — informational, not celebratory

### 2.5 `AddressCardSkeleton.tsx`
- Matches `AddressCard` layout exactly (icon circle + two text bars)
- Rendered 3× while `useAddresses()` is loading
- Shimmer base `#EFF0F3`, 1200ms loop — **only shown if load exceeds 300ms** (guarded with a delay timer to avoid flicker on fast cache hits)

### 2.6 Data Layer — `useAddresses.ts`
- `list()` — `GET /users/me/addresses`, cached, `staleTime: 60s`
- `add(payload)` — optimistic insert into list, rollback on failure
- `update(id, payload)` — optimistic patch
- `delete(id)` — optimistic removal, undo-toast on failure ("Couldn't delete — tap to retry")
- `setDefault(id)` — optimistic: instantly moves `is_default` flag, old default flips off client-side before server confirms

---

## 3. Screen 2 — Add/Edit Address Map Picker (`addresses/add.tsx`)

### 3.1 Layout Anatomy (top to bottom, full-screen)

| Zone | Component | Behavior |
|---|---|---|
| Top overlay | `AddressSearchInput` + `AddressSearchResultsList` | Floats over map, frosted/white background, docked 16px from top safe area |
| Center | `AddressPickerMap` | Fills entire remaining screen; fixed center pin overlay (absolutely positioned, not a map annotation) |
| Floating | `UseMyLocationButton` | Bottom-right, above the bottom sheet's collapsed height |
| Bottom sheet | `AddressConfirmSheet` | Snap points: 35% (collapsed — just address text) / 60% (expanded — label chips + notes + save) |

### 3.2 `AddressSearchInput.tsx` + `AddressSearchResultsList.tsx`
- Input behaves as a **typeahead**, not a form field — debounced 350ms via `usePlacesAutocomplete`
- Each keystroke after 3 characters triggers an autocomplete call (Google Places session token generated once per search session, discarded on selection to control billing)
- Results list: max 5 suggestions, each showing primary text (bold) + secondary text (muted) — e.g. **"Packages Mall"** / *Walton Road, Lahore*
- Selecting a result: camera animates map to that location (region change → triggers pin settle + reverse geocode flow), results list dismisses, keyboard dismisses
- Empty query state: shows "Recent searches" (from `location.store.recentSearches`, max 3) instead of a blank dropdown

### 3.3 `AddressPickerMap.tsx`
- `react-native-maps` `MapView`, no markers rendered as map annotations — the pin is a **fixed absolutely-positioned View** centered over the map (classic Uber/Careem/InDrive technique: the pin never moves, the *map* moves underneath it)
- On `onRegionChangeComplete`: triggers `useReverseGeocode(centerLat, centerLng)`, debounced 500ms
- Initial region: user's last picked coordinates (if editing) OR current GPS location (if adding, permission granted) OR a sane city-level fallback (if permission denied)
- Pin has two visual states: **dragging** (slightly lifted, drop-shadow larger) and **settled** (flat, small bounce on landing)

### 3.4 `UseMyLocationButton.tsx`
- 48×48px circular floating button, `shadow-md`
- Tap → `useCurrentLocation()` fetches GPS fix → camera animates (400ms) to that region
- If location permission was denied: tapping opens a small explainer sheet ("Enable location in Settings to use this") rather than failing silently

### 3.5 `AddressConfirmSheet.tsx`
- **Collapsed state (35%)**: shows only the reverse-geocoded address line, cross-fading as the map moves — a lightweight "preview" state
- **Expanded state (60%)**, reached by user drag or auto-expand after 1.5s of map being still:
  - Address line (same text, now static context header)
  - `AddressLabelChips`: Home / Office / Other — single-select, Other reveals a small custom-label text input inline
  - `AddressNotesInput`: optional, placeholder "Flat 3B, blue gate, near the mosque"
  - Sticky `[Save Address]` button — disabled until a label is chosen; enabled state is `green-600`, full-width, pill radius

### 3.6 `AddressLabelChips.tsx`
- 3 chips rendered horizontally: 🏠 Home, 🏢 Office, 📍 Other
- Single-select — selecting one deselects any previous chip (radio behavior via chip visuals, not literal radio buttons)
- Selected chip: `green-100` background, `green-600` border+text; unselected: `#F4F5F7` background, `textMuted`

### 3.7 Edit Mode Differences (`mode=edit`)
- Screen opens already centered on the existing address's saved coordinates
- `AddressConfirmSheet` opens pre-expanded, with existing label + notes pre-filled
- Save button label changes from "Save Address" → "Update Address"
- A destructive "Delete this address" text link appears at the bottom of the expanded sheet (secondary path, in addition to swipe-delete on the list screen)

---

## 4. UX Laws — Full Rationale Table

| Law | Applied Where | Concrete Reasoning |
|---|---|---|
| **Jakob's Law** | Fixed-pin/map-moves-underneath interaction | Users arrive with this exact mental model already trained by Uber, Careem, InDrive, Bykea. Reusing it means **zero onboarding cost** for the most important interaction on this screen. |
| **Recognition over Recall** | `AddressLabelChips` icons (🏠🏢📍) instead of a text dropdown | User recognizes the icon for "my house" instantly; recalling and typing "Home" from memory is a needless extra step. |
| **Hick's Law** | Only 3 label options ("Other" absorbs everything else) | More label choices (Gym, Parent's House, Warehouse...) would slow the decision down for a 2-second task. Constrained choice = faster commit. |
| **Fitts's Law** | `UseMyLocationButton` 48×48px in the bottom-right thumb zone; `[Save Address]` full-width 52px sticky button | Both are high-frequency-intent targets — made large and reachable one-handed, especially relevant since this flow is often used mid-errand, one-handed, outdoors. |
| **Goal-Gradient Effect** | The task visibly narrows: search → pin lands → sheet expands → label chosen → save | Each stage removes ambiguity and the sheet's growing content signals "you're closer to done," which measurably reduces mid-flow abandonment. |
| **Peak-End Rule** | Save action ends with a single clean haptic + sheet dismiss + return to list with the new address already visible at the top | The *end* of this task should feel resolved and instant — no lingering spinner, no ambiguous state. |
| **Serial Position Effect** | Address list is not sorted alphabetically — default address always pinned to the top | Users act on their most-used ("default") address most often; it should occupy the position of highest recall — first in the list. |

---

## 5. Microinteractions & Haptics — Complete Map (Minimal, Justified Set Only)

| Interaction | Motion Spec | Haptic | Why It Exists |
|---|---|---|---|
| Pin settle after map pan stops | Single soft downward bounce, 150ms, spring-snappy | none | Confirms "this location is now locked in" — purely visual is enough, no haptic needed for passive map settling |
| Reverse-geocoded address text update | Cross-fade old→new text, 120ms | none | Prevents jarring text pop-in as user pans rapidly |
| Search result tap → camera fly-to | 400ms eased camera animation | `selectionAsync` | Lightest possible haptic — this is a selection, not a commit |
| Label chip select | Background/border color swap, 100ms timing (not spring — color can't spring) | `selectionAsync` | Confirms choice registered without demanding attention |
| Bottom sheet auto-expand (after 1.5s map stillness) | spring-gentle translateY | none | Passive system behavior, not user-initiated — no haptic |
| Save Address button press | Scale 0.97→1.0 (spring-bouncy on release), button locked-width during loading | `impactAsync(Medium)` | This is a genuine commit action with real consequence — deserves a felt confirmation |
| Save success | Brief lighter-green flash (100ms) then navigate back to list | `notificationAsync(Success)` | Peak-End moment for this flow — must feel resolved |
| Swipe-to-delete reveal | 1:1 direct manipulation with finger drag, no separate animation | none until release | Direct manipulation doesn't need synthetic motion — the user's own gesture *is* the animation |
| Delete confirm | Row height collapses to 0, spring-gentle, list re-flows | `notificationAsync(Success)` once removed | Confirms the destructive action completed |
| Use My Location tap | Button briefly scales 0.95→1.0 | `impactAsync(Light)` | Quick acknowledgment of tap, camera-fly is the real feedback |
| Location permission denied tap | Small shake on the button (150ms, subtle — not the full error shake used on forms) | `notificationAsync(Error)` | Signals the tap did register but couldn't complete |

**No shimmer/skeleton animation exceeds 1200ms loop. No expressive/celebratory animation appears anywhere on this screen** — this is a utility flow, not a discovery or success-peak flow like OTP or booking-confirmed.

---

## 6. State Design

### Loading
- Address list: skeleton only if fetch exceeds 300ms (guarded delay); otherwise instant render from cache
- Map picker: shows a centered spinner over a static gray map placeholder until first region loads (rare, <500ms typically)

### Empty
- `AddressEmptyState` as specified in 2.4 — never a bare "No data" text

### Error
- List fetch failure: inline error row ("Couldn't load addresses" + `[Retry]` link), rest of screen (header, footer button) remains usable
- Reverse geocode failure: sheet shows "Couldn't determine address — try adjusting the pin" instead of blank text, save button stays disabled
- Places autocomplete failure: results list simply shows nothing extra beyond "Recent searches" — fails silently, never shows a scary error for a non-critical enhancement
- Save failure: toast error ("Couldn't save address. Please try again.") + haptic error + sheet stays open with entered data intact (never lose user input on failure)

---

## 7. Typography & Color Map (Full)

| Element | Font | Size/Weight | Color Token |
|---|---|---|---|
| Screen title "Saved Addresses" | Poppins | SemiBold 22px | `textPrimary` |
| Address label (e.g. "Home") | Jakarta | SemiBold 15px | `textPrimary` |
| Address line / city | Jakarta | Regular 14px | `textSecondary` |
| "Default" badge text | Jakarta | SemiBold 11px | `textOnGreen` on `green-100` bg |
| Empty state title | Poppins | SemiBold 18px | `textPrimary` |
| Empty state subtitle | Jakarta | Regular 14px | `textSecondary` |
| Search input placeholder | Jakarta | Regular 15px | `textMuted` |
| Search result primary text | Jakarta | Medium 14px | `textPrimary` |
| Search result secondary text | Jakarta | Regular 12px | `textMuted` |
| Reverse-geocoded address (sheet) | Jakarta | Medium 15px | `textPrimary` |
| Label chip text | Jakarta | Medium 13px | `textOnGreen` (selected) / `textMuted` (unselected) |
| Notes input value | Jakarta | Regular 14px | `textPrimary` |
| Save/Update button label | Poppins | SemiBold 16px | `textOnGreen` |
| "Delete this address" link (edit mode) | Jakarta | SemiBold 13px | `textDanger` |
| Error/toast text | Jakarta | Regular 13px | `textDanger` |

**No Inter usage on this day** — this screen has zero prices, ratings, counts, or timestamps. Inter is reserved exclusively for data/numeric values elsewhere in the app; correctly *not* invoking it here is itself part of following the type system properly.

---

## 8. Spacing, Sizing & Touch Target Reference

| Element | Value |
|---|---|
| Screen horizontal padding | 16px |
| `AddressCard` height | 76px (icon 40px + 2-line text block, vertical padding 14px) |
| Card gap in list | 10px |
| Swipe action button width | 70px each (140px total reveal) |
| `UseMyLocationButton` size | 48×48px (meets Android 48px minimum directly) |
| Save/Update button height | 52px, full-width minus 32px margin, radius-pill |
| Label chip height | 36px, radius-pill |
| Bottom sheet handle | 40×4px, 10px top margin |
| Bottom sheet snap points | 35% / 60% |
| Search input height | 48px, radius-pill, floats 16px from top safe area |

---

## 9. Accessibility Requirements (Specific to This Day)

- `AddressCard`: single combined `accessibilityLabel` announcing label, address, and default status together — not three separate reads
- Swipe actions: **must** have a non-gesture equivalent (long-press → `ActionSheet` with Edit/Delete) since swipe gestures are not reliably discoverable or executable for all motor abilities
- Map picker: since a live map is inherently difficult for screen-reader users, provide a "Type address manually" fallback link at the top of the search bar that lets users skip the map entirely and confirm via search-result selection + typed notes only
- `AddressLabelChips`: `accessibilityRole="radio"`, `accessibilityState={{selected: true/false}}` per chip
- Save button: `accessibilityState={{disabled: true}}` until a label is selected, announced correctly by screen readers
- All interactive elements respect `maxFontSizeMultiplier={1.3}` — verify the address card doesn't clip at largest accessibility font size (test with a 2-line address label at max scale)
- `reduceMotion` respected: pin-settle bounce and sheet auto-expand become instant transitions; cross-fades remain (barely noticeable, kept per accessibility guidance)

---

## 10. Edge Cases to Explicitly Handle

- User denies location permission entirely → map still opens, centered on a sane default (last known city or app-configured default region), search bar becomes the primary input method
- User picks a location with no resolvable address (middle of a field, no road data) → sheet shows raw lat/lng as fallback text instead of blank, save is still allowed (some job sites genuinely lack formal addresses)
- User has zero saved addresses and opens booking flow from elsewhere → this screen still functions identically when deep-linked from `booking/address.tsx` with a "return here after saving" param
- Duplicate address detection: if the newly picked point is within ~15m of an existing saved address, show a soft inline notice ("This looks similar to your saved 'Home' address") — non-blocking, dismissible, never prevents saving
- Airplane mode / no connectivity while on this screen → search and reverse-geocode both fail gracefully per Section 6; previously cached saved-addresses list still renders from MMKV/React Query cache

---

## 11. Definition of Done — Day 36 Ship Gate

- [ ] `addresses.tsx` list: loads, edits, deletes, sets default — all wired to `/users/me/addresses`, optimistic updates confirmed with rollback-on-failure tested
- [ ] `addresses/add.tsx` supports both `mode=add` and `mode=edit` from a single file/route
- [ ] Map pin never visually "jumps" — pan, settle, and camera-fly-to-search-result all feel continuous
- [ ] Reverse geocode debounced at exactly 500ms after region-change-complete, confirmed via network log (no request spam while panning)
- [ ] Places autocomplete uses a single session token per search session, discarded correctly on selection (billing correctness)
- [ ] Swipe-to-delete has a working long-press `ActionSheet` fallback
- [ ] Duplicate-address soft warning triggers correctly within ~15m radius
- [ ] Empty state, loading skeleton (delayed 300ms), and error states all manually tested
- [ ] All touch targets measured ≥44px (iOS) / ≥48px (Android) on a physical device
- [ ] VoiceOver / TalkBack pass completed for both screens
- [ ] `reduceMotion` variant tested — bounce/auto-expand become instant, cross-fades retained
- [ ] Typography audit: zero Inter usage present on either screen (confirmed by design review)
- [ ] No haptic fires on passive/system-driven events (only user-committed actions trigger haptics)

---

*Tasklync — Day 36 Deep Build Plan*
*One screen category, zero ambiguity. Every pin drop earns the user's trust — or costs it.*
