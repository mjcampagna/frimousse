# Docs Information Architecture

This note defines how the website and written docs should present the fork and
its companion packages.

The goal is to keep the story clear for three different audiences at once:

- existing Frimousse consumers evaluating a drop-in swap
- new consumers who only need the picker itself
- consumers who want the broader ecosystem of additive emoji tooling

## Core Principle

The site should present one cohesive documentation experience without implying
that every package depends on every other package.

In particular:

- `@slithy/frimousse` should stand on its own
- companion packages should be documented as optional composition layers
- the website can document all of them together for convenience

This keeps package boundaries honest while still making the ecosystem easy to
understand.

## Recommended Top-Level Docs Split

### Base API

This section should cover the inherited Frimousse surface area that an existing
consumer would expect to find.

Purpose:

- provide a familiar landing place for current Frimousse users
- keep installation and baseline usage easy to find
- avoid making consumers dig through upstream docs first

Content should include:

- installation
- basic setup
- default styling expectations
- baseline component API
- baseline hooks and render customization

Tone:

- concise
- compatibility-oriented
- explicit when behavior matches upstream

This section is partly for convenience, but also for trust: if the fork claims
compatibility, the docs should let consumers verify that quickly.

### Extended API

This section should cover the additive fork behavior in `@slithy/frimousse`
itself.

Purpose:

- explain what the fork adds beyond upstream
- make additive seams feel intentional rather than incidental
- separate compatibility docs from extension docs cleanly

Content should include:

- supplemental items and sections
- unified search
- consumer-owned frequent/recent/favorite sections
- custom image-backed emoji helpers
- active-selection APIs for mixed item kinds
- compatibility notes where extended behavior intersects with inherited APIs

Tone:

- additive, not replacement-oriented
- explicit about what remains opt-in
- careful about contract boundaries

This section is the right home for the fork story.

### Companion Packages

This section should cover the optional ecosystem around the picker.

Purpose:

- document useful adjacent packages without bloating the picker contract
- show composition patterns
- make it clear which functionality lives outside the picker package

Current packages:

- `@slithy/emoji-transforms`
- `@slithy/emoji-compat`

Likely future examples:

- shortcode helpers
- emoji fallback/versioning utilities
- emoji rendering/scaling research outputs

Content should include:

- what problem the package solves
- why it is not built into `@slithy/frimousse`
- how to install it
- how to compose it with the picker
- any important ownership boundaries

## Package Boundary Guidance

### `@slithy/frimousse`

Should own:

- picker UI
- picker data shaping
- additive picker extension seams
- selection/search/render behavior that is intrinsic to the picker

Should not own:

- bundled shortcode datasets
- emoji metadata loading policy
- product-specific persistence wiring
- fallback image pipelines
- broad emoji utilities that are useful outside the picker

### Companion packages

Should own:

- metadata transformation
- dataset adapters
- optional search-enrichment sources
- broader emoji-adjacent concerns that are not picker-specific

This split matters because the website may present the ecosystem together even
when the runtime contracts remain separate.

## Website Navigation Recommendation

Recommended primary nav:

- `Demo`
- `Documentation`

Within `Documentation`, organize content into three visible groups:

1. Base API
2. Extended API
3. Companion Packages

This can be implemented as:

- one docs landing page with grouped sections first
- then multiple dedicated pages if/when the content grows

We do not need a large docs IA on day one. The important thing is to establish
the grouping now so future content lands in the right place.

## Home Page Role

The home page should not try to carry all documentation responsibilities.

It should do only a few things well:

- position the fork clearly
- show the picker in action
- establish compatibility plus additive value
- route visitors into the docs

The detailed contract explanations belong in the docs section.

## Documentation Voice

The docs should be candid about three categories of behavior:

- inherited behavior
- fork-added behavior
- optional ecosystem behavior

Avoid blurring those together.

Consumers should always be able to tell:

- what comes from upstream Frimousse
- what this fork adds directly
- what requires an additional package

## Suggested Near-Term Execution

### Current status

- the Astro docs page exists
- the three-group framing is in place conceptually
- the content is still intentionally light and should continue to evolve

### Next steps

- tighten baseline install and usage guidance
- sharpen the extended API sections so they match the current library contract
- keep the companion-package sections aligned with `emoji-transforms` and
  `emoji-compat` as those packages evolve

### Later

Split into dedicated pages only when the content volume justifies it.

## Recommendation

Treat the website as the ecosystem documentation surface, but keep the runtime
contracts layered:

- core picker docs first
- fork extensions second
- companion packages third

That gives us one coherent public story without turning `@slithy/frimousse`
into a kitchen-sink dependency hub.
