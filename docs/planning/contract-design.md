# API Design And Compatibility

This note captures the durable contract goals for the fork and the current
compatibility boundary those goals produced.

## Intent

The fork should preserve source compatibility for existing Frimousse consumers
by default.

An existing consumer should be able to swap imports to this fork and continue
working without code changes, then opt into additive capabilities as needed.

The fork should also avoid absorbing app-specific assumptions as public API.
When downstream work inspires a feature here, the public contract should still
be designed for unknown consumers rather than copied from one product.

## Core Standard

New public contracts should be:

- source-compatible by default
- consumer-agnostic
- composable within Frimousse's headless model
- additive rather than mutating existing defaults
- transport-neutral about assets and hosting
- explicit about what the consumer provides and what the picker returns

## What To Avoid

- downstream-specific prop names or product language
- direct copies of downstream prop shapes
- APIs that only make sense with a specific wrapper architecture
- hidden assumptions about persistence, analytics, hosting, auth, or app state
- render contracts that force one rendering pipeline
- breaking native-only defaults just to make new features feel cleaner

## Current Compatibility Baseline

The default native-only path should continue working without consumer changes:

- existing `EmojiPicker.Root` usage
- `onEmojiSelect` receiving native `{ emoji, label }`
- `useActiveEmoji`
- `<EmojiPicker.ActiveEmoji />`
- `components.Emoji`
- existing native search behavior
- existing keyboard navigation and active-item behavior for native emoji

No widened item or selection model should be imposed unless a consumer opts
into additive surfaces.

## Current Additive Boundary

The fork currently adds new behavior through parallel, opt-in surfaces:

- `supplemental`
- `onItemSelect`
- `useActiveItem`
- `<EmojiPicker.ActiveItem />`
- `components.SupplementalEmoji`
- supplemental item and section types

Consumers only encounter widened item or selection concepts when they adopt one
of these additive entry points.

## Current Model

The package distinguishes between:

1. Native items
2. Supplemental items
3. Consumer-owned sections

The important split is that items carry selection data, while sections control
placement and grouping.

Current contract expectations:

- native emoji still come from the built-in dataset by default
- consumer-provided sections may include supplemental items, native items, or
  mixed content
- section placement remains consumer-controlled
- section search participation remains consumer-controlled through
  `searchable`

## Selection And Active-State Surfaces

The callback split is intentional:

- `onEmojiSelect` remains native-only
- `onItemSelect` is the widened callback for native plus supplemental items

That means:

- selecting a supplemental item does not invoke `onEmojiSelect`
- selecting a native item may invoke both callbacks when both are provided

The active-item split is also intentional:

- `useActiveEmoji` and `<EmojiPicker.ActiveEmoji />` remain native-only
- `useActiveItem` and `<EmojiPicker.ActiveItem />` are the widened additive
  surfaces

This avoids silently widening existing convenience surfaces that assume a
native emoji string exists.

## Search Boundary

Search remains package-owned for matching and filtering behavior, but
consumer-owned for metadata and ranking inputs.

Current boundary:

- native search remains the default behavior
- native search enrichment arrives through consumer-owned data
- supplemental items participate only when `supplemental` is provided
- unified search is opt-in
- section-level `searchable: false` excludes a section from search

The package still does not own:

- frecency calculations
- persistence
- analytics
- external ranking signals
- bundled shortcode datasets or metadata fetching

## Rendering Boundary

The rendering contract intentionally stays split:

- native items continue through `components.Emoji`
- supplemental items render through `components.SupplementalEmoji`
- the default supplemental renderer is only a fallback, not a prescribed asset
  strategy

This keeps the package transport-neutral while avoiding a hidden widening of
the existing native render prop.

## Consumer-Owned Concerns

These concerns should remain outside the picker package:

- persistence wiring
- frecency storage and decay policy
- suggested-item algorithms
- asset hosting and upload flows
- auth and entitlement checks
- editor or typeahead integration outside the picker UI
- consumer-specific domain conversion

## Current Divergences

The fork intentionally diverges from upstream-style or downstream-inspired
solutions in these ways:

- uses a general `supplemental` model instead of product-specific root props
- uses `onItemSelect` instead of widening `onEmojiSelect`
- keeps `ActiveEmoji` native-only and introduces a parallel widened active-item
  surface
- treats downstream prop shapes as reference material rather than compatibility
  targets

## Decision Check

Before merging a new API, ask:

1. Can an existing Frimousse consumer keep working without code changes by default?
2. Would this make sense to a consumer who has never seen the implementation that inspired it?
3. Can a consumer adopt it without copying a specific wrapper architecture?
4. Does it preserve Frimousse's composable, unstyled character?
5. Is the contract still understandable if used in a completely different product?

If the answer to any of these is "no", redesign the contract before
implementation.
