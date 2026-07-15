# Feature Inventory

This note tracks the current state of the fork's feature direction based on earlier exploration of a more specialized downstream implementation.

The goal is no longer to list hypothetical candidates in the abstract. Instead, this document records:

- what the package now supports
- what remains intentionally consumer-owned
- which design questions are still open

## Fork Stance

This fork is compatible-first, not upstream-first.

- Existing Frimousse consumers should be able to swap imports and keep working.
- New value should come from additive, opt-in features.
- We still prefer disciplined changes, but we are no longer assuming upstream convergence as the primary goal.
- We are not designing for upstream convergence, but we still prefer changes that keep future origin updates straightforward to evaluate and ingest.

## Shipped In The Package

### Non-native picker items as a first-class concept

The package can now represent selectable supplemental items alongside native Unicode emoji.

### Consumer-supplied additional categories

Consumers can provide supplemental sections instead of being limited to the built-in dataset categories.

### Consumer-supplied frequent, recent, or favorite rows

The package supports this structurally through consumer-provided sections.

Consumers can also use the helper utilities for recording usage, ranking entries, and building a frequent-items section without giving the package ownership of persistence.

### Unified search across built-in and consumer-supplied items

Search can now operate across native and supplemental items together.

### Explicit selection payloads for multiple item kinds

The package distinguishes native and supplemental selections explicitly rather than relying on a native-only selection contract.

### Stable identity semantics for active and hovered items

Once multiple item kinds and duplicate appearances are allowed, identity by Unicode string alone is not enough.

The package now treats active state per occurrence rather than highlighting every matching shared item instance at once.

### Image-backed custom emoji helpers

The package now includes helper utilities for building image-backed custom emoji items and sections using a general supplemental-item model.

### Default rendering support for image-backed supplemental items

The default supplemental renderer can display image-backed items out of the box, while still allowing consumers to override rendering as needed.

### Shortcode display and lookup helpers

The package now includes additive helpers for:

- normalizing display-oriented shortcode tokens
- resolving canonical and alternate shortcodes for supplemental items
- resolving consumer-owned native shortcode mappings for native emoji

This keeps shortcode display and lookup available without forcing the picker to own a bundled shortcode dataset.

## Intentionally Consumer-Owned

### Frequency persistence and product policy

The package can help record and rank usage data, but consumers still own:

- where that data is stored
- how long it persists
- what ranking policy they prefer
- whether the section is called "Frequently used," "Favorites," or something else

### Local storage integration

Persistence wiring belongs to consumers.

### Suggested or default item logic

This remains product-specific behavior.

### Modal flows for creating or managing non-native items

This is outside the scope of the picker package.

### Consumer-specific domain conversion layers

Consumers should map picker output into their own domain types rather than forcing the package to know those concepts.

### Editor or typeahead integration outside the picker UI

This is a separate concern from the picker component itself.

### Asset hosting, upload flows, auth, and fallback pipelines

These remain consumer-specific infrastructure concerns.

### Last-mile fallback rendering policy

The ecosystem now covers support detection and fallback metadata through the
`@slithy/emoji-compat` companion package.

Consumers still own the final rendering decision:

- when to swap native glyphs for image fallbacks
- how fallback assets are hosted and loaded
- what component or UI layer renders the fallback

## Open Design Questions

### Search scoring extensions

Search now has an opinionated built-in ranking policy, but we have not yet decided whether native or cross-source ranking should ever expose a broader extension surface.

See also: [expanded-search-potential-task.md](./expanded-search-potential-task.md)

### Search result grouping controls

The current runtime seam looks sufficient for now.

Grouped search and unified search are both supported, and the current guidance is to treat the distinction as a documentation and usage question rather than reopen the runtime API.

Revisit only if consumers need stronger presentation controls than `mode`, `resultsLabel`, and section-level `searchable`.

### Richer exported item models

We are already using discriminated item kinds, but there may still be room to make the exported type story cleaner and easier for unknown consumers to adopt.

### Whether `useActiveEmoji`/`ActiveEmoji` should widen to cover supplemental items

Today this fork keeps `useActiveEmoji`/`EmojiPicker.ActiveEmoji` deliberately native-only, and offers `useActiveItem`/`EmojiPicker.ActiveItem` as the separate, supplemental-inclusive alternative. This is a discriminated-union approach: `ItemSelection` forces consumers to branch on `kind` explicitly.

An alternative design explored elsewhere solved the same problem differently:
it widened the `Emoji`/`EmojiPickerEmoji` type itself (`emoji` became
optional, `url`/`id` were added) and dropped the native-only filter in
`useActiveEmoji`, so a single hook/type covers both native and supplemental
items without a union.

This fork does not currently do that. `useActiveEmoji` remains native-only, and
the widened additive surface is explicitly `useActiveItem` /
`EmojiPicker.ActiveItem`. Open question: should this fork ever adopt (or
additionally offer) a looser single-type approach, or is the current
discriminated-union split the right permanent design? No decision made yet.

Current leaning: keep the split.

- `ActiveItem` / `useActiveItem` should be documented as the
  preferred extensible APIs for mixed native + supplemental picker items.
- `ActiveEmoji` / `useActiveEmoji` should remain the native-only
  compatibility-friendly convenience APIs.
- If we ever want a single broader surface later, it would likely deserve a
  more neutral name such as `ActiveItem` rather than overloading `ActiveEmoji`.

Related, in case footer or preview shortcode display is revisited further: this
fork now has additive shortcode lookup and display helpers, but it still does
not own a bundled shortcode dataset or app-specific display policy. A
downstream picker footer remains a useful reference because it shows one way of
resolving native emoji to `:shortcode:` strings through consumer-owned iamcal
data, rather than treating that dataset as picker-core state.

## Ranked Next Steps

### Recently completed

#### Additive contract polish

Completed as a docs-and-types pass to make the additive surface easier to understand without changing behavior.

#### Grouped versus unified search guidance

Completed as a guidance pass.

Current recommendation remains:

- do not add new grouped or unified search API yet
- only reopen runtime API design if consumers need stronger presentation controls than `mode`, `resultsLabel`, and section-level `searchable`

#### Public metadata guidance

Completed as a documentation pass covering the semantic roles of:

- `aliases`
- `keywords`
- `tags`
- `id`
- `shortcode`

#### Revisit active-surface ergonomics

Completed as an audit and contract-clarity pass.

Current decision:

- keep `useActiveEmoji` / `EmojiPicker.ActiveEmoji` native-only
- keep `useActiveItem` / `EmojiPicker.ActiveItem` as the additive widened surface

This remains the preferred compatibility compromise:

- native-only consumers keep the smaller upstream-shaped surface
- mixed-item consumers have an explicit widened surface
- consumers can switch the callback, hook, and render-prop surfaces together when introducing supplemental items

Reopen only if real usage shows that the split is creating more friction than clarity.

#### Controlled root search value

Completed as an additive root-level search control surface.

Current behavior:

- `EmojiPicker.Root` accepts `searchValue`
- `EmojiPicker.Root` accepts `onSearchValueChange`
- consumers can drive picker search without rendering `EmojiPicker.Search`
- `EmojiPicker.Search` remains the default compatibility-friendly path

This addresses the strongest upstream-inspired additive gap from issue `#11`
without reopening broader search-policy design.

### Park

#### Upstream issue triage

Still open from recent upstream issue review:

- `#20` Helper to get the emoji label does not currently fit the picker-core boundary.
- `#31` Expose the used emoji data still cuts against the current companion-package boundary.
- `#7` Category icons feels like presentation chrome rather than picker-contract work.

Already effectively addressed in this fork:

- `#5` Support custom emojis
- `#6` Support custom emoji renderers
- `#9` Include shortcodes in search
- `#11` Allow building pickers without `EmojiPicker.Search`
- `#21` English search fallback when locale-specific data is active

#### Native weighting controls

Keep native ranking opinionated for now.

#### Cross-source ranking controls

Do not expose a broader native-plus-supplemental weighting surface yet.

#### Richer native metadata input

Do not widen `search.native.terms` beyond its current plain-object shape yet.

#### Editor or typeahead search flows

Still an adjacent consumer concern rather than picker-core work.

If this is revisited later, the likely seam is a companion package or a
picker-independent utility surface rather than new picker-core UI behavior.

## Future Enhancement Tasks

### Broader search policy controls

Scope this as a standalone future task rather than an incidental picker tweak.

- native ranking now has an opinionated built-in policy
- supplemental weighting is configurable today
- cross-source weighting is still intentionally not part of the runtime API
- if that changes, it should be a deliberate contract decision rather than an opportunistic tweak

## Summary

The package direction is now broader than narrow "custom emoji support."

The implemented model is:

- supplemental selectable items
- consumer-owned sections
- explicit mixed selection payloads
- unified search
- consumer-owned frequency behavior with library helpers

That feels durable, composable, and broadly applicable to unknown consumers while preserving the default experience for existing Frimousse users.
