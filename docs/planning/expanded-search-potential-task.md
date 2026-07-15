# Expanded Search Potential Task

Status: not planned for immediate implementation.

This note captures possible follow-on work now that `search.native.terms`,
unified supplemental search, and supplemental weighting are in place.

The current package stance remains:

- native search enrichment is data-driven through `search.native.terms`
- supplemental search weighting is configurable only for supplemental items
- the picker does not own shortcode datasets or metadata fetching

## Settled Constraints

These constraints are already part of the current direction and should remain
the baseline for any future search expansion work.

### Companion-owned native metadata

Extra native search terms should continue to arrive as consumer-owned or
companion-owned data.

The picker should not:

- fetch shortcode datasets
- bundle `iamcal` or any other naming vocabulary
- turn native metadata sourcing into picker-core policy

### Base-emoji keying

Native enrichment should continue to key by the base emoji concept rather than
every rendered skin-tone-resolved glyph.

That keeps the data model aligned with real shortcode datasets and avoids
forcing consumers to duplicate metadata for every skin-tone variant.

### Shared normalization

Normalization should remain consistent across:

- grouped native search
- unified native-plus-supplemental search
- companion-provided native enrichment terms

At minimum, future search work should preserve the current behavior around:

- lowercasing
- trimming
- variation-selector tolerance where relevant
- separator-style term matching such as `_` versus `-` versus spaces

### Name-like versus discovery-like semantics

If search policy is ever widened, shortcode-style aliases and other
canonical-name-like terms should continue to behave more like strong
name-oriented matches than weak discovery tags.

That principle matters for both native enrichment terms and supplemental
aliases. If this is revisited later, it should remain a semantic ranking
question, not an excuse to collapse everything into one undifferentiated term
bucket.

## Why This Is A Separate Task

The current additive search seam is useful and small:

- consumers can enrich native emoji matching
- consumers can mix native and supplemental results
- consumers can tune supplemental ranking without changing native behavior

Expanding search further would materially widen the public contract. That work
should happen intentionally, not as incidental follow-up to the current search
support.

## Candidate Directions

### Native weighting controls

Possible question:

- should consumers be able to tune how native labels, tags, and enriched terms
  rank relative to one another?

Potential benefit:

- closer alignment with app-specific expectations when shortcode-like names are
  treated as the primary emoji vocabulary

Potential cost:

- turns native search from a data seam into a policy seam
- increases the amount of ranking behavior the package must document and keep
  stable

### Richer native metadata input

Possible question:

- should Frimousse accept a richer native search input than
  `Record<string, string[]>`?

Potential examples:

- distinct buckets for aliases versus terms
- package-owned helper inputs for metadata records
- optional stronger semantics for canonical names

Potential cost:

- risks duplicating companion-package concerns in the picker
- may blur the current separation between picker behavior and metadata policy

### Cross-source ranking policy

Possible question:

- should native and supplemental matches become jointly configurable rather than
  only supplemental weighting being configurable?

Potential examples:

- explicit ranking buckets across native labels, native enriched terms,
  supplemental aliases, and supplemental tags
- tie-break controls for native vs supplemental result ordering

Potential cost:

- highest contract complexity of the available options
- easiest place to accidentally encode downstream product assumptions

## Current Recommendation

Do not expand the runtime search API yet.

Prefer a short stabilization phase first:

- harden tests around native enrichment plus supplemental search combinations
- verify the docs describe the current boundary clearly
- let the additive search contract settle before deciding whether native search
  should become more policy-aware

## Revisit Trigger

Revisit this task if one of these becomes clearly important:

- repeated consumer demand for native search ranking control
- need for a first-class shortcode or canonical-name display model in core
- repeated awkwardness in companion packages caused by the current plain
  `terms` map shape
