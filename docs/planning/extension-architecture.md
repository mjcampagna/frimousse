# Extension Architecture

This note is phase 3: review the current implementation seams before more feature work lands on top of them.

The goal is to preserve the fork’s additive strategy by identifying:

- which inherited-file touch points are acceptable long-term,
- which fork-owned files should absorb future logic,
- and which current seams are likely rebase conflict areas if left to grow casually.

## Current Implementation Split

The current supplemental-item implementation is divided like this:

### Fork-Owned Logic

- `src/supplemental-types.ts`
  Public supplemental item and section types.

- `src/data/supplemental.ts`
  Supplemental row building, search scoring, and unified search assembly.

- `src/utils/emoji-item.ts`
  Kind guards and identity comparison for widened item models.

These files are the preferred homes for future fork-specific logic.

### Inherited-File Touch Points

- `src/data/emoji-picker.ts`
  Supplemental data is inserted through:
  - one additive parameter on `getEmojiPickerData()`
  - one early unified-search branch
  - one prepended section insertion point
  - one appended section insertion point

- `src/store.ts`
  Widened selection is inserted through:
  - additive store callback state
  - one `selectItem()` helper
  - widened active-item identity comparison

- `src/hooks.ts`
  Additive widened active-selection support is inserted through:
  - `useActiveItem()`
  - native-only filtering inside `useActiveEmoji()`

- `src/components/emoji-picker.tsx`
  The root, active announcer, list rendering, and additive components are wired here.

This file is the most sensitive inherited touch point in the current design.

## Recommended Long-Term Seams

The current architecture is acceptable for a first implementation pass, but future work should treat these as the preferred seams:

1. **Data assembly seam**
   `src/data/emoji-picker.ts` should remain the only inherited location that decides where supplemental rows join the main picker data.

2. **Identity seam**
   Widened item identity should continue to live outside inherited files, with inherited files only calling small helper functions.

3. **Selection seam**
   The store should remain the single place that translates an item click or keyboard selection into native and widened callbacks.

4. **Rendering seam**
   The list should decide native vs supplemental rendering, but detailed supplemental rendering behavior should stay in consumer-provided components or fork-owned helpers.

## Current Hot Spot

The main hot spot is `src/components/emoji-picker.tsx`.

It now owns several responsibilities:

- root prop wiring
- data handler wiring
- keyboard selection dispatch
- active-item announcing
- native vs supplemental render branching
- additive active-selection component export

This is still manageable, but it is the place most likely to accumulate accidental fork complexity.

## Recommendation For `emoji-picker.tsx`

Do not casually add more supplemental behavior directly into `src/components/emoji-picker.tsx`.

If future work needs more behavior here, prefer one of these patterns:

- extract branch logic into a fork-owned helper first
- extract additive prop interpretation into a fork-owned helper first
- keep inherited-file changes to imports plus tiny call sites where practical

In other words: treat this file as the orchestration layer, not the home for more fork logic.

## Data Layer Assessment

`src/data/emoji-picker.ts` is currently a good seam.

Why:

- the inherited function still owns the native data pipeline
- supplemental insertion is visible and local
- real supplemental logic lives in `src/data/supplemental.ts`

Risk:

- if grouped-search variants, mixed sections, or more ranking modes are added here directly, this file will become harder to rebase

Recommendation:

- keep new search and row-building logic in `src/data/supplemental.ts`
- keep `src/data/emoji-picker.ts` limited to orchestration and insertion order

## Store Assessment

`src/store.ts` is also an acceptable seam.

Why:

- the widened callback split is centralized
- active-item identity is delegated through helpers
- keyboard and pointer selection use one internal dispatch path

Risk:

- if more selection policies, event metadata, or analytics hooks are introduced directly here, the store will become a product-policy layer

Recommendation:

- keep `selectItem()` small
- move any future selection metadata shaping into fork-owned helpers before the store adopts it

## Hook Assessment

`src/hooks.ts` is in a good state.

The split is clear:

- `useActiveEmoji()` remains native-only
- `useActiveItem()` is the widened additive surface

Recommendation:

- preserve that separation unless there is a very strong reason to collapse them
- if more widened hooks are added later, keep them parallel rather than widening native-only hooks in place

## Rendering Surface Assessment

The current render split is:

- `components.Emoji` for native items
- `components.SupplementalEmoji` for supplemental items

This is a good first-pass seam because it avoids silently widening the existing native render prop.

Recommendation:

- keep the split for now
- do not rush into a single union-based render prop until there is evidence it improves consumer ergonomics without muddying compatibility

## Intentional Upstream Touch Points

The current meaningful inherited touch points are:

- `src/data/emoji-picker.ts`
- `src/store.ts`
- `src/hooks.ts`
- `src/components/emoji-picker.tsx`
- `src/types.ts`
- `src/index.ts`

If upstream later changes these same areas, rebase review should start by asking:

- is the upstream change native-only or does it affect widened behavior too?
- can the upstream change be kept while preserving the fork’s additive seams?
- should any fork-owned helper absorb the conflict rather than expanding the inherited diff?

## Merge-Risk Ranking

From lowest to highest likely rebase risk:

1. `src/index.ts`
2. `src/hooks.ts`
3. `src/store.ts`
4. `src/data/emoji-picker.ts`
5. `src/types.ts`
6. `src/components/emoji-picker.tsx`

`src/components/emoji-picker.tsx` and `src/types.ts` should be treated with the most discipline going forward.

## Current Recommendation

Proceed with future feature work under these architectural rules:

- new fork behavior belongs in fork-owned files first
- inherited files should stay orchestration-heavy and logic-light
- `src/components/emoji-picker.tsx` should not absorb more supplemental logic unless there is no cleaner seam
- `src/data/supplemental.ts` is the preferred home for future supplemental search and row-building work
- `src/utils/emoji-item.ts` is the preferred home for future widened identity helpers

## Next Phase Implication

Phase 4 should build broader test strategy around these seams:

- native-only compatibility tests
- additive supplemental-path tests
- seam tests for search, selection, and active-item behavior
- regression coverage for the inherited touch points most likely to drift
