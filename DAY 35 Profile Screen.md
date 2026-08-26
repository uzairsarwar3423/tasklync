# 👤 DAY 35 — Profile Screen + Edit Profile
### Deep Implementation Plan · Principal React Native Engineer Level
> Scope: Account hub + edit flow for Tasklync User App (Expo SDK 52, Expo Router, Zustand, TanStack Query, Reanimated 3, expo-image-picker)
> This is the **closing day** of the app's core navigable surface — everything built here either terminates a session (Log Out, Delete Account) or fans out to affect how the user is represented everywhere else in the app (avatar, name). Both of those properties make this day deceptively higher-stakes than a typical "settings screen."

---

## 0. Why This Day Is Architected the Way It Is

Profile + Edit Profile look like the most familiar, boilerplate screens in any app — but done properly they're **six distinct engineering problems**, most of which are irreversible-consequence or cross-cutting-state problems, not simple form problems:

1. **A changed avatar must propagate everywhere it's already cached** — the tab bar, chat bubbles, review context cards, booking worker rows all potentially cache a copy of "what does this user look like right now." A single `PATCH`/`POST` success on the Edit Profile screen must correctly invalidate every one of those unrelated query keys, or the user sees their old photo in three places and their new one in a fourth, which reads as a broken app even though the mutation technically succeeded.
2. **"Save enabled only on real change" requires an actual dirty-check**, not a naive "any `onChange` fired" flag — a user who taps into the name field and taps back out without changing a single character must not see an enabled Save button; the comparison must be against the *originally fetched* values, field by field.
3. **Delete Account is explicitly required to be harder than a single tap** — this is a distinct confirmation pattern from Day 34's single-sheet cancel modal; deleting an account is a different class of irreversible action (permanent data loss vs. a cancellable booking) and the spec explicitly calls for typed/explicit confirmation, which is a different UI mechanism than a two-button bottom sheet.
4. **Avatar upload progress must be real, not simulated** — wiring an actual `onUploadProgress` callback through axios into an animated ring is meaningfully different (and meaningfully more correct) than a fake `withTiming` animation that just guesses how long an upload "should" take, which becomes visibly wrong on slow connections.
5. **Log Out is a multi-system teardown, not a navigation call** — it must clear the TanStack Query cache, clear persisted Zustand state, clear secure storage tokens, **and** unregister the push token (tying directly back to Day 31's `usePushRegistration.unregister()`) — in a specific order, or a stale push registration or cached query leaks into the next session on a shared device.
6. **The menu structure needs to stay maintainable as the app grows** — hardcoding 10 individual `<ProfileMenuItem>` JSX rows directly in the screen file works today but becomes an editing hazard the moment a new menu item is added by someone unfamiliar with the deliberate Serial Position ordering — the structure itself should encode the "Account → Support → Danger Zone" grouping as data, not just visual arrangement that's easy to accidentally reorder.

Everything below is structured to solve these six deliberately, not just "build the screens and see what breaks."

---

## 1. Complete File Tree for the Day

```
app/
  ├── (tabs)/
  │   └── profile.tsx                        # SCREEN: Profile hub
  └── profile/
      └── edit.tsx                           # SCREEN: Edit Profile

src/
  ├── components/
  │   └── profile/
  │       ├── ProfileHeader.tsx              # avatar + name + phone + Edit button
  │       ├── ProfileStatsRow.tsx            # bookings count + rating, 2-card row
  │       ├── ProfileMenuSection.tsx         # reusable section: title + list of items
  │       ├── ProfileMenuItem.tsx            # icon + label + chevron row
  │       ├── AvatarUploadRing.tsx           # avatar with real upload-progress ring
  │       ├── PreferenceToggleRow.tsx        # NEW — language/currency toggle, reusable
  │       ├── LogoutConfirmDialog.tsx        # NEW — lightweight confirm, distinct from delete
  │       └── DeleteAccountModal.tsx         # NEW — typed/explicit confirmation flow
  │
  ├── config/
  │   └── profileMenu.config.ts              # NEW — data-driven menu structure (sections + items)
  │
  ├── hooks/
  │   ├── useProfile.ts                      # useCurrentUser(), useUpdateProfile(), useUploadAvatar(), useDeleteAccount()
  │   ├── useEditProfileForm.ts              # NEW — isolated dirty-check form state
  │   └── useLogout.ts                       # NEW — full multi-system teardown sequence
  │
  ├── utils/
  │   └── profileCacheSync.ts                # NEW — fan-out invalidation helper for avatar/name changes
  │
  ├── services/api/
  │   └── user.api.ts                        # getMe(), updateMe(), uploadAvatar(), deleteMe(), updatePreferences()
  │
  └── types/
      └── user.types.ts                      # (touched) UserProfile, EditProfileFormState, ProfileMenuConfig types
```

**6 files added beyond the original list** — `PreferenceToggleRow.tsx`, `LogoutConfirmDialog.tsx`, `DeleteAccountModal.tsx`, `profileMenu.config.ts`, `useEditProfileForm.ts`, `useLogout.ts`, plus a cache-sync utility — each isolates exactly one of the six hard problems above.

---

## 2. `src/types/user.types.ts` (extended — build first)

**Responsibility:** Extend existing user types with:

- `UserProfile` — the canonical shape returned by `GET /users/me` (name, avatarUrl, phone, preferredLanguage, preferredCurrency, stats).
- `EditProfileFormState` — a **distinct** type from `UserProfile`, representing in-progress editable fields only (`name`, `email`) — deliberately narrower than the full profile, since phone is explicitly non-editable (shown disabled per the original screen spec) and stats/avatar are handled by entirely separate mutations, not bundled into the same form-save payload.
- `ProfileMenuItemConfig` / `ProfileMenuSectionConfig` — the data shapes consumed by `profileMenu.config.ts` (section 5) — `{ id, icon, label, route | action, tone?: 'default' | 'danger' }`, so a menu item can either navigate (`route`) or trigger a handler (`action`, e.g. Log Out), and dangerous items can be tagged for distinct styling without a component-level special case per item.

---

## 3. `src/services/api/user.api.ts`

**Responsibility:** Thin HTTP layer.

**Functions:**
- `getMe()` → `GET /users/me`
- `updateMe(payload)` → `PATCH /users/me`
- `uploadAvatar(file, onProgress)` → `POST /users/me/avatar`, **multipart**, accepting a progress callback parameter — this is the function signature that makes real progress tracking (hard problem #4) possible; the callback is threaded through from axios's `onUploadProgress` config option, not synthesized later.
- `deleteMe()` → `DELETE /users/me`
- `updatePreferences(payload)` → `PUT /users/me/preferences`

**Why `uploadAvatar` takes a progress callback as a parameter rather than the hook layer handling progress separately:** Progress reporting is inherently tied to the specific HTTP request's lifecycle (axios's `onUploadProgress` fires as part of that exact request) — trying to observe progress from outside the function that makes the call would require awkward workarounds; threading the callback straight through keeps the progress-reporting responsibility co-located with the actual network call that produces it.

---

## 4. `src/utils/profileCacheSync.ts`

**Responsibility:** The file that solves hard problem #1 — a single, named function, `invalidateProfileEverywhere(queryClient, userId)`, that fans out cache invalidation across every query key in the app that could be holding a stale copy of this user's avatar/name.

**Why this needs to be one explicit, shared utility rather than each mutation hook (`useUpdateProfile`, `useUploadAvatar`) independently deciding what to invalidate:**
- If avatar-invalidation logic is duplicated inline inside both `useUpdateProfile` and `useUploadAvatar`, the two call sites will inevitably drift over time as new features add new places the user's avatar is cached (e.g. a future "Recently worked with" section) — one call site is updated when a new cache is introduced, the other is forgotten, and the bug ("avatar updated in chat but not in reviews") reappears in a slightly different combination.
- Centralizing this as one function makes it the **single place** future engineers extend when a new screen starts caching user data — a one-line addition to this function's invalidation list, rather than a hunt through every mutation that touches user data to see which ones need updating.

**What it invalidates, concretely (documented explicitly here rather than left implicit in code comments):**
- The user's own profile query (`['user', 'me']`).
- Any chat-related query keyed by this user's ID as a participant (chat rooms/messages list, since sender avatar is likely denormalized into cached message data).
- Any review-context query that embeds this user's info (though for the *user* app, this is less common than for the worker side — still worth checking against the actual query key registry rather than assumed).
- The auth/session store's cached user snapshot (Zustand `auth.store.ts`), since several components likely read the display name/avatar from there directly rather than re-querying, for header/greeting text (per `HomeHeader.tsx`'s "Good morning, [Name]" pattern documented elsewhere in the app).

---

## 5. `src/config/profileMenu.config.ts`

**Responsibility:** The file that solves hard problem #6 — the entire menu structure (section titles, item order, icons, routes/actions, danger tagging) expressed as a **typed data structure**, not JSX.

**Structure (conceptually, not code):**
```
[
  { sectionTitle: 'Account', items: [Addresses, Payment Methods, Notifications, Language] },
  { sectionTitle: 'Support', items: [Help Center, Contact Support, Rate Tasklync, Terms & Privacy] },
  { sectionTitle: 'Danger Zone', items: [Blocked Workers, Delete Account] },
]
```

**Why this must be data, not hardcoded JSX in the screen file:** The Serial Position ordering (Account-critical items first, Danger Zone last) is a **deliberate design decision**, not an accident of whoever wrote the screen first — expressing it as an explicit, reviewable data structure (rather than implicit JSX ordering buried in a 150-line component) means a future PR that reorders items is an obvious, reviewable diff against this config file, rather than a silent visual change that only shows up by actually opening the screen. This is the same "bake the constraint into the shape of the code" principle applied on Days 32–34 to other components (fixed dispute reasons, fixed swipe-action count) — here applied to *ordering*, which is easy to accidentally disturb during unrelated edits if it's just JSX sequence.

**Log Out's special case:** Log Out is rendered **outside** this section-based config entirely (per the original spec's layout — it's a standalone element below the sections, not inside "Danger Zone"), which is itself a deliberate distinction: Delete Account is destructive-to-data and belongs visually grouped with other rare/dangerous actions; Log Out is routine and reversible (log back in anytime) and deliberately does **not** inherit the "danger" visual tone, even though both trigger confirmation dialogs — conflating the two into one "scary actions" section would overstate Log Out's actual risk level.

---

## 6. `app/(tabs)/profile.tsx` (screen — assembles sections 4–8, 5, plus components below)

**Responsibility:** Composition root for the hub screen. Reads `useCurrentUser()`, renders `ProfileHeader`, `ProfileStatsRow`, then maps `profileMenu.config.ts`'s sections through `ProfileMenuSection`/`ProfileMenuItem`, then the standalone Log Out row.

**Loading/caching behavior:** Per the "Done When" criteria, this screen must load from cache instantly (the profile query's 5-minute `staleTime`, matching backend's `user:profile:{id}` Redis TTL as noted in the original spec) and background-refresh — standard `useQuery` behavior with no special handling needed here **as long as** `invalidateProfileEverywhere` (section 4) is correctly wired into the edit/avatar mutations, which is what actually keeps this screen's displayed data fresh after an edit rather than requiring a manual pull-to-refresh.

---

## 7. `src/components/profile/ProfileHeader.tsx`

**Responsibility:** Avatar (using `AvatarUploadRing` in its idle/no-upload-in-progress state, since the ring component needs to exist here too, not just on the Edit screen — a user might reasonably expect to update their photo from either place, though the original spec scopes the actual upload *action* to Edit Profile; this component here just displays it, non-interactively unless product later decides otherwise) + name (Poppins SemiBold) + phone (Jakarta, muted tone, since it's non-editable/secondary info) + an "Edit Profile" button routing to `app/profile/edit.tsx`.

**Aesthetic-Usability Effect, concretely:** Generous spacing between avatar and text, avatar sized at the `xl` (80px) token from the established avatar size scale — large enough to feel like the visual anchor of the screen, consistent with how `WorkerProfileHeader.tsx` treats avatars elsewhere in the app, maintaining visual consistency between "how I see myself" and "how I see a worker."

---

## 8. `src/components/profile/ProfileStatsRow.tsx`

**Responsibility:** Two stat cards — bookings count, rating (if the user-side app surfaces a rating users receive from workers, per the two-way review system documented in the wider architecture) — Inter Bold for the numbers (per the numbers-always-Inter rule), Jakarta for the labels underneath ("Bookings", "Rating").

**Aesthetic-Usability Effect, restated precisely:** This row is explicitly called out in the original spec as "not functionally required" — worth preserving that honesty here rather than inventing a functional justification for it. It exists because a blank space directly under an avatar reads as an incomplete profile, and two clean stat cards fill that space with real, truthful data (not decorative placeholders) that happens to also reinforce trust — the two effects (visual completeness + trust signal) are a byproduct of showing real data attractively, not a manipulative dark pattern.

---

## 9. `src/components/profile/ProfileMenuSection.tsx`

**Responsibility:** Renders one section's title (Poppins, small/h5-equivalent per the type scale) followed by its list of `ProfileMenuItem` rows, reading directly from a single section object out of `profileMenu.config.ts`.

**Hick's Law, concretely:** By rendering strictly from the config's section grouping (not re-grouping or flattening anything at the component level), this component is what actually turns the "10 items chunked into 3 groups" design decision into visually distinct, spaced-apart blocks on screen — the chunking exists both in the data (section 5) and is faithfully rendered as visual chunking here; a component that flattened the config back into one continuous list would silently undo the entire point of the config structure.

---

## 10. `src/components/profile/ProfileMenuItem.tsx`

**Responsibility:** Single row — icon + label + chevron, full-width tappable, 52px min height (Fitts's Law, matching the original spec exactly), routes or fires an action based on the config item's `route`/`action` field.

**Danger tone handling:** Reads the `tone: 'danger'` flag from its config item (section 2/5) to render Delete Account's label in the danger-red text token — this is a **prop-driven style branch**, not a separate `DangerMenuItem` component, since the row's layout/tap-target/icon-pairing behavior is identical regardless of tone; only the label color changes, which doesn't justify a whole second component per the same "don't duplicate structure for a one-property visual difference" reasoning applied elsewhere in this app's component family.

**Recognition over Recall, concretely:** Icon choice per item is not arbitrary — pulled from the same icon set/conventions already used at the point each destination screen is *also* headed by (e.g. the same location-pin icon used here for "Saved Addresses" should match whatever icon that screen's own header/empty-state uses), so the icon the user recognizes here is the same one that greets them on arrival, reinforcing "yes, this is the right place I meant to tap."

---

## 11. `src/components/profile/AvatarUploadRing.tsx`

**Responsibility:** The file that solves hard problem #4 — avatar circle with a progress ring drawn around it, driven by **real** upload progress data, not a simulated timer.

**Implementation approach:**
- Accepts a `progress` prop (0–1, or `null` when idle/no upload in flight) — this component itself has **no knowledge of axios, uploads, or network state**; it's a pure presentational ring renderer that trusts whatever progress value it's handed. This keeps it trivially reusable (e.g. if a future document-upload feature elsewhere in the app wants the same ring treatment, it's not coupled to avatar-specific upload logic).
- The ring itself is an SVG circle (or Reanimated-driven arc) whose stroke-dashoffset (or equivalent) is animated via `withTiming` **directly tracking the incoming `progress` value changes** — each time the parent passes a new progress percentage (driven by axios's real `onUploadProgress` events, wired in `useProfile.ts`/`uploadAvatar` per section 3), the ring's fill animates smoothly toward that new value over a short duration, rather than a single continuous animation guessing total upload time. This is the concrete mechanism that makes "tied directly to upload progress event, not a fake/estimated animation" true in practice, not just true in intent.
- On completion (`progress` reaches 1 / transitions back to `null`): ring opacity fades out over 150ms, no bounce, per spec.

---

## 12. `src/components/profile/PreferenceToggleRow.tsx`

**Responsibility:** Reusable toggle row for Language (English/Urdu) and Currency (PKR/USD) — a single component parameterized by its two option labels/values and current selection, used twice on the Edit Profile screen rather than two bespoke components for what is structurally the identical interaction.

**Behavior:** `selectionAsync` haptic + immediate 150ms visual flip per spec — same treatment explicitly cross-referenced against Day 34's `DisputeReasonRadioGroup` fill timing, for consistency across the whole app's binary/radio-style selection components, not just consistency within this one screen.

**Why not inline this directly as two separate hardcoded toggle blocks in `edit.tsx`:** The moment a third preference toggle is added (e.g. a future "Distance unit: km/miles" setting), a hardcoded pair becomes a hardcoded trio with copy-pasted structure — extracting the pattern now, while there are exactly two instances, is the right amount of foresight (not over-engineering for a hypothetical, but also not ignoring an obvious near-certain repetition).

---

## 13. `src/hooks/useEditProfileForm.ts`

**Responsibility:** The file that solves hard problem #2 — an isolated, UI-free form-state hook, directly modeled on Day 33's `useReviewFormState.ts` pattern (same architectural instinct: keep dirty/validity logic out of the screen component so it's independently unit-testable).

**Behavior:**
1. Initializes from the currently-loaded `UserProfile` (via `useCurrentUser()`) — captured once as an `original` snapshot on mount.
2. Tracks `name` and `email` as controlled field state.
3. Exposes a derived `isDirty` boolean — computed by comparing **current field values against the `original` snapshot**, field by field, not by tracking "has any `onChange` fired" — this precise distinction is what correctly handles the "typed a character then deleted it back to the original value" case, where a naive touched-flag would incorrectly leave Save enabled even though the form is functionally back to its original, unchanged state.
4. Exposes `isValid` separately from `isDirty` (e.g. name must not be empty/below minimum length per the existing `update-worker.validator.ts`-style rules already established elsewhere in the backend contracts) — Save should be gated on **both** `isDirty && isValid`, two independent conditions, not conflated into one.

**Why this can't just be `react-hook-form`'s built-in dirty tracking used blindly:** The app's existing conventions already use `react-hook-form` + `zod` per the wider tech stack — this hook can (and should) be a thin, well-named wrapper around that library's own `formState.isDirty`/`formState.isValid`, rather than reinventing dirty-checking from scratch. The value of extracting `useEditProfileForm.ts` as its own hook isn't "avoid the library," it's "give this screen's specific field set and validation rules one named, testable, screen-independent home" — consistent with the same extraction reasoning applied to `useReviewFormState` on Day 33.

---

## 14. `src/hooks/useProfile.ts`

**Responsibility:** The primary data/mutation hook bundle — `useCurrentUser()`, `useUpdateProfile()`, `useUploadAvatar()`, `useDeleteAccount()`.

**`useCurrentUser()`:** Standard `useQuery`, keyed `['user', 'me']`, `staleTime: 5 * 60 * 1000` (matches backend Redis TTL, as noted in the original spec — worth restating that this specific number is not arbitrary, it's deliberately mirroring a server-side cache lifetime so the client doesn't refetch more eagerly than the server-side data could have actually changed).

**`useUpdateProfile()`:**
1. Takes the validated payload from `useEditProfileForm` (decoupled the same way `useSubmitReview`/`useReviewFormState` were kept decoupled on Day 33 — this hook doesn't own form state, only the act of submitting a given valid payload).
2. Fires `PATCH /users/me`.
3. On success: calls `invalidateProfileEverywhere` (section 4) — **not** just invalidating `['user', 'me']` directly inline here, specifically routing through the shared utility so this mutation and `useUploadAvatar` below never have two different, drifting invalidation lists.
4. Shows a brief success toast (per the original spec's Peak-End requirement for the edit flow) and navigates back.

**`useUploadAvatar()`:**
1. Accepts a picked image file.
2. Compresses client-side before upload — same established convention referenced on Day 34 for evidence photos and already used for the existing avatar upload flow per `04_USER_WORKER_SERVICE.md`'s `storage.service.ts` pattern (consistent compression behavior across every image-upload feature in the app, not a one-off decision per screen).
3. Calls `uploadAvatar(file, onProgress)` from `user.api.ts`, threading a progress callback that updates local state consumed by `AvatarUploadRing`'s `progress` prop.
4. On success: same `invalidateProfileEverywhere` call as `useUpdateProfile` — this is the concrete proof that centralizing invalidation logic (section 4) actually pays off, since **both** mutations that can change how the user is displayed elsewhere converge on the exact same fan-out call, guaranteeing they can never disagree about what needs refreshing.

**`useDeleteAccount()`:** Fires `DELETE /users/me` — deliberately **does not** own the confirmation UI itself (that's `DeleteAccountModal.tsx`, section 15) — this hook only performs the actual deletion once called, keeping "the irreversible action" and "the guard rail in front of it" as separably testable concerns, the same separation principle applied to every destructive action across Days 33–35.

---

## 15. `src/components/profile/DeleteAccountModal.tsx`

**Responsibility:** The file that solves hard problem #3 — a genuinely distinct confirmation mechanism from Day 34's `BookingCancelModal`, because the spec explicitly requires this to be harder than a single tap.

**Concrete mechanism (typed/explicit confirmation):** Rather than two equal-weight buttons (the pattern correctly used for booking cancellation, where both outcomes are reasonable and reversible-ish), this modal requires the user to **type a specific confirmation phrase** (e.g. "DELETE" or their own account phone number — a decision worth a quick product conversation, but the mechanism is: a text input that must exactly match an expected value before the destructive button itself becomes enabled). This is a deliberately different interaction pattern from `BookingCancelModal`'s equal-button approach precisely *because* the two actions are not equivalent in severity — using the *same* pattern for both would either make cancellation feel needlessly scary or make account deletion feel dangerously casual; matching the confirmation mechanism's weight to the action's actual irreversibility is the underlying design principle, not an arbitrary stylistic choice.

**Why this can't just be a native `Alert.prompt`:** iOS's `Alert.prompt` isn't available on Android at all, so a cross-platform typed-confirmation flow needs to be a custom modal/bottom-sheet component regardless — this also allows showing **specific consequence copy** ("This will permanently delete your bookings, chat history, and saved addresses. This cannot be undone.") above the input, which a native alert's limited layout can't accommodate anyway. Once a custom component is required for cross-platform typed input, it should also carry the fuller explanatory copy this severity of action deserves.

**Delete button state:** Disabled until the typed input exactly matches the expected phrase — this is the enforced "harder than a single tap" requirement made concrete: there is no path to triggering `useDeleteAccount()` without deliberate, correct text entry first.

---

## 16. `src/components/profile/LogoutConfirmDialog.tsx`

**Responsibility:** The lighter-weight counterpart to `DeleteAccountModal` — a standard two-button confirm (native `Alert` or a simple lightweight modal, per the original spec's "native Alert or lightweight modal" allowance), reflecting that Log Out is a routine, reversible action that still deserves *a* guard rail (accidental taps on a menu item shouldn't instantly end a session) but not the elevated friction of Delete Account.

**Why this is a separate component from `DeleteAccountModal` rather than one "confirmation modal" component with a `severity` prop:** The two have genuinely different internal mechanics (typed-input-gated vs. simple two-button), not just different colors/copy on the same structural skeleton — forcing them into one parameterized component would mean that component internally branching on severity to decide whether to even render a text input, which is more complex than just having two small, honest, purpose-built components. This mirrors the same reasoning applied on Day 34 to keeping `useDispute` and `useCancelBooking` as separate hooks rather than one overloaded "handle any booking action" hook.

---

## 17. `src/hooks/useLogout.ts`

**Responsibility:** The file that solves hard problem #5 — the actual multi-system teardown sequence, extracted from any single component so it's a single, ordered, testable procedure rather than a sequence of calls scattered across an `onPress` handler.

**Ordered teardown sequence (order matters, stated explicitly):**
1. **Unregister push token first** — calls `usePushRegistration`'s `unregister()` from Day 31, while the auth header is still valid (this exact ordering requirement was already flagged as critical in Day 31's plan, section 10/14E — restated here because this is the file where it actually gets executed, and getting the order wrong is what causes a silent deregistration failure).
2. **Clear the TanStack Query cache** — `queryClient.clear()` (or a more targeted `removeQueries` if the app ever needs to preserve any genuinely user-independent cached data across sessions, though a full clear is the safer default for a multi-account-capable device) — this prevents the next logged-in user (on a shared device) from momentarily seeing the previous user's cached bookings/profile/chat data flash on screen before fresh queries resolve.
3. **Clear persisted Zustand state** — specifically the `auth.store.ts` and any other store persisted to MMKV per the app's storage conventions (cart state, if any lingers, location preferences tied to the account, etc.) — cleared via each store's own reset action, not by wiping the entire MMKV instance blindly (which could also nuke genuinely device-level, non-account-specific settings that should survive a logout, like accessibility preferences).
4. **Clear secure storage tokens** — `expo-secure-store` access/refresh tokens explicitly deleted, not just left to be overwritten on next login (a device that's stolen/inspected between logout and next login shouldn't retain a valid refresh token).
5. **Navigate to `(auth)/welcome`** — the final step, only after every teardown step above has settled, using `router.replace()` (not `push()`) so the authenticated stack isn't left reachable via back-navigation.

**Why steps 1–4 must complete (or at least be *initiated* in this order) before step 5, rather than firing navigation immediately and letting cleanup happen "in the background":** A user who logs out and immediately hands the phone to someone else (a very real scenario for a shared-device household) must not have any window where the old session's cached data is still readable — navigating away is a *visual* change, not a *data* change, and doing it before teardown completes would create exactly that window.

---

## 18. `app/profile/edit.tsx` (screen — assembles sections 11, 12, 13, 14)

**Responsibility:** Composition root for the edit flow. Wires `useEditProfileForm` (dirty/valid state) + `useProfile`'s `useUpdateProfile`/`useUploadAvatar` mutations.

**Structure:** `AvatarUploadRing` (tappable here specifically, opening the same Camera/Gallery/Cancel ActionSheet pattern established on Day 34 for evidence photos and originally for avatar upload — Jakob's Law, one picker convention reused a third time now) → Name input → disabled Phone display → optional Email input → two `PreferenceToggleRow` instances (Language, Currency) → Save button in header or sticky footer per final layout (either is consistent with the app's existing patterns, worth a quick design check rather than assumed).

**Save button gating:** `disabled={!isDirty || !isValid}` — the exact two-condition gate specified in section 13, rendered here as the literal enabling condition, not reinterpreted.

**Unsaved-changes guard (worth flagging even though not explicitly in the original "Done When" list):** If `isDirty` is true and the user attempts to navigate back (hardware back button on Android, swipe-back on iOS, or a header back tap), a brief confirm ("Discard changes?") is worth adding — this is a small but real completeness gap in the original spec that a principal-level review should surface rather than silently skip, since losing an edited name because of an accidental swipe-back is a real, common frustration in edit-form UX generally.

---

## 19. UX Laws — Implementation-Level Detail (cross-cutting)

- **Serial Position Effect:** Enforced structurally by `profileMenu.config.ts`'s array order (section 5), not just visual arrangement — the data structure itself *is* the ordering decision, making it a reviewable, intentional artifact rather than an emergent property of however the screen was originally coded.
- **Hick's Law:** Enforced by `ProfileMenuSection.tsx` faithfully rendering the config's grouping as visually separated chunks (section 9) — the chunking exists in both data and rendering, reinforcing each other.
- **Recognition over Recall:** Enforced by icon consistency between menu items and their destination screens (section 10) — a concrete, checkable content decision, not an abstract principle.
- **Fitts's Law:** Enforced by `ProfileMenuItem.tsx`'s full-width, 52px-minimum tap target (section 10), consistent with the same target-size discipline applied across every list-row component built since Day 32.
- **Aesthetic-Usability Effect:** Enforced by `ProfileStatsRow.tsx` showing real, truthful data attractively (section 8) — explicitly not a dark pattern, since the data shown is accurate and the polish is honest.
- **Peak-End Rule:** Enforced by `useUpdateProfile`'s explicit success toast (section 14) — the edit session has a designed, felt ending, not a silent pop back to the previous screen, mirroring the same principle applied to Day 33's review success state and Day 32's resolved-empty-state, now applied a third time to a different kind of "session end."

---

## 20. Typography Reference for This Day

```
Poppins           → User's name in ProfileHeader, section titles ("Account",
                     "Support", "Danger Zone"), "Edit Profile" screen title,
                     success toast headline text
Plus Jakarta Sans  → Phone number (secondary/muted), menu item labels,
                     name/email input field values, PreferenceToggleRow
                     option labels ("English" / "اردو", "PKR" / "USD"),
                     DeleteAccountModal consequence copy
Inter              → ProfileStatsRow numbers (bookings count, rating value),
                     any account-reference or ID-like value shown in
                     DeleteAccountModal if the confirmation phrase involves
                     a number (e.g. phone digits)
```

---

## 21. Edge Cases Checklist

| Edge case | Expected behavior |
|---|---|
| User edits name, then manually retypes it back to the exact original value | `isDirty` correctly returns `false` (field-by-field comparison against the original snapshot, not a touched-flag), Save stays disabled |
| Avatar upload fails mid-progress (network drop) | `AvatarUploadRing` shows an error state (not left frozen at a stalled percentage), retry available, no invalidation fires since the mutation didn't succeed |
| User navigates away from Edit Profile mid-upload | Upload should either be cancellable or allowed to complete in the background with a toast/notification on completion — worth an explicit product decision, flagged here rather than silently assumed either way |
| Delete Account typed phrase is case-sensitive vs. not | Explicit decision needed before building (recommend case-insensitive trim-compare for a less frustrating UX, but must be a deliberate choice, not an accident of whatever `===` comparison was first written) |
| Log Out tapped while an unrelated mutation (e.g. a booking action) is still in flight elsewhere in the app | `queryClient.clear()` in `useLogout` will cancel/orphan that in-flight mutation's eventual cache update — acceptable, since the session is ending anyway, but worth confirming no in-flight mutation has a side effect that *shouldn't* be abandoned (e.g. a payment confirmation) |
| Two rapid taps on Save | Standard mutation-pending disabled state (same pattern as every other mutation button built since Day 31) prevents a double-fire |
| Preference toggle changed but Name/Email also mid-edit, user backs out | Preferences (`PUT /users/me/preferences`) are a **separate** mutation from the name/email `PATCH` per the API wiring — worth confirming whether toggles save immediately on tap (independent of the Save button) or are bundled into the same dirty/Save gate; the original spec lists them under Edit Profile's screen but as a separate endpoint, implying immediate-save-on-toggle is the more consistent behavior with how toggles work elsewhere in the app (Day 33/34's radio/toggle patterns all commit immediately on tap, not gated behind a separate Save) |

---

## 22. Testing Plan for the Day

| Scenario | Check |
|---|---|
| Profile hub loads from cache instantly, background-refreshes | No loading flash on repeat visits within the 5-min staleTime window |
| Menu renders in exact configured section order | Account → Support → Danger Zone, Log Out standalone below, matching `profileMenu.config.ts` |
| Tap any menu item | Full row is tappable (not just icon/text), correct route or action fires |
| Edit Profile: type then revert name to original | Save disabled |
| Edit Profile: change name only | Save enabled, phone field remains visibly disabled/uneditable |
| Avatar upload | Real progress ring tracks actual upload percentage (verify against a throttled/slow network simulation, not just fast wifi where any implementation looks correct) |
| Avatar upload success | Avatar updates in Profile header, tab bar, and at least one other cached surface (chat or a recent booking card) without manual refresh |
| Delete Account | Button disabled until exact phrase typed, consequence copy visible, deletion only fires on explicit final confirm |
| Log Out | Full teardown order verified: push unregister call fires before token clear, query cache empty after, secure storage empty after, lands on welcome screen with back-navigation unable to return to authenticated stack |
| Language/Currency toggle | Haptic + 150ms fill confirmed, persists across app restart (via `PUT /users/me/preferences` + refetched on next `getMe()`) |

---

## 23. Build Order for the Day

1. `user.types.ts` extensions (shared shapes first)
2. `user.api.ts` additions (confirm the delete-account confirmation-phrase question and preferences-immediate-save question with product/backend here, before building the modal and toggle behavior)
3. `profileMenu.config.ts` (pure data, no dependencies, quick to review/adjust independently of any component)
4. `profileCacheSync.ts` (small, pure-ish utility, define the fan-out list explicitly before any mutation hook needs it)
5. `useProfile.ts` (depends on api + cache-sync util)
6. `useEditProfileForm.ts` (isolated, unit-testable immediately)
7. `useLogout.ts` (depends on Day 31's `usePushRegistration`, query client, auth store, secure storage — build and test this sequence carefully, it's the highest-risk file of the day for silent ordering bugs)
8. `AvatarUploadRing.tsx` (presentational, pure progress-driven, build and verify with a mocked progress value before wiring real upload)
9. `ProfileMenuItem.tsx` → `ProfileMenuSection.tsx` (small components, build in dependency order)
10. `ProfileHeader.tsx`, `ProfileStatsRow.tsx`, `PreferenceToggleRow.tsx` (presentational, parallelizable)
11. `LogoutConfirmDialog.tsx`, `DeleteAccountModal.tsx` (the two distinct confirmation mechanisms — build separately, resist the urge to unify them)
12. `app/(tabs)/profile.tsx` (composition root, hub screen)
13. `app/profile/edit.tsx` (composition root, edit screen — built last since it depends on the most pieces above)
14. Manual QA matrix (section 22)

---

*Day 35 — Profile Screen + Edit Profile — Deep Implementation Plan*
*Tasklync · React Native Expo · Principal Engineering Standard*
