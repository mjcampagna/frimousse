# ProseMirror Editor — Exploration & Planning

**Status:** Exploratory — not a committed roadmap  
**Last updated:** July 2026  
**Purpose:** Capture the case for building on raw ProseMirror, preserve useful editor research from an earlier product-specific exploration, and define an implementation path for a more general editor foundation if the experiment proves viable.

---

# Part I: Background & Goals

## Philosophy

A great editor is not "just a rich text editor."

It is:

- a structured application surface
- deeply integrated with product entities
- collaborative by default
- optimized for speed
- designed for keyboard-heavy workflows
- resilient under large-document load

> The editor is part of the product model, not a standalone widget.

## TipTap vs. Raw ProseMirror

TipTap is a reasonable choice for an MVP. It wraps ProseMirror in a friendlier API, ships with a rich extension ecosystem, and gets you to a working editor faster. If the goal were to ship something quickly and iterate, it would be a legitimate starting point.

This project chooses raw ProseMirror instead, for reasons that matter to a long-lived, deeply customized editor package:

- **The code you write is the code that runs.** TipTap adds its own extension API, conventions, and lifecycle on top of ProseMirror. Debugging means reasoning through two layers. Understanding a behavior means understanding both what TipTap does and what ProseMirror does underneath it.
- **TipTap is a ceiling as well as a floor.** The abstraction helps early and constrains later. Deep schema customization, non-standard node views, and fine-grained transaction control all require working around TipTap rather than with it.
- **A serious product editor is not generic.** The mention system, enter key modes, paste pipeline, and mode-specific behavior described in this document are all the kinds of concerns that quickly become product-specific. TipTap's extension ecosystem offers less leverage once those requirements dominate.
- **Human-maintainability.** A ProseMirror plugin that does one thing is easier to read, test, and hand off than a TipTap extension that inherits from a base class and hooks into an abstraction layer most engineers won't know well.
- **Long-term investment.** ProseMirror knowledge compounds. Engineers who learn it deeply can reason about any ProseMirror-based editor. TipTap knowledge is TipTap-specific.

The tradeoff is real: raw ProseMirror is harder to start with. That cost is accepted here in exchange for an editor codebase that the team can own, understand, and extend without friction for years.

## Lessons from Linear

The differentiator is not ProseMirror itself. It is:

- architecture
- schema design
- performance discipline
- collaboration correctness
- UX polish
- deep product integration

The stack alone will not make the editor feel "Linear-quality." The engineering discipline will.

## Architecture Principles

**Human-readable, human-maintainable, human-extendable.** The editor codebase should be legible to any engineer on the team without requiring deep framework knowledge. Plugins should do one thing, be named for what they do, and be independently modifiable without understanding the whole system. This is a first-class constraint — not a nice-to-have — and it is one of the primary reasons to choose raw ProseMirror over an abstraction layer: the code you write is the code that runs.

**Treat product objects as first-class schema nodes.** Build the schema around the entities that matter to users: users, threads, groups, actions, attachments, dates. Mentions are not decorations — they are typed nodes with identity.

**Markdown-first UX.** Users should be able to express structure through natural typing: `# ` for headings, `- ` for lists, `@` for mentions, `/` for actions. The editor should feel faster than a mouse.

**Don't foreclose collaboration.** Real-time collaboration is not a current requirement, but the architecture should not make it painful to add later. This doesn't mean building the infrastructure now — it means avoiding two specific early decisions that are hard to undo: coupling anything to raw character offsets (use ProseMirror position mappings instead), and entangling the history/undo plugin so it can't be swapped out (Yjs requires its own undo manager, incompatible with `prosemirror-history`). Get these two things right and collaboration remains an additive layer, not a rewrite.

## Core vs. Adapter Boundary

One of the most important package-design decisions is where to draw the line between reusable editor primitives and host-application concerns.

**Core package responsibilities:**

- schema building blocks for common rich-text structures
- plugin primitives for input rules, keymaps, paste handling, and decorations
- editor state orchestration and command helpers
- serialization interfaces and default Markdown behavior
- extension points for typed entities, suggesters, attachments, and mode policies
- testable, framework-aware React integration patterns

**Host-app adapter responsibilities:**

- product entity definitions such as users, threads, actions, and AI identities
- suggestion data sources, ranking, filtering, and rendering details
- upload backends, preview fetching, and product-specific side effects
- bespoke markdown link schemes, clipboard metadata, and persistence conventions
- surface-specific modes such as chat reply, comments, or compose flows
- native-platform integrations, analytics, and rollout strategy

The package should prefer generic primitives plus explicit adapter hooks over shipping product assumptions as defaults.

---

# Part II: Reference Feature Inventory

This section preserves the feature inventory from the earlier Remirror-based editor exploration. It should now be treated as a reference implementation and requirements source, not as a migration contract for a specific product.

## Schema

**Block nodes:**

```txt
paragraph
heading (levels 1–4)
codeBlock (with language attr)
blockquote
bulletList / orderedList / listItem
table / tableRow / tableCell / tableHeader
horizontalRule
hardBreak
```

**Inline nodes:**

```txt
mentionAtom (id, label — serializes as [name](glue:id))
customEmoji (renders as <img>, inline atom)
```

**Marks:**

```txt
bold
italic
code
link
strike
```

## Input Rules

Typed in-editor markdown shortcuts:

- `# ` / `## ` / `### ` / `#### ` → headings
- `- ` / `* ` → bullet list
- `1. ` → ordered list
- `> ` → blockquote
- ` ``` ` → code block
- `---` / `***` → horizontal rule

Typography auto-replacements:

- `--` → `—`, `->` → `→`, arrows, copyright symbols, fractions
- Emoticons: `:)` → 🙂, `:(` → 🙁, `;)` → 😉, etc.

## Keyboard Shortcuts & Enter Key Modes

Standard formatting:

- Cmd+B → bold
- Cmd+I → italic
- Cmd+\` → inline code
- Cmd+Z / Cmd+Y → undo/redo
- Shift+Enter → hard break (in lists/blockquotes)
- Alt+Shift+Enter → exit code block

**Two enter key modes (load-bearing UX):**

| Mode           | Enter    | Ctrl+Enter |
| -------------- | -------- | ---------- |
| `send-message` | Send     | New line   |
| `new-line`     | New line | Send       |

## Mentions

Three suggesters, each a separate ProseMirror plugin:

| Trigger | Scope                              | Notes                           |
| ------- | ---------------------------------- | ------------------------------- |
| `@`     | Users, groups, workspaces, threads | 3-word name limit               |
| `[`     | Threads only                       | Strikethrough if closed         |
| `/`     | App actions                        | Line-start only; grouped by app |

- Custom React node view per mention type (name, AI badge, thread icon, action marker)
- Mentions blocked inside code marks and code blocks
- Deletion tracking: fires `onMentionsRemoved` callback to parent
- Paste extraction: parses `data-mention-atom-id` from pasted HTML

## Paste Handling

Four handlers that must compose without conflicting:

1. **Markdown paste**: detects markdown syntax in plain text → converts via `markdownToHtml`
2. **Table paste**: strips all styling from HTML tables, promotes first row to `<th>`
3. **Image paste**: suppresses URL text when image files are present
4. **Auto code block**: heuristic detection (shebangs, indentation, keywords, VS Code metadata) → wraps in code block, calls GraphQL API for language detection

## Emoji

- Standard emoji via `:` prefix typeahead (emojibase-data)
- Custom workspace emoji: separate inline atom node, renders as `<img>`
- Emoticon conversion via typography input rules
- Picker UI with skin tone selector and custom emoji section

## Link Handling

- Autolink on paste/type (linkify-it), skips code context, adds `https://` if missing
- Link creation modal: URL + display text
- Link preview cards: fetches title/description/image for pasted URLs, dismissible

## Attachments & File Upload

- Drag-and-drop via dropzone
- Max 5 files, 100MB each
- Upload state machine: `uploading` → `done` / `failed`
- Voice recording (native mobile only)
- `getMessage()` returns finished attachments only

## Serialization

Primary format is Markdown:

- Mentions serialize as product-defined typed links such as `[name](glue:id)`
- Custom emoji serialize as links
- `htmlToMarkdown` (Turndown-based) with custom rules for mentions, emoji, blockquotes, tables
- `markdownToHtml` (marked.js-based) with mention/emoji link parsing

These utilities are Remirror-independent in principle, but any product-specific syntax should be treated as an adapter boundary rather than as a package default.

## Mobile / Native

- Capacitor/iOS/Android platform detection
- Floating send + voice recorder button, hidden/shown with keyboard state
- `useNativeKeyboardStore` tracks keyboard height and open/close state
- Accessory bar visibility gating

## Host App Integration Points

- **ImperativeHandle**: `getMessage()`, `getStreamMessage()`, `focus()`, `blur()`
- **Editor modes**: `reply`, `thread`, `ai`, `edit`, `compose` — affect Enter behavior and button visibility
- **Quoted message** support
- **Read-only state**: when a modal opens, all other editor instances go read-only
- **`onMention`** / **`onMentionsRemoved`** callbacks
- **Thread actions** passed as prop, inserted as `/`-mention atoms

## Editor Contexts

The reference editor appeared in five distinct modes, each with different feature sets, layouts, and behaviors. This is useful evidence that the package should support mode-driven composition rather than assuming a single editor surface.

| Mode      | Surface                                | Send icon | Enter default       |
| --------- | -------------------------------------- | --------- | ------------------- |
| `reply`   | Thread reply (tab)                     | Arrow up  | User setting        |
| `thread`  | New thread from reply (tab)            | Arrow up  | User setting        |
| `ai`      | AI chat session (tab)                  | Sparkle   | User setting        |
| `edit`    | Inline message edit (not a tab)        | Checkmark | New line            |
| `compose` | New conversation composer (standalone) | Arrow up  | New line (in modal) |

**Feature matrix:**

| Feature           | reply | thread | ai              | edit | compose |
| ----------------- | ----- | ------ | --------------- | ---- | ------- |
| Quoted message    | yes   | yes    | no              | no   | no      |
| Mentions          | yes   | yes    | yes             | yes  | yes     |
| Attachments       | yes   | yes    | yes             | yes  | yes     |
| Formatting (full) | yes   | yes    | code block only | yes  | yes     |
| Voice notes       | yes   | yes    | no              | yes  | yes     |
| Slash commands    | yes   | yes    | no              | yes  | no      |
| Custom emoji      | yes   | yes    | no              | yes  | yes     |
| AI placeholder UI | no    | no     | yes             | no   | no      |

**Mode-specific notes:**

- **`reply`**: Default mode. Full feature set. Voice recorder floats on native mobile when keyboard is closed.
- **`thread`**: Requires a subject field (rendered separately as ThreadReplyHeader). Has its own draft slot (`threadDraft`). Privacy selector in button bar.
- **`ai`**: Visually distinct (gradient border, sparkle send button). Formatting restricted to code block only. Auto-activates when an agent is @-mentioned; auto-deactivates when that mention is removed. Higher text threshold (4 chars vs 2) before enabling send. Model selector in button bar. Excludes a product-owned AI identity from mention suggestions.
- **`edit`**: Compact, inline layout. Escape cancels. Initializes from the existing stream message. Hides the main reply editor while active. No quoted message support.
- **`compose`**: Standalone surface, not a tab. Grows to fill its container. No slash commands (no thread actions in this context). Auto-focus delayed 350ms on iOS.

## What Is Likely Reusable

These are not Remirror-specific conceptually and can likely be carried forward with light adaptation:

- `htmlToMarkdown` / `markdownToHtml` utilities
- `extractMentions()` markdown parser
- Suggester UI components (MentionsSuggester, ActionsSuggester, EmojiTypeahead) — need new plugin bindings only
- Link preview fetching logic
- Attachment upload state machine
- Native keyboard/platform detection utilities
- Zustand stores for editor content state

## Candidate Package Split

The reference feature set points toward a clean separation between reusable package layers and opt-in host integrations.

**Likely core-package candidates:**

- base schema nodes and marks
- Markdown-first input rules
- keyboard shortcut helpers
- paste pipeline composition utilities
- typed entity node primitives
- serializer and parser extension hooks
- decoration and plugin composition infrastructure
- mode policy abstractions for behaviors like Enter handling

**Likely adapter-layer candidates:**

- concrete mention sources and suggestion UIs
- app action slash commands
- upload orchestration and voice recording
- link preview fetching
- product-owned markdown schemes such as `glue:id`
- mobile shell behavior tied to a specific runtime or app chrome
- host-defined imperative handles and callbacks

**Likely out of scope for the core package at first:**

- rollout flags
- analytics
- server-backed collaboration plumbing
- app-specific read-only rendering pipelines

## Open Questions

Items requiring further investigation before architectural decisions can be finalized.

- [ ] **Read-only rendering pipeline** — If host applications display content through a separate rendering pipeline, what does it support, how does it differ from the editor schema, and should the package try to unify those paths or leave rendering to host-specific adapters?

- [ ] **Copy behavior** — What format should the editor write to the clipboard on copy? HTML with typed entity attributes? Markdown? Plain text? This affects cross-app paste compatibility and the paste extraction logic needed by host applications.

- [ ] **Product-specific markdown extensions** — The earlier exploration referenced custom header and entity-link syntax. Which of those belong in the core package, which belong in optional adapters, and which should be excluded from the default serialization layer entirely?

## Reframing Notes

This document started life inside a specific product effort. That original context is no longer binding, but the research is still useful. Going forward:

- Treat the old feature inventory as evidence, not mandate.
- Treat product-specific entities and syntax as adapter concerns unless they prove broadly reusable.
- Prefer package primitives that can support messaging, notes, docs, comments, and AI-assisted surfaces without hard-coding any one of them.

- [ ] **Existing test coverage** — What tests currently exist for the Remirror editor? What is covered, what isn't, and where are the gaps? This audit defines the parity floor that the new editor must clear before cutover.

- [ ] **Accessibility** — What is the current editor's accessibility story? ARIA attributes, screen reader support, focus management, keyboard-only navigation. What is the baseline, and what should the rebuild target?

---

# Part III: Target Architecture

## Stack

**Base editor:**

- `prosemirror-state`
- `prosemirror-view`
- `prosemirror-model`
- `prosemirror-transform`
- `prosemirror-history`
- `prosemirror-keymap`

**React integration:** `@handlewithcare/react-prosemirror` (see React Integration below)

**Serialization:** `prosemirror-markdown` + `markdown-it` with GFM plugins and adapter-defined custom token handlers

**Collaboration (future):** Yjs + `y-prosemirror` — not in scope now; see Collaboration below

**Persistence:** Markdown as the default canonical interchange format; host apps can choose their own storage backend

## Schema Design

The schema should support rich-text fundamentals plus typed entities without assuming any single product model. Mentions and similar objects should be able to exist as typed nodes, not just decorated text, but the concrete entity set should be adapter-defined.

**Block nodes:**

```txt
doc
paragraph
heading
blockquote
bullet_list / ordered_list / list_item
table / table_row / table_cell / table_header
code_block
horizontal_rule
hard_break
```

**Inline nodes:**

```txt
text
mention_atom (id, label, kind?)
custom_emoji (id, title, src)
```

**Marks:**

```txt
bold
italic
code
link
strike
```

## React Integration

### The Problem

React and ProseMirror have fundamentally incompatible update models. React separates updates into a render phase and a commit phase; ProseMirror renders and commits in a single pass. Naively bridging them — wrapping `EditorView` in effects, using React Portals for node views — produces **state tearing**: moments where React's state and ProseMirror's internal state diverge, causing subtle, hard-to-reproduce bugs.

### The Solution: @handlewithcare/react-prosemirror

Rather than wrapping ProseMirror in React, this library inverts the relationship: **React renders the ProseMirror document**. ProseMirror's state model and view descriptors are preserved, but its DOM update algorithm is replaced with React's reconciler. This eliminates state tearing by design.

Key features:

- Node views are plain React components — no special wrappers, no Portals
- `useEditorEffect` and `useEditorEventCallback` guarantee view access only after DOM reconciliation
- `useEditorEventListener` for contenteditable event handling
- `useNodePos`, `useStopEvent`, `useIgnoreMutation`, `useSelectNode`, `useIsNodeSelected` utilities

**Why not `@nytimes/react-prosemirror`?** That was the same author's earlier attempt at NYT. It still wrapped ProseMirror's view and used Portals for node views, which caused its own DOM change detection issues. `@handlewithcare/react-prosemirror` is the evolved successor that resolves those remaining edge cases by fully inverting rendering ownership.

Requirements:

- React 19.x
- React Reconciler 0.32.0
- Specific `prosemirror-view` version pinning per release

## Serialization Layer

### Canonical Format

Markdown is the best default canonical format for this package because it is portable, inspectable, and easier to integrate across products than editor-specific JSON alone.

Host applications may extend that Markdown with product-specific conventions such as:

- Mentions as typed links like `[name](glue:id)`
- Custom emoji as links
- Standard GFM for tables, strikethrough, code blocks, etc.

**Markdown stays canonical by default.** The ProseMirror document is parsed from Markdown on load and serialized back to Markdown on save. This keeps the package portable and makes host-specific persistence choices an adapter concern rather than a core-package constraint.

Hosts can still persist ProseMirror JSON or other derived formats if they want, but the package should not require that choice.

### Delta: prosemirror-markdown defaults vs. package requirements

ProseMirror's native format is JSON (`doc.toJSON()`). Markdown support is opt-in via `prosemirror-markdown`, which wraps `markdown-it` and covers CommonMark only.

| Feature                                                                         | Default `prosemirror-markdown` | Package requirement                                 |
| ------------------------------------------------------------------------------- | ------------------------------ | --------------------------------------------------- |
| CommonMark (paragraphs, headings, bold, italic, code, blockquote, lists, links) | ✅                             | ✅                                                  |
| Tables                                                                          | ❌                             | optional GFM support via `markdown-it` plugin       |
| Strikethrough (`~~text~~`)                                                      | ❌                             | optional GFM support via `markdown-it` plugin       |
| Task lists                                                                      | ❌                             | optional, adapter or package-extension decision     |
| Typed entity links → `mentionAtom`-style nodes                                  | ❌                             | extension hook + custom token handler               |
| Custom emoji links → `customEmoji` node                                         | ❌                             | extension hook + custom token handler               |
| Hard break round-trip fidelity                                                  | partial                        | ✅ — needs verification                             |

The GFM gaps are closed with `markdown-it` plugins. Typed-link entities and emoji require custom parser token handlers and serializer rules, which should be exposed as package extension points rather than baked-in product behavior.

## Performance Architecture

**Transaction hygiene:**

- Isolate node views to prevent full document rerenders
- Memoize aggressively
- Minimize DOM reads
- Avoid unnecessary decorations and React reconciliation explosions

**Decoration strategy:**

- Keep decoration counts low (comments, mentions, highlights, cursors)
- Avoid global recalculation on every transaction

**Tables** are their own performance problem — rendering, selection logic, and rerender isolation all need dedicated attention.

**Benchmarks to establish:**

- Typing latency
- Paste latency
- Cursor stability
- Undo latency

## Plugin System

Recommended plugin categories:

- input rules
- keyboard shortcuts
- mentions (three separate suggesters)
- paste handlers (four handlers, composed)
- decorations
- collaboration (future)
- analytics
- persistence

## Testing Strategy

### Package Requirement

The package should establish its own correctness contract around schema behavior, command behavior, serialization, and plugin composition. If it is adopted inside an existing product, that host application should also maintain migration or parity coverage at the adapter level.

The first step is deciding which guarantees belong to the package itself and which belong to downstream integrations.

### Bolstering Beyond Parity

The rebuild is an opportunity to establish coverage that the Remirror editor likely lacks. Every new plugin and node view should be tested as it is written, not after.

**Serialization tests:**

- Round-trip corpus: parse → serialize → parse must produce identical documents for all corpus messages
- Covers all node types, all mark combinations, mention variants, custom emoji, tables, nested lists, hard breaks
- Runs as part of CI — a failing round-trip is a blocking failure

**Unit tests (per plugin):**

- Each plugin tested in isolation without mounting a full editor
- Input rules: type X at position Y → document state Z
- Keyboard shortcuts: dispatch keydown event → correct transaction applied
- Paste handlers: clipboard content X → document state Y
- Mention suggesters: trigger character → correct suggestions shown; select → correct node inserted
- Serializer/parser: each node type and mark round-trips correctly

**Integration tests:**

- Full editor mounted, real user interactions simulated
- Compose content with typed entities, formatting, and attachments → host adapter receives correct output
- Representative editor modes behave correctly end-to-end
- Enter key modes and similar behavior policies produce correct behavior
- Paste flows: markdown, table, image, auto code block
- Mention deletion tracking fires correctly

**Performance benchmarks:**

- Typing latency (established baseline from Remirror editor, must meet or beat)
- Paste latency
- Undo latency
- Cursor stability under load
- Run on every PR touching the editor — a regression in latency is a failing test

**Cross-platform tests:**

- Safari: input handling, selection behavior
- iOS and Android: keyboard state, accessory bar, floating button
- IME: composition events, CJK input
- These are manual at first; automate where feasible over time

### Regression Prevention

Tests must run in CI on every PR that touches the package. A broken serialization round-trip, a failing behavior contract, or a performance regression blocks merge.

## Rebuild Risks

1. **Typed entity system** — multiple matchers, custom node views, deletion tracking, and paste extraction quickly become the most adapter-sensitive logic
2. **Enter key mode switching** — subtle but load-bearing; affects every send interaction
3. **Paste pipeline** — four handlers that must compose without conflicting
4. **React node views** — requires `@handlewithcare/react-prosemirror`; architecture must be correct from the start
5. **Markdown round-trip** — typed entity syntax must survive serialize → parse → serialize intact

## Collaboration (Future)

Real-time collaboration is not in scope for the current build. However, two architectural decisions made now will determine whether it can be added cleanly later or requires a rewrite:

1. **History plugin isolation** — `prosemirror-history` is incompatible with Yjs; Yjs requires its own undo manager. Keep the history plugin behind a single, swappable boundary so it can be replaced without cascading changes.

2. **Position anchoring** — anything that stores a location in the document (future inline comments, bookmarks, etc.) must use ProseMirror position mappings, never raw character offsets. Character offsets become invalid the moment another user edits the document. This costs nothing to get right now and is very difficult to fix retroactively.

Get these two things right and adding Yjs + `y-prosemirror` later becomes an additive layer: real-time sync on top of the existing architecture, with Markdown snapshots continuing as the canonical persistence format.

When collaboration is eventually added, it will also require:

- WebSocket sync server
- Reconnect handling and stale cursor cleanup
- Shared cursors and collaborative undo/redo
- Eventual consistency guarantees

---

# Part IV: Implementation Plan

## Strategy

Build the package as an additive parallel effort with a small core surface first. Host applications that adopt it should integrate behind an adapter boundary rather than replacing existing editors in place.

Recommended adoption sequence for a host app:

1. Build core package primitives in isolation.
2. Add a host-app adapter layer for schema extensions, suggestion sources, serialization rules, and UI bindings.
3. Integrate behind a feature flag if the host already has an editor in production.
4. Validate behavior, output, accessibility, and performance before any cutover.

Key package constraints:

- Prefer additive exports over premature abstraction.
- Keep the core package independent from any single product model.
- Make host-specific behavior explicit through adapters, options, and extension hooks.

## Proof of Concept

Before committing to the full build, validate the two highest-risk architectural decisions in isolation.

**Scope:**

- `@handlewithcare/react-prosemirror` integrated and rendering correctly in the Glue React environment
- Schema defined with all required node types
- `prosemirror-markdown` configured with GFM plugins and `glue:` mention token handlers
- Round-trip validation harness passing against a corpus of real Glue message content

**Success criteria:** parse → serialize → parse produces identical documents for all corpus messages, and the editor renders without state tearing.

If this fails or reveals a blocking constraint, the full build does not proceed.

## Phase 0: Prerequisites

Resolve the open questions that would force architectural rework mid-build.

- [ ] Answer all open questions (see Part II)
- [ ] Assemble serialization corpus: representative real message content covering all node types, mention variants, custom emoji, tables, and known edge cases
- [ ] Round-trip validation harness in place and green

Do not proceed past Phase 0 until the serialization harness passes.

## Phase 1: Foundation

Stand up the bare architectural skeleton with no product features.

Deliverables:

- `@handlewithcare/react-prosemirror` integrated, React rendering confirmed
- Schema defined: all block nodes, inline nodes, marks
- `prosemirror-markdown` with GFM plugins and Glue token handlers
- Serialization corpus tests passing
- Editor renders, accepts input, serializes to correct Markdown

Exit criteria: plain text and formatted input produces byte-identical Markdown output vs. the Remirror editor.

## Phase 2: Core Product Features

Build the features that make this a Glue editor, not a generic one.

Deliverables:

- Mention system: all three suggesters (`@`, `[`, `/`), custom node views, deletion tracking, paste extraction
- Enter key modes: both `send-message` and `new-line` behave correctly
- Input rules: all markdown shortcuts
- Keyboard shortcuts: bold, italic, code, undo/redo, hard break, exit code block
- `getMessage()` returns correct Markdown with serialized mentions

Exit criteria: a message with mentions composed in the new editor produces output indistinguishable from the Remirror editor.

## Phase 3: Feature Parity

Complete the remaining feature surface.

Deliverables:

- Paste pipeline: all four handlers (markdown, table, image, auto code block)
- Emoji: standard typeahead, custom workspace emoji, emoticon conversion, picker UI
- Link handling: autolink, link modal, link preview cards
- Attachments: dropzone, upload state machine, voice recording (native)
- Mobile / native: keyboard state, accessory bar, floating send button
- Typography auto-replacements
- Formatting toolbar
- Code block language selector
- Quoted message support
- All five editor modes: `reply`, `thread`, `ai`, `edit`, `compose`
- Read-only state coordination between editor instances

Exit criteria: internal team dogfoods the new editor on a non-critical surface with no regressions.

## Phase 4: Validation & Cutover

Confirm parity, then migrate users.

Validation:

- Side-by-side output comparison against shared test suite
- Performance benchmarks: typing latency, paste latency, undo latency — must meet or beat current baseline
- Mobile testing: iOS and Android, web and native
- Safari / IME testing

Cutover:

1. Enable for internal users via feature flag
2. Resolve any regressions
3. Gradual rollout: 10% → 50% → 100% of external users
4. Monitor error rates and feedback at each step
5. Keep Remirror until rollout is 100% and stable for two weeks

Rollback: flip the flag. No data migration means no data risk.

## Phase 5: Cleanup

- Remove Remirror and all extensions
- Remove the feature flag
- Remove transition shims and compatibility code
- Update documentation
