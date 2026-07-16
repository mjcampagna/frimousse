# Backlight ProseMirror Reference

**Status:** Informational reference  
**Last updated:** July 16, 2026  
**Purpose:** Capture useful lessons from the earlier Backlight ProseMirror editor so `@slithy/prosemirror` can revisit them as needed without treating that codebase as a template.

## What This Reference Is

This is a touchstone document, not a migration plan.

The Backlight editor is relevant because it reflects real prior ProseMirror work and real taste decisions, not because the new package should copy it directly. It is especially useful as evidence of which abstractions felt worth creating at the time and which seams naturally emerged in practice.

## Repository Snapshot

Primary reference package:

- `../packages/backlight-prosemirror-editor`

Key files reviewed:

- `package.json`
- `README.md`
- `src/index.js`
- `src/markdownSystem.js`
- `src/markdownToolbarPlugin.js`
- `src/markdownSystem.test.js`
- `EXTENSIONS.md`

## High-Level Shape

The Backlight package is:

- a ProseMirror-based markdown/WYSIWYG editor
- packaged as a browser-focused bundle
- built around direct DOM initialization on `textarea` elements
- centered on Markdown as the editable and persisted representation
- extended through a lightweight custom extension system

This is notably different from the current `@slithy/prosemirror` direction, which is explicitly React-first and package-oriented rather than DOM-bootstrap-oriented.

## Important Architectural Patterns

### 1. Markdown-Centric System Construction

`src/markdownSystem.js` builds a coherent unit out of:

- schema construction
- `markdown-it` configuration
- Markdown token parsing
- Markdown serialization
- extension-provided keymaps

That is a strong pattern. It treats schema and serialization as one system instead of as loosely related concerns.

**Why this still matters:**

- it keeps schema changes close to parse/serialize changes
- it gives extensions one place to participate
- it suggests that package primitives should be organized around editor systems, not just around isolated helpers

### 2. Extension Objects As A Composition Format

Backlight uses plain extension objects with optional fields for:

- `nodes`
- `marks`
- markdown parser configuration
- markdown token handlers
- serializer hooks
- keymaps
- toolbar items

This is one of the clearest reusable ideas in the prior code. It gives a low-ceremony way to compose editor behavior without inventing a class hierarchy.

**Potential takeaway for this package:**

- keep extension composition data-oriented
- prefer plain objects and functions over inheritance-heavy APIs
- allow multiple editor subsystems to be extended through one package-level shape

### 3. Markdown As Canonical State At The Boundary

In `src/index.js`, ProseMirror state is parsed from Markdown and serialized back into a mirror `textarea`. The editor stays synced to that external Markdown representation over time.

Even if the new package does not use hidden textareas, the underlying idea remains useful:

- ProseMirror document state can be the live editing model
- Markdown can remain the external interchange format
- synchronization should be explicit and controlled

### 4. Behavior Composition Around Real Problems

The Backlight code includes targeted behavior modules such as:

- text-processing plugins
- toolbar/keymap composition
- HTML literal styling
- pattern-based text processing and styling

That is a healthy signal. The abstractions grew around concrete editing problems, not around theoretical completeness.

## What Seems Worth Carrying Forward

These ideas look durable enough to inform `@slithy/prosemirror`:

- a small, composable system-builder for schema plus parser plus serializer
- plain-object extensions instead of framework-heavy extension classes
- Markdown treated as a first-class concern rather than an afterthought
- additive composition of keymaps and other plugins
- tight tests around parse/serialize behavior
- building abstractions around actual editing annoyances rather than around generic editor ambition

## What Probably Does Not Transfer Directly

Several aspects of the Backlight package seem specific to that project or at odds with the current vision.

### 1. DOM-First Initialization

Backlight initializes via selector-based enhancement of textareas and manages view switching through direct DOM manipulation.

That approach made sense there, but it is probably not the right center for this package because:

- this package is aiming to be React-first
- lifecycle should likely be modeled through React components and hooks
- direct DOM ownership is exactly where React integration gets tricky

### 2. Toolbar/UI Coupled Into The Same Extension Shape

In Backlight, extensions can contribute toolbar items directly.

That may still be useful someday, but for this package it is probably worth separating:

- document/model concerns
- command concerns
- view concerns
- host-app UI concerns

Otherwise the extension shape may become too opinionated too early.

### 3. Project-Specific Text Processing Rules

The serializer enhancement pipeline in `src/index.js` includes very specific processing steps like double-tilde unescaping and other markdown cleanup behavior.

The important lesson is not the exact rules. The lesson is that a serializer pipeline is useful. The new package should probably keep that as an extension point rather than inheriting those exact transformations.

### 4. Non-React Node/View Model

Backlight does not appear to be solving the React/ProseMirror boundary problem that motivates this package. That means it is useful as general ProseMirror prior art, but not as a direct answer to the harness question we care about most now.

## Tensions Worth Remembering

The Backlight code highlights a few design tensions that are still relevant:

- schema and serialization are easier to reason about when treated as one system
- UI and editor-core concerns become tangled quickly if the package does not draw a boundary early
- text processing is often necessary, but can become ad hoc if it lacks a clear pipeline model
- even small editor abstractions accumulate quickly, so package surface area should stay intentional

## Early Implications For `@slithy/prosemirror`

Based on this reference, a good early direction for the new package likely includes:

- a core editor-system builder that can assemble schema, parser, serializer, plugins, and commands
- a lightweight extension format based on plain objects and functions
- explicit serializer/parser extension points
- React-native lifecycle primitives kept separate from schema/serialization concerns
- careful separation between reusable editor infrastructure and optional host-app UI affordances

## Suggested Revisit Questions

If we touch this reference later, these are probably the right questions to ask:

- which Backlight abstractions still feel elegant after building more editors?
- which parts were convenient locally but would be wrong as package defaults?
- should the new package have one extension shape for everything, or separate shapes for core/editor/UI concerns?
- how much Markdown behavior belongs in the core package versus optional adapters?
- did Backlight solve any ProseMirror pain points that we are in danger of rediscovering the hard way?

## Bottom Line

Backlight looks most valuable as proof of a few good instincts:

- keep abstractions small
- compose around real editor needs
- let schema and Markdown behavior live close together
- prefer explicit extension seams over giant framework layers

It does **not** look like something to directly port into `@slithy/prosemirror`, especially because the new package is centered on React integration and a cleaner reusable harness boundary.
