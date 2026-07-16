# Editor Reference Notes

**Status:** Informational reference  
**Last updated:** July 16, 2026  
**Purpose:** Keep a lightweight record of editor touchpoints and framing references that are useful when shaping `@slithy/prosemirror`.

## Why This Exists

This package will likely be shaped by a mix of direct implementation work and accumulated editor taste. It helps to keep a small list of touchpoints around so design decisions can be revisited against shared reference points rather than only against whatever feels intuitive in the moment.

This is not meant to be exhaustive. It is a living orientation note.

## Current Touchpoints

### Backlight

Backlight is useful as internal prior art for:

- how editor concerns were previously decomposed
- how Markdown and schema concerns were grouped
- what kinds of abstractions felt worth creating in real ProseMirror work

Backlight is **not** a React project, so it is not a direct model for the React harness problem. It is more useful as general ProseMirror architecture prior art than as a template for this package's integration model.

Related reference:

- [`backlight_prosemirror_reference.md`](./backlight_prosemirror_reference.md)

### Slack

Slack is a valuable reference for interaction feel, especially for lighter-weight composition surfaces.

Useful qualities to remember:

- fast and keyboard-friendly
- text-first rather than toolbar-first
- structured without feeling heavy
- strong support for inline entities such as mentions, emoji, links, and attachments
- optimized for composition flow rather than document-authoring ceremony

Slack is especially relevant as a reminder that a powerful editor does not need to feel like a document suite.

### AI-Native Editors

AI applications such as Codex and Claude Code are useful present-day touchpoints because they combine characteristics of chat, command composition, structured text entry, and tool-oriented workflows.

Useful qualities to remember:

- prompt composition and editing are first-class actions
- text often mixes natural language, code, structured snippets, and references
- users frequently revise in place rather than only sending once
- keyboard flow matters a lot
- lightweight structure is valuable even when the surface should still feel fast
- the editor often sits close to execution, tooling, or agent behavior

These tools are good reminders that modern editor surfaces are not cleanly split into only "chat composer" versus "document editor." There is now an important middle space where users are composing instructions, context, code, and iterative refinements.

Useful concrete signals from the current Codex/ChatGPT desktop app context and related public discussion:

- desktop-app shell and integrated terminal behavior
- code-aware editing and display
- markdown-heavy rendering
- support for files, artifacts, and structured outputs
- signs of synchronized or shared document-state infrastructure

Even without treating any one implementation detail as normative, this category is a strong reminder that a modern editor may need to support:

- mixed prose and code authoring
- iterative prompt refinement
- references to files, tools, threads, or artifacts
- lightweight structure without full document-editor heaviness
- close coupling between editing and execution

### Linear-Style Editors

“Linear-quality” is still a useful shorthand for a certain level of polish, even if it is not a concrete implementation target.

What matters in that reference is not the stack itself, but:

- speed
- precision
- strong keyboard ergonomics
- careful schema and interaction design
- disciplined attention to edge cases

This is less a feature reference than a quality bar.

## Important Category Split

One of the most important framing points for this package is that not all editors optimize for the same thing.

### Chat and Comment Editors

These tend to prioritize:

- speed of composition
- low interaction overhead
- inline entities and lightweight structure
- sending behavior and Enter-key semantics
- compact UI
- frequent, shorter editing sessions

Useful references here include Slack and message-composer-style editors generally.

### AI Prompt and Tooling Editors

These tend to prioritize:

- iterative prompt editing
- blending prose, code, and structured references
- compact but capable text manipulation
- strong keyboard ergonomics
- easy revision of previously entered content
- close coupling between editing and downstream system behavior

Useful references here include Codex, Claude Code, and related AI-native tools.

### Document Editors

These tend to prioritize:

- durable structure
- long-form composition
- richer formatting depth
- navigation and layout
- longer editing sessions
- more visible editing controls

Useful references here include document suites and long-form note tools.

## Why The Split Matters

`@slithy/prosemirror` should ideally support both lighter-weight composition surfaces and richer structured editors, but it should not assume that document-editor priorities are the default for every consumer.

If the package grows too quickly around document-authoring expectations, it may become clumsy for messaging, comments, and AI/chat surfaces. If it grows only around composer needs, it may become too narrow for more structured editing.

The package should therefore aim for:

- a flexible core
- lightweight defaults
- opt-in structure and complexity
- explicit extension points rather than one hard-coded editor philosophy

## Practical Use

When evaluating a new abstraction or API shape, it is worth checking:

- does this feel more like a chat-surface need, a document-surface need, or both?
- are we introducing heaviness that would make a Slack-like composer worse?
- are we missing needs that show up in AI-native prompt and tooling surfaces?
- are we ignoring structure that a richer editor will eventually need?
- is this based on a real recurring need, or on borrowing a pattern from a tool with different priorities?

## Bottom Line

The current reference frame for this package is:

- **Backlight** for prior ProseMirror architecture instincts
- **Slack** for interaction feel and compositional restraint
- **Codex / Claude Code / AI-native editors** for prompt-oriented, tool-adjacent editing workflows
- **Linear-style editors** for polish, speed, and quality expectations
- **chat vs. AI-tooling vs. document composition** as an ongoing design lens

These references should help keep the package grounded while its actual shape emerges through use.
