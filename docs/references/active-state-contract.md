# Active State Contract

This note describes the current active-state behavior and the design constraints
behind it.

It is not a public API spec yet. It is a local working reference so future
changes can distinguish intentional behavior from accidental behavior.

## Current Model

Active picker state is still coordinate-first.

The store persists:

- `activeRowIndex`
- `activeColumnIndex`
- `interaction`

It does not persist a separate active occurrence identity as the primary source
of truth.

## Rebuild Semantics

When picker data rebuilds because supplemental or frequency-driven sections
change, the picker tries to preserve the currently active item.

Current behavior:

- if the same item is still present at the same coordinates, keep those
  coordinates
- otherwise, scan the rebuilt data and re-find the previous active item by item
  identity
- if the item is gone, fall back to `0,0`

This means the model is still coordinate-based at rest, but rebuild
reconciliation may use item identity opportunistically.

## Search Semantics

Search changes are intentionally treated differently from other data rebuilds.

When the search string becomes non-empty:

- interaction switches to keyboard mode
- active coordinates snap to `0,0`

This preserves the expected "Enter selects the first filtered result" behavior
even after deeper navigation happened earlier.

## Preserved Invariant

The current model keeps two update classes intentionally separate:

- search-driven rebuilds reset active state to the first filtered result
- non-search rebuilds try to preserve the user's current active item

That distinction matters because consumer-owned rows such as frequent or recent
sections may rebuild in response to selection. Those rebuilds should not behave
like a fresh search.

## Pointer Semantics

Pointer hover still activates items by coordinates.

There is one additional protection:

- if a data rebuild shifts rows under a stationary pointer, synthetic
  `pointerenter` events are temporarily suppressed
- the next real `pointermove` reasserts the item actually under the pointer

This prevents a rebuild from immediately overwriting preserved active state with
whatever new cell slid under the cursor.

## Why The Model Stays Coordinate-First

The current implementation is still coordinate-first on purpose.

That is acceptable so long as:

- rebuild reconciliation preserves the active item across non-search updates
- search still snaps predictably to the first filtered result
- regression coverage protects the known edge cases

The package therefore uses item identity opportunistically during rebuild
reconciliation without treating identity as the stored source of truth.

## Practical Interpretation

Today, `ActiveEmoji` and `ActiveItem` should be understood as
observational state with strong practical stability, not as a strict
occurrence-identity contract.

They are also intentionally different APIs, not temporary naming duplicates:

- `ActiveEmoji` / `useActiveEmoji` are native-only convenience surfaces
- `ActiveItem` / `useActiveItem` are the additive mixed-item surfaces

Current recommendation:

- keep both APIs
- document `ActiveItem` as the preferred extensible API
- keep `ActiveEmoji` as the compatibility-friendly native-only filtered view

Suggested docs language:

- `ActiveEmoji`: returns the active native emoji, if the current active item is
  native
- `ActiveItem`: returns the active picker selection, including
  supplemental items
- `useActiveEmoji`: native-only convenience hook for consumers that only care
  about Unicode emoji
- `useActiveItem`: preferred hook when working with mixed native and
  supplemental picker items

Rationale:

- the split keeps the native-only path simple
- it preserves clearer expectations for existing Frimousse consumers
- it gives additive features a broader contract without overloading the word
  "emoji"

The current implementation is designed to behave correctly for:

- ordinary keyboard navigation
- ordinary pointer hover
- search-driven filtering
- consumer-owned frequent-section rebuilds
- duplicate appearances of the same logical item across sections

## If We Revisit The Model Later

Any move toward a true identity-first model should be treated as deliberate
design work, not as a bugfix continuation.

Key constraints for any future identity-first model:

### 1. Occurrence-aware identity

`kind + id` is not enough once the same item can appear in multiple places
simultaneously.

A future identity model must distinguish occurrences, not just logical items.

### 2. Single reconciliation path

Every active-state writer must funnel through one reconciliation function.

We should avoid:

- one path reconciling during data rebuild
- another path reconciling during pointer entry
- a third path doing read-time fallback

### 3. Different semantics for search changes vs. supplemental rebuilds

These are not the same class of update.

- search changes should snap active state to the first filtered result
- supplemental or frequency-driven rebuilds should try to preserve the user's
  current active item
