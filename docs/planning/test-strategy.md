# Test Strategy

This note is phase 4: define how the fork should test native compatibility, additive supplemental behavior, and the inherited seams most likely to regress.

Status: partially executed. This note now serves as a living test-map rather
than a pure forward-looking phase plan.

The goal is not just “more tests,” but the right tests in the right places so future work can expand without blurring the compatibility boundary.

## Testing Layers

The fork currently needs four layers of coverage:

1. **Native compatibility tests**
   Prove existing Frimousse behavior still works when supplemental features are unused.

2. **Supplemental-path tests**
   Prove additive behavior works when `supplemental` and related APIs are adopted.

3. **Seam tests**
   Prove the key orchestration seams keep their contract:
   search, row building, selection dispatch, active-item behavior, and rendering split.

4. **Regression tests for inherited hot spots**
   Prove the inherited files with the highest merge risk do not silently drift.

## Current Coverage Snapshot

Current meaningful coverage already exists here:

- `src/components/__tests__/emoji-picker.test.browser.tsx`
  Native UI, keyboard navigation, viewport behavior, active emoji behavior, and loading behavior.

- `src/components/__tests__/supplemental.test.browser.tsx`
  Prepend behavior, widened selection, additive callback use without supplemental config, native-only `ActiveEmoji` vs widened `ActiveItem`, mixed sections, and unified search.

- `src/data/__tests__/emoji-picker.test.ts`
  Native search and row-building behavior.

- `src/data/__tests__/native-search.test.ts`
  Additive native-search enrichment behavior and search-term normalization.

- `src/data/__tests__/supplemental.test.ts`
  Supplemental row building, mixed native-plus-supplemental sections, grouped vs unified search seams, and unified-result assembly.

- `src/utils/__tests__/frequency.test.ts`
  Consumer-owned frequency helpers, mixed native/supplemental ranking inputs, and prepended/appended frequent-section construction.

This is a solid base, but the fork should treat it as a starting point rather than a finished matrix.

## Required Native Compatibility Coverage

Every feature change should preserve tests for:

- `onEmojiSelect` native payload behavior
- `useActiveEmoji` native-only behavior
- `<EmojiPicker.ActiveEmoji />` native-only behavior
- native search behavior when `supplemental` is not provided
- keyboard navigation over native rows
- default `components.Emoji` rendering path

If a future change risks any of those, add or update native-only regression tests first.

## Required Supplemental Coverage

Supplemental feature work should have tests for:

- section placement (`prepend` and `append`)
- grouped and unified search behavior
- selection dispatch through `onItemSelect`
- native plus supplemental active-item behavior
- `components.SupplementalEmoji` rendering path
- section-level search inclusion or exclusion via `searchable`

If a new feature adds a new supplemental mode, it should add at least one direct browser or data test at the seam where that mode enters the system.

## Seam Matrix

The current preferred seam-to-test mapping is:

### `src/data/emoji-picker.ts`

Test with data-oriented tests for:

- native-only row assembly
- prepended supplemental sections
- appended supplemental sections
- unified search entry branch
- empty results behavior

### `src/data/supplemental.ts`

Test with data-oriented tests for:

- supplemental section filtering
- search term normalization
- scoring order for supplemental items
- unified native-plus-supplemental result assembly
- mixed native and supplemental items within one consumer-owned section

This file now has a dedicated test file. Future changes here should usually add
or update data-layer tests before browser coverage.

### `src/store.ts`

Test through behavior rather than internal state where possible:

- native item selection invoking `onEmojiSelect`
- supplemental item selection not invoking `onEmojiSelect`
- both native and supplemental selection invoking `onItemSelect`
- active-item identity stability across navigation and hover changes
- search-driven reset semantics that keep the first filtered result keyboard-selectable
- rebuild behavior under consumer-owned frequency-section updates

### `src/hooks.ts`

Test through behavior or direct hook tests for:

- `useActiveEmoji()` staying native-only
- `useActiveItem()` widening appropriately
- future widened hooks staying parallel rather than mutating native-only semantics

### `src/components/emoji-picker.tsx`

Test with browser tests for:

- native vs supplemental render branching
- keyboard navigation through mixed item sets
- active announcer behavior
- callback dispatch behavior
- UI behavior under grouped vs unified search

This is the highest-risk inherited file and should get regression coverage whenever its branching changes.

## Priority Gaps

The most useful next test additions are:

1. A search-then-Enter regression test
   The active-state/search interaction has regressed before. We should directly
   prove that filtering still highlights a keyboard-selectable first result,
   especially after prior navigation or hover state.

2. A first-insertion / rebuild regression test anchored to the active-state docs
   The frequency reset regression showed that consumer-owned section rebuilds
   can expose inherited store behavior. We should keep explicit regression
   coverage tied to that seam.

3. An append visibility/ordering test at the data layer
   Browser tests are not the best place to prove appended ordering because virtualization can obscure intent.

4. A callback double-dispatch test
   Explicitly prove that native selections can invoke both `onEmojiSelect` and `onItemSelect`, while supplemental selections only invoke the widened callback.

5. A grouped-search browser test, if the grouped presentation contract grows
   We have grouped behavior at the data seam. A browser-level grouped test only
   becomes high priority if the UI contract around grouped results becomes more
   explicit or more configurable.

## Known Hot Spots

Some behaviors deserve special care because they have already produced real
regressions or misleading test results:

- active-state preservation across supplemental or frequency-driven rebuilds
- search-driven active resets and Enter selection behavior
- duplicate appearances of the same logical item across multiple sections
- browser tests whose layout shifts can cause spurious pointerleave behavior

See:

- `docs/references/active-state-contract.md`

## What Should Not Be Over-Tested

Avoid over-investing in tests for:

- consumer persistence policy
- frecency algorithms outside the package
- asset hosting behavior
- downstream-specific metadata semantics

Those remain outside the package boundary.

## Test Rule For Future Features

Before merging a new feature, ask:

1. Does it change native-only behavior?
2. Does it change supplemental-only behavior?
3. Which seam does it touch?
4. Is there at least one regression test at that seam?

If the answer to the fourth question is “no,” add the test before merging.

## Current Recommendation

Use the following default testing pattern for future fork work:

- data-layer logic gets data tests first
- UI orchestration gets browser tests
- native behavior always keeps a parallel regression path
- additive widened behavior gets its own explicit tests rather than relying on native tests to fail indirectly
- when active-state behavior changes, update the regression/reference notes and
  add or adjust a focused seam test in the same pass
